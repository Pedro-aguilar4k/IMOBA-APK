import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Variáveis do Supabase ausentes.')
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const EMAIL = 'contato@imobiliariaaurora.com.br'
const PASSWORD = 'ImobaCliente#2026'

async function run() {
  // 1) Organização
  const { data: org, error: orgErr } = await admin
    .from('organizations')
    .insert({
      name: 'Imobiliária Aurora',
      cnpj: '12345678000199',
      status: 'active',
    })
    .select('id')
    .single()
  if (orgErr) throw orgErr
  console.log('Org criada:', org.id)

  // 2) Usuário admin (cliente), já confirmado
  const { data: created, error: userErr } = await admin.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name: 'João da Silva' },
  })
  if (userErr) throw userErr
  const userId = created.user.id
  console.log('Usuário criado:', userId)

  // 3) Papel admin vinculado à organização
  const { error: roleErr } = await admin
    .from('user_roles')
    .insert({ user_id: userId, role: 'admin', organization_id: org.id })
  if (roleErr) throw roleErr

  // 4) profiles (se existir a tabela) — best effort
  await admin
    .from('profiles')
    .upsert({ id: userId, role: 'admin', organization_id: org.id }, { onConflict: 'id' })
    .then(({ error }) => error && console.warn('profiles:', error.message))

  // 5) Assinatura ativa vinculada
  const { error: subErr } = await admin.from('subscriptions').insert({
    organization_id: org.id,
    owner_user_id: userId,
    plan_id: 'profissional',
    status: 'active',
    amount_cents: 34900,
    currency: 'brl',
    current_period_end: new Date(Date.now() + 25 * 864e5).toISOString(),
    responsible_name: 'João da Silva',
    company_name: 'Imobiliária Aurora',
    contact_email: EMAIL,
    contact_phone: '11988887777',
    tax_id: '12345678000199',
    email_confirmed: true,
  })
  if (subErr) throw subErr

  console.log('\nCliente demo pronto:')
  console.log('  Email:', EMAIL)
  console.log('  Senha:', PASSWORD)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
