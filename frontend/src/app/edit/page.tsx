"use client";

import { useEffect, useState } from "react";
import { previewApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Save, AlertCircle, CheckCircle2, User, Search } from "lucide-react";

interface StudentData {
    roll_no: string;
    student_name: string;
    father_name: string;
    subjects: {
        subject_name: string;
        dt_marks: number;
        st_marks: number;
        at_marks: number;
        total_marks: number;
        attendance_conducted: number;
        attendance_present: number;
        is_lab: boolean;
    }[];
}

export default function EditPage() {
    const [students, setStudents] = useState<string[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<string>("");
    const [studentData, setStudentData] = useState<StudentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingStudent, setLoadingStudent] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoading(true);
                const result = await previewApi.getSubjects();
                const studentList = result.all_students || [];
                setStudents(studentList);
                setFilteredStudents(studentList);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load students");
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = students.filter((s) =>
                s.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredStudents(filtered);
        } else {
            setFilteredStudents(students);
        }
    }, [searchQuery, students]);

    const handleSelectStudent = async (rollNo: string) => {
        setSelectedStudent(rollNo);
        setStudentData(null);
        setError(null);
        setLoadingStudent(true);
        try {
            const data = await previewApi.getStudent(rollNo);
            setStudentData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load student data");
        } finally {
            setLoadingStudent(false);
        }
    };

    const handleSubjectChange = (index: number, field: string, value: string) => {
        if (!studentData) return;
        const numValue = parseInt(value) || 0;
        const updated = { ...studentData };
        updated.subjects = updated.subjects.map((s, i) =>
            i === index ? { ...s, [field]: numValue } : s
        );
        setStudentData(updated);
    };

    const handleSave = async () => {
        if (!studentData) return;
        setSaving(true);
        setError(null);
        setSuccess(false);
        try {
            await previewApi.updateStudent(studentData.roll_no, {
                student_name: studentData.student_name,
                subjects: studentData.subjects.map((s) => ({
                    subject_name: s.subject_name,
                    dt_marks: s.dt_marks,
                    st_marks: s.st_marks,
                    at_marks: s.at_marks,
                    total_marks: s.total_marks,
                    attendance_conducted: s.attendance_conducted,
                    attendance_present: s.attendance_present,
                })),
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (students.length === 0 && !error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold">No Students Found</h2>
                <p className="text-muted-foreground">Upload subject files first.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-primary">Edit Student Data</h1>
                <p className="text-muted-foreground">Modify student marks and attendance.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Select Student
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <ScrollArea className="h-[300px]">
                            <div className="space-y-1 pr-3">
                                {filteredStudents.map((student) => (
                                    <Button
                                        key={student}
                                        variant={selectedStudent === student ? "default" : "ghost"}
                                        size="sm"
                                        className="w-full justify-start font-mono"
                                        onClick={() => handleSelectStudent(student)}
                                    >
                                        {student}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    {!selectedStudent && (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <User className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">Select a student from the list</p>
                            </CardContent>
                        </Card>
                    )}

                    {loadingStudent && (
                        <Card>
                            <CardContent className="flex items-center justify-center py-16">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </CardContent>
                        </Card>
                    )}

                    {studentData && !loadingStudent && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    <CardTitle className="flex items-center gap-2">
                                        {studentData.student_name}
                                        <Badge variant="outline">{studentData.roll_no}</Badge>
                                    </CardTitle>
                                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        Save
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {studentData.subjects.map((subject, index) => (
                                    <div key={subject.subject_name}>
                                        <h4 className="font-medium mb-3">{subject.subject_name}</h4>
                                        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs">Conducted</Label>
                                                <Input type="number" value={subject.attendance_conducted} onChange={(e) => handleSubjectChange(index, "attendance_conducted", e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">Attended</Label>
                                                <Input type="number" value={subject.attendance_present} onChange={(e) => handleSubjectChange(index, "attendance_present", e.target.value)} />
                                            </div>
                                            {!subject.is_lab && (
                                                <>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">DT</Label>
                                                        <Input type="number" value={subject.dt_marks} onChange={(e) => handleSubjectChange(index, "dt_marks", e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">ST</Label>
                                                        <Input type="number" value={subject.st_marks} onChange={(e) => handleSubjectChange(index, "st_marks", e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">AT</Label>
                                                        <Input type="number" value={subject.at_marks} onChange={(e) => handleSubjectChange(index, "at_marks", e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">Total</Label>
                                                        <Input type="number" value={subject.total_marks} onChange={(e) => handleSubjectChange(index, "total_marks", e.target.value)} />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        {index < studentData.subjects.length - 1 && <Separator className="mt-6" />}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {error && (
                        <Card className="border-destructive/50">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 text-destructive">
                                    <AlertCircle className="h-5 w-5" />
                                    <span>{error}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
