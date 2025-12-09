import { FolderOpen, Plus } from 'lucide-react'
import type { ProjectConfig } from '../../preload/index'

type SidebarProps = {
  projects: ProjectConfig[]
  currentProject?: string
  onSelectProject: (name: string) => void
  onNewProject: () => void
}

export function Sidebar({
  projects,
  currentProject,
  onSelectProject,
  onNewProject,
}: SidebarProps) {
  return (
    <div className="h-full flex flex-col bg-zinc-900 border-r border-zinc-800">
      {/* Header with drag region */}
      <div
        className="h-12 flex items-center justify-between px-4 border-b border-zinc-800"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <span className="text-sm font-semibold text-zinc-400 pl-16">
          Projects
        </span>
        <button
          onClick={onNewProject}
          className="p-1 hover:bg-zinc-700 rounded transition-colors"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          title="New Project"
        >
          <Plus size={18} className="text-zinc-400" />
        </button>
      </div>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto py-2">
        {projects.length === 0 ? (
          <div className="px-4 py-8 text-center text-zinc-500 text-sm">
            No projects yet
          </div>
        ) : (
          projects.map((project) => (
            <button
              key={project.name}
              onClick={() => onSelectProject(project.name)}
              className={`w-full px-4 py-2 flex items-center gap-2 text-left hover:bg-zinc-800 transition-colors ${
                currentProject === project.name
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400'
              }`}
            >
              <FolderOpen size={16} />
              <span className="truncate text-sm">{project.name}</span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
