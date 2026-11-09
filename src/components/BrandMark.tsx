import { cn } from '@/lib/utils'

interface BrandMarkProps {
  compact?: boolean
  className?: string
  inverse?: boolean
}

export function BrandMark({ compact = false, className, inverse = false }: BrandMarkProps) {
  return (
    <div className={cn('flex items-center gap-3', className)} aria-label="Azul Banana">
      <div
        className={cn(
          'relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full',
          inverse ? 'bg-white' : 'bg-primary',
        )}
      >
        <span
          className={cn(
            'absolute -bottom-1 -right-1 h-6 w-9 -rotate-[28deg] rounded-[50%] border-[5px] border-t-0',
            inverse ? 'border-[#ffca1a]' : 'border-[#ffca1a]',
          )}
        />
        <span
          className={cn(
            'text-[11px] font-black tracking-tighter',
            inverse ? 'text-primary' : 'text-white',
          )}
        >
          AB
        </span>
      </div>
      {!compact && (
        <div className="leading-none">
          <div
            className={cn(
              'font-display text-xl font-black uppercase tracking-[-0.05em]',
              inverse ? 'text-white' : 'text-primary',
            )}
          >
            Azul
          </div>
          <div className="font-display text-sm font-black uppercase tracking-[0.12em] text-[#e7ad00]">
            Banana
          </div>
        </div>
      )}
    </div>
  )
}
