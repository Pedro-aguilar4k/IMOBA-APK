import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LocatarioHeader from '@/components/dashboard/locatario-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, FileText } from 'lucide-react'

export default async function DocumentsPage() {
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

  // Buscar documentos
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const documentTypeLabels = {
    contrato: 'Contrato',
    recibo: 'Recibo',
    comprovante: 'Comprovante',
    outro: 'Outro',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <LocatarioHeader name={profile.name} email={profile.email} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Documentos</h1>
          <p className="text-muted-foreground">
            Contratos, recibos e comprovantes do seu imóvel
          </p>
        </div>

        {documents && documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <FileText className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {doc.file_name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                      </p>
                      <Badge className="mt-2 text-xs" variant="outline">
                        {
                          documentTypeLabels[
                            doc.document_type as keyof typeof documentTypeLabels
                          ]
                        }
                      </Badge>
                    </div>
                  </div>
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                Nenhum documento disponível no momento.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
