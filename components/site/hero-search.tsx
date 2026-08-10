'use client'

import { ArrowRight, Building2, MapPin, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

const TYPES = [
  { value: 'all', label: 'Todos os imóveis' },
  { value: 'apartment', label: 'Apartamento' },
  { value: 'house', label: 'Casa' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'land', label: 'Terreno' },
  { value: 'farm', label: 'Fazenda' },
  { value: 'ranch', label: 'Sítio' },
  { value: 'chacara', label: 'Chácara' },
]

const AREA_OPTIONS = [
  { value: 'all', label: 'Qualquer área' },
  ...Array.from({ length: 7 }, (_, index) => {
    const value = 40 + index * 10
    return { value: String(value), label: `A partir de ${value} m²` }
  }),
  ...Array.from({ length: 8 }, (_, index) => {
    const value = 200 + index * 100
    return { value: String(value), label: `A partir de ${value} m²` }
  }),
  { value: '1000', label: '1000+ m²' },
]

export function HeroSearch({ baseHref }: { baseHref: string }) {
  const router = useRouter()
  const [purpose, setPurpose] = useState<'venda' | 'aluguel'>('aluguel')
  const [type, setType] = useState('all')
  const [bedrooms, setBedrooms] = useState('all')
  const [minArea, setMinArea] = useState('all')
  const [maxArea, setMaxArea] = useState('all')
  const [neighborhood, setNeighborhood] = useState('')

  function search() {
    const params = new URLSearchParams({ purpose })
    if (type !== 'all') params.set('type', type)
    if (bedrooms !== 'all') params.set('bedrooms', bedrooms)
    if (minArea !== 'all') params.set('minArea', minArea)
    if (maxArea !== 'all') params.set('maxArea', maxArea === '1000' ? '' : maxArea)
    if (neighborhood.trim()) {
      params.set('neighborhood', neighborhood.trim())
      params.set('q', neighborhood.trim())
    }
    router.push(`${baseHref}/imoveis?${params.toString()}`)
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-border/70 bg-background p-5 shadow-2xl sm:p-6">
      <div className="flex gap-2">
        <Button type="button" variant="default" className="flex-1" onClick={() => setPurpose('venda')}>
          <Search data-icon="inline-start" />
          Buscar imóvel
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={() => router.push(`${baseHref}/anunciar`)}>
          Anunciar imóvel
        </Button>
      </div>

      <h2 className="mt-4 text-balance font-display text-2xl font-semibold leading-tight text-primary">
        Encontre seu novo imóvel em poucos cliques
      </h2>

      <div className="mt-4 flex border-b border-border">
        {(['aluguel', 'venda'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setPurpose(value)}
            className={cn(
              'flex-1 border-b-2 px-4 pb-3 text-sm font-medium transition-colors',
              purpose === value ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {value === 'aluguel' ? 'Alugar' : 'Comprar'}
          </button>
        ))}
      </div>

      <div className="divide-y divide-border">
        <div className="flex gap-3 py-3">
          <MapPin className="mt-0.5 size-5 shrink-0 text-foreground" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <Label htmlFor="hero-neighborhood" className="text-sm font-medium">Bairro</Label>
            <Input id="hero-neighborhood" value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)} className="mt-1 h-7 border-0 px-0 text-sm shadow-none focus-visible:ring-0" placeholder="Busque por bairro" />
          </div>
        </div>

        <div className="flex gap-3 py-3">
          <Building2 className="mt-0.5 size-5 shrink-0 text-foreground" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <Label htmlFor="hero-type" className="text-sm font-medium">Tipo de imóvel</Label>
            <Select value={type} onValueChange={(value) => setType(value ?? 'all')}>
              <SelectTrigger id="hero-type" className="mt-1 h-7 border-0 px-0 text-sm shadow-none focus:ring-0"><SelectValue>{(value) => TYPES.find((item) => item.value === value)?.label ?? 'Todos os imóveis'}</SelectValue></SelectTrigger>
              <SelectContent>{TYPES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-3">
          <div>
            <Label htmlFor="hero-min-area" className="text-sm font-medium">Área mínima</Label>
            <Select value={minArea} onValueChange={(value) => setMinArea(value ?? 'all')}>
              <SelectTrigger id="hero-min-area" className="mt-1 h-8 text-sm"><SelectValue>{(value) => AREA_OPTIONS.find((item) => item.value === value)?.label ?? 'Qualquer área'}</SelectValue></SelectTrigger>
              <SelectContent>{AREA_OPTIONS.map((item) => <SelectItem key={`min-${item.value}`} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="hero-max-area" className="text-sm font-medium">Área máxima</Label>
            <Select value={maxArea} onValueChange={(value) => setMaxArea(value ?? 'all')}>
              <SelectTrigger id="hero-max-area" className="mt-1 h-8 text-sm"><SelectValue>{(value) => (value === '1000' ? '1000+ m²' : value === 'all' || !value ? 'Qualquer área' : `Até ${value} m²`)}</SelectValue></SelectTrigger>
              <SelectContent>{AREA_OPTIONS.map((item) => <SelectItem key={`max-${item.value}`} value={item.value}>{item.value === '1000' ? '1000+ m²' : item.value === 'all' ? item.label : `Até ${item.value} m²`}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 py-3">
          <span className="mt-0.5 flex size-5 items-center justify-center text-sm font-semibold" aria-hidden="true">$</span>
          <div className="min-w-0 flex-1">
            <Label htmlFor="hero-bedrooms" className="text-sm font-medium">Quartos</Label>
            <Select value={bedrooms} onValueChange={(value) => setBedrooms(value ?? 'all')}>
              <SelectTrigger id="hero-bedrooms" className="mt-1 h-7 border-0 px-0 text-sm shadow-none focus:ring-0"><SelectValue>{(value) => (!value || value === 'all' ? 'Qualquer quantidade' : `${value} quarto${value === '1' ? '' : 's'} ou mais`)}</SelectValue></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer quantidade</SelectItem>
                <SelectItem value="1">1 quarto ou mais</SelectItem>
                <SelectItem value="2">2 quartos ou mais</SelectItem>
                <SelectItem value="3">3 quartos ou mais</SelectItem>
                <SelectItem value="4">4 quartos ou mais</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button onClick={search} className="mt-4 h-12 w-full gap-2">
        Buscar imóvel
        <ArrowRight data-icon="inline-end" />
      </Button>
    </div>
  )
}
