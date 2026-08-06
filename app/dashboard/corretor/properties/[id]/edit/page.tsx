import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import CorretorHeader from '@/components/dashboard/corretor-header'
import { PropertyForm } from '@/components/dashboard/property-form'
import { PropertyMediaGrid } from '@/components/dashboard/property-media-grid'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requireOrgRole } from '@/lib/auth/tenant'
import { addSignedUrls } from '@/lib/properties-server'
import { createClient } from '@/lib/supabase/server'
import type { PropertyMediaRecord, PropertyRecord } from '@/lib/properties'

export const metadata = { title: 'Editar imóvel' }

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const access = await requireOrgRole('corretor')
  const supabase = await createClient()
  const [{ data: profile }, { data }, { data: mediaData }] = await Promise.all([
    supabase.from('profiles').select('name, email').eq('id', access.userId).single(),
    supabase.from('properties').select('*').eq('id', id).eq('organization_id', access.organizationId).single(),
    supabase.from('property_media').select('*').eq('property_id', id).order('position'),
  ])

  if (!data) notFound()
  const property = data as PropertyRecord
  const media = await addSignedUrls(supabase, (mediaData ?? []) as PropertyMediaRecord[])

  return (
    <div className="min-h-svh bg-background">
      <CorretorHeader name={profile?.name ?? 'Corretor'} email={profile?.email ?? access.email} />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1"><p className="text-sm font-medium text-primary">Portfólio</p><h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">Editar imóvel</h1><p className="text-muted-foreground">Atualize os dados e organize as fotos de {property.title}.</p></div>
          <Link href={`/dashboard/corretor/properties/${property.id}`} className={buttonVariants({ variant: 'outline' })}><ArrowLeft data-icon="inline-start" />Cancelar edição</Link>
        </div>

        <Card>
          <CardHeader><CardTitle>Fotos cadastradas</CardTitle><CardDescription>Defina a capa ou remova imagens que não devem mais aparecer.</CardDescription></CardHeader>
          <CardContent><PropertyMediaGrid media={media} editable /></CardContent>
        </Card>

        <PropertyForm property={property} media={media} />
      </main>
    </div>
  )
}
