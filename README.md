████████╗ ██████╗ ██████╗      ██████╗ ███████╗██╗   ██╗███████╗
╚══██╔══╝██╔═══██╗██╔══██╗     ██╔══██╗██╔════╝██║   ██║██╔════╝
   ██║   ██║   ██║██████╔╝     ██║  ██║█████╗  ██║   ██║███████╗
   ██║   ██║   ██║██╔═══╝      ██║  ██║██╔══╝  ╚██╗ ██╔╝╚════██║
   ██║   ╚██████╔╝██║          ██████╔╝███████╗ ╚████╔╝ ███████║
   ╚═╝    ╚═════╝ ╚═╝          ╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝


# Campus Flow

A campus productivity platform — roommate matching, notes storage, resume builder, PDF chat, and support tickets.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) or npm

### Installation

```bash
npm install
```

### Setup Environment

Create a `.env.local` file in the root with the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key

# Optional model defaults for PDF Studio (chat/slides/voice/video)
CHAT_TRANSFORMATION_MODEL=openai/gpt-4o-mini
CHAT_TTS_MODEL=tts-1
CHAT_TTS_VOICE=alloy
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## Database Setup

Run the SQL scripts in order in your Supabase SQL Editor:

1. `scripts/setup-db.sql` — creates all tables
2. `scripts/rls.sql` — sets up Row Level Security policies

## Resume LaTeX Preview/Download Setup

Resume PDF endpoints:
- `POST /api/resume/preview` (live preview PDF)
- `POST /api/resume/compile` (download PDF)

Both compile LaTeX on the server.

### Engine behavior

- `classic` and `modern` generally use `pdflatex`.
- `compact` may require `xelatex` (auto-detected from template content).
- Binary override env vars:
  - `LATEX_BIN_PDFLATEX`
  - `LATEX_BIN_XELATEX`
  - fallback: `LATEX_BIN`

### Required environment variables

Add to `.env.local` / Vercel / Render as needed:

```env
# Optional local override (fallback for both engines)
LATEX_BIN=/Library/TeX/texbin/pdflatex

# Optional explicit binaries
LATEX_BIN_PDFLATEX=/Library/TeX/texbin/pdflatex
LATEX_BIN_XELATEX=/Library/TeX/texbin/xelatex

# If set, resume compile/preview routes offload compilation to Render
# Example: https://campus-flow-render.onrender.com
LATEX_RENDER_URL=

# Optional full override for remote compile endpoint
# Defaults to {LATEX_RENDER_URL}/api/latex/compile
LATEX_RENDER_COMPILE_URL=

# Shared secret between app and compile endpoint
LATEX_RENDER_SECRET=
```

### Local development requirements

1. Install TeX distribution (MacTeX/TeX Live).
2. Ensure both are available:
   - `pdflatex`
   - `xelatex` (important for many compact templates)
3. Run app:
   - `npm run dev`
4. Test both preview and download from Resume page.

### Vercel + Render setup (recommended)

Use hybrid mode:
- Vercel: UI + auth + API routes
- Render: LaTeX compile runtime (`/api/latex/compile`)

Steps:
1. Deploy same app on Render with TeX installed.
2. Keep `/api/latex/compile` reachable on Render.
3. Set `LATEX_RENDER_SECRET` on both Vercel and Render.
4. Set `LATEX_RENDER_URL` on Vercel to Render base URL.
5. Do not set `LATEX_RENDER_URL` on Render (prevents proxy loops).

### Common preview/download errors

- `LaTeX compiler not found...`
  - Install TeX binaries or set `LATEX_BIN_*`.

- `LaTeX dependency missing: <file>.sty/.cls`
  - Template package/class missing in runtime. Install TeX packages or use Render offload.

- `Failed to compile LaTeX`
  - Usually template syntax/package/font issue. Check API error `detail` field.

---

## PDF Chat + Studio (Slides, Voice, Video)

`/dashboard/chat` now has:
- `Chat` tab: ask questions from selected PDF
- `Create` tab: generate from selected PDF:
  - `Slides` (markdown slide deck)
  - `Voice` (podcast script + mp3)
  - `Video Plan` (scene-by-scene storyboard markdown)

### Requirements

1. PDF must be uploaded and indexed into `embeddings` for the selected `pdf_id`.
2. `OPENAI_API_KEY` must be set for voice generation (TTS).
3. Optional model envs:
   - `CHAT_TRANSFORMATION_MODEL` (default: `openai/gpt-4o-mini`)
   - `CHAT_TTS_MODEL` (default: `tts-1`)
   - `CHAT_TTS_VOICE` (default: `alloy`)

### API

- `POST /api/chat` -> PDF Q&A
- `POST /api/chat/generate` -> `{ type: "slides" | "voice" | "video", pdfId, prompt }`

### Multi-provider model selection (Create tab)

In `/dashboard/chat` -> `Create`, you can set a model in `provider/model` format, e.g.:
- `openai/gpt-4o-mini`
- `anthropic/claude-3-5-sonnet-latest`
- `google/gemini-2.0-flash`
- `groq/llama-3.1-70b-versatile`
- `ollama/qwen2.5`

Voice output currently uses OpenAI TTS for mp3 synthesis after script generation.

---

## Open Notebook (Embedded in Campus Flow)

Open Notebook can run inside Campus Flow at `/dashboard/notebook` using rewrite proxies.

### Docker (local)

Open Notebook UI should be reachable at:
- `http://localhost:8502`

Open Notebook API should be reachable at:
- `http://localhost:5055`

### Optional environment overrides

```env
OPEN_NOTEBOOK_URL=http://localhost:8502
OPEN_NOTEBOOK_API_URL=http://localhost:5055
```

These values are used by:
- health endpoint: `GET /api/open-notebook/health`
- Next.js rewrites:
  - `/open-notebook/:path*` -> Open Notebook UI
  - `/open-notebook-api/:path*` -> Open Notebook API

---

## ⚠️ License & Usage

**Do not copy, reuse, or redistribute any part of this codebase without explicit written permission from the authors.**

© 2026 Campus Flow. All rights reserved.
