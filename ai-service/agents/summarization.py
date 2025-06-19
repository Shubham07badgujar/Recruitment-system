from transformers import pipeline
from typing import Dict, Any, List, Optional

class SummarizationAgent:
    """Agent for summarizing text content"""
    
    def __init__(self):
        # Load pre-trained summarization model (smaller model for efficiency)
        try:
            self.summarizer = pipeline("summarization", model="facebook/bart-large-cnn", max_length=150)
        except:
            # Fallback to an even smaller model if needed
            self.summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6", max_length=150)
    
    def summarize(self, text: str, type: str = "general") -> str:
        """
        Summarize text content
        
        Args:
            text: Text content to summarize
            type: Type of content ('resume', 'job', or 'general')
            
        Returns:
            Summarized text
        """
        # Clean and truncate text (transformer models have max length limits)
        clean_text = self._clean_text(text)
        
        # If text is very short, just return it
        if len(clean_text.split()) < 50:
            return clean_text
        
        # Split text into chunks if too long (most models have a 1024 token limit)
        max_chunk_length = 1000  # conservative chunk size
        chunks = self._split_into_chunks(clean_text, max_chunk_length)
        
        summaries = []
        for chunk in chunks:
            # Skip very short chunks
            if len(chunk.split()) < 30:
                continue
                
            try:
                # Generate summary for this chunk
                summary = self.summarizer(chunk, max_length=150, min_length=30, do_sample=False)[0]['summary_text']
                summaries.append(summary)
            except Exception as e:
                print(f"Error summarizing chunk: {e}")
                # If summarization fails, use the first few sentences
                sentences = chunk.split('.')
                fallback_summary = '. '.join(sentences[:3]) + '.'
                summaries.append(fallback_summary)
        
        # Combine summaries
        combined_summary = " ".join(summaries)
        
        # Customize summary based on content type
        if type == "resume":
            return self._format_resume_summary(combined_summary)
        elif type == "job":
            return self._format_job_summary(combined_summary)
        else:
            return combined_summary
    
    def _clean_text(self, text: str) -> str:
        """Clean text for summarization"""
        # Remove excessive newlines and spaces
        cleaned = ' '.join(text.split())
        
        # Truncate if extremely long (for efficiency)
        max_words = 3000
        words = cleaned.split()
        if len(words) > max_words:
            cleaned = ' '.join(words[:max_words])
        
        return cleaned
    
    def _split_into_chunks(self, text: str, max_length: int) -> List[str]:
        """Split text into chunks of maximum length"""
        words = text.split()
        chunks = []
        
        current_chunk = []
        current_length = 0
        
        for word in words:
            current_length += len(word) + 1  # +1 for the space
            
            if current_length <= max_length:
                current_chunk.append(word)
            else:
                # Add current chunk to chunks
                chunks.append(' '.join(current_chunk))
                
                # Start new chunk
                current_chunk = [word]
                current_length = len(word) + 1
        
        # Add the last chunk
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        return chunks
    
    def _format_resume_summary(self, summary: str) -> str:
        """Format summary for a resume"""
        # Add a resume-specific prefix
        prefix = "Professional Summary: "
        
        # Clean up the summary to sound more like a resume
        summary = summary.replace("The resume states", "")
        summary = summary.replace("The candidate", "I")
        summary = summary.replace("They have", "I have")
        summary = summary.replace("Their", "My")
        
        return prefix + summary
    
    def _format_job_summary(self, summary: str) -> str:
        """Format summary for a job description"""
        # Add a job-specific prefix
        prefix = "Job Overview: "
        
        # Clean up the summary to sound more like a job description
        summary = summary.replace("The company is looking for", "We are looking for")
        summary = summary.replace("The position requires", "This position requires")
        
        return prefix + summary
