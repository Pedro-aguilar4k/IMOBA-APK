import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LocatarioHeader from '@/components/dashboard/locatario-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function PaymentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'locatario') {
    redirect('/painel')
  }

  // Buscar pagamentos
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('locatario_id', user.id)
    .order('due_date', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <LocatarioHeader name={profile.name} email={profile.email} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Meus Pagamentos</h1>
          <p className="text-muted-foreground">Histórico de pagamentos e próximas parcelas</p>
        </div>

        <div className="space-y-4">
          {payments && payments.length > 0 ? (
            payments.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        Parcela de {new Date(payment.due_date).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment.status === 'paid' && 'Pago'}
                        {payment.status === 'pending' && 'Pendente'}
                        {payment.status === 'overdue' && 'Atrasado'}
                        {payment.status === 'cancelled' && 'Cancelado'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        R$ {(payment.amount / 100).toLocaleString('pt-BR')}
                      </p>
                      <Badge
                        variant={
                          payment.status === 'paid'
                            ? 'secondary'
                            : payment.status === 'overdue'
                              ? 'destructive'
                              : 'outline'
                        }
                      >
                        {payment.status === 'paid'
                          ? 'Pago'
                          : payment.status === 'pending'
                            ? 'A vencer'
                            : payment.status === 'overdue'
                              ? 'Atrasado'
                              : 'Cancelado'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Nenhum pagamento cadastrado.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
