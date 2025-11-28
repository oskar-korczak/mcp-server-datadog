/**
 * LLM-friendly datetime parser for Datadog MCP server.
 * Supports multiple datetime formats and converts them to epoch seconds.
 */

export type DatetimeInput = number | string

/**
 * Parse a datetime input and return epoch seconds.
 * Supports:
 * - Epoch seconds (number): 1732795200
 * - Relative time strings: now, now-1h, now-30m, now-7d, now-2w
 * - ISO 8601 strings: 2025-11-28T12:00:00Z, 2025-11-28
 * - Human-readable shortcuts: yesterday, today, last week, last month
 */
export function parseDatetime(input: DatetimeInput): number {
  // If already a number, return as-is (backward compatible)
  if (typeof input === 'number') {
    return input
  }

  const now = Math.floor(Date.now() / 1000)
  const str = input.trim().toLowerCase()

  // Handle "now"
  if (str === 'now') {
    return now
  }

  // Handle relative time: now-1h, now-30m, now-7d, now-2w
  const relativeMatch = str.match(/^now-(\d+)([smhdw])$/)
  if (relativeMatch) {
    const value = parseInt(relativeMatch[1], 10)
    const unit = relativeMatch[2]
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
      w: 604800,
    }
    return now - value * multipliers[unit]
  }

  // Handle human-readable shortcuts
  if (str === 'yesterday') {
    const yesterday = new Date()
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    yesterday.setUTCHours(0, 0, 0, 0)
    return Math.floor(yesterday.getTime() / 1000)
  }

  if (str === 'today') {
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    return Math.floor(today.getTime() / 1000)
  }

  if (str === 'last week') {
    return now - 7 * 86400
  }

  if (str === 'last month') {
    return now - 30 * 86400
  }

  // Handle ISO 8601 or date strings
  const parsed = Date.parse(input)
  if (!isNaN(parsed)) {
    return Math.floor(parsed / 1000)
  }

  throw new Error(
    `Invalid datetime format: "${input}". Supported formats: ` +
      'epoch seconds (number), relative time (now-1h, now-7d), ' +
      'ISO 8601 (2025-11-28T12:00:00Z), shortcuts (yesterday, today, last week, last month)',
  )
}

/**
 * Description string for datetime parameters in tool schemas.
 */
export const DATETIME_DESCRIPTION =
  'Time specification. Accepts: epoch seconds (number), relative time (now, now-1h, now-30m, now-7d, now-2w), ' +
  'ISO 8601 (2025-11-28T12:00:00Z, 2025-11-28), or shortcuts (yesterday, today, last week, last month)'
