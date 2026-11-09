import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, CheckCircle2, Circle, ClipboardCheck, Loader2, Send, UserRound } from 'lucide-react'
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
import { StatusBadge, UrgencyBadge } from '@/components/CaseBadges'
import { useCrm } from '@/contexts/CrmContext'
import { useAuth } from '@/contexts/AuthContext'
import { completeHandoff } from '@/services/atendimentos'
import { formatDate } from '@/lib/crm'
import { useToast } from '@/hooks/use-toast'

export default function Handoff() {
  const { user } = useAuth()
  const { atendimentos, equipe, refresh } = useCrm()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const openCases = useMemo(
    () => atendimentos.filter((item) => !['resolvido', 'encerrado'].includes(item.status)),
    [atendimentos],
  )
  const initialId = params.get('case') || openCases[0]?.id || ''
  const [selectedId, setSelectedId] = useState(initialId)
  const selected = openCases.find((item) => item.id === selectedId)
  const [destination, setDestination] = useState(selected?.proxima_atendente || '')
  const [notes, setNotes] = useState(selected?.handoff_observacoes || '')
  const [pending, setPending] = useState(selected?.proxima_acao || '')
  const [saving, setSaving] = useState(false)

  const chooseCase = (id: string) => {
    const next = openCases.find((item) => item.id === id)
    setSelectedId(id)
    setDestination(next?.proxima_atendente || '')
    setNotes(next?.handoff_observacoes || '')
    setPending(next?.proxima_acao || '')
  }

  const checklist = selected
    ? [
        { label: 'Resumo registrado', ready: Boolean(selected.resumo.trim()) },
        { label: 'Próxima ação definida', ready: Boolean(selected.proxima_acao.trim()) },
        { label: 'Prazo de retorno definido', ready: Boolean(selected.retorno_ate) },
        { label: 'Próxima atendente escolhida', ready: Boolean(destination) },
      ]
    : []
  const ready = checklist.every((item) => item.ready)

  const submit = async () => {
    if (!selected || !user || !destination) return
    setSaving(true)
    try {
      await completeHandoff(selected, user.id, destination, notes, pending)
      await refresh()
      toast({
        title: 'Handoff concluído',
        description: 'O caso foi transferido com o contexto registrado.',
      })
      const remaining = openCases.find((item) => item.id !== selected.id)
      if (remaining) chooseCase(remaining.id)
      else setSelectedId('')
    } catch {
      toast({
        title: 'Não foi possível concluir',
        description: 'Revise os dados e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Passagem de turno"
        title="Handoff sem perder contexto"
        description="Revise os casos abertos, confira as pendências e entregue cada conversa para a próxima pessoa responsável."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-2xl font-black text-slate-950">{openCases.length}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Casos abertos</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-2xl font-black text-emerald-600">
            {openCases.filter((item) => item.handoff_pronto).length}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Marcados como prontos</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-2xl font-black text-orange-600">
            {openCases.filter((item) => !item.proxima_atendente).length}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Sem próxima atendente</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4">
            <h2 className="text-base font-extrabold text-slate-900">Casos para revisar</h2>
            <p className="mt-1 text-xs text-slate-500">
              Selecione um atendimento para preparar a passagem.
            </p>
          </div>
          <div className="space-y-2">
            {openCases.map((item) => {
              const responsible =
                item.expand?.responsavel || equipe.find((member) => member.id === item.responsavel)
              return (
                <button
                  key={item.id}
                  onClick={() => chooseCase(item.id)}
                  className={`w-full rounded-xl border p-4 text-left transition ${selectedId === item.id ? 'border-primary bg-blue-50 shadow-sm' : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-slate-900">
                        {item.cliente_nome}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">{item.motivo}</p>
                    </div>
                    {item.handoff_pronto ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-slate-300" />
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StatusBadge status={item.status} />
                    <UrgencyBadge urgency={item.urgencia} />
                    <span className="ml-auto text-[11px] font-semibold text-slate-500">
                      {responsible?.name}
                    </span>
                  </div>
                </button>
              )
            })}
            {!openCases.length && (
              <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
                <p className="mt-3 font-bold text-slate-800">Tudo em dia</p>
                <p className="mt-1 text-sm text-slate-500">Não há casos abertos para transferir.</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          {selected ? (
            <>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-primary">
                    Revisão do caso
                  </p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    {selected.cliente_nome}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Retorno até {formatDate(selected.retorno_ate, true)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/atendimentos/${selected.id}`)}
                >
                  Ver detalhe
                </Button>
              </div>

              <div className="mb-6 rounded-xl bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Contexto
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{selected.resumo}</p>
                <div className="mt-3 border-t border-slate-200 pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Próxima ação
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selected.proxima_acao}
                  </p>
                </div>
              </div>

              <div className="mb-6 grid gap-2 sm:grid-cols-2">
                {checklist.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-bold ${item.ready ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}
                  >
                    {item.ready ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                    {item.label}
                  </div>
                ))}
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Próxima atendente *</Label>
                  <Select value={destination} onValueChange={setDestination}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Quem assume o caso?" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipe
                        .filter((member) => member.id !== user?.id && member.role !== 'direcao')
                        .map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pending">Pendências objetivas</Label>
                  <Textarea
                    id="pending"
                    value={pending}
                    onChange={(event) => setPending(event.target.value)}
                    className="min-h-24 rounded-xl"
                    placeholder="O que ainda precisa ser feito?"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações para quem assume</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    className="min-h-24 rounded-xl"
                    placeholder="Preferências, cuidados e combinações importantes..."
                  />
                </div>
                <Button
                  className="h-12 w-full rounded-xl font-bold"
                  disabled={!ready || saving}
                  onClick={submit}
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}{' '}
                  Concluir handoff
                </Button>
                {!ready && (
                  <p className="text-center text-xs font-medium text-amber-700">
                    Complete todos os itens da revisão antes de passar o caso.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="grid min-h-[480px] place-items-center text-center">
              <div>
                <ClipboardCheck className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 font-bold text-slate-800">Selecione um caso</p>
                <p className="mt-1 text-sm text-slate-500">A revisão aparecerá aqui.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
