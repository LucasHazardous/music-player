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

	switchClassesForElements(
		"dark-background",
		"has-background-primary-light",
		"#loopBtn",
		"#speedChangeBtn"
	);

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

function switchClassesForElements(class1, class2, ...elements) {
	document.querySelectorAll(elements.join(", ")).forEach((element) => {
		if (element.classList.contains(class1)) {
			element.classList.remove(class1);
			element.classList.add(class2);
		} else if (element.classList.contains(class2)) {
			element.classList.remove(class2);
			element.classList.add(class1);
		}
	});
}
