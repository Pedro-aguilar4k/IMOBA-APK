import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

const CORRETOR_EMAIL = 'corretor@imobapp.com'
const CORRETOR_PASS = 'Corretor!teste123'
const LOCATARIO_EMAIL = 'locatario@imobapp.com'
const LOCATARIO_PASS = 'Locatario!teste123'

async function ensureUser(email, password, meta) {
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const existing = list?.users?.find((u) => u.email === email)
  if (existing) {
    await admin.auth.admin.updateUserById(existing.id, { password, email_confirm: true, user_metadata: meta })
    return existing.id
  }
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: meta,
  })
  if (error) throw error
  return data.user.id
}

async function main() {
  const corretorId = await ensureUser(CORRETOR_EMAIL, CORRETOR_PASS, { name: 'João Silva' })
  const locatarioId = await ensureUser(LOCATARIO_EMAIL, LOCATARIO_PASS, { name: 'Maria Souza' })

  // Organização
  let { data: org } = await admin.from('organizations').select('id').eq('cnpj', '00000000000191').maybeSingle()
  if (!org) {
    const { data } = await admin
      .from('organizations')
      .insert({ name: 'Imobiliária Demo', cnpj: '00000000000191', created_by: corretorId })
      .select('id')
      .single()
    org = data
  }

  // Perfis / papéis
  await admin.from('profiles').update({ name: 'João Silva', role: 'corretor', cpf: '11111111111' }).eq('id', corretorId)
  await admin.from('profiles').update({ name: 'Maria Souza', role: 'locatario', cpf: '22222222222' }).eq('id', locatarioId)
  await admin.from('user_roles').upsert({ user_id: corretorId, role: 'corretor', organization_id: org.id }, { onConflict: 'user_id,role' })
  await admin.from('user_roles').upsert({ user_id: locatarioId, role: 'locatario', organization_id: org.id }, { onConflict: 'user_id,role' })

  // Limpa dados antigos deste corretor para reexecução idempotente
  await admin.from('properties').delete().eq('corretor_id', corretorId)

  const propertiesPayload = [
    { title: 'Apartamento 302', neighborhood: 'Centro', city: 'São Paulo', state: 'SP', bedrooms: 2, bathrooms: 1, usable_area_sqm: 68, rent_value: 250000, status: 'occupied' },
    { title: 'Casa 15', neighborhood: 'Jardins', city: 'São Paulo', state: 'SP', bedrooms: 3, bathrooms: 2, usable_area_sqm: 120, rent_value: 420000, status: 'occupied' },
    { title: 'Studio Vila Nova', neighborhood: 'Vila Nova', city: 'São Paulo', state: 'SP', bedrooms: 1, bathrooms: 1, usable_area_sqm: 32, rent_value: 180000, status: 'available' },
  ].map((p) => ({ ...p, organization_id: org.id, corretor_id: corretorId }))

  const { data: props } = await admin.from('properties').insert(propertiesPayload).select('id, rent_value')

  // Contrato ativo no primeiro imóvel
  const { data: contract } = await admin
    .from('contracts')
    .insert({
      organization_id: org.id,
      corretor_id: corretorId,
      locatario_id: locatarioId,
      property_id: props[0].id,
      monthly_rent: props[0].rent_value,
      status: 'active',
      start_date: new Date().toISOString().slice(0, 10),
    })
    .select('id')
    .single()

  const today = new Date()
  const thisMonth = (day) => new Date(today.getFullYear(), today.getMonth(), day).toISOString().slice(0, 10)

  await admin.from('payments').insert([
    { contract_id: contract.id, locatario_id: locatarioId, amount: props[0].rent_value, due_date: thisMonth(5), status: 'paid', paid_at: new Date().toISOString() },
    { contract_id: contract.id, locatario_id: locatarioId, amount: props[0].rent_value, due_date: thisMonth(28), status: 'pending' },
    { contract_id: contract.id, locatario_id: locatarioId, amount: 150000, due_date: thisMonth(1), status: 'overdue' },
  ])

  console.log('Seed concluído.')
  console.log('Corretor:', CORRETOR_EMAIL, '/', CORRETOR_PASS)
  console.log('Locatário:', LOCATARIO_EMAIL, '/', LOCATARIO_PASS)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
