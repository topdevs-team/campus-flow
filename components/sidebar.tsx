'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Users, FileText, Ticket, FileCheck, LogOut, Building2, NotebookText } from 'lucide-react'

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/signin')
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: FileText },
    { href: '/dashboard/roommates', label: 'Roommates', icon: Users },
    { href: '/dashboard/notes', label: 'Notes', icon: FileText },
    { href: '/dashboard/admin', label: 'Tickets', icon: Ticket },
    { href: '/dashboard/resume', label: 'Resume', icon: FileCheck },
    { href: '/dashboard/clubs', label: 'Clubs', icon: Building2 },
    { href: '/dashboard/notebook', label: 'Open Notebook', icon: NotebookText },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 font-black text-xl text-black tracking-tight">
            <div className="w-8 h-8 bg-black flex items-center justify-center text-white font-black text-sm">
              CF
            </div>
            Campus Flow
          </Link>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'text-white bg-black'
                      : 'text-zinc-500 hover:text-black hover:bg-zinc-100'
                  }`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Right Side - Sign Out */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 text-sm font-bold uppercase tracking-wider text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
