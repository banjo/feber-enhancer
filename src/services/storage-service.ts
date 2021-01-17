import { SortingOrder } from "../models/enums";
import { ArticleState } from "../models/interfaces";

export function setSortingToStorage(sorting: SortingOrder) {
    chrome.storage.local.set({ sorting: sorting });
}

export async function getSortingFromStorage(): Promise<SortingOrder> {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get("sorting", function (value) {
                resolve(value.sorting);
            });
        } catch (ex) {
            reject(ex);
        }
    });
}

export function setThumbnailStateToStorage(thumbnails: ArticleState) {
    chrome.storage.local.set({ thumbnails: thumbnails });
}

export function getThumbnailStateFromStorage(): Promise<ArticleState> {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get("thumbnails", function (value) {
                resolve(value.thumbnails);
            });
        } catch (ex) {
            reject(ex);
        }
    });
}
