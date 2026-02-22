# Deployment Guide

This guide covers deploying the Hackerlab project to Vercel, including domain configuration, DNS setup, blob storage, and environment variables.

## Vercel Domain Setup

### Adding a Domain

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** > **Domains**
4. Enter your domain name and click **Add**

### DNS Records

Configure the following DNS records at your domain registrar or DNS provider:

| Type | Name | Value | Purpose |
|---|---|---|---|
| A | `@` (or blank) | `76.76.21.21` | Apex domain (e.g., `yourdomain.com`) |
| CNAME | `www` | `cname.vercel-dns.com` | www subdomain |

- **SSL**: Vercel provisions SSL certificates automatically after DNS propagation. No manual configuration needed.
- **www redirect**: Configurable in Vercel project settings. Most projects redirect `www.yourdomain.com` to `yourdomain.com` (or vice versa).

### DNS Propagation

DNS changes can take anywhere from a few minutes to 48 hours to propagate globally. Vercel will show the domain status as "pending" until it can verify the DNS records.

---

## DNS Provider Instructions

### Namecheap

1. Log in to [Namecheap](https://www.namecheap.com)
2. Go to **Domain List** > click **Manage** next to your domain
3. Click the **Advanced DNS** tab
4. Delete any default parking page records (e.g., the URL Redirect Record or default CNAME)
5. Add the records:

| Type | Host | Value | TTL |
|---|---|---|---|
| A Record | `@` | `76.76.21.21` | Automatic |
| CNAME Record | `www` | `cname.vercel-dns.com.` | Automatic |

Note: Namecheap may require a trailing dot on CNAME values.

### Squarespace Domains

1. Go to **Settings** > **Domains** in your Squarespace account
2. Click on the domain > **DNS Settings**
3. Add custom records:

| Type | Host | Data |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

Limitations:
- Squarespace does not support wildcard DNS records
- Limited TTL control (uses Squarespace defaults)
- Changes can take longer to propagate than other providers

### Cloudflare

1. Log in to [Cloudflare](https://dash.cloudflare.com)
2. Select your site (or add it and change your domain's nameservers to Cloudflare's)
3. Go to **DNS** > **Records**
4. Add the records:

| Type | Name | Content | Proxy status |
|---|---|---|---|
| A | `@` | `76.76.21.21` | **DNS only** (gray cloud) |
| CNAME | `www` | `cname.vercel-dns.com` | **DNS only** (gray cloud) |

**CRITICAL**: Set the proxy status to **DNS only** (gray cloud icon, not orange). If Cloudflare's proxy is enabled (orange cloud), it will intercept SSL termination and conflict with Vercel's automatic SSL certificate provisioning. This will cause SSL errors or infinite redirect loops.

If you want to use Cloudflare's proxy features (DDoS protection, caching), you need to configure Cloudflare's SSL mode to **Full (strict)** and ensure both Cloudflare and Vercel certificates are valid. For most Vercel deployments, DNS-only mode is simpler and recommended.

### Vercel Domains (Purchase Through Vercel)

If you purchase a domain directly through Vercel:

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard) > **Domains**
2. Search for and purchase your domain
3. DNS is managed automatically by Vercel
4. No manual DNS configuration required -- the domain is linked to your project with zero config

This is the simplest option if you do not already own a domain.

---

## Vercel Blob Storage Setup

Hackerlab uses [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for media file storage. All media uploads go to Vercel Blob; local file storage is disabled.

### Creating a Blob Store

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** > **Create** > **Blob**
3. Name the store (e.g., "hackerlab-media")
4. Select the region closest to your database
5. Click **Create**

### Configuring Credentials

After creating the store, copy the **Read/Write Token** from the store's settings page.

Add to your `.env`:

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxx
BLOB_PREFIX=hackerlab_local
```

### BLOB_PREFIX Convention

Use a unique prefix per environment to prevent asset collisions in shared blob stores:

| Environment | BLOB_PREFIX |
|---|---|
| Local development | `hackerlab_local` |
| Staging / Preview | `hackerlab_staging` |
| Production | `hackerlab_prod` |

All uploaded files are stored under this prefix in the blob store. Using distinct prefixes ensures that local development uploads do not overwrite or conflict with production assets.

### Testing Locally

After setting `BLOB_READ_WRITE_TOKEN` and `BLOB_PREFIX` in your `.env`, run `pnpm dev` and upload a file through the Payload admin panel to verify the connection works.

---

## Environment Variables

### Generating Secrets

For `PAYLOAD_SECRET` and `AUTH_SECRET`, generate cryptographically random values:

```bash
openssl rand -base64 32
```

Use a different secret for each environment. Never reuse secrets across local, staging, and production.

### Variable Reference

| Variable | Local (`.env`) | Preview | Production | Notes |
|---|---|---|---|---|
| `DATABASE_URL` | Local or dev Neon branch | Preview Neon branch | Production Neon branch | PostgreSQL connection string. Each environment should use its own database. |
| `DEV_DB_PUSH` | `true` | `false` | `false` | Enables schema push mode (no migrations). Only use for local development. |
| `PAYLOAD_SECRET` | Unique value | Unique value | Unique value | Used for Payload encryption. Generate with `openssl rand -base64 32`. |
| `GOOGLE_CLIENT_ID` | Dev OAuth client | Staging OAuth client | Prod OAuth client | See [Google OAuth Setup](./setup-google-oauth.md). |
| `GOOGLE_CLIENT_SECRET` | Dev OAuth secret | Staging OAuth secret | Prod OAuth secret | See [Google OAuth Setup](./setup-google-oauth.md). |
| `GITHUB_CLIENT_ID` | Dev OAuth app | Staging OAuth app | Prod OAuth app | See [GitHub OAuth Setup](./setup-github-oauth.md). |
| `GITHUB_CLIENT_SECRET` | Dev OAuth secret | Staging OAuth secret | Prod OAuth secret | See [GitHub OAuth Setup](./setup-github-oauth.md). |
| `AUTH_SECRET` | Unique value | Unique value | Unique value | Auth.js session encryption. Generate with `openssl rand -base64 32`. |
| `AUTH_URL` | `http://localhost:3000` | `https://preview.yourdomain.com` | `https://yourdomain.com` | Base URL for Auth.js. Must match the domain where the app is running. |
| `BLOB_READ_WRITE_TOKEN` | From Vercel Blob store | From Vercel Blob store | From Vercel Blob store | Can share the same token across environments (use `BLOB_PREFIX` to isolate assets). |
| `BLOB_PREFIX` | `hackerlab_local` | `hackerlab_staging` | `hackerlab_prod` | Isolates blob storage per environment. |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Preview URL | `https://yourdomain.com` | Public-facing site URL for metadata and links. |

### Shared vs Environment-Specific

**Shared across environments** (same value is acceptable):
- `BLOB_READ_WRITE_TOKEN` -- same blob store, isolated by prefix

**Must be unique per environment**:
- `DATABASE_URL` -- separate databases prevent data conflicts
- `PAYLOAD_SECRET` -- unique encryption key per environment
- `AUTH_SECRET` -- unique session key per environment
- `AUTH_URL` -- must match the deployment's actual URL
- `BLOB_PREFIX` -- must differ to isolate uploaded assets
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` -- separate OAuth clients per environment (or shared with multiple redirect URIs)
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` -- separate OAuth apps per environment (GitHub only allows one callback URL per app)

### Updating After Domain Changes

When you change your production domain or add a new environment, update:

1. `AUTH_URL` -- must match the new domain exactly
2. `NEXT_PUBLIC_SITE_URL` -- must match the new domain
3. OAuth callback URLs in Google Cloud Console and GitHub OAuth App settings
4. Authorized JavaScript origins in Google Cloud Console

Mismatched `AUTH_URL` values will cause OAuth callback failures and session issues.

### Setting Variables in Vercel

1. Go to your project in the Vercel Dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add each variable with the appropriate scope:
   - **Production**: only used in production deployments
   - **Preview**: used in preview/staging deployments
   - **Development**: used when running `vercel dev` (most local dev uses `.env` directly instead)
4. Redeploy after changing environment variables for changes to take effect
