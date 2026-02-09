"""
Upload routes for handling Excel file uploads
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import pandas as pd

from services import process_subject_files, process_backlog_file, dataframe_to_dict

router = APIRouter()

# In-memory storage for uploaded data (per-session in production, use Redis/DB)
uploaded_data = {
    "subjects_data": {},
    "all_students": [],
    "backlog_data": None
}


@router.post("/subjects")
async def upload_subject_files(files: List[UploadFile] = File(...)):
    """
    Upload multiple subject Excel files.
    Each file name represents a subject (e.g., Mathematics.xlsx)
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    
    # Read all files into memory
    file_data = []
    for file in files:
        if not file.filename.endswith(('.xlsx', '.xls')):
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file type: {file.filename}. Only Excel files (.xlsx, .xls) are allowed."
            )
        content = await file.read()
        file_data.append((file.filename, content))
    
    # Process the files
    subjects_data, all_students, error = process_subject_files(file_data)
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    # Store in memory
    uploaded_data["subjects_data"] = subjects_data
    uploaded_data["all_students"] = all_students
    
    # Convert DataFrames to serializable format
    subjects_preview = {}
    for subject_name, df in subjects_data.items():
        subjects_preview[subject_name] = {
            "records": dataframe_to_dict(df),
            "columns": list(df.columns),
            "row_count": len(df),
            "is_lab": bool(df['is_lab'].iloc[0]) if 'is_lab' in df.columns and len(df) > 0 else False
        }
    
    return {
        "success": True,
        "message": f"Successfully uploaded {len(files)} subject files",
        "subjects": list(subjects_data.keys()),
        "total_students": len(all_students),
        "all_students": all_students,
        "subjects_preview": subjects_preview
    }


@router.post("/student-info")
async def upload_student_info(file: UploadFile = File(...)):
    """
    Upload student info/backlog Excel file.
    Contains: roll_no, student_name, father_name, sem 1, sem 2, etc.
    """
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Only Excel files (.xlsx, .xls) are allowed."
        )
    
    content = await file.read()
    backlog_df, error = process_backlog_file(content)
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    # Store in memory
    uploaded_data["backlog_data"] = backlog_df
    
    # Get semester columns
    sem_cols = [col for col in backlog_df.columns if col.startswith('sem')]
    
    return {
        "success": True,
        "message": f"Successfully uploaded student info ({len(backlog_df)} students)",
        "student_count": len(backlog_df),
        "columns": list(backlog_df.columns),
        "semester_columns": sem_cols,
        "records": dataframe_to_dict(backlog_df)
    }


@router.get("/status")
async def get_upload_status():
    """Get current upload status"""
    has_subjects = bool(uploaded_data["subjects_data"])
    has_backlog = uploaded_data["backlog_data"] is not None
    
    return {
        "has_subjects": has_subjects,
        "has_backlog": has_backlog,
        "subjects": list(uploaded_data["subjects_data"].keys()) if has_subjects else [],
        "total_students": len(uploaded_data["all_students"]),
        "ready_to_generate": has_subjects
    }


@router.delete("/clear")
async def clear_uploads():
    """Clear all uploaded data"""
    uploaded_data["subjects_data"] = {}
    uploaded_data["all_students"] = []
    uploaded_data["backlog_data"] = None
    
    return {"success": True, "message": "All uploads cleared"}


def get_uploaded_data():
    """Helper to get uploaded data for other routes"""
    return uploaded_data
