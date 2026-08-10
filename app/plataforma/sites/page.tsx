import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ExternalLink, Palette, Plus } from 'lucide-react'
import { requireSuperadmin } from '@/lib/auth/roles'
import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'Sites das imobiliárias | IMOBA' }

export default async function PlatformSitesPage() {
  await requireSuperadmin()
  const admin = createAdminClient()
  const { data: organizations } = await admin
    .from('organizations')
    .select('id, name, slug, custom_domain, domain_status, site_customizations(published_at)')
    .order('name')

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Experiência do cliente</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Sites das imobiliárias</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Personalize identidade, conteúdo, hero, imóveis em destaque e SEO de cada site vendido pela IMOBA.
          </p>
        </div>
        <Button render={<Link href="/plataforma/assinaturas" />} variant="outline">
          <Plus data-icon="inline-start" /> Nova imobiliária
        </Button>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        {(organizations ?? []).map((organization) => {
          const customization = Array.isArray(organization.site_customizations)
            ? organization.site_customizations[0]
            : organization.site_customizations
          const published = Boolean(customization?.published_at)
          return (
            <Card key={organization.id} className="overflow-hidden">
              <CardHeader className="border-b border-border/60 bg-muted/20">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Palette aria-hidden="true" />
                    </span>
                    <div>
                      <CardTitle>{organization.name}</CardTitle>
                      <CardDescription>/{organization.slug}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={published ? 'default' : 'secondary'}>
                    {published ? 'Publicado' : 'Rascunho'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4 pt-5">
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <span>{organization.custom_domain ?? 'Domínio IMOBA'}</span>
                  <span>{organization.domain_status === 'verified' ? 'Domínio verificado' : 'Preview disponível'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button render={<Link href={`/site/${organization.slug}`} target="_blank" />} variant="ghost" size="icon" aria-label="Abrir site">
                    <ExternalLink data-icon="inline-start" />
                  </Button>
                  <Button render={<Link href={`/plataforma/sites/${organization.id}`} />}>
                    Editar <ArrowRight data-icon="inline-end" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
