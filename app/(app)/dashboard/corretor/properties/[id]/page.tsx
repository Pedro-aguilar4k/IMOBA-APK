import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Bath, BedDouble, Building2, Car, MapPin, Ruler } from 'lucide-react'
import CorretorHeader from '@/components/dashboard/corretor-header'
import { PropertyActions } from '@/components/dashboard/property-actions'
import { PropertyMediaGrid } from '@/components/dashboard/property-media-grid'
import { NearbyPlacesEditor } from '@/components/dashboard/nearby-places-editor'
import { listNearbyPlaces } from '@/app/(app)/dashboard/corretor/properties/nearby-actions'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { requireRole } from '@/lib/auth/roles'
import { addSignedUrls } from '@/lib/properties-server'
import { createClient } from '@/lib/supabase/server'
import { PROPERTY_STATUSES, formatCurrency, getPropertyTypeLabel, type PropertyMediaRecord, type PropertyRecord } from '@/lib/properties'

export const metadata = { title: 'Detalhes do imóvel' }

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const access = await requireRole('corretor')
  const supabase = await createClient()
  const [{ data: profile }, { data }, { data: mediaData }] = await Promise.all([
    supabase.from('profiles').select('name, email').eq('id', access.userId).single(),
    supabase.from('properties').select('*').eq('id', id).eq('corretor_id', access.userId).single(),
    supabase.from('property_media').select('*').eq('property_id', id).order('position'),
  ])

  if (!data) notFound()
  const property = data as PropertyRecord
  const media = await addSignedUrls(supabase, (mediaData ?? []) as PropertyMediaRecord[])
  const nearbyPlaces = await listNearbyPlaces(property.id)

  return (
    <div className="min-h-svh bg-background">
      <CorretorHeader name={profile?.name ?? 'Corretor'} email={profile?.email ?? access.email} />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <Link href="/dashboard/corretor/properties" className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'w-fit' })}><ArrowLeft data-icon="inline-start" />Voltar aos imóveis</Link>
            <div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{getPropertyTypeLabel(property.property_type)}</Badge><Badge variant={property.status === 'inactive' ? 'secondary' : 'default'}>{PROPERTY_STATUSES[property.status]}</Badge></div>
            <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">{property.title}</h1>
            <p className="flex items-start gap-1.5 text-muted-foreground"><MapPin className="mt-0.5 size-4 shrink-0" />{property.address}, {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city} - {property.state}</p>
          </div>
          <PropertyActions propertyId={property.id} status={property.status} />
        </div>

        <PropertyMediaGrid media={media} />

        <NearbyPlacesEditor
          propertyId={property.id}
          hasCoords={property.latitude != null && property.longitude != null}
          places={nearbyPlaces}
        />

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader><CardTitle>Características</CardTitle><CardDescription>Estrutura e dimensões cadastradas.</CardDescription></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Stat icon={Ruler} label="Área útil" value={`${property.usable_area_sqm ?? property.area_sqm ?? 0} m²`} />
                <Stat icon={BedDouble} label="Quartos" value={String(property.bedrooms ?? 0)} />
                <Stat icon={Bath} label="Banheiros" value={String(property.bathrooms ?? 0)} />
                <Stat icon={Car} label="Vagas" value={String(property.parking_spaces)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Descrição</CardTitle></CardHeader>
              <CardContent><p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{property.description || 'Nenhuma descrição informada.'}</p></CardContent>
            </Card>

            {property.features.length ? (
              <Card><CardHeader><CardTitle>Comodidades</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">{property.features.map((feature) => <Badge key={feature} variant="secondary">{feature}</Badge>)}</CardContent></Card>
            ) : null}
          </div>

          <Card className="h-fit">
            <CardHeader><CardTitle>Valores mensais</CardTitle><CardDescription>Composição prevista da locação.</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <ValueRow label="Aluguel" value={formatCurrency(property.rent_value)} strong />
              <Separator />
              <ValueRow label="Condomínio" value={formatCurrency(property.condominium_value)} />
              <ValueRow label="IPTU" value={formatCurrency(property.iptu_value)} />
              <ValueRow label="Seguro incêndio" value={formatCurrency(property.fire_insurance_value)} />
              <ValueRow label="Outras taxas" value={formatCurrency(property.extra_fees_value)} />
              <Separator />
              <ValueRow label="Total estimado" value={formatCurrency((property.rent_value ?? 0) + property.condominium_value + property.iptu_value + property.fire_insurance_value + property.extra_fees_value)} strong />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function Stat({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return <div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-lg bg-muted"><Icon className="size-4" /></div><div><p className="text-xs text-muted-foreground">{label}</p><p className="font-semibold">{value}</p></div></div>
}

function ValueRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className="flex items-center justify-between gap-4"><span className="text-sm text-muted-foreground">{label}</span><span className={strong ? 'font-semibold' : 'text-sm'}>{value}</span></div>
}
