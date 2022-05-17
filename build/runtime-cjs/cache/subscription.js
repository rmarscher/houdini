"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemorySubscriptions = void 0;
var stuff_1 = require("./stuff");
// manage the subscriptions
var InMemorySubscriptions = /** @class */ (function () {
    function InMemorySubscriptions(cache) {
        this.subscribers = {};
        this.referenceCounts = {};
        this.keyVersions = {};
        this.cache = cache;
    }
    InMemorySubscriptions.prototype.add = function (_a) {
        var e_1, _b, e_2, _c;
        var parent = _a.parent, spec = _a.spec, selection = _a.selection, variables = _a.variables;
        try {
            for (var _d = __values(Object.values(selection)), _e = _d.next(); !_e.done; _e = _d.next()) {
                var _f = _e.value, keyRaw = _f.keyRaw, fields = _f.fields, list = _f.list, filters = _f.filters;
                var key = stuff_1.evaluateKey(keyRaw, variables);
                // add the subscriber to the field
                this.addFieldSubscription(parent, key, spec);
                // if the field points to a link, we need to subscribe to any fields of that
                // linked record
                if (fields) {
                    // if the link points to a record then we just have to add it to the one
                    var linkedRecord = this.cache._internal_unstable.storage.get(parent, key).value;
                    var children = !Array.isArray(linkedRecord)
                        ? [linkedRecord]
                        : stuff_1.flattenList(linkedRecord);
                    // if this field is marked as a list, register it. this will overwrite existing list handlers
                    // so that they can get up to date filters
                    if (list && fields) {
                        this.cache._internal_unstable.lists.add({
                            name: list.name,
                            connection: list.connection,
                            parentID: spec.parentID,
                            cache: this.cache,
                            recordID: parent,
                            listType: list.type,
                            key: key,
                            selection: fields,
                            filters: Object.entries(filters || {}).reduce(function (acc, _a) {
                                var _b;
                                var _c = __read(_a, 2), key = _c[0], _d = _c[1], kind = _d.kind, value = _d.value;
                                return __assign(__assign({}, acc), (_b = {}, _b[key] = kind !== 'Variable' ? value : variables[value], _b));
                            }, {}),
                        });
                    }
                    // if we're not related to anything, we're done
                    if (!children || !fields) {
                        continue;
                    }
                    try {
                        // add the subscriber to every child
                        for (var children_1 = (e_2 = void 0, __values(children)), children_1_1 = children_1.next(); !children_1_1.done; children_1_1 = children_1.next()) {
                            var child = children_1_1.value;
                            // avoid null children
                            if (!child) {
                                continue;
                            }
                            // make sure the children update this subscription
                            this.add({
                                parent: child,
                                spec: spec,
                                selection: fields,
                                variables: variables,
                            });
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (children_1_1 && !children_1_1.done && (_c = children_1.return)) _c.call(children_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    InMemorySubscriptions.prototype.addFieldSubscription = function (id, field, spec) {
        // if we haven't seen the id or field before, create a list we can add to
        if (!this.subscribers[id]) {
            this.subscribers[id] = {};
        }
        if (!this.subscribers[id][field]) {
            this.subscribers[id][field] = [];
        }
        // if this is the first time we've seen the raw key
        if (!this.keyVersions[field]) {
            this.keyVersions[field] = new Set();
        }
        // add this version of the key if we need to
        this.keyVersions[field].add(field);
        if (!this.subscribers[id][field].map(function (_a) {
            var set = _a.set;
            return set;
        }).includes(spec.set)) {
            this.subscribers[id][field].push(spec);
        }
        // if this is the first time we've seen this field
        if (!this.referenceCounts[id]) {
            this.referenceCounts[id] = {};
        }
        if (!this.referenceCounts[id][field]) {
            this.referenceCounts[id][field] = new Map();
        }
        var counts = this.referenceCounts[id][field];
        // we're going to increment the current value by one
        counts.set(spec.set, (counts.get(spec.set) || 0) + 1);
        // reset the lifetime for the field
        this.cache._internal_unstable.lifetimes.resetLifetime(id, field);
    };
    // this is different from add because of the treatment of lists
    InMemorySubscriptions.prototype.addMany = function (_a) {
        var e_3, _b, e_4, _c, e_5, _d;
        var parent = _a.parent, selection = _a.selection, variables = _a.variables, subscribers = _a.subscribers;
        try {
            // look at every field in the selection and add the subscribers
            for (var _e = __values(Object.values(selection)), _f = _e.next(); !_f.done; _f = _e.next()) {
                var _g = _f.value, keyRaw = _g.keyRaw, fields = _g.fields;
                var key = stuff_1.evaluateKey(keyRaw, variables);
                try {
                    // add the subscriber to the
                    for (var subscribers_1 = (e_4 = void 0, __values(subscribers)), subscribers_1_1 = subscribers_1.next(); !subscribers_1_1.done; subscribers_1_1 = subscribers_1.next()) {
                        var spec = subscribers_1_1.value;
                        this.addFieldSubscription(parent, key, spec);
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (subscribers_1_1 && !subscribers_1_1.done && (_c = subscribers_1.return)) _c.call(subscribers_1);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                // if there are fields under this
                if (fields) {
                    var link = this.cache._internal_unstable.storage.get(parent, key).value;
                    // figure out who else needs subscribers
                    var children = !Array.isArray(link)
                        ? [link]
                        : stuff_1.flattenList(link);
                    try {
                        for (var children_2 = (e_5 = void 0, __values(children)), children_2_1 = children_2.next(); !children_2_1.done; children_2_1 = children_2.next()) {
                            var linkedRecord = children_2_1.value;
                            // avoid null records
                            if (!linkedRecord) {
                                continue;
                            }
                            // insert the subscriber
                            this.addMany({
                                parent: linkedRecord,
                                selection: fields,
                                variables: variables,
                                subscribers: subscribers,
                            });
                        }
                    }
                    catch (e_5_1) { e_5 = { error: e_5_1 }; }
                    finally {
                        try {
                            if (children_2_1 && !children_2_1.done && (_d = children_2.return)) _d.call(children_2);
                        }
                        finally { if (e_5) throw e_5.error; }
                    }
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    InMemorySubscriptions.prototype.get = function (id, field) {
        var _a;
        return ((_a = this.subscribers[id]) === null || _a === void 0 ? void 0 : _a[field]) || [];
    };
    InMemorySubscriptions.prototype.remove = function (id, fields, targets, variables, visited) {
        var e_6, _a, e_7, _b, e_8, _c;
        if (visited === void 0) { visited = []; }
        visited.push(id);
        // walk down to every record we know about
        var linkedIDs = [];
        try {
            // look at the fields for ones corresponding to links
            for (var _d = __values(Object.values(fields)), _e = _d.next(); !_e.done; _e = _d.next()) {
                var selection = _e.value;
                var key = stuff_1.evaluateKey(selection.keyRaw, variables);
                // remove the subscribers for the field
                this.removeSubscribers(id, key, targets);
                // if there is no subselection it doesn't point to a link, move on
                if (!selection.fields) {
                    continue;
                }
                var previousValue = this.cache._internal_unstable.storage.get(id, key).value;
                // if its not a list, wrap it as one so we can dry things up
                var links = !Array.isArray(previousValue)
                    ? [previousValue]
                    : stuff_1.flattenList(previousValue);
                try {
                    for (var links_1 = (e_7 = void 0, __values(links)), links_1_1 = links_1.next(); !links_1_1.done; links_1_1 = links_1.next()) {
                        var link = links_1_1.value;
                        if (link !== null) {
                            linkedIDs.push([link, selection.fields]);
                        }
                    }
                }
                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                finally {
                    try {
                        if (links_1_1 && !links_1_1.done && (_b = links_1.return)) _b.call(links_1);
                    }
                    finally { if (e_7) throw e_7.error; }
                }
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_6) throw e_6.error; }
        }
        try {
            for (var linkedIDs_1 = __values(linkedIDs), linkedIDs_1_1 = linkedIDs_1.next(); !linkedIDs_1_1.done; linkedIDs_1_1 = linkedIDs_1.next()) {
                var _f = __read(linkedIDs_1_1.value, 2), linkedRecordID = _f[0], linkFields = _f[1];
                this.remove(linkedRecordID, linkFields, targets, visited);
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (linkedIDs_1_1 && !linkedIDs_1_1.done && (_c = linkedIDs_1.return)) _c.call(linkedIDs_1);
            }
            finally { if (e_8) throw e_8.error; }
        }
    };
    InMemorySubscriptions.prototype.removeSubscribers = function (id, fieldName, specs) {
        var e_9, _a;
        var _b, _c;
        // build up a list of the sets we actually need to remove after
        // checking reference counts
        var targets = [];
        try {
            for (var specs_1 = __values(specs), specs_1_1 = specs_1.next(); !specs_1_1.done; specs_1_1 = specs_1.next()) {
                var spec = specs_1_1.value;
                // if we dont know this field/set combo, there's nothing to do (probably a bug somewhere)
                if (!((_c = (_b = this.referenceCounts[id]) === null || _b === void 0 ? void 0 : _b[fieldName]) === null || _c === void 0 ? void 0 : _c.has(spec.set))) {
                    continue;
                }
                var counts = this.referenceCounts[id][fieldName];
                var newVal = (counts.get(spec.set) || 0) - 1;
                // decrement the reference of every field
                counts.set(spec.set, newVal);
                // if that was the last reference we knew of
                if (newVal <= 0) {
                    targets.push(spec.set);
                    // remove the reference to the set function
                    counts.delete(spec.set);
                }
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (specs_1_1 && !specs_1_1.done && (_a = specs_1.return)) _a.call(specs_1);
            }
            finally { if (e_9) throw e_9.error; }
        }
        // we do need to remove the set from the list
        if (this.subscribers[id]) {
            this.subscribers[id][fieldName] = this.get(id, fieldName).filter(function (_a) {
                var set = _a.set;
                return !targets.includes(set);
            });
        }
    };
    InMemorySubscriptions.prototype.removeAllSubscribers = function (id, targets, visited) {
        var e_10, _a, e_11, _b;
        if (visited === void 0) { visited = []; }
        visited.push(id);
        try {
            // every field that currently being subscribed to needs to be cleaned up
            for (var _c = __values(Object.keys(this.subscribers[id] || [])), _d = _c.next(); !_d.done; _d = _c.next()) {
                var field = _d.value;
                // grab the current set of subscribers
                var subscribers = targets || this.subscribers[id][field];
                // delete the subscriber for the field
                this.removeSubscribers(id, field, subscribers);
                // look up the value for the field so we can remove any subscribers that existed because of a
                // subscriber to this record
                var _e = this.cache._internal_unstable.storage.get(id, field), value = _e.value, kind = _e.kind;
                // if the field is a scalar, there's nothing more to do
                if (kind === 'scalar') {
                    continue;
                }
                // if the value is a single link , wrap it in a list. otherwise, flatten the link list
                var nextTargets = Array.isArray(value)
                    ? stuff_1.flattenList(value)
                    : [value];
                try {
                    for (var nextTargets_1 = (e_11 = void 0, __values(nextTargets)), nextTargets_1_1 = nextTargets_1.next(); !nextTargets_1_1.done; nextTargets_1_1 = nextTargets_1.next()) {
                        var id_1 = nextTargets_1_1.value;
                        // if we have already visited this id, move on
                        if (visited.includes(id_1)) {
                            continue;
                        }
                        // keep walking down
                        this.removeAllSubscribers(id_1, subscribers, visited);
                    }
                }
                catch (e_11_1) { e_11 = { error: e_11_1 }; }
                finally {
                    try {
                        if (nextTargets_1_1 && !nextTargets_1_1.done && (_b = nextTargets_1.return)) _b.call(nextTargets_1);
                    }
                    finally { if (e_11) throw e_11.error; }
                }
            }
        }
        catch (e_10_1) { e_10 = { error: e_10_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_10) throw e_10.error; }
        }
    };
    return InMemorySubscriptions;
}());
exports.InMemorySubscriptions = InMemorySubscriptions;
