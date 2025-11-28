import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  parseDatetime,
  DATETIME_DESCRIPTION,
} from '../../src/utils/datetime-parser'

describe('parseDatetime', () => {
  const FIXED_NOW = 1732800000 // 2024-11-28T12:00:00Z in epoch seconds

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW * 1000)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('number input (epoch seconds)', () => {
    it('should return the number as-is', () => {
      expect(parseDatetime(1732713600)).toBe(1732713600)
    })

    it('should handle zero', () => {
      expect(parseDatetime(0)).toBe(0)
    })
  })

  describe('relative time expressions', () => {
    it('should parse "now"', () => {
      expect(parseDatetime('now')).toBe(FIXED_NOW)
    })

    it('should parse "NOW" (case insensitive)', () => {
      expect(parseDatetime('NOW')).toBe(FIXED_NOW)
    })

    it('should parse "now-1h"', () => {
      expect(parseDatetime('now-1h')).toBe(FIXED_NOW - 3600)
    })

    it('should parse "now-30m"', () => {
      expect(parseDatetime('now-30m')).toBe(FIXED_NOW - 30 * 60)
    })

    it('should parse "now-7d"', () => {
      expect(parseDatetime('now-7d')).toBe(FIXED_NOW - 7 * 86400)
    })

    it('should parse "now-2w"', () => {
      expect(parseDatetime('now-2w')).toBe(FIXED_NOW - 2 * 604800)
    })

    it('should parse "now-60s"', () => {
      expect(parseDatetime('now-60s')).toBe(FIXED_NOW - 60)
    })

    it('should handle uppercase "NOW-1H"', () => {
      expect(parseDatetime('NOW-1H')).toBe(FIXED_NOW - 3600)
    })
  })

  describe('shortcut expressions', () => {
    it('should parse "yesterday"', () => {
      const result = parseDatetime('yesterday')
      // Yesterday at 00:00:00 UTC
      const expected = new Date(FIXED_NOW * 1000)
      expected.setUTCDate(expected.getUTCDate() - 1)
      expected.setUTCHours(0, 0, 0, 0)
      expect(result).toBe(Math.floor(expected.getTime() / 1000))
    })

    it('should parse "today"', () => {
      const result = parseDatetime('today')
      // Today at 00:00:00 UTC
      const expected = new Date(FIXED_NOW * 1000)
      expected.setUTCHours(0, 0, 0, 0)
      expect(result).toBe(Math.floor(expected.getTime() / 1000))
    })

    it('should parse "last week"', () => {
      expect(parseDatetime('last week')).toBe(FIXED_NOW - 7 * 86400)
    })

    it('should parse "last month"', () => {
      expect(parseDatetime('last month')).toBe(FIXED_NOW - 30 * 86400)
    })

    it('should handle "YESTERDAY" (case insensitive)', () => {
      const result = parseDatetime('YESTERDAY')
      const expected = new Date(FIXED_NOW * 1000)
      expected.setUTCDate(expected.getUTCDate() - 1)
      expected.setUTCHours(0, 0, 0, 0)
      expect(result).toBe(Math.floor(expected.getTime() / 1000))
    })
  })

  describe('ISO 8601 formats', () => {
    it('should parse full ISO datetime with Z', () => {
      const result = parseDatetime('2024-11-27T10:30:00Z')
      expect(result).toBe(Math.floor(Date.parse('2024-11-27T10:30:00Z') / 1000))
    })

    it('should parse ISO date only', () => {
      const result = parseDatetime('2024-11-27')
      expect(result).toBe(Math.floor(Date.parse('2024-11-27') / 1000))
    })

    it('should parse ISO datetime with timezone offset', () => {
      const result = parseDatetime('2024-11-27T10:30:00+02:00')
      expect(result).toBe(
        Math.floor(Date.parse('2024-11-27T10:30:00+02:00') / 1000),
      )
    })
  })

  describe('whitespace handling', () => {
    it('should trim leading/trailing whitespace', () => {
      expect(parseDatetime('  now  ')).toBe(FIXED_NOW)
    })

    it('should trim whitespace from relative time', () => {
      expect(parseDatetime('  now-1h  ')).toBe(FIXED_NOW - 3600)
    })
  })

  describe('error handling', () => {
    it('should throw for invalid format', () => {
      expect(() => parseDatetime('invalid')).toThrow(
        'Invalid datetime format: "invalid"',
      )
    })

    it('should throw for malformed relative time', () => {
      expect(() => parseDatetime('now-abc')).toThrow('Invalid datetime format')
    })

    it('should throw for empty string', () => {
      expect(() => parseDatetime('')).toThrow('Invalid datetime format')
    })
  })
})

describe('DATETIME_DESCRIPTION', () => {
  it('should contain documentation for all supported formats', () => {
    expect(DATETIME_DESCRIPTION).toContain('epoch seconds')
    expect(DATETIME_DESCRIPTION).toContain('relative time')
    expect(DATETIME_DESCRIPTION).toContain('now-1h')
    expect(DATETIME_DESCRIPTION).toContain('ISO 8601')
    expect(DATETIME_DESCRIPTION).toContain('yesterday')
    expect(DATETIME_DESCRIPTION).toContain('today')
  })
})
