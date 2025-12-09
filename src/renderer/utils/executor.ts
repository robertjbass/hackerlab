import * as esbuild from 'esbuild-wasm'

let esbuildInitialized = false
let esbuildInitError: Error | null = null

async function initEsbuild(): Promise<void> {
  if (esbuildInitialized) return
  if (esbuildInitError) throw esbuildInitError

  try {
    // Use local WASM file to avoid version mismatches with CDN
    // The file is copied from node_modules/esbuild-wasm/esbuild.wasm to public/
    const wasmURL = '/esbuild.wasm'
    console.log('[esbuild] Initializing with local WASM:', wasmURL)

    await esbuild.initialize({ wasmURL })
    esbuildInitialized = true
    console.log('[esbuild] Initialized successfully')
  } catch (error) {
    // Already initialized is okay
    if (
      error instanceof Error &&
      error.message.includes('Cannot call "initialize" more than once')
    ) {
      esbuildInitialized = true
      console.log('[esbuild] Already initialized')
    } else {
      console.error('[esbuild] Initialization failed:', error)
      esbuildInitError =
        error instanceof Error ? error : new Error(String(error))
      throw esbuildInitError
    }
  }
}

export type OutputItem = {
  id: string
  type: 'log' | 'error' | 'warn' | 'info' | 'result' | 'react'
  content: string
  timestamp: number
}

type ExecuteOptions = {
  code: string
  type: string
  onOutput: (output: OutputItem) => void
}

function createOutput(type: OutputItem['type'], content: string): OutputItem {
  return {
    id: crypto.randomUUID(),
    type,
    content,
    timestamp: Date.now(),
  }
}

export async function executeCode({
  code,
  type,
  onOutput,
}: ExecuteOptions): Promise<void> {
  if (!code.trim()) {
    return
  }

  // Handle markdown - render as HTML
  if (type === 'markdown') {
    const html = markdownToHtml(code)
    onOutput(createOutput('react', createHtmlPreview(html)))
    return
  }

  // Initialize esbuild
  try {
    await initEsbuild()
  } catch (error) {
    onOutput(
      createOutput(
        'error',
        `Failed to initialize transpiler: ${error instanceof Error ? error.message : String(error)}`,
      ),
    )
    return
  }

  // Transform imports to esm.sh
  const codeWithImports = transformImports(code)

  // Transpile with esbuild
  const isJsx = type === 'tsx' || type === 'jsx'
  const loader = isJsx ? 'tsx' : type === 'typescript' ? 'ts' : 'js'

  let transpiledCode: string
  try {
    const result = await esbuild.transform(codeWithImports, {
      loader,
      jsx: 'transform',
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
      target: 'es2020',
      format: 'esm',
    })
    transpiledCode = result.code
  } catch (error) {
    if (error instanceof Error) {
      onOutput(createOutput('error', `Transpilation error: ${error.message}`))
    }
    return
  }

  // Check if this is a React component (has JSX or exports a component)
  const hasReactComponent =
    isJsx &&
    (code.includes('<') ||
      code.includes('export default') ||
      code.includes('export function'))

  if (hasReactComponent) {
    // React code is rendered in an iframe - no need to wait
    executeReactCode(transpiledCode, onOutput)
  } else {
    await executePlainCode(transpiledCode, onOutput)
  }
}

function transformImports(code: string): string {
  return code.replace(
    /import\s+(.+?)\s+from\s+['"]([^'"./][^'"]*)['"]/g,
    (match, imports, pkg) => {
      if (pkg.startsWith('http')) return match
      return `import ${imports} from 'https://esm.sh/${pkg}'`
    },
  )
}

// Generate unique execution ID
let executionCounter = 0
function getExecutionId(): string {
  return `exec_${Date.now()}_${++executionCounter}`
}

