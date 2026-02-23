'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Input } from '@/components/ui/input'
import { Users, FileText, FileCheck, MessageSquare, Ticket } from 'lucide-react'

export default function SignUp() {
  const router = useRouter()
  const { signUp, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
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

  const handleGoogle = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign in failed')
      setGoogleLoading(false)
    }
  }

  if (!isMounted) return null

  return (
    <div className="min-h-screen flex" suppressHydrationWarning>
      {/* Left — black branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2.5 font-black text-xl text-white tracking-tight">
          <div className="w-8 h-8 bg-white flex items-center justify-center text-black font-black text-sm rounded">CF</div>
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
                <div className="w-7 h-7 border border-zinc-700 rounded flex items-center justify-center">
                  <Icon size={13} className="text-zinc-400" />
                </div>
                <span className="text-zinc-400 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-zinc-600 text-xs"> 2026 Campus Flow</p>
      </div>

      {/* Right — white form panel */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex lg:hidden items-center gap-2 font-black text-lg text-black mb-10">
            <div className="w-7 h-7 bg-black flex items-center justify-center text-white font-black text-xs rounded">CF</div>
            Campus Flow
          </Link>

          <h1 className="text-3xl font-black text-black tracking-tight">Create account</h1>
          <p className="text-zinc-400 text-sm mt-1.5 mb-8">Join Campus Flow — it&apos;s free</p>

          {error && (
            <div className="border border-red-200 bg-red-50 text-red-600 px-4 py-3 text-sm rounded-lg mb-5">
              {error}
            </div>
          )}

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-zinc-200 rounded-lg bg-white text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all disabled:opacity-50 mb-5"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {googleLoading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-zinc-200" />
            <span className="text-xs text-zinc-400 font-medium">or sign up with email</span>
            <div className="flex-1 h-px bg-zinc-200" />
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-xs font-bold uppercase tracking-widest text-zinc-500">Full Name</label>
              <Input id="fullName" type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-zinc-500">Email</label>
              <Input id="email" type="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-zinc-500">Password</label>
              <Input id="password" type="password" placeholder="" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-2.5 bg-black text-white text-sm font-bold tracking-wide rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-400 mt-6">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-black font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
