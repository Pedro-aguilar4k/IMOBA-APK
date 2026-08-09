const STEPS = [
  {
    step: '01',
    title: 'Assine e crie sua imobiliária',
    description:
      'Escolha um plano e ative a conta da sua imobiliária. Em poucos minutos você já tem seu ambiente pronto.',
  },
  {
    step: '02',
    title: 'Cadastre equipe e imóveis',
    description:
      'Adicione seus corretores e comece a cadastrar imóveis, clientes e contratos com toda a estrutura organizada.',
  },
  {
    step: '03',
    title: 'Seus clientes usam o app',
    description:
      'Locatários acessam contratos, pagamentos e chamados de manutenção pelo aplicativo, com segurança.',
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="scroll-mt-20 bg-card/40 py-20 lg:py-28">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <span className="text-sm font-semibold text-primary">Como funciona</span>
          <h2 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Comece a operar em três passos
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((item) => (
            <div key={item.step} className="flex flex-col rounded-2xl bg-background p-7 ring-1 ring-foreground/10">
              <span className="font-display text-5xl font-bold text-primary/25">{item.step}</span>
              <h3 className="mt-4 text-xl font-semibold text-foreground">{item.title}</h3>
              <p className="mt-3 text-pretty text-sm leading-6 text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
