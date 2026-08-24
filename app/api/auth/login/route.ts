import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { digitsOnly, hashIdentifier } from '@/lib/security/identifiers'
import { limitLoginIdentifier, rateLimitHeaders } from '@/lib/security/rate-limit'

const schema = z.object({
  identifier: z.string().trim().min(1).max(254),
  password: z.string().min(8).max(128),
})

async function resolveEmail(identifier: string) {
  if (identifier.includes('@')) return identifier.toLowerCase()
  const cpf = digitsOnly(identifier)
  if (cpf.length !== 11) return null
  const admin = createAdminClient()
  const { data } = await admin.from('profiles').select('email').eq('cpf', cpf).maybeSingle()
  return typeof data?.email === 'string' ? data.email : null
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'E-mail/CPF ou senha inválidos.' }, { status: 400 })
  }

  const identifierKey = hashIdentifier(parsed.data.identifier.trim().toLowerCase())
  const limit = await limitLoginIdentifier(identifierKey)
  const headers = rateLimitHeaders(limit)
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Aguarde um momento e tente novamente.' },
      { status: 429, headers },
    )
  }

  const email = await resolveEmail(parsed.data.identifier)
  if (!email) {
    return NextResponse.json({ error: 'E-mail/CPF ou senha inválidos.' }, { status: 401, headers })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: parsed.data.password })
  if (error || !data.session) {
    const message = error?.code === 'email_not_confirmed'
      ? 'Confirme seu e-mail antes de entrar.'
      : error?.status === 429
        ? 'Muitas tentativas. Aguarde um momento e tente novamente.'
        : 'E-mail/CPF ou senha inválidos.'
    return NextResponse.json({ error: message }, { status: error?.status === 429 ? 429 : 401, headers })
  }

  return NextResponse.json({ ok: true, offerPasskey: true }, { headers })
}
