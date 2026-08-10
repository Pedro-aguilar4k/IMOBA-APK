import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

interface StatCardProps {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  tone?: 'default' | 'positive' | 'negative' | 'muted'
}

const TONE: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'bg-primary/10 text-primary',
  positive: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  negative: 'bg-destructive/10 text-destructive',
  muted: 'bg-muted text-muted-foreground',
}

export function StatCard({ label, value, hint, icon: Icon, tone = 'default' }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={cn('flex size-9 items-center justify-center rounded-lg', TONE[tone])}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <div>
        <p className="font-display text-2xl font-bold tracking-tight">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </Card>
  )
}
