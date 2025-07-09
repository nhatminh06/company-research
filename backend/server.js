const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const ResumeEvaluation = require('./models/ResumeEvaluation');
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const userControllers = require('./controllers/userControllers');
const nodemailer = require('nodemailer');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = process.env.SMTP_PORT || 587;
const crypto = require('crypto');

// Rate limiting for Brandfetch API
let lastBrandfetchCall = 0;
const BRANDFETCH_RATE_LIMIT = 1000; // 1 second between calls

const app = express();
app.use(cors());
app.use(express.json());

// Session middleware (required for Passport OAuth)
app.use(session({
  secret: process.env.JWT_SECRET || 'changeme',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));
app.use(passport.initialize());
app.use(passport.session());

// Serialize/deserialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// --- OAUTH STRATEGIES AND ROUTES DISABLED TEMPORARILY ---
/*
// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });
    if (!user) {
      user = await User.create({
        email: profile.emails[0].value,
        name: profile.displayName,
        provider: 'google',
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: '/api/auth/github/callback',
  scope: ['user:email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let email = (profile.emails && profile.emails[0] && profile.emails[0].value) || '';
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name: profile.displayName || profile.username,
        provider: 'github',
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// LinkedIn OAuth Strategy
passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: '/api/auth/linkedin/callback',
  scope: ['r_emailaddress', 'r_liteprofile'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let email = (profile.emails && profile.emails[0] && profile.emails[0].value) || '';
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name: profile.displayName,
        provider: 'linkedin',
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// OAuth routes
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/api/auth/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/auth?error=google' }), (req, res) => {
  // Issue JWT and redirect to frontend
  const token = jwt.sign({ id: req.user._id, email: req.user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.redirect(`/auth?token=${token}`);
});

app.get('/api/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/api/auth/github/callback', passport.authenticate('github', { session: false, failureRedirect: '/auth?error=github' }), (req, res) => {
  const token = jwt.sign({ id: req.user._id, email: req.user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.redirect(`/auth?token=${token}`);
});

app.get('/api/auth/linkedin', passport.authenticate('linkedin', { state: true }));
app.get('/api/auth/linkedin/callback', passport.authenticate('linkedin', { session: false, failureRedirect: '/auth?error=linkedin' }), (req, res) => {
  const token = jwt.sign({ id: req.user._id, email: req.user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.redirect(`/auth?token=${token}`);
});
*/
// --- END OAUTH DISABLED ---

// Mongoose Note model
const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  tags: [String], // Tags for user/company
  createdAt: { type: Date, default: Date.now }
});
const Note = mongoose.model('Note', noteSchema);

// --- Resume Model ---
const resumeSchema = new mongoose.Schema({
    personalInfo: {
        name: String,
        email: String,
        phone: String,
        location: String,
        linkedin: String,
        github: String
    },
    summary: String,
    experience: [{
        company: String,
        position: String,
        duration: String,
        description: String
    }],
    education: [{
        institution: String,
        degree: String,
        year: String,
        gpa: String
    }],
    skills: String,
    projects: [{
        name: String,
        description: String,
        technologies: String,
        link: String
    }],
    updatedAt: { type: Date, default: Date.now }
});
const Resume = mongoose.model('Resume', resumeSchema);

// --- Dashboard Model ---
const dashboardEntrySchema = new mongoose.Schema({
  company: { type: String, required: true },
  info: { type: String, required: true },
  date: { type: String, required: true }
});
const DashboardEntry = mongoose.model('DashboardEntry', dashboardEntrySchema);

// 1. Add CompanyAIInfo model
const companyAIInfoSchema = new mongoose.Schema({
  company: { type: String, required: true, unique: true },
  basicInfo: String,
  techJobs: String,
  summary: String,
  logoUrl: String,
  tags: [String], // Tags for company
  updatedAt: { type: Date, default: Date.now }
});
const CompanyAIInfo = mongoose.model('CompanyAIInfo', companyAIInfoSchema);

/**
 * @api {get} /api Get welcome message
 */
app.get('/api', (req, res) => {
  res.json({ title: 'Company Research', message: 'Welcome to Company Research' });
});

/**
 * @api {get} /api/notes Get all notes
 */
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @api {post} /api/notes Create a note
 */
