const STATS = [
  { value: '+2.500', label: 'Imóveis gerenciados' },
  { value: '98%', label: 'Pagamentos em dia' },
  { value: '4,9/5', label: 'Avaliação das imobiliárias' },
  { value: '24/7', label: 'Acesso ao app' },
]

export function StatsBar() {
  return (
    <section className="border-y border-border/60 bg-card/40">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center text-center">
            <span className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {stat.value}
            </span>
            <span className="mt-1 text-sm text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
