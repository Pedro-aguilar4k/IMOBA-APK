'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface ContractsListProps {
  corretorId: string
  limit?: number
}

interface Contract {
  id: string
  contract_number: string
  monthly_rent: number
  status: string
  profiles?: {
    name: string
  }
  properties?: {
    title: string
  }
}

export default function ContractsList({ corretorId, limit = 10 }: ContractsListProps) {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchContracts = async () => {
      const { data } = await supabase
        .from('contracts')
        .select('*, profiles:locatario_id(*), properties(*)')
        .eq('corretor_id', corretorId)
        .order('created_at', { ascending: false })
        .limit(limit)

      setContracts(data || [])
      setLoading(false)
    }

    fetchContracts()
  }, [corretorId, limit, supabase])

  if (loading) {
    return <div className="text-muted-foreground">Carregando contratos...</div>
  }

  if (contracts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Nenhum contrato cadastrado ainda.</p>
        </CardContent>
      </Card>
    )
  }

  const statusColors = {
    active: 'default',
    completed: 'secondary',
    terminated: 'destructive',
    pending: 'outline',
  }

  return (
    <div className="space-y-2">
      {contracts.map((contract) => (
        <Link key={contract.id} href={`/dashboard/corretor/contracts/${contract.id}`}>
          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {contract.properties?.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Locatário: {contract.profiles?.name}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-sm">
                    R$ {(contract.monthly_rent / 100).toLocaleString('pt-BR')}
                  </p>
                  <Badge
                    variant={statusColors[contract.status as keyof typeof statusColors] as any}
                    className="text-xs mt-1"
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
  )
}
