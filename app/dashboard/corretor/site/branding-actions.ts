'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getTenantContext, logAudit } from '@/lib/auth/tenant'
import {
  BRANDING_ALLOWED_TYPES,
  BRANDING_ASSETS,
  BRANDING_BUCKET,
  BRANDING_MAX_FILE_SIZE,
  brandingPublicUrl,
  isBrandingAssetKey,
  type BrandingAssetKey,
} from '@/lib/sites/branding'

interface Authorized {
  organizationId: string
  userId: string
  isPlatformAdmin: boolean
  impersonated: boolean
}

/**
 * Autoriza a edição de branding de uma organização.
 * - Superadmin: pode editar qualquer org (passando organizationId) e qualquer asset.
 * - Dono/impersonação: apenas a própria org e apenas assets ownerEditable.
 */
async function authorize(
  organizationId: string | undefined,
  assetKey?: BrandingAssetKey,
): Promise<Authorized | { error: string }> {
  const ctx = await getTenantContext()
  if (!ctx) return { error: 'Sessão expirada. Faça login novamente.' }

  // Superadmin (sem impersonação) pode operar sobre a org informada.
  if (ctx.isPlatformAdmin && !ctx.impersonation) {
    if (!organizationId) return { error: 'Imobiliária inválida.' }
    return { organizationId, userId: ctx.userId, isPlatformAdmin: true, impersonated: false }
  }

  // Dono ou impersonação: só a org ativa.
  const activeOrg = ctx.organizationId
  if (!activeOrg) return { error: 'Você não tem acesso a uma imobiliária.' }
  if (organizationId && organizationId !== activeOrg) return { error: 'Acesso negado a esta imobiliária.' }

  const isOwner = ctx.role === 'org_admin' || Boolean(ctx.impersonation)
  if (!isOwner) return { error: 'Apenas o responsável pode personalizar o site.' }

  // Dono não pode mexer em assets exclusivos do app.
  if (assetKey && !BRANDING_ASSETS[assetKey].ownerEditable && !ctx.impersonation) {
    return { error: 'Este item só pode ser configurado pela plataforma.' }
  }

  return {
    organizationId: activeOrg,
    userId: ctx.userId,
    isPlatformAdmin: ctx.isPlatformAdmin,
    impersonated: Boolean(ctx.impersonation),
  }
}

/** Passo 1: prepara uma signed upload URL para o asset. */
export async function createBrandingUpload(
  assetKey: string,
  file: { name: string; type: string; size: number },
  organizationId?: string,
) {
  if (!isBrandingAssetKey(assetKey)) return { error: 'Tipo de imagem inválido.' }
  const auth = await authorize(organizationId, assetKey)
  if ('error' in auth) return auth

  if (!BRANDING_ALLOWED_TYPES.includes(file.type) || file.size <= 0 || file.size > BRANDING_MAX_FILE_SIZE) {
    return { error: 'Use uma imagem PNG, JPG, WebP, SVG ou ICO de até 2 MB.' }
  }

  const safeName =
    file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-|-$/g, '') || 'imagem'
  const path = `${auth.organizationId}/${assetKey}/${crypto.randomUUID()}-${safeName}`

  const admin = createAdminClient()
  const { data, error } = await admin.storage.from(BRANDING_BUCKET).createSignedUploadUrl(path)
  if (error || !data?.token) return { error: 'Não foi possível preparar o envio da imagem.' }

  return { path, token: data.token }
}

/** Passo 2: grava a URL pública na coluna correspondente após o upload. */
export async function registerBrandingUpload(
  assetKey: string,
  upload: { path: string; type: string; size: number },
  organizationId?: string,
) {
  if (!isBrandingAssetKey(assetKey)) return { error: 'Tipo de imagem inválido.' }
  const auth = await authorize(organizationId, assetKey)
  if ('error' in auth) return auth

  const expectedPrefix = `${auth.organizationId}/${assetKey}/`
  if (
    !upload.path.startsWith(expectedPrefix) ||
    !BRANDING_ALLOWED_TYPES.includes(upload.type) ||
    upload.size <= 0 ||
    upload.size > BRANDING_MAX_FILE_SIZE
  ) {
    return { error: 'Dados da imagem inválidos.' }
  }

  const admin = createAdminClient()
  const { data: object } = await admin.storage
    .from(BRANDING_BUCKET)
    .list(upload.path.slice(0, upload.path.lastIndexOf('/')), {
      search: upload.path.slice(upload.path.lastIndexOf('/') + 1),
      limit: 1,
    })
  if (!object?.length) return { error: 'A imagem enviada não foi encontrada.' }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const publicUrl = brandingPublicUrl(supabaseUrl, upload.path)
  const column = BRANDING_ASSETS[assetKey].column

  // Remove o asset antigo (se houver) para não acumular lixo no storage.
  const { data: current } = await admin
    .from('org_site_settings')
    .select(column)
    .eq('organization_id', auth.organizationId)
    .maybeSingle()
  const previousUrl = (current as Record<string, string | null> | null)?.[column]

  const { error } = await admin
    .from('org_site_settings')
    .update({ [column]: publicUrl, updated_at: new Date().toISOString(), updated_by: auth.userId })
    .eq('organization_id', auth.organizationId)

  if (error) {
    await admin.storage.from(BRANDING_BUCKET).remove([upload.path])
    return { error: 'Não foi possível salvar a imagem.' }
  }

  if (previousUrl) {
    const marker = `/public/${BRANDING_BUCKET}/`
    const idx = previousUrl.indexOf(marker)
    if (idx !== -1) {
      const oldPath = previousUrl.slice(idx + marker.length)
      if (oldPath && oldPath !== upload.path) {
        await admin.storage.from(BRANDING_BUCKET).remove([oldPath]).catch(() => {})
      }
    }
  }

  await logAudit({
    actorUserId: auth.userId,
    organizationId: auth.organizationId,
    impersonated: auth.impersonated,
    action: 'site.asset_uploaded',
    entity: 'org_site_settings',
    metadata: { asset: assetKey },
  })

  revalidatePath('/dashboard/corretor/site')
  revalidatePath('/admin')
  return { success: true, url: publicUrl }
}

/** Remove um asset (limpa a coluna e apaga do storage). */
export async function removeBrandingAsset(assetKey: string, organizationId?: string) {
  if (!isBrandingAssetKey(assetKey)) return { error: 'Tipo de imagem inválido.' }
  const auth = await authorize(organizationId, assetKey)
  if ('error' in auth) return auth

  const admin = createAdminClient()
  const column = BRANDING_ASSETS[assetKey].column
  const { data: current } = await admin
    .from('org_site_settings')
    .select(column)
    .eq('organization_id', auth.organizationId)
    .maybeSingle()
  const previousUrl = (current as Record<string, string | null> | null)?.[column]

  const { error } = await admin
    .from('org_site_settings')
    .update({ [column]: null, updated_at: new Date().toISOString(), updated_by: auth.userId })
    .eq('organization_id', auth.organizationId)
  if (error) return { error: 'Não foi possível remover a imagem.' }

  if (previousUrl) {
    const marker = `/public/${BRANDING_BUCKET}/`
    const idx = previousUrl.indexOf(marker)
    if (idx !== -1) {
      const oldPath = previousUrl.slice(idx + marker.length)
      if (oldPath) await admin.storage.from(BRANDING_BUCKET).remove([oldPath]).catch(() => {})
    }
  }

  revalidatePath('/dashboard/corretor/site')
  revalidatePath('/admin')
  return { success: true }
}
