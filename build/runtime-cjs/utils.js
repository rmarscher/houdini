"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.countPage = exports.extractPageInfo = void 0;
function extractPageInfo(data, path) {
    var _a;
    if (data === null) {
        return {
            startCursor: null,
            endCursor: null,
            hasNextPage: false,
            hasPreviousPage: false,
        };
    }
    var localPath = __spreadArray([], __read(path), false);
    // walk down the object until we get to the end
    var current = data;
    while (localPath.length > 0) {
        if (current === null) {
            break;
        }
        current = current[localPath.shift()];
    }
    return ((_a = current === null || current === void 0 ? void 0 : current.pageInfo) !== null && _a !== void 0 ? _a : {
        startCursor: null,
        endCursor: null,
        hasNextPage: false,
        hasPreviousPage: false,
    });
}
exports.extractPageInfo = extractPageInfo;
function countPage(source, value) {
    var e_1, _a;
    var data = value;
    try {
        for (var source_1 = __values(source), source_1_1 = source_1.next(); !source_1_1.done; source_1_1 = source_1.next()) {
            var field = source_1_1.value;
            var obj = data[field];
            if (obj && !Array.isArray(obj)) {
                data = obj;
            }
            else if (!data) {
                throw new Error('Could not count page size');
            }
            if (Array.isArray(obj)) {
                return obj.length;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (source_1_1 && !source_1_1.done && (_a = source_1.return)) _a.call(source_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return 0;
}
exports.countPage = countPage;
