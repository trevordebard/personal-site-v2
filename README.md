# Homepage + PocketBase CMS

This repo now contains two pieces:

- the TanStack Start frontend in the repo root
- a self-hosted PocketBase CMS in [`pocketbase/`](/Users/Trevor.Debardeleben/Documents/New%20project/pocketbase)

The homepage reads its content from PocketBase through a TanStack Start server function. If PocketBase is unavailable, the app falls back to local defaults so development doesn’t break.

## Local Development

Install frontend dependencies and run the site:

```bash
npm install
npm run dev
```

Run PocketBase in a second terminal:

```bash
PB_SUPERUSER_EMAIL=you@example.com \
PB_SUPERUSER_PASSWORD='change-me-now' \
npm run cms:dev
```

That script downloads PocketBase into `pocketbase/` on first run, starts it on `127.0.0.1:8090`, applies the committed migrations, and seeds the homepage collections.

## Admin Login

The simplest admin flow is the built-in PocketBase superuser dashboard:

- CMS URL: `http://127.0.0.1:8090`
- Login: the one superuser account you created with `PB_SUPERUSER_EMAIL` and `PB_SUPERUSER_PASSWORD`

There is no custom auth UI in the site. PocketBase admin is the editor interface.
The root URL redirects to PocketBase's built-in `/_/` dashboard.

## Homepage Content Model

The homepage is controlled by these PocketBase collections:

- `homepage_settings`
- `homepage_focus_items`
- `homepage_stats`
- `projects`
- `experience`
- `blog_posts`

The frontend mapping lives in [src/lib/homepage-content.ts](/Users/Trevor.Debardeleben/Documents/New%20project/src/lib/homepage-content.ts:1).
The blog mapping lives in [src/lib/blog-content.ts](/Users/Trevor.Debardeleben/Documents/New%20project/src/lib/blog-content.ts:1).

Most content fields are optional. PocketBase only requires structural fields
such as singleton keys, sort order, and publishable blog identity fields; the
frontend skips empty values instead of rendering placeholders.

PocketBase migrations are schema-only. They should create or modify collections,
fields, indexes, and rules, but they should not create or update content records.
Production content is managed directly in PocketBase.

## Blog Publishing Model

The blog routes are designed to read published records from PocketBase at request time.

- Blog index: `/blog`
- Blog post: `/blog/:slug`

The `blog_posts` collection requires `slug`, `title`, `status`, and `markdown`.
Other metadata is optional and only appears in the UI when populated:

- `slug`
- `title`
- `excerpt`
- `seo_description`
- `hero_eyebrow`
- `hero_summary`
- `published_at`
- `read_time_minutes`
- `tags`
- `status`
- `featured`
- `markdown`

This keeps the frontend deploy separate from the publishing workflow. Adding a new post in PocketBase does not require rebuilding the site.

## Frontend Configuration

The frontend server function reads PocketBase from:

```bash
POCKETBASE_URL=http://127.0.0.1:8090
```

For canonical article URLs and share metadata, you can also set:

```bash
SITE_URL=https://your-domain.com
```

If `POCKETBASE_URL` is unset, it defaults to `http://127.0.0.1:8090`.

## PocketBase for Dokku

There is a container-ready PocketBase setup in:

- [pocketbase/Dockerfile](/Users/Trevor.Debardeleben/Documents/New%20project/pocketbase/Dockerfile:1)
- [pocketbase/docker-entrypoint.sh](/Users/Trevor.Debardeleben/Documents/New%20project/pocketbase/docker-entrypoint.sh:1)

For a Dokku deployment, run PocketBase as a separate app/container from the frontend. Set:

- `PB_SUPERUSER_EMAIL`
- `PB_SUPERUSER_PASSWORD`
- persistent storage for `/pb/pb_data`

Then point the frontend app at that PocketBase instance with `POCKETBASE_URL`.

## Build

```bash
npm run build
```

## Deployment

Dokku deployment is documented in [docs/deployment.md](/Users/Trevor.Debardeleben/repos/personal-site/docs/deployment.md).
