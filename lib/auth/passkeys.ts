import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies, headers } from 'next/headers'

const COOKIE_NAME = 'imoba-passkey-challenge'
const MAX_AGE_SECONDS = 5 * 60

type ChallengePayload = {
  challenge: string
  userId: string
  email: string
  purpose: 'register' | 'authenticate'
  expiresAt: number
}

function getSecret() {
  const secret = process.env.IDENTIFIER_SECRET
  if (!secret) throw new Error('IDENTIFIER_SECRET não configurado.')
  return secret
}

function sign(value: string) {
  return createHmac('sha256', getSecret()).update(value).digest('base64url')
}

export async function setPasskeyChallenge(payload: Omit<ChallengePayload, 'expiresAt'>) {
  const data: ChallengePayload = { ...payload, expiresAt: Date.now() + MAX_AGE_SECONDS * 1000 }
  const encoded = Buffer.from(JSON.stringify(data)).toString('base64url')
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, `${encoded}.${sign(encoded)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/passkey',
    maxAge: MAX_AGE_SECONDS,
  })
}

export async function consumePasskeyChallenge(purpose: ChallengePayload['purpose']) {
  const cookieStore = await cookies()
  const sealed = cookieStore.get(COOKIE_NAME)?.value
  cookieStore.delete(COOKIE_NAME)
  if (!sealed) return null

  const [encoded, signature] = sealed.split('.')
  if (!encoded || !signature) return null
  const expected = Buffer.from(sign(encoded))
  const received = Buffer.from(signature)
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null

  const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as ChallengePayload
  if (payload.purpose !== purpose || payload.expiresAt < Date.now()) return null
  return payload
}

export async function getWebAuthnConfig() {
  const requestHeaders = await headers()
  const configuredOrigin = process.env.WEBAUTHN_ORIGIN
  const forwardedHost = requestHeaders.get('x-forwarded-host')
  const host = forwardedHost ?? requestHeaders.get('host')
  const protocol = requestHeaders.get('x-forwarded-proto') ?? (host?.startsWith('localhost') ? 'http' : 'https')
  const origin = configuredOrigin ?? `${protocol}://${host}`
  const rpID = process.env.WEBAUTHN_RP_ID ?? new URL(origin).hostname
  return { origin, rpID, rpName: process.env.WEBAUTHN_RP_NAME ?? 'IMOBA' }
}
