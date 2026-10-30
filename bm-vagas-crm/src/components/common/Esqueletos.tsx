import { Skeleton } from '@/components/ui/skeleton'

export function EsqueletoHoje() {
  return (
    <div aria-busy aria-label="Carregando" className="flex flex-col gap-8">
      <div>
        <Skeleton className="h-9 w-72" />
        <Skeleton className="mt-3 h-5 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[112px] rounded-[14px]" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[300px] rounded-[14px]" />
          ))}
        </div>
        <Skeleton className="h-[320px] rounded-[14px]" />
      </div>
    </div>
  )
}

export function EsqueletoFunil() {
  return (
    <div aria-busy aria-label="Carregando" className="flex gap-4 overflow-hidden">
      {Array.from({ length: 5 }).map((_, c) => (
        <div key={c} className="flex w-[290px] shrink-0 flex-col gap-3">
          <Skeleton className="h-14 rounded-[14px]" />
          {Array.from({ length: 3 - (c % 2) }).map((_, i) => (
            <Skeleton key={i} className="h-[136px] rounded-[14px]" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function EsqueletoTabela() {
  return (
    <div aria-busy aria-label="Carregando" className="surface overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-0">
          <Skeleton className="size-5 rounded-[6px]" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="ml-auto h-5 w-24" />
          <Skeleton className="hidden h-5 w-28 sm:block" />
        </div>
      ))}
    </div>
  )
}

export function EsqueletoCards({ quantos = 2 }: { quantos?: number }) {
  return (
    <div aria-busy aria-label="Carregando" className="grid gap-6 xl:grid-cols-2">
      {Array.from({ length: quantos }).map((_, i) => (
        <Skeleton key={i} className="h-[420px] rounded-[14px]" />
      ))}
    </div>
  )
}
