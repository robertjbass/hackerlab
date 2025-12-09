import { useState, useCallback, useRef, useEffect } from 'react'
import { FolderPlus, X } from 'lucide-react'

type NewProjectModalProps = {
  isFirstRun: boolean
  onClose: () => void
  onCreate: (name: string) => void
}

function normalizeProjectName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function NewProjectModal({
  isFirstRun,
  onClose,
  onCreate,
}: NewProjectModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const normalizedName = normalizeProjectName(name)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!normalizedName) {
        setError('Please enter a project name')
        return
      }
      onCreate(normalizedName)
    },
    [normalizedName, onCreate],
  )

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-800 rounded-xl shadow-2xl w-full max-w-md border border-zinc-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <FolderPlus size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">
                {isFirstRun ? 'Welcome to Hackerlab!' : 'New Project'}
              </h2>
              {isFirstRun && (
                <p className="text-sm text-zinc-400">
                  Create your first project to get started
                </p>
              )}
            </div>
          </div>
          {!isFirstRun && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-zinc-700 rounded transition-colors text-zinc-400"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <label className="block">
            <span className="text-sm font-medium text-zinc-300">
              Project Name
            </span>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              placeholder="My Project"
              className="mt-2 w-full px-4 py-2.5 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </label>

          {normalizedName && normalizedName !== name && (
            <p className="mt-2 text-sm text-zinc-500">
              Will be saved as:{' '}
              <span className="text-zinc-300 font-mono">{normalizedName}</span>
            </p>
          )}

          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

          <div className="mt-6 flex gap-3 justify-end">
            {!isFirstRun && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!normalizedName}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg transition-colors font-medium"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
