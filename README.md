# music-player

> Desktop music player made in Electron. Works on Windows, Linux and macOS.

## How to run

Navigate to releases and download the latest installer. Run the installer and then the app is ready to use.

## Usage

All the keystrokes presented here are also available in the form of buttons in the upper submenu under **File**.

Press <kbd>CTRL/CMD+F</kbd> to reveal directory in which your music files will be stored. There should be also a file called [**yt-dlp.exe**](https://github.com/yt-dlp/yt-dlp) - **do not remove it**. It's also an open source project and it's responsible for downloading music from YouTube.

To get some music simply move the files to the directory or paste a link to YouTube video and click download. 

* If the music doesn't download remove yt-dlp.exe, restart the app wait for some time until its icon appears and try again.
* If the music doesn't appear refresh the file list with <kbd>CTRL/CMD+R</kbd>.

Aquamarine progress bar is for volume control, buttons in the bottom nav bar are responsible for going to the previous track (goes up on the file list), pausing/playing, going to the next track (goes down on the file list). To play a desired file you can also click its name on the list.

It is also possible to change playback speed to 1.5, or enable looping with buttons above *currently playing* section.

To change to the dark theme press <kbd>CTRL/CMD+T</kbd>, to change back to light theme press the same keystroke.

To get the latest features and bug-fixes go to the upper **Files** submenu and click **Check for updates** button, wait for the update to download then restart the app.

You can quit the app with <kbd>CTRL/CMD+W</kbd>.

---

## Build

To build clone this repository, install npm modules:

```
npm i
```

and run:

```
npm run build
```