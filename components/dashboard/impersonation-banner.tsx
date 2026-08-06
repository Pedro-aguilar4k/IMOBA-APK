import { Eye } from 'lucide-react'
import { stopImpersonation } from '@/app/admin/impersonation/actions'

export function ImpersonationBanner({ organizationName }: { organizationName: string }) {
  return (
    <div className="sticky top-0 z-50 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-amber-950">
      <span className="inline-flex items-center gap-2">
        <Eye className="size-4" />
        Modo visualização — operando como <strong>{organizationName}</strong>
      </span>
      <form action={stopImpersonation}>
        <button
          type="submit"
          className="rounded-md bg-amber-950/10 px-3 py-1 font-semibold underline-offset-2 transition-colors hover:bg-amber-950/20"
        >
          Sair do modo visualização
        </button>
      </form>
    </div>
  )
}
