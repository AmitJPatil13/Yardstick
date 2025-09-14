'use client'

import { useState } from 'react'

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string
    email: string
  }
}

interface NotesListProps {
  notes: Note[]
  token: string
  onNoteDeleted: (noteId: string) => void
}

export default function NotesList({ notes, token, onNoteDeleted }: NotesListProps) {
  const [expandedNote, setExpandedNote] = useState<string | null>(null)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        onNoteDeleted(noteId)
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete note')
      }
    } catch (error) {
      alert('Network error while deleting note')
    }
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note.id)
    setEditTitle(note.title)
    setEditContent(note.content)
  }

  const handleSaveEdit = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
        }),
      })

      if (response.ok) {
        // Refresh the page or update the notes list
        window.location.reload()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update note')
      }
    } catch (error) {
      alert('Network error while updating note')
    }
  }

  const handleCancelEdit = () => {
    setEditingNote(null)
    setEditTitle('')
    setEditContent('')
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No notes yet. Create your first note!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <div key={note.id} className="bg-white shadow rounded-lg p-6">
          {editingNote === note.id ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-500 text-gray-900"
                placeholder="Note title"
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-500 text-gray-900"
                placeholder="Note content"
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSaveEdit(note.id)}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(note)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="text-gray-600 mb-2">
                <p className="text-sm">
                  By {note.author.name} • {new Date(note.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="text-gray-800">
                {expandedNote === note.id ? (
                  <div>
                    <p className="whitespace-pre-wrap">{note.content}</p>
                    <button
                      onClick={() => setExpandedNote(null)}
                      className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      Show less
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="whitespace-pre-wrap">
                      {note.content.length > 200 
                        ? `${note.content.substring(0, 200)}...` 
                        : note.content
                      }
                    </p>
                    {note.content.length > 200 && (
                      <button
                        onClick={() => setExpandedNote(note.id)}
                        className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        Show more
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
