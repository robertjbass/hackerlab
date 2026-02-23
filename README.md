# Hackerlab

A batteries-included starter framework for bootstrapping full-stack web applications with [Payload CMS](https://payloadcms.com), deployed on [Vercel](https://vercel.com) with [Neon](https://neon.tech) PostgreSQL. Fork this repo, configure your environment, choose a theme, and ship.

## Tech Stack

- **Framework:** Next.js 16 (React 19)
- **CMS/Backend:** Payload CMS 3
- **Database:** PostgreSQL 17 (Neon recommended)
- **Auth:** Auth.js (next-auth v5) with Google and GitHub OAuth
- **Styling:** Tailwind CSS 4, shadcn/ui, VS Code theme import system
- **Storage:** Vercel Blob
- **Language:** TypeScript

## Prerequisites

- Node.js 22.x or 24.x
- pnpm 9.x or 10.x
- A PostgreSQL 17 database (Neon, Supabase, or local)
- A Vercel Blob store

## Getting Started

```bash
# Clone and install
git clone <your-fork-url>
cd hackerlab
pnpm install

# Copy the example env file
cp .env.example .env
```

Fill in the required values in `.env` (see [Environment Variables](#environment-variables) below), then:

```bash
# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the frontend and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

The first user to sign in is automatically promoted to admin.

## Environment Variables

Create a `.env` file from `.env.example` and fill in the required values:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `DEV_DB_PUSH` | No | Set `true` to auto-sync schema without migrations (dev only) |
| `PAYLOAD_SECRET` | Yes | Encryption secret for Payload CMS |
| `BLOB_READ_WRITE_TOKEN` | Yes | Vercel Blob storage token |
| `BLOB_PREFIX` | Yes | Key prefix for blob storage (e.g. `hackerlab_dev`) |
| `AUTH_SECRET` | Yes | Auth.js session encryption secret |
| `AUTH_URL` | Yes | Base URL (e.g. `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth client secret |

Generate secrets:

```bash
# Payload secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Auth secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

OAuth providers are **optional and conditional** — only providers with both their `CLIENT_ID` and `CLIENT_SECRET` configured will appear on the login page. You can run with just one provider, both, or none (email/password only via the admin panel).

## Authentication Setup

Hackerlab supports Google (GCP) and GitHub OAuth out of the box. Configure one or both depending on your needs.

### Google OAuth (GCP)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Select **Web application** as the application type
6. Add authorized redirect URIs:
   - Local dev: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`
7. Copy the **Client ID** and **Client Secret**
8. Add them to your `.env`:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

**Note:** You may also need to configure the OAuth consent screen under **APIs & Services** > **OAuth consent screen**. For development, set it to "External" with test users. For production, submit for verification.

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App** (or **Register a new application**)
3. Fill in:
   - **Application name:** Your app name
   - **Homepage URL:** `http://localhost:3000` (or your production URL)
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
4. Click **Register application**
5. Copy the **Client ID**
6. Click **Generate a new client secret** and copy it
7. Add them to your `.env`:

```env
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
```

**For production:** Create a second OAuth App with your production URL as both the homepage and callback URL, or update the existing one. GitHub OAuth Apps only support one callback URL per app.

### How It Works

- Email is the canonical identity — the same email from different OAuth providers links to one user account
- **First-user admin promotion:** The User collection's `afterChange` hook checks the total user count inside a serializable transaction. If the newly created user is the only one in the database, it automatically assigns the `admin` role via the `user_role` junction table. This runs exactly once and is safe against race conditions.
- Non-admin users redirect to `/` after login; admins go to `/admin`
- Both login pages (frontend and admin) dynamically show only the providers you've configured

## Theme System

Hackerlab includes a VS Code theme import system that lets you restyle the entire app using any VS Code color theme. Themes map VS Code color tokens to shadcn/ui CSS variables at build time.

### Quick Start

```bash
# List bundled themes
pnpm import-theme --list

# Apply a bundled theme to both light and dark modes
pnpm import-theme --file src/themes/dracula.json --both

# Preview the mapping without writing
pnpm import-theme --file src/themes/tokyo-night.json --both --dry-run

# Restore the original palette
pnpm import-theme --restore
```

### Bundled Themes

| Theme | Type |
|---|---|
| Dracula | Dark |
| GitHub Dark | Dark |
| Monokai | Dark |
| Nord | Dark |
| One Dark Pro | Dark |
| Solarized Light | Light |
| Tokyo Night | Dark |
| Ros&eacute; Pine Moon | Dark |

### Importing from the VS Code Marketplace

```bash
# Search and download interactively
pnpm import-theme --vscode "Catppuccin"

# Import from a raw JSON URL
pnpm import-theme --url https://raw.githubusercontent.com/.../theme.json --both
```

### Import Options

| Flag | Description |
|---|---|
| `--file <path>` | Import from a local JSON file |
| `--url <url>` | Import from a URL (raw JSON) |
| `--vscode <name>` | Search VS Code marketplace and download |
| `--mode <light\|dark>` | Write to a specific CSS block (auto-detected if omitted) |
| `--both` | Write to both `:root` and `.dark` blocks |
| `--dry-run` | Print the color mapping without writing |
| `--list` | Show available themes |
| `--restore` | Restore `globals.css` from backup |
| `--name <name>` | Select a specific theme from multi-theme extensions |

### Using Two Themes (Light + Dark)

VS Code themes are single-mode. To have different light and dark themes:

```bash
pnpm import-theme --file src/themes/solarized-light.json --mode light
pnpm import-theme --file src/themes/dracula.json --mode dark
```

### Admin Panel Theme Preview

Visit `/admin/theme` in the admin panel to browse all available themes with visual previews. Click any theme to see its color palette, then use the CLI commands shown on the page to apply it.

### Adding Custom Themes

1. Find a VS Code theme JSON file (from a GitHub repo, VSIX, or the marketplace)
2. Save it to `src/themes/<name>.json`
3. Apply it with `pnpm import-theme --file src/themes/<name>.json --both`

Theme JSON files follow the VS Code theme format:

```json
{
  "name": "My Theme",
  "type": "dark",
  "colors": {
    "editor.background": "#282c34",
    "editor.foreground": "#abb2bf",
    "button.background": "#4d78cc",
    ...
  }
}
```

## Documentation

| Guide | Description |
|---|---|
| [Google OAuth Setup](docs/setup-google-oauth.md) | Step-by-step Google Cloud Console configuration |
| [GitHub OAuth Setup](docs/setup-github-oauth.md) | Step-by-step GitHub OAuth App configuration |
| [Deployment](docs/deployment.md) | Vercel, DNS providers, Blob storage, environment variables |
| [Architecture Decisions](docs/architecture-decisions.md) | Junction tables vs Payload `_rels`, when to use each |
| [Payload Query Syntax](docs/payload-query.md) | Query patterns for `payload.find()`, populate, depth |

## Project Structure

```
src/
├── app/
│   ├── (frontend)/          # Frontend routes (blog, auth, landing)
│   ├── (payload)/           # Payload admin routes
│   └── api/                 # Standalone API routes
├── collections/             # Payload collection configs
│   ├── User/                # User collection + auth constants
│   ├── Role/                # Role collection (admin, editor, user)
│   ├── UserRole/            # User-Role junction table
│   ├── Post/                # Blog posts (versioned, drafts)
│   ├── Category/            # Blog categories
│   ├── Tag/                 # Blog tags
│   ├── PostCategory/        # Post-Category junction table
│   ├── Media/               # Media uploads (Vercel Blob)
│   └── shared/              # Shared access helpers and field utilities
├── components/
│   ├── admin/               # Custom admin panel components
│   ├── blog/                # Blog UI components
│   ├── icons/               # Icon components
│   ├── landing/             # Landing page sections
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── auth/                # Auth.js + Payload auth bridge
│   ├── queries/             # Cached server-side data fetching
│   ├── theme/               # Theme import system
│   ├── site-config.ts       # Centralized site identity
│   ├── navigation.ts        # Shared nav link definitions
│   └── metadata.ts          # SEO metadata generation
├── themes/                  # Bundled VS Code theme JSONs
├── migrations/              # Database migrations
└── payload.config.ts        # Main Payload config
```

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm check:types` | TypeScript type check |
| `pnpm test` | Run all tests |
| `pnpm prep` | Generate types and migrations |
| `pnpm codegen` | Regenerate import map and types |
| `pnpm import-theme` | Import and apply VS Code themes |
| `pnpm add:ui <name>` | Add a shadcn/ui component |

## Deployment

Hackerlab is designed for Vercel deployment with Neon PostgreSQL:

1. Push your repo to GitHub
2. Import into Vercel
3. Set all environment variables in the Vercel dashboard
4. Deploy

For the database, create a Neon project at [neon.tech](https://neon.tech) and use the connection string as `DATABASE_URL`.
