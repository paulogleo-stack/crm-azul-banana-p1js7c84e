import type { RecordModel } from 'pocketbase'

export type UserRole = 'atendente' | 'organizacao' | 'direcao'
export type CaseStatus =
  | 'novo'
  | 'em_atendimento'
  | 'aguardando_cliente'
  | 'aguardando_interno'
  | 'resolvido'
  | 'encerrado'
export type Urgency = 'baixa' | 'media' | 'alta' | 'critica'
export type Canal = 'WhatsApp' | 'Instagram'
export type ComplaintStatus =
  | 'nao_encaminhada'
  | 'encaminhada'
  | 'em_analise'
  | 'respondida'
  | 'resolvida'

export interface UserRecord extends RecordModel {
  name: string
  email: string
  role: UserRole
}

export interface AtendimentoRecord extends RecordModel {
  data_atendimento: string
  cliente_nome: string
  contato: string
  motivo: string
  resumo: string
  status: CaseStatus
  proxima_acao: string
  retorno_ate: string
  urgencia: Urgency
  canal: Canal
  responsavel: string
  proxima_atendente: string
  criado_por: string
  reclamacao: boolean
  reclamacao_status: ComplaintStatus
  reclamacao_detalhes: string
  direcao_resposta: string
  encaminhado_em: string
  handoff_pronto: boolean
  handoff_observacoes: string
  expand?: {
    responsavel?: UserRecord
    proxima_atendente?: UserRecord
    criado_por?: UserRecord
  }
}

export interface EscalaRecord extends RecordModel {
  dia_semana: string
  ordem: number
  turno: 'manha' | 'tarde' | 'noite'
  horario: string
  responsavel: string
  cobertura: boolean
  observacao: string
  expand?: { responsavel?: UserRecord }
}

export interface ModeloRecord extends RecordModel {
  categoria: 'abertura' | 'verificacao' | 'confirmacao' | 'encerramento' | 'reclamacao'
  titulo: string
  conteudo: string
  ordem: number
}

export interface HandoffRecord extends RecordModel {
  atendimento: string
  origem: string
  destino: string
  observacoes: string
  pendencias: string
  concluido: boolean
  realizado_em: string
}

export interface AtendimentoInput {
  data_atendimento: string
  cliente_nome: string
  contato: string
  motivo: string
  resumo: string
  status: CaseStatus
  proxima_acao: string
  retorno_ate: string
  urgencia: Urgency
  canal: Canal
  responsavel: string
  proxima_atendente?: string
  reclamacao: boolean
  reclamacao_detalhes?: string
}
