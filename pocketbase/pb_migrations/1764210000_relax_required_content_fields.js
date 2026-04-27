migrate(
  (app) => {
    const optionalFieldsByCollection = {
      homepage_settings: [
        'hero_eyebrow',
        'greeting',
        'location',
        'availability',
        'title',
        'intro',
        'resume_url',
        'email',
        'github_url',
        'projects_intro',
        'experience_intro',
        'closing_eyebrow',
        'closing_title',
        'closing_body',
        'focus_heading',
        'projects_eyebrow',
        'projects_heading',
        'experience_eyebrow',
        'experience_heading',
      ],
      homepage_focus_items: ['body'],
      homepage_stats: ['value', 'label'],
      projects: ['summary', 'href', 'tags', 'accent'],
      experience: ['company', 'start_label', 'end_label', 'summary', 'bullets'],
      blog_posts: [
        'excerpt',
        'seo_description',
        'hero_eyebrow',
        'hero_summary',
        'published_at',
        'read_time_minutes',
        'tags',
      ],
    }

    for (const [collectionName, fieldNames] of Object.entries(optionalFieldsByCollection)) {
      const collection = app.findCollectionByNameOrId(collectionName)

      for (const fieldName of fieldNames) {
        const field = collection.fields.getByName(fieldName)
        field.required = false
      }

      app.save(collection)
    }
  },
  (app) => {
    const requiredFieldsByCollection = {
      homepage_settings: [
        'hero_eyebrow',
        'greeting',
        'location',
        'availability',
        'title',
        'intro',
        'resume_url',
        'email',
        'github_url',
        'projects_intro',
        'experience_intro',
        'closing_eyebrow',
        'closing_title',
        'closing_body',
        'focus_heading',
        'projects_eyebrow',
        'projects_heading',
        'experience_eyebrow',
        'experience_heading',
      ],
      homepage_focus_items: ['body'],
      homepage_stats: ['value', 'label'],
      projects: ['summary', 'href', 'tags', 'accent'],
      experience: ['company', 'start_label', 'end_label', 'summary', 'bullets'],
      blog_posts: [
        'excerpt',
        'seo_description',
        'hero_eyebrow',
        'hero_summary',
        'published_at',
        'read_time_minutes',
        'tags',
      ],
    }

    for (const [collectionName, fieldNames] of Object.entries(requiredFieldsByCollection)) {
      const collection = app.findCollectionByNameOrId(collectionName)

      for (const fieldName of fieldNames) {
        const field = collection.fields.getByName(fieldName)
        field.required = true
      }

      app.save(collection)
    }
  },
)
