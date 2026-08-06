import 'server-only'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { AppRole } from '@/lib/auth/roles'

export const IMPERSONATION_COOKIE = 'imob_impersonation'

export interface Membership {
  organizationId: string
  role: AppRole
  status: string
}

export interface TenantContext {
  userId: string
  email: string
  mustChangePassword: boolean
  isPlatformAdmin: boolean
  memberships: Membership[]
  /** Organização ativa (própria ou alvo de impersonação). */
  organizationId: string | null
  /** Papel do usuário na organização ativa (null quando impersonando como platform admin). */
  role: AppRole | null
  impersonation: { sessionId: string; organizationId: string } | null
}

/** Valida o cookie de impersonação contra uma sessão ativa no banco. */
async function resolveImpersonation(
  userId: string,
  isPlatformAdmin: boolean,
): Promise<{ sessionId: string; organizationId: string } | null> {
  if (!isPlatformAdmin) return null
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(IMPERSONATION_COOKIE)?.value
  if (!sessionId) return null

  const admin = createAdminClient()
  const { data } = await admin
    .from('admin_impersonation_sessions')
    .select('id, organization_id, ended_at, expires_at')
    .eq('id', sessionId)
    .eq('admin_id', userId)
    .is('ended_at', null)
    .maybeSingle()

  if (!data) return null
  if (new Date(data.expires_at) < new Date()) return null
  return { sessionId: data.id, organizationId: data.organization_id }
}

/** Contexto de tenant validado no servidor. Nunca confia em parâmetros do cliente. */
export async function getTenantContext(): Promise<TenantContext | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: roles } = await supabase
    .from('user_roles')
    .select('role, organization_id, status')
    .eq('user_id', user.id)

  const rows = (roles ?? []) as Array<{
    role: AppRole
    organization_id: string | null
    status: string
  }>

  const isPlatformAdmin = rows.some((r) => r.role === 'admin' && r.organization_id === null)
  const memberships: Membership[] = rows
    .filter((r) => r.organization_id !== null && r.status === 'active')
    .map((r) => ({ organizationId: r.organization_id as string, role: r.role, status: r.status }))

  const impersonation = await resolveImpersonation(user.id, isPlatformAdmin)

  let organizationId: string | null = null
  let role: AppRole | null = null

  if (impersonation) {
    organizationId = impersonation.organizationId
    role = null // platform admin operando em nome da corretora
  } else if (memberships.length > 0) {
    organizationId = memberships[0].organizationId
    role = memberships[0].role
  }

  return {
    userId: user.id,
    email: user.email ?? '',
    mustChangePassword: user.app_metadata?.must_change_password === true,
    isPlatformAdmin,
    memberships,
    organizationId,
    role,
    impersonation,
  }
}

/** Exige um contexto com organização ativa (membro ou impersonação). */
export async function requireOrgContext(): Promise<TenantContext & { organizationId: string }> {
  const ctx = await getTenantContext()
  if (!ctx) redirect('/auth/login')
  if (ctx.mustChangePassword) redirect('/auth/trocar-senha')
  if (!ctx.organizationId) redirect('/acesso-pendente')
  return ctx as TenantContext & { organizationId: string }
}

/** Exige um papel específico na organização ativa (org_admin engloba corretor). */
export async function requireOrgRole(
  role: Extract<AppRole, 'org_admin' | 'corretor'>,
): Promise<TenantContext & { organizationId: string }> {
  const ctx = await requireOrgContext()
  // impersonação (platform admin) tem acesso total ao tenant
  if (ctx.impersonation) return ctx
  const ok = role === 'corretor' ? ctx.role === 'corretor' || ctx.role === 'org_admin' : ctx.role === role
  if (!ok) redirect('/')
  return ctx
}

/** Exige platform admin (dono da plataforma). */
export async function requirePlatformAdmin(): Promise<TenantContext> {
  const ctx = await getTenantContext()
  if (!ctx) redirect('/auth/login')
  if (!ctx.isPlatformAdmin) redirect('/')
  return ctx
}

/** Registro append-only de auditoria. Nunca lança para não quebrar a operação principal. */
export async function logAudit(entry: {
  actorUserId: string
  organizationId?: string | null
  impersonated?: boolean
  action: string
  entity?: string
  entityId?: string | null
  metadata?: Record<string, unknown>
}): Promise<void> {
  try {
    const admin = createAdminClient()
    await admin.from('audit_logs').insert({
      actor_user_id: entry.actorUserId,
      organization_id: entry.organizationId ?? null,
      impersonated: entry.impersonated ?? false,
      action: entry.action,
      entity: entry.entity ?? null,
      entity_id: entry.entityId ?? null,
      metadata: entry.metadata ?? {},
    })
  } catch (error) {
    console.log('[v0] Falha ao registrar auditoria:', (error as Error).message)
  }
}
