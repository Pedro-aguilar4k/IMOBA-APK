'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { requirePlatformAdmin, logAudit, IMPERSONATION_COOKIE } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'

const SESSION_DURATION_MS = 60 * 60 * 1000 // 1 hora

/** Inicia uma sessão de impersonação: o admin da plataforma passa a operar como a corretora. */
export async function startImpersonation(formData: FormData) {
  const ctx = await requirePlatformAdmin()
  const organizationId = String(formData.get('organizationId') ?? '')
  const reason = String(formData.get('reason') ?? '').trim() || null

  if (!organizationId) redirect('/admin')

  const admin = createAdminClient()

  // Valida que a organização existe.
  const { data: organization } = await admin
    .from('organizations')
    .select('id')
    .eq('id', organizationId)
    .maybeSingle()
  if (!organization) redirect('/admin')

  // Encerra qualquer sessão ativa anterior do mesmo admin.
  await admin
    .from('admin_impersonation_sessions')
    .update({ ended_at: new Date().toISOString() })
    .eq('admin_id', ctx.userId)
    .is('ended_at', null)

  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString()
  const { data: session, error } = await admin
    .from('admin_impersonation_sessions')
    .insert({
      admin_id: ctx.userId,
      organization_id: organizationId,
      reason,
      expires_at: expiresAt,
    })
    .select('id')
    .single()

  if (error || !session) redirect('/admin')

  const cookieStore = await cookies()
  cookieStore.set(IMPERSONATION_COOKIE, session.id, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_MS / 1000,
  })

  await logAudit({
    actorUserId: ctx.userId,
    organizationId,
    impersonated: true,
    action: 'impersonation.started',
    entity: 'organization',
    entityId: organizationId,
    metadata: { reason },
  })

  redirect('/dashboard/corretor')
}

/** Encerra a sessão de impersonação ativa e retorna ao painel do admin. */
export async function stopImpersonation() {
  const ctx = await requirePlatformAdmin()
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(IMPERSONATION_COOKIE)?.value

  if (sessionId) {
    const admin = createAdminClient()
    const { data: session } = await admin
      .from('admin_impersonation_sessions')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', sessionId)
      .eq('admin_id', ctx.userId)
      .is('ended_at', null)
      .select('organization_id')
      .maybeSingle()

    await logAudit({
      actorUserId: ctx.userId,
      organizationId: session?.organization_id ?? null,
      impersonated: true,
      action: 'impersonation.ended',
      entity: 'organization',
      entityId: session?.organization_id ?? null,
    })
  }

  cookieStore.delete(IMPERSONATION_COOKIE)
  redirect('/admin')
}
