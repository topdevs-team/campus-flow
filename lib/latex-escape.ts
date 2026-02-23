const ESCAPE_MAP: Record<string, string> = {
  '\\\\': '\\textbackslash{}',
  '{': '\\{',
  '}': '\\}',
  '$': '\\$',
  '&': '\\&',
  '#': '\\#',
  '_': '\\_',
  '%': '\\%',
  '~': '\\textasciitilde{}',
  '^': '\\textasciicircum{}',
}

function normalizeForLatex(value: string): string {
  return value
    .replace(/\u00A0/g, ' ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/•/g, '-')
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '') // remove emoji/symbol pictographs
    .replace(/[^\x20-\x7E\n\r\t]/g, '') // keep ASCII control-safe set for pdflatex
}

export function escapeLatex(value: string): string {
  return normalizeForLatex(value).replace(/[\\{}$&#_%~^]/g, (char) => ESCAPE_MAP[char] ?? char)
}

export function latexParagraph(value: string): string {
  const normalized = value.trim()
  if (!normalized) return ''
  return escapeLatex(normalized).replace(/\r?\n/g, '\n\n')
}
