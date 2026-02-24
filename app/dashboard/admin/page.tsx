'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Loader2, Plus, Ticket, AlertCircle, Clock3, CheckCircle2 } from 'lucide-react'

type TicketRow = {
  id: string
  title: string
  description: string | null
  category: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'open' | 'in-progress' | 'resolved'
  created_at: string
}

const statusStyles: Record<TicketRow['status'], string> = {
  open: 'bg-red-100 text-red-700',
  'in-progress': 'bg-amber-100 text-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700',
}

const priorityStyles: Record<TicketRow['priority'], string> = {
  low: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
}

export default function UserTicketsPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<TicketRow[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | TicketRow['status']>('all')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('general')
  const [priority, setPriority] = useState<TicketRow['priority']>('medium')

  const loadTickets = async () => {
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('tickets')
      .select('id, title, description, category, priority, status, created_at')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    setTickets((data as TicketRow[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (!user) return
    loadTickets()
  }, [user])

  const filteredTickets = useMemo(() => {
    if (filter === 'all') return tickets
    return tickets.filter((item) => item.status === filter)
  }, [tickets, filter])

  const counts = useMemo(
    () => ({
      all: tickets.length,
      open: tickets.filter((t) => t.status === 'open').length,
      inProgress: tickets.filter((t) => t.status === 'in-progress').length,
      resolved: tickets.filter((t) => t.status === 'resolved').length,
    }),
    [tickets],
  )

  const submitTicket = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user) return

    setError('')
    if (!title.trim()) {
      setError('Ticket title is required.')
      return
    }

    setSubmitting(true)
    const { error: insertError } = await supabase.from('tickets').insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      category,
      priority,
      status: 'open',
    })
    setSubmitting(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    setTitle('')
    setDescription('')
    setCategory('general')
    setPriority('medium')
    loadTickets()
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-black">Support Tickets</h1>
          <p className="text-zinc-500 text-sm mt-2 uppercase tracking-widest font-bold">
            Raise issues and track progress
          </p>
          <div className="w-20 h-0.5 bg-black mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={submitTicket} className="lg:col-span-1 border border-zinc-200 bg-white rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black tracking-tight text-zinc-900">Create Ticket</h2>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Support</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Issue title"
                className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="general">General</option>
                <option value="technical">Technical</option>
                <option value="hostel">Hostel</option>
                <option value="facilities">Facilities</option>
                <option value="academics">Academics</option>
                <option value="clubs">Clubs</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your issue"
                className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm min-h-[110px] bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketRow['priority'])}
                className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              Create Ticket
            </button>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </form>

          <section className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="border border-zinc-200 bg-white rounded-xl p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">All</p>
                <p className="text-2xl font-black text-zinc-900 mt-1">{counts.all}</p>
              </div>
              <div className="border border-zinc-200 bg-white rounded-xl p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Open</p>
                <p className="text-2xl font-black text-red-600 mt-1">{counts.open}</p>
              </div>
              <div className="border border-zinc-200 bg-white rounded-xl p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">In Progress</p>
                <p className="text-2xl font-black text-amber-600 mt-1">{counts.inProgress}</p>
              </div>
              <div className="border border-zinc-200 bg-white rounded-xl p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Resolved</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{counts.resolved}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(['all', 'open', 'in-progress', 'resolved'] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-3 py-1.5 text-sm rounded-full border ${
                    filter === value
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-zinc-700 border-zinc-300'
                  }`}
                >
                  {value === 'all' ? 'All' : value}
                </button>
              ))}
            </div>
          </section>
        </div>

        {loading ? (
          <div className="py-14 text-center text-zinc-500">
            <Loader2 className="animate-spin w-5 h-5 mx-auto mb-2" />
            Loading tickets...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="border border-zinc-200 bg-white rounded-2xl p-10 text-center text-zinc-500">
            <Ticket className="mx-auto mb-3 text-zinc-300" />
            No tickets found.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((item) => (
              <article key={item.id} className="border border-zinc-200 bg-white rounded-2xl p-4 md:p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-zinc-900 text-base">{item.title}</h2>
                    <p className="text-sm text-zinc-600 mt-1.5 leading-relaxed">{item.description || 'No description'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusStyles[item.status]}`}>
                    {item.status}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-100 text-zinc-600">
                    <AlertCircle size={12} />
                    Category: {item.category || 'general'}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${priorityStyles[item.priority]}`}>
                    <Clock3 size={12} />
                    Priority: {item.priority}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-100 text-zinc-600">
                    <CheckCircle2 size={12} />
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
