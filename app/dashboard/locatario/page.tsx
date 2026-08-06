import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Bath,
  Bed,
  Car,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  DollarSign,
  FileText,
  MessageCircle,
  TriangleAlert,
  Wrench,
} from 'lucide-react'
import DashboardHeader from '@/components/dashboard/locatario/dashboard-header'
import BottomNav from '@/components/dashboard/locatario/bottom-nav'
import { createClient } from '@/lib/supabase/server'

function formatBRL(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

function daysUntil(iso: string | null) {
  if (!iso) return null
  const diff = new Date(iso).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default async function LocatarioDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  if (!profile || profile.role !== 'locatario') redirect('/')

  const { data: contracts } = await supabase
    .from('contracts')
    .select('*, properties(*)')
    .eq('locatario_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)

  const contract = contracts?.[0]
  const property = contract?.properties

  const { data: nextPayment } = contract
    ? await supabase
        .from('payments')
        .select('*')
        .eq('contract_id', contract.id)
        .neq('status', 'paid')
        .order('due_date', { ascending: true })
        .limit(1)
        .maybeSingle()
    : { data: null }

  const contractDaysLeft = daysUntil(contract?.end_date ?? null)
  const paymentDaysLeft = daysUntil(nextPayment?.due_date ?? null)
  const isOverdue = nextPayment ? (paymentDaysLeft ?? 0) < 0 : false
  const isDueSoon = nextPayment ? (paymentDaysLeft ?? 99) >= 0 && (paymentDaysLeft ?? 99) <= 5 : false

  const addressLine = property
    ? [property.street ?? property.address, property.neighborhood].filter(Boolean).join(' — ')
    : null

  const quickActions = [
    { label: 'Meu contrato', href: contract ? `/dashboard/locatario/contracts/${contract.id}` : '#', icon: FileText },
    { label: 'Pagamentos', href: '/dashboard/locatario/payments', icon: DollarSign },
    { label: 'Chamados', href: '/dashboard/locatario/maintenance', icon: Wrench },
    { label: 'Vistorias', href: '/dashboard/locatario/maintenance', icon: ClipboardCheck },
    { label: 'Mensagens', href: '/dashboard/locatario/documents', icon: MessageCircle },
  ]

  const notifications = (isOverdue ? 1 : 0) + (isDueSoon ? 1 : 0)

  return (
    <div className="min-h-svh bg-muted/40">
      <div className="mx-auto flex min-h-svh w-full max-w-md flex-col">
        <DashboardHeader name={profile.name ?? 'Locatário'} notifications={notifications} />

        <main className="flex flex-1 flex-col gap-5 px-5 pb-28 pt-1">
          {/* Banner do imóvel */}
          {property ? (
            <section className="relative overflow-hidden rounded-3xl bg-primary px-5 py-6 text-primary-foreground">
              <div className="absolute inset-y-0 right-0 z-0 w-1/2">
                <Image
                  src="/images/dashboard-buildings.png"
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="220px"
                  className="object-cover object-left"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
              </div>
              <div className="relative z-10">
                <span className="inline-flex rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-semibold">
                  Meu imóvel
                </span>
                <h2 className="mt-3 max-w-[70%] text-pretty text-2xl font-bold leading-tight">
                  {property.title}
                </h2>
                {addressLine ? (
                  <p className="mt-1 max-w-[70%] text-sm text-primary-foreground/85">{addressLine}</p>
                ) : null}
                <div className="relative z-10 mt-4 flex flex-wrap gap-2">
                  {property.bedrooms != null ? (
                    <Chip icon={<Bed className="size-4" />} label={`${property.bedrooms} quartos`} />
                  ) : null}
                  {property.bathrooms != null ? (
                    <Chip icon={<Bath className="size-4" />} label={`${property.bathrooms} banheiros`} />
                  ) : null}
                  {property.parking_spaces != null ? (
                    <Chip icon={<Car className="size-4" />} label={`${property.parking_spaces} vaga`} />
                  ) : null}
                </div>
              </div>
            </section>
          ) : (
            <section className="rounded-3xl border border-border bg-card px-5 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Você ainda não possui um contrato ativo. Assim que seu corretor registrar sua locação, ela
                aparecerá aqui.
              </p>
            </section>
          )}

          {/* Meu contrato */}
          {contract ? (
            <Link
              href={`/dashboard/locatario/contracts/${contract.id}`}
              className="flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-primary">
                  <FileText className="size-5" />
                </span>
                <span className="font-semibold">Meu contrato</span>
                <ChevronRight className="ml-auto size-5 text-muted-foreground" />
              </div>
              <div className="mt-4 flex items-stretch gap-4 border-t border-border pt-4">
                <div className="min-w-0 flex-1">
                  <p className="font-bold">Contrato #{contract.contract_number ?? '—'}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Início: {formatDate(contract.start_date)}</p>
                  <p className="text-sm text-muted-foreground">Término: {formatDate(contract.end_date)}</p>
                </div>
                <div className="flex flex-col justify-center border-l border-border pl-4">
                  <p className="text-sm text-muted-foreground">Faltam</p>
                  <p className="text-2xl font-bold text-primary">
                    {contractDaysLeft != null && contractDaysLeft > 0 ? `${contractDaysLeft} dias` : '—'}
                  </p>
                  <p className="text-sm text-muted-foreground">para o vencimento</p>
                </div>
              </div>
            </Link>
          ) : null}

          {/* Próximo pagamento */}
          {nextPayment ? (
            <section className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-lg font-bold">Próximo pagamento</h3>
              <div className="mt-4 flex items-stretch gap-4">
                <div className="flex flex-1 flex-col">
                  <p className="text-sm text-muted-foreground">Vencimento</p>
                  <p className="text-2xl font-bold">{formatDate(nextPayment.due_date)}</p>
                  <span
                    className={`mt-3 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
                      isOverdue ? 'bg-destructive/10 text-destructive' : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    {isOverdue ? (
                      <TriangleAlert className="size-4" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    {isOverdue ? 'Atrasado' : 'Em dia'}
                  </span>
                </div>
                <div className="flex flex-1 flex-col border-l border-border pl-4">
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatBRL(nextPayment.amount)}</p>
                  <Link
                    href="/dashboard/locatario/payments"
                    className="mt-3 flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <CreditCard className="size-4" />
                    Pagar aluguel
                  </Link>
                </div>
              </div>
            </section>
          ) : null}

          {/* Alerta de vencimento */}
          {nextPayment && (isOverdue || isDueSoon) ? (
            <Link
              href="/dashboard/locatario/payments"
              className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 transition-colors hover:bg-amber-100"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
                <TriangleAlert className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-amber-800">
                  {isOverdue
                    ? `Aluguel vencido há ${Math.abs(paymentDaysLeft ?? 0)} dias`
                    : `Aluguel vence em ${paymentDaysLeft} dias`}
                </span>
                <span className="block text-sm text-amber-700/80">
                  {formatBRL(nextPayment.amount)} • Vencimento: {formatDate(nextPayment.due_date)}
                </span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-amber-600" />
            </Link>
          ) : null}

          {/* Ações rápidas */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Ações rápidas</h3>
              <Link href="/dashboard/locatario/payments" className="text-sm font-semibold text-primary">
                Ver todas
              </Link>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-1 py-3 text-center transition-colors hover:border-primary/40 hover:bg-accent/50"
                  >
                    <Icon className="size-6 text-primary" strokeWidth={1.8} />
                    <span className="text-[11px] font-medium leading-tight text-foreground">{action.label}</span>
                  </Link>
                )
              })}
            </div>
          </section>
        </main>

        <BottomNav />
      </div>
    </div>
  )
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary-foreground/15 px-3 py-1.5 text-xs font-semibold text-primary-foreground backdrop-blur">
      {icon}
      {label}
    </span>
  )
}
