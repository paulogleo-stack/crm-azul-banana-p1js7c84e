import { useState } from 'react'
import {
  BookOpen,
  ExternalLink,
  Handshake,
  HeartHandshake,
  ShieldAlert,
  ClipboardList,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'

const PDF_URL =
  'https://dagtlwojkqyivnjgveda.supabase.co/storage/v1/object/public/message-attachments/0061bb66-415c-46ba-bb06-b498aa2212b3/diretriz-atendimento-finalizada-atualizada-v.2-69915.pdf'

const destaques = [
  {
    icon: Handshake,
    title: 'Acolhimento',
    text: 'Responder rápido (referência: até 5 minutos), usar o nome do cliente e nunca deixar silêncio responder por você.',
    tone: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    icon: HeartHandshake,
    title: 'Continuidade',
    text: 'Quem começa, acompanha até o fim. Tudo que exigir retorno fica registrado no CRM — nenhuma conversa depende da memória.',
    tone: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  {
    icon: ClipboardList,
    title: 'Passagem de turno',
    text: 'Nos últimos 10–15 minutos do turno, revise os casos abertos e deixe pronto o handoff com as cinco perguntas respondidas.',
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    icon: ShieldAlert,
    title: 'Regra de ouro',
    text: 'Crítica acolhida e encaminhada: reclamações vão para a Direção — Paulo Gabriel — sem discussão e sem prometer compensações.',
    tone: 'bg-amber-50 text-amber-800 border-amber-200',
  },
]

export default function Diretriz() {
  const [failed, setFailed] = useState(false)

  return (
    <div>
      <PageHeader
        eyebrow="Documento de referência"
        title="Diretriz de Atendimento"
        description="A diretriz oficial do WhatsApp do Azul Banana, sempre à mão: leia aqui mesmo, sem sair do app."
        action={
          <Button asChild variant="outline" className="rounded-xl">
            <a href={PDF_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1.5 h-4 w-4" />
              Abrir em nova aba
            </a>
          </Button>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {destaques.map(({ icon: Icon, title, text, tone }) => (
          <div key={title} className={`rounded-2xl border p-4 ${tone}`}>
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              <p className="text-sm font-extrabold">{title}</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed opacity-90">{text}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-blue-50 p-2.5 text-primary">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-slate-900">Documento completo</p>
              <p className="text-xs text-slate-500">Diretriz de atendimento | Revisão 05/11/2026</p>
            </div>
          </div>
          <a
            href={PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Não está carregando? Abrir PDF
          </a>
        </div>

        {failed ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <BookOpen className="h-8 w-8 text-slate-300" />
            <p className="max-w-md text-sm text-slate-500">
              O visualizador não conseguiu carregar o documento aqui dentro. Use o botão abaixo para
              abrir o PDF em uma nova aba.
            </p>
            <Button asChild className="rounded-xl">
              <a href={PDF_URL} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 h-4 w-4" />
                Abrir em nova aba
              </a>
            </Button>
          </div>
        ) : (
          <iframe
            src={PDF_URL}
            title="Diretriz de Atendimento — Azul Banana"
            className="h-[75vh] min-h-[480px] w-full bg-slate-50"
            onError={() => setFailed(true)}
          />
        )}
      </section>
    </div>
  )
}
