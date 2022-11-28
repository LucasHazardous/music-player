const {
    app,
    BrowserWindow,
    Menu
} = require('electron')
const path = require('path')
const {
    ipcMain
} = require('electron')
const os = require("os")
const fs = require("fs")

const targetPath = path.join(os.homedir(), "music-player")
const availableFiles = []

const isDev = process.env.NODE_ENV !== "production"

let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        title: "Image Resizer",
        width: isDev ? 1000 : 500,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
        resizable: false
    })

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    if (isDev) mainWindow.webContents.openDevTools()

    mainWindow.loadFile(path.join(__dirname, "./renderer/index.html")).then(loadFiles)
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

const menu = [{
    label: "File",
    submenu: [{
        label: "Refresh",
        click: loadFiles
    }, {
        label: "Quit",
        click: app.quit,
        accelerator: "CmdOrCtrl+W"
    }]
}]

function loadFiles() {
    if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath)
    }

    availableFiles.length = 0
    fs.readdirSync(targetPath).forEach(file => {
        availableFiles.push(file)
    })

    mainWindow.webContents.send("refresh", {
        "fileList": availableFiles
    })
}

ipcMain.on("readFile", (e, data) => {
    const buffer = fs.readFileSync(path.join(targetPath, data.file))

    mainWindow.webContents.send("audioData", {
        "buffer": buffer
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})