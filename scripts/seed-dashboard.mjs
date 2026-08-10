import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('[v0] Faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } })

const OWNER_EMAIL = 'meu-login@imoba.com.br'

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function resolveOrg() {
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const owner = list?.users?.find((u) => u.email === OWNER_EMAIL)
  if (!owner) throw new Error(`Usuário ${OWNER_EMAIL} não encontrado. Rode o seed da conta paga antes.`)

  const { data: roles } = await admin
    .from('user_roles')
    .select('organization_id')
    .eq('user_id', owner.id)
    .eq('role', 'admin')
    .limit(1)

  const orgId = roles?.[0]?.organization_id
  if (!orgId) throw new Error('Organização admin não encontrada para o usuário.')
  return { orgId, ownerId: owner.id }
}

async function seedVisits(orgId) {
  await admin.from('site_visits').delete().eq('organization_id', orgId)

  const devices = ['desktop', 'mobile', 'mobile', 'tablet']
  const paths = ['/', '/imoveis', '/imoveis/apartamento-jardins', '/sobre', '/contato']
  const rows = []
  const now = new Date()

  for (let d = 29; d >= 0; d--) {
    const day = new Date(now)
    day.setDate(now.getDate() - d)
    // Tendência de crescimento + menos acessos no fim de semana.
    const weekday = day.getDay()
    const base = 18 + Math.round((29 - d) * 1.2)
    const weekendFactor = weekday === 0 || weekday === 6 ? 0.6 : 1
    const count = Math.max(4, Math.round(base * weekendFactor) + randInt(-6, 8))

    for (let i = 0; i < count; i++) {
      const visited = new Date(day)
      visited.setHours(randInt(7, 22), randInt(0, 59), randInt(0, 59), 0)
      rows.push({
        organization_id: orgId,
        visited_at: visited.toISOString(),
        path: paths[randInt(0, paths.length - 1)],
        referrer: Math.random() > 0.5 ? 'google' : Math.random() > 0.5 ? 'instagram' : 'direto',
        device: devices[randInt(0, devices.length - 1)],
      })
    }
  }

  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await admin.from('site_visits').insert(rows.slice(i, i + 500))
    if (error) throw error
  }
  console.log(`[v0] ${rows.length} visitas inseridas.`)
}

async function seedLeads(orgId, corretorId) {
  await admin.from('site_leads').delete().eq('organization_id', orgId)

  const names = [
    'Ana Beatriz Costa', 'Carlos Eduardo Lima', 'Fernanda Oliveira', 'Rafael Santos',
    'Juliana Almeida', 'Marcos Vinícius', 'Patrícia Ramos', 'Bruno Ferreira',
    'Camila Rodrigues', 'Diego Martins', 'Larissa Souza', 'Thiago Barbosa',
    'Vanessa Cardoso', 'Gustavo Pereira', 'Renata Gomes', 'Felipe Araújo',
    'Mariana Ribeiro', 'Leonardo Dias', 'Beatriz Nunes', 'André Carvalho',
  ]
  const statuses = [
    'novo', 'novo', 'novo', 'novo', 'novo', 'novo',
    'contato', 'contato', 'contato', 'contato',
    'visita', 'visita', 'visita',
    'proposta', 'proposta',
    'fechado', 'fechado',
    'perdido', 'perdido', 'perdido',
  ]
  const messages = [
    'Tenho interesse no apartamento no Jardins.',
    'Gostaria de agendar uma visita.',
    'Qual o valor do condomínio?',
    'Vocês têm imóveis para locação na zona sul?',
    'Aceita financiamento?',
  ]

  const now = new Date()
  const rows = names.map((name, i) => {
    const created = new Date(now)
    created.setDate(now.getDate() - randInt(0, 28))
    return {
      organization_id: orgId,
      name,
      email: `${name.split(' ')[0].toLowerCase()}@email.com`,
      phone: `11${randInt(90000, 99999)}${randInt(1000, 9999)}`,
      message: messages[randInt(0, messages.length - 1)],
      source: ['site', 'instagram', 'google'][randInt(0, 2)],
      status: statuses[i],
      corretor_id: ['visita', 'proposta', 'fechado'].includes(statuses[i]) ? corretorId : null,
      created_at: created.toISOString(),
      updated_at: created.toISOString(),
    }
  })

  const { error } = await admin.from('site_leads').insert(rows)
  if (error) throw error
  console.log(`[v0] ${rows.length} leads inseridos.`)
}

async function seedAppointments(orgId, corretorId) {
  await admin.from('appointments').delete().eq('organization_id', orgId)

  const clients = ['Fernanda Oliveira', 'Rafael Santos', 'Juliana Almeida', 'Diego Martins', 'Larissa Souza']
  const properties = [
    'Apartamento 3 quartos - Jardins',
    'Casa em condomínio - Alphaville',
    'Cobertura - Moema',
    'Studio - Pinheiros',
    'Sobrado - Vila Mariana',
  ]
  const apptStatuses = ['confirmado', 'agendado', 'confirmado', 'agendado', 'agendado']

  const now = new Date()
  const rows = clients.map((client, i) => {
    const when = new Date(now)
    when.setDate(now.getDate() + i + 1)
    when.setHours(randInt(9, 17), [0, 30][randInt(0, 1)], 0, 0)
    return {
      organization_id: orgId,
      corretor_id: corretorId,
      client_name: client,
      property_title: properties[i],
      scheduled_at: when.toISOString(),
      status: apptStatuses[i],
    }
  })

  const { error } = await admin.from('appointments').insert(rows)
  if (error) throw error
  console.log(`[v0] ${rows.length} agendamentos inseridos.`)
}

async function findCorretor(orgId) {
  const { data } = await admin
    .from('user_roles')
    .select('user_id')
    .eq('role', 'corretor')
    .eq('organization_id', orgId)
    .limit(1)
  return data?.[0]?.user_id ?? null
}

const { orgId } = await resolveOrg()
const corretorId = await findCorretor(orgId)
await seedVisits(orgId)
await seedLeads(orgId, corretorId)
await seedAppointments(orgId, corretorId)
console.log('[v0] Dashboard populado com sucesso para a org', orgId)
process.exit(0)
