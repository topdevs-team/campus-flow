'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import {
  LayoutDashboard,
  Ticket,
  Users,
  FileText,
  LogOut,
  Shield,
} from 'lucide-react'

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/notes', label: 'Notes', icon: FileText },
  { href: '/admin/tickets', label: 'Tickets', icon: Ticket },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAdmin, loading, adminLoading, signOut } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (mounted && !loading && !adminLoading) {
      if (!user) router.replace('/auth/signin')
      else if (!isAdmin) router.replace('/dashboard')
    }
  }, [mounted, loading, adminLoading, user, isAdmin, router])

  if (!mounted || loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) return null

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/signin')
  }

  return (
    <div className="min-h-screen flex bg-zinc-950">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col fixed h-full z-10">
        {/* Logo */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white flex items-center justify-center text-black font-black text-sm rounded">
              CF
            </div>
            <div>
              <p className="font-black text-white text-sm tracking-tight">Campus Flow</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield size={10} className="text-amber-400" />
                <span className="text-amber-400 text-xs font-semibold">Admin Panel</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-1">
          {adminNavItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Icon size={17} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User + Sign out */}
        <div className="p-4 border-t border-zinc-800">
          <div className="mb-3 px-3">
            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors w-full"
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen bg-zinc-50">
        {children}
      </main>
    </div>
  )
}
