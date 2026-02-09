"""
Reports routes for generating and downloading progress reports
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from io import BytesIO
import zipfile
import os
from datetime import datetime

from routes.upload import get_uploaded_data
from services.report_generator import (
    get_student_complete_data,
    create_comprehensive_student_report,
    create_consolidated_all_students_report
)

router = APIRouter()

# Temporary storage for generated reports
generated_reports: Dict[str, bytes] = {}


class ReportConfig(BaseModel):
    """Configuration for report generation"""
    students: List[str] = []  # Empty means all students
    department_name: str = "Computer Science"
    report_date: str = ""
    academic_year: str = "2024-2025"
    semester: str = "B.E- IV Semester"
    attendance_start: str = ""
    attendance_end: str = ""
    template: str = "Detailed"
    include_backlog: bool = True
    include_notes: bool = True


@router.post("/generate")
async def generate_reports(config: ReportConfig):
    """Generate reports for selected students"""
    data = get_uploaded_data()
    
    if not data["subjects_data"]:
        raise HTTPException(status_code=400, detail="No subject data uploaded. Please upload subject files first.")
    
    # Determine which students to process
    students_to_process = config.students if config.students else data["all_students"]
    
    if not students_to_process:
        raise HTTPException(status_code=400, detail="No students to generate reports for.")
    
    # Convert DataFrames for report generator
    import pandas as pd
    subjects_data = {}
    for name, df in data["subjects_data"].items():
        if isinstance(df, pd.DataFrame):
            subjects_data[name] = df
        else:
            subjects_data[name] = pd.DataFrame(df)
    
    backlog_data = data.get("backlog_data")
    
    # Set report date if not provided
    report_date = config.report_date or datetime.now().strftime('%d.%m.%Y')
    
    # Generate individual reports
    individual_reports = {}
    for student_roll in students_to_process:
        try:
            student_complete_data = get_student_complete_data(
                student_roll, 
                subjects_data, 
                backlog_data
            )
            
            if not student_complete_data['subjects']:
                continue
            
            doc = create_comprehensive_student_report(
                student_complete_data,
                config.department_name,
                report_date,
                config.academic_year,
                config.semester,
                config.attendance_start,
                config.attendance_end,
                config.template,
                config.include_backlog,
                config.include_notes,
                backlog_data
            )
            
            # Save to buffer
            doc_buffer = BytesIO()
            doc.save(doc_buffer)
            doc_buffer.seek(0)
            
            student_name = student_complete_data['personal_info']['student_name']
            filename = f"{student_roll}_{student_name.replace(' ', '_')}_Report.docx"
            
            # Store in memory
            generated_reports[filename] = doc_buffer.getvalue()
            
            individual_reports[student_roll] = {
                "filename": filename,
                "student_name": student_name
            }
        except Exception as e:
            print(f"Error generating report for {student_roll}: {str(e)}")
            continue
    
    # Generate consolidated report
    consolidated_filename = None
    try:
        consolidated_doc = create_consolidated_all_students_report(
            students_to_process,
            subjects_data,
            config.department_name,
            report_date,
            config.academic_year,
            config.semester,
            config.attendance_start,
            config.attendance_end,
            config.template,
            config.include_backlog,
            config.include_notes,
            backlog_data
        )
        
        consolidated_buffer = BytesIO()
        consolidated_doc.save(consolidated_buffer)
        consolidated_buffer.seek(0)
        
        consolidated_filename = f"Consolidated_Progress_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.docx"
        generated_reports[consolidated_filename] = consolidated_buffer.getvalue()
    except Exception as e:
        print(f"Error generating consolidated report: {str(e)}")
    
    return {
        "success": True,
        "message": f"Generated reports for {len(individual_reports)} students",
        "reports": individual_reports,
        "consolidated_filename": consolidated_filename,
        "total_generated": len(individual_reports)
    }


@router.get("/download/{filename}")
async def download_report(filename: str):
    """Download a generated report"""
    if filename not in generated_reports:
        raise HTTPException(status_code=404, detail="Report not found. Please generate reports first.")
    
    content = generated_reports[filename]
    
    return StreamingResponse(
        BytesIO(content),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


@router.get("/download-zip")
async def download_all_as_zip():
    """Download all generated reports as a ZIP file"""
    if not generated_reports:
        raise HTTPException(status_code=404, detail="No reports generated. Please generate reports first.")
    
    # Create ZIP in memory
    zip_buffer = BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for filename, content in generated_reports.items():
            zip_file.writestr(filename, content)
    
    zip_buffer.seek(0)
    zip_filename = f"All_Reports_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
    
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="{zip_filename}"'
        }
    )


@router.get("/list")
async def list_generated_reports():
    """List all generated reports available for download"""
    return {
        "reports": list(generated_reports.keys()),
        "count": len(generated_reports)
    }


@router.delete("/clear")
async def clear_generated_reports():
    """Clear all generated reports from memory"""
    generated_reports.clear()
    return {"success": True, "message": "All generated reports cleared"}


@router.get("/preview-html/{roll_no}")
async def get_report_preview_html(roll_no: str):
    """Get HTML preview of a student's report"""
    import mammoth
    
    data = get_uploaded_data()
    
    if not data["subjects_data"]:
        raise HTTPException(status_code=400, detail="No subject data uploaded")
    
    # Find the report file for this student
    matching_file = None
    for filename in generated_reports.keys():
        if filename.startswith(roll_no):
            matching_file = filename
            break
    
    if not matching_file:
        raise HTTPException(status_code=404, detail=f"No report generated for student {roll_no}")
    
    # Convert DOCX to HTML
    try:
        doc_buffer = BytesIO(generated_reports[matching_file])
        result = mammoth.convert_to_html(doc_buffer)
        
        html_content = f"""
        <style>
            .report-preview {{
                font-family: 'Times New Roman', serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }}
            .report-preview table {{
                border-collapse: collapse;
                width: 100%;
                margin: 10px 0;
            }}
            .report-preview th, .report-preview td {{
                border: 1px solid #ddd;
                padding: 8px;
                text-align: center;
            }}
            .report-preview th {{
                background-color: #f2f2f2;
                font-weight: bold;
            }}
        </style>
        <div class="report-preview">
            {result.value}
        </div>
        """
        
        return {
            "success": True,
            "html": html_content,
            "warnings": [str(m) for m in result.messages] if result.messages else []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating preview: {str(e)}")
