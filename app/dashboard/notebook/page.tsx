'use client'

import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'

type HealthPayload = {
  uiBase: string
  apiBase: string
  ui: { ok: boolean; status: number; error?: string }
  api: { ok: boolean; status: number; error?: string }
}

export default function NotebookBridgePage() {
  const [health, setHealth] = useState<HealthPayload | null>(null)
  const [loading, setLoading] = useState(true)

  const loadHealth = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/open-notebook/health', { cache: 'no-store' })
      const payload = (await response.json()) as HealthPayload
      setHealth(payload)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHealth()
  }, [])

  const uiUrl = health?.uiBase || 'http://localhost:8502'
  const embeddedUiUrl = `${uiUrl.replace(/\/+$/, '')}/notebooks`

  return (
    <div className="min-h-screen px-6 py-8 md:px-8">
      <div className="max-w-7xl mx-auto space-y-5">
        <section className="rounded-2xl border border-zinc-200 bg-gradient-to-r from-white to-zinc-50 p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-black">Open Notebook</h1>
              <p className="text-zinc-600 mt-2 text-sm">
                Research workspace embedded directly inside Campus Flow.
              </p>
            </div>
            <a
              href={`${uiUrl}/notebooks`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-zinc-300 bg-white text-zinc-800 px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Open in New Tab
              <ExternalLink size={14} />
            </a>
          </div>
        </section>

        {!loading && health && (!health.ui.ok || !health.api.ok) ? (
          <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 text-sm text-amber-800">
            Open Notebook is not reachable right now. Ensure Docker services are running.
          </div>
        ) : null}

        {health?.ui.ok ? (
          <div className="border border-zinc-200 bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-2.5 border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Workspace
            </div>
            <iframe
              title="Open Notebook Embedded"
              src={embeddedUiUrl}
              className="w-full h-[80vh] bg-white"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
