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
        flatCards: false,
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

export function getModernArticleHtml() {
    return `
<div class="top-card">
    <img src="https://static.feber.se/article_images/50/75/10/507510_1280.jpg" alt="" class="article-image" />
    <div class="temp-box">
        <p class="temperature noselect">45.2</p>
    </div>
</div>

<div class="bottom-card">
    <p class="category">Spel</p>

    <a>
        <h2 class="title">Microsoft ångrar sig kring Xbox Live-prissättningen</h2>
        <p class="sub-title">Gör en pudel</p>
    </a>

    <div class="card-footer">
        <p class="author">Frode Wikesjö</p>
        <div class="box comments">15</div>
        <div class="box cold-box"> - </div>
        <div class="box hot-box">
            <span>+</span>
        </div>
    </div>
</div>
`;
}

export function getTemperatureStyling(temp: string) {
    if (temp.startsWith("-") && temp.length === 4) {
        const beforeDot = temp.slice(0, 3);
        const afterDot = temp.slice(3);

        return beforeDot + "." + afterDot + "°";
    }

    if (temp.startsWith("-") && temp.length === 5) {
        const beforeDot = temp.slice(0, 4);
        const afterDot = temp.slice(4);

        return beforeDot + "." + afterDot + "°";
    }

    if (temp.length === 3) {
        const beforeDot = temp.slice(0, 2);
        const afterDot = temp.slice(2);

        return beforeDot + "." + afterDot + "°";
    }

    if (temp.length === 4) {
        const beforeDot = temp.slice(0, 3);
        const afterDot = temp.slice(3);

        return beforeDot + "." + afterDot + "°";
    }
}

export function getOnClickForUrl(url: string) {
    return `gtag('event', 'fromBasic', { 'event_category' : 'Click', 'event_label' : '${url}' });`;
}

export function toggleButton(button: Element): boolean {
    const isSelected = button.classList.contains("button-selected");

    if (isSelected) {
        button.classList.remove("button-selected");
    } else {
        button.classList.add("button-selected");
    }

    return !isSelected;
}
