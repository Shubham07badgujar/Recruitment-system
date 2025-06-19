from sentence_transformers import SentenceTransformer, util
from typing import Dict, Any, List
import numpy as np

class MatchingAgent:
    """Agent for matching resumes with job descriptions"""
    
    def __init__(self):
        # Load pre-trained Sentence-BERT model
        try:
            self.model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
        except:
            # Fallback to simpler model if needed
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
    
    def match(self, resume: Dict[str, Any], job: Dict[str, Any]) -> Dict[str, Any]:
        """
        Match resume with job description and return match score
        
        Args:
            resume: Parsed resume data
            job: Parsed job description data
            
        Returns:
            Dictionary with match results
        """
        # Extract relevant data for matching
        resume_skills = resume.get('skills', [])
        job_skills = job.get('skills', [])
        
        resume_experience = resume.get('experience', [])
        job_responsibilities = job.get('responsibilities', [])
        
        job_requirements = job.get('requirements', [])
        
        # Calculate skills match
        skills_score = self._calculate_skills_match(resume_skills, job_skills)
        
        # Calculate experience match
        experience_score = self._calculate_experience_match(resume_experience, job_responsibilities)
        
        # Calculate requirements match
        requirements_score = self._calculate_requirements_match(resume, job_requirements)
        
        # Calculate overall match score (weighted average)
        overall_score = (
            skills_score * 0.5 +
            experience_score * 0.3 +
            requirements_score * 0.2
        )
        
        # Round to 2 decimal places
        overall_score = round(overall_score * 100) / 100
        
        return {
            "score": overall_score,
            "skillsScore": round(skills_score * 100) / 100,
            "experienceScore": round(experience_score * 100) / 100,
            "requirementsScore": round(requirements_score * 100) / 100
        }
    
    def _calculate_skills_match(self, resume_skills: List[str], job_skills: List[str]) -> float:
        """Calculate match score for skills"""
        if not resume_skills or not job_skills:
            return 0.0
        
        # Convert all skills to lowercase for better matching
        resume_skills_lower = [skill.lower() for skill in resume_skills]
        job_skills_lower = [skill.lower() for skill in job_skills]
        
        # Direct match (exact skills)
        matching_skills = set(resume_skills_lower).intersection(set(job_skills_lower))
        direct_match_score = len(matching_skills) / len(job_skills_lower) if job_skills_lower else 0
        
        # Semantic match (for skills that are not exact matches)
        if len(job_skills_lower) > len(matching_skills):
            remaining_job_skills = [skill for skill in job_skills_lower if skill not in matching_skills]
            remaining_resume_skills = [skill for skill in resume_skills_lower if skill not in matching_skills]
            
            if remaining_resume_skills and remaining_job_skills:
                # Compute embeddings
                resume_embeddings = self.model.encode(remaining_resume_skills)
                job_embeddings = self.model.encode(remaining_job_skills)
                
                # Calculate cosine similarity matrix
                similarity_matrix = util.cos_sim(resume_embeddings, job_embeddings)
                
                # For each job skill, find the best matching resume skill
                best_matches = []
                for j in range(len(remaining_job_skills)):
                    col = similarity_matrix[:, j]
                    best_match = float(np.max(col))
                    best_matches.append(best_match)
                
                # Average semantic match score
                semantic_match_score = sum(best_matches) / len(best_matches)
                
                # Weight of remaining skills in the overall skills score
                remaining_weight = len(remaining_job_skills) / len(job_skills_lower)
                
                # Combine direct and semantic matching
                return direct_match_score + (semantic_match_score * remaining_weight)
            
        return direct_match_score
    
    def _calculate_experience_match(self, resume_experience: List[Dict[str, str]], job_responsibilities: List[str]) -> float:
        """Calculate match score for experience vs responsibilities"""
        if not resume_experience or not job_responsibilities:
            return 0.0
        
        # Extract experience descriptions
        experience_texts = []
        for exp in resume_experience:
            if 'description' in exp and exp['description']:
                experience_texts.append(exp['description'])
            if 'title' in exp and exp['title']:
                experience_texts.append(exp['title'])
        
        if not experience_texts:
            return 0.0
        
        # Combine all experience into a single text
        combined_experience = " ".join(experience_texts)
        
        # Encode texts
        experience_embedding = self.model.encode(combined_experience)
        responsibility_embeddings = self.model.encode(job_responsibilities)
        
        # Calculate similarity for each responsibility
        similarities = []
        for resp_embedding in responsibility_embeddings:
            similarity = util.cos_sim(experience_embedding, resp_embedding)
            similarities.append(float(similarity))
        
        # Average similarity score
        return sum(similarities) / len(similarities)
    
    def _calculate_requirements_match(self, resume: Dict[str, Any], job_requirements: List[str]) -> float:
        """Calculate match score for job requirements"""
        if not job_requirements:
            return 0.0
        
        # Create a comprehensive resume text
        resume_parts = []
        
        # Add skills
        if 'skills' in resume and resume['skills']:
            resume_parts.append("Skills: " + ", ".join(resume['skills']))
        
        # Add education
        if 'education' in resume and resume['education']:
            education_texts = []
            for edu in resume['education']:
                parts = []
                for key, value in edu.items():
                    if value:
                        parts.append(f"{key}: {value}")
                education_texts.append(", ".join(parts))
            resume_parts.append("Education: " + "; ".join(education_texts))
        
        # Add experience
        if 'experience' in resume and resume['experience']:
            experience_texts = []
            for exp in resume['experience']:
                parts = []
                for key, value in exp.items():
                    if value:
                        parts.append(f"{key}: {value}")
                experience_texts.append(", ".join(parts))
            resume_parts.append("Experience: " + "; ".join(experience_texts))
        
        # Combine all resume parts
        combined_resume = " ".join(resume_parts)
        
        if not combined_resume:
            return 0.0
        
        # Encode texts
        resume_embedding = self.model.encode(combined_resume)
        requirement_embeddings = self.model.encode(job_requirements)
        
        # Calculate similarity for each requirement
        similarities = []
        for req_embedding in requirement_embeddings:
            similarity = util.cos_sim(resume_embedding, req_embedding)
            similarities.append(float(similarity))
        
        # Average similarity score
        return sum(similarities) / len(similarities)
