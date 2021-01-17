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
}

export interface Attribute {
    name: string;
    value: string;
}

export interface ThumbnailSettingsState {
    sorting: SortingOrder;
    showVotes: boolean;
}
