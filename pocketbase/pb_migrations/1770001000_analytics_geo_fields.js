migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('analytics_events')

    collection.fields.add(
      new TextField({
        name: 'country',
        required: false,
        max: 120,
      }),
    )
    collection.fields.add(
      new TextField({
        name: 'region',
        required: false,
        max: 120,
      }),
    )
    collection.fields.add(
      new TextField({
        name: 'city',
        required: false,
        max: 120,
      }),
    )
    collection.fields.add(
      new TextField({
        name: 'timezone',
        required: false,
        max: 120,
      }),
    )

    collection.indexes.push(
      'CREATE INDEX idx_analytics_events_country ON analytics_events (country)',
      'CREATE INDEX idx_analytics_events_region ON analytics_events (region)',
      'CREATE INDEX idx_analytics_events_city ON analytics_events (city)',
    )

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('analytics_events')

    collection.fields.removeByName('country')
    collection.fields.removeByName('region')
    collection.fields.removeByName('city')
    collection.fields.removeByName('timezone')

    collection.indexes = collection.indexes.filter(
      (index) =>
        !index.includes('idx_analytics_events_country') &&
        !index.includes('idx_analytics_events_region') &&
        !index.includes('idx_analytics_events_city'),
    )

    app.save(collection)
  },
)
