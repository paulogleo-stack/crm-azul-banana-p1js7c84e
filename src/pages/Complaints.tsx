import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  MessageCircleWarning,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/PageHeader'
import { StatusBadge } from '@/components/CaseBadges'
import { useCrm } from '@/contexts/CrmContext'
import { useAuth } from '@/contexts/AuthContext'
import { complaintStatusLabels, complaintStatusOptions, formatDate } from '@/lib/crm'
import { updateComplaint } from '@/services/atendimentos'
import { useToast } from '@/hooks/use-toast'
import { useAgora } from '@/hooks/use-agora'
import { urgenciaEfetiva } from '@/lib/urgencia'
import type { ComplaintStatus } from '@/types/crm'

export default function Complaints() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { atendimentos, replaceAtendimento } = useCrm()
  const { toast } = useToast()
  const agora = useAgora()
  const complaints = useMemo(() => atendimentos.filter((item) => item.reclamacao), [atendimentos])
  const [filter, setFilter] = useState('todas')
  const filtered =
    filter === 'todas' ? complaints : complaints.filter((item) => item.reclamacao_status === filter)
  const [selectedId, setSelectedId] = useState(complaints[0]?.id || '')
  const selected = complaints.find((item) => item.id === selectedId)
  const [status, setStatus] = useState<ComplaintStatus>(selected?.reclamacao_status || 'em_analise')
  const [response, setResponse] = useState(selected?.direcao_resposta || '')
  const [saving, setSaving] = useState(false)

  const choose = (id: string) => {
    const item = complaints.find((complaint) => complaint.id === id)
    setSelectedId(id)
    setStatus(item?.reclamacao_status || 'em_analise')
    setResponse(item?.direcao_resposta || '')
  }

  const save = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const updated = await updateComplaint(selected.id, status, response)
      replaceAtendimento(updated)
      toast({
        title: 'Acompanhamento salvo',
        description: 'A equipe já pode consultar a orientação da Direção.',
      })
    } catch {
      toast({
        title: 'Não foi possível salvar',
        description: 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const awaiting = complaints.filter((item) =>
    ['encaminhada', 'em_analise'].includes(item.reclamacao_status),
  ).length
  const critical = complaints.filter(
    (item) => urgenciaEfetiva(item, agora) === 'critica' && item.reclamacao_status !== 'resolvida',
  ).length
  const resolved = complaints.filter((item) => item.reclamacao_status === 'resolvida').length

  return (
    <div>
      <PageHeader
        eyebrow="Regra de ouro"
        title="Reclamações e casos críticos"
        description="Toda reclamação fica visível para a Direção, com contexto, acompanhamento e orientação registrados no mesmo lugar."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          {
            label: 'Aguardando Direção',
            value: awaiting,
            icon: Clock3,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            label: 'Críticas em aberto',
            value: critical,
            icon: AlertTriangle,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
          },
          {
            label: 'Resolvidas',
            value: resolved,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div>
              <p className="text-2xl font-black text-slate-950">{stat.value}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{stat.label}</p>
            </div>
            <span className={`rounded-xl p-2.5 ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </span>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Casos encaminhados</h2>
              <p className="mt-1 text-xs text-slate-500">
                {filtered.length} reclamação{filtered.length === 1 ? '' : 'ões'}
              </p>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="h-9 w-44 rounded-xl text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos os status</SelectItem>
                {complaintStatusOptions
                  .filter(([value]) => value !== 'nao_encaminhada')
                  .map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => choose(item.id)}
                className={`w-full rounded-xl border p-4 text-left transition ${selectedId === item.id ? 'border-rose-300 bg-rose-50' : 'border-slate-200 hover:border-rose-200'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-slate-900">
                      {item.cliente_nome}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">{item.motivo}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${item.reclamacao_status === 'resolvida' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                  >
                    {complaintStatusLabels[item.reclamacao_status]}
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-600">
                  {item.reclamacao_detalhes}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <StatusBadge status={item.status} />
                  <span className="text-[11px] font-semibold text-slate-400">
                    {formatDate(item.encaminhado_em, true)}
                  </span>
                </div>
              </button>
            ))}
            {!filtered.length && (
              <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center">
                <MessageCircleWarning className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 font-bold text-slate-700">Nenhuma reclamação neste filtro</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          {selected ? (
            <>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-rose-600">
                    Análise da Direção
                  </p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    {selected.cliente_nome}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">{selected.contato}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/atendimentos/${selected.id}`)}
                >
                  Abrir caso
                </Button>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Resumo do atendimento
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{selected.resumo}</p>
                </div>
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                    Relato da reclamação
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-rose-900">
                    {selected.reclamacao_detalhes}
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-5 border-t border-slate-100 pt-6">
                <div className="space-y-2">
                  <Label>Status do acompanhamento</Label>
                  <Select
                    value={status}
                    onValueChange={(value) => setStatus(value as ComplaintStatus)}
                    disabled={user?.role !== 'direcao'}
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {complaintStatusOptions
                        .filter(([value]) => value !== 'nao_encaminhada')
                        .map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direction-response">Orientação / resposta da Direção</Label>
                  <Textarea
                    id="direction-response"
                    value={response}
                    onChange={(event) => setResponse(event.target.value)}
                    disabled={user?.role !== 'direcao'}
                    placeholder="Registre a orientação para a equipe e o retorno a ser enviado..."
                    className="min-h-36 rounded-xl"
                  />
                </div>
                {user?.role === 'direcao' ? (
                  <Button
                    className="h-11 w-full rounded-xl font-bold"
                    onClick={save}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}{' '}
                    Salvar orientação
                  </Button>
                ) : (
                  <div className="rounded-xl bg-blue-50 p-4 text-xs leading-relaxed text-blue-800">
                    <strong>Acompanhamento pela Direção:</strong> Paulo Gabriel registra aqui a
                    orientação para a equipe.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="grid min-h-[480px] place-items-center text-center">
              <div>
                <MessageCircleWarning className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 font-bold text-slate-800">Selecione uma reclamação</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
