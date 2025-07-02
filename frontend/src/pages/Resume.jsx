import { useState, useEffect } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import React from 'react'
// This file is large; consider splitting into smaller components (e.g., ResumeForm, ResumeEvaluation) for maintainability.

const adviceIcons = {
  1: '🎓', // Education
  2: '💼', // Experience
  3: '🛠️', // Skills or Projects
  4: '🧠', // Problem Solving
  5: '🌐', // Communication/Team
  default: '💡'
};

// Custom list item renderers for icons
const requirementsListItem = {
  li: ({ children, ...props }) => (
    <li {...props} className="flex items-start gap-2">
      <span className="text-blue-500">📝</span>
      <span>{children}</span>
    </li>
  ),
};
const passListItem = {
  li: ({ children, ...props }) => (
    <li {...props} className="flex items-start gap-2">
      <span className="text-green-600">📊</span>
      <span>{children}</span>
    </li>
  ),
};
const adviceListItem = {
  li: ({ children, ...props }) => (
    <li {...props} className="flex items-start gap-2">
      <span className="text-yellow-500">💡</span>
      <span>{children}</span>
    </li>
  ),
};

// Custom renderer for dot bullets (•)
const dotBulletRenderer = {
  p: ({ children, ...props }) => {
    const text = children[0];
    if (typeof text === 'string' && text.trim().startsWith('•')) {
      return (
        <div {...props} className="flex items-start gap-2 ml-4">
          <span className="text-lg text-gray-700 mt-1">•</span>
          <span>{text.replace(/^•\s*/, '')}</span>
        </div>
      );
    }
    return <p {...props}>{children}</p>;
  }
};

// Map section headers to icons (same as requirements)
const sectionIcons = {
  'Education': '📑',
  'Programming Skills': '💻',
  'Problem-Solving Skills': '🧠',
  'Experience': '🎯',
  'Team Collaboration': '🌐',
  'AI/ML Interest': '🚀',
  'Responsibility and Safety': '🌍',
  'Benefits': '💼',
  'Duration': '🗓️',
};

// Custom renderer for requirements-style sections
const requirementsMarkdownComponents = {
  p: ({ children, ...props }) => {
    // Remove the first sentence for advice section if needed
    if (props['data-advice']) {
      // Join all children as text, remove the first sentence, then re-parse as markdown
      const text = React.Children.toArray(children).map(child => (typeof child === 'string' ? child : '')).join('');
      const sentences = text.split(/(?<=[.!?])\s+/);
      if (sentences.length > 1) {
        // Remove the first sentence and re-render the rest as markdown
        return <ReactMarkdown components={requirementsMarkdownComponents}>{sentences.slice(1).join(' ')}</ReactMarkdown>;
      }
      // If only one sentence, render nothing
      return null;
    }
    // If the paragraph contains bolded words, add icons
    const newChildren = React.Children.toArray(children).map((child, idx) => {
      if (
        child?.props &&
        child.props.node?.tagName === 'strong'
      ) {
        const section = child.props.children[0].replace(/:$/, '').trim();
        const icon = sectionIcons[section] || '📑';
        return (
          <span key={idx} className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <span className="font-bold text-base">{section}</span>
          </span>
        );
      }
      return child;
    });
    return <div {...props} className="ml-6 text-gray-900">{newChildren}</div>;
  },
  code: ({children, ...props}) => (
    <code {...props} className="whitespace-pre-wrap break-words font-semibold text-blue-800 px-1 py-0.5 rounded text-sm">{children}</code>
  ),
  pre: ({children, ...props}) => (
    <pre {...props} className="whitespace-pre-wrap break-words font-semibold text-blue-800 p-2 rounded text-sm overflow-x-auto">{children}</pre>
  )
};

