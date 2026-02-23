import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'

export interface LatexAsset {
  name: string
  content?: string
  contentBase64?: string
}

type LatexEngine = 'pdflatex' | 'xelatex'

export class LatexCompileError extends Error {
  code: string
  detail?: string

  constructor(code: string, message: string, detail?: string) {
    super(message)
    this.code = code
    this.detail = detail
  }
}

function normalizeRenderUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

function sanitizeAssetName(name: string): string {
  const normalized = name.replace(/\\/g, '/').trim().replace(/^\/+/, '')
  const safeSegments = normalized
    .split('/')
    .filter(Boolean)
    .filter((segment) => segment !== '.' && segment !== '..')
    .map((segment) => segment.replace(/[^a-zA-Z0-9._-]/g, ''))
    .filter(Boolean)

  if (!safeSegments.length) return 'asset'
  return safeSegments.join('/')
}

function detectLatexEngine(tex: string, assets: LatexAsset[]): LatexEngine {
  if (
    /\\documentclass(?:\[[^\]]*\])?\{twentysecondcv\}/.test(tex) ||
    /\\usepackage(?:\[[^\]]*\])?\{fontspec\}/.test(tex) ||
    assets.some((asset) => sanitizeAssetName(asset.name).endsWith('twentysecondcv.cls'))
  ) {
    return 'xelatex'
  }

  return 'pdflatex'
}

function isAllowedAsset(filename: string): boolean {
  return /\.(cls|sty|ttf|otf|png|jpe?g|pdf)$/i.test(filename)
}

function isBinaryAsset(filename: string): boolean {
  return /\.(ttf|otf|png|jpe?g|pdf)$/i.test(filename)
}

export async function collectTemplateAssets(): Promise<LatexAsset[]> {
  const templatesDir = path.join(process.cwd(), 'lib', 'resume', 'templates')
  const assets: LatexAsset[] = []
  const queue = [templatesDir]

  while (queue.length) {
    const currentDir = queue.pop()!
    const entries = await fs.readdir(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)

      if (entry.isDirectory()) {
        queue.push(fullPath)
        continue
      }

      if (!entry.isFile()) continue
      if (!isAllowedAsset(entry.name)) continue

      const relativeName = path.relative(templatesDir, fullPath).replace(/\\/g, '/')
      if (isBinaryAsset(entry.name)) {
        const contentBase64 = (await fs.readFile(fullPath)).toString('base64')
        assets.push({ name: relativeName, contentBase64 })
      } else {
        const content = await fs.readFile(fullPath, 'utf8')
        assets.push({ name: relativeName, content })
      }
    }
  }

  return assets
}

export async function compileLatexToPdf(
  tex: string,
  options?: { forceLocal?: boolean; assets?: LatexAsset[]; engine?: LatexEngine }
): Promise<Buffer> {
  const forceLocal = Boolean(options?.forceLocal)
  const renderBaseUrl = process.env.LATEX_RENDER_URL
  const baseAssets = await collectTemplateAssets()
  const mergedAssetsMap = new Map<string, LatexAsset>()
  for (const asset of baseAssets) {
    mergedAssetsMap.set(asset.name, asset)
  }
  for (const asset of options?.assets ?? []) {
    mergedAssetsMap.set(asset.name, asset)
  }
  const mergedAssets = Array.from(mergedAssetsMap.values())
  const selectedEngine = options?.engine || detectLatexEngine(tex, mergedAssets)

  if (!forceLocal && renderBaseUrl) {
    return compileViaRender(tex, mergedAssets, selectedEngine)
  }

  return compileLocally(tex, mergedAssets, selectedEngine)
}

async function compileViaRender(tex: string, assets: LatexAsset[], engine: LatexEngine): Promise<Buffer> {
  const baseUrl = normalizeRenderUrl(process.env.LATEX_RENDER_URL!)
  const endpoint = process.env.LATEX_RENDER_COMPILE_URL || `${baseUrl}/api/latex/compile`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60_000)

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (process.env.LATEX_RENDER_SECRET) {
      headers['x-latex-secret'] = process.env.LATEX_RENDER_SECRET
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ tex, assets, engine }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null)
      throw new LatexCompileError(
        'LATEX_RENDER_FAILED',
        errorPayload?.error || 'Render compiler request failed',
        errorPayload?.detail
      )
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    return buffer
  } catch (error) {
    if (error instanceof LatexCompileError) {
      throw error
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new LatexCompileError('LATEX_RENDER_TIMEOUT', 'Render compiler timed out')
    }

    throw new LatexCompileError(
      'LATEX_RENDER_UNREACHABLE',
      'Unable to reach Render compiler service',
      error instanceof Error ? error.message : undefined
    )
  } finally {
    clearTimeout(timeout)
  }
}

