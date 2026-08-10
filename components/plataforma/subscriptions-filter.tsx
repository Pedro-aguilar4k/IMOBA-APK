'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Search } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

const FILTERS = [
  { value: '', label: 'Todas' },
  { value: 'adimplente', label: 'Adimplentes' },
  { value: 'inadimplente', label: 'Inadimplentes' },
  { value: 'pendente', label: 'Pendentes' },
  { value: 'cancelado', label: 'Cancelados' },
]

export function SubscriptionsFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const situacao = searchParams.get('situacao') ?? ''
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  function pushParams(next: URLSearchParams) {
    startTransition(() => {
      router.push(`/plataforma/assinaturas?${next.toString()}`)
    })
  }

  function handleFilter(value: string) {
    const next = new URLSearchParams(searchParams.toString())
    if (value) next.set('situacao', value)
    else next.delete('situacao')
    pushParams(next)
  }

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = new URLSearchParams(searchParams.toString())
    if (query.trim()) next.set('q', query.trim())
    else next.delete('q')
    pushParams(next)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const active = situacao === filter.value
          return (
            <button
              key={filter.value || 'todas'}
              type="button"
              onClick={() => handleFilter(filter.value)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      <form onSubmit={handleSearch} className="relative w-full sm:w-64">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar imobiliária ou e-mail"
          className="pl-9"
          aria-label="Buscar assinaturas"
        />
      </form>
    </div>
  )
}
