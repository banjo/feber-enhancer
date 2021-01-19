import { SortingOrder } from "./enums";

export interface ArticleState {
    date: string;
    articles: ArticleSummary[][];
}

export interface ArticleSummary {
    html: string;
    index: number;
    temperature: number;
    attributes: Attribute[];
    url: string;
    time: number;
    collectionNumber: number;
    articleId: number;
    author: string;
    mainTitle: string;
    subTitle: string;
    comments: number;
    bodyText: string[];
}

export interface Attribute {
    name: string;
    value: string;
}

export interface ThumbnailSettingsState {
    sorting: SortingOrder;
    showVotes: boolean;
    infiniteScroll: boolean;
}

export interface FilterOptions {
    query?: string;
    author?: string;
}
