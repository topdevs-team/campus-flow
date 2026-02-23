import { createClient } from '@supabase/supabase-js'
import { calculateSimilarity } from '@/lib/matching'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')

    // Create a per-request client with the user's JWT — no service role key needed
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user's preferences
    const { data: userPrefs } = await supabase
      .from('preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!userPrefs) {
      return NextResponse.json({ matches: [] })
    }

    // Get all other users' preferences
    const { data: allPrefs } = await supabase
      .from('preferences')
      .select('user_id')
      .neq('user_id', user.id)

    if (!allPrefs) {
      return NextResponse.json({ matches: [] })
    }

    // Calculate similarity scores
    const matches = []
    for (const otherPref of allPrefs) {
      const { data: otherData } = await supabase
        .from('preferences')
        .select('*')
        .eq('user_id', otherPref.user_id)
        .single()

      if (otherData) {
        const score = calculateSimilarity(userPrefs, otherData)
        matches.push({
          user_id: otherPref.user_id,
          score,
        })
      }
    }

    // Sort by similarity score
    matches.sort((a, b) => b.score - a.score)

    // Get user details for top matches
    const topMatches = await Promise.all(
      matches.slice(0, 10).map(async (match) => {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', match.user_id)
          .single()

        return {
          ...userData,
          similarity_score: match.score,
        }
      })
    )

    return NextResponse.json({ matches: topMatches })
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
