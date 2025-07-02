import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import React from 'react'
import axios from 'axios'

const COLOR_PRIMARY = 'text-[#2A2A2A]';
const COLOR_ACCENT = 'text-[#F57C00]';
const COLOR_BG = 'bg-[#F5F5F5]';
const COLOR_BTN = 'bg-[#424242] text-white';
const FONT_SANS = 'font-[Inter,Roboto,Open_Sans,sans-serif]';

export default function CompanyAIInfo() {
  const { company } = useParams()
  const [basicInfo, setBasicInfo] = useState('')
  const [techJobs, setTechJobs] = useState('')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(true)
  const [logoUrl, setLogoUrl] = useState('');
  const [website, setWebsite] = useState('');
  const [allCompanies, setAllCompanies] = useState([])
  const [similarCompanies, setSimilarCompanies] = useState([])
  const [companyTags, setCompanyTags] = useState([])
  const [editTags, setEditTags] = useState('')
  const [editingTags, setEditingTags] = useState(false)
  const [savingTags, setSavingTags] = useState(false)

  // Parse bullet points from basicInfo
  const basicInfoItems = useMemo(() => (
    basicInfo
      .split(/\n|\r/)
      .map(line => line.replace(/^[-•*]\s*/, '').trim())
      .filter(line => line.length > 0)
  ), [basicInfo]);

  // Extract fields from basicInfoItems
  const getField = (label, regex) => {
    const item = basicInfoItems.find(line => line.toLowerCase().includes(label));
    if (!item) return '';
    if (regex) {
      const match = item.match(regex);
      return match ? match[1] : '';
    }
    // Default: return after colon
    const idx = item.indexOf(':');
    return idx !== -1 ? item.slice(idx + 1).trim() : item;
  };
  const address = getField('headquarters', /headquarters\s*[:\-]?\s*(.*)/i) || getField('address', /address\s*[:\-]?\s*(.*)/i) || 'N/A';
  const industry = getField('industry', /industry\s*[:\-]?\s*(.*)/i) || 'N/A';

  const fetchCompanyAIInfo = (refresh = false) => {
    setLoading(true);
    fetch('/api/company-ai-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company, refresh })
    })
      .then(r => r.json())
      .then(data => {
        setBasicInfo(data.basicInfo || '');
        setTechJobs(data.techJobs || '');
        setSummary(data.summary || '');
        setLogoUrl(data.logoUrl || '');
        setWebsite(data.website || '');
        setCompanyTags(data.tags || []);
      })
      .finally(() => setLoading(false));
  };

  // Fetch all companies for similarity suggestions
  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(data => setAllCompanies(data.map(c => c.company)))
  }, [])

  // Find similar companies by industry (placeholder logic)
  useEffect(() => {
    if (!industry || !allCompanies.length) return
    // In a real app, use tags, user behavior, or AI
    const filtered = allCompanies.filter(c => c.toLowerCase() !== company.toLowerCase())
    setSimilarCompanies(filtered.slice(0, 5))
  }, [industry, allCompanies, company])

  useEffect(() => {
    fetchCompanyAIInfo(false);
  }, [company]);

  // Save tags handler
  const handleSaveTags = async () => {
    setSavingTags(true)
    try {
      const tagsArr = editTags.split(',').map(t => t.trim()).filter(Boolean)
      const res = await axios.put(`/api/company-ai-info/${encodeURIComponent(company)}/tags`, { tags: tagsArr })
      setCompanyTags(res.data.tags || [])
      setEditingTags(false)
    } catch (err) {
      alert('Failed to save tags')
    } finally {
      setSavingTags(false)
    }
  }

  return (
    <div className={`min-h-screen ${COLOR_BG} ${FONT_SANS} flex items-center justify-center py-8`}>
      <div className="w-full max-w-[1600px] grid grid-cols-1 md:grid-cols-[220px_1fr] gap-2 px-0 md:px-0">
        {/* Left: Company Info */}
        <aside className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center min-w-[220px] max-w-xs">
          <div className="bg-black p-3 rounded-xl flex items-center justify-center mb-6 w-28 h-28">
            <img
              src={logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&background=2A2A2A&color=fff&size=128`}
              alt="Company Logo"
              className="max-w-full max-h-full object-contain"
              onError={e => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&background=2A2A2A&color=fff&size=128`; }}
            />
          </div>
          <h2 className="text-2xl font-extrabold mb-2 text-center">{company}</h2>
          {/* Tags UI */}
          <div className="w-full mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-[#23235B]">Tags:</span>
              {companyTags.length === 0 && !editingTags && <span className="text-gray-400 text-sm">No tags</span>}
              {!editingTags && companyTags.map(tag => (
                <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium mr-1">{tag}</span>
              ))}
              {!editingTags && (
                <button className="ml-2 text-xs text-blue-600 underline hover:text-blue-800" onClick={() => { setEditTags(companyTags.join(', ')); setEditingTags(true) }}>Edit</button>
              )}
            </div>
            {editingTags && (
              <div className="flex flex-col gap-2 mt-1">
                <input
                  type="text"
                  className="px-2 py-1 border border-gray-300 rounded text-xs w-48"
                  value={editTags}
                  onChange={e => setEditTags(e.target.value)}
                  placeholder="e.g. AI, SaaS, Fintech"
                  disabled={savingTags}
                />
                <div className="flex gap-2">
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium disabled:opacity-50"
                    onClick={handleSaveTags}
                    disabled={savingTags}
                  >{savingTags ? 'Saving...' : 'Save'}</button>
                  <button
                    className="text-xs text-gray-500 underline"
                    onClick={() => setEditingTags(false)}
                    disabled={savingTags}
                  >Cancel</button>
                </div>
              </div>
            )}
          </div>
          <div className="w-16 border-b-2 border-gray-200 mb-4" />
          {loading ? (
            <div className="text-gray-400 text-center mt-8">Loading...</div>
          ) : (
            <div className="w-full space-y-3 text-base">
              {/* Location */}
              <div className="flex items-start pb-2 border-b border-gray-100">
                <div>
                  <div className="font-semibold text-[#23235B]">Location:</div>
                  <div className="text-[#23235B]">{address.replace(/\*+/g, '').trim()}</div>
                </div>
              </div>
              {/* Website */}
              <div className="flex items-start pb-2 border-b border-gray-100">
                <div>
                  <div className="font-semibold text-[#23235B]">Website:</div>
                  <div>
                    {website && website.trim() ? (
                      <a
                        href={website.startsWith('http') ? website : `https://${website}`}
                        className="text-blue-600 underline hover:text-[#F57C00]"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {website}
                      </a>
                    ) : (
                      <span className="text-[#23235B]">N/A</span>
                    )}
                  </div>
                </div>
              </div>
              {/* Industry */}
              <div className="flex items-start">
                <div>
                  <div className="font-semibold text-[#23235B]">Industry:</div>
                  <div className="text-[#23235B]">{industry.replace(/\*+/g, '').replace(/^:\s*/, '').replace(/\s*\[\d+\]\s*$/g, '').trim()}</div>
                </div>
              </div>
            </div>
          )}
        </aside>
        {/* Right: Technographics */}
        <section className="bg-white rounded-2xl shadow-md p-6 flex flex-col relative min-w-0 text-[16px]">
          <button className="absolute top-8 right-8 flex items-center gap-2 px-5 py-2 rounded-lg bg-[#424242] text-white font-semibold shadow hover:bg-[#2A2A2A] transition" onClick={() => fetchCompanyAIInfo(true)}>
            Refresh
          </button>
          <h1 className={`text-3xl font-extrabold mb-1 ${COLOR_PRIMARY}`}>{company} Technographics</h1>
          <div className={`mb-4 text-base font-medium ${COLOR_ACCENT}`}>Company Software Purchases and Digital Transformation Initiatives</div>
          <div className="border-b border-gray-200 mb-6" />
          <div className="space-y-6 text-[#2A2A2A] leading-relaxed">
            {loading ? (
              <div className="text-gray-400">Loading...</div>
            ) : (
              <ReactMarkdown>{techJobs}</ReactMarkdown>
            )}
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Summary</h3>
            <div className="border-b border-gray-200 mb-4" />
            {loading ? (
              <div className="text-gray-400">Loading...</div>
            ) : (
              <div className="prose whitespace-pre-line text-gray-800 leading-relaxed">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* AI-powered Similar Companies */}
          <div className="mt-10">
            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">🧠 You might also want to check:</h3>
            {similarCompanies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {similarCompanies.map(name => (
                  <Link
                    key={name}
                    to={`/dashboard/${encodeURIComponent(name)}`}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium transition"
                  >
                    {name}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">No similar companies found.</div>
            )}
          </div>

          {/* Career Opportunities Integration */}
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">🔗 Career Opportunities</h3>
            <div className="text-gray-700 text-base mb-2">Explore jobs and career pages for <span className="font-semibold">{company}</span>:</div>
            <ul className="list-disc ml-6 space-y-1">
              {/* {website && (
                <li>
                  <a href={`${website}${website.endsWith('/') ? '' : '/'}careers`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-[#F57C00]">{company} Careers Page</a>
                </li>
              )} */}
              <li>
                <a href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(company)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-[#F57C00]">LinkedIn Jobs for {company}</a>
              </li>
              <li>
                <a href={`https://www.google.com/search?q=${encodeURIComponent(company + ' jobs')}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-[#F57C00]">Google Search: {company} jobs</a>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
} 