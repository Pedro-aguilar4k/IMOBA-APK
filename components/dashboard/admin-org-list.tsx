'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ImpersonateButton } from '@/components/dashboard/impersonate-button'
import { SiteManageButton } from '@/components/dashboard/site-manage-button'

export interface AdminOrgRow {
  id: string
  name: string
  cnpjLast4: string
  address: string
  published: boolean
  slug: string
  customDomain: string | null
  customDomainVerified: boolean
  responsibleName: string | null
  responsibleEmail: string | null
  legacyName: string | null
  status: 'active' | 'legacy' | 'none'
}

export function AdminOrgList({ organizations }: { organizations: AdminOrgRow[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return organizations
    return organizations.filter((org) =>
      [org.name, org.address, org.responsibleName, org.responsibleEmail, org.cnpjLast4]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q)),
    )
  }, [organizations, query])

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome, responsável, e-mail..."
          className="pl-9"
          aria-label="Buscar imobiliárias"
        />
      </div>

      {filtered.length ? (
        <div className="flex flex-col gap-3">
          {filtered.map((org) => (
            <div
              key={org.id}
              className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{org.name}</p>
                <p className="text-sm leading-6 text-muted-foreground">CNPJ final {org.cnpjLast4}</p>
                <p className="truncate font-mono text-sm leading-6 text-muted-foreground">
                  {org.address}
                  {org.published ? (
                    <span className="ml-2 font-sans text-emerald-600">• publicado</span>
                  ) : (
                    <span className="ml-2 font-sans text-muted-foreground">• rascunho</span>
                  )}
                </p>
                {org.status === 'active' ? (
                  <>
                    <p className="text-sm leading-6 text-muted-foreground">Responsável: {org.responsibleName}</p>
                    <p className="truncate text-sm leading-6 text-muted-foreground">{org.responsibleEmail}</p>
                  </>
                ) : org.status === 'legacy' ? (
                  <p className="text-sm leading-6 text-muted-foreground">
                    Convite legado de {org.legacyName}. Recrie a conta com e-mail e senha temporária.
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Badge variant={org.status === 'active' ? 'default' : 'secondary'}>
                  {org.status === 'active' ? 'Conta ativa' : org.status === 'legacy' ? 'Cadastro legado' : 'Sem corretor'}
                </Badge>
                <SiteManageButton
                  organizationId={org.id}
                  organizationName={org.name}
                  slug={org.slug}
                  customDomain={org.customDomain}
                  customDomainVerified={org.customDomainVerified}
                />
                <ImpersonateButton organizationId={org.id} organizationName={org.name} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {query ? 'Nenhuma imobiliária encontrada para a busca.' : 'Nenhuma imobiliária cadastrada.'}
        </p>
      )}
    </div>
  )
}
