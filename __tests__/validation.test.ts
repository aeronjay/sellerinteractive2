import { isValidASIN } from '@/lib/types'

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

describe('ReviewStatus type safety', () => {
  test('STATUS_OPTIONS contains all valid statuses', () => {
    const { STATUS_OPTIONS } = require('@/lib/types')
    expect(STATUS_OPTIONS).toEqual(['Pending', 'In Progress', 'Done'])
  })

  test('STATUS_OPTIONS has exactly 3 entries', () => {
    const { STATUS_OPTIONS } = require('@/lib/types')
    expect(STATUS_OPTIONS).toHaveLength(3)
  })
})
