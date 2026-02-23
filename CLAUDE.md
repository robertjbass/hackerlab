# CLAUDE.md

This file provides guidance to AI agents such as Claude Code (claude.ai/code) when working with code in this repository.

## Package Management
- Always use pnpm and pnpx, never npm and npx


## Conventions:
- Use the @ alias for src/ directory: `import User from '@/collections/User'`
- Payload collections and database tables are all singular (e.g., `user`, `media`)
- Collections use default exports, not named exports
- Import collections directly by path — no barrel files (`@/collections/User`, not `@/collections`)
- Custom admin components inside of the Payload admin (`src/components/admin/*`) can not use tailwind css, use inline styles with Payload CSS custom properties instead. Importing tailwind into the admin panel will break the entire admin panel.

## Project Structure (Payload)

```text
src/
├── app/
│   ├── (frontend)/          # Frontend routes
│   └── (payload)/           # Payload admin routes
├── collections/             # Collection configs
├── components/              # Custom React components
├── lib/                     # Shared utilities (auth, data, helpers)
├── migrations/              # Payload migrations
├── payload-types.ts         # Auto-generated types
└── payload.config.ts        # Main config
```

## Payload CMS Rules (from Payload AGENTS.md)

- **TypeScript-first**: always use Payload types and generated types (`src/payload-types.ts`)
- **Schema changes**: run `pnpm codegen` (generates import map + types). If you must run steps manually: `pnpm payload generate:importMap` + `pnpm payload generate:types`
- **Type validation**: run `pnpm check:types` (or `pnpm check`) after significant changes
- **Local API access control**: when passing `user` to Local API, always set `overrideAccess: false` or access control is bypassed
- **Transactions in hooks**: always pass `req` to nested `req.payload.*` operations to keep them in the same transaction
- **Prevent hook loops**: use context flags when a hook writes back to the same collection
- **Access control hygiene**: field-level access returns boolean only; ensure role fields exist before using role checks in access rules
- **Admin components**: after adding or editing admin components, regenerate the import map (`pnpm payload generate:importMap` or `pnpm codegen`)
- **Auth Local API**: auth adapter/strategy operations intentionally run with admin access (no `overrideAccess: false`). If you add stricter access rules later, do not assume these calls are protected—explicitly opt in to access checks where needed.

## Collections
- All collection slugs are singular (e.g., `user`, `media`)
- Collections use typed slugs: `CollectionConfig<'user'>`
- All collections must have explicit `labels: { singular, plural }` — Payload's auto-generated labels from slugs produce ugly results (e.g., `User_roles` instead of `User Roles`)
- Each collection directory has: `index.ts` (config), `constants.ts` (enums/options), `hooks.ts` (access helpers)
- Access helpers (`anyone`, `admins`) live in `collections/shared/access.ts` and are shared across collections
- Admin groups: User → "Admin", Media → "Assets"

### Database Conventions

- Table names are singular (`user`, `blog`, etc.)
- Many-to-many junction tables are named `singular_singular` (e.g., `user_role`), and each row represents one record from each table

## Authentication

Dual-bridge architecture: Auth.js (next-auth v5) manages OAuth flows + JWT sessions, Payload auth manages admin panel access. They stay in sync via:

- **PayloadAdapter** (`lib/auth/payload-adapter.ts`) — bridges Auth.js adapter interface to Payload CRUD
- **AuthjsStrategy** (`lib/auth/payload-strategy.ts`) — lets Payload validate Auth.js JWTs for admin access
- **afterLogout hook** — clears Auth.js cookies when logging out of Payload admin
- **`/logout` route** — nuclear logout that clears all cookies from both systems

Key rules:
- Email is canonical identity — same email from different OAuth providers links to same user
- `payload-strategy.ts` must use dynamic `import('@/lib/auth')` to avoid circular dependency
- Adding a new OAuth provider: add enum to `constants.ts`, fields to User collection, entries to `provider-helpers.ts`, provider to `config.ts`, button to login form
- Non-admin users redirect to `/` after OAuth, admins go to `/admin`

## Database


**Query Optimization**:
- Limited query depth (`maxDepth: 2` in collection configs, higher depths used in queries when needed)
- Junction tables for efficient relationship queries
- Pagination disabled for small datasets to reduce overhead
- **Always use `populate` parameter** with `payload.find()` to opt-in to specific fields

