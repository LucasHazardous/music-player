const fileListHolder = document.getElementById("fileListHolder")
const playButton = document.getElementById("playButton")
const speedChangeBtn = document.getElementById("speedChangeBtn")
const audioElement = document.getElementById("audioElement")
const loopBtn = document.getElementById("loopBtn")

const leftBtn = document.getElementById("leftBtn")
const rightBtn = document.getElementById("rightBtn")

let fastPlaybackRate = false
let playing = false
let loop = false
let fileList = []
let currentIndex = 0

ipcRenderer.on("refresh", (data) => {
    fileListHolder.innerHTML = ""
    fileList = data.fileList

    for (const [i, file] of fileList.entries()) {
        const fileElement = document.createElement("a")
        fileElement.classList.add(...["panel-block", "is-active"])
        fileElement.innerText = file

        fileElement.addEventListener("click", () => {
            currentIndex = i

            playFile(file)

            lightUpListElement(file)
        })

        fileListHolder.appendChild(fileElement)
    }
})

function playFile(file) {
    URL.revokeObjectURL(audioElement.getAttribute("src"))

    ipcRenderer.send("readFile", {
        file
    })
}

function lightUpListElement(file) {
    fileListHolder.childNodes.forEach(child => {
        if (child.innerText != file)
            child.classList.remove("has-background-primary-light")
        else child.classList.add("has-background-primary-light")
    })
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
    if (--currentIndex < 0) currentIndex = fileList.length - 1
    const file = fileList[currentIndex]
    playFile(file)
    lightUpListElement(file)
}

rightBtn.addEventListener("click", playNextFile)

audioElement.addEventListener("pause", () => {
    if (playing && !loop) playNextFile()
})

function playNextFile() {
    currentIndex++
    currentIndex %= fileList.length
    const file = fileList[currentIndex]
    playFile(file)
    lightUpListElement(file)
}