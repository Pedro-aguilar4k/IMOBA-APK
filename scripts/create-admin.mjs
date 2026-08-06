import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'node:crypto'

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('[v0] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const email = 'admin@imobapp.com'

// Senha forte aleatória: letras maiúsculas/minúsculas, números e símbolo.
function strongPassword() {
  const base = randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '')
  return `Imob!${base}9`
}
const password = strongPassword()

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Verifica se já existe um usuário com esse e-mail
const { data: list, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
if (listError) {
  console.error('[v0] listUsers error:', listError.message)
  process.exit(1)
}

let user = list.users.find((u) => u.email?.toLowerCase() === email)

if (user) {
  // Já existe: apenas redefine a senha para uma nova senha forte
  const { error: updErr } = await admin.auth.admin.updateUserById(user.id, {
    password,
    email_confirm: true,
  })
  if (updErr) {
    console.error('[v0] updateUser error:', updErr.message)
    process.exit(1)
  }
  console.log('[v0] Usuário admin já existia — senha redefinida.')
} else {
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: 'Administrador' },
  })
  if (createError || !created.user) {
    console.error('[v0] createUser error:', createError?.message)
    process.exit(1)
  }
  user = created.user
  console.log('[v0] Usuário admin criado.')
}

// Garante o perfil (o trigger já cria, mas reforçamos nome/role)
const { error: profileError } = await admin
  .from('profiles')
  .update({ name: 'Administrador', email, role: 'admin' })
  .eq('id', user.id)
if (profileError) {
  console.error('[v0] profile update error:', profileError.message)
  process.exit(1)
}

// Atribui o papel de admin (organização nula)
const { error: roleError } = await admin
  .from('user_roles')
  .upsert(
    { user_id: user.id, role: 'admin', organization_id: null, created_by: user.id },
    { onConflict: 'user_id,role' },
  )
if (roleError) {
  console.error('[v0] user_roles error:', roleError.message)
  process.exit(1)
}

console.log('\n================ ACESSO ADMIN ================')
console.log('E-mail :', email)
console.log('Senha  :', password)
console.log('==============================================\n')
