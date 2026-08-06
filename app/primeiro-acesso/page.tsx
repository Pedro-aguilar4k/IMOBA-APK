import { redirect } from 'next/navigation'
import { FirstAccessForm } from '@/components/first-access-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

export default async function FirstAccessPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/')

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6 md:p-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Primeiro acesso do cliente</CardTitle>
          <CardDescription>
            Use os dados cadastrados pelo seu corretor para criar suas credenciais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FirstAccessForm />
        </CardContent>
      </Card>
    </main>
  )
}
