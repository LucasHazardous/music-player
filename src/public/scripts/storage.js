class Storage {
	static audioElement = document.getElementById("audioElement");

	static fileListHolder = document.getElementById("fileListHolder");

	static volumeChanger = document.getElementById("volumeChanger");

	static speedChangeBtn = document.getElementById("speedChangeBtn");
	static loopBtn = document.getElementById("loopBtn");

	static currentNameHolder = document.getElementById("currentNameHolder");

	static playButton = document.getElementById("playButton");
	static leftBtn = document.getElementById("leftBtn");
	static rightBtn = document.getElementById("rightBtn");
	static timeControl = document.getElementById("timeControl");

	static downloadBtn = document.getElementById("downloadBtn");
	static downloadField = document.getElementById("downloadField");

	static updateInfo = document.getElementById("updateInfo");

	static closeUpdateInfoBtn = document.getElementById("closeUpdateInfoBtn");

	static fastPlaybackRate = false;
	static playing = false;
	static loop = false;
	static fileElementList = [];
	static currentIndex = -1;
	static previousSelectedIndex = -1;
	static darkTheme = false;

	static blocked = new Set();

	static lightUpCurrentElement() {
		if (Storage.fileElementList[Storage.previousSelectedIndex] != undefined)
			Storage.fileElementList[
				Storage.previousSelectedIndex
			].classList.remove(
				...["has-background-primary-light", "dark-background"]
			);

		Storage.fileElementList[Storage.currentIndex].classList.add(
			Storage.darkTheme
				? "dark-background"
				: "has-background-primary-light"
		);
	}
}

export { Storage };
