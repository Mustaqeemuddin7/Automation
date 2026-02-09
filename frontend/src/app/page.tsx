"use client";

import { useEffect, useState } from "react";
import { FileSpreadsheet, Users, FileText, CheckCircle, Upload, ArrowRight, Sparkles, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { uploadApi } from "@/lib/api";

export default function Home() {
  const [status, setStatus] = useState<{
    has_subjects: boolean;
    has_backlog: boolean;
    subjects: string[];
    total_students: number;
    ready_to_generate: boolean;
  } | null>(null);

  useEffect(() => {
    uploadApi.getStatus().then(setStatus).catch(console.error);
  }, []);

  return (
    <div className="space-y-10">
      <div className="text-center py-20 space-y-8 relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/25 rounded-full blur-[120px] animate-pulse" />
        </div>

        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm text-primary font-medium">Student Progress Reports</span>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">LORDS Institute</span>
          </h1>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Report System</h2>
        </div>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Generate professional institutional progress reports with attendance, marks, and student data.</p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
          <Link href="/upload">
            <Button size="lg" className="gap-2 h-14 px-8">
              <Upload className="h-5 w-5" />
              Upload Files
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/generate">
            <Button size="lg" variant="outline" className="gap-2 h-14 px-8">
              <FileText className="h-5 w-5" />
              Generate Reports
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <FileSpreadsheet className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{status?.subjects?.length ?? 0}</div>
            <p className="text-sm text-muted-foreground mt-1">Files uploaded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{status?.total_students ?? 0}</div>
            <p className="text-sm text-muted-foreground mt-1">Ready for reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Student Info</CardTitle>
            <GraduationCap className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <Badge variant={status?.has_backlog ? "default" : "secondary"} className={status?.has_backlog ? "bg-green-600" : ""}>
              {status?.has_backlog ? "Uploaded" : "Not Uploaded"}
            </Badge>
            <p className="text-sm text-muted-foreground mt-2">Optional backlog data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <Badge variant={status?.ready_to_generate ? "default" : "destructive"} className={status?.ready_to_generate ? "bg-green-600" : ""}>
              {status?.ready_to_generate ? "Ready" : "Not Ready"}
            </Badge>
            <p className="text-sm text-muted-foreground mt-2">For report generation</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/upload" className="block group">
          <Card className="h-full">
            <CardHeader>
              <div className="p-3 w-fit rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                <Upload className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="mt-4 text-xl">Upload Files</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Upload subject Excel files and student information.</p>
              <div className="flex items-center text-primary font-medium">Get Started <ArrowRight className="h-4 w-4 ml-1" /></div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/preview" className="block group">
          <Card className="h-full">
            <CardHeader>
              <div className="p-3 w-fit rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5">
                <FileSpreadsheet className="h-7 w-7 text-blue-500" />
              </div>
              <CardTitle className="mt-4 text-xl">Preview Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">View and verify uploaded data before generating.</p>
              <div className="flex items-center text-blue-500 font-medium">View Data <ArrowRight className="h-4 w-4 ml-1" /></div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/edit" className="block group">
          <Card className="h-full">
            <CardHeader>
              <div className="p-3 w-fit rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5">
                <Users className="h-7 w-7 text-purple-500" />
              </div>
              <CardTitle className="mt-4 text-xl">Edit Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Make corrections to student marks and attendance.</p>
              <div className="flex items-center text-purple-500 font-medium">Edit Records <ArrowRight className="h-4 w-4 ml-1" /></div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/generate" className="block group">
          <Card className="h-full">
            <CardHeader>
              <div className="p-3 w-fit rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5">
                <FileText className="h-7 w-7 text-green-500" />
              </div>
              <CardTitle className="mt-4 text-xl">Generate Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Create Word document progress reports.</p>
              <div className="flex items-center text-green-500 font-medium">Generate <ArrowRight className="h-4 w-4 ml-1" /></div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {status?.subjects && status.subjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Uploaded Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {status.subjects.map((subject) => (
                <Badge key={subject} variant="outline" className="text-sm py-2 px-4">{subject}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
