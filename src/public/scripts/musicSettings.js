import { Storage } from "./storage.js";

Storage.speedChangeBtn.addEventListener("click", () => {
	Storage.fastPlaybackRate = !Storage.fastPlaybackRate;
	if (Storage.fastPlaybackRate) {
		Storage.speedChangeBtn.classList.add(
			Storage.darkTheme
				? "dark-background"
				: "has-background-primary-light"
		);
		Storage.audioElement.playbackRate = 1.5;
	} else {
		Storage.speedChangeBtn.classList.remove(
			...["has-background-primary-light", "dark-background"]
		);
		Storage.audioElement.playbackRate = 1;
	}
});

Storage.loopBtn.addEventListener("click", loopChange);

function loopChange() {
	Storage.loop = !Storage.loop;
	Storage.audioElement.loop = Storage.loop;
	if (Storage.loop)
		Storage.loopBtn.classList.add(
			Storage.darkTheme
				? "dark-background"
				: "has-background-primary-light"
		);
	else
		Storage.loopBtn.classList.remove(
			...["has-background-primary-light", "dark-background"]
		);
}

Storage.volumeChanger.addEventListener(
	"change",
	() => (Storage.audioElement.volume = Storage.volumeChanger.value / 100)
);

Storage.audioElement.addEventListener("timeupdate", () => {
	Storage.timeControl.value =
		(Storage.audioElement.currentTime / Storage.audioElement.duration) *
		100;
});

Storage.timeControl.addEventListener(
	"change",
	() =>
		(Storage.audioElement.currentTime =
			(Storage.timeControl.value / 100) * Storage.audioElement.duration)
);
