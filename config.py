# config.py
# Configuration and constants for the LORDS Institute Progress Report System

# Streamlit page configuration
PAGE_CONFIG = {
    "page_title": "LORDS Institute Progress Report System",
    "page_icon": "🎓",
    "layout": "wide",
    "initial_sidebar_state": "expanded"
}

# Column name variations and their standardized names
COLUMN_MAPPINGS = {
    'roll_no': [
        'roll no', 'rollno', 'roll number', 'student id', 'id', 'roll_no',
        'roll_no.', 'roll', 'student_id', 'registration no', 'reg no'
    ],
    'student_name': [
        'student name', 'name', 'full name', 'studentname', 'name of student',
        'candidate name', 'student'
    ],
    'father_name': [
        'father name', 'fathername', 'parent name', 'guardian name', "father's name",
        "parent's name", 'father'
    ],
    'dt_marks': [
        'dt marks', 'descriptive test', 'dtmarks', 'descriptive marks', 'dt',
        'test marks', 'descriptive'
    ],
    'st_marks': [
        'st marks', 'surprise test', 'stmarks', 'surprise marks', 'st',
        'surprise', 'surprise test marks'
    ],
    'at_marks': [
        'at marks', 'assignment test', 'atmarks', 'assignment marks', 'at',
        'assignment', 'assignment test marks'
    ],
    'total_marks': [
        'total marks', 'totalmarks', 'total', 'overall marks', 'aggregate marks',
        'sum marks', 'total score'
    ],
    'attendance_conducted': [
        'attendance conducted', 'classes conducted', 'total classes',
        'conducted classes', 'attendanceconducted', 'total attendance'
    ],
    'attendance_present': [
        'attendance present', 'classes attended', 'present classes',
        'attendancepresent', 'attended classes', 'present'
    ]
}