import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowUpRight,
	BriefcaseBusiness,
	Github,
	Mail,
	MapPin,
	NotebookPen,
} from "lucide-react";
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

	return (
		<main className="bg-[var(--surface)] text-[var(--ink)]">
			<section className="hero-shell">
				<div className="hero-grid">
					<div className="hero-copy">
						<p className="eyebrow">{profile.heroEyebrow}</p>
						<h1 className="hero-title">{profile.greeting}</h1>
						<div className="hero-meta">
							<span>
								<MapPin size={16} />
								{profile.location}
							</span>
							<span>
								<BriefcaseBusiness size={16} />
								{profile.availability}
							</span>
						</div>
						<p className="hero-lead">{profile.title}</p>
						<p className="hero-body">{profile.intro}</p>
						<div className="hero-actions">
							<ActionLink
								href={profile.resume}
								label="Resume"
								icon={<ArrowUpRight size={16} />}
							/>
							<ActionLink
								href="/blog"
								label="Blog"
								icon={<NotebookPen size={16} />}
								external={false}
							/>
							<ActionLink
								href={`mailto:${profile.email}`}
								label="Email"
								icon={<Mail size={16} />}
							/>
							<ActionLink
								href={profile.github}
								label="GitHub"
								icon={<Github size={16} />}
							/>
						</div>
					</div>

					<aside className="hero-panel">
						<p className="panel-kicker">{profile.focusHeading}</p>
						<ul className="panel-list">
							{focusItems.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
						<div className="hero-stats">
							{stats.map((stat) => (
								<Stat
									key={`${stat.value}-${stat.label}`}
									value={stat.value}
									label={stat.label}
								/>
							))}
						</div>
					</aside>
				</div>
			</section>

			<section className="section-shell">
				<div className="section-heading">
					<p className="eyebrow">{profile.projectsEyebrow}</p>
					<h2>{profile.projectsHeading}</h2>
					<p>{profile.projectsIntro}</p>
				</div>

				<div className="project-grid">
					{projects.map((project) => (
						<a
							className="project-card"
							data-accent={project.accent}
							href={project.href}
							key={project.name}
							rel="noreferrer"
							target="_blank"
						>
							<div className="project-topline">
								<p className="project-label">Featured project</p>
								<ArrowUpRight size={18} />
							</div>
							<h3>{project.name}</h3>
							<p className="project-description">{project.description}</p>
							<div className="tag-list">
								{project.tags.map((tag) => (
									<span className="tag" key={tag}>
										{tag}
									</span>
								))}
							</div>
						</a>
					))}
				</div>
			</section>

			<section className="section-shell experience-shell">
				<div className="section-heading experience-heading">
					<p className="eyebrow">{profile.experienceEyebrow}</p>
					<h2>{profile.experienceHeading}</h2>
					<p>{profile.experienceIntro}</p>
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
								<p className="experience-company">{job.company}</p>
								<p className="experience-dates">
									{job.start} to {job.end}
								</p>
								<p className="experience-copy">{job.summary}</p>
							</div>

							<ul className="experience-bullets">
								{job.bullets.map((bullet) => (
									<li key={bullet}>{bullet}</li>
								))}
							</ul>
						</article>
					))}
				</div>
			</section>
		</main>
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
			<strong>{value}</strong>
			<span>{label}</span>
		</div>
	);
}
