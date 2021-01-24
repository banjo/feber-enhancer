import { SortingOrder } from "../models/enums";
import { ArticleSummary, FilterOptions } from "../models/interfaces";
import { filterBy } from "./filter-service";
import {
    deselectButton,
    getModernArticleHtml,
    getOnClickForUrl,
    getSpinnerElement,
    getTemperatureStyling,
    insertAfter,
    selectButton,
    shouldHideElement,
    showSpinnerInsteadOf,
} from "./helpers";
import {
    createElementFromString,
    getArticleId,
    getAttributes,
    getAuthor,
    getBodyText,
    getCategory,
    getComments,
    getImage,
    getMainTitle,
    getScrapedHtml,
    getSubTitle,
    getTemp,
    getTemperatureStatus,
    getTime,
    getUrl,
    scrapeArticlesFromThumbnails,
} from "./scrape-service";
import {
    getArticleStateFromStorage,
    getThumbnailSettingsStateFromStorage,
    setThumbnailSettingsStateToStorage,
} from "./storage-service";

export async function getContainerizedArticles() {
    const containers = document.getElementsByClassName("basicContainer");
    let scrapedArticles = await scrapeArticlesFromThumbnails(containers);

    const containerArticleSummaries = await getArticleSummaries(
        containers,
        scrapedArticles
    );

    return containerArticleSummaries;
}

export function selectCorrectButton(sortingOrder: SortingOrder) {
    const hotButton = document.querySelector("#sort-hot-button");
    const coldButton = document.querySelector("#sort-cold-button");
    const standardButton = document.querySelector("#sort-standard-button");
    const commentsButton = document.querySelector("#sort-comments-button");

    if (sortingOrder === SortingOrder.Standard) {
        hotButton.classList.remove("button-selected");
        coldButton.classList.remove("button-selected");
        commentsButton.classList.remove("button-selected");
        standardButton.classList.add("button-selected");
    }

    if (sortingOrder === SortingOrder.Ascending) {
        hotButton.classList.remove("button-selected");
        standardButton.classList.remove("button-selected");
        commentsButton.classList.remove("button-selected");
        coldButton.classList.add("button-selected");
    }

    if (sortingOrder === SortingOrder.Descending) {
        hotButton.classList.add("button-selected");
        standardButton.classList.remove("button-selected");
        commentsButton.classList.remove("button-selected");
        coldButton.classList.remove("button-selected");
    }

    if (sortingOrder === SortingOrder.Comments) {
        hotButton.classList.remove("button-selected");
        coldButton.classList.remove("button-selected");
        standardButton.classList.remove("button-selected");
        commentsButton.classList.add("button-selected");
    }
}

export async function getAllAuthors() {
    const state = await getArticleStateFromStorage();
    const allAuthors = getAllAuthorsFromArticles(state.articles);

    return allAuthors;
}

function getAllAuthorsFromArticles(summaries: ArticleSummary[][]) {
    const authors: string[] = [];

    for (let collection of summaries) {
        for (let summary of collection) {
            if (!authors.includes(summary.author)) {
                authors.push(summary.author);
            }
        }
    }

    return authors;
}

export async function getArticleSummaries(
    containers: HTMLCollectionOf<Element>,
    scraped: Promise<Response>[]
) {
    const containerArticleSummaries = [] as ArticleSummary[][];

    let collectionNumber = 0;
    let scrapeNumber = 0;
    for (let collection of containers) {
        const articles = collection.getElementsByTagName("f-basic");

        const articlesSummaries: ArticleSummary[] = [];

        let indexOfArticle = 0;
        for (let article of articles) {
            const url = getUrl(article);

            try {
                const scrapedHtml = await getScrapedHtml(scraped[scrapeNumber]);
                const fullArticle = createElementFromString(scrapedHtml);

                const { isHot, isCold } = getTemperatureStatus(article);

                let articleSummary: ArticleSummary = {
                    html: article.innerHTML,
                    index: indexOfArticle,
                    temperature: getTemp(article),
                    attributes: getAttributes(article),
                    time: getTime(fullArticle),
                    url: url,
                    collectionNumber: collectionNumber,
                    articleId: getArticleId(article),
                    author: getAuthor(fullArticle),
                    mainTitle: getMainTitle(article),
                    subTitle: getSubTitle(article),
                    comments: getComments(article),
                    bodyText: getBodyText(fullArticle),
                    imageSrc: getImage(article),
                    isHot,
                    isCold,
                    category: getCategory(article),
                };

                articlesSummaries.push(articleSummary);
            } catch (error) {
                console.error(error);
                continue;
            }

            scrapeNumber++;
            indexOfArticle++;
        }

        containerArticleSummaries.push(articlesSummaries);
        collectionNumber++;
    }

    return containerArticleSummaries;
}