**Database**:
- PostgreSQL 17.7
- Custom migrations in `src/migrations/`
- `DEV_DB_PUSH=true` in `.env` enables push mode (auto-sync schema, no migrations) — independent of `NODE_ENV` so local builds work against push-mode databases

### Storage

- Media uploads are Vercel Blob only (`disableLocalStorage: true` in `src/collections/Media/index.ts`).

### Migrations

- `src/migrations/20260212_192713.ts` drops and recreates the `public` schema as part of the v0.2 → v0.3 transition. Do not run it on a database that must preserve existing data.

## Environment Variables

Required in `.env`:

- `DATABASE_URL` — PostgreSQL connection string
- `DEV_DB_PUSH` — Set to `true` for local dev to use push mode instead of migrations
- `PAYLOAD_SECRET` — Secret for Payload encryption
- `GOOGLE_CLIENT_ID` — Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` — Google OAuth client secret
- `GITHUB_CLIENT_ID` — GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET` — GitHub OAuth client secret
- `AUTH_SECRET` — Auth.js session encryption secret
- `AUTH_URL` — Auth.js base URL (e.g., `http://localhost:4000`)
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob token (required in all environments)
- `BLOB_PREFIX` — Vercel Blob key prefix (required in all environments)

### PayloadCMS Query Optimization with `populate`

**Critical**: Without using `populate`, PayloadCMS returns ALL relationship data, which can result in massive JSON payloads. Always use `populate` to specify exactly which fields you need.

**📚 Query Documentation**: Before writing or modifying Payload queries, review the comprehensive query syntax guide at [docs/payload-query.md](docs/payload-query.md). This document covers:
- `payload.find()` - Server-side queries
- `payload.findByID()` - Single document queries
- `queryPayload()` - Client-side queries
- Query structure, populate syntax, depth handling, and output structure
- Collection joins reference and naming patterns

## UI Components (shadcn/ui)

This project uses [shadcn/ui](https://ui.shadcn.com) with Tailwind CSS v4.

### Adding Components

```bash
pnpm add:ui <component-name>
```

Examples:
```bash
pnpm add:ui button
pnpm add:ui card dialog
pnpm add:ui table --overwrite
```

### Key Files

- `components.json` - shadcn/ui configuration
- `src/lib/cn.ts` - `cn()` class merging utility
- `src/lib/theme.ts` - Central color palette configuration
- `src/components/ui/` - shadcn component directory
- `src/app/globals.css` - CSS variables (OKLCH colors)

### Color Palette

- **Primary:** Indigo (`--primary`)
- **Neutrals:** Slate
- To change the palette, edit `src/lib/theme.ts` for reference values and update `src/app/globals.css` for CSS variables

### Component Patterns

- Use `Button` from `@/components/ui/button` instead of custom button styles
- Use `Card` for content containers
- Use `Input` + `Label` for form fields
- Use `sonner` for toast notifications (not deprecated `toast`)
- Use semantic color classes: `text-primary`, `bg-muted`, `border-border`, `text-muted-foreground`

### Icons

**Always import icons from `@/components/icons`** - never directly from lucide-react.

```tsx
import { ArrowRight, Github, Menu, Terminal } from '@/components/icons'
```

This barrel file:
- Re-exports lucide icons for UI (Menu, Terminal, ArrowRight, etc.)
- Contains local SVG backups for brand icons (Github, XIcon)

To add a new icon:
- Lucide icon: Add to the export list in `src/components/icons/index.tsx`
- Brand icon: Copy SVG from https://simpleicons.org and create a component

## Code Comments

**Philosophy:** Good code is self-documenting through clear naming and conventions. Comments should be minimal.

**When to comment:**
- Explain WHY something unintuitive was done (not WHAT)
- Document non-obvious workarounds or edge cases

**When NOT to comment:**
- Never restate what a function/variable does when the name is self-explanatory
- No JSDoc-style comments unless absolutely necessary
- No file header comments describing what the file contains

**Comment style:**
```ts
// Single line for brief explanations

/*
 * Multi-line ONLY when multiple lines are
 * absolutely required due to significant context
 */
```

**Bad examples:**
```ts
// Gets the user by ID (redundant - name already says this)
function getUserById() {}

/**
 * Links configuration file
 * Contains social and external links
 */  // (unnecessary file header)
```

**Good examples:**
```ts
// Offset by 1 because the API uses 1-based indexing
const index = position + 1

/*
 * Using a junction table here instead of a direct relation
 * because Payload's depth queries become expensive with
 * nested user data across multiple collections
 */
```
