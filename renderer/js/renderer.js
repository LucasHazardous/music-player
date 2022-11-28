const fileList = document.getElementById("fileList")

ipcRenderer.on("refresh", (data) => {
    data.fileList.forEach(file => {
        const fileElement = document.createElement("div")
        fileElement.classList.add(...["card-header", "has-text-centered"])
        fileElement.addEventListener("click", () => {
            ipcRenderer.send("readFile", {
                file
            })
        })
        fileElement.innerText = file

        fileList.appendChild(fileElement)
    })
})

ipcRenderer.on("audioData", (data) => {
    const blob = new Blob([data.buffer], {
        type: "audio/webm"
    });
    const url = window.URL.createObjectURL(blob);
    const audio = new Audio(url)
    audio.play()
})