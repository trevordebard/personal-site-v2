import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [
			{
				title: "Under Construction",
			},
			{
				name: "description",
				content: "This site is currently under construction.",
			},
		],
	}),
	component: UnderConstruction,
});

function UnderConstruction() {
	return (
		<main className="construction-page">
			<h1>Under Construction</h1>
		</main>
	);
}
