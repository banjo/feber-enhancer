import { SortingOrder } from "../models/enums";
import { ArticleSummary, Attribute } from "../models/interfaces";
import { deselectButton, selectButton } from "./helpers";
import {
    getThumbnailSettingsStateFromStorage,
    setThumbnailSettingsStateToStorage,
} from "./storage-service";

export function getContainerizedArticles() {
    const containers = document.getElementsByClassName("basicContainer");

    const containerArticleSummaries = [] as ArticleSummary[][];

    for (let collection of containers) {
        const articleSummaries = getArticleSummaries(collection);
        containerArticleSummaries.push(articleSummaries);
    }
    return containerArticleSummaries;
}

export function selectCorrectButton(sortingOrder: SortingOrder) {
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

export function getArticleSummaries(collection: Element) {
    const articles = collection.getElementsByTagName("f-basic");

    const articlesSummaries: ArticleSummary[] = [];

    let indexOfArticle = 0;
    for (let article of articles) {
        let attributes = getAttributes(article);

        let articleSummary: ArticleSummary = {
            html: article.innerHTML,
            index: indexOfArticle,
            temperature: Number(article.getAttribute("data-temp")),
            attributes: attributes,
        };

        articlesSummaries.push(articleSummary);

        indexOfArticle++;
    }

    return articlesSummaries;
}

export function getAttributes(article: Element) {
    let attributes = [] as Attribute[];
    for (let attribute of article.attributes) {
        attributes.push({
            name: attribute.name,
            value: attribute.value,
        });
    }
    return attributes;
}

export function createArticleElement(article: ArticleSummary) {
    let articleElement = document.createElement("f-basic");
    articleElement.innerHTML = article.html;

    for (let attribute of article.attributes) {
        articleElement.setAttribute(attribute.name, attribute.value);
    }
    return articleElement;
}

export async function shouldShowVoting(showVoting: boolean) {
    const voteUps = document.querySelectorAll(".tempUP");
    const voteDowns = document.querySelectorAll(".tempDOWN");

    const display = showVoting ? "display: block;" : "display: none;";

    for (let up of voteUps) {
        up.setAttribute("style", display);
    }

    for (let down of voteDowns) {
        down.setAttribute("style", display);
    }

    const currentSettings = await getThumbnailSettingsStateFromStorage();
    currentSettings.showVotes = showVoting;
    setThumbnailSettingsStateToStorage(currentSettings);

    shouldShowVoteButtonPressed(showVoting);
}

function shouldShowVoteButtonPressed(showVote: boolean) {
    const button = document.querySelector("#showVoteButton");

    if (showVote) {
        selectButton(button);
        return;
    }

    deselectButton(button);
}
