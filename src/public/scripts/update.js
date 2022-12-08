import { Storage } from "./storage.js";

ipcRenderer.on("updateMsg", (data) => {
	Storage.updateInfo.classList.remove("is-hidden");
	Storage.updateInfo.firstChild.data = data.text;

	if (["Update not available.", "Error in auto-updater."].includes(data.text))
		Storage.updateInfo.childNodes[1].classList.remove("is-hidden");
	else Storage.updateInfo.childNodes[1].classList.add("is-hidden");
});

Storage.closeUpdateInfoBtn.addEventListener("click", () =>
	Storage.updateInfo.classList.add("is-hidden")
);
