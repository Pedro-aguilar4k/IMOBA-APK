'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const TYPES = [
  { value: 'all', label: 'Todos os tipos' },
  { value: 'apartment', label: 'Apartamento' },
  { value: 'house', label: 'Casa' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'land', label: 'Terreno' },
]

export function HeroSearch({ baseHref }: { baseHref: string }) {
  const router = useRouter()
  const [purpose, setPurpose] = useState<'venda' | 'aluguel'>('venda')
  const [type, setType] = useState('all')
  const [q, setQ] = useState('')

  function search() {
    const params = new URLSearchParams()
    params.set('purpose', purpose)
    if (type !== 'all') params.set('type', type)
    if (q.trim()) params.set('q', q.trim())
    router.push(`${baseHref}/imoveis?${params.toString()}`)
  }

  return (
    <div className="w-full rounded-2xl border border-border/60 bg-background/95 p-4 shadow-xl backdrop-blur sm:p-5">
      <div className="mb-4 inline-flex rounded-lg bg-muted p-1">
        {(['venda', 'aluguel'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPurpose(p)}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              purpose === p
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {p === 'venda' ? 'Comprar' : 'Alugar'}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <Label htmlFor="hero-q" className="mb-1.5 text-xs text-muted-foreground">
            Onde você procura?
          </Label>
          <Input
            id="hero-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) search()
            }}
            placeholder="Bairro, cidade ou título"
          />
        </div>
        <div className="w-full md:w-52">
          <Label htmlFor="hero-type" className="mb-1.5 text-xs text-muted-foreground">
            Tipo de imóvel
          </Label>
          <Select value={type} onValueChange={(value) => setType(value ?? 'all')}>
            <SelectTrigger id="hero-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={search} className="h-10 gap-2 md:w-auto">
          <Search className="size-4" aria-hidden="true" />
          Buscar imóveis
        </Button>
      </div>
    </div>
  )
}
