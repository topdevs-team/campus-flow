'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FileText, Upload, Trash2, Loader2, Plus } from 'lucide-react'

interface Note {
  id: string
  title: string
  course: string
  pdf_name?: string
  created_at: string
}

export default function NotesPage() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [course, setCourse] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [filterCourse, setFilterCourse] = useState('')

  useEffect(() => {
    if (user) {
      loadNotes()
    }
  }, [user])

  const loadNotes = async () => {
    try {
      const { data } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      setNotes(data || [])
    } catch (error) {
      console.error('Error loading notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title) return

    setUploading(true)
    try {
      // Upload file to Supabase storage
      const fileName = `${user?.id}/${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('notes')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('notes')
        .getPublicUrl(fileName)

      // Create note record
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .insert({
          user_id: user?.id,
          title,
          course: course || 'Uncategorized',
          pdf_url: publicUrlData.publicUrl,
          pdf_name: file.name,
        })
        .select()

      if (noteError) throw noteError

      setTitle('')
      setCourse('')
      setFile(null)
      setShowForm(false)
      await loadNotes()
    } catch (error) {
      console.error('Error uploading note:', error)
    } finally {
      setUploading(false)
    }
  }

  const deleteNote = async (noteId: string) => {
    try {
      await supabase.from('notes').delete().eq('id', noteId)
      await loadNotes()
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const filteredNotes = filterCourse
    ? notes.filter((note) => note.course.toLowerCase().includes(filterCourse.toLowerCase()))
    : notes

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Notes</h1>
        <p className="text-slate-600">Upload and organize your class notes</p>
      </div>

      <div className="flex gap-4 mb-6">
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus size={18} />
          Upload Note
        </Button>
        <Input
          placeholder="Filter by course..."
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload a Note</CardTitle>
            <CardDescription>Add a new PDF note to your collection</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Note Title</label>
                <Input
                  type="text"
                  placeholder="e.g., Chapter 5 Notes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Course</label>
                <Input
                  type="text"
                  placeholder="e.g., CS 101"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">PDF File</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <Card key={note.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{note.title}</CardTitle>
                  <CardDescription>{note.course}</CardDescription>
                </div>
                <FileText className="text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500 mb-4">
                {new Date(note.created_at).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(`/dashboard/notes/${note.id}`, '_blank')}
                >
                  View
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteNote(note.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <Card className="text-center py-12">
          <Upload size={48} className="mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600">No notes yet. Upload your first note to get started!</p>
        </Card>
      )}
    </div>
  )
}
