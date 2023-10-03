const events = {};

/**
 * 
 * @param {string} id - unique id for the function to debounce
 * @param {number} delay - delay before the function is called
 * @param {number} maxDelay - maximum delay after which to call the next function call happens immediately
 * @param {Function} fn - function to call
 */
export default function debounce(id, delay, maxDelay, fn) {
    const now = Date.now();
    const timeoutFn = () => {
        fn();
        delete events[id];
    }
    if (!events[id]) {
        events[id] = {
            last: now,
            timeout: setTimeout(timeoutFn, delay),
        };
    } else if (events[id] && (now - events[id].last > maxDelay)) {
        clearTimeout(events[id].timeout);
        delete events[id];
        fn();
    } else {
        clearTimeout(events[id].timeout);
        events[id].timeout = setTimeout(timeoutFn, delay);
    }
}