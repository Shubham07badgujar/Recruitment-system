from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# Import agents
from agents.resume_parser import ResumeParserAgent
from agents.jd_parser import JDParserAgent
from agents.matching import MatchingAgent
from agents.summarization import SummarizationAgent
from agents.gap_detection import GapDetectionAgent
from agents.scheduler import SchedulerAgent

# Create FastAPI app
app = FastAPI(
    title="AI Recruitment Service",
    description="AI Microservices for Recruitment System",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agents
resume_parser = ResumeParserAgent()
jd_parser = JDParserAgent()
matching_agent = MatchingAgent()
summarization_agent = SummarizationAgent()
gap_detection_agent = GapDetectionAgent()
scheduler_agent = SchedulerAgent()

# Models
class ContentRequest(BaseModel):
    content: str
    type: Optional[str] = "general"

class MatchRequest(BaseModel):
    resume: Dict[str, Any]
    job: Dict[str, Any]

class ScheduleRequest(BaseModel):
    existingSlots: Optional[List[Dict[str, Any]]] = []
    preferences: Optional[Dict[str, Any]] = None

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "AI Recruitment Service API", "status": "running"}

@app.post("/parse-resume")
async def parse_resume(request: ContentRequest):
    """Parse resume text and extract structured information"""
    try:
        result = resume_parser.parse(request.content)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing resume: {str(e)}")

@app.post("/parse-job")
async def parse_job(request: ContentRequest):
    """Parse job description text and extract structured information"""
    try:
        result = jd_parser.parse(request.content)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing job description: {str(e)}")

@app.post("/match")
async def match(request: MatchRequest):
    """Match resume with job description and return match score"""
    try:
        result = matching_agent.match(request.resume, request.job)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error matching resume with job: {str(e)}")

@app.post("/summarize")
async def summarize(request: ContentRequest):
    """Summarize text content"""
    try:
        result = summarization_agent.summarize(request.content, request.type)
        return {"summary": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error summarizing content: {str(e)}")

@app.post("/detect-gaps")
async def detect_gaps(request: MatchRequest):
    """Detect gaps between resume and job requirements"""
    try:
        result = gap_detection_agent.detect(request.resume, request.job)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error detecting gaps: {str(e)}")

@app.post("/schedule-slots")
async def schedule_slots(request: ScheduleRequest):
    """Get available interview slots"""
    try:
        result = scheduler_agent.get_slots(request.existingSlots, request.preferences)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scheduling slots: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
