import { requireOrgRole } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { ROOT_DOMAIN } from '@/lib/sites/host'
import CorretorHeader from '@/components/dashboard/corretor-header'
import { SiteSettingsForm, type SiteSettingsValues } from '@/components/dashboard/corretor/site-settings-form'
import { SitePublishCard } from '@/components/dashboard/corretor/site-publish-card'
import { LeadsInbox, type LeadItem } from '@/components/dashboard/corretor/leads-inbox'

export const metadata = { title: 'Meu site' }

export default async function SitePage() {
  const access = await requireOrgRole('org_admin')
  const admin = createAdminClient()
  const supabase = await createClient()

  const [{ data: org }, { data: settings }, { data: leadsRows }, { data: profile }] = await Promise.all([
    admin
      .from('organizations')
      .select('name, slug, site_published, custom_domain, custom_domain_verified')
      .eq('id', access.organizationId)
      .single(),
    admin.from('org_site_settings').select('*').eq('organization_id', access.organizationId).single(),
    admin
      .from('leads')
      .select('id, name, email, phone, message, status, created_at, properties(title)')
      .eq('organization_id', access.organizationId)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase.from('profiles').select('name, email').eq('id', access.userId).single(),
  ])

  const initial: SiteSettingsValues = {
    brandColor: settings?.brand_color ?? '#2563eb',
    logoUrl: settings?.logo_url ?? '',
    heroTitle: settings?.hero_title ?? '',
    heroSubtitle: settings?.hero_subtitle ?? '',
    aboutText: settings?.about_text ?? '',
    whatsapp: settings?.whatsapp ?? '',
    phone: settings?.phone ?? '',
    contactEmail: settings?.contact_email ?? '',
    address: settings?.address ?? '',
  }

  const leads: LeadItem[] = (leadsRows ?? []).map((l) => ({
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    message: l.message,
    status: l.status,
    createdAt: l.created_at,
    propertyTitle:
      (Array.isArray(l.properties) ? l.properties[0]?.title : (l.properties as { title: string } | null)?.title) ??
      null,
  }))

  const slug = org?.slug ?? ''
  const siteUrl = `https://${slug}.${ROOT_DOMAIN}`
  const previewUrl = `/sites/${slug}`
  const newLeads = leads.filter((l) => l.status === 'new').length

  return (
    <div className="min-h-svh bg-muted/40">
      <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col">
        <CorretorHeader name={profile?.name ?? 'Dono'} email={access.email} isOwner />

        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
          <header>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Meu site</h1>
            <p className="text-sm text-muted-foreground">
              Personalize a marca, publique e acompanhe os contatos recebidos.
            </p>
          </header>

          <SitePublishCard
            published={org?.site_published ?? false}
            siteUrl={siteUrl}
            previewUrl={previewUrl}
            customDomain={org?.custom_domain ?? null}
            customDomainVerified={org?.custom_domain_verified ?? false}
          />

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Leads</h2>
              {newLeads > 0 ? (
                <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                  {newLeads} novo{newLeads > 1 ? 's' : ''}
                </span>
              ) : null}
            </div>
            <LeadsInbox leads={leads} />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-foreground">Personalização</h2>
            <SiteSettingsForm initial={initial} />
          </section>
        </main>
      </div>
    </div>
  )
}
