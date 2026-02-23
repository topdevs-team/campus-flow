'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      // Wait for Supabase to exchange the OAuth code for a session
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        router.replace('/auth/signin')
        return
      }

      // Check admin status
      const { data: profile } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()

      router.replace(profile?.is_admin ? '/admin' : '/dashboard')
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-black animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-black animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-black animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}
