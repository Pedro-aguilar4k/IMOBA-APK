import { getPlan } from '@/lib/plans'

export type SubscriptionStatus =
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'unpaid'
  | 'canceled'
  | 'paused'

export type Delinquency = 'adimplente' | 'inadimplente' | 'pendente' | 'cancelado'

export interface SubscriptionRow {
  id: string
  organization_id: string | null
  owner_user_id: string | null
  plan_id: string
  status: SubscriptionStatus
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  amount_cents: number | null
  currency: string
  current_period_end: string | null
  responsible_name: string | null
  company_name: string | null
  contact_email: string | null
  contact_phone: string | null
  tax_id: string | null
  email_confirmed: boolean
  created_at: string
  updated_at: string
}

/** Classifica o status do Stripe em uma categoria de adimplência. */
export function getDelinquency(status: SubscriptionStatus): Delinquency {
  if (status === 'active' || status === 'trialing') return 'adimplente'
  if (status === 'past_due' || status === 'unpaid') return 'inadimplente'
  if (status === 'canceled' || status === 'incomplete_expired') return 'cancelado'
  return 'pendente'
}

export const DELINQUENCY_LABEL: Record<Delinquency, string> = {
  adimplente: 'Adimplente',
  inadimplente: 'Inadimplente',
  pendente: 'Pendente',
  cancelado: 'Cancelado',
}

/** Variante de Badge por categoria de adimplência. */
export function getDelinquencyBadge(
  d: Delinquency,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (d) {
    case 'adimplente':
      return 'default'
    case 'inadimplente':
      return 'destructive'
    case 'cancelado':
      return 'outline'
    default:
      return 'secondary'
  }
}

export const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  incomplete: 'Aguardando pagamento',
  incomplete_expired: 'Checkout expirado',
  trialing: 'Em teste',
  active: 'Ativa',
  past_due: 'Pagamento atrasado',
  unpaid: 'Não paga',
  canceled: 'Cancelada',
  paused: 'Pausada',
}

export function planName(planId: string): string {
  return getPlan(planId)?.name ?? planId
}

export function formatBRLCents(cents: number | null | undefined): string {
  const value = (cents ?? 0) / 100
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

/** Documento (CPF/CNPJ) formatado para exibição. */
export function formatTaxId(taxId: string | null | undefined): string {
  if (!taxId) return '—'
  const digits = taxId.replace(/\D/g, '')
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  if (digits.length === 14) {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  return taxId
}

/** Telefone brasileiro formatado. */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '—'
  const d = phone.replace(/\D/g, '')
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  return phone
}
