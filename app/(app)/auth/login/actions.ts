'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { digitsOnly } from '@/lib/security/identifiers'

export type ResolveIdentifierResult = {
  email: string | null
}

// Resolves the login identifier (e-mail or CPF) into an e-mail address.
// CPF lookups run with the admin client because the profiles table is not
// readable by anonymous users. A generic null response avoids leaking whether
// a given CPF exists.
export async function resolveLoginIdentifier(identifier: string): Promise<ResolveIdentifierResult> {
  const value = identifier.trim()
  if (!value) return { email: null }

  if (value.includes('@')) {
    return { email: value.toLowerCase() }
  }

  const cpf = digitsOnly(value)
  if (cpf.length !== 11) return { email: null }

  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('profiles')
      .select('email')
      .eq('cpf', cpf)
      .maybeSingle()

    if (error || !data?.email) return { email: null }
    return { email: data.email as string }
  } catch {
    return { email: null }
  }
}
