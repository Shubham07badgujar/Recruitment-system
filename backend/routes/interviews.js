const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const { sendInterviewNotification } = require('../utils/email');
const { callAIService } = require('../utils/aiService');

// Get all interviews
router.get('/', async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate('candidateId', 'name email')
      .populate('jobId', 'title company')
      .sort({ scheduledDate: 1 });
    
    res.json({ success: true, count: interviews.length, data: interviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single interview
router.get('/:id', async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('candidateId')
      .populate('jobId');
    
    if (!interview) {
      return res.status(404).json({ success: false, error: 'Interview not found' });
    }
    
    res.json({ success: true, data: interview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Schedule interview
router.post('/', async (req, res) => {
  try {
    const { candidateId, jobId, scheduledDate, duration, location, meetingLink } = req.body;
    
    if (!candidateId || !jobId || !scheduledDate) {
      return res.status(400).json({
        success: false,
        error: 'Please provide candidate ID, job ID, and scheduled date'
      });
    }
    
    // Verify candidate and job exist
    const candidate = await Candidate.findById(candidateId);
    const job = await Job.findById(jobId);
    
    if (!candidate) {
      return res.status(404).json({ success: false, error: 'Candidate not found' });
    }
    
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    
    // Create interview
    const interview = await Interview.create({
      candidateId,
      jobId,
      scheduledDate,
      duration: duration || 60,
      location: location || 'Virtual',
      meetingLink,
      status: 'Scheduled'
    });
    
    // Update candidate with interview reference
    candidate.interviews.push(interview._id);
    await candidate.save();
    
    // Send interview notification email
    try {
      await sendInterviewNotification(candidate, job, interview);
      interview.notificationSent = true;
      await interview.save();
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Continue without sending email if it fails
    }
    
    res.status(201).json({ success: true, data: interview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get next available slots for interviews
router.get('/slots/available', async (req, res) => {
  try {
    // Use AI Scheduler Agent to get available slots
    const slots = await callAIService('schedule-slots', {
      existingSlots: await Interview.find({ status: 'Scheduled' }, 'scheduledDate duration')
    });
    
    res.json({ success: true, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update interview
router.put('/:id', async (req, res) => {
  try {
    const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!interview) {
      return res.status(404).json({ success: false, error: 'Interview not found' });
    }
    
    // If status changed to "Rescheduled", send notification
    if (req.body.status === 'Rescheduled') {
      const candidate = await Candidate.findById(interview.candidateId);
      const job = await Job.findById(interview.jobId);
      
      try {
        await sendInterviewNotification(candidate, job, interview, true);
        interview.notificationSent = true;
        await interview.save();
      } catch (emailError) {
        console.error('Email notification error:', emailError);
      }
    }
    
    res.json({ success: true, data: interview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add feedback to interview
router.post('/:id/feedback', async (req, res) => {
  try {
    const { rating, comments, interviewer } = req.body;
    
    if (!rating || !comments || !interviewer) {
      return res.status(400).json({
        success: false,
        error: 'Please provide rating, comments, and interviewer'
      });
    }
    
    const interview = await Interview.findById(req.params.id);
    
    if (!interview) {
      return res.status(404).json({ success: false, error: 'Interview not found' });
    }
    
    interview.feedback = { rating, comments, interviewer };
    interview.status = 'Completed';
    await interview.save();
    
    res.json({ success: true, data: interview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete interview
router.delete('/:id', async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    
    if (!interview) {
      return res.status(404).json({ success: false, error: 'Interview not found' });
    }
    
    // Remove interview reference from candidate
    await Candidate.findByIdAndUpdate(interview.candidateId, {
      $pull: { interviews: interview._id }
    });
    
    await interview.deleteOne();
    
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
