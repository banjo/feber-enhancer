export function createButton(
    id: string,
    text: string,
    classes: string[]
): HTMLDivElement {
    const button = document.createElement("div");
    button.classList.add("settings-button");
    const span = document.createElement("span");
    button.id = id;
    span.textContent = text;

    for (let c of classes) {
        button.classList.add(c);
    }

    button.appendChild(span);
    return button;
}

export function insertAfter(newNode: Element, referenceNode: Element) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
