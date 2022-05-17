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
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeID = exports.keyFieldsForType = exports.defaultConfigValues = void 0;
function defaultConfigValues(file) {
    return __assign(__assign({ defaultKeys: ['id'] }, file), { types: __assign({ Node: {
                keys: ['id'],
                resolve: {
                    queryField: 'node',
                    arguments: function (node) { return ({ id: node.id }); },
                },
            } }, file.types) });
}
exports.defaultConfigValues = defaultConfigValues;
function keyFieldsForType(configFile, type) {
    var _a, _b;
    return ((_b = (_a = configFile.types) === null || _a === void 0 ? void 0 : _a[type]) === null || _b === void 0 ? void 0 : _b.keys) || configFile.defaultKeys;
}
exports.keyFieldsForType = keyFieldsForType;
function computeID(configFile, type, data) {
    var e_1, _a;
    var fields = keyFieldsForType(configFile, type);
    var id = '';
    try {
        for (var fields_1 = __values(fields), fields_1_1 = fields_1.next(); !fields_1_1.done; fields_1_1 = fields_1.next()) {
            var field = fields_1_1.value;
            id += data[field] + '__';
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (fields_1_1 && !fields_1_1.done && (_a = fields_1.return)) _a.call(fields_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return id.slice(0, -2);
}
exports.computeID = computeID;
