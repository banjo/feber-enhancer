import { ArticleState } from "./helpers";
import { getThumbnailStateFromStorage, setSortingToStorage } from "./storage";

export interface ArticleSummary {
    html: string;
    index: number;
    temperature: number;
    attributes: Attribute[];
}

interface Attribute {
    name: string;
    value: string;
}

export enum SortingOrder {
    Descending = 1,
    Ascending = 2,
    Standard = 3,
}

export async function sortArticles(sortingOrder: SortingOrder) {
    setSortingToStorage(sortingOrder);

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
    const state = await getThumbnailStateFromStorage();

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

function createArticleElement(article: ArticleSummary) {
    let articleElement = document.createElement("f-basic");
    articleElement.innerHTML = article.html;

    for (let attribute of article.attributes) {
        articleElement.setAttribute(attribute.name, attribute.value);
    }
    return articleElement;
}

function getAttributes(article: Element) {
    let attributes = [] as Attribute[];
    for (let attribute of article.attributes) {
        attributes.push({
            name: attribute.name,
            value: attribute.value,
        });
    }
    return attributes;
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
