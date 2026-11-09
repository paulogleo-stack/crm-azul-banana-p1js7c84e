import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  ExternalLink,
  Loader2,
  MessageCircleWarning,
  Phone,
  Save,
  Send,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PageHeader } from '@/components/PageHeader'
import { CanalBadge, StatusBadge, UrgencyBadge } from '@/components/CaseBadges'
import { useCrm } from '@/contexts/CrmContext'
import { useAuth } from '@/contexts/AuthContext'
import { caseStatusOptions, complaintStatusLabels, formatDate, toDateTimeLocal } from '@/lib/crm'
import { forwardComplaint, getAtendimento, updateAtendimento } from '@/services/atendimentos'
import { useToast } from '@/hooks/use-toast'
import type { AtendimentoRecord, CaseStatus } from '@/types/crm'

export default function CaseDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { atendimentos, equipe, replaceAtendimento, refresh } = useCrm()
  const { toast } = useToast()
  const [record, setRecord] = useState<AtendimentoRecord | null>(
    () => atendimentos.find((item) => item.id === id) || null,
  )
  const [loading, setLoading] = useState(!record)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<CaseStatus>(record?.status || 'novo')
  const [nextAction, setNextAction] = useState(record?.proxima_acao || '')
  const [deadline, setDeadline] = useState(toDateTimeLocal(record?.retorno_ate || ''))
  const [complaintOpen, setComplaintOpen] = useState(false)
  const [complaintDetails, setComplaintDetails] = useState(record?.reclamacao_detalhes || '')

  useEffect(() => {
    const cached = atendimentos.find((item) => item.id === id)
    if (cached) {
      setRecord(cached)
      setLoading(false)
      return
    }
    void getAtendimento(id)
      .then(setRecord)
      .catch(() => setRecord(null))
      .finally(() => setLoading(false))
  }, [atendimentos, id])

  useEffect(() => {
    if (!record) return
    setStatus(record.status)
    setNextAction(record.proxima_acao)
    setDeadline(toDateTimeLocal(record.retorno_ate))
    setComplaintDetails(record.reclamacao_detalhes)
  }, [record])

  const responsible = useMemo(
    () => record?.expand?.responsavel || equipe.find((member) => member.id === record?.responsavel),
    [equipe, record],
  )
  const nextResponsible = useMemo(
    () =>
      record?.expand?.proxima_atendente ||
      equipe.find((member) => member.id === record?.proxima_atendente),
    [equipe, record],
  )

  const persist = async (data: Record<string, unknown>, successMessage: string) => {
    if (!record) return
    setSaving(true)
    try {
      const updated = await updateAtendimento(record.id, data)
      setRecord(updated)
      replaceAtendimento(updated)
      toast({ title: successMessage, description: 'A equipe já pode ver a atualização.' })
    } catch {
      toast({
        title: 'Não foi possível atualizar',
        description: 'Tente novamente em instantes.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const saveFollowUp = () =>
    persist(
      {
        status,
        proxima_acao: nextAction,
        retorno_ate: deadline ? new Date(deadline).toISOString() : '',
      },
      'Acompanhamento atualizado',
    )

  const submitComplaint = async () => {
    if (!record || !complaintDetails.trim()) return
    const direction = equipe.find((member) => member.role === 'direcao')
    setSaving(true)
    try {
      const updated = await forwardComplaint(record.id, complaintDetails.trim(), direction?.id)
      setRecord(updated)
      replaceAtendimento(updated)
      setComplaintOpen(false)
      toast({
        title: 'Reclamação encaminhada',
        description: 'Paulo Gabriel e a Direção já podem acompanhar este caso.',
      })
      await refresh()
    } catch {
      toast({
        title: 'Falha ao encaminhar',
        description: 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    )
  if (!record)
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <p className="font-bold text-slate-800">Atendimento não encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/painel')}>
          Voltar ao painel
        </Button>
      </div>
    )

  const whatsapp = record.contato.replace(/\D/g, '')
  const instagramHandle = record.contato.trim().replace(/^@/, '')

  return (
    <div>
      <PageHeader
        eyebrow={`Caso #${record.id.slice(0, 6).toUpperCase()}`}
        title={record.cliente_nome}
        description={record.motivo}
        action={
          <Button variant="outline" className="rounded-xl" onClick={() => navigate('/painel')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Painel
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <StatusBadge status={record.status} />
        <UrgencyBadge urgency={record.urgencia} />
        <CanalBadge canal={record.canal} />
        {record.reclamacao && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700">
            <MessageCircleWarning className="h-3.5 w-3.5" />{' '}
            {complaintStatusLabels[record.reclamacao_status]}
          </span>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Contexto do atendimento</h2>
                <p className="mt-1 text-xs text-slate-500">O que foi registrado na conversa.</p>
              </div>
              <span className="text-xs font-medium text-slate-400">
                Atualizado {formatDate(record.updated, true)}
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
              {record.resumo}
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-100 p-4">
                <Phone className="mb-2 h-4 w-4 text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Contato
                </p>
                <p className="mt-1 text-sm font-bold text-slate-800">{record.contato}</p>
              </div>
              <div className="rounded-xl border border-slate-100 p-4">
                <UserRound className="mb-2 h-4 w-4 text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Responsável
                </p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {responsible?.name || 'Não definido'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 p-4">
                <Clock3 className="mb-2 h-4 w-4 text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Início
                </p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {formatDate(record.data_atendimento, true)}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-base font-extrabold text-slate-900">Próximo passo</h2>
              <p className="mt-1 text-xs text-slate-500">
                Atualize a situação e deixe a continuidade clara.
              </p>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="next-action">Próxima ação</Label>
                <Textarea
                  id="next-action"
                  value={nextAction}
                  onChange={(event) => setNextAction(event.target.value)}
                  className="min-h-28 rounded-xl"
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as CaseStatus)}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {caseStatusOptions.map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Retorno até</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={deadline}
                    onChange={(event) => setDeadline(event.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    setStatus('resolvido')
                    void persist({ status: 'resolvido' }, 'Caso marcado como resolvido')
                  }}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Marcar resolvido
                </Button>
                <Button
                  className="rounded-xl font-bold"
                  disabled={saving || !nextAction.trim()}
                  onClick={saveFollowUp}
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}{' '}
                  Salvar atualização
                </Button>
              </div>
            </div>
          </section>

          {record.reclamacao && (
            <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="rounded-xl bg-white p-2 text-rose-600">
                  <MessageCircleWarning className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-extrabold text-rose-950">Reclamação encaminhada à Direção</h2>
                  <p className="mt-1 text-sm leading-relaxed text-rose-800">
                    {record.reclamacao_detalhes}
                  </p>
                  {record.direcao_resposta && (
                    <div className="mt-4 rounded-xl bg-white p-4 text-sm text-slate-700">
                      <strong>Retorno da Direção:</strong>
                      <br />
                      {record.direcao_resposta}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-extrabold text-slate-900">Ações rápidas</h2>
            <div className="mt-4 space-y-2">
              {record.canal === 'Instagram' ? (
                <Button variant="outline" className="h-11 w-full justify-start rounded-xl" asChild>
                  <a
                    href={`https://www.instagram.com/${instagramHandle}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4 text-pink-600" /> Abrir perfil no
                    Instagram
                  </a>
                </Button>
              ) : (
                <Button variant="outline" className="h-11 w-full justify-start rounded-xl" asChild>
                  <a href={`https://wa.me/55${whatsapp}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4 text-emerald-600" /> Abrir conversa no
                    WhatsApp
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                className="h-11 w-full justify-start rounded-xl"
                onClick={() => navigate(`/handoff?case=${record.id}`)}
              >
                <ClipboardCheck className="mr-2 h-4 w-4 text-primary" /> Preparar handoff
              </Button>
              {!record.reclamacao && (
                <Button
                  variant="outline"
                  className="h-11 w-full justify-start rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                  onClick={() => setComplaintOpen(true)}
                >
                  <MessageCircleWarning className="mr-2 h-4 w-4" /> Encaminhar reclamação
                </Button>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-extrabold text-slate-900">Continuidade do caso</h2>
            <div className="mt-4 space-y-4">
              <div className="flex gap-3">
                <CalendarClock className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Retorno combinado</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatDate(record.retorno_ate, true)}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Send className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Próxima atendente</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {nextResponsible?.name || 'Ainda não definida'}
                  </p>
                </div>
              </div>
              {record.handoff_observacoes && (
                <div className="rounded-xl bg-blue-50 p-3 text-xs leading-relaxed text-blue-800">
                  {record.handoff_observacoes}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl bg-primary p-5 text-white shadow-lg shadow-blue-950/10">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-blue-200">
              Regra de ouro
            </p>
            <p className="mt-3 text-sm leading-relaxed text-blue-50">
              Reclamação não espera troca de turno: acolha, registre e encaminhe à Direção.
            </p>
          </section>
        </aside>
      </div>

      <Dialog open={complaintOpen} onOpenChange={setComplaintOpen}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Encaminhar à Direção</DialogTitle>
            <DialogDescription>
              Registre o ocorrido com objetividade. O caso será marcado como crítico e direcionado a
              Paulo Gabriel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-3">
            <Label htmlFor="details">Detalhes da reclamação</Label>
            <Textarea
              id="details"
              value={complaintDetails}
              onChange={(event) => setComplaintDetails(event.target.value)}
              placeholder="O que aconteceu? O que a cliente espera?"
              className="min-h-32 rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComplaintOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={submitComplaint}
              disabled={saving || !complaintDetails.trim()}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Encaminhar agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
