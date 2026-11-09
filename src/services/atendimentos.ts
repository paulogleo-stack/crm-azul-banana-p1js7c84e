import pb from '@/lib/pocketbase/client'
import type {
  AtendimentoInput,
  AtendimentoRecord,
  ComplaintStatus,
  HandoffRecord,
} from '@/types/crm'
import { toPocketBaseDate } from '@/lib/crm'

const expand = 'responsavel,proxima_atendente,criado_por'

export async function listAtendimentos() {
  return (await pb.collection('atendimentos').getFullList({
    sort: '-created',
    expand,
  })) as AtendimentoRecord[]
}

export async function getAtendimento(id: string) {
  return (await pb.collection('atendimentos').getOne(id, { expand })) as AtendimentoRecord
}

export async function createAtendimento(input: AtendimentoInput, userId: string) {
  return (await pb.collection('atendimentos').create({
    ...input,
    data_atendimento: toPocketBaseDate(input.data_atendimento),
    retorno_ate: toPocketBaseDate(input.retorno_ate),
    criado_por: userId,
    reclamacao_status: input.reclamacao ? 'encaminhada' : 'nao_encaminhada',
    encaminhado_em: input.reclamacao ? new Date().toISOString() : '',
    handoff_pronto: false,
  })) as AtendimentoRecord
}

export async function updateAtendimento(id: string, data: Record<string, unknown>) {
  return (await pb.collection('atendimentos').update(id, data, { expand })) as AtendimentoRecord
}

export async function forwardComplaint(id: string, details: string, directionId?: string) {
  return updateAtendimento(id, {
    reclamacao: true,
    reclamacao_status: 'encaminhada',
    reclamacao_detalhes: details,
    encaminhado_em: new Date().toISOString(),
    ...(directionId ? { proxima_atendente: directionId } : {}),
    urgencia: 'critica',
  })
}

export async function updateComplaint(id: string, status: ComplaintStatus, response: string) {
  return updateAtendimento(id, {
    reclamacao_status: status,
    direcao_resposta: response,
  })
}

export async function completeHandoff(
  atendimento: AtendimentoRecord,
  originId: string,
  destinationId: string,
  notes: string,
  pending: string,
) {
  const handoff = (await pb.collection('handoffs').create({
    atendimento: atendimento.id,
    origem: originId,
    destino: destinationId,
    observacoes: notes,
    pendencias: pending,
    concluido: true,
    realizado_em: new Date().toISOString(),
  })) as HandoffRecord

  await updateAtendimento(atendimento.id, {
    responsavel: destinationId,
    proxima_atendente: '',
    handoff_pronto: false,
    handoff_observacoes: notes,
  })
  return handoff
}
