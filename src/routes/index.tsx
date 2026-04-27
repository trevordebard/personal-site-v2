import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowUpRight,
	BriefcaseBusiness,
	Github,
	Mail,
	MapPin,
	NotebookPen,
} from "lucide-react";
import type { Project } from "../data/home";
import { getHomepageContent } from "../lib/homepage-content";

export const Route = createFileRoute("/")({
	loader: async () => getHomepageContent(),
	head: () => ({
		meta: [
			{
				title: "Trevor DeBardeleben",
			},
		],
	}),
	component: Home,
});

function Home() {
	const content = Route.useLoaderData();
	const { experience, focusItems, profile, projects, stats } = content;
	const heroMetaItems: Array<{ icon: React.ReactNode; label: string }> = [];
	const heroActions: Array<{
		href: string;
		label: string;
		icon: React.ReactNode;
		external?: boolean;
	}> = [
		{
			href: "/blog",
			label: "Blog",
			icon: <NotebookPen size={16} />,
			external: false,
		},
	];

	if (profile.location) {
		heroMetaItems.push({
			icon: <MapPin size={16} />,
			label: profile.location,
		});
	}

	if (profile.availability) {
		heroMetaItems.push({
			icon: <BriefcaseBusiness size={16} />,
			label: profile.availability,
		});
	}

	if (profile.resume) {
		heroActions.unshift({
			href: profile.resume,
			label: "Resume",
			icon: <ArrowUpRight size={16} />,
		});
	}

	if (profile.email) {
		heroActions.push({
			href: `mailto:${profile.email}`,
			label: "Email",
			icon: <Mail size={16} />,
		});
	}

	if (profile.github) {
		heroActions.push({
			href: profile.github,
			label: "GitHub",
			icon: <Github size={16} />,
		});
	}

	return (
		<main className="bg-[var(--surface)] text-[var(--ink)]">
			<section className="hero-shell">
				<div className="hero-grid">
					<div className="hero-copy">
						{profile.heroEyebrow ? (
							<p className="eyebrow">{profile.heroEyebrow}</p>
						) : null}
						{profile.greeting ? (
							<h1 className="hero-title">{profile.greeting}</h1>
						) : null}
						{heroMetaItems.length > 0 ? (
							<div className="hero-meta">
								{heroMetaItems.map((item) => (
									<span key={item.label}>
										{item.icon}
										{item.label}
									</span>
								))}
							</div>
						) : null}
						{profile.title ? (
							<p className="hero-lead">{profile.title}</p>
						) : null}
						{profile.intro ? (
							<p className="hero-body">{profile.intro}</p>
						) : null}
						{heroActions.length > 0 ? (
							<div className="hero-actions">
								{heroActions.map((action) => (
									<ActionLink
										external={action.external}
										href={action.href}
										icon={action.icon}
										key={action.label}
										label={action.label}
									/>
								))}
							</div>
						) : null}
					</div>

					{profile.focusHeading || focusItems.length > 0 || stats.length > 0 ? (
						<aside className="hero-panel">
							{profile.focusHeading ? (
								<p className="panel-kicker">{profile.focusHeading}</p>
							) : null}
							{focusItems.length > 0 ? (
								<ul className="panel-list">
									{focusItems.map((item) => (
										<li key={item}>{item}</li>
									))}
								</ul>
							) : null}
							{stats.length > 0 ? (
								<div className="hero-stats">
									{stats.map((stat) => (
										<Stat
											key={`${stat.value}-${stat.label}`}
											value={stat.value}
											label={stat.label}
										/>
									))}
								</div>
							) : null}
						</aside>
					) : null}
				</div>
			</section>

			{projects.length > 0 ? (
				<section className="section-shell">
					<div className="section-heading">
						{profile.projectsEyebrow ? (
							<p className="eyebrow">{profile.projectsEyebrow}</p>
						) : null}
						{profile.projectsHeading ? (
							<h2>{profile.projectsHeading}</h2>
						) : null}
						{profile.projectsIntro ? <p>{profile.projectsIntro}</p> : null}
					</div>

					<div className="project-grid">
						{projects.map((project) => (
							<ProjectCard key={project.name} project={project} />
						))}
					</div>
				</section>
			) : null}

			{experience.length > 0 ? (
				<section className="section-shell experience-shell">
					<div className="section-heading experience-heading">
						{profile.experienceEyebrow ? (
							<p className="eyebrow">{profile.experienceEyebrow}</p>
						) : null}
						{profile.experienceHeading ? (
							<h2>{profile.experienceHeading}</h2>
						) : null}
						{profile.experienceIntro ? <p>{profile.experienceIntro}</p> : null}
					</div>

					<div className="experience-list">
						{experience.map((job, index) => (
							<article
								className="experience-card"
								key={`${job.company}-${job.role}`}
							>
								<div className="experience-summary">
									<p className="experience-index">0{index + 1}</p>
									<h3>{job.role}</h3>
									{job.company ? (
										<p className="experience-company">{job.company}</p>
									) : null}
									{job.start || job.end ? (
										<p className="experience-dates">
											{[job.start, job.end].filter(Boolean).join(" to ")}
										</p>
									) : null}
									{job.summary ? (
										<p className="experience-copy">{job.summary}</p>
									) : null}
								</div>

								{job.bullets.length > 0 ? (
									<ul className="experience-bullets">
										{job.bullets.map((bullet) => (
											<li key={bullet}>{bullet}</li>
										))}
									</ul>
								) : null}
							</article>
						))}
					</div>
				</section>
			) : null}
		</main>
	);
}

function ProjectCard({ project }: { project: Project }) {
	const content = (
		<>
			<div className="project-topline">
				<p className="project-label">Selected case study</p>
				{project.href ? <ArrowUpRight size={18} /> : null}
			</div>
			<h3>{project.name}</h3>
			{project.description ? (
				<p className="project-description">{project.description}</p>
			) : null}
			{project.tags.length > 0 ? (
				<div className="tag-list">
					{project.tags.map((tag) => (
						<span className="tag" key={tag}>
							{tag}
						</span>
					))}
				</div>
			) : null}
		</>
	);

	if (!project.href) {
		return (
			<article className="project-card" data-accent={project.accent}>
				{content}
			</article>
		);
	}

	return (
		<a
			className="project-card"
			data-accent={project.accent}
			href={project.href}
			rel="noreferrer"
			target="_blank"
		>
			{content}
		</a>
	);
}

function ActionLink({
	href,
	external = true,
	icon,
	label,
}: {
	href: string;
	icon: React.ReactNode;
	label: string;
	external?: boolean;
}) {
	return (
		<a
			className="action-link"
			href={href}
			rel={external === false ? undefined : "noreferrer"}
			target={external === false ? undefined : "_blank"}
		>
			<span>{label}</span>
			{icon}
		</a>
	);
}

function Stat({ label, value }: { label: string; value: string }) {
	return (
		<div className="stat-card">
			{value ? <strong>{value}</strong> : null}
			{label ? <span>{label}</span> : null}
		</div>
	);
}
