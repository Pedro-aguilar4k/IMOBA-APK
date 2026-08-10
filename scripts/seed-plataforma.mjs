import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY

if (!url || !key) {
  console.error('[v0] Variáveis do Supabase ausentes.')
  process.exit(1)
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const SUPERADMIN_EMAIL = 'admin@imoba.com.br'
const SUPERADMIN_PASSWORD = 'ImobaPlataforma#2026'

async function ensureSuperadmin() {
  // Procura usuário existente.
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  let user = list?.users?.find((u) => u.email === SUPERADMIN_EMAIL)

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email: SUPERADMIN_EMAIL,
      password: SUPERADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { name: 'Equipe IMOBA' },
      app_metadata: { onboarding_status: 'active' },
    })
    if (error) throw error
    user = data.user
    console.log('[v0] Superadmin criado:', SUPERADMIN_EMAIL)
  } else {
    await admin.auth.admin.updateUserById(user.id, {
      password: SUPERADMIN_PASSWORD,
      email_confirm: true,
    })
    console.log('[v0] Superadmin atualizado:', SUPERADMIN_EMAIL)
  }

  // Papel superadmin (idempotente).
  const { data: roles } = await admin
    .from('user_roles')
    .select('id')
    .eq('user_id', user.id)
    .eq('role', 'superadmin')
    .limit(1)

  if (!roles || roles.length === 0) {
    await admin.from('user_roles').insert({ user_id: user.id, role: 'superadmin' })
  }

  await admin.from('profiles').update({ role: 'superadmin', name: 'Equipe IMOBA', email: SUPERADMIN_EMAIL }).eq('id', user.id)

  return user
}

async function seedSubscriptions() {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  const demo = [
    {
      company_name: '[DEMO] Imobiliária Horizonte',
      responsible_name: 'Carla Mendes',
      contact_email: 'demo-horizonte@imoba.com.br',
      contact_phone: '11987654321',
      tax_id: '12345678000190',
      plan_id: 'profissional',
      status: 'active',
      amount_cents: 34900,
      current_period_end: new Date(now + 20 * day).toISOString(),
      email_confirmed: true,
    },
    {
      company_name: '[DEMO] Lar Ideal Imóveis',
      responsible_name: 'Rafael Souza',
      contact_email: 'demo-laridal@imoba.com.br',
      contact_phone: '21991234567',
      tax_id: '98765432000121',
      plan_id: 'essencial',
      status: 'active',
      amount_cents: 14900,
      current_period_end: new Date(now + 8 * day).toISOString(),
      email_confirmed: true,
    },
    {
      company_name: '[DEMO] Metrópole Negócios',
      responsible_name: 'Juliana Prado',
      contact_email: 'demo-metropole@imoba.com.br',
      contact_phone: '31988880000',
      tax_id: '45678912000134',
      plan_id: 'escala',
      status: 'past_due',
      amount_cents: 79900,
      current_period_end: new Date(now - 3 * day).toISOString(),
      email_confirmed: true,
    },
    {
      company_name: '[DEMO] Nova Casa Imobiliária',
      responsible_name: 'Pedro Alves',
      contact_email: 'demo-novacasa@imoba.com.br',
      contact_phone: '4133224455',
      tax_id: '11222333000144',
      plan_id: 'profissional',
      status: 'incomplete',
      amount_cents: 34900,
      email_confirmed: false,
    },
  ]

  for (const row of demo) {
    const { data: existing } = await admin
      .from('subscriptions')
      .select('id')
      .eq('contact_email', row.contact_email)
      .limit(1)
    if (existing && existing.length > 0) {
      await admin.from('subscriptions').update(row).eq('id', existing[0].id)
    } else {
      await admin.from('subscriptions').insert(row)
    }
  }
  console.log('[v0] Assinaturas demo semeadas:', demo.length)
}

const CLIENT_EMAIL = 'cliente@imoba.com.br'
const CLIENT_PASSWORD = 'ImobaCliente#2026'

async function ensureClientAdmin() {
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  let user = list?.users?.find((u) => u.email === CLIENT_EMAIL)

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email: CLIENT_EMAIL,
      password: CLIENT_PASSWORD,
      email_confirm: true,
      user_metadata: { name: 'Carla Mendes' },
      app_metadata: { onboarding_status: 'active' },
    })
    if (error) throw error
    user = data.user
    console.log('[v0] Cliente demo criado:', CLIENT_EMAIL)
  } else {
    await admin.auth.admin.updateUserById(user.id, { password: CLIENT_PASSWORD, email_confirm: true })
    console.log('[v0] Cliente demo atualizado:', CLIENT_EMAIL)
  }

  // Organização da imobiliária (idempotente por nome).
  const orgName = '[DEMO] Imobiliária Horizonte'
  let { data: org } = await admin
    .from('organizations')
    .select('id')
    .eq('name', orgName)
    .limit(1)
    .maybeSingle()

  if (!org) {
    const { data: created } = await admin
      .from('organizations')
      .insert({ name: orgName, cnpj: '12345678000190', created_by: user.id })
      .select('id')
      .single()
    org = created
  }

  // Papel admin vinculado à organização.
  const { data: roles } = await admin
    .from('user_roles')
    .select('id')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .limit(1)
  if (!roles || roles.length === 0) {
    await admin.from('user_roles').insert({ user_id: user.id, role: 'admin', organization_id: org.id })
  } else {
    await admin.from('user_roles').update({ organization_id: org.id }).eq('id', roles[0].id)
  }
  await admin.from('profiles').update({ role: 'admin', name: 'Carla Mendes', email: CLIENT_EMAIL }).eq('id', user.id)

  // Vincula a assinatura demo da Horizonte a este owner/organização.
  await admin
    .from('subscriptions')
    .update({ owner_user_id: user.id, organization_id: org.id })
    .eq('contact_email', 'demo-horizonte@imoba.com.br')

  return user
}

await ensureSuperadmin()
await seedSubscriptions()
await ensureClientAdmin()
console.log('[v0] Concluído.')
console.log('[v0] Login superadmin:', SUPERADMIN_EMAIL, '/', SUPERADMIN_PASSWORD)
console.log('[v0] Login cliente:', CLIENT_EMAIL, '/', CLIENT_PASSWORD)
process.exit(0)
