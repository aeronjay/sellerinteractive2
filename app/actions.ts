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
 */
export async function checkDuplicate(
  clientName: string,
  productAsin: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('review_requests')
    .select('id, status, created_at')
    .eq('client_name', clientName)
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
        status: data[0].status,
        created_at: data[0].created_at,
      },
    }
  }

  return { success: true }
}

/**
 * Create a new review request.
 * Validates inputs server-side before inserting.
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

  // Check for active duplicates unless explicitly skipped
  if (!skipDuplicateCheck) {
    const duplicateCheck = await checkDuplicate(trimmedName, trimmedAsin)
    if (!duplicateCheck.success) {
      return duplicateCheck
    }
    if (duplicateCheck.duplicate) {
      return duplicateCheck // Return duplicate info for the UI to handle
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
