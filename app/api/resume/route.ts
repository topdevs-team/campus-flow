import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { defaultResumeDraft } from '@/types/resume'
import { normalizeResumeDraft } from '@/lib/resume-schema'

function getSupabaseForRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null

  const token = authHeader.replace('Bearer ', '')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
}

function withLegacyProjects(data: any) {
  const projectsFromColumn = Array.isArray(data?.projects) ? data.projects : null
  const projectsFromLegacy = Array.isArray(data?.certifications?._legacy_projects)
    ? data.certifications._legacy_projects
    : null
  const legacyProfileImageFilename =
    typeof data?.certifications?._profile_image_filename === 'string'
      ? data.certifications._profile_image_filename
      : ''
  const legacyProfileImageBase64 =
    typeof data?.certifications?._profile_image_base64 === 'string'
      ? data.certifications._profile_image_base64
      : ''

  return {
    ...data,
    projects: projectsFromColumn ?? projectsFromLegacy ?? [],
    profile_image_filename: typeof data?.profile_image_filename === 'string' ? data.profile_image_filename : legacyProfileImageFilename,
    profile_image_base64: typeof data?.profile_image_base64 === 'string' ? data.profile_image_base64 : legacyProfileImageBase64,
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseForRequest(request)
    if (!supabase) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase.from('resumes').select('*').eq('user_id', user.id).single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to load resume' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({
        resume: {
          ...defaultResumeDraft(),
          full_name: user.user_metadata?.full_name || '',
          email: user.email || '',
        },
      })
    }

    return NextResponse.json({ resume: normalizeResumeDraft(withLegacyProjects(data)) })
  } catch (error) {
    console.error('GET /api/resume error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseForRequest(request)
    if (!supabase) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const draft = normalizeResumeDraft(body)

    const basePayload = {
      user_id: user.id,
      full_name: draft.full_name,
      email: draft.email,
      phone: draft.phone,
      location: draft.location,
      summary: draft.summary,
      education: draft.education,
      experience: draft.experience,
      skills: draft.skills,
      projects: draft.projects,
      template_id: draft.template_id,
      certifications: {
        _legacy_projects: draft.projects,
        _profile_image_filename: draft.profile_image_filename,
        _profile_image_base64: draft.profile_image_base64,
      },
      updated_at: new Date().toISOString(),
    }

    let { data, error } = await supabase
      .from('resumes')
      .upsert(basePayload, { onConflict: 'user_id' })
      .select('*')
      .single()

    const errorMessage = error?.message?.toLowerCase() || ''
    const missingTemplateColumn = errorMessage.includes('template_id') && errorMessage.includes('column')
    const missingProjectsColumn = errorMessage.includes('projects') && errorMessage.includes('column')

    // Backward-compatible save path for DBs that haven't run the resume-v1 migration yet.
    if (error && (missingTemplateColumn || missingProjectsColumn)) {
      const fallbackPayload = {
        user_id: user.id,
        full_name: draft.full_name,
        email: draft.email,
        phone: draft.phone,
        location: draft.location,
        summary: draft.summary,
        education: draft.education,
        experience: draft.experience,
        skills: draft.skills,
        certifications: {
          _legacy_projects: draft.projects,
          _profile_image_filename: draft.profile_image_filename,
          _profile_image_base64: draft.profile_image_base64,
        },
        updated_at: new Date().toISOString(),
      }

      const retry = await supabase.from('resumes').upsert(fallbackPayload, { onConflict: 'user_id' }).select('*').single()
      data = retry.data
      error = retry.error
    }

    if (error) {
      console.error('PUT /api/resume upsert error:', error)
      return NextResponse.json({ error: error.message || 'Failed to save resume' }, { status: 500 })
    }

    return NextResponse.json({ resume: normalizeResumeDraft(withLegacyProjects(data)) })
  } catch (error) {
    console.error('PUT /api/resume error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