async function compileLocally(tex: string, assets: LatexAsset[], engine: LatexEngine): Promise<Buffer> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'resume-'))
  const texPath = path.join(tempDir, 'resume.tex')

  try {
    for (const asset of assets) {
      const filename = sanitizeAssetName(asset.name)
      if (!isAllowedAsset(filename)) continue

      const outputPath = path.join(tempDir, filename)
      await fs.mkdir(path.dirname(outputPath), { recursive: true })
      if (asset.contentBase64) {
        const buffer = Buffer.from(asset.contentBase64, 'base64')
        await fs.writeFile(outputPath, buffer)

        if (/\.(cls|sty)$/i.test(filename)) {
          await fs.writeFile(path.join(tempDir, path.basename(filename)), buffer)
        }

        if (path.basename(filename).toLowerCase() === 'segoeuib.ttf') {
          const fontPath = path.join(tempDir, 'fonts', 'segoeuib.ttf')
          await fs.mkdir(path.dirname(fontPath), { recursive: true })
          await fs.writeFile(fontPath, buffer)
        }
        continue
      }

      await fs.writeFile(outputPath, asset.content ?? '', 'utf8')

      if (/\.(cls|sty)$/i.test(filename)) {
        await fs.writeFile(path.join(tempDir, path.basename(filename)), asset.content ?? '', 'utf8')
      }

      if (path.basename(filename).toLowerCase() === 'segoeuib.ttf') {
        const fontPath = path.join(tempDir, 'fonts', 'segoeuib.ttf')
        await fs.mkdir(path.dirname(fontPath), { recursive: true })
        await fs.writeFile(fontPath, asset.content ?? '', 'utf8')
      }
    }

    await fs.writeFile(texPath, tex, 'utf8')

    const defaultLatexBin = engine === 'xelatex' ? '/Library/TeX/texbin/xelatex' : '/Library/TeX/texbin/pdflatex'
    const latexBinary =
      engine === 'xelatex'
        ? process.env.LATEX_BIN_XELATEX || process.env.LATEX_BIN || defaultLatexBin
        : process.env.LATEX_BIN_PDFLATEX || process.env.LATEX_BIN || defaultLatexBin

    await new Promise<void>((resolve, reject) => {
      const latexBinDir = path.dirname(latexBinary)
      const child = spawn(
        latexBinary,
        ['-interaction=nonstopmode', '-halt-on-error', '-output-directory', tempDir, texPath],
        {
          stdio: ['ignore', 'pipe', 'pipe'],
          cwd: tempDir,
          env: {
            ...process.env,
            PATH: `${latexBinDir}:${process.env.PATH || ''}`,
          },
        }
      )

      let stdout = ''
      let stderr = ''

      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString()
      })

      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString()
      })

      child.on('error', (error) => {
        reject(error)
      })

      child.on('close', (code) => {
        if (code === 0) {
          resolve()
          return
        }

        reject(new Error(stderr || stdout || `${engine} exited with code ${code}`))
      })
    })

    return await fs.readFile(path.join(tempDir, 'resume.pdf'))
  } catch (error) {
    const detail = error instanceof Error ? error.message : undefined
    const missingPackageMatch = detail?.match(/File `([^`]+?\.(?:sty|cls|ttf|otf))' not found\./i)
    const isMissingCompiler =
      error instanceof Error &&
      ((error as NodeJS.ErrnoException).code === 'ENOENT' || detail?.toLowerCase().includes(`spawn ${engine}`))

    if (isMissingCompiler) {
      const compilerName = engine === 'xelatex' ? 'xelatex' : 'pdflatex'
      throw new LatexCompileError(
        'LATEX_COMPILER_MISSING',
        `LaTeX compiler not found on server/runtime. Install ${compilerName} (TeX Live/MacTeX) and retry.`,
        detail
      )
    }

    if (missingPackageMatch) {
      throw new LatexCompileError(
        'LATEX_PACKAGE_MISSING',
        `LaTeX dependency missing: ${missingPackageMatch[1]}. Install required TeX packages or use the Render compiler service.`,
        detail
      )
    }

    throw new LatexCompileError('LATEX_COMPILE_FAILED', 'Failed to compile LaTeX', detail)
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
}
