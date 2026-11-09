import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { statusLabels, urgencyLabels } from '@/lib/crm'
import type { CaseStatus, Urgency } from '@/types/crm'

const statusStyles: Record<CaseStatus, string> = {
  novo: 'border-blue-200 bg-blue-50 text-blue-700',
  em_atendimento: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  aguardando_cliente: 'border-amber-200 bg-amber-50 text-amber-700',
  aguardando_interno: 'border-violet-200 bg-violet-50 text-violet-700',
  resolvido: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  encerrado: 'border-slate-200 bg-slate-100 text-slate-600',
}

const urgencyStyles: Record<Urgency, string> = {
  baixa: 'border-slate-200 bg-white text-slate-600',
  media: 'border-amber-200 bg-amber-50 text-amber-700',
  alta: 'border-orange-200 bg-orange-50 text-orange-700',
  critica: 'border-rose-200 bg-rose-50 text-rose-700',
}

export function StatusBadge({ status }: { status: CaseStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold',
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </Badge>
  )
}

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold',
        urgencyStyles[urgency],
      )}
    >
      {urgencyLabels[urgency]}
    </Badge>
  )
}
