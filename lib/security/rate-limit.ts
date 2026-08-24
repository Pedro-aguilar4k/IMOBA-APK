import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

function createRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  return url && token ? new Redis({ url, token }) : null
}

const redis = createRedis()

const loginIpLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 m'),
      prefix: 'imoba:login:ip',
      analytics: true,
    })
  : null

const loginIdentifierLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '10 m'),
      prefix: 'imoba:login:identifier',
      analytics: true,
    })
  : null

export type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

const failOpenResult: RateLimitResult = {
  success: true,
  limit: 0,
  remaining: 0,
  reset: 0,
}

async function check(limiter: Ratelimit | null, key: string): Promise<RateLimitResult> {
  if (!limiter) return failOpenResult
  try {
    return await limiter.limit(key)
  } catch {
    // Authentication remains available during a Redis incident. Supabase's
    // own limits still apply, and the failure is observable in platform logs.
    return failOpenResult
  }
}

export function getClientIp(headers: Headers) {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip') || 'unknown'
}

export function limitLoginIp(ip: string) {
  return check(loginIpLimiter, ip)
}

export function limitLoginIdentifier(identifierHash: string) {
  return check(loginIdentifierLimiter, identifierHash)
}

export function rateLimitHeaders(result: RateLimitResult) {
  const headers = new Headers()
  if (result.limit > 0) {
    headers.set('X-RateLimit-Limit', String(result.limit))
    headers.set('X-RateLimit-Remaining', String(result.remaining))
    headers.set('X-RateLimit-Reset', String(result.reset))
    if (!result.success) {
      headers.set('Retry-After', String(Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))))
    }
  }
  return headers
}
