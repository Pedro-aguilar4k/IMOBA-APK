'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

interface AuthFormProps {
  activated?: boolean
  passwordChanged?: boolean
}

export default function AuthForm({ activated = false, passwordChanged = false }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError) {
        if (signInError.code === 'email_not_confirmed') {
          setError('Confirme seu e-mail antes de entrar.')
        } else if (signInError.status === 429) {
          setError('Muitas tentativas. Aguarde um momento e tente novamente.')
        } else {
          setError('E-mail ou senha inválidos.')
        }
        return
      }

      router.push('/')
      router.refresh()
    } catch {
      setError('Não foi possível entrar agora. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-5">
      {activated ? (
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted px-4 py-3 text-foreground">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p className="text-sm">Acesso ativado. Entre com o e-mail e a senha que você criou.</p>
        </div>
      ) : null}

      {passwordChanged ? (
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted px-4 py-3 text-foreground">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p className="text-sm">Senha atualizada. Entre novamente com sua senha definitiva.</p>
        </div>
      ) : null}

      {error ? (
        <div className="flex items-start gap-2 rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-destructive">
          <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p role="alert" className="text-sm">{error}</p>
        </div>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          disabled={loading}
          minLength={8}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>

      <p className="text-center text-sm leading-6 text-muted-foreground">
        Cliente convidado pelo corretor?{' '}
        <Link href="/primeiro-acesso" className="font-medium text-foreground underline underline-offset-4">
          Fazer primeiro acesso
        </Link>
      </p>
      <p className="text-center text-sm leading-6 text-muted-foreground">
        Corretores entram com as credenciais fornecidas pelo administrador.
      </p>
    </form>
  )
}
