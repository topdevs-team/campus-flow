import { NextRequest, NextResponse } from 'next/server'
import { compileLatexToPdf, LatexAsset, LatexCompileError } from '@/lib/resume/latex-compiler'

export const runtime = 'nodejs'

interface CompileRequestBody {
  tex?: string
  assets?: LatexAsset[]
  engine?: 'pdflatex' | 'xelatex'
}

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.LATEX_RENDER_SECRET
  if (!secret) return true

  const headerValue = request.headers.get('x-latex-secret')
  return headerValue === secret
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as CompileRequestBody
    const tex = body?.tex

    if (!tex || typeof tex !== 'string') {
      return NextResponse.json({ error: 'Missing tex content' }, { status: 400 })
    }

    const pdf = await compileLatexToPdf(tex, {
      forceLocal: true,
      assets: Array.isArray(body.assets) ? body.assets : undefined,
      engine: body.engine === 'xelatex' ? 'xelatex' : body.engine === 'pdflatex' ? 'pdflatex' : undefined,
    })

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    if (error instanceof LatexCompileError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          detail: error.detail?.slice(0, 600),
        },
        { status: 500 }
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
