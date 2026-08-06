import Link from 'next/link'
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { onlyDigits } from '@/lib/sites/format'

interface SiteFooterProps {
  name: string
  basePath: string
  whatsapp: string | null
  phone: string | null
  email: string | null
  address: string | null
}

export function SiteFooter({ name, basePath, whatsapp, phone, email, address }: SiteFooterProps) {
  return (
    <footer className="mt-20 border-t border-border bg-muted/40">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-foreground">{name}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Encontre o imóvel ideal com quem entende do mercado.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <p className="font-semibold text-foreground">Navegação</p>
          <Link href={`${basePath}/imoveis`} className="text-muted-foreground hover:text-foreground">
            Imóveis
          </Link>
          <Link href={`${basePath}/sobre`} className="text-muted-foreground hover:text-foreground">
            Sobre
          </Link>
          <Link href={`${basePath}/contato`} className="text-muted-foreground hover:text-foreground">
            Contato
          </Link>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <p className="font-semibold text-foreground">Contato</p>
          {whatsapp ? (
            <a
              href={`https://wa.me/55${onlyDigits(whatsapp)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="size-4" /> {whatsapp}
            </a>
          ) : null}
          {phone ? (
            <a href={`tel:${onlyDigits(phone)}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <Phone className="size-4" /> {phone}
            </a>
          ) : null}
          {email ? (
            <a href={`mailto:${email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <Mail className="size-4" /> {email}
            </a>
          ) : null}
          {address ? (
            <span className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0" /> {address}
            </span>
          ) : null}
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {name}. Todos os direitos reservados.
      </div>
    </footer>
  )
}
