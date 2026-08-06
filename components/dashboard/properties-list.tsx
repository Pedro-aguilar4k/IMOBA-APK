'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Building2, MapPin, Search } from 'lucide-react'
import { PROPERTY_STATUSES, formatCurrency, type PropertyStatus } from '@/lib/properties'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface PropertyListItem {
  id: string
  title: string
  address: string
  neighborhood: string | null
  city: string
  state: string
  bedrooms: number | null
  bathrooms: number | null
  usable_area_sqm: number | null
  area_sqm: number | null
  rent_value: number | null
  status: PropertyStatus
  coverUrl?: string
}

interface PropertiesListProps {
  properties: PropertyListItem[]
  compact?: boolean
}

export default function PropertiesList({ properties, compact = false }: PropertiesListProps) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR')
    return properties.filter((property) => {
      const matchesSearch = !term || [property.title, property.address, property.neighborhood, property.city].some((value) => value?.toLocaleLowerCase('pt-BR').includes(term))
      return matchesSearch && (status === 'all' || property.status === status)
    })
  }, [properties, search, status])

  if (!properties.length) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon"><Building2 /></EmptyMedia>
          <EmptyTitle>Nenhum imóvel cadastrado</EmptyTitle>
          <EmptyDescription>Comece adicionando o primeiro imóvel do seu portfólio.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent><Link href="/dashboard/corretor/properties/new" className={buttonVariants()}>Cadastrar imóvel</Link></EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {!compact ? (
        <div className="grid gap-3 sm:grid-cols-[1fr_13rem]">
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input aria-label="Buscar imóveis" placeholder="Buscar por título ou endereço" value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
          </div>
          <Select value={status} onValueChange={(value) => setStatus(value ?? 'all')}>
            <SelectTrigger className="w-full" aria-label="Filtrar por status"><SelectValue>{status === 'all' ? 'Todos os status' : PROPERTY_STATUSES[status as PropertyStatus]}</SelectValue></SelectTrigger>
            <SelectContent><SelectGroup><SelectItem value="all">Todos os status</SelectItem>{Object.entries(PROPERTY_STATUSES).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectGroup></SelectContent>
          </Select>
        </div>
      ) : null}

      {!filtered.length ? (
        <Empty className="border"><EmptyHeader><EmptyMedia variant="icon"><Search /></EmptyMedia><EmptyTitle>Nenhum resultado</EmptyTitle><EmptyDescription>Ajuste a busca ou o filtro de status.</EmptyDescription></EmptyHeader></Empty>
      ) : (
        <div className={compact ? 'flex flex-col gap-3' : 'grid gap-4 md:grid-cols-2'}>
          {filtered.map((property) => (
            <Link key={property.id} href={`/dashboard/corretor/properties/${property.id}`} className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Card className="h-full overflow-hidden transition-colors group-hover:border-primary/50">
                {property.coverUrl ? (
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    <Image src={property.coverUrl} alt={`Foto de capa de ${property.title}`} fill sizes={compact ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 768px) 100vw, 50vw'} className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" unoptimized />
                  </div>
                ) : null}
                <CardHeader className="gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base">{property.title}</CardTitle>
                    <Badge variant={property.status === 'inactive' ? 'secondary' : 'outline'}>{PROPERTY_STATUSES[property.status]}</Badge>
                  </div>
                  <CardDescription className="flex items-start gap-1.5"><MapPin className="mt-0.5 size-4 shrink-0" />{property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city} - {property.state}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-end justify-between gap-4">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{property.usable_area_sqm ?? property.area_sqm ?? 0} m²</span>
                    <span>{property.bedrooms ?? 0} quartos</span>
                    <span>{property.bathrooms ?? 0} banheiros</span>
                  </div>
                  <span className="shrink-0 font-semibold">{formatCurrency(property.rent_value)}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
