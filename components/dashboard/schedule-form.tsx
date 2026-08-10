'use client'

import { useActionState, useEffect, useState } from 'react'
import { CalendarPlus } from 'lucide-react'
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
import { scheduleVisit, type ScheduleState } from '@/app/(app)/admin/agenda/actions'

export interface LeadOption {
  id: string
  name: string
}

export interface BrokerOption {
  id: string
  name: string
}

interface ScheduleFormProps {
  leads: LeadOption[]
  brokers: BrokerOption[]
}

export function ScheduleForm({ leads, brokers }: ScheduleFormProps) {
  const [state, action, pending] = useActionState<ScheduleState, FormData>(scheduleVisit, {})
  const [leadId, setLeadId] = useState('')
  const [clientName, setClientName] = useState('')
  const [corretorId, setCorretorId] = useState('')
  const [formKey, setFormKey] = useState(0)

  // Ao escolher um lead, preenche o nome do cliente.
  useEffect(() => {
    if (!leadId) return
    const lead = leads.find((l) => l.id === leadId)
    if (lead) setClientName(lead.name)
  }, [leadId, leads])

  // Limpa o formulário após sucesso.
  useEffect(() => {
    if (state.success) {
      setLeadId('')
      setClientName('')
      setCorretorId('')
      setFormKey((k) => k + 1)
    }
  }, [state.success])

  return (
    <form action={action} className="flex flex-col gap-4" key={formKey}>
      {leads.length > 0 ? (
        <div className="grid gap-2">
          <Label htmlFor="lead-select">Lead (opcional)</Label>
          <Select name="leadId" value={leadId} onValueChange={setLeadId}>
            <SelectTrigger id="lead-select" className="w-full">
              <SelectValue placeholder="Selecionar um lead" />
            </SelectTrigger>
            <SelectContent>
              {leads.map((lead) => (
                <SelectItem key={lead.id} value={lead.id}>
                  {lead.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="clientName">Nome do cliente</Label>
        <Input
          id="clientName"
          name="clientName"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Nome de quem fará a visita"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="corretor-select">Corretor responsável</Label>
        <Select name="corretorId" value={corretorId} onValueChange={setCorretorId}>
          <SelectTrigger id="corretor-select" className="w-full">
            <SelectValue placeholder="Selecionar corretor" />
          </SelectTrigger>
          <SelectContent>
            {brokers.map((broker) => (
              <SelectItem key={broker.id} value={broker.id}>
                {broker.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="propertyTitle">Imóvel / referência</Label>
        <Input
          id="propertyTitle"
          name="propertyTitle"
          placeholder="Ex.: Apartamento 302 - Centro"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="scheduledAt">Data e hora</Label>
        <Input id="scheduledAt" name="scheduledAt" type="datetime-local" required />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-primary" role="status">
          {state.success}
        </p>
      ) : null}

      <Button type="submit" disabled={pending || brokers.length === 0} className="gap-2">
        <CalendarPlus className="size-4" aria-hidden="true" />
        {pending ? 'Agendando...' : 'Agendar visita'}
      </Button>

      {brokers.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Cadastre um corretor antes de agendar visitas.
        </p>
      ) : null}
    </form>
  )
}
