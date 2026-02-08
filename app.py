import streamlit as st
import pandas as pd
from io import BytesIO
import zipfile
from datetime import datetime
from config import PAGE_CONFIG, COLUMN_MAPPINGS
from utils import process_subject_files, preview_report
from report_generator import generate_comprehensive_reports, get_student_complete_data
from sample_data import create_sample_subject_data

# Set page configuration
st.set_page_config(**PAGE_CONFIG)

# Load CSS with UTF-8 encoding
with open("styles.css", encoding="utf-8") as f:
    st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

def main():
    st.markdown("""
    <div class="main-header">
        <h2>🎓 Lords Institute of Engineering and Technology</h2>
        <h1>Lords Institute Enhanced Progress Report System</h1>
        <p>Comprehensive institutional progress reports with unified format</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Replace sidebar with tabs
    tabs = st.tabs([
        "🏛️ Institute Info",
        "📁 Upload Subject Files",
        "📊 Preview Data",
        "✏️ Edit Data",
        "📋 Generate Reports",
        "📥 Sample Data",
        "📋 Features"
    ])
    # Tab indices:
    # 0 = Institute Info, 1 = Upload Subject Files, 2 = Preview Data
    # 3 = Edit Data, 4 = Generate Reports, 5 = Sample Data, 6 = Features

    with tabs[0]:
        st.markdown("""
        <div class="tab-content">
            <h3>🏛️ Lords Institute of Engineering and Technology</h3>
            <p></p>
        </div>
        """, unsafe_allow_html=True)

    with tabs[6]:
        st.markdown("""
        <div class="tab-content">
            <div class="feature-card">
                <h4>📄 Comprehensive Reports</h4>
                <p>Single report per student containing all subjects</p>
            </div>
            <div class="feature-card">
                <h4>📚 Consolidated Document</h4>
                <p>All student reports in one Word document</p>
            </div>
            <div class="feature-card">
                <h4>📊 Enhanced Analytics</h4>
                <p>Overall attendance and performance metrics</p>
            </div>
            <div class="feature-card">
                <h4>🚀 Streamlined Process</h4>
                <p>Efficient generation and distribution</p>
            </div>
            <div class="feature-card">
                <h4>👀 Advanced Previews</h4>
                <p>HTML and text report previews</p>
            </div>
        </div>
        """, unsafe_allow_html=True)

    with tabs[1]:
        st.header("Upload Subject Excel Files")
        
        # Create two columns for side-by-side upload sections
        upload_col1, upload_col2 = st.columns(2)
        
        with upload_col1:
            st.subheader("📁 Subject Files")
            st.info("Upload multiple Excel files - each file name represents a subject (e.g., Mathematics.xlsx, Physics.xlsx)")
            uploaded_files = st.file_uploader(
                "Upload Excel files (one per subject)",
                type=['xlsx', 'xls'],
                accept_multiple_files=True,
                help="File names will be used as subject names",
                key="subject_files_uploader"
            )
            if uploaded_files:
                st.success(f"✅ {len(uploaded_files)} subject files uploaded successfully!")
                subjects = [f.name.split('.')[0] for f in uploaded_files]
                st.write("**Subjects detected**:")
                for i, subject in enumerate(subjects, 1):
                    st.write(f"{i}. {subject}")
                st.session_state['uploaded_files'] = uploaded_files
        
        with upload_col2:
            st.subheader("📋 Student Info")
            st.info("Upload an Excel file containing student info with columns: roll_no, student_name, father_name, sem 1, sem 2, ... (up to previous semester)")
            backlog_file = st.file_uploader(
                "Upload Student Info Excel file",
                type=['xlsx', 'xls'],
                accept_multiple_files=False,
                help="Contains columns: roll_no, student_name, father_name, and semester backlog columns (sem 1, sem 2, etc.)",
                key="backlog_file_uploader"
            )
            if backlog_file:
                try:
                    backlog_df = pd.read_excel(backlog_file)
                    # Normalize column names
                    backlog_df.columns = [col.lower().strip() for col in backlog_df.columns]
                    st.success(f"✅ Student info uploaded successfully! ({len(backlog_df)} students)")
                    st.session_state['backlog_data'] = backlog_df
                    
                    # Show detected semester columns
                    sem_cols = [col for col in backlog_df.columns if col.startswith('sem')]
                    st.write(f"**Semester columns detected**: {', '.join(sem_cols) if sem_cols else 'None'}")
                except Exception as e:
                    st.error(f"Error reading student info file: {str(e)}")

    with tabs[2]:
        st.header("Data Preview & Validation")
        if 'uploaded_files' in st.session_state:
            # Use existing session_state data if available (preserves edits)
            # Only reprocess if subjects_data doesn't exist yet
            if 'subjects_data' not in st.session_state:
                with st.spinner("Processing subject files..."):
                    subjects_data, all_students, error = process_subject_files(st.session_state['uploaded_files'])
                if error:
                    st.error(f"Error processing files: {error}")
                else:
                    st.session_state['subjects_data'] = subjects_data
                    st.session_state['all_students'] = all_students
            
            if 'subjects_data' in st.session_state:
                subjects_data = st.session_state['subjects_data']
                all_students = st.session_state['all_students']
                st.success("✅ Subject data processed successfully!")
                col1, col2, col3, col4 = st.columns(4)
                with col1:
                    st.metric("Total Subjects", len(subjects_data))
                with col2:
                    st.metric("Total Students", len(all_students))
                with col3:
                    total_records = sum(len(df) for df in subjects_data.values())
                    st.metric("Total Records", total_records)
                with col4:
                    st.metric("Files Processed", len(st.session_state['uploaded_files']))
                st.subheader("Subject-wise Data Preview")
                for subject_name, subject_df in subjects_data.items():
                    with st.expander(f"📚 {subject_name} ({len(subject_df)} students)"):
                        # For lab files, hide irrelevant marks columns
                        is_lab = subject_df['is_lab'].iloc[0] if 'is_lab' in subject_df.columns and len(subject_df) > 0 else False
                        if is_lab:
                            # Filter out marks columns and is_lab for lab files
                            display_cols = [col for col in subject_df.columns if col not in ['dt_marks', 'st_marks', 'at_marks', 'total_marks', 'is_lab']]
                            st.dataframe(subject_df[display_cols])
                        else:
                            # For theory files, hide is_lab column only
                            display_cols = [col for col in subject_df.columns if col != 'is_lab']
                            st.dataframe(subject_df[display_cols])
                       
                        st.write("**Required Columns Present (after mapping)**:")
                        # Exclude student_name and father_name as they come from Student Info file
                        required_cols = [col for col in COLUMN_MAPPINGS.keys() if col not in ['father_name', 'student_name']]
                        for col in required_cols:
                            status = "✅" if col in subject_df.columns else "❌"
                            st.write(f"{status} {col}")
                
                # Option to reprocess files (clear edits)
                if st.button("🔄 Reprocess Files (clears any edits)"):
                    del st.session_state['subjects_data']
                    del st.session_state['all_students']
                    process_subject_files.clear()
                    st.rerun()
                
                # Student Info Preview
                if 'backlog_data' in st.session_state:
                    st.subheader("📋 Student Info Preview")
                    backlog_df = st.session_state['backlog_data']
                    with st.expander(f"📋 Student Info ({len(backlog_df)} students)", expanded=False):
                        st.dataframe(backlog_df)
                        sem_cols = [col for col in backlog_df.columns if col.startswith('sem')]
                        st.write(f"**Semester columns detected**: {', '.join(sem_cols) if sem_cols else 'None'}")
        else:
            st.warning("Please upload subject Excel files in the 'Upload Subject Files' tab first.")

    # Tab 3: Edit Data (separate tab)
    with tabs[3]:
        st.header("✏️ Edit Student & Subject Data")
        if 'subjects_data' in st.session_state:
            subjects_data = st.session_state['subjects_data']
            all_students = st.session_state['all_students']
            backlog_data = st.session_state.get('backlog_data', None)
            
            st.subheader("📝 Edit Subject Data")
            st.info("Edit marks and attendance for each student's subjects. Student name and father name are managed in the backlog file.")
            edit_student = st.selectbox("Select student to edit:", options=[""] + all_students, key="edit_student_select")
            if edit_student:
                student_data = get_student_complete_data(edit_student, subjects_data, backlog_data)
                with st.form(key=f"edit_form_{edit_student}"):
                    st.write(f"**Editing data for: {student_data['personal_info']['student_name']} ({edit_student})**")
                    st.write(f"Father's Name: {student_data['personal_info']['father_name']}")
                    
                    # Edit student_name in subject files
                    new_student_name = st.text_input("Student Name (in subject files)", value=student_data['personal_info']['student_name'])
                    
                    updated_subjects = []
                    for subject in student_data['subjects']:
                        st.subheader(f"Subject: {subject['subject_name']}")
                        is_lab = subject.get('is_lab', False)
                        
                        if not is_lab:
                            dt_marks = st.number_input(f"DT Marks (out of 20) - {subject['subject_name']}", min_value=0, max_value=20, value=int(subject['dt_marks']), step=1)
                            st_marks = st.number_input(f"ST Marks (out of 10) - {subject['subject_name']}", min_value=0, max_value=10, value=int(subject['st_marks']), step=1)
                            at_marks = st.number_input(f"AT Marks (out of 10) - {subject['subject_name']}", min_value=0, max_value=10, value=int(subject['at_marks']), step=1)
                            total_marks = dt_marks + st_marks + at_marks
                        else:
                            dt_marks = st_marks = at_marks = total_marks = 0
                            st.caption("(Lab subject - no marks)")
                        
                        attendance_conducted = st.number_input(f"Attendance Conducted - {subject['subject_name']}", min_value=0, value=int(subject['attendance_conducted']), step=1)
                        attendance_present = st.number_input(f"Attendance Present - {subject['subject_name']}", min_value=0, max_value=attendance_conducted if attendance_conducted > 0 else 9999, value=int(subject['attendance_present']), step=1)
                        updated_subjects.append({
                            'subject_name': subject['subject_name'],
                            'dt_marks': dt_marks,
                            'st_marks': st_marks,
                            'at_marks': at_marks,
                            'total_marks': total_marks,
                            'attendance_conducted': attendance_conducted,
                            'attendance_present': attendance_present
                        })
                    if st.form_submit_button("💾 Save Subject Changes"):
                        for subject in updated_subjects:
                            subject_name = subject['subject_name']
                            student_idx = subjects_data[subject_name][subjects_data[subject_name]['roll_no'] == edit_student].index
                            if not student_idx.empty:
                                subjects_data[subject_name].loc[student_idx, 'student_name'] = new_student_name
                                subjects_data[subject_name].loc[student_idx, 'dt_marks'] = subject['dt_marks']
                                subjects_data[subject_name].loc[student_idx, 'st_marks'] = subject['st_marks']
                                subjects_data[subject_name].loc[student_idx, 'at_marks'] = subject['at_marks']
                                subjects_data[subject_name].loc[student_idx, 'total_marks'] = subject['total_marks']
                                subjects_data[subject_name].loc[student_idx, 'attendance_conducted'] = subject['attendance_conducted']
                                subjects_data[subject_name].loc[student_idx, 'attendance_present'] = subject['attendance_present']
                        st.session_state['subjects_data'] = subjects_data
                        process_subject_files.clear()
                        st.success(f"✅ Updated subject data for {new_student_name} ({edit_student})")
                        st.rerun()
            
            st.markdown("---")
            
            # Student Info Edit Section
            st.subheader("📋 Edit Student Info")
            if 'backlog_data' in st.session_state:
                backlog_df = st.session_state['backlog_data']
                st.info("Edit student info (name, father name) and backlog subjects here.")
                
                # Find roll column
                roll_col = None
                for col in ['roll_no', 'roll no', 'rollno']:
                    if col in backlog_df.columns:
                        roll_col = col
                        break
                
                if roll_col:
                    edit_backlog_student = st.selectbox(
                        "Select student to edit backlog:",
                        options=backlog_df[roll_col].tolist(),
                        key="edit_backlog_student"
                    )
                    
                    # Get semester columns
                    sem_cols = sorted([col for col in backlog_df.columns if col.startswith('sem')])
                    
                    with st.form("edit_backlog_form"):
                        st.write(f"**Editing backlog for: {edit_backlog_student}**")
                        
                        student_row = backlog_df[backlog_df[roll_col] == edit_backlog_student]
                        if not student_row.empty:
                            # Edit student name and father name
                            current_student_name = ''
                            current_father_name = ''
                            for col in ['student_name', 'student name', 'name']:
                                if col in student_row.columns:
                                    current_student_name = str(student_row.iloc[0][col]) if pd.notna(student_row.iloc[0][col]) else ''
                                    break
                            for col in ['father_name', 'father name', 'fathername']:
                                if col in student_row.columns:
                                    current_father_name = str(student_row.iloc[0][col]) if pd.notna(student_row.iloc[0][col]) else ''
                                    break
                            
                            new_backlog_student_name = st.text_input("Student Name", value=current_student_name, key="backlog_student_name")
                            new_backlog_father_name = st.text_input("Father Name", value=current_father_name, key="backlog_father_name")
                            
                            st.markdown("**Semester Backlogs:**")
                            updated_backlog = {}
                            for sem_col in sem_cols:
                                current_val = student_row.iloc[0][sem_col] if sem_col in student_row.columns else ''
                                current_val = str(current_val) if pd.notna(current_val) else ''
                                updated_backlog[sem_col] = st.text_input(
                                    f"{sem_col.upper()} Backlogs (comma-separated subjects):",
                                    value=current_val,
                                    key=f"backlog_{sem_col}"
                                )
                            
                            if st.form_submit_button("💾 Save Backlog Changes"):
                                idx = backlog_df[backlog_df[roll_col] == edit_backlog_student].index
                                # Update student name and father name
                                for col in ['student_name', 'student name', 'name']:
                                    if col in st.session_state['backlog_data'].columns:
                                        st.session_state['backlog_data'].loc[idx, col] = new_backlog_student_name
                                        break
                                for col in ['father_name', 'father name', 'fathername']:
                                    if col in st.session_state['backlog_data'].columns:
                                        st.session_state['backlog_data'].loc[idx, col] = new_backlog_father_name
                                        break
                                # Update semester backlogs
                                for sem_col, new_val in updated_backlog.items():
                                    st.session_state['backlog_data'].loc[idx, sem_col] = new_val if new_val else None
                                st.success(f"✅ Updated backlog data for {edit_backlog_student}")
                                st.rerun()
                else:
                    st.warning("Student Info data doesn't have a roll_no column")
            else:
                st.warning("Please upload Student Info in the 'Upload Subject Files' tab to edit student and father names.")
        else:
            st.warning("Please process your subject data in the 'Preview Data' tab first.")
    
    # Tab 4: Generate Reports
    with tabs[4]:
        st.header("🎓 Generate Institutional Progress Reports")
        if 'subjects_data' in st.session_state:
            subjects_data = st.session_state['subjects_data']
            all_students = st.session_state['all_students']
            st.info(f"Ready to generate reports for {len(all_students)} students across {len(subjects_data)} subjects")
            
            # Report Configuration
            st.subheader("Report Configuration")
            department_name = st.text_input("Department Name", value="Computer Science", help="Enter the department name to appear in the report")
            report_date = st.date_input("Report Date", value=datetime.now(), help="Select the date to appear in the report")
            academic_year = st.text_input("Academic Year", value="2024-2025", help="Enter the academic year (e.g., 2024-2025)")
            semester = st.text_input("Semester", value="B.E- IV Semester", help="Enter the semester (e.g., B.E- IV Semester)")
            col_a1, col_a2 = st.columns(2)
            with col_a1:
                attendance_start = st.date_input("Attendance Start Date", help="Select the start date for attendance period")
            with col_a2:
                attendance_end = st.date_input("Attendance End Date", help="Select the end date for attendance period")
            st.session_state['department_name'] = department_name
            st.session_state['report_date'] = report_date.strftime('%d.%m.%Y')
            st.session_state['academic_year'] = academic_year
            st.session_state['semester'] = semester
            if attendance_start and attendance_end:
                st.session_state['attendance_start'] = attendance_start.strftime('%d-%m-%Y')
                st.session_state['attendance_end'] = attendance_end.strftime('%d-%m-%Y')
            
            st.subheader("📄 Generate Reports")
            col1, col2 = st.columns([2, 1])
            with col1:
                selected_students = st.multiselect(
                    "Select students (leave empty for all):",
                    options=all_students,
                    default=[]
                )
            with col2:
                if st.button("🚀 Generate Reports", type="primary"):
                    students_to_process = selected_students if selected_students else all_students
                    with st.spinner("Generating reports..."):
                        progress_bar = st.progress(0)
                        status_text = st.empty()
                        individual_reports, consolidated_report = generate_comprehensive_reports(
                            students_to_process,
                            subjects_data,
                            department_name=st.session_state['department_name'],
                            report_date=st.session_state['report_date'],
                            academic_year=st.session_state['academic_year'],
                            semester=st.session_state['semester'],
                            attendance_start=st.session_state.get('attendance_start', ''),
                            attendance_end=st.session_state.get('attendance_end', ''),
                            template="Detailed",
                            include_backlog=True,
                            include_notes=True,
                            backlog_data=st.session_state.get('backlog_data', None)
                        )
                        student_reports = {}
                        for i, student_roll in enumerate(students_to_process):
                            status_text.text(f"Processing student {student_roll} ({i+1}/{len(students_to_process)})")
                            if student_roll in individual_reports:
                                student_data = individual_reports[student_roll]
                                student_reports[student_roll] = {
                                    'docx_content': student_data['docx_content'],
                                    'student_name': student_data['student_name']
                                }
                            progress = (i + 1) / len(students_to_process)
                            progress_bar.progress(progress)
                    st.session_state['generated_student_reports'] = student_reports
                    st.session_state['consolidated_report'] = consolidated_report
                    st.success(f"✅ Successfully generated reports for {len(student_reports)} students!")
            if 'generated_student_reports' in st.session_state:
                st.subheader("👀 View Generated Reports")
                view_option = st.radio("Select report to view:", ["Single Student Report", "Consolidated Report"])
                if view_option == "Single Student Report":
                    view_student = st.selectbox("Select student", options=list(st.session_state['generated_student_reports'].keys()))
                    if view_student:
                        doc_content = st.session_state['generated_student_reports'][view_student]['docx_content']
                        title = f"{st.session_state['generated_student_reports'][view_student]['student_name']} ({view_student})"
                        preview_report(doc_content, title)
                else:
                    preview_report(st.session_state['consolidated_report'], "Consolidated Report")
                st.subheader("Generated Student Reports")
                student_reports = st.session_state['generated_student_reports']
                st.write("**Individual Student Reports**:")
                for student_roll, report_data in student_reports.items():
                    student_name = report_data['student_name']
                    col1, col2 = st.columns([3, 1])
                    with col1:
                        st.write(f"📄 {student_name} ({student_roll}) - Comprehensive Report")
                    with col2:
                        st.download_button(
                            label="Download DOCX",
                            data=report_data['docx_content'],
                            file_name=f"{student_roll}_{student_name.replace(' ', '_')}_Report.docx",
                            mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                            key=f"download_docx_{student_roll}"
                        )
                st.write("**Consolidated Report (All Students)**:")
                if 'consolidated_report' in st.session_state:
                    st.download_button(
                        label="📥 Download Consolidated Report",
                        data=st.session_state['consolidated_report'],
                        file_name=f"Consolidated_Progress_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.docx",
                        mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        key="download_consolidated"
                    )
                st.write("**Master ZIP Package**")
                if st.button("📦 Generate Master ZIP"):
                    master_zip_buffer = BytesIO()
                    with zipfile.ZipFile(master_zip_buffer, 'w', zipfile.ZIP_DEFLATED) as master_zip:
                        for student_roll, report_data in student_reports.items():
                            docx_filename = f"{student_roll}_{report_data['student_name'].replace(' ', '_')}_Report.docx"
                            master_zip.writestr(docx_filename, report_data['docx_content'])
                        master_zip.writestr(
                            f"Consolidated_Progress_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.docx",
                            st.session_state['consolidated_report']
                        )
                    master_zip_buffer.seek(0)
                    st.download_button(
                        label="📥 Download Master ZIP (All Students)",
                        data=master_zip_buffer.getvalue(),
                        file_name=f"All_Student_Reports_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip",
                        mime="application/zip",
                        key="download_master_zip"
                    )
        else:
            st.warning("Please process your subject data in the 'Preview Data' tab first.")

    # Tab 5: Sample Data
    with tabs[5]:
        st.header("Sample Data & Template")
        st.subheader("📋 Required Excel Format")
        st.markdown("""
        **Required Columns for each SUBJECT file (case-insensitive variations accepted)**:
        - `roll_no`: Student roll number (e.g., Roll No, Roll Number, RollNo)
        - `dt_marks`: Descriptive Test marks (out of 20) - for theory subjects only
        - `st_marks`: Surprise Test marks (out of 10) - for theory subjects only
        - `at_marks`: Assignment marks (out of 10) - for theory subjects only
        - `total_marks`: Total CIE-1 marks (out of 40) - for theory subjects only
        - `attendance_conducted`: No of classes conducted (e.g., Attendance Conducted, Total Classes)
        - `attendance_present`: No of classes attended (e.g., Attendance Present, Classes Attended)
        
        **Required Columns for STUDENT INFO file**:
        - `roll_no`: Student roll number (primary key for matching)
        - `student_name`: Full name (REQUIRED - used for reports)
        - `father_name`: Father's name (REQUIRED - used for reports)
        - `sem 1`, `sem 2`, etc.: Semester-wise backlog subjects (comma-separated)
        """)
        st.subheader("📊 Sample Data")
        sample_subjects = create_sample_subject_data()
        st.write("**Mathematics Sample**:")
        sample_df = pd.DataFrame(sample_subjects['Mathematics'])
        st.dataframe(sample_df.head())          # default width

        st.subheader("📥 Download Sample Files")
        col1, col2, col3 = st.columns(3)
        for i, (subject_name, subject_data) in enumerate(sample_subjects.items()):
            col = [col1, col2, col3][i % 3]
            with col:
                excel_buffer = BytesIO()
                df = pd.DataFrame(subject_data)
                df.to_excel(excel_buffer, index=False, engine='openpyxl')
                excel_buffer.seek(0)
                st.download_button(
                    label=f"📚 {subject_name}.xlsx",
                    data=excel_buffer.getvalue(),
                    file_name=f"{subject_name}.xlsx",
                    mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    key=f"sample_{subject_name}"
                )
        if st.button("🧪 Test with Sample Data"):
            st.session_state['subjects_data'] = sample_subjects
            st.session_state['all_students'] = list(set(pd.DataFrame(sample_subjects['Mathematics'])['roll_no'].tolist()))
            st.success("✅ Sample data loaded! Go to 'Generate Reports' tab to test.")

    st.markdown("---")
    st.markdown("""
    <div style="text-align: center; color: #666; padding: 2rem;">
        <h2>🏛️ Lords Institute of Engineering and Technology</h2>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()