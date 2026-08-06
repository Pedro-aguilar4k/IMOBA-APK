import { redirect } from 'next/navigation'
import { House } from 'lucide-react'
import { FirstAccessForm } from '@/components/first-access-form'
import { createClient } from '@/lib/supabase/server'

export default async function FirstAccessPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/')

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-10">
      <div className="flex w-full max-w-sm flex-col items-center">
        <div className="flex size-20 items-center justify-center rounded-3xl bg-card shadow-lg shadow-primary/10 ring-1 ring-border">
          <House className="size-11 text-primary" aria-hidden="true" strokeWidth={2.25} />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
          Imob<span className="text-primary">App</span>
        </h1>
        <p className="mt-1 text-center text-base text-balance text-muted-foreground">
          Ative seu acesso com os dados cadastrados pelo corretor
        </p>

        <FirstAccessForm />
      </div>
    </main>
  )
}
