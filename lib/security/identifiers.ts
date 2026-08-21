import 'server-only'

import { createHmac, randomBytes } from 'node:crypto'

export function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
}

export function hashIdentifier(value: string) {
  const secret = process.env.IDENTIFIER_SECRET

  if (!secret) {
    throw new Error('Segredo de segurança indisponível.')
  }

  return createHmac('sha256', secret).update(value).digest('hex')
}

export function generateActivationCode() {
  return randomBytes(6).toString('hex').toUpperCase()
}

export function maskDocument(last4: string, role: 'corretor' | 'locatario') {
  return role === 'corretor' ? `**.***.***/****-${last4.slice(-2)}` : `***.***.*${last4.slice(0, 1)}-${last4.slice(-2)}`
}
