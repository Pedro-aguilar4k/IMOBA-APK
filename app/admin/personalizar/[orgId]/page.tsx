import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { requirePlatformAdmin } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'
import { mapSettingsToBranding } from '@/lib/sites/branding-types'
import { AdminHeader } from '@/components/dashboard/admin-header'
import { BrandingStudio } from '@/components/dashboard/corretor/branding-studio'

export const metadata = { title: 'Personalizar imobiliária' }

export default async function AdminBrandingPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const ctx = await requirePlatformAdmin()
  const { orgId } = await params
  const admin = createAdminClient()

  const [{ data: org }, { data: settings }] = await Promise.all([
    admin.from('organizations').select('name, slug').eq('id', orgId).maybeSingle(),
    admin.from('org_site_settings').select('*').eq('organization_id', orgId).maybeSingle(),
  ])

  if (!org) notFound()

  const branding = mapSettingsToBranding(settings)

  return (
    <div className="min-h-svh bg-muted/40">
      <AdminHeader email={ctx.email} />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6">
        <div className="flex flex-col gap-2">
          <Link
            href="/admin"
            className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Voltar ao painel
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Personalizar {org.name}</h2>
            <p className="text-sm text-muted-foreground">
              Configure a identidade do site e os ativos do app desta imobiliária.
            </p>
          </div>
        </div>

        <BrandingStudio initial={branding} orgName={org.name} organizationId={orgId} isPlatformAdmin />
      </main>
    </div>
  )
}
