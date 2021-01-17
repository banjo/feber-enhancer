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

export function getTime(htmlString: string) {
    const parser = new DOMParser();
    const DOM = parser.parseFromString(htmlString, "text/html");
    const time = DOM.querySelector("article").getAttribute("time");

    return Number(time);
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
