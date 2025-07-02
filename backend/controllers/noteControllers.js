const Note = require('../models/Note');

/**
 * Get all notes
 */
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error('Error fetching notes:', err.message);
    res.status(500).json({ 
      error: 'An error occurred while fetching notes.',
      details: err.message 
    });
  }
};

/**
 * Get a single note by ID
 */
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (err) {
    console.error('Error fetching note:', err.message);
    res.status(500).json({ 
      error: 'An error occurred while fetching the note.',
      details: err.message 
    });
  }
};

/**
 * Create a new note
 */
const createNote = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const newNote = new Note({ title, content, tags });
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (err) {
    console.error('Error creating note:', err.message);
    res.status(400).json({ 
      error: 'An error occurred while creating the note.',
      details: err.message 
    });
  }
};

/**
 * Update a note
 */
const updateNote = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content, tags },
      { new: true, runValidators: true }
    );
    
    if (!updatedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json(updatedNote);
  } catch (err) {
    console.error('Error updating note:', err.message);
    res.status(400).json({ 
      error: 'An error occurred while updating the note.',
      details: err.message 
    });
  }
};

/**
 * Delete a note
 */
const deleteNote = async (req, res) => {
  try {
    const deletedNote = await Note.findByIdAndDelete(req.params.id);
    if (!deletedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error('Error deleting note:', err.message);
    res.status(500).json({ 
      error: 'An error occurred while deleting the note.',
      details: err.message 
    });
  }
};

module.exports = { 
  getNotes, 
  getNoteById, 
  createNote, 
  updateNote, 
  deleteNote 
};
