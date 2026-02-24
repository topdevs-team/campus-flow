'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  User, Mail, Phone, Calendar, UserCircle2,
  Pencil, X, Check, Camera, Loader2, ShieldCheck,
  Building2, CalendarRange,
} from 'lucide-react'
import { toast } from 'sonner'

interface Profile {
  full_name: string
  phone: string
  date_of_birth: string
  gender: string
  department: string
  academic_year_from: string
  academic_year_to: string
  avatar_url: string
  email: string
}

const defaultProfile: Profile = {
  full_name: '',
  phone: '',
  date_of_birth: '',
  gender: '',
  department: '',
  academic_year_from: '',
  academic_year_to: '',
  avatar_url: '',
  email: '',
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile>(defaultProfile)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Profile>(defaultProfile)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) loadProfile()
  }, [user])

  const loadProfile = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user!.id)
        .single()

      if (data) {
        // Coerce all DB values to strings (handles null → '' and number → string)
        // so controlled inputs never receive null/undefined/number
        const safe = Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, v != null ? String(v) : ''])
        )
        setProfile({ ...defaultProfile, ...safe, email: user!.email || '' })
        setEditData({ ...defaultProfile, ...safe, email: user!.email || '' })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: editData.full_name,
          phone: editData.phone,
          date_of_birth: editData.date_of_birth || null,
          gender: editData.gender,
          department: editData.department,
          academic_year_from: editData.academic_year_from ? parseInt(editData.academic_year_from) : null,
          academic_year_to: editData.academic_year_to ? parseInt(editData.academic_year_to) : null,
        })
        .eq('id', user!.id)

      if (error) {
        console.error('Supabase save error:', error.message, error.details, error.hint, error.code)
        throw error
      }
      setProfile(editData)
      setEditing(false)
      toast.success('Profile updated')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (err as { message?: string })?.message || JSON.stringify(err)
      console.error('saveProfile error:', msg)
      toast.error(`Failed to save: ${msg}`)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `avatars/${user!.id}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('notes')
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('notes').getPublicUrl(path)
      await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', user!.id)
      setProfile((p) => ({ ...p, avatar_url: publicUrl }))
      setEditData((p) => ({ ...p, avatar_url: publicUrl }))
      toast.success('Avatar updated')
    } catch {
      toast.error('Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-400" size={28} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">My Profile</h1>
          <p className="text-zinc-500 mt-1 text-sm">Manage your personal information</p>
        </div>
        {!editing && (
          <Button onClick={() => { setEditing(true); setEditData(profile) }} className="gap-2 bg-black text-white hover:bg-zinc-800">
            <Pencil size={15} /> Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">

            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full bg-zinc-100 border-2 border-zinc-200 overflow-hidden flex items-center justify-center">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={36} className="text-zinc-400" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 w-7 h-7 bg-black rounded-full flex items-center justify-center text-white hover:bg-zinc-700 transition-colors"
              >
                {uploadingAvatar ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            {/* Fields */}
            <div className="flex-1">
              {editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="field-label">Full Name</label>
                    <Input value={editData.full_name} onChange={(e) => setEditData((p) => ({ ...p, full_name: e.target.value }))} placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="field-label">Phone Number</label>
                    <Input value={editData.phone} onChange={(e) => setEditData((p) => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" type="tel" />
                  </div>
                  <div>
                    <label className="field-label">Date of Birth</label>
                    <Input value={editData.date_of_birth} onChange={(e) => setEditData((p) => ({ ...p, date_of_birth: e.target.value }))} type="date" />
                  </div>
                  <div>
                    <label className="field-label">Gender (optional)</label>
                    <select
                      value={editData.gender}
                      onChange={(e) => setEditData((p) => ({ ...p, gender: e.target.value }))}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non_binary">Non-binary</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Department</label>
                    <Input value={editData.department} onChange={(e) => setEditData((p) => ({ ...p, department: e.target.value }))} placeholder="e.g. Computer Science" />
                  </div>
                  <div>
                    <label className="field-label">Academic Year From</label>
                    <Input value={editData.academic_year_from} onChange={(e) => setEditData((p) => ({ ...p, academic_year_from: e.target.value }))} placeholder="e.g. 2022" type="number" min="2000" max="2100" />
                  </div>
                  <div>
                    <label className="field-label">Academic Year To</label>
                    <Input value={editData.academic_year_to} onChange={(e) => setEditData((p) => ({ ...p, academic_year_to: e.target.value }))} placeholder="e.g. 2026" type="number" min="2000" max="2100" />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-black text-zinc-900 mb-1">{profile.full_name || 'No name set'}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    <InfoRow icon={Mail} label="Email" value={profile.email || '—'} badge={<span className="flex items-center gap-1 text-xs text-green-600 font-semibold"><ShieldCheck size={12} />Verified</span>} />
                    <InfoRow icon={Phone} label="Phone" value={profile.phone || '—'} />
                    <InfoRow icon={Calendar} label="Date of Birth" value={profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
                    <InfoRow icon={UserCircle2} label="Gender" value={
                      profile.gender === 'male' ? 'Male'
                      : profile.gender === 'female' ? 'Female'
                      : profile.gender === 'non_binary' ? 'Non-binary'
                      : profile.gender === 'other' ? 'Other'
                      : 'Not specified'
                    } />
                    <InfoRow icon={Building2} label="Department" value={profile.department || '—'} />
                    <InfoRow icon={CalendarRange} label="Academic Year" value={
                      profile.academic_year_from && profile.academic_year_to
                        ? `${profile.academic_year_from} – ${profile.academic_year_to}`
                        : profile.academic_year_from || profile.academic_year_to || '—'
                    } />
                  </div>
                </>
              )}

              {editing && (
                <div className="flex gap-2 mt-5">
                  <Button onClick={saveProfile} disabled={saving} className="gap-2 bg-black text-white hover:bg-zinc-800">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    <X size={14} className="mr-1" /> Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

function InfoRow({ icon: Icon, label, value, badge }: { icon: React.ElementType; label: string; value: string; badge?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
        <Icon size={15} className="text-zinc-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-zinc-400 font-medium">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-zinc-800 truncate">{value}</p>
          {badge}
        </div>
      </div>
    </div>
  )
}
