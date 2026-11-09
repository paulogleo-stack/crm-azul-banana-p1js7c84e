import { CalendarDays, Clock3, ShieldCheck, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/PageHeader'
import { useCrm } from '@/contexts/CrmContext'

const dayLabels: Record<string, string> = {
  segunda: 'Segunda-feira',
  terca: 'Terça-feira',
  quarta: 'Quarta-feira',
  quinta: 'Quinta-feira',
  sexta: 'Sexta-feira',
  sabado: 'Sábado',
  domingo: 'Domingo',
}

const shiftLabels: Record<string, string> = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' }

export default function Schedule() {
  const { escala } = useCrm()
  const days = [...new Set(escala.map((item) => item.dia_semana))]
  const currentDayIndex = ((new Date().getDay() + 6) % 7) + 1

  return (
    <div>
      <PageHeader
        eyebrow="Organização da semana"
        title="Escala de atendimento"
        description="Consulte quem cuida de cada turno e veja rapidamente as coberturas combinadas com a equipe."
      />

      <div className="mb-6 rounded-2xl bg-primary p-5 text-white shadow-lg shadow-blue-950/10 sm:flex sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-4">
          <span className="rounded-xl bg-white/10 p-3">
            <CalendarDays className="h-6 w-6 text-[#ffca1a]" />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-blue-200">
              Escala vigente
            </p>
            <h2 className="mt-1 text-xl font-black">Atendimento da semana</h2>
            <p className="mt-1 text-sm text-blue-100">
              Nas trocas, confira os casos abertos no handoff antes de encerrar o turno.
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-blue-50 sm:mt-0">
          <ShieldCheck className="mr-2 inline h-4 w-4 text-[#ffca1a]" /> Coberturas sinalizadas em
          amarelo
        </div>
      </div>

      <section className="grid gap-4 xl:grid-cols-2">
        {days.map((day) => {
          const shifts = escala.filter((item) => item.dia_semana === day)
          const today = shifts[0]?.ordem === currentDayIndex
          return (
            <article
              key={day}
              className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${today ? 'border-primary ring-2 ring-blue-100' : 'border-slate-200'}`}
            >
              <header
                className={`flex items-center justify-between border-b px-5 py-4 ${today ? 'border-blue-100 bg-blue-50' : 'border-slate-100'}`}
              >
                <div>
                  <p className="text-base font-extrabold text-slate-900">{dayLabels[day]}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {shifts.length} turno{shifts.length === 1 ? '' : 's'} registrado
                    {shifts.length === 1 ? '' : 's'}
                  </p>
                </div>
                {today && <Badge className="rounded-full bg-primary">Hoje</Badge>}
              </header>
              <div className="divide-y divide-slate-100">
                {shifts.map((shift) => (
                  <div key={shift.id} className={`p-5 ${shift.cobertura ? 'bg-amber-50/60' : ''}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <span
                          className={`rounded-xl p-2.5 ${shift.cobertura ? 'bg-[#ffca1a] text-blue-950' : 'bg-blue-50 text-primary'}`}
                        >
                          <UserRound className="h-5 w-5" />
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-extrabold text-slate-900">
                              {shift.expand?.responsavel?.name || 'Responsável'}
                            </p>
                            {shift.cobertura && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
                                Cobertura
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs font-medium text-slate-500">
                            {shiftLabels[shift.turno]}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                        {shift.horario}
                      </span>
                    </div>
                    {shift.observacao && (
                      <p className="ml-[52px] mt-3 rounded-lg border border-amber-200 bg-white/70 px-3 py-2 text-xs leading-relaxed text-amber-900">
                        {shift.observacao}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </article>
          )
        })}
      </section>

      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5 text-center text-sm text-slate-500">
        A escala é mantida pela Organização. Em caso de troca, combine a cobertura e registre a
        passagem dos casos no handoff.
      </div>
    </div>
  )
}
