migrate(
  (app) => {
    const homepageSettings = new Collection({
      type: 'base',
      name: 'homepage_settings',
      listRule: '',
      viewRule: '',
      fields: [
        {
          name: 'key',
          type: 'text',
          required: true,
          presentable: true,
          min: 1,
          max: 40,
        },
        {
          name: 'hero_eyebrow',
          type: 'text',
          required: false,
          max: 120,
        },
        {
          name: 'greeting',
          type: 'text',
          required: false,
          max: 160,
        },
        {
          name: 'location',
          type: 'text',
          required: false,
          max: 80,
        },
        {
          name: 'availability',
          type: 'text',
          required: false,
          max: 140,
        },
        {
          name: 'title',
          type: 'text',
          required: false,
          max: 200,
        },
        {
          name: 'intro',
          type: 'text',
          required: false,
          max: 1000,
        },
        {
          name: 'resume_url',
          type: 'url',
          required: false,
        },
        {
          name: 'email',
          type: 'email',
          required: false,
        },
        {
          name: 'github_url',
          type: 'url',
          required: false,
        },
        {
          name: 'projects_intro',
          type: 'text',
          required: false,
          max: 1000,
        },
        {
          name: 'experience_intro',
          type: 'text',
          required: false,
          max: 1000,
        },
        {
          name: 'closing_eyebrow',
          type: 'text',
          required: false,
          max: 80,
        },
        {
          name: 'closing_title',
          type: 'text',
          required: false,
          max: 200,
        },
        {
          name: 'closing_body',
          type: 'text',
          required: false,
          max: 1000,
        },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_homepage_settings_key ON homepage_settings (key)'],
    })
    app.save(homepageSettings)

    const focusItems = new Collection({
      type: 'base',
      name: 'homepage_focus_items',
      listRule: '',
      viewRule: '',
      fields: [
        {
          name: 'sort',
          type: 'number',
          required: true,
        },
        {
          name: 'body',
          type: 'text',
          required: false,
          max: 500,
          presentable: true,
        },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_homepage_focus_items_sort ON homepage_focus_items (sort)'],
    })
    app.save(focusItems)

    const stats = new Collection({
      type: 'base',
      name: 'homepage_stats',
      listRule: '',
      viewRule: '',
      fields: [
        {
          name: 'sort',
          type: 'number',
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          required: false,
          max: 40,
          presentable: true,
        },
        {
          name: 'label',
          type: 'text',
          required: false,
          max: 120,
        },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_homepage_stats_sort ON homepage_stats (sort)'],
    })
    app.save(stats)

    const projects = new Collection({
      type: 'base',
      name: 'projects',
      listRule: '',
      viewRule: '',
      fields: [
        {
          name: 'sort',
          type: 'number',
          required: true,
        },
        {
          name: 'name',
          type: 'text',
          required: true,
          max: 120,
          presentable: true,
        },
        {
          name: 'summary',
          type: 'text',
          required: false,
          max: 1000,
        },
        {
          name: 'href',
          type: 'url',
          required: false,
        },
        {
          name: 'tags',
          type: 'text',
          required: false,
          max: 500,
        },
        {
          name: 'accent',
          type: 'text',
          required: false,
          max: 20,
        },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_projects_sort ON projects (sort)'],
    })
    app.save(projects)

    const experience = new Collection({
      type: 'base',
      name: 'experience',
      listRule: '',
      viewRule: '',
      fields: [
        {
          name: 'sort',
          type: 'number',
          required: true,
        },
        {
          name: 'role',
          type: 'text',
          required: true,
          max: 120,
          presentable: true,
        },
        {
          name: 'company',
          type: 'text',
          required: false,
          max: 120,
        },
        {
          name: 'start_label',
          type: 'text',
          required: false,
          max: 80,
        },
        {
          name: 'end_label',
          type: 'text',
          required: false,
          max: 80,
        },
        {
          name: 'summary',
          type: 'text',
          required: false,
          max: 1000,
        },
        {
          name: 'bullets',
          type: 'text',
          required: false,
          max: 2000,
        },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_experience_sort ON experience (sort)'],
    })
    app.save(experience)
  },
  (app) => {
    const collections = ['experience', 'projects', 'homepage_stats', 'homepage_focus_items', 'homepage_settings']

    for (const name of collections) {
      try {
        const collection = app.findCollectionByNameOrId(name)
        app.delete(collection)
      } catch (_) {}
    }
  },
)
