import axios from 'axios';

// API base URL - defaults to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Upload API
export const uploadApi = {
    uploadSubjects: async (files: File[]) => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });
        const response = await api.post('/api/upload/subjects', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    uploadStudentInfo: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/api/upload/student-info', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    getStatus: async () => {
        const response = await api.get('/api/upload/status');
        return response.data;
    },

    clear: async () => {
        const response = await api.delete('/api/upload/clear');
        return response.data;
    },
};

// Preview API
export const previewApi = {
    getSubjects: async () => {
        const response = await api.get('/api/preview/subjects');
        return response.data;
    },

    getStudent: async (rollNo: string) => {
        const response = await api.get(`/api/preview/student/${rollNo}`);
        return response.data;
    },

    updateStudent: async (rollNo: string, data: object) => {
        const response = await api.put(`/api/preview/student/${rollNo}`, data);
        return response.data;
    },

    getBacklog: async () => {
        const response = await api.get('/api/preview/backlog');
        return response.data;
    },
};

// Reports API
export interface ReportConfig {
    students: string[];
    department_name: string;
    report_date: string;
    academic_year: string;
    semester: string;
    attendance_start: string;
    attendance_end: string;
    template: 'Detailed' | 'Compact';
    include_backlog: boolean;
    include_notes: boolean;
}

export const reportsApi = {
    generate: async (config: ReportConfig) => {
        const response = await api.post('/api/reports/generate', config);
        return response.data;
    },

    download: (filename: string) => {
        return `${API_BASE_URL}/api/reports/download/${filename}`;
    },

    downloadZip: () => {
        return `${API_BASE_URL}/api/reports/download-zip`;
    },

    list: async () => {
        const response = await api.get('/api/reports/list');
        return response.data;
    },

    getPreviewHtml: async (rollNo: string) => {
        const response = await api.get(`/api/reports/preview-html/${rollNo}`);
        return response.data;
    },

    clear: async () => {
        const response = await api.delete('/api/reports/clear');
        return response.data;
    },
};
