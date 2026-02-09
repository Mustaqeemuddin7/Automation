"""
Preview routes for data viewing and editing
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import pandas as pd

from routes.upload import get_uploaded_data
from services import dataframe_to_dict

router = APIRouter()


class StudentUpdate(BaseModel):
    """Model for updating student data"""
    student_name: Optional[str] = None
    subjects: Optional[List[Dict[str, Any]]] = None


class BacklogUpdate(BaseModel):
    """Model for updating backlog data"""
    student_name: Optional[str] = None
    father_name: Optional[str] = None
    backlogs: Optional[Dict[str, str]] = None


@router.get("/subjects")
async def get_subjects_data():
    """Get all uploaded subject data"""
    data = get_uploaded_data()
    
    if not data["subjects_data"]:
        raise HTTPException(status_code=404, detail="No subject data uploaded")
    
    subjects_preview = {}
    for subject_name, df in data["subjects_data"].items():
        # Filter out internal columns for display
        display_cols = [col for col in df.columns if col not in ['is_lab']]
        is_lab = bool(df['is_lab'].iloc[0]) if 'is_lab' in df.columns and len(df) > 0 else False
        
        if is_lab:
            # For labs, hide marks columns
            display_cols = [col for col in display_cols if col not in ['dt_marks', 'st_marks', 'at_marks', 'total_marks']]
        
        subjects_preview[subject_name] = {
            "records": dataframe_to_dict(df[display_cols]),
            "columns": display_cols,
            "row_count": len(df),
            "is_lab": is_lab
        }
    
    return {
        "subjects": subjects_preview,
        "total_subjects": len(data["subjects_data"]),
        "total_students": len(data["all_students"]),
        "all_students": data["all_students"]
    }


@router.get("/student/{roll_no}")
async def get_student_data(roll_no: str):
    """Get complete data for a specific student across all subjects"""
    data = get_uploaded_data()
    
    if not data["subjects_data"]:
        raise HTTPException(status_code=404, detail="No subject data uploaded")
    
    # Normalize roll_no for comparison (handle both string and int types)
    roll_no_str = str(roll_no).strip()
    
    # Get student info from backlog data
    backlog_data = data.get("backlog_data")
    father_name = ''
    student_name_from_backlog = ''
    
    if backlog_data is not None:
        roll_col = None
        for col in ['roll_no', 'roll no', 'rollno']:
            if col in backlog_data.columns:
                roll_col = col
                break
        
        if roll_col:
            # Convert column to string for comparison
            backlog_data_copy = backlog_data.copy()
            backlog_data_copy[roll_col] = backlog_data_copy[roll_col].astype(str).str.strip()
            student_backlog = backlog_data_copy[backlog_data_copy[roll_col] == roll_no_str]
            if not student_backlog.empty:
                for col in ['father_name', 'father name', 'fathername']:
                    if col in student_backlog.columns:
                        val = student_backlog.iloc[0][col]
                        if pd.notna(val) and str(val).strip():
                            father_name = str(val).strip()
                            break
                for col in ['student_name', 'student name', 'name']:
                    if col in student_backlog.columns:
                        val = student_backlog.iloc[0][col]
                        if pd.notna(val) and str(val).strip():
                            student_name_from_backlog = str(val).strip()
                            break
    
    # Get subject data
    subjects = []
    for subject_name, subject_df in data["subjects_data"].items():
        # Convert roll_no column to string for comparison
        df_copy = subject_df.copy()
        df_copy['roll_no'] = df_copy['roll_no'].astype(str).str.strip()
        student_data = df_copy[df_copy['roll_no'] == roll_no_str]
        if not student_data.empty:
            row = student_data.iloc[0]
            subjects.append({
                "subject_name": subject_name,
                "dt_marks": int(row.get('dt_marks', 0) or 0),
                "st_marks": int(row.get('st_marks', 0) or 0),
                "at_marks": int(row.get('at_marks', 0) or 0),
                "total_marks": int(row.get('total_marks', 0) or 0),
                "attendance_conducted": int(row.get('attendance_conducted', 0) or 0),
                "attendance_present": int(row.get('attendance_present', 0) or 0),
                "is_lab": bool(row.get('is_lab', False))
            })
    
    if not subjects:
        raise HTTPException(status_code=404, detail=f"Student {roll_no} not found in any subject data")
    
    return {
        "roll_no": roll_no,
        "student_name": student_name_from_backlog or f"Student {roll_no}",
        "father_name": father_name,
        "subjects": subjects
    }


@router.put("/student/{roll_no}")
async def update_student_data(roll_no: str, update: StudentUpdate):
    """Update student data across subjects"""
    data = get_uploaded_data()
    
    if not data["subjects_data"]:
        raise HTTPException(status_code=404, detail="No subject data uploaded")
    
    # Normalize roll_no for comparison
    roll_no_str = str(roll_no).strip()
    updated_subjects = []
    
    for subject_update in (update.subjects or []):
        subject_name = subject_update.get('subject_name')
        if subject_name and subject_name in data["subjects_data"]:
            df = data["subjects_data"][subject_name]
            # Convert roll_no to string for comparison
            df['roll_no'] = df['roll_no'].astype(str).str.strip()
            idx = df[df['roll_no'] == roll_no_str].index
            
            if not idx.empty:
                if update.student_name:
                    df.loc[idx, 'student_name'] = update.student_name
                df.loc[idx, 'dt_marks'] = subject_update.get('dt_marks', df.loc[idx, 'dt_marks'].values[0])
                df.loc[idx, 'st_marks'] = subject_update.get('st_marks', df.loc[idx, 'st_marks'].values[0])
                df.loc[idx, 'at_marks'] = subject_update.get('at_marks', df.loc[idx, 'at_marks'].values[0])
                df.loc[idx, 'total_marks'] = subject_update.get('total_marks', df.loc[idx, 'total_marks'].values[0])
                df.loc[idx, 'attendance_conducted'] = subject_update.get('attendance_conducted', df.loc[idx, 'attendance_conducted'].values[0])
                df.loc[idx, 'attendance_present'] = subject_update.get('attendance_present', df.loc[idx, 'attendance_present'].values[0])
                updated_subjects.append(subject_name)
    
    return {
        "success": True,
        "message": f"Updated data for {roll_no}",
        "updated_subjects": updated_subjects
    }


@router.get("/backlog")
async def get_backlog_data():
    """Get all student info/backlog data"""
    data = get_uploaded_data()
    
    if data["backlog_data"] is None:
        raise HTTPException(status_code=404, detail="No student info uploaded")
    
    backlog_df = data["backlog_data"]
    sem_cols = sorted([col for col in backlog_df.columns if col.startswith('sem')])
    
    return {
        "records": dataframe_to_dict(backlog_df),
        "columns": list(backlog_df.columns),
        "semester_columns": sem_cols,
        "student_count": len(backlog_df)
    }


@router.put("/backlog/{roll_no}")
async def update_backlog_data(roll_no: str, update: BacklogUpdate):
    """Update student info/backlog data"""
    data = get_uploaded_data()
    
    if data["backlog_data"] is None:
        raise HTTPException(status_code=404, detail="No student info uploaded")
    
    backlog_df = data["backlog_data"]
    
    # Find roll column
    roll_col = None
    for col in ['roll_no', 'roll no', 'rollno']:
        if col in backlog_df.columns:
            roll_col = col
            break
    
    if not roll_col:
        raise HTTPException(status_code=400, detail="No roll_no column in backlog data")
    
    idx = backlog_df[backlog_df[roll_col] == roll_no].index
    
    if idx.empty:
        raise HTTPException(status_code=404, detail=f"Student {roll_no} not found in backlog data")
    
    # Update student name
    if update.student_name:
        for col in ['student_name', 'student name', 'name']:
            if col in backlog_df.columns:
                backlog_df.loc[idx, col] = update.student_name
                break
    
    # Update father name
    if update.father_name:
        for col in ['father_name', 'father name', 'fathername']:
            if col in backlog_df.columns:
                backlog_df.loc[idx, col] = update.father_name
                break
    
    # Update semester backlogs
    if update.backlogs:
        for sem_col, value in update.backlogs.items():
            if sem_col in backlog_df.columns:
                backlog_df.loc[idx, sem_col] = value if value else None
    
    return {
        "success": True,
        "message": f"Updated backlog data for {roll_no}"
    }