async function executePlainCode(
  code: string,
  onOutput: (output: OutputItem) => void,
): Promise<void> {
  const execId = getExecutionId()
  console.log('[executor] Starting plain code execution:', execId)

  return new Promise((resolve) => {
    let resolved = false
    let blobUrl: string | null = null

    const cleanup = () => {
      if (resolved) return
      resolved = true
      window.removeEventListener('message', handleMessage)
      if (iframe.parentNode) {
        document.body.removeChild(iframe)
      }
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }
      resolve()
    }

    const timeoutId = setTimeout(() => {
      onOutput(createOutput('error', 'Execution timed out (10s)'))
      cleanup()
    }, 10000)

    function handleMessage(event: MessageEvent) {
      // Check if this message is for our execution
      if (!event.data || event.data.execId !== execId) {
        return
      }

      console.log('[executor] Received message:', event.data.type, event.data)

      const { type, data } = event.data
      if (type === 'console') {
        onOutput(createOutput(data.method, formatValue(data.args)))
      } else if (type === 'error') {
        onOutput(createOutput('error', data.message))
      } else if (type === 'result') {
        if (data.value !== undefined) {
          onOutput(createOutput('result', formatValue([data.value])))
        }
      } else if (type === 'done') {
        console.log('[executor] Execution done, cleaning up')
        clearTimeout(timeoutId)
        cleanup()
      }
    }

    window.addEventListener('message', handleMessage)

    // Create HTML content for execution
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <script type="module">
          const EXEC_ID = '${execId}';

          // Override console methods
          const originalConsole = { ...console };
          ['log', 'error', 'warn', 'info'].forEach(method => {
            console[method] = (...args) => {
              parent.postMessage({ execId: EXEC_ID, type: 'console', data: { method, args: args.map(a => {
                try { return typeof a === 'object' ? JSON.stringify(a) : String(a); }
                catch { return String(a); }
              }) } }, '*');
              originalConsole[method](...args);
            };
          });

          // Global error handler
          window.onerror = (message, source, line, col, error) => {
            parent.postMessage({ execId: EXEC_ID, type: 'error', data: { message: error?.message || String(message) } }, '*');
            return true;
          };

          // Unhandled promise rejection
          window.onunhandledrejection = (event) => {
            parent.postMessage({ execId: EXEC_ID, type: 'error', data: { message: event.reason?.message || String(event.reason) } }, '*');
          };

          // Execute code
          (async () => {
            try {
              ${code}
              parent.postMessage({ execId: EXEC_ID, type: 'done' }, '*');
            } catch (error) {
              parent.postMessage({ execId: EXEC_ID, type: 'error', data: { message: error.message || String(error) } }, '*');
              parent.postMessage({ execId: EXEC_ID, type: 'done' }, '*');
            }
          })();
        </script>
      </head>
      <body></body>
      </html>
    `

    // Use blob URL to bypass CSP restrictions on inline scripts
    const blob = new Blob([html], { type: 'text/html' })
    blobUrl = URL.createObjectURL(blob)

    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    // No sandbox - blob URLs need full permissions for postMessage to work
    iframe.src = blobUrl
    document.body.appendChild(iframe)
    console.log('[executor] Iframe created with blob URL')
  })
}

function executeReactCode(
  code: string,
  onOutput: (output: OutputItem) => void,
): void {
  console.log('[executor] Creating React preview HTML')

  // The code will have JSX like <MyComponent /> which transpiles to React.createElement(MyComponent)
  // We need React to be available BEFORE the user's code runs
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        #root { padding: 16px; }
        .error { color: red; padding: 16px; font-family: monospace; white-space: pre-wrap; }
        .loading { color: #666; padding: 16px; }
      </style>
    </head>
    <body>
      <div id="root"><div class="loading">Loading React...</div></div>
      <script type="module">
        try {
          // Import React FIRST so it's available for the user's transpiled JSX
          const React = await import('https://esm.sh/react@18');
          const ReactDOM = await import('https://esm.sh/react-dom@18/client');

          // Make React globally available for createElement calls
          window.React = React;

          // Execute user code - eval returns the last expression value
          const userCode = ${JSON.stringify(code)};

          // eval() returns the value of the last expression
          const result = eval(userCode);

          // Try to render the result if it's a React element or component
          const root = ReactDOM.createRoot(document.getElementById('root'));

          if (result && (result.$$typeof || typeof result === 'function')) {
            // It's a React element or component
            if (typeof result === 'function') {
              root.render(React.createElement(result));
            } else {
              root.render(result);
            }
          } else if (result !== undefined) {
            // Just display the result as text
            root.render(React.createElement('pre', null, JSON.stringify(result, null, 2)));
          } else {
            root.render(React.createElement('div', { className: 'error' }, 'No component to render. Make sure your code returns a React element or component.'));
          }
        } catch (error) {
          console.error('Execution error:', error);
          document.getElementById('root').innerHTML = '<div class="error">Error: ' + error.message + '</div>';
        }
      </script>
    </body>
    </html>
  `

  // Output the HTML - it will be rendered in an iframe by CodeBlock
  // No need to wait for messages since the iframe renders independently
  onOutput(createOutput('react', html))
}

function formatValue(args: unknown[]): string {
  return args
    .map((arg) => {
      if (arg === null) return 'null'
      if (arg === undefined) return 'undefined'
      if (typeof arg === 'string') return arg
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2)
        } catch {
          return String(arg)
        }
      }
      return String(arg)
    })
    .join(' ')
}

function markdownToHtml(markdown: string): string {
  const html = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')

  return `<p>${html}</p>`
}

function createHtmlPreview(html: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 16px;
          line-height: 1.6;
          color: #1a1a1a;
        }
        h1, h2, h3 { margin: 1em 0 0.5em; }
        h1 { font-size: 1.5em; }
        h2 { font-size: 1.25em; }
        h3 { font-size: 1.1em; }
        p { margin: 0.5em 0; }
        code { background: #f0f0f0; padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em; }
        pre { background: #f0f0f0; padding: 1em; border-radius: 4px; overflow-x: auto; margin: 1em 0; }
        pre code { background: none; padding: 0; }
        a { color: #0066cc; }
      </style>
    </head>
    <body>${html}</body>
    </html>
  `
}
