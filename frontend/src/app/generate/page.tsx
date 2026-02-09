"use client";

import { useState, useEffect, useRef } from "react";
import { reportsApi, uploadApi, previewApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Loader2,
    FileText,
    Download,
    CheckCircle2,
    AlertCircle,
    Settings,
    Search,
    User,
    X,
} from "lucide-react";

interface StudentInfo {
    roll_no: string;
    student_name?: string;
}

export default function GeneratePage() {
    const [config, setConfig] = useState({
        student: null as StudentInfo | null,
        department_name: "Computer Science",
        report_date: new Date().toLocaleDateString("en-GB").replace(/\//g, "."),
        academic_year: "2024-2025",
        semester: "B.E- IV Semester",
        attendance_start: "",
        attendance_end: "",
    });

    const [status, setStatus] = useState<{
        has_subjects: boolean;
        total_students: number;
        subjects: string[];
    } | null>(null);

    const [allStudents, setAllStudents] = useState<StudentInfo[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredStudents, setFilteredStudents] = useState<StudentInfo[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<{
        success: boolean;
        reports?: Record<string, { filename: string; student_name: string }>;
        consolidated_filename?: string;
        total_generated?: number;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statusData = await uploadApi.getStatus();
                setStatus(statusData);

                if (statusData.has_subjects) {
                    const previewData = await previewApi.getSubjects();
                    const students = (previewData.all_students || []).map((roll: string) => ({
                        roll_no: roll,
                        student_name: `Student ${roll}`,
                    }));
                    setAllStudents(students);
                    setFilteredStudents(students);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    // Filter students based on search
    useEffect(() => {
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const filtered = allStudents.filter(
                (s) =>
                    s.roll_no.toLowerCase().includes(query) ||
                    s.student_name?.toLowerCase().includes(query)
            );
            setFilteredStudents(filtered);
        } else {
            setFilteredStudents(allStudents);
        }
    }, [searchQuery, allStudents]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectStudent = (student: StudentInfo) => {
        setConfig({ ...config, student });
        setSearchQuery("");
        setShowDropdown(false);
    };

    const clearStudent = () => {
        setConfig({ ...config, student: null });
        setSearchQuery("");
    };

    const handleGenerate = async () => {
        if (!config.student) {
            setError("Please select a student before generating the report.");
            return;
        }

        setGenerating(true);
        setProgress(10);
        setError(null);
        setResult(null);

        try {
            setProgress(30);
            const res = await reportsApi.generate({
                students: [config.student.roll_no],
                department_name: config.department_name,
                report_date: config.report_date,
                academic_year: config.academic_year,
                semester: config.semester,
                attendance_start: config.attendance_start,
                attendance_end: config.attendance_end,
                template: "Detailed",
                include_backlog: false,
                include_notes: false,
            });
            setProgress(100);
            setResult(res);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to generate report. Please try again."
            );
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center space-y-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                    Generate Report
                </h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    Select a student and configure the report settings to generate a
                    professional progress report.
                </p>
            </div>

            {/* Status Check */}
            {!status?.has_subjects && (
                <Card className="border-yellow-500/50 bg-yellow-500/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 text-yellow-600">
                            <AlertCircle className="h-6 w-6" />
                            <div>
                                <p className="font-medium">No Data Available</p>
                                <p className="text-sm text-muted-foreground">
                                    Please upload subject files from the Upload page first.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Student Selection */}
            {status?.has_subjects && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Select Student
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Search and select a student by name or roll number
                        </p>
                    </CardHeader>
                    <CardContent>
                        {config.student ? (
                            <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{config.student.student_name}</p>
                                        <p className="text-sm text-muted-foreground font-mono">
                                            {config.student.roll_no}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={clearStudent}
                                    className="text-muted-foreground hover:text-destructive"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        ) : (
                            <div ref={searchRef} className="relative">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by student name or roll number..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setShowDropdown(true);
                                        }}
                                        onFocus={() => setShowDropdown(true)}
                                        className="pl-11 h-12 text-base"
                                    />
                                </div>

                                {showDropdown && (
                                    <Card className="absolute z-50 w-full mt-2 max-h-64 overflow-auto shadow-xl border">
                                        {filteredStudents.length > 0 ? (
                                            <div className="p-1">
                                                {filteredStudents.map((student) => (
                                                    <button
                                                        key={student.roll_no}
                                                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                                                        onClick={() => selectStudent(student)}
                                                    >
                                                        <div className="p-1.5 bg-muted rounded-full">
                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium truncate">
                                                                {student.student_name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground font-mono">
                                                                {student.roll_no}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center text-muted-foreground">
                                                <p>No students match your search</p>
                                            </div>
                                        )}
                                    </Card>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Configuration Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-primary" />
                        Report Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Department Name</Label>
                            <Input
                                value={config.department_name}
                                onChange={(e) =>
                                    setConfig({ ...config, department_name: e.target.value })
                                }
                                placeholder="e.g., Computer Science"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Report Date</Label>
                            <Input
                                value={config.report_date}
                                onChange={(e) =>
                                    setConfig({ ...config, report_date: e.target.value })
                                }
                                placeholder="DD.MM.YYYY"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Academic Year</Label>
                            <Input
                                value={config.academic_year}
                                onChange={(e) =>
                                    setConfig({ ...config, academic_year: e.target.value })
                                }
                                placeholder="e.g., 2024-2025"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Semester</Label>
                            <Input
                                value={config.semester}
                                onChange={(e) =>
                                    setConfig({ ...config, semester: e.target.value })
                                }
                                placeholder="e.g., B.E- IV Semester"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Attendance Start Date</Label>
                            <Input
                                value={config.attendance_start}
                                onChange={(e) =>
                                    setConfig({ ...config, attendance_start: e.target.value })
                                }
                                placeholder="DD.MM.YYYY (optional)"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Attendance End Date</Label>
                            <Input
                                value={config.attendance_end}
                                onChange={(e) =>
                                    setConfig({ ...config, attendance_end: e.target.value })
                                }
                                placeholder="DD.MM.YYYY (optional)"
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Generate Button */}
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Button
                            onClick={handleGenerate}
                            disabled={generating || !status?.has_subjects || !config.student}
                            className="gap-2 h-12 px-8 text-base w-full sm:w-auto"
                            size="lg"
                        >
                            {generating ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <FileText className="h-5 w-5" />
                            )}
                            {generating ? "Generating Report..." : "Generate Report"}
                        </Button>
                        {!config.student && status?.has_subjects && (
                            <p className="text-sm text-muted-foreground">
                                Select a student above to generate their report
                            </p>
                        )}
                    </div>

                    {/* Progress */}
                    {generating && (
                        <div className="space-y-3 pt-2">
                            <Progress value={progress} className="h-2" />
                            <p className="text-sm text-muted-foreground text-center">
                                Creating progress report for {config.student?.student_name}...
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Results */}
            {result?.success && (
                <Card className="border-green-500/50 bg-green-500/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-6 w-6" />
                            Report Generated Successfully
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            The progress report has been generated and is ready to download.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            {result.reports &&
                                Object.entries(result.reports).map(([roll, info]) => (
                                    <Button key={roll} asChild className="gap-2 h-12">
                                        <a href={reportsApi.download(info.filename)} download>
                                            <Download className="h-5 w-5" />
                                            Download Report - {info.student_name}
                                        </a>
                                    </Button>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Error */}
            {error && (
                <Card className="border-destructive bg-destructive/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 text-destructive">
                            <AlertCircle className="h-6 w-6 flex-shrink-0" />
                            <div>
                                <p className="font-medium">Error Generating Report</p>
                                <p className="text-sm text-muted-foreground">{error}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
