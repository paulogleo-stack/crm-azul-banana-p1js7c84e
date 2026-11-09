import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, MessageCircleWarning, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/contexts/AuthContext'
import { useCrm } from '@/contexts/CrmContext'
import { createAtendimento } from '@/services/atendimentos'
import { caseStatusOptions, toDateTimeLocal, urgencyOptions } from '@/lib/crm'
import { useToast } from '@/hooks/use-toast'
import type { AtendimentoInput, CaseStatus, Urgency } from '@/types/crm'

function initialForm(userId = ''): AtendimentoInput {
  return {
    data_atendimento: toDateTimeLocal(new Date().toISOString()),
    cliente_nome: '',
    contato: '',
    motivo: '',
    resumo: '',
    status: 'novo',
    proxima_acao: '',
    retorno_ate: '',
    urgencia: 'media',
    responsavel: userId,
    proxima_atendente: '',
    reclamacao: false,
    reclamacao_detalhes: '',
  }
}

export default function NewCase() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { equipe, refresh } = useCrm()
  const { toast } = useToast()
  const [form, setForm] = useState<AtendimentoInput>(() => initialForm(user?.id))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user?.id && !form.responsavel) setForm((current) => ({ ...current, responsavel: user.id }))
  }, [form.responsavel, user?.id])

  const update = <K extends keyof AtendimentoInput>(key: K, value: AtendimentoInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!user) return
    if (!form.retorno_ate) {
      toast({
        title: 'Defina o prazo de retorno',
        description: 'Todo caso aberto precisa ter um próximo retorno combinado.',
        variant: 'destructive',
      })
      return
    }
    setSaving(true)
    try {
      const created = await createAtendimento(form, user.id)
      await refresh()
      toast({
        title: 'Atendimento registrado',
        description: 'O caso já está disponível para acompanhamento da equipe.',
      })
      navigate(`/atendimentos/${created.id}`)
    } catch {
      toast({
        title: 'Não foi possível salvar',
        description: 'Revise os campos e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Registro de conversa"
        title="Novo atendimento"
        description="Registre o contexto essencial para que qualquer pessoa da equipe consiga continuar o caso sem ruídos."
        action={
          <Button variant="outline" className="rounded-xl" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-base font-extrabold text-slate-900">Identificação</h2>
              <p className="mt-1 text-xs text-slate-500">
                Quem entrou em contato e quando a conversa começou.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Data e hora *</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={form.data_atendimento}
                  onChange={(e) => update('data_atendimento', e.target.value)}
                  className="h-11 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">WhatsApp / contato *</Label>
                <Input
                  id="contact"
                  value={form.contato}
                  onChange={(e) => update('contato', e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="h-11 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome do cliente *</Label>
                <Input
                  id="name"
                  value={form.cliente_nome}
                  onChange={(e) => update('cliente_nome', e.target.value)}
                  placeholder="Nome completo"
                  className="h-11 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Motivo *</Label>
                <Input
                  id="reason"
                  value={form.motivo}
                  onChange={(e) => update('motivo', e.target.value)}
                  placeholder="Ex.: orçamento, alteração, dúvida"
                  className="h-11 rounded-xl"
                  required
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-base font-extrabold text-slate-900">Contexto e continuidade</h2>
              <p className="mt-1 text-xs text-slate-500">
                Conte o que já aconteceu e deixe o próximo passo explícito.
              </p>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="summary">Resumo da conversa *</Label>
                <Textarea
                  id="summary"
                  value={form.resumo}
                  onChange={(e) => update('resumo', e.target.value)}
                  placeholder="Registre pedidos, combinações e informações importantes..."
                  className="min-h-32 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="next">Próxima ação *</Label>
                <Textarea
                  id="next"
                  value={form.proxima_acao}
                  onChange={(e) => update('proxima_acao', e.target.value)}
                  placeholder="O que precisa ser feito agora?"
                  className="min-h-24 rounded-xl"
                  required
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status *</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value) => update('status', value as CaseStatus)}
                  >
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
                  <Label>Urgência *</Label>
                  <Select
                    value={form.urgencia}
                    onValueChange={(value) => update('urgencia', value as Urgency)}
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {urgencyOptions.map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Retorno até *</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={form.retorno_ate}
                    onChange={(e) => update('retorno_ate', e.target.value)}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Responsável atual *</Label>
                  <Select
                    value={form.responsavel}
                    onValueChange={(value) => update('responsavel', value)}
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipe.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Próxima atendente</Label>
                  <Select
                    value={form.proxima_atendente || 'sem_destino'}
                    onValueChange={(value) =>
                      update('proxima_atendente', value === 'sem_destino' ? '' : value)
                    }
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sem_destino">Definir depois</SelectItem>
                      {equipe
                        .filter((member) => member.id !== form.responsavel)
                        .map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section
            className={`rounded-2xl border p-5 shadow-sm ${form.reclamacao ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-extrabold text-slate-900">
                  <MessageCircleWarning
                    className={`h-4 w-4 ${form.reclamacao ? 'text-rose-600' : 'text-slate-400'}`}
                  />{' '}
                  É uma reclamação?
                </div>
                <p className="text-xs leading-relaxed text-slate-500">
                  Pela regra de ouro, toda reclamação deve ser acolhida e encaminhada à Direção.
                </p>
              </div>
              <Switch
                checked={form.reclamacao}
                onCheckedChange={(checked) => {
                  update('reclamacao', checked)
                  if (checked) update('urgencia', 'critica')
                }}
              />
            </div>
            {form.reclamacao && (
              <div className="mt-4 space-y-2">
                <Label htmlFor="complaint">Detalhes da reclamação *</Label>
                <Textarea
                  id="complaint"
                  value={form.reclamacao_detalhes}
                  onChange={(e) => update('reclamacao_detalhes', e.target.value)}
                  placeholder="O que aconteceu e o que a cliente espera?"
                  className="min-h-28 rounded-xl bg-white"
                  required
                />
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-primary p-5 text-white shadow-lg shadow-blue-950/10">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-blue-200">
              Antes de salvar
            </p>
            <ul className="mt-4 space-y-3 text-sm text-blue-50">
              {[
                'Identifique cliente e contato',
                'Resuma sem perder o combinado',
                'Defina ação e prazo de retorno',
                'Indique quem continua o caso',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#ffca1a]" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <Button
            type="submit"
            className="h-12 w-full rounded-xl font-bold shadow-md shadow-blue-600/15"
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}{' '}
            Salvar atendimento
          </Button>
        </aside>
      </form>
    </div>
  )
}
