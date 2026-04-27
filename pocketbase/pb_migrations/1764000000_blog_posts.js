migrate(
  (app) => {
    const blogPosts = new Collection({
      type: 'base',
      name: 'blog_posts',
      listRule: 'status = "published"',
      viewRule: 'status = "published"',
      fields: [
        {
          name: 'slug',
          type: 'text',
          required: true,
          presentable: true,
          min: 1,
          max: 140,
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          max: 180,
        },
        {
          name: 'excerpt',
          type: 'text',
          required: false,
          max: 320,
        },
        {
          name: 'seo_description',
          type: 'text',
          required: false,
          max: 320,
        },
        {
          name: 'hero_eyebrow',
          type: 'text',
          required: false,
          max: 80,
        },
        {
          name: 'hero_summary',
          type: 'text',
          required: false,
          max: 500,
        },
        {
          name: 'published_at',
          type: 'date',
          required: false,
        },
        {
          name: 'read_time_minutes',
          type: 'number',
          required: false,
          min: 1,
          max: 60,
          onlyInt: true,
        },
        {
          name: 'tags',
          type: 'text',
          required: false,
          max: 300,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['draft', 'published'],
        },
        {
          name: 'featured',
          type: 'bool',
          required: false,
        },
        {
          name: 'markdown',
          type: 'text',
          required: true,
          max: 50000,
        },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_blog_posts_slug ON blog_posts (slug)'],
    })
    app.save(blogPosts)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('blog_posts')
    app.delete(collection)
  },
)
