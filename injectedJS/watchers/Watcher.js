import { log } from "../messaging/emitMessage";


export default class Watcher {
    static _observer = null;
    static _callbacks = {};

    static watch(selector, callback) {
        const id = Math.random().toString(32).slice(2);
        Watcher._callbacks[id] = { selector, callback };
        return id;
    }

    static stop(id) {
        delete Watcher._callbacks[id];
    }

    static watchOnce(selector) {
        return new Promise(res => {
            const watch = Watcher.watch(selector, (elem) => {
                Watcher.stop(watch);
                res(elem);
            });
        });
    }

    static _start() {
        const observer = new MutationObserver(mutations => {
            Object.values(Watcher._callbacks).forEach(value => {
                const { selector, callback } = value;
                const elem = document.querySelector(selector);
                if (elem) {
                    callback(elem);
                }
            });
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

Watcher._start();