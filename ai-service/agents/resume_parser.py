import re
import spacy
from typing import Dict, Any, List
import nltk
from nltk.tokenize import sent_tokenize

class ResumeParserAgent:
    """Agent for parsing and extracting information from resumes"""
    
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
        Parse resume text and extract structured information
        
        Args:
            text: Raw resume text
            
        Returns:
            Dictionary with extracted information
        """
        # Process text with spaCy
        doc = self.nlp(text)
        
        # Extract basic information
        name = self._extract_name(doc, text)
        email = self._extract_email(text)
        phone = self._extract_phone(text)
        skills = self._extract_skills(doc, text)
        education = self._extract_education(text)
        experience = self._extract_experience(text)
        
        return {
            "name": name,
            "email": email,
            "phone": phone,
            "skills": skills,
            "education": education,
            "experience": experience
        }
    
    def _extract_name(self, doc, text: str) -> str:
        """Extract candidate name from resume"""
        # Method 1: Look for person entities at the beginning
        for ent in doc.ents:
            if ent.label_ == "PERSON" and ent.start < 50:  # Name usually appears at the beginning
                return ent.text
        
        # Method 2: Look for the first line with capitalized words
        lines = text.split('\n')
        for line in lines[:10]:  # Check first 10 lines
            line = line.strip()
            if 2 <= len(line.split()) <= 5:  # Names usually have 2-5 words
                if all(word[0].isupper() for word in line.split() if word):
                    return line
        
        return "Unknown"
    
    def _extract_email(self, text: str) -> str:
        """Extract email address from resume"""
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        return emails[0] if emails else ""
    
    def _extract_phone(self, text: str) -> str:
        """Extract phone number from resume"""
        # Multiple phone patterns
        phone_patterns = [
            r'\b(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b',  # (123) 456-7890, 123-456-7890
            r'\b(\+\d{1,3}[\s-]?)?\d{10,12}\b',  # 1234567890, +11234567890
        ]
        
        for pattern in phone_patterns:
            phones = re.findall(pattern, text)
            if phones:
                return phones[0]
        
        return ""
    
    def _extract_skills(self, doc, text: str) -> List[str]:
        """Extract skills from resume"""
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
        
        # Extract skills from skills section if it exists
        skills_section = self._extract_section(text, ["skills", "technical skills", "technologies"])
        if skills_section:
            # Extract bullet points or comma-separated skills
            additional_skills = re.findall(r'•\s*([^•\n]+)', skills_section)
            if not additional_skills:
                additional_skills = skills_section.split(',')
            
            for skill in additional_skills:
                skill = skill.strip()
                if 2 <= len(skill) <= 30:  # Reasonable skill length
                    found_skills.add(skill)
        
        return sorted(list(found_skills))
    
    def _extract_education(self, text: str) -> List[Dict[str, str]]:
        """Extract education information from resume"""
        education_list = []
        
        # Find education section
        education_section = self._extract_section(text, ["education", "academic background", "academic qualifications"])
        if not education_section:
            return education_list
        
        # Look for degree patterns
        degree_patterns = [
            r'(B\.?S\.?|Bachelor of Science|Bachelor\'?s?)\s+(?:degree\s+)?(?:in\s+)?([^,\n]+)',
            r'(B\.?A\.?|Bachelor of Arts|Bachelor\'?s?)\s+(?:degree\s+)?(?:in\s+)?([^,\n]+)',
            r'(M\.?S\.?|Master of Science|Master\'?s?)\s+(?:degree\s+)?(?:in\s+)?([^,\n]+)',
            r'(M\.?A\.?|Master of Arts|Master\'?s?)\s+(?:degree\s+)?(?:in\s+)?([^,\n]+)',
            r'(Ph\.?D\.?|Doctor of Philosophy|Doctorate)\s+(?:degree\s+)?(?:in\s+)?([^,\n]+)',
            r'(MBA|Master of Business Administration)',
        ]
        
        # Extract university patterns
        uni_pattern = r'(University|College|Institute|School) of ([^,\n]+)'
        
        # Find all sentences in education section
        sentences = sent_tokenize(education_section)
        
        for sentence in sentences:
            education_item = {
                "degree": "",
                "field": "",
                "institution": "",
                "year": ""
            }
            
            # Extract degree and field
            for pattern in degree_patterns:
                matches = re.search(pattern, sentence)
                if matches:
                    education_item["degree"] = matches.group(1)
                    if len(matches.groups()) > 1 and matches.group(2):
                        education_item["field"] = matches.group(2).strip()
                    break
            
            # Extract institution
            uni_matches = re.search(uni_pattern, sentence)
            if uni_matches:
                education_item["institution"] = f"{uni_matches.group(1)} of {uni_matches.group(2)}"
            else:
                # Try another approach to find institution
                for inst_candidate in sentence.split(','):
                    if "university" in inst_candidate.lower() or "college" in inst_candidate.lower():
                        education_item["institution"] = inst_candidate.strip()
                        break
            
            # Extract year
            year_match = re.search(r'(19|20)\d{2}(-|–|—)?(19|20)?\d{0,2}', sentence)
            if year_match:
                education_item["year"] = year_match.group(0)
            
            # Add to list if we have at least degree or institution
            if education_item["degree"] or education_item["institution"]:
                education_list.append(education_item)
        
        return education_list
    
    def _extract_experience(self, text: str) -> List[Dict[str, str]]:
        """Extract work experience information from resume"""
        experience_list = []
        
        # Find experience section
        experience_section = self._extract_section(text, ["experience", "work experience", "professional experience", "employment"])
        if not experience_section:
            return experience_list
        
        # Split into different experiences (look for date patterns as separators)
        exp_blocks = re.split(r'\n(?=(19|20)\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (19|20)\d{2})', experience_section)
        
        for block in exp_blocks:
            if not block.strip():
                continue
                
            lines = block.split('\n')
            if not lines:
                continue
                
            experience_item = {
                "title": "",
                "company": "",
                "duration": "",
                "description": ""
            }
            
            # Extract dates
            date_match = re.search(r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (19|20)\d{2})\s*(-|–|—|to)\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (19|20)\d{2}|Present|Current)', block)
            if date_match:
                experience_item["duration"] = date_match.group(0)
            else:
                # Try year range pattern
                year_match = re.search(r'(19|20)\d{2}\s*(-|–|—|to)\s*((19|20)\d{2}|Present|Current)', block)
                if year_match:
                    experience_item["duration"] = year_match.group(0)
            
            # First line often contains title and company
            first_line = lines[0].strip()
            
            # Try to separate title and company
            if '|' in first_line:
                parts = first_line.split('|')
                experience_item["title"] = parts[0].strip()
                experience_item["company"] = parts[1].strip()
            elif '-' in first_line and not experience_item["duration"] in first_line:
                parts = first_line.split('-')
                experience_item["title"] = parts[0].strip()
                experience_item["company"] = parts[1].strip()
            elif ',' in first_line and not experience_item["duration"] in first_line:
                parts = first_line.split(',')
                experience_item["title"] = parts[0].strip()
                experience_item["company"] = parts[1].strip()
            elif 'at' in first_line.lower():
                parts = first_line.lower().split('at')
                experience_item["title"] = parts[0].replace('at', '').strip()
                experience_item["company"] = parts[1].strip()
            else:
                # Just use the first line as title
                experience_item["title"] = first_line
                
                # Try to find company in second line
                if len(lines) > 1:
                    experience_item["company"] = lines[1].strip()
            
            # Get description (rest of the block)
            description_lines = lines[2:] if len(lines) > 2 else []
            experience_item["description"] = "\n".join(description_lines).strip()
            
            # Add to list if we have at least title or company
            if experience_item["title"] or experience_item["company"]:
                experience_list.append(experience_item)
        
        return experience_list
    
    def _extract_section(self, text: str, section_headers: List[str]) -> str:
        """Extract a specific section from the resume text"""
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
        common_headers = ["education", "experience", "skills", "projects", "certifications", 
                          "publications", "awards", "languages", "interests", "references"]
        
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
