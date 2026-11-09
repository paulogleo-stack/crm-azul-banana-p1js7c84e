import type { AtendimentoRecord, Urgency } from '@/types/crm'

// Janela de aviso antes do prazo de retorno: 4 horas.
export const JANELA_PROXIMO_MS = 4 * 60 * 60 * 1000

const ordemUrgencia: Record<Urgency, number> = {
  baixa: 0,
  media: 1,
  alta: 2,
  critica: 3,
}

export type CasoComUrgencia = Pick<AtendimentoRecord, 'status' | 'retorno_ate' | 'urgencia'>

// Urgência efetiva: acompanha o prazo do retorno.
// - Vencido (retorno_ate no passado) → crítica.
// - Faltando menos de 4h → no mínimo alta.
// - Encerrado, sem prazo ou prazo inválido → urgência cadastrada.
// O dado original no banco não é alterado.
export function urgenciaEfetiva(caso: CasoComUrgencia, agora: number): Urgency {
  if (caso.status === 'encerrado' || !caso.retorno_ate) return caso.urgencia
  const prazo = new Date(caso.retorno_ate.replace(' ', 'T')).getTime()
  if (Number.isNaN(prazo)) return caso.urgencia
  if (prazo < agora) return 'critica'
  const proximo = prazo - agora < JANELA_PROXIMO_MS
  if (proximo && ordemUrgencia[caso.urgencia] < ordemUrgencia.alta) return 'alta'
  return caso.urgencia
}
