'use client'

import { useState, useEffect } from 'react'
import NotesList from './NotesList'
import CreateNoteForm from './CreateNoteForm'

interface User {
  id: string
  email: string
  name: string
  role: string
  tenantId: string
  tenantSlug: string
}

interface DashboardProps {
  user: User
  token: string
  onLogout: () => void
}

export default function Dashboard({ user, token, onLogout }: DashboardProps) {
  const [notes, setNotes] = useState([])
  const [tenant, setTenant] = useState<any>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotes()
    fetchTenantInfo()
  }, [])

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setNotes(data.notes)
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTenantInfo = async () => {
    // For now, we'll derive tenant info from user data
    // In a real app, you might have a separate endpoint
    setTenant({
      name: user.tenantSlug.charAt(0).toUpperCase() + user.tenantSlug.slice(1),
      slug: user.tenantSlug,
      plan: 'FREE' // Default assumption
    })
  }

  const handleNoteCreated = (newNote: any) => {
    setNotes([newNote, ...notes])
    setShowCreateForm(false)
  }

  const handleNoteDeleted = (noteId: string) => {
    setNotes(notes.filter((note: any) => note.id !== noteId))
  }

  const handleUpgrade = async () => {
    try {
      const response = await fetch(`/api/tenants/${user.tenantSlug}/upgrade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setTenant({ ...tenant, plan: 'PRO' })
        alert('Successfully upgraded to Pro!')
      } else {
        alert(data.error || 'Upgrade failed')
      }
    } catch (error) {
      alert('Network error during upgrade')
    }
  }

  const canUpgrade = user.role === 'ADMIN' && tenant?.plan === 'FREE'
  const isAtLimit = tenant?.plan === 'FREE' && notes.length >= 3

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Yardstick Notes
              </h1>
              <span className="ml-4 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                {tenant?.name} - {tenant?.plan}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user.name} ({user.role})
              </span>
              {canUpgrade && (
                <button
                  onClick={handleUpgrade}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Upgrade to Pro
                </button>
              )}
              <button
                onClick={onLogout}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Notes</h2>
            <button
              onClick={() => setShowCreateForm(true)}
              disabled={isAtLimit}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Note
            </button>
          </div>

          {isAtLimit && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800">
                You've reached the limit of 3 notes on the Free plan.
                {canUpgrade && (
                  <button
                    onClick={handleUpgrade}
                    className="ml-2 text-yellow-900 underline hover:no-underline"
                  >
                    Upgrade to Pro for unlimited notes
                  </button>
                )}
              </p>
            </div>
          )}

          {tenant?.plan === 'FREE' && (
            <div className="mb-4 text-sm text-gray-600">
              Notes used: {notes.length}/3
            </div>
          )}

          {showCreateForm && (
            <CreateNoteForm
              token={token}
              onNoteCreated={handleNoteCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          )}

          {loading ? (
            <div className="text-center py-8">Loading notes...</div>
          ) : (
            <NotesList
              notes={notes}
              token={token}
              onNoteDeleted={handleNoteDeleted}
            />
          )}
        </div>
      </main>
    </div>
  )
}
