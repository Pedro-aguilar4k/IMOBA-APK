import { redirect } from 'next/navigation'
import { House } from 'lucide-react'
import AuthForm from '@/components/auth-form'
import { createClient } from '@/lib/supabase/server'

interface LoginPageProps {
  searchParams: Promise<{ activated?: string; passwordChanged?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient()
  const [
    {
      data: { user },
    },
    params,
  ] = await Promise.all([supabase.auth.getUser(), searchParams])

  if (user) redirect('/painel')

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-10">
      <div className="flex w-full max-w-sm flex-col items-center">
        <div className="flex size-20 items-center justify-center rounded-3xl bg-card shadow-lg shadow-primary/10 ring-1 ring-border">
          <House className="size-11 text-primary" aria-hidden="true" strokeWidth={2.25} />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
          Imob<span className="text-primary">App</span>
        </h1>
        <p className="mt-1 text-base text-muted-foreground">Seu imóvel na palma da mão</p>

        <AuthForm
          activated={params.activated === '1'}
          passwordChanged={params.passwordChanged === '1'}
        />
      </div>
    </main>
  )
}
