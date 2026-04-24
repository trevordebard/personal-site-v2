# Deployment

This repo is set up to deploy to Dokku as two production apps:

- `personal-site` for `trevordebard.com`
- `personal-site-admin` for `admin.trevordebard.com`

GitHub Actions deploys each app independently:

- frontend changes deploy the root app
- `pocketbase/**` changes deploy only the PocketBase app

## Final topology

- Site app: `personal-site`
- Site domains: `trevordebard.com`, `www.trevordebard.com`
- Admin app: `personal-site-admin`
- Admin domain: `admin.trevordebard.com`
- Canonical public URL: `https://trevordebard.com`
- PocketBase URL from the frontend: `https://admin.trevordebard.com`

## GitHub setup

Set these GitHub repository secrets:

- `DOKKU_HOST`
- `DOKKU_SSH_PRIVATE_KEY`

Set these GitHub repository variables:

- `DOKKU_FRONTEND_APP=personal-site`
- `DOKKU_POCKETBASE_APP=personal-site-admin`

The workflow lives in [.github/workflows/deploy.yml](/Users/Trevor.Debardeleben/repos/personal-site/.github/workflows/deploy.yml).

## DNS checklist

Create these DNS records before enabling HTTPS:

- `A` or `ALIAS` for `trevordebard.com` to your Dokku host IP
- `CNAME` or equivalent for `www.trevordebard.com` to `trevordebard.com`
- `A` or `CNAME` for `admin.trevordebard.com` to your Dokku host IP

## Dokku host checklist

Run these on the Dokku host.

### 1. Create the apps

```bash
dokku apps:create personal-site
dokku apps:create personal-site-admin
```

### 2. Attach domains

```bash
dokku domains:set personal-site trevordebard.com www.trevordebard.com
dokku domains:set personal-site-admin admin.trevordebard.com
```

### 3. Configure the frontend app

The frontend deploy uses the root [Dockerfile](/Users/Trevor.Debardeleben/repos/personal-site/Dockerfile). It builds the app, copies the production dependencies, and starts the SSR server with [scripts/serve.mjs](/Users/Trevor.Debardeleben/repos/personal-site/scripts/serve.mjs).

```bash
dokku config:set personal-site SITE_URL=https://trevordebard.com
dokku config:set personal-site POCKETBASE_URL=https://admin.trevordebard.com
dokku ports:set personal-site http:80:3000 https:443:3000
```

### 4. Configure the PocketBase app

The PocketBase deploy uses `git subtree split --prefix pocketbase`, so the Dokku app receives `pocketbase/` as its repository root. The PocketBase [Dockerfile](/Users/Trevor.Debardeleben/repos/personal-site/pocketbase/Dockerfile) is written for that subtree deploy shape.

```bash
dokku ports:set personal-site-admin http:80:8080 https:443:8080
dokku storage:ensure-directory personal-site-admin
dokku storage:mount personal-site-admin /var/lib/dokku/data/storage/personal-site-admin:/pb/pb_data
```

Set PocketBase bootstrap secrets directly on the host:

```bash
dokku config:set personal-site-admin PB_SUPERUSER_EMAIL=<your-email>
dokku config:set personal-site-admin PB_SUPERUSER_PASSWORD=<your-password>
```

The first boot will create the PocketBase superuser if `/pb/pb_data/data.db` does not exist.

### 5. Put basic auth in front of PocketBase

You asked not to transmit credentials, so this repo does not store the username/password anywhere.

Install the Dokku HTTP auth plugin if it is not already installed:

```bash
sudo dokku plugin:install https://github.com/dokku/dokku-http-auth.git
```

Enable auth for the admin app with your email as the username:

```bash
dokku http-auth:enable personal-site-admin trevordebard@gmail.com <temporary-password>
```

If you need to rotate it later, do that on the Dokku host rather than in GitHub Actions.

### 6. Enable HTTPS

HTTPS should be treated as part of initial setup, not an afterthought.

Install the Let's Encrypt plugin if needed:

```bash
sudo dokku plugin:install https://github.com/dokku/dokku-letsencrypt.git
```

Set an email for certificate notices:

```bash
dokku letsencrypt:set --global email trevordebard@gmail.com
```

Issue certificates for both apps:

```bash
dokku letsencrypt:enable personal-site
dokku letsencrypt:enable personal-site-admin
```

Once certificates are present, Dokku will redirect HTTP traffic to HTTPS automatically.

### 7. Redirect `www` to the apex domain

The site should resolve on both `trevordebard.com` and `www.trevordebard.com`, but the canonical destination should be the apex domain.

If you want to handle the redirect on Dokku, install the official redirect plugin on the host and configure it there. If you already use Cloudflare or another DNS/proxy layer, doing the redirect there is usually cleaner.

Dokku plugin option:

```bash
sudo dokku plugin:install https://github.com/dokku/dokku-redirect.git
```

Then configure `www.trevordebard.com` to redirect to `https://trevordebard.com` using that plugin's commands on the host.

## Deploy flow

Push to `main`:

- frontend-related changes deploy `personal-site`
- `pocketbase/**` changes deploy `personal-site-admin`

You can also run the workflow manually and choose which app to deploy.

## First rollout order

Use this order for the first production setup:

1. Create DNS records.
2. Create the Dokku apps.
3. Set app domains.
4. Set frontend env vars and PocketBase storage/config.
5. Add GitHub secrets and repository variables.
6. Push the repo to GitHub.
7. Let GitHub Actions deploy both apps once.
8. Enable HTTP basic auth for `personal-site-admin`.
9. Enable Let's Encrypt for both apps.
10. Configure the `www` redirect to `https://trevordebard.com`.
11. Verify:
   - `https://trevordebard.com`
   - `https://www.trevordebard.com` redirects to apex
   - `https://admin.trevordebard.com` prompts for basic auth and then shows PocketBase
