# Hackerlab Implementation Plan

> **For Claude Code:** This is the implementation plan for Hackerlab. Follow this document and CLAUDE.md for all development. Work through phases sequentially, updating README.md after each phase.

> **Misc Notes:**

- Hackerlab is a working name and may change
- Reference [this repo](https://github.com/robertjbass/electron-env-manager) for formatting and structure
- Always use PNPM/PNPX and not NPM/NPX

## Overview

Hackerlab is an Electron-based JavaScript/TypeScript playground. Think of it as a minimal VS Code where each "block" is essentially a file, with code on the left and live output/preview on the right.

## Tech Stack

- **Framework:** Electron (pin to latest version compatible with electron-vite at init time)
- **UI:** React + TailwindCSS v4
- **Editor:** Monaco Editor
- **Transpilation:** esbuild (fast, handles TypeScript + JSX)
- **State Management:** React Context (may add SQLite later)
- **Package Manager:** pnpm

## Architecture

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Sidebar (projects)  │  Code Blocks with Inline Output       │
│                      │                                       │
│  - Project 1         │  ┌─────────────────────────────────┐  │
│  - Project 2         │  │ [Block 1 - Editor]              │  │
│  - Project 3         │  │ [Block 1 - Output]              │  │
│                      │  └─────────────────────────────────┘  │
│                      │  ┌─────────────────────────────────┐  │
│                      │  │ [Block 2 - Editor]              │  │
│                      │  │ [Block 2 - Output]              │  │
│                      │  └─────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

- **Left sidebar:** Project list and navigation
- **Main area:** Scrollable list of code blocks, each with:
  - Monaco editor instance
  - Inline output panel (console logs, React preview) directly below

### Block System

Each block is a mini-file with:

- Monaco editor instance
- File type indicator (ts, tsx, js, jsx, md)
- Sandbox toggle (when OFF, block shares context with others; when ON, isolated execution)
- Run button (or auto-run on change)

**Execution model:**

- By default, blocks share state/context (like Jupyter cells)
- Each block can be toggled to "sandboxed" mode for isolated execution
- Blocks execute in order from top to bottom

**Future: Folder Structure (design with this in mind)**
Blocks represent real files, so we need to support nested folder structures eventually:

- Blocks can be organized into folders (like a file tree)
- Folder structure mirrors actual files in `~/.hackerlab/projects/<project>/`
- UI should accommodate a tree view in sidebar (collapsed by default, flat view initially)
- Block paths stored in config.json (e.g., `"file": "utils/helpers.ts"`)
- For v1: Keep flat structure but use file paths that support nesting later

### Data Storage

```
~/.hackerlab/
├── projects/
│   ├── my-project/
│   │   ├── config.json          # Project metadata
│   │   ├── package.json         # Tracked dependencies
│   │   ├── .env                 # Project secrets (never synced/shared)
│   │   ├── block-001.ts         # Actual code files
│   │   ├── block-002.tsx
│   │   └── block-003.md
│   └── another-project/
│       └── ...
├── cache/
│   └── packages/                # Global package cache
├── keys.json                    # API keys (Copilot, etc.) - BYOK
└── settings.json                # App-wide settings
```

**config.json structure:**

```json
{
  "name": "my-project",
  "blocks": [
    {
      "id": "block-001",
      "file": "block-001.ts",
      "type": "typescript",
      "isSandboxed": false,
      "order": 0
    },
    {
      "id": "block-002",
      "file": "block-002.tsx",
      "type": "tsx",
      "isSandboxed": false,
      "order": 1
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### NPM Package Handling

1. **Detection:** Parse import/require statements from code
2. **Resolution:** Transform bare imports to esm.sh/unpkg URLs at runtime
3. **Caching:** Download and cache packages in `~/.hackerlab/cache/packages/`
4. **Version tracking:** Store resolved versions in project's `package.json`

Example transformation:

```typescript
// User writes:
import _ from 'lodash'

// Transformed to:
import _ from 'https://esm.sh/lodash@4.17.21'
```

### Transpilation Pipeline

1. **TypeScript/TSX:** Use esbuild for fast transpilation
   - Strip types for simple TS
   - Full transform for TSX (React JSX)
2. **Execution:** Run transpiled code in a sandboxed iframe or web worker
3. **React rendering:** For TSX blocks, render output to the preview panel

### Electron Structure

```
src/
├── main/                    # Electron main process
│   ├── index.ts            # App entry, window management
│   ├── ipc.ts              # IPC handlers
│   └── file-system.ts      # Project/file operations
├── preload/
│   └── index.ts            # Secure context bridge
├── renderer/               # React app
│   ├── App.tsx
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── BlockList.tsx
│   │   ├── CodeBlock.tsx
│   │   ├── OutputPanel.tsx
│   │   └── ...
│   ├── hooks/
│   ├── stores/             # State management
│   └── utils/
│       ├── transpiler.ts   # esbuild wrapper
│       ├── package-resolver.ts
│       └── executor.ts     # Code execution
└── shared/                 # Types shared between processes
    └── types.ts
```

## Implementation Phases

### Phase 1: Project Scaffolding ✅

- [x] Clean up existing package.json (remove placeholder scripts, add proper metadata)
- [x] Convert `constants.js` to `constants.ts`
- [x] Initialize Electron with electron-vite or similar
- [x] Set up React + TailwindCSS v4 in renderer
- [x] Configure TypeScript
- [x] Set up basic window with placeholder layout
- [x] Configure esbuild for the project
- [x] Update package.json scripts for format/lint (prettier and eslint already installed)

**Implementation Notes (Phase 1):**

- Converted constants.js to constants.ts with `as const` for better type inference
- Created electron.vite.config.ts with path aliases (@/_ → src/_)
- Set up tsconfig.json with strict mode, ESNext module, and JSX support
- Configured main process with IPC handlers in src/main/index.ts
- Created preload script with type-safe API bridge
- Using esbuild-wasm instead of native esbuild to avoid native module issues in renderer
- Simplified eslint.config.js to remove import plugin (was causing issues)

### Phase 2: Core Layout ✅

- [x] Create three-panel layout (sidebar, blocks, output)
- [x] Implement resizable panels
- [x] Style with TailwindCSS to match VS Code aesthetic (dark theme)
- [x] Add basic window controls

**Implementation Notes (Phase 2):**

- Created App.tsx with three-column flex layout
- Panels are resizable via mouse drag (custom implementation, not a library)
- Used zinc color palette for VS Code-like dark theme
- Sidebar has window drag region for macOS traffic lights
- Using hiddenInset titleBarStyle on macOS for clean look
- Panel widths stored in state (could persist to settings later)

### Phase 3: Monaco Editor Integration ✅

- [x] Install and configure Monaco
- [x] Create CodeBlock component with Monaco instance
- [x] Configure TypeScript/TSX language support
- [x] Set up a dark theme (start with built-in, add VS Code themes later)

**Implementation Notes (Phase 3):**

- Using @monaco-editor/react for easy React integration
- Configured TypeScript compiler options for strict mode, ESNext, and JSX
- Added basic React type definitions for better autocomplete
- Using vs-dark theme (built-in)
- Editor options: no minimap, 14px font, word wrap, custom scrollbars
- Each CodeBlock has its own Monaco instance (consider virtual scrolling for many blocks)

### Phase 4: Block System ✅

- [x] Implement block data model
- [x] Create block list with add/remove/reorder
- [x] Add block type selector (ts, tsx, js, jsx, md)
- [x] Implement sandbox toggle per block
- [x] Handle block focus and navigation

**Implementation Notes (Phase 4):**

- Block model in preload/index.ts with id, file, type, isSandboxed, order
- BlockList component with dropdown menu for adding new blocks
- Delete confirmation inline (not a modal) to reduce friction
- Sandbox toggle UI exists but execution is always sandboxed (per-block context sharing not yet implemented)
- Keyboard shortcut Cmd/Ctrl+Enter to run code
- Reordering not yet implemented (drag-and-drop deferred to Phase 12)

### Phase 5: File System & Persistence ✅

- [x] Create `~/.hackerlab` directory structure
- [x] Implement project CRUD operations
- [x] Save/load blocks as individual files
- [x] Manage config.json for each project
- [x] Auto-save on change (debounced)

**Implementation Notes (Phase 5):**

- Directory structure created in main process on app ready
- IPC handlers for: get-projects, create-project, load-project, save-block, add-block, delete-block
- Auto-save debounced at 500ms (configurable in CodeBlock)
- config.json tracks blocks array with metadata
- First run experience: modal prompts for project name with auto-normalization
- Project files stored in ~/.hackerlab/projects/<name>/

### Phase 6: Transpilation & Execution ✅

- [x] Set up esbuild in renderer (or via IPC)
- [x] Implement TypeScript transpilation
- [x] Implement TSX transpilation
- [x] Create execution sandbox (iframe or worker)
- [x] Capture console output
- [x] Handle execution errors gracefully

**Implementation Notes (Phase 6):**

- Using esbuild-wasm loaded from unpkg CDN (avoids native module issues)
- Transforms bare imports to esm.sh URLs (e.g., 'react' → 'https://esm.sh/react')
- Iframe sandbox with srcdoc for code execution
- Console methods (log, error, warn, info) proxied via postMessage
- 10 second timeout for runaway code
- React code detected by JSX presence and rendered in iframe with esm.sh React/ReactDOM
- Simple markdown-to-HTML converter built-in (could upgrade to marked/remark later)

**Concerns & Ideas:**

- esbuild-wasm initialization happens on first run (could preload)
- Import transformation is basic regex - could miss edge cases
- No shared context between blocks yet (all sandboxed)
- React component detection heuristic could be improved

### Phase 7: Output Panel ✅

- [x] Display console.log output
- [x] Render React components from TSX blocks
- [x] Show execution errors with stack traces
- [x] Clear output on re-run

**Implementation Notes (Phase 7):**

- **Design Change:** Removed shared OutputPanel - each block now has inline output directly below its editor
- Each CodeBlock manages its own output state (console logs, errors, React previews)
- Added "live compile" toggle (lightning bolt icon) per block - auto-runs code as you type (800ms debounce)
- React preview renders in iframe directly below the block's editor
- Console output color-coded by type (log=default, error=red, warn=yellow, info=blue, result=green)
- Icons from lucide-react for output types
- **Bug Fix:** Iframe execution was hanging due to sandbox + postMessage issues:
  - Added `allow-same-origin` to sandbox attributes for proper postMessage
  - Added unique execution IDs to correctly route messages between parent and iframe
  - Wrapped executed code in async IIFE to support top-level await
  - Serialize console arguments before sending via postMessage

### Phase 8: NPM Package Support

- [ ] Parse imports from code blocks
- [ ] Resolve packages via esm.sh
- [ ] Implement global package cache
- [ ] Track versions in project package.json
- [ ] Handle package resolution errors

### Phase 9: Project Management

- [ ] Project open/close functionality
- [ ] Project rename/delete
- [ ] Create new project flow
- [ ] Switch between projects in sidebar
- [ ] Remember last-opened project

### Phase 10: Project Secrets

- [ ] Create secrets modal with Monaco editor (.env format)
- [ ] Store secrets in project's `.env` file
- [ ] Parse .env and inject into execution context
- [ ] Access via `process.env.SECRET_NAME` in user code
- [ ] Show "Secrets" button in project toolbar/sidebar
- [ ] Never include .env in any export/share feature

### Phase 11: AI Autocomplete (Optional)

- [ ] Integrate Monaco's inline completions API
- [ ] BYOK (Bring Your Own Key) setup in settings
- [ ] Store API keys securely in `~/.hackerlab/keys.json`
- [ ] Support OpenAI/Copilot-compatible endpoints
- [ ] Toggle autocomplete on/off per project or globally
- [ ] Graceful fallback when no key configured

### Phase 12: Polish & UX

- [ ] Keyboard shortcuts (run block, new block, etc.)
- [ ] Block drag-and-drop reordering
- [ ] Loading states and spinners
- [ ] Error boundaries

### Phase 13: CI/CD & Distribution

- [ ] GitHub Actions workflow for building on merge to main
- [ ] Build macOS executable (.dmg or .app)
- [ ] Upload build artifacts to GitHub Releases
- [ ] Add download link to README

## Key Technical Decisions

### Why esbuild?

- Extremely fast (written in Go)
- Handles TypeScript + JSX in one pass
- Can run in browser via WASM or in Node
- Active development, good ecosystem

### AI Autocomplete Architecture

Monaco has built-in support for inline completions. We'll use this API with:

- OpenAI-compatible endpoints (works with OpenAI, Anthropic via proxy, local models)
- User provides their own API key (BYOK)
- Keys stored in `~/.hackerlab/keys.json`:

```json
{
  "openai": {
    "apiKey": "sk-...",
    "endpoint": "https://api.openai.com/v1",
    "model": "gpt-4"
  },
  "custom": {
    "apiKey": "...",
    "endpoint": "https://my-proxy.com/v1",
    "model": "claude-3-sonnet"
  }
}
```

- Feature is completely optional - app works fine without it
- Consider using `continue.dev` or similar OSS library if it simplifies integration

### Why esm.sh over unpkg?

- Better ESM support
- Automatic dependency bundling
- TypeScript types support
- CDN-level caching

### Project Secrets

Each project has a `.env` file for secrets:

- Edited via modal with Monaco editor (syntax highlighting for .env format)
- Parsed using `dotenv` or simple key=value parser
- Injected into execution context as `process.env`
- Access pattern: `process.env.MY_API_KEY`
- Security notes:
  - Never log secrets to output panel
  - Never include in any export/share feature
  - Warn user if they try to console.log a secret value
  - Consider masking secret values in error stack traces

### Execution Sandboxing

Use an iframe with `srcdoc` for code execution:

- Isolated from main app
- Can render React components
- Console can be proxied back to main app
- Security boundary for user code
- Inject `process.env` object with secrets before execution

## GitHub Actions (CI/CD)

Create `.github/workflows/build.yml`:

```yaml
name: Build and Release

on:
  push:
    branches: [main]

jobs:
  build-mac:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build Electron app
        run: pnpm build
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: hackerlab-mac
          path: dist/*.dmg
```

Notes:

- Use `electron-builder` for packaging
- macOS builds need to run on `macos-latest`
- Windows/Linux can be added later with matrix builds
- Consider code signing for macOS distribution (requires Apple Developer account)

## Commands Reference

```bash
# Initialize project
pnpm create electron-vite

# Install core dependencies
pnpm add react react-dom
pnpm add -D @types/react @types/react-dom

# Install TailwindCSS v4
pnpm add tailwindcss@next @tailwindcss/vite@next

# Install Monaco
pnpm add monaco-editor @monaco-editor/react

# Install esbuild
pnpm add esbuild
```

## Important Constraints

### Electron Compatibility

- **Before installing any package**, verify it's compatible with the Electron version being used
- Electron bundles its own Node.js and Chromium - check compatibility matrices
- Some packages have Electron-specific versions (e.g., `electron-store` vs `conf`)
- Native modules may need rebuilding for Electron (`electron-rebuild`)

### Common Compatibility Issues to Watch

- `monaco-editor`: Use `@monaco-editor/react` which handles loading properly in Electron
- `esbuild`: Works fine, but WASM version may be needed in renderer process
- `tailwindcss`: v4 is new - verify it works with the build tooling
- File system access: Use Electron's IPC, not direct `fs` in renderer

### Security

- Enable `contextIsolation: true` in BrowserWindow
- Use `nodeIntegration: false`
- Expose only necessary APIs via preload script
- Sandbox user code execution (iframe with restricted permissions)

### Cross-Platform Considerations

- Use `electron.app.getPath('home')` for home directory (works on Windows, macOS, Linux)
- Use `path.join()` for all file paths
- Test file permissions on all platforms
- Handle Windows path separators

## Documentation Requirements

After each phase, update README.md with:

- Current feature status
- How to run the project locally
- Architecture decisions made
- Any known limitations

Keep README.md as the source of truth for:

- Installation instructions
- Development setup
- Project structure explanation
- Contributing guidelines (when applicable)

**Performance Section in README (required):**
Document and track:

- Current startup time (measure with `time` or Electron's metrics)
- Bundle size (main + renderer)
- Known performance bottlenecks and their status
- Optimization techniques applied
- Target metrics (e.g., "<1s to first interactive")

## Testing Strategy

- Use Vitest for unit tests
- Test transpilation logic separately from UI
- Test IPC handlers in isolation
- Manual testing for Electron-specific features

## Error Handling

- All file operations should have try/catch with user-friendly error messages
- Package resolution failures should suggest alternatives
- Transpilation errors should show in output panel with line numbers
- Never crash the app on user code errors

## Performance Considerations

### Startup Speed (Critical)

Hackerlab should open as fast as a notepad - users will reach for it for quick snippets.

**Electron Startup Optimizations:**

- Use `v8-compile-cache` for faster JS parsing
- Defer non-critical imports (lazy load Monaco, transpiler)
- Show window immediately with skeleton UI, hydrate after
- Use `backgroundThrottling: false` cautiously during startup
- Consider `BrowserWindow.show()` only after ready-to-show event with minimal content
- Profile startup with `--trace-startup` flag

**Bundle Size:**

- Tree-shake aggressively (esbuild handles this well)
- Code-split Monaco languages (only load TS/JS/TSX by default)
- Don't bundle unused Monaco features (diff editor, etc.)
- Consider dynamic imports for heavy features

**Runtime Performance:**

- Debounce auto-save (300-500ms)
- Debounce transpilation on keystroke (150-200ms)
- Lazy-load Monaco editor per block (not all at once)
- Cache transpiled code when source hasn't changed
- Use virtual scrolling if block list gets long
- Memoize React components appropriately

**Perceived Performance:**

- Show last-opened project instantly from cache
- Optimistic UI updates
- Progressive loading - show something useful in <500ms

## Reference Implementation

Use [electron-env-manager](https://github.com/robertjbass/electron-env-manager) as a reference for:

- **Electron + Vite configuration** - `electron.vite.config.ts` setup
- **Project structure** - `src/` organization for main/renderer processes
- **Monaco Editor in Electron** - Working Monaco integration with syntax highlighting
- **Build & release workflow** - GitHub Actions with semantic-release
- **State management patterns** - Entry tracking with metadata

Match the code structure and patterns from this project where applicable.

## First Run Experience

When user opens Hackerlab for the first time (no `~/.hackerlab` directory):

1. Create the directory structure automatically
2. Prompt user for project name via simple modal/dialog
3. Normalize the name (e.g., "My App" → "my-app") for the folder name
4. Create the project with one empty TypeScript block
5. Open the project immediately - user can start typing code right away

**Project name normalization:**

- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters
- Example: "My Cool App!" → "my-cool-app"

## Markdown Blocks

Markdown blocks (`.md` files) should:

- Render as HTML in the output panel (same as React components)
- Use a markdown-to-HTML library (e.g., `marked`, `remark`, or `react-markdown`)
- Support GitHub-flavored markdown (tables, code blocks, etc.)
- Monaco editor for editing, HTML preview in output panel
- Useful for documentation/notes between code blocks

## Code Quality & Formatting

**Prettier:**

- Create `.prettierrc` with project conventions (see CLAUDE.md)
- Create `.prettierignore` excluding markdown files
- Add scripts:
  - `"format": "prettier --write \"src/**/*.{ts,tsx}\""`
  - `"format:check": "prettier --check \"src/**/*.{ts,tsx}\""`

**ESLint:**

- Use flat config (`eslint.config.js`)
- Include `eslint-config-prettier` to avoid conflicts
- Include `typescript-eslint` for TypeScript support
- Add scripts:
  - `"lint": "eslint src/"`
  - `"lint:fix": "eslint src/ --fix"`

## Required Dependencies

Reference the electron-env-manager package.json for compatible versions. Use these packages as the standard choices:

**Package Selection Guidelines:**

- **Icons:** Use `lucide-react` (not heroicons, feather, etc.)
- **Monaco:** Use `@monaco-editor/react` wrapper
- **Styling:** TailwindCSS v4 only (no styled-components, emotion, etc.)
- **Build:** electron-vite + vite (not webpack)
- **Linting:** ESLint flat config + typescript-eslint + eslint-config-prettier

**Dev Dependencies:**

```json
{
  "@electron-toolkit/utils": "^4.0.0",
  "@tailwindcss/vite": "^4.1.17",
  "@types/node": "^24.10.1",
  "@types/react": "^19.2.6",
  "@types/react-dom": "^19.2.3",
  "@vitejs/plugin-react": "^5.1.1",
  "electron": "^39.2.3",
  "electron-builder": "^26.0.12",
  "electron-vite": "^4.0.1",
  "eslint": "^9.39.1",
  "eslint-config-prettier": "^10.1.8",
  "eslint-import-resolver-typescript": "^4.4.4",
  "eslint-plugin-import": "^2.32.0",
  "prettier": "^3.6.2",
  "tailwindcss": "^4.1.17",
  "typescript": "^5.9.3",
  "typescript-eslint": "^8.47.0",
  "vite": "^7.2.4"
}
```

**Dependencies:**

```json
{
  "@monaco-editor/react": "^4.7.0",
  "electron-updater": "^6.6.2",
  "lucide-react": "^0.554.0",
  "react": "^19.2.0",
  "react-dom": "^19.2.0"
}
```

**Additional for Hackerlab:**

- `esbuild` - for transpilation
- `react-markdown` or `marked` - for markdown rendering

## App Name Constant

The app name "hackerlab" may change. A `constants.js` file exists in the root:

```js
export const CONSTANTS = {
  APP_NAME: 'hackerlab',
} as const
```

**Important:** Always use `CONSTANTS.APP_NAME` instead of hardcoding "hackerlab":

- Config directory: `~/.${CONSTANTS.APP_NAME}/`
- Window title, about dialogs, etc.
- Any user-facing or file system references to the app name

This makes renaming the app a single-line change.

Note: Despite `constants.js` being JS, the entire app is written in TypeScript. This file can be converted to `constants.ts` during Phase 1.

## Notes

- Start simple, iterate fast
- Get a working prototype before optimizing
- TypeScript strict mode from day one
- **Follow CLAUDE.md conventions** for all code style decisions
- **Respect .prettierrc** - run format before commits
- When in doubt, check Electron docs for the installed version
- Reference the electron-env-manager repo for patterns and structure
- **Use CONSTANTS.APP_NAME** - never hardcode the app name
