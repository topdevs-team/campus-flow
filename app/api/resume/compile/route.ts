import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs/promises'
import path from 'node:path'
import { resumeDraftSchema } from '@/lib/resume-schema'
import { renderLatex } from '@/lib/resume/render-latex'
import { compileLatexToPdf, LatexCompileError } from '@/lib/resume/latex-compiler'

export const runtime = 'nodejs'

function getSupabaseForRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null

  const token = authHeader.replace('Bearer ', '')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
}

async function extractProfileImageAsset(draft: { template_id: string; profile_image_filename: string; profile_image_base64: string }) {
  if (draft.template_id !== 'compact' && draft.template_id !== 'modern') {
    return null
  }

  const defaultName = draft.template_id === 'modern' ? 'oval-transparent.png' : 'jack.jpg'
  const filename = (draft.profile_image_filename || defaultName).replace(/[^a-zA-Z0-9._-]/g, '') || defaultName
  let contentBase64 = (draft.profile_image_base64 || '').trim()

  if (contentBase64.startsWith('data:')) {
    const comma = contentBase64.indexOf(',')
    contentBase64 = comma >= 0 ? contentBase64.slice(comma + 1) : ''
  }

  if (!contentBase64) {
    try {
      const fallbackImage = await fs.readFile(path.join(process.cwd(), 'public', 'placeholder-user.jpg'))
      return {
        name: defaultName,
        contentBase64: fallbackImage.toString('base64'),
      }
    } catch {
      return null
    }
  }

  return { name: filename, contentBase64 }
}

export async function POST(request: NextRequest) {
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
    const parsed = resumeDraftSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      )
    }

    const latex = await renderLatex(parsed.data)
    const extraAssets = []
    const profileAsset = await extractProfileImageAsset(parsed.data)
    if (profileAsset) {
      extraAssets.push(profileAsset)
    }

    const pdf = await compileLatexToPdf(latex, {
      assets: extraAssets,
    })

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('POST /api/resume/compile error:', error)

    if (error instanceof LatexCompileError) {
      const status = error.code === 'LATEX_COMPILER_MISSING' ? 503 : 500
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          detail: error.detail?.slice(0, 600),
        },
        { status }
      )
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    )
  }
}
