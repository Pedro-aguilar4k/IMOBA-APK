import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LocatarioHeader from '@/components/dashboard/locatario-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function MaintenancePage() {
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
    redirect('/')
  }

  // Buscar solicitações de manutenção
  const { data: requests } = await supabase
    .from('maintenance_requests')
    .select('*')
    .eq('locatario_id', user.id)
    .order('created_at', { ascending: false })

  const urgencyColors = {
    baixa: 'secondary',
    normal: 'outline',
    alta: 'destructive',
    emergencia: 'destructive',
  }

  const statusLabels = {
    aberto: 'Aberto',
    em_atendimento: 'Em Atendimento',
    resolvido: 'Resolvido',
    fechado: 'Fechado',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <LocatarioHeader name={profile.name} email={profile.email} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Solicitações de Manutenção</h1>
            <p className="text-muted-foreground">
              Reporte problemas no imóvel
            </p>
          </div>
          <Link href="/dashboard/locatario/maintenance/new">
            <Button>+ Nova Solicitação</Button>
          </Link>
        </div>

        <div className="space-y-4">
          {requests && requests.length > 0 ? (
            requests.map((request) => (
              <Card key={request.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold">{request.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {request.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Criada em {new Date(request.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        variant={
                          urgencyColors[request.urgency as keyof typeof urgencyColors] as any
                        }
                      >
                        {request.urgency}
                      </Badge>
                      <Badge variant="outline">
                        {statusLabels[request.status as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">
                  Você não possui solicitações de manutenção.
                </p>
                <Link href="/dashboard/locatario/maintenance/new">
                  <Button>Criar Primeira Solicitação</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
