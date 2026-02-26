# Campus Flow — Project Presentation

---

## Slide 1 — Title Slide

# 🎓 Campus Flow
### A Smart Campus Management Platform for Students

> **One platform. Every campus need.**

Built with **Next.js 16**, **Supabase**, **TypeScript**, and **Tailwind CSS**.

---

## Slide 2 — Problem Statement

### The Problem

College students manage too many disconnected tools:

| Problem | Impact |
|---|---|
| Can't find compatible roommates | Hostel conflicts, poor wellbeing |
| Study materials scattered everywhere | Time wasted finding notes |
| No easy way to raise campus issues | Problems go unresolved |
| Building a resume takes hours | Missed job/internship deadlines |
| Club recruitments hard to track | Students miss opportunities |
| No AI help for studying | Lower academic performance |

**Campus Flow solves all of this in one place.**

---

## Slide 3 — Solution Overview

### What is Campus Flow?

Campus Flow is a **unified student dashboard** that brings together:

- 👤 Personal Profile Management
- 🏠 Smart Roommate Matching
- 📄 Notes & Study Material Storage
- 🎫 Support Ticket System
- 📝 AI-Powered Resume Builder
- 🏛️ Club Recruitment Tracker
- 🤖 AI Chat Assistant (PDF-aware)
- 📓 Research Notebook (Open Notebook)
- 🛡️ Admin Control Panel

---

## Slide 4 — Authentication System

### Secure Login & Signup

**Features:**
- Email & Password registration
- Google OAuth (One-click sign in)
- Automatic role detection — admin or student
- Secure session management via **Supabase Auth**
- Protected routes — unauthenticated users redirected to login

**How it works:**
1. Student signs up → lands on `/dashboard`
2. Admin signs up → automatically redirected to `/admin`
3. Google OAuth → checks `is_admin` flag → routes accordingly

> All pages are server-route protected. No unauthorized access possible.

---

## Slide 5 — Student Dashboard

### Central Command Center

The dashboard greets students with a **personalized welcome** and provides quick access to all features.

**What students see:**
- 🕐 Date-aware greeting (Good morning / afternoon / evening)
- 🚀 Feature shortcuts with descriptions
- 📊 Quick navigation to all modules

**Modules available from dashboard:**
| Feature | Description |
|---|---|
| Roommate Matching | Find compatible roommates |
| Notes Storage | Access study PDFs |
| Support Tickets | Raise campus issues |
| Resume Maker | Build your CV |
| Club Recruitments | Track club openings |
| Open Notebook | AI research workspace |

---

## Slide 6 — Student Profile

### Know Your Student Identity

Every student has a rich personal profile page at `/dashboard/profile`.

**Personal Information:**
- 🪪 Full Name
- 📷 Profile Photo (upload to cloud)
- 📧 Email — with ✅ Verified badge
- 📞 Phone Number
- 🎂 Date of Birth
- 👤 Gender (optional)
- 🏫 Department
- 📅 Academic Year (From → To)

**Key Features:**
- ✏️ Edit mode — click "Edit Profile" to modify any field
- 📸 Camera upload — click avatar to change photo instantly
- ☁️ Photos stored securely in Supabase Storage
- 💾 All data persisted in real-time to Supabase database

---

## Slide 7 — Roommate Matching

### Find Your Perfect Roommate

The roommate matching system uses an **algorithm** to pair students based on lifestyle preferences.

**How it works:**
1. Student fills in their preferences form
2. System compares preferences across all students
3. Algorithm scores compatibility
4. Matches shown ranked by compatibility score

**Preference Categories:**
- 🛏️ Sleep schedule (early bird / night owl)
- 📚 Study habits (quiet / group study)
- 🧹 Cleanliness level
- 🎵 Music / noise preference
- 🏠 Room guest policy
- 🚬 Smoking preference

> Powered by a custom **scoring algorithm** in `lib/matching.ts`

---

## Slide 8 — Notes Storage

### Your Study Material, Always Accessible

Students can upload, organize, and access class PDFs from anywhere.

**Features:**
- 📤 Upload PDFs for any course
- 🗂️ Filter by course code (100+ course codes supported)
- 👥 View **all students' shared notes** (community notes)
- 👤 View **your own notes** separately
- 🗑️ Delete your own uploads
- 🔗 Open PDF in new tab
- 📅 Timestamp showing when uploaded

**Supported courses include:**
- BCSE, BECE, BEEE, BMAT, BPHY, BENG and many more (100+ course codes)

> Files stored in **Supabase Storage** — fast, reliable, always available

---

## Slide 9 — Support Tickets

### Raise. Track. Resolve.

Students can raise support tickets directly to campus administration.

**Student Features:**
- ➕ Create new tickets with title and description
- 🔍 Filter tickets by status: All / Open / In Progress / Resolved
- 📋 View only **your own tickets**
- 🕐 See ticket creation timestamps

**Ticket Status Flow:**
```
Open → In Progress → Resolved
```

**Admin Features (from `/admin/tickets`):**
- 👁️ View ALL students' tickets
- 🔄 Change ticket status inline
- 🔍 Filter by status across all users

> Admins can manage every ticket from the `/admin` panel

---

## Slide 10 — Resume Builder

### Professional Resume in Minutes

The built-in resume builder helps students create a professional CV without any design tools.

