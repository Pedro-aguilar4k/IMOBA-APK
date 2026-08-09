import { PLANS } from '@/lib/plans'
import { PlanCard } from '@/components/marketing/plan-card'

const faqs = [
  {
    q: 'Posso trocar de plano depois?',
    a: 'Sim. Você pode fazer upgrade ou downgrade a qualquer momento — o valor é ajustado de forma proporcional na próxima cobrança.',
  },
  {
    q: 'Preciso instalar alguma coisa?',
    a: 'Não. O IMOBA é 100% na nuvem. Seus corretores acessam pelo navegador e seus locatários pelo app, sem instalação complicada.',
  },
  {
    q: 'Como funciona o app para os meus locatários?',
    a: 'Cada locatário recebe um acesso de primeiro uso validado por CPF. No app ele acompanha contratos, pagamentos, documentos e abre chamados de manutenção.',
  },
  {
    q: 'Posso usar meu próprio domínio?',
    a: 'Sim. No plano Escala você configura um domínio próprio para a sua imobiliária diretamente na área do cliente.',
  },
]

export function PricingSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-balance font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Planos que crescem com a sua imobiliária
        </h1>
        <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
          Comece hoje e escale quando precisar. Todos os planos incluem o app para locatários e atualizações contínuas.
        </p>
      </div>

      <div className="mt-16 grid gap-6 lg:grid-cols-3 lg:items-center">
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      <div className="mx-auto mt-24 max-w-3xl">
        <h2 className="text-center font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Perguntas frequentes
        </h2>
        <dl className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
          {faqs.map((faq) => (
            <div key={faq.q} className="p-6">
              <dt className="font-semibold text-card-foreground">{faq.q}</dt>
              <dd className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
