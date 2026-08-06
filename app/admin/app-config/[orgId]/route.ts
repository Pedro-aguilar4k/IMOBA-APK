import { NextResponse } from 'next/server'
import { requirePlatformAdmin } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { ROOT_DOMAIN } from '@/lib/sites/host'

/**
 * Gera o arquivo de configuração do app (Expo/React Native) de UMA corretora.
 * O admin baixa este JSON ao fechar o cliente e o coloca no projeto do app
 * antes de compilar; ele aponta o app para a imobiliária correta.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  await requirePlatformAdmin()
  const { orgId } = await params

  const admin = createAdminClient()
  const { data: org } = await admin
    .from('organizations')
    .select('id, name, slug, custom_domain, custom_domain_verified')
    .eq('id', orgId)
    .maybeSingle()

  if (!org) return NextResponse.json({ error: 'Imobiliária não encontrada.' }, { status: 404 })

  const { data: settings } = await admin
    .from('org_site_settings')
    .select('brand_color, logo_url, whatsapp, phone, contact_email')
    .eq('organization_id', orgId)
    .maybeSingle()

  const siteDomain =
    org.custom_domain_verified && org.custom_domain ? org.custom_domain : `${org.slug}.${ROOT_DOMAIN}`

  const config = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    organization: {
      id: org.id,
      name: org.name,
      slug: org.slug,
    },
    api: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    site: {
      domain: siteDomain,
      url: `https://${siteDomain}`,
    },
    branding: {
      appName: org.name,
      brandColor: settings?.brand_color ?? '#2563eb',
      logoUrl: settings?.logo_url ?? null,
    },
    contact: {
      whatsapp: settings?.whatsapp ?? null,
      phone: settings?.phone ?? null,
      email: settings?.contact_email ?? null,
    },
  }

  const fileName = `imobapp-config-${org.slug}.json`
  return new NextResponse(JSON.stringify(config, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-store',
    },
  })
}
