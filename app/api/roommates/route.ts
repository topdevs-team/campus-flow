import { createClient } from '@supabase/supabase-js'
import { calculateMatchResult, Preferences } from '@/lib/matching'
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

    // Get all other users' preferences in one query to avoid N+1 requests.
    const { data: allPrefs } = await supabase
      .from('preferences')
      .select('*')
      .neq('user_id', user.id)

    if (!allPrefs || allPrefs.length === 0) {
      return NextResponse.json({ matches: [] })
    }

    // Calculate similarity scores
    const matches = allPrefs
      .map((otherPrefs) => {
        const result = calculateMatchResult(userPrefs as Preferences, otherPrefs as Preferences)
        return {
          user_id: otherPrefs.user_id as string,
          score: result.score,
          breakdown: result.dimensions,
        }
      })
      .filter((match) => match.score > 0)

    // Sort by similarity score
    matches.sort((a, b) => b.score - a.score)
    const topScoredMatches = matches.slice(0, 10)
    const topUserIds = topScoredMatches.map((match) => match.user_id)

    if (topUserIds.length === 0) {
      return NextResponse.json({ matches: [] })
    }

    // Fetch user details in one query.
    const { data: usersData } = await supabase
      .from('users')
      .select('*')
      .in('id', topUserIds)

    const usersById = new Map((usersData || []).map((profile) => [profile.id, profile]))

    const topMatches = topScoredMatches
      .map((match) => {
        const profile = usersById.get(match.user_id)
        if (!profile) return null
        return {
          ...profile,
          similarity_score: match.score,
          match_breakdown: match.breakdown,
        }
      })
      .filter(Boolean)

    return NextResponse.json({ matches: topMatches })
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
