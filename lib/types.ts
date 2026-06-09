// ============================================
// Type definitions for the review_requests table
// ============================================

export type ReviewStatus = 'Pending' | 'In Progress' | 'Done'

export interface ReviewRequest {
  id: string
  client_name: string
  product_asin: string
  status: ReviewStatus
  created_at: string
}

// Valid status transitions
export const STATUS_OPTIONS: ReviewStatus[] = ['Pending', 'In Progress', 'Done']

// ASIN validation: exactly 10 alphanumeric characters
export function isValidASIN(asin: string): boolean {
  return /^[A-Z0-9]{10}$/i.test(asin)
}
