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

## IPC 通信方式（本项目覆盖三种）

| 方向 | 方式 | 通道 | 对应代码 |
| --- | --- | --- | --- |
| 渲染层 → 主进程（单向） | send / on | `file-save` | `saveFile`：`ipcRenderer.send` → `ipcMain.on` |
| 渲染层 ↔ 主进程（双向） | invoke / handle | `file-read` | `readFile`：`ipcRenderer.invoke` → `ipcMain.handle` 并 return |
| 主进程 → 渲染层（单向） | webContents.send / ipcRenderer.on | `main-to-render` | `onMessage`：主进程主动推送，渲染层订阅接收 |

## 数据文件位置

文件保存在 Electron 的用户数据目录（`app.getPath('userData')`）下的 `demo-data.txt`，具体路径会在主进程控制台打印，可参考 [app.getPath 文档](https://www.electronjs.org/docs/latest/api/app#appgetpathname)。

---

# 从零复刻本项目的完整教程

目标：在**新文件夹**里从零安装依赖、编写配置，直到与本项目完全一致。

## 复刻完成后的文件结构

```
新文件夹/
├── main.js            # 主进程（窗口 + IPC）
├── preload.js         # 预加载脚本
├── pages/             # 渲染进程页面
│   ├── index.html
│   ├── index.css
│   └── render.js
├── build/             # 打包资源（图标）
│   ├── icon.png       # 256x256，exe 图标
│   └── icons/icon.ico # 多尺寸，安装程序图标
├── package.json       # 核心配置
├── nodemon.json       # 开发热重启配置
├── .gitignore
├── .npmrc             # 镜像源（下载 electron 必需）
└── README.md
```

## 环境要求

- Node.js ≥ 18（本项目使用 v20，`node -v` 查看）
- npm（`npm -v` 查看，随 Node 一起安装）
- Windows 系统，终端使用 PowerShell

## 第 1 步：新建文件夹并进入

```powershell
mkdir C:\Users\18111\Desktop\second-electron-demo
cd C:\Users\18111\Desktop\second-electron-demo
```

## 第 2 步：创建 .npmrc（最关键，先做这个）

> **为什么**：`electron` 是特殊包——npm 装完代码后还要**下载 Electron 编译好的二进制文件**（几十 MB），直连 GitHub 在国内基本失败或极慢。镜像源让它走 npmmirror。

新建文件 `.npmrc`，内容：

```
electron_mirror=https://npmmirror.com/mirrors/electron/
ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
```

## 第 3 步：初始化 package.json

```powershell
npm init -y
```

这只是生成一个默认的，第 5 步会整体覆盖成目标配置。

## 第 4 步：安装依赖（版本号与本项目完全一致）

```powershell
npm install --save-dev electron@^44.5.1 electron-builder@^26.15.3 nodemon@^3.1.14
```

三个依赖的作用：`electron` 运行时、`electron-builder` 打包、`nodemon` 开发时改代码自动重启。

## 第 5 步：用目标配置覆盖 package.json

把整个文件内容替换成下面这份：

```json
{
  "name": "first-electron-demo",
  "version": "1.0.0",
  "description": "Electron 入门示例：主进程与渲染进程通过 IPC 实现文件读写",
  "main": "main.js",
  "scripts": {
    "start": "nodemon --exec electron .",
    "build": "electron-builder"
  },
  "build": {
    "appId": "com.example.myapp",
    "copyright": "Copyright © 2026 某某公司",
    "compression": "normal",
    "directories": {
      "output": "release",
      "buildResources": "build"
    },
    "files": [
      "main.js",
      "preload.js",
      "pages/**/*",
      "!node_modules/**/*"
    ],
    "win": {
      "icon": "build/icon.png",
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        }
      ]
    },
    "nsis": {
      "oneClick": false,
      "perMachine": true,
      "allowToChangeInstallationDirectory": true,
      "installerIcon": "build/icons/icon.ico",
      "uninstallerIcon": "build/icons/icon.ico",
      "installerHeaderIcon": "build/icons/icon.ico",
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "我的桌面应用"
    }
  },
  "author": "demo",
  "license": "ISC",
  "devDependencies": {
    "electron": "^44.5.1",
    "electron-builder": "^26.15.3",
    "nodemon": "^3.1.14"
  }
}
```

## 第 6 步：复制代码文件（保证"一模一样"的最快方式）

本项目的代码文件直接复制到新文件夹（**注意**：把下面命令中的源路径改成你电脑上本项目的实际路径）：

```powershell
Copy-Item <本项目路径>\main.js .
Copy-Item <本项目路径>\preload.js .
Copy-Item <本项目路径>\pages .\pages -Recurse
Copy-Item <本项目路径>\build .\build -Recurse
Copy-Item <本项目路径>\nodemon.json .
Copy-Item <本项目路径>\.gitignore .
Copy-Item <本项目路径>\README.md .
```

`nodemon.json` 和 `.gitignore` 内容很短，想手写也可以：

```json
{ "ignore": ["node_modules", "dist"], "restartable": "r", "watch": ["*"], "ext": "html,js,css" }
```

```
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json
dist/
out/
release/
.DS_Store
Thumbs.db
.vscode/
```

## 第 7 步：验证

```powershell
npm start       # 开发模式：弹出 800x600 窗口、控制台打印路径即为成功
npm run build   # 打包：release\first-electron-demo Setup 1.0.0.exe 出现即为成功
```

## 常见坑（本项目的实战经验）

| 坑 | 报错 | 原因与解法 |
| --- | --- | --- |
| `files` 漏了入口文件 | `main.js was not found in this archive` | `build.files` 必须包含 `main.js`、`preload.js`、`pages/**/*` |
| 图标小于 256x256 | `Icon must be at least 256x256` | exe 图标 PNG 必须 ≥256px |
| nsis 图标写成 PNG | `invalid icon file` | **安装程序图标必须 .ico**，PNG 改名 .ico 没用（本质还是 PNG） |
| release 目录被占用 | `EBUSY: resource busy or locked` | 资源管理器/VS Code 开着 release 文件夹，关掉窗口再打包 |
| 找不到安装包 | 构建 exit 1 | 看终端最后一行报错——NSIS 失败时 win-unpacked 会留下但安装包没有 |
