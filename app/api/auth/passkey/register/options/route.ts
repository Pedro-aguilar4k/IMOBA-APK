import { NextResponse } from 'next/server'
import { generateRegistrationOptions } from '@simplewebauthn/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getWebAuthnConfig, setPasskeyChallenge } from '@/lib/auth/passkeys'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

  const admin = createAdminClient()
  const { data: credentials } = await admin
    .from('passkey_credentials')
    .select('credential_id, transports')
    .eq('user_id', user.id)

  const { rpID, rpName } = await getWebAuthnConfig()
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: user.email,
    userDisplayName: user.user_metadata?.name ?? user.email,
    userID: Buffer.from(user.id),
    attestationType: 'none',
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      residentKey: 'preferred',
      userVerification: 'required',
    },
    excludeCredentials: (credentials ?? []).map((credential) => ({
      id: credential.credential_id,
      transports: credential.transports,
    })),
  })

  await setPasskeyChallenge({ challenge: options.challenge, userId: user.id, email: user.email, purpose: 'register' })
  return NextResponse.json(options)
}
