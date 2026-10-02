# first-electron-demo

Electron 入门示例：主进程与渲染进程通过 IPC 实现文件读写。

## 运行

```bash
npm install   # 首次运行前安装依赖
npm start     # 启动（nodemon 会在代码改动后自动重启）
```

## 目录结构

| 文件 | 作用 |
| --- | --- |
| `main.js` | 主进程：创建窗口、注册 IPC 通道（文件读写） |
| `preload.js` | 预加载脚本：通过 `contextBridge` 向页面暴露安全的 `window.myApi` |
| `pages/index.html` | 页面结构（输入框 + 保存/读取按钮） |
| `pages/render.js` | 渲染进程脚本：绑定按钮事件，调用 `window.myApi` |
| `pages/index.css` | 页面样式 |

## IPC 通信方式（本项目用到两种）

- **单向（send / on）**：`saveFile` 用 `ipcRenderer.send('file-save', data)` 发送，主进程用 `ipcMain.on('file-save', ...)` 接收，只发不收。
- **双向（invoke / handle）**：`readFile` 用 `ipcRenderer.invoke('file-read')` 请求，主进程用 `ipcMain.handle('file-read', ...)` 处理并 `return` 结果。

## 数据文件位置

文件保存在 Electron 的用户数据目录（`app.getPath('userData')`）下的 `demo-data.txt`，具体路径会在主进程控制台打印，可参考 [app.getPath 文档](https://www.electronjs.org/docs/latest/api/app#appgetpathname)。
