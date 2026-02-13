# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
