function triggerMouseEvent(node, eventType) {
    let clickEvent = document.createEvent('MouseEvents');
    clickEvent.initEvent(eventType, true, true);
    node.dispatchEvent(clickEvent);
}

export default function simClick(element) {
    ["mouseover", "mousedown", "mouseup", "click"].forEach(e =>
        triggerMouseEvent(element, e)
    );
}