import { loadStorageSettings } from "./services/helpers";
import {
    getThumbnailSettingsStateFromStorage,
    setThumbnailSettingsStateToStorage,
} from "./services/storage-service";

(async () => {
    try {
        const checkbox = document.querySelector("input");

        checkbox.addEventListener("change", () => {
            handleCheckboxValue();
        });
    } catch (e) {
        console.error(e);
    }
})();

window.onload = async function () {
    await initExtension();
};

async function handleCheckboxValue() {
    const checkbox = document.querySelector("input");
    const image = document.querySelector("img");

    if (checkbox.checked) {
        image.src = "white-logo-hot.svg";
        chrome.browserAction.setIcon({ path: "icon-hot.png" });
    } else {
        image.src = "white-logo-cold.svg";
        chrome.browserAction.setIcon({ path: "icon-cold.png" });
    }

    const settings = await getThumbnailSettingsStateFromStorage();
    settings.isExtensionActive = checkbox.checked;
    console.log(settings);

    setThumbnailSettingsStateToStorage(settings);
}

async function initExtension() {
    const image = document.querySelector("img");

    await loadStorageSettings();
    const settings = await getThumbnailSettingsStateFromStorage();

    const checkbox = document.querySelector("input");

    if (settings.isExtensionActive) {
        image.src = "white-logo-hot.svg";
        chrome.browserAction.setIcon({ path: "icon-hot.png" });
        checkbox.checked = true;
    } else {
        image.src = "white-logo-cold.svg";
        chrome.browserAction.setIcon({ path: "icon-cold.png" });
        checkbox.checked = false;
    }
}
