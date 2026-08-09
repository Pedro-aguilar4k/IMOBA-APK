import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CorretorHeader from '@/components/dashboard/corretor-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function ContractsPage() {
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

  if (!profile || profile.role !== 'corretor') {
    redirect('/painel')
  }

  // Buscar todos os contratos do corretor
  const { data: contracts } = await supabase
    .from('contracts')
    .select('*, profiles:locatario_id(*), properties(*)')
    .eq('corretor_id', user.id)
    .order('created_at', { ascending: false })

  const statusColors = {
    active: 'default',
    completed: 'secondary',
    terminated: 'destructive',
    pending: 'outline',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <CorretorHeader name={profile.name} email={profile.email} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Todos os Contratos</h1>
          <p className="text-muted-foreground">
            Gerencie seus contratos de aluguel
          </p>
        </div>

        {contracts && contracts.length > 0 ? (
          <div className="space-y-3">
            {contracts.map((contract) => (
              <Link key={contract.id} href={`/dashboard/corretor/contracts/${contract.id}`}>
                <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold">{contract.properties?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Locatário: {contract.profiles?.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {contract.properties?.address}, {contract.properties?.city}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold">
                          R$ {(contract.monthly_rent / 100).toLocaleString('pt-BR')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Contrato #{contract.contract_number}
                        </p>
                        <Badge
                          variant={
                            statusColors[contract.status as keyof typeof statusColors] as any
                          }
                          className="mt-2"
                        >
                          {contract.status === 'active'
                            ? 'Ativo'
                            : contract.status === 'completed'
                              ? 'Concluído'
                              : contract.status === 'terminated'
                                ? 'Rescindido'
                                : 'Pendente'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                Você não possui contratos cadastrados ainda.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
