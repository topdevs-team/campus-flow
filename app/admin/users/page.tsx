'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2, Search, Users } from 'lucide-react'

type UserRow = {
  id: string
  email: string
  full_name: string | null
  major: string | null
  year: string | null
  is_admin: boolean | null
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true)
      setError('')

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('id, email, full_name, major, year, is_admin, created_at')
        .order('created_at', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
        setLoading(false)
        return
      }

      setUsers((data as UserRow[]) ?? [])
      setLoading(false)
    }

    loadUsers()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter((user) =>
      [user.email, user.full_name || '', user.major || '', user.year || '']
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [users, query])

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Users</h1>
            <p className="text-zinc-500 mt-1">All registered users in Campus Flow</p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users"
              className="w-full border border-zinc-300 rounded-lg pl-9 pr-3 py-2 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-zinc-500">
            <Loader2 className="animate-spin w-5 h-5 mx-auto mb-2" />
            Loading users...
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : filtered.length === 0 ? (
          <div className="border border-zinc-200 bg-white rounded-xl p-10 text-center text-zinc-500">
            <Users className="mx-auto mb-3 text-zinc-300" />
            No users found.
          </div>
        ) : (
          <div className="border border-zinc-200 bg-white rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Name</th>
                    <th className="text-left px-4 py-3 font-semibold">Email</th>
                    <th className="text-left px-4 py-3 font-semibold">Major</th>
                    <th className="text-left px-4 py-3 font-semibold">Year</th>
                    <th className="text-left px-4 py-3 font-semibold">Role</th>
                    <th className="text-left px-4 py-3 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user.id} className="border-b border-zinc-100 last:border-b-0">
                      <td className="px-4 py-3 text-zinc-800">{user.full_name || 'No name'}</td>
                      <td className="px-4 py-3 text-zinc-600">{user.email}</td>
                      <td className="px-4 py-3 text-zinc-600">{user.major || '-'}</td>
                      <td className="px-4 py-3 text-zinc-600">{user.year || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${user.is_admin ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-700'}`}>
                          {user.is_admin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-500">{new Date(user.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
