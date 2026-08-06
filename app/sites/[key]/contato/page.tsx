import { notFound } from 'next/navigation'
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { getSiteByKey } from '@/lib/sites/site-data'
import { ContactForm } from '@/components/sites/contact-form'
import { buildWhatsappLink, onlyDigits } from '@/lib/sites/format'

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const site = await getSiteByKey(key)
  return { title: site ? `Contato — ${site.organization.name}` : 'Contato' }
}

export default async function SiteContactPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const site = await getSiteByKey(key)
  if (!site) notFound()

  const { whatsapp, phone, contactEmail, address } = site.settings
  const wa = buildWhatsappLink(whatsapp, `Olá! Vim pelo site da ${site.organization.name}.`)

  const channels = [
    wa ? { icon: MessageCircle, label: 'WhatsApp', value: whatsapp!, href: wa } : null,
    phone ? { icon: Phone, label: 'Telefone', value: phone, href: `tel:${onlyDigits(phone)}` } : null,
    contactEmail
      ? { icon: Mail, label: 'E-mail', value: contactEmail, href: `mailto:${contactEmail}` }
      : null,
    address ? { icon: MapPin, label: 'Endereço', value: address, href: null } : null,
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href: string | null }[]

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Fale conosco</h1>
      <p className="mt-2 text-muted-foreground">
        Envie uma mensagem ou use um dos nossos canais de atendimento.
      </p>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          {channels.length ? (
            channels.map((c) =>
              c.href ? (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg bg-[var(--brand)]/10 text-[var(--brand)]">
                    <c.icon className="size-5" />
                  </span>
                  <span>
                    <span className="block text-xs text-muted-foreground">{c.label}</span>
                    <span className="font-medium text-foreground">{c.value}</span>
                  </span>
                </a>
              ) : (
                <div
                  key={c.label}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg bg-[var(--brand)]/10 text-[var(--brand)]">
                    <c.icon className="size-5" />
                  </span>
                  <span>
                    <span className="block text-xs text-muted-foreground">{c.label}</span>
                    <span className="font-medium text-foreground">{c.value}</span>
                  </span>
                </div>
              ),
            )
          ) : (
            <p className="text-muted-foreground">Preencha o formulário e retornaremos em breve.</p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <ContactForm siteKey={key} />
        </div>
      </div>
    </div>
  )
}
