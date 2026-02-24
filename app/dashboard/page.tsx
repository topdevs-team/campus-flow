'use client'

import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Users, FileText, Ticket, FileCheck, ArrowRight, ArrowUpRight, Building2 } from 'lucide-react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getDisplayName(user: { user_metadata?: { full_name?: string }; email?: string } | null) {
  if (!user) return 'there'
  const full = user.user_metadata?.full_name
  if (full) return full.split(' ')[0]
  return user.email?.split('@')[0] ?? 'there'
}

const features = [
  {
    title: 'Roommate Matching',
    description: 'Fill in your lifestyle preferences and get algorithmically matched with compatible roommates.',
    icon: Users,
    href: '/dashboard/roommates',
    tag: 'Matching',
  },
  {
    title: 'Notes Storage',
    description: 'Upload, organise, and access your class PDFs anytime — all in one searchable place.',
    icon: FileText,
    href: '/dashboard/notes',
    tag: 'Study',
  },
  {
    title: 'Support Tickets',
    description: 'Submit campus support requests and track their status — housing, facilities, admin.',
    icon: Ticket,
    href: '/dashboard/admin',
    tag: 'Support',
  },
  {
    title: 'Resume Builder',
    description: 'Build a clean LaTeX resume step-by-step and export a polished PDF in one click.',
    icon: FileCheck,
    href: '/dashboard/resume',
    tag: 'Career',
  },
  {
    title: 'Club Recruitments',
    description: 'Track all active club openings, deadlines, and application forms in one place.',
    icon: Building2,
    href: '/dashboard/clubs',
    tag: 'Campus',
  },
]

export default function Dashboard() {
  const { user } = useAuth()
  const name = getDisplayName(user)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* ── Header ─────────────────────────────────── */}
        <div className="mb-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">{today}</p>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black leading-tight">
                {getGreeting()},<br />{name}.
              </h1>
              <p className="text-zinc-400 text-sm mt-3">Here's everything available on Campus Flow.</p>
            </div>
            {/* Profile badge */}
            <div className="hidden sm:flex items-center gap-3 border border-zinc-200 rounded-2xl px-4 py-3 bg-white shrink-0">
              <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white text-sm font-black">
                {name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold text-black">{name}</p>
                <p className="text-[11px] text-zinc-400 truncate max-w-35">{user?.email}</p>
              </div>
            </div>
          </div>
          <div className="mt-8 h-px bg-zinc-100" />
        </div>

        {/* ── Feature grid ───────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon
            const isFeatured = i === 0 // first card gets extra emphasis

            return (
              <Link key={feature.href} href={feature.href} className="group block">
                <div
                  className={`relative h-full rounded-2xl border transition-all duration-200 p-7 flex flex-col gap-5 overflow-hidden
                    ${isFeatured
                      ? 'border-black bg-black text-white hover:bg-zinc-900'
                      : 'border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-sm'
                    }`}
                >
                  {/* Tag */}
                  <span
                    className={`inline-flex self-start text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full
                      ${isFeatured ? 'bg-white/10 text-zinc-300' : 'bg-zinc-100 text-zinc-400'}`}
                  >
                    {feature.tag}
                  </span>

                  {/* Icon */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center
                      ${isFeatured ? 'bg-white/10' : 'bg-zinc-100'}`}
                  >
                    <Icon size={20} className={isFeatured ? 'text-white' : 'text-zinc-700'} />
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <h2 className={`text-lg font-black tracking-tight ${isFeatured ? 'text-white' : 'text-black'}`}>
                      {feature.title}
                    </h2>
                    <p className={`text-sm mt-1.5 leading-relaxed ${isFeatured ? 'text-zinc-400' : 'text-zinc-400'}`}>
                      {feature.description}
                    </p>
                  </div>

                  {/* CTA */}
                  <div
                    className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-widest
                      ${isFeatured ? 'text-zinc-300 group-hover:text-white' : 'text-zinc-400 group-hover:text-black'} transition-colors`}
                  >
                    Open <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  {/* Corner accent */}
                  <div className={`absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <ArrowUpRight size={16} className={isFeatured ? 'text-zinc-500' : 'text-zinc-300'} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* ── Footer strip ───────────────────────────── */}
        <div className="mt-12 pt-6 border-t border-zinc-100 flex items-center justify-between gap-4">
          <p className="text-xs text-zinc-300 font-medium">Campus Flow · IIT Madras BS</p>
          <Link href="/dashboard/admin" className="text-xs font-bold text-zinc-400 hover:text-black transition-colors flex items-center gap-1">
            View tickets <ArrowRight size={11} />
          </Link>
        </div>

      </div>
    </div>
  )
}
