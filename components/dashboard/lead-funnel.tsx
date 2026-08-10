import { FUNNEL_STAGES, LEAD_STATUS_LABEL, type LeadStatus } from '@/lib/site-analytics'

interface LeadFunnelProps {
  counts: Record<LeadStatus, number>
}

export function LeadFunnel({ counts }: LeadFunnelProps) {
  const max = Math.max(1, ...FUNNEL_STAGES.map((stage) => counts[stage]))

  return (
    <div className="flex flex-col gap-3">
      {FUNNEL_STAGES.map((stage, index) => {
        const value = counts[stage]
        const width = Math.max(6, Math.round((value / max) * 100))
        // Opacidade decrescente para dar sensação de funil.
        const opacity = 1 - index * 0.14
        return (
          <div key={stage} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{LEAD_STATUS_LABEL[stage]}</span>
              <span className="tabular-nums text-muted-foreground">{value}</span>
            </div>
            <div className="h-8 w-full overflow-hidden rounded-md bg-muted">
              <div
                className="flex h-full items-center rounded-md bg-primary transition-all"
                style={{ width: `${width}%`, opacity }}
              />
            </div>
          </div>
        )
      })}

      {counts.perdido > 0 ? (
        <p className="mt-1 text-xs text-muted-foreground">
          {counts.perdido} {counts.perdido === 1 ? 'lead perdido' : 'leads perdidos'} no período
        </p>
      ) : null}
    </div>
  )
}
