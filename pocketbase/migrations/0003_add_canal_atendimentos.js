migrate(
  (app) => {
    const atendimentos = app.findCollectionByNameOrId('atendimentos')

    if (!atendimentos.fields.getByName('canal')) {
      atendimentos.fields.add(
        new SelectField({
          name: 'canal',
          values: ['WhatsApp', 'Instagram'],
          maxSelect: 1,
        }),
      )
      app.save(atendimentos)
    }

    // Backfill idempotente: registros anteriores à criação do campo recebem o padrão WhatsApp.
    const pendentes = app.findRecordsByFilter('atendimentos', "canal = ''", '', 100000, 0)
    for (const record of pendentes) {
      record.set('canal', 'WhatsApp')
      app.save(record)
    }
  },
  (app) => {
    const atendimentos = app.findCollectionByNameOrId('atendimentos')
    if (atendimentos.fields.getByName('canal')) {
      atendimentos.fields.removeByName('canal')
      app.save(atendimentos)
    }
  },
)
