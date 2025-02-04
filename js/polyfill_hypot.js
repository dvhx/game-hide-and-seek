// hypot polyfill
"use strict";
// globals: document, window

try {
    if (!Math.hypot) {
        Math.hypot = function () {
            var y = 0, i = arguments.length;
            while (i--) {
                y += arguments[i] * arguments[i];
            }
            return Math.sqrt(y);
        };
    }
} catch (e) {
    console.error('Hypot error: ' + e);
}

