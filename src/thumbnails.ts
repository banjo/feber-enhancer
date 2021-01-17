import {
    ArticleSummary,
    getArticleSummaries,
    sortArticles,
    SortingOrder,
} from "./sort";
import { ArticleState, createButton, insertAfter } from "./helpers";
import { getSortingFromStorage, setThumbnailStateToStorage } from "./storage";

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

function getContainerizedArticles() {
    const containers = document.getElementsByClassName("basicContainer");

    const containerArticleSummaries = [] as ArticleSummary[][];

    for (let collection of containers) {
        const articleSummaries = getArticleSummaries(collection);
        containerArticleSummaries.push(articleSummaries);
    }
    return containerArticleSummaries;
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

function selectCorrectButton(sortingOrder: SortingOrder) {
    const hotButton = document.querySelector("#sortHotButton");
    const coldButton = document.querySelector("#sortColdButton");
    const standardButton = document.querySelector("#sortStandardButton");

    if (sortingOrder === SortingOrder.Standard) {
        hotButton.classList.remove("button-selected");
        coldButton.classList.remove("button-selected");
        standardButton.classList.add("button-selected");
    }

    if (sortingOrder === SortingOrder.Ascending) {
        hotButton.classList.remove("button-selected");
        standardButton.classList.remove("button-selected");
        coldButton.classList.add("button-selected");
    }

    if (sortingOrder === SortingOrder.Descending) {
        hotButton.classList.add("button-selected");
        standardButton.classList.remove("button-selected");
        coldButton.classList.remove("button-selected");
    }
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
