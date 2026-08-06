import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  CalendarClock,
  FileSignature,
  Globe,
  LayoutDashboard,
  MessageSquareText,
  Smartphone,
  Users,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LandingHeader } from '@/components/landing/landing-header'

const features = [
  {
    icon: Globe,
    title: 'Site profissional próprio',
    description:
      'Cada imobiliária ganha um site com endereço exclusivo, sua marca, vitrine de imóveis com filtros e captação de leads.',
  },
  {
    icon: Smartphone,
    title: 'App exclusivo da sua marca',
    description:
      'Um aplicativo próprio para cada imobiliária, configurado para a sua operação — não um app compartilhado.',
  },
  {
    icon: LayoutDashboard,
    title: 'Gestão de imóveis',
    description: 'Cadastre imóveis com fotos, características e valores, e mantenha a vitrine sempre atualizada.',
  },
  {
    icon: FileSignature,
    title: 'Contratos e locatários',
    description: 'Controle contratos, inquilinos e vencimentos em um só lugar, com acesso para a sua equipe.',
  },
  {
    icon: MessageSquareText,
    title: 'Leads e atendimento',
    description: 'Receba contatos do site direto no painel e acompanhe cada lead do primeiro contato ao fechamento.',
  },
  {
    icon: Wallet,
    title: 'Pagamentos e cobranças',
    description: 'Acompanhe aluguéis, próximos pagamentos e alertas de vencimento de forma organizada.',
  },
]

const steps = [
  {
    icon: Building2,
    title: 'Criamos a sua conta',
    description: 'Cadastramos a sua imobiliária e definimos o endereço do seu site em minutos.',
  },
  {
    icon: Globe,
    title: 'Personalizamos site e app',
    description: 'Você ajusta marca, cores e conteúdo. Nós geramos o app exclusivo apontando para a sua operação.',
  },
  {
    icon: Users,
    title: 'Você gerencia tudo',
    description: 'Sua equipe cadastra imóveis, contratos e locatários. Os clientes acompanham pelo app e pelo site.',
  },
]

export function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <LandingHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24">
            <div className="flex flex-col items-start gap-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
                Plataforma para imobiliárias
              </span>
              <h1 className="text-pretty text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
                Um site e um app próprios para a sua imobiliária
              </h1>
              <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
                O ImobApp dá a cada imobiliária um site profissional, um aplicativo exclusivo da sua marca e a gestão
                completa de imóveis, contratos, locatários e pagamentos — tudo conectado.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" render={<a href="#contato" />}>
                  Quero minha imobiliária
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
                <Button size="lg" variant="outline" render={<Link href="/auth/login" />}>
                  Já sou cliente
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-accent/60 blur-2xl" aria-hidden="true" />
              <Image
                src="/landing/hero-app.png"
                alt="Site e aplicativo de uma imobiliária exibidos em um notebook e um celular"
                width={1024}
                height={1024}
                priority
                className="w-full rounded-2xl border border-border shadow-sm"
              />
            </div>
          </div>
        </section>

        {/* Recursos */}
        <section id="recursos" className="border-t border-border bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Tudo o que a sua imobiliária precisa
              </h2>
              <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
                Da captação do cliente no site até a gestão do contrato — em uma plataforma só.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
                  <span className="flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <feature.icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-semibold text-card-foreground">{feature.title}</h3>
                  <p className="text-pretty leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section id="como-funciona">
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Como funciona
              </h2>
              <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
                Colocamos a sua imobiliária no ar rapidamente, sem complicação técnica.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.title} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <step.icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-sm text-muted-foreground">0{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground">{step.title}</h3>
                  <p className="text-pretty leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA / Contato */}
        <section id="contato" className="border-t border-border bg-primary text-primary-foreground">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-16 text-center md:px-6 md:py-24">
            <CalendarClock className="size-10" aria-hidden="true" />
            <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
              Pronto para ter o seu site e app?
            </h2>
            <p className="max-w-xl text-pretty text-lg leading-relaxed text-primary-foreground/85">
              Fale com a nossa equipe e comece hoje. Criamos a sua conta, o seu site e o app exclusivo da sua marca.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                render={<a href="mailto:contato@imobapp.com?subject=Quero%20minha%20imobili%C3%A1ria%20no%20ImobApp" />}
              >
                Falar com a equipe
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:px-6">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Building2 className="size-4" aria-hidden="true" />
            </span>
            <span className="font-semibold text-foreground">ImobApp</span>
          </div>
          <p>© {new Date().getFullYear()} ImobApp. Todos os direitos reservados.</p>
          <Link href="/auth/login" className="font-medium text-foreground hover:underline">
            Acessar plataforma
          </Link>
        </div>
      </footer>
    </div>
  )
}
