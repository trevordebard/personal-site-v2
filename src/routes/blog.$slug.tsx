import { useEffect, useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Clock3, Copy, Linkedin, Mail, Twitter } from "lucide-react";
import { getBlogPostBySlug } from "../lib/blog-content";

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
	const { canonicalUrl, html, post, tableOfContents } = Route.useLoaderData();
	const [activeHeadingId, setActiveHeadingId] = useState(
		tableOfContents[0]?.id ?? "",
	);
	const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
		"idle",
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
			.filter((heading): heading is HTMLElement => heading instanceof HTMLElement);

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

	const shareLinks = [
		{
			href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(post.title)}`,
			label: "Share on X",
			icon: <Twitter size={16} />,
		},
		{
			href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}`,
			label: "Share on LinkedIn",
			icon: <Linkedin size={16} />,
		},
		{
			href: `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(canonicalUrl)}`,
			label: "Share by email",
			icon: <Mail size={16} />,
		},
	];

	useEffect(() => {
		if (copyStatus === "idle") {
			return;
		}

		const timeoutId = window.setTimeout(() => {
			setCopyStatus("idle");
		}, 1800);

		return () => window.clearTimeout(timeoutId);
	}, [copyStatus]);

	function copyWithExecCommand(value: string) {
		const textarea = document.createElement("textarea");
		textarea.value = value;
		textarea.setAttribute("readonly", "");
		textarea.style.position = "absolute";
		textarea.style.left = "-9999px";

		document.body.appendChild(textarea);
		textarea.select();

		const copied = document.execCommand("copy");

		document.body.removeChild(textarea);

		return copied;
	}

	async function handleCopyLink() {
		try {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(canonicalUrl);
			} else if (!copyWithExecCommand(canonicalUrl)) {
				throw new Error("Copy command was rejected.");
			}

			setCopyStatus("copied");
		} catch {
			setCopyStatus(copyWithExecCommand(canonicalUrl) ? "copied" : "error");
		}
	}

	return (
		<main className="article-page">
			<section className="article-shell">
				<header className="article-header">
					<p className="blog-kicker">{post.heroEyebrow}</p>
					<h1>{post.title}</h1>
					<p className="article-summary">{post.heroSummary}</p>

					<div className="article-meta-row">
						<span>{formatDate(post.publishedAt)}</span>
						<span>
							<Clock3 size={15} />
							{post.readTimeMinutes} min read
						</span>
					</div>

					<div className="tag-list">
						{post.tags.map((tag) => (
							<span className="tag" key={tag}>
								{tag}
							</span>
						))}
					</div>
				</header>

				<div className="article-layout">
					<article
						className="article-prose"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: markdown is authored in PocketBase admin and rendered server-side for article content
						dangerouslySetInnerHTML={{ __html: html }}
					/>

					<aside className="article-sidebar">
						{tableOfContents.length > 0 ? (
							<nav
								aria-label="Table of contents"
								className="article-share-card article-toc-card"
							>
								<p className="blog-kicker">On this page</p>
								<div className="article-toc-list" role="list">
									{tableOfContents.map((heading) => (
										<a
											className={`article-toc-link article-toc-depth-${heading.depth}${activeHeadingId === heading.id ? " is-active" : ""}`}
											href={`#${heading.id}`}
											key={heading.id}
											role="listitem"
										>
											{heading.text}
										</a>
									))}
								</div>
							</nav>
						) : null}

						<div className="article-share-card">
							<p className="blog-kicker">Share</p>
							<div className="article-share-links">
								{shareLinks.map((link) => (
									<a
										href={link.href}
										key={link.label}
										rel="noreferrer"
										target="_blank"
									>
										{link.icon}
										{link.label}
									</a>
								))}
								<button
									className={`article-share-action${copyStatus === "copied" ? " is-success" : ""}${copyStatus === "error" ? " is-error" : ""}`}
									onClick={handleCopyLink}
									type="button"
								>
									<Copy size={16} />
									{copyStatus === "copied"
										? "Link copied"
										: copyStatus === "error"
											? "Copy failed"
											: "Copy link"}
								</button>
							</div>
						</div>

						{post.publishingNote ? (
							<div className="article-share-card article-note-card">
								<p className="blog-kicker">Publishing note</p>
								<p>{post.publishingNote}</p>
							</div>
						) : null}
					</aside>
				</div>
			</section>
		</main>
	);
}

function formatDate(value: string) {
	return new Intl.DateTimeFormat("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	}).format(new Date(value));
}
