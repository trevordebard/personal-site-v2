migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('homepage_settings')

    collection.fields.add(
      new TextField({
        name: 'focus_heading',
        required: false,
        max: 80,
      }),
    )
    collection.fields.add(
      new TextField({
        name: 'projects_eyebrow',
        required: false,
        max: 80,
      }),
    )
    collection.fields.add(
      new TextField({
        name: 'projects_heading',
        required: false,
        max: 120,
      }),
    )
    collection.fields.add(
      new TextField({
        name: 'experience_eyebrow',
        required: false,
        max: 80,
      }),
    )
    collection.fields.add(
      new TextField({
        name: 'experience_heading',
        required: false,
        max: 120,
      }),
    )

    app.save(collection)

    const record = app.findFirstRecordByData('homepage_settings', 'key', 'main')
    record.set('focus_heading', 'Leadership focus')
    record.set('projects_eyebrow', 'Selected Evidence')
    record.set('projects_heading', 'Delivery snapshots')
    record.set('experience_eyebrow', 'Career Record')
    record.set('experience_heading', 'Experience')
    app.save(record)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('homepage_settings')

    collection.fields.removeByName('focus_heading')
    collection.fields.removeByName('projects_eyebrow')
    collection.fields.removeByName('projects_heading')
    collection.fields.removeByName('experience_eyebrow')
    collection.fields.removeByName('experience_heading')

    app.save(collection)
  },
)
