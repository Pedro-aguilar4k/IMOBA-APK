import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pt-8">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Conta Criada com Sucesso!</CardTitle>
          <CardDescription className="mt-2">
            Verifique seu email para ativar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-8">
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
            <p className="font-semibold mb-1">Próximo passo:</p>
            <p>
              Acesse o email cadastrado e clique no link de confirmação para ativar sua conta.
              Após confirmar, você poderá fazer login normalmente.
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Não recebeu o email? Verifique sua pasta de spam ou tente novamente.
            </p>
            <Link href="/auth/login" className="w-full">
              <Button className="w-full">Voltar para Login</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
