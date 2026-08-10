import { redirect } from 'next/navigation'
import { ChangePasswordForm } from '@/components/change-password-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

export default async function ChangePasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')
  if (user.app_metadata?.must_change_password !== true) redirect('/painel')

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6 md:p-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-balance">Crie sua senha definitiva</CardTitle>
          <CardDescription className="text-pretty">
            Por segurança, substitua a senha temporária antes de acessar o painel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </main>
  )
}
