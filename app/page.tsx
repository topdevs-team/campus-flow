'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Users, FileText, Ticket, FileCheck, MessageSquare, ArrowRight, BookOpen } from 'lucide-react'
import { AuthModal } from '@/components/auth-modal'
import CardSwap, { Card } from '@/src/components/CardSwapWrapper'

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
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState<'signin' | 'signup'>('signin')

  const openSignIn = () => { setModalTab('signin'); setModalOpen(true) }
  const openSignUp = () => { setModalTab('signup'); setModalOpen(true) }

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
            <button
              onClick={openSignIn}
              className="px-4 py-2 text-sm font-bold text-zinc-600 hover:text-black transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={openSignUp}
              className="px-4 py-2 text-sm font-bold bg-black text-white hover:bg-zinc-800 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="pt-8 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — text */}
          <div>
            <div className="inline-flex items-center gap-2 border border-zinc-200 bg-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
              <BookOpen size={12} />
              Built for campus life
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-black leading-tight">
              Everything you need<br />on campus,<br />in one place
            </h1>
            <p className="mt-6 text-lg text-zinc-500 max-w-md leading-relaxed">
              Roommate matching, smart notes, resume builder, and support tickets — all under one roof.
            </p>
            <div className="flex items-center gap-4 mt-10">
              <button
                onClick={openSignUp}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white font-bold text-sm hover:bg-zinc-800 transition-colors"
              >
                Get Started Free <ArrowRight size={15} />
              </button>
              <button
                onClick={openSignIn}
                className="px-6 py-3 border-2 border-black text-black font-bold text-sm hover:bg-black hover:text-white transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Right — CardSwap */}
          <div className="relative hidden lg:block" style={{ height: '660px', marginTop: '-89px' }}>
            <CardSwap
              width={640}
              height={450}
              cardDistance={50}
              verticalDistance={60}
              delay={4000}
              pauseOnHover
            >
              <Card>
                <img src="/hero/image-1.png" alt="Campus Flow screenshot 1" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
              </Card>
              <Card>
                <img src="/hero/image-2.png" alt="Campus Flow screenshot 2" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
              </Card>
              <Card>
                <img src="/hero/image-3.png" alt="Campus Flow screenshot 3" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
              </Card>
            </CardSwap>
          </div>

        </div>
      </section>

      {/* ── Features Marquee ──────────────────────── */}
      <section className="pt-8 pb-28 overflow-hidden">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-black tracking-tight">Features</h2>
          <p className="text-zinc-400 mt-3 text-sm uppercase tracking-widest font-bold">What you get with Campus Flow</p>
          <div className="w-12 h-0.5 bg-black mx-auto mt-4" />
        </div>

        {/* Marquee — single row, scrolls left forever */}
        <div className="relative flex overflow-hidden py-8 mask-[linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="flex gap-6 animate-marquee-left items-center" style={{ width: 'max-content' }}>
            {[...features, ...features, ...features, ...features].map((f, i) => {
              const Icon = f.icon
              return (
                <div
                  key={i}
                  className="inline-flex flex-col gap-4 bg-white/80 backdrop-blur-sm border border-zinc-200 rounded-2xl p-7 shadow-sm"
                  style={{ minWidth: '280px', transform: i % 2 === 0 ? 'translateY(-20px)' : 'translateY(20px)' }}
                >
                  <div className="w-12 h-12 border border-zinc-200 rounded-xl flex items-center justify-center bg-white shrink-0">
                    <Icon size={22} className="text-zinc-700" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-black">{f.title}</p>
                    <p className="text-sm text-zinc-400 leading-relaxed mt-1">{f.description}</p>
                  </div>
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
          <button
            onClick={openSignUp}
            className="inline-flex items-center gap-2 mt-8 px-8 py-3 bg-black text-white font-bold text-sm hover:bg-zinc-800 transition-colors"
          >
            Create Free Account <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="mt-8 border-t border-zinc-200 py-12 px-6 bg-white/60 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          {/* Top row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-2.5 font-black text-lg text-black tracking-tight">
              <div className="w-8 h-8 bg-black flex items-center justify-center text-white font-black text-xs rounded-lg">
                CF
              </div>
              Campus Flow
            </Link>

            {/* Nav links */}
            <nav className="flex items-center gap-7 text-sm font-semibold text-zinc-500">
              <button onClick={openSignIn} className="hover:text-black transition-colors">Sign In</button>
              <button onClick={openSignUp} className="hover:text-black transition-colors">Get Started</button>
              <Link href="/dashboard" className="hover:text-black transition-colors">Dashboard</Link>
            </nav>

            {/* Socials */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center border border-zinc-200 rounded-xl bg-white hover:bg-black hover:border-black hover:text-white text-zinc-600 transition-all"
                aria-label="GitHub"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
              <a
                href="mailto:hello@campusflow.app"
                className="w-9 h-9 flex items-center justify-center border border-zinc-200 rounded-xl bg-white hover:bg-black hover:border-black hover:text-white text-zinc-600 transition-all"
                aria-label="Email"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-zinc-200 mb-6" />

          {/* Bottom row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-zinc-400">
            <span>© 2026 Campus Flow. All rights reserved.</span>
            <span>Built for VIT students.</span>
          </div>
        </div>
      </footer>

      <AuthModal open={modalOpen} defaultTab={modalTab} onClose={() => setModalOpen(false)} />
    </div>
  )
}

