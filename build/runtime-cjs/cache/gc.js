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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GarbageCollector = void 0;
var GarbageCollector = /** @class */ (function () {
    function GarbageCollector(cache, bufferSize) {
        if (bufferSize === void 0) { bufferSize = 10; }
        this.lifetimes = new Map();
        this.cache = cache;
        this.cacheBufferSize = bufferSize;
    }
    GarbageCollector.prototype.resetLifetime = function (id, field) {
        // if this is the first time we've seen the id
        if (!this.lifetimes.get(id)) {
            this.lifetimes.set(id, new Map());
        }
        // set the count to 0
        this.lifetimes.get(id).set(field, 0);
    };
    GarbageCollector.prototype.tick = function () {
        var e_1, _a, e_2, _b;
        try {
            // look at every field of every record we know about
            for (var _c = __values(this.lifetimes.entries()), _d = _c.next(); !_d.done; _d = _c.next()) {
                var _e = __read(_d.value, 2), id = _e[0], fieldMap = _e[1];
                try {
                    for (var _f = (e_2 = void 0, __values(fieldMap.entries())), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var _h = __read(_g.value, 2), field = _h[0], lifetime = _h[1];
                        // if there is an active subscriber for the field move on
                        if (this.cache._internal_unstable.subscriptions.get(id, field).length > 0) {
                            continue;
                        }
                        // there are no active subscriptions for this field, increment the lifetime count
                        fieldMap.set(field, lifetime + 1);
                        // if the lifetime is older than the maximum value, delete the value
                        if (fieldMap.get(field) > this.cacheBufferSize) {
                            this.cache._internal_unstable.storage.deleteField(id, field);
                            // if there is a list associated with this field, the handler needs to be deleted
                            this.cache._internal_unstable.lists.deleteField(id, field);
                            // delete the entry in lifetime map
                            fieldMap.delete(field);
                            // if there are no more entries for the id, delete the id info
                            if (__spread(fieldMap.keys()).length === 0) {
                                this.lifetimes.delete(id);
                            }
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    return GarbageCollector;
}());
exports.GarbageCollector = GarbageCollector;
