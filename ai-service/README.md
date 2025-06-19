# FastAPI AI Microservices

This directory contains the AI microservices for the recruitment system, built with FastAPI and Python.

## Features

- Resume Parser Agent: Extracts structured information from resumes
- Job Description Parser Agent: Extracts structured information from job descriptions
- Matching Agent: Matches resumes with job descriptions
- Summarization Agent: Generates concise summaries of resumes and job descriptions
- Gap Detection Agent: Identifies gaps between candidate skills and job requirements
- Interview Scheduler Agent: Generates available interview slots

## Setup

1. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Download required models (optional - will download automatically on first run):

```bash
python -m spacy download en_core_web_sm
```

## Running the service

Start the FastAPI server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `/parse-resume`: Parse and extract information from a resume
- `/parse-job`: Parse and extract information from a job description
- `/match`: Match a resume with a job description
- `/summarize`: Generate a summary of text content
- `/detect-gaps`: Identify gaps between a resume and job requirements
- `/schedule-slots`: Generate available interview slots

## Documentation

API documentation is available at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Using Simplified Agents

If you're missing some dependencies or want to quickly test the API without installing all ML models, the system will automatically fall back to simplified agents with basic functionality.
