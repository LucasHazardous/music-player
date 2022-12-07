import { Storage } from "./storage.js";

ipcRenderer.on("updateMsg", (data) => {
	Storage.updateInfo.classList.remove("is-hidden");
	Storage.updateInfo.innerText = data.text;
});
