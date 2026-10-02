const { contextBridge, ipcRenderer } = require('electron')

// ============================================================
// 通过 contextBridge 向渲染进程（网页）暴露安全 API
// 渲染进程可通过 window.myApi.xxx 调用，例如 window.myApi.saveFile('你好')
// ============================================================
contextBridge.exposeInMainWorld('myApi', {
  /**
   * Node 版本号（演示用，直接取自主进程的 process.version）
   * @type {string}
   */
  version: process.version,

  /**
   * 保存文件
   * 作用：把渲染进程页面上的文本发送给主进程，由主进程写入磁盘文件
   * 参数：
   *   @param {string} data - 要保存的文本内容（来自页面输入框）
   * 底层通信：ipcRenderer.send('file-save', data)
   *   说明：send 是单向通信（只发不收），主进程用 ipcMain.on('file-save', ...) 接收
   * 注意：没有返回值，无法得知保存是否成功
   */
  saveFile: (data) => {
    ipcRenderer.send('file-save', data)
  },

  /**
   * 读取文件
   * 作用：请求主进程读取磁盘文件的内容，并把结果返回给渲染进程
   * 参数：无
   * 返回：@returns {Promise<string>} 文件内容（文件不存在时为空字符串）
   * 底层通信：ipcRenderer.invoke('file-read')
   *   说明：invoke 是双向通信（发请求并等待结果），
   *   主进程用 ipcMain.handle('file-read', ...) 处理并 return 结果
   */
  readFile: async () => {
    return await ipcRenderer.invoke('file-read')
  }
})
