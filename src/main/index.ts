import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { join } from 'path'
import { homedir } from 'os'
import { mkdir, readFile, writeFile, readdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import { CONSTANTS } from '../../constants'

const APP_DIR = join(homedir(), `.${CONSTANTS.APP_NAME}`)

async function ensureAppDirectory(): Promise<void> {
  const dirs = [
    APP_DIR,
    join(APP_DIR, 'projects'),
    join(APP_DIR, 'cache'),
    join(APP_DIR, 'cache', 'packages'),
  ]

  for (const dir of dirs) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }
  }

  const settingsPath = join(APP_DIR, 'settings.json')
  if (!existsSync(settingsPath)) {
    await writeFile(
      settingsPath,
      JSON.stringify({ theme: 'dark', autoSave: true }, null, 2),
    )
  }
}

function setupIpcHandlers(): void {
  // Project operations
  ipcMain.handle('get-projects', async () => {
    const projectsDir = join(APP_DIR, 'projects')
    try {
      const entries = await readdir(projectsDir, { withFileTypes: true })
      const projects = []
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const configPath = join(projectsDir, entry.name, 'config.json')
          if (existsSync(configPath)) {
            const config = JSON.parse(await readFile(configPath, 'utf-8'))
            projects.push(config)
          }
        }
      }
      return projects
    } catch {
      return []
    }
  })

  ipcMain.handle(
    'create-project',
    async (_, name: string): Promise<{ success: boolean; error?: string }> => {
      const projectDir = join(APP_DIR, 'projects', name)
      if (existsSync(projectDir)) {
        return { success: false, error: 'Project already exists' }
      }
      try {
        await mkdir(projectDir, { recursive: true })
        const config = {
          name,
          blocks: [
            {
              id: 'block-001',
              file: 'block-001.ts',
              type: 'typescript',
              isSandboxed: false,
              order: 0,
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        await writeFile(
          join(projectDir, 'config.json'),
          JSON.stringify(config, null, 2),
        )
        await writeFile(
          join(projectDir, 'block-001.ts'),
          `// Welcome to ${CONSTANTS.APP_NAME}!\nconsole.log("Hello, World!")\n`,
        )
        return { success: true }
      } catch (error) {
        return { success: false, error: String(error) }
      }
    },
  )

  ipcMain.handle('load-project', async (_, name: string) => {
    const projectDir = join(APP_DIR, 'projects', name)
    const configPath = join(projectDir, 'config.json')
    if (!existsSync(configPath)) {
      return { success: false, error: 'Project not found' }
    }
    try {
      const config = JSON.parse(await readFile(configPath, 'utf-8'))
      const blocks = await Promise.all(
        config.blocks.map(
          async (block: { id: string; file: string; type: string }) => {
            const filePath = join(projectDir, block.file)
            const content = existsSync(filePath)
              ? await readFile(filePath, 'utf-8')
              : ''
            return { ...block, content }
          },
        ),
      )
      return { success: true, project: { ...config, blocks } }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle(
    'save-block',
    async (
      _,
      projectName: string,
      blockId: string,
      content: string,
    ): Promise<{ success: boolean; error?: string }> => {
      const projectDir = join(APP_DIR, 'projects', projectName)
      const configPath = join(projectDir, 'config.json')
      try {
        const config = JSON.parse(await readFile(configPath, 'utf-8'))
        const block = config.blocks.find(
          (b: { id: string }) => b.id === blockId,
        )
        if (!block) {
          return { success: false, error: 'Block not found' }
        }
        await writeFile(join(projectDir, block.file), content)
        config.updatedAt = new Date().toISOString()
        await writeFile(configPath, JSON.stringify(config, null, 2))
        return { success: true }
      } catch (error) {
        return { success: false, error: String(error) }
      }
    },
  )

  ipcMain.handle(
    'add-block',
    async (
      _,
      projectName: string,
      blockType: string,
    ): Promise<{ success: boolean; block?: unknown; error?: string }> => {
      const projectDir = join(APP_DIR, 'projects', projectName)
      const configPath = join(projectDir, 'config.json')
      try {
        const config = JSON.parse(await readFile(configPath, 'utf-8'))
        const nextId = config.blocks.length + 1
        const ext =
          blockType === 'tsx'
            ? 'tsx'
            : blockType === 'jsx'
              ? 'jsx'
              : blockType === 'javascript'
                ? 'js'
                : blockType === 'markdown'
                  ? 'md'
                  : 'ts'
        const newBlock = {
          id: `block-${String(nextId).padStart(3, '0')}`,
          file: `block-${String(nextId).padStart(3, '0')}.${ext}`,
          type: blockType,
          isSandboxed: false,
          order: config.blocks.length,
        }
        config.blocks.push(newBlock)
        config.updatedAt = new Date().toISOString()
        await writeFile(configPath, JSON.stringify(config, null, 2))
        await writeFile(join(projectDir, newBlock.file), '')
        return { success: true, block: { ...newBlock, content: '' } }
      } catch (error) {
        return { success: false, error: String(error) }
      }
    },
  )

  ipcMain.handle(
    'delete-block',
    async (
      _,
      projectName: string,
      blockId: string,
    ): Promise<{ success: boolean; error?: string }> => {
      const projectDir = join(APP_DIR, 'projects', projectName)
      const configPath = join(projectDir, 'config.json')
      try {
        const config = JSON.parse(await readFile(configPath, 'utf-8'))
        const blockIndex = config.blocks.findIndex(
          (b: { id: string }) => b.id === blockId,
        )
        if (blockIndex === -1) {
          return { success: false, error: 'Block not found' }
        }
        const [block] = config.blocks.splice(blockIndex, 1)
        const filePath = join(projectDir, block.file)
        if (existsSync(filePath)) {
          await unlink(filePath)
        }
        config.blocks.forEach(
          (b: { order: number }, i: number) => (b.order = i),
        )
        config.updatedAt = new Date().toISOString()
        await writeFile(configPath, JSON.stringify(config, null, 2))
        return { success: true }
      } catch (error) {
        return { success: false, error: String(error) }
      }
    },
  )

  ipcMain.handle(
    'update-block',
    async (
      _,
      projectName: string,
      blockId: string,
      updates: { file?: string; type?: string },
    ): Promise<{ success: boolean; error?: string }> => {
      const projectDir = join(APP_DIR, 'projects', projectName)
      const configPath = join(projectDir, 'config.json')
      try {
        const config = JSON.parse(await readFile(configPath, 'utf-8'))
        const block = config.blocks.find(
          (b: { id: string }) => b.id === blockId,
        )
        if (!block) {
          return { success: false, error: 'Block not found' }
        }

        // If renaming file, rename the actual file
        if (updates.file && updates.file !== block.file) {
          const oldPath = join(projectDir, block.file)
          const newPath = join(projectDir, updates.file)
          if (existsSync(oldPath)) {
            const content = await readFile(oldPath, 'utf-8')
            await writeFile(newPath, content)
            await unlink(oldPath)
          }
          block.file = updates.file
        }

        // Update type
        if (updates.type) {
          block.type = updates.type
        }

        config.updatedAt = new Date().toISOString()
        await writeFile(configPath, JSON.stringify(config, null, 2))
        return { success: true }
      } catch (error) {
        return { success: false, error: String(error) }
      }
    },
  )

  ipcMain.handle(
    'reorder-blocks',
    async (
      _,
      projectName: string,
      blockIds: string[],
    ): Promise<{ success: boolean; error?: string }> => {
      const projectDir = join(APP_DIR, 'projects', projectName)
      const configPath = join(projectDir, 'config.json')
      try {
        const config = JSON.parse(await readFile(configPath, 'utf-8'))

        // Reorder blocks based on the provided order
        const reorderedBlocks = blockIds
          .map((id, index) => {
            const block = config.blocks.find((b: { id: string }) => b.id === id)
            if (block) {
              return { ...block, order: index }
            }
            return null
          })
          .filter(Boolean)

        config.blocks = reorderedBlocks
        config.updatedAt = new Date().toISOString()
        await writeFile(configPath, JSON.stringify(config, null, 2))
        return { success: true }
      } catch (error) {
        return { success: false, error: String(error) }
      }
    },
  )

  ipcMain.handle('get-app-dir', () => APP_DIR)
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    show: false,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // Toggle DevTools with F12, Cmd+Option+I (macOS), or Ctrl+Shift+I (Windows/Linux)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (
      input.key === 'F12' ||
      (input.meta && input.alt && input.key.toLowerCase() === 'i') ||
      (input.control && input.shift && input.key.toLowerCase() === 'i')
    ) {
      mainWindow.webContents.toggleDevTools()
      event.preventDefault()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  await ensureAppDirectory()
  setupIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
