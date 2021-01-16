import { sortArticles } from "./sort";
import { createButton, insertAfter } from "./helpers";

// add buttons to webpage
function addButtonsToWebpage() {
    const bar = document.getElementsByTagName("f-bar-options")[0];

    // add settings bar
    const pluginSettingsBar = document.createElement("div");
    pluginSettingsBar.textContent = "Feber Enhancer";
    pluginSettingsBar.classList.add("settings-bar");
    insertAfter(pluginSettingsBar, bar);

    // Sort hot button
    const sortHot = createButton("sortHotButton", "Heta först", ["feberhot"]);

    // sort cold button
    const sortCold = createButton("sortColdButton", "Kalla först", [
        "febercold",
    ]);

    pluginSettingsBar.appendChild(sortHot);
    pluginSettingsBar.appendChild(sortCold);
}

addButtonsToWebpage();

// when button is clicked in plugin menu
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    sortArticles(msg.sortDescending);
});

const hotButton = document.querySelector("#sortHotButton");
const coldButton = document.querySelector("#sortColdButton");

// when hot button clicked
hotButton.addEventListener("click", () => {
    sortArticles(true);
    hotButton.classList.add("button-selected");
    coldButton.classList.remove("button-selected");
});

// when cold button clicked
coldButton.addEventListener("click", () => {
    sortArticles(false);
    hotButton.classList.remove("button-selected");
    coldButton.classList.add("button-selected");
});
