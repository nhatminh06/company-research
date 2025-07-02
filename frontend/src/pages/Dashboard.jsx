import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Dashboard() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [editId, setEditId] = useState(null)
  const [editData, setEditData] = useState({ company: '', info: '', date: '' })
  const [companyTags, setCompanyTags] = useState([])
  const [tagFilter, setTagFilter] = useState('')
  const navigate = useNavigate()

  // Fetch dashboard entries and company tags from backend on mount
  useEffect(() => {
    async function fetchEntries() {
      try {
        const res = await axios.get('/api/dashboard')
        setResults(res.data)
      } catch (err) {}
    }
    async function fetchCompanyTags() {
      try {
        const res = await axios.get('/api/company-ai-info')
        setCompanyTags(res.data)
      } catch (err) {}
    }
    fetchEntries()
    fetchCompanyTags()
  }, [])

  // Get all unique tags
  const allTags = Array.from(new Set(companyTags.flatMap(c => c.tags || [])))

  // Filtered companies by tag
  const filteredResults = tagFilter
    ? results.filter(r => {
        const company = companyTags.find(c => c.company === r.company)
        return company && (company.tags || []).includes(tagFilter)
      })
    : results

  // Add new entry to backend and update UI
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    const aiResult = {
      company: query,
      info: `AI-generated info about ${query}`,
      date: new Date().toLocaleString()
    }
    try {
      const res = await axios.post('/api/dashboard', aiResult)
      setResults([res.data, ...results])
    } catch (err) {
      // Optionally handle error
    }
    setQuery('')
  }

  // Start editing a row
  const startEdit = (entry) => {
    setEditId(entry._id)
    setEditData({ company: entry.company, info: entry.info, date: entry.date })
  }

  // Save edit
  const saveEdit = async (id) => {
    try {
      const res = await axios.put(`/api/dashboard/${id}`, editData)
      setResults(results.map(r => r._id === id ? res.data : r))
      setEditId(null)
    } catch (err) {
      // Optionally handle error
    }
  }

  // Cancel edit
  const cancelEdit = () => {
    setEditId(null)
  }

  // Delete entry
  const deleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return
    try {
      await axios.delete(`/api/dashboard/${id}`)
      setResults(results.filter(r => r._id !== id))
    } catch (err) {
      // Optionally handle error
    }
  }

  // Helper to get info status for a company
  const getInfoStatus = (company, backendInfo) => {
    const cacheKey = `companyAIInfo_${company}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { sources, info, summary } = JSON.parse(cached);
      if (sources || info || summary) {
        return 'Successfully loaded';
      }
    }
    if (backendInfo === 'Successfully loaded') return 'Successfully loaded';
    if (backendInfo === 'Failed to load') return 'Failed to load';
    return backendInfo || 'Loading...';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">AI Company Research Dashboard</h1>
          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Enter company name..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
            >
              Search
            </button>
          </form>

          {/* Tag Filter UI */}
          {allTags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <span className="font-medium text-gray-700">Filter by tag:</span>
              {allTags.map(tag => (
                <button
                  key={tag}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition ${tagFilter === tag ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200'}`}
                  onClick={() => setTagFilter(tag)}
                >
                  {tag}
                </button>
              ))}
              {tagFilter && (
                <button
                  className="ml-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700 border border-gray-300 hover:bg-gray-300"
                  onClick={() => setTagFilter('')}
                >
                  Clear
                </button>
              )}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Info</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result, idx) => (
                  <tr
                    key={result._id || idx}
                    className={'hover:bg-blue-50'}
                  >
                    {editId === result._id ? (
                      <>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={editData.company}
                            onChange={e => setEditData({ ...editData, company: e.target.value })}
                            className="px-2 py-1 border rounded w-full"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={editData.info}
                            onChange={e => setEditData({ ...editData, info: e.target.value })}
                            className="px-2 py-1 border rounded w-full"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={editData.date}
                            onChange={e => setEditData({ ...editData, date: e.target.value })}
                            className="px-2 py-1 border rounded w-full"
                          />
                        </td>
                        <td className="px-4 py-2 flex gap-2">
                          <button onClick={() => saveEdit(result._id)} className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded">Save</button>
                          <button onClick={cancelEdit} className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 rounded">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2 font-semibold text-blue-700 underline cursor-pointer" onClick={() => navigate(`/dashboard/${encodeURIComponent(result.company)}`)}>{result.company}</td>
                        <td className="px-4 py-2">{getInfoStatus(result.company, result.info)}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{result.date}</td>
                        <td className="px-4 py-2 flex gap-2">
                          <button onClick={() => startEdit(result)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded">Edit</button>
                          <button onClick={() => deleteEntry(result._id)} className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded">Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected && (
            <div className="mt-8 p-4 border rounded-lg bg-blue-50">
              <h2 className="text-xl font-bold mb-2">Details for {selected.company}</h2>
              <p><strong>Info:</strong> {selected.info}</p>
              <p><strong>Date:</strong> {selected.date}</p>
              <button
                className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 