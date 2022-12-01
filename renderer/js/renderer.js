const fileListHolder = document.getElementById("fileListHolder")
const playButton = document.getElementById("playButton")
const speedChangeBtn = document.getElementById("speedChangeBtn")
const audioElement = document.getElementById("audioElement")
const loopBtn = document.getElementById("loopBtn")

const leftBtn = document.getElementById("leftBtn")
const rightBtn = document.getElementById("rightBtn")

const downloadBtn = document.getElementById("downloadBtn")
const downloadField = document.getElementById("downloadField")
const downloadNotification = document.getElementById("downloadNotification")
const hideNotificationBtn = document.getElementById("hideNotificationBtn")

const volumeChanger = document.getElementById("volumeChanger")

let fastPlaybackRate = false
let playing = false
let loop = false
let fileElementList = []
let currentIndex = -1
let previousSelectedIndex = -1

ipcRenderer.on("refresh", (data) => {
    let currentName = null
    if (currentIndex != -1)
        currentName = fileElementList[currentIndex].innerText
    currentIndex = -1

    fileElementList = []
    fileListHolder.innerHTML = ""

    for (const [i, file] of data.fileList.entries()) {
        if (file == currentName) currentIndex = i

        const fileElement = document.createElement("a")
        fileElement.classList.add(...["panel-block", "is-active"])
        fileElement.innerText = file

        fileElement.addEventListener("click", () => {
            previousSelectedIndex = currentIndex
            currentIndex = i

            playFile(file)

            lightUpListElement()
        })

        fileListHolder.appendChild(fileElement)
        fileElementList.push(fileElement)
    }

    if (fileElementList[currentIndex] != undefined)
        lightUpListElement()
})

function playFile(file) {
    URL.revokeObjectURL(audioElement.getAttribute("src"))

    ipcRenderer.send("readFile", {
        file
    })
}

function lightUpListElement() {
    if (fileElementList[previousSelectedIndex] != undefined)
        fileElementList[previousSelectedIndex].classList.remove("has-background-primary-light")
    fileElementList[currentIndex].classList.add("has-background-primary-light")
}

ipcRenderer.on("audioData", (data) => {
    const blob = new Blob([data.buffer], {
        type: "audio/webm"
    })
    const url = window.URL.createObjectURL(blob)
    audioElement.setAttribute("src", url)
    audioElement.load()

    if (fastPlaybackRate) audioElement.playbackRate = 1.5
    playing = false
    playPauseAction()
    if (loop) loopChange()
})

speedChangeBtn.addEventListener("click", () => {
    fastPlaybackRate = !fastPlaybackRate
    if (fastPlaybackRate) {
        speedChangeBtn.classList.add("has-background-primary-light")
        audioElement.playbackRate = 1.5
    } else {
        speedChangeBtn.classList.remove("has-background-primary-light")
        audioElement.playbackRate = 1
    }
})

playButton.addEventListener("click", playPauseAction)

function playPauseAction() {
    playing = !playing
    if (playing) {
        playButton.innerText = "〡〡"
        audioElement.play()
    } else {
        playButton.innerText = "▷"
        audioElement.pause()
    }
}

loopBtn.addEventListener("click", loopChange)

function loopChange() {
    loop = !loop
    audioElement.loop = loop
    if (loop)
        loopBtn.classList.add("has-background-primary-light")
    else
        loopBtn.classList.remove("has-background-primary-light")
}

leftBtn.addEventListener("click", playPreviousFile)

function playPreviousFile() {
    previousSelectedIndex = currentIndex
    if (--currentIndex < 0) currentIndex = fileElementList.length - 1
    playFile(fileElementList[currentIndex].innerText)
    lightUpListElement()
}

rightBtn.addEventListener("click", playNextFile)

audioElement.addEventListener("pause", () => {
    if (playing && !loop) playNextFile()
})

function playNextFile() {
    previousSelectedIndex = currentIndex
    currentIndex++
    currentIndex %= fileElementList.length
    playFile(fileElementList[currentIndex].innerText)
    lightUpListElement()
}

downloadBtn.addEventListener("click", downloadFile)

function downloadFile() {
    ipcRenderer.send("downloadFile", {
        url: downloadField.value
    })
}

ipcRenderer.on("fileDownloaded", () => {
    downloadNotification.classList.remove("is-hidden");
})

hideNotificationBtn.addEventListener("click", () => downloadNotification.classList.add("is-hidden"))

volumeChanger.addEventListener("click", (e) => {
    const rect = e.target.getBoundingClientRect()
    const x = e.clientX - rect.left

    const volume = x / volumeChanger.clientWidth
    audioElement.volume = volume
    volumeChanger.value = volume * 100
})

ipcRenderer.on("changeTheme", () => {
    document.querySelector("html").classList.toggle("dark")
    document.querySelectorAll(".panel-block").forEach(paragraph => paragraph.classList.toggle("dark"))
})