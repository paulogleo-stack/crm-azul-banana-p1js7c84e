/**
 * Mensagem inicial do dia — banco combinatório de 1000 variações distintas.
 *
 * Cada mensagem é composta por: abertura (mote Cacho Forte, como um cacho de banana:
 * um segura o outro) + núcleo (um valor de hospitalidade do bar e restaurante) +
 * fechamento (slogan "Lugar de Gente Feliz" e tom de marca Azul Banana).
 * 10 aberturas x 10 núcleos x 10 fechamentos = 1000 combinações únicas.
 *
 * A escolha do dia é pseudoaleatória e estável: a data é a semente de um hash,
 * então a mesma data produz a mesma mensagem para toda a equipe (e não muda a cada
 * recarregamento), mas cada dia sorteia uma mensagem diferente da do dia anterior.
 */

const aberturas = [
  'Bom dia, equipe! Hoje seguimos o nosso Cacho Forte: como as bananas de um cacho, cada um segura o outro.',
  'Olá, time Azul Banana! Somos um cacho: ficamos fortes porque ninguém fica sozinho, e cada banana sustenta a outra.',
  'Bom dia! Na hospitalidade da casa, o Cacho Forte começa na recepção: a mesa acolhe e o time sustenta.',
  'Bom dia, gente boa! Respira e lembra: como num cacho de banana, a força do Azul Banana está em ficar junto.',
  'Bom dia, equipe! Cacho Forte é isso: cada pessoa do time segura a outra, e o cliente sente essa união.',
  'Olá, pessoal! Antes do primeiro “oi”, pense na recepção do nosso bar e restaurante: um cacho forte acolhe bem.',
  'Bom dia! O salão está se preparando, as mensagens estão chegando, e o nosso Cacho Forte já está de porta aberta.',
  'Bom dia, equipe Azul Banana! Lembrete do dia: Cacho Forte é time unido, e lugar de gente feliz começa no atendimento.',
  'Olá, time! Como um cacho de banana, a gente só fica forte quando está junto, principalmente no atendimento.',
  'Bom dia! Cada conversa de hoje é uma chance de fazer o cliente sentir a hospitalidade do Azul Banana.',
]

const valores = [
  'Acolher à mesa começa na primeira mensagem: um “oi” caloroso faz o cliente sentir que chegou num lugar especial.',
  'Recepção é cuidado: responda com agilidade e clareza, sem deixar ninguém esperando no vácuo.',
  'Nenhum cliente pode ficar sem resposta: registre tudo no CRM para que o próximo passo esteja sempre à mão.',
  'Na passagem de turno, entregue o contexto: quem chega precisa saber onde a conversa parou para continuar a recepção.',
  'O atendimento acontece pelo WhatsApp ou pelo Instagram, e os dois canais recebem a mesma hospitalidade da casa.',
  'Regra de ouro da casa: reclamação que não se resolve vai com contexto à Direção, com o Paulo Gabriel.',
  'Hospitalidade é escutar primeiro: entenda o que o cliente quer antes de sugerir o que ele precisa.',
  'Tudo que combinamos fica no CRM, para que nenhum cliente precise repetir a história ao voltar à casa.',
  'Responda no tempo do cliente: um retorno rápido e honesto vale mais que uma resposta perfeita que atrasa.',
  'Se algo der errado, não esconda: encaminhe a reclamação à Direção e mantenha o cliente informado até o fim.',
]

const fechamentos = [
  'Bom trabalho hoje, equipe! Lugar de Gente Feliz se faz assim: um cuidando do outro, como um cacho.',
  'Vamos com tudo: forte como o cacho, doce como a banana, acolhedores como sempre.',
  'Que hoje cada “bom dia” enviado vire um cliente feliz que volta à mesa. Bora, time!',
  'Capricha no acolhimento, confia no time e o turno flui. Lugar de Gente Feliz começa com você.',
  'Lembre: por trás de cada mensagem há uma pessoa. Atenda como você gostaria de ser recebido.',
  'Estamos juntos nessa: qualquer dúvida, chame o time. Ninguém atende sozinho no Azul Banana.',
  'Faça do turno de hoje a melhor recepção da semana. Você consegue!',
  'Organize o CRM, dê o primeiro passo e o resto do dia vem. Lugar de Gente Feliz, sempre.',
  'Cliente bem recebido volta e indica. Que hoje a gente colha muitos “obrigado”.',
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

/** Hash inteiro de 32 bits (avalanche de Murmur3) — gera o sorteio a partir do número do dia. */
function hashDoDia(n: number): number {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  return h >>> 0
}

/**
 * Índice sorteado para o dia. Percorre os dias desde a época fixa, sorteando
 * `hashDoDia(dia) % TOTAL` e pulando o índice do dia anterior quando coincidem.
 * Assim o resultado é sempre o mesmo para uma data, e dias seguidos nunca repetem.
 */
export function indiceDoDia(date: Date = new Date()): number {
  const diaAlvo = dayNumber(date)
  let anterior: number | null = null
  let atual = 0
  for (let dia = Math.min(0, diaAlvo); dia <= diaAlvo; dia++) {
    atual = hashDoDia(dia) % TOTAL_MENSAGENS
    if (anterior !== null && atual === anterior) {
      atual = (atual + 1) % TOTAL_MENSAGENS
    }
    anterior = atual
  }
  return atual
}

/** Mensagem inicial do dia — sorteada por data (estável no dia), igual para toda a equipe. */
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

/**
 * Verificações do sorteio: mesma data => mesma mensagem no dia inteiro;
 * dias seguidos (por um ano) => nunca a mesma mensagem; sorteio varia ao longo do tempo.
 */
export function verificarDeterminismo(): boolean {
  const manha = new Date(2026, 5, 15, 8, 0)
  const noite = new Date(2026, 5, 15, 23, 59)
  if (mensagemDoDia(manha) !== mensagemDoDia(noite)) return false
  let semRepeticaoSeguida = true
  const distintasNoAno = new Set<number>()
  for (let d = 0; d < 365; d++) {
    const hoje = indiceDoDia(new Date(2026, 0, 1 + d))
    const ontem = indiceDoDia(new Date(2026, 0, d))
    if (d > 0 && hoje === ontem) semRepeticaoSeguida = false
    distintasNoAno.add(hoje)
  }
  return semRepeticaoSeguida && distintasNoAno.size > 1
}

// Auto-verificação em desenvolvimento: garante o banco de 1000 variações distintas.
if (import.meta.env.DEV) {
  const banco = verificarBancoDeMensagens()
  if (!banco.ok || !verificarDeterminismo()) {
    console.error('[dailyMessages] banco de mensagens inválido', banco)
  }
}
