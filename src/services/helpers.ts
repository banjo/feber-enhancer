import { SortingOrder } from "../models/enums";
import { ArticleSummary, ThumbnailSettingsState } from "../models/interfaces";
import {
    getThumbnailSettingsStateFromStorage,
    setThumbnailSettingsStateToStorage,
} from "./storage-service";

export async function loadStorageSettings() {
    const initialSettings: ThumbnailSettingsState = {
        showVotes: false,
        sorting: SortingOrder.Standard,
        infiniteScroll: false,
        isExtensionActive: true,
    };

    const settings = await getThumbnailSettingsStateFromStorage();

    if (!settings) {
        setThumbnailSettingsStateToStorage(initialSettings);
    }

    let updated = false;
    Object.keys(initialSettings).forEach((key) => {
        if (settings[key] == null) {
            settings[key] = initialSettings[key];
            updated = true;
        }
    });

    if (updated) {
        setThumbnailSettingsStateToStorage(settings);
    }
}

export function createButton(
    id: string,
    text: string,
    classes: string[]
): HTMLDivElement {
    const button = document.createElement("div");
    button.classList.add("settings-button");
    button.id = id;
    button.textContent = text;

    for (let c of classes) {
        button.classList.add(c);
    }

    return button;
}

export function createSelect(id: string, classes: string[]): HTMLSelectElement {
    const selectInput = document.createElement("select");
    selectInput.id = id;

    for (let c of classes) {
        selectInput.classList.add(c);
    }

    return selectInput;
}

export function createBarContainer(id: string, elements: Element[]): Element {
    const container = document.createElement("div");
    container.classList.add("category-container");
    container.id = id;

    for (let element of elements) {
        container.appendChild(element);
    }

    return container;
}

export function insertAfter(newNode: Element, referenceNode: Element) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

export function isButtonSelected(button: Element) {
    return button.classList.contains("button-selected");
}

export function selectButton(button: Element) {
    button.classList.add("button-selected");
}

export function deselectButton(button: Element) {
    button.classList.remove("button-selected");
}

export function getSpinnerElement(id: string) {
    const spinner = document.createElement("div");
    spinner.id = id;
    spinner.innerHTML = `<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>`;
    return spinner;
}

export function showSpinnerInsteadOf(
    elementId: string,
    spinnerId: string,
    showSpinner: boolean
) {
    const spinner = document.querySelector(`#${spinnerId}`);
    const element = document.querySelector(`#${elementId}`);

    if (showSpinner) {
        element.setAttribute("style", "display: none;");
        spinner.removeAttribute("style");
        return;
    }

    element.removeAttribute("style");
    spinner.setAttribute("style", "display: none;");
}

export function getSummaryFromArticleId(
    id: number,
    articles: ArticleSummary[][]
) {
    let articleToReturn: null | ArticleSummary = null;

    articles.forEach((collection) => {
        collection.forEach((article) => {
            if (article.articleId === id) {
                articleToReturn = article;
            }
        });
    });

    return articleToReturn;
}

export function getAllTextInArticle(article: ArticleSummary) {
    let text = "";

    text += article.mainTitle + "; ";
    text += article.subTitle + "; ";
    text += article.author + "; ";

    article.bodyText.forEach((p) => {
        text += p + "; ";
    });

    return text.toLowerCase();
}

export function shouldHideElement(element: Element, shouldHide: boolean) {
    if (shouldHide) {
        element.classList.add("hide-element");
        return;
    }

    element.classList.remove("hide-element");
}

export function elementIsHidden(element: Element) {
    return element.classList.contains("hide-element");
}

export function elementInViewPort(element: Element) {
    var rect = element.getBoundingClientRect();
    var viewHeight = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight
    );
    return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

export function getDayBefore(day: string) {
    const days = [
        "måndag",
        "tisdag",
        "onsdag",
        "torsdag",
        "fredag",
        "lördag",
        "söndag",
    ];

    const index = days.indexOf(day);

    if (index === 0) {
        return days[days.length - 1];
    }

    return days[index - 1];
}

export function getDayAfter(day: string) {
    const days = [
        "måndag",
        "tisdag",
        "onsdag",
        "torsdag",
        "fredag",
        "lördag",
        "söndag",
    ];

    const index = days.indexOf(day);

    if (index === days.length - 1) {
        return days[0];
    }

    return days[index + 1];
}
