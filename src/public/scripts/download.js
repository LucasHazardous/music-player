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

function unlockDownloadField() {
	Storage.downloadField.parentElement.classList.remove("is-loading");
	Storage.downloadField.disabled = false;
}

ipcRenderer.on("downloadFailed", rejectDownloadField);

function rejectDownloadField() {
	Storage.downloadField.parentElement.classList.remove("is-loading");
	Storage.downloadField.classList.add("download-rejection");
	setTimeout(() => {
		Storage.downloadField.classList.remove("download-rejection");
		Storage.downloadField.disabled = false;
	}, 500);
}
