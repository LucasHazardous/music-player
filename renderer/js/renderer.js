const fileList = document.getElementById("fileList")
const playButton = document.getElementById("playButton")
const speedChangeBtn = document.getElementById("speedChangeBtn")
const audioElement = document.getElementById("audioElement")
const loopBtn = document.getElementById("loopBtn")

let fastPlaybackRate = false
let playing = false
let loop = false

ipcRenderer.on("refresh", (data) => {
    fileList.innerHTML = ""

    data.fileList.forEach(file => {
        const fileElement = document.createElement("a")
        fileElement.classList.add(...["panel-block", "is-active"])
        fileElement.innerText = file

        fileElement.addEventListener("click", () => {
            ipcRenderer.send("readFile", {
                file
            })

            fileList.childNodes.forEach(child => {
                if (child.innerText == undefined) {} else if (child.innerText != file)
                    child.classList.remove("has-background-primary-light")
                else child.classList.add("has-background-primary-light")
            })
        })

        fileList.appendChild(fileElement)
    })
})

ipcRenderer.on("audioData", (data) => {
    const blob = new Blob([data.buffer], {
        type: "audio/webm"
    });
    const url = window.URL.createObjectURL(blob);
    audioElement.setAttribute("src", url)
    audioElement.load()

    if (fastPlaybackRate) audioElement.playbackRate = 1.5
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

loopBtn.addEventListener("click", loopChange)

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

function loopChange() {
    loop = !loop
    audioElement.loop = loop
    if (loop)
        loopBtn.classList.add("has-background-primary-light")
    else
        loopBtn.classList.remove("has-background-primary-light")
}