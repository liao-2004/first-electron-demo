// ============================================================
// 渲染进程脚本（在网页里运行，window 指浏览器的 window）
// 通过 preload.js 暴露的 window.myApi 与主进程通信
// ============================================================

console.log('render 进程已加载')
console.log('Node 版本：', window.myApi.version)

// 获取页面上的元素（id 与 index.html 中定义的一致）
const input = document.getElementById('message')
const saveBtn = document.getElementById('save')
const readBtn = document.getElementById('read')

// ---------- 保存按钮 ----------
// 调用 window.myApi.saveFile(data)：
//   preload 里用 ipcRenderer.send('file-save', data) 发给主进程
//   主进程 ipcMain.on('file-save') 收到后写入文件
saveBtn.addEventListener('click', () => {
  const text = input.value.trim()
  if (!text) {
    alert('内容为空，请先输入要保存的文本')
    return
  }
  window.myApi.saveFile(text)
  alert('已保存')
})

// ---------- 读取按钮 ----------
// 调用 window.myApi.readFile()：
//   preload 里用 ipcRenderer.invoke('file-read') 请求主进程
//   主进程 ipcMain.handle('file-read') 返回文件内容（Promise 形式）
readBtn.addEventListener('click', async () => {
  const text = await window.myApi.readFile()
  alert(text ? `文件内容：\n${text}` : '文件内容为空')
})
