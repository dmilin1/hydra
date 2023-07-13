// @ts-nocheck
function emitMessage(msg: string, data: any) {
    'do not compile';
    window.ReactNativeWebView.postMessage(JSON.stringify({ msg, data }));
}

function log(data: any) {
    'do not compile';
    emitMessage('log', data);
}

export {
    emitMessage,
    log,
};