const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Job = require('../models/Job');
const { callAIService } = require('../utils/aiService');

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new job with file upload
router.post('/', async (req, res) => {
  try {
    // Check if job data exists in request
    if (!req.body.title || !req.body.company) {
      return res.status(400).json({ success: false, error: 'Please provide job title and company' });
    }
    
    let filePath = null;
    
    // Handle file upload if exists
    if (req.files && req.files.jobDescription) {
      const file = req.files.jobDescription;
      const fileExt = path.extname(file.name);
      const fileName = `${uuidv4()}${fileExt}`;
      filePath = path.join('uploads', 'jobs', fileName);
      
      // Move file to uploads directory
      await file.mv(path.join(__dirname, '..', filePath));
      
      // Parse job description using AI service
      try {
        const fileContent = fs.readFileSync(path.join(__dirname, '..', filePath), 'utf8');
        
        // Call JD Parser Agent
        const parsedData = await callAIService('parse-job', { content: fileContent });
        
        // Call Summarization Agent
        const summary = await callAIService('summarize', { content: fileContent, type: 'job' });
        
        // Add parsed data to job
        req.body.requirements = parsedData.requirements || [];
        req.body.responsibilities = parsedData.responsibilities || [];
        req.body.skills = parsedData.skills || [];
        req.body.parsedData = parsedData;
        req.body.summary = summary;
      } catch (aiError) {
        console.error('AI service error:', aiError);
        // Continue without AI parsing if it fails
      }
    }
    
    // Create job
    const job = await Job.create({
      ...req.body,
      filePath
    });
    
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update job
router.put('/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete job
router.delete('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    
    // Delete job file if exists
    if (job.filePath) {
      const fullPath = path.join(__dirname, '..', job.filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
    
    await job.deleteOne();
    
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
