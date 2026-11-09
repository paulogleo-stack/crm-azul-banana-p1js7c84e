import pb from '@/lib/pocketbase/client'
import type { EscalaRecord, ModeloRecord } from '@/types/crm'

export async function listEscala() {
  return (await pb.collection('escala').getFullList({
    sort: 'ordem,turno',
    expand: 'responsavel',
  })) as EscalaRecord[]
}

export async function listModelos() {
  return (await pb.collection('modelos_mensagem').getFullList({ sort: 'ordem' })) as ModeloRecord[]
}
