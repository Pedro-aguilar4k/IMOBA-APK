import Link from 'next/link'
import { Check } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatBRL, type Plan } from '@/lib/plans'

interface PlanCardProps {
  plan: Plan
}

export function PlanCard({ plan }: PlanCardProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl bg-card p-6 ring-1 ring-foreground/10',
        plan.featured && 'ring-2 ring-primary lg:-my-2 lg:p-7',
      )}
    >
      {plan.featured ? (
        <span className="absolute -top-3 left-6 inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          Mais popular
        </span>
      ) : null}

      <h3 className="font-display text-xl font-bold text-foreground">{plan.name}</h3>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{plan.tagline}</p>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="font-display text-4xl font-bold tracking-tight text-foreground">
          {formatBRL(plan.priceMonthly)}
        </span>
        <span className="text-sm text-muted-foreground">/mês</span>
      </div>

      <div className="mt-4 flex flex-col gap-1 border-y border-border py-4 text-sm font-medium text-foreground">
        <span>{plan.properties}</span>
        <span>{plan.seats}</span>
      </div>

      <ul className="mt-5 flex flex-1 flex-col gap-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm leading-6 text-foreground">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={3} aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>

      <Link
        href={plan.contactOnly ? `/contato?plano=${plan.id}` : `/assinar/${plan.id}`}
        className={cn(
          buttonVariants({ variant: plan.featured ? 'default' : 'outline', size: 'lg' }),
          'mt-7 h-12 rounded-full text-base font-semibold',
        )}
      >
        {plan.cta}
      </Link>
    </div>
  )
}
