import { Storage } from "./storage.js";

Storage.downloadBtn.addEventListener("click", downloadFile);

Storage.downloadField.addEventListener("keypress", (e) =>
	e.key === "Enter" ? downloadFile() : {}
);

function downloadFile() {
	Storage.downloadField.value = Storage.downloadField.value.trim();
	if (Storage.downloadField.value != "") {
		ipcRenderer.send("downloadFile", {
			url: Storage.downloadField.value,
		});
		Storage.downloadField.parentElement.classList.add("is-loading");
		Storage.downloadField.disabled = true;
	}
	Storage.downloadField.value = "";
}

ipcRenderer.on("fileDownloaded", unlockDownloadField);
ipcRenderer.on("downloadFailed", unlockDownloadField);

function unlockDownloadField() {
	Storage.downloadField.parentElement.classList.remove("is-loading");
	Storage.downloadField.disabled = false;
}
