'use client'

import { FormEvent, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Plus, Trash2, Clock3, Building2 } from 'lucide-react'

type ClubRecruitment = {
  id: string
  club_name: string
  deadline: string
  form_url: string
  departments: string[] | null
  description: string | null
  status: 'open' | 'closed'
  created_at: string
}

export default function AdminClubsPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<ClubRecruitment[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [clubName, setClubName] = useState('')
  const [deadline, setDeadline] = useState('')
  const [formUrl, setFormUrl] = useState('')
  const [departments, setDepartments] = useState('')
  const [description, setDescription] = useState('')

  const loadRecruitments = async () => {
    setLoading(true)
    setLoadError(null)

    const { data, error: fetchError } = await supabase
      .from('club_recruitments')
      .select('*')
      .order('deadline', { ascending: true })

    if (fetchError) {
      const message = fetchError.message || 'Failed to load club recruitments.'
      const lower = message.toLowerCase()
      if (lower.includes('404') || lower.includes('club_recruitments') || lower.includes('relation')) {
        setLoadError('Club recruitments table is missing. Run scripts/club-recruitments.sql in Supabase SQL editor, then refresh.')
      } else {
        setLoadError(message)
      }
      setLoading(false)
      return
    }

    setItems((data as ClubRecruitment[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadRecruitments()
  }, [])

  const resetForm = () => {
    setClubName('')
    setDeadline('')
    setFormUrl('')
    setDepartments('')
    setDescription('')
  }

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user) return

    setSubmitError(null)

    const formData = new FormData(event.currentTarget)
    const clubNameValue = String(formData.get('club_name') || '').trim()
    const deadlineValue = String(formData.get('deadline') || '').trim()
    const formUrlValue = String(formData.get('form_url') || '').trim()
    const departmentsValue = String(formData.get('departments') || '').trim()
    const descriptionValue = String(formData.get('description') || '').trim()

    if (!clubNameValue || !deadlineValue || !formUrlValue) {
      const missing = [
        !clubNameValue ? 'club name' : '',
        !deadlineValue ? 'deadline' : '',
        !formUrlValue ? 'form URL' : '',
      ]
        .filter(Boolean)
        .join(', ')
      setSubmitError(`Required fields missing: ${missing}.`)
      return
    }

    const parsedDeadline = Date.parse(deadlineValue)
    if (Number.isNaN(parsedDeadline)) {
      setSubmitError('Invalid deadline format. Please choose a valid date/time.')
      return
    }

    const normalizedUrl = /^https?:\/\//i.test(formUrlValue) ? formUrlValue : `https://${formUrlValue}`
    if (!/^https?:\/\/.+/i.test(normalizedUrl)) {
      setSubmitError('Submission form URL must be a valid http/https link.')
      return
    }

    setSaving(true)

    const parsedDepartments = departmentsValue
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)

    const { error: insertError } = await supabase.from('club_recruitments').insert({
      club_name: clubNameValue,
      deadline: new Date(parsedDeadline).toISOString(),
      form_url: normalizedUrl,
      departments: parsedDepartments,
      description: descriptionValue || null,
      created_by: user.id,
      status: 'open',
    })

    setSaving(false)

    if (insertError) {
      setSubmitError(insertError.message)
      return
    }

    resetForm()
    loadRecruitments()
  }

  const toggleStatus = async (item: ClubRecruitment) => {
    const nextStatus = item.status === 'open' ? 'closed' : 'open'
    const { error: updateError } = await supabase
      .from('club_recruitments')
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id)

    if (updateError) {
      setSubmitError(updateError.message)
      return
    }

    loadRecruitments()
  }

  const removeItem = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('club_recruitments')
      .delete()
      .eq('id', id)

    if (deleteError) {
      setSubmitError(deleteError.message)
      return
    }

    loadRecruitments()
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Club Recruitments</h1>
          <p className="text-zinc-500 mt-1">Publish and manage all club openings in one place.</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Create Recruitment Post</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="club_name"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              placeholder="Club name"
              className="border border-zinc-300 rounded-lg px-3 py-2 text-sm"
            />
            <input
              name="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="border border-zinc-300 rounded-lg px-3 py-2 text-sm"
            />
            <input
              name="form_url"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              placeholder="Submission form URL"
              className="border border-zinc-300 rounded-lg px-3 py-2 text-sm"
            />
            <input
              name="departments"
              value={departments}
              onChange={(e) => setDepartments(e.target.value)}
              placeholder="Departments (comma-separated)"
              className="border border-zinc-300 rounded-lg px-3 py-2 text-sm"
            />
            <textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description (optional)"
              className="md:col-span-2 border border-zinc-300 rounded-lg px-3 py-2 text-sm min-h-[90px]"
            />

            <div className="md:col-span-2 flex items-center justify-between">
              <p className="text-sm text-red-600">{submitError ?? ''}</p>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
              >
                <Plus size={16} />
                {saving ? 'Publishing...' : 'Publish Recruitment'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Published Recruitments</h2>
          {loadError ? <p className="text-sm text-red-600 mb-3">{loadError}</p> : null}
          {loading ? (
            <p className="text-sm text-zinc-500">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-zinc-500">No recruitment posts yet.</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="border border-zinc-200 rounded-lg p-4 flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-zinc-500" />
                      <p className="font-semibold text-zinc-900">{item.club_name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-200 text-zinc-700'}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-600 inline-flex items-center gap-1">
                      <Clock3 size={14} />
                      Deadline: {new Date(item.deadline).toLocaleString()}
                    </p>
                    <p className="text-sm text-zinc-700 break-all">Form: {item.form_url}</p>
                    {item.departments?.length ? (
                      <p className="text-sm text-zinc-600">Departments: {item.departments.join(', ')}</p>
                    ) : null}
                    {item.description ? <p className="text-sm text-zinc-600">{item.description}</p> : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStatus(item)}
                      className="text-xs px-3 py-1.5 rounded-md border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                    >
                      Mark {item.status === 'open' ? 'Closed' : 'Open'}
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs px-3 py-1.5 rounded-md border border-red-300 text-red-600 hover:bg-red-50 inline-flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