export function createArticleElement(article: ArticleSummary) {
    let articleElement = document.createElement("f-basic");
    articleElement.innerHTML = article.html;

    for (let attribute of article.attributes) {
        articleElement.setAttribute(attribute.name, attribute.value);
    }
    return articleElement;
}

export function createModernArticleElement(article: ArticleSummary) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = getModernArticleHtml();

    // TODO fix: temperature styling, animations, button links, voting
    card.querySelector(".temperature").textContent = getTemperatureStyling(
        article.temperature.toString()
    );

    const title = card.querySelector(".title");
    title.textContent = article.mainTitle;
    title.parentElement.setAttribute("href", article.url);
    title.parentElement.setAttribute("onclick", getOnClickForUrl(article.url));

    card.querySelector(".sub-title").textContent = article.subTitle;
    card.querySelector(".author").textContent = article.author;
    card.querySelector(".comments").textContent = article.comments.toString();
    card.querySelector("img").src = article.imageSrc;

    if (article.isCold) {
        card.querySelector(".temp-box").classList.add("cold-box");
        card.querySelector(".sub-title").classList.add("febercold");
    }

    if (article.isHot) {
        card.querySelector(".temp-box").classList.add("hot-box");
        card.querySelector(".sub-title").classList.add("feberhot");
    }

    return card;
}

export async function shouldShowVoting(showVoting: boolean) {
    let voteUps = document.querySelectorAll(".tempUP");
    let voteDowns = document.querySelectorAll(".tempDOWN");

    const display = showVoting ? "display: block;" : "display: none;";

    for (let up of voteUps) {
        up.setAttribute("style", display);
    }

    for (let down of voteDowns) {
        down.setAttribute("style", display);
    }

    const currentSettings = await getThumbnailSettingsStateFromStorage();
    currentSettings.showVotes = showVoting;
    setThumbnailSettingsStateToStorage(currentSettings);

    shouldShowVoteButtonPressed(showVoting);
}

function shouldShowVoteButtonPressed(showVote: boolean) {
    const button = document.querySelector("#show-vote-button");

    if (showVote) {
        selectButton(button);
        return;
    }

    deselectButton(button);
}

export function showSettingsBar(shouldShow: boolean) {
    const pluginSettingsBar = document.querySelector("#settings-bar");

    if (shouldShow) {
        pluginSettingsBar.removeAttribute("style");
        return;
    }

    pluginSettingsBar.setAttribute("style", "display: none;");
}

export async function handleSelectAuthor(author: string) {
    const selectAuthor = document.querySelector(
        "#select-author"
    ) as HTMLSelectElement;

    selectAuthor.value = author;

    const options: FilterOptions = { author };

    await filterBy(options);
}

export function createNewNextButtonAndReplaceOld() {
    const oldNextButton = document.querySelector(".nextPage");
    const parent = oldNextButton.parentElement;
    const href = parent.getAttribute("href");
    parent.innerHTML = "";

    const allContainers = document.querySelectorAll(".basicContainer");
    const lastContainer = allContainers[allContainers.length - 1];

    const div = document.createElement("div");
    div.classList.add("nextPage");

    const divContainer = document.createElement("div");
    divContainer.id = "next-page-button-container";
    div.appendChild(divContainer);

    const text = document.createElement("a");
    text.id = "next-page-link";
    text.text = "Nästa sida";
    text.href = href;
    divContainer.appendChild(text);

    const spinner = getSpinnerElement("next-spinner");
    divContainer.appendChild(spinner);

    insertAfter(div, lastContainer);

    showSpinnerInsteadOf("next-page-link", "next-spinner", false);
    return div;
}

export async function handleScrollButtonChange(scrollButton: Element) {
    const isSelected = scrollButton.classList.contains("button-selected");

    if (isSelected) {
        scrollButton.classList.remove("button-selected");
    } else {
        scrollButton.classList.add("button-selected");
    }

    const settings = await getThumbnailSettingsStateFromStorage();
    settings.infiniteScroll = !isSelected;
    setThumbnailSettingsStateToStorage(settings);
}
