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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isScalar = exports.unmarshalSelection = exports.marshalInputs = exports.marshalSelection = void 0;
function marshalSelection(_a) {
    var config = _a.config, selection = _a.selection, data = _a.data;
    if (data === null || typeof data === 'undefined') {
        return data;
    }
    // if we are looking at a list
    if (Array.isArray(data)) {
        // unmarshal every entry in the list
        return data.map(function (val) { return marshalSelection({ config: config, selection: selection, data: val }); });
    }
    // we're looking at an object, build it up from the current input
    return Object.fromEntries(Object.entries(data).map(function (_a) {
        var _b;
        var _c = __read(_a, 2), fieldName = _c[0], value = _c[1];
        // look up the type for the field
        var _d = selection[fieldName], type = _d.type, fields = _d.fields;
        // if we don't have type information for this field, just use it directly
        // it's most likely a non-custom scalars or enums
        if (!type) {
            return [fieldName, value];
        }
        // if there is a sub selection, walk down the selection
        if (fields) {
            return [fieldName, marshalSelection({ config: config, selection: fields, data: value })];
        }
        // is the type something that requires marshaling
        if ((_b = config.scalars) === null || _b === void 0 ? void 0 : _b[type]) {
            var marshalFn = config.scalars[type].marshal;
            if (!marshalFn) {
                throw new Error("scalar type ".concat(type, " is missing a `marshal` function. see https://github.com/AlecAivazis/houdini#%EF%B8%8Fcustom-scalars"));
            }
            if (Array.isArray(value)) {
                return [fieldName, value.map(marshalFn)];
            }
            return [fieldName, marshalFn(value)];
        }
        // if the type doesn't require marshaling and isn't a referenced type
        // then the type is a scalar that doesn't require marshaling
        return [fieldName, value];
    }));
}
exports.marshalSelection = marshalSelection;
function marshalInputs(_a) {
    var artifact = _a.artifact, config = _a.config, input = _a.input, _b = _a.rootType, rootType = _b === void 0 ? '@root' : _b;
    if (input === null || typeof input === 'undefined') {
        return input;
    }
    // if there are no inputs in the object, nothing to do
    if (!artifact.input) {
        return input;
    }
    // the object containing the relevant fields
    var fields = rootType === '@root' ? artifact.input.fields : artifact.input.types[rootType];
    // if we are looking at a list
    if (Array.isArray(input)) {
        return input.map(function (val) { return marshalInputs({ artifact: artifact, config: config, input: val, rootType: rootType }); });
    }
    // we're looking at an object, build it up from the current input
    return Object.fromEntries(Object.entries(input).map(function (_a) {
        var _b, _c;
        var _d = __read(_a, 2), fieldName = _d[0], value = _d[1];
        // look up the type for the field
        var type = fields === null || fields === void 0 ? void 0 : fields[fieldName];
        // if we don't have type information for this field, just use it directly
        // it's most likely a non-custom scalars or enums
        if (!type) {
            return [fieldName, value];
        }
        // is the type something that requires marshaling
        var marshalFn = (_c = (_b = config.scalars) === null || _b === void 0 ? void 0 : _b[type]) === null || _c === void 0 ? void 0 : _c.marshal;
        if (marshalFn) {
            // if we are looking at a list of scalars
            if (Array.isArray(value)) {
                return [fieldName, value.map(marshalFn)];
            }
            return [fieldName, marshalFn(value)];
        }
        // if the type doesn't require marshaling and isn't a referenced type
        if (isScalar(config, type) || !artifact.input.types[type]) {
            return [fieldName, value];
        }
        // we ran into an object type that should be referenced by the artifact
        return [fieldName, marshalInputs({ artifact: artifact, config: config, input: value, rootType: type })];
    }));
}
exports.marshalInputs = marshalInputs;
function unmarshalSelection(config, selection, data) {
    if (data === null || typeof data === 'undefined') {
        return data;
    }
    // if we are looking at a list
    if (Array.isArray(data)) {
        // unmarshal every entry in the list
        return data.map(function (val) { return unmarshalSelection(config, selection, val); });
    }
    // we're looking at an object, build it up from the current input
    return Object.fromEntries(Object.entries(data).map(function (_a) {
        var _b, _c;
        var _d = __read(_a, 2), fieldName = _d[0], value = _d[1];
        // look up the type for the field
        var _e = selection[fieldName], type = _e.type, fields = _e.fields;
        // if we don't have type information for this field, just use it directly
        // it's most likely a non-custom scalars or enums
        if (!type) {
            return [fieldName, value];
        }
        // if there is a sub selection, walk down the selection
        if (fields) {
            return [
                fieldName,
                // unmarshalSelection({ artifact, config, input: value, rootType: type }),
                unmarshalSelection(config, fields, value),
            ];
        }
        // is the type something that requires marshaling
        if ((_c = (_b = config.scalars) === null || _b === void 0 ? void 0 : _b[type]) === null || _c === void 0 ? void 0 : _c.marshal) {
            var unmarshalFn = config.scalars[type].unmarshal;
            if (!unmarshalFn) {
                throw new Error("scalar type ".concat(type, " is missing an `unmarshal` function. see https://github.com/AlecAivazis/houdini#%EF%B8%8Fcustom-scalars"));
            }
            if (Array.isArray(value)) {
                return [fieldName, value.map(unmarshalFn)];
            }
            return [fieldName, unmarshalFn(value)];
        }
        // if the type doesn't require marshaling and isn't a referenced type
        // then the type is a scalar that doesn't require marshaling
        return [fieldName, value];
    }));
}
exports.unmarshalSelection = unmarshalSelection;
// we can't use config.isScalar because that would require bundling in ~/common
function isScalar(config, type) {
    return ['String', 'Boolean', 'Float', 'ID', 'Int']
        .concat(Object.keys(config.scalars || {}))
        .includes(type);
}
exports.isScalar = isScalar;
