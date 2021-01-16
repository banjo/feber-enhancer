import * as moment from "moment";

let count = 0;

$(function () {
    const queryInfo = {
        active: true,
        currentWindow: true,
    };

    chrome.tabs.query(queryInfo, function (tabs) {
        document.querySelector("#url").innerHTML = tabs[0].url;
        document.querySelector("#time").innerHTML = moment().format(
            "YYYY-MM-DD HH:mm:ss"
        );
    });

    chrome.browserAction.setBadgeText({ text: count.toString() });

    document.querySelector("#countUp").addEventListener("click", () => {
        chrome.browserAction.setBadgeText({
            text: (++count).toString(),
        });
    });

    document.querySelector("#sort").addEventListener("click", () => {
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {
                        sortDescending: $("#sortDescending").is(":checked"),
                    },
                    function (msg) {
                        console.log("result message:", msg);
                    }
                );
            }
        );
    });
});
