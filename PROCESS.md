# PROCESS.md — Client Review Tracker

## How I Used AI / Claude Code
Used Gemini 3.1 Pro to create a plan with the task and everything: 
Prompt: Help me with planning this project, Do best practices, ask me before proceeding.

From there I started implementing each step of the plan and asked Gemini to check my work and help with debugging.


## Duplicate Handling Decision
 - Should be able to proceed with creating a review request even if there is a duplicate. But should display a warning message and confirmation.


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
searching for specific review, able to mass input request via csv file. make the view of everything more userfriendly.

