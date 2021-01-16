import { sortArticles } from "./sort";

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    sortArticles(msg.sortDescending);
});
