# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.5] - 2026-02-22

### Changed
- Migrated `middleware.ts` to `proxy.ts` (Next.js 16 file convention rename)

## [0.3.4] - 2026-02-22

### Added
- First-user-is-admin hook: automatically assigns the admin role to the first created user

## [0.3.3] - 2026-02-22

### Security
- Middleware now validates JWT session via Auth.js instead of checking cookie existence
- Logout route: removed GET handler to prevent CSRF logout attacks
- Logout route: reject requests when both Origin and Referer headers are absent
- Server-side callbackUrl validation in login server action
- Added `overrideAccess: true` to `getUserRoles` to prevent recursive access checks
- `assignDefaultRole` errors now propagate instead of being silently swallowed

### Fixed
- `getPostBySlug`, `getPostsByCategory`, `getPostsByTag` now use `select`/`populate` to avoid over-fetching
- `getPostsByCategory` paginates through all junction rows instead of capping at 100
- Login page shows loading spinner while providers fetch, with error state on failure
- Stale `active.json` updated from Rosé Pine Moon to Indigo Slate
- PWA manifest `display` changed to `browser` until icons are added

### Improved
- Mobile responsiveness: 44px touch targets on header, footer, pagination, and auth pages
- Mobile responsiveness: safe-area insets for notched phones (header, footer, body)
- Mobile responsiveness: global overflow-x protection and word-wrap
- Mobile responsiveness: admin login form inputs use 16px font to prevent iOS zoom
- Blog prose content styled with `@tailwindcss/typography` and overflow-safe images/code blocks

### Dependencies
- Updated Payload CMS packages from 3.76.1 to 3.77.0
- Added `@tailwindcss/typography` for blog content styling

## [0.3.2] - 2026-02-21

### Added
- **Role system redesign:** Role and UserRole junction collections with compound unique indexes
- **Blog system:** Post, Category, Tag, PostCategory collections with draft/publish workflow
- **Blog frontend:** Listing, detail (ISR), category/tag filter pages, RSS feed
- **SEO infrastructure:** sitemap.ts, robots.ts, web manifest, favicon, metadata helper
- **Error boundaries:** Route-level and global error pages with safe error display
- **Auth middleware:** Redirect unauthenticated users from protected routes
- **Shared field helpers:** `slugField()` and `seoFields()` for collection reuse
- **Site config:** Centralized name, description, URL, social links (`src/lib/site-config.ts`)
- **Shared navigation:** Single source for nav links used in header and footer
- **Access control helpers:** `authenticated`, `publishedOrAdmins`, `ownerOrAdmins`
- **Image sizes:** Thumbnail (300x300), medium (800x600), large (1200x900) on Media collection
- **Documentation:** Google OAuth, GitHub OAuth, deployment, and architecture decisions guides

### Changed
- Replaced Rose Pine Moon CSS theme with documented Indigo/Slate palette (light + dark)
- Role system migrated from User.role select field to junction table pattern (Role + UserRole)
- Renamed `UserRole` enum to `RoleName` to avoid conflict with Payload-generated types
- First-user-admin logic now uses cheap count guard before serializable transaction
- Auth error page uses semantic color tokens instead of raw Tailwind colors
- Header, footer, hero, CTA now use siteConfig and shared navigation (no hardcoded values)
- Lexical editor configured with headings, blockquote, horizontal rule, links, uploads
- `siteConfig.url` uses `NEXT_PUBLIC_SITE_URL` with `VERCEL_PROJECT_PRODUCTION_URL` and `AUTH_URL` fallbacks
- Dead links removed (/products, /pricing, /docs, /auth/register, /dashboard)

### Fixed
- `slugField()` now correctly uses the `sourceField` parameter instead of hardcoding title/name
- RSS feed escapes CDATA content and XML-escapes channel metadata
- Error boundaries display generic messages instead of potentially leaking internal details
- Junction table hooks pass `req` to `payload.count()` for transaction safety
- `PostCard` accepts partial post type matching `select` query fields
- Unused imports removed (Link in blog page, anyone/authenticated in collections)

### Removed
- `src/lib/links.ts` (replaced by site-config.ts)
- `src/lib/payloadClient.ts` dead code (queryPayload function for non-existent API endpoint)
- User.role select field (replaced by junction table)

## [0.3.1] - 2026-02-17

