import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Config
  config: {
    load: () => ipcRenderer.invoke('config:load'),
    save: (config: any) => ipcRenderer.invoke('config:save', config),
  },

  // File System
  fs: {
    readDir: (dirPath: string) => ipcRenderer.invoke('fs:readDir', dirPath),
    readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
    writeFile: (filePath: string, content: string) => ipcRenderer.invoke('fs:writeFile', filePath, content),
    exists: (targetPath: string) => ipcRenderer.invoke('fs:exists', targetPath),
    stat: (targetPath: string) => ipcRenderer.invoke('fs:stat', targetPath),
    mkdir: (dirPath: string) => ipcRenderer.invoke('fs:mkdir', dirPath),
    delete: (targetPath: string) => ipcRenderer.invoke('fs:delete', targetPath),
    copy: (src: string, dest: string) => ipcRenderer.invoke('fs:copy', src, dest),
    move: (src: string, dest: string) => ipcRenderer.invoke('fs:move', src, dest),
  },

  // Dialogs
  dialog: {
    openFile: (options?: any) => ipcRenderer.invoke('dialog:openFile', options),
    openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
    saveFile: (options?: any) => ipcRenderer.invoke('dialog:saveFile', options),
  },

  // Shell / OS
  shell: {
    openPath: (targetPath: string) => ipcRenderer.invoke('shell:openPath', targetPath),
    openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
    showItemInFolder: (targetPath: string) => ipcRenderer.invoke('shell:showItemInFolder', targetPath),
  },

  // System Info
  system: {
    info: () => ipcRenderer.invoke('system:info'),
  },

  // Path Utilities
  path: {
    join: (...segments: string[]) => ipcRenderer.invoke('path:join', ...segments),
    resolve: (...segments: string[]) => ipcRenderer.invoke('path:resolve', ...segments),
    dirname: (filePath: string) => ipcRenderer.invoke('path:dirname', filePath),
    basename: (filePath: string) => ipcRenderer.invoke('path:basename', filePath),
    home: () => ipcRenderer.invoke('path:home'),
  },
})
