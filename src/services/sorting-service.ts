import { SortingOrder } from "../models/enums";
import { ArticleSummary, FilterOptions } from "../models/interfaces";
import { filterBy } from "./filter-service";
import {
    getArticleStateFromStorage,
    getExtraArticleStateFromStorage,
    getThumbnailSettingsStateFromStorage,
    setThumbnailSettingsStateToStorage,
} from "./storage-service";
import {
    createArticleElement,
    createModernArticleElement,
    shouldShowVoting,
} from "./thumbnails-service";

export async function sortThumbnails(sortingOrder: SortingOrder) {
    const currentSettings = await getThumbnailSettingsStateFromStorage();
    currentSettings.sorting = sortingOrder;

    setThumbnailSettingsStateToStorage(currentSettings);

    const containers = document.getElementsByClassName("basicContainer");
    const articleState = await getArticleStateFromStorage();
    const extraArticles = await getExtraArticleStateFromStorage();

    let i = 0;
    let j = 0;
    for (let collection of containers) {
        let articleSummaries = articleState.articles[i];

        collection.setAttribute("style", "justify-items: center;");

        // articles from infinite scroll, with state from another storage
        if (articleSummaries == null) {
            articleSummaries = extraArticles[j];
            j++;
        }

        collection.innerHTML = "";

        if (currentSettings.flatCards) {
            collection.classList.add("flat-cards-container");
        } else {
            collection.classList.remove("flat-cards-container");
        }

        const sortedArticles = sort(articleSummaries, sortingOrder);

        for (let article of sortedArticles) {
            let articleElement;
            if (currentSettings.flatCards) {
                articleElement = createModernArticleElement(article);
            } else {
                articleElement = createArticleElement(article);
            }

            collection.appendChild(articleElement);
        }
        i++;
    }

    await shouldShowVoting(currentSettings.showVotes);

    const options: FilterOptions = {};
    await filterBy(options);
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

    if (sortingOrder === SortingOrder.Comments) {
        return newArticles.sort(
            (a: ArticleSummary, b: ArticleSummary) => b.comments - a.comments
        );
    }

    return newArticles.sort(
        (a: ArticleSummary, b: ArticleSummary) => b.time - a.time
    );
}
