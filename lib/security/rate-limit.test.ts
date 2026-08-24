import { describe, expect, it } from 'vitest'
import { getClientIp, rateLimitHeaders } from './rate-limit'

describe('rate limit', () => {
  it('usa o primeiro IP encaminhado', () => {
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.5, 10.0.0.1' })
    expect(getClientIp(headers)).toBe('203.0.113.5')
  })

  it('expõe Retry-After quando o limite foi excedido', () => {
    const headers = rateLimitHeaders({
      success: false,
      limit: 5,
      remaining: 0,
      reset: Date.now() + 30_000,
    })
    expect(headers.get('X-RateLimit-Limit')).toBe('5')
    expect(Number(headers.get('Retry-After'))).toBeGreaterThan(0)
  })
})
