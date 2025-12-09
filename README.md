# Hackerlab

A modern TypeScript playground for rapid prototyping and experimentation.

## Features

- **Full TypeScript Support** - Write TypeScript and TSX with real-time type checking
- **NPM Package Imports** - Use any npm package via esm.sh (e.g., `import _ from 'lodash'`)
- **Live Output Panel** - See results instantly, including rendered React components
- **Block-Based Editor** - Organize code in Notion-style blocks
- **Monaco Editor** - The same powerful editor that powers VS Code
- **Sandboxed Execution** - Code runs safely in an isolated iframe

## Status: Working POC

This is a working proof-of-concept. The following features are implemented:

- [x] Three-panel layout (sidebar, blocks, output)
- [x] Monaco editor with TypeScript/TSX support
- [x] Block system (add, delete, different types)
- [x] File persistence (~/.hackerlab directory)
- [x] Code transpilation via esbuild-wasm
- [x] Sandboxed execution in iframe
- [x] Console output capture
- [x] React component preview
- [x] Markdown preview
- [x] Auto-save (500ms debounce)
- [x] First-run experience (project creation)
- [x] Resizable panels

## Tech Stack

- **Runtime:** Electron 39
- **Build:** electron-vite + Vite 7
- **UI:** React 19 + TailwindCSS 4
- **Editor:** Monaco Editor (@monaco-editor/react)
- **Transpilation:** esbuild-wasm
- **Language:** TypeScript (strict mode)

## Development

### Prerequisites

- Node.js 22+
- pnpm 10+

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Package for distribution
pnpm package
```

### Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm package` - Build and package with electron-builder
- `pnpm format` - Format code with Prettier
- `pnpm lint` - Lint code with ESLint

## Project Structure

```
src/
├── main/                    # Electron main process
│   └── index.ts            # App entry, window, IPC handlers
├── preload/
│   └── index.ts            # Secure context bridge, type definitions
├── renderer/               # React app
│   ├── App.tsx             # Main app component
│   ├── index.tsx           # React entry point
│   ├── index.css           # Tailwind CSS entry
│   ├── components/
│   │   ├── Sidebar.tsx     # Project list sidebar
│   │   ├── BlockList.tsx   # Code blocks container
│   │   ├── CodeBlock.tsx   # Monaco editor block
│   │   ├── OutputPanel.tsx # Console/preview output
│   │   └── NewProjectModal.tsx
│   └── utils/
│       └── executor.ts     # Transpilation and execution
├── constants.ts            # App name constant
└── electron.vite.config.ts # Build configuration
```

## Data Storage

Projects are stored in `~/.hackerlab/`:

```
~/.hackerlab/
├── projects/
│   └── my-project/
│       ├── config.json     # Project metadata
│       ├── block-001.ts    # Code files
│       └── block-002.tsx
├── cache/
│   └── packages/           # (Future) Package cache
└── settings.json           # App settings
```

## Performance

Current metrics (development build):

- **Bundle size (renderer):** ~760 KB (mostly Monaco)
- **Build time:** ~9s
- **Startup:** Shows window immediately, hydrates after

### Optimizations Applied

- Monaco loads on-demand per block
- esbuild-wasm loaded from CDN (no native module overhead)
- Auto-save debounced at 500ms
- Code execution has 10s timeout

### Known Bottlenecks

- First code execution initializes esbuild-wasm (noticeable delay)
- Many blocks = many Monaco instances (consider virtual scrolling)

## Keyboard Shortcuts

- `Cmd/Ctrl + Enter` - Run current block

## Known Limitations

- Blocks don't share context (each runs in isolation)
- No drag-and-drop block reordering yet
- No project rename/delete yet
- Simple markdown renderer (no tables/syntax highlighting)
- macOS-optimized UI (traffic lights, etc.)

## Roadmap

See [PLAN.md](./PLAN.md) for the full implementation plan. Next up:

- Phase 8: NPM Package Support (caching, version tracking)
- Phase 9: Project Management (rename, delete)
- Phase 10: Project Secrets (.env support)
- Phase 12: Polish & UX (keyboard shortcuts, drag-and-drop)

## License

ISC
