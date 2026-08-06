import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LocatarioHeader from '@/components/dashboard/locatario-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ContractPageProps {
  params: Promise<{ id: string }>
}

export default async function ContractDetailPage({ params }: ContractPageProps) {
  const { id } = await params
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

  const { data: contract } = await supabase
    .from('contracts')
    .select('*, properties(*), profiles:corretor_id(*)')
    .eq('id', id)
    .eq('locatario_id', user.id)
    .single()

  if (!contract) {
    redirect('/dashboard/locatario')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <LocatarioHeader name={profile.name} email={profile.email} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Detalhes do Contrato</h1>
            <p className="text-muted-foreground">
              Contrato {contract.contract_number}
            </p>
          </div>
          <Link href="/dashboard/locatario">
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Imóvel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Título</p>
                <p className="font-semibold">{contract.properties?.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Endereço</p>
                <p className="font-semibold">
                  {contract.properties?.address}, {contract.properties?.city}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Área</p>
                  <p className="font-semibold">{contract.properties?.area_sqm} m²</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quartos</p>
                  <p className="font-semibold">{contract.properties?.bedrooms}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Contrato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="mt-1">
                  {contract.status === 'active'
                    ? 'Ativo'
                    : contract.status === 'completed'
                      ? 'Concluído'
                      : contract.status === 'terminated'
                        ? 'Rescindido'
                        : 'Pendente'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Período</p>
                <p className="font-semibold">
                  {new Date(contract.start_date).toLocaleDateString('pt-BR')} a{' '}
                  {new Date(contract.end_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aluguel Mensal</p>
                <p className="text-2xl font-bold">
                  R$ {(contract.monthly_rent / 100).toLocaleString('pt-BR')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Corretor Responsável</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{contract.profiles?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {contract.profiles?.email}
                  </p>
                  {contract.profiles?.phone && (
                    <p className="text-sm text-muted-foreground">
                      {contract.profiles?.phone}
                    </p>
                  )}
                </div>
                <Link href="/dashboard/locatario">
                  <Button variant="outline">Contatar</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {contract.document_url && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Documento do Contrato</CardTitle>
              </CardHeader>
              <CardContent>
                <a href={contract.document_url} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full">Baixar Contrato</Button>
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
