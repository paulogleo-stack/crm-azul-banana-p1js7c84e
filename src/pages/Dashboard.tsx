import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  Plus,
  Search,
  UsersRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/PageHeader'
import { CaseKanbanBoard } from '@/components/CaseKanbanBoard'
import { DailyMessage } from '@/components/DailyMessage'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useCrm } from '@/contexts/CrmContext'
import { useAuth } from '@/contexts/AuthContext'
import { updateAtendimento } from '@/services/atendimentos'
import { toast } from '@/hooks/use-toast'
import { useAgora } from '@/hooks/use-agora'
import { urgenciaEfetiva } from '@/lib/urgencia'
import { canalOptions, caseStatusOptions, statusLabels, urgencyOptions } from '@/lib/crm'
import type { AtendimentoRecord, CaseStatus } from '@/types/crm'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { atendimentos, equipe, loading, error, replaceAtendimento } = useCrm()
  const [busyId, setBusyId] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('todos')
  const [urgency, setUrgency] = useState('todas')
  const [responsible, setResponsible] = useState('todos')
  const [canal, setCanal] = useState('todos')
  const agora = useAgora()

  const stats = useMemo(() => {
    const open = atendimentos.filter((item) => !['resolvido', 'encerrado'].includes(item.status))
    const overdue = open.filter(
      (item) => item.retorno_ate && new Date(item.retorno_ate.replace(' ', 'T')).getTime() < agora,
    )
    return {
      open: open.length,
      mine: open.filter((item) => item.responsavel === user?.id).length,
      urgent: open.filter((item) => ['alta', 'critica'].includes(urgenciaEfetiva(item, agora)))
        .length,
      overdue: overdue.length,
      resolved: atendimentos.filter((item) => item.status === 'resolvido').length,
    }
  }, [atendimentos, user?.id, agora])

  const filtered = useMemo(() => {
    const normalized = search.toLowerCase().trim()
    return atendimentos.filter((item) => {
      const matchesSearch =
        !normalized ||
        [item.cliente_nome, item.contato, item.motivo, item.resumo].some((value) =>
          value.toLowerCase().includes(normalized),
        )
      return (
        matchesSearch &&
        (status === 'todos' || item.status === status) &&
        (urgency === 'todas' || urgenciaEfetiva(item, agora) === urgency) &&
        (canal === 'todos' || item.canal === canal) &&
        (responsible === 'todos' || item.responsavel === responsible)
      )
    })
  }, [atendimentos, canal, responsible, search, status, urgency, agora])

  if (loading && atendimentos.length === 0) return <LoadingScreen />

  // Arrastar um cartão muda só o status; os demais campos não são alterados.
  const moveAtendimento = async (item: AtendimentoRecord, nextStatus: CaseStatus) => {
    setBusyId(item.id)
    try {
      const updated = await updateAtendimento(item.id, { status: nextStatus })
      replaceAtendimento(updated)
      toast({
        title: 'Status atualizado',
        description: `${item.cliente_nome} agora está em "${statusLabels[nextStatus]}".`,
      })
    } catch {
      toast({
        title: 'Não foi possível mover o atendimento',
        description: 'Tente novamente em instantes.',
        variant: 'destructive',
      })
    } finally {
      setBusyId('')
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow={user?.role === 'direcao' ? 'Visão da Direção' : 'Visão do turno'}
        title="Painel de atendimentos"
        description={
          user?.role === 'direcao'
            ? 'Acompanhe todo o fluxo da equipe e os casos que precisam da sua atenção.'
            : 'Veja o que está em andamento, priorize retornos e mantenha o contexto de cada conversa.'
        }
        action={
          <Button
            onClick={() => navigate('/atendimentos/novo')}
            className="h-11 rounded-xl px-5 font-bold shadow-md shadow-blue-600/15"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo atendimento
          </Button>
        }
      />

      <DailyMessage />

      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <section className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          {
            label: 'Casos abertos',
            value: stats.open,
            icon: ClipboardList,
            color: 'text-primary',
            bg: 'bg-blue-50',
          },
          {
            label: 'Com você',
            value: stats.mine,
            icon: UsersRound,
            color: 'text-cyan-700',
            bg: 'bg-cyan-50',
          },
          {
            label: 'Alta prioridade',
            value: stats.urgent,
            icon: AlertTriangle,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
          },
          {
            label: 'Retornos vencidos',
            value: stats.overdue,
            icon: CalendarClock,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
          },
          {
            label: 'Resolvidos',
            value: stats.resolved,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
        ].map((stat) => (
          <Card key={stat.label} className="rounded-2xl border-slate-200 shadow-sm">
            <CardContent className="flex items-start justify-between p-4 sm:p-5">
              <div>
                <p className="text-2xl font-black tracking-tight text-slate-950">{stat.value}</p>
                <p className="mt-1 text-[11px] font-semibold leading-tight text-slate-500 sm:text-xs">
                  {stat.label}
                </p>
              </div>
              <span className={`rounded-xl p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </span>
            </CardContent>
          </Card>
        ))}
      </section>

      {user?.role === 'direcao' && stats.urgent > 0 && (
        <button
          onClick={() => navigate('/reclamacoes')}
          className="mb-7 flex w-full items-center gap-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 text-left transition hover:border-amber-300 sm:p-5"
        >
          <span className="rounded-xl bg-[#ffca1a] p-2.5 text-blue-950">
            <CircleDot className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-extrabold text-slate-900">Atenção da Direção</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
              Existem {stats.urgent} casos de alta prioridade. Veja também as reclamações
              encaminhadas.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-500" />
        </button>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-5 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Todos os casos</h2>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {filtered.length} atendimento{filtered.length === 1 ? '' : 's'} encontrado
              {filtered.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:flex">
            <div className="relative sm:col-span-2 lg:w-56">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cliente, contato ou motivo"
                className="h-10 rounded-xl pl-9"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-10 rounded-xl lg:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                {caseStatusOptions.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={canal} onValueChange={setCanal}>
              <SelectTrigger className="h-10 rounded-xl lg:w-40">
                <SelectValue placeholder="Canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os canais</SelectItem>
                {canalOptions.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={urgency} onValueChange={setUrgency}>
              <SelectTrigger className="h-10 rounded-xl lg:w-36">
                <SelectValue placeholder="Urgência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Toda urgência</SelectItem>
                {urgencyOptions.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={responsible} onValueChange={setResponsible}>
              <SelectTrigger className="h-10 rounded-xl lg:w-44">
                <SelectValue placeholder="Responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Toda a equipe</SelectItem>
                {equipe.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <CaseKanbanBoard
          atendimentos={filtered}
          busyId={busyId}
          onOpen={(item) => navigate(`/atendimentos/${item.id}`)}
          onMove={moveAtendimento}
        />
        {!filtered.length && (
          <p className="mt-4 text-center text-sm font-medium text-slate-500">
            Nenhum caso encontrado com estes filtros. Ajuste os filtros para ampliar a busca.
          </p>
        )}
      </section>
    </div>
  )
}
