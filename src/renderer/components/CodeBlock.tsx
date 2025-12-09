import { useRef, useCallback, useState, useEffect, useMemo } from 'react'
import Editor, { type OnMount, type Monaco } from '@monaco-editor/react'
import {
  Play,
  Trash2,
  FileCode,
  Box,
  X,
  Zap,
  ZapOff,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  ChevronDown,
} from 'lucide-react'
import { executeCode, OutputItem } from '../utils/executor'
import type { Block } from '../../preload/index'

type CodeBlockProps = {
  block: Block
  onChange: (content: string) => void
  onSave: (content: string) => void
  onDelete: () => void
  onUpdate: (updates: { file?: string; type?: string }) => void
}

const TYPE_LABELS: Record<string, string> = {
  typescript: 'TypeScript',
  tsx: 'TSX',
  javascript: 'JavaScript',
  jsx: 'JSX',
  markdown: 'Markdown',
}

const TYPE_EXTENSIONS: Record<string, string> = {
  typescript: 'ts',
  tsx: 'tsx',
  javascript: 'js',
  jsx: 'jsx',
  markdown: 'md',
}

const EXTENSION_TO_TYPE: Record<string, string> = {
  ts: 'typescript',
  tsx: 'tsx',
  js: 'javascript',
  jsx: 'jsx',
  md: 'markdown',
}

const BLOCK_TYPES = [
  { value: 'typescript', label: 'TypeScript' },
  { value: 'tsx', label: 'TSX' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'jsx', label: 'JSX' },
  { value: 'markdown', label: 'Markdown' },
]

const LANGUAGE_MAP: Record<string, string> = {
  typescript: 'typescript',
  tsx: 'typescript',
  javascript: 'javascript',
  jsx: 'javascript',
  markdown: 'markdown',
}

