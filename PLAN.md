# PLAN.md — Client Review Tracker

## Goal
Build a small internal tool for tracking client review requests, using **Next.js (App Router) + TypeScript + Supabase**.

## Core Features
1. **List view** — display review requests from Supabase (`id`, `client_name`, `product_asin`, `status`, `created_at`).
2. **Add form** — create a new review request with validation.
3. **Status updates** — cycle status: Pending → In Progress → Done.
4. **Status filter** — filter the list by Pending / In Progress / Done / All.
5. **Validation** — `client_name` required; `product_asin` must be exactly 10 alphanumeric characters (Amazon ASIN format).
6. **Duplicate handling** — warn-but-allow strategy with confirmation when a matching active request exists.

## Tech Decisions
- **Supabase JS v2** with `@supabase/ssr` for server-side rendering in App Router.
- **Server Actions** for mutations (create, update status) — keeps logic on the server, no API routes needed.
- **URL search params** for status filter — enables shareable filtered views and works with server components.
- **Tailwind CSS** for styling (ships with create-next-app, efficient for rapid development).

## Duplicate Handling Strategy
- **Same client + same ASIN where existing status is `Pending` or `In Progress`**: show a warning, require user confirmation.
- **Same client + same ASIN where existing status is `Done`**: allow silently (re-reviews are legitimate).
- **Rationale**: hard-blocking is too restrictive, silently allowing creates waste. A soft warning with confirmation gives the user full context to decide.

## Architecture
```
app/
├── page.tsx              ← Server component, main page
├── actions.ts            ← Server actions (create, update, check duplicate)
├── lib/
│   └── requests.ts       ← Data access helpers (fixed bug version)
├── components/
│   ├── ReviewTable.tsx    ← Client component, renders table + status updates
│   ├── AddRequestForm.tsx ← Client component, form + validation + duplicate warning
│   ├── StatusFilter.tsx   ← Client component, filter tabs
│   └── StatusBadge.tsx    ← Presentational, colored badges
lib/
└── supabase/
    ├── server.ts          ← Server-side Supabase client
    └── client.ts          ← Browser-side Supabase client
```

## Timeline
~60 min total, broken into phases: scaffold → schema → client setup → server logic → UI → styling → tests → docs.
