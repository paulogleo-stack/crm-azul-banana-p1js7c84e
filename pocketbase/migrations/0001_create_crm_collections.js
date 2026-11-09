migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    if (!users.fields.getByName('role')) {
      users.fields.add(
        new SelectField({
          name: 'role',
          values: ['atendente', 'organizacao', 'direcao'],
          maxSelect: 1,
        }),
      )
    }

    users.listRule = "@request.auth.id != ''"
    users.viewRule = "@request.auth.id != ''"
    users.createRule = "@request.body.role = '' || @request.body.role = 'atendente'"
    users.updateRule = 'id = @request.auth.id && @request.body.role:changed = false'
    users.deleteRule = 'id = @request.auth.id'
    app.save(users)

    const atendimentos = new Collection({
      name: 'atendimentos',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule:
        "@request.auth.id != '' && (@request.auth.role = 'organizacao' || @request.auth.role = 'direcao')",
      fields: [
        { name: 'data_atendimento', type: 'date', required: true },
        { name: 'cliente_nome', type: 'text', required: true, min: 2, max: 120 },
        { name: 'contato', type: 'text', required: true, min: 8, max: 80 },
        { name: 'motivo', type: 'text', required: true, min: 3, max: 180 },
        { name: 'resumo', type: 'text', required: true, min: 3, max: 4000 },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: [
            'novo',
            'em_atendimento',
            'aguardando_cliente',
            'aguardando_interno',
            'resolvido',
            'encerrado',
          ],
          maxSelect: 1,
        },
        { name: 'proxima_acao', type: 'text', required: true, min: 3, max: 1000 },
        { name: 'retorno_ate', type: 'date' },
        {
          name: 'urgencia',
          type: 'select',
          required: true,
          values: ['baixa', 'media', 'alta', 'critica'],
          maxSelect: 1,
        },
        {
          name: 'responsavel',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        {
          name: 'proxima_atendente',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        {
          name: 'criado_por',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'reclamacao', type: 'bool' },
        {
          name: 'reclamacao_status',
          type: 'select',
          values: ['nao_encaminhada', 'encaminhada', 'em_analise', 'respondida', 'resolvida'],
          maxSelect: 1,
        },
        { name: 'reclamacao_detalhes', type: 'text', max: 3000 },
        { name: 'direcao_resposta', type: 'text', max: 3000 },
        { name: 'encaminhado_em', type: 'date' },
        { name: 'handoff_pronto', type: 'bool' },
        { name: 'handoff_observacoes', type: 'text', max: 2000 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_atendimentos_status ON atendimentos (status)',
        'CREATE INDEX idx_atendimentos_urgencia ON atendimentos (urgencia)',
        'CREATE INDEX idx_atendimentos_responsavel ON atendimentos (responsavel)',
        'CREATE INDEX idx_atendimentos_reclamacao ON atendimentos (reclamacao)',
        'CREATE INDEX idx_atendimentos_retorno ON atendimentos (retorno_ate)',
      ],
    })
    app.save(atendimentos)

    const handoffs = new Collection({
      name: 'handoffs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule:
        "@request.auth.id != '' && (@request.auth.role = 'organizacao' || @request.auth.role = 'direcao')",
      fields: [
        {
          name: 'atendimento',
          type: 'relation',
          required: true,
          collectionId: atendimentos.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'origem',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        {
          name: 'destino',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'observacoes', type: 'text', max: 2000 },
        { name: 'pendencias', type: 'text', max: 2000 },
        { name: 'concluido', type: 'bool' },
        { name: 'realizado_em', type: 'date', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_handoffs_atendimento ON handoffs (atendimento)',
        'CREATE INDEX idx_handoffs_destino ON handoffs (destino)',
      ],
    })
    app.save(handoffs)

    const escala = new Collection({
      name: 'escala',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule:
        "@request.auth.id != '' && (@request.auth.role = 'organizacao' || @request.auth.role = 'direcao')",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'organizacao' || @request.auth.role = 'direcao')",
      deleteRule:
        "@request.auth.id != '' && (@request.auth.role = 'organizacao' || @request.auth.role = 'direcao')",
      fields: [
        {
          name: 'dia_semana',
          type: 'select',
          required: true,
          values: ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'],
          maxSelect: 1,
        },
        { name: 'ordem', type: 'number', required: true, min: 1, max: 7, onlyInt: true },
        {
          name: 'turno',
          type: 'select',
          required: true,
          values: ['manha', 'tarde', 'noite'],
          maxSelect: 1,
        },
        { name: 'horario', type: 'text', required: true, max: 40 },
        {
          name: 'responsavel',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'cobertura', type: 'bool' },
        { name: 'observacao', type: 'text', max: 500 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_escala_ordem_turno ON escala (ordem, turno)'],
    })
    app.save(escala)

    const modelos = new Collection({
      name: 'modelos_mensagem',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule:
        "@request.auth.id != '' && (@request.auth.role = 'organizacao' || @request.auth.role = 'direcao')",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'organizacao' || @request.auth.role = 'direcao')",
      deleteRule:
        "@request.auth.id != '' && (@request.auth.role = 'organizacao' || @request.auth.role = 'direcao')",
      fields: [
        {
          name: 'categoria',
          type: 'select',
          required: true,
          values: ['abertura', 'verificacao', 'confirmacao', 'encerramento', 'reclamacao'],
          maxSelect: 1,
        },
        { name: 'titulo', type: 'text', required: true, min: 2, max: 100 },
        { name: 'conteudo', type: 'text', required: true, min: 5, max: 3000 },
        { name: 'ordem', type: 'number', required: true, min: 1, max: 20, onlyInt: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_modelos_categoria ON modelos_mensagem (categoria)',
        'CREATE INDEX idx_modelos_ordem ON modelos_mensagem (ordem)',
      ],
    })
    app.save(modelos)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('modelos_mensagem'))
    app.delete(app.findCollectionByNameOrId('escala'))
    app.delete(app.findCollectionByNameOrId('handoffs'))
    app.delete(app.findCollectionByNameOrId('atendimentos'))

    const users = app.findCollectionByNameOrId('users')
    if (users.fields.getByName('role')) {
      users.fields.removeByName('role')
    }
    users.listRule = 'id = @request.auth.id'
    users.viewRule = 'id = @request.auth.id'
    users.createRule = ''
    users.updateRule = 'id = @request.auth.id'
    users.deleteRule = 'id = @request.auth.id'
    app.save(users)
  },
)
