import { createServerFn } from '@tanstack/react-start'
import { defaultHomepageContent, type Experience, type HomepageContent, type Project } from '../data/home'

type PocketBaseListResponse<T> = {
  items: T[]
}

type HomepageSettingsRecord = {
  greeting: string
  location: string
  availability: string
  title: string
  intro: string
  email: string
  github_url: string
  resume_url: string
  hero_eyebrow: string
  focus_heading?: string
  projects_eyebrow?: string
  projects_heading?: string
  projects_intro: string
  experience_eyebrow?: string
  experience_heading?: string
  experience_intro: string
  closing_eyebrow: string
  closing_title: string
  closing_body: string
}

type FocusItemRecord = {
  body: string
}

type StatRecord = {
  value: string
  label: string
}

type ProjectRecord = {
  name: string
  summary: string
  href: string
  tags: string
  accent: string
}

type ExperienceRecord = {
  role: string
  company: string
  start_label: string
  end_label: string
  summary: string
  bullets: string
}

function getPocketBaseBaseUrl() {
  return process.env.POCKETBASE_URL ?? 'http://127.0.0.1:8090'
}

async function fetchPocketBaseList<T>(
  collection: string,
  query: Record<string, string> = {},
): Promise<T[]> {
  const url = new URL(`/api/collections/${collection}/records`, getPocketBaseBaseUrl())

  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value)
  }

  const response = await fetch(url, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`PocketBase request failed for ${collection}: ${response.status}`)
  }

  const data = (await response.json()) as PocketBaseListResponse<T>

  return data.items
}

function splitMultilineValue(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function splitTags(tags: string) {
  return tags
    .split(/[\n,]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
}

async function loadHomepageContent(): Promise<HomepageContent> {
  const [settingsList, focusItems, stats, projects, experience] = await Promise.all([
    fetchPocketBaseList<HomepageSettingsRecord>('homepage_settings', {
      filter: 'key = "main"',
      perPage: '1',
    }),
    fetchPocketBaseList<FocusItemRecord>('homepage_focus_items', {
      sort: 'sort',
      perPage: '50',
    }),
    fetchPocketBaseList<StatRecord>('homepage_stats', {
      sort: 'sort',
      perPage: '50',
    }),
    fetchPocketBaseList<ProjectRecord>('projects', {
      sort: 'sort',
      perPage: '50',
    }),
    fetchPocketBaseList<ExperienceRecord>('experience', {
      sort: 'sort',
      perPage: '50',
    }),
  ])

  const settings = settingsList[0]

  if (!settings) {
    return defaultHomepageContent
  }

  return {
    profile: {
      greeting: settings.greeting,
      location: settings.location,
      availability: settings.availability,
      title: settings.title,
      intro: settings.intro,
      email: settings.email,
      github: settings.github_url,
      resume: settings.resume_url,
      heroEyebrow: settings.hero_eyebrow,
      focusHeading: settings.focus_heading ?? defaultHomepageContent.profile.focusHeading,
      projectsEyebrow:
        settings.projects_eyebrow ?? defaultHomepageContent.profile.projectsEyebrow,
      projectsHeading:
        settings.projects_heading ?? defaultHomepageContent.profile.projectsHeading,
      projectsIntro: settings.projects_intro,
      experienceEyebrow:
        settings.experience_eyebrow ?? defaultHomepageContent.profile.experienceEyebrow,
      experienceHeading:
        settings.experience_heading ?? defaultHomepageContent.profile.experienceHeading,
      experienceIntro: settings.experience_intro,
      closingEyebrow: settings.closing_eyebrow,
      closingTitle: settings.closing_title,
      closingBody: settings.closing_body,
    },
    focusItems:
      focusItems.length > 0
        ? focusItems.map((item) => item.body).filter(Boolean)
        : defaultHomepageContent.focusItems,
    stats:
      stats.length > 0
        ? stats.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        : defaultHomepageContent.stats,
    projects:
      projects.length > 0
        ? projects.map<Project>((item) => ({
            name: item.name,
            description: item.summary,
            href: item.href,
            tags: splitTags(item.tags),
            accent: item.accent || 'teal',
          }))
        : defaultHomepageContent.projects,
    experience:
      experience.length > 0
        ? experience.map<Experience>((item) => ({
            role: item.role,
            company: item.company,
            start: item.start_label,
            end: item.end_label,
            summary: item.summary,
            bullets: splitMultilineValue(item.bullets),
          }))
        : defaultHomepageContent.experience,
  }
}

export const getHomepageContent = createServerFn({
  method: 'GET',
}).handler(async () => {
  try {
    return await loadHomepageContent()
  } catch (error) {
    console.error('Failed to load homepage content from PocketBase:', error)

    return defaultHomepageContent
  }
})
