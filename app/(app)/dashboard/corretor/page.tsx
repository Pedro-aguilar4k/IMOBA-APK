import Image from 'next/image'
import Link from 'next/link'
import {
  BarChart3,
  ChevronRight,
  ClipboardList,
  DollarSign,
  Headphones,
  Home,
  HousePlus,
  Info,
  KeyRound,
  ReceiptText,
  TriangleAlert,
} from 'lucide-react'
import DashboardHeader from '@/components/dashboard/corretor/dashboard-header'
import BottomNav from '@/components/dashboard/corretor/bottom-nav'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/roles'
import { getPropertyList } from '@/lib/properties-server'

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name
}

function formatBRL(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

function formatCompactBRL(cents: number) {
  const value = cents / 100
  if (value >= 1000) {
    return `R$ ${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value / 1000)}k`
  }
  return formatBRL(cents)
}

export default async function CorretorDashboard() {
  const access = await requireRole('corretor')
  const organizationId = access.assignment.organization_id ?? ''
  const supabase = await createClient()

  const [{ data: profile }, properties, { data: contracts }] = await Promise.all([
    supabase.from('profiles').select('name, email').eq('id', access.userId).single(),
    getPropertyList(supabase, access.userId, organizationId),
    supabase
      .from('contracts')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('corretor_id', access.userId),
  ])

  const contractIds = (contracts ?? []).map((contract) => contract.id)
  const { data: payments } = contractIds.length
    ? await supabase.from('payments').select('*').in('contract_id', contractIds)
    : { data: [] }

  const now = new Date()
  const isThisMonth = (iso: string | null) => {
    if (!iso) return false
    const date = new Date(iso)
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
  }

  const totalProperties = properties.length
  const activeContracts = contracts?.filter((contract) => contract.status === 'active').length ?? 0
  const overduePayments = payments?.filter((payment) => payment.status === 'overdue') ?? []
  const toReceive = (payments ?? [])
    .filter((payment) => payment.status !== 'paid' && isThisMonth(payment.due_date))
    .reduce((sum, payment) => sum + (payment.amount || 0), 0)
  const revenue = (payments ?? [])
    .filter((payment) => payment.status === 'paid' && isThisMonth(payment.paid_at))
    .reduce((sum, payment) => sum + (payment.amount || 0), 0)
  const occupancy = totalProperties ? Math.round((activeContracts / totalProperties) * 100) : 0

  const name = profile?.name ?? 'Corretor'
  const email = profile?.email ?? access.email

  const quickActions = [
    { label: 'Novo imóvel', href: '/dashboard/corretor/properties/new', icon: HousePlus },
    { label: 'Vistoria', href: '/dashboard/corretor/properties', icon: ClipboardList },
    { label: 'Chamados', href: '/dashboard/corretor/clients', icon: Headphones },
    { label: 'Cobranças', href: '/dashboard/corretor/contracts', icon: ReceiptText },
  ]

  return (
    <div className="min-h-svh bg-muted/40">
      <div className="mx-auto flex min-h-svh w-full max-w-md flex-col">
        <DashboardHeader name={name} email={email} notifications={overduePayments.length} />

        <main className="flex flex-1 flex-col gap-5 px-4 pb-28 pt-1 min-[380px]:px-5">
          {/* Banner de boas-vindas */}
          <section className="relative overflow-hidden rounded-3xl bg-primary px-5 py-6 text-primary-foreground">
            <div className="absolute inset-y-0 right-0 z-0 w-1/2">
              <Image
                src="https://fwvccwfvjzvnmwqfiols.supabase.co/storage/v1/object/public/site-assets/images/dashboard-buildings.png"
                alt=""
                aria-hidden="true"
                fill
                sizes="220px"
                className="object-cover object-left"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/40 to-transparent" />
            </div>
            <div className="relative z-10 max-w-[62%]">
              <h2 className="text-pretty text-2xl font-bold leading-tight">Olá, {firstName(name)} 👋</h2>
              <p className="mt-1 text-sm text-primary-foreground/85">
                {activeContracts > 0
                  ? `Você tem ${activeContracts} ${activeContracts === 1 ? 'imóvel alugado' : 'imóveis alugados'}`
                  : 'Comece cadastrando seu primeiro imóvel'}
              </p>
            </div>
          </section>

          {/* Cartões de estatística */}
          <section className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 min-[360px]:gap-4" aria-label="Resumo da operação">
            <StatCard
              icon={<Home className="size-6" />}
              iconClass="bg-accent text-primary"
              value={String(totalProperties)}
              valueClass="text-primary"
              title="Imóveis"
              subtitle="Cadastrados"
            />
            <StatCard
              icon={<KeyRound className="size-6" />}
              iconClass="bg-emerald-50 text-emerald-600"
              value={String(activeContracts)}
              valueClass="text-emerald-600"
              title="Alugados"
              subtitle="Ativos"
            />
            <StatCard
              icon={<DollarSign className="size-6" />}
              iconClass="bg-emerald-50 text-emerald-600"
              value={formatCompactBRL(toReceive)}
              valueClass="text-emerald-600"
              title="A receber"
              subtitle="Este mês"
            />
            <StatCard
              icon={<BarChart3 className="size-6" />}
              iconClass="bg-violet-50 text-violet-600"
              value={formatCompactBRL(revenue)}
              valueClass="text-foreground"
              title="Faturamento"
              subtitle="Este mês"
            />
          </section>

          {/* Alerta */}
          {overduePayments.length > 0 ? (
            <Link
              href="/dashboard/corretor/contracts"
              className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 transition-colors hover:bg-amber-100"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
                <TriangleAlert className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-amber-800">
                  {overduePayments.length}{' '}
                  {overduePayments.length === 1 ? 'pagamento atrasado' : 'pagamentos atrasados'}
                </span>
                <span className="block text-sm text-amber-700/80">Toque para acompanhar as cobranças</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-amber-600" />
            </Link>
          ) : null}

          {/* Ações rápidas */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Ações rápidas</h3>
              <Link href="/dashboard/corretor/properties" className="text-sm font-semibold text-primary">
                Ver todas
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 min-[380px]:grid-cols-4">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-1 py-4 text-center transition-colors hover:border-primary/40 hover:bg-accent/50"
                  >
                    <Icon className="size-7 text-primary" strokeWidth={1.8} />
                    <span className="text-xs font-medium leading-tight text-foreground">{action.label}</span>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* Visão geral */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Visão geral</h3>
              <span className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground">
                Este mês
              </span>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    Taxa de ocupação
                    <Info className="size-4" />
                  </p>
                  <p className="mt-1 text-3xl font-bold text-primary">{occupancy}%</p>
                  <div className="mt-3 h-2.5 w-40 max-w-full overflow-hidden rounded-full bg-accent">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${occupancy}%` }} />
                  </div>
                </div>
                <div
                  className="relative flex size-24 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(var(--primary) ${occupancy * 3.6}deg, var(--accent) 0deg)`,
                  }}
                  role="img"
                  aria-label={`Ocupação de ${occupancy}%`}
                >
                  <div className="flex size-16 items-center justify-center rounded-full bg-card">
                    <span className="text-base font-bold text-primary">{occupancy}%</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <BottomNav />
      </div>
    </div>
  )
}

function StatCard({
  icon,
  iconClass,
  value,
  valueClass,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  iconClass: string
  value: string
  valueClass: string
  title: string
  subtitle: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-card p-4 min-[360px]:p-3 min-[400px]:p-4">
      <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className={`truncate text-xl font-bold leading-none min-[400px]:text-2xl ${valueClass}`}>{value}</p>
        <p className="mt-1 text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )
}
