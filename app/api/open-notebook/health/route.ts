import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

function getUiUrl() {
  return process.env.OPEN_NOTEBOOK_URL || 'http://localhost:8502'
}

function getApiUrl() {
  return process.env.OPEN_NOTEBOOK_API_URL || 'http://localhost:5055'
}

async function check(url: string) {
  try {
    const response = await fetch(url, { method: 'GET', cache: 'no-store' })
    return { ok: response.ok, status: response.status }
  } catch (error) {
    return { ok: false, status: 0, error: error instanceof Error ? error.message : 'unreachable' }
  }
}

export async function GET() {
  const uiBase = getUiUrl().replace(/\/+$/, '')
  const apiBase = getApiUrl().replace(/\/+$/, '')

  const [ui, api] = await Promise.all([
    check(`${uiBase}/notebooks`),
    check(`${apiBase}/health`),
  ])

  return NextResponse.json({
    uiBase,
    apiBase,
    ui,
    api,
  })
}
