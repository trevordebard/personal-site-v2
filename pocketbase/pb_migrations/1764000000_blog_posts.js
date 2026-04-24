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
          required: true,
          max: 320,
        },
        {
          name: 'seo_description',
          type: 'text',
          required: true,
          max: 320,
        },
        {
          name: 'hero_eyebrow',
          type: 'text',
          required: true,
          max: 80,
        },
        {
          name: 'hero_summary',
          type: 'text',
          required: true,
          max: 500,
        },
        {
          name: 'published_at',
          type: 'date',
          required: true,
        },
        {
          name: 'read_time_minutes',
          type: 'number',
          required: true,
          min: 1,
          max: 60,
          onlyInt: true,
        },
        {
          name: 'tags',
          type: 'text',
          required: true,
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

    const firstPost = new Record(blogPosts)
    firstPost.set('slug', 'designing-pocketbase-content-for-a-fast-personal-site')
    firstPost.set('title', 'Designing PocketBase content for a fast personal site')
    firstPost.set(
      'excerpt',
      'A practical content model for publishing markdown posts from PocketBase without turning a portfolio into a heavyweight CMS build.',
    )
    firstPost.set(
      'seo_description',
      'How to structure PocketBase collections and a frontend rendering path so blog posts publish instantly without redeploying the site.',
    )
    firstPost.set('hero_eyebrow', 'System design / content pipeline')
    firstPost.set(
      'hero_summary',
      'The site should behave like product software, not like a static brochure. That means content changes need to travel through a durable backend model while the frontend stays lean and cache-friendly.',
    )
    firstPost.set('published_at', '2026-04-20 13:00:00.000Z')
    firstPost.set('read_time_minutes', 7)
    firstPost.set('tags', 'PocketBase, TanStack Start, Markdown, Performance')
    firstPost.set('status', 'published')
    firstPost.set('featured', true)
    firstPost.set(
      'markdown',
      `## Why this stack

For a personal site with technical writing, the fastest setup is often:

- a frontend that renders layout and metadata
- a backend collection that stores markdown and post metadata
- runtime fetching so a new post appears as soon as it is published

That avoids coupling content updates to frontend deploys.

## The content model

I want the backend record to own:

- slug
- title
- excerpt
- SEO description
- published date
- read time
- tags
- featured state
- markdown body

That is enough to power the blog index, the article page, and social previews without overdesigning the schema.

## Performance implications

The frontend should fetch only what the route needs:

### Blog index

- title
- excerpt
- tags
- publish date

### Article page

- full markdown
- SEO metadata

By keeping the blog shell static and the content dynamic, the site remains quick while still letting the backend act like a CMS.
`,
    )
    app.save(firstPost)

    const secondPost = new Record(blogPosts)
    secondPost.set('slug', 'making-technical-writing-feel-native-to-a-portfolio')
    secondPost.set('title', 'Making technical writing feel native to a portfolio')
    secondPost.set(
      'excerpt',
      'A blog should look like part of the site’s product language, not a bolted-on template that ignores the rest of the brand.',
    )
    secondPost.set(
      'seo_description',
      'Notes on designing a technical blog that feels integrated with a portfolio while staying readable, shareable, and lightweight.',
    )
    secondPost.set('hero_eyebrow', 'Editorial design / frontend')
    secondPost.set(
      'hero_summary',
      'Technical posts still need opinionated visual structure. Good typography, scannable metadata, and a restrained component system do more for readability than adding a full documentation stack.',
    )
    secondPost.set('published_at', '2026-04-08 13:00:00.000Z')
    secondPost.set('read_time_minutes', 5)
    secondPost.set('tags', 'Design, Writing, Frontend')
    secondPost.set('status', 'published')
    secondPost.set('featured', false)
    secondPost.set(
      'markdown',
      `## The problem

A lot of personal sites add a blog late and the result feels disconnected:

- one visual language for the homepage
- another for articles
- almost no thought given to scanning or sharing

## A better direction

The blog should inherit the same voice as the rest of the site, but use a more editorial rhythm:

1. Bigger title treatment
2. Stronger metadata hierarchy
3. Narrower reading column
4. Cleaner code and quote treatment
`,
    )
    app.save(secondPost)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('blog_posts')
    app.delete(collection)
  },
)
