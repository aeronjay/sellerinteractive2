# Client Review Tracker

An internal tool for managing product review requests across clients. Built with **Next.js (App Router)**, **TypeScript**, and **Supabase**.

## Features

- 📋 **List review requests** with client name, ASIN, status, and creation date
- ➕ **Add new requests** with form validation
- 🔄 **Update status** via dropdown or quick-advance button (Pending → In Progress → Done)
- 🔍 **Filter by status** using URL-based tabs
- ⚠️ **Duplicate detection** — warns when an active request exists for the same client + ASIN
- 🗑️ **Delete requests** with confirmation
- ✅ **Validation** — client name required, ASIN must be 10 alphanumeric characters

---

## Setup

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd client-review-tracker
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor** and run the contents of [`supabase/schema.sql`](supabase/schema.sql)
3. Go to **Settings → API** and copy your **Project URL** and **anon public key**

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Testing

```bash
npm test
```

Runs unit tests for ASIN validation and status type definitions.

---

## Project Structure

```
client-review-tracker/
├── app/
│   ├── actions.ts              # Server actions (create, update, delete, duplicate check)
│   ├── page.tsx                # Main page (server component)
│   ├── layout.tsx              # Root layout with Inter font
│   ├── globals.css             # Global styles & animations
│   ├── lib/
│   │   └── requests.ts        # Data access helpers (fixed bug version)
│   └── components/
│       ├── AddRequestForm.tsx  # Form with validation & duplicate warning
│       ├── ReviewTable.tsx     # Request list with status controls
│       ├── StatusFilter.tsx    # Filter tabs (All/Pending/In Progress/Done)
│       └── StatusBadge.tsx     # Colored status badges
├── lib/
│   ├── types.ts                # TypeScript types & ASIN validator
│   └── supabase/
│       ├── server.ts           # Server-side Supabase client
│       └── client.ts           # Browser-side Supabase client
├── supabase/
│   └── schema.sql              # Database schema (run in Supabase SQL Editor)
├── __tests__/
│   └── validation.test.ts      # Unit tests
├── PLAN.md                     # Pre-build planning doc
├── PROCESS.md                  # Development process writeup
└── .env.example                # Environment variable template
```

---

## Tech Stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **TypeScript** (strict mode)
- **Supabase** (Postgres database + JS client)
- **Tailwind CSS v4** (utility-first styling)
- **Jest** + **ts-jest** (unit testing)