**Features:**
- 📝 Fill structured form (name, education, experience, skills, projects)
- 🤖 AI-assisted content generation
- 👀 Live preview of the resume
- 📥 Download as **PDF**
- ☁️ LaTeX-powered PDF rendering for professional quality

**Sections covered:**
- Personal Information
- Education History
- Work / Internship Experience
- Projects
- Technical Skills
- Certifications

> Uses **LaTeX compilation** for pixel-perfect PDF output

---

## Slide 11 — Club Recruitments

### Never Miss a Club Opening

Students can track all active club recruitments on campus in one place.

**Features:**
- 🏛️ Browse all clubs recruiting students
- 📅 See application deadlines
- 🔗 Direct link to application forms
- 📌 Track which clubs are actively open
- 🏷️ Club categories and descriptions

> Students no longer miss club opportunities due to announcements being scattered across notice boards and WhatsApp groups.

---

## Slide 12 — AI Chat Assistant

### Study Smarter with AI

The AI assistant is deeply integrated with the student's uploaded notes.

**Two Modes:**

### 1. 💬 Chat Mode
- Ask questions about **your uploaded PDFs**
- Select any uploaded PDF as context
- AI answers based on the document content
- Full conversation history in the session

### 2. 🎬 Studio Mode
Generate study content from a prompt:

| Output Type | Description |
|---|---|
| 📊 Slides | Generates presentation markdown |
| 🎤 Voice | Generates spoken script + audio (OpenAI TTS) |
| 🎥 Video | Generates video-ready script |

> Powered by **OpenAI GPT-4o-mini** with PDF context injection

---

## Slide 13 — Open Notebook

### AI Research Workspace

Open Notebook is a full **multi-model AI research workspace** embedded directly inside Campus Flow at `/dashboard/notebook`.

**Features:**
- 📔 Create and manage research notebooks
- 🤖 Use multiple AI models in one place
- 🔍 Run experiments and document findings
- 🔗 Embedded inside Campus Flow (no need to switch apps)

**Tech Stack:**
- Runs via **Docker** (local or server)
- Uses **SurrealDB** for notebook storage
- Communicates via health-check API at `/api/open-notebook/health`

> Requires Docker to be running. Services: UI on port `8502`, API on port `5055`

---

## Slide 14 — Admin Panel

### Full Control for Campus Admins

Admins have a completely **separate panel** at `/admin` — fully isolated from the student dashboard.

**Admin Dashboard (`/admin`):**
- 📊 Total Users count
- 📄 Total Notes uploaded
- 🎫 Total Tickets (Open / In Progress / Resolved breakdown)
- 👥 Recent sign-ups table
- 🎫 Recent tickets table

**Admin Tickets (`/admin/tickets`):**
- 👁️ View ALL students' tickets
- 🔄 Update ticket status inline
- 🔍 Filter by status

**Access Control:**
- Admin flag stored as `is_admin` in Supabase `users` table
- Non-admin users attempting to access `/admin` are redirected away
- Race-condition-free auth using `adminLoading` state

---

## Slide 15 — Tech Stack

### Built With Modern Technology

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (Email + Google OAuth) |
| **Storage** | Supabase Storage |
| **AI / Chat** | OpenAI GPT-4o-mini |
| **PDF Rendering** | LaTeX compilation |
| **Notebook** | Open Notebook (Docker) |
| **Icons** | Lucide React |
| **Toasts** | Sonner |
| **Package Manager** | pnpm |

---

## Slide 16 — Architecture Overview

```
┌─────────────────────────────────────────────┐
│                  Campus Flow                 │
│                (Next.js App)                 │
├──────────────┬──────────────────────────────┤
│   /auth      │  Sign In / Sign Up / OAuth   │
├──────────────┼──────────────────────────────┤
│  /dashboard  │  Student Area                │
│              │  ├── Profile                 │
│              │  ├── Roommates               │
│              │  ├── Notes                   │
│              │  ├── Tickets                 │
│              │  ├── Resume                  │
│              │  ├── Clubs                   │
│              │  ├── Chat (AI)               │
│              │  └── Notebook                │
├──────────────┼──────────────────────────────┤
│  /admin      │  Admin Area (protected)      │
│              │  ├── Dashboard Stats         │
│              │  └── Tickets Management      │
├──────────────┼──────────────────────────────┤
│  /api        │  Backend APIs                │
│              │  ├── /chat                   │
│              │  ├── /roommates              │
│              │  └── /open-notebook/health   │
└──────────────┴──────────────────────────────┘
         │                    │
   Supabase DB          OpenAI API
   (Auth + Storage)     (Chat + TTS)
```

---

## Slide 17 — Key Highlights

### Why Campus Flow Stands Out

✅ **All-in-one** — no switching between apps  
✅ **AI-powered** — chat with your own notes  
✅ **Role-based** — separate admin and student experiences  
✅ **Real-time** — data syncs instantly via Supabase  
✅ **Secure** — RLS policies protect all data  
✅ **Responsive** — works on desktop and mobile  
✅ **Fast** — built with Turbopack, optimized for speed  
✅ **Extensible** — easy to add new modules  

---

## Slide 18 — Thank You

# Thank You! 🎓

### Campus Flow
**One platform. Every campus need.**

---

*Built by the Campus Flow Team — 2026*
