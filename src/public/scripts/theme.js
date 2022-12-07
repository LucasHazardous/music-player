import { Storage } from "./storage.js";

ipcRenderer.on("changeTheme", () => {
	Storage.darkTheme = !Storage.darkTheme;
	document.querySelector("html").classList.toggle("dark");
	document
		.querySelectorAll("a")
		.forEach((paragraph) => paragraph.classList.toggle("dark"));
	Storage.updateInfo.classList.toggle("dark");

	if (Storage.fileElementList[Storage.currentIndex] != undefined) {
		Storage.previousSelectedIndex = Storage.currentIndex;
		Storage.lightUpCurrentElement();
	}
});
