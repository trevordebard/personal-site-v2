export type BlogPost = {
	slug: string;
	title: string;
	excerpt?: string;
	seoDescription?: string;
	heroEyebrow?: string;
	heroSummary?: string;
	publishingNote?: string;
	publishedAt?: string;
	readTimeMinutes?: number;
	tags: string[];
	featured: boolean;
	markdown: string;
};

export type BlogPostSummary = Omit<BlogPost, "markdown">;

export const defaultBlogPosts: BlogPost[] = [
	{
		slug: "designing-pocketbase-content-for-a-fast-personal-site",
		title: "Designing PocketBase content for a fast personal site",
		excerpt:
			"A practical content model for publishing markdown posts from PocketBase without turning a portfolio into a heavyweight CMS build.",
		seoDescription:
			"How to structure PocketBase collections and a frontend rendering path so blog posts publish instantly without redeploying the site.",
		heroEyebrow: "System design / content pipeline",
		heroSummary:
			"The site should behave like product software, not like a static brochure. That means content changes need to travel through a durable backend model while the frontend stays lean and cache-friendly.",
		publishedAt: "2026-04-20T13:00:00.000Z",
		readTimeMinutes: 7,
		tags: ["PocketBase", "TanStack Start", "Markdown", "Performance"],
		featured: true,
		markdown: `## Why this stack

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

## Operational benefit

The real win is not technical novelty. It is workflow speed.

When a post is ready in PocketBase, publishing it should be the last step. No rebuild, no redeploy, no touching frontend code.
`,
	},
	{
		slug: "making-technical-writing-feel-native-to-a-portfolio",
		title: "Making technical writing feel native to a portfolio",
		excerpt:
			"A blog should look like part of the site’s product language, not a bolted-on template that ignores the rest of the brand.",
		seoDescription:
			"Notes on designing a technical blog that feels integrated with a portfolio while staying readable, shareable, and lightweight.",
		heroEyebrow: "Editorial design / frontend",
		heroSummary:
			"Technical posts still need opinionated visual structure. Good typography, scannable metadata, and a restrained component system do more for readability than adding a full documentation stack.",
		publishedAt: "2026-04-08T13:00:00.000Z",
		readTimeMinutes: 5,
		tags: ["Design", "Writing", "Frontend"],
		featured: false,
		markdown: `## The problem

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

## What matters most

Technical writing pages do not need a giant framework to feel good. They need:

- strong typography
- predictable spacing
- accurate metadata
- fast page loads

Everything else is secondary.
`,
	},
];

export const defaultBlogSummaries: BlogPostSummary[] = defaultBlogPosts.map(
	({ markdown: _markdown, ...post }) => post,
);
