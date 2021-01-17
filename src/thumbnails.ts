import { sortArticles } from "./services/sorting-service";
import { createButton, insertAfter } from "./services/helpers";
import {
    getSortingFromStorage,
    setThumbnailStateToStorage,
} from "./services/storage-service";
import { ArticleState } from "./models/interfaces";
import { SortingOrder } from "./models/enums";
import {
    getContainerizedArticles,
    selectCorrectButton,
} from "./services/thumbnails-service";

(async () => {
    try {
        addButtonsToWebpage();
        await addEventListenersForButtons();
        await manageArticleState();
    } catch (e) {
        // Deal with the fact the chain failed
        console.error(e);
    }
})();

// when button is clicked in plugin menu
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    sortArticles(msg.sortDescending);
});

document.querySelectorAll("f-bar-options-item").forEach((element) => {
    element.addEventListener("click", async () => {
        // if standard feber hot or cold buttons are clicked, set sorting to standard before saving the state, and then set back to chosen sorting to avoid bug.
        const sortingOrder = await getSortingFromStorage();
        sortArticles(SortingOrder.Standard);
        await manageArticleState();
        sortArticles(sortingOrder);
    });
});

async function manageArticleState() {
    const containerArticleSummaries = getContainerizedArticles();

    const articleState: ArticleState = {
        date: new Date().toISOString(),
        articles: containerArticleSummaries,
    };

    setThumbnailStateToStorage(articleState);

    const currentSortingOrder = await getSortingFromStorage();

    if (currentSortingOrder !== SortingOrder.Standard) {
        sortArticles(currentSortingOrder);
        selectCorrectButton(currentSortingOrder);
    }
}

async function addEventListenersForButtons() {
    const hotButton = document.querySelector("#sortHotButton");
    const coldButton = document.querySelector("#sortColdButton");
    const standardButton = document.querySelector("#sortStandardButton");

    // when hot button clicked
    hotButton.addEventListener("click", async () => {
        await sortArticles(SortingOrder.Descending);
        selectCorrectButton(SortingOrder.Descending);
    });

    // when cold button clicked
    coldButton.addEventListener("click", async () => {
        await sortArticles(SortingOrder.Ascending);
        selectCorrectButton(SortingOrder.Ascending);
    });

    // when standard button clicked
    standardButton.addEventListener("click", async () => {
        await sortArticles(SortingOrder.Standard);
        selectCorrectButton(SortingOrder.Standard);
    });
}

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
    const sortStandard = createButton("sortStandardButton", "Standard", [
        "button-selected",
    ]);

    pluginSettingsBar.appendChild(sortHot);
    pluginSettingsBar.appendChild(sortStandard);
    pluginSettingsBar.appendChild(sortCold);
}
