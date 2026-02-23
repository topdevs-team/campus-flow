'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignUp() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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

  if (!isMounted) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" suppressHydrationWarning>
      <div className="w-full max-w-md bw-card p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-white">Campus Flow</h1>
          <h2 className="text-xl font-bold text-white mt-4">Create Account</h2>
          <p className="text-zinc-400 text-sm mt-1">Join Campus Flow and connect with your campus community</p>
        </div>
        <form onSubmit={handleSignUp} className="space-y-5">
          {error && (
            <div className="border border-red-500 text-red-400 px-4 py-3 text-sm">
              {error}
            </div>
          )}
          <div className="space-y-1">
            <label htmlFor="fullName" className="text-xs font-bold uppercase tracking-widest text-zinc-400">
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
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-zinc-400">
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
          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-zinc-400">
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
          <Button type="submit" disabled={loading} className="w-full font-bold tracking-wide">
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>
        <p className="text-center text-sm text-zinc-500 mt-6">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-white font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
