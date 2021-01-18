import { sortThumbnails } from "./services/sorting-service";
import {
    createButton,
    getSpinnerElement,
    insertAfter,
    isButtonSelected,
    shouldHideElement,
    showSpinnerInsteadOf,
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
import { searchFilter } from "./services/filter-service";

(async () => {
    try {
        addButtonsToWebpage();
        hideOriginalSettingsBar();
        await manageArticleState();
        await initSettings();
        await addEventListenersForButtons();
    } catch (e) {
        console.error(e);
    }
})();

// when button is clicked in plugin menu
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    sortThumbnails(msg.sortDescending);
});

function hideOriginalSettingsBar() {
    const bar = document.querySelector("f-bar-options");

    shouldHideElement(bar, true);
}

async function initSettings() {
    const initialSettings: ThumbnailSettingsState = {
        showVotes: false,
        sorting: SortingOrder.Standard,
    };

    const settings = await getThumbnailSettingsStateFromStorage();

    console.log("Settings: ", settings);

    if (!settings) {
        setThumbnailSettingsStateToStorage(initialSettings);
        return;
    }

    await sortThumbnails(settings.sorting);
    selectCorrectButton(settings.sorting);

    await shouldShowVoting(settings.showVotes);

    showSpinnerInsteadOf("settings-bar-container", "thumbnail-spinner", false);
}

async function manageArticleState() {
    const containerArticleSummaries = await getContainerizedArticles();

    const articleState: ArticleState = {
        date: new Date().toISOString(),
        articles: containerArticleSummaries,
    };

    await setArticleStateToStorage(articleState);
}

async function addEventListenersForButtons() {
    const hotButton = document.querySelector("#sort-hot-button");
    const coldButton = document.querySelector("#sort-cold-button");
    const standardButton = document.querySelector("#sort-standard-button");
    const showVoteButton = document.querySelector("#show-vote-button");
    const searchInput = document.querySelector("#search-input");
    const commentsButton = document.querySelector("#sort-comments-button");

    hotButton.addEventListener("click", async () => {
        await sortThumbnails(SortingOrder.Descending);
        selectCorrectButton(SortingOrder.Descending);
    });

    coldButton.addEventListener("click", async () => {
        await sortThumbnails(SortingOrder.Ascending);
        selectCorrectButton(SortingOrder.Ascending);
    });

    standardButton.addEventListener("click", async () => {
        await sortThumbnails(SortingOrder.Standard);
        selectCorrectButton(SortingOrder.Standard);
    });

    showVoteButton.addEventListener("click", async (e) => {
        const target = e.target as Element;
        await shouldShowVoting(!isButtonSelected(target));
    });

    searchInput.addEventListener("keyup", async (event) => {
        const target = event.target as HTMLTextAreaElement;
        const value = target.value;

        await searchFilter(value);
    });

    commentsButton.addEventListener("click", async () => {
        await sortThumbnails(SortingOrder.Comments);
        selectCorrectButton(SortingOrder.Comments);
    });
}

function addButtonsToWebpage() {
    const bar = document.querySelector("f-bar-options");

    // add settings bar
    const pluginSettingsBar = document.createElement("div");
    pluginSettingsBar.classList.add("settings-bar");
    pluginSettingsBar.id = "settings-bar";
    pluginSettingsBar.textContent = "Feber Enhancer";

    const pluginSettingsBarContainer = document.createElement("div");
    pluginSettingsBarContainer.id = "settings-bar-container";
    pluginSettingsBarContainer.classList.add("settings-bar-container");
    pluginSettingsBar.appendChild(pluginSettingsBarContainer);

    const spinner = getSpinnerElement("thumbnail-spinner");
    pluginSettingsBar.appendChild(spinner);
    insertAfter(pluginSettingsBar, bar);

    // Sort hot button
    const sortHot = createButton("sort-hot-button", "Heta först", [
        "feberhot",
        "menu-item",
    ]);

    // sort cold button
    const sortCold = createButton("sort-cold-button", "Kalla först", [
        "febercold",
        "menu-item",
    ]);

    // sort standard button
    const sortStandard = createButton("sort-standard-button", "Standard", [
        "button-selected",
        "menu-item",
    ]);

    // sort comments button
    const sortComments = createButton("sort-comments-button", "Kommentarer", [
        "menu-item",
    ]);

    // separator
    const separator = document.createElement("div");
    separator.classList.add("separator");

    // show voting button
    const showVoteButton = createButton("show-vote-button", "Visa röstning", [
        "menu-item",
    ]);

    // search filter
    const searchFilter = document.createElement("input");
    searchFilter.type = "text";
    searchFilter.id = "search-input";
    searchFilter.classList.add("menu-item", "feber-input");
    searchFilter.placeholder = "Sök";

    pluginSettingsBarContainer.appendChild(sortHot);
    pluginSettingsBarContainer.appendChild(sortStandard);
    pluginSettingsBarContainer.appendChild(sortComments);
    pluginSettingsBarContainer.appendChild(sortCold);
    pluginSettingsBarContainer.appendChild(separator);
    pluginSettingsBarContainer.appendChild(showVoteButton);
    pluginSettingsBarContainer.appendChild(separator.cloneNode(true));
    pluginSettingsBarContainer.appendChild(searchFilter);

    showSpinnerInsteadOf("settings-bar-container", "thumbnail-spinner", true);
}
