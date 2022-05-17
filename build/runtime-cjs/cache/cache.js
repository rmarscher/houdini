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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootID = exports.Cache = void 0;
// local imports
var config_1 = require("../config");
var gc_1 = require("./gc");
var lists_1 = require("./lists");
var storage_1 = require("./storage");
var stuff_1 = require("./stuff");
var subscription_1 = require("./subscription");
var config_2 = require("../config");
var Cache = /** @class */ (function () {
    function Cache(config) {
        this._internal_unstable = new CacheInternal({
            cache: this,
            config: config_1.defaultConfigValues(config),
            storage: new storage_1.InMemoryStorage(),
            subscriptions: new subscription_1.InMemorySubscriptions(this),
            lists: new lists_1.ListManager(exports.rootID),
            lifetimes: new gc_1.GarbageCollector(this, config.cacheBufferSize),
        });
    }
    // walk down the selection and save the values that we encounter.
    // any changes will notify subscribers. writing to an optimistic layer will resolve it
    Cache.prototype.write = function (_a) {
        var e_1, _b;
        var _c;
        var layerID = _a.layer, _d = _a.notifySubscribers, notifySubscribers = _d === void 0 ? [] : _d, args = __rest(_a, ["layer", "notifySubscribers"]);
        // find the correct layer
        var layer = layerID
            ? this._internal_unstable.storage.getLayer(layerID)
            : this._internal_unstable.storage.topLayer;
        // write any values that we run into and get a list of subscribers
        var subscribers = this._internal_unstable.writeSelection(__assign(__assign({}, args), { layer: layer }));
        // the same spec will likely need to be updated multiple times, create the unique list by using the set
        // function's identity
        var notified = [];
        try {
            for (var _e = __values(subscribers.concat(notifySubscribers)), _f = _e.next(); !_f.done; _f = _e.next()) {
                var spec = _f.value;
                // if we haven't added the set yet
                if (!notified.includes(spec.set)) {
                    notified.push(spec.set);
                    // trigger the update
                    spec.set(this._internal_unstable.getSelection({
                        parent: spec.parentID || exports.rootID,
                        selection: spec.selection,
                        variables: ((_c = spec.variables) === null || _c === void 0 ? void 0 : _c.call(spec)) || {},
                    }).data);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // return the id to the caller so they can resolve the layer if it was optimistic
        return subscribers;
    };
    // reconstruct an object with the fields/relations specified by a selection
    Cache.prototype.read = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _b = (_a = this._internal_unstable).getSelection.apply(_a, __spread(args)), data = _b.data, partial = _b.partial, hasData = _b.hasData;
        if (!hasData) {
            return { data: null, partial: false };
        }
        return {
            data: data,
            partial: partial,
        };
    };
    // register the provided callbacks with the fields specified by the selection
    Cache.prototype.subscribe = function (spec, variables) {
        if (variables === void 0) { variables = {}; }
        // add the subscribers to every field in the specification
        return this._internal_unstable.subscriptions.add({
            parent: spec.parentID || exports.rootID,
            spec: spec,
            selection: spec.selection,
            variables: variables,
        });
    };
    // stop listening to a particular subscription
    Cache.prototype.unsubscribe = function (spec, variables) {
        if (variables === void 0) { variables = {}; }
        return this._internal_unstable.subscriptions.remove(spec.parentID || exports.rootID, spec.selection, [spec], variables);
    };
    // return the list handler to mutate a named list in the cache
    Cache.prototype.list = function (name, parentID) {
        var handler = this._internal_unstable.lists.get(name, parentID);
        if (!handler) {
            throw new Error("Cannot find list with name: " + name + (parentID ? 'under parent ' + parentID : '') + ". " + 'Is it possible that the query is not mounted?');
        }
        // return the handler
        return handler;
    };
    // remove the record from the cache's store and unsubscribe from it
    Cache.prototype.delete = function (id) {
        // clean up any subscribers associated with the record before we destroy the actual values that will let us
        // walk down
        this._internal_unstable.subscriptions.removeAllSubscribers(id);
        // make sure we remove the id from any lists that it appears in
        this._internal_unstable.lists.removeIDFromAllLists(id);
        // delete the record from the store
        this._internal_unstable.storage.delete(id);
    };
    return Cache;
}());
exports.Cache = Cache;
var CacheInternal = /** @class */ (function () {
    function CacheInternal(_a) {
        var config = _a.config, storage = _a.storage, subscriptions = _a.subscriptions, lists = _a.lists, cache = _a.cache, lifetimes = _a.lifetimes;
        // for server-side requests we need to be able to flag the cache as disabled so we dont write to it
        this._disabled = false;
        this.config = config;
        this.storage = storage;
        this.subscriptions = subscriptions;
        this.lists = lists;
        this.cache = cache;
        this.lifetimes = lifetimes;
        // the cache should always be disabled on the server
        try {
            this._disabled = typeof window === 'undefined';
        }
        catch (_b) {
            this._disabled = true;
        }
    }
    CacheInternal.prototype.writeSelection = function (_a) {
        var e_2, _b;
        var _this = this;
        var _c;
        var data = _a.data, selection = _a.selection, _d = _a.variables, variables = _d === void 0 ? {} : _d, _e = _a.root, root = _e === void 0 ? exports.rootID : _e, _f = _a.parent, parent = _f === void 0 ? exports.rootID : _f, _g = _a.applyUpdates, applyUpdates = _g === void 0 ? false : _g, layer = _a.layer, _h = _a.toNotify, toNotify = _h === void 0 ? [] : _h, forceNotify = _a.forceNotify;
        // if the cache is disabled, dont do anything
        if (this._disabled) {
            return [];
        }
        var _loop_1 = function (field, value) {
            var e_3, _a, e_4, _b, e_5, _c, e_6, _d, e_7, _e, e_8, _f;
            // grab the selection info we care about
            if (!selection || !selection[field]) {
                throw new Error('Could not find field listing in selection for ' +
                    field +
                    ' @ ' +
                    JSON.stringify(selection) +
                    '');
            }
            // look up the field in our schema
            var _g = selection[field], linkedType = _g.type, keyRaw = _g.keyRaw, fields = _g.fields, operations = _g.operations, isAbstract = _g.abstract, update = _g.update;
            var key = stuff_1.evaluateKey(keyRaw, variables);
            // the current set of subscribers
            var currentSubcribers = this_1.subscriptions.get(parent, key);
            // look up the previous value
            var _h = this_1.storage.get(parent, key), previousValue = _h.value, displayLayers = _h.displayLayers;
            // if the layer we are updating is the top most layer for the field
            // then its value is "live". It is providing the current value and
            // subscribers need to know if the value changed
            var displayLayer = layer.isDisplayLayer(displayLayers);
            // if we are writing to the display layer we need to refresh the lifetime of the value
            if (displayLayer) {
                this_1.lifetimes.resetLifetime(parent, key);
            }
            // any scalar is defined as a field with no selection
            if (!fields) {
                // the value to write to the layer
                var newValue = value;
                // if the value is an array, we might have to apply updates
                if (Array.isArray(value) && applyUpdates && update) {
                    // if we have to prepend the new value on the old one
                    if (update === 'append') {
                        newValue = (previousValue || []).concat(value);
                    }
                    // we might have to prepend our value onto the old one
                    else if (update === 'prepend') {
                        newValue = value.concat(previousValue || []);
                    }
                }
                // if the value changed on a layer that impacts the current latest value
                var valueChanged = JSON.stringify(newValue) !== JSON.stringify(previousValue);
                if (displayLayer && (valueChanged || forceNotify)) {
                    // we need to add the fields' subscribers to the set of callbacks
                    // we need to invoke
                    toNotify.push.apply(toNotify, __spread(currentSubcribers));
                }
                // write value to the layer
                layer.writeField(parent, key, newValue);
            }
            // if we are writing `null` over a link
            else if (value === null) {
                // if the previous value was also null, there's nothing to do
                if (previousValue === null) {
                    return "continue";
                }
                var previousLinks = stuff_1.flattenList([previousValue]);
                try {
                    for (var previousLinks_1 = (e_3 = void 0, __values(previousLinks)), previousLinks_1_1 = previousLinks_1.next(); !previousLinks_1_1.done; previousLinks_1_1 = previousLinks_1.next()) {
                        var link = previousLinks_1_1.value;
                        this_1.subscriptions.remove(link, fields, currentSubcribers, variables);
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (previousLinks_1_1 && !previousLinks_1_1.done && (_a = previousLinks_1.return)) _a.call(previousLinks_1);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                layer.writeLink(parent, key, null);
                // add the list of subscribers for this field
                toNotify.push.apply(toNotify, __spread(currentSubcribers));
            }
            // the field could point to a linked object
            else if (value instanceof Object && !Array.isArray(value)) {
                // the previous value is a string holding the id of the object to link to
                // if we ran into an interface we need to look at the __typename field
                if (isAbstract) {
                    // make sure we have a __typename field
                    if (!value.__typename) {
                        throw new Error('Encountered interface type without __typename in the payload');
                    }
                    // we need to look at the __typename field in the response for the type
                    linkedType = value.__typename;
                }
                // figure out if this is an embedded object or a linked one by looking for all of the fields marked as
                // required to compute the entity's id
                var embedded = ((_c = this_1.idFields(linkedType)) === null || _c === void 0 ? void 0 : _c.filter(function (field) { return typeof value[field] === 'undefined'; }).length) > 0;
                // figure out the new target of the object link
                var linkedID = null;
                if (value !== null) {
                    linkedID = !embedded ? this_1.id(linkedType, value) : parent + "." + key;
                }
                var linkChange = linkedID !== previousValue;
                // write the link to the layer
                layer.writeLink(parent, key, linkedID);
                // if the link target of this field changed and it was responsible for the current subscription
                if (linkedID && displayLayer && (linkChange || forceNotify)) {
                    // we need to clear the subscriptions in the previous link
                    // and add them to the new link
                    if (previousValue && typeof previousValue === 'string') {
                        this_1.subscriptions.remove(previousValue, fields, currentSubcribers, variables);
                    }
                    // copy the subscribers to the new value
                    this_1.subscriptions.addMany({
                        parent: linkedID,
                        selection: fields,
                        subscribers: currentSubcribers,
                        variables: variables,
                    });
                    toNotify.push.apply(toNotify, __spread(currentSubcribers));
                }
                // if the link target points to another record in the cache we need to walk down its
                // selection and update any values we run into
                if (linkedID) {
                    this_1.writeSelection({
                        root: root,
                        selection: fields,
                        parent: linkedID,
                        data: value,
                        variables: variables,
                        toNotify: toNotify,
                        applyUpdates: applyUpdates,
                        layer: layer,
                        forceNotify: true,
                    });
                }
            }
            // the field could point to a list of related objects
            else if (Array.isArray(value) &&
                // make typescript happy
                (typeof previousValue === 'undefined' || Array.isArray(previousValue))) {
                // make a shallow copy of the previous value we can  mutate
                var oldIDs_2 = __spread((previousValue || []));
                // this field could be a connection (a list of references to edge objects).
                // inserts in this list might insert objects into the connection that
                // have already been added as part of a list operation. if that happens
                // we will need to filter out ids that refer to these fake-edges which
                // can be idenfitied as not having a cursor or node value
                var emptyEdges_1 = !update
                    ? []
                    : oldIDs_2.map(function (id) {
                        if (!id) {
                            return '';
                        }
                        // look up the edge record
                        var cursorField = _this.storage.get(id, 'cursor').value;
                        // if there is a value for the cursor, it needs to remain
                        if (cursorField) {
                            return '';
                        }
                        // look up the node reference
                        var node = _this.storage.get(id, 'node').value;
                        // if there one, keep the edge
                        if (!node) {
                            return '';
                        }
                        // there is no cursor so the edge is empty
                        return node;
                    });
                // if we are supposed to prepend or append and the mutation is enabled
                // the new list of IDs for this link will start with an existing value
                // build up the list of linked ids
                var linkedIDs = [];
                // it could be a list of lists, in order to recreate the list of lists we need
                // we need to track two sets of IDs, the ids of the embedded records and
                // then the full structure of embedded lists. we'll use the flat list to add
                // and remove subscribers but we'll save the second list in the record so
                // we can recreate the structure
                var _j = this_1.extractNestedListIDs({
                    value: value,
                    abstract: Boolean(isAbstract),
                    specs: toNotify,
                    applyUpdates: applyUpdates,
                    recordID: parent,
                    key: key,
                    linkedType: linkedType,
                    variables: variables,
                    fields: fields,
                    layer: layer,
                    forceNotify: forceNotify,
                }), newIDs = _j.newIDs, nestedIDs = _j.nestedIDs;
                // if we're supposed to apply this write as an update, we need to figure out how
                if (applyUpdates && update) {
                    // if we are updating the edges field, we might need to do a little more than just
                    // append/prepend to the field value. we might need to wrap the values in extra references
                    if (key === 'edges') {
                        // build up a list of the ids found in the new list
                        var newNodeIDs_1 = [];
                        try {
                            for (var newIDs_1 = (e_4 = void 0, __values(newIDs)), newIDs_1_1 = newIDs_1.next(); !newIDs_1_1.done; newIDs_1_1 = newIDs_1.next()) {
                                var id = newIDs_1_1.value;
                                if (!id) {
                                    continue;
                                }
                                // look up the lined node record
                                var node = this_1.storage.get(id, 'node').value;
                                // node should be a reference
                                if (typeof node !== 'string') {
                                    continue;
                                }
                                // if we dont have type information or a valid reference
                                if (!node || !this_1.storage.get(node, '__typename')) {
                                    continue;
                                }
                                newNodeIDs_1.push(node);
                            }
                        }
                        catch (e_4_1) { e_4 = { error: e_4_1 }; }
                        finally {
                            try {
                                if (newIDs_1_1 && !newIDs_1_1.done && (_b = newIDs_1.return)) _b.call(newIDs_1);
                            }
                            finally { if (e_4) throw e_4.error; }
                        }
                        // only save a previous ID if the id shows up in the new list and was previously empty,
                        oldIDs_2 = oldIDs_2.filter(function (id) {
                            if (!id) {
                                return true;
                            }
                            // look up the node reference
                            var value = _this.storage.get(id, 'node').value;
                            var node = value;
                            // if the id is being adding and is part of the empty edges, don't include it
                            if (newNodeIDs_1.includes(node) && emptyEdges_1.includes(node)) {
                                return false;
                            }
                            // the id is not being replaced by a "real" version
                            return true;
                        });
                    }
                    // if we have to prepend it, do so
                    if (update === 'prepend') {
                        linkedIDs = newIDs.concat(oldIDs_2);
                    }
                    // otherwise we might have to append it
                    else if (update === 'append') {
                        linkedIDs = oldIDs_2.concat(newIDs);
                    }
                    // if the update is a replace do the right thing
                    else if (update === 'replace') {
                        linkedIDs = newIDs;
                    }
                }
                // we're not supposed to apply this write as an update, just use the new value
                else {
                    linkedIDs = nestedIDs;
                }
                // we have to notify the subscribers if a few things happen:
                // either the data changed (ie we got new content for the same list)
                // or we got content for a new list which could already be known. If we just look at
                // wether the IDs are the same, situations where we have old data that
                // is still valid would not be triggered
                var contentChanged = JSON.stringify(linkedIDs) !== JSON.stringify(oldIDs_2);
                // we need to look at the last time we saw each subscriber to check if they need to be added to the spec
                if (contentChanged || forceNotify) {
                    toNotify.push.apply(toNotify, __spread(currentSubcribers));
                }
                try {
                    // any ids that don't show up in the new list need to have their subscribers wiped
                    for (var oldIDs_1 = (e_5 = void 0, __values(oldIDs_2)), oldIDs_1_1 = oldIDs_1.next(); !oldIDs_1_1.done; oldIDs_1_1 = oldIDs_1.next()) {
                        var lostID = oldIDs_1_1.value;
                        if (linkedIDs.includes(lostID) || !lostID) {
                            continue;
                        }
                        this_1.subscriptions.remove(lostID, fields, currentSubcribers, variables);
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (oldIDs_1_1 && !oldIDs_1_1.done && (_c = oldIDs_1.return)) _c.call(oldIDs_1);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
                // if there was a change in the list
                if (contentChanged || (oldIDs_2.length === 0 && newIDs.length === 0)) {
                    // update the cached value
                    layer.writeLink(parent, key, linkedIDs);
                }
                try {
                    // every new id that isn't a prevous relationship needs a new subscriber
                    for (var _k = (e_6 = void 0, __values(newIDs.filter(function (id) { return !oldIDs_2.includes(id); }))), _l = _k.next(); !_l.done; _l = _k.next()) {
                        var id = _l.value;
                        if (id == null) {
                            continue;
                        }
                        this_1.subscriptions.addMany({
                            parent: id,
                            selection: fields,
                            subscribers: currentSubcribers,
                            variables: variables,
                        });
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (_l && !_l.done && (_d = _k.return)) _d.call(_k);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
            }
            try {
                // handle any operations relative to this node
                for (var _m = (e_7 = void 0, __values(operations || [])), _o = _m.next(); !_o.done; _o = _m.next()) {
                    var operation = _o.value;
                    // turn the ID into something we can use
                    var parentID = void 0;
                    if (operation.parentID) {
                        // if its a normal scalar we can use the value directly
                        if (operation.parentID.kind !== 'Variable') {
                            parentID = operation.parentID.value;
                        }
                        else {
                            var id = variables[operation.parentID.value];
                            if (typeof id !== 'string') {
                                throw new Error('parentID value must be a string');
                            }
                            parentID = id;
                        }
                    }
                    // if the necessary list doesn't exist, don't do anything
                    if (operation.list && !this_1.lists.get(operation.list, parentID)) {
                        continue;
                    }
                    // there could be a list of elements to perform the operation on
                    var targets = Array.isArray(value) ? value : [value];
                    try {
                        for (var targets_1 = (e_8 = void 0, __values(targets)), targets_1_1 = targets_1.next(); !targets_1_1.done; targets_1_1 = targets_1.next()) {
                            var target = targets_1_1.value;
                            // insert an object into a list
                            if (operation.action === 'insert' &&
                                target instanceof Object &&
                                fields &&
                                operation.list) {
                                this_1.cache
                                    .list(operation.list, parentID)
                                    .when(operation.when)
                                    .addToList(fields, target, variables, operation.position || 'last');
                            }
                            // remove object from list
                            else if (operation.action === 'remove' &&
                                target instanceof Object &&
                                fields &&
                                operation.list) {
                                this_1.cache
                                    .list(operation.list, parentID)
                                    .when(operation.when)
                                    .remove(target, variables);
                            }
                            // delete the target
                            else if (operation.action === 'delete' && operation.type) {
                                if (typeof target !== 'string') {
                                    throw new Error('Cannot delete a record with a non-string ID');
                                }
                                var targetID = this_1.id(operation.type, target);
                                if (!targetID) {
                                    continue;
                                }
                                this_1.cache.delete(targetID);
                            }
                            // the toggle operation
                            else if (operation.action === 'toggle' &&
                                target instanceof Object &&
                                fields &&
                                operation.list) {
                                this_1.cache
                                    .list(operation.list, parentID)
                                    .when(operation.when)
                                    .toggleElement(fields, target, variables, operation.position || 'last');
                            }
                        }
                    }
                    catch (e_8_1) { e_8 = { error: e_8_1 }; }
                    finally {
                        try {
                            if (targets_1_1 && !targets_1_1.done && (_f = targets_1.return)) _f.call(targets_1);
                        }
                        finally { if (e_8) throw e_8.error; }
                    }
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (_o && !_o.done && (_e = _m.return)) _e.call(_m);
                }
                finally { if (e_7) throw e_7.error; }
            }
        };
        var this_1 = this;
        try {
            // data is an object with fields that we need to write to the store
            for (var _j = __values(Object.entries(data)), _k = _j.next(); !_k.done; _k = _j.next()) {
                var _l = __read(_k.value, 2), field = _l[0], value = _l[1];
                _loop_1(field, value);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_k && !_k.done && (_b = _j.return)) _b.call(_j);
            }
            finally { if (e_2) throw e_2.error; }
        }
        // return the list of subscribers that need to be updated because of this change
        return toNotify;
    };
    // reconstruct an object defined by its selection
    CacheInternal.prototype.getSelection = function (_a) {
        var e_9, _b;
        var _c, _d;
        var selection = _a.selection, _e = _a.parent, parent = _e === void 0 ? exports.rootID : _e, variables = _a.variables;
        // we could be asking for values of null
        if (parent === null) {
            return { data: null, partial: false, hasData: true };
        }
        var target = {};
        // we need to track if we have a partial data set which means we have _something_ but not everything
        var hasData = false;
        // if we run into a single missing value we will flip this since it means we have a partial result
        var partial = false;
        // if we get an empty value for a non-null field, we need to turn the whole object null
        // that happens after we process every field to determine if its a partial null
        var cascadeNull = false;
        try {
            // look at every field in the parentFields
            for (var _f = __values(Object.entries(selection)), _g = _f.next(); !_g.done; _g = _f.next()) {
                var _h = __read(_g.value, 2), attributeName = _h[0], _j = _h[1], type = _j.type, keyRaw = _j.keyRaw, fields = _j.fields, nullable = _j.nullable;
                var key = stuff_1.evaluateKey(keyRaw, variables);
                // look up the value in our store
                var value = this.storage.get(parent, key).value;
                // if we dont have a value, we know this result is going to be partial
                if (typeof value === 'undefined') {
                    partial = true;
                }
                // if we dont have a value to return, use null (we check for non-null fields at the end)
                if (typeof value === 'undefined' || value === null) {
                    // set the value to null
                    target[attributeName] = null;
                    // if we didn't just write undefined, there is officially some data in this object
                    if (typeof value !== 'undefined') {
                        hasData = true;
                    }
                }
                // if the field is a scalar
                else if (!fields) {
                    // is the type a custom scalar with a specified unmarshal function
                    if ((_d = (_c = this.config.scalars) === null || _c === void 0 ? void 0 : _c[type]) === null || _d === void 0 ? void 0 : _d.unmarshal) {
                        // pass the primitive value to the unmarshal function
                        target[attributeName] = this.config.scalars[type].unmarshal(value);
                    }
                    // the field does not have an unmarshal function
                    else {
                        target[attributeName] = value;
                    }
                    hasData = true;
                }
                // if the field is a list of records
                else if (Array.isArray(value)) {
                    // the linked list could be a deeply nested thing, we need to call getData for each record
                    var listValue = this.hydrateNestedList({
                        fields: fields,
                        variables: variables,
                        linkedList: value,
                    });
                    // save the hydrated list
                    target[attributeName] = listValue.data;
                    // the linked value could have partial results
                    if (listValue.partial) {
                        partial = true;
                    }
                    if (listValue.hasData) {
                        hasData = true;
                    }
                }
                // otherwise the field is a linked object
                else {
                    // look up the related object fields
                    var objectFields = this.getSelection({
                        parent: value,
                        selection: fields,
                        variables: variables,
                    });
                    // save the object value
                    target[attributeName] = objectFields.data;
                    // the linked value could have partial results
                    if (objectFields.partial) {
                        partial = true;
                    }
                    if (objectFields.hasData) {
                        hasData = true;
                    }
                }
                // regardless of how the field was processed, if we got a null value assigned
                // and the field is not nullable, we need to cascade up
                if (target[attributeName] === null && !nullable) {
                    cascadeNull = true;
                }
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
            }
            finally { if (e_9) throw e_9.error; }
        }
        return {
            data: cascadeNull ? null : target,
            // our value is considered true if there is some data but not everything
            // has a full value
            partial: hasData && partial,
            hasData: hasData,
        };
    };
    CacheInternal.prototype.id = function (type, data) {
        // try to compute the id of the record
        var id = typeof data === 'string' ? data : this.computeID(type, data);
        if (!id) {
            return null;
        }
        return type + ':' + id;
    };
    // the list of fields that we need in order to compute an objects id
    CacheInternal.prototype.idFields = function (type) {
        return config_2.keyFieldsForType(this.config, type);
    };
    CacheInternal.prototype.computeID = function (type, data) {
        return config_2.computeID(this.config, type, data);
    };
    CacheInternal.prototype.hydrateNestedList = function (_a) {
        var e_10, _b;
        var fields = _a.fields, variables = _a.variables, linkedList = _a.linkedList;
        // the linked list could be a deeply nested thing, we need to call getData for each record
        // we can't mutate the lists because that would change the id references in the listLinks map
        // to the corresponding record. can't have that now, can we?
        var result = [];
        var partialData = false;
        var hasValues = false;
        try {
            for (var linkedList_1 = __values(linkedList), linkedList_1_1 = linkedList_1.next(); !linkedList_1_1.done; linkedList_1_1 = linkedList_1.next()) {
                var entry = linkedList_1_1.value;
                // if the entry is an array, keep going
                if (Array.isArray(entry)) {
                    var nestedValue = this.hydrateNestedList({ fields: fields, variables: variables, linkedList: entry });
                    result.push(nestedValue.data);
                    if (nestedValue.partial) {
                        partialData = true;
                    }
                    continue;
                }
                // the entry could be null
                if (entry === null) {
                    result.push(entry);
                    continue;
                }
                // look up the data for the record
                var _c = this.getSelection({
                    parent: entry,
                    selection: fields,
                    variables: variables,
                }), data = _c.data, partial = _c.partial, hasData = _c.hasData;
                result.push(data);
                if (partial) {
                    partialData = true;
                }
                if (hasData) {
                    hasValues = true;
                }
            }
        }
        catch (e_10_1) { e_10 = { error: e_10_1 }; }
        finally {
            try {
                if (linkedList_1_1 && !linkedList_1_1.done && (_b = linkedList_1.return)) _b.call(linkedList_1);
            }
            finally { if (e_10) throw e_10.error; }
        }
        return {
            data: result,
            partial: partialData,
            hasData: hasValues,
        };
    };
    CacheInternal.prototype.extractNestedListIDs = function (_a) {
        var e_11, _b;
        var _c;
        var value = _a.value, abstract = _a.abstract, recordID = _a.recordID, key = _a.key, linkedType = _a.linkedType, fields = _a.fields, variables = _a.variables, applyUpdates = _a.applyUpdates, specs = _a.specs, layer = _a.layer, forceNotify = _a.forceNotify;
        // build up the two lists
        var nestedIDs = [];
        var newIDs = [];
        var _loop_2 = function (i, entry) {
            // if we found another list
            if (Array.isArray(entry)) {
                // compute the nested list of ids
                var inner = this_2.extractNestedListIDs({
                    value: entry,
                    abstract: abstract,
                    recordID: recordID,
                    key: key,
                    linkedType: linkedType,
                    fields: fields,
                    variables: variables,
                    applyUpdates: applyUpdates,
                    specs: specs,
                    layer: layer,
                    forceNotify: forceNotify,
                });
                // add the list of new ids to our list
                newIDs.push.apply(newIDs, __spread(inner.newIDs));
                // and use the nested form in place of it
                nestedIDs[i] = inner.nestedIDs;
                return "continue";
            }
            // if the value is null just use that
            if (entry === null || typeof entry === 'undefined') {
                newIDs.push(null);
                nestedIDs[i] = null;
                return "continue";
            }
            // we know now that entry is an object
            var entryObj = entry;
            // start off building up the embedded id
            // @ts-ignore
            var linkedID = recordID + "." + key + "[" + this_2.storage.nextRank + "]";
            // figure out if this is an embedded list or a linked one by looking for all of the fields marked as
            // required to compute the entity's id
            var embedded = ((_c = this_2.idFields(linkedType)) === null || _c === void 0 ? void 0 : _c.filter(function (field) { return typeof entry[field] === 'undefined'; }).length) > 0;
            var typename = entryObj.__typename;
            var innerType = linkedType;
            // if we ran into an interface
            if (abstract) {
                // make sure we have a __typename field
                if (!typename) {
                    throw new Error('Encountered interface type without __typename in the payload');
                }
                // we need to look at the __typename field in the response for the type
                innerType = typename;
            }
            // if this isn't an embedded reference, use the entry's id in the link list
            if (!embedded) {
                var id = this_2.id(innerType, entry);
                if (id) {
                    linkedID = id;
                }
                else {
                    return "continue";
                }
            }
            // update the linked fields too
            this_2.writeSelection({
                root: exports.rootID,
                selection: fields,
                parent: linkedID,
                data: entryObj,
                variables: variables,
                toNotify: specs,
                applyUpdates: applyUpdates,
                layer: layer,
                forceNotify: forceNotify,
            });
            newIDs.push(linkedID);
            nestedIDs[i] = linkedID;
        };
        var this_2 = this;
        try {
            for (var _d = __values(value.entries()), _e = _d.next(); !_e.done; _e = _d.next()) {
                var _f = __read(_e.value, 2), i = _f[0], entry = _f[1];
                _loop_2(i, entry);
            }
        }
        catch (e_11_1) { e_11 = { error: e_11_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
            }
            finally { if (e_11) throw e_11.error; }
        }
        return { newIDs: newIDs, nestedIDs: nestedIDs };
    };
    CacheInternal.prototype.collectGarbage = function () {
        // increment the lifetimes of unused data
        this.lifetimes.tick();
        // if there is only one layer in the cache, clean up the data
        if (this.storage.layerCount === 1) {
            this.storage.topLayer.removeUndefinedFields();
        }
    };
    return CacheInternal;
}());
// fields on the root of the data store are keyed with a fixed id
exports.rootID = '_ROOT_';
