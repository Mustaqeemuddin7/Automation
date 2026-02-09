"use client";

import { useState } from "react";
import { uploadApi } from "@/lib/api";
import { FileUploader } from "@/components/FileUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function UploadPage() {
    const [subjectsResult, setSubjectsResult] = useState<{
        success: boolean;
        subjects?: string[];
        total_students?: number;
        message?: string;
    } | null>(null);
    const [studentInfoResult, setStudentInfoResult] = useState<{
        success: boolean;
        student_count?: number;
        message?: string;
    } | null>(null);

    const handleSubjectsUpload = async (files: File[]) => {
        const result = await uploadApi.uploadSubjects(files);
        setSubjectsResult(result);
    };

    const handleStudentInfoUpload = async (files: File[]) => {
        if (files.length > 0) {
            const result = await uploadApi.uploadStudentInfo(files[0]);
            setStudentInfoResult(result);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Upload Files</h1>
                <p className="text-muted-foreground mt-2">
                    Upload Excel files containing subject data and student information for
                    report generation.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Subject Files Upload */}
                <div className="space-y-4">
                    <FileUploader
                        title="Subject Files"
                        description="Upload Excel files for each subject (e.g., Mathematics.xlsx, Physics.xlsx). Each file should contain roll_no, attendance, and marks columns."
                        multiple={true}
                        onUpload={handleSubjectsUpload}
                        maxFiles={20}
                    />

                    {subjectsResult?.success && (
                        <Card className="border-green-500/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-green-600">
                                    <CheckCircle2 className="h-5 w-5" />
                                    Subjects Uploaded
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        {subjectsResult.total_students} students found across{" "}
                                        {subjectsResult.subjects?.length} subjects
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {subjectsResult.subjects?.map((subject) => (
                                            <Badge key={subject} variant="outline">
                                                {subject}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Student Info Upload */}
                <div className="space-y-4">
                    <FileUploader
                        title="Student Information (Optional)"
                        description="Upload an Excel file with student details: roll_no, student_name, father_name, and backlog columns (sem 1, sem 2, etc.)."
                        multiple={false}
                        onUpload={handleStudentInfoUpload}
                        maxFiles={1}
                    />

                    {studentInfoResult?.success && (
                        <Card className="border-green-500/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-green-600">
                                    <CheckCircle2 className="h-5 w-5" />
                                    Student Info Uploaded
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {studentInfoResult.student_count} student records loaded
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Help Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-500" />
                        File Format Guide
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold">Subject Files (Theory)</h4>
                        <p className="text-sm text-muted-foreground">
                            Required columns: roll_no, attendance_conducted,
                            attendance_present, dt_marks, st_marks, at_marks
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold">Subject Files (Lab)</h4>
                        <p className="text-sm text-muted-foreground">
                            Required columns: roll_no, attendance_conducted, attendance_present
                            (marks columns are optional for labs)
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold">Student Info File</h4>
                        <p className="text-sm text-muted-foreground">
                            Required: roll_no, student_name, father_name. Optional: sem 1, sem
                            2, sem 3, etc. for backlog data
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
