from fastapi import FastAPI
from pydantic import BaseModel

# Import try normal agents first, fall back to simple agents if dependencies are missing
try:
    from agents.resume_parser import ResumeParserAgent
    from agents.jd_parser import JDParserAgent
    from agents.matching import MatchingAgent
    from agents.summarization import SummarizationAgent
    from agents.gap_detection import GapDetectionAgent
    from agents.scheduler import SchedulerAgent
    print("Using full AI agents with all dependencies")
except ImportError:
    # If dependencies are missing, use simplified agents
    from agents.simple_agents import (
        SimpleResumeParserAgent as ResumeParserAgent,
        SimpleJDParserAgent as JDParserAgent,
        SimpleMatchingAgent as MatchingAgent,
        SimpleSummarizationAgent as SummarizationAgent,
        SimpleGapDetectionAgent as GapDetectionAgent,
        SimpleSchedulerAgent as SchedulerAgent
    )
    print("Using simplified agents (some dependencies missing)")

# Now you can use these agents in your code
# This helps with development and testing when all dependencies aren't installed
