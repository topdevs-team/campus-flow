import { createClient } from '@supabase/supabase-js'
import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
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

    const { message, pdfId } = await request.json()

    if (!message || !pdfId) {
      return NextResponse.json({ error: 'Missing message or pdfId' }, { status: 400 })
    }

    // Get embeddings for the PDF
    const { data: embeddings } = await supabase
      .from('embeddings')
      .select('chunk_text')
      .eq('pdf_id', pdfId)
      .eq('user_id', user.id)
      .limit(5) // Get top 5 relevant chunks

    // Build context from embeddings
    const context = embeddings?.map((e) => e.chunk_text).join('\n\n') || ''

    // Use AI SDK to generate response
    const result = await generateText({
      model: 'openai/gpt-4o-mini',
      system: `You are a helpful assistant that answers questions about PDF documents. 
Use the provided context to answer questions accurately.
If the answer is not in the context, say so clearly.

Context from the PDF:
${context}`,
      prompt: message,
      temperature: 0.7,
      maxOutputTokens: 500,
    })

    return NextResponse.json({ response: result.text })
  } catch (error) {
    console.error('Error in chat route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
