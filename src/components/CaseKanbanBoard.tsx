import { useState, type DragEvent } from 'react'
import { CalendarClock, MessageCircleWarning } from 'lucide-react'
import { CanalBadge, UrgencyBadge } from '@/components/CaseBadges'
import { caseStatusOptions, formatDate } from '@/lib/crm'
import { cn } from '@/lib/utils'
import type { AtendimentoRecord, CaseStatus } from '@/types/crm'

interface CaseKanbanBoardProps {
  atendimentos: AtendimentoRecord[]
  busyId: string
  onOpen: (atendimento: AtendimentoRecord) => void
  onMove: (atendimento: AtendimentoRecord, status: CaseStatus) => void
}

// Colunas na ordem do fluxo de atendimento: do início ao fim.
export function CaseKanbanBoard({ atendimentos, busyId, onOpen, onMove }: CaseKanbanBoardProps) {
  const [dragOver, setDragOver] = useState<CaseStatus | null>(null)
  const [draggingId, setDraggingId] = useState('')

  const handleDrop = (event: DragEvent<HTMLDivElement>, status: CaseStatus) => {
    event.preventDefault()
    const id = event.dataTransfer.getData('text/plain') || draggingId
    setDragOver(null)
    setDraggingId('')
    const item = atendimentos.find((record) => record.id === id)
    if (!item || item.status === status || busyId) return
    onMove(item, status)
  }

  return (
    <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-3 sm:-mx-5 sm:px-5">
      {caseStatusOptions.map(([status, label]) => {
        const items = atendimentos.filter((item) => item.status === status)
        const isTarget = dragOver === status
        return (
          <div
            key={status}
            onDragOver={(event) => {
              event.preventDefault()
              event.dataTransfer.dropEffect = 'move'
              if (dragOver !== status) setDragOver(status)
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null))
                setDragOver(null)
            }}
            onDrop={(event) => handleDrop(event, status)}
            aria-label={`Coluna ${label}`}
            className={cn(
              'flex w-72 shrink-0 snap-start flex-col rounded-2xl border bg-slate-50/80 transition sm:w-80',
              isTarget ? 'border-primary bg-blue-50/70 ring-2 ring-primary/30' : 'border-slate-200',
            )}
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
              <h3 className="text-sm font-extrabold text-slate-900">{label}</h3>
              <span className="rounded-full bg-[#ffca1a] px-2.5 py-0.5 text-xs font-black text-blue-950">
                {items.length}
              </span>
            </div>

            <div className="flex min-h-40 flex-1 flex-col gap-3 p-3">
              {items.length ? (
                items.map((item) => (
                  <div
                    key={item.id}
                    draggable={!busyId}
                    role="button"
                    tabIndex={0}
                    aria-label={`Abrir atendimento de ${item.cliente_nome}`}
                    onDragStart={(event) => {
                      event.dataTransfer.setData('text/plain', item.id)
                      event.dataTransfer.effectAllowed = 'move'
                      setDraggingId(item.id)
                    }}
                    onDragEnd={() => {
                      setDraggingId('')
                      setDragOver(null)
                    }}
                    onClick={() => onOpen(item)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onOpen(item)
                      }
                    }}
                    className={cn(
                      'cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-blue-200 hover:shadow-md active:cursor-grabbing',
                      draggingId === item.id && 'opacity-50',
                      busyId === item.id && 'opacity-60',
                    )}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <UrgencyBadge urgency={item.urgencia} />
                      <CanalBadge canal={item.canal} />
                      {item.reclamacao && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                          <MessageCircleWarning className="h-3 w-3" /> Reclamação
                        </span>
                      )}
                    </div>
                    <h4 className="truncate text-sm font-extrabold text-slate-900">
                      {item.cliente_nome}
                    </h4>
                    <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-slate-600">
                      {item.motivo}
                    </p>
                    <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                      <CalendarClock className="h-3.5 w-3.5" />
                      Retorno: {formatDate(item.retorno_ate, true)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="grid flex-1 place-items-center rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs font-medium text-slate-400">
                  Arraste um atendimento para cá
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
