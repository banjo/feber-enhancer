import { sortArticles, SortingOrder } from "./sort";
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

    // sort standard button
    const sortStandard = createButton("sortStandardButton", "Standard", []);

    pluginSettingsBar.appendChild(sortHot);
    pluginSettingsBar.appendChild(sortStandard);
    pluginSettingsBar.appendChild(sortCold);
}

addButtonsToWebpage();

// when button is clicked in plugin menu
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    sortArticles(msg.sortDescending);
});

const hotButton = document.querySelector("#sortHotButton");
const coldButton = document.querySelector("#sortColdButton");
const standardButton = document.querySelector("#sortStandardButton");

// when hot button clicked
hotButton.addEventListener("click", () => {
    sortArticles(SortingOrder.Descending);
    hotButton.classList.add("button-selected");
    standardButton.classList.remove("button-selected");
    coldButton.classList.remove("button-selected");
});

// when cold button clicked
coldButton.addEventListener("click", () => {
    sortArticles(SortingOrder.Ascending);
    hotButton.classList.remove("button-selected");
    standardButton.classList.remove("button-selected");
    coldButton.classList.add("button-selected");
});

// when standard button clicked
standardButton.addEventListener("click", () => {
    sortArticles(SortingOrder.Standard);
    hotButton.classList.remove("button-selected");
    coldButton.classList.remove("button-selected");
    standardButton.classList.add("button-selected");
});
