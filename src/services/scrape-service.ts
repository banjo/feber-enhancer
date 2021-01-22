import { ArticleSummary, Attribute } from "../models/interfaces";
import { getDayAfter, getDayBefore, insertAfter } from "./helpers";
import {
    getArticleStateFromStorage,
    getExtraArticleStateFromStorage,
    setArticleStateToStorage,
    setExtraArticleStateToStorage,
} from "./storage-service";
import {
    createArticleElement,
    getArticleSummaries,
} from "./thumbnails-service";

export async function scrapeArticlesFromThumbnails(
    containers: HTMLCollectionOf<Element>
) {
    let allUrls: string[] = [];

    for (let collection of containers) {
        const articles = collection.getElementsByTagName("f-basic");
        for (let article of articles) {
            let url = getUrl(article);

            if (url.includes("tjock.se")) {
                url = null;
            }

            allUrls.push(url);
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
    const href = nextPageButton.querySelector("a").getAttribute("href");
    const link = window.location.href + href;

    const response = await fetch(link);
    const html = await response.text();

    const dom = createElementFromString(html);

    const daysOnNextPage = getDaysOnNextPage(dom);
    const containerArticleSummariesOnNextPage = await getContainerArticleSummariesOnNextPage(
        dom
    );

    const lastDayOnCurrentPage = getLastDayOnCurrentPage();

    const containersOnCurrentPage = document.getElementsByClassName(
        "basicContainer"
    );
    let lastContainer =
        containersOnCurrentPage[containersOnCurrentPage.length - 1];

    const currentArticleSummaries = await (await getArticleStateFromStorage())
        .articles;
    const newArticleSummaries: ArticleSummary[][] =
        (await getExtraArticleStateFromStorage()) || [];

    let i = 0;
    const firstDayOnNextPage = daysOnNextPage[i];
    if (lastDayOnCurrentPage === firstDayOnNextPage) {
        containerArticleSummariesOnNextPage[i].forEach((summary) => {
            const article = createArticleElement(summary);
            lastContainer.appendChild(article);
            currentArticleSummaries[currentArticleSummaries.length - 1].push(
                summary
            );
        });
        i++;
    }

    for (i; i < containerArticleSummariesOnNextPage.length; i++) {
        const newDateHeader = document.createElement("header");
        newDateHeader.classList.add("date");
        newDateHeader.textContent = daysOnNextPage[i];

        const newContainer = document.createElement("div");
        newContainer.className = "puffContainer basicContainer after";

        const newSummaryForTheDay: ArticleSummary[] = [];
        containerArticleSummariesOnNextPage[i].forEach((summary) => {
            const article = createArticleElement(summary);
            newContainer.appendChild(article);
            newSummaryForTheDay.push(summary);
        });

        newArticleSummaries.push(newSummaryForTheDay);

        insertAfter(newDateHeader, lastContainer);
        insertAfter(newContainer, newDateHeader);
        lastContainer = newContainer;
    }

    setExtraArticleStateToStorage(newArticleSummaries);
    setArticleStateToStorage({
        date: new Date().toISOString(),
        articles: currentArticleSummaries,
    });
}

function getLastDayOnCurrentPage() {
    const dateHeadersOnCurrentPage = document.querySelectorAll(`.date`);
    const lastDateHeader =
        dateHeadersOnCurrentPage[dateHeadersOnCurrentPage.length - 1];

    const lastDay = lastDateHeader.textContent.trim().toLowerCase();
    return lastDay;
}

async function getContainerArticleSummariesOnNextPage(dom: Document) {
    const containersOnNextPage = dom.getElementsByClassName("basicContainer");
    let scrapedArticles = await scrapeArticlesFromThumbnails(
        containersOnNextPage
    );

    const containerArticleSummariesOnNextPage = await getArticleSummaries(
        containersOnNextPage,
        scrapedArticles
    );
    return containerArticleSummariesOnNextPage;
}

function getDaysOnNextPage(dom: Document) {
    const dateHeadersOnNewPage = dom.querySelectorAll(".date");

    const daysOnNextPage = [];
    const firstDayOnNewPage = getDayAfter(
        dateHeadersOnNewPage[0].textContent.trim().toLowerCase()
    );

    daysOnNextPage.push(firstDayOnNewPage); // the day that is not shown

    dateHeadersOnNewPage.forEach((date) => {
        daysOnNextPage.push(date.textContent.trim().toLowerCase());
    });
    return daysOnNextPage;
}
