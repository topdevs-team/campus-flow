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

---

<<<<<<< Gowreesh
## LaTeX Deployment (Vercel + Render)

Resume PDF compile/preview can run in hybrid mode:
- App/UI/auth APIs on Vercel
- LaTeX compile worker endpoint on Render

### Environment variables

Add these to Vercel and Render as needed:

```env
# Optional local override for compiler path when compiling locally
LATEX_BIN=/Library/TeX/texbin/pdflatex

# If set, resume compile/preview routes offload LaTeX compilation to this base URL
=======
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
>>>>>>> main
# Example: https://campus-flow-render.onrender.com
LATEX_RENDER_URL=

# Optional full override for remote compile endpoint
# Defaults to {LATEX_RENDER_URL}/api/latex/compile
LATEX_RENDER_COMPILE_URL=

<<<<<<< Gowreesh
# Shared secret between Vercel and Render compile endpoint
LATEX_RENDER_SECRET=
```

### Side-by-side setup

1. Deploy app to Render with TeX installed (`pdflatex` available).
2. Keep `/api/latex/compile` reachable on Render.
3. Set `LATEX_RENDER_SECRET` on both deployments.
4. Set `LATEX_RENDER_URL` on Vercel to the Render deployment URL.
5. Do **not** set `LATEX_RENDER_URL` on Render itself (so Render compiles locally and avoids proxy loops).
=======
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
>>>>>>> main

---

## ⚠️ License & Usage

**Do not copy, reuse, or redistribute any part of this codebase without explicit written permission from the authors.**

© 2026 Campus Flow. All rights reserved.
