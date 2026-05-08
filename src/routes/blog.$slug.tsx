import { createFileRoute, notFound } from "@tanstack/react-router";
import { Clock3 } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { getBlogPostBySlug } from "../lib/blog-content";

let mermaidRenderCount = 0;

export const Route = createFileRoute("/blog/$slug")({
	loader: async ({ params }) => {
		const data = await getBlogPostBySlug({
			data: { slug: params.slug },
		});

		if (!data) {
			throw notFound();
		}

		return data;
	},
	head: ({ loaderData }) => ({
		meta: [
			{
				title: `${loaderData?.post.title ?? "Blog"} | Trevor DeBardeleben`,
			},
			{
				name: "description",
				content:
					loaderData?.post.seoDescription ??
					"Technical writing by Trevor DeBardeleben.",
			},
			{
				property: "og:title",
				content: loaderData?.post.title ?? "Trevor DeBardeleben blog",
			},
			{
				property: "og:description",
				content:
					loaderData?.post.seoDescription ??
					"Technical writing by Trevor DeBardeleben.",
			},
			{
				property: "og:type",
				content: "article",
			},
			{
				property: "og:url",
				content: loaderData?.canonicalUrl ?? "",
			},
		],
	}),
	component: BlogPostPage,
});

function BlogPostPage() {
	const { html, post, tableOfContents } = Route.useLoaderData();
	const [activeHeadingId, setActiveHeadingId] = useState(
		tableOfContents[0]?.id ?? "",
	);

	useEffect(() => {
		if (tableOfContents.length === 0) {
			return;
		}

		const hashId = decodeURIComponent(window.location.hash.slice(1));

		if (hashId) {
			setActiveHeadingId(hashId);
		}

		const headings = tableOfContents
			.map(({ id }) => document.getElementById(id))
			.filter(
				(heading): heading is HTMLElement => heading instanceof HTMLElement,
			);

		if (headings.length === 0) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const visibleEntry = entries
					.filter((entry) => entry.isIntersecting)
					.sort(
						(left, right) =>
							left.boundingClientRect.top - right.boundingClientRect.top,
					)[0];

				if (visibleEntry?.target.id) {
					setActiveHeadingId(visibleEntry.target.id);
				}
			},
			{
				rootMargin: "-18% 0px -65% 0px",
				threshold: [0, 1],
			},
		);

		for (const heading of headings) {
			observer.observe(heading);
		}

		const handleHashChange = () => {
			const nextHashId = decodeURIComponent(window.location.hash.slice(1));

			if (nextHashId) {
				setActiveHeadingId(nextHashId);
			}
		};

		window.addEventListener("hashchange", handleHashChange);

		return () => {
			observer.disconnect();
			window.removeEventListener("hashchange", handleHashChange);
		};
	}, [tableOfContents]);

	return (
		<main className="article-page">
			<section className="article-shell">
				<header className="article-header">
					<h1>{post.title}</h1>
					<ArticleMeta
						publishedAt={post.publishedAt}
						readTimeMinutes={post.readTimeMinutes}
					/>

					<TagList tags={post.tags} />
				</header>

				<div className="article-layout">
					<ArticleContent html={html} />

					<aside className="article-sidebar">
						{tableOfContents.length > 0 ? (
							<nav aria-label="Table of contents" className="article-toc-card">
								<p className="blog-kicker">On this page</p>
								<div className="article-toc-list">
									{tableOfContents.map((heading) => (
										<a
											className={`article-toc-link article-toc-depth-${heading.depth}${activeHeadingId === heading.id ? " is-active" : ""}`}
											href={`#${heading.id}`}
											key={heading.id}
										>
											{heading.text}
										</a>
									))}
								</div>
							</nav>
						) : null}
					</aside>
				</div>
			</section>
		</main>
	);
}

const ArticleContent = memo(function ArticleContent({
	html,
}: {
	html: string;
}) {
	const articleRef = useRef<HTMLElement>(null);

	useEffect(() => {
		if (!html) {
			return;
		}

		const mermaidNodes = Array.from(
			articleRef.current?.querySelectorAll<HTMLElement>(".mermaid") ?? [],
		);

		if (mermaidNodes.length === 0) {
			return;
		}

		let isMounted = true;

		const renderMermaid = async () => {
			const { default: mermaid } = await import("mermaid");

			if (!isMounted) {
				return;
			}

			mermaid.initialize({
				startOnLoad: false,
				securityLevel: "strict",
				theme: "base",
				themeVariables: {
					background: "transparent",
					fontFamily: "IBM Plex Mono, monospace",
					lineColor: "#8f6e49",
					primaryBorderColor: "#8f6e49",
					primaryColor: "#fff8ef",
					primaryTextColor: "#2d261c",
					secondaryColor: "#f3dfc3",
					tertiaryColor: "#f8efe2",
				},
			});

			await Promise.all(
				mermaidNodes.map(async (node) => {
					const source = node.dataset.mermaidSource ?? node.textContent?.trim();

					if (!source) {
						return;
					}

					node.dataset.mermaidSource = source;

					try {
						const { svg } = await mermaid.render(
							`article-mermaid-${mermaidRenderCount++}`,
							source,
						);

						node.innerHTML = svg;
						node.classList.remove("mermaid");
						node.removeAttribute("data-mermaid-pending");
						node.removeAttribute("data-mermaid-error");
						node.setAttribute("data-mermaid-rendered", "true");
					} catch (error) {
						node.classList.remove("mermaid");
						node.removeAttribute("data-mermaid-pending");
						node.setAttribute("data-mermaid-error", "true");
						node.textContent =
							error instanceof Error
								? `Mermaid failed to render: ${error.message}`
								: "Mermaid failed to render.";
						console.error("Failed to render Mermaid diagram:", error);
					}
				}),
			);
		};

		renderMermaid().catch((error) => {
			console.error("Failed to render Mermaid diagram:", error);
		});

		return () => {
			isMounted = false;
		};
	}, [html]);

	return (
		<article
			className="article-prose"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: markdown is authored in PocketBase admin and rendered server-side for article content
			dangerouslySetInnerHTML={{ __html: html }}
			ref={articleRef}
		/>
	);
});

function ArticleMeta({
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
		<div className="article-meta-row">
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
