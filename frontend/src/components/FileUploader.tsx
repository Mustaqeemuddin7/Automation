"use client";

import React, { useState, useCallback } from "react";
import { Upload, X, File, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface FileUploaderProps {
    title: string;
    description: string;
    accept?: string;
    multiple?: boolean;
    onUpload: (files: File[]) => Promise<void>;
    maxFiles?: number;
}

export function FileUploader({
    title,
    description,
    accept = ".xlsx,.xls",
    multiple = true,
    onUpload,
    maxFiles = 20,
}: FileUploaderProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [error, setError] = useState<string | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
                file.name.match(/\.(xlsx|xls)$/i)
            );
            if (droppedFiles.length > 0) {
                setFiles((prev) => [...prev, ...droppedFiles].slice(0, maxFiles));
                setStatus("idle");
                setError(null);
            }
        },
        [maxFiles]
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFiles = Array.from(e.target.files || []);
            if (selectedFiles.length > 0) {
                setFiles((prev) => [...prev, ...selectedFiles].slice(0, maxFiles));
                setStatus("idle");
                setError(null);
            }
        },
        [maxFiles]
    );

    const removeFile = useCallback((index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        setUploadProgress(10);
        setError(null);

        try {
            setUploadProgress(50);
            await onUpload(files);
            setUploadProgress(100);
            setStatus("success");
            setTimeout(() => {
                setFiles([]);
            }, 1500);
        } catch (err) {
            setStatus("error");
            setError(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    {title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardHeader>
            <CardContent>
                {/* Drop Zone */}
                <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="relative border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                >
                    <input
                        type="file"
                        accept={accept}
                        multiple={multiple}
                        onChange={handleFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                        Drag and drop Excel files here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                        Accepts .xlsx and .xls files (max {maxFiles} files)
                    </p>
                </div>

                {/* File List */}
                {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                                {files.length} file(s) selected
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setFiles([])}
                                disabled={uploading}
                            >
                                Clear All
                            </Button>
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                            {files.map((file, index) => (
                                <div
                                    key={`${file.name}-${index}`}
                                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                                >
                                    <div className="flex items-center gap-2">
                                        <File className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm truncate max-w-xs">
                                            {file.name}
                                        </span>
                                        <Badge variant="outline" className="text-xs">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </Badge>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeFile(index)}
                                        disabled={uploading}
                                        className="h-6 w-6"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Upload Progress */}
                {uploading && (
                    <div className="mt-4 space-y-2">
                        <Progress value={uploadProgress} />
                        <p className="text-sm text-muted-foreground text-center">
                            Uploading...
                        </p>
                    </div>
                )}

                {/* Status Messages */}
                {status === "success" && (
                    <div className="mt-4 flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-sm">Upload successful!</span>
                    </div>
                )}
                {status === "error" && error && (
                    <div className="mt-4 flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {/* Upload Button */}
                <Button
                    onClick={handleUpload}
                    disabled={files.length === 0 || uploading}
                    className="w-full mt-4"
                >
                    {uploading ? "Uploading..." : `Upload ${files.length} File(s)`}
                </Button>
            </CardContent>
        </Card>
    );
}
