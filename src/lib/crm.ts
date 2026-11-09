import type { Canal, CaseStatus, ComplaintStatus, Urgency, UserRole } from '@/types/crm'

export const statusLabels: Record<CaseStatus, string> = {
  novo: 'Novo',
  em_atendimento: 'Em atendimento',
  aguardando_cliente: 'Aguardando cliente',
  aguardando_interno: 'Aguardando interno',
  resolvido: 'Resolvido',
  encerrado: 'Encerrado',
}

export const urgencyLabels: Record<Urgency, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica',
}

export const complaintStatusLabels: Record<ComplaintStatus, string> = {
  nao_encaminhada: 'Não encaminhada',
  encaminhada: 'Encaminhada',
  em_analise: 'Em análise',
  respondida: 'Respondida',
  resolvida: 'Resolvida',
}

export const roleLabels: Record<UserRole, string> = {
  atendente: 'Atendente',
  organizacao: 'Organização',
  direcao: 'Direção',
}

export const caseStatusOptions = Object.entries(statusLabels) as [CaseStatus, string][]
export const urgencyOptions = Object.entries(urgencyLabels) as [Urgency, string][]
export const canalOptions: Canal[] = ['WhatsApp', 'Instagram']
export const complaintStatusOptions = Object.entries(complaintStatusLabels) as [
  ComplaintStatus,
  string,
][]

export function formatDate(value: string, withTime = false) {
  if (!value) return 'Sem prazo'
  const date = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return 'Sem prazo'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date)
}

export function toPocketBaseDate(value: string) {
  if (!value) return ''
  return new Date(value).toISOString()
}

export function toDateTimeLocal(value: string) {
  if (!value) return ''
  const date = new Date(value.replace(' ', 'T'))
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16)
}

export function initials(name?: string) {
  if (!name) return 'AB'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function firstName(name?: string) {
  return name?.split(' ')[0] || 'Atendente'
}
