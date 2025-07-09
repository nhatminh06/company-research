import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

function getStartOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
  return new Date(d.setDate(diff)).setHours(0,0,0,0)
}

export default function Home() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState([])
  const [companies, setCompanies] = useState([])
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [companyTags, setCompanyTags] = useState([])
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  // Check for user authentication
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({ email: payload.email, name: payload.name || '', id: payload.id })
      } catch (e) {
        setUser(null)
      }
    } else {
      setUser(null)
    }
  }, [])

  // Load welcome message from backend
  useEffect(() => {
    axios.get('/api')
      .then(res => {
        setMessage(res.data.message)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    async function fetchMetrics() {
      setMetricsLoading(true)
      try {
        const [notesRes, companiesRes, tagsRes] = await Promise.all([
          axios.get('/api/notes'),
          axios.get('/api/dashboard'),
          axios.get('/api/company-ai-info')
        ])
        setNotes(notesRes.data)
        setCompanies(companiesRes.data)
        setCompanyTags(tagsRes.data)
      } catch (err) {
        // Optionally handle error: you could set an error state and display a message
      }
      setMetricsLoading(false)
    }
    fetchMetrics()
  }, [])

  // Memoized metrics calculations
  const startOfWeek = useMemo(() => getStartOfWeek(new Date()), [])
  const notesThisWeek = useMemo(() => notes.filter(note => new Date(note.createdAt).getTime() >= startOfWeek), [notes, startOfWeek])
  const companiesThisWeek = useMemo(() => companies.filter(entry => {
    const d = new Date(entry.date)
    return d.getTime() >= startOfWeek
  }), [companies, startOfWeek])
  const recentCompanies = useMemo(() => [...companies]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5), [companies])
  const companyCounts = useMemo(() => companies.reduce((acc, c) => {
    acc[c.company] = (acc[c.company] || 0) + 1
    return acc
  }, {}), [companies])
  const trendingCompanies = useMemo(() => Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name), [companyCounts])
  const editorsPicks = useMemo(() => Array.from(new Set(companies.map(c => c.company))).sort().slice(0, 3), [companies])
  const allCompanyTags = useMemo(() => companyTags.flatMap(c => c.tags || []), [companyTags])
  const companyTagCounts = useMemo(() => allCompanyTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1
    return acc
  }, {}), [allCompanyTags])
  const topCompanyTags = useMemo(() => Object.entries(companyTagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3), [companyTagCounts])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-500 to-pink-400 text-white py-16 px-4 mb-10 rounded-b-3xl shadow-lg overflow-hidden">
        <div className="max-w-3xl mx-auto text-center z-10 relative">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">Research Smarter. Decide Faster.</h1>
          <p className="text-lg md:text-2xl font-medium mb-8 drop-shadow">Your AI-powered platform for company research, notes, and career decisions.</p>
          <Link
            to={user ? "/dashboard" : "/auth"}
            className="inline-block bg-white text-blue-700 font-bold px-8 py-3 rounded-lg shadow-lg text-lg hover:bg-blue-50 transition-colors duration-200"
          >
            {user ? "Go to Dashboard" : "Get Started"}
          </Link>
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute top-0 left-0 w-64 h-64 opacity-20 animate-bubble-move-1" viewBox="0 0 400 400" fill="none"><circle cx="200" cy="200" r="200" fill="white" /></svg>
          <svg className="absolute bottom-0 right-0 w-64 h-64 opacity-10 animate-bubble-move-2" viewBox="0 0 400 400" fill="none"><circle cx="200" cy="200" r="200" fill="white" /></svg>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Dashboard Summary Widget */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-xl shadow p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2 text-blue-900">Your Weekly Summary</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Top Companies This Week */}
                <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center transition-transform duration-200 cursor-pointer hover:scale-105 focus:scale-105 hover:shadow-blue-200 focus:shadow-blue-200 group animate-fade-in-card">
                  <div className="text-2xl mb-1 group-hover:animate-bounce group-focus:animate-bounce">🏆</div>
                  <div className="font-semibold text-blue-700 mb-1">Top Companies</div>
                  <ul className="text-sm text-gray-700 text-center">
                    {companiesThisWeek.length === 0 ? (
                      <li className="text-gray-400">No companies added</li>
                    ) : (
                      Object.entries(companiesThisWeek.reduce((acc, c) => {
                        acc[c.company] = (acc[c.company] || 0) + 1; return acc;
                      }, {}))
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([name, count]) => (
                          <li key={name}><span className="font-medium">{name}</span> <span className="text-xs text-gray-500">({count})</span></li>
                        ))
                    )}
                  </ul>
                </div>
                {/* Notes Added This Week */}
                <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center transition-transform duration-200 cursor-pointer hover:scale-105 focus:scale-105 hover:shadow-green-200 focus:shadow-green-200 group animate-fade-in-card">
                  <div className="text-2xl mb-1 group-hover:animate-bounce group-focus:animate-bounce">📝</div>
                  <div className="font-semibold text-green-700 mb-1">Notes Added</div>
                  <div className="text-2xl font-bold text-gray-800">{notesThisWeek.length}</div>
                  <div className="text-xs text-gray-500">this week</div>
                </div>
                {/* Most Active Tags */}
                <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center transition-transform duration-200 cursor-pointer hover:scale-105 focus:scale-105 hover:shadow-purple-200 focus:shadow-purple-200 group animate-fade-in-card">
                  <div className="text-2xl mb-1 group-hover:animate-bounce group-focus:animate-bounce">🏷️</div>
                  <div className="font-semibold text-purple-700 mb-1">Most Active Tags</div>
                  <ul className="text-sm text-gray-700 text-center">
                    {topCompanyTags.length > 0 ? (
                      topCompanyTags.map(([tag, count]) => (
                        <li key={tag}><span className="font-medium">{tag}</span> <span className="text-xs text-gray-500">({count})</span></li>
                      ))
                    ) : (
                      <li className="text-gray-400">No tags found<br /><span className="text-xs">(e.g., AI, SaaS, Fintech)</span></li>
                    )}
                  </ul>
                </div>
                {/* Saved Searches */}
                <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center transition-transform duration-200 cursor-pointer hover:scale-105 focus:scale-105 hover:shadow-pink-200 focus:shadow-pink-200 group animate-fade-in-card">
                  <div className="text-2xl mb-1 group-hover:animate-bounce group-focus:animate-bounce">🔖</div>
                  <div className="font-semibold text-pink-700 mb-1">Saved Searches</div>
                  <div className="text-gray-400 text-sm">Coming soon</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-white rounded-lg shadow-md p-6">
          {/* About This Web App */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-center">About Company Research</h2>
            <p className="text-gray-700 text-lg max-w-2xl mx-auto text-center">
              Company Research is a modern, intuitive tool designed to help you discover, track, and manage companies that matter to your work. Whether you're a market analyst, startup founder, or enterprise consultant, our platform helps you stay organized, find insights faster, and focus on what truly matters-decision making.<br /><br />
              With a clean design and powerful backend, Company Research turns hours of manual company tracking into minutes.
            </p>
          </section>

          {/* Why Use Company Research */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-center">Why Choose Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="flex items-center bg-blue-100 rounded-lg p-4 transition-transform duration-200 cursor-pointer hover:-rotate-2 hover:scale-105 hover:shadow-blue-200 animate-fade-in-card">
                <span className="text-2xl mr-3 group-hover:animate-wiggle">🔎</span>
                <span className="font-semibold">Fast Search</span> <span className="ml-2 text-gray-600">Instantly find companies that fit your criteria</span>
              </div>
              <div className="flex items-center bg-green-100 rounded-lg p-4 transition-transform duration-200 cursor-pointer hover:rotate-2 hover:scale-105 hover:shadow-green-200 animate-fade-in-card">
                <span className="text-2xl mr-3 group-hover:animate-wiggle">💾</span>
                <span className="font-semibold">Save & Sync</span> <span className="ml-2 text-gray-600">Keep your list synced across devices</span>
              </div>
              <div className="flex items-center bg-yellow-100 rounded-lg p-4 transition-transform duration-200 cursor-pointer hover:-rotate-3 hover:scale-105 hover:shadow-yellow-200 animate-fade-in-card">
                <span className="text-2xl mr-3 group-hover:animate-wiggle">📊</span>
                <span className="font-semibold">Organized Insights</span> <span className="ml-2 text-gray-600">Track notes, tags, and data in one place</span>
              </div>
              <div className="flex items-center bg-purple-100 rounded-lg p-4 transition-transform duration-200 cursor-pointer hover:rotate-3 hover:scale-105 hover:shadow-purple-200 animate-fade-in-card">
                <span className="text-2xl mr-3 group-hover:animate-wiggle">🔐</span>
                <span className="font-semibold">Secure by Design</span> <span className="ml-2 text-gray-600">Your data is protected with end-to-end encryption</span>
              </div>
              <div className="flex items-center bg-pink-100 rounded-lg p-4 transition-transform duration-200 cursor-pointer hover:-rotate-2 hover:scale-105 hover:shadow-pink-200 animate-fade-in-card">
                <span className="text-2xl mr-3 group-hover:animate-wiggle">🧠</span>
                <span className="font-semibold">Smart Suggestions</span> <span className="ml-2 text-gray-600">Discover similar or trending companies powered by AI</span>
              </div>
              <div className="flex items-center bg-orange-100 rounded-lg p-4 transition-transform duration-200 cursor-pointer hover:rotate-2 hover:scale-105 hover:shadow-orange-200 animate-fade-in-card">
                <span className="text-2xl mr-3 group-hover:animate-wiggle">🧮</span>
                <span className="font-semibold">Company Scoring</span> <span className="ml-2 text-gray-600">Score companies based on fit, potential, or performance using your own criteria </span>
              </div>
            </div>
          </section>

          {/* What Our Users Say - Testimonials Section */}
          <section className="mt-12 mb-12">
            <h2 className="text-2xl font-bold text-center mb-8">What Our Users Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-blue-50 p-6 rounded-lg shadow flex flex-col items-center transition-all duration-200 cursor-pointer hover:shadow-xl hover:bg-blue-100 animate-fade-in-card hover:scale-105">
                <div className="text-3xl mb-2 animate-fade-in-card">💬</div>
                <blockquote className="italic text-gray-700 mb-2 text-center">“Helped me shortlist 20 companies in 1 hour”</blockquote>
                <div className="font-bold text-blue-700">Market Analyst</div>
              </div>
              <div className="bg-green-50 p-6 rounded-lg shadow flex flex-col items-center transition-all duration-200 cursor-pointer hover:shadow-xl hover:bg-green-100 animate-fade-in-card hover:scale-105">
                <div className="text-3xl mb-2 animate-fade-in-card">💬</div>
                <blockquote className="italic text-gray-700 mb-2 text-center">"Easy to search, clean UI"</blockquote>
                <div className="font-bold text-green-700">Startup Founder</div>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg shadow flex flex-col items-center transition-all duration-200 cursor-pointer hover:shadow-xl hover:bg-purple-100 animate-fade-in-card hover:scale-105">
                <div className="text-3xl mb-2 animate-fade-in-card">💬</div>
                <blockquote className="italic text-gray-700 mb-2 text-center">“I love the trending companies and instant search!”</blockquote>
                <div className="font-bold text-purple-700">Software Engineer</div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-center">Get Started in 3 Simple Steps</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center transition-transform duration-200 cursor-pointer hover:scale-110 hover:shadow-blue-200 animate-fade-in-card group">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-3 text-3xl animate-pop group-hover:animate-wiggle">1</div>
                <div className="font-semibold mb-1">Create</div>
                <div className="text-gray-600 text-center">Add a new company with just a few clicks</div>
              </div>
              <div className="flex flex-col items-center transition-transform duration-200 cursor-pointer hover:scale-110 hover:shadow-green-200 animate-fade-in-card group">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-3 text-3xl animate-pop group-hover:animate-wiggle">2</div>
                <div className="font-semibold mb-1">Search & Discover</div>
                <div className="text-gray-600 text-center">Explore thousands of company profiles</div>
              </div>
              <div className="flex flex-col items-center transition-transform duration-200 cursor-pointer hover:scale-110 hover:shadow-purple-200 animate-fade-in-card group">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-3 text-3xl animate-pop group-hover:animate-wiggle">3</div>
                <div className="font-semibold mb-1">Save & Manage</div>
                <div className="text-gray-600 text-center">Organize and access your list anytime</div>
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-center">Perfect For</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="flex items-center bg-blue-100 rounded-lg p-4 transition-transform duration-200 cursor-pointer hover:scale-110 hover:shadow-2xl animate-fade-in-card">
                <span className="text-2xl mr-3 animate-pop">📈</span>
                <span className="font-semibold">Investors</span> <span className="ml-2 text-gray-600">Track promising startups and industries</span>
              </div>
              <div className="flex items-center bg-green-100 rounded-lg p-4 transition-transform duration-200 cursor-pointer hover:scale-110 hover:shadow-2xl animate-fade-in-card">
                <span className="text-2xl mr-3 animate-pop">🧩</span>
                <span className="font-semibold">Business Consultants</span> <span className="ml-2 text-gray-600">Maintain client lists and research logs</span>
              </div>
              <div className="flex items-center bg-yellow-100 rounded-lg p-4 transition-transform duration-200 cursor-pointer hover:scale-110 hover:shadow-2xl animate-fade-in-card">
                <span className="text-2xl mr-3 animate-pop">🛠️</span>
                <span className="font-semibold">Sales Teams</span> <span className="ml-2 text-gray-600">Build lead databases with context</span>
              </div>
              <div className="flex items-center bg-purple-100 rounded-lg p-4 transition-transform duration-200 cursor-pointer hover:scale-110 hover:shadow-2xl animate-fade-in-card">
                <span className="text-2xl mr-3 animate-pop">🎯</span>
                <span className="font-semibold">Market Researchers</span> <span className="ml-2 text-gray-600">Discover patterns and trends</span>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-center">Frequently Asked Questions</h2>
            <div className="max-w-2xl mx-auto">
              <FAQ />
            </div>
          </section>

          {/* Contact Us */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-center">We're Here to Help</h2>
            <div className="bg-blue-50 rounded-lg p-6 max-w-xl mx-auto text-center">
              <p className="text-lg text-gray-700 mb-4">Have feedback, a feature request, or need help?</p>
              <div className="mb-2">📧 <span className="font-semibold">Email us at:</span> <a href="mailto:support@companyresearch.app" className="text-blue-700 underline">support@companyresearch.app</a></div>
              <div>💬 Or use our live chat feature on the bottom-right corner.</div>
            </div>
          </section>


          {/* Roadmap / Coming Soon Section */}
          <section className="mt-16 flex justify-center">
            <div className="w-full max-w-2xl bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 border border-blue-100 rounded-2xl shadow-lg p-8 flex flex-col items-center">
              <div className="mb-4">
                <span className="inline-block bg-gradient-to-r from-blue-400 to-pink-400 text-white rounded-full p-4 shadow-lg text-4xl animate-pop group-hover:animate-wiggle">🚀</span>
              </div>
              <h2 className="text-2xl font-bold text-center mb-6 text-blue-900">Coming Soon</h2>
              <ul className="space-y-5 w-full">
                <li className="flex items-center text-lg text-blue-900 transition-transform duration-200 cursor-pointer hover:scale-105 hover:bg-blue-50 rounded-xl px-2 animate-fade-in-card group">
                  <span className="text-2xl mr-3 animate-pop group-hover:animate-wiggle">🔔</span>
                  <span>Notification alerts for company updates</span>
                </li>
                <li className="flex items-center text-lg text-purple-900 transition-transform duration-200 cursor-pointer hover:scale-105 hover:bg-purple-50 rounded-xl px-2 animate-fade-in-card group">
                  <span className="text-2xl mr-3 animate-pop group-hover:animate-wiggle">📅</span>
                  <span>Calendar view for company milestones</span>
                </li>
                <li className="flex items-center text-lg text-pink-900 transition-transform duration-200 cursor-pointer hover:scale-105 hover:bg-pink-50 rounded-xl px-2 animate-fade-in-card group">
                  <span className="text-2xl mr-3 animate-pop group-hover:animate-wiggle">📥</span>
                  <span>Data import from LinkedIn or Crunchbase</span>
                </li>
                <li className="flex items-center text-lg text-indigo-900 transition-transform duration-200 cursor-pointer hover:scale-105 hover:bg-indigo-50 rounded-xl px-2 animate-fade-in-card group">
                  <span className="text-2xl mr-3 animate-pop group-hover:animate-wiggle">🧠</span>
                  <span>AI-generated company summaries</span>
                </li>
              </ul>
            </div>
          </section>

          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          ) : (
            <div className="text-center">
              {/* <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {message || 'Welcome to Company Research'}
              </h1>
              <p className="text-gray-600 mb-6">
                A simple and elegant way to manage your companies.
              </p> */}
              {/* Dynamic Metrics Section */}
              {/* <div className="mb-8">
                {metricsLoading ? (
                  <div className="flex items-center justify-center text-gray-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                    <span className="ml-2">Loading your activity summary...</span>
                  </div>
                ) : (
                  <div className="text-lg font-medium text-blue-700 bg-blue-50 rounded-lg px-6 py-3 inline-block shadow">
                    {`You've added ${companiesThisWeek.length} compan${companiesThisWeek.length === 1 ? 'y' : 'ies'} and ${notesThisWeek.length} note${notesThisWeek.length === 1 ? '' : 's'} this week`}
                  </div>
                )}
              </div> */}

              {/* Featured/Trending Companies Section */}
              {/* <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured & Trending Companies</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> */}
                  {/* Trending Companies */}
                  {/* <div className="bg-yellow-50 p-4 rounded-lg shadow flex flex-col items-center">
                    <h3 className="text-lg font-semibold text-yellow-700 mb-2">Trending</h3>
                    <ul className="space-y-2 w-full">
                      {trendingCompanies.map(name => (
                        <li key={name}>
                          <Link to={`/dashboard/${encodeURIComponent(name)}`} className="text-blue-700 hover:underline font-medium">
                            {name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div> */}
                  {/* Recently Added */}
                  {/* <div className="bg-green-50 p-4 rounded-lg shadow flex flex-col items-center">
                    <h3 className="text-lg font-semibold text-green-700 mb-2">Recently Added</h3>
                    <ul className="space-y-2 w-full">
                      {recentCompanies.map(c => (
                        <li key={c.company + c.date}>
                          <Link to={`/dashboard/${encodeURIComponent(c.company)}`} className="text-blue-700 hover:underline font-medium">
                            {c.company}
                          </Link>
                          <span className="ml-2 text-xs text-gray-500">{new Date(c.date).toLocaleDateString()}</span>
                        </li>
                      ))}
                    </ul>
                  </div> */}
                  {/* Editor's Picks */}
                  {/* <div className="bg-purple-50 p-4 rounded-lg shadow flex flex-col items-center">
                    <h3 className="text-lg font-semibold text-purple-700 mb-2">Editor's Picks</h3>
                    <ul className="space-y-2 w-full">
                      {editorsPicks.map(name => (
                        <li key={name}>
                          <Link to={`/dashboard/${encodeURIComponent(name)}`} className="text-blue-700 hover:underline font-medium">
                            {name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div> */}

              {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-blue-100 p-6 rounded-lg">
                  <div className="text-blue-600 text-2xl mb-2">📝</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Note</h3>
                  <p className="text-gray-600">Create and manage your company</p>
                </div>
                <div className="bg-green-100 p-6 rounded-lg">
                  <div className="text-green-600 text-2xl mb-2">🔍</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Search & Find</h3>
                  <p className="text-gray-600">Quickly find what you're looking for</p>
                </div>
                <div className="bg-purple-100 p-6 rounded-lg">
                  <div className="text-purple-600 text-2xl mb-2">💾</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Save & Sync</h3>
                  <p className="text-gray-600">Your potential companies that are fit for your work</p>
                </div>
              </div> */}

                
            </div>
          )}
        </div>
      </main>
      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.25s ease-out;
        }
        @keyframes fade-in-card {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-card {
          animation: fade-in-card 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes bubble-move-1 {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
          100% { transform: translateY(0) scale(1); }
        }
        .animate-bubble-move-1 {
          animation: bubble-move-1 6s ease-in-out infinite;
        }
        @keyframes bubble-move-2 {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(30px) scale(0.97); }
          100% { transform: translateY(0) scale(1); }
        }
        .animate-bubble-move-2 {
          animation: bubble-move-2 7s ease-in-out infinite;
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-6deg); }
          50% { transform: rotate(6deg); }
        }
        .group-hover\:animate-wiggle:hover, .group-focus\:animate-wiggle:focus {
          animation: wiggle 0.4s;
        }
        @keyframes pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .animate-pop:hover, .animate-pop:focus {
          animation: pop 0.4s;
        }
      `}</style>
    </div>
  )
}

// FAQ Accordion Component
function FAQ() {
  const [open, setOpen] = useState(null)
  const faqs = [
    {
      q: 'Is this app free to use?',
      a: 'Yes! Basic features are free forever. Advanced tools will be available in the Pro version.'
    },
    {
      q: 'Can I export my data?',
      a: 'Absolutely. You can export your company list in CSV format.'
    },
    {
      q: 'How is my data stored?',
      a: 'All data is encrypted and never shared with third parties.'
    }
  ]
  return (
    <div className="space-y-4">
      {faqs.map((faq, idx) => (
        <div key={idx} className="border rounded-lg bg-white transition-transform duration-200 cursor-pointer hover:scale-105 hover:shadow-blue-100 animate-fade-in-card">
          <button
            className="w-full flex justify-between items-center px-4 py-3 text-left font-semibold text-blue-700 focus:outline-none group"
            onClick={() => setOpen(open === idx ? null : idx)}
            aria-expanded={open === idx}
          >
            <span className="transition-transform duration-200 group-hover:scale-105 group-hover:animate-wiggle">{faq.q}</span>
            <span>{open === idx ? '−' : '+'}</span>
          </button>
          {open === idx && (
            <div className="px-4 pb-4 text-gray-700 border-t animate-fade-in">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 