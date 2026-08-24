import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LocatarioHeader from '@/components/dashboard/locatario-header'
import { DocumentActions } from '@/components/dashboard/document-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText } from 'lucide-react'

const labels: Record<string, string> = {
  contrato: 'Contrato', recibo: 'Recibo', comprovante: 'Comprovante', manutencao: 'Manutenção', outro: 'Outro',
}

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role !== 'locatario') redirect('/painel')

  const { data: documents } = await supabase.from('documents')
    .select('id, file_name, file_type, file_size, document_type, created_at, uploaded_by')
    .or(`user_id.eq.${user.id},uploaded_by.eq.${user.id}`).order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <LocatarioHeader name={profile.name} email={profile.email} />
      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8">
        <header className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-bold text-balance">Documentos</h1>
          <p className="text-muted-foreground">Seus contratos, comprovantes e anexos em um espaço privado.</p>
        </header>
        {documents?.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardHeader className="flex-row items-start gap-3">
                  <FileText className="mt-1 size-8 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-base">{doc.file_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{new Date(doc.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{labels[doc.document_type] ?? 'Documento'}</Badge>
                    {doc.file_size ? <Badge variant="secondary">{(doc.file_size / 1024 / 1024).toFixed(1)} MB</Badge> : null}
                  </div>
                  <DocumentActions id={doc.id} canDelete={doc.uploaded_by === user.id} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="py-10 text-center text-muted-foreground">Nenhum documento disponível no momento.</CardContent></Card>
        )}
      </main>
    </div>
  )
}
