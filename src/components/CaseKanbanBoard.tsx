import { useEffect, useState, type DragEvent } from 'react'
import { CalendarClock, MessageCircleWarning } from 'lucide-react'
import { CanalBadge, UrgencyBadge } from '@/components/CaseBadges'
import { caseStatusOptions, formatDate } from '@/lib/crm'
import { cn } from '@/lib/utils'
import type { AtendimentoRecord, CaseStatus, Urgency } from '@/types/crm'

interface CaseKanbanBoardProps {
  atendimentos: AtendimentoRecord[]
  busyId: string
  onOpen: (atendimento: AtendimentoRecord) => void
  onMove: (atendimento: AtendimentoRecord, status: CaseStatus) => void
}

// Quanto menor o número, mais urgente: fica no topo da coluna.
const urgenciaRank: Record<Urgency, number> = {
  critica: 0,
  alta: 1,
  media: 2,
  baixa: 3,
}

const horaEmMs = (valor: string) => new Date(valor).getTime()

// Janela de aviso antes do prazo de retorno: 4 horas.
const JANELA_PROXIMO_MS = 4 * 60 * 60 * 1000
// Intervalo em que a condição de prazo é recalculada (1 minuto).
const INTERVALO_RECALCULO_MS = 60 * 1000

type AlertaPrazo = 'vencido' | 'proximo' | null

// Piscando: prazo vencido ou a menos de 4h. Sem prazo ou já encerrado, não pisca.
function alertaDePrazo(item: AtendimentoRecord, agora: number): AlertaPrazo {
  if (!item.retorno_ate || item.status === 'encerrado') return null
  const prazo = horaEmMs(item.retorno_ate)
  if (Number.isNaN(prazo)) return null
  if (prazo < agora) return 'vencido'
  if (prazo - agora < JANELA_PROXIMO_MS) return 'proximo'
  return null
}

// Prioridade decrescente: urgência maior primeiro; na mesma urgência,
// o retorno mais próximo (ou já vencido) vem antes; sem prazo vai por último.
function ordenarPorPrioridade(itens: AtendimentoRecord[], agora: number) {
  return [...itens].sort((a, b) => {
    const diferencaUrgencia = urgenciaRank[a.urgencia] - urgenciaRank[b.urgencia]
    if (diferencaUrgencia !== 0) return diferencaUrgencia

    const prazoA = a.retorno_ate ? horaEmMs(a.retorno_ate) : Number.POSITIVE_INFINITY
    const prazoB = b.retorno_ate ? horaEmMs(b.retorno_ate) : Number.POSITIVE_INFINITY

    // Vencidos (prazo no passado) antes dos ainda no futuro.
    if (prazoA <= agora && prazoB > agora) return -1
    if (prazoB <= agora && prazoA > agora) return 1
    if (prazoA === prazoB) return 0
    return prazoA - prazoB
  })
}

const estaVencido = (item: AtendimentoRecord, agora: number) =>
  Boolean(item.retorno_ate) && horaEmMs(item.retorno_ate) < agora

// Colunas na ordem do fluxo de atendimento: do início ao fim.
export function CaseKanbanBoard({ atendimentos, busyId, onOpen, onMove }: CaseKanbanBoardProps) {
  const [dragOver, setDragOver] = useState<CaseStatus | null>(null)
  const [draggingId, setDraggingId] = useState('')
  const [agora, setAgora] = useState(() => Date.now())

  // Recalcula periodicamente para que cartões entrem na janela de 4h sem recarregar.
  useEffect(() => {
    const id = window.setInterval(() => setAgora(Date.now()), INTERVALO_RECALCULO_MS)
    return () => window.clearInterval(id)
  }, [])

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
        const items = ordenarPorPrioridade(
          atendimentos.filter((item) => item.status === status),
          agora,
        )
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
                items.map((item) => {
                  const vencido = estaVencido(item, agora)
                  const piscando = alertaDePrazo(item, agora)
                  return (
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
                        vencido && 'border-rose-200 bg-rose-50/40',
                        piscando === 'vencido' && 'animate-alerta-vencido',
                        piscando === 'proximo' && 'animate-alerta-proximo',
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
                      <p
                        className={cn(
                          'mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500',
                          vencido && 'font-bold text-rose-600',
                          !vencido && piscando === 'proximo' && 'font-bold text-amber-700',
                        )}
                      >
                        <CalendarClock className="h-3.5 w-3.5" />
                        Retorno: {formatDate(item.retorno_ate, true)}
                        {vencido && ' — vencido'}
                        {!vencido && piscando === 'proximo' && ' — prazo em < 4h'}
                      </p>
                    </div>
                  )
                })
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
