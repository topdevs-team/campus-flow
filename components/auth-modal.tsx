'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { LogoIcon } from '@/components/logo'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'

type Tab = 'signin' | 'signup'

interface AuthModalProps {
  open: boolean
  defaultTab?: Tab
  onClose: () => void
}

const googleSvg = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C18.622 11.932 17.64 9.635 17.64 9.2z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
)

export function AuthModal({ open, defaultTab = 'signin', onClose }: AuthModalProps) {
  const router = useRouter()
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const [tab, setTab] = useState<Tab>(defaultTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Sync tab when defaultTab prop changes
  useEffect(() => { setTab(defaultTab) }, [defaultTab])

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setEmail(''); setPassword(''); setFullName('')
      setError(''); setMessage('')
      setLoading(false); setGoogleLoading(false)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Esc to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await signIn(email, password)
      onClose()
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally { setLoading(false) }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await signUp(email, password, fullName)
      setMessage('Check your email to confirm your account.')
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up')
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError(''); setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign in failed')
      setGoogleLoading(false)
    }
  }

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-black hover:bg-zinc-100 transition-all z-10"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="pt-8 px-8 pb-0 flex flex-col items-center gap-2">
          <LogoIcon size={36} />
          <span className="font-black text-lg text-black tracking-tight mt-1">Campus Flow</span>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 bg-zinc-100 rounded-xl p-1 w-full">
            <button
              onClick={() => { setTab('signin'); setError(''); setMessage('') }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tab === 'signin' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('signup'); setError(''); setMessage('') }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tab === 'signup' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 pt-6 pb-8">

          {message && (
            <div className="border border-green-200 bg-green-50 text-green-700 px-4 py-3 text-sm rounded-xl mb-5">
              {message}
            </div>
          )}
          {error && (
            <div className="border border-red-200 bg-red-50 text-red-600 px-4 py-3 text-sm rounded-xl mb-5">
              {error}
            </div>
          )}

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-zinc-200 rounded-xl bg-white text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 hover:shadow-sm transition-all disabled:opacity-50 mb-5"
          >
            {googleSvg}
            {googleLoading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-zinc-200" />
            <span className="text-xs text-zinc-400 font-medium">
              {tab === 'signin' ? 'or continue with email' : 'or sign up with email'}
            </span>
            <div className="flex-1 h-px bg-zinc-200" />
          </div>

          {/* Sign In Form */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Email</label>
                <Input type="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Password</label>
                <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Sign Up Form */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Full Name</label>
                <Input type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Email</label>
                <Input type="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Password</label>
                <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-zinc-400 mt-5">
            {tab === 'signin' ? (
              <>No account?{' '}<button onClick={() => setTab('signup')} className="text-black font-bold hover:underline">Sign up free</button></>
            ) : (
              <>Already have one?{' '}<button onClick={() => setTab('signin')} className="text-black font-bold hover:underline">Sign in</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
