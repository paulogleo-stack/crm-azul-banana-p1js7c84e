/**
 * Mensagem inicial do dia — banco combinatório de 1000 variações distintas.
 *
 * Cada mensagem é composta por: abertura (mote Cacho Forte) + núcleo (um valor
 * da diretriz de atendimento) + fechamento (tom de marca Azul Banana).
 * 10 aberturas x 10 núcleos x 10 fechamentos = 1000 combinações únicas.
 *
 * A escolha do dia é determinística: a mesma data produz a mesma mensagem para
 * toda a equipe, e a mensagem muda a cada dia.
 */

const aberturas = [
  'Bom dia, equipe! Hoje acordamos com energia de Cacho Forte: forte, saudável e cheio de vida.',
  'Olá, time Azul Banana! O Cacho Forte é o nosso mote: cada cliente sai daqui com o cabelo e o coração mais fortes.',
  'Bom dia! Como diz o lema da casa, o compromisso é Cacho Forte — e um atendimento à altura.',
  'Bom dia, gente boa! Antes das primeiras mensagens, respira: o nosso mote é Cacho Forte, e ele começa no jeito de atender.',
  'Bom dia, equipe! Cacho Forte não é só cabelo: é a força com que a gente recebe cada cliente.',
  'Olá, time! Mais um dia para cuidar de cachos e de pessoas — com a leveza e a força do Cacho Forte.',
  'Bom dia! O café está pronto, as mensagens vão chegar e o nosso Cacho Forte já está no modo atendimento.',
  'Bom dia, equipe Azul Banana! Lembre do nosso lema: Cacho Forte, cliente feliz, equipe orgulhosa.',
  'Olá, pessoal! Comece o dia se olhando no espelho: hoje também é dia de Cacho Forte para quem atende.',
  'Bom dia! Cada conversa de hoje é uma chance de provar que o Cacho Forte mora dentro do nosso atendimento.',
]

const valores = [
  'Antes de responder, acolha: um “oi” caloroso muda o dia da pessoa do outro lado da tela.',
  'Agilidade é cuidado: responda rápido e com clareza, sem deixar o cliente esperando no vácuo.',
  'Nenhuma conversa se perde por aqui: registre tudo no CRM para que o próximo passo esteja sempre à mão.',
  'Na passagem de turno, entregue contexto: quem chega precisa saber onde a conversa parou para continuar de onde você saiu.',
  'O atendimento é pelo WhatsApp ou pelo Instagram — os dois canais merecem o mesmo carinho e a mesma atenção.',
  'Regra de ouro da casa: reclamação que chega até você e não se resolve é encaminhada com contexto à Direção, com o Paulo Gabriel.',
  'Acolher é escutar primeiro: entenda o que o cliente quer antes de sugerir o que ele precisa.',
  'O que está no CRM não se perde: anote cada combinado para que nenhum cliente precise repetir a história.',
  'Responda no tempo do cliente, não no seu: um retorno rápido e honesto vale mais que uma resposta perfeita que atrasa.',
  'Se algo der errado, não esconda: a Direção quer saber — encaminhe a reclamação e mantenha o cliente informado até o fim.',
]

const fechamentos = [
  'Bom trabalho hoje, equipe! Juntas e juntos, a gente faz o dia ser mais azul (de Azul Banana) e mais amarelo (de alegria)!',
  'Vamos com tudo: forte como o cacho, doce como a banana, atentos como sempre.',
  'Que hoje cada “bom dia” enviado vire um cliente mais feliz. Bora, time!',
  'Capricha no acolhimento, confia no time e o dia flui. Boa jornada!',
  'Lembre-se: por trás de cada mensagem há uma pessoa. Atenda como você gostaria de ser atendido.',
  'Estamos juntas nessa: qualquer dúvida, chame o time. Ninguém atende sozinho por aqui.',
  'Faça do turno de hoje o melhor atendimento da semana. Você consegue!',
  'Organize a aba do CRM, dê o primeiro passo e o resto do dia vem. Você consegue!',
  'Cliente bem tratado volta e indica. Que hoje a gente colha muitos “obrigado”.',
  'Com carinho, rapidez e contexto: é assim que o Azul Banana abre e fecha mais um dia de portas abertas.',
]

/** Número de dias (data local) desde uma época fixa — base da escolha do dia. */
export function dayNumber(date: Date = new Date()): number {
  const startOfToday = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const epoch = new Date(2024, 0, 1).getTime()
  return Math.floor((startOfToday - epoch) / 86_400_000)
}

/** Total de variações do banco (10 x 10 x 10). */
export const TOTAL_MENSAGENS = aberturas.length * valores.length * fechamentos.length

/** Mensagem pela combinação de índices (usada pela verificação e pela escolha do dia). */
export function mensagemPorIndice(indice: number): string {
  const abertura = aberturas[indice % aberturas.length]
  const valor = valores[Math.floor(indice / aberturas.length) % valores.length]
  const fechamento = fechamentos[Math.floor(indice / (aberturas.length * valores.length))]
  return `${abertura} ${valor} ${fechamento}`
}

/** Índice do dia: permutação bijetiva de 0..999, então a mensagem nunca se repete antes de 1000 dias. */
export function indiceDoDia(date: Date = new Date()): number {
  const dia = dayNumber(date)
  return (((dia % TOTAL_MENSAGENS) + TOTAL_MENSAGENS) * 567 + 123) % TOTAL_MENSAGENS
}

/** Mensagem inicial do dia — determinística por data, igual para toda a equipe. */
export function mensagemDoDia(date: Date = new Date()): string {
  return mensagemPorIndice(indiceDoDia(date))
}

/** Rótulo da data no formato usado no painel (ex.: "segunda-feira, 10 de março"). */
export function rotuloDoDia(date: Date = new Date()): string {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

/** Verificação simples do banco: exatamente 1000 variações e todas distintas. */
export function verificarBancoDeMensagens(): { total: number; distintas: number; ok: boolean } {
  const todas: string[] = []
  for (let a = 0; a < aberturas.length; a++) {
    for (let v = 0; v < valores.length; v++) {
      for (let f = 0; f < fechamentos.length; f++) {
        todas.push(`${aberturas[a]} ${valores[v]} ${fechamentos[f]}`)
      }
    }
  }
  const distintas = new Set(todas).size
  return { total: todas.length, distintas, ok: todas.length === 1000 && distintas === 1000 }
}

/** Verificações de sanidade determinística: mesma data => mesma mensagem; datas vizinhas => mensagens diferentes. */
export function verificarDeterminismo(): boolean {
  const dia = new Date(2026, 5, 15, 23, 59)
  const mesmoDiaTarde = new Date(2026, 5, 15, 8, 0)
  const diaSeguinte = new Date(2026, 5, 16, 8, 0)
  return (
    mensagemDoDia(dia) === mensagemDoDia(mesmoDiaTarde) &&
    mensagemDoDia(dia) !== mensagemDoDia(diaSeguinte)
  )
}

// Auto-verificação em desenvolvimento: garante o banco de 1000 variações distintas.
if (import.meta.env.DEV) {
  const banco = verificarBancoDeMensagens()
  if (!banco.ok || !verificarDeterminismo()) {
    console.error('[dailyMessages] banco de mensagens inválido', banco)
  }
}
