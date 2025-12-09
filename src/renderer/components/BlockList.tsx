import { useState, useCallback, useRef } from 'react'
import { Plus, ChevronDown, GripVertical } from 'lucide-react'
import { CodeBlock } from './CodeBlock'
import type { Block } from '../../preload/index'

type BlockListProps = {
  blocks: Block[]
  onBlockChange: (blockId: string, content: string) => void
  onSaveBlock: (blockId: string, content: string) => void
  onAddBlock: (type: string) => void
  onDeleteBlock: (blockId: string) => void
  onUpdateBlock: (
    blockId: string,
    updates: { file?: string; type?: string },
  ) => void
  onReorderBlocks: (blockIds: string[]) => void
}

const BLOCK_TYPES = [
  { value: 'typescript', label: 'TypeScript', ext: '.ts' },
  { value: 'tsx', label: 'TSX', ext: '.tsx' },
  { value: 'javascript', label: 'JavaScript', ext: '.js' },
  { value: 'jsx', label: 'JSX', ext: '.jsx' },
  { value: 'markdown', label: 'Markdown', ext: '.md' },
]

export function BlockList({
  blocks,
  onBlockChange,
  onSaveBlock,
  onAddBlock,
  onDeleteBlock,
  onUpdateBlock,
  onReorderBlocks,
}: BlockListProps) {
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  // Use ref to always have current blocks in callbacks
  const blocksRef = useRef(blocks)
  blocksRef.current = blocks

  const handleDragStart = useCallback((e: React.DragEvent, blockId: string) => {
    e.stopPropagation()
    setDraggedId(blockId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', blockId)
    // Set a custom drag image (optional, helps with visibility)
    const dragImage = e.currentTarget.parentElement
    if (dragImage) {
      e.dataTransfer.setDragImage(dragImage, 0, 0)
    }
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedId(null)
    setDragOverId(null)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, blockId: string) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    setDragOverId(blockId)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    // Only clear if leaving the block entirely
    const relatedTarget = e.relatedTarget as HTMLElement | null
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setDragOverId(null)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault()
      e.stopPropagation()

      const sourceId = e.dataTransfer.getData('text/plain')
      const currentBlocks = blocksRef.current

      if (sourceId && sourceId !== targetId) {
        const sourceIndex = currentBlocks.findIndex((b) => b.id === sourceId)
        const targetIndex = currentBlocks.findIndex((b) => b.id === targetId)

        if (sourceIndex !== -1 && targetIndex !== -1) {
          const newBlockIds = currentBlocks.map((b) => b.id)
          // Remove source from its position
          newBlockIds.splice(sourceIndex, 1)
          // Insert at target position
          const insertIndex =
            sourceIndex < targetIndex ? targetIndex - 1 : targetIndex
          newBlockIds.splice(insertIndex, 0, sourceId)
          onReorderBlocks(newBlockIds)
        }
      }

      setDraggedId(null)
      setDragOverId(null)
    },
    [onReorderBlocks],
  )

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div
        className="h-12 flex items-center px-4 border-b border-zinc-800 shrink-0"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <span className="text-sm font-semibold text-zinc-400">Blocks</span>
      </div>

      {/* Blocks - added pl-8 to make room for drag handle */}
      <div className="flex-1 overflow-y-auto p-4 pl-8 space-y-4">
        {blocks.map((block) => (
          <div
            key={block.id}
            className={`relative group transition-opacity ${
              draggedId === block.id ? 'opacity-50' : ''
            } ${
              dragOverId === block.id && draggedId !== block.id
                ? 'before:absolute before:inset-x-0 before:-top-2 before:h-1 before:bg-blue-500 before:rounded'
                : ''
            }`}
            onDragOver={(e) => handleDragOver(e, block.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, block.id)}
          >
            {/* Drag handle - only this element is draggable */}
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, block.id)}
              onDragEnd={handleDragEnd}
              className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing z-10 -ml-6"
            >
              <GripVertical size={16} className="text-zinc-500" />
            </div>
            <CodeBlock
              block={block}
              onChange={(content) => onBlockChange(block.id, content)}
              onSave={(content) => onSaveBlock(block.id, content)}
              onDelete={() => onDeleteBlock(block.id)}
              onUpdate={(updates) => onUpdateBlock(block.id, updates)}
            />
          </div>
        ))}

        {/* Add Block button - below the blocks */}
        {blocks.length > 0 && (
          <div className="relative flex justify-center pt-2">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="px-4 py-2 flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg border border-zinc-700 border-dashed transition-colors"
            >
              <Plus size={16} />
              Add Block
              <ChevronDown size={14} />
            </button>
            {showAddMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowAddMenu(false)}
                />
                <div className="absolute top-full mt-1 w-40 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-20 py-1">
                  {BLOCK_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => {
                        onAddBlock(type.value)
                        setShowAddMenu(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 flex items-center justify-between"
                    >
                      <span>{type.label}</span>
                      <span className="text-zinc-500">{type.ext}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {blocks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <p className="mb-4">No blocks yet</p>
            <button
              onClick={() => onAddBlock('typescript')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              Create First Block
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
