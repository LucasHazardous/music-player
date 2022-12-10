const { app, BrowserWindow, Menu, shell, nativeTheme } = require("electron");
const { autoUpdater } = require("electron-updater");
const { ipcMain } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");

const isDev = process.env.NODE_ENV === "dev";

const targetPath = path.join(os.homedir(), "music-player");
let mainWindow;
const gotTheLock = app.requestSingleInstanceLock();
let darkMode = false;
const availableFiles = [];

const ytdlpWrap = require("yt-dlp-wrap").default;
const ytdlpExecutablePath = path.join(targetPath, "yt-dlp.exe");
const exec = require("child_process").exec;

if (!fs.existsSync(ytdlpExecutablePath))
	ytdlpWrap
		.downloadFromGithub(ytdlpExecutablePath)
		.catch((err) => console.log(err));

function createWindow() {
	mainWindow = new BrowserWindow({
		title: "music-player",
		width: isDev ? 1000 : 500,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
		},
		resizable: false,
		icon: path.join(__dirname, "../build/icon.ico"),
	});

	const mainMenu = Menu.buildFromTemplate(menu);
	Menu.setApplicationMenu(mainMenu);

	if (isDev) mainWindow.webContents.openDevTools();

	mainWindow
		.loadFile(path.join(__dirname, "./public/pages/index.html"))
		.then(loadFiles)
		.then(() => {
			if (nativeTheme.shouldUseDarkColors) changeTheme();
		});
}

if (!gotTheLock) {
	app.quit();
} else {
	app.on("second-instance", (e, cmd, dir) => {
		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore();
			mainWindow.focus();
		}
	});

	app.whenReady().then(() => {
		createWindow();

		app.on("activate", () => {
			if (BrowserWindow.getAllWindows().length === 0) createWindow();
		});

		autoUpdater.on("checking-for-update", () => {
			sendStatusToWindow("Checking for update...");
		});
		autoUpdater.on("update-available", (info) => {
			sendStatusToWindow("Update available.");
		});
		autoUpdater.on("update-not-available", (info) => {
			sendStatusToWindow("Update not available.");
		});
		autoUpdater.on("error", (err) => {
			sendStatusToWindow("Error in auto-updater.");
		});
		autoUpdater.on("download-progress", (progress) => {
			sendStatusToWindow(`Downloaded ${Math.floor(progress.percent)}%`);
		});
		autoUpdater.on("update-downloaded", (info) => {
			sendStatusToWindow("Update downloaded. Restart the app.");
		});
	});
}

function sendStatusToWindow(text) {
	mainWindow.webContents.send("updateMsg", {
		text,
	});
}

const menu = [
	{
		label: "File",
		submenu: [
			{
				label: "Change theme",
				click: changeTheme,
				accelerator: "CmdOrCtrl+T",
			},
			{
				label: "Files location",
				click: () => shell.openPath(targetPath),
				accelerator: "CmdOrCtrl+F",
			},
			{
				label: "Refresh",
				click: loadFiles,
				accelerator: "CmdOrCtrl+R",
			},
			{
				label: "Check for updates",
				click: () => autoUpdater.checkForUpdatesAndNotify(),
			},
			{
				label: "Quit",
				click: app.quit,
				accelerator: "CmdOrCtrl+W",
			},
		],
	},
	{
		label: "About",
		submenu: [
			{
				label: `Version ${app.getVersion()}`,
			},
			{
				label: `Github repository`,
				click: () =>
					shell.openExternal(
						"https://github.com/LucasHazardous/music-player"
					),
			},
		],
	},
];

function changeTheme() {
	darkMode = !darkMode;
	nativeTheme.themeSource = darkMode ? "dark" : "light";
	mainWindow.webContents.send("changeTheme");
}

ipcMain.on("readFile", (e, data) => {
	const buffer = fs.readFileSync(path.join(targetPath, data.file));

	mainWindow.webContents.send("audioData", {
		buffer: buffer,
	});
});

ipcMain.on("downloadFile", async (e, data) => {
	exec(
		`${ytdlpExecutablePath} -f ba ${data.url} -P ${targetPath}`,
		(err, stdout, stderr) => {
			if (!err) {
				mainWindow.webContents.send("fileDownloaded");
				loadFiles();
			} else mainWindow.webContents.send("downloadFailed");
		}
	);
});

function loadFiles() {
	if (!fs.existsSync(targetPath)) fs.mkdirSync(targetPath);

	availableFiles.length = 0;
	fs.readdirSync(targetPath).forEach((file) => {
		if (file != "yt-dlp.exe") availableFiles.push(file);
	});

	mainWindow.webContents.send("refresh", {
		fileList: availableFiles,
	});
}

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
