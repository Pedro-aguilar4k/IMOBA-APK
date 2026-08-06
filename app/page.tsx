import { redirect } from 'next/navigation'
import { getCurrentAccess, getDefaultRoute } from '@/lib/auth/roles'

export default async function HomePage() {
  const access = await getCurrentAccess()

  if (!access) redirect('/auth/login')
  if (access.mustChangePassword) redirect('/auth/trocar-senha')
  if (access.roles.length > 1) redirect('/role-select')

  redirect(getDefaultRoute(access.roles))
}
