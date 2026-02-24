'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FileText, Loader2, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

type NoteRow = {
  id: string
  title: string
  course: string | null
  pdf_url: string | null
  pdf_name: string | null
  user_id: string
  created_at: string
}

export default function AdminNotesPage() {
  const [notes, setNotes] = useState<NoteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const loadNotes = async () => {
    setLoading(true)
    setError('')
    const { data, error: fetchError } = await supabase
      .from('notes')
      .select('id, title, course, pdf_url, pdf_name, user_id, created_at')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    setNotes((data as NoteRow[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadNotes()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return notes
    return notes.filter((note) =>
      [note.title, note.course || '', note.pdf_name || '', note.user_id].join(' ').toLowerCase().includes(q),
    )
  }, [notes, query])

  const deleteNote = async (noteId: string) => {
    const { error: deleteError } = await supabase.from('notes').delete().eq('id', noteId)
    if (deleteError) {
      toast.error(deleteError.message)
      return
    }
    toast.success('Note deleted')
    loadNotes()
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Notes</h1>
            <p className="text-zinc-500 mt-1">Community-wide notes uploaded by users</p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes"
              className="w-full border border-zinc-300 rounded-lg pl-9 pr-3 py-2 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-zinc-500">
            <Loader2 className="animate-spin w-5 h-5 mx-auto mb-2" />
            Loading notes...
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : filtered.length === 0 ? (
          <div className="border border-zinc-200 bg-white rounded-xl p-10 text-center text-zinc-500">
            <FileText className="mx-auto mb-3 text-zinc-300" />
            No notes found.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((note) => (
              <article key={note.id} className="border border-zinc-200 bg-white rounded-xl p-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-semibold text-zinc-900 truncate">{note.title}</h2>
                  <p className="text-sm text-zinc-600 mt-1">Course: {note.course || '-'}</p>
                  <p className="text-xs text-zinc-500 mt-1">Uploader: {note.user_id}</p>
                  <p className="text-xs text-zinc-400 mt-1">{new Date(note.created_at).toLocaleString()}</p>
                  {note.pdf_url ? (
                    <a
                      href={note.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-2 text-sm font-medium text-blue-600 hover:underline"
                    >
                      Open PDF
                    </a>
                  ) : null}
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="inline-flex items-center gap-1 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg px-3 py-1.5 text-sm"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
