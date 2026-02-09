"use client";

import { useEffect, useState } from "react";
import { previewApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle } from "lucide-react";

interface SubjectData {
    records: Record<string, unknown>[];
    columns: string[];
    row_count: number;
    is_lab: boolean;
}

export default function PreviewPage() {
    const [data, setData] = useState<{
        subjects: Record<string, SubjectData>;
        total_subjects: number;
        total_students: number;
        all_students: string[];
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await previewApi.getSubjects();
                setData(result);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to load preview data"
                );
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <p className="text-muted-foreground">{error}</p>
                <p className="text-sm text-muted-foreground">
                    Please upload subject files first from the Upload page.
                </p>
            </div>
        );
    }

    if (!data || Object.keys(data.subjects).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No data uploaded yet</p>
                <p className="text-sm text-muted-foreground">
                    Upload subject files to preview data here.
                </p>
            </div>
        );
    }

    const subjects = Object.entries(data.subjects);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Preview Data</h1>
                <p className="text-muted-foreground mt-2">
                    Review uploaded data before generating reports.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Subjects
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.total_subjects}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Students
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.total_students}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Records
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {subjects.reduce((acc, [, s]) => acc + s.row_count, 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Subject Tabs */}
            <Tabs defaultValue={subjects[0]?.[0]} className="w-full">
                <TabsList className="flex-wrap h-auto">
                    {subjects.map(([name, subj]) => (
                        <TabsTrigger key={name} value={name} className="gap-2">
                            {name}
                            {subj.is_lab && (
                                <Badge variant="outline" className="text-xs">
                                    Lab
                                </Badge>
                            )}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {subjects.map(([name, subject]) => (
                    <TabsContent key={name} value={name}>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        {name}
                                        {subject.is_lab && (
                                            <Badge variant="secondary">Laboratory</Badge>
                                        )}
                                    </CardTitle>
                                    <Badge variant="outline">{subject.row_count} records</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                {subject.columns.map((col) => (
                                                    <TableHead key={col} className="whitespace-nowrap">
                                                        {col.replace(/_/g, " ").toUpperCase()}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {subject.records.slice(0, 50).map((record, idx) => (
                                                <TableRow key={idx}>
                                                    {subject.columns.map((col) => (
                                                        <TableCell key={col} className="whitespace-nowrap">
                                                            {String(record[col] ?? "-")}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                {subject.row_count > 50 && (
                                    <p className="text-sm text-muted-foreground mt-4 text-center">
                                        Showing first 50 of {subject.row_count} records
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
