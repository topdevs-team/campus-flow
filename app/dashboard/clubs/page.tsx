'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Building2, Clock3, ExternalLink, Search } from 'lucide-react'

type ClubRecruitment = {
  id: string
  club_name: string
  deadline: string
  form_url: string
  departments: string[] | null
  description: string | null
  status: 'open' | 'closed'
}

export default function ClubsPage() {
  const [items, setItems] = useState<ClubRecruitment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('club_recruitments')
        .select('*')
        .eq('status', 'open')
        .order('deadline', { ascending: true })

      if (fetchError) {
        setError(fetchError.message)
        setLoading(false)
        return
      }

      setItems((data as ClubRecruitment[]) ?? [])
      setLoading(false)
    }

    load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => {
      const departments = item.departments?.join(' ').toLowerCase() ?? ''
      return (
        item.club_name.toLowerCase().includes(q) ||
        departments.includes(q) ||
        (item.description ?? '').toLowerCase().includes(q)
      )
    })
  }, [items, query])

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-black">Club Recruitments</h1>
          <p className="text-zinc-500 text-sm mt-2 uppercase tracking-widest font-bold">
            One place for all active club openings
          </p>
          <div className="w-16 h-0.5 bg-black mt-4" />
        </div>

        <div className="relative max-w-lg">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by club, department, or keyword"
            className="w-full border border-zinc-300 bg-white rounded-lg pl-9 pr-3 py-2 text-sm"
          />
        </div>

        {loading ? <p className="text-zinc-500">Loading recruitments...</p> : null}
        {error ? <p className="text-red-600 text-sm">{error}</p> : null}
        {!loading && !error && filtered.length === 0 ? (
          <p className="text-zinc-500">No active recruitments found.</p>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((item) => {
            const isDeadlinePassed = new Date(item.deadline).getTime() < Date.now()
            return (
              <article key={item.id} className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1">
                      <Building2 size={14} className="text-zinc-700" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Club</span>
                    </div>
                    <h2 className="mt-3 text-xl font-black tracking-tight text-zinc-900 truncate">{item.club_name}</h2>
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${isDeadlinePassed ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {isDeadlinePassed ? 'Deadline Passed' : 'Open'}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                  <Clock3 size={14} className="text-zinc-500" />
                  <p className="text-sm text-zinc-700">
                    <span className="font-semibold">Deadline:</span> {new Date(item.deadline).toLocaleString()}
                  </p>
                </div>

                {item.departments?.length ? (
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Departments</p>
                    <div className="flex flex-wrap gap-2">
                      {item.departments.map((department) => (
                        <span
                          key={`${item.id}-${department}`}
                          className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700"
                        >
                          {department}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {item.description ? <p className="mt-4 text-sm text-zinc-600 leading-relaxed">{item.description}</p> : null}

                <a
                  href={item.form_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-black"
                >
                  Open Submission Form
                  <ExternalLink size={14} />
                </a>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
