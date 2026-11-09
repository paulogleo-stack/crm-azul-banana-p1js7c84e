import { ArrowRight, CalendarClock, MessageCircleWarning, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CanalBadge, StatusBadge, UrgencyBadge } from '@/components/CaseBadges'
import { formatDate } from '@/lib/crm'
import { urgenciaEfetiva } from '@/lib/urgencia'
import { useAgora } from '@/hooks/use-agora'
import type { AtendimentoRecord, UserRecord } from '@/types/crm'

interface CaseCardProps {
  atendimento: AtendimentoRecord
  users?: UserRecord[]
  onOpen: () => void
  compact?: boolean
}

export function CaseCard({ atendimento, users = [], onOpen, compact = false }: CaseCardProps) {
  const agora = useAgora()
  const responsible =
    atendimento.expand?.responsavel ?? users.find((user) => user.id === atendimento.responsavel)
  const deadline = atendimento.retorno_ate
    ? new Date(atendimento.retorno_ate.replace(' ', 'T'))
    : null
  const overdue =
    deadline &&
    !['resolvido', 'encerrado'].includes(atendimento.status) &&
    deadline.getTime() < Date.now()

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={atendimento.status} />
            <UrgencyBadge urgency={urgenciaEfetiva(atendimento, agora)} />
            <CanalBadge canal={atendimento.canal} />
            {atendimento.reclamacao && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">
                <MessageCircleWarning className="h-3 w-3" /> Reclamação
              </span>
            )}
          </div>
          <h3 className="truncate text-base font-extrabold text-slate-900">
            {atendimento.cliente_nome}
          </h3>
          <p className="mt-1 truncate text-sm font-medium text-slate-600">{atendimento.motivo}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpen}
          className="shrink-0 rounded-full text-slate-400 group-hover:bg-blue-50 group-hover:text-primary"
          aria-label={`Abrir atendimento de ${atendimento.cliente_nome}`}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {!compact && (
        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {atendimento.resumo}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <UserRound className="h-3.5 w-3.5 text-slate-400" />
          {responsible?.name || 'Sem responsável'}
        </span>
        <span
          className={
            overdue
              ? 'inline-flex items-center gap-1.5 font-bold text-rose-600'
              : 'inline-flex items-center gap-1.5'
          }
        >
          <CalendarClock className="h-3.5 w-3.5" />
          {overdue ? 'Atrasado: ' : 'Retorno: '}
          {formatDate(atendimento.retorno_ate, true)}
        </span>
      </div>
    </article>
  )
}
