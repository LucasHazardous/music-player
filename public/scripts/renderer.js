const audioElement = document.getElementById("audioElement");

const fileListHolder = document.getElementById("fileListHolder");

const volumeChanger = document.getElementById("volumeChanger");

const speedChangeBtn = document.getElementById("speedChangeBtn");
const loopBtn = document.getElementById("loopBtn");

const currentNameHolder = document.getElementById("currentNameHolder");

const playButton = document.getElementById("playButton");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const timeControl = document.getElementById("timeControl");

let fastPlaybackRate = false;
let playing = false;
let loop = false;
let fileElementList = [];
let currentIndex = -1;
let previousSelectedIndex = -1;
let darkTheme = false;

ipcRenderer.on("refresh", (data) => {
	let currentName = null;
	if (currentIndex != -1)
		currentName = fileElementList[currentIndex].trueName;
	currentIndex = -1;

	fileElementList = [];
	fileListHolder.innerHTML = "";

	for (const [i, file] of data.fileList.entries()) {
		if (file == currentName) currentIndex = i;

		const fileElement = document.createElement("a");
		fileElement.classList.add(...["panel-block", "is-active"]);
		if (darkTheme) fileElement.classList.add("dark");
		fileElement.innerText = file;

		fileElement.addEventListener("click", () => {
			previousSelectedIndex = currentIndex;
			currentIndex = i;

			playFile(file);
		});

		fileElement.trueName = file;
		fileListHolder.appendChild(fileElement);
		fileElementList.push(fileElement);
	}

	if (fileElementList[currentIndex] != undefined) lightUpCurrentElement();
});

function playFile(file) {
	URL.revokeObjectURL(audioElement.getAttribute("src"));

	currentNameHolder.innerText = file.replace(
		new RegExp(/\[.+\]\.[a-zA-Z0-9]+/, "g"),
		""
	);

	ipcRenderer.send("readFile", {
		file,
	});
}

function lightUpCurrentElement() {
	if (fileElementList[previousSelectedIndex] != undefined)
		fileElementList[previousSelectedIndex].classList.remove(
			...["has-background-primary-light", "dark-background"]
		);

	fileElementList[currentIndex].classList.add(
		darkTheme ? "dark-background" : "has-background-primary-light"
	);
}

ipcRenderer.on("audioData", (data) => {
	const blob = new Blob([data.buffer], {
		type: "audio/webm",
	});
	const url = window.URL.createObjectURL(blob);
	audioElement.setAttribute("src", url);
	audioElement.load();

	if (fastPlaybackRate) audioElement.playbackRate = 1.5;
	playing = false;
	playPauseAction();

	if (fileElementList[currentIndex] != undefined) lightUpCurrentElement();
});

speedChangeBtn.addEventListener("click", () => {
	fastPlaybackRate = !fastPlaybackRate;
	if (fastPlaybackRate) {
		speedChangeBtn.classList.add("has-background-primary-light");
		audioElement.playbackRate = 1.5;
	} else {
		speedChangeBtn.classList.remove("has-background-primary-light");
		audioElement.playbackRate = 1;
	}
});

playButton.addEventListener("click", playPauseAction);

function playPauseAction() {
	playing = !playing;
	if (playing) {
		playButton.innerText = "〡〡";
		audioElement.play();
	} else {
		playButton.innerText = "▷";
		audioElement.pause();
	}
}

loopBtn.addEventListener("click", loopChange);

function loopChange() {
	loop = !loop;
	audioElement.loop = loop;
	if (loop) loopBtn.classList.add("has-background-primary-light");
	else loopBtn.classList.remove("has-background-primary-light");
}

leftBtn.addEventListener("click", () =>
	selectFile(
		currentIndex - 1 < 0 ? fileElementList.length - 1 : currentIndex - 1
	)
);

rightBtn.addEventListener("click", () =>
	selectFile((currentIndex + 1) % fileElementList.length)
);

audioElement.addEventListener("pause", () => {
	if (playing && !loop)
		selectFile((currentIndex + 1) % fileElementList.length);
});

function selectFile(target) {
	previousSelectedIndex = currentIndex;
	currentIndex = target;
	playFile(fileElementList[currentIndex].trueName);
}

volumeChanger.addEventListener(
	"change",
	() => (audioElement.volume = volumeChanger.value / 100)
);

audioElement.addEventListener("timeupdate", () => {
	timeControl.value =
		(audioElement.currentTime / audioElement.duration) * 100;
});

timeControl.addEventListener(
	"change",
	() =>
		(audioElement.currentTime =
			(timeControl.value / 100) * audioElement.duration)
);

const downloadBtn = document.getElementById("downloadBtn");
const downloadField = document.getElementById("downloadField");

downloadBtn.addEventListener("click", downloadFile);

function downloadFile() {
	downloadField.value = downloadField.value.trim();
	if (downloadField.value != "") {
		ipcRenderer.send("downloadFile", {
			url: downloadField.value,
		});
		downloadField.parentElement.classList.add("is-loading");
		downloadField.disabled = true;
	}
	downloadField.value = "";
}

ipcRenderer.on("fileDownloaded", () => {
	downloadField.parentElement.classList.remove("is-loading");
	downloadField.disabled = false;
});

const updateInfo = document.getElementById("updateInfo");

ipcRenderer.on("updateMsg", (data) => {
	updateInfo.classList.remove("is-hidden");
	updateInfo.innerText = data.text;
});

ipcRenderer.on("changeTheme", () => {
	darkTheme = !darkTheme;
	document.querySelector("html").classList.toggle("dark");
	document
		.querySelectorAll("a")
		.forEach((paragraph) => paragraph.classList.toggle("dark"));
	updateInfo.classList.toggle("dark");

	if (fileElementList[currentIndex] != undefined) {
		previousSelectedIndex = currentIndex;
		lightUpCurrentElement();
	}
});
