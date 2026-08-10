import { Building2, FileText, Wallet, Smartphone, Wrench, ShieldCheck } from 'lucide-react'

const FEATURES = [
  {
    icon: Building2,
    title: 'Cadastro de imóveis',
    description: 'Registre imóveis com fotos, valores, características e status de ocupação em minutos.',
  },
  {
    icon: FileText,
    title: 'Contratos digitais',
    description: 'Gere contratos numerados automaticamente e mantenha documentos centralizados.',
  },
  {
    icon: Wallet,
    title: 'Pagamentos e recibos',
    description: 'Acompanhe vencimentos, quitações e inadimplência de cada contrato.',
  },
  {
    icon: Smartphone,
    title: 'App do locatário',
    description: 'Seu cliente acessa contratos, pagamentos e manutenção direto no celular.',
  },
  {
    icon: Wrench,
    title: 'Chamados de manutenção',
    description: 'Locatários abrem chamados e a equipe acompanha o atendimento em tempo real.',
  },
  {
    icon: ShieldCheck,
    title: 'Acesso seguro',
    description: 'Login por e-mail, CPF ou biometria, com permissões por perfil e dados protegidos.',
  },
]

export function Features() {
  return (
    <section id="recursos" className="scroll-mt-20 border-t border-border/60 py-20 lg:py-28">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <span className="text-sm font-semibold text-primary">Recursos</span>
          <h2 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tudo que a sua imobiliária precisa para operar
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Do primeiro cadastro ao pagamento do aluguel, o IMOBA cobre toda a rotina da sua equipe e dos seus
            clientes.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col rounded-2xl bg-card p-6 ring-1 ring-foreground/10 transition-colors hover:ring-primary/40"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <feature.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-pretty text-sm leading-6 text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
