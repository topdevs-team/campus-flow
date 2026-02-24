'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Users, LayoutDashboard, Ticket, FileCheck, LogOut, Building2, NotebookText, UserCircle, StickyNote } from 'lucide-react'

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/signin')
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/profile', label: 'Profile', icon: UserCircle },
    { href: '/dashboard/roommates', label: 'Roommates', icon: Users },
    { href: '/dashboard/notes', label: 'Notes', icon: StickyNote },
    { href: '/dashboard/tickets', label: 'Tickets', icon: Ticket },
    { href: '/dashboard/resume', label: 'Resume', icon: FileCheck },
    { href: '/dashboard/clubs', label: 'Clubs', icon: Building2 },
    { href: '/dashboard/notebook', label: 'Open Notebook', icon: NotebookText },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/dashboard" className="group flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white text-sm font-black shadow-sm">
              CF
            </div>
            <div className="leading-tight">
              <p className="text-base font-black tracking-tight text-zinc-900">Campus Flow</p>
              <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Student Workspace</p>
            </div>
          </Link>

          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

        <div className="pb-3">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'text-zinc-600 hover:bg-white hover:text-zinc-900'
                  }`}
                >
                  <Icon size={14} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
