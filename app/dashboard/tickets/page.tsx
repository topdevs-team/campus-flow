'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Ticket, Plus, Loader2, Check, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface TicketData {
  id: string
  title: string
  description: string
  category: string
  status: 'open' | 'in-progress' | 'resolved'
  priority: 'low' | 'medium' | 'high'
  created_at: string
}

const statusConfig = {
  open: { icon: AlertCircle, color: 'bg-red-50 text-red-600', label: 'Open' },
  'in-progress': { icon: Clock, color: 'bg-yellow-50 text-yellow-600', label: 'In Progress' },
  resolved: { icon: Check, color: 'bg-green-50 text-green-600', label: 'Resolved' },
}

export default function TicketsPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<TicketData[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')

  useEffect(() => {
    if (user) loadTickets()
  }, [user])

  const loadTickets = async () => {
    try {
      const { data } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
      setTickets(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { error } = await supabase.from('tickets').insert({
        user_id: user?.id,
        title,
        description,
        category: category || 'general',
        status: 'open',
        priority,
      })
      if (error) throw error
      setTitle(''); setDescription(''); setCategory(''); setPriority('medium')
      setShowForm(false)
      await loadTickets()
      toast.success('Ticket submitted')
    } catch {
      toast.error('Failed to submit ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredTickets = filterStatus
    ? tickets.filter((t) => t.status === filterStatus)
    : tickets

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Support Tickets</h1>
        <p className="text-zinc-500 mt-1 text-sm">Submit and track your campus support requests</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 bg-black text-white hover:bg-zinc-800">
          <Plus size={16} /> New Ticket
        </Button>
        <div className="flex gap-2">
          {['', 'open', 'in-progress', 'resolved'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filterStatus === s
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
              }`}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create Support Ticket</CardTitle>
            <CardDescription>Describe your issue and we&apos;ll help you resolve it</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Title</label>
                <Input placeholder="Brief description of your issue" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Description</label>
                <textarea
                  placeholder="Detailed description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300">
                    <option value="">Select category</option>
                    <option value="housing">Housing</option>
                    <option value="academics">Academics</option>
                    <option value="it">IT Support</option>
                    <option value="facilities">Facilities</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')} className="w-full px-3 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting} className="bg-black text-white hover:bg-zinc-800">
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {filteredTickets.map((ticket) => {
          const config = statusConfig[ticket.status] || statusConfig.open
          const Icon = config.icon
          return (
            <Card key={ticket.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{ticket.title}</CardTitle>
                    <CardDescription className="mt-0.5">{ticket.description}</CardDescription>
                  </div>
                  <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 shrink-0 ml-4 text-xs font-medium ${config.color}`}>
                    <Icon size={13} /> {config.label}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-zinc-500">
                  <span><strong className="text-zinc-700">Category:</strong> {ticket.category}</span>
                  <span>
                    <strong className="text-zinc-700">Priority:</strong>{' '}
                    <span className={ticket.priority === 'high' ? 'text-red-600 font-semibold' : ticket.priority === 'medium' ? 'text-amber-600 font-semibold' : 'text-green-600 font-semibold'}>
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                    </span>
                  </span>
                  <span className="text-xs text-zinc-400">{new Date(ticket.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-20">
          <Ticket size={48} className="mx-auto mb-4 text-zinc-300" />
          <p className="text-zinc-400">{filterStatus ? 'No tickets with this status.' : 'No support tickets yet.'}</p>
          <p className="text-zinc-400 text-sm mt-1">Click &quot;New Ticket&quot; to submit one.</p>
        </div>
      )}
    </div>
  )
}
