import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'

export default function Note() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' })
  const [editingNote, setEditingNote] = useState(null)
  const [tagFilter, setTagFilter] = useState('')

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const response = await axios.get('/api/notes')
      setNotes(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching notes:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const noteToSave = {
        ...newNote,
        tags: newNote.tags
          ? newNote.tags.split(',').map(t => t.trim()).filter(Boolean)
          : []
      }
      if (editingNote) {
        await axios.put(`/api/notes/${editingNote._id}`, noteToSave)
        setEditingNote(null)
      } else {
        await axios.post('/api/notes', noteToSave)
      }
      setNewNote({ title: '', content: '', tags: '' })
      fetchNotes()
    } catch (error) {
      console.error('Error saving note:', error)
      // For better UX, display an error message to the user here
    }
  }

  const handleEdit = (note) => {
    setEditingNote(note)
    setNewNote({ title: note.title, content: note.content, tags: (note.tags || []).join(', ') })
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/notes/${id}`)
      fetchNotes()
    } catch (error) {
      console.error('Error deleting note:', error)
      // For better UX, display an error message to the user here
    }
  }

  const handleCancel = () => {
    setEditingNote(null)
    setNewNote({ title: '', content: '', tags: '' })
  }

  // Memoized unique tags from notes
  const allTags = useMemo(() => Array.from(new Set(notes.flatMap(n => n.tags || []))), [notes])
  // Memoized filtered notes by tag
  const filteredNotes = useMemo(() => tagFilter ? notes.filter(n => (n.tags || []).includes(tagFilter)) : notes, [tagFilter, notes])

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Note</h1>
          
          {/* Add/Edit Note Form */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingNote ? 'Edit Company Note' : 'Add New Company Note'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  id="content"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your notes about this company..."
                  required
                />
              </div>
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  value={newNote.tags}
                  onChange={e => setNewNote({ ...newNote, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. AI, SaaS, Fintech"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  {editingNote ? 'Update Note' : 'Add Note'}
                </button>
                {editingNote && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

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

          {/* Notes List */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Company Notes</h2>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading...</span>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <p className="text-gray-600">No notes found{tagFilter ? ` for tag "${tagFilter}"` : ''}. Add your first note above!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredNotes.map((note) => (
                  <div key={note._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(note)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(note._id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 whitespace-pre-wrap">{note.content}</p>
                    {note.tags && note.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {note.tags.map(tag => (
                          <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="text-sm text-gray-400 mt-3">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 