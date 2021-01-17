export function createButton(
    id: string,
    text: string,
    classes: string[]
): HTMLDivElement {
    const button = document.createElement("div");
    button.classList.add("settings-button");
    button.id = id;
    button.textContent = text;

    for (let c of classes) {
        button.classList.add(c);
    }

    return button;
}

export function insertAfter(newNode: Element, referenceNode: Element) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

export function isButtonSelected(button: Element) {
    return button.classList.contains("button-selected");
}

export function selectButton(button: Element) {
    button.classList.add("button-selected");
}

export function deselectButton(button: Element) {
    button.classList.remove("button-selected");
}

export function getSpinnerElement(id: string) {
    const spinner = document.createElement("div");
    spinner.id = id;
    spinner.innerHTML = `<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>`;
    return spinner;
}

export function showSpinnerInsteadOf(
    elementId: string,
    spinnerId: string,
    showSpinner: boolean
) {
    const spinner = document.querySelector(`#${spinnerId}`);
    const element = document.querySelector(`#${elementId}`);

    if (showSpinner) {
        element.setAttribute("style", "display: none;");
        spinner.removeAttribute("style");
        return;
    }

    element.removeAttribute("style");
    spinner.setAttribute("style", "display: none;");
}
