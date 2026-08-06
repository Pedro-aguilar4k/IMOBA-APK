// Client-side biometric unlock using WebAuthn platform authenticators.
// On iOS this triggers Face ID / Touch ID, on Android it triggers the
// device fingerprint / face unlock. The successful assertion acts as a
// local biometric gate that releases the stored Supabase session tokens.

const STORAGE_KEY = 'imobapp.biometric.v1'

export type BiometricData = {
  credentialId: string
  email: string
  accessToken: string
  refreshToken: string
}

function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlToBuffer(value: string): ArrayBuffer {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return bytes
}

export async function isBiometricAvailable(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) return false
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

export function getStoredBiometric(): BiometricData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as BiometricData) : null
  } catch {
    return null
  }
}

export function isBiometricEnabled(): boolean {
  return getStoredBiometric() !== null
}

export function clearBiometric(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}

export function updateBiometricTokens(tokens: { accessToken: string; refreshToken: string }): void {
  const stored = getStoredBiometric()
  if (!stored) return
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...stored, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }),
  )
}

export async function enableBiometric(params: {
  email: string
  accessToken: string
  refreshToken: string
}): Promise<void> {
  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge: randomBytes(32),
      rp: { name: 'ImobApp' },
      user: {
        id: randomBytes(16),
        name: params.email,
        displayName: params.email,
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
    },
  })) as PublicKeyCredential | null

  if (!credential) throw new Error('Biometria não configurada.')

  const data: BiometricData = {
    credentialId: bufferToBase64url(credential.rawId),
    email: params.email,
    accessToken: params.accessToken,
    refreshToken: params.refreshToken,
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export async function authenticateBiometric(): Promise<BiometricData> {
  const stored = getStoredBiometric()
  if (!stored) throw new Error('Biometria não configurada.')

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: randomBytes(32),
      allowCredentials: [
        {
          type: 'public-key',
          id: base64urlToBuffer(stored.credentialId),
        },
      ],
      userVerification: 'required',
      timeout: 60000,
    },
  })

  if (!assertion) throw new Error('Não foi possível validar a biometria.')
  return stored
}
