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

## ⚠️ License & Usage

**Do not copy, reuse, or redistribute any part of this codebase without explicit written permission from the authors.**

© 2026 Campus Flow. All rights reserved.
