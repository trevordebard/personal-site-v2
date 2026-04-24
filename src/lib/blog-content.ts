import { createServerFn } from "@tanstack/react-start";
import { marked } from "marked";
import {
	type BlogPost,
	type BlogPostSummary,
	defaultBlogPosts,
	defaultBlogSummaries,
} from "../data/blog";

type PocketBaseListResponse<T> = {
	items: T[];
};

type BlogPostRecord = {
	slug: string;
	title: string;
	excerpt: string;
	seo_description?: string;
	hero_eyebrow?: string;
	hero_summary?: string;
	publishing_note?: string;
	published_at: string;
	read_time_minutes?: number;
	tags?: string;
	featured?: boolean;
	markdown: string;
	status?: string;
};

type BlogPostPageData = {
	post: BlogPost;
	html: string;
	canonicalUrl: string;
	tableOfContents: BlogPostHeading[];
};

type BlogIndexData = {
	intro: string;
	posts: BlogPostSummary[];
};

export type BlogPostHeading = {
	id: string;
	text: string;
	depth: number;
};

marked.setOptions({
	gfm: true,
	breaks: false,
});

function getPocketBaseBaseUrl() {
	return process.env.POCKETBASE_URL ?? "http://127.0.0.1:8090";
}

function getSiteUrl() {
	return process.env.SITE_URL ?? "https://trevordebard.com";
}

async function fetchPocketBaseList<T>(
	collection: string,
	query: Record<string, string> = {},
): Promise<T[]> {
	const url = new URL(
		`/api/collections/${collection}/records`,
		getPocketBaseBaseUrl(),
	);

	for (const [key, value] of Object.entries(query)) {
		url.searchParams.set(key, value);
	}

	const response = await fetch(url, {
		cache: "no-store",
		headers: {
			Accept: "application/json",
		},
	});

	if (!response.ok) {
		throw new Error(
			`PocketBase request failed for ${collection}: ${response.status}`,
		);
	}

	const data = (await response.json()) as PocketBaseListResponse<T>;

	return data.items;
}

function splitTags(tags?: string) {
	return (tags ?? "")
		.split(/[\n,]/)
		.map((tag) => tag.trim())
		.filter(Boolean);
}

function toBlogPost(record: BlogPostRecord): BlogPost {
	return {
		slug: record.slug,
		title: record.title,
		excerpt: record.excerpt,
		seoDescription: record.seo_description?.trim() || record.excerpt,
		heroEyebrow: record.hero_eyebrow?.trim() || "Technical writing",
		heroSummary: record.hero_summary?.trim() || record.excerpt,
		publishingNote: record.publishing_note?.trim() || undefined,
		publishedAt: record.published_at,
		readTimeMinutes: record.read_time_minutes ?? 5,
		tags: splitTags(record.tags),
		featured: Boolean(record.featured),
		markdown: record.markdown,
	};
}

function createHeadingId(text: string, counts: Map<string, number>) {
	const baseId =
		text
			.normalize("NFKD")
			.toLowerCase()
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "") || "section";

	const nextCount = (counts.get(baseId) ?? 0) + 1;
	counts.set(baseId, nextCount);

	return nextCount === 1 ? baseId : `${baseId}-${nextCount}`;
}

function renderMarkdown(markdown: string) {
	const tokens = marked.lexer(markdown);
	const slugCounts = new Map<string, number>();
	const headingQueue: BlogPostHeading[] = [];
	const tableOfContents: BlogPostHeading[] = [];
	const textRenderer = new marked.TextRenderer();

	for (const token of tokens) {
		if (token.type !== "heading") {
			continue;
		}

		const plainText = marked.Parser.parseInline(token.tokens, {
			renderer: textRenderer,
		}).trim();

		const heading = {
			id: createHeadingId(plainText, slugCounts),
			text: plainText,
			depth: token.depth,
		};

		headingQueue.push(heading);

		if (token.depth >= 2 && token.depth <= 3) {
			tableOfContents.push(heading);
		}
	}

	const renderer = new marked.Renderer();

	renderer.heading = ({ depth, tokens }) => {
		const heading = headingQueue.shift();
		const content = renderer.parser.parseInline(tokens);
		const id = heading?.id ?? createHeadingId(content, slugCounts);

		return `<h${depth} id="${id}">${content}</h${depth}>`;
	};

	return {
		html: marked.parser(tokens, { renderer }) as string,
		tableOfContents,
	};
}

async function loadBlogPosts(): Promise<BlogPost[]> {
	const records = await fetchPocketBaseList<BlogPostRecord>("blog_posts", {
		filter: 'status = "published"',
		sort: "-published_at",
		perPage: "50",
		fields:
			"slug,title,excerpt,seo_description,hero_eyebrow,hero_summary,publishing_note,published_at,read_time_minutes,tags,featured,markdown,status",
	});

	if (records.length === 0) {
		return defaultBlogPosts;
	}

	return records.map(toBlogPost);
}

export const getBlogIndexContent = createServerFn({
	method: "GET",
}).handler(async (): Promise<BlogIndexData> => {
	try {
		const posts = await loadBlogPosts();

		return {
			intro:
				"A technical blog should publish as quickly as a database record changes. This layout is designed for fast scanning, strong metadata, and markdown-driven posts from PocketBase.",
			posts: posts.map(({ markdown: _markdown, ...post }) => post),
		};
	} catch (error) {
		console.error("Failed to load blog posts from PocketBase:", error);

		return {
			intro:
				"A technical blog should publish as quickly as a database record changes. This layout is designed for fast scanning, strong metadata, and markdown-driven posts from PocketBase.",
			posts: defaultBlogSummaries,
		};
	}
});

export const getBlogPostBySlug = createServerFn({ method: "GET" })
	.inputValidator((data: { slug: string }) => data)
	.handler(async ({ data }): Promise<BlogPostPageData | null> => {
		try {
			const records = await fetchPocketBaseList<BlogPostRecord>("blog_posts", {
				filter: `slug = "${data.slug}" && status = "published"`,
				perPage: "1",
				fields:
					"slug,title,excerpt,seo_description,hero_eyebrow,hero_summary,publishing_note,published_at,read_time_minutes,tags,featured,markdown,status",
			});

			const record = records[0];

			if (!record) {
				const fallback = defaultBlogPosts.find(
					(post) => post.slug === data.slug,
				);

				if (!fallback) {
					return null;
				}

				return {
					post: fallback,
					...renderMarkdown(fallback.markdown),
					canonicalUrl: `${getSiteUrl()}/blog/${fallback.slug}`,
				};
			}

			const post = toBlogPost(record);

			return {
				post,
				...renderMarkdown(post.markdown),
				canonicalUrl: `${getSiteUrl()}/blog/${post.slug}`,
			};
		} catch (error) {
			console.error(
				`Failed to load blog post "${data.slug}" from PocketBase:`,
				error,
			);

			const fallback = defaultBlogPosts.find((post) => post.slug === data.slug);

			if (!fallback) {
				return null;
			}

			return {
				post: fallback,
				...renderMarkdown(fallback.markdown),
				canonicalUrl: `${getSiteUrl()}/blog/${fallback.slug}`,
			};
		}
	});
