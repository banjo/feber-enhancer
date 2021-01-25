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
    getInitialHtmlState,
    getThumbnailSettingsStateFromStorage,
    setArticleStateToStorage,
    setExtraArticleStateToStorage,
    setInitialHtmlState,
    setThumbnailSettingsStateToStorage,
} from "./services/storage-service";
import { ArticleState, FilterOptions } from "./models/interfaces";
import { SortingOrder } from "./models/enums";
import {
    createNewNextButtonAndReplaceOld,
    getAllAuthors,
    getContainerizedArticles,
    handleFlatCardButtonClick,
    handleScrollButtonChange,
    selectCorrectButton,
    shouldShowVoting,
} from "./services/thumbnails-service";
import { filterBy } from "./services/filter-service";
import { getNextPage } from "./services/scrape-service";

(async () => {
    await initializeThumbnailsPage();
})();

async function changeBackToDisabledExtension() {
    const html = await getInitialHtmlState();
    document.querySelector("body").innerHTML = html;
}

async function initializeThumbnailsPage() {
    try {
        const extensionEnabled = await initSettings();

        if (!extensionEnabled) {
            return;
        }

        await addButtonsToWebpage();
        hideOriginalSettingsBar();

        await manageArticleState();

        await initFields();

        await addEventListenersForButtons();
        await finishLoad();
    } catch (e) {
        console.error(e);
    }
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

    if (settings.flatCards) {
        const showVoteButton = document.querySelector("#show-vote-button");
        const flatCardButton = document.querySelector("#flat-card-button");
        flatCardButton.classList.add("button-selected");
        shouldHideElement(showVoteButton, true);
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
        return false;
    }

    if (document.querySelectorAll("f-square").length > 0) {
        settings.isNewFeberDesign = true;
    }

    const cloneHtml = document.querySelector("body").innerHTML;

    setThumbnailSettingsStateToStorage(settings);
    setInitialHtmlState(cloneHtml);
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
    const flatCardButton = document.querySelector("#flat-card-button");

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

    flatCardButton.addEventListener("click", async () => {
        await handleFlatCardButtonClick(flatCardButton);
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

    const settings = await getThumbnailSettingsStateFromStorage();
    let scrapeStarted = false;

    if (settings.isNewFeberDesign) {
        return;
    }

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

async function addButtonsToWebpage() {
    const settings = await getThumbnailSettingsStateFromStorage();
    const barTag = settings.isNewFeberDesign
        ? "f-bar-optionscontainer"
        : "f-bar-options";

    const bar = document.querySelector(barTag);

    // add settings bar
    const pluginSettingsBar = document.createElement("div");
    pluginSettingsBar.classList.add("settings-bar");
    pluginSettingsBar.id = "settings-bar";

    if (settings.isNewFeberDesign) {
        pluginSettingsBar.classList.add("new-feber-design-color");
    }

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

    // flat card button
    const flatCardButton = createButton("flat-card-button", "Ändra design", [
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

    const switchContainer = createBarContainer("switch-container", [
        showVoteButton,
        scrollButton,
    ]);

    pluginSettingsBarContainer.appendChild(sortContainer);
    pluginSettingsBarContainer.appendChild(separator);
    pluginSettingsBarContainer.appendChild(switchContainer);
    pluginSettingsBarContainer.appendChild(separator.cloneNode(true));
    pluginSettingsBarContainer.appendChild(flatCardButton);
    pluginSettingsBarContainer.appendChild(separator.cloneNode(true));
    pluginSettingsBarContainer.appendChild(searchFilter);
    pluginSettingsBarContainer.appendChild(separator.cloneNode(true));
    pluginSettingsBarContainer.appendChild(selectAuthor);

    showSpinnerInsteadOf("settings-bar-container", "thumbnail-spinner", true);
}
