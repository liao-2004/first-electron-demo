const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

// ============================================================
// 数据文件统一存放在 Electron 用户数据目录，避免写死 D 盘路径
// ============================================================
const DATA_FILE = path.join(app.getPath('userData'), 'demo-data.txt')

// ------------------------------------------------------------
// 保存文件（单向通道 'file-save' 的处理器）
// 对应渲染进程 API：window.myApi.saveFile(data)
// ------------------------------------------------------------
function handleSaveFile(_event, data) {
  try {
    fs.writeFileSync(DATA_FILE, String(data ?? ''), 'utf-8')
    console.log('文件已保存到：', DATA_FILE)
  } catch (err) {
    console.error('保存失败：', err)
  }
}

// ------------------------------------------------------------
// 读取文件（双向通道 'file-read' 的处理器）
// 对应渲染进程 API：window.myApi.readFile()
// 返回值会通过 Promise 回传给渲染进程；文件不存在时返回空字符串
// ------------------------------------------------------------
function handleReadFile() {
  try {
    return fs.readFileSync(DATA_FILE, 'utf-8')
  } catch (err) {
    if (err.code === 'ENOENT') return ''
    console.error('读取失败：', err)
    return ''
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'electron 项目',
    autoHideMenuBar: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // 加载页面，路径相对于 main.js
  win.loadFile(path.join(__dirname, 'pages', 'index.html'))

  // ------------------------------------------------------------
  // 主进程 → 渲染层（单向推送通道 'main-to-render'）
  // 对应渲染进程 API：window.myApi.onMessage(callback)
  // 页面加载完成后，主进程主动向渲染进程推送一条消息；
  // 与 send/on、invoke/handle 不同，这条消息由主进程发起，
  // 通过 webContents.send 推送，渲染层用 ipcRenderer.on 订阅接收
  // ------------------------------------------------------------
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('main-to-render', '来自主进程：窗口已加载完成')
  })
}

// ============================================================
// IPC 通道注册（全局只注册一次，放在窗口创建之外）
//   - ipcMain.on('file-save')   接收渲染进程的 send 消息（单向）
//   - ipcMain.handle('file-read') 处理渲染进程的 invoke 请求并返回结果（双向）
// ============================================================
ipcMain.on('file-save', handleSaveFile)
ipcMain.handle('file-read', handleReadFile)

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
