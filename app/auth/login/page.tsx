import { redirect } from 'next/navigation'
import AuthForm from '@/components/auth-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

interface LoginPageProps {
  searchParams: Promise<{ activated?: string; passwordChanged?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient()
  const [{ data: { user } }, params] = await Promise.all([
    supabase.auth.getUser(),
    searchParams,
  ])

  if (user) redirect('/')

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6 md:p-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Entrar</CardTitle>
          <CardDescription>Digite seu e-mail e senha para acessar sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm
            activated={params.activated === '1'}
            passwordChanged={params.passwordChanged === '1'}
          />
        </CardContent>
      </Card>
    </main>
  )
}
