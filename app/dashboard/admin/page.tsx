'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Ticket, Plus, Loader2, Check, Clock, AlertCircle } from 'lucide-react'

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

export default function AdminPage() {
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
    if (user) {
      loadTickets()
    }
  }, [user])

  const loadTickets = async () => {
    try {
      const { data } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      setTickets(data || [])
    } catch (error) {
      console.error('Error loading tickets:', error)
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

      setTitle('')
      setDescription('')
      setCategory('')
      setPriority('medium')
      setShowForm(false)
      await loadTickets()
    } catch (error) {
      console.error('Error creating ticket:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', ticketId)

      await loadTickets()
    } catch (error) {
      console.error('Error updating ticket:', error)
    }
  }

  const filteredTickets = filterStatus
    ? tickets.filter((ticket) => ticket.status === filterStatus)
    : tickets

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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Support Tickets</h1>
        <p className="text-slate-600">Submit and track campus support issues</p>
      </div>

      <div className="flex gap-4 mb-6">
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus size={18} />
          New Ticket
        </Button>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-md text-sm"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create Support Ticket</CardTitle>
            <CardDescription>Describe your issue and we'll help you resolve it</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  type="text"
                  placeholder="Brief description of your issue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  placeholder="Detailed description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  >
                    <option value="">Select category</option>
                    <option value="housing">Housing</option>
                    <option value="academics">Academics</option>
                    <option value="it">IT Support</option>
                    <option value="facilities">Facilities</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Ticket'}
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

      <div className="space-y-4">
        {filteredTickets.map((ticket) => {
          const config = statusConfig[ticket.status as keyof typeof statusConfig]
          const Icon = config.icon
          return (
            <Card key={ticket.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{ticket.title}</CardTitle>
                    <CardDescription>{ticket.description}</CardDescription>
                  </div>
                  <div className={`px-3 py-1 rounded-full flex items-center gap-1 ${config.color}`}>
                    <Icon size={16} />
                    <span className="text-sm font-medium">{config.label}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm">
                      <strong>Category:</strong> {ticket.category}
                    </p>
                    <p className="text-sm">
                      <strong>Priority:</strong>{' '}
                      <span className={ticket.priority === 'high' ? 'text-red-600' : ''}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <select
                    value={ticket.status}
                    onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-md text-sm"
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredTickets.length === 0 && (
        <Card className="text-center py-12">
          <Ticket size={48} className="mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600">
            {filterStatus ? 'No tickets with this status' : 'No support tickets yet'}
          </p>
        </Card>
      )}
    </div>
  )
}
