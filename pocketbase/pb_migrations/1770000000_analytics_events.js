migrate(
  (app) => {
    const analyticsEvents = new Collection({
      type: 'base',
      name: 'analytics_events',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      fields: [
        {
          name: 'event_id',
          type: 'text',
          required: true,
          presentable: true,
          min: 1,
          max: 80,
        },
        {
          name: 'viewed_at',
          type: 'date',
          required: true,
        },
        {
          name: 'path',
          type: 'text',
          required: true,
          max: 300,
        },
        {
          name: 'status',
          type: 'number',
          required: true,
          min: 100,
          max: 599,
          onlyInt: true,
        },
        {
          name: 'referrer',
          type: 'url',
          required: false,
        },
        {
          name: 'referrer_host',
          type: 'text',
          required: false,
          max: 255,
        },
        {
          name: 'visitor_id',
          type: 'text',
          required: true,
          max: 80,
        },
        {
          name: 'browser',
          type: 'text',
          required: false,
          max: 40,
        },
        {
          name: 'device',
          type: 'select',
          required: false,
          maxSelect: 1,
          values: ['desktop', 'mobile', 'tablet'],
        },
        {
          name: 'os',
          type: 'text',
          required: false,
          max: 40,
        },
        {
          name: 'user_agent',
          type: 'text',
          required: false,
          max: 500,
        },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_analytics_events_event_id ON analytics_events (event_id)',
        'CREATE INDEX idx_analytics_events_viewed_at ON analytics_events (viewed_at)',
        'CREATE INDEX idx_analytics_events_path ON analytics_events (path)',
        'CREATE INDEX idx_analytics_events_visitor_id ON analytics_events (visitor_id)',
        'CREATE INDEX idx_analytics_events_referrer_host ON analytics_events (referrer_host)',
      ],
    })
    app.save(analyticsEvents)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('analytics_events')
    app.delete(collection)
  },
)
