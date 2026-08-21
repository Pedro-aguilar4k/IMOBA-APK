'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ScanFace,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { startAuthentication, startRegistration } from '@simplewebauthn/browser'
import { createClient } from '@/lib/supabase/client'
import { resolveLoginIdentifier } from '@/app/(app)/auth/login/actions'
import { isBiometricAvailable } from '@/lib/biometric'

interface AuthFormProps {
  activated?: boolean
  passwordChanged?: boolean
  initialError?: string
}

export default function AuthForm({
  activated = false,
  passwordChanged = false,
  initialError = '',
}: AuthFormProps) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState(initialError)
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [biometricLoading, setBiometricLoading] = useState(false)
  const [biometricSupported, setBiometricSupported] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let active = true
    void isBiometricAvailable().then((available) => {
      if (!active) return
      setBiometricSupported(available)
      setBiometricEnabled(available)
    })
    return () => {
      active = false
    }
  }, [])

  const goToApp = () => {
    router.push('/painel')
    router.refresh()
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })
      const result = await response.json() as { error?: string; offerPasskey?: boolean }
      if (!response.ok) {
        setError(result.error ?? 'E-mail/CPF ou senha inválidos.')
        return
      }

      if (rememberMe && biometricSupported && result.offerPasskey) {
        try {
          const optionsResponse = await fetch('/api/auth/passkey/register/options', { method: 'POST' })
          if (optionsResponse.ok) {
            const optionsJSON = await optionsResponse.json()
            const registration = await startRegistration({ optionsJSON })
            await fetch('/api/auth/passkey/register/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(registration),
            })
          }
        } catch {
          // O cancelamento da oferta de passkey não interrompe o login normal.
        }
      }

      goToApp()
    } catch {
      setError('Não foi possível entrar agora. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleBiometricLogin = async () => {
    setError('')
    setInfo('')

    if (!biometricEnabled || !identifier.trim()) {
      setInfo('Informe seu e-mail ou CPF para entrar com a passkey cadastrada.')
      return
    }

    setBiometricLoading(true)
    try {
      const optionsResponse = await fetch('/api/auth/passkey/authenticate/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      })
      const options = await optionsResponse.json()
      if (!optionsResponse.ok) {
        setError(options.error ?? 'Passkey não disponível para este acesso.')
        return
      }

      const authentication = await startAuthentication({ optionsJSON: options })
      const verifyResponse = await fetch('/api/auth/passkey/authenticate/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authentication),
      })
      const result = await verifyResponse.json()
      if (!verifyResponse.ok) {
        setError(result.error ?? 'Não foi possível validar a passkey.')
        return
      }
      goToApp()
    } catch {
      setError('Não foi possível validar a passkey. Tente novamente.')
    } finally {
      setBiometricLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    setError('')
    setInfo('')

    const { email } = await resolveLoginIdentifier(identifier)
    if (!email) {
      setInfo('Digite seu e-mail no campo acima para receber o link de redefinição.')
      return
    }

    try {
      const supabase = createClient()
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/trocar-senha`,
      })
      setInfo('Se houver uma conta com esse acesso, enviamos um link de redefinição por e-mail.')
    } catch {
      setError('Não foi possível enviar o link agora. Tente novamente.')
    }
  }

  const busy = loading || biometricLoading

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex w-full flex-col gap-4">
      {activated ? (
        <div className="flex items-start gap-2 rounded-xl border border-border bg-muted px-4 py-3 text-foreground">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p className="text-sm leading-6">Acesso ativado. Entre com o e-mail e a senha que você criou.</p>
        </div>
      ) : null}

      {passwordChanged ? (
        <div className="flex items-start gap-2 rounded-xl border border-border bg-muted px-4 py-3 text-foreground">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p className="text-sm leading-6">Senha atualizada. Entre novamente com sua senha definitiva.</p>
        </div>
      ) : null}

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-destructive bg-destructive/10 px-4 py-3 text-destructive">
          <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p role="alert" className="text-sm leading-6">{error}</p>
        </div>
      ) : null}

      {info ? (
        <div className="flex items-start gap-2 rounded-xl border border-primary/30 bg-accent px-4 py-3 text-accent-foreground">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p className="text-sm leading-6">{info}</p>
        </div>
      ) : null}

      <div className="relative">
        <User className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <label htmlFor="identifier" className="sr-only">E-mail ou CPF</label>
        <Input
          id="identifier"
          type="text"
          inputMode="email"
          autoComplete="username"
          placeholder="E-mail ou CPF"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          required
          disabled={busy}
          className="h-14 rounded-xl pl-12 text-base"
        />
      </div>

      <div className="relative">
        <Lock className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <label htmlFor="password" className="sr-only">Senha</label>
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Senha"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          disabled={busy}
          minLength={8}
          className="h-14 rounded-xl pl-12 pr-12 text-base"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          disabled={busy}
          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
        >
          {showPassword ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setRememberMe((prev) => !prev)}
          className="flex items-center gap-2 text-sm text-foreground"
          aria-pressed={rememberMe}
        >
          <span
            className={`flex size-5 items-center justify-center rounded-md border transition-colors ${
              rememberMe ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-background'
            }`}
          >
            {rememberMe ? <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> : null}
          </span>
          Lembrar de mim
        </button>
        <button
          type="button"
          onClick={handleForgotPassword}
          disabled={busy}
          className="text-sm font-medium text-primary hover:underline"
        >
          Esqueci minha senha
        </button>
      </div>

      <Button type="submit" disabled={busy} className="h-14 w-full rounded-xl text-base font-semibold">
        {loading ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : null}
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>

      <Link
        href="/primeiro-acesso"
        className="flex h-14 w-full items-center justify-center rounded-xl border border-primary/40 bg-background text-base font-semibold text-primary transition-colors hover:bg-accent"
      >
        Primeiro acesso
      </Link>

      {biometricSupported ? (
        <>
          <div className="flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted-foreground">ou</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleBiometricLogin}
            disabled={busy}
            className="h-14 w-full rounded-xl border-primary/40 text-base font-semibold text-primary hover:bg-accent hover:text-primary"
          >
            {biometricLoading ? (
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <ScanFace className="size-5" aria-hidden="true" />
            )}
            Entrar com biometria
          </Button>
        </>
      ) : null}
    </form>
  )
}
