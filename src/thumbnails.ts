import { sortArticles } from "./services/sorting-service";
import {
    createButton,
    insertAfter,
    isButtonSelected,
} from "./services/helpers";
import {
    getThumbnailSettingsStateFromStorage,
    setArticleStateToStorage,
    setThumbnailSettingsStateToStorage,
} from "./services/storage-service";
import { ArticleState, ThumbnailSettingsState } from "./models/interfaces";
import { SortingOrder } from "./models/enums";
import {
    getContainerizedArticles,
    selectCorrectButton,
    shouldShowVoting,
} from "./services/thumbnails-service";

(async () => {
    try {
        addButtonsToWebpage();
        await manageArticleState();
        await initSettings();
        await addEventListenersForButtons();
    } catch (e) {
        // Deal with the fact the chain failed
        console.error(e);
    }
})();

// when button is clicked in plugin menu
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    sortArticles(msg.sortDescending);
});

async function initSettings() {
    const initialSettings: ThumbnailSettingsState = {
        showVotes: false,
        sorting: SortingOrder.Standard,
    };

    const settings = await getThumbnailSettingsStateFromStorage();

    if (!settings) {
        setThumbnailSettingsStateToStorage(initialSettings);
        return;
    }

    shouldShowVoting(settings.showVotes);

    if (settings.sorting !== SortingOrder.Standard) {
        sortArticles(settings.sorting);
        selectCorrectButton(settings.sorting);
    }
}

async function manageArticleState() {
    const containerArticleSummaries = getContainerizedArticles();

    const articleState: ArticleState = {
        date: new Date().toISOString(),
        articles: containerArticleSummaries,
    };

    setArticleStateToStorage(articleState);
}

async function addEventListenersForButtons() {
    const hotButton = document.querySelector("#sortHotButton");
    const coldButton = document.querySelector("#sortColdButton");
    const standardButton = document.querySelector("#sortStandardButton");
    const showVoteButton = document.querySelector("#showVoteButton");

    hotButton.addEventListener("click", async () => {
        await sortArticles(SortingOrder.Descending);
        selectCorrectButton(SortingOrder.Descending);
    });

    coldButton.addEventListener("click", async () => {
        await sortArticles(SortingOrder.Ascending);
        selectCorrectButton(SortingOrder.Ascending);
    });

    standardButton.addEventListener("click", async () => {
        await sortArticles(SortingOrder.Standard);
        selectCorrectButton(SortingOrder.Standard);
    });

    showVoteButton.addEventListener("click", async (e) => {
        const target = e.target as Element;

        await shouldShowVoting(!isButtonSelected(target));
    });

    // if standard feber hot or cold buttons are clicked, set sorting to standard before saving the state, and then set back to chosen sorting to avoid bug.
    document.querySelectorAll("f-bar-options-item").forEach((element) => {
        element.addEventListener("click", async () => {
            const sortingOrder = await (
                await getThumbnailSettingsStateFromStorage()
            ).sorting;
            sortArticles(SortingOrder.Standard);
            await manageArticleState();
            sortArticles(sortingOrder);
        });
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
    const sortHot = createButton("sortHotButton", "Heta först", [
        "feberhot",
        "menu-item",
    ]);

    // sort cold button
    const sortCold = createButton("sortColdButton", "Kalla först", [
        "febercold",
        "menu-item",
    ]);

    // sort standard button
    const sortStandard = createButton("sortStandardButton", "Standard", [
        "button-selected",
        "menu-item",
    ]);

    // separator
    const separator = document.createElement("div");
    separator.classList.add("separator");

    // show voting button
    const showVoteButton = createButton("showVoteButton", "Visa röstning", [
        "menu-item",
    ]);

    pluginSettingsBar.appendChild(sortHot);
    pluginSettingsBar.appendChild(sortStandard);
    pluginSettingsBar.appendChild(sortCold);
    pluginSettingsBar.appendChild(separator);
    pluginSettingsBar.appendChild(showVoteButton);
}
