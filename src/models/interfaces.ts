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
    scrapedHtml: string;
    collectionNumber: number;
}

export interface Attribute {
    name: string;
    value: string;
}

export interface ThumbnailSettingsState {
    sorting: SortingOrder;
    showVotes: boolean;
}
