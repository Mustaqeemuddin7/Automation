# LORDS Progress Report System

A modern web application for generating institutional progress reports, rebuilt with Next.js frontend and FastAPI backend.

## Project Structure

```
lords_progress_report/
├── backend/                    # FastAPI Backend
│   ├── main.py                 # FastAPI app entry
│   ├── routes/                 # API endpoints
│   │   ├── upload.py           # File upload
│   │   ├── preview.py          # Data preview/edit
│   │   └── reports.py          # Report generation
│   ├── services/               # Business logic
│   │   ├── config.py           # Column mappings
│   │   ├── utils.py            # Data processing
│   │   └── report_generator.py # Word doc generation
│   ├── assets/                 # Logo images
│   └── requirements.txt        # Python dependencies
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/                # App router pages
│   │   │   ├── page.tsx        # Dashboard
│   │   │   ├── upload/         # Upload files
│   │   │   ├── preview/        # Preview data
│   │   │   ├── edit/           # Edit data
│   │   │   └── generate/       # Generate reports
│   │   ├── components/         # React components
│   │   └── lib/                # API client, utils
│   └── package.json
│
└── [legacy files]              # Original Streamlit app
```

## Quick Start

### 1. Start Backend (FastAPI)

```bash
cd backend

# Create virtual environment (first time)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn main:app --reload --port 8000
```

### 2. Start Frontend (Next.js)

```bash
cd frontend

# Install dependencies (first time)
npm install

# Run development server
npm run dev
```

### 3. Open Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Features

- 📁 **File Upload**: Drag-and-drop Excel files for subjects
- 👀 **Preview Data**: View uploaded data in tables
- ✏️ **Edit Data**: Modify marks and attendance
- 📋 **Generate Reports**: Create Word document reports
- 📦 **Bulk Download**: Download all reports as ZIP

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload/subjects` | POST | Upload subject Excel files |
| `/api/upload/student-info` | POST | Upload student info file |
| `/api/upload/status` | GET | Get upload status |
| `/api/preview/subjects` | GET | Get all subject data |
| `/api/preview/student/{roll}` | GET/PUT | Get/update student |
| `/api/reports/generate` | POST | Generate reports |
| `/api/reports/download/{file}` | GET | Download report |
| `/api/reports/download-zip` | GET | Download all as ZIP |

## Deployment

### Vercel (Frontend)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL=https://your-api.com`

### Backend Options

- **Railway**: Easy Python deployment
- **Render**: Free tier available
- **Cloud Run**: Serverless containers
