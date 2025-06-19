const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { callAIService } = require('../utils/aiService');

// Parse resume
router.post('/parse-resume', async (req, res) => {
  try {
    // Check if file or content provided
    if (!req.files && !req.body.content) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a resume file or content'
      });
    }
    
    let content = req.body.content;
    
    // If file provided, read content
    if (req.files && req.files.file) {
      const file = req.files.file;
      const tempPath = path.join(__dirname, '..', 'uploads', 'temp', file.name);
      
      // Ensure temp directory exists
      const tempDir = path.join(__dirname, '..', 'uploads', 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Save file temporarily
      await file.mv(tempPath);
      
      // Read file content
      content = fs.readFileSync(tempPath, 'utf8');
      
      // Delete temp file
      fs.unlinkSync(tempPath);
    }
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'No content could be extracted'
      });
    }
    
    // Call Resume Parser Agent
    const parsedData = await callAIService('parse-resume', { content });
    
    res.json({ success: true, data: parsedData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Parse job description
router.post('/parse-job', async (req, res) => {
  try {
    // Check if file or content provided
    if (!req.files && !req.body.content) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a job description file or content'
      });
    }
    
    let content = req.body.content;
    
    // If file provided, read content
    if (req.files && req.files.file) {
      const file = req.files.file;
      const tempPath = path.join(__dirname, '..', 'uploads', 'temp', file.name);
      
      // Ensure temp directory exists
      const tempDir = path.join(__dirname, '..', 'uploads', 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Save file temporarily
      await file.mv(tempPath);
      
      // Read file content
      content = fs.readFileSync(tempPath, 'utf8');
      
      // Delete temp file
      fs.unlinkSync(tempPath);
    }
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'No content could be extracted'
      });
    }
    
    // Call JD Parser Agent
    const parsedData = await callAIService('parse-job', { content });
    
    res.json({ success: true, data: parsedData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Match resume with job
router.post('/match', async (req, res) => {
  try {
    const { resume, job } = req.body;
    
    if (!resume || !job) {
      return res.status(400).json({
        success: false,
        error: 'Please provide resume and job data'
      });
    }
    
    // Call Matching Agent
    const matchResult = await callAIService('match', { resume, job });
    
    res.json({ success: true, data: matchResult });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Detect gaps in resume compared to job
router.post('/detect-gaps', async (req, res) => {
  try {
    const { resume, job } = req.body;
    
    if (!resume || !job) {
      return res.status(400).json({
        success: false,
        error: 'Please provide resume and job data'
      });
    }
    
    // Call Gap Detection Agent
    const gapResult = await callAIService('detect-gaps', { resume, job });
    
    res.json({ success: true, data: gapResult });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Summarize text
router.post('/summarize', async (req, res) => {
  try {
    const { content, type } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Please provide content to summarize'
      });
    }
    
    // Call Summarization Agent
    const summary = await callAIService('summarize', { content, type: type || 'general' });
    
    res.json({ success: true, data: { summary } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get schedule slots
router.post('/schedule-slots', async (req, res) => {
  try {
    const { existingSlots, preferences } = req.body;
    
    // Call Interview Scheduler Agent
    const slots = await callAIService('schedule-slots', { existingSlots, preferences });
    
    res.json({ success: true, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
