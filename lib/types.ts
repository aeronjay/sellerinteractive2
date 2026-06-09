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

// Valid status values
export const STATUS_OPTIONS: ReviewStatus[] = ['Pending', 'In Progress', 'Done']

/**
 * ASIN validation: exactly 10 alphanumeric characters.
 * Amazon ASINs always start with B0 and are uppercase,
 * but we accept any 10 alphanumeric chars to be flexible.
 */
export function isValidASIN(asin: string): boolean {
  return /^[A-Z0-9]{10}$/i.test(asin)
}

/**
 * Format a date string for display.
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Get the relative time string (e.g. "2 hours ago").
 */
export function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return formatDate(dateStr)
}
