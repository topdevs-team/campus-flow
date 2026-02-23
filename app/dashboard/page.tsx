'use client'

import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Users, FileText, Ticket, FileCheck, MessageSquare, ArrowRight } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()

  const features = [
    {
      title: 'Roommate Matching',
      description: 'Find compatible roommates based on preferences and lifestyle',
      icon: Users,
      href: '/dashboard/roommates',
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Notes Storage',
      description: 'Upload and organize your class notes in PDF format',
      icon: FileText,
      href: '/dashboard/notes',
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Support Tickets',
      description: 'Submit and track issues with campus support',
      icon: Ticket,
      href: '/dashboard/admin',
      color: 'bg-orange-50 text-orange-600',
    },
    {
      title: 'Resume Maker',
      description: 'Build and download your professional resume',
      icon: FileCheck,
      href: '/dashboard/resume',
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'PDF Chat',
      description: 'Chat with your PDFs using AI-powered search',
      icon: MessageSquare,
      href: '/dashboard/chat',
      color: 'bg-primary/10 text-primary',
    },
  ]

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-black tracking-tight text-black">
            {user?.email?.split('@')[0]}
          </h1>
          <p className="text-zinc-500 text-sm mt-2 uppercase tracking-widest font-bold">Campus tools &amp; features</p>
          <div className="w-16 h-0.5 bg-black mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Link key={feature.href} href={feature.href}>
                <div className="bw-card p-6 cursor-pointer h-full">
                  <div className="w-10 h-10 border border-zinc-200 rounded-lg flex items-center justify-center mb-5">
                    <Icon size={18} className="text-zinc-700" />
                  </div>
                  <h2 className="text-lg font-bold text-black tracking-tight">{feature.title}</h2>
                  <p className="text-zinc-400 text-sm mt-2 leading-relaxed">{feature.description}</p>
                  <div className="flex items-center text-black font-semibold text-sm mt-5 gap-1.5">
                    Get Started <ArrowRight size={13} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
