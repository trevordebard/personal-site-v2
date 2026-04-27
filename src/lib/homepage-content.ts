import { createServerFn } from "@tanstack/react-start";
import {
	defaultHomepageContent,
	type Experience,
	type HomepageContent,
	type Project,
} from "../data/home";

type PocketBaseListResponse<T> = {
	items: T[];
};

type HomepageSettingsRecord = {
	greeting?: string;
	location?: string;
	availability?: string;
	title?: string;
	intro?: string;
	email?: string;
	github_url?: string;
	resume_url?: string;
	hero_eyebrow?: string;
	focus_heading?: string;
	projects_eyebrow?: string;
	projects_heading?: string;
	projects_intro?: string;
	experience_eyebrow?: string;
	experience_heading?: string;
	experience_intro?: string;
	closing_eyebrow?: string;
	closing_title?: string;
	closing_body?: string;
};

type FocusItemRecord = {
	body?: string;
};

type StatRecord = {
	value?: string;
	label?: string;
};

type ProjectRecord = {
	name: string;
	summary?: string;
	href?: string;
	tags?: string;
	accent?: string;
};

type ExperienceRecord = {
	role: string;
	company?: string;
	start_label?: string;
	end_label?: string;
	summary?: string;
	bullets?: string;
};

function getPocketBaseBaseUrl() {
	return process.env.POCKETBASE_URL ?? "http://127.0.0.1:8090";
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

function textValue(value?: string) {
	return value?.trim() ?? "";
}

function splitMultilineValue(value?: string) {
	return textValue(value)
		.split(/\r?\n/)
		.map((item) => item.trim())
		.filter(Boolean);
}

function splitTags(tags?: string) {
	return textValue(tags)
		.split(/[\n,]/)
		.map((tag) => tag.trim())
		.filter(Boolean);
}

async function loadHomepageContent(): Promise<HomepageContent> {
	const [settingsList, focusItems, stats, projects, experience] =
		await Promise.all([
			fetchPocketBaseList<HomepageSettingsRecord>("homepage_settings", {
				filter: 'key = "main"',
				perPage: "1",
			}),
			fetchPocketBaseList<FocusItemRecord>("homepage_focus_items", {
				sort: "sort",
				perPage: "50",
			}),
			fetchPocketBaseList<StatRecord>("homepage_stats", {
				sort: "sort",
				perPage: "50",
			}),
			fetchPocketBaseList<ProjectRecord>("projects", {
				sort: "sort",
				perPage: "50",
			}),
			fetchPocketBaseList<ExperienceRecord>("experience", {
				sort: "sort",
				perPage: "50",
			}),
		]);

	const settings = settingsList[0];

	if (!settings) {
		return defaultHomepageContent;
	}

	return {
		profile: {
			greeting: textValue(settings.greeting),
			location: textValue(settings.location),
			availability: textValue(settings.availability),
			title: textValue(settings.title),
			intro: textValue(settings.intro),
			email: textValue(settings.email),
			github: textValue(settings.github_url),
			resume: textValue(settings.resume_url),
			heroEyebrow: textValue(settings.hero_eyebrow),
			focusHeading: textValue(settings.focus_heading),
			projectsEyebrow: textValue(settings.projects_eyebrow),
			projectsHeading: textValue(settings.projects_heading),
			projectsIntro: textValue(settings.projects_intro),
			experienceEyebrow: textValue(settings.experience_eyebrow),
			experienceHeading: textValue(settings.experience_heading),
			experienceIntro: textValue(settings.experience_intro),
			closingEyebrow: textValue(settings.closing_eyebrow),
			closingTitle: textValue(settings.closing_title),
			closingBody: textValue(settings.closing_body),
		},
		focusItems:
			focusItems.length > 0
				? focusItems.map((item) => textValue(item.body)).filter(Boolean)
				: defaultHomepageContent.focusItems,
		stats:
			stats.length > 0
				? stats
						.map((item) => ({
							value: textValue(item.value),
							label: textValue(item.label),
						}))
						.filter((item) => item.value || item.label)
				: defaultHomepageContent.stats,
		projects:
			projects.length > 0
				? projects
						.map<Project>((item) => ({
							name: textValue(item.name),
							description: textValue(item.summary) || undefined,
							href: textValue(item.href) || undefined,
							tags: splitTags(item.tags),
							accent: textValue(item.accent) || "teal",
						}))
						.filter((item) => item.name)
				: defaultHomepageContent.projects,
		experience:
			experience.length > 0
				? experience
						.map<Experience>((item) => ({
							role: textValue(item.role),
							company: textValue(item.company) || undefined,
							start: textValue(item.start_label) || undefined,
							end: textValue(item.end_label) || undefined,
							summary: textValue(item.summary) || undefined,
							bullets: splitMultilineValue(item.bullets),
						}))
						.filter((item) => item.role)
				: defaultHomepageContent.experience,
	};
}

export const getHomepageContent = createServerFn({
	method: "GET",
}).handler(async () => {
	try {
		return await loadHomepageContent();
	} catch (error) {
		console.error("Failed to load homepage content from PocketBase:", error);

		return defaultHomepageContent;
	}
});
