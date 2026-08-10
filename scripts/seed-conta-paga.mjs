import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('[v0] Variáveis do Supabase ausentes.')
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ---- Credenciais do acesso "como se tivesse pago" ----
const EMAIL = 'meu-login@imoba.com.br'
const PASSWORD = 'Imoba#2026'
const RESPONSIBLE = 'Pedro Aguilar'
const COMPANY = 'Imobiliária Modelo'
const TAX_ID = '11222333000181'
const PHONE = '11999990000'
const PLAN_ID = 'profissional'
const AMOUNT_CENTS = 34900

async function main() {
  // 1) Usuário (confirmado, onboarding concluído)
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  let user = list?.users?.find((u) => u.email === EMAIL)

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { name: RESPONSIBLE },
      app_metadata: { onboarding_status: 'active' },
    })
    if (error) throw error
    user = data.user
    console.log('[v0] Usuário criado:', EMAIL)
  } else {
    await admin.auth.admin.updateUserById(user.id, {
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { name: RESPONSIBLE },
      app_metadata: { onboarding_status: 'active' },
    })
    console.log('[v0] Usuário atualizado:', EMAIL)
  }

  // 2) Organização
  const orgName = COMPANY
  let { data: org } = await admin
    .from('organizations')
    .select('id')
    .eq('name', orgName)
    .limit(1)
    .maybeSingle()

  if (!org) {
    const { data: created, error } = await admin
      .from('organizations')
      .insert({ name: orgName, cnpj: TAX_ID, created_by: user.id })
      .select('id')
      .single()
    if (error) throw error
    org = created
    console.log('[v0] Organização criada:', orgName)
  }

  // 3) Papel admin vinculado à organização
  const { data: roles } = await admin
    .from('user_roles')
    .select('id')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .limit(1)

  if (!roles || roles.length === 0) {
    await admin
      .from('user_roles')
      .insert({ user_id: user.id, role: 'admin', organization_id: org.id })
  } else {
    await admin
      .from('user_roles')
      .update({ organization_id: org.id })
      .eq('id', roles[0].id)
  }

  // 4) Assinatura ATIVA (como se o pagamento tivesse sido concluído)
  const periodEnd = new Date()
  periodEnd.setMonth(periodEnd.getMonth() + 1)

  const { data: existing } = await admin
    .from('subscriptions')
    .select('id')
    .eq('owner_user_id', user.id)
    .limit(1)
    .maybeSingle()

  const payload = {
    organization_id: org.id,
    owner_user_id: user.id,
    plan_id: PLAN_ID,
    status: 'active',
    amount_cents: AMOUNT_CENTS,
    currency: 'brl',
    current_period_end: periodEnd.toISOString(),
    responsible_name: RESPONSIBLE,
    company_name: COMPANY,
    contact_email: EMAIL,
    contact_phone: PHONE,
    tax_id: TAX_ID,
    email_confirmed: true,
    stripe_customer_id: 'cus_demo_pago',
    stripe_subscription_id: 'sub_demo_' + user.id.slice(0, 8),
  }

  if (existing) {
    await admin.from('subscriptions').update(payload).eq('id', existing.id)
    console.log('[v0] Assinatura ativa atualizada.')
  } else {
    await admin.from('subscriptions').insert(payload)
    console.log('[v0] Assinatura ativa criada.')
  }

  console.log('\n[v0] Pronto! Acesse /auth/login com:')
  console.log('[v0]   E-mail:', EMAIL)
  console.log('[v0]   Senha :', PASSWORD)
  process.exit(0)
}

main().catch((err) => {
  console.error('[v0] Erro:', err.message)
  process.exit(1)
})
