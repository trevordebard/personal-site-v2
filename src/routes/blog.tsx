import {
	createFileRoute,
	Link,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { Clock3 } from "lucide-react";
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
	const { posts } = Route.useLoaderData();

	return (
		<main className="blog-index-page">
			<section className="blog-index-shell">
				<header className="blog-index-header">
					<h1>Blog</h1>
					<p>{posts.length === 1 ? "1 post" : `${posts.length} posts`}</p>
				</header>

				<div className="blog-post-list">
					{posts.map((post) => (
						<Link
							className="blog-post-row"
							key={post.slug}
							params={{ slug: post.slug }}
							to="/blog/$slug"
						>
							<PostMeta
								publishedAt={post.publishedAt}
								readTimeMinutes={post.readTimeMinutes}
							/>
							<h2 className="blog-post-title">{post.title}</h2>
							{post.excerpt ? (
								<p className="blog-post-excerpt">{post.excerpt}</p>
							) : null}
						</Link>
					))}
				</div>
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

function formatDate(value: string) {
	return new Intl.DateTimeFormat("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	}).format(new Date(value));
}
