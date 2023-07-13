// @ts-nocheck
import { log } from "./EmitMessage";

function waitForLoad() {
    'do not compile';
    return new Promise(res => {
        window.postObserver = new MutationObserver(function (mutations) {
            if (!document.querySelector('.Loading')) {
                res();
            }
        });
        window.postObserver.observe(document, {attributes: false, childList: true, characterData: false, subtree:true});
    });
}

export {
    waitForLoad,
};