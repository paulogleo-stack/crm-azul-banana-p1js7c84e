migrate(
  (app) => {
    const usersCollection = app.findCollectionByNameOrId('users')

    const ensureUser = (email, name, role) => {
      try {
        const existing = app.findAuthRecordByEmail('users', email)
        let changed = false
        if (!existing.getString('name')) {
          existing.set('name', name)
          changed = true
        }
        if (!existing.getString('role')) {
          existing.set('role', role)
          changed = true
        }
        if (changed) app.save(existing)
        return existing
      } catch (_) {
        const user = new Record(usersCollection)
        user.setEmail(email)
        user.setPassword('Skip@Pass')
        user.setVerified(true)
        user.set('name', name)
        user.set('role', role)
        app.save(user)
        return user
      }
    }

    const paulo = ensureUser('paulogleo@gmail.com', 'Paulo Gabriel', 'direcao')
    const rafaela = ensureUser('rafaela@azulbanana.com.br', 'Rafaela', 'organizacao')
    const ana = ensureUser('ana@azulbanana.com.br', 'Ana', 'atendente')
    const beatriz = ensureUser('beatriz@azulbanana.com.br', 'Beatriz', 'atendente')

    const nowAt = (days, hours) => {
      const value = new Date()
      value.setDate(value.getDate() + days)
      value.setHours(hours, 0, 0, 0)
      return value.toISOString()
    }

    const atendimentosCollection = app.findCollectionByNameOrId('atendimentos')
    const ensureAtendimento = (data) => {
      try {
        return app.findFirstRecordByData('atendimentos', 'contato', data.contato)
      } catch (_) {
        const record = new Record(atendimentosCollection)
        Object.keys(data).forEach((key) => record.set(key, data[key]))
        app.save(record)
        return record
      }
    }

    ensureAtendimento({
      data_atendimento: nowAt(0, 9),
      cliente_nome: 'Mariana Souza',
      contato: '(11) 98842-1730',
      motivo: 'Encomenda para evento',
      resumo:
        'Cliente pediu opções para uma mesa de aniversário com 35 pessoas e aguarda confirmação de sabores e valores.',
      status: 'em_atendimento',
      proxima_acao: 'Confirmar disponibilidade da produção e enviar proposta completa.',
      retorno_ate: nowAt(0, 15),
      urgencia: 'alta',
      responsavel: ana.id,
      proxima_atendente: rafaela.id,
      criado_por: ana.id,
      reclamacao: false,
      reclamacao_status: 'nao_encaminhada',
      handoff_pronto: true,
      handoff_observacoes: 'Cliente prefere retorno por WhatsApp depois das 14h.',
    })

    ensureAtendimento({
      data_atendimento: nowAt(-1, 14),
      cliente_nome: 'Lucas Andrade',
      contato: '(21) 99714-6028',
      motivo: 'Alteração de encomenda',
      resumo:
        'Solicitou trocar dois itens e incluir uma opção sem lactose. A composição atual foi enviada para conferência.',
      status: 'aguardando_cliente',
      proxima_acao: 'Aguardar confirmação da nova composição antes de ajustar o pedido.',
      retorno_ate: nowAt(1, 10),
      urgencia: 'media',
      responsavel: beatriz.id,
      proxima_atendente: ana.id,
      criado_por: beatriz.id,
      reclamacao: false,
      reclamacao_status: 'nao_encaminhada',
      handoff_pronto: false,
      handoff_observacoes: 'Conferir se a cliente respondeu até o início do turno.',
    })

    ensureAtendimento({
      data_atendimento: nowAt(-1, 11),
      cliente_nome: 'Fernanda Lima',
      contato: '(11) 99120-4487',
      motivo: 'Reclamação sobre atraso',
      resumo:
        'Cliente relatou que o pedido chegou depois do horário combinado e solicita posicionamento da empresa.',
      status: 'aguardando_interno',
      proxima_acao: 'Direção deve analisar o ocorrido e orientar a resposta à cliente.',
      retorno_ate: nowAt(0, 13),
      urgencia: 'critica',
      responsavel: rafaela.id,
      proxima_atendente: paulo.id,
      criado_por: rafaela.id,
      reclamacao: true,
      reclamacao_status: 'encaminhada',
      reclamacao_detalhes:
        'Atraso de aproximadamente 50 minutos. Cliente informou que o evento já havia começado.',
      encaminhado_em: nowAt(-1, 12),
      handoff_pronto: true,
      handoff_observacoes: 'Não prometer compensação antes da orientação da Direção.',
    })

    ensureAtendimento({
      data_atendimento: nowAt(-2, 10),
      cliente_nome: 'Camila Rocha',
      contato: '(31) 98211-3064',
      motivo: 'Confirmação de pagamento',
      resumo: 'Comprovante conferido e pedido confirmado com a produção.',
      status: 'resolvido',
      proxima_acao: 'Enviar mensagem de encerramento e arquivar após confirmação de leitura.',
      retorno_ate: nowAt(0, 17),
      urgencia: 'baixa',
      responsavel: ana.id,
      criado_por: ana.id,
      reclamacao: false,
      reclamacao_status: 'nao_encaminhada',
      handoff_pronto: false,
    })

    ensureAtendimento({
      data_atendimento: nowAt(0, 8),
      cliente_nome: 'Bruno Martins',
      contato: '(11) 97603-8159',
      motivo: 'Disponibilidade para hoje',
      resumo:
        'Cliente quer retirar uma encomenda pequena no fim do dia e aguarda confirmação do balcão.',
      status: 'novo',
      proxima_acao: 'Consultar itens disponíveis para pronta entrega.',
      retorno_ate: nowAt(0, 11),
      urgencia: 'alta',
      responsavel: beatriz.id,
      proxima_atendente: rafaela.id,
      criado_por: beatriz.id,
      reclamacao: false,
      reclamacao_status: 'nao_encaminhada',
      handoff_pronto: false,
    })

    const escalaCollection = app.findCollectionByNameOrId('escala')
    const ensureEscala = (dia, ordem, turno, horario, responsavel, cobertura, observacao) => {
      const rows = app.findRecordsByFilter(
        'escala',
        'dia_semana = {:dia} && turno = {:turno}',
        'ordem',
        1,
        0,
        { dia: dia, turno: turno },
      )
      if (rows.length > 0) return
      const record = new Record(escalaCollection)
      record.set('dia_semana', dia)
      record.set('ordem', ordem)
      record.set('turno', turno)
      record.set('horario', horario)
      record.set('responsavel', responsavel.id)
      record.set('cobertura', cobertura)
      record.set('observacao', observacao)
      app.save(record)
    }

    ensureEscala('segunda', 1, 'manha', '08h às 13h', ana, false, '')
    ensureEscala('segunda', 1, 'tarde', '13h às 18h', beatriz, false, '')
    ensureEscala('terca', 2, 'manha', '08h às 13h', beatriz, false, '')
    ensureEscala('terca', 2, 'tarde', '13h às 18h', ana, false, '')
    ensureEscala('quarta', 3, 'manha', '08h às 13h', ana, false, '')
    ensureEscala(
      'quarta',
      3,
      'tarde',
      '13h às 18h',
      rafaela,
      true,
      'Cobertura combinada com Beatriz',
    )
    ensureEscala('quinta', 4, 'manha', '08h às 13h', beatriz, false, '')
    ensureEscala('quinta', 4, 'tarde', '13h às 18h', ana, false, '')
    ensureEscala('sexta', 5, 'manha', '08h às 13h', ana, false, '')
    ensureEscala('sexta', 5, 'tarde', '13h às 18h', beatriz, false, '')
    ensureEscala(
      'sabado',
      6,
      'manha',
      '09h às 14h',
      rafaela,
      true,
      'Plantão e suporte de organização',
    )

    const modelosCollection = app.findCollectionByNameOrId('modelos_mensagem')
    const ensureModelo = (categoria, titulo, conteudo, ordem) => {
      try {
        app.findFirstRecordByData('modelos_mensagem', 'categoria', categoria)
        return
      } catch (_) {
        const record = new Record(modelosCollection)
        record.set('categoria', categoria)
        record.set('titulo', titulo)
        record.set('conteudo', conteudo)
        record.set('ordem', ordem)
        app.save(record)
      }
    }

    ensureModelo(
      'abertura',
      'Abertura',
      'Oi, [nome]! Tudo bem? Aqui é [atendente], do Azul Banana 💙🍌. Como posso te ajudar?',
      1,
    )
    ensureModelo(
      'verificacao',
      'Enquanto verifica',
      'Só um instante, [nome]. Vou conferir essa informação com carinho e já volto com uma resposta para você.',
      2,
    )
    ensureModelo(
      'confirmacao',
      'Confirmação',
      'Prontinho, [nome]! Ficou combinado assim: [resumo do combinado]. Posso te ajudar com mais alguma coisa?',
      3,
    )
    ensureModelo(
      'encerramento',
      'Encerramento',
      'Obrigada por falar com a gente, [nome]! Qualquer coisa, estamos por aqui. Um abraço do Azul Banana 💙🍌',
      4,
    )
    ensureModelo(
      'reclamacao',
      'Acolhimento de reclamação',
      'Sinto muito pelo que aconteceu, [nome]. Obrigada por nos contar. Vou registrar tudo e encaminhar agora à nossa Direção para cuidarmos disso com a atenção necessária.',
      5,
    )
  },
  (app) => {
    app.truncateCollection(app.findCollectionByNameOrId('modelos_mensagem'))
    app.truncateCollection(app.findCollectionByNameOrId('escala'))
    app.truncateCollection(app.findCollectionByNameOrId('handoffs'))
    app.truncateCollection(app.findCollectionByNameOrId('atendimentos'))

    const emails = [
      'paulogleo@gmail.com',
      'rafaela@azulbanana.com.br',
      'ana@azulbanana.com.br',
      'beatriz@azulbanana.com.br',
    ]
    emails.forEach((email) => {
      try {
        app.delete(app.findAuthRecordByEmail('users', email))
      } catch (_) {}
    })
  },
)
