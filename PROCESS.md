# PROCESS.md — Client Review Tracker

## How I Used AI / Claude Code

- **Delegated**: Scaffold generation, boilerplate (Supabase client setup, type definitions), CSS styling, test cases, and documentation drafting. The AI handled the repetitive structural code so I could focus on architecture decisions and the interesting logic.
- **Prompts that worked well**: Starting with a full plan before touching code. Giving the AI the complete task spec upfront and asking it to generate a structured implementation plan let me review the approach before any code was written.
- **One moment the AI was wrong**: When generating the Supabase server client, the AI initially used a synchronous `createClient()` pattern without `await`. Since `cookies()` in Next.js 15+ is async (returns a `Promise`), and the `@supabase/ssr` server client depends on it, I had to ensure `createClient()` in `lib/supabase/server.ts` is `async` and callers `await` it. This is the same class of bug present in the debug snippet — easy to miss if you're used to older Next.js patterns.

## Duplicate Handling Decision

**Strategy: Warn but allow, with a confirmation step.**

- When a user submits a request with the same `client_name` + `product_asin` as an **active** request (`Pending` or `In Progress`), the UI shows a warning banner with the existing request's status and creation date, and asks the user to confirm or cancel.
- If the existing request is `Done`, the new submission goes through silently (re-reviews are legitimate).
- **Case-insensitive matching**: The duplicate check uses `.ilike()` for `client_name` so "Acme Corp" and "acme corp" are treated as the same client. ASINs are always uppercased before storage, so `.eq()` is sufficient for those.
- **Why this approach**: 
  - A hard database constraint (`UNIQUE`) is too aggressive — legitimate re-reviews happen after a product listing changes, or when a previous review was done months ago.
  - Silently allowing all duplicates creates waste — someone might not realize a colleague already submitted the same request.
  - The warn-but-allow approach gives the user full context to make an informed decision. It respects their judgment while preventing accidental duplicates.

## Debug: What Was Wrong

The original `getRequestsByStatus` snippet had **three bugs**:

```ts
// ORIGINAL (buggy)
export async function getRequestsByStatus(status: string) {
  const supabase = createClient()          // Bug 1
  const result = supabase                  // Bug 2
    .from('review_requests')
    .select('*')
    .eq('status', status)
  return result.rows                       // Bug 3
}
```

1. **Missing `await` on `createClient()`** — The server-side `createClient` from `@supabase/ssr` is async because it accesses `cookies()`, which is a `Promise` in Next.js 15+. Without `await`, `supabase` is a Promise, not a client instance.

2. **Missing `await` on the query chain** — `supabase.from().select().eq()` returns a `PromiseLike<PostgrestResponse>`. Without `await`, `result` is an unresolved Promise, not the query result.

3. **`.rows` doesn't exist on the Supabase response** — The Supabase JS SDK returns `{ data, error }`, not `.rows`. The `.rows` property is from the raw `pg` / `node-postgres` driver. The correct access pattern is destructuring `{ data, error }` from the awaited result.

**Fixed version:**
```ts
export async function getRequestsByStatus(status: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('review_requests')
    .select('*')
    .eq('status', status)
  if (error) throw error
  return data
}
```

## What I'd Add With More Time

- **Authentication** — Add Supabase Auth so requests are tied to users. Currently it's fully open via the anon key.
- **Optimistic UI updates** — Use React's `useOptimistic` hook for instant status changes before server confirmation.
- **Pagination** — Add cursor-based pagination for large request lists.
- **Search** — Full-text search across client names and ASINs.
- **Audit log** — Track who changed what and when (status history per request).
- **E2E tests** — Playwright tests for the full user flow (add, filter, update, duplicate warning).
- **Toast notifications** — Replace inline success/error messages with a proper toast system.
- **Loading skeletons** — Add skeleton UI during data fetches for better perceived performance.
- **Rate limiting** — Prevent abuse of the create endpoint.
