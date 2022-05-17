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
exports.OperationKind = exports.OperationLocation = exports.Layer = exports.InMemoryStorage = void 0;
var stuff_1 = require("./stuff");
// NOTE: the current implementation of delete is slow. it should try to compare the
// type of the id being deleted with the type contained in the linked list so that
// the removal logic is only performed when its possible the ID is found inside.
// ie: deleting a user should not slow down looking up a list of cats
var InMemoryStorage = /** @class */ (function () {
    function InMemoryStorage() {
        this.idCount = 0;
        this.rank = 0;
        this.data = [];
    }
    Object.defineProperty(InMemoryStorage.prototype, "layerCount", {
        get: function () {
            return this.data.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InMemoryStorage.prototype, "nextRank", {
        get: function () {
            return this.rank++;
        },
        enumerable: false,
        configurable: true
    });
    // create a layer and return its id
    InMemoryStorage.prototype.createLayer = function (optimistic) {
        if (optimistic === void 0) { optimistic = false; }
        // generate the next layer
        var layer = new Layer(this.idCount++);
        layer.optimistic = optimistic;
        // add the layer to the list
        this.data.push(layer);
        // pass the layer on so it can be updated
        return layer;
    };
    InMemoryStorage.prototype.insert = function (id, field, location, target) {
        return this.topLayer.insert(id, field, location, target);
    };
    InMemoryStorage.prototype.remove = function (id, field, target) {
        return this.topLayer.remove(id, field, target);
    };
    InMemoryStorage.prototype.delete = function (id) {
        return this.topLayer.delete(id);
    };
    InMemoryStorage.prototype.deleteField = function (id, field) {
        return this.topLayer.deleteField(id, field);
    };
    InMemoryStorage.prototype.getLayer = function (id) {
        var e_1, _a;
        try {
            for (var _b = __values(this.data), _c = _b.next(); !_c.done; _c = _b.next()) {
                var layer = _c.value;
                if (layer.id === id) {
                    return layer;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // we didn't find the layer
        throw new Error('Could not find layer with id: ' + id);
    };
    InMemoryStorage.prototype.replaceID = function (replacement) {
        var e_2, _a;
        try {
            for (var _b = __values(this.data), _c = _b.next(); !_c.done; _c = _b.next()) {
                var layer = _c.value;
                layer.replaceID(replacement);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    InMemoryStorage.prototype.get = function (id, field) {
        var _a, _b;
        // the list of operations for the field
        var operations = (_a = {},
            _a[OperationKind.insert] = (_b = {},
                _b[OperationLocation.start] = [],
                _b[OperationLocation.end] = [],
                _b),
            _a[OperationKind.remove] = new Set(),
            _a);
        // the list of layers we used to build up the value
        var layerIDs = [];
        var _loop_1 = function (i) {
            var e_3, _c;
            var layer = this_1.data[i];
            var _d = __read(layer.get(id, field), 2), layerValue = _d[0], kind = _d[1];
            var layerOperations = layer.getOperations(id, field) || [];
            layer.deletedIDs.forEach(function (v) {
                var _a, _b;
                // if the layer wants to undo a delete for the id
                if ((_b = (_a = layer.operations[v]) === null || _a === void 0 ? void 0 : _a.undoDeletesInList) === null || _b === void 0 ? void 0 : _b.includes(field)) {
                    return;
                }
                operations.remove.add(v);
            });
            // if the layer does not contain a value for the field, move on
            if (typeof layerValue === 'undefined' && layerOperations.length === 0) {
                if (layer.deletedIDs.size > 0) {
                    layerIDs.push(layer.id);
                }
                return "continue";
            }
            // if the result isn't an array we can just use the value since we can't
            // apply operations to the field
            if (typeof layerValue !== 'undefined' && !Array.isArray(layerValue)) {
                return { value: {
                        value: layerValue,
                        kind: kind,
                        displayLayers: [layer.id],
                    } };
            }
            // if the layer contains operations or values add it to the list of relevant layers
            // add the layer to the list
            layerIDs.push(layer.id);
            // if we have an operation
            if (layerOperations.length > 0) {
                try {
                    // process every operation
                    for (var layerOperations_1 = (e_3 = void 0, __values(layerOperations)), layerOperations_1_1 = layerOperations_1.next(); !layerOperations_1_1.done; layerOperations_1_1 = layerOperations_1.next()) {
                        var op = layerOperations_1_1.value;
                        // remove operation
                        if (isRemoveOperation(op)) {
                            operations.remove.add(op.id);
                        }
                        // inserts are sorted by location
                        if (isInsertOperation(op)) {
                            operations.insert[op.location].unshift(op.id);
                        }
                        // if we found a delete operation, we're done
                        if (isDeleteOperation(op)) {
                            return { value: {
                                    value: undefined,
                                    kind: 'unknown',
                                    displayLayers: [],
                                } };
                        }
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (layerOperations_1_1 && !layerOperations_1_1.done && (_c = layerOperations_1.return)) _c.call(layerOperations_1);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
            // if we don't have a value to return, we're done
            if (typeof layerValue === 'undefined') {
                return "continue";
            }
            // if there are no operations, move along
            if (!operations.remove.size &&
                !operations.insert.start.length &&
                !operations.insert.end.length) {
                return { value: { value: layerValue, displayLayers: layerIDs, kind: 'link' } };
            }
            return { value: {
                    value: __spreadArray(__spreadArray(__spreadArray([], __read(operations.insert.start), false), __read(layerValue), false), __read(operations.insert.end), false).filter(function (value) { return !operations.remove.has(value); }),
                    displayLayers: layerIDs,
                    kind: kind,
                } };
        };
        var this_1 = this;
        // go through the list of layers in reverse
        for (var i = this.data.length - 1; i >= 0; i--) {
            var state_1 = _loop_1(i);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return {
            value: undefined,
            kind: 'unknown',
            displayLayers: [],
        };
    };
    InMemoryStorage.prototype.writeLink = function (id, field, value) {
        // write to the top most layer
        return this.topLayer.writeLink(id, field, value);
    };
    InMemoryStorage.prototype.writeField = function (id, field, value) {
        return this.topLayer.writeField(id, field, value);
    };
    InMemoryStorage.prototype.resolveLayer = function (id) {
        var e_4, _a;
        var startingIndex = null;
        try {
            // find the layer with the matching id
            for (var _b = __values(this.data.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), index = _d[0], layer = _d[1];
                if (layer.id !== id) {
                    continue;
                }
                // we found the target layer
                startingIndex = index - 1;
                // its not optimistic any more
                this.data[index].optimistic = false;
                // we're done
                break;
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        // if we didn't find the layer, yell loudly
        if (startingIndex === null) {
            throw new Error('could not find layer with id: ' + id);
        }
        // if we are resolving the base layer make sure we start at zero
        if (startingIndex === -1) {
            startingIndex = 0;
        }
        // if the starting layer is optimistic then we can't write to it
        if (this.data[startingIndex].optimistic) {
            startingIndex++;
        }
        // start walking down the list of layers, applying any non-optimistic ones to the target
        var baseLayer = this.data[startingIndex];
        var layerIndex = startingIndex;
        while (layerIndex < this.data.length) {
            // the layer in question and move the counter up one after we index
            var layer = this.data[layerIndex++];
            // if the layer is optimistic, we can't go further
            if (layer.optimistic) {
                layerIndex--;
                break;
            }
            // apply the layer onto our base
            baseLayer.writeLayer(layer);
        }
        // delete the layers we merged
        this.data.splice(startingIndex + 1, layerIndex - startingIndex - 1);
    };
    Object.defineProperty(InMemoryStorage.prototype, "topLayer", {
        get: function () {
            var _a;
            // if there is no base layer
            if (this.data.length === 0) {
                this.createLayer();
            }
            // if the last layer is optimistic, create another layer on top of it
            // since optimistic layers have to be written to directly
            if ((_a = this.data[this.data.length - 1]) === null || _a === void 0 ? void 0 : _a.optimistic) {
                this.createLayer();
            }
            // the top layer is safe to write to (its non-null and guaranteed not optimistic)
            return this.data[this.data.length - 1];
        },
        enumerable: false,
        configurable: true
    });
    return InMemoryStorage;
}());
exports.InMemoryStorage = InMemoryStorage;
var Layer = /** @class */ (function () {
    function Layer(id) {
        this.optimistic = false;
        this.fields = {};
        this.links = {};
        this.operations = {};
        this.deletedIDs = new Set();
        this.id = id;
    }
    Layer.prototype.get = function (id, field) {
        var _a, _b;
        // if its a link return the value
        if (typeof ((_a = this.links[id]) === null || _a === void 0 ? void 0 : _a[field]) !== 'undefined') {
            return [this.links[id][field], 'link'];
        }
        // only other option is a value
        return [(_b = this.fields[id]) === null || _b === void 0 ? void 0 : _b[field], 'scalar'];
    };
    Layer.prototype.getOperations = function (id, field) {
        var _a, _b, _c;
        // if the id has been deleted
        if ((_a = this.operations[id]) === null || _a === void 0 ? void 0 : _a.deleted) {
            return [
                {
                    kind: OperationKind.delete,
                    target: id,
                },
            ];
        }
        // there could be a mutation for the specific field
        if ((_c = (_b = this.operations[id]) === null || _b === void 0 ? void 0 : _b.fields) === null || _c === void 0 ? void 0 : _c[field]) {
            return this.operations[id].fields[field];
        }
    };
    Layer.prototype.writeField = function (id, field, value) {
        var _a;
        this.fields[id] = __assign(__assign({}, this.fields[id]), (_a = {}, _a[field] = value, _a));
        return this.id;
    };
    Layer.prototype.writeLink = function (id, field, value) {
        var e_5, _a, _b;
        var _c, _d, _e;
        // if any of the values in this link are flagged to be deleted, undelete it
        var valueList = Array.isArray(value) ? value : [value];
        var _loop_2 = function (value_1) {
            if (!value_1) {
                return "continue";
            }
            var fieldOperations = (_c = this_2.operations[id]) === null || _c === void 0 ? void 0 : _c.fields[field];
            // if the operation was globally deleted
            if (((_d = this_2.operations[value_1]) === null || _d === void 0 ? void 0 : _d.deleted) || this_2.deletedIDs.has(value_1)) {
                // undo the delete
                this_2.operations[value_1] = __assign(__assign({}, this_2.operations[value_1]), { undoDeletesInList: __spreadArray(__spreadArray([], __read((((_e = this_2.operations[id]) === null || _e === void 0 ? void 0 : _e.undoDeletesInList) || [])), false), [field], false) });
                // the value could have been removed specifically from the list
            }
            else if (value_1 && (fieldOperations === null || fieldOperations === void 0 ? void 0 : fieldOperations.length) > 0) {
                // if we have a field operation to remove the list, undo the operation
                this_2.operations[id].fields[field] = fieldOperations.filter(function (op) { return op.kind !== 'remove' || op.id !== value_1; });
            }
        };
        var this_2 = this;
        try {
            for (var _f = __values((0, stuff_1.flattenList)(valueList)), _g = _f.next(); !_g.done; _g = _f.next()) {
                var value_1 = _g.value;
                _loop_2(value_1);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
            }
            finally { if (e_5) throw e_5.error; }
        }
        this.links[id] = __assign(__assign({}, this.links[id]), (_b = {}, _b[field] = value, _b));
        return this.id;
    };
    Layer.prototype.isDisplayLayer = function (displayLayers) {
        return (displayLayers.length === 0 ||
            displayLayers.includes(this.id) ||
            Math.max.apply(Math, __spreadArray([], __read(displayLayers), false)) < this.id);
    };
    Layer.prototype.clear = function () {
        // before we clear the data of the layer, look for any subscribers that need to be updated
        // now that everything has been notified we can reset the data
        this.links = {};
        this.fields = {};
        this.operations = {};
        this.deletedIDs = new Set();
    };
    Layer.prototype.replaceID = function (_a) {
        var from = _a.from, to = _a.to;
        // any fields that existing in from, assign to to
        this.fields[to] = this.fields[from];
        this.links[to] = this.links[from];
        this.operations[to] = this.operations[from] || { fields: {} };
        if (this.deletedIDs.has(from)) {
            this.deletedIDs.add(to);
        }
    };
    Layer.prototype.removeUndefinedFields = function () {
        var e_6, _a, e_7, _b;
        try {
            // any field that's marked as undefined needs to be deleted
            for (var _c = __values(Object.entries(this.fields)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var _e = __read(_d.value, 2), id = _e[0], fields = _e[1];
                try {
                    for (var _f = (e_7 = void 0, __values(Object.entries(fields))), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var _h = __read(_g.value, 2), field = _h[0], value = _h[1];
                        if (typeof value === 'undefined') {
                            try {
                                delete this.fields[id][field];
                            }
                            catch (_j) { }
                            try {
                                delete this.links[id][field];
                            }
                            catch (_k) { }
                        }
                    }
                }
                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_7) throw e_7.error; }
                }
                // if there are no fields left for the object, clean it up
                if (Object.keys(fields || {}).length === 0) {
                    delete this.fields[id];
                }
                // if there are no more links, clean it up
                if (Object.keys(this.links[id] || {}).length === 0) {
                    delete this.links[id];
                }
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_6) throw e_6.error; }
        }
    };
    Layer.prototype.delete = function (id) {
        var _a;
        // add an insert operation to the map
        this.operations = __assign(__assign({}, this.operations), (_a = {}, _a[id] = __assign(__assign({}, this.operations[id]), { deleted: true, 
            // reapply any delete undos
            undoDeletesInList: [] }), _a));
        // add the id to the list of ids that have been deleted in this layer (so we can filter them out later)
        this.deletedIDs.add(id);
    };
    Layer.prototype.deleteField = function (id, field) {
        var _a;
        this.fields[id] = __assign(__assign({}, this.fields[id]), (_a = {}, _a[field] = undefined, _a));
    };
    Layer.prototype.insert = function (id, field, where, target) {
        // add an insert operation for the field
        this.addFieldOperation(id, field, {
            kind: OperationKind.insert,
            id: target,
            location: where,
        });
    };
    Layer.prototype.remove = function (id, field, target) {
        // add a remove operation for the field
        this.addFieldOperation(id, field, {
            kind: OperationKind.remove,
            id: target,
        });
    };
    Layer.prototype.writeLayer = function (layer) {
        var e_8, _a, e_9, _b, e_10, _c, e_11, _d, e_12, _e, e_13, _f, e_14, _g;
        var _this = this;
        // if we are merging into ourselves, we're done
        if (layer.id === this.id) {
            return;
        }
        try {
            // we have to apply operations before we move fields so we can clean up existing
            // data if we have a delete before we copy over the values
            for (var _h = __values(Object.entries(layer.operations)), _j = _h.next(); !_j.done; _j = _h.next()) {
                var _k = __read(_j.value, 2), id = _k[0], ops = _k[1];
                var fields = {};
                try {
                    // merge the two operation maps
                    for (var _l = (e_9 = void 0, __values([this.operations[id], layer.operations[id]].filter(Boolean))), _m = _l.next(); !_m.done; _m = _l.next()) {
                        var opMap = _m.value;
                        try {
                            for (var _o = (e_10 = void 0, __values(Object.entries(opMap.fields || {}))), _p = _o.next(); !_p.done; _p = _o.next()) {
                                var _q = __read(_p.value, 2), fieldName = _q[0], operations = _q[1];
                                fields[fieldName] = __spreadArray(__spreadArray([], __read((fields[fieldName] || [])), false), __read(operations), false);
                            }
                        }
                        catch (e_10_1) { e_10 = { error: e_10_1 }; }
                        finally {
                            try {
                                if (_p && !_p.done && (_c = _o.return)) _c.call(_o);
                            }
                            finally { if (e_10) throw e_10.error; }
                        }
                    }
                }
                catch (e_9_1) { e_9 = { error: e_9_1 }; }
                finally {
                    try {
                        if (_m && !_m.done && (_b = _l.return)) _b.call(_l);
                    }
                    finally { if (e_9) throw e_9.error; }
                }
                // only copy a field key if there is something
                if (Object.keys(fields).length > 0) {
                    this.operations[id] = __assign(__assign({}, this.operations[id]), { fields: fields });
                }
                // if we are applying
                if (ops === null || ops === void 0 ? void 0 : ops.deleted) {
                    delete this.fields[id];
                    delete this.links[id];
                }
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (_j && !_j.done && (_a = _h.return)) _a.call(_h);
            }
            finally { if (e_8) throw e_8.error; }
        }
        try {
            // copy the field values
            for (var _r = __values(Object.entries(layer.fields)), _s = _r.next(); !_s.done; _s = _r.next()) {
                var _t = __read(_s.value, 2), id = _t[0], values = _t[1];
                if (!values) {
                    continue;
                }
                try {
                    // we do have a record matching this id, copy the individual fields
                    for (var _u = (e_12 = void 0, __values(Object.entries(values))), _v = _u.next(); !_v.done; _v = _u.next()) {
                        var _w = __read(_v.value, 2), field = _w[0], value = _w[1];
                        this.writeField(id, field, value);
                    }
                }
                catch (e_12_1) { e_12 = { error: e_12_1 }; }
                finally {
                    try {
                        if (_v && !_v.done && (_e = _u.return)) _e.call(_u);
                    }
                    finally { if (e_12) throw e_12.error; }
                }
            }
        }
        catch (e_11_1) { e_11 = { error: e_11_1 }; }
        finally {
            try {
                if (_s && !_s.done && (_d = _r.return)) _d.call(_r);
            }
            finally { if (e_11) throw e_11.error; }
        }
        try {
            // copy the link values
            for (var _x = __values(Object.entries(layer.links)), _y = _x.next(); !_y.done; _y = _x.next()) {
                var _z = __read(_y.value, 2), id = _z[0], values = _z[1];
                if (!values) {
                    continue;
                }
                try {
                    // we do have a record matching this id, copy the individual links
                    for (var _0 = (e_14 = void 0, __values(Object.entries(values))), _1 = _0.next(); !_1.done; _1 = _0.next()) {
                        var _2 = __read(_1.value, 2), field = _2[0], value = _2[1];
                        this.writeLink(id, field, value);
                    }
                }
                catch (e_14_1) { e_14 = { error: e_14_1 }; }
                finally {
                    try {
                        if (_1 && !_1.done && (_g = _0.return)) _g.call(_0);
                    }
                    finally { if (e_14) throw e_14.error; }
                }
            }
        }
        catch (e_13_1) { e_13 = { error: e_13_1 }; }
        finally {
            try {
                if (_y && !_y.done && (_f = _x.return)) _f.call(_x);
            }
            finally { if (e_13) throw e_13.error; }
        }
        // add the list of deleted ids to this layer
        layer.deletedIDs.forEach(function (v) { return _this.deletedIDs.add(v); });
    };
    Layer.prototype.addFieldOperation = function (id, field, operation) {
        var _a, _b;
        var _c;
        this.operations = __assign(__assign({}, this.operations), (_a = {}, _a[id] = __assign(__assign({}, this.operations[id]), { fields: (_b = {},
                _b[field] = __spreadArray(__spreadArray([], __read((((_c = this.operations[id]) === null || _c === void 0 ? void 0 : _c.fields[field]) || [])), false), [operation], false),
                _b) }), _a));
    };
    return Layer;
}());
exports.Layer = Layer;
function isDeleteOperation(value) {
    return !!value && value.kind === OperationKind.delete;
}
function isInsertOperation(value) {
    return !!value && value.kind === OperationKind.insert;
}
function isRemoveOperation(value) {
    return !!value && value.kind === OperationKind.remove;
}
var OperationLocation;
(function (OperationLocation) {
    OperationLocation["start"] = "start";
    OperationLocation["end"] = "end";
})(OperationLocation = exports.OperationLocation || (exports.OperationLocation = {}));
var OperationKind;
(function (OperationKind) {
    OperationKind["delete"] = "delete";
    OperationKind["insert"] = "insert";
    OperationKind["remove"] = "remove";
})(OperationKind = exports.OperationKind || (exports.OperationKind = {}));
