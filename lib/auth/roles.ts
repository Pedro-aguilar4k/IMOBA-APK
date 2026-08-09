import 'server-only'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AppRole = 'admin' | 'corretor' | 'locatario'

export interface CurrentAccess {
  userId: string
  email: string
  mustChangePassword: boolean
  roles: Array<{
    role: AppRole
    organization_id: string | null
  }>
}

export async function getCurrentAccess(): Promise<CurrentAccess | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: roles, error } = await supabase
    .from('user_roles')
    .select('role, organization_id')
    .eq('user_id', user.id)

  if (error) throw new Error('Não foi possível carregar as permissões da conta.')

  return {
    userId: user.id,
    email: user.email ?? '',
    mustChangePassword: user.app_metadata?.must_change_password === true,
    roles: (roles ?? []) as CurrentAccess['roles'],
  }
}

export async function requireRole(role: AppRole) {
  const access = await getCurrentAccess()

  if (!access) redirect('/auth/login')
  if (access.mustChangePassword) redirect('/auth/trocar-senha')

  const assignment = access.roles.find((item) => item.role === role)
  if (!assignment) redirect('/painel')

  return { ...access, assignment }
}

export function getDefaultRoute(roles: CurrentAccess['roles']) {
  if (roles.some((item) => item.role === 'admin')) return '/admin'
  if (roles.some((item) => item.role === 'corretor')) return '/dashboard/corretor'
  if (roles.some((item) => item.role === 'locatario')) return '/dashboard/locatario'
  return '/acesso-pendente'
}
