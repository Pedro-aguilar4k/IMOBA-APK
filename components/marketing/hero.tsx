import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-accent/40 to-transparent"
      />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pb-24 lg:pt-24">
        <div className="flex min-w-0 flex-col items-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            Plataforma de gestão para imobiliárias
          </span>

          <h1 className="mt-5 text-balance font-display text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:mt-6 sm:text-5xl lg:text-6xl">
            Toda a sua imobiliária em uma só plataforma
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Cadastre imóveis, gerencie contratos, acompanhe pagamentos e dê ao seu locatário um app completo. Tudo
            com segurança e do jeito que a sua imobiliária precisa.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/planos"
              className={cn(buttonVariants({ size: 'lg' }), 'h-13 w-full rounded-full px-7 text-base font-semibold sm:w-auto')}
            >
              Ver planos
              <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
            <Link
              href="/contato"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'h-13 w-full rounded-full px-7 text-base font-semibold sm:w-auto',
              )}
            >
              Falar com a gente
            </Link>
          </div>

          <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
            Dados protegidos e acesso por biometria ou CPF.
          </p>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 mx-auto h-full w-full max-w-md rounded-[2.5rem] bg-primary/10 blur-2xl"
          />
          <Image
            src="https://fwvccwfvjzvnmwqfiols.supabase.co/storage/v1/object/public/site-assets/marketing/hero-app.png"
            alt="Aplicativo IMOBA exibindo portfólio de imóveis, receita mensal e contratos em um smartphone"
            width={520}
            height={520}
            priority
            className="w-full max-w-xs rounded-[2rem] sm:max-w-sm lg:max-w-md"
          />
        </div>
      </div>
    </section>
  )
}
