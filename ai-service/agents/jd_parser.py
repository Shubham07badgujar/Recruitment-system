import re
import spacy
from typing import Dict, Any, List
import nltk
from nltk.tokenize import sent_tokenize

class JDParserAgent:
    """Agent for parsing and extracting information from job descriptions"""
    
    def __init__(self):
        # Download required NLTK data
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')
        
        # Load spaCy model
        try:
            self.nlp = spacy.load("en_core_web_lg")
        except OSError:
            # If model not found, download a smaller one
            spacy.cli.download("en_core_web_sm")
            self.nlp = spacy.load("en_core_web_sm")
    
    def parse(self, text: str) -> Dict[str, Any]:
        """
        Parse job description text and extract structured information
        
        Args:
            text: Raw job description text
            
        Returns:
            Dictionary with extracted information
        """
        # Process text with spaCy
        doc = self.nlp(text)
        
        # Extract information
        title = self._extract_title(text)
        company = self._extract_company(text)
        requirements = self._extract_requirements(text)
        responsibilities = self._extract_responsibilities(text)
        skills = self._extract_skills(doc, text)
        location = self._extract_location(doc, text)
        job_type = self._extract_job_type(text)
        
        return {
            "title": title,
            "company": company,
            "requirements": requirements,
            "responsibilities": responsibilities,
            "skills": skills,
            "location": location,
            "jobType": job_type
        }
    
    def _extract_title(self, text: str) -> str:
        """Extract job title from JD"""
        # Look for patterns like "Job Title:", "Position:", etc.
        title_patterns = [
            r'(?:Job Title|Position|Role):\s*([^\n]+)',
            r'(?:Job Title|Position|Role)\s*-\s*([^\n]+)',
        ]
        
        for pattern in title_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        # If no pattern matches, try first non-empty line
        lines = text.split('\n')
        for line in lines[:5]:  # Check first 5 lines
            line = line.strip()
            if line and len(line) < 100:  # Reasonable title length
                return line
        
        return "Unknown Position"
    
    def _extract_company(self, text: str) -> str:
        """Extract company name from JD"""
        # Look for patterns like "Company:", "About Us:", etc.
        company_patterns = [
            r'(?:Company|Organization):\s*([^\n]+)',
            r'(?:Company|Organization)\s*-\s*([^\n]+)',
            r'About\s+([^:]+):'
        ]
        
        for pattern in company_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        # If no pattern matches, look for company-like entities
        doc = self.nlp(text[:1000])  # Analyze first 1000 chars
        for ent in doc.ents:
            if ent.label_ == "ORG":
                return ent.text
        
        return "Unknown Company"
    
    def _extract_requirements(self, text: str) -> List[str]:
        """Extract job requirements from JD"""
        requirements = []
        
        # Find requirements section
        req_section = self._extract_section(text, [
            "requirements", "qualifications", "what you need", 
            "what we're looking for", "what we require", "minimum requirements"
        ])
        
        if not req_section:
            return requirements
        
        # Extract bullet points
        bullet_points = re.findall(r'(?:•|\*|\-|\d+\.)\s*([^\n•\*\-\d\.]+)', req_section)
        if bullet_points:
            requirements = [bp.strip() for bp in bullet_points if bp.strip()]
        else:
            # If no bullet points, split by sentences
            sentences = sent_tokenize(req_section)
            requirements = [s.strip() for s in sentences if s.strip()]
        
        return requirements
    
    def _extract_responsibilities(self, text: str) -> List[str]:
        """Extract job responsibilities from JD"""
        responsibilities = []
        
        # Find responsibilities section
        resp_section = self._extract_section(text, [
            "responsibilities", "duties", "what you'll do", 
            "job description", "the role", "day-to-day"
        ])
        
        if not resp_section:
            return responsibilities
        
        # Extract bullet points
        bullet_points = re.findall(r'(?:•|\*|\-|\d+\.)\s*([^\n•\*\-\d\.]+)', resp_section)
        if bullet_points:
            responsibilities = [bp.strip() for bp in bullet_points if bp.strip()]
        else:
            # If no bullet points, split by sentences
            sentences = sent_tokenize(resp_section)
            responsibilities = [s.strip() for s in sentences if s.strip()]
        
        return responsibilities
    
    def _extract_skills(self, doc, text: str) -> List[str]:
        """Extract required skills from JD"""
        # Common technical skills
        tech_skills = [
            "Python", "Java", "JavaScript", "C++", "C#", "TypeScript", "PHP", "Go", "Ruby", "Swift", 
            "Kotlin", "React", "Angular", "Vue", "Node.js", "Express", "Django", "Flask", "Spring Boot",
            "SQL", "MongoDB", "PostgreSQL", "MySQL", "Oracle", "AWS", "Azure", "GCP", "Docker", "Kubernetes",
            "Machine Learning", "AI", "Data Science", "DevOps", "CI/CD", "Git", "HTML", "CSS", "TensorFlow",
            "PyTorch", "Scikit-learn", "NLP", "Computer Vision", "REST API", "GraphQL", "Microservices"
        ]
        
        # Extract skills based on known technical terms
        found_skills = set()
        for skill in tech_skills:
            if re.search(r'\b' + re.escape(skill) + r'\b', text, re.IGNORECASE):
                found_skills.add(skill)
        
        # Extract skills from requirements section
        requirements = self._extract_requirements(text)
        for req in requirements:
            req_doc = self.nlp(req)
            for token in req_doc:
                if token.pos_ == "NOUN" and len(token.text) > 2:
                    # Check if it's likely a skill
                    if token.text[0].isupper() or "experience with" in req.lower() or "knowledge of" in req.lower():
                        found_skills.add(token.text)
        
        return sorted(list(found_skills))
    
    def _extract_location(self, doc, text: str) -> str:
        """Extract job location from JD"""
        # Look for patterns like "Location:", etc.
        location_patterns = [
            r'(?:Location|Place):\s*([^\n]+)',
            r'(?:Location|Place)\s*-\s*([^\n]+)',
            r'(?:located|based) in\s+([^\.]+)'
        ]
        
        for pattern in location_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        # Look for GPE (GeoPolitical Entity) in the text
        for ent in doc.ents:
            if ent.label_ == "GPE":
                return ent.text
        
        # Look for "remote" keyword
        if re.search(r'\b(?:remote|work from home|wfh)\b', text, re.IGNORECASE):
            return "Remote"
        
        return "Not specified"
    
    def _extract_job_type(self, text: str) -> str:
        """Extract job type from JD"""
        job_types = {
            "full-time": ["full-time", "full time", "permanent", "regular"],
            "part-time": ["part-time", "part time"],
            "contract": ["contract", "temporary", "contractor"],
            "internship": ["internship", "intern"]
        }
        
        lower_text = text.lower()
        
        for job_type, keywords in job_types.items():
            for keyword in keywords:
                if re.search(r'\b' + re.escape(keyword) + r'\b', lower_text):
                    return job_type.capitalize()
        
        # Default to full-time
        return "Full-time"
    
    def _extract_section(self, text: str, section_headers: List[str]) -> str:
        """Extract a specific section from the JD text"""
        lines = text.split('\n')
        start_index = -1
        end_index = -1
        
        # Find the start of the section
        for i, line in enumerate(lines):
            if any(header.lower() in line.lower() for header in section_headers):
                start_index = i
                break
        
        if start_index == -1:
            return ""
        
        # Find the end of the section (next section header)
        common_headers = ["requirements", "responsibilities", "qualifications", "about", 
                         "benefits", "company", "what we offer", "apply"]
        
        for i in range(start_index + 1, len(lines)):
            line = lines[i].strip().lower()
            # Check if line is a header (all caps, ends with colon, etc.)
            is_header = (line.isupper() or line.endswith(':')) and len(line) > 0
            
            # Check if line matches a common header
            if is_header and any(header.lower() in line for header in common_headers if header.lower() not in section_headers):
                end_index = i
                break
        
        # If no end found, use the end of the document
        if end_index == -1:
            end_index = len(lines)
        
        # Extract the section content
        section_content = "\n".join(lines[start_index+1:end_index]).strip()
        return section_content
