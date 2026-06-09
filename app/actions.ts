'use server'

import { createClient } from '@/lib/supabase/server'
import { isValidASIN } from '@/lib/types'
import type { ReviewStatus } from '@/lib/types'
import { revalidatePath } from 'next/cache'

// ============================================
// Server Actions for review request mutations
// ============================================

interface ActionResult {
  success: boolean
  error?: string
  duplicate?: {
    id: string
    status: ReviewStatus
    created_at: string
  }
}

/**
 * Check if a duplicate review request exists (same client + same ASIN)
 * that is still active (Pending or In Progress).
 * 
 * Uses case-insensitive matching for client_name so "Acme Corp" and
 * "acme corp" are treated as the same client.
 */
export async function checkDuplicate(
  clientName: string,
  productAsin: string
): Promise<ActionResult> {
  const supabase = await createClient()

  // Use .ilike for case-insensitive client_name matching
  // ASIN is always uppercased before storage, so .eq is fine
  const { data, error } = await supabase
    .from('review_requests')
    .select('id, status, created_at')
    .ilike('client_name', clientName)
    .eq('product_asin', productAsin.toUpperCase())
    .in('status', ['Pending', 'In Progress'])
    .limit(1)

  if (error) {
    return { success: false, error: error.message }
  }

  if (data && data.length > 0) {
    return {
      success: true,
      duplicate: {
        id: data[0].id,
        status: data[0].status as ReviewStatus,
        created_at: data[0].created_at,
      },
    }
  }

  return { success: true }
}

/**
 * Create a new review request.
 * Validates inputs server-side before inserting.
 * Returns duplicate info if a matching active request exists.
 */
export async function createReviewRequest(
  clientName: string,
  productAsin: string,
  skipDuplicateCheck: boolean = false
): Promise<ActionResult> {
  // Server-side validation
  const trimmedName = clientName.trim()
  const trimmedAsin = productAsin.trim().toUpperCase()

  if (!trimmedName) {
    return { success: false, error: 'Client name is required.' }
  }

  if (!isValidASIN(trimmedAsin)) {
    return {
      success: false,
      error: 'Product ASIN must be exactly 10 alphanumeric characters.',
    }
  }

  // Check for active duplicates unless explicitly skipped by user
  if (!skipDuplicateCheck) {
    const duplicateCheck = await checkDuplicate(trimmedName, trimmedAsin)
    if (!duplicateCheck.success) {
      return duplicateCheck
    }
    if (duplicateCheck.duplicate) {
      // Return duplicate info so the UI can show a warning
      // Note: success is true because the check itself succeeded —
      // the presence of .duplicate tells the client to prompt the user
      return duplicateCheck
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('review_requests').insert({
    client_name: trimmedName,
    product_asin: trimmedAsin,
    status: 'Pending',
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

/**
 * Update a review request's status.
 */
export async function updateRequestStatus(
  id: string,
  newStatus: ReviewStatus
): Promise<ActionResult> {
  const validStatuses: ReviewStatus[] = ['Pending', 'In Progress', 'Done']
  if (!validStatuses.includes(newStatus)) {
    return { success: false, error: 'Invalid status.' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('review_requests')
    .update({ status: newStatus })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

/**
 * Delete a review request.
 */
export async function deleteReviewRequest(id: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('review_requests')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}
