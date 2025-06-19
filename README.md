# AI-Based Recruitment System

A comprehensive, multi-agent AI-based recruitment system for automating and enhancing the hiring process. This system handles job descriptions, resumes, candidate matching, interview scheduling, and notifications.

## Architecture

The system consists of three main components:

1. **Express Backend (Node.js)**: Web layer for handling API requests, file uploads, database operations, and email notifications.

2. **AI Microservices (Python/FastAPI)**: Specialized AI agents for resume parsing, job description analysis, matching, summarization, gap detection, and scheduling.

3. **Frontend (React/Vite)**: User interface for HR professionals and recruiters to interact with the system.

## Features

### Express Backend

- RESTful APIs for job and candidate management
- Resume and job description upload and storage
- Interview scheduling and feedback
- Email notifications for candidates and HR
- MongoDB database integration

### AI Microservices

- **Resume Parser Agent**: Extracts structured data from resumes using NLP
- **JD Parser Agent**: Analyzes job descriptions to extract requirements and responsibilities
- **Matching Agent**: Calculates match scores between resumes and job descriptions
- **Summarization Agent**: Creates concise summaries of resumes and job descriptions
- **Gap Detection Agent**: Identifies missing skills and qualifications
- **Interview Scheduler Agent**: Generates available interview slots

### Frontend

- Dashboard for viewing jobs, candidates, and matches
- Resume upload and processing
- Job description management
- Interview scheduling interface
- Match visualization

## Getting Started

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- MongoDB
- npm or yarn

### Setup and Installation

1. **Clone the repository**:

```bash
git clone https://github.com/yourusername/recruitment-system.git
cd recruitment-system
```

2. **Set up the Express backend**:

```bash
cd backend
npm install
# Create .env file with configuration (see backend/README.md)
npm run dev
```

3. **Set up the AI microservices**:

```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

4. **Set up the frontend**:

```bash
cd frontend
npm install
npm run dev
```

## System Flow

1. HR uploads job descriptions and candidate resumes
2. AI agents parse and extract structured data
3. Matching algorithm compares resumes with job requirements
4. System identifies gaps in candidate qualifications
5. HR schedules interviews with matched candidates
6. Email notifications are sent to candidates
7. HR records interview feedback

## Future Enhancements

- Integration with applicant tracking systems
- Advanced analytics and reporting
- Custom interview question generation
- Video interview integration
- Candidate recommendation engine

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Express.js, FastAPI, React, and MongoDB
- Uses spaCy, Sentence-BERT, and HuggingFace Transformers for NLP
- Special thanks to all contributors and maintainers
