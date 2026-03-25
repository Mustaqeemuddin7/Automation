"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Upload,
    Eye,
    Edit,
    FileText,
    CheckCircle2,
    AlertTriangle,
    Info,
} from "lucide-react";

const steps = [
    {
        icon: Upload,
        title: "Step 1: Upload Files",
        description: "Upload your subject Excel files and the Student Info (backlog) file.",
        details: [
            "Go to the Upload tab.",
            "Upload one or more subject Excel files (theory and/or lab).",
            "Upload the Student Info file which contains roll numbers, student names, father names, and backlog data.",
            "Supported formats: .xlsx, .xls, .csv",
        ],
    },
    {
        icon: Eye,
        title: "Step 2: Preview Data",
        description: "Verify uploaded data before generating reports.",
        details: [
            "Go to the Preview tab.",
            "Check that all subjects appear with correct columns.",
            "Theory subjects show: Roll No, Student Name, DT Marks, AT Marks, AAT Marks, Total Marks, Attendance.",
            "Lab subjects show: Roll No, Student Name, DTDE Marks, CIE Marks, Attendance.",
            "Subjects are sorted: theory first, then labs.",
        ],
    },
    {
        icon: Edit,
        title: "Step 3: Edit Data (Optional)",
        description: "Make corrections to any student's marks or attendance.",
        details: [
            "Go to the Edit tab.",
            "Select a student by roll number.",
            "Modify marks (DT, AT, AAT for theory; DTDE, CIE for labs) or attendance values.",
            "Click Save to apply changes.",
            "Changes reflect immediately in report generation.",
        ],
    },
    {
        icon: FileText,
        title: "Step 4: Generate Reports",
        description: "Configure and generate progress reports.",
        details: [
            "Go to the Generate tab.",
            "Fill in: Department Name, Report Date (DD/MM/YYYY), Academic Year, and Semester.",
            "Optionally set Attendance Start and End dates.",
            "Select students (or select all) for report generation.",
            "Choose report template (Detailed or Compact).",
            "Click Generate to create Word (.docx) reports.",
            "Download individual or consolidated reports.",
        ],
    },
];

const fileFormatNotes = [
    {
        title: "Subject Files (Theory)",
        columns: "roll_no, student_name, dt_marks, at_marks, aat_marks, total_marks, attendance_conducted, attendance_present",
    },
    {
        title: "Subject Files (Lab)",
        columns: "roll_no, student_name, dtde_marks, cie_marks, attendance_conducted, attendance_present",
    },
    {
        title: "Student Info / Backlog File",
        columns: "roll_no, student_name, father_name, sem 1, sem 2, ... (backlog counts per semester)",
    },
];

export default function InstructionsPage() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Instructions</h1>
                <p className="text-muted-foreground mt-2">
                    How to use the LIET Progress Report System
                </p>
            </div>

            {/* Steps */}
            <div className="space-y-4">
                {steps.map((step, index) => (
                    <Card key={index}>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-3 text-lg">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <step.icon className="h-5 w-5 text-primary" />
                                </div>
                                {step.title}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground ml-12">
                                {step.description}
                            </p>
                        </CardHeader>
                        <CardContent className="pt-0 ml-12">
                            <ul className="space-y-1.5">
                                {step.details.map((detail, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                        <span>{detail}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Separator />

            {/* File Format Requirements */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-500" />
                    Expected File Formats
                </h2>
                <div className="grid gap-4">
                    {fileFormatNotes.map((note, index) => (
                        <Card key={index}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">{note.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
                                    {note.columns}
                                </code>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Important Notes */}
            <Card className="border-amber-200 bg-amber-50/50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        Important Notes
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <ul className="space-y-1.5 text-sm">
                        <li>• Column names are case-insensitive and support multiple formats (e.g., &quot;Roll No&quot;, &quot;roll_no&quot;, &quot;rollno&quot;).</li>
                        <li>• &quot;AB&quot; marks are treated as 0 for percentage calculations but displayed as &quot;AB&quot; in reports.</li>
                        <li>• Lab subjects use DTDE (15) + CIE (10) = Total (25) marks structure.</li>
                        <li>• HOD remarks are auto-generated based on attendance %, CIE marks %, and backlog count.</li>
                        <li>• Make sure the Student Info file is uploaded for student names, father names, and backlog data.</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
