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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListCollection = exports.List = exports.ListManager = void 0;
var cache_1 = require("./cache");
var stuff_1 = require("./stuff");
var ListManager = /** @class */ (function () {
    function ListManager(rootID) {
        // associate list names with the handler that wraps the list
        this.lists = new Map();
        this.listsByField = new Map();
        this.rootID = rootID;
    }
    ListManager.prototype.get = function (listName, id) {
        var _a;
        return (_a = this.lists.get(listName)) === null || _a === void 0 ? void 0 : _a.get(id || this.rootID);
    };
    ListManager.prototype.remove = function (listName, id) {
        var _a;
        (_a = this.lists.get(listName)) === null || _a === void 0 ? void 0 : _a.delete(id || this.rootID);
    };
    ListManager.prototype.add = function (list) {
        var _a, _b, _c;
        // if we haven't seen this list before
        if (!this.lists.has(list.name)) {
            this.lists.set(list.name, new Map());
        }
        // if we haven't seen the list before, add a new colleciton
        var name = list.name;
        var parentID = list.parentID || this.rootID;
        // if we already have a handler for the key, don't do anything
        if ((_b = (_a = this.lists.get(name)) === null || _a === void 0 ? void 0 : _a.get(parentID)) === null || _b === void 0 ? void 0 : _b.includes(list.key)) {
            return;
        }
        if (!this.lists.has(name)) {
            this.lists.set(name, new Map());
        }
        if (!this.lists.get(name).has(parentID)) {
            this.lists.get(name).set(parentID, new ListCollection([]));
        }
        if (!this.listsByField.has(list.recordID)) {
            this.listsByField.set(list.recordID, new Map());
        }
        if (!this.listsByField.get(list.recordID).has(list.key)) {
            (_c = this.listsByField.get(list.recordID)) === null || _c === void 0 ? void 0 : _c.set(list.key, []);
        }
        // create the list handler
        var handler = new List(__assign(__assign({}, list), { manager: this }));
        // add the list to the collection
        this.lists.get(list.name).get(parentID).lists.push(handler);
        this.listsByField.get(list.recordID).get(list.key).push(handler);
    };
    ListManager.prototype.removeIDFromAllLists = function (id) {
        var e_1, _a, e_2, _b;
        try {
            for (var _c = __values(this.lists.values()), _d = _c.next(); !_d.done; _d = _c.next()) {
                var fieldMap = _d.value;
                try {
                    for (var _e = (e_2 = void 0, __values(fieldMap.values())), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var list = _f.value;
                        list.removeID(id);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
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
    ListManager.prototype.deleteField = function (parentID, field) {
        var e_3, _a;
        var _b, _c, _d, _e, _f, _g;
        // if we have no lists associated with the parent/field combo, don't do anything
        if (!((_b = this.listsByField.get(parentID)) === null || _b === void 0 ? void 0 : _b.has(field))) {
            return;
        }
        try {
            // grab the list of fields associated with the parent/field combo
            for (var _h = __values(this.listsByField.get(parentID).get(field)), _j = _h.next(); !_j.done; _j = _h.next()) {
                var list = _j.value;
                (_d = (_c = this.lists.get(list.name)) === null || _c === void 0 ? void 0 : _c.get(list.parentID)) === null || _d === void 0 ? void 0 : _d.deleteListWithKey(field);
                if (((_f = (_e = this.lists.get(list.name)) === null || _e === void 0 ? void 0 : _e.get(list.parentID)) === null || _f === void 0 ? void 0 : _f.lists.length) === 0) {
                    (_g = this.lists.get(list.name)) === null || _g === void 0 ? void 0 : _g.delete(list.parentID);
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_j && !_j.done && (_a = _h.return)) _a.call(_h);
            }
            finally { if (e_3) throw e_3.error; }
        }
        // delete the lists by field lookups
        this.listsByField.get(parentID).delete(field);
    };
    return ListManager;
}());
exports.ListManager = ListManager;
var List = /** @class */ (function () {
    function List(_a) {
        var name = _a.name, cache = _a.cache, recordID = _a.recordID, key = _a.key, listType = _a.listType, selection = _a.selection, when = _a.when, filters = _a.filters, parentID = _a.parentID, connection = _a.connection, manager = _a.manager;
        this.recordID = recordID;
        this.key = key;
        this.listType = listType;
        this.cache = cache;
        this.selection = selection;
        this._when = when;
        this.filters = filters;
        this.name = name;
        this.parentID = parentID || cache_1.rootID;
        this.connection = connection;
        this.manager = manager;
    }
    // looks for the collection of all of the lists in the cache that satisfies a when
    // condition
    List.prototype.when = function (when) {
        return this.manager.lists.get(this.name).get(this.parentID).when(when);
    };
    List.prototype.append = function (selection, data, variables) {
        if (variables === void 0) { variables = {}; }
        return this.addToList(selection, data, variables, 'last');
    };
    List.prototype.prepend = function (selection, data, variables) {
        if (variables === void 0) { variables = {}; }
        return this.addToList(selection, data, variables, 'first');
    };
    List.prototype.addToList = function (selection, data, variables, where) {
        if (variables === void 0) { variables = {}; }
        // figure out the id of the type we are adding
        var dataID = this.cache._internal_unstable.id(this.listType, data);
        // if there are conditions for this operation
        if (!this.validateWhen() || !dataID) {
            return;
        }
        // we are going to implement the insert as a write with an update flag on a field
        // that matches the key of the list. We'll have to embed the lists data and selection
        // in the appropriate objects
        var insertSelection = selection;
        var insertData = data;
        // if we are wrapping a connection, we have to embed the data under edges > node
        if (this.connection) {
            insertSelection = {
                newEntry: {
                    keyRaw: this.key,
                    type: 'Connection',
                    fields: {
                        edges: {
                            keyRaw: 'edges',
                            type: 'ConnectionEdge',
                            update: (where === 'first' ? 'prepend' : 'append'),
                            fields: {
                                node: {
                                    type: this.listType,
                                    keyRaw: 'node',
                                    fields: __assign(__assign({}, selection), { __typename: {
                                            keyRaw: '__typename',
                                            type: 'String',
                                        } }),
                                },
                            },
                        },
                    },
                },
            };
            insertData = {
                newEntry: {
                    edges: [{ node: __assign(__assign({}, data), { __typename: this.listType }) }],
                },
            };
        }
        else {
            insertSelection = {
                newEntries: {
                    keyRaw: this.key,
                    type: this.listType,
                    update: (where === 'first' ? 'prepend' : 'append'),
                    fields: __assign(__assign({}, selection), { __typename: {
                            keyRaw: '__typename',
                            type: 'String',
                        } }),
                },
            };
            insertData = {
                newEntries: [__assign(__assign({}, data), { __typename: this.listType })],
            };
        }
        // update the cache with the data we just found
        this.cache.write({
            selection: insertSelection,
            data: insertData,
            variables: variables,
            parent: this.recordID,
            applyUpdates: true,
        });
    };
    List.prototype.removeID = function (id, variables) {
        var e_4, _a, e_5, _b;
        var _c;
        if (variables === void 0) { variables = {}; }
        // if there are conditions for this operation
        if (!this.validateWhen()) {
            return;
        }
        // if we are removing from a connection, the id we are removing from
        // has to be computed
        var parentID = this.recordID;
        var targetID = id;
        var targetKey = this.key;
        // if we are removing a record from a connection we have to walk through
        // some embedded references first
        if (this.connection) {
            var embeddedConnection = this.cache._internal_unstable.storage.get(this.recordID, this.key).value;
            if (!embeddedConnection) {
                return;
            }
            var embeddedConnectionID = embeddedConnection;
            // look at every embedded edge for the one with a node corresponding to the element
            // we want to delete
            var edges = this.cache._internal_unstable.storage.get(embeddedConnectionID, 'edges').value;
            try {
                for (var _d = __values((0, stuff_1.flattenList)(edges) || []), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var edge = _e.value;
                    if (!edge) {
                        continue;
                    }
                    var edgeID = edge;
                    // look at the edge's node
                    var nodeID = this.cache._internal_unstable.storage.get(edgeID, 'node').value;
                    if (!nodeID) {
                        continue;
                    }
                    // if we found the node
                    if (nodeID === id) {
                        targetID = edgeID;
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                }
                finally { if (e_4) throw e_4.error; }
            }
            parentID = embeddedConnectionID;
            targetKey = 'edges';
        }
        // if the id is not contained in the list, dont notify anyone
        var value = this.cache._internal_unstable.storage.get(parentID, targetKey)
            .value;
        if (!value || !value.includes(targetID)) {
            return;
        }
        // get the list of specs that are subscribing to the list
        var subscribers = this.cache._internal_unstable.subscriptions.get(this.recordID, this.key);
        // disconnect record from any subscriptions associated with the list
        this.cache._internal_unstable.subscriptions.remove(targetID, 
        // if we are unsubscribing from a connection, the fields we care about
        // are tucked away under edges
        this.connection ? this.selection.edges.fields : this.selection, subscribers, variables);
        // remove the target from the parent
        this.cache._internal_unstable.storage.remove(parentID, targetKey, targetID);
        try {
            // notify the subscribers about the change
            for (var subscribers_1 = __values(subscribers), subscribers_1_1 = subscribers_1.next(); !subscribers_1_1.done; subscribers_1_1 = subscribers_1.next()) {
                var spec = subscribers_1_1.value;
                // trigger the update
                spec.set(this.cache._internal_unstable.getSelection({
                    parent: spec.parentID || this.manager.rootID,
                    selection: spec.selection,
                    variables: ((_c = spec.variables) === null || _c === void 0 ? void 0 : _c.call(spec)) || {},
                }).data);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (subscribers_1_1 && !subscribers_1_1.done && (_b = subscribers_1.return)) _b.call(subscribers_1);
            }
            finally { if (e_5) throw e_5.error; }
        }
        // return true if we deleted something
        return true;
    };
    List.prototype.remove = function (data, variables) {
        if (variables === void 0) { variables = {}; }
        var targetID = this.cache._internal_unstable.id(this.listType, data);
        if (!targetID) {
            return;
        }
        // figure out the id of the type we are adding
        return this.removeID(targetID, variables);
    };
    List.prototype.validateWhen = function (when) {
        // if this when doesn't apply, we should look at others to see if we should update those behind the scenes
        var filters = when || this._when;
        var ok = true;
        // if there are conditions for this operation
        if (filters) {
            // we only NEED there to be target filters for must's
            var targets_1 = this.filters;
            // check must's first
            if (filters.must && targets_1) {
                ok = Object.entries(filters.must).reduce(function (prev, _a) {
                    var _b = __read(_a, 2), key = _b[0], value = _b[1];
                    return Boolean(prev && targets_1[key] == value);
                }, ok);
            }
            // if there are no targets, nothing could be true that can we compare against
            if (filters.must_not) {
                ok =
                    !targets_1 ||
                        Object.entries(filters.must_not).reduce(function (prev, _a) {
                            var _b = __read(_a, 2), key = _b[0], value = _b[1];
                            return Boolean(prev && targets_1[key] != value);
                        }, ok);
            }
        }
        return ok;
    };
    List.prototype.toggleElement = function (selection, data, variables, where) {
        if (variables === void 0) { variables = {}; }
        // if we dont have something to remove, then add it instead
        if (!this.remove(data, variables)) {
            this.addToList(selection, data, variables, where);
        }
    };
    // iterating over the list handler should be the same as iterating over
    // the underlying linked list
    List.prototype[Symbol.iterator] = function () {
        var entries, value, entries_1, entries_1_1, record, e_6_1;
        var e_6, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    entries = [];
                    value = this.cache._internal_unstable.storage.get(this.recordID, this.key).value;
                    if (!this.connection) {
                        entries = (0, stuff_1.flattenList)(value);
                    }
                    else {
                        // connections need to reference the edges field for the list of entries
                        entries = this.cache._internal_unstable.storage.get(value, 'edges')
                            .value;
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, 7, 8]);
                    entries_1 = __values(entries), entries_1_1 = entries_1.next();
                    _b.label = 2;
                case 2:
                    if (!!entries_1_1.done) return [3 /*break*/, 5];
                    record = entries_1_1.value;
                    return [4 /*yield*/, record];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    entries_1_1 = entries_1.next();
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 8];
                case 6:
                    e_6_1 = _b.sent();
                    e_6 = { error: e_6_1 };
                    return [3 /*break*/, 8];
                case 7:
                    try {
                        if (entries_1_1 && !entries_1_1.done && (_a = entries_1.return)) _a.call(entries_1);
                    }
                    finally { if (e_6) throw e_6.error; }
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    };
    return List;
}());
exports.List = List;
var ListCollection = /** @class */ (function () {
    function ListCollection(lists) {
        this.lists = [];
        this.lists = lists;
    }
    ListCollection.prototype.append = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.lists.forEach(function (list) { return list.append.apply(list, __spreadArray([], __read(args), false)); });
    };
    ListCollection.prototype.prepend = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.lists.forEach(function (list) { return list.prepend.apply(list, __spreadArray([], __read(args), false)); });
    };
    ListCollection.prototype.addToList = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.lists.forEach(function (list) { return list.addToList.apply(list, __spreadArray([], __read(args), false)); });
    };
    ListCollection.prototype.removeID = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.lists.forEach(function (list) { return list.removeID.apply(list, __spreadArray([], __read(args), false)); });
    };
    ListCollection.prototype.remove = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.lists.forEach(function (list) { return list.remove.apply(list, __spreadArray([], __read(args), false)); });
    };
    ListCollection.prototype.toggleElement = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.lists.forEach(function (list) { return list.toggleElement.apply(list, __spreadArray([], __read(args), false)); });
    };
    ListCollection.prototype.when = function (when) {
        return new ListCollection(this.lists.filter(function (list) {
            return list.validateWhen(when);
        }));
    };
    ListCollection.prototype.includes = function (key) {
        return !!this.lists.find(function (list) { return list.key === key; });
    };
    ListCollection.prototype.deleteListWithKey = function (key) {
        return (this.lists = this.lists.filter(function (list) { return list.key !== key; }));
    };
    // iterating over the collection should be the same as iterating over
    // the underlying list
    ListCollection.prototype[Symbol.iterator] = function () {
        var _a, _b, list, list_1, list_1_1, entry, e_7_1, e_8_1;
        var e_8, _c, e_7, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 11, 12, 13]);
                    _a = __values(this.lists), _b = _a.next();
                    _e.label = 1;
                case 1:
                    if (!!_b.done) return [3 /*break*/, 10];
                    list = _b.value;
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 7, 8, 9]);
                    list_1 = (e_7 = void 0, __values(list)), list_1_1 = list_1.next();
                    _e.label = 3;
                case 3:
                    if (!!list_1_1.done) return [3 /*break*/, 6];
                    entry = list_1_1.value;
                    return [4 /*yield*/, entry];
                case 4:
                    _e.sent();
                    _e.label = 5;
                case 5:
                    list_1_1 = list_1.next();
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 9];
                case 7:
                    e_7_1 = _e.sent();
                    e_7 = { error: e_7_1 };
                    return [3 /*break*/, 9];
                case 8:
                    try {
                        if (list_1_1 && !list_1_1.done && (_d = list_1.return)) _d.call(list_1);
                    }
                    finally { if (e_7) throw e_7.error; }
                    return [7 /*endfinally*/];
                case 9:
                    _b = _a.next();
                    return [3 /*break*/, 1];
                case 10: return [3 /*break*/, 13];
                case 11:
                    e_8_1 = _e.sent();
                    e_8 = { error: e_8_1 };
                    return [3 /*break*/, 13];
                case 12:
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_8) throw e_8.error; }
                    return [7 /*endfinally*/];
                case 13: return [2 /*return*/];
            }
        });
    };
    return ListCollection;
}());
exports.ListCollection = ListCollection;
