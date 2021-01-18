import { ArticleSummary, FilterOptions } from "../models/interfaces";
import {
    getAllTextInArticle,
    getSummaryFromArticleId,
    shouldHideElement,
} from "./helpers";
import { getArticleId } from "./scrape-service";
import {
    getArticleStateFromStorage,
    getExtraArticleStateFromStorage,
} from "./storage-service";

export async function filterBy(options: FilterOptions) {
    const allArticles = document.getElementsByTagName("f-basic");
    const standardArticleSummaries = await (await getArticleStateFromStorage())
        .articles;
    const temporaryArticleSummaries = await getExtraArticleStateFromStorage();

    const mergedArticleSummaries = standardArticleSummaries.concat(
        temporaryArticleSummaries
    );

    options = getMissingValues(options);

    for (let article of allArticles) {
        const id = getArticleId(article);
        const summary = getSummaryFromArticleId(id, mergedArticleSummaries);

        const queryExists = getQueryExists(options.query, summary);
        const authorExists = getAuthorExists(options.author, summary);

        if (queryExists === true && authorExists === true) {
            shouldHideElement(article, false);
            continue;
        }

        shouldHideElement(article, true);
    }
}

function getMissingValues(options: FilterOptions) {
    const searchInput = document.querySelector(
        "#search-input"
    ) as HTMLTextAreaElement;
    const selectAuthor = document.querySelector(
        "#select-author"
    ) as HTMLSelectElement;

    const newQuery = searchInput.value;
    const newAuthor = selectAuthor.value;

    if (newQuery) {
        options.query = newQuery;
    }

    if (newAuthor) {
        options.author = newAuthor;
    }

    return options;
}

function getQueryExists(
    query: string,
    summary: ArticleSummary
): boolean | null {
    if (query == null) {
        return true;
    }

    const allText = getAllTextInArticle(summary);
    return allText.includes(query.toLowerCase());
}

function getAuthorExists(
    author: string,
    summary: ArticleSummary
): boolean | null {
    if (author == null) {
        return null;
    }

    if (author === "all") {
        return true;
    }

    return summary.author.toLowerCase() === author.toLowerCase();
}
