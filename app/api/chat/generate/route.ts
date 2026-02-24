import { createClient } from '@supabase/supabase-js'
import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'

type OutputType = 'slides' | 'voice' | 'video'

function getModel(name: string, fallback: string) {
  const value = process.env[name]
  return value && value.trim().length > 0 ? value.trim() : fallback
}

function sanitizeModel(model: string | undefined): string | null {
  if (!model) return null
  const value = model.trim()
  if (!value) return null
  if (value.length > 80) return null
  if (!/^[a-z0-9._/-]+$/i.test(value)) return null

  const allowedPrefixes = [
    'openai/',
    'anthropic/',
    'google/',
    'groq/',
    'xai/',
    'ollama/',
    'openrouter/',
    'mistral/',
    'deepseek/',
  ]

  if (!allowedPrefixes.some((prefix) => value.startsWith(prefix))) return null
  return value
}

type EmbeddingRow = { chunk_text: string }

async function fetchPdfContext(
  supabase: ReturnType<typeof createClient<any, any, any>>,
  userId: string,
  pdfId: string,
): Promise<string> {
  const { data: embeddings } = await supabase
    .from('embeddings')
    .select('chunk_text')
    .eq('pdf_id', pdfId)
    .eq('user_id', userId)
    .limit(25)

  return ((embeddings as EmbeddingRow[] | null) ?? []).map((row) => row.chunk_text).join('\n\n')
}

async function generateSlides(context: string, prompt: string, overrideModel?: string) {
  const model = sanitizeModel(overrideModel) || getModel('CHAT_TRANSFORMATION_MODEL', 'openai/gpt-4o-mini')
  const result = await generateText({
    model,
    temperature: 0.4,
    maxOutputTokens: 1800,
    system: `You create concise slide decks from PDF content.
Output strict markdown only in this structure:
# Deck Title
## Slide 1: ...
- bullet
- bullet
...
Keep 8-12 slides max.`,
    prompt: `Task: ${prompt}\n\nPDF Context:\n${context}`,
  })

  return { markdown: result.text }
}

async function generateVideoStoryboard(context: string, prompt: string, overrideModel?: string) {
  const model = sanitizeModel(overrideModel) || getModel('CHAT_TRANSFORMATION_MODEL', 'openai/gpt-4o-mini')
  const result = await generateText({
    model,
    temperature: 0.5,
    maxOutputTokens: 1800,
    system: `You create a short educational video plan from source material.
Return strict markdown with:
1) Video title
2) 8-12 scenes
For each scene include:
- Scene title
- Visual shot description
- Narration script (2-4 lines)
- On-screen text`,
    prompt: `Task: ${prompt}\n\nPDF Context:\n${context}`,
  })

  return { markdown: result.text }
}

async function generateVoiceScript(context: string, prompt: string, overrideModel?: string) {
  const model = sanitizeModel(overrideModel) || getModel('CHAT_TRANSFORMATION_MODEL', 'openai/gpt-4o-mini')
  const result = await generateText({
    model,
    temperature: 0.6,
    maxOutputTokens: 1600,
    system: `Write a podcast-style narration script from PDF material.
Keep it natural, clear, and structured with intro, core sections, and conclusion.
Do not include markdown symbols.`,
    prompt: `Task: ${prompt}\n\nPDF Context:\n${context}`,
  })

  return result.text
}

async function synthesizeVoice(script: string) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for voice generation')
  }

  const model = getModel('CHAT_TTS_MODEL', 'tts-1')
  const voice = getModel('CHAT_TTS_VOICE', 'alloy')

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      voice,
      input: script.slice(0, 4000),
      format: 'mp3',
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || 'TTS request failed')
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  return buffer.toString('base64')
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const pdfId = String(body?.pdfId || '')
    const type = String(body?.type || '') as OutputType
    const prompt = String(body?.prompt || 'Generate learning material from this PDF')
    const model = sanitizeModel(body?.model ? String(body.model) : undefined)

    if (!pdfId || !type) {
      return NextResponse.json({ error: 'Missing pdfId or type' }, { status: 400 })
    }

    if (!['slides', 'voice', 'video'].includes(type)) {
      return NextResponse.json({ error: 'Unsupported type' }, { status: 400 })
    }

    const context = await fetchPdfContext(supabase, user.id, pdfId)
    if (!context.trim()) {
      return NextResponse.json(
        { error: 'No indexed content found for this PDF. Upload/index PDF first.' },
        { status: 400 },
      )
    }

    if (type === 'slides') {
      const result = await generateSlides(context, prompt, model ?? undefined)
      return NextResponse.json({ type, ...result })
    }

    if (type === 'video') {
      const result = await generateVideoStoryboard(context, prompt, model ?? undefined)
      return NextResponse.json({ type, ...result })
    }

    const script = await generateVoiceScript(context, prompt, model ?? undefined)
    const audioBase64 = await synthesizeVoice(script)
    return NextResponse.json({
      type,
      script,
      audioBase64,
      mimeType: 'audio/mpeg',
    })
  } catch (error) {
    console.error('Error in generate route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
