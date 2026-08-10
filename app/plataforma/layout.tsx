import type { Metadata } from 'next'

import { requireSuperadmin } from '@/lib/auth/roles'
import { PlatformNav } from '@/components/plataforma/platform-nav'
import { PlatformUserMenu } from '@/components/plataforma/platform-user-menu'

export const metadata: Metadata = {
  title: 'Plataforma IMOBA',
  description: 'Gestão de assinaturas e clientes da plataforma IMOBA.',
  robots: { index: false },
}

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const access = await requireSuperadmin()

  return (
    <div className="min-h-svh bg-muted/30">
      <div className="mx-auto flex min-h-svh max-w-[1400px] flex-col lg:flex-row">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-64 shrink-0 border-r border-border bg-background p-4 lg:block">
          <div className="sticky top-4">
            <PlatformNav />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-border bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
            <div className="lg:hidden">
              <PlatformNav variant="bar" />
            </div>
            <p className="hidden text-sm text-muted-foreground lg:block">
              Painel da plataforma
            </p>
            <PlatformUserMenu email={access.email} />
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
