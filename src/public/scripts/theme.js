import { Storage } from "./storage.js";

ipcRenderer.on("changeTheme", () => {
	Storage.darkTheme = !Storage.darkTheme;
	toggleClassForElements("dark", "a", "#downloadHeading", "html");
	toggleClassForElements("dark-control-nav", "#nav", "#controls");
	toggleClassForElements(
		"dark-right-border",
		".card-footer-item:not(:last-child)"
	);
	toggleClassForElements("dark-panel", ".panel");
	toggleClassForElements("dark-downloadField", "#downloadField");

	if (Storage.fileElementList[Storage.currentIndex] != undefined) {
		Storage.previousSelectedIndex = Storage.currentIndex;
		Storage.lightUpCurrentElement();
	}
});

function toggleClassForElements(targetClass, ...elements) {
	document
		.querySelectorAll(elements.join(", "))
		.forEach((element) => element.classList.toggle(targetClass));
}
