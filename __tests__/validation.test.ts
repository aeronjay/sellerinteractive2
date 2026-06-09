import { isValidASIN, formatDate, timeAgo, STATUS_OPTIONS } from '@/lib/types'

// ============================================
// ASIN Validation Tests
// ============================================
describe('isValidASIN', () => {
  // Valid ASINs
  test('accepts a standard 10-character alphanumeric ASIN', () => {
    expect(isValidASIN('B08N5WRWNW')).toBe(true)
  })

  test('accepts all-digit ASIN (ISBN-10 style)', () => {
    expect(isValidASIN('0123456789')).toBe(true)
  })

  test('accepts all-letter ASIN', () => {
    expect(isValidASIN('ABCDEFGHIJ')).toBe(true)
  })

  test('accepts lowercase ASIN (case-insensitive)', () => {
    expect(isValidASIN('b08n5wrwnw')).toBe(true)
  })

  test('accepts mixed-case ASIN', () => {
    expect(isValidASIN('B08n5WrWnW')).toBe(true)
  })

  // Invalid ASINs
  test('rejects ASIN shorter than 10 characters', () => {
    expect(isValidASIN('B08N5')).toBe(false)
  })

  test('rejects ASIN longer than 10 characters', () => {
    expect(isValidASIN('B08N5WRWNWX')).toBe(false)
  })

  test('rejects empty string', () => {
    expect(isValidASIN('')).toBe(false)
  })

  test('rejects ASIN with spaces', () => {
    expect(isValidASIN('B08N WRWNW')).toBe(false)
  })

  test('rejects ASIN with special characters', () => {
    expect(isValidASIN('B08N5-WRWN')).toBe(false)
  })

  test('rejects ASIN with underscores', () => {
    expect(isValidASIN('B08N5_WRWN')).toBe(false)
  })
})

// ============================================
// Status Options Tests
// ============================================
describe('STATUS_OPTIONS', () => {
  test('contains all valid statuses in order', () => {
    expect(STATUS_OPTIONS).toEqual(['Pending', 'In Progress', 'Done'])
  })

  test('has exactly 3 entries', () => {
    expect(STATUS_OPTIONS).toHaveLength(3)
  })
})

// ============================================
// Date Formatting Tests
// ============================================
describe('formatDate', () => {
  test('formats a date string correctly', () => {
    const result = formatDate('2025-01-15T10:30:00Z')
    // Should contain month, day, and year
    expect(result).toMatch(/Jan/)
    expect(result).toMatch(/15/)
    expect(result).toMatch(/2025/)
  })

  test('handles ISO date strings', () => {
    const result = formatDate('2024-12-25T00:00:00.000Z')
    expect(result).toMatch(/Dec/)
    expect(result).toMatch(/2024/)
  })
})

describe('timeAgo', () => {
  test('returns "just now" for very recent dates', () => {
    const now = new Date().toISOString()
    expect(timeAgo(now)).toBe('just now')
  })

  test('returns minutes for dates less than an hour ago', () => {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    expect(timeAgo(thirtyMinAgo)).toBe('30m ago')
  })

  test('returns hours for dates less than a day ago', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    expect(timeAgo(threeHoursAgo)).toBe('3h ago')
  })

  test('returns days for dates less than 30 days ago', () => {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    expect(timeAgo(fiveDaysAgo)).toBe('5d ago')
  })

  test('returns formatted date for dates older than 30 days', () => {
    const oldDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    // Should fall back to formatDate output (contains a year)
    expect(timeAgo(oldDate)).toMatch(/\d{4}/)
  })
})
