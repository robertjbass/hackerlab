import { useRef, useEffect } from 'react'
import {
  Terminal,
  Trash2,
  AlertCircle,
  Info,
  AlertTriangle,
} from 'lucide-react'
import { OutputItem } from '../utils/executor'

type OutputPanelProps = {
  outputs: OutputItem[]
  onClear: () => void
}

export function OutputPanel({ outputs, onClear }: OutputPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Auto-scroll to bottom on new output
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [outputs])

  // Find React component output
  const reactOutput = outputs.find((o) => o.type === 'react')
  const consoleOutputs = outputs.filter((o) => o.type !== 'react')

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

  return (
    <div className="h-full flex flex-col bg-zinc-900 border-l border-zinc-800">
      {/* Header */}
      <div
        className="h-12 flex items-center justify-between px-4 border-b border-zinc-800 shrink-0"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-zinc-500" />
          <span className="text-sm font-semibold text-zinc-400">Output</span>
        </div>
        <button
          onClick={onClear}
          className="p-1 hover:bg-zinc-700 rounded transition-colors text-zinc-500 hover:text-zinc-300"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          title="Clear output"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* React preview area */}
        {reactOutput && (
          <div className="shrink-0 border-b border-zinc-800">
            <div className="px-3 py-1 text-xs text-zinc-500 bg-zinc-850">
              React Preview
            </div>
            <iframe
              ref={iframeRef}
              srcDoc={reactOutput.content}
              className="w-full bg-white"
              style={{ height: '200px' }}
              sandbox="allow-scripts"
              title="React Preview"
            />
          </div>
        )}

        {/* Console output */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-2 font-mono text-sm"
        >
          {consoleOutputs.length === 0 && !reactOutput ? (
            <div className="flex items-center justify-center h-full text-zinc-600">
              <p>Run code to see output</p>
            </div>
          ) : (
            consoleOutputs.map((output) => (
              <div
                key={output.id}
                className={`px-2 py-1 rounded flex items-start gap-2 ${getOutputClassName(output.type)}`}
              >
                {getOutputIcon(output.type)}
                <pre className="whitespace-pre-wrap break-all flex-1 m-0">
                  {output.content}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
