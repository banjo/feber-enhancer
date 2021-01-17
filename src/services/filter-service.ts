import { getArticleStateFromStorage } from "./storage-service";

export async function searchFilter(query: string) {
    const allArticles = document.getElementsByTagName("f-basic");
    const articleSummaries = await (await getArticleStateFromStorage())
        .articles;

    console.log(articleSummaries);

    for (let article of allArticles) {
    }

    console.log(allArticles);
}
