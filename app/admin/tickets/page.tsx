'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Ticket, Loader2, Check, Clock, AlertCircle } from 'lucide-react'

interface TicketData {
  id: string
  title: string
  description: string
  category: string
  status: 'open' | 'in-progress' | 'resolved'
  priority: 'low' | 'medium' | 'high'
  created_at: string
  user_id: string
}

const statusConfig = {
  open: { icon: AlertCircle, color: 'bg-red-50 text-red-600', label: 'Open' },
  'in-progress': { icon: Clock, color: 'bg-amber-50 text-amber-600', label: 'In Progress' },
  resolved: { icon: Check, color: 'bg-green-50 text-green-600', label: 'Resolved' },
}

export default function AdminTicketsPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<TicketData[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('')

  useEffect(() => {
    if (user) loadTickets()
  }, [user])

  const loadTickets = async () => {
    try {
      const { data } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })

      setTickets(data || [])
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      await supabase.from('tickets').update({ status: newStatus }).eq('id', ticketId)
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus as TicketData['status'] } : t))
      )
    } catch (error) {
      console.error('Error updating ticket:', error)
    }
  }

  const filteredTickets = filterStatus
    ? tickets.filter((t) => t.status === filterStatus)
    : tickets

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Support Tickets</h1>
        <p className="text-zinc-500 mt-1">View and manage all campus support tickets</p>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 mb-6">
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

      {/* Ticket List */}
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
                    <CardDescription className="mt-1">{ticket.description}</CardDescription>
                  </div>
                  <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 shrink-0 ml-4 ${config.color}`}>
                    <Icon size={14} />
                    <span className="text-xs font-medium">{config.label}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-zinc-500">
                    <span className="capitalize">
                      <strong className="text-zinc-700">Category:</strong> {ticket.category}
                    </span>
                    <span>
                      <strong className="text-zinc-700">Priority:</strong>{' '}
                      <span
                        className={
                          ticket.priority === 'high'
                            ? 'text-red-600 font-medium'
                            : ticket.priority === 'medium'
                            ? 'text-amber-600 font-medium'
                            : 'text-green-600 font-medium'
                        }
                      >
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </span>
                    </span>
                    <span className="text-xs text-zinc-400">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <select
                    value={ticket.status}
                    onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                    className="px-3 py-1.5 border border-zinc-200 rounded-md text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300"
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
        <div className="text-center py-20">
          <Ticket size={48} className="mx-auto mb-4 text-zinc-300" />
          <p className="text-zinc-400">
            {filterStatus ? 'No tickets with this status.' : 'No support tickets yet.'}
          </p>
        </div>
      )}
    </div>
  )
}
