const { app,BrowserWindow }  = require('electron')

app.on('ready',()=>{
    const win = new BrowserWindow({
        width:800,
        height:600,
        title:'electron 项目',
        autoHideMenuBar:true,
        alwaysOnTop:true
    })
    win.loadFile('./pages/index.html')
})