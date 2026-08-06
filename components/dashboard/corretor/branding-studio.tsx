'use client'

import { useActionState, useId, useState } from 'react'
import { Check, Loader2, Palette, type LucideIcon, ImageIcon, Type, FileText, Smartphone } from 'lucide-react'
import { saveSiteSettings, type SiteSettingsState } from '@/app/dashboard/corretor/site/actions'
import { ImageUploadField } from '@/components/dashboard/corretor/image-upload-field'
import { SiteLivePreview } from '@/components/dashboard/corretor/site-live-preview'
import { SITE_FONTS } from '@/lib/sites/fonts'
import type { BrandingState } from '@/lib/sites/branding-types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface BrandingStudioProps {
  initial: BrandingState
  orgName: string
  /** Presente quando o superadmin edita pelo /admin. */
  organizationId?: string
  /** true = superadmin (habilita aba App). */
  isPlatformAdmin?: boolean
}

type TabKey = 'colors' | 'logos' | 'images' | 'type' | 'texts' | 'app'

const initialState: SiteSettingsState = {}

export function BrandingStudio({ initial, orgName, organizationId, isPlatformAdmin }: BrandingStudioProps) {
  const [state, action, pending] = useActionState(saveSiteSettings, initialState)
  const [tab, setTab] = useState<TabKey>('colors')
  const [b, setB] = useState<BrandingState>(initial)

  const set = <K extends keyof BrandingState>(key: K, value: BrandingState[K]) =>
    setB((prev) => ({ ...prev, [key]: value }))

  const tabs: { key: TabKey; label: string; icon: LucideIcon }[] = [
    { key: 'colors', label: 'Cores', icon: Palette },
    { key: 'logos', label: 'Logos', icon: ImageIcon },
    { key: 'images', label: 'Imagens', icon: ImageIcon },
    { key: 'type', label: 'Tipografia', icon: Type },
    { key: 'texts', label: 'Textos', icon: FileText },
    ...(isPlatformAdmin ? [{ key: 'app' as TabKey, label: 'App', icon: Smartphone }] : []),
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_minmax(360px,42%)]">
      {/* ===== Editor ===== */}
      <div className="flex flex-col gap-5">
        {/* abas */}
        <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                tab === key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-4" /> {label}
            </button>
          ))}
        </div>

        <form action={action} className="flex flex-col gap-5">
          {/* campos ocultos: sempre enviam o estado completo */}
          {organizationId ? <input type="hidden" name="organizationId" value={organizationId} /> : null}
          <input type="hidden" name="brandColor" value={b.brandColor} />
          <input type="hidden" name="secondaryColor" value={b.secondaryColor} />
          <input type="hidden" name="accentColor" value={b.accentColor} />
          <input type="hidden" name="backgroundColor" value={b.backgroundColor} />
          <input type="hidden" name="headingFont" value={b.headingFont} />
          <input type="hidden" name="bodyFont" value={b.bodyFont} />
          <input type="hidden" name="heroTitle" value={b.heroTitle} />
          <input type="hidden" name="heroSubtitle" value={b.heroSubtitle} />
          <input type="hidden" name="aboutText" value={b.aboutText} />
          <input type="hidden" name="whatsapp" value={b.whatsapp} />
          <input type="hidden" name="phone" value={b.phone} />
          <input type="hidden" name="contactEmail" value={b.contactEmail} />
          <input type="hidden" name="address" value={b.address} />

          {tab === 'colors' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField label="Cor principal" value={b.brandColor} onChange={(v) => set('brandColor', v)} />
              <ColorField label="Cor secundária" value={b.secondaryColor} onChange={(v) => set('secondaryColor', v)} />
              <ColorField label="Cor de destaque" value={b.accentColor} onChange={(v) => set('accentColor', v)} />
              <ColorField label="Cor de fundo" value={b.backgroundColor} onChange={(v) => set('backgroundColor', v)} />
            </div>
          ) : null}

          {tab === 'logos' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <ImageUploadField
                assetKey="logo"
                label="Logo (fundo claro)"
                hint="PNG ou SVG com fundo transparente. Ideal ~400×120px."
                value={b.logoUrl}
                organizationId={organizationId}
                onChange={(url) => set('logoUrl', url)}
              />
              <ImageUploadField
                assetKey="logoDark"
                label="Logo (fundo escuro)"
                hint="Versão clara do logo para áreas escuras."
                value={b.logoDarkUrl}
                organizationId={organizationId}
                onChange={(url) => set('logoDarkUrl', url)}
                dark
              />
              <ImageUploadField
                assetKey="favicon"
                label="Favicon"
                hint="Ícone da aba do navegador. Quadrado, ~64×64px."
                value={b.faviconUrl}
                organizationId={organizationId}
                onChange={(url) => set('faviconUrl', url)}
              />
            </div>
          ) : null}

          {tab === 'images' ? (
            <div className="grid gap-4">
              <ImageUploadField
                assetKey="hero"
                label="Imagem de capa (hero)"
                hint="Aparece no topo do site. Ideal ~1600×900px, até 2 MB."
                value={b.heroImageUrl}
                organizationId={organizationId}
                onChange={(url) => set('heroImageUrl', url)}
              />
              <ImageUploadField
                assetKey="about"
                label="Imagem do Sobre"
                hint="Foto da equipe ou da fachada. Ideal ~1200×800px."
                value={b.aboutImageUrl}
                organizationId={organizationId}
                onChange={(url) => set('aboutImageUrl', url)}
              />
            </div>
          ) : null}

          {tab === 'type' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <FontField label="Fonte dos títulos" value={b.headingFont} onChange={(v) => set('headingFont', v)} />
              <FontField label="Fonte do texto" value={b.bodyFont} onChange={(v) => set('bodyFont', v)} />
            </div>
          ) : null}

          {tab === 'texts' ? (
            <div className="grid gap-4">
              <TextField label="Título do hero" value={b.heroTitle} onChange={(v) => set('heroTitle', v)} placeholder="Encontre seu próximo imóvel" />
              <TextField label="Subtítulo do hero" value={b.heroSubtitle} onChange={(v) => set('heroSubtitle', v)} placeholder="Imóveis selecionados para você" />
              <AreaField label="Texto do Sobre" value={b.aboutText} onChange={(v) => set('aboutText', v)} placeholder="Conte a história da sua imobiliária..." />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="WhatsApp" value={b.whatsapp} onChange={(v) => set('whatsapp', v)} placeholder="(11) 99999-0000" />
                <TextField label="Telefone" value={b.phone} onChange={(v) => set('phone', v)} placeholder="(11) 3333-0000" />
                <TextField label="E-mail de contato" value={b.contactEmail} onChange={(v) => set('contactEmail', v)} placeholder="contato@..." />
                <TextField label="Endereço" value={b.address} onChange={(v) => set('address', v)} placeholder="Rua, número - Cidade/UF" />
              </div>
            </div>
          ) : null}

          {tab === 'app' && isPlatformAdmin ? (
            <AppTab branding={b} organizationId={organizationId} onChange={setB} />
          ) : null}

          {/* ações — a aba App tem seu próprio salvamento */}
          {tab !== 'app' ? (
            <div className="flex items-center gap-3 border-t border-border pt-4">
              <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                Salvar alterações
              </Button>
              {state.success ? <span className="text-sm text-emerald-600">Alterações salvas.</span> : null}
              {state.error ? <span className="text-sm text-destructive">{state.error}</span> : null}
            </div>
          ) : null}
        </form>
      </div>

      {/* ===== Preview ===== */}
      <div className="lg:sticky lg:top-4 lg:self-start">
        <SiteLivePreview branding={b} orgName={orgName} />
      </div>
    </div>
  )
}

