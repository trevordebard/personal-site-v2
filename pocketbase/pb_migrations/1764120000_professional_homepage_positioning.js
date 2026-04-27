migrate(
  (app) => {
    const record = app.findFirstRecordByData('homepage_settings', 'key', 'main')

    record.set('hero_eyebrow', 'Senior Software Consultant / Product Engineering Lead')
    record.set('availability', 'Open to senior product, platform, and consulting leadership work')
    record.set(
      'title',
      'Senior software consultant building durable systems for complex organizations.',
    )
    record.set(
      'intro',
      'I work across product, platform, and integration-heavy problems, aligning stakeholders, shaping pragmatic architecture, and shipping software that improves how teams operate.',
    )
    record.set('focus_heading', 'Leadership focus')
    record.set('projects_eyebrow', 'Selected Evidence')
    record.set('projects_heading', 'Delivery snapshots')
    record.set(
      'projects_intro',
      'A few representative builds that show product judgment, system design, and hands-on delivery across real user workflows.',
    )
    record.set('experience_eyebrow', 'Career Record')
    record.set('experience_heading', 'Experience')
    record.set(
      'experience_intro',
      'A record of consulting and engineering roles focused on stakeholder clarity, technical execution, and measurable operational outcomes.',
    )
    app.save(record)

    const focusItems = [
      'Leading delivery across ambiguous business domains, technical constraints, and cross-functional teams.',
      'Turning messy operational processes into reliable product experiences and integration patterns.',
      'Choosing pragmatic architectures that can absorb future content, admin, and workflow needs without a rebuild.',
    ]

    for (let index = 0; index < focusItems.length; index++) {
      const item = app.findFirstRecordByData('homepage_focus_items', 'sort', index + 1)
      item.set('body', focusItems[index])
      app.save(item)
    }

    const stats = [
      { sort: 1, label: 'years shipping web software' },
      { sort: 2, label: 'professional delivery roles' },
      { sort: 3, label: 'selected product builds' },
    ]

    for (const stat of stats) {
      const item = app.findFirstRecordByData('homepage_stats', 'sort', stat.sort)
      item.set('label', stat.label)
      app.save(item)
    }
  },
  (app) => {
    const record = app.findFirstRecordByData('homepage_settings', 'key', 'main')

    record.set('hero_eyebrow', 'Software Consultant / Product Engineer')
    record.set('availability', 'Open to thoughtful product and platform work')
    record.set('title', 'Senior software consultant building durable product systems.')
    record.set(
      'intro',
      'I work across product, platform, and integration-heavy problems, with a bias toward clean implementation, adaptable architecture, and shipping software people actually use.',
    )
    record.set('focus_heading', 'Current focus')
    record.set('projects_eyebrow', 'Selected Work')
    record.set('projects_heading', 'Projects')
    record.set(
      'projects_intro',
      'The current site is content-first. This version keeps that structure, but gives the work more presence and cleaner scanning.',
    )
    record.set('experience_eyebrow', 'Experience')
    record.set('experience_heading', 'Work history')
    record.set(
      'experience_intro',
      'This section is already structured like application data, which will make it easy to move into a managed backend later.',
    )
    app.save(record)

    const focusItems = [
      'Shipping software that connects messy business processes to usable product experiences.',
      'Designing systems that can later absorb admin tooling, content workflows, and a blog without a rebuild.',
      'Using the right stack for the problem instead of forcing a single preferred pattern everywhere.',
    ]

    for (let index = 0; index < focusItems.length; index++) {
      const item = app.findFirstRecordByData('homepage_focus_items', 'sort', index + 1)
      item.set('body', focusItems[index])
      app.save(item)
    }

    const stats = [
      { sort: 1, label: 'years building on the web' },
      { sort: 2, label: 'roles represented here' },
      { sort: 3, label: 'featured personal projects' },
    ]

    for (const stat of stats) {
      const item = app.findFirstRecordByData('homepage_stats', 'sort', stat.sort)
      item.set('label', stat.label)
      app.save(item)
    }
  },
)
