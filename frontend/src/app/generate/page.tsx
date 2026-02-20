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
    ChevronDown,
    X,
    Package,
    Users,
} from "lucide-react";

export default function GeneratePage() {
    const [config, setConfig] = useState({
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

    const [allStudents, setAllStudents] = useState<string[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
                    const students: string[] = (previewData.all_students || []).map((r: unknown) => String(r));
                    setAllStudents(students);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredStudents = allStudents.filter((s) => {
        const matchesSearch = !searchQuery.trim() || s.toLowerCase().includes(searchQuery.toLowerCase());
        const notSelected = !selectedStudents.includes(s);
        return matchesSearch && notSelected;
    });

    const toggleStudent = (student: string) => {
        if (selectedStudents.includes(student)) {
            setSelectedStudents(selectedStudents.filter((s) => s !== student));
        } else {
            setSelectedStudents([...selectedStudents, student]);
            setSearchQuery("");
        }
    };

    const removeStudent = (student: string) => {
        setSelectedStudents(selectedStudents.filter((s) => s !== student));
    };

    const clearAll = () => {
        setSelectedStudents([]);
        setSearchQuery("");
    };

    const handleGenerate = async () => {
        setGenerating(true);
        setProgress(10);
        setError(null);
        setResult(null);

        try {
            setProgress(30);
            const res = await reportsApi.generate({
                students: selectedStudents.map(String), // empty = all students
                department_name: config.department_name,
                report_date: config.report_date,
                academic_year: config.academic_year,
                semester: config.semester,
                attendance_start: config.attendance_start,
                attendance_end: config.attendance_end,
                template: "Detailed",
                include_backlog: true,
                include_notes: true,
            });
            setProgress(100);
            setResult(res);
        } catch (err: unknown) {
            // Extract detailed error from FastAPI/Axios response
            const axiosErr = err as { response?: { data?: { detail?: unknown } } };
            if (axiosErr?.response?.data?.detail) {
                const detail = axiosErr.response.data.detail;
                if (typeof detail === "string") {
                    setError(detail);
                } else {
                    setError(JSON.stringify(detail, null, 2));
                }
            } else {
                setError(
                    err instanceof Error ? err.message : "Failed to generate reports. Please try again."
                );
            }
        } finally {
            setGenerating(false);
        }
    };

    const studentsToGenerateCount = selectedStudents.length > 0 ? selectedStudents.length : allStudents.length;

    return (
        <div className="space-y-8">
            <div className="text-center space-y-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                    Generate Reports
                </h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    Configure settings and select students to generate professional
                    progress reports.
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

            {status?.has_subjects && (
                <>
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
                        </CardContent>
                    </Card>

                    {/* Student Selection + Generate */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Generate Reports
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="flex flex-col sm:flex-row gap-4 items-start">
                                {/* Multi-select dropdown */}
                                <div className="flex-1 w-full" ref={dropdownRef}>
                                    <Label className="text-sm text-muted-foreground mb-2 block">
                                        Select students (leave empty for all):
                                    </Label>
                                    <div
                                        className="relative min-h-[48px] flex flex-wrap items-center gap-1.5 px-3 py-2 border rounded-lg cursor-text bg-background hover:border-primary/50 transition-colors"
                                        onClick={() => setShowDropdown(true)}
                                    >
                                        {selectedStudents.map((student) => (
                                            <Badge
                                                key={student}
                                                variant="secondary"
                                                className="gap-1 pl-2.5 pr-1 py-1 text-sm"
                                            >
                                                {student}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeStudent(student);
                                                    }}
                                                    className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                        <input
                                            type="text"
                                            className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
                                            placeholder={
                                                selectedStudents.length === 0
                                                    ? "Choose options"
                                                    : "Add more..."
                                            }
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setShowDropdown(true);
                                            }}
                                            onFocus={() => setShowDropdown(true)}
                                        />
                                        <div className="flex items-center gap-1 ml-auto">
                                            {selectedStudents.length > 0 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        clearAll();
                                                    }}
                                                    className="p-1 rounded hover:bg-muted transition-colors"
                                                >
                                                    <X className="h-4 w-4 text-muted-foreground" />
                                                </button>
                                            )}
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>

                                    {/* Dropdown list */}
                                    {showDropdown && (
                                        <Card className="absolute z-50 w-[calc(100%-2rem)] mt-1 max-h-56 overflow-auto shadow-xl border">
                                            {filteredStudents.length > 0 ? (
                                                <div className="p-1">
                                                    {filteredStudents.map((student) => (
                                                        <button
                                                            key={student}
                                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left text-sm"
                                                            onClick={() => toggleStudent(student)}
                                                        >
                                                            <span className="font-mono">{student}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-6 text-center text-sm text-muted-foreground">
                                                    {allStudents.length === selectedStudents.length
                                                        ? "All students selected"
                                                        : "No students match your search"}
                                                </div>
                                            )}
                                        </Card>
                                    )}
                                </div>

                                {/* Generate button */}
                                <div className="sm:pt-7">
                                    <Button
                                        onClick={handleGenerate}
                                        disabled={generating}
                                        className="gap-2 h-12 px-8 text-base whitespace-nowrap"
                                        size="lg"
                                    >
                                        {generating ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <FileText className="h-5 w-5" />
                                        )}
                                        {generating ? "Generating..." : "Generate Reports"}
                                    </Button>
                                </div>
                            </div>

                            {/* Info text */}
                            <p className="text-xs text-muted-foreground">
                                {selectedStudents.length === 0
                                    ? `Will generate reports for all ${allStudents.length} students`
                                    : `Will generate reports for ${selectedStudents.length} selected student${selectedStudents.length > 1 ? "s" : ""}`}
                            </p>

                            {/* Progress */}
                            {generating && (
                                <div className="space-y-3 pt-2">
                                    <Progress value={progress} className="h-2" />
                                    <p className="text-sm text-muted-foreground text-center">
                                        Generating reports for {studentsToGenerateCount} student{studentsToGenerateCount > 1 ? "s" : ""}...
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Results */}
            {result?.success && (
                <Card className="border-green-500/50 bg-green-500/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-6 w-6" />
                            Reports Generated Successfully
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-muted-foreground">
                            Successfully generated reports for {result.total_generated} student{(result.total_generated ?? 0) > 1 ? "s" : ""}.
                        </p>

                        {/* Individual reports */}
                        {result.reports && Object.keys(result.reports).length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Individual Student Reports
                                </h4>
                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {Object.entries(result.reports).map(([roll, info]) => (
                                        <Button
                                            key={roll}
                                            variant="outline"
                                            asChild
                                            className="gap-2 justify-start h-auto py-3 px-4"
                                        >
                                            <a href={reportsApi.download(info.filename)} download>
                                                <Download className="h-4 w-4 flex-shrink-0" />
                                                <div className="text-left min-w-0">
                                                    <p className="font-medium truncate">{info.student_name}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">{roll}</p>
                                                </div>
                                            </a>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Separator />

                        {/* Consolidated + ZIP */}
                        <div className="flex flex-wrap gap-3">
                            {result.consolidated_filename && (
                                <Button asChild className="gap-2 h-12">
                                    <a href={reportsApi.download(result.consolidated_filename)} download>
                                        <Download className="h-5 w-5" />
                                        Download Consolidated Report
                                    </a>
                                </Button>
                            )}
                            <Button variant="outline" asChild className="gap-2 h-12">
                                <a href={reportsApi.downloadZip()} download>
                                    <Package className="h-5 w-5" />
                                    Download All as ZIP
                                </a>
                            </Button>
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
                                <p className="font-medium">Error Generating Reports</p>
                                <p className="text-sm text-muted-foreground">{error}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
