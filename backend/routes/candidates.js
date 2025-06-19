const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const { callAIService } = require('../utils/aiService');

// Get all candidates
router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.json({ success: true, count: candidates.length, data: candidates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single candidate
router.get('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('interviews')
      .populate('matches.jobId');
    
    if (!candidate) {
      return res.status(404).json({ success: false, error: 'Candidate not found' });
    }
    
    res.json({ success: true, data: candidate });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload resume and create candidate
router.post('/', async (req, res) => {
  try {
    // Check if resume file exists
    if (!req.files || !req.files.resume) {
      return res.status(400).json({ success: false, error: 'Please upload a resume file' });
    }
    
    const file = req.files.resume;
    const fileExt = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExt}`;
    const resumePath = path.join('uploads', 'resumes', fileName);
    
    // Move file to uploads directory
    await file.mv(path.join(__dirname, '..', resumePath));
    
    let candidateData = {
      name: req.body.name || 'Unknown',
      email: req.body.email || 'unknown@example.com',
      resumePath,
      status: 'New'
    };
    
    // Parse resume using AI service
    try {
      const fileContent = fs.readFileSync(path.join(__dirname, '..', resumePath), 'utf8');
      
      // Call Resume Parser Agent
      const parsedData = await callAIService('parse-resume', { content: fileContent });
      
      // Call Summarization Agent
      const summary = await callAIService('summarize', { content: fileContent, type: 'resume' });
      
      // Update candidate data with parsed info
      candidateData = {
        ...candidateData,
        name: parsedData.name || candidateData.name,
        email: parsedData.email || candidateData.email,
        phone: parsedData.phone || '',
        skills: parsedData.skills || [],
        experience: parsedData.experience || [],
        education: parsedData.education || [],
        parsedData,
        summary
      };
    } catch (aiError) {
      console.error('AI service error:', aiError);
      // Continue without AI parsing if it fails
    }
    
    // Create candidate
    const candidate = await Candidate.create(candidateData);
    
    res.status(201).json({ success: true, data: candidate });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Match candidate with job
router.post('/:id/match/:jobId', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    const job = await Job.findById(req.params.jobId);
    
    if (!candidate) {
      return res.status(404).json({ success: false, error: 'Candidate not found' });
    }
    
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    
    // Call Matching Agent
    const matchResult = await callAIService('match', {
      resume: candidate.parsedData,
      job: job.parsedData
    });
    
    // Call Gap Detection Agent
    const gapResult = await callAIService('detect-gaps', {
      resume: candidate.parsedData,
      job: job.parsedData
    });
    
    // Update candidate with match results
    const matchIndex = candidate.matches.findIndex(
      match => match.jobId.toString() === job._id.toString()
    );
    
    if (matchIndex > -1) {
      // Update existing match
      candidate.matches[matchIndex] = {
        ...candidate.matches[matchIndex],
        score: matchResult.score,
        gaps: gapResult.gaps,
        matchDate: Date.now()
      };
    } else {
      // Add new match
      candidate.matches.push({
        jobId: job._id,
        score: matchResult.score,
        gaps: gapResult.gaps,
        matchDate: Date.now()
      });
    }
    
    await candidate.save();
    
    res.json({
      success: true,
      data: {
        candidate,
        matchScore: matchResult.score,
        gaps: gapResult.gaps
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update candidate
router.put('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!candidate) {
      return res.status(404).json({ success: false, error: 'Candidate not found' });
    }
    
    res.json({ success: true, data: candidate });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete candidate
router.delete('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    
    if (!candidate) {
      return res.status(404).json({ success: false, error: 'Candidate not found' });
    }
    
    // Delete resume file if exists
    if (candidate.resumePath) {
      const fullPath = path.join(__dirname, '..', candidate.resumePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
    
    await candidate.deleteOne();
    
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
