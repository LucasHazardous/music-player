import { Storage } from "./storage.js";

function selectFile(target) {
	const targetFile = Storage.fileElementList[target].trueName;

	if (!Storage.blocked.has(targetFile) && Storage.currentIndex != target) {
		Storage.previousSelectedIndex = Storage.currentIndex;
		Storage.currentIndex = target;
		playFile(targetFile);
		return true;
	}
	return false;
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
		if (Storage.blocked.has(file)) fileElement.classList.add("blocked");
		fileElement.innerText = file;

		fileElement.addEventListener("click", () => {
			if (!Storage.blocked.has(file)) {
				Storage.previousSelectedIndex = Storage.currentIndex;
				Storage.currentIndex = i;

				playFile(file);
			}
		});

		fileElement.addEventListener("contextmenu", () => {
			if (Storage.blocked.has(file)) Storage.blocked.delete(file);
			else Storage.blocked.add(file);
			fileElement.classList.toggle("blocked");
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
	if (Storage.blocked.size === Storage.fileElementList.length) return;

	let i = Storage.currentIndex;
	do {
		i = ++i % Storage.fileElementList.length;
		if (selectFile(i)) break;
	} while (i != Storage.currentIndex);
}

function playPrevious() {
	if (Storage.blocked.size === Storage.fileElementList.length) return;

	let i = Storage.currentIndex;
	do {
		i = i - 1 < 0 ? Storage.fileElementList.length - 1 : i - 1;
		if (selectFile(i)) break;
	} while (i != Storage.currentIndex);
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

		if(Storage.currentIndex !== -1) {
			Storage.playButton.innerText = "〡〡";
			Storage.audioElement.play();
		}
	} else {
		Storage.playButton.innerText = "▷";
		Storage.audioElement.pause();
	}
}

Storage.playButton.addEventListener("click", playPauseAction);
