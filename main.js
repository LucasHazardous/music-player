const {
    app,
    BrowserWindow,
    Menu,
    shell
} = require('electron')
const path = require('path')
const {
    ipcMain
} = require('electron')
const os = require("os")
const fs = require("fs")

const ytdlpWrap = require('yt-dlp-wrap').default
const ytdlpExecutablePath = path.join(__dirname, "yt-dlp.exe")
let ytplpExecutableWrap;

if (!fs.existsSync(ytdlpExecutablePath))
    ytdlpWrap.downloadFromGithub()
    .then(() => ytplpExecutableWrap = new ytdlpWrap(ytdlpExecutablePath))
    .catch(err => console.log(err))
else
    ytplpExecutableWrap = new ytdlpWrap(ytdlpExecutablePath)

const targetPath = path.join(os.homedir(), "music-player")
const availableFiles = []

const isDev = process.env.NODE_ENV === "dev"

let mainWindow;
const gotTheLock = app.requestSingleInstanceLock()

const {
    autoUpdater
} = require("electron-updater")

const createWindow = () => {
    mainWindow = new BrowserWindow({
        title: "Image Resizer",
        width: isDev ? 1000 : 500,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true
        },
        resizable: false
    })

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    if (isDev) mainWindow.webContents.openDevTools()

    mainWindow.loadFile(path.join(__dirname, "./renderer/index.html")).then(loadFiles)
}

if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (e, cmd, dir) => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
    })

    app.whenReady().then(() => {
        if (!isDev)
            autoUpdater.checkForUpdatesAndNotify()

        createWindow()

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) createWindow()
        })
    })
}

const menu = [{
    label: "File",
    submenu: [{
            label: "Change theme",
            click: changeTheme,
            accelerator: "CmdOrCtrl+T"
        },
        {
            label: "Files location",
            click: () => shell.openPath(targetPath),
            accelerator: "CmdOrCtrl+F"
        },
        {
            label: "Refresh",
            click: loadFiles,
            accelerator: "CmdOrCtrl+R"
        }, {
            label: "Quit",
            click: app.quit,
            accelerator: "CmdOrCtrl+W"
        }
    ]
}]

function changeTheme() {
    mainWindow.webContents.send("changeTheme")
}

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

ipcMain.on("downloadFile", async (e, data) => {
    ytplpExecutableWrap
        .exec([
            "-f",
            "ba",
            data.url,
            "-P",
            targetPath
        ])
        .on('error', (err) => console.log(err))
        .on('close', () => {
            mainWindow.webContents.send("fileDownloaded")
            loadFiles()
        })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})