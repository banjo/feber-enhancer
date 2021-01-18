import {
    getAllTextInArticle,
    getSummaryFromArticleId,
    shouldHideElement,
} from "./helpers";
import { getArticleId } from "./scrape-service";
import {
    getArticleStateFromStorage,
    getThumbnailSettingsStateFromStorage,
    setThumbnailSettingsStateToStorage,
} from "./storage-service";

export async function searchFilter(query: string) {
    const allArticles = document.getElementsByTagName("f-basic");
    const articleSummaries = await (await getArticleStateFromStorage())
        .articles;

    for (let article of allArticles) {
        const id = getArticleId(article);
        const summary = getSummaryFromArticleId(id, articleSummaries);
        const allText = getAllTextInArticle(summary);

        if (!allText.includes(query.toLowerCase())) {
            shouldHideElement(article, true);
            continue;
        }

        shouldHideElement(article, false);
    }
}

export async function filterByAuthor(author: string) {
    const allArticles = document.getElementsByTagName("f-basic");
    const articleSummaries = await (await getArticleStateFromStorage())
        .articles;

    for (let article of allArticles) {
        if (author === "all") {
            shouldHideElement(article, false);
            continue;
        }

        const id = getArticleId(article);
        const summary = getSummaryFromArticleId(id, articleSummaries);

        if (summary.author.toLowerCase() !== author.toLowerCase()) {
            shouldHideElement(article, true);
            continue;
        }

        shouldHideElement(article, false);
    }

    const settings = await getThumbnailSettingsStateFromStorage();
    settings.filterByAuthor = author;
    setThumbnailSettingsStateToStorage(settings);
}
