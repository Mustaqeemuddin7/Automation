# sample_data.py
# Sample data creation for the LORDS Institute Progress Report System

import streamlit as st

@st.cache_data
def create_sample_subject_data():
    """Create sample data for different subjects.
    Note: father_name is now sourced from backlog file, not subject files."""
    subjects_data = {
        'Mathematics': {
            'roll_no': ['16092373013', '16092373014', '16092373015', '16092373016', '16092373017'],
            'student_name': ['Steve Rogers', 'ALICE JOHNSON', 'BOB SMITH', 'CHARLIE BROWN', 'DIANA PRINCE'],
            'dt_marks': [24, 22, 18, 20, 25],
            'st_marks': [11, 14, 12, 15, 13],
            'at_marks': [10, 12, 8, 11, 14],
            'total_marks': [45, 48, 38, 46, 52],
            'attendance_conducted': [32, 32, 32, 32, 32],
            'attendance_present': [24, 28, 22, 26, 30]
        },
        'Physics': {
            'roll_no': ['16092373013', '16092373014', '16092373015', '16092373016', '16092373017'],
            'student_name': ['Steve Rogers', 'ALICE JOHNSON', 'BOB SMITH', 'CHARLIE BROWN', 'DIANA PRINCE'],
            'dt_marks': [22, 25, 20, 23, 28],
            'st_marks': [12, 13, 10, 14, 15],
            'at_marks': [9, 11, 8, 12, 13],
            'total_marks': [43, 49, 38, 49, 56],
            'attendance_conducted': [43, 43, 43, 43, 43],
            'attendance_present': [31, 35, 28, 33, 38]
        },
        'Chemistry': {
            'roll_no': ['16092373013', '16092373014', '16092373015', '16092373016', '16092373017'],
            'student_name': ['Steve Rogers', 'ALICE JOHNSON', 'BOB SMITH', 'CHARLIE BROWN', 'DIANA PRINCE'],
            'dt_marks': [26, 28, 24, 25, 30],
            'st_marks': [13, 15, 11, 14, 16],
            'at_marks': [11, 13, 9, 12, 15],
            'total_marks': [50, 56, 44, 51, 61],
            'attendance_conducted': [48, 48, 48, 48, 48],
            'attendance_present': [39, 42, 35, 38, 44]
        }
    }
    return subjects_data