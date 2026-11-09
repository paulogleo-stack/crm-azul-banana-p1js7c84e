import { useEffect, useState } from 'react'

// Intervalo em que a condição de prazo é recalculada (1 minuto).
const INTERVALO_RECALCULO_MS = 60 * 1000

// Retorna o instante atual, atualizado a cada minuto, para recalcular prazos sem recarregar a página.
export function useAgora() {
  const [agora, setAgora] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setAgora(Date.now()), INTERVALO_RECALCULO_MS)
    return () => window.clearInterval(id)
  }, [])

  return agora
}
