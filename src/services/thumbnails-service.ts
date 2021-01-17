import { SortingOrder } from "../models/enums";
import { ArticleSummary } from "../models/interfaces";
import { deselectButton, selectButton } from "./helpers";
import {
    getAttributes,
    getScrapedHtml,
    getTemp,
    getTime,
    getUrl,
    scrapeArticlesFromThumbnails,
} from "./scrape-service";
import {
    getThumbnailSettingsStateFromStorage,
    setThumbnailSettingsStateToStorage,
} from "./storage-service";

export async function getContainerizedArticles() {
    const containers = document.getElementsByClassName("basicContainer");
    let scrapedArticles = await scrapeArticlesFromThumbnails(containers);

    const containerArticleSummaries = await getArticleSummaries(
        containers,
        scrapedArticles
    );

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

async function getArticleSummaries(
    containers: HTMLCollectionOf<Element>,
    scraped: Promise<Response>[]
) {
    const containerArticleSummaries = [] as ArticleSummary[][];

    let collectionNumber = 0;
    let scrapeNumber = 0;
    for (let collection of containers) {
        const articles = collection.getElementsByTagName("f-basic");

        const articlesSummaries: ArticleSummary[] = [];

        let indexOfArticle = 0;
        for (let article of articles) {
            const scrapedHtml = await getScrapedHtml(scraped[scrapeNumber]);

            let articleSummary: ArticleSummary = {
                html: article.innerHTML,
                index: indexOfArticle,
                temperature: getTemp(article),
                attributes: getAttributes(article),
                time: getTime(scrapedHtml),
                url: getUrl(article),
                scrapedHtml: scrapedHtml,
                collectionNumber: collectionNumber,
            };

            articlesSummaries.push(articleSummary);

            scrapeNumber++;
            indexOfArticle++;
        }

        containerArticleSummaries.push(articlesSummaries);
        collectionNumber++;
    }

    return containerArticleSummaries;
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

export function showSettingsBar(shouldShow: boolean) {
    const pluginSettingsBar = document.querySelector("#settings-bar");

    if (shouldShow) {
        pluginSettingsBar.removeAttribute("style");
        return;
    }

    pluginSettingsBar.setAttribute("style", "display: none;");
}
