"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVariables = exports.setVariables = void 0;
var svelte_1 = require("svelte");
exports.setVariables = function (vars) { return svelte_1.setContext('variables', vars); };
exports.getVariables = function () { return svelte_1.getContext('variables') || (function () { return ({}); }); };
