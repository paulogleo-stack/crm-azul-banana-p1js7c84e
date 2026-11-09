import { useMemo, useState } from 'react'
import { CalendarDays, Check, ClipboardCopy, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { mensagemDoDia, rotuloDoDia, TOTAL_MENSAGENS } from '@/lib/dailyMessages'

/**
 * Cartão "Mensagem inicial do dia" do painel.
 * A mensagem é determinística por data: a mesma para toda a equipe no mesmo dia.
 */
export function DailyMessage() {
  const { toast } = useToast()
  const [copiado, setCopiado] = useState(false)

  const hoje = useMemo(() => new Date(), [])
  const mensagem = useMemo(() => mensagemDoDia(hoje), [hoje])
  const rotulo = useMemo(() => rotuloDoDia(hoje), [hoje])

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(mensagem)
      setCopiado(true)
      toast({
        title: 'Mensagem copiada',
        description: 'Abertura do dia enviada para a área de transferência.',
      })
      window.setTimeout(() => setCopiado(false), 1800)
    } catch {
      toast({
        title: 'Não foi possível copiar',
        description: 'Copie manualmente selecionando o texto da mensagem.',
        variant: 'destructive',
      })
    }
  }

  return (
    <section className="mb-7 overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 p-5 shadow-md shadow-blue-950/20 sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="rounded-xl bg-[#ffca1a] p-2 text-blue-950">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#ffca1a]">
            Mensagem inicial do dia
          </p>
          <p className="text-xs font-medium capitalize text-blue-200">{rotulo}</p>
        </div>
        <span className="ml-auto hidden rounded-full border border-blue-700 bg-blue-900/60 px-3 py-1 text-[10px] font-bold text-blue-200 sm:block">
          1 de {TOTAL_MENSAGENS.toLocaleString('pt-BR')} variações
        </span>
      </div>

      <p className="mt-4 text-sm font-medium leading-relaxed text-blue-50 sm:text-[15px]">
        {mensagem}
      </p>

      <div className="mt-4 flex items-center gap-3">
        <Button
          onClick={() => void copiar()}
          className={`h-9 rounded-xl px-4 font-bold shadow-none ${copiado ? 'bg-emerald-500 text-emerald-950 hover:bg-emerald-500' : 'bg-[#ffca1a] text-blue-950 hover:bg-yellow-300'}`}
        >
          {copiado ? (
            <Check className="mr-1.5 h-4 w-4" />
          ) : (
            <ClipboardCopy className="mr-1.5 h-4 w-4" />
          )}
          {copiado ? 'Copiado!' : 'Copiar mensagem'}
        </Button>
      </div>
    </section>
  )
}
