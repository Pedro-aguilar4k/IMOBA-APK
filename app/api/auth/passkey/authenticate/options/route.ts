import { NextResponse } from 'next/server'
import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { digitsOnly } from '@/lib/security/identifiers'
import { getWebAuthnConfig, setPasskeyChallenge } from '@/lib/auth/passkeys'

const schema = z.object({ identifier: z.string().trim().min(1).max(254) })

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Informe seu e-mail ou CPF.' }, { status: 400 })

  const admin = createAdminClient()
  const value = parsed.data.identifier
  const profileQuery = admin.from('profiles').select('id, email')
  const { data: profile } = value.includes('@')
    ? await profileQuery.eq('email', value.toLowerCase()).maybeSingle()
    : await profileQuery.eq('cpf', digitsOnly(value)).maybeSingle()

  if (!profile?.email) {
    return NextResponse.json({ error: 'Passkey não disponível para este acesso.' }, { status: 400 })
  }

  const { data: credentials } = await admin
    .from('passkey_credentials')
    .select('credential_id, transports')
    .eq('user_id', profile.id)
  if (!credentials?.length) {
    return NextResponse.json({ error: 'Passkey não disponível para este acesso.' }, { status: 400 })
  }

  const { rpID } = await getWebAuthnConfig()
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: 'required',
    allowCredentials: credentials.map((credential) => ({
      id: credential.credential_id,
      transports: credential.transports,
    })),
  })
  await setPasskeyChallenge({
    challenge: options.challenge,
    userId: profile.id,
    email: profile.email,
    purpose: 'authenticate',
  })
  return NextResponse.json(options)
}
