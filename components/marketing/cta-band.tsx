import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function CtaBand() {
  return (
    <section className="pb-24 pt-4">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center sm:px-12 lg:py-20">
          <h2 className="mx-auto max-w-2xl text-balance font-display text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Pronto para modernizar a sua imobiliária?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-primary-foreground/80">
            Fale com a nossa equipe e descubra o plano ideal para o seu negócio.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/planos"
              className={cn(
                buttonVariants({ variant: 'secondary', size: 'lg' }),
                'h-13 rounded-full px-7 text-base font-semibold',
              )}
            >
              Ver planos
              <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
            <Link
              href="/contato"
              className="inline-flex h-13 items-center justify-center rounded-full border border-primary-foreground/30 px-7 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              Falar com vendas
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
