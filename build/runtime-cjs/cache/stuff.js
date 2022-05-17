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
exports.evaluateKey = exports.flattenList = void 0;
function flattenList(source) {
    var e_1, _a;
    var flat = [];
    // we need to flatten the list links
    var unvisited = [source || []];
    while (unvisited.length > 0) {
        var target = unvisited.shift();
        try {
            for (var target_1 = (e_1 = void 0, __values(target)), target_1_1 = target_1.next(); !target_1_1.done; target_1_1 = target_1.next()) {
                var id = target_1_1.value;
                if (Array.isArray(id)) {
                    unvisited.push(id);
                    continue;
                }
                flat.push(id);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (target_1_1 && !target_1_1.done && (_a = target_1.return)) _a.call(target_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    return flat;
}
exports.flattenList = flattenList;
// given a raw key and a set of variables, generate the fully qualified key
function evaluateKey(key, variables) {
    var e_2, _a;
    if (variables === void 0) { variables = {}; }
    // accumulate the evaluated key
    var evaluated = '';
    // accumulate a variable name that we're evaluating
    var varName = '';
    // some state to track if we are "in" a string
    var inString = false;
    try {
        for (var key_1 = __values(key), key_1_1 = key_1.next(); !key_1_1.done; key_1_1 = key_1.next()) {
            var char = key_1_1.value;
            // if we are building up a variable
            if (varName) {
                // if we are looking at a valid variable character
                if (varChars.includes(char)) {
                    // add it to the variable name
                    varName += char;
                    continue;
                }
                // we are at the end of a variable name so we
                // need to clean up and add before continuing with the string
                // look up the variable and add the result (varName starts with a $)
                var value = variables[varName.slice(1)];
                evaluated += typeof value !== 'undefined' ? JSON.stringify(value) : 'undefined';
                // clear the variable name accumulator
                varName = '';
            }
            // if we are looking at the start of a variable
            if (char === '$' && !inString) {
                // start the accumulator
                varName = '$';
                // move along
                continue;
            }
            // if we found a quote, invert the string state
            if (char === '"') {
                inString = !inString;
            }
            // this isn't a special case, just add the letter to the value
            evaluated += char;
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (key_1_1 && !key_1_1.done && (_a = key_1.return)) _a.call(key_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return evaluated;
}
exports.evaluateKey = evaluateKey;
// the list of characters that make up a valid graphql variable name
var varChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789';
