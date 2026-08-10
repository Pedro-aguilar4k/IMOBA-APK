import { ArrowRight, Building2, Home, KeyRound, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { HeroSearch } from '@/components/site/hero-search'
import { LeadForm } from '@/components/site/lead-form'
import { PropertyCard } from '@/components/site/property-card'
import { VisitTracker } from '@/components/site/visit-tracker'
import { buttonVariants } from '@/components/ui/button'
import { getOrganizationBySlug, getPublishedSiteCustomization, listPublicProperties } from '@/lib/site/site-data'
import { whatsappLink } from '@/lib/site/format'
import { cn } from '@/lib/utils'

export default async function SiteHomePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const org = await getOrganizationBySlug(slug)
  if (!org) notFound()
  const customization = await getPublishedSiteCustomization(org)
  const content = customization

  const base = `/site/${slug}`
  const all = await listPublicProperties(org.id)
  const featured = all.slice(0, 6)
  const forSale = all.filter((p) => p.listing_purpose === 'venda' || p.listing_purpose === 'ambos').length
  const forRent = all.filter((p) => p.listing_purpose === 'aluguel' || p.listing_purpose === 'ambos').length
  const cities = new Set(all.map((p) => p.city)).size
  const wpp = whatsappLink(org.whatsapp, `Olá! Vim pelo site da ${org.name} e gostaria de atendimento.`)

  return (
    <>
      <VisitTracker organizationId={org.id} path={`/site/${slug}`} />

      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src={content.hero.imageUrl || '/site-demo/hero.png'}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/75 via-foreground/55 to-foreground/45" />
        </div>

        <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-8 px-4 py-12 sm:px-6 md:py-20 lg:flex-row lg:items-center lg:gap-16 lg:px-8">
          <div className="order-2 max-w-xl lg:order-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-background/15 px-3 py-1 text-sm font-medium text-background backdrop-blur">
              <ShieldCheck className="size-4" aria-hidden="true" />
              {content.hero.eyebrow} · {content.brand.creci || 'Imobiliária credenciada'}
            </span>
            <h1 className="mt-4 text-balance font-display text-4xl font-bold leading-tight text-background sm:text-5xl md:text-6xl">
              {content.hero.title}
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-lg leading-relaxed text-background/85">
              {content.hero.description}
            </p>
          </div>
          <div className="order-1 w-full lg:order-1 lg:flex-1">
            <HeroSearch baseHref={base} />
          </div>
        </div>
      </section>

      {/* FAIXA DE DESTAQUES */}
      <section className="border-b border-border/60 bg-secondary/30">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { icon: Building2, value: all.length, label: 'Imóveis disponíveis' },
            { icon: KeyRound, value: forSale, label: 'À venda' },
            { icon: Home, value: forRent, label: 'Para alugar' },
            { icon: ShieldCheck, value: cities, label: cities === 1 ? 'Cidade atendida' : 'Cidades atendidas' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
              <stat.icon className="size-6 text-primary" aria-hidden="true" />
              <span className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                {stat.value}
              </span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* VITRINE DE IMÓVEIS */}
      {content.sections.featured.enabled && <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground">{content.sections.featured.title}</h2>
            <p className="mt-1 text-muted-foreground">{content.sections.featured.description}</p>
          </div>
          <Link
            href={`${base}/imoveis`}
            className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
          >
            Ver todos
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} baseHref={base} />
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
            Em breve, novos imóveis por aqui.
          </p>
        )}
      </section>}

      {/* BLOCOS COMPRAR / ALUGAR */}
      {content.sections.buyRent.enabled && <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              href: `${base}/imoveis?purpose=venda`,
              img: '/site-demo/cobertura-vista.png',
              kicker: 'Comprar',
              title: content.sections.buyRent.title,
              text: content.sections.buyRent.description,
            },
            {
              href: `${base}/imoveis?purpose=aluguel`,
              img: '/site-demo/studio-centro.png',
              kicker: 'Alugar',
              title: 'Encontre o lar ideal para morar',
              text: 'Opções para todos os perfis, com processo simples e rápido.',
            },
          ].map((block) => (
            <Link
              key={block.kicker}
              href={block.href}
              className="group relative isolate flex min-h-56 flex-col justify-end overflow-hidden rounded-2xl p-6 text-background"
            >
              <Image
                src={block.img || "/placeholder.svg"}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="-z-10 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-foreground/85 via-foreground/40 to-foreground/10" />
              <span className="text-sm font-semibold uppercase tracking-wide text-background/80">
                {block.kicker}
              </span>
              <h3 className="mt-1 font-display text-2xl font-bold">{block.title}</h3>
              <p className="mt-1 max-w-sm text-sm text-background/85">{block.text}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium">
                Ver imóveis
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>}

      {/* SOBRE */}
      {content.sections.about.enabled && <section id="sobre" className="border-y border-border/60 bg-secondary/30 scroll-mt-20">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:px-8">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="/site-demo/sobrado-familia.png"
              alt={`Equipe ${org.name}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground">{content.sections.about.title}</h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              {content.sections.about.body}
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {[
                'Atendimento personalizado do início ao fim',
                'Imóveis verificados e documentação em dia',
                'Negociação transparente e segura',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-foreground">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>}

      {/* CONTATO */}
      {content.sections.contact.enabled && <section id="contato" className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground">{content.sections.contact.title}</h2>
            <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
              {content.sections.contact.description}
            </p>
            <div className="mt-6 flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-5">
              {org.phone && (
                <p className="text-sm text-muted-foreground">
                  Telefone: <span className="font-medium text-foreground">{org.phone}</span>
                </p>
              )}
              {org.email && (
                <p className="text-sm text-muted-foreground">
                  E-mail: <span className="font-medium text-foreground">{org.email}</span>
                </p>
              )}
              {wpp && (
                <a
                  href={wpp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: 'default' }), 'mt-1 w-full')}
                >
                  Chamar no WhatsApp
                </a>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <LeadForm organizationId={org.id} />
          </div>
        </div>
      </section>}
    </>
  )
}
