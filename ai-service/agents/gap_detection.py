from typing import Dict, Any, List, Set
from sentence_transformers import SentenceTransformer, util

class GapDetectionAgent:
    """Agent for detecting gaps between resume and job requirements"""
    
    def __init__(self):
        # Load pre-trained Sentence-BERT model
        try:
            self.model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
        except:
            # Fallback to simpler model if needed
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
    
    def detect(self, resume: Dict[str, Any], job: Dict[str, Any]) -> Dict[str, Any]:
        """
        Detect gaps between resume and job requirements
        
        Args:
            resume: Parsed resume data
            job: Parsed job description data
            
        Returns:
            Dictionary with gap results
        """
        # Extract data for gap detection
        resume_skills = resume.get('skills', [])
        job_skills = job.get('skills', [])
        
        job_requirements = job.get('requirements', [])
        
        # Find missing skills
        missing_skills = self._detect_missing_skills(resume_skills, job_skills)
        
        # Find missing requirements
        missing_requirements = self._detect_missing_requirements(resume, job_requirements)
        
        # Combine all gaps
        all_gaps = list(missing_skills) + missing_requirements
        
        return {
            "gaps": all_gaps,
            "missingSkills": list(missing_skills),
            "missingRequirements": missing_requirements
        }
    
    def _detect_missing_skills(self, resume_skills: List[str], job_skills: List[str]) -> Set[str]:
        """Detect skills in job requirements that are missing from the resume"""
        if not resume_skills or not job_skills:
            return set(job_skills) if job_skills else set()
        
        # Convert all skills to lowercase for better matching
        resume_skills_lower = [skill.lower() for skill in resume_skills]
        job_skills_lower = [skill.lower() for skill in job_skills]
        
        # Direct match (find skills that are exact matches)
        missing_skills = set()
        matched_skills = set()
        
        for i, job_skill in enumerate(job_skills_lower):
            if job_skill in resume_skills_lower:
                matched_skills.add(i)
            else:
                missing_skills.add(job_skills[i])  # Add original case version
        
        # For skills that weren't exact matches, check for semantic similarity
        if len(missing_skills) > 0 and len(resume_skills) > 0:
            remaining_job_skills_indices = [i for i in range(len(job_skills)) if i not in matched_skills]
            
            if remaining_job_skills_indices:
                # Compute embeddings
                resume_embeddings = self.model.encode(resume_skills)
                remaining_job_skills = [job_skills[i] for i in remaining_job_skills_indices]
                job_embeddings = self.model.encode(remaining_job_skills)
                
                # Calculate cosine similarity matrix
                similarity_matrix = util.cos_sim(resume_embeddings, job_embeddings)
                
                # For each remaining job skill, check if there's a similar resume skill
                semantic_matches = set()
                for j in range(len(remaining_job_skills)):
                    # Get best match score for this job skill
                    best_match = similarity_matrix[:, j].max().item()
                    
                    # If similarity is high enough, consider it a match
                    if best_match > 0.75:  # Threshold for semantic matching
                        semantic_matches.add(remaining_job_skills_indices[j])
                
                # Update missing skills
                missing_skills = set([job_skills[i] for i in remaining_job_skills_indices if i not in semantic_matches])
        
        return missing_skills
    
    def _detect_missing_requirements(self, resume: Dict[str, Any], job_requirements: List[str]) -> List[str]:
        """Detect job requirements that are not satisfied by the resume"""
        if not job_requirements:
            return []
        
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
            return job_requirements
        
        # Encode texts
        resume_embedding = self.model.encode(combined_resume)
        requirement_embeddings = self.model.encode(job_requirements)
        
        # Calculate similarity for each requirement
        missing_requirements = []
        for i, req_embedding in enumerate(requirement_embeddings):
            similarity = util.cos_sim(resume_embedding, req_embedding).item()
            
            # If similarity is too low, consider it a missing requirement
            if similarity < 0.6:  # Threshold for requirement matching
                missing_requirements.append(job_requirements[i])
        
        return missing_requirements
