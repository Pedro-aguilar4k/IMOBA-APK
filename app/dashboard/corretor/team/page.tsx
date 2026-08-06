import CorretorHeader from '@/components/dashboard/corretor-header'
import { TeamMemberForm } from '@/components/dashboard/corretor/team-member-form'
import { RemoveMemberButton } from '@/components/dashboard/corretor/remove-member-button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requireOrgRole } from '@/lib/auth/tenant'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata = { title: 'Equipe' }

export default async function TeamPage() {
  // Somente o dono da imobiliária gerencia a equipe.
  const ctx = await requireOrgRole('org_admin')
  const organizationId = ctx.organizationId
  const admin = createAdminClient()

  const [{ data: myProfile }, { data: members }] = await Promise.all([
    admin.from('profiles').select('name').eq('id', ctx.userId).single(),
    admin
      .from('user_roles')
      .select('user_id, role, status, created_at')
      .eq('organization_id', organizationId)
      .in('role', ['org_admin', 'corretor'])
      .order('created_at', { ascending: true }),
  ])

  const memberIds = members?.map((m) => m.user_id) ?? []
  const { data: profiles } = memberIds.length
    ? await admin.from('profiles').select('id, name, email').in('id', memberIds)
    : { data: [] }

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]))

  return (
    <div className="min-h-svh bg-background">
      <CorretorHeader name={myProfile?.name ?? 'Dono'} email={ctx.email} isOwner />
      <main className="mx-auto grid max-w-7xl gap-6 p-4 md:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] md:p-8">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Adicionar corretor</CardTitle>
            <CardDescription>
              Crie o acesso de um corretor da sua imobiliária. Ele troca a senha no primeiro login.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TeamMemberForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipe</CardTitle>
            <CardDescription>Todos os corretores compartilham imóveis, contratos e agenda.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {members?.map((member) => {
              const profile = profileById.get(member.user_id)
              const isOwner = member.role === 'org_admin'
              const isSelf = member.user_id === ctx.userId
              return (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">
                      {profile?.name ?? 'Sem nome'}
                      {isSelf ? ' (você)' : ''}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">{profile?.email ?? '—'}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={isOwner ? 'default' : 'secondary'}>
                      {isOwner ? 'Dono' : 'Corretor'}
                    </Badge>
                    {!isOwner ? (
                      <RemoveMemberButton userId={member.user_id} name={profile?.name ?? 'corretor'} />
                    ) : null}
                  </div>
                </div>
              )
            })}

            {!members?.length ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Nenhum membro na equipe.</p>
            ) : null}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
