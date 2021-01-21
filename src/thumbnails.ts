import { sortThumbnails } from "./services/sorting-service";
import {
    createBarContainer,
    createButton,
    createSelect,
    elementInViewPort,
    getSpinnerElement,
    insertAfter,
    isButtonSelected,
    loadStorageSettings,
    shouldHideElement,
    showSpinnerInsteadOf,
} from "./services/helpers";
import {
    getThumbnailSettingsStateFromStorage,
    setArticleStateToStorage,
    setExtraArticleStateToStorage,
    setThumbnailSettingsStateToStorage,
} from "./services/storage-service";
import { ArticleState, FilterOptions } from "./models/interfaces";
import { SortingOrder } from "./models/enums";
import {
    createNewNextButtonAndReplaceOld,
    getAllAuthors,
    getContainerizedArticles,
    handleScrollButtonChange,
    selectCorrectButton,
    shouldShowVoting,
} from "./services/thumbnails-service";
import { filterBy } from "./services/filter-service";
import { getNextPage } from "./services/scrape-service";

(async () => {
    await initializeThumbnailsPage();
})();

// when button is clicked in plugin menu
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    sortThumbnails(msg.sortDescending);
});

async function initializeThumbnailsPage() {
    try {
        const extensionEnabled = await initSettings();

        if (!extensionEnabled) {
            return;
        }

        addButtonsToWebpage();
        hideOriginalSettingsBar();
        await manageArticleState();
        await initFields();
        await addEventListenersForButtons();
        await finishLoad();
    } catch (e) {
        console.error(e);
    }
}

async function shouldActivateExtension(shouldBeActive: boolean) {
    const oldBar = document.querySelector("f-bar-options");
    const extensionBar = document.querySelector("#settings-bar");
    const settings = await getThumbnailSettingsStateFromStorage();

    if (shouldBeActive) {
        oldBar.classList.add("hide-element");
        extensionBar.classList.remove("hide-element");

        await sortThumbnails(settings.sorting);
        selectCorrectButton(settings.sorting);
        await shouldShowVoting(settings.showVotes);
    } else {
        oldBar.classList.remove("hide-element");
        extensionBar.classList.add("hide-element");

        // reset all settings
        await sortThumbnails(SortingOrder.Standard);
        selectCorrectButton(SortingOrder.Standard);
        await shouldShowVoting(false);
        const scrollButton = document.querySelector("#infinite-scroll-button");
        scrollButton.classList.remove("button-selected");
        settings.infiniteScroll = false;
    }

    setThumbnailSettingsStateToStorage(settings);
}

function hideOriginalSettingsBar() {
    const bar = document.querySelector("f-bar-options");

    shouldHideElement(bar, true);
}

async function finishLoad() {
    const settings = await getThumbnailSettingsStateFromStorage();

    await sortThumbnails(settings.sorting);
    selectCorrectButton(settings.sorting);

    await shouldShowVoting(settings.showVotes);

    if (settings.infiniteScroll) {
        const scrollButton = document.querySelector("#infinite-scroll-button");
        scrollButton.classList.add("button-selected");
    }

    showSpinnerInsteadOf("settings-bar-container", "thumbnail-spinner", false);
}

async function initFields() {
    // author input
    const selectAuthor = document.querySelector("#select-author");
    const allAuthors = await getAllAuthors();
    const all = new Option("Författare", "all");
    all.selected = true;
    all.disabled = true;
    selectAuthor.appendChild(all);

    allAuthors.forEach((author) => {
        const option = new Option(author, author);
        option.value = author;
        option.text = author;
        selectAuthor.appendChild(option);
    });
}

async function initSettings() {
    await loadStorageSettings();

    const settings = await getThumbnailSettingsStateFromStorage();

    if (!settings.isExtensionActive) {
        shouldActivateExtension(false);
        return false;
    }

    setExtraArticleStateToStorage([]);
    return true;
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
    const selectAuthor = document.querySelector("#select-author");
    const scrollButton = document.querySelector("#infinite-scroll-button");

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

    scrollButton.addEventListener("click", async () => {
        await handleScrollButtonChange(scrollButton);
    });

    searchInput.addEventListener("keyup", async (event) => {
        const target = event.target as HTMLTextAreaElement;
        const query = target.value;

        const options: FilterOptions = { author: null, query };

        await filterBy(options);
    });

    commentsButton.addEventListener("click", async () => {
        await sortThumbnails(SortingOrder.Comments);
        selectCorrectButton(SortingOrder.Comments);
    });

    selectAuthor.addEventListener("change", async () => {
        const defaultOption = selectAuthor.querySelector(
            "option[value='all']"
        ) as HTMLSelectElement;

        const select = selectAuthor as HTMLSelectElement;

        if (select.value === "all") {
            defaultOption.textContent = "Författare";
            defaultOption.disabled = true;
        } else {
            defaultOption.textContent = "Alla";
            defaultOption.disabled = false;
        }

        const options: FilterOptions = { author: select.value };

        await filterBy(options);
    });

    let scrapeStarted = false;
    const newButton = createNewNextButtonAndReplaceOld();
    window.onscroll = async function () {
        if (elementInViewPort(newButton) && !scrapeStarted) {
            const settings = await getThumbnailSettingsStateFromStorage();

            if (!settings.infiniteScroll) {
                return;
            }

            scrapeStarted = true;
            showSpinnerInsteadOf("next-page-link", "next-spinner", true);

            await getNextPage(newButton);
            const href = newButton.querySelector("a").getAttribute("href");
            const increasedValue = Number(href.replace("?p=", "")) + 1;
            const newHref = "?p=" + increasedValue;
            newButton.querySelector("a").setAttribute("href", newHref);

            await sortThumbnails(SortingOrder.Standard);
            selectCorrectButton(SortingOrder.Standard);
            await filterBy({});

            scrapeStarted = false;
            showSpinnerInsteadOf("next-page-link", "next-spinner", false);
        }
    };
}

function addButtonsToWebpage() {
    const bar = document.querySelector("f-bar-options");

    // add settings bar
    const pluginSettingsBar = document.createElement("div");
    pluginSettingsBar.classList.add("settings-bar");
    pluginSettingsBar.id = "settings-bar";

    const settingsBarTitle = document.createElement("div");
    settingsBarTitle.classList.add("settings-bar-title");
    settingsBarTitle.textContent = "Feber Enhancer";
    pluginSettingsBar.appendChild(settingsBarTitle);

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

    // infinite scroll button
    const scrollButton = createButton(
        "infinite-scroll-button",
        "Oändlig skroll",
        ["menu-item"]
    );

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

    // select author
    const selectAuthor = createSelect("select-author", [
        "menu-item",
        "feber-input",
    ]);

    // sort button container
    const sortContainer = createBarContainer("sort-container", [
        sortHot,
        sortCold,
        sortStandard,
        sortComments,
    ]);

    pluginSettingsBarContainer.appendChild(sortContainer);
    pluginSettingsBarContainer.appendChild(separator);
    pluginSettingsBarContainer.appendChild(showVoteButton);
    pluginSettingsBarContainer.appendChild(separator.cloneNode(true));
    pluginSettingsBarContainer.appendChild(scrollButton);
    pluginSettingsBarContainer.appendChild(separator.cloneNode(true));
    pluginSettingsBarContainer.appendChild(searchFilter);
    pluginSettingsBarContainer.appendChild(separator.cloneNode(true));
    pluginSettingsBarContainer.appendChild(selectAuthor);

    showSpinnerInsteadOf("settings-bar-container", "thumbnail-spinner", true);
}
