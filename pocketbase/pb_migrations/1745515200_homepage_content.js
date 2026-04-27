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

    const homepageRecord = new Record(homepageSettings)
    homepageRecord.set('key', 'main')
    homepageRecord.set('hero_eyebrow', 'Senior Software Consultant / Product Engineering Lead')
    homepageRecord.set('greeting', "Hi, I'm Trevor DeBardeleben")
    homepageRecord.set('location', 'Atlanta, GA')
    homepageRecord.set(
      'availability',
      'Open to senior product, platform, and consulting leadership work',
    )
    homepageRecord.set(
      'title',
      'Senior software consultant building durable systems for complex organizations.',
    )
    homepageRecord.set(
      'intro',
      'I work across product, platform, and integration-heavy problems, aligning stakeholders, shaping pragmatic architecture, and shipping software that improves how teams operate.',
    )
    homepageRecord.set(
      'resume_url',
      'https://res.cloudinary.com/drm11trnc/image/upload/v1670624426/Resume_Trevor_De_Bardeleben_27c01660b8.pdf',
    )
    homepageRecord.set('email', 'trevordebard@gmail.com')
    homepageRecord.set('github_url', 'https://github.com/trevordebard')
    homepageRecord.set(
      'projects_intro',
      'A few representative builds that show product judgment, system design, and hands-on delivery across real user workflows.',
    )
    homepageRecord.set(
      'experience_intro',
      'A record of consulting and engineering roles focused on stakeholder clarity, technical execution, and measurable operational outcomes.',
    )
    homepageRecord.set('closing_eyebrow', 'Next Phase')
    homepageRecord.set('closing_title', 'Homepage first. Backend and blog-ready by design.')
    homepageRecord.set(
      'closing_body',
      'This homepage is intentionally structured so your projects, experience entries, and future posts can graduate from hard-coded data into a maintainable content pipeline.',
    )
    app.save(homepageRecord)

    const focusItemValues = [
      'Leading delivery across ambiguous business domains, technical constraints, and cross-functional teams.',
      'Turning messy operational processes into reliable product experiences and integration patterns.',
      'Choosing pragmatic architectures that can absorb future content, admin, and workflow needs without a rebuild.',
    ]

    for (let index = 0; index < focusItemValues.length; index++) {
      const record = new Record(focusItems)
      record.set('sort', index + 1)
      record.set('body', focusItemValues[index])
      app.save(record)
    }

    const statValues = [
      { sort: 1, value: '8+', label: 'years shipping web software' },
      { sort: 2, value: '4', label: 'professional delivery roles' },
      { sort: 3, value: '3', label: 'selected product builds' },
    ]

    for (const stat of statValues) {
      const record = new Record(stats)
      record.set('sort', stat.sort)
      record.set('value', stat.value)
      record.set('label', stat.label)
      app.save(record)
    }

    const projectValues = [
      {
        sort: 1,
        name: 'Sign Me In',
        summary:
          'A real-time attendance platform for student organizations that grew to 500 to 1,000 monthly users after launching on campus.',
        href: 'https://github.com/trevordebard/Sign-Me-In-v2',
        tags: 'Next.js, React, REST, Socket.IO, TypeScript',
        accent: 'teal',
      },
      {
        sort: 2,
        name: 'Dead Simple Budget',
        summary:
          'A zero-based budgeting app that helps users assign every dollar to a purpose through flexible money stacks and planning workflows.',
        href: 'https://github.com/trevordebard/dead-simple-budget',
        tags: 'Next.js, React, Postgres, TypeScript, Prisma',
        accent: 'gold',
      },
      {
        sort: 3,
        name: 'Book Trace',
        summary:
          'A reading tracker focused on OAuth-secured flows and first- and third-party API integrations for managing reading history and wish lists.',
        href: 'https://github.com/trevordebard/book-trace',
        tags: 'Next.js, React, REST, TypeScript, Chakra UI',
        accent: 'coral',
      },
    ]

    for (const project of projectValues) {
      const record = new Record(projects)
      record.set('sort', project.sort)
      record.set('name', project.name)
      record.set('summary', project.summary)
      record.set('href', project.href)
      record.set('tags', project.tags)
      record.set('accent', project.accent)
      app.save(record)
    }

    const experienceValues = [
      {
        sort: 1,
        role: 'Senior Software Consultant',
        company: 'Pariveda Solutions',
        start_label: 'March 2021',
        end_label: 'Present',
        summary:
          'I work with clients across industries to solve complex business problems through technology, often stepping into new domains and toolchains quickly to move projects forward.',
        bullets:
          'Worked across multiple industries solving complex business problems with custom software solutions.\nBuilt Python integrations between healthcare systems that improved patient interaction time by 5 to 10 percent.\nImplemented a large-scale customer data consolidation effort for an international hotel brand.\nUsed Azure serverless functions, Azure API for FHIR, and Data Lake services in production delivery.\nDesigned and integrated internal and external REST APIs across varied enterprise environments.\nMentored junior teammates and supported Agile delivery across cross-functional teams.',
      },
      {
        sort: 2,
        role: 'Implementation Consultant',
        company: 'FAST Enterprises',
        start_label: 'July 2019',
        end_label: 'March 2021',
        summary:
          'I gathered requirements directly from clients, translated business needs into product changes, and delivered features that supported large-scale public services.',
        bullets:
          "Implemented features for an online driver services portal serving millions of Georgia taxpayers.\nHelped meet Arkansas' legislative deadline for its first watercraft title issuance system.\nBuilt product features with VB.Net and SQL on the back end alongside internal front-end tooling.\nWorked closely with stakeholders to refine requirements and improve the taxpayer experience.",
      },
      {
        sort: 3,
        role: 'Software Engineering Intern',
        company: 'CGI Federal',
        start_label: 'June 2018',
        end_label: 'August 2018',
        summary:
          'I built internal tools for DevOps visibility, including a dashboard for system health and automation that reduced downtime for adjacent workflows.',
        bullets:
          'Developed a React dashboard that surfaced real-time system data from a REST API.\nCreated Python scripts that reduced downtime by 20 percent for an internal video conversion tool.\nBuilt and maintained a Windows Server test environment with Apache Web Server.\nUsed Git and code review workflows as part of an Agile team.',
      },
      {
        sort: 4,
        role: 'IT Intern',
        company: 'International Paper',
        start_label: 'May 2017',
        end_label: 'August 2017',
        summary:
          'I helped ship the initial interface foundation for an internal application that centralized data from multiple systems to improve operational responsiveness.',
        bullets:
          'Designed and built the UI foundation for an internal operations application.\nDeveloped with JavaScript, HTML5, CSS3, jQuery, webMethods, and SQL.',
      },
    ]

    for (const job of experienceValues) {
      const record = new Record(experience)
      record.set('sort', job.sort)
      record.set('role', job.role)
      record.set('company', job.company)
      record.set('start_label', job.start_label)
      record.set('end_label', job.end_label)
      record.set('summary', job.summary)
      record.set('bullets', job.bullets)
      app.save(record)
    }
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
