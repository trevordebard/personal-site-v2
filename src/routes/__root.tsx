import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRoute,
	HeadContent,
	Link,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Trevor DeBardeleben | Senior Software Consultant",
			},
			{
				name: "description",
				content:
					"Homepage for Trevor DeBardeleben, a senior software consultant in Atlanta focused on product engineering, integration-heavy systems, and pragmatic technical delivery.",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg",
			},
			{
				rel: "alternate icon",
				href: "/favicon.ico",
			},
			{
				rel: "apple-touch-icon",
				href: "/logo192.png",
			},
		],
	}),
	notFoundComponent: NotFound,
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}

function NotFound() {
	return (
		<main className="not-found-page">
			<section className="not-found-panel">
				<p className="eyebrow">Not found</p>
				<h1>That page is not available.</h1>
				<p>
					The link may be outdated, or the article may not be published yet.
				</p>
				<div className="hero-actions">
					<Link className="action-link" to="/blog">
						View Blog
					</Link>
					<Link className="action-link" to="/">
						Go Home
					</Link>
				</div>
			</section>
		</main>
	);
}
