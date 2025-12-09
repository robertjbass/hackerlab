import { useState, useEffect, useCallback, useRef } from 'react'
import { Sidebar } from './components/Sidebar'
import { BlockList } from './components/BlockList'
import { NewProjectModal } from './components/NewProjectModal'
import type { Block, Project, ProjectConfig } from '../preload/index'

function App() {
  const [projects, setProjects] = useState<ProjectConfig[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [isFirstRun, setIsFirstRun] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(200)
  const isResizingSidebar = useRef(false)

  const loadProjects = useCallback(async () => {
    const projectList = await window.hackerlab.getProjects()
    setProjects(projectList)
    return projectList
  }, [])

  useEffect(() => {
    async function init() {
      console.log('App initializing...')
      console.log('window.hackerlab available:', !!window.hackerlab)
      try {
        const projectList = await loadProjects()
        console.log('Projects loaded:', projectList)
        if (projectList.length === 0) {
          setIsFirstRun(true)
          setShowNewProjectModal(true)
        } else {
          const result = await window.hackerlab.loadProject(projectList[0].name)
          if (result.success && result.project) {
            setCurrentProject(result.project)
          }
        }
      } catch (error) {
        console.error('Init error:', error)
      }
    }
    init()
  }, [loadProjects])

  const handleSelectProject = useCallback(async (name: string) => {
    const result = await window.hackerlab.loadProject(name)
    if (result.success && result.project) {
      setCurrentProject(result.project)
    }
  }, [])

  const handleCreateProject = useCallback(
    async (name: string) => {
      console.log('Creating project:', name)
      try {
        const result = await window.hackerlab.createProject(name)
        console.log('Create project result:', result)
        if (result.success) {
          await loadProjects()
          await handleSelectProject(name)
          setShowNewProjectModal(false)
          setIsFirstRun(false)
        } else {
          console.error('Failed to create project:', result.error)
        }
      } catch (error) {
        console.error('Error creating project:', error)
      }
    },
    [loadProjects, handleSelectProject],
  )

  const handleBlockChange = useCallback((blockId: string, content: string) => {
    setCurrentProject((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        blocks: prev.blocks.map((b) =>
          b.id === blockId ? { ...b, content } : b,
        ),
      }
    })
  }, [])

  const handleSaveBlock = useCallback(
    async (blockId: string, content: string) => {
      if (!currentProject) return
      await window.hackerlab.saveBlock(currentProject.name, blockId, content)
    },
    [currentProject],
  )

  const handleAddBlock = useCallback(
    async (type: string) => {
      if (!currentProject) return
      const result = await window.hackerlab.addBlock(currentProject.name, type)
      if (result.success && result.block) {
        setCurrentProject((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            blocks: [...prev.blocks, result.block as Block],
          }
        })
      }
    },
    [currentProject],
  )

  const handleDeleteBlock = useCallback(
    async (blockId: string) => {
      if (!currentProject) return
      const result = await window.hackerlab.deleteBlock(
        currentProject.name,
        blockId,
      )
      if (result.success) {
        setCurrentProject((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            blocks: prev.blocks.filter((b) => b.id !== blockId),
          }
        })
      }
    },
    [currentProject],
  )

  const handleUpdateBlock = useCallback(
    async (blockId: string, updates: { file?: string; type?: string }) => {
      if (!currentProject) return
      const result = await window.hackerlab.updateBlock(
        currentProject.name,
        blockId,
        updates,
      )
      if (result.success) {
        setCurrentProject((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            blocks: prev.blocks.map((b) =>
              b.id === blockId ? { ...b, ...updates } : b,
            ),
          }
        })
      }
    },
    [currentProject],
  )

  const handleReorderBlocks = useCallback(
    async (blockIds: string[]) => {
      if (!currentProject) return
      // Optimistically update UI first
      setCurrentProject((prev) => {
        if (!prev) return prev
        const blockMap = new Map(prev.blocks.map((b) => [b.id, b]))
        const reorderedBlocks = blockIds
          .map((id) => blockMap.get(id))
          .filter((b): b is Block => b !== undefined)
        return {
          ...prev,
          blocks: reorderedBlocks,
        }
      })
      // Then persist to disk
      try {
        await window.hackerlab.reorderBlocks(currentProject.name, blockIds)
      } catch (error) {
        console.error('Failed to reorder blocks:', error)
      }
    },
    [currentProject],
  )

  // Sidebar resize handler
  const handleSidebarMouseDown = useCallback(() => {
    isResizingSidebar.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (isResizingSidebar.current) {
        const newWidth = Math.max(150, Math.min(400, e.clientX))
        setSidebarWidth(newWidth)
      }
    }

    function handleMouseUp() {
      isResizingSidebar.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  return (
    <div className="flex h-full bg-zinc-900 text-zinc-100">
      {/* Sidebar */}
      <div style={{ width: sidebarWidth }} className="shrink-0">
        <Sidebar
          projects={projects}
          currentProject={currentProject?.name}
          onSelectProject={handleSelectProject}
          onNewProject={() => setShowNewProjectModal(true)}
        />
      </div>

      {/* Sidebar resize handle */}
      <div
        className="w-1 cursor-col-resize bg-zinc-800 hover:bg-blue-500 transition-colors"
        onMouseDown={handleSidebarMouseDown}
      />

      {/* Main content - blocks with inline output */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {currentProject ? (
          <BlockList
            blocks={currentProject.blocks}
            onBlockChange={handleBlockChange}
            onSaveBlock={handleSaveBlock}
            onAddBlock={handleAddBlock}
            onDeleteBlock={handleDeleteBlock}
            onUpdateBlock={handleUpdateBlock}
            onReorderBlocks={handleReorderBlocks}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            <p>Select a project or create a new one to get started</p>
          </div>
        )}
      </div>

      {/* New project modal */}
      {showNewProjectModal && (
        <NewProjectModal
          isFirstRun={isFirstRun}
          onClose={() => !isFirstRun && setShowNewProjectModal(false)}
          onCreate={handleCreateProject}
        />
      )}
    </div>
  )
}

export default App
