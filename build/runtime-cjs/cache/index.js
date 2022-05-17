"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cache_1 = require("./cache");
var cache;
try {
    // @ts-ignore: config will be defined by the generator
    cache = new cache_1.Cache(config || {});
}
catch (_a) {
    // @ts-ignore
    cache = new cache_1.Cache({});
}
exports.default = cache;
