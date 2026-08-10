'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Globe, CircleCheck, CircleAlert, Trash2 } from 'lucide-react'

import { saveDomain, removeDomain, type DomainState } from '@/app/(app)/admin/conta/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

type DomainStatus = 'nao_configurado' | 'pendente' | 'verificado'

const STATUS_META: Record<
  DomainStatus,
  { label: string; variant: 'default' | 'secondary' | 'outline' }
> = {
  nao_configurado: { label: 'Não configurado', variant: 'outline' },
  pendente: { label: 'Aguardando verificação', variant: 'secondary' },
  verificado: { label: 'Ativo', variant: 'default' },
}

interface DomainFormProps {
  currentDomain: string | null
  status: DomainStatus
}

function SubmitButton({ hasDomain }: { hasDomain: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Salvando...' : hasDomain ? 'Atualizar domínio' : 'Salvar domínio'}
    </Button>
  )
}

export function DomainForm({ currentDomain, status }: DomainFormProps) {
  const [state, formAction] = useActionState<DomainState, FormData>(saveDomain, {})
  const [removing, setRemoving] = useState(false)
  const meta = STATUS_META[status]

  async function handleRemove() {
    setRemoving(true)
    await removeDomain()
    setRemoving(false)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Globe className="size-4" aria-hidden="true" />
          Status do domínio
        </div>
        <Badge variant={meta.variant}>{meta.label}</Badge>
      </div>

      <form action={formAction} className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="domain">Domínio personalizado</Label>
          <Input
            key={currentDomain ?? 'empty'}
            id="domain"
            name="domain"
            type="text"
            inputMode="url"
            placeholder="imobiliaria.com.br"
            defaultValue={currentDomain ?? ''}
            autoComplete="off"
          />
          <p className="text-xs leading-5 text-muted-foreground">
            Use o domínio ou subdomínio que seus clientes acessarão. Após salvar, aponte o DNS
            conforme as instruções abaixo.
          </p>
        </div>

        {state.error ? (
          <p className="flex items-center gap-2 text-sm text-destructive" role="alert">
            <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
            {state.error}
          </p>
        ) : null}
        {state.ok ? (
          <p className="flex items-center gap-2 text-sm text-primary" role="status">
            <CircleCheck className="size-4 shrink-0" aria-hidden="true" />
            Domínio salvo. A verificação será concluída em breve.
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton hasDomain={Boolean(currentDomain)} />
          {currentDomain ? (
            <Button
              type="button"
              variant="ghost"
              onClick={handleRemove}
              disabled={removing}
              className="text-destructive"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              {removing ? 'Removendo...' : 'Remover'}
            </Button>
          ) : null}
        </div>
      </form>

      {currentDomain ? (
        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <p className="mb-3 text-sm font-medium text-foreground">Configuração de DNS</p>
          <p className="mb-3 text-xs leading-5 text-muted-foreground">
            No painel do seu provedor de domínio, crie o registro abaixo para apontar
            <span className="font-medium text-foreground"> {currentDomain} </span>
            para a plataforma:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="pb-2 pr-4 font-medium">Tipo</th>
                  <th className="pb-2 pr-4 font-medium">Nome</th>
                  <th className="pb-2 font-medium">Valor</th>
                </tr>
              </thead>
              <tbody className="font-mono text-foreground">
                <tr>
                  <td className="pr-4">CNAME</td>
                  <td className="pr-4">{currentDomain.split('.').length > 2 ? currentDomain.split('.')[0] : '@'}</td>
                  <td>cname.imoba.com.br</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  )
}