export function CodeBlock({
  block,
  onChange,
  onSave,
  onDelete,
  onUpdate,
}: CodeBlockProps) {
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const liveCompileTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [liveCompile, setLiveCompile] = useState(false)
  const [outputs, setOutputs] = useState<OutputItem[]>([])
  const [hasError, setHasError] = useState(false)

  // Editable state
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [showTypeMenu, setShowTypeMenu] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    configureMonaco(monaco)
  }

  function configureMonaco(monaco: Monaco) {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      allowNonTsExtensions: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      jsxFactory: 'React.createElement',
      jsxFragmentFactory: 'React.Fragment',
      allowJs: true,
      esModuleInterop: true,
      strict: true,
    })

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      jsx: monaco.languages.typescript.JsxEmit.React,
      allowJs: true,
    })

    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `
      declare namespace React {
        function createElement(type: any, props?: any, ...children: any[]): any;
        const Fragment: unique symbol;
      }
      declare const console: {
        log(...args: any[]): void;
        error(...args: any[]): void;
        warn(...args: any[]): void;
        info(...args: any[]): void;
      };
      `,
      'ts:global.d.ts',
    )
  }

  const runCode = useCallback(async () => {
    if (!block.content.trim()) {
      setOutputs([])
      return
    }

    setIsRunning(true)
    setHasError(false)
    const newOutputs: OutputItem[] = []

    try {
      await executeCode({
        code: block.content,
        type: block.type,
        onOutput: (output) => {
          newOutputs.push(output)
          if (output.type === 'error') {
            setHasError(true)
          }
        },
      })
      setOutputs(newOutputs)
    } catch (error) {
      setHasError(true)
      setOutputs([
        {
          id: crypto.randomUUID(),
          type: 'error',
          content:
            error instanceof Error ? error.message : 'Unknown error occurred',
          timestamp: Date.now(),
        },
      ])
    } finally {
      setIsRunning(false)
    }
  }, [block.content, block.type])

  const handleChange = useCallback(
    (value: string | undefined) => {
      const content = value ?? ''
      onChange(content)

      // Debounced auto-save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        onSave(content)
      }, 500)

      // Live compile if enabled
      if (liveCompile && block.type !== 'markdown') {
        if (liveCompileTimeoutRef.current) {
          clearTimeout(liveCompileTimeoutRef.current)
        }
        liveCompileTimeoutRef.current = setTimeout(() => {
          runCode()
        }, 800)
      }
    },
    [onChange, onSave, liveCompile, block.type, runCode],
  )

  // Run immediately for markdown when live compile is on
  useEffect(() => {
    if (liveCompile && block.type === 'markdown' && block.content.trim()) {
      runCode()
    }
  }, [liveCompile, block.type, block.content, runCode])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        runCode()
      }
    },
    [runCode],
  )

  // Handle name editing
  const handleNameClick = useCallback(() => {
    // Extract name without extension
    const lastDot = block.file.lastIndexOf('.')
    const name = lastDot > 0 ? block.file.slice(0, lastDot) : block.file
    setEditedName(name)
    setIsEditingName(true)
  }, [block.file])

  const handleNameSave = useCallback(() => {
    const trimmedName = editedName.trim()
    if (trimmedName) {
      // Check if user included an extension
      const lastDot = trimmedName.lastIndexOf('.')
      let newFileName: string
      let newType: string | undefined

      if (lastDot > 0) {
        // User typed an extension - use it to determine type
        const typedExt = trimmedName.slice(lastDot + 1).toLowerCase()
        const detectedType = EXTENSION_TO_TYPE[typedExt]
        if (detectedType) {
          // Valid extension - use as-is and update type
          newFileName = trimmedName
          newType = detectedType !== block.type ? detectedType : undefined
        } else {
          // Unknown extension - append current type's extension
          const ext = TYPE_EXTENSIONS[block.type] || 'ts'
          newFileName = `${trimmedName}.${ext}`
        }
      } else {
        // No extension - append current type's extension
        const ext = TYPE_EXTENSIONS[block.type] || 'ts'
        newFileName = `${trimmedName}.${ext}`
      }

      if (newFileName !== block.file || newType) {
        onUpdate({ file: newFileName, type: newType })
      }
    }
    setIsEditingName(false)
  }, [editedName, block.type, block.file, onUpdate])

  const handleNameKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleNameSave()
      } else if (e.key === 'Escape') {
        setIsEditingName(false)
      }
    },
    [handleNameSave],
  )

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus()
      nameInputRef.current.select()
    }
  }, [isEditingName])

  // Handle type change
  const handleTypeChange = useCallback(
    (newType: string) => {
      if (newType !== block.type) {
        const ext = TYPE_EXTENSIONS[newType] || 'ts'
        const lastDot = block.file.lastIndexOf('.')
        const name = lastDot > 0 ? block.file.slice(0, lastDot) : block.file
        const newFileName = `${name}.${ext}`
        onUpdate({ file: newFileName, type: newType })
      }
      setShowTypeMenu(false)
    },
    [block.type, block.file, onUpdate],
  )

  function getOutputIcon(type: OutputItem['type']) {
    switch (type) {
      case 'error':
        return <AlertCircle size={14} className="text-red-400 shrink-0" />
      case 'warn':
        return <AlertTriangle size={14} className="text-yellow-400 shrink-0" />
      case 'info':
        return <Info size={14} className="text-blue-400 shrink-0" />
      default:
        return null
    }
  }

  function getOutputClassName(type: OutputItem['type']) {
    switch (type) {
      case 'error':
        return 'text-red-400 bg-red-950/30'
      case 'warn':
        return 'text-yellow-400 bg-yellow-950/30'
      case 'info':
        return 'text-blue-400'
      case 'result':
        return 'text-green-400'
      default:
        return 'text-zinc-300'
    }
  }

  const reactOutput = outputs.find((o) => o.type === 'react')
  const consoleOutputs = outputs.filter((o) => o.type !== 'react')
  const showOutput = outputs.length > 0 || isRunning

  // Create blob URL for React preview to bypass CSP restrictions
  const reactPreviewUrl = useMemo(() => {
    if (!reactOutput) return null
    const blob = new Blob([reactOutput.content], { type: 'text/html' })
    return URL.createObjectURL(blob)
  }, [reactOutput])

  // Clean up blob URL when it changes
  useEffect(() => {
    return () => {
      if (reactPreviewUrl) {
        URL.revokeObjectURL(reactPreviewUrl)
      }
    }
  }, [reactPreviewUrl])

  return (
    <div
      className={`bg-zinc-800 rounded-lg overflow-hidden border ${hasError ? 'border-red-500/50' : 'border-zinc-700'}`}
      onKeyDown={handleKeyDown}
    >
      {/* Block header */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-850 border-b border-zinc-700">
        <div className="flex items-center gap-2">
          <FileCode size={16} className="text-zinc-500" />

          {/* Editable filename */}
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={handleNameKeyDown}
              className="text-sm text-zinc-200 bg-zinc-700 px-2 py-0.5 rounded border border-zinc-600 outline-none focus:border-blue-500"
              style={{ width: `${Math.max(editedName.length, 8)}ch` }}
            />
          ) : (
            <button
              onClick={handleNameClick}
              className="text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 px-1 py-0.5 rounded transition-colors"
              title="Click to rename"
            >
              {block.file}
            </button>
          )}

          {/* Type selector */}
          <div className="relative">
            <button
              onClick={() => setShowTypeMenu(!showTypeMenu)}
              className="px-2 py-0.5 text-xs bg-zinc-700 text-zinc-400 rounded hover:bg-zinc-600 hover:text-zinc-200 transition-colors flex items-center gap-1"
              title="Click to change type"
            >
              {TYPE_LABELS[block.type] || block.type}
              <ChevronDown size={12} />
            </button>
            {showTypeMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowTypeMenu(false)}
                />
                <div className="absolute left-0 top-full mt-1 w-32 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-20 py-1">
                  {BLOCK_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleTypeChange(type.value)}
                      className={`w-full px-3 py-1.5 text-left text-sm hover:bg-zinc-700 ${
                        type.value === block.type
                          ? 'text-blue-400'
                          : 'text-zinc-300'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {block.isSandboxed && (
            <span className="px-2 py-0.5 text-xs bg-amber-900/50 text-amber-400 rounded flex items-center gap-1">
              <Box size={12} />
              Sandboxed
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Live compile toggle */}
          <button
            onClick={() => setLiveCompile(!liveCompile)}
            className={`p-1.5 rounded transition-colors ${
              liveCompile
                ? 'bg-amber-600/20 text-amber-400 hover:bg-amber-600/30'
                : 'hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300'
            }`}
            title={liveCompile ? 'Live compile ON' : 'Live compile OFF'}
          >
            {liveCompile ? <Zap size={16} /> : <ZapOff size={16} />}
          </button>

          {/* Run button */}
          <button
            onClick={runCode}
            disabled={isRunning || block.type === 'markdown'}
            className="p-1.5 hover:bg-zinc-700 rounded transition-colors text-green-500 hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Run (Cmd/Ctrl + Enter)"
          >
            {isRunning ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Play size={16} fill="currentColor" />
            )}
          </button>

          {/* Delete */}
          {showDeleteConfirm ? (
            <div className="flex items-center gap-1 ml-2">
              <span className="text-xs text-zinc-400">Delete?</span>
              <button
                onClick={onDelete}
                className="p-1 hover:bg-red-600 bg-red-700 rounded text-white text-xs"
              >
                Yes
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="p-1 hover:bg-zinc-600 rounded text-zinc-400"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 hover:bg-zinc-700 rounded transition-colors text-zinc-500 hover:text-red-400"
              title="Delete block"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Monaco Editor */}
      <Editor
        height="200px"
        language={LANGUAGE_MAP[block.type] || 'plaintext'}
        value={block.content}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: 'none',
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
      />

      {/* Inline Output */}
      {showOutput && (
        <div className="border-t border-zinc-700 bg-zinc-900">
          {/* React preview */}
          {reactPreviewUrl && (
            <iframe
              src={reactPreviewUrl}
              className="w-full bg-white"
              style={{ height: '150px' }}
              title="Preview"
            />
          )}

          {/* Console output */}
          {consoleOutputs.length > 0 && (
            <div className="max-h-40 overflow-y-auto p-2 font-mono text-sm">
              {consoleOutputs.map((output) => (
                <div
                  key={output.id}
                  className={`px-2 py-1 rounded flex items-start gap-2 ${getOutputClassName(output.type)}`}
                >
                  {getOutputIcon(output.type)}
                  <pre className="whitespace-pre-wrap break-all flex-1 m-0">
                    {output.content}
                  </pre>
                </div>
              ))}
            </div>
          )}

          {/* Loading state */}
          {isRunning && outputs.length === 0 && (
            <div className="p-3 text-zinc-500 text-sm flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Running...
            </div>
          )}
        </div>
      )}
    </div>
  )
}
