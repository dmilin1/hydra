import { RemoteFn } from "./remoteFunction";

let prevMsgs = {};

export default function emitMessage(msg, data) {
    let stringified = JSON.stringify({ msg, data }, (key, value) => {
        if (typeof value === 'function') {
            return '[function] - did you mean to make a remote function?';
        }
        if (value instanceof RemoteFn) {
            return '[remote function]: ' + value.name;
        }
        return value;
    });
    if (msg === 'log'|| prevMsgs[msg] !== stringified) {
        prevMsgs[msg] = stringified;
        window.ReactNativeWebView.postMessage(stringified);
    }
}