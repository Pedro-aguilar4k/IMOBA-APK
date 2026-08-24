'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Eye, Globe, Image as ImageIcon, LayoutTemplate, Menu, PaintBucket, Palette, RotateCcw, Save, Search, Send, Type } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import type { SiteCustomization } from '@/lib/site/customization'
import { publishSite, resetSiteDraft, saveSiteDraft } from '@/app/plataforma/sites/actions'

type TabKey = 'identidade' | 'tema' | 'cabecalho' | 'hero' | 'secoes' | 'rodape' | 'seo' | 'publicacao'

const TABS: { key: TabKey; label: string; icon: typeof Palette }[] = [
  { key: 'identidade', label: 'Marca', icon: Palette },
  { key: 'tema', label: 'Cores', icon: PaintBucket },
  { key: 'cabecalho', label: 'Cabeçalho', icon: Menu },
  { key: 'hero', label: 'Hero', icon: ImageIcon },
  { key: 'secoes', label: 'Seções', icon: LayoutTemplate },
  { key: 'rodape', label: 'Rodapé', icon: Type },
  { key: 'seo', label: 'SEO', icon: Search },
  { key: 'publicacao', label: 'Publicar', icon: Globe },
]

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-2"><Label htmlFor={htmlFor}>{label}</Label>{children}{hint && <p className="text-xs text-muted-foreground">{hint}</p>}</div>
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = `color-${label.toLowerCase().replaceAll(' ', '-')}`
  return (
    <Field label={label} htmlFor={id}>
      <div className="flex items-center gap-2">
        <Input id={id} type="color" value={value} onChange={(event) => onChange(event.target.value)} className="size-10 shrink-0 cursor-pointer p-1" />
        <Input value={value} onChange={(event) => onChange(event.target.value)} aria-label={`Código hexadecimal de ${label}`} className="font-mono uppercase" />
      </div>
    </Field>
  )
}

