import { Storage } from "./storage.js";

function selectFile(target) {
	Storage.previousSelectedIndex = Storage.currentIndex;
	Storage.currentIndex = target;
	playFile(Storage.fileElementList[Storage.currentIndex].trueName);
}

ipcRenderer.on("refresh", (data) => {
	let currentName = null;
	if (Storage.currentIndex != -1)
		currentName = Storage.fileElementList[Storage.currentIndex].trueName;
	Storage.currentIndex = -1;

	Storage.fileElementList = [];
	Storage.fileListHolder.innerHTML = "";

	for (const [i, file] of data.fileList.entries()) {
		if (file == currentName) Storage.currentIndex = i;

		const fileElement = document.createElement("a");
		fileElement.classList.add(...["panel-block", "is-active"]);
		if (Storage.darkTheme) fileElement.classList.add("dark");
		fileElement.innerText = file;

		fileElement.addEventListener("click", () => {
			Storage.previousSelectedIndex = Storage.currentIndex;
			Storage.currentIndex = i;

			playFile(file);
		});

		fileElement.trueName = file;
		Storage.fileListHolder.appendChild(fileElement);
		Storage.fileElementList.push(fileElement);
	}

	if (Storage.fileElementList[Storage.currentIndex] != undefined)
		Storage.lightUpCurrentElement();
});

function playFile(file) {
	URL.revokeObjectURL(Storage.audioElement.getAttribute("src"));
	Storage.audioElement.setAttribute("src", "");

	Storage.currentNameHolder.innerText = file.replace(
		new RegExp(/\[.+\]\.[a-zA-Z0-9]+/, "g"),
		""
	);

	ipcRenderer.send("readFile", {
		file,
	});
}

Storage.leftBtn.addEventListener("click", playPrevious);

Storage.rightBtn.addEventListener("click", playNext);

Storage.audioElement.addEventListener("pause", () => {
	if (Storage.playing && !Storage.loop) playNext();
});

function playNext() {
	selectFile((Storage.currentIndex + 1) % Storage.fileElementList.length);
}

function playPrevious() {
	selectFile(
		Storage.currentIndex - 1 < 0
			? Storage.fileElementList.length - 1
			: Storage.currentIndex - 1
	);
}

ipcRenderer.on("audioData", (data) => {
	const blob = new Blob([data.buffer], {
		type: "audio/webm",
	});
	const url = window.URL.createObjectURL(blob);
	Storage.audioElement.setAttribute("src", url);
	Storage.audioElement.load();

	if (Storage.fastPlaybackRate) Storage.audioElement.playbackRate = 1.5;
	Storage.playing = false;
	playPauseAction();

	if (Storage.fileElementList[Storage.currentIndex] != undefined)
		Storage.lightUpCurrentElement();
});

function playPauseAction() {
	Storage.playing = !Storage.playing;
	if (Storage.playing) {
		if (Storage.currentIndex === -1 && Storage.fileElementList.length > 0)
			playNext();

		Storage.playButton.innerText = "??????";
		Storage.audioElement.play();
	} else {
		Storage.playButton.innerText = "???";
		Storage.audioElement.pause();
	}
}

Storage.playButton.addEventListener("click", playPauseAction);
