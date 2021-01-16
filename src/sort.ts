interface ArticleSummary {
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

export function sortArticles(sortingOrder: SortingOrder) {
    const containers = document.getElementsByClassName("basicContainer");

    for (let collection of containers) {
        const articles = collection.getElementsByTagName("f-basic");

        const articleSummaries = getArticleSummaries(articles);

        collection.innerHTML = "";

        const sortedArticles = sort(articleSummaries, sortingOrder);

        for (let article of sortedArticles) {
            let articleElement = createArticleElement(article);

            collection.appendChild(articleElement);
        }
    }
}

function getArticleSummaries(articles: HTMLCollectionOf<Element>) {
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