### Improvements
- Default dev/start server port changed to 4000
- Downgraded Next.js from canary (16.2.0-canary.38) to stable (16.1.6)
- Aligned all shared dependency versions with layerbase project
- Upgraded eslint to v10, @eslint/js to v10, sharp to 0.34.5, lucide-react to 0.574.0
- Loosened pinned versions (react, @types/react, typescript) to use caret ranges

### Bug Fixes
- Hardened access control, security headers, and media uploads

## [0.3.0] - 2026-02-12

### Added
- Google OAuth provider (alongside existing GitHub OAuth)
- Custom `PayloadAdapter` bridging Auth.js to Payload CRUD (replaces `payload-authjs` plugin)
- Custom `AuthjsStrategy` for Payload admin panel authentication via Auth.js JWTs
- Provider-generic helper system (`provider-helpers.ts`) for easy addition of new OAuth providers
- User avatar resolution system (`resolve-user-image.ts`) with priority: uploaded > last auth method > any OAuth
- Per-user OAuth fields: `googleId`, `githubId`, `googleImageUrl`, `githubImageUrl`
- `authProvider` (original signup method) and `lastAuthMethod` (most recent login) tracking
- Email login token fields for future email verification flow
- Nuclear `/logout` route that clears all cookies from both auth systems
- `afterLogout` hook to clear Auth.js cookies when logging out of Payload admin
- Google and GitHub icon components for admin login form
- `DEV_DB_PUSH` environment variable for schema push mode (independent of `NODE_ENV`)
- Image remote patterns for Google and GitHub avatar hostnames
- Admin panel groups: User → "Admin", Media → "Assets"
- Authentication architecture documentation in CLAUDE.md

### Changed
- **Breaking:** Collection slug changed from `users` to `user` (singular, requires fresh database)
- **Breaking:** Removed `payload-authjs` plugin in favor of custom adapter/strategy
- Upgraded `payload` and all `@payloadcms/*` packages from 3.69.0 to 3.76.1
- Upgraded `next` from 16.1.0 to 16.1.6
- Renamed env vars: `AUTH_GITHUB_ID` → `GITHUB_CLIENT_ID`, `AUTH_GITHUB_SECRET` → `GITHUB_CLIENT_SECRET`
- Admin login form now supports Google + GitHub OAuth buttons with email/password fallback
- Frontend login page now uses server actions with both Google and GitHub options
- Tightened User collection access: create/update/delete/admin restricted to admins
- Tightened Media collection access: create/update/delete restricted to admins
- Collections now use default exports and typed slugs (`CollectionConfig<'user'>`)
- `payload.config.ts` now uses actionable error messages for missing env vars
- `AuthHeader` gracefully handles stale/unreadable session cookies
- Header sign-out now uses `/logout` route instead of `/api/auth/signout`
- Removed GitHub icon from header (no longer provider-specific)

### Removed
- `payload-authjs` package dependency
- `collections/index.ts` barrel file (import collections directly by path)
- Old `Users/` collection directory (replaced by singular `User/`)
- `ensureFirstUserIsAdmin` hook (admin role now managed through OAuth signIn callback)
- `setDefaultAuthProvider` hook (auth provider set by OAuth flow)

## [0.2.0] - 2025-12-21

### Added
- User registration with email/password from admin login form
- Role-based access control (admin/user roles)
- First-user-is-admin hook
- Custom admin login page with inline styles (no Tailwind in admin panel)
- GitHub OAuth authentication via `payload-authjs` plugin
- shadcn/ui component library integration (Button, Card, Input, Label, Dialog)
- Color palette system with OKLCH CSS variables (Indigo/Slate theme)
- Icon barrel file with lucide-react re-exports and custom brand icons
- Frontend auth pages (login, error)
- Auth header component with session-aware user display
- Sonner toast notifications
- Code comment conventions in CLAUDE.md
- PayloadCMS query optimization guidelines

### Changed
- Rebranded from DevTools to Hackerlab
- Upgraded dependencies and added version check script
- Refactored admin login to use inline styles

## [0.1.0] - 2025-12-12

### Added
- Initial project setup with Next.js 16, PayloadCMS 3.x, React 19
- PostgreSQL database with initial migration schema
- Vercel Blob storage for media uploads
- NextAuth authentication integration
- ESLint flat config with TypeScript support
- Prettier formatting configuration
- Vercel deployment configuration
- Development environment configuration and CLAUDE.md documentation
- Users and Media collections
