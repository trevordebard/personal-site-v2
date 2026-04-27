import {
	createFileRoute,
	Link,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { ArrowRight, Clock3 } from "lucide-react";
import { getBlogIndexContent } from "../lib/blog-content";

export const Route = createFileRoute("/blog")({
	loader: async () => getBlogIndexContent(),
	head: () => ({
		meta: [
			{
				title: "Blog | Trevor DeBardeleben",
			},
			{
				name: "description",
				content:
					"Technical writing on product engineering, integrations, architecture, and practical frontend/backend delivery.",
			},
		],
	}),
	component: BlogRouteShell,
});

function BlogRouteShell() {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});

	if (pathname !== "/blog") {
		return <Outlet />;
	}

	return <BlogIndexPage />;
}

function BlogIndexPage() {
	const { intro, posts } = Route.useLoaderData();
	const [featuredPost, ...archivePosts] = posts;

	return (
		<main className="blog-page">
			<section className="blog-hero-shell">
				<div className="blog-hero-grid">
					<div className="blog-hero-copy">
						<p className="blog-kicker">Technical writing</p>
						<h1>
							Notes on systems, shipping, and the decisions underneath them.
						</h1>
						<p className="blog-hero-body">{intro}</p>
						<div className="blog-hero-points">
							<span>Runtime-fetched from PocketBase</span>
							<span>Markdown-first publishing</span>
							<span>No frontend redeploy for new posts</span>
						</div>
					</div>

					{featuredPost ? (
						<article className="featured-post-card">
							<p className="featured-label">Featured article</p>
							<h2>{featuredPost.title}</h2>
							{featuredPost.heroSummary ? (
								<p>{featuredPost.heroSummary}</p>
							) : null}
							<PostMeta
								publishedAt={featuredPost.publishedAt}
								readTimeMinutes={featuredPost.readTimeMinutes}
							/>
							<TagList tags={featuredPost.tags} />
							<Link
								className="blog-primary-link"
								params={{ slug: featuredPost.slug }}
								to="/blog/$slug"
							>
								Read article
								<ArrowRight size={16} />
							</Link>
						</article>
					) : null}
				</div>
			</section>

			<section className="blog-list-shell">
				<div className="blog-section-heading">
					<p className="blog-kicker">Archive</p>
					<h2>Built for ongoing publishing, not one-off updates.</h2>
				</div>

				<div className="blog-list">
					{posts.map((post) => (
						<Link
							className="blog-card"
							key={post.slug}
							params={{ slug: post.slug }}
							to="/blog/$slug"
						>
							{post.heroEyebrow || post.featured ? (
								<div className="blog-card-topline">
									{post.heroEyebrow ? <span>{post.heroEyebrow}</span> : null}
									{post.featured ? <strong>Featured</strong> : null}
								</div>
							) : null}
							<h3>{post.title}</h3>
							{post.excerpt ? <p>{post.excerpt}</p> : null}
							<PostMeta
								publishedAt={post.publishedAt}
								readTimeMinutes={post.readTimeMinutes}
							/>
							<TagList tags={post.tags} />
						</Link>
					))}
				</div>

				{archivePosts.length > 0 ? (
					<aside className="blog-system-note">
						<p className="blog-kicker">Publishing model</p>
						<h3>PocketBase can own the content lifecycle.</h3>
						<p>
							Use a `blog_posts` collection with slug, excerpt, SEO metadata,
							publish date, tags, and markdown. The frontend fetches published
							records at request time, so adding a post in the backend does not
							require a new deploy.
						</p>
					</aside>
				) : null}
			</section>
		</main>
	);
}

function PostMeta({
	publishedAt,
	readTimeMinutes,
}: {
	publishedAt?: string;
	readTimeMinutes?: number;
}) {
	if (!publishedAt && !readTimeMinutes) {
		return null;
	}

	return (
		<div className="post-meta-row">
			{publishedAt ? <span>{formatDate(publishedAt)}</span> : null}
			{readTimeMinutes ? (
				<span>
					<Clock3 size={15} />
					{readTimeMinutes} min read
				</span>
			) : null}
		</div>
	);
}

function TagList({ tags }: { tags: string[] }) {
	if (tags.length === 0) {
		return null;
	}

	return (
		<div className="tag-list">
			{tags.map((tag) => (
				<span className="tag" key={tag}>
					{tag}
				</span>
			))}
		</div>
	);
}

function formatDate(value: string) {
	return new Intl.DateTimeFormat("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	}).format(new Date(value));
}
