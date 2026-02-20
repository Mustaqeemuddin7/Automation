# config.py
# Configuration and constants for the LORDS Institute Progress Report System

# Streamlit page configuration
PAGE_CONFIG = {
    "page_title": "LORDS Institute Progress Report System",
    "page_icon": "C:/Users/Mustaqeem Uddin/OneDrive/Documents/PROJECTS/lords_progress_report/assests/logo.png",
    "layout": "wide",
    "initial_sidebar_state": "expanded"
}

# Column name variations and their standardized names
COLUMN_MAPPINGS = {
    'roll_no': [
        'roll no', 'rollno', 'roll number', 'student id', 'id', 'roll_no',
        'roll_no.', 'roll', 'student_id', 'registration no', 'reg no',
        'enrollment no', 'enroll no', 'ht no', 'hall ticket no'
    ],
    'student_name': [
        'student name', 'name', 'full name', 'studentname', 'name of student',
        'candidate name', 'student', 'student_name', 'pupil name'
    ],
    'father_name': [
        'father name', 'fathername', 'parent name', 'guardian name', "father's name",
        "parent's name", 'father', 'father_name', 'parent', 'guardian'
    ],
    'dt_marks': [
        'dt marks', 'descriptive test', 'dtmarks', 'descriptive marks', 'dt',
        'test marks', 'descriptive', 'dt_marks', 'mid marks', 'mid term'
    ],
    'st_marks': [
        'st marks', 'surprise test', 'stmarks', 'surprise marks', 'st',
        'surprise', 'surprise test marks', 'st_marks', 'quiz marks', 'quiz'
    ],
    'at_marks': [
        'at marks', 'assignment test', 'atmarks', 'assignment marks', 'at',
        'assignment', 'assignment test marks', 'at_marks', 'assignment score'
    ],
    'total_marks': [
        'total marks', 'totalmarks', 'total', 'overall marks', 'aggregate marks',
        'sum marks', 'total score', 'total_marks', 'grand total', 'marks total'
    ],
    'attendance_conducted': [
        'attendance conducted', 'classes conducted', 'total classes',
        'conducted classes', 'attendanceconducted', 'total attendance',
        'attendance_conducted', 'no of classes conducted', 'periods conducted'
    ],
    'attendance_present': [
        'attendance present', 'classes attended', 'present classes',
        'attendancepresent', 'attended classes', 'present', 'attendance_present',
        'no of classes attended', 'periods attended', 'classes present'
    ],
    'lab_marks': [
        'lab marks', 'labmarks', 'lab_marks', 'lab score', 'lab total',
        'practical marks', 'marks'
    ]
}

# Backlog column mappings (includes student info and semester-wise backlogs)
BACKLOG_COLUMN_MAPPINGS = {
    'roll_no': [
        'roll no', 'rollno', 'roll number', 'student id', 'id', 'roll_no',
        'roll_no.', 'roll', 'student_id', 'registration no', 'reg no',
        'enrollment no', 'enroll no', 'ht no', 'hall ticket no', 'htno'
    ],
    'student_name': [
        'student name', 'name', 'full name', 'studentname', 'name of student',
        'candidate name', 'student', 'student_name', 'pupil name'
    ],
    'father_name': [
        'father name', 'fathername', 'parent name', 'guardian name', "father's name",
        "parent's name", 'father', 'father_name', 'parent', 'guardian'
    ],
    'sem 1': ['sem 1', 'sem1', 'semester 1', 'semester1', 'i sem', 'sem-1', '1st sem', 'first sem', 's1', 'sem_1'],
    'sem 2': ['sem 2', 'sem2', 'semester 2', 'semester2', 'ii sem', 'sem-2', '2nd sem', 'second sem', 's2', 'sem_2'],
    'sem 3': ['sem 3', 'sem3', 'semester 3', 'semester3', 'iii sem', 'sem-3', '3rd sem', 'third sem', 's3', 'sem_3'],
    'sem 4': ['sem 4', 'sem4', 'semester 4', 'semester4', 'iv sem', 'sem-4', '4th sem', 'fourth sem', 's4', 'sem_4'],
    'sem 5': ['sem 5', 'sem5', 'semester 5', 'semester5', 'v sem', 'sem-5', '5th sem', 'fifth sem', 's5', 'sem_5'],
    'sem 6': ['sem 6', 'sem6', 'semester 6', 'semester6', 'vi sem', 'sem-6', '6th sem', 'sixth sem', 's6', 'sem_6'],
    'sem 7': ['sem 7', 'sem7', 'semester 7', 'semester7', 'vii sem', 'sem-7', '7th sem', 'seventh sem', 's7', 'sem_7'],
    'sem 8': ['sem 8', 'sem8', 'semester 8', 'semester8', 'viii sem', 'sem-8', '8th sem', 'eighth sem', 's8', 'sem_8'],
}