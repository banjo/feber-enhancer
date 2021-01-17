import { ArticleState, ThumbnailSettingsState } from "../models/interfaces";

export function setThumbnailSettingsStateToStorage(
    settings: ThumbnailSettingsState
) {
    chrome.storage.local.set({ thumbnailSettings: settings });
}

export async function getThumbnailSettingsStateFromStorage(): Promise<ThumbnailSettingsState> {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get("thumbnailSettings", function (value) {
                resolve(value.thumbnailSettings);
            });
        } catch (ex) {
            reject(ex);
        }
    });
}

export function setArticleStateToStorage(thumbnails: ArticleState) {
    chrome.storage.local.set({ thumbnails: thumbnails });
}

export function getArticleStateFromStorage(): Promise<ArticleState> {
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
