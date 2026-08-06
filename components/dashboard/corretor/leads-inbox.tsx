'use client'

import { useState, useTransition } from 'react'
import { updateLeadStatus } from '@/app/dashboard/corretor/site/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, Phone, Home, MessageSquare } from 'lucide-react'

export interface LeadItem {
  id: string
  name: string
  email: string | null
  phone: string | null
  message: string | null
  status: 'new' | 'contacted' | 'archived'
  createdAt: string
  propertyTitle: string | null
}

const STATUS_LABEL: Record<LeadItem['status'], string> = {
  new: 'Novo',
  contacted: 'Contatado',
  archived: 'Arquivado',
}

function LeadCard({ lead }: { lead: LeadItem }) {
  const [status, setStatus] = useState(lead.status)
  const [pending, startTransition] = useTransition()

  function setTo(next: LeadItem['status']) {
    startTransition(async () => {
      const res = await updateLeadStatus(lead.id, next)
      if (!res?.error) setStatus(next)
    })
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-foreground">{lead.name}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(lead.createdAt).toLocaleString('pt-BR')}
          </p>
        </div>
        <Badge variant={status === 'new' ? 'default' : status === 'contacted' ? 'secondary' : 'outline'}>
          {STATUS_LABEL[status]}
        </Badge>
      </div>

      <div className="mt-3 flex flex-col gap-1.5 text-sm">
        {lead.propertyTitle ? (
          <span className="flex items-center gap-2 text-muted-foreground">
            <Home className="size-4" /> {lead.propertyTitle}
          </span>
        ) : null}
        {lead.phone ? (
          <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-foreground hover:underline">
            <Phone className="size-4" /> {lead.phone}
          </a>
        ) : null}
        {lead.email ? (
          <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-foreground hover:underline">
            <Mail className="size-4" /> {lead.email}
          </a>
        ) : null}
        {lead.message ? (
          <span className="mt-1 flex items-start gap-2 text-muted-foreground">
            <MessageSquare className="mt-0.5 size-4 shrink-0" /> {lead.message}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {status !== 'contacted' ? (
          <Button size="sm" variant="outline" onClick={() => setTo('contacted')} disabled={pending}>
            Marcar contatado
          </Button>
        ) : null}
        {status !== 'archived' ? (
          <Button size="sm" variant="ghost" onClick={() => setTo('archived')} disabled={pending}>
            Arquivar
          </Button>
        ) : null}
        {status === 'archived' ? (
          <Button size="sm" variant="ghost" onClick={() => setTo('new')} disabled={pending}>
            Reabrir
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export function LeadsInbox({ leads }: { leads: LeadItem[] }) {
  if (!leads.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Nenhum lead ainda. Quando alguém enviar o formulário do seu site, ele aparece aqui.
      </div>
    )
  }
  return (
    <div className="grid gap-3">
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  )
}
