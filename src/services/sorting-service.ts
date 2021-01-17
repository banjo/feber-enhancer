import { SortingOrder } from "../models/enums";
import { ArticleSummary } from "../models/interfaces";
import {
    getArticleStateFromStorage,
    getThumbnailSettingsStateFromStorage,
    setThumbnailSettingsStateToStorage,
} from "./storage-service";
import {
    createArticleElement,
    getArticleSummaries,
} from "./thumbnails-service";

export async function sortArticles(sortingOrder: SortingOrder) {
    const currentSettings = await getThumbnailSettingsStateFromStorage();
    currentSettings.sorting = sortingOrder;

    setThumbnailSettingsStateToStorage(currentSettings);

    if (sortingOrder === SortingOrder.Standard) {
        sortByArticleState();
        return;
    }

    const containers = document.getElementsByClassName("basicContainer");

    for (let collection of containers) {
        const articleSummaries = getArticleSummaries(collection);

        collection.innerHTML = "";

        const sortedArticles = sort(articleSummaries, sortingOrder);

        for (let article of sortedArticles) {
            let articleElement = createArticleElement(article);

            collection.appendChild(articleElement);
        }
    }
}

async function sortByArticleState() {
    const state = await getArticleStateFromStorage();

    const containers = document.getElementsByClassName("basicContainer");

    let i = 0;
    for (let collection of containers) {
        const articlesForThatDay = state.articles[i];
        const sortedArticles = sort(articlesForThatDay, SortingOrder.Standard);

        collection.innerHTML = "";

        for (let article of sortedArticles) {
            let articleElement = createArticleElement(article);

            collection.appendChild(articleElement);
        }

        i++;
    }
}

function sort(
    articles: ArticleSummary[],
    sortingOrder: SortingOrder
): ArticleSummary[] {
    const newArticles = JSON.parse(JSON.stringify(articles));

    if (sortingOrder === SortingOrder.Descending) {
        return newArticles.sort(
            (a: ArticleSummary, b: ArticleSummary) =>
                b.temperature - a.temperature
        );
    }

    if (sortingOrder === SortingOrder.Ascending) {
        return newArticles.sort(
            (a: ArticleSummary, b: ArticleSummary) =>
                a.temperature - b.temperature
        );
    }

    return newArticles.sort(
        (a: ArticleSummary, b: ArticleSummary) => a.index - b.index
    );
}
