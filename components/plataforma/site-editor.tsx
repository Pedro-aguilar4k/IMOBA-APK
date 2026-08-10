'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, ExternalLink, Eye, Globe, Image as ImageIcon, LayoutTemplate, Palette, RotateCcw, Save, Search, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import type { SiteCustomization } from '@/lib/site/customization'
import { publishSite, resetSiteDraft, saveSiteDraft } from '@/app/plataforma/sites/actions'

type TabKey = 'identidade' | 'hero' | 'secoes' | 'seo' | 'publicacao'

const TABS: { key: TabKey; label: string; icon: typeof Palette }[] = [
  { key: 'identidade', label: 'Identidade', icon: Palette },
  { key: 'hero', label: 'Hero e busca', icon: ImageIcon },
  { key: 'secoes', label: 'Seções', icon: LayoutTemplate },
  { key: 'seo', label: 'SEO', icon: Search },
  { key: 'publicacao', label: 'Publicação', icon: Globe },
]

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function SiteEditor({
  organization,
  initialDraft,
  publishedAt,
}: {
  organization: { id: string; name: string; slug: string }
  initialDraft: SiteCustomization
  publishedAt: string | null
}) {
  const [draft, setDraft] = useState(initialDraft)
  const [activeTab, setActiveTab] = useState<TabKey>('identidade')
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState('')
  const previewUrl = `/site/${organization.slug}`
  const updatedLabel = useMemo(
    () => (publishedAt ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(publishedAt)) : 'Ainda não publicado'),
    [publishedAt],
  )

  function update<K extends keyof SiteCustomization>(key: K, value: SiteCustomization[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function save(publish = false) {
    startTransition(async () => {
      const result = publish ? await publishSite(organization.id, draft) : await saveSiteDraft(organization.id, draft)
      setFeedback(result.message)
    })
  }

  function reset() {
    startTransition(async () => {
      const result = await resetSiteDraft(organization.id)
      if (result.ok && result.draft) {
        setDraft(result.draft)
        setFeedback(result.message)
      } else setFeedback(result.message)
    })
  }

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-3">
          <Button render={<Link href="/plataforma/sites" />} variant="outline" size="icon" aria-label="Voltar para sites">
            <ArrowLeft data-icon="inline-start" />
          </Button>
          <div>
            <p className="text-sm font-medium text-primary">Personalizando site</p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">{organization.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">/{organization.slug}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button render={<Link href={previewUrl} target="_blank" />} variant="outline">
            <Eye data-icon="inline-start" /> Ver preview
          </Button>
          <Button onClick={() => save(false)} disabled={isPending} variant="secondary">
            <Save data-icon="inline-start" /> Salvar rascunho
          </Button>
          <Button onClick={() => save(true)} disabled={isPending}>
            <Send data-icon="inline-start" /> Publicar site
          </Button>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <div className="flex overflow-x-auto border-b border-border/60 bg-muted/20 px-2 py-2">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:bg-background/70 hover:text-foreground'}`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          <CardContent className="flex flex-col gap-6 p-5">
            {activeTab === 'identidade' && (
              <>
                <div><CardTitle>Identidade da marca</CardTitle><CardDescription className="mt-1">O que seus clientes veem no cabeçalho e nos contatos.</CardDescription></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nome exibido" htmlFor="displayName"><Input id="displayName" value={draft.brand.displayName} onChange={(e) => update('brand', { ...draft.brand, displayName: e.target.value })} /></Field>
                  <Field label="CRECI" htmlFor="creci"><Input id="creci" value={draft.brand.creci} onChange={(e) => update('brand', { ...draft.brand, creci: e.target.value })} placeholder="CRECI 12.345-J" /></Field>
                </div>
                <Field label="Tagline" htmlFor="tagline"><Input id="tagline" value={draft.brand.tagline} onChange={(e) => update('brand', { ...draft.brand, tagline: e.target.value })} /></Field>
                <Field label="Logo (URL)" htmlFor="logoUrl" hint="Cole a URL pública do logo. Upload de arquivos entra na próxima etapa."><Input id="logoUrl" value={draft.brand.logoUrl} onChange={(e) => update('brand', { ...draft.brand, logoUrl: e.target.value })} placeholder="https://.../logo.png" /></Field>
                <Field label="Cor principal" htmlFor="primaryColor"><div className="flex items-center gap-3"><Input id="primaryColor" type="color" value={draft.brand.primaryColor} onChange={(e) => update('brand', { ...draft.brand, primaryColor: e.target.value })} className="h-10 w-16 cursor-pointer p-1" /><Input aria-label="Código hexadecimal" value={draft.brand.primaryColor} onChange={(e) => update('brand', { ...draft.brand, primaryColor: e.target.value })} /></div></Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="WhatsApp" htmlFor="whatsapp"><Input id="whatsapp" value={draft.brand.whatsapp} onChange={(e) => update('brand', { ...draft.brand, whatsapp: e.target.value })} placeholder="5511999999999" /></Field>
                  <Field label="Telefone" htmlFor="phone"><Input id="phone" value={draft.brand.phone} onChange={(e) => update('brand', { ...draft.brand, phone: e.target.value })} /></Field>
                  <Field label="E-mail" htmlFor="email"><Input id="email" type="email" value={draft.brand.email} onChange={(e) => update('brand', { ...draft.brand, email: e.target.value })} /></Field>
                  <Field label="Instagram" htmlFor="instagram"><Input id="instagram" value={draft.brand.instagram} onChange={(e) => update('brand', { ...draft.brand, instagram: e.target.value })} placeholder="imobiliaria" /></Field>
                </div>
              </>
            )}

            {activeTab === 'hero' && (
              <>
                <div><CardTitle>Hero e busca</CardTitle><CardDescription className="mt-1">A primeira impressão e o principal caminho para encontrar imóveis.</CardDescription></div>
                <Field label="Texto acima do título" htmlFor="heroEyebrow"><Input id="heroEyebrow" value={draft.hero.eyebrow} onChange={(e) => update('hero', { ...draft.hero, eyebrow: e.target.value })} /></Field>
                <Field label="Título principal" htmlFor="heroTitle"><Textarea id="heroTitle" value={draft.hero.title} onChange={(e) => update('hero', { ...draft.hero, title: e.target.value })} rows={3} /></Field>
                <Field label="Trecho destacado" htmlFor="heroHighlight" hint="Deve ser um trecho que aparece dentro do título principal."><Input id="heroHighlight" value={draft.hero.highlight} onChange={(e) => update('hero', { ...draft.hero, highlight: e.target.value })} /></Field>
                <Field label="Descrição" htmlFor="heroDescription"><Textarea id="heroDescription" value={draft.hero.description} onChange={(e) => update('hero', { ...draft.hero, description: e.target.value })} rows={3} /></Field>
                <Field label="Imagem de fundo (URL)" htmlFor="heroImage" hint="Use uma imagem horizontal de alta qualidade."><Input id="heroImage" value={draft.hero.imageUrl} onChange={(e) => update('hero', { ...draft.hero, imageUrl: e.target.value })} /></Field>
                <Field label="Texto do botão" htmlFor="heroCta"><Input id="heroCta" value={draft.hero.ctaLabel} onChange={(e) => update('hero', { ...draft.hero, ctaLabel: e.target.value })} /></Field>
              </>
            )}

            {activeTab === 'secoes' && (
              <>
                <div><CardTitle>Seções da home</CardTitle><CardDescription className="mt-1">Edite os textos e decida quais blocos aparecem no site.</CardDescription></div>
                {(['featured', 'buyRent', 'about', 'contact'] as const).map((key) => {
                  const section = draft.sections[key]
                  return (
                    <div key={key} className="flex flex-col gap-4 rounded-xl border border-border/60 p-4">
                      <div className="flex items-center justify-between gap-3"><div><p className="font-semibold">{key === 'featured' ? 'Imóveis em destaque' : key === 'buyRent' ? 'Comprar e alugar' : key === 'about' ? 'Sobre a imobiliária' : 'Contato'}</p><p className="text-xs text-muted-foreground">Ative ou desative este bloco.</p></div><button type="button" role="switch" aria-checked={section.enabled} onClick={() => update('sections', { ...draft.sections, [key]: { ...section, enabled: !section.enabled } })} className={`relative h-6 w-11 rounded-full transition-colors ${section.enabled ? 'bg-primary' : 'bg-muted'}`}><span className={`absolute top-1 size-4 rounded-full bg-background transition-transform ${section.enabled ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>
                      {'eyebrow' in section && <Field label="Eyebrow" htmlFor={`${key}-eyebrow`}><Input id={`${key}-eyebrow`} value={section.eyebrow} onChange={(e) => update('sections', { ...draft.sections, [key]: { ...section, eyebrow: e.target.value } })} /></Field>}
                      <Field label="Título" htmlFor={`${key}-title`}><Input id={`${key}-title`} value={section.title} onChange={(e) => update('sections', { ...draft.sections, [key]: { ...section, title: e.target.value } })} /></Field>
                      <Field label="Descrição" htmlFor={`${key}-description`}><Textarea id={`${key}-description`} value={'body' in section ? section.body : section.description} onChange={(e) => update('sections', { ...draft.sections, [key]: { ...section, ...('body' in section ? { body: e.target.value } : { description: e.target.value }) } })} rows={3} /></Field>
                    </div>
                  )
                })}
              </>
            )}

            {activeTab === 'seo' && (
              <>
                <div><CardTitle>SEO e compartilhamento</CardTitle><CardDescription className="mt-1">Defina como o site aparece no Google e nas redes sociais.</CardDescription></div>
                <Field label="Título SEO" htmlFor="seoTitle"><Input id="seoTitle" value={draft.seo.title} onChange={(e) => update('seo', { ...draft.seo, title: e.target.value })} /></Field>
                <Field label="Descrição SEO" htmlFor="seoDescription"><Textarea id="seoDescription" value={draft.seo.description} onChange={(e) => update('seo', { ...draft.seo, description: e.target.value })} rows={5} /></Field>
                <div className="rounded-lg bg-muted/40 p-4 text-sm"><p className="font-medium">Prévia no Google</p><p className="mt-2 text-primary">{draft.seo.title || draft.brand.displayName}</p><p className="mt-1 text-muted-foreground">{draft.seo.description || draft.hero.description}</p></div>
              </>
            )}

            {activeTab === 'publicacao' && (
              <>
                <div><CardTitle>Publicação</CardTitle><CardDescription className="mt-1">O rascunho só aparece para clientes depois de publicado.</CardDescription></div>
                <div className="flex items-start gap-3 rounded-xl border border-border/60 p-4"><span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary"><Check aria-hidden="true" /></span><div><p className="font-medium">Status do site</p><p className="mt-1 text-sm text-muted-foreground">{publishedAt ? `Publicado em ${updatedLabel}.` : 'Este site ainda não foi publicado.'}</p></div></div>
                <div className="flex flex-wrap gap-2"><Button onClick={() => save(true)} disabled={isPending}><Send data-icon="inline-start" /> Publicar alterações</Button><Button onClick={reset} disabled={isPending} variant="outline"><RotateCcw data-icon="inline-start" /> Restaurar padrões</Button></div>
                <div className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">As alterações ficam isoladas por imobiliária e o site público sempre usa a última versão publicada.</div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="min-h-[720px] overflow-hidden rounded-xl border border-border/60 bg-muted/30 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/60 bg-background px-4 py-3"><div className="flex items-center gap-2 text-sm font-medium"><span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary"><Eye aria-hidden="true" /></span>Preview ao vivo</div><Badge variant="outline">Rascunho</Badge></div>
          <iframe title={`Preview do site de ${organization.name}`} src={previewUrl} className="h-[calc(100vh-210px)] min-h-[650px] w-full bg-background" />
        </div>
      </div>
    </div>
  )
}
