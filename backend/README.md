# Recruitment System Backend API

This is the Express.js backend API for the AI-based recruitment system. It provides RESTful endpoints for managing jobs, candidates, interviews, and communication with the AI microservices.

## Features

- Job management: Create, read, update, delete job listings
- Candidate management: Upload and process resumes, track candidate status
- Interview scheduling: Schedule and manage interviews, track feedback
- AI integration: Communicate with Python AI microservices for advanced processing
- Email notifications: Send emails to candidates and HR for interview scheduling

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with the following configuration:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/recruitment-system
AI_SERVICE_URL=http://localhost:8000
NODE_ENV=development
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-password
EMAIL_FROM=recruitment@yourcompany.com
```

3. Make sure MongoDB is running locally or update the MONGODB_URI to point to your MongoDB instance.

4. Start the server:

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

## API Endpoints

### Jobs

- `GET /api/jobs`: Get all jobs
- `GET /api/jobs/:id`: Get a specific job
- `POST /api/jobs`: Create a new job
- `PUT /api/jobs/:id`: Update a job
- `DELETE /api/jobs/:id`: Delete a job

### Candidates

- `GET /api/candidates`: Get all candidates
- `GET /api/candidates/:id`: Get a specific candidate
- `POST /api/candidates`: Upload resume and create candidate
- `POST /api/candidates/:id/match/:jobId`: Match candidate with job
- `PUT /api/candidates/:id`: Update candidate
- `DELETE /api/candidates/:id`: Delete candidate

### Interviews

- `GET /api/interviews`: Get all interviews
- `GET /api/interviews/:id`: Get a specific interview
- `POST /api/interviews`: Schedule an interview
- `GET /api/interviews/slots/available`: Get available interview slots
- `PUT /api/interviews/:id`: Update interview
- `POST /api/interviews/:id/feedback`: Add feedback to interview
- `DELETE /api/interviews/:id`: Delete interview

### AI Services

- `POST /api/ai/parse-resume`: Parse resume
- `POST /api/ai/parse-job`: Parse job description
- `POST /api/ai/match`: Match resume with job
- `POST /api/ai/detect-gaps`: Detect gaps between resume and job
- `POST /api/ai/summarize`: Summarize text
- `POST /api/ai/schedule-slots`: Get available interview slots

## Integration with AI Microservices

This backend communicates with Python FastAPI microservices for AI functionality. Make sure the AI service is running at the URL specified in the `.env` file.

## File Uploads

Resume and job description files are stored in the `uploads` directory:

- Resumes: `uploads/resumes/`
- Job descriptions: `uploads/jobs/`

## Email Notifications

The system sends email notifications for interview scheduling. Configure your email provider details in the `.env` file.
