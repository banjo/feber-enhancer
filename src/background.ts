function injectCss() {
    var link = document.createElement("link");
    link.href = "../enhancer.css";
    link.type = "text/css";
    link.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(link);
    console.log("css injected");
}

injectCss();
