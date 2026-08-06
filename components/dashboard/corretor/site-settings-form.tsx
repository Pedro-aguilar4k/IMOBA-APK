'use client'

import { useActionState, useId, useState } from 'react'
import { saveSiteSettings, type SiteSettingsState } from '@/app/dashboard/corretor/site/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2 } from 'lucide-react'

export interface SiteSettingsValues {
  brandColor: string
  logoUrl: string
  heroTitle: string
  heroSubtitle: string
  aboutText: string
  whatsapp: string
  phone: string
  contactEmail: string
  address: string
}

function Field({
  label,
  children,
}: {
  label: string
  children: (id: string) => React.ReactNode
}) {
  const id = useId()
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children(id)}
    </div>
  )
}

export function SiteSettingsForm({ initial }: { initial: SiteSettingsValues }) {
  const [state, action, pending] = useActionState<SiteSettingsState, FormData>(saveSiteSettings, {})
  const [color, setColor] = useState(initial.brandColor)

  return (
    <form action={action} className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Marca</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Cor principal">
            {(id) => (
              <div className="flex items-center gap-3">
                <input
                  id={id}
                  type="color"
                  name="brandColor"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="size-10 shrink-0 cursor-pointer rounded-md border border-border bg-transparent"
                />
                <span className="font-mono text-sm text-muted-foreground">{color}</span>
              </div>
            )}
          </Field>
          <Field label="URL do logo (opcional)">
            {(id) => <Input id={id} name="logoUrl" defaultValue={initial.logoUrl} placeholder="https://..." />}
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Destaque (home)</h2>
        <div className="grid gap-4">
          <Field label="Título">
            {(id) => (
              <Input id={id} name="heroTitle" defaultValue={initial.heroTitle} placeholder="Encontre seu próximo imóvel" />
            )}
          </Field>
          <Field label="Subtítulo">
            {(id) => (
              <Input
                id={id}
                name="heroSubtitle"
                defaultValue={initial.heroSubtitle}
                placeholder="Imóveis selecionados para você"
              />
            )}
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Sobre</h2>
        <Field label="Texto institucional">
          {(id) => (
            <Textarea id={id} name="aboutText" defaultValue={initial.aboutText} rows={4} placeholder="Conte a história da sua imobiliária..." />
          )}
        </Field>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Contato</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="WhatsApp">
            {(id) => <Input id={id} name="whatsapp" defaultValue={initial.whatsapp} placeholder="(11) 99999-0000" />}
          </Field>
          <Field label="Telefone">
            {(id) => <Input id={id} name="phone" defaultValue={initial.phone} placeholder="(11) 3333-0000" />}
          </Field>
          <Field label="E-mail de contato">
            {(id) => (
              <Input id={id} name="contactEmail" type="email" defaultValue={initial.contactEmail} placeholder="contato@..." />
            )}
          </Field>
          <Field label="Endereço">
            {(id) => <Input id={id} name="address" defaultValue={initial.address} placeholder="Rua, número - Cidade/UF" />}
          </Field>
        </div>
      </section>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? (
        <p className="flex items-center gap-2 text-sm text-emerald-600">
          <CheckCircle2 className="size-4" /> Alterações salvas.
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  )
}
