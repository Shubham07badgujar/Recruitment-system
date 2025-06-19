from fastapi import FastAPI
from pydantic import BaseModel
import time

class SimpleResumeParserAgent:
    """Simplified agent for parsing resumes (for testing)"""
    
    def parse(self, content: str):
        """Parse resume text (simplified for testing)"""
        # In a real implementation, this would use NLP to extract information
        lines = content.split('\n')
        
        # Simple extraction logic for demo purposes
        name = lines[0] if lines else "Unknown"
        email = "candidate@example.com"
        skills = ["Python", "JavaScript", "Communication"]
        
        return {
            "name": name,
            "email": email,
            "phone": "555-123-4567",
            "skills": skills,
            "education": [
                {"degree": "Bachelor's", "field": "Computer Science", "institution": "Example University", "year": "2020"}
            ],
            "experience": [
                {
                    "title": "Software Developer",
                    "company": "Tech Company",
                    "duration": "2020-2022",
                    "description": "Developed web applications using modern frameworks"
                }
            ]
        }

class SimpleJDParserAgent:
    """Simplified agent for parsing job descriptions (for testing)"""
    
    def parse(self, content: str):
        """Parse job description text (simplified for testing)"""
        # In a real implementation, this would use NLP to extract information
        lines = content.split('\n')
        
        # Simple extraction logic for demo purposes
        title = lines[0] if lines else "Software Developer"
        
        return {
            "title": title,
            "company": "Example Corp",
            "requirements": [
                "Bachelor's degree in Computer Science or related field",
                "3+ years of experience in software development",
                "Proficiency in Python and JavaScript"
            ],
            "responsibilities": [
                "Develop and maintain web applications",
                "Collaborate with cross-functional teams",
                "Write clean, maintainable code"
            ],
            "skills": ["Python", "JavaScript", "React", "Node.js"],
            "location": "Remote",
            "jobType": "Full-time"
        }

class SimpleMatchingAgent:
    """Simplified agent for matching resumes with job descriptions (for testing)"""
    
    def match(self, resume, job):
        """Match resume with job (simplified for testing)"""
        # In a real implementation, this would use embedding similarity
        
        # Count matching skills
        resume_skills = set([s.lower() for s in resume.get("skills", [])])
        job_skills = set([s.lower() for s in job.get("skills", [])])
        
        matching_skills = resume_skills.intersection(job_skills)
        
        # Calculate simple score
        if not job_skills:
            score = 0.5  # Default score if no skills in job
        else:
            score = len(matching_skills) / len(job_skills)
        
        return {
            "score": score,
            "skillsScore": score,
            "experienceScore": 0.5,  # Placeholder
            "requirementsScore": 0.5  # Placeholder
        }

class SimpleSummarizationAgent:
    """Simplified agent for summarizing text (for testing)"""
    
    def summarize(self, content: str, type: str = "general"):
        """Summarize text (simplified for testing)"""
        # In a real implementation, this would use a transformer model
        
        # Just return first 100 chars + type for demo
        prefix = "Summary: "
        if type == "resume":
            prefix = "Professional Summary: "
        elif type == "job":
            prefix = "Job Overview: "
            
        summary = content[:100] + "..." if len(content) > 100 else content
        return prefix + summary

class SimpleGapDetectionAgent:
    """Simplified agent for detecting gaps (for testing)"""
    
    def detect(self, resume, job):
        """Detect gaps (simplified for testing)"""
        # In a real implementation, this would compare requirements and skills
        
        # Find missing skills
        resume_skills = set([s.lower() for s in resume.get("skills", [])])
        job_skills = set([s.lower() for s in job.get("skills", [])])
        
        missing_skills = [s for s in job.get("skills", []) if s.lower() not in resume_skills]
        
        # Simple gap detection in requirements
        missing_requirements = []
        if "requirements" in job:
            # Just take first requirement for demo
            if len(job["requirements"]) > 0:
                missing_requirements.append(job["requirements"][0])
        
        return {
            "gaps": missing_skills + missing_requirements,
            "missingSkills": missing_skills,
            "missingRequirements": missing_requirements
        }

class SimpleSchedulerAgent:
    """Simplified agent for scheduling (for testing)"""
    
    def get_slots(self, existing_slots=None, preferences=None):
        """Get available slots (simplified for testing)"""
        # In a real implementation, this would calculate actual available times
        
        # Generate 5 slots for demo
        slots = []
        current_time = int(time.time())
        
        for i in range(5):
            # Add slots for next 5 days at 10 AM
            slot_time = current_time + (i + 1) * 86400  # Add days in seconds
            slot_time_str = time.strftime("%Y-%m-%dT10:00:00-04:00", time.localtime(slot_time))
            end_time_str = time.strftime("%Y-%m-%dT11:00:00-04:00", time.localtime(slot_time))
            
            slots.append({
                "startTime": slot_time_str,
                "endTime": end_time_str,
                "duration": 60
            })
        
        return {
            "availableSlots": slots,
            "timezone": "America/New_York"
        }

# Initialize simplified agents (for testing without dependencies)
resume_parser = SimpleResumeParserAgent()
jd_parser = SimpleJDParserAgent()
matching_agent = SimpleMatchingAgent()
summarization_agent = SimpleSummarizationAgent()
gap_detection_agent = SimpleGapDetectionAgent()
scheduler_agent = SimpleSchedulerAgent()
