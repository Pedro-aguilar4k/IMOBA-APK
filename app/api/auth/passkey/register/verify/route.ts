import { NextResponse } from 'next/server'
import { verifyRegistrationResponse } from '@simplewebauthn/server'
import type { RegistrationResponseJSON } from '@simplewebauthn/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { consumePasskeyChallenge, getWebAuthnConfig } from '@/lib/auth/passkeys'

export async function POST(request: Request) {
  const challenge = await consumePasskeyChallenge('register')
  if (!challenge) return NextResponse.json({ error: 'Desafio inválido ou expirado.' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== challenge.userId) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

  const response = await request.json() as RegistrationResponseJSON
  const { origin, rpID } = await getWebAuthnConfig()
  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge: challenge.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: true,
  })

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: 'Não foi possível cadastrar a passkey.' }, { status: 400 })
  }

  const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo
  const admin = createAdminClient()
  const { error } = await admin.from('passkey_credentials').insert({
    user_id: user.id,
    credential_id: credential.id,
    public_key: `\\x${Buffer.from(credential.publicKey).toString('hex')}`,
    counter: credential.counter,
    transports: response.response.transports ?? [],
    device_type: credentialDeviceType,
    backed_up: credentialBackedUp,
  })

  if (error) return NextResponse.json({ error: 'Não foi possível salvar a passkey.' }, { status: 400 })
  return NextResponse.json({ verified: true })
}
