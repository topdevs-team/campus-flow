'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Preferences } from '@/lib/matching'
import { Loader2, Users, Zap } from 'lucide-react'

export default function RoommatesPage() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<Preferences>({})
  const [matches, setMatches] = useState<any[]>([])
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

  if (prefsLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Roommate Matching</h1>
        <p className="text-slate-600">Find compatible roommates based on your preferences</p>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Set Your Preferences</CardTitle>
            <CardDescription>Tell us about your ideal living situation</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={savePreferences} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Cleanliness Level (0-10)</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={preferences.cleanliness_level || ''}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        cleanliness_level: parseInt(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Noise Level (0-10)</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={preferences.noise_level || ''}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        noise_level: parseInt(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sleep Schedule</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
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
                <div>
                  <label className="block text-sm font-medium mb-2">Budget Min ($)</label>
                  <Input
                    type="number"
                    value={preferences.budget_min || ''}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        budget_min: parseInt(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Budget Max ($)</label>
                  <Input
                    type="number"
                    value={preferences.budget_max || ''}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        budget_max: parseInt(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Input
                    type="text"
                    placeholder="e.g., Campus District"
                    value={preferences.preferred_location || ''}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        preferred_location: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={preferences.smoking || false}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        smoking: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm">I'm okay with smoking</span>
                </label>
                <label className="flex items-center gap-3">
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
                  <span className="text-sm">I have/want pets</span>
                </label>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Saving...' : 'Save Preferences & Find Matches'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Button onClick={findMatches} disabled={loading} className="mb-6">
          {loading ? <Loader2 className="animate-spin mr-2" /> : <Zap className="mr-2" />}
          Find Matches
        </Button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matches.map((match) => (
          <Card key={match.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{match.full_name}</CardTitle>
                  <CardDescription>{match.major}</CardDescription>
                </div>
                <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-semibold">
                  {Math.round(match.similarity_score)}%
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">{match.bio || 'No bio provided'}</p>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Year:</strong> {match.year}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {matches.length === 0 && !loading && !showForm && (
        <Card className="text-center py-12">
          <Users size={48} className="mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600">No matches found yet. Try adjusting your preferences.</p>
        </Card>
      )}
    </div>
  )
}
