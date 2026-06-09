// ============================================
// Server-side data access helpers
// ============================================
// FIXED VERSION — Original had 3 bugs:
//   1. Missing `await` on createClient() (it's async)
//   2. Missing `await` on the query chain (returns a Promise)
//   3. Used `.rows` instead of `.data` (Supabase JS SDK returns { data, error })
// ============================================

import { createClient } from '@/lib/supabase/server'
import type { ReviewRequest } from '@/lib/types'

export async function getRequestsByStatus(status: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('review_requests')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ReviewRequest[]
}

export async function getAllRequests() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('review_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ReviewRequest[]
}

export async function getRequests(status?: string) {
  if (status && status !== 'All') {
    return getRequestsByStatus(status)
  }
  return getAllRequests()
}
