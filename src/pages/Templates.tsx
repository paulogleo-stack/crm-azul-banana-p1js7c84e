import { useState } from 'react'
import { Check, Clipboard, Lightbulb, MessageCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { DailyMessage } from '@/components/DailyMessage'
import { useCrm } from '@/contexts/CrmContext'
import { useToast } from '@/hooks/use-toast'

const categoryStyles: Record<string, { icon: string; bg: string; text: string }> = {
  abertura: { icon: '👋', bg: 'bg-blue-50', text: 'text-blue-700' },
  verificacao: { icon: '🔎', bg: 'bg-cyan-50', text: 'text-cyan-700' },
  confirmacao: { icon: '✓', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  encerramento: { icon: '💙', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  reclamacao: { icon: '!', bg: 'bg-rose-50', text: 'text-rose-700' },
}

export default function Templates() {
  const { modelos } = useCrm()
  const { toast } = useToast()
  const [copied, setCopied] = useState('')

  const copy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopied(id)
    toast({
      title: 'Mensagem copiada',
      description: 'Agora é só colar na conversa (WhatsApp ou Instagram).',
    })
    window.setTimeout(() => setCopied(''), 1800)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Mensagens da casa"
        title="Modelos de mensagem"
        description="Copie as mensagens da diretriz para o WhatsApp ou o Instagram e personalize os trechos entre colchetes antes de enviar ao cliente."
      />

      <DailyMessage />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-blue-50 p-2.5 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-slate-900">Tom Azul Banana</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Próximo, claro e acolhedor. Confirme o que foi combinado e nunca prometa o que ainda
                depende de outra pessoa.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-extrabold text-amber-950">Antes de enviar</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-800">
                Substitua todos os [campos] pela informação correta.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        {modelos.map((template) => {
          const style = categoryStyles[template.categoria]
          const isCopied = copied === template.id
          return (
            <article
              key={template.id}
              className={`group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${template.categoria === 'reclamacao' ? 'border-rose-200 lg:col-span-2' : 'border-slate-200'}`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg font-black ${style.bg} ${style.text}`}
                >
                  {style.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400">
                        {template.categoria.replace('_', ' ')}
                      </p>
                      <h2 className="mt-1 text-base font-extrabold text-slate-900">
                        {template.titulo}
                      </h2>
                    </div>
                    <Button
                      variant={isCopied ? 'default' : 'outline'}
                      size="sm"
                      className={`shrink-0 rounded-xl ${isCopied ? 'bg-emerald-600 hover:bg-emerald-600' : ''}`}
                      onClick={() => void copy(template.id, template.conteudo)}
                    >
                      {isCopied ? (
                        <Check className="mr-1.5 h-4 w-4" />
                      ) : (
                        <Clipboard className="mr-1.5 h-4 w-4" />
                      )}
                      {isCopied ? 'Copiado' : 'Copiar'}
                    </Button>
                  </div>
                  <div
                    className={`mt-4 rounded-xl p-4 text-sm leading-7 ${template.categoria === 'reclamacao' ? 'bg-rose-50 text-rose-950' : 'bg-slate-50 text-slate-700'}`}
                  >
                    <MessageCircle className="mb-2 h-4 w-4 text-slate-400" />
                    {template.conteudo}
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </section>
    </div>
  )
}