/* ---------- Campos ---------- */

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId()
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-3 rounded-md border border-border p-1.5">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-9 shrink-0 cursor-pointer rounded bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent font-mono text-sm text-foreground outline-none"
          spellCheck={false}
        />
      </div>
    </div>
  )
}

function FontField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId()
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={(v) => onChange(v ?? 'Geist')}>
        <SelectTrigger id={id}>
          <SelectValue placeholder="Escolha uma fonte" />
        </SelectTrigger>
        <SelectContent>
          {SITE_FONTS.map((font) => (
            <SelectItem key={font.value} value={font.value}>
              {font.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const id = useId()
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function AreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const id = useId()
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} value={value} rows={4} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

/* ---------- Aba App (só superadmin) ---------- */

function AppTab({
  branding,
  organizationId,
  onChange,
}: {
  branding: BrandingState
  organizationId?: string
  onChange: React.Dispatch<React.SetStateAction<BrandingState>>
}) {
  const [saved, setSaved] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Salvamento próprio (server action via fetch de form).
  async function handleSaveName(name: string) {
    if (!organizationId) return
    setPending(true)
    setError(null)
    try {
      const { saveAppSettings } = await import('@/app/dashboard/corretor/site/actions')
      const fd = new FormData()
      fd.set('organizationId', organizationId)
      fd.set('appName', name)
      const res = await saveAppSettings({}, fd)
      if (res.error) setError(res.error)
      else {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-700">
        Estes itens vão para a configuração do app compilado por corretora. Só a plataforma pode editá-los.
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="appName">Nome do app</Label>
        <div className="flex gap-2">
          <Input
            id="appName"
            defaultValue={branding.appName ?? ''}
            placeholder="Ex.: Imobiliária Demo"
            onChange={(e) => onChange((p) => ({ ...p, appName: e.target.value }))}
          />
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => handleSaveName(branding.appName ?? '')}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : 'Salvar nome'}
          </Button>
        </div>
        {saved ? <span className="text-xs text-emerald-600">Nome salvo.</span> : null}
        {error ? <span className="text-xs text-destructive">{error}</span> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ImageUploadField
          assetKey="appIcon"
          label="Ícone do app"
          hint="Quadrado, 1024×1024px, PNG sem transparência."
          value={branding.appIconUrl}
          organizationId={organizationId}
          onChange={(url) => onChange((p) => ({ ...p, appIconUrl: url }))}
        />
        <ImageUploadField
          assetKey="appSplash"
          label="Splash screen"
          hint="Tela de abertura. ~1284×2778px."
          value={branding.appSplashUrl}
          organizationId={organizationId}
          onChange={(url) => onChange((p) => ({ ...p, appSplashUrl: url }))}
        />
      </div>
    </div>
  )
}
