'use server'

import { createClient } from '@/lib/supabase/server'

export type ContactState = {
  status: 'idle' | 'success' | 'error'
  message?: string
}

const PLAN_VALUES = ['essencial', 'profissional', 'escala', 'indeciso']

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const company = String(formData.get('company') ?? '').trim()
  const planInterest = String(formData.get('plan_interest') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()

  if (name.length < 2) {
    return { status: 'error', message: 'Informe o seu nome.' }
  }
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!emailValid) {
    return { status: 'error', message: 'Informe um e-mail válido.' }
  }
  if (message.length < 5) {
    return { status: 'error', message: 'Escreva uma mensagem com um pouco mais de detalhe.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('leads').insert({
    name,
    email,
    phone: phone || null,
    company: company || null,
    plan_interest: PLAN_VALUES.includes(planInterest) ? planInterest : null,
    message,
    source: 'site',
  })

  if (error) {
    console.log('[v0] Erro ao salvar lead:', error.message)
    return { status: 'error', message: 'Não foi possível enviar agora. Tente novamente em instantes.' }
  }

  return {
    status: 'success',
    message: 'Recebemos o seu contato! Nossa equipe vai retornar em breve.',
  }
}
