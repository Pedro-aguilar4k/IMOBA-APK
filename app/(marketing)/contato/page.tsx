import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Mail, MessageCircle, Clock } from 'lucide-react'
import { ContactForm } from '@/components/marketing/contact-form'

export const metadata: Metadata = {
  title: 'Fale com a gente — IMOBA',
  description:
    'Tire suas dúvidas sobre a plataforma IMOBA e descubra o plano ideal para a sua imobiliária. Nossa equipe responde rápido.',
}

const channels = [
  { icon: Mail, label: 'E-mail', value: 'contato@imoba.com.br' },
  { icon: MessageCircle, label: 'WhatsApp', value: '(11) 90000-0000' },
  { icon: Clock, label: 'Atendimento', value: 'Seg a sex, 9h às 18h' },
]

export default function ContatoPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-24">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h1 className="text-balance font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Vamos conversar sobre a sua imobiliária
          </h1>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Preencha o formulário e nossa equipe entra em contato para mostrar como o IMOBA pode organizar a sua
            operação — do imóvel ao recebimento do aluguel.
          </p>

          <ul className="mt-10 flex flex-col gap-5">
            {channels.map(({ icon: Icon, label, value }) => (
              <li key={label} className="flex items-center gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="font-medium text-foreground">{value}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Suspense fallback={<div className="rounded-2xl border border-border bg-card p-8" aria-hidden />}>
          <ContactForm />
        </Suspense>
      </div>
    </section>
  )
}
