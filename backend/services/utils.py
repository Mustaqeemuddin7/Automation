# utils.py
# Utility functions for the LORDS Institute Progress Report System

import re
import pandas as pd
from io import BytesIO
from typing import Dict, List, Tuple, Optional, Any
from .config import COLUMN_MAPPINGS


def normalize_column_name(col_name: str) -> str:
    """Normalize column name by converting to lowercase and removing spaces/underscores"""
    if not isinstance(col_name, str):
        return ""
    normalized = re.sub(r'[\s_\.\-]', '', col_name.lower())
    return normalized


def map_column_name(col_name: str) -> str:
    """Map a column name to the standardized name based on variations"""
    normalized = normalize_column_name(col_name)
    for standard_name, variations in COLUMN_MAPPINGS.items():
        if normalized in [normalize_column_name(v) for v in variations]:
            return standard_name
    return col_name


def process_subject_files(uploaded_files: List[Tuple[str, bytes]]) -> Tuple[Optional[Dict], Optional[List], Optional[str]]:
    """Process multiple Excel files (theory and lab), each representing a subject.
    Labs may contain only attendance columns; theory files include marks.
    
    Args:
        uploaded_files: List of tuples (filename, file_bytes)
    
    Returns:
        Tuple of (subjects_data, all_students, error_message)
    """
    try:
        subjects_data = {}
        all_students = set()
        # Minimal required columns for any subject (lab or theory)
        # student_name and father_name now come from Student Info file
        minimal_required = ['roll_no', 'attendance_conducted', 'attendance_present']
        
        for filename, file_bytes in uploaded_files:
            subject_name = filename.split('.')[0]
            df = pd.read_excel(BytesIO(file_bytes))
            
            column_mapping = {}
            for col in df.columns:
                standardized_col = map_column_name(col)
                if standardized_col in COLUMN_MAPPINGS.keys():
                    column_mapping[col] = standardized_col
            df = df.rename(columns=column_mapping)
            
            # Validate minimal columns
            missing_min = [col for col in minimal_required if col not in df.columns]
            if missing_min:
                return None, None, f"Missing required columns in {subject_name}: {', '.join(missing_min)}"

            # Determine if this is a lab file (no marks present)
            has_dt = 'dt_marks' in df.columns
            has_st = 'st_marks' in df.columns
            has_at = 'at_marks' in df.columns
            has_lab_marks = 'lab_marks' in df.columns
            is_lab_file = not (has_dt or has_st or has_at)

            # Ensure marks columns exist; for labs, fill with 0 to avoid errors
            # But preserve 'ab'/'AB' string values in existing marks columns
            for col in ['dt_marks', 'st_marks', 'at_marks', 'total_marks']:
                if col not in df.columns:
                    df[col] = 0
            if not has_lab_marks:
                df['lab_marks'] = 0
            # Convert marks columns to object dtype so mixed types (int/float + 'ab')
            # don't cause serialization errors
            for col in ['dt_marks', 'st_marks', 'at_marks', 'total_marks', 'lab_marks']:
                if col in df.columns:
                    df[col] = df[col].astype(object)
            df['is_lab'] = is_lab_file
            
            subjects_data[subject_name] = df
            if 'roll_no' in df.columns:
                all_students.update(df['roll_no'].tolist())
                
        return subjects_data, list(all_students), None
    except Exception as e:
        return None, None, str(e)


def process_backlog_file(file_bytes: bytes) -> Tuple[Optional[pd.DataFrame], Optional[str]]:
    """Process the student info/backlog Excel file.
    
    Args:
        file_bytes: Bytes of the Excel file
    
    Returns:
        Tuple of (backlog_dataframe, error_message)
    """
    try:
        backlog_df = pd.read_excel(BytesIO(file_bytes))
        # Normalize column names
        backlog_df.columns = [col.lower().strip() for col in backlog_df.columns]
        return backlog_df, None
    except Exception as e:
        return None, str(e)


def dataframe_to_dict(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Convert a pandas DataFrame to a list of dictionaries, handling NaN values."""
    return df.fillna('').to_dict(orient='records')
