'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Users, FileText, Ticket, FileCheck, MessageSquare, ArrowRight, BookOpen } from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Roommate Matching',
    description: 'Fill in your lifestyle preferences — sleep schedule, budget, cleanliness — and get matched with compatible roommates algorithmically.',
  },
  {
    icon: FileText,
    title: 'Notes Storage',
    description: 'Upload and organise your class PDFs in one place. Search, browse, and access your course notes any time.',
  },
  {
    icon: MessageSquare,
    title: 'PDF Chat',
    description: 'Ask questions about your uploaded PDFs using AI. Get instant answers pulled straight from your notes.',
  },
  {
    icon: FileCheck,
    title: 'Resume Builder',
    description: 'Build a clean, professional resume with a guided form. Download it as a PDF in one click.',
  },
  {
    icon: Ticket,
    title: 'Support Tickets',
    description: 'Submit campus support requests and track their status — housing, facilities, admin — all in one dashboard.',
  },
]

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-black animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-black animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-black animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">

      {/* ── Navbar ───────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 font-black text-xl text-black tracking-tight">
            <div className="w-8 h-8 bg-black flex items-center justify-center text-white font-black text-sm">
              CF
            </div>
            Campus Flow
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/signin"
              className="px-4 py-2 text-sm font-bold text-zinc-600 hover:text-black transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 text-sm font-bold bg-black text-white hover:bg-zinc-800 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="pt-40 pb-28 px-6 text-center">
        <div className="inline-flex items-center gap-2 border border-zinc-200 bg-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-500 mb-8">
          <BookOpen size={12} />
          Built for campus life
        </div>
        <h1 className="text-6xl md:text-7xl font-black tracking-tight text-black leading-tight max-w-4xl mx-auto">
          Everything you need<br />on campus, in one place
        </h1>
        <p className="mt-6 text-lg text-zinc-500 max-w-xl mx-auto leading-relaxed">
          Roommate matching, smart notes, AI-powered PDF chat, resume builder, and support tickets — all under one roof.
        </p>
        <div className="flex items-center justify-center gap-4 mt-10">
          <Link
            href="/auth/signup"
            className="flex items-center gap-2 px-6 py-3 bg-black text-white font-bold text-sm hover:bg-zinc-800 transition-colors"
          >
            Get Started Free <ArrowRight size={15} />
          </Link>
          <Link
            href="/auth/signin"
            className="px-6 py-3 border-2 border-black text-black font-bold text-sm hover:bg-black hover:text-white transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section className="pb-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-black tracking-tight">Features</h2>
            <p className="text-zinc-400 mt-3 text-sm uppercase tracking-widest font-bold">What you get with Campus Flow</p>
            <div className="w-12 h-0.5 bg-black mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="bw-card p-6">
                  <div className="w-10 h-10 border border-zinc-200 rounded-lg flex items-center justify-center mb-5">
                    <Icon size={18} className="text-zinc-700" />
                  </div>
                  <h3 className="text-base font-bold text-black">{f.title}</h3>
                  <p className="text-zinc-400 text-sm mt-2 leading-relaxed">{f.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="pb-28 px-6">
        <div className="max-w-3xl mx-auto bw-card p-14 text-center">
          <h2 className="text-4xl font-black text-black tracking-tight">Ready to get started?</h2>
          <p className="text-zinc-400 mt-3 text-sm leading-relaxed max-w-md mx-auto">
            Create your free account and start using all Campus Flow features today.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 mt-8 px-8 py-3 bg-black text-white font-bold text-sm hover:bg-zinc-800 transition-colors"
          >
            Create Free Account <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="border-t-2 border-zinc-200 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-zinc-400 font-bold uppercase tracking-widest">
          <span>© 2026 Campus Flow. All rights reserved.</span>
          <span>Do not copy without permission.</span>
        </div>
      </footer>

    </div>
  )
}

