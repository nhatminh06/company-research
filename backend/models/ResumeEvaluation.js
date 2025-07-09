/**
 * ResumeEvaluation model for storing AI-generated resume evaluations
 */
const mongoose = require('mongoose');

const resumeEvaluationSchema = new mongoose.Schema({
  company: { 
    type: String, 
    required: true 
  },
  resume: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  resumeHash: { 
    type: String, 
    required: true 
  },
  qualifications: { 
    type: String, 
    required: true 
  },
  rating: { 
    type: String, 
    required: true 
  },
  advice: { 
    type: String, 
    required: true 
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create a compound index on company and resume hash for efficient lookups
resumeEvaluationSchema.index({ company: 1, resumeHash: 1 });

module.exports = mongoose.model('ResumeEvaluation', resumeEvaluationSchema); 