function LivePreview({ draft }: { draft: SiteCustomization }) {
  const theme = draft.theme
  const buttonStyle = { backgroundColor: theme.primary, color: theme.primaryText, borderRadius: theme.buttonRadius }
  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: theme.pageBackground, color: theme.pageText }}>
      <div className="flex items-center justify-between gap-3 px-5 py-4" style={{ backgroundColor: theme.headerBackground }}>
        <strong className="truncate font-display">{draft.brand.displayName}</strong>
        <span className="rounded-md px-3 py-2 text-xs font-semibold" style={buttonStyle}>{draft.navigation.cta}</span>
      </div>
      <div className="relative flex min-h-72 flex-col justify-end overflow-hidden bg-cover bg-center p-7" style={{ backgroundImage: `linear-gradient(${theme.heroOverlay}bb, ${theme.heroOverlay}bb), url(${draft.hero.imageUrl})` }}>
        <p className="text-xs font-semibold uppercase tracking-wider text-white/80">{draft.hero.eyebrow}</p>
        <h2 className="mt-2 max-w-xl text-balance font-display text-3xl font-bold text-white">{draft.hero.title}</h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/80">{draft.hero.description}</p>
        <span className="mt-4 w-fit px-4 py-2 text-sm font-semibold" style={buttonStyle}>{draft.hero.ctaLabel}</span>
      </div>
      <div className="grid grid-cols-4 gap-2 p-5 text-center" style={{ backgroundColor: theme.statsBackground }}>
        {[draft.stats.available, draft.stats.sale, draft.stats.rent, draft.stats.cityPlural].map((label, index) => <div key={label}><strong className="block text-lg">{[24, 15, 9, 3][index]}</strong><span className="text-[10px]" style={{ color: theme.mutedText }}>{label}</span></div>)}
      </div>
      {draft.sections.featured.enabled && <div className="p-6" style={{ backgroundColor: theme.featuredBackground }}><p className="text-xs font-semibold" style={{ color: theme.primary }}>{draft.sections.featured.eyebrow}</p><h3 className="mt-1 font-display text-2xl font-bold">{draft.sections.featured.title}</h3><p className="mt-1 text-sm" style={{ color: theme.mutedText }}>{draft.sections.featured.description}</p><div className="mt-4 grid grid-cols-3 gap-3">{[1, 2, 3].map((item) => <div key={item} className="aspect-[4/3] rounded-lg" style={{ backgroundColor: theme.secondary }} />)}</div></div>}
      {draft.sections.about.enabled && <div className="p-6" style={{ backgroundColor: theme.aboutBackground }}><p className="text-xs font-semibold" style={{ color: theme.primary }}>{draft.sections.about.eyebrow}</p><h3 className="mt-1 font-display text-2xl font-bold">{draft.sections.about.title}</h3><p className="mt-2 text-sm leading-relaxed" style={{ color: theme.mutedText }}>{draft.sections.about.body}</p></div>}
      {draft.sections.contact.enabled && <div className="p-6" style={{ backgroundColor: theme.contactBackground }}><p className="text-xs font-semibold" style={{ color: theme.primary }}>{draft.sections.contact.eyebrow}</p><h3 className="mt-1 font-display text-2xl font-bold">{draft.sections.contact.title}</h3><span className="mt-4 inline-block px-4 py-2 text-sm font-semibold" style={buttonStyle}>{draft.sections.contact.whatsappLabel}</span></div>}
      <div className="flex justify-between gap-3 p-6 text-xs" style={{ backgroundColor: theme.footerBackground, color: theme.footerText }}><span>{draft.brand.displayName}</span><span>{draft.footer.signatureText}</span></div>
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

            {activeTab === 'tema' && (
              <>
                <div><CardTitle>Cores e botões</CardTitle><CardDescription className="mt-1">Personalize cada área do site. Use cores com bom contraste entre fundo e texto.</CardDescription></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ColorField label="Fundo geral" value={draft.theme.pageBackground} onChange={(value) => update('theme', { ...draft.theme, pageBackground: value })} />
                  <ColorField label="Texto principal" value={draft.theme.pageText} onChange={(value) => update('theme', { ...draft.theme, pageText: value })} />
                  <ColorField label="Texto secundário" value={draft.theme.mutedText} onChange={(value) => update('theme', { ...draft.theme, mutedText: value })} />
                  <ColorField label="Cor dos botões" value={draft.theme.primary} onChange={(value) => update('theme', { ...draft.theme, primary: value })} />
                  <ColorField label="Texto dos botões" value={draft.theme.primaryText} onChange={(value) => update('theme', { ...draft.theme, primaryText: value })} />
                  <ColorField label="Cabeçalho" value={draft.theme.headerBackground} onChange={(value) => update('theme', { ...draft.theme, headerBackground: value })} />
                  <ColorField label="Faixa de números" value={draft.theme.statsBackground} onChange={(value) => update('theme', { ...draft.theme, statsBackground: value })} />
                  <ColorField label="Imóveis em destaque" value={draft.theme.featuredBackground} onChange={(value) => update('theme', { ...draft.theme, featuredBackground: value })} />
                  <ColorField label="Comprar e alugar" value={draft.theme.buyRentBackground} onChange={(value) => update('theme', { ...draft.theme, buyRentBackground: value })} />
                  <ColorField label="Sobre" value={draft.theme.aboutBackground} onChange={(value) => update('theme', { ...draft.theme, aboutBackground: value })} />
                  <ColorField label="Contato" value={draft.theme.contactBackground} onChange={(value) => update('theme', { ...draft.theme, contactBackground: value })} />
                  <ColorField label="Rodapé" value={draft.theme.footerBackground} onChange={(value) => update('theme', { ...draft.theme, footerBackground: value })} />
                  <ColorField label="Texto do rodapé" value={draft.theme.footerText} onChange={(value) => update('theme', { ...draft.theme, footerText: value })} />
                </div>
                <Field label="Arredondamento dos botões" htmlFor="buttonRadius" hint={`${draft.theme.buttonRadius}px`}><Input id="buttonRadius" type="range" min="0" max="24" value={draft.theme.buttonRadius} onChange={(event) => update('theme', { ...draft.theme, buttonRadius: Number(event.target.value) })} /></Field>
              </>
            )}

            {activeTab === 'cabecalho' && (
              <>
                <div><CardTitle>Cabeçalho e navegação</CardTitle><CardDescription className="mt-1">Todos os nomes do menu e o botão principal podem ser alterados.</CardDescription></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {Object.entries({ home: 'Início', properties: 'Imóveis', buy: 'Comprar', rent: 'Alugar', about: 'Sobre', contact: 'Contato' }).map(([key, label]) => (
                    <Field key={key} label={label} htmlFor={`nav-${key}`}><Input id={`nav-${key}`} value={draft.navigation[key as keyof typeof draft.navigation]} onChange={(event) => update('navigation', { ...draft.navigation, [key]: event.target.value })} /></Field>
                  ))}
                </div>
                <Field label="Texto do botão de contato" htmlFor="nav-cta"><Input id="nav-cta" value={draft.navigation.cta} onChange={(event) => update('navigation', { ...draft.navigation, cta: event.target.value })} /></Field>
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

                {activeTab === 'secoes' && <div className="flex flex-col gap-4 rounded-xl border border-border/60 p-4">
                  <p className="font-semibold">Textos da faixa de números</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {Object.entries({ available: 'Imóveis disponíveis', sale: 'À venda', rent: 'Para alugar', citySingular: 'Uma cidade', cityPlural: 'Várias cidades' }).map(([key, label]) => <Field key={key} label={label} htmlFor={`stat-${key}`}><Input id={`stat-${key}`} value={draft.stats[key as keyof typeof draft.stats]} onChange={(event) => update('stats', { ...draft.stats, [key]: event.target.value })} /></Field>)}
                  </div>
                </div>}
                {activeTab === 'secoes' && <div className="flex flex-col gap-4 rounded-xl border border-border/60 p-4">
                  <p className="font-semibold">Botões, estados e blocos</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Botão da vitrine" htmlFor="featuredCta"><Input id="featuredCta" value={draft.sections.featured.ctaLabel} onChange={(event) => update('sections', { ...draft.sections, featured: { ...draft.sections.featured, ctaLabel: event.target.value } })} /></Field>
                    <Field label="Mensagem sem imóveis" htmlFor="featuredEmpty"><Input id="featuredEmpty" value={draft.sections.featured.emptyText} onChange={(event) => update('sections', { ...draft.sections, featured: { ...draft.sections.featured, emptyText: event.target.value } })} /></Field>
                    <Field label="Título do bloco comprar" htmlFor="buyTitle"><Input id="buyTitle" value={draft.sections.buyRent.buyTitle} onChange={(event) => update('sections', { ...draft.sections, buyRent: { ...draft.sections.buyRent, buyTitle: event.target.value } })} /></Field>
                    <Field label="Título do bloco alugar" htmlFor="rentTitle"><Input id="rentTitle" value={draft.sections.buyRent.rentTitle} onChange={(event) => update('sections', { ...draft.sections, buyRent: { ...draft.sections.buyRent, rentTitle: event.target.value } })} /></Field>
                    <Field label="Botão comprar/alugar" htmlFor="buyRentCta"><Input id="buyRentCta" value={draft.sections.buyRent.ctaLabel} onChange={(event) => update('sections', { ...draft.sections, buyRent: { ...draft.sections.buyRent, ctaLabel: event.target.value } })} /></Field>
                    <Field label="Botão do WhatsApp" htmlFor="whatsappLabel"><Input id="whatsappLabel" value={draft.sections.contact.whatsappLabel} onChange={(event) => update('sections', { ...draft.sections, contact: { ...draft.sections.contact, whatsappLabel: event.target.value } })} /></Field>
                  </div>
                  <Field label="Diferenciais (um por linha)" htmlFor="benefits"><Textarea id="benefits" rows={4} value={draft.sections.about.benefits.join('\n')} onChange={(event) => update('sections', { ...draft.sections, about: { ...draft.sections.about, benefits: event.target.value.split('\n').filter(Boolean) } })} /></Field>
                  <Field label="Imagem da seção Sobre (URL)" htmlFor="aboutImage"><Input id="aboutImage" value={draft.sections.about.imageUrl} onChange={(event) => update('sections', { ...draft.sections, about: { ...draft.sections.about, imageUrl: event.target.value } })} /></Field>
                </div>}

            {activeTab === 'rodape' && (
              <>
                <div><CardTitle>Contato e rodapé</CardTitle><CardDescription className="mt-1">Ajuste os títulos e mensagens que encerram o site.</CardDescription></div>
                <Field label="Título da navegação" htmlFor="footerNav"><Input id="footerNav" value={draft.footer.navigationTitle} onChange={(event) => update('footer', { ...draft.footer, navigationTitle: event.target.value })} /></Field>
                <Field label="Título dos contatos" htmlFor="footerContact"><Input id="footerContact" value={draft.footer.contactTitle} onChange={(event) => update('footer', { ...draft.footer, contactTitle: event.target.value })} /></Field>
                <Field label="Texto de direitos" htmlFor="footerRights"><Input id="footerRights" value={draft.footer.rightsText} onChange={(event) => update('footer', { ...draft.footer, rightsText: event.target.value })} /></Field>
                <Field label="Assinatura" htmlFor="footerSignature"><Input id="footerSignature" value={draft.footer.signatureText} onChange={(event) => update('footer', { ...draft.footer, signatureText: event.target.value })} /></Field>
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
          <div className="h-[calc(100vh-210px)] min-h-[650px] w-full"><LivePreview draft={draft} /></div>
        </div>
      </div>
    </div>
  )
}
