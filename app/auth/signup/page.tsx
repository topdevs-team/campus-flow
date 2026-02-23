'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Input } from '@/components/ui/input'
import { Users, FileText, FileCheck, MessageSquare, Ticket } from 'lucide-react'

export default function SignUp() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUp(email, password, fullName)
      router.push('/auth/signin?message=Check your email to confirm your account')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  if (!isMounted) return null

  return (
    <div className="min-h-screen flex" suppressHydrationWarning>

      {/* Left — black branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2.5 font-black text-xl text-white tracking-tight">
          <div className="w-8 h-8 bg-white flex items-center justify-center text-black font-black text-sm">CF</div>
          Campus Flow
        </Link>
        <div>
          <h2 className="text-4xl font-black text-white leading-tight mb-6">
            One platform for<br />campus everything.
          </h2>
          <div className="space-y-4">
            {[
              { Icon: Users, text: 'Roommate Matching' },
              { Icon: FileText, text: 'Notes Storage' },
              { Icon: MessageSquare, text: 'PDF Chat with AI' },
              { Icon: FileCheck, text: 'Resume Builder' },
              { Icon: Ticket, text: 'Support Tickets' },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 border border-zinc-700 flex items-center justify-center">
                  <Icon size={13} className="text-zinc-400" />
                </div>
                <span className="text-zinc-400 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-zinc-600 text-xs">© 2026 Campus Flow</p>
      </div>

      {/* Right — white form panel */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2 font-black text-lg text-black mb-10">
            <div className="w-7 h-7 bg-black flex items-center justify-center text-white font-black text-xs">CF</div>
            Campus Flow
          </Link>

          <h1 className="text-3xl font-black text-black tracking-tight">Create account</h1>
          <p className="text-zinc-400 text-sm mt-1.5 mb-8">Join Campus Flow — it’s free</p>

          {error && (
            <div className="border border-red-200 bg-red-50 text-red-600 px-4 py-3 text-sm rounded-lg mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-black text-white text-sm font-bold tracking-wide hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-400 mt-6">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-black font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
