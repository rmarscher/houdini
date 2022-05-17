"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphql = void 0;
__exportStar(require("./network"), exports);
__exportStar(require("./types"), exports);
__exportStar(require("./proxy"), exports);
__exportStar(require("./config"), exports);
var query_1 = require("./query");
Object.defineProperty(exports, "query", { enumerable: true, get: function () { return query_1.query; } });
Object.defineProperty(exports, "routeQuery", { enumerable: true, get: function () { return query_1.routeQuery; } });
Object.defineProperty(exports, "componentQuery", { enumerable: true, get: function () { return query_1.componentQuery; } });
var mutation_1 = require("./mutation");
Object.defineProperty(exports, "mutation", { enumerable: true, get: function () { return mutation_1.mutation; } });
var fragment_1 = require("./fragment");
Object.defineProperty(exports, "fragment", { enumerable: true, get: function () { return fragment_1.fragment; } });
var subscription_1 = require("./subscription");
Object.defineProperty(exports, "subscription", { enumerable: true, get: function () { return subscription_1.subscription; } });
var pagination_1 = require("./pagination");
Object.defineProperty(exports, "paginatedQuery", { enumerable: true, get: function () { return pagination_1.paginatedQuery; } });
Object.defineProperty(exports, "paginatedFragment", { enumerable: true, get: function () { return pagination_1.paginatedFragment; } });
// this template tag gets removed by the preprocessor so it should never be invoked.
// this function needs to return the same value as what the preprocessor leaves behind for type consistency
function graphql(str) {
    // if this is executed, the preprocessor is not enabled
    throw new Error("Looks like you don't have the preprocessor enabled.");
}
exports.graphql = graphql;