app.post('/api/notes', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const note = new Note({ title, content });
    const saved = await note.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @api {put} /api/notes/:id Update a note
 */
app.put('/api/notes/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const updated = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Note not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @api {delete} /api/notes/:id Delete a note
 */
app.delete('/api/notes/:id', async (req, res) => {
  try {
    const deleted = await Note.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Resume API Endpoints ---

// GET the current resume data
app.get('/api/resume', async (req, res) => {
    try {
        const resume = await Resume.findOne(); // Find the single resume document
        if (!resume) {
            return res.status(200).json(null); // Return null if no resume exists yet
        }
        res.json(resume);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST / UPDATE the resume (creates if none exists, otherwise updates)
app.post('/api/resume', async (req, res) => {
    try {
        const resumeData = req.body;
        resumeData.updatedAt = new Date();
        const updatedResume = await Resume.findOneAndUpdate(
            {}, // Find the first document
            resumeData, // Update it with the request body
            { new: true, upsert: true, runValidators: true } // Options: return new, create if not found
        );
        res.status(200).json(updatedResume);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- AI Company Search Endpoint ---
app.post('/api/ai-company-search', async (req, res) => {
  const { company } = req.body;
  if (!company) return res.status(400).json({ error: 'Company name is required' });
  // TODO: Integrate with Langchain/LangGraph here
  // Placeholder response
  res.json({
    company,
    info: `AI-generated info about ${company}`,
    date: new Date().toLocaleString()
  });
});

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/v1/complete';

async function callPerplexity(prompt) {
  const response = await axios.post(
    PERPLEXITY_API_URL,
    {
      model: 'sonar-pro',
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      search_mode: "academic",
      web_search_options: { search_context_size: "low" }
    },
    {
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data.choices[0].message.content;
}

// --- AI Company Sources Endpoint ---
const PYTHON_AI_URL = 'http://localhost:8000';

// Proxy to Python AI agent for sources
app.post('/api/ai-company-sources', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_AI_URL}/ai-company-sources`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy to Python AI agent for important info
app.post('/api/ai-company-info', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_AI_URL}/ai-company-info`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy to Python AI agent for summary
app.post('/api/ai-company-summary', async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_AI_URL}/ai-company-summary`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resume evaluation endpoint with database caching
app.post('/api/ai-resume-evaluate', async (req, res) => {
  try {
    const { company, resume } = req.body;
    
    if (!company || !resume) {
      return res.status(400).json({ error: 'Company and resume are required' });
    }

    // Check if evaluation already exists in database
    // Create a hash of the resume content for consistent comparison
    const resumeHash = crypto.createHash('md5').update(JSON.stringify(resume)).digest('hex');
    const existingEvaluation = await ResumeEvaluation.findOne({ 
      company: company,
      resumeHash: resumeHash 
    });

    if (existingEvaluation) {
      // Return cached evaluation
      return res.json({
        company: existingEvaluation.company,
        qualifications: existingEvaluation.qualifications,
        rating: existingEvaluation.rating,
        advice: existingEvaluation.advice,
        cached: true,
        createdAt: existingEvaluation.createdAt
      });
    }

    // If no cached evaluation exists, call the AI service
    const response = await axios.post(`${PYTHON_AI_URL}/ai-resume-evaluate`, req.body);
    
    // Save the evaluation to database
    const evaluation = new ResumeEvaluation({
      company: company,
      resume: resume,
      resumeHash: resumeHash,
      qualifications: response.data.qualifications,
      rating: response.data.rating,
      advice: response.data.advice
    });
    
    await evaluation.save();

    // Return the evaluation with cached flag
    res.json({
      ...response.data,
      cached: false,
      createdAt: evaluation.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all resume evaluations for a company
app.get('/api/resume-evaluations/:company', async (req, res) => {
  try {
    const { company } = req.params;
    const evaluations = await ResumeEvaluation.find({ company }).sort({ createdAt: -1 });
    res.json(evaluations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a specific resume evaluation
app.delete('/api/resume-evaluations/:id', async (req, res) => {
  try {
    const deleted = await ResumeEvaluation.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Resume evaluation not found' });
    }
    res.json({ message: 'Resume evaluation deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all resume evaluations (for admin purposes)
app.get('/api/resume-evaluations', async (req, res) => {
  try {
    const evaluations = await ResumeEvaluation.find().sort({ createdAt: -1 });
    res.json(evaluations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Force refresh resume evaluation (delete old and regenerate)
app.post('/api/ai-resume-evaluate/refresh', async (req, res) => {
  try {
    const { company, resume } = req.body;
    
    if (!company || !resume) {
      return res.status(400).json({ error: 'Company and resume are required' });
    }

    // Create hash for lookup
    const resumeHash = crypto.createHash('md5').update(JSON.stringify(resume)).digest('hex');
    
    // Delete existing evaluation if it exists
    await ResumeEvaluation.deleteOne({ 
      company: company,
      resumeHash: resumeHash 
    });

    // Call the AI service to generate new evaluation
    const response = await axios.post(`${PYTHON_AI_URL}/ai-resume-evaluate`, req.body);
    
    // Save the new evaluation to database
    const evaluation = new ResumeEvaluation({
      company: company,
      resume: resume,
      resumeHash: resumeHash,
      qualifications: response.data.qualifications,
      rating: response.data.rating,
      advice: response.data.advice
    });
    
    await evaluation.save();

    // Return the new evaluation
    res.json({
      ...response.data,
      cached: false,
      createdAt: evaluation.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all dashboard entries
app.get('/api/dashboard', async (req, res) => {
  try {
    const entries = await DashboardEntry.find().sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new dashboard entry
app.post('/api/dashboard', async (req, res) => {
  try {
    const { company, date } = req.body;
    if (!company || !date) return res.status(400).json({ error: 'company and date are required' });
    // Check if an entry already exists for this company
    const existing = await DashboardEntry.findOne({ company });
    if (existing) {
      return res.status(200).json(existing);
    }
    // Fetch AI-generated info from Python backend
    let info = '';
    let loaded = false;
    try {
      const aiRes = await axios.post(`${PYTHON_AI_URL}/ai-company-info`, { company });
      if (aiRes.data && aiRes.data.info) {
        info = 'Successfully loaded';
        loaded = true;
      } else {
        info = 'Failed to load';
      }
    } catch (err) {
      info = 'Failed to load';
    }
    const entry = new DashboardEntry({ company, info, date });
    const saved = await entry.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT (edit) a dashboard entry
app.put('/api/dashboard/:id', async (req, res) => {
  try {
    const { company, info, date } = req.body;
    const updated = await DashboardEntry.findByIdAndUpdate(
      req.params.id,
      { company, info, date },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Dashboard entry not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a dashboard entry
app.delete('/api/dashboard/:id', async (req, res) => {
  try {
    const deleted = await DashboardEntry.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Dashboard entry not found' });
    res.json({ message: 'Dashboard entry deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Add new POST endpoint for all company AI info (with cache/refresh)
app.post('/api/company-ai-info', async (req, res) => {
  const { company, refresh } = req.body;
  if (!company) return res.status(400).json({ error: 'Company name is required' });

  let doc = await CompanyAIInfo.findOne({ company });
  let logoUrl = doc && doc.logoUrl ? doc.logoUrl : '';
  let logoUpdated = false;

  // Helper function to extract and validate domain
  const extractValidDomain = (text) => {
    if (!text) return null;
    
    console.log(`Extracting domain from text: ${text.substring(0, 200)}...`);
    
    // Try multiple possible website fields with more precise patterns
    const websiteRegexes = [
      /website\s*[:\-]?\s*(https?:\/\/[^\s\n]+)/i,
      /web\s*[:\-]?\s*(https?:\/\/[^\s\n]+)/i,
      /url\s*[:\-]?\s*(https?:\/\/[^\s\n]+)/i,
      /website\s*[:\-]?\s*(www\.[^\s\n]+)/i,
      /web\s*[:\-]?\s*(www\.[^\s\n]+)/i,
      /url\s*[:\-]?\s*(www\.[^\s\n]+)/i,
      /(https?:\/\/[^\s\n]+)/i,
      /(www\.[^\s\n]+)/i
    ];
    
    let url = '';
    for (const regex of websiteRegexes) {
      const match = text.match(regex);
      if (match && match[1]) {
        url = match[1].trim();
        console.log(`Found URL with regex: ${url}`);
        break;
      }
    }
    
    if (!url) {
      console.log('No URL found in text');
      return null;
    }
    
    // Clean up the URL
    // Remove markdown links
    const mdMatch = url.match(/\[.*?\]\((.*?)\)/);
    if (mdMatch) url = mdMatch[1];
    
    // Remove trailing punctuation and references
    url = url.replace(/[.,;!?)]+$/, '');
    url = url.replace(/\[.*?\]/g, '');
    url = url.replace(/^([*\s:.]+)?/, '');
    url = url.trim();
    
    console.log(`Cleaned URL: ${url}`);
    
    // Ensure it's a valid domain
    try {
      let domain = url;
      if (!url.includes('://')) {
        domain = `https://${url}`;
      }
      const urlObj = new URL(domain);
      const hostname = urlObj.hostname;
      
      console.log(`Extracted hostname: ${hostname}`);
      
      // Basic domain validation
      if (hostname && hostname.includes('.') && hostname.length > 3) {
        // Additional validation to prevent obviously invalid domains
        if (hostname.length < 50 && !hostname.includes(' ') && !hostname.includes('\n')) {
          console.log(`Valid domain found: ${hostname}`);
          return hostname;
        } else {
          console.log(`Domain too long or contains invalid characters: ${hostname}`);
        }
      } else {
        console.log(`Invalid hostname: ${hostname}`);
      }
    } catch (e) {
      console.log(`Invalid URL format: ${url} - Error: ${e.message}`);
    }
    
    return null;
  };

  // Helper function to construct domain from company name
  const constructDomainFromCompany = (companyName) => {
    if (!companyName) return null;
    
    // Clean company name
    let cleanName = companyName.toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove special characters
      .trim();
    
    if (cleanName.length < 2) return null;
    
    // Common domain suffixes to try
    const suffixes = ['.com', '.org', '.net', '.io'];
    
    for (const suffix of suffixes) {
      const domain = cleanName + suffix;
      console.log(`Trying constructed domain: ${domain}`);
      return domain;
    }
    
    return null;
  };

  // If we have cached data and not refreshing, return it
  if (doc && !refresh) {
    // Extract website from cached basicInfo for response
    const cachedWebsite = extractValidDomain(doc.basicInfo) || '';
    
    // Return cached data (never prompt AI unless refresh is true)
    return res.json({
      company,
      basicInfo: doc.basicInfo,
      techJobs: doc.techJobs,
      summary: doc.summary,
      logoUrl: doc.logoUrl || '',
      website: cachedWebsite,
      updatedAt: doc.updatedAt,
      tags: doc.tags || []
    });
  }

  // Fetch AI data first
  let basicInfo = '';
  let techJobs = '';
  let summary = '';
  let newWebsite = '';

  try {
    const [basic, tech, summ] = await Promise.all([
      axios.post(`${PYTHON_AI_URL}/ai-company-sources`, { company }),
      axios.post(`${PYTHON_AI_URL}/ai-company-info`, { company }),
      axios.post(`${PYTHON_AI_URL}/ai-company-summary`, { company }),
    ]);
    basicInfo = basic.data.sources || '';
    techJobs = tech.data.info || '';
    summary = summ.data.summary || '';

    // Extract website from new basicInfo
    newWebsite = extractValidDomain(basicInfo) || '';
  } catch (err) {
    console.error('Error fetching AI data:', err.message);
    // If AI data fetch fails, try to use existing data if available
    if (doc) {
      basicInfo = doc.basicInfo || '';
      techJobs = doc.techJobs || '';
      summary = doc.summary || '';
      newWebsite = extractValidDomain(doc.basicInfo) || '';
    }
  }

  // Now handle logo fetching after we have the AI data
  // Only fetch logo if we don't have one cached OR if explicitly refreshing
  if ((refresh || !doc?.logoUrl) && !logoUrl) {
    let domain = null;
    
    // Try to extract domain from new basicInfo first
    if (basicInfo) {
      domain = extractValidDomain(basicInfo);
    }
    
    // If no domain found in new text, try existing basicInfo
    if (!domain && doc && doc.basicInfo) {
      domain = extractValidDomain(doc.basicInfo);
    }
    
    // If still no domain found, try to construct from company name
    if (!domain) {
      console.log(`No domain found in text, trying to construct from company name: ${company}`);
      domain = constructDomainFromCompany(company);
    }
    
    // Only call Brandfetch if we have a valid domain and API key
    if (domain && process.env.BRANDFETCH_API_KEY) {
      console.log(`Attempting to fetch logo for domain: ${domain}`);
      
      // Rate limiting
      const currentTime = Date.now();
      const timeSinceLastCall = currentTime - lastBrandfetchCall;
      if (timeSinceLastCall < BRANDFETCH_RATE_LIMIT) {
        const waitTime = BRANDFETCH_RATE_LIMIT - timeSinceLastCall;
        console.log(`Brandfetch rate limit hit. Waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      try {
        lastBrandfetchCall = Date.now();
        const response = await axios.get(`https://api.brandfetch.io/v2/brands/${domain}`, {
          headers: { 
            'Authorization': `Bearer ${process.env.BRANDFETCH_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        });
        
        const data = response.data;
        if (data && data.logos && data.logos.length > 0) {
          logoUrl = data.logos[0].formats[0].src;
          logoUpdated = true;
          console.log(`Successfully fetched logo for ${domain}`);
        } else {
          console.log(`No logos found for domain: ${domain}`);
        }
      } catch (e) {
        if (e.response) {
          console.error(`Brandfetch API error for ${domain}: ${e.response.status} - ${e.response.statusText}`);
        } else if (e.request) {
          console.error(`Brandfetch request failed for ${domain}: ${e.message}`);
        } else {
          console.error(`Brandfetch error for ${domain}: ${e.message}`);
        }
      }
    } else {
      if (!domain) {
        console.log(`No valid domain found for company: ${company}`);
      }
      if (!process.env.BRANDFETCH_API_KEY) {
        console.log(`Brandfetch API key not configured`);
      }
    }
  } else {
    // Use cached logo if available
    if (doc?.logoUrl) {
      logoUrl = doc.logoUrl;
      console.log(`Using cached logo for ${company}`);
    }
  }

  // Save everything to MongoDB
  const updateData = {
    basicInfo,
    techJobs,
    summary,
    updatedAt: new Date()
  };

  // Include logo URL in the update if we fetched one
  if (logoUpdated && logoUrl) {
    updateData.logoUrl = logoUrl;
  }

  doc = await CompanyAIInfo.findOneAndUpdate(
    { company },
    updateData,
    { upsert: true, new: true }
  );

  res.json({
    company,
    basicInfo,
    techJobs,
    summary,
    logoUrl: doc.logoUrl || '',
    website: newWebsite,
    updatedAt: doc.updatedAt,
    tags: doc.tags || []
  });
});

// Update tags for a company
app.put('/api/company-ai-info/:company/tags', async (req, res) => {
  const { company } = req.params;
  const { tags } = req.body;
  if (!Array.isArray(tags)) return res.status(400).json({ error: 'tags must be an array' });
  try {
    const updated = await CompanyAIInfo.findOneAndUpdate(
      { company },
      { tags },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Company not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all companies with tags and basic info
app.get('/api/company-ai-info', async (req, res) => {
  try {
    const companies = await CompanyAIInfo.find({}, 'company tags logoUrl summary');
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- LOCAL AUTH ONLY ---
// Signup (no email verification)
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered.' });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hash, name, provider: 'local', isVerified: true });
    await user.save();
    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Login (ignore isVerified)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(400).json({ error: 'Invalid credentials.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials.' });
    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// --- END LOCAL AUTH ONLY ---

const jwtAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// User profile routes
app.put('/api/user/profile', jwtAuth, userControllers.updateUserProfile);
app.post('/api/user/avatar', jwtAuth, userControllers.uploadAvatar);
app.post('/api/user/change-password', jwtAuth, userControllers.changePassword);
app.get('/api/user/profile', jwtAuth, userControllers.getUserProfile);

// Delete account endpoint
app.delete('/api/user/delete', jwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    await User.findByIdAndDelete(userId);
    res.json({ success: true, message: 'Account deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/company-research';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

module.exports = { transporter };

mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Company Research backend running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }); 