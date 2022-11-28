const fileList = document.getElementById("fileList")
const playButton = document.getElementById("playButton")
const speedChangeBtn = document.getElementById("speedChangeBtn")
let fastPlaybackRate = false
let playing = false
let audio = new Audio()

ipcRenderer.on("refresh", (data) => {
    fileList.innerHTML = ""

    data.fileList.forEach(file => {
        const fileElement = document.createElement("a")
        fileElement.classList.add(...["panel-block", "is-active"])
        fileElement.innerText = file

        fileElement.addEventListener("click", () => {
            playPauseAction()
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
    audio = new Audio(url)
    audio.load()
    if (fastPlaybackRate) audio.playbackRate = 1.5
    playPauseAction()
})

speedChangeBtn.addEventListener("click", () => {
    fastPlaybackRate = !fastPlaybackRate
    if (fastPlaybackRate) {
        speedChangeBtn.classList.add("has-background-primary-light")
        audio.playbackRate = 1.5
    } else {
        speedChangeBtn.classList.remove("has-background-primary-light")
        audio.playbackRate = 1
    }
})

playButton.addEventListener("click", playPauseAction)

function playPauseAction() {
    playing = !playing
    if (playing) {
        playButton.innerText = "〡〡"
        audio.play()
    } else {
        playButton.innerText = "▷"
        audio.pause()
    }
}