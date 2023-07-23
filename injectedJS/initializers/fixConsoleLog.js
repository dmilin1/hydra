import emitMessage from "../messaging/emitMessage";

export default function fixConsoleLog() {
    console.log = (...data) => {
        if (data.length === 1) {
            emitMessage
            emitMessage('log', data[0]);
        } else {
            emitMessage('log', data);
        }
    };
}