import { LOGO_IMAGEM } from '@/config/brand'
import { cn } from '@/lib/utils'

/**
 * Logo BM Vagas: "BM" em bloco branco sobre quadrado escuro + "VAGAS" em laranja.
 * Para usar a imagem oficial, preencha LOGO_IMAGEM em src/config/brand.ts.
 */
export function Logo({ compacto = false, className }: { compacto?: boolean; className?: string }) {
  if (LOGO_IMAGEM) {
    return <img src={LOGO_IMAGEM} alt="BM Vagas" className={cn('h-9 w-auto', className)} />
  }
  return (
    <span className={cn('inline-flex items-center gap-2 select-none', className)} aria-label="BM Vagas">
      <span className="grid size-9 place-items-center rounded-[10px] border border-[#2a2a2a] bg-[#161616] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <span className="rounded-[4px] bg-white px-[5px] py-[1px] font-display text-[13px] leading-[1.15] font-black tracking-tight text-[#0A0A0A]">
          BM
        </span>
      </span>
      {!compacto && (
        <span className="font-display text-[19px] leading-none font-black tracking-[0.06em] text-primary">VAGAS</span>
      )}
    </span>
  )
}
