import { SortingOrder } from "../models/enums";
import { ArticleSummary } from "../models/interfaces";
import {
    getArticleStateFromStorage,
    getThumbnailSettingsStateFromStorage,
    setThumbnailSettingsStateToStorage,
} from "./storage-service";
import { createArticleElement } from "./thumbnails-service";

export async function sortThumbnails(sortingOrder: SortingOrder) {
    const currentSettings = await getThumbnailSettingsStateFromStorage();
    currentSettings.sorting = sortingOrder;

    setThumbnailSettingsStateToStorage(currentSettings);

    const containers = document.getElementsByClassName("basicContainer");
    const articleState = await getArticleStateFromStorage();

    let i = 0;
    for (let collection of containers) {
        const articleSummaries = articleState.articles[i];

        collection.innerHTML = "";

        const sortedArticles = sort(articleSummaries, sortingOrder);

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
        (a: ArticleSummary, b: ArticleSummary) => b.time - a.time
    );
}
