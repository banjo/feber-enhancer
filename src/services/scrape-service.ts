import { Attribute } from "../models/interfaces";

export async function scrapeArticlesFromThumbnails(
    containers: HTMLCollectionOf<Element>
) {
    const allUrls = [];

    for (let collection of containers) {
        const articles = collection.getElementsByTagName("f-basic");
        for (let article of articles) {
            allUrls.push(getUrl(article));
        }
    }

    const promises = allUrls.map((url) => fetch(url));

    await Promise.all(promises);

    return promises;
}

export async function getScrapedHtml(response: Promise<Response>) {
    const data = await response;
    return await data.text();
}

export function createElementFromString(htmlString: string) {
    const parser = new DOMParser();
    const DOM = parser.parseFromString(htmlString, "text/html");
    return DOM;
}

export function getTime(htmlString: string) {
    const DOM = createElementFromString(htmlString);
    const time = DOM.querySelector("article").getAttribute("time");

    return Number(time);
}

export function getBodyText(htmlString: string) {
    const DOM = createElementFromString(htmlString);
    const bodyText = DOM.querySelector(".text");

    const mergedText = Array.from(bodyText.children, ({ textContent }) =>
        textContent.trim()
    );

    return mergedText;
}

export function getAuthor(htmlString: string) {
    const DOM = createElementFromString(htmlString);
    const author = DOM.querySelector("footer")
        .querySelector("img")
        .getAttribute("alt");

    return author;
}

export function getMainTitle(article: Element) {
    const title = article.querySelector("h1").querySelector("b").innerText;

    return title;
}

export function getSubTitle(article: Element) {
    const subTitle = article.querySelector("h1").querySelectorAll("a")[1]
        .textContent;

    return subTitle;
}

export function getComments(article: Element) {
    const commentCount = article.querySelector(".disqus-comment-count")
        .textContent;

    return Number(commentCount);
}

export function getUrl(article: Element) {
    const url = article.querySelector("a").href;
    return url;
}

export function getTemp(article: Element) {
    return Number(article.getAttribute("data-temp"));
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

export function getArticleId(article: Element) {
    const idWithText = article.getAttribute("id");
    const id = idWithText.replace("ArticleBasic_", "");

    return Number(id);
}
