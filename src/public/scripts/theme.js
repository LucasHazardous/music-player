import { Storage } from "./storage.js";

ipcRenderer.on("changeTheme", () => {
	Storage.darkTheme = !Storage.darkTheme;
	document.querySelector("html").classList.toggle("dark");
	document
		.querySelectorAll("a, #downloadHeading")
		.forEach((paragraph) => paragraph.classList.toggle("dark"));

	document
		.querySelectorAll("#nav, #controls")
		.forEach((control) => control.classList.toggle("dark-control-nav"));

	document
		.querySelector(".card-footer-item:not(:last-child)")
		.classList.toggle("dark-right-border");

	if (Storage.fileElementList[Storage.currentIndex] != undefined) {
		Storage.previousSelectedIndex = Storage.currentIndex;
		Storage.lightUpCurrentElement();
	}
});
