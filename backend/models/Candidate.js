const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  skills: {
    type: [String],
    default: []
  },
  experience: {
    type: [Object],
    default: []
  },
  education: {
    type: [Object],
    default: []
  },
  parsedData: {
    type: Object,
    default: {}
  },
  summary: {
    type: String,
    default: ''
  },
  resumePath: {
    type: String,
    required: [true, 'Resume path is required']
  },
  status: {
    type: String,
    enum: ['New', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired'],
    default: 'New'
  },
  matches: [{
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    score: {
      type: Number,
      default: 0
    },
    gaps: {
      type: [String],
      default: []
    },
    matchDate: {
      type: Date,
      default: Date.now
    }
  }],
  interviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Candidate', CandidateSchema);
