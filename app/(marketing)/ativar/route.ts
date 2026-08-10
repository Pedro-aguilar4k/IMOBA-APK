import { type NextRequest, NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Confirma o e-mail do cliente e ativa o login após o pagamento.
 * O token é de uso único, expira em 7 dias e está atrelado a uma assinatura paga.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const loginUrl = new URL('/auth/login', request.url)

  if (!token) {
    loginUrl.searchParams.set('erro', 'token_invalido')
    return NextResponse.redirect(loginUrl)
  }

  const admin = createAdminClient()

  const { data: rows } = await admin
    .from('subscriptions')
    .select('id, owner_user_id, activation_expires_at, email_confirmed')
    .eq('activation_token', token)
    .limit(1)

  const sub = rows?.[0]

  if (!sub || !sub.owner_user_id) {
    loginUrl.searchParams.set('erro', 'token_invalido')
    return NextResponse.redirect(loginUrl)
  }

  if (sub.email_confirmed) {
    loginUrl.searchParams.set('ativado', '1')
    return NextResponse.redirect(loginUrl)
  }

  if (
    sub.activation_expires_at &&
    new Date(sub.activation_expires_at) < new Date()
  ) {
    loginUrl.searchParams.set('erro', 'token_expirado')
    return NextResponse.redirect(loginUrl)
  }

  // Confirma o e-mail no Supabase Auth, liberando o login por senha.
  const { error } = await admin.auth.admin.updateUserById(sub.owner_user_id, {
    email_confirm: true,
  })

  if (error) {
    loginUrl.searchParams.set('erro', 'ativacao_falhou')
    return NextResponse.redirect(loginUrl)
  }

  await admin
    .from('subscriptions')
    .update({
      email_confirmed: true,
      activation_token: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sub.id)

  loginUrl.searchParams.set('ativado', '1')
  return NextResponse.redirect(loginUrl)
}
