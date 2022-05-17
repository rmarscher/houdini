"use strict";
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
exports.HoudiniDocumentProxy = void 0;
// a proxy is an object that we can embed in an artifact so that
// we can mutate the internals of a document handler without worrying about
// the return value of the handler
var HoudiniDocumentProxy = /** @class */ (function () {
    function HoudiniDocumentProxy() {
        this.initial = null;
        this.callbacks = [];
    }
    HoudiniDocumentProxy.prototype.listen = function (callback) {
        this.callbacks.push(callback);
        if (this.initial) {
            callback(this.initial);
        }
    };
    HoudiniDocumentProxy.prototype.invoke = function (val) {
        var e_1, _a;
        // if there are no callbacks, just save the value and wait for the first one
        if (this.callbacks.length === 0) {
            this.initial = val;
            return;
        }
        try {
            for (var _b = __values(this.callbacks), _c = _b.next(); !_c.done; _c = _b.next()) {
                var callback = _c.value;
                callback(val);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    return HoudiniDocumentProxy;
}());
exports.HoudiniDocumentProxy = HoudiniDocumentProxy;
