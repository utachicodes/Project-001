import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import os from 'os'

const _filename = __filename
const _dirname = __dirname

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    icon: path.join(_dirname, '../public/mafalia-logo.png'),
    webPreferences: {
      preload: path.join(_dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  })

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(_dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// ── Config Storage ─────────────────────────────────────────────────

const CONFIG_DIR = path.join(os.homedir(), '.mafalia')
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json')

ipcMain.handle('config:load', async () => {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true })
    }
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8')
      return JSON.parse(data)
    }
    return null
  } catch (e) {
    return null
  }
})

ipcMain.handle('config:save', async (_, config) => {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true })
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
    return true
  } catch (e) {
    return false
  }
})

// ── Desktop Access: File System ────────────────────────────────────

ipcMain.handle('fs:readDir', async (_, dirPath: string) => {
  try {
    const resolvedPath = dirPath || os.homedir()
    const entries = fs.readdirSync(resolvedPath, { withFileTypes: true })
    return {
      path: resolvedPath,
      entries: entries.map(e => ({
        name: e.name,
        isDirectory: e.isDirectory(),
        isFile: e.isFile(),
        path: path.join(resolvedPath, e.name),
        ext: e.isFile() ? path.extname(e.name).toLowerCase() : '',
        size: e.isFile() ? (() => { try { return fs.statSync(path.join(resolvedPath, e.name)).size } catch { return 0 } })() : 0,
      })).sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1
        if (!a.isDirectory && b.isDirectory) return 1
        return a.name.localeCompare(b.name)
      })
    }
  } catch (e: any) {
    return { path: dirPath, entries: [], error: e.message }
  }
})

ipcMain.handle('fs:readFile', async (_, filePath: string) => {
  try {
    const stat = fs.statSync(filePath)
    if (stat.size > 10 * 1024 * 1024) {
      return { error: 'File too large (>10MB)', size: stat.size }
    }
    const content = fs.readFileSync(filePath, 'utf-8')
    return { content, size: stat.size, path: filePath }
  } catch (e: any) {
    return { error: e.message }
  }
})

ipcMain.handle('fs:writeFile', async (_, filePath: string, content: string) => {
  try {
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(filePath, content, 'utf-8')
    return { success: true }
  } catch (e: any) {
    return { error: e.message }
  }
})

ipcMain.handle('fs:exists', async (_, targetPath: string) => {
  return fs.existsSync(targetPath)
})

ipcMain.handle('fs:stat', async (_, targetPath: string) => {
  try {
    const stat = fs.statSync(targetPath)
    return {
      size: stat.size,
      isFile: stat.isFile(),
      isDirectory: stat.isDirectory(),
      modified: stat.mtime.toISOString(),
      created: stat.birthtime.toISOString(),
    }
  } catch (e: any) {
    return { error: e.message }
  }
})

ipcMain.handle('fs:mkdir', async (_, dirPath: string) => {
  try {
    fs.mkdirSync(dirPath, { recursive: true })
    return { success: true }
  } catch (e: any) {
    return { error: e.message }
  }
})

ipcMain.handle('fs:delete', async (_, targetPath: string) => {
  try {
    const stat = fs.statSync(targetPath)
    if (stat.isDirectory()) {
      fs.rmSync(targetPath, { recursive: true })
    } else {
      fs.unlinkSync(targetPath)
    }
    return { success: true }
  } catch (e: any) {
    return { error: e.message }
  }
})

ipcMain.handle('fs:copy', async (_, src: string, dest: string) => {
  try {
    fs.copyFileSync(src, dest)
    return { success: true }
  } catch (e: any) {
    return { error: e.message }
  }
})

ipcMain.handle('fs:move', async (_, src: string, dest: string) => {
  try {
    fs.renameSync(src, dest)
    return { success: true }
  } catch (e: any) {
    return { error: e.message }
  }
})

// ── Desktop Access: Dialogs ────────────────────────────────────────

ipcMain.handle('dialog:openFile', async (_, options?: { filters?: { name: string, extensions: string[] }[] }) => {
  if (!mainWindow) return null
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: options?.filters || [
      { name: 'All Files', extensions: ['*'] },
      { name: 'CSV Files', extensions: ['csv'] },
      { name: 'Text Files', extensions: ['txt', 'md', 'json'] },
    ]
  })
  return result.canceled ? null : result.filePaths[0]
})

ipcMain.handle('dialog:openDirectory', async () => {
  if (!mainWindow) return null
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })
  return result.canceled ? null : result.filePaths[0]
})

ipcMain.handle('dialog:saveFile', async (_, options?: { defaultPath?: string, filters?: { name: string, extensions: string[] }[] }) => {
  if (!mainWindow) return null
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: options?.defaultPath,
    filters: options?.filters || [
      { name: 'All Files', extensions: ['*'] },
    ]
  })
  return result.canceled ? null : result.filePath
})

// ── Desktop Access: Shell / OS ─────────────────────────────────────

ipcMain.handle('shell:openPath', async (_, targetPath: string) => {
  return shell.openPath(targetPath)
})

ipcMain.handle('shell:openExternal', async (_, url: string) => {
  await shell.openExternal(url)
  return true
})

ipcMain.handle('shell:showItemInFolder', async (_, targetPath: string) => {
  shell.showItemInFolder(targetPath)
  return true
})

// ── Desktop Access: System Info ────────────────────────────────────

ipcMain.handle('system:info', async () => {
  return {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    electronVersion: process.versions.electron,
    homeDir: os.homedir(),
    desktopDir: path.join(os.homedir(), 'Desktop'),
    documentsDir: path.join(os.homedir(), 'Documents'),
    downloadsDir: path.join(os.homedir(), 'Downloads'),
    tempDir: os.tmpdir(),
    hostname: os.hostname(),
    cpus: os.cpus().length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
  }
})

// ── Desktop Access: Path Utilities ─────────────────────────────────

ipcMain.handle('path:join', async (_, ...segments: string[]) => {
  return path.join(...segments)
})

ipcMain.handle('path:resolve', async (_, ...segments: string[]) => {
  return path.resolve(...segments)
})

ipcMain.handle('path:dirname', async (_, filePath: string) => {
  return path.dirname(filePath)
})

ipcMain.handle('path:basename', async (_, filePath: string) => {
  return path.basename(filePath)
})

ipcMain.handle('path:home', async () => {
  return os.homedir()
})
