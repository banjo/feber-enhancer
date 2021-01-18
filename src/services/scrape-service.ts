import { Attribute } from "../models/interfaces";
import { getArticleSummaries } from "./thumbnails-service";

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

export function getTime(fullArticle: Document) {
    const time = fullArticle.querySelector("article").getAttribute("time");

    return Number(time);
}

export function getBodyText(fullArticle: Document) {
    const bodyText = fullArticle.querySelector(".text");

    const mergedText = Array.from(bodyText.children, ({ textContent }) =>
        textContent.trim()
    );

    return mergedText;
}

export function getAuthor(fullArticle: Document) {
    const author = fullArticle
        .querySelector("footer")
        .querySelector("img")
        .getAttribute("alt");

    return author;
}

export function getMainTitle(article: Element) {
    const title = article.querySelector("h1").querySelector("b").innerText;

    return title;
}

export function getSubTitle(article: Element) {
    const h1 = article.querySelector("h1");

    const subTitle = h1.querySelectorAll(".feber, .febercold, .feberhot")[0]
        .textContent;

    return subTitle;
}

export function getComments(article: Element) {
    const commentCount = article.querySelector(".disqus-comment-count")
        .textContent;

    return Number(commentCount);
}

// export async function getCommentsContent(fullArticle: Document) {
//     const disqus = fullArticle.querySelector(".showDisqus");

//     const id = disqus.id.replace("showDisqus", "");
//     const forum = "feber";
//     const publicKey =
//         "E8Uh5l5fHZ6gD8U3KycjAIAk46f68Zw7C6eW8WSjZvCLXebZ7p0r1yrYDrLilk2F";

//     const disqusUri = `https://disqus.com/api/3.0/threads/listPosts.json?&api_key=
//         ${publicKey}&thread:ident=${id}&forum=${forum}`;

//     const example =
//         "https://disqus.com/api/3.0/threads/listPosts.json?&api_key=E8Uh5l5fHZ6gD8U3KycjAIAk46f68Zw7C6eW8WSjZvCLXebZ7p0r1yrYDrLilk2F&thread:ident=420397&forum=feber";

//     return [];
// }

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

export async function getNextPage(nextPageButton: Element) {
    console.log(nextPageButton);
    const href = nextPageButton.getAttribute("href");
    const link = window.location.href + href;

    const response = await fetch(link);
    const html = await response.text();

    const dom = createElementFromString(html);

    const containers = dom.getElementsByClassName("basicContainer");
    let scrapedArticles = await scrapeArticlesFromThumbnails(containers);

    const containerArticleSummaries = await getArticleSummaries(
        containers,
        scrapedArticles
    );

    console.log(containerArticleSummaries);
}
