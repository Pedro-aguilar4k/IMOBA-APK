import Link from 'next/link'
import { House, Mail, MapPin } from 'lucide-react'

const FOOTER_SECTIONS = [
  {
    title: 'Produto',
    links: [
      { href: '/#recursos', label: 'Recursos' },
      { href: '/#como-funciona', label: 'Como funciona' },
      { href: '/planos', label: 'Planos' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { href: '/contato', label: 'Fale com a gente' },
      { href: '/auth/login', label: 'Área do cliente' },
      { href: '/primeiro-acesso', label: 'Primeiro acesso' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <House className="size-5" aria-hidden="true" strokeWidth={2.25} />
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-foreground">IMOBA</span>
          </Link>
          <p className="max-w-xs text-pretty text-sm leading-6 text-muted-foreground">
            A plataforma completa para imobiliárias gerenciarem imóveis, contratos, locatários e pagamentos com
            segurança.
          </p>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Mail className="size-4" aria-hidden="true" />
              contato@imoba.com.br
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="size-4" aria-hidden="true" />
              Brasil
            </span>
          </div>
        </div>

        {FOOTER_SECTIONS.map((section) => (
          <div key={section.title} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
            <ul className="flex flex-col gap-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} IMOBA. Todos os direitos reservados.</p>
          <p>CNPJ 00.000.000/0001-00</p>
        </div>
      </div>
    </footer>
  )
}
