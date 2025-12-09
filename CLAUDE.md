# Hackerlab

## Project Overview

Hackerlab is an Electron desktop app - a JavaScript/TypeScript REPL similar to RunJS with enhanced features:

- TypeScript, JSX/TSX support with full type checking
- Import any npm package (server or client side)
- Output panel displays results or rendered React components
- Notion-style "blocks" for organizing different content types
- VS Code theme compatibility (installable from marketplace)
- Work in progress - not yet production ready

## Tech Stack

- **Runtime:** Electron
- **UI:** React + TailwindCSS
- **Editor:** Monaco Editor
- **Languages:** TypeScript, TSX, JSX

## TypeScript

- Always use TypeScript instead of JavaScript unless specifically directed otherwise
- Always use `type` instead of `interface` for type definitions
- Use explicit `type` keyword for type imports:
  - All type imports: `import type { Type1, Type2 } from './file'`
  - Mixed imports: `import { type Type1, type Type2, someFunction } from './file'`
- Keep types close to the functions/modules they're used with (don't create separate `types.ts` files just to store types)
- Path aliases: Use `@/*` → `src/*` (this project has a build step)
- Prefer options objects over multiple function parameters for better readability and flexibility:
  - Multiple positional parameters obscure argument meaning and require remembering order
  - Options objects are self-documenting, can be passed in any order, and are easier to extend
  - Exception: If a function has a clear "primary" argument (the main subject of the operation), use it as the first positional parameter followed by an options object:

    ```ts
    // Good: primary argument + options
    function findUser(
      id: string,
      options: { includeDeleted?: boolean; fields?: string[] },
    )

    // Good: all options (no clear primary)
    function createReport(options: {
      startDate: Date
      endDate: Date
      format: string
    })

    // Avoid: multiple positional parameters
    function findUser(id: string, includeDeleted: boolean, fields: string[])
    ```

## React

- Functional components with TypeScript
- Use `type` for props definitions (not interface)
- In useEffect, define async function inside then call it:
  ```tsx
  useEffect(() => {
    async function fetchData() {
      try {
        const result = await doSomething()
        setData(result)
      } catch (error: unknown) {
        console.error(error)
      }
    }
    fetchData()
  }, [])
  ```

## Electron

- Clear main/renderer process separation
- Use IPC for process communication
- Preload scripts for secure context bridging

## Monaco Editor

- Configure for TypeScript/TSX language support
- Integrate VS Code themes

## TailwindCSS

- Use Tailwind utility classes for styling
- Keep custom CSS minimal

## Block System

- Notion-style blocks for content organization
- Block types: code, output, markdown, React component preview

## Package Manager

- Use `pnpm` / `pnpx` (not npm/yarn/npx)

## Module System

- Use ESM (`"type": "module"` in package.json)
- Use `import/export` syntax (not CommonJS `require/module.exports`)

## Git

- Use defaults from github/gitignore for project type
- ALWAYS include `.env` in every `.gitignore`

## Git Commits

- Use Conventional Commits format (`feat:`, `fix:`, `chore:`, etc.)
- Use multiple `-m` flags to separate title from body (keeps GitHub titles clean):
  ```bash
  git commit -m "feat: Add database initialization" -m "Detect if database is installed, run seeds if detected"
  ```
- Do NOT include "Co-authored-by: Claude" or similar attribution

## Prettier

```json
{ "printWidth": 80, "semi": false, "singleQuote": true, "trailingComma": "all" }
```

- Create `.prettierignore` excluding markdown files
- Add script: `"format": "prettier --write ."`

## ESLint

- Use reasonable defaults for React/TypeScript project
- Add script: `"lint": "eslint ."`

## Error Handling & Async

- Use `try/catch` with thrown errors
- Always use `error` (not `err`) in catch blocks
- Always use `await` instead of `.then()` chains
- Error messages should include actionable fix suggestions

## Function Definitions

- Use `function` keyword for named functions: `function myFunction() {}`
- Use arrow functions only for: anonymous functions, inline callbacks, IIFEs
- IIFE style: `(() => {})()` not `(function() {})()`

## Naming Conventions

- **Files:** kebab-case (e.g., `user-service.ts`, `api-helpers.ts`)
- **Functions/Variables:** camelCase (e.g., `getUserById`, `isActive`)
- **Types:** PascalCase (e.g., `UserConfig`, `ApiResponse`)
- **Constants:** SCREAMING_SNAKE_CASE (e.g., `DEFAULT_TIMEOUT`, `MAX_RETRIES`)
- **React Components:** PascalCase files (e.g., `CodeBlock.tsx`, `OutputPanel.tsx`)

## Testing

- Always ask before setting up testing
- Use Vitest for this project (React + Vite-based tooling)

## Documentation

- Ask before updating README.md after significant features
- Do not create markdown files without asking
