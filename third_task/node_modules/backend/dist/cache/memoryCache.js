"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.set = set;
exports.get = get;
const cache = new Map();
function set(key, value, ttl) {
    if (cache.has(key)) {
        clearTimeout(cache.get(key).timer);
    }
    const timer = setTimeout(() => {
        cache.delete(key);
    }, ttl * 1000);
    cache.set(key, { data: value, timer });
}
function get(key) {
    const entry = cache.get(key);
    return entry ? entry.data : null;
}
