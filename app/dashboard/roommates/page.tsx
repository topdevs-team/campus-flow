'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MatchDimension, Preferences } from '@/lib/matching'
import { House, Loader2, Sparkles, Users, Zap } from 'lucide-react'

interface RoommateMatch {
  id: string
  full_name: string
  major?: string
  year?: string
  bio?: string
  similarity_score: number
  match_breakdown?: MatchDimension[]
}

export default function RoommatesPage() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<Preferences>({})
  const [matches, setMatches] = useState<RoommateMatch[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [prefsLoading, setPrefsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadPreferences()
    }
  }, [user])

  const loadPreferences = async () => {
    try {
      const { data } = await supabase
        .from('preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (data) {
        setPreferences(data)
        setShowForm(false)
      } else {
        setShowForm(true)
      }
    } catch (error) {
      setShowForm(true)
    } finally {
      setPrefsLoading(false)
    }
  }

  const savePreferences = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (preferences.id) {
        await supabase
          .from('preferences')
          .update(preferences)
          .eq('id', preferences.id)
      } else {
        await supabase.from('preferences').insert({
          ...preferences,
          user_id: user?.id,
        })
      }

      setShowForm(false)
      await findMatches()
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const findMatches = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch('/api/roommates', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      })
      const result = await response.json()
      setMatches(result.matches || [])
    } catch (error) {
      console.error('Error finding matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectClassName =
    'w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-black'
  const questionCardClassName = 'rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-2'

  if (prefsLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center bg-zinc-50">
        <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-600">
          <Loader2 className="size-4 animate-spin" />
          Loading roommate preferences...
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 md:p-8 bg-gradient-to-b from-zinc-50 to-white">
      <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600">
              <House className="size-3.5" />
              Roommate Match Engine
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">Roommate Matching</h1>
            <p className="text-zinc-600">Find compatible roommates using lifestyle, budget, and personality signals.</p>
          </div>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              variant="outline"
              className="rounded-full border-zinc-300 text-zinc-700 hover:bg-zinc-100"
            >
              Edit Preferences
            </Button>
          )}
        </div>
      </div>

      {showForm && (
        <Card className="mb-8 overflow-hidden border-zinc-200 shadow-sm">
          <CardHeader className="border-b border-zinc-200 bg-zinc-50">
            <CardTitle className="text-zinc-900">Set Your Preferences</CardTitle>
            <CardDescription className="text-zinc-600">Tell us about your ideal living situation.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={savePreferences} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className={questionCardClassName}>
                  <label className="block text-sm font-semibold text-zinc-800">Cleanliness Level (0-10)</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    className="rounded-xl border-zinc-300 bg-white"
                    value={preferences.cleanliness_level || ''}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        cleanliness_level: parseInt(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
                <div className={questionCardClassName}>
                  <label className="block text-sm font-semibold text-zinc-800">Noise Level (0-10)</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    className="rounded-xl border-zinc-300 bg-white"
                    value={preferences.noise_level || ''}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        noise_level: parseInt(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
                <div className={questionCardClassName}>
                  <label className="block text-sm font-semibold text-zinc-800">Sleep Schedule</label>
                  <select
                    className={selectClassName}
                    value={preferences.sleep_schedule || ''}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        sleep_schedule: e.target.value,
                      })
                    }
                  >
                    <option value="">Select...</option>
                    <option value="early_bird">Early Bird (6-8 AM)</option>
                    <option value="normal">Normal (7-9 AM)</option>
                    <option value="night_owl">Night Owl (10+ AM)</option>
                  </select>
                </div>
                <div className={questionCardClassName}>
                  <label className="block text-sm font-semibold text-zinc-800">Budget Min ($)</label>
                  <Input
                    type="number"
                    className="rounded-xl border-zinc-300 bg-white"
                    value={preferences.budget_min || ''}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        budget_min: parseInt(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
                <div className={questionCardClassName}>
                  <label className="block text-sm font-semibold text-zinc-800">Budget Max ($)</label>
                  <Input
                    type="number"
                    className="rounded-xl border-zinc-300 bg-white"
                    value={preferences.budget_max || ''}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        budget_max: parseInt(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
                <div className={questionCardClassName}>
                  <label className="block text-sm font-semibold text-zinc-800">Preferred Location</label>
                  <Input
                    type="text"
                    placeholder="e.g., Campus District"
                    className="rounded-xl border-zinc-300 bg-white"
                    value={preferences.preferred_location || ''}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        preferred_location: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={questionCardClassName}>
                  <label className="block text-sm font-semibold text-zinc-800">When deadlines hit, your ideal room vibe is...</label>
                  <select
                    className={selectClassName}
                    value={preferences.study_style || ''}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        study_style: e.target.value,
                      })
                    }
                  >
                    <option value="">Select...</option>
                    <option value="solo">Mostly quiet and focused</option>
                    <option value="pair">A calm pair-study vibe</option>
                    <option value="group">People around, active energy</option>
                  </select>
                </div>
                <div className={questionCardClassName}>
                  <label className="block text-sm font-semibold text-zinc-800">If a roommate issue happens, you usually...</label>
                  <select
                    className={selectClassName}
                    value={preferences.conflict_style || ''}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        conflict_style: e.target.value,
                      })
                    }
                  >
                    <option value="">Select...</option>
                    <option value="direct">Talk directly and quickly</option>
                    <option value="calm">Talk calmly after cooling off</option>
                    <option value="mediated">Prefer a mediated discussion</option>
                  </select>
                </div>
                <div className={questionCardClassName}>
                  <label className="block text-sm font-semibold text-zinc-800">Your day-to-day routine is...</label>
                  <select
                    className={selectClassName}
                    value={preferences.routine_flexibility || ''}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        routine_flexibility: e.target.value,
                      })
                    }
                  >
                    <option value="">Select...</option>
                    <option value="strict">Very structured</option>
                    <option value="balanced">Balanced</option>
                    <option value="flexible">Flexible / changes often</option>
                  </select>
                </div>
                <div className={questionCardClassName}>
                  <label className="block text-sm font-semibold text-zinc-800">On most evenings, your energy is...</label>
                  <select
                    className={selectClassName}
                    value={preferences.social_energy || ''}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        social_energy: e.target.value,
                      })
                    }
                  >
                    <option value="">Select...</option>
                    <option value="quiet">Quiet / keep to myself</option>
                    <option value="balanced">A bit of both</option>
                    <option value="social">Social / interactive</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-3">
                <p className="text-sm font-semibold text-zinc-800">Living Constraints</p>
                <label className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 border border-zinc-200">
                  <input
                    type="checkbox"
                    checked={preferences.pets || false}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        pets: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm text-zinc-700">I have/want pets</span>
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={loading} className="rounded-full bg-zinc-900 hover:bg-zinc-800">
                  {loading ? 'Saving...' : 'Save Preferences & Find Matches'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  className="rounded-full border-zinc-300"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <div className="mb-6 flex items-center gap-3">
          <Button onClick={findMatches} disabled={loading} className="rounded-full bg-zinc-900 hover:bg-zinc-800">
            {loading ? <Loader2 className="animate-spin mr-2 size-4" /> : <Zap className="mr-2 size-4" />}
            Find Matches
          </Button>
          <p className="text-sm text-zinc-500">Scores are calculated from lifestyle + indirect preference signals.</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {matches.map((match) => (
          <Card key={match.id} className="border-zinc-200 shadow-sm">
            <CardHeader className="border-b border-zinc-100">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-zinc-900">{match.full_name}</CardTitle>
                  <CardDescription className="text-zinc-600">{match.major}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                    <Sparkles className="size-3.5" />
                    {Math.round(match.similarity_score)}%
                  </div>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-zinc-400">Compatibility</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-600 mb-4">{match.bio || 'No bio provided'}</p>
              {match.match_breakdown && match.match_breakdown.length > 0 && (
                <div className="mb-4 space-y-2">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Top match factors</p>
                  {match.match_breakdown
                    .slice()
                    .sort((a, b) => b.weight * b.score - a.weight * a.score)
                    .slice(0, 3)
                    .map((item) => (
                      <div key={item.key} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm text-zinc-600">
                          <span>{item.label}</span>
                          <span className="font-medium text-zinc-900">{Math.round(item.score)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-zinc-100">
                          <div
                            className="h-2 rounded-full bg-zinc-900"
                            style={{ width: `${Math.max(6, Math.round(item.score))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              )}
              <div className="space-y-2 text-sm text-zinc-600">
                <p className="rounded-lg bg-zinc-50 px-3 py-2 border border-zinc-200">
                  <strong>Year:</strong> {match.year}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {matches.length === 0 && !loading && !showForm && (
        <Card className="text-center py-12 border-zinc-200">
          <Users size={48} className="mx-auto mb-4 text-zinc-400" />
          <p className="text-zinc-700 font-medium mb-1">No matches found yet</p>
          <p className="text-zinc-500 text-sm">Save or adjust your preferences and run matching again.</p>
        </Card>
      )}
    </div>
  )
}
