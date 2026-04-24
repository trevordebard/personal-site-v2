migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('homepage_settings')

    collection.fields.add(
      new TextField({
        name: 'focus_heading',
        required: true,
        max: 80,
      }),
    )
    collection.fields.add(
      new TextField({
        name: 'projects_eyebrow',
        required: true,
        max: 80,
      }),
    )
    collection.fields.add(
      new TextField({
        name: 'projects_heading',
        required: true,
        max: 120,
      }),
    )
    collection.fields.add(
      new TextField({
        name: 'experience_eyebrow',
        required: true,
        max: 80,
      }),
    )
    collection.fields.add(
      new TextField({
        name: 'experience_heading',
        required: true,
        max: 120,
      }),
    )

    app.save(collection)

    const record = app.findFirstRecordByData('homepage_settings', 'key', 'main')
    record.set('focus_heading', 'Current focus')
    record.set('projects_eyebrow', 'Selected Work')
    record.set('projects_heading', 'Projects')
    record.set('experience_eyebrow', 'Experience')
    record.set('experience_heading', 'Work history')
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
