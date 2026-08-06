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
    .select(
      'brand_color, secondary_color, accent_color, background_color, heading_font, body_font, logo_url, logo_dark_url, favicon_url, whatsapp, phone, contact_email, app_name, app_icon_url, app_splash_url',
    )
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
    app: {
      name: settings?.app_name ?? org.name,
      iconUrl: settings?.app_icon_url ?? null,
      splashUrl: settings?.app_splash_url ?? null,
    },
    branding: {
      brandColor: settings?.brand_color ?? '#2563eb',
      secondaryColor: settings?.secondary_color ?? '#1e293b',
      accentColor: settings?.accent_color ?? '#f59e0b',
      backgroundColor: settings?.background_color ?? '#ffffff',
      headingFont: settings?.heading_font ?? 'Geist',
      bodyFont: settings?.body_font ?? 'Geist',
      logoUrl: settings?.logo_url ?? null,
      logoDarkUrl: settings?.logo_dark_url ?? null,
      faviconUrl: settings?.favicon_url ?? null,
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
