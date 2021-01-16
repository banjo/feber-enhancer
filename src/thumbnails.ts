import { sortArticles } from "./sort";

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

function createButton(
    id: string,
    text: string,
    classes: string[]
): HTMLDivElement {
    const button = document.createElement("div");
    button.classList.add("settings-button");
    const span = document.createElement("span");
    button.id = id;
    span.textContent = text;

    for (let c of classes) {
        button.classList.add(c);
    }

    button.appendChild(span);
    return button;
}

function insertAfter(newNode: Element, referenceNode: Element) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
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
