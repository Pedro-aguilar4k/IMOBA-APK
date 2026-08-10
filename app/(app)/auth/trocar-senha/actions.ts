'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type ChangePasswordState = {
  error?: string
}

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'A nova senha deve ter pelo menos 8 caracteres.')
      .regex(/[a-z]/, 'Inclua uma letra minúscula na senha.')
      .regex(/[A-Z]/, 'Inclua uma letra maiúscula na senha.')
      .regex(/[0-9]/, 'Inclua um número na senha.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

export async function changeTemporaryPassword(
  _previousState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const parsed = passwordSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Revise a nova senha.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')
  if (user.app_metadata?.must_change_password !== true) redirect('/painel')

  const { error: passwordError } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })
  if (passwordError) {
    return { error: 'Não foi possível atualizar a senha. Escolha uma senha diferente e tente novamente.' }
  }

  const admin = createAdminClient()
  const { error: metadataError } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...user.app_metadata,
      must_change_password: false,
    },
  })
  if (metadataError) {
    return { error: 'A senha foi atualizada, mas não foi possível concluir o acesso. Tente novamente.' }
  }

  await supabase.auth.signOut()
  redirect('/auth/login?passwordChanged=1')
}