// Improved: Only split bolded headers at the start of a line or after a newline, not inline bold text
function preprocessSectionHeaders(markdown) {
  // Replace **Header:** or **Header** at the start of a line (or after a newline) with a newline, header, newline
  return markdown.replace(/(^|\n)\*\*(.+?)\*\*:?\s*/g, (match, p1, p2) => `${p1}**${p2.replace(/:$/, '').trim()}**\n`);
}

// Helper to collapse multiple blank lines into a single blank line
function collapseBlankLines(markdown) {
  // Remove all double or more blank lines
  return markdown.replace(/(\n\s*){2,}/g, '\n');
}

function cleanAdviceMarkdown(markdown) {
  // Remove lines that are just Markdown symbols (like '**', '*', etc.)
  let cleaned = markdown
    .split('\n')
    .filter(line => !/^\s*(\*+|_+)\s*$/.test(line.trim()))
    .join('\n');
  // Collapse multiple blank lines
  cleaned = cleaned.replace(/(\n\s*){2,}/g, '\n');
  return cleaned;
}

// Helper to add bullets to lines that are not headers or already bullets
function addBulletsToLines(markdown) {
  return markdown
    .split('\n')
    .map(line =>
      line.trim() &&
      !line.trim().startsWith('-') &&
      !line.trim().startsWith('📝') &&
      !line.trim().startsWith('📚') &&
      !line.trim().startsWith('💼') &&
      !line.trim().startsWith('🔧') &&
      !line.trim().startsWith('**') &&
      !line.trim().startsWith('#')
        ? `- ${line.trim()}`
        : line
    )
    .join('\n');
}

