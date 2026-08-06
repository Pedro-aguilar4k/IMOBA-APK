'use client'

import { useActionState } from 'react'
import { Download, Globe } from 'lucide-react'
import { updateOrgDomain, updateOrgSlug, type DomainState } from '@/app/admin/actions'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initial: DomainState = {}
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'imobapp.com'

interface Props {
  organizationId: string
  organizationName: string
  slug: string
  customDomain: string | null
  customDomainVerified: boolean
}

export function SiteManageButton({
  organizationId,
  organizationName,
  slug,
  customDomain,
  customDomainVerified,
}: Props) {
  const [slugState, slugAction, slugPending] = useActionState(updateOrgSlug, initial)
  const [domainState, domainAction, domainPending] = useActionState(updateOrgDomain, initial)

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Globe className="size-4" />
            Site
          </Button>
        }
      />
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Site de {organizationName}</AlertDialogTitle>
          <AlertDialogDescription>
            Defina o endereço, o domínio próprio e baixe a configuração do app desta corretora.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-6">
          {/* Endereço (slug) */}
          <form action={slugAction} className="grid gap-2">
            <input type="hidden" name="organizationId" value={organizationId} />
            <Label htmlFor={`slug-${organizationId}`}>Endereço (subdomínio)</Label>
            <div className="flex items-center gap-2">
              <Input
                id={`slug-${organizationId}`}
                name="slug"
                defaultValue={slug}
                autoCapitalize="none"
                spellCheck={false}
                className="font-mono"
              />
              <span className="shrink-0 text-sm text-muted-foreground">.{ROOT_DOMAIN}</span>
            </div>
            {slugState.error ? <p className="text-sm text-destructive">{slugState.error}</p> : null}
            {slugState.success ? <p className="text-sm text-emerald-600">{slugState.success}</p> : null}
            <Button type="submit" size="sm" variant="secondary" disabled={slugPending} className="justify-self-start">
              {slugPending ? 'Salvando...' : 'Salvar endereço'}
            </Button>
          </form>

          {/* Domínio próprio */}
          <form action={domainAction} className="grid gap-2">
            <input type="hidden" name="organizationId" value={organizationId} />
            <Label htmlFor={`domain-${organizationId}`}>Domínio próprio</Label>
            <Input
              id={`domain-${organizationId}`}
              name="customDomain"
              defaultValue={customDomain ?? ''}
              placeholder="www.corretora.com.br"
              autoCapitalize="none"
              spellCheck={false}
              className="font-mono"
            />
            <p className="text-sm leading-6 text-muted-foreground">
              {customDomain
                ? customDomainVerified
                  ? 'Domínio ativo.'
                  : 'Salvo. Aponte o DNS para a Vercel e adicione o domínio ao projeto para ativar.'
                : 'Deixe em branco para usar apenas o subdomínio.'}
            </p>
            {domainState.error ? <p className="text-sm text-destructive">{domainState.error}</p> : null}
            {domainState.success ? <p className="text-sm text-emerald-600">{domainState.success}</p> : null}
            <Button type="submit" size="sm" variant="secondary" disabled={domainPending} className="justify-self-start">
              {domainPending ? 'Salvando...' : 'Salvar domínio'}
            </Button>
          </form>

          {/* Config do app */}
          <div className="grid gap-2 rounded-lg border border-border bg-muted/40 p-4">
            <p className="text-sm font-medium text-foreground">Configuração do app</p>
            <p className="text-sm leading-6 text-muted-foreground">
              Baixe o arquivo e coloque no projeto do app desta corretora antes de compilar.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="justify-self-start"
              render={
                <a href={`/admin/app-config/${organizationId}`} download>
                  <Download className="size-4" />
                  Baixar config do app
                </a>
              }
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Fechar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
