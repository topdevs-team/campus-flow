'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, Ticket, AlertCircle, Clock, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  totalUsers: number
  totalNotes: number
  totalTickets: number
  openTickets: number
  inProgressTickets: number
  resolvedTickets: number
}

interface RecentUser {
  id: string
  email: string
  full_name: string
  created_at: string
}

interface RecentTicket {
  id: string
  title: string
  status: string
  priority: string
  created_at: string
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalNotes: 0,
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
  })
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    try {
      const [
        { count: totalUsers },
        { count: totalNotes },
        { count: totalTickets },
        { count: openTickets },
        { count: inProgressTickets },
        { count: resolvedTickets },
        { data: recentUsersData },
        { data: recentTicketsData },
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('notes').select('*', { count: 'exact', head: true }),
        supabase.from('tickets').select('*', { count: 'exact', head: true }),
        supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'in-progress'),
        supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
        supabase.from('users').select('id, email, full_name, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('tickets').select('id, title, status, priority, created_at').order('created_at', { ascending: false }).limit(5),
      ])

      setStats({
        totalUsers: totalUsers ?? 0,
        totalNotes: totalNotes ?? 0,
        totalTickets: totalTickets ?? 0,
        openTickets: openTickets ?? 0,
        inProgressTickets: inProgressTickets ?? 0,
        resolvedTickets: resolvedTickets ?? 0,
      })
      setRecentUsers(recentUsersData || [])
      setRecentTickets(recentTicketsData || [])
    } catch (error) {
      console.error('Error loading admin dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-400" />
      </div>
    )
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', href: '/admin/users' },
    { label: 'Total Notes', value: stats.totalNotes, icon: FileText, color: 'text-green-600', bg: 'bg-green-50', href: '/admin/notes' },
    { label: 'Total Tickets', value: stats.totalTickets, icon: Ticket, color: 'text-purple-600', bg: 'bg-purple-50', href: '/admin/tickets' },
    { label: 'Open Tickets', value: stats.openTickets, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', href: '/admin/tickets' },
    { label: 'In Progress', value: stats.inProgressTickets, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', href: '/admin/tickets' },
    { label: 'Resolved', value: stats.resolvedTickets, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/admin/tickets' },
  ]

  const priorityColor: Record<string, string> = {
    high: 'text-red-600 bg-red-50',
    medium: 'text-amber-600 bg-amber-50',
    low: 'text-green-600 bg-green-50',
  }

  const statusColor: Record<string, string> = {
    open: 'text-red-600 bg-red-50',
    'in-progress': 'text-amber-600 bg-amber-50',
    resolved: 'text-green-600 bg-green-50',
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Admin Dashboard</h1>
        <p className="text-zinc-500 mt-1">Welcome back. Here&apos;s what&apos;s happening on Campus Flow.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {statCards.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500 font-medium">{label}</p>
                    <p className="text-3xl font-bold text-zinc-900 mt-1">{value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon size={22} className={color} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Recent Sign-ups</CardTitle>
            <Link href="/admin/users" className="text-xs text-blue-600 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-4">No users yet.</p>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-800">
                        {u.full_name || 'No name'}
                      </p>
                      <p className="text-xs text-zinc-400">{u.email}</p>
                    </div>
                    <p className="text-xs text-zinc-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Recent Tickets</CardTitle>
            <Link href="/admin/tickets" className="text-xs text-blue-600 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentTickets.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-4">No tickets yet.</p>
            ) : (
              <div className="space-y-3">
                {recentTickets.map((t) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-sm font-medium text-zinc-800 truncate">{t.title}</p>
                      <p className="text-xs text-zinc-400">
                        {new Date(t.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[t.priority] || ''}`}>
                        {t.priority}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[t.status] || ''}`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
