export type Project = {
	name: string;
	description: string;
	href: string;
	tags: string[];
	accent: string;
};

export type Experience = {
	role: string;
	company: string;
	start: string;
	end: string;
	summary: string;
	bullets: string[];
};

export type HomepageContent = {
	profile: {
		greeting: string;
		location: string;
		availability: string;
		title: string;
		intro: string;
		email: string;
		github: string;
		resume: string;
		heroEyebrow: string;
		focusHeading: string;
		projectsEyebrow: string;
		projectsHeading: string;
		projectsIntro: string;
		experienceEyebrow: string;
		experienceHeading: string;
		experienceIntro: string;
		closingEyebrow: string;
		closingTitle: string;
		closingBody: string;
	};
	focusItems: string[];
	stats: Array<{
		value: string;
		label: string;
	}>;
	projects: Project[];
	experience: Experience[];
};

export const defaultHomepageContent: HomepageContent = {
	profile: {
		greeting: "Hi, I'm Trevor DeBardeleben",
		location: "Atlanta, GA",
		availability:
			"Open to senior product, platform, and consulting leadership work",
		title:
			"Senior software consultant building durable systems for complex organizations.",
		intro:
			"I work across product, platform, and integration-heavy problems, aligning stakeholders, shaping pragmatic architecture, and shipping software that improves how teams operate.",
		email: "trevordebard@gmail.com",
		github: "https://github.com/trevordebard",
		resume:
			"https://res.cloudinary.com/drm11trnc/image/upload/v1670624426/Resume_Trevor_De_Bardeleben_27c01660b8.pdf",
		heroEyebrow: "Senior Software Consultant / Product Engineering Lead",
		focusHeading: "Leadership focus",
		projectsEyebrow: "Selected Evidence",
		projectsHeading: "Delivery snapshots",
		projectsIntro:
			"A few representative builds that show product judgment, system design, and hands-on delivery across real user workflows.",
		experienceEyebrow: "Career Record",
		experienceHeading: "Experience",
		experienceIntro:
			"A record of consulting and engineering roles focused on stakeholder clarity, technical execution, and measurable operational outcomes.",
		closingEyebrow: "Next Phase",
		closingTitle: "Homepage first. Backend and blog-ready by design.",
		closingBody:
			"This homepage is intentionally structured so your projects, experience entries, and future posts can graduate from hard-coded data into a maintainable content pipeline.",
	},
	focusItems: [
		"Leading delivery across ambiguous business domains, technical constraints, and cross-functional teams.",
		"Turning messy operational processes into reliable product experiences and integration patterns.",
		"Choosing pragmatic architectures that can absorb future content, admin, and workflow needs without a rebuild.",
	],
	stats: [
		{
			value: "8+",
			label: "years shipping web software",
		},
		{
			value: "4",
			label: "professional delivery roles",
		},
		{
			value: "3",
			label: "selected product builds",
		},
	],
	projects: [
		{
			name: "Sign Me In",
			description:
				"A real-time attendance platform for student organizations that grew to 500 to 1,000 monthly users after launching on campus.",
			href: "https://github.com/trevordebard/Sign-Me-In-v2",
			tags: ["Next.js", "React", "REST", "Socket.IO", "TypeScript"],
			accent: "teal",
		},
		{
			name: "Dead Simple Budget",
			description:
				"A zero-based budgeting app that helps users assign every dollar to a purpose through flexible money stacks and planning workflows.",
			href: "https://github.com/trevordebard/dead-simple-budget",
			tags: ["Next.js", "React", "Postgres", "TypeScript", "Prisma"],
			accent: "gold",
		},
		{
			name: "Book Trace",
			description:
				"A reading tracker focused on OAuth-secured flows and first- and third-party API integrations for managing reading history and wish lists.",
			href: "https://github.com/trevordebard/book-trace",
			tags: ["Next.js", "React", "REST", "TypeScript", "Chakra UI"],
			accent: "coral",
		},
	],
	experience: [
		{
			role: "Senior Software Consultant",
			company: "Pariveda Solutions",
			start: "March 2021",
			end: "Present",
			summary:
				"I work with clients across industries to solve complex business problems through technology, often stepping into new domains and toolchains quickly to move projects forward.",
			bullets: [
				"Worked across multiple industries solving complex business problems with custom software solutions.",
				"Built Python integrations between healthcare systems that improved patient interaction time by 5 to 10 percent.",
				"Implemented a large-scale customer data consolidation effort for an international hotel brand.",
				"Used Azure serverless functions, Azure API for FHIR, and Data Lake services in production delivery.",
				"Designed and integrated internal and external REST APIs across varied enterprise environments.",
				"Mentored junior teammates and supported Agile delivery across cross-functional teams.",
			],
		},
		{
			role: "Implementation Consultant",
			company: "FAST Enterprises",
			start: "July 2019",
			end: "March 2021",
			summary:
				"I gathered requirements directly from clients, translated business needs into product changes, and delivered features that supported large-scale public services.",
			bullets: [
				"Implemented features for an online driver services portal serving millions of Georgia taxpayers.",
				"Helped meet Arkansas' legislative deadline for its first watercraft title issuance system.",
				"Built product features with VB.Net and SQL on the back end alongside internal front-end tooling.",
				"Worked closely with stakeholders to refine requirements and improve the taxpayer experience.",
			],
		},
		{
			role: "Software Engineering Intern",
			company: "CGI Federal",
			start: "June 2018",
			end: "August 2018",
			summary:
				"I built internal tools for DevOps visibility, including a dashboard for system health and automation that reduced downtime for adjacent workflows.",
			bullets: [
				"Developed a React dashboard that surfaced real-time system data from a REST API.",
				"Created Python scripts that reduced downtime by 20 percent for an internal video conversion tool.",
				"Built and maintained a Windows Server test environment with Apache Web Server.",
				"Used Git and code review workflows as part of an Agile team.",
			],
		},
		{
			role: "IT Intern",
			company: "International Paper",
			start: "May 2017",
			end: "August 2017",
			summary:
				"I helped ship the initial interface foundation for an internal application that centralized data from multiple systems to improve operational responsiveness.",
			bullets: [
				"Designed and built the UI foundation for an internal operations application.",
				"Developed with JavaScript, HTML5, CSS3, jQuery, webMethods, and SQL.",
			],
		},
	],
};
