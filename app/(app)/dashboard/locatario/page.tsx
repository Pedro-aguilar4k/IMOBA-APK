import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LocatarioHeader from '@/components/dashboard/locatario-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function LocatarioDashboard() {
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

  // Buscar contrato ativo
  const { data: contracts } = await supabase
    .from('contracts')
    .select('*, properties(*), profiles:corretor_id(*)')
    .eq('locatario_id', user.id)
    .eq('status', 'active')
    .limit(1)

  const contract = contracts?.[0]

  // Buscar próxima parcela
  const { data: nextPayment } = await supabase
    .from('payments')
    .select('*')
    .eq('contract_id', contract?.id)
    .eq('status', 'pending')
    .order('due_date', { ascending: true })
    .limit(1)
    .maybeSingle()

  // Buscar solicitações de manutenção abertas
  const { data: maintenanceRequests } = await supabase
    .from('maintenance_requests')
    .select('*')
    .eq('locatario_id', user.id)
    .neq('status', 'fechado')
    .order('created_at', { ascending: false })

  // Buscar documentos
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <LocatarioHeader name={profile.name} email={profile.email} />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Seu Contrato */}
        {contract ? (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle>Seu Contrato</CardTitle>
              <CardDescription>
                Imóvel: {contract.properties?.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="font-semibold">
                    {contract.properties?.address}, {contract.properties?.city}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Aluguel Mensal</p>
                  <p className="font-semibold">
                    R$ {(contract.monthly_rent / 100).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Período</p>
                  <p className="font-semibold text-sm">
                    {new Date(contract.start_date).toLocaleDateString('pt-BR')} -{' '}
                    {new Date(contract.end_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Corretor</p>
                  <p className="font-semibold text-sm">{contract.profiles?.name}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={`/dashboard/locatario/contracts/${contract.id}`}>
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </Link>
                {contract.document_url && (
                  <a href={contract.document_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      Baixar Contrato
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                Você não possui contratos ativos no momento.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Próxima Parcela */}
        {nextPayment && (
          <Card>
            <CardHeader>
              <CardTitle>Próxima Parcela</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="text-2xl font-bold">
                    R$ {(nextPayment.amount / 100).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vencimento</p>
                  <p className="text-xl font-bold">
                    {new Date(nextPayment.due_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Badge
                  variant={
                    new Date(nextPayment.due_date) < new Date()
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {new Date(nextPayment.due_date) < new Date() ? 'Atrasado' : 'A vencer'}
                </Badge>
              </div>

              <Link href="/dashboard/locatario/payments">
                <Button className="w-full">Ver Pagamentos</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Grid de ações */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/locatario/maintenance">
            <Card className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">Manutenção</CardTitle>
                <CardDescription>
                  {maintenanceRequests?.length || 0} solicitação
                  {maintenanceRequests?.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Reporte problemas no imóvel
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/locatario/documents">
            <Card className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">Documentos</CardTitle>
                <CardDescription>{documents?.length || 0} arquivo</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Contratos, recibos e comprovantes
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/locatario/profile">
            <Card className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">Meu Perfil</CardTitle>
                <CardDescription>Dados pessoais</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Atualizar informações
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Solicitações de Manutenção Recentes */}
        {maintenanceRequests && maintenanceRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Manutenção Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {maintenanceRequests.slice(0, 3).map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{request.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.description}
                      </p>
                    </div>
                    <Badge
                      variant={
                        request.urgency === 'emergencia'
                          ? 'destructive'
                          : request.urgency === 'alta'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {request.urgency}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
