import { Storage } from "./storage.js";

ipcRenderer.on("unblockAll", () => {
	if (Storage.blocked.size == 0) return;

	Storage.blocked = new Set();
	Storage.fileElementList.forEach((element) =>
		element.classList.remove("blocked")
	);
});

ipcRenderer.on("blockAll", () => {
	Storage.blocked = new Set(
		Storage.fileElementList.map((element) => element.trueName)
	);
	Storage.fileElementList.forEach((element) =>
		element.classList.add("blocked")
	);
});

ipcRenderer.on("saveBlocked", () => {
	ipcRenderer.send("blockedList", {
		files: Storage.blocked,
	});
});

ipcRenderer.on("initialBlockedLoad", (data) => {
	Storage.blocked = new Set();
	Storage.fileElementList.forEach((element) => {
		if (data.blocked.has(element.trueName)) {
			Storage.blocked.add(element.trueName);
			element.classList.add("blocked");
		}
	});
});
