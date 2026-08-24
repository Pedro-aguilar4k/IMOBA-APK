import { NextResponse } from 'next/server'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import type { AuthenticationResponseJSON } from '@simplewebauthn/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { consumePasskeyChallenge, getWebAuthnConfig } from '@/lib/auth/passkeys'

function decodePublicKey(value: string) {
  return value.startsWith('\\x') ? Buffer.from(value.slice(2), 'hex') : Buffer.from(value, 'base64')
}

export async function POST(request: Request) {
  const challenge = await consumePasskeyChallenge('authenticate')
  if (!challenge) return NextResponse.json({ error: 'Desafio inválido ou expirado.' }, { status: 400 })

  const response = await request.json() as AuthenticationResponseJSON
  const admin = createAdminClient()
  const { data: stored } = await admin
    .from('passkey_credentials')
    .select('credential_id, public_key, counter, transports')
    .eq('credential_id', response.id)
    .eq('user_id', challenge.userId)
    .maybeSingle()
  if (!stored) return NextResponse.json({ error: 'Passkey inválida.' }, { status: 401 })

  const { origin, rpID } = await getWebAuthnConfig()
  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge: challenge.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: true,
    credential: {
      id: stored.credential_id,
      publicKey: decodePublicKey(stored.public_key),
      counter: Number(stored.counter),
      transports: stored.transports,
    },
  })
  if (!verification.verified) return NextResponse.json({ error: 'Não foi possível validar a passkey.' }, { status: 401 })

  await admin.from('passkey_credentials').update({
    counter: verification.authenticationInfo.newCounter,
    last_used_at: new Date().toISOString(),
  }).eq('credential_id', stored.credential_id)

  const { data: link, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: challenge.email,
  })
  const tokenHash = link?.properties?.hashed_token
  if (linkError || !tokenHash) return NextResponse.json({ error: 'Não foi possível criar a sessão.' }, { status: 500 })

  const supabase = await createClient()
  const { error: sessionError } = await supabase.auth.verifyOtp({
    type: 'magiclink',
    token_hash: tokenHash,
  })
  if (sessionError) return NextResponse.json({ error: 'Não foi possível criar a sessão.' }, { status: 500 })

  return NextResponse.json({ verified: true })
}