export default function Resume() {
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: ''
    },
    summary: '',
    experience: [
      {
        company: '',
        position: '',
        duration: '',
        description: ''
      }
    ],
    education: [
      {
        institution: '',
        degree: '',
        year: '',
        gpa: ''
      }
    ],
    skills: '',
    projects: [
      {
        name: '',
        description: '',
        technologies: '',
        link: ''
      }
    ]
  })

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalError, setEvalError] = useState('');
  const [targetCompany, setTargetCompany] = useState('');

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await axios.get('/api/resume');
        if (response.data) {
          setResumeData(response.data);
        }
      } catch (error) {
        console.error('Error fetching resume:', error);
        setStatus('Could not load resume data.');
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, []);

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        company: '',
        position: '',
        duration: '',
        description: ''
      }]
    }))
  }

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, {
        institution: '',
        degree: '',
        year: '',
        gpa: ''
      }]
    }))
  }

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        name: '',
        description: '',
        technologies: '',
        link: ''
      }]
    }))
  }

  const updateExperience = (index, field, value) => {
    const newExperience = [...resumeData.experience]
    newExperience[index][field] = value
    setResumeData(prev => ({ ...prev, experience: newExperience }))
  }

  const updateEducation = (index, field, value) => {
    const newEducation = [...resumeData.education]
    newEducation[index][field] = value
    setResumeData(prev => ({ ...prev, education: newEducation }))
  }

  const updateProject = (index, field, value) => {
    const newProjects = [...resumeData.projects]
    newProjects[index][field] = value
    setResumeData(prev => ({ ...prev, projects: newProjects }))
  }

  const updatePersonalInfo = (field, value) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }))
  }

  const saveResume = async () => {
    setStatus('Saving...');
    try {
        const response = await axios.post('/api/resume', resumeData);
        setResumeData(response.data);
        setStatus('Resume saved successfully!');
    } catch (error) {
        console.error('Error saving resume:', error);
        setStatus('Error saving resume. Please try again.');
    }
  }

  const evaluateResume = async () => {
    setEvalLoading(true);
    setEvalError('');
    setEvaluation(null);
    try {
      const res = await axios.post('/api/ai-resume-evaluate', {
        company: targetCompany,
        resume: resumeData
      });
      setEvaluation(res.data);
    } catch (err) {
      setEvalError(err.response?.data?.detail || 'Error evaluating resume.');
    } finally {
      setEvalLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-xl font-semibold text-gray-600">Loading Resume...</div>
        </div>
    );
  }

  const tips = (evaluation?.advice || '').split(/\n(?=\d+\.\s)/);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Resume Builder</h1>
          
          <form className="space-y-8">
            {/* Personal Information */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.name}
                    onChange={(e) => updatePersonalInfo('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.location}
                    onChange={(e) => updatePersonalInfo('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="San Francisco, CA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={resumeData.personalInfo.linkedin}
                    onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
                  <input
                    type="url"
                    value={resumeData.personalInfo.github}
                    onChange={(e) => updatePersonalInfo('github', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://github.com/johndoe"
                  />
                </div>
              </div>
            </div>

            {/* Professional Summary */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Summary</h2>
              <textarea
                value={resumeData.summary}
                onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Write a brief professional summary highlighting your key strengths and career objectives..."
              />
            </div>

            {/* Work Experience */}
            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Work Experience</h2>
                <button
                  type="button"
                  onClick={addExperience}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Add Experience
                </button>
              </div>
              {resumeData.experience.map((exp, index) => (
                <div key={index} className="border border-purple-200 rounded-lg p-4 mb-4 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Company Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => updateExperience(index, 'position', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Job Title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Jan 2023 - Present"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Describe your responsibilities and achievements..."
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="bg-yellow-50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Education</h2>
                <button
                  type="button"
                  onClick={addEducation}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Add Education
                </button>
              </div>
              {resumeData.education.map((edu, index) => (
                <div key={index} className="border border-yellow-200 rounded-lg p-4 mb-4 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="University Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="Bachelor of Science in Computer Science"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                      <input
                        type="text"
                        value={edu.year}
                        onChange={(e) => updateEducation(index, 'year', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="2020"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">GPA (Optional)</label>
                      <input
                        type="text"
                        value={edu.gpa}
                        onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="3.8/4.0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="bg-indigo-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
              <textarea
                value={resumeData.skills}
                onChange={(e) => setResumeData(prev => ({ ...prev, skills: e.target.value }))}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="List your technical skills, programming languages, frameworks, tools, etc. (e.g., JavaScript, React, Node.js, Python, AWS, Docker)"
              />
            </div>

            {/* Projects */}
            <div className="bg-pink-50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
                <button
                  type="button"
                  onClick={addProject}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Add Project
                </button>
              </div>
              {resumeData.projects.map((project, index) => (
                <div key={index} className="border border-pink-200 rounded-lg p-4 mb-4 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                      <input
                        type="text"
                        value={project.name}
                        onChange={(e) => updateProject(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Project Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Technologies</label>
                      <input
                        type="text"
                        value={project.technologies}
                        onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="React, Node.js, MongoDB"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Project Link</label>
                      <input
                        type="url"
                        value={project.link}
                        onChange={(e) => updateProject(index, 'link', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="https://github.com/username/project"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={project.description}
                      onChange={(e) => updateProject(index, 'description', e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Describe the project, your role, and key achievements..."
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Generate Resume Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={saveResume}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg font-medium transition-colors duration-200"
              >
                Save Resume
              </button>
              {status && <div className="mt-4 text-gray-600">{status}</div>}
            </div>
          </form>

          {/* Evaluation Section */}
          <div className="mt-10 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Evaluate Resume for a Company</h2>
            <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
              <input
                type="text"
                value={targetCompany}
                onChange={e => setTargetCompany(e.target.value)}
                placeholder="Enter company name (e.g., OpenAI)"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-1/3"
              />
              <button
                type="button"
                onClick={evaluateResume}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                disabled={evalLoading || !targetCompany}
              >
                {evalLoading ? 'Evaluating...' : 'Evaluate Resume'}
              </button>
            </div>
            {evalError && <div className="text-red-600 mb-2">{evalError}</div>}
            {evaluation && (
              <div className="mt-4 flex flex-col gap-6">
                {/* Company Requirements */}
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-600 text-xl">📑</span>
                    <strong className="text-lg">Company Requirements</strong>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-1 space-y-6">
                    <div className="bg-blue-100 border border-blue-300 rounded-md shadow-sm p-4">
                      <div className="tight-markdown text-base text-gray-800 leading-relaxed">
                        <ReactMarkdown components={requirementsMarkdownComponents}>
                          {addBulletsToLines(evaluation.qualifications || '')}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Pass Percentage & Explanation */}
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-green-600 text-xl">📊</span>
                    <strong className="text-lg">Pass Percentage & Explanation</strong>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-1 space-y-6">
                    <div className="bg-green-100 border border-green-300 rounded-md shadow-sm p-4">
                      {(() => {
                        const rating = evaluation.rating || '';
                        const match = rating.match(/(\d{1,3})%\s*([\s\S]*)/);

                        if (match) {
                          const percent = parseInt(match[1], 10);
                          let explanation = match[2].trim()
                            .replace(/^\s*chance of passing the CV screening round\.?\s*/im, '')
                            .replace(/^\s*Explanation:\s*/im, '');

                          return (
                            <>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">🎯</span>
                                <span className="text-2xl font-bold text-green-700">{percent}%</span>
                                <div className="flex-1 h-3 bg-green-200 rounded-full overflow-hidden mx-2">
                                  <div className="h-3 bg-green-500 rounded-full" style={{ width: `${percent}%` }}></div>
                                </div>
                              </div>
                              <div>
                                <div className="font-semibold text-green-900 text-lg mb-2">Explanation</div>
                                <div className="tight-markdown text-base leading-relaxed text-gray-800">
                                  <ReactMarkdown components={requirementsMarkdownComponents}>
                                    {cleanAdviceMarkdown(preprocessSectionHeaders(addBulletsToLines(explanation)))}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            </>
                          );
                        } else {
                          return (
                            <div className="tight-markdown text-base leading-relaxed text-gray-800">
                              <ReactMarkdown components={requirementsMarkdownComponents}>
                                {cleanAdviceMarkdown(preprocessSectionHeaders(addBulletsToLines(rating)))}
                              </ReactMarkdown>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>
                {/* Advice to Improve */}
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-500 text-xl">💡</span>
                    <strong className="text-lg">Advice to Improve</strong>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-1 space-y-6">
                    {(evaluation?.advice || '')
                      .split(/\n(?=\d+\.\s)/)
                      .filter(Boolean)
                      .map((tip, idx) => {
                        const [main, example] = tip.split('Example:');
                        const tipNumberMatch = tip.match(/^(\d+)\./);
                        const tipNumber = tipNumberMatch ? parseInt(tipNumberMatch[1], 10) : idx + 1;
                        const icon = adviceIcons[tipNumber] || adviceIcons.default;

                        // Split main into header (first line) and body (rest)
                        const mainLines = (main ? main.replace(/^(\d+)\.\s*/, '').trim() : '').split('\n');
                        const header = mainLines[0] || '';
                        const body = mainLines.slice(1).join('\n');

                        // Remove markdown heading symbols from the header
                        const cleanHeader = header.replace(/^#+\s*/, '');

                        return (
                          <div key={idx} className="bg-yellow-100 border border-yellow-300 rounded-md shadow-sm p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-yellow-600 text-2xl">{icon}</span>
                              <span className="font-bold text-yellow-700 text-lg">Tips:</span>
                              <span className="font-bold text-gray-900 text-lg ml-2">{cleanHeader}</span>
                            </div>
                            {body && (
                              <div className="tight-markdown text-base text-gray-800 leading-relaxed mb-2">
                                <ReactMarkdown components={requirementsMarkdownComponents}>
                                  {body}
                                </ReactMarkdown>
                              </div>
                            )}
                            {example && (
                              <div className="tight-markdown mt-1 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-gray-800">
                                <div className="font-semibold mb-1 text-yellow-700">Example</div>
                                <ReactMarkdown components={requirementsMarkdownComponents}>
                                  {example.trim()}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 