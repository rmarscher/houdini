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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginatedFragment = exports.paginatedQuery = void 0;
// externals
var store_1 = require("svelte/store");
var query_1 = require("./query");
var fragment_1 = require("./fragment");
var context_1 = require("./context");
var network_1 = require("./network");
var cache_1 = __importDefault(require("./cache"));
// @ts-ignore: this file will get generated and does not exist in the source code
var adapter_mjs_1 = require("./adapter.mjs");
// this has to be in a separate file since config isn't defined in cache/index.ts
var utils_1 = require("./utils");
var config_1 = require("./config");
function paginatedQuery(document) {
    // make sure we got a query document
    if (document.kind !== 'HoudiniQuery') {
        throw new Error('paginatedQuery() must be passed a query document');
    }
    // @ts-ignore: typing esm/cjs interop is hard
    var artifact = document.artifact.default || document.artifact;
    // if there's no refetch config for the artifact there's a problem
    if (!artifact.refetch) {
        throw new Error('paginatedQuery must be passed a query with @paginate.');
    }
    // pass the artifact to the base query operation
    var _a = query_1.query(document), data = _a.data, loading = _a.loading, refetch = _a.refetch, partial = _a.partial, onLoad = _a.onLoad, restOfQueryResponse = __rest(_a, ["data", "loading", "refetch", "partial", "onLoad"]);
    var paginationPartial = store_1.writable(false);
    partial.subscribe(function (val) {
        paginationPartial.set(val);
    });
    return __assign(__assign({ data: data, partial: { subscribe: paginationPartial.subscribe }, onLoad: function (newValue) {
            onLoad.call(this, newValue);
            // keep the partial store in sync
            paginationPartial.set(newValue.partial);
        } }, paginationHandlers({
        config: document.config,
        initialValue: document.initialValue.data,
        store: data,
        artifact: artifact,
        queryVariables: function () { return document.variables; },
        documentLoading: loading,
        refetch: refetch,
        partial: paginationPartial,
    })), restOfQueryResponse);
}
exports.paginatedQuery = paginatedQuery;
function paginatedFragment(document, initialValue) {
    var _a, _b;
    // make sure we got a query document
    if (document.kind !== 'HoudiniFragment') {
        throw new Error('paginatedFragment() must be passed a fragment document');
    }
    // if we don't have a pagination fragment there is a problem
    if (!document.paginationArtifact) {
        throw new Error('paginatedFragment must be passed a fragment with @paginate');
    }
    // pass the inputs to the normal fragment function
    var data = fragment_1.fragment(document, initialValue);
    // @ts-ignore: typing esm/cjs interop is hard
    var fragmentArtifact = document.artifact.default || document.artifact;
    var paginationArtifact = 
    // @ts-ignore: typing esm/cjs interop is hard
    document.paginationArtifact.default || document.paginationArtifact;
    var partial = store_1.writable(false);
    var targetType = (paginationArtifact.refetch || {}).targetType;
    var typeConfig = (_a = document.config.types) === null || _a === void 0 ? void 0 : _a[targetType || ''];
    if (!typeConfig) {
        throw new Error("Missing type refetch configuration for " + targetType + ". For more information, see https://www.houdinigraphql.com/guides/pagination#paginated-fragments");
    }
    var queryVariables = function () { return ({}); };
    // if the query is embedded we have to figure out the correct variables to pass
    if (paginationArtifact.refetch.embedded) {
        // if we have a specific function to use when computing the variables
        if ((_b = typeConfig.resolve) === null || _b === void 0 ? void 0 : _b.arguments) {
            queryVariables = function () { var _a, _b; return ((_b = (_a = typeConfig.resolve).arguments) === null || _b === void 0 ? void 0 : _b.call(_a, initialValue)) || {}; };
        }
        else {
            var keys_1 = config_1.keyFieldsForType(document.config, targetType || '');
            // @ts-ignore
            queryVariables = function () { return Object.fromEntries(keys_1.map(function (key) { return [key, initialValue[key]]; })); };
        }
    }
    return __assign({ data: data }, paginationHandlers({
        config: document.config,
        partial: partial,
        initialValue: initialValue,
        store: data,
        artifact: paginationArtifact,
        queryVariables: queryVariables,
    }));
}
exports.paginatedFragment = paginatedFragment;
function paginationHandlers(_a) {
    var _b;
    var initialValue = _a.initialValue, artifact = _a.artifact, store = _a.store, queryVariables = _a.queryVariables, documentLoading = _a.documentLoading, refetch = _a.refetch, partial = _a.partial, config = _a.config;
    // start with the defaults and no meaningful page info
    var loadPreviousPage = defaultLoadPreviousPage;
    var loadNextPage = defaultLoadNextPage;
    var pageInfo = store_1.readable({
        startCursor: null,
        endCursor: null,
        hasNextPage: false,
        hasPreviousPage: false,
    }, function () { });
    // loading state
    var paginationLoadingState = store_1.writable(false);
    var refetchQuery;
    // if the artifact supports cursor based pagination
    if (((_b = artifact.refetch) === null || _b === void 0 ? void 0 : _b.method) === 'cursor') {
        // generate the cursor handlers
        var cursor = cursorHandlers({
            initialValue: initialValue,
            artifact: artifact,
            store: store,
            queryVariables: queryVariables,
            loading: paginationLoadingState,
            refetch: refetch,
            partial: partial,
            config: config,
        });
        // always track pageInfo
        pageInfo = cursor.pageInfo;
        // always use the refetch fn
        refetchQuery = cursor.refetch;
        // if we are implementing forward pagination
        if (artifact.refetch.update === 'append') {
            loadNextPage = cursor.loadNextPage;
        }
        // the artifact implements backwards pagination
        else {
            loadPreviousPage = cursor.loadPreviousPage;
        }
    }
    // the artifact supports offset-based pagination, only loadNextPage is valid
    else {
        var offset = offsetPaginationHandler({
            initialValue: initialValue,
            artifact: artifact,
            queryVariables: queryVariables,
            loading: paginationLoadingState,
            refetch: refetch,
            store: store,
            partial: partial,
        });
        loadNextPage = offset.loadPage;
        refetchQuery = offset.refetch;
    }
    // if no loading state was provided just use a store that's always false
    if (!documentLoading) {
        documentLoading = store_1.readable(false, function () { });
    }
    // merge the pagination and document loading state
    var loading = store_1.derived([paginationLoadingState, documentLoading], function ($loadingStates) { return $loadingStates[0] || $loadingStates[1]; });
    return { loadNextPage: loadNextPage, loadPreviousPage: loadPreviousPage, pageInfo: pageInfo, loading: loading, refetch: refetchQuery };
}
function cursorHandlers(_a) {
    var _this = this;
    var _b;
    var config = _a.config, initialValue = _a.initialValue, artifact = _a.artifact, store = _a.store, extraVariables = _a.queryVariables, loading = _a.loading, refetch = _a.refetch, partial = _a.partial;
    // pull out the context accessors
    var variables = context_1.getVariables();
    var sessionStore = adapter_mjs_1.getSession();
    // track the current page info in an easy-to-reach store
    var initialPageInfo = (_b = utils_1.extractPageInfo(initialValue, artifact.refetch.path)) !== null && _b !== void 0 ? _b : {
        startCursor: null,
        endCursor: null,
        hasNextPage: false,
        hasPreviousPage: false,
    };
    var pageInfo = store_1.writable(initialPageInfo);
    // hold onto the current value
    var value = initialValue;
    store.subscribe(function (val) {
        pageInfo.set(utils_1.extractPageInfo(val, artifact.refetch.path));
        value = val;
    });
    // dry up the page-loading logic
    var loadPage = function (_a) {
        var pageSizeVar = _a.pageSizeVar, input = _a.input, functionName = _a.functionName;
        return __awaiter(_this, void 0, void 0, function () {
            var queryVariables, _b, result, partialData, resultPath, targetType;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        // set the loading state to true
                        loading.set(true);
                        queryVariables = __assign(__assign(__assign({}, extraVariables), variables()), input);
                        // if we don't have a value for the page size, tell the user
                        if (!queryVariables[pageSizeVar] && !artifact.refetch.pageSize) {
                            throw missingPageSizeError(functionName);
                        }
                        return [4 /*yield*/, network_1.executeQuery(artifact, queryVariables, sessionStore, false)];
                    case 1:
                        _b = _e.sent(), result = _b.result, partialData = _b.partial;
                        partial.set(partialData);
                        resultPath = __spread(artifact.refetch.path);
                        if (artifact.refetch.embedded) {
                            targetType = artifact.refetch.targetType;
                            // make sure we have a type config for the pagination target type
                            if (!((_d = (_c = config.types) === null || _c === void 0 ? void 0 : _c[targetType]) === null || _d === void 0 ? void 0 : _d.resolve)) {
                                throw new Error("Missing type resolve configuration for " + targetType + ". For more information, see https://www.houdinigraphql.com/guides/pagination#paginated-fragments");
                            }
                            // make sure that we pull the value out of the correct query field
                            resultPath.unshift(config.types[targetType].resolve.queryField);
                        }
                        // we need to find the connection object holding the current page info
                        pageInfo.set(utils_1.extractPageInfo(result.data, resultPath));
                        // update cache with the result
                        cache_1.default.write({
                            selection: artifact.selection,
                            data: result.data,
                            variables: queryVariables,
                            applyUpdates: true,
                        });
                        // we're not loading any more
                        loading.set(false);
                        return [2 /*return*/];
                }
            });
        });
    };
    return {
        loading: loading,
        loadNextPage: function (pageCount) { return __awaiter(_this, void 0, void 0, function () {
            var currentPageInfo, input;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentPageInfo = utils_1.extractPageInfo(value, artifact.refetch.path);
                        // if there is no next page, we're done
                        if (!currentPageInfo.hasNextPage) {
                            return [2 /*return*/];
                        }
                        input = {
                            after: currentPageInfo.endCursor,
                        };
                        if (pageCount) {
                            input.first = pageCount;
                        }
                        return [4 /*yield*/, loadPage({
                                pageSizeVar: 'first',
                                functionName: 'loadNextPage',
                                input: input,
                            })];
                    case 1: 
                    // load the page
                    return [2 /*return*/, _a.sent()];
                }
            });
        }); },
        loadPreviousPage: function (pageCount) { return __awaiter(_this, void 0, void 0, function () {
            var currentPageInfo, input;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentPageInfo = utils_1.extractPageInfo(value, artifact.refetch.path);
                        // if there is no next page, we're done
                        if (!currentPageInfo.hasPreviousPage) {
                            return [2 /*return*/];
                        }
                        input = {
                            before: currentPageInfo.startCursor,
                        };
                        if (pageCount) {
                            input.last = pageCount;
                        }
                        return [4 /*yield*/, loadPage({
                                pageSizeVar: 'last',
                                functionName: 'loadPreviousPage',
                                input: input,
                            })];
                    case 1: 
                    // load the page
                    return [2 /*return*/, _a.sent()];
                }
            });
        }); },
        pageInfo: { subscribe: pageInfo.subscribe },
        refetch: function (input) {
            return __awaiter(this, void 0, void 0, function () {
                var count, queryVariables, _a, result, partialData;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            // if this document shouldn't be refetched, don't do anything
                            if (!refetch) {
                                return [2 /*return*/];
                            }
                            // if the input is different than the query variables then we just do everything like normal
                            if (input && JSON.stringify(variables()) !== JSON.stringify(input)) {
                                return [2 /*return*/, refetch(input)];
                            }
                            count = utils_1.countPage(artifact.refetch.path.concat('edges'), value) ||
                                artifact.refetch.pageSize;
                            queryVariables = __assign(__assign(__assign({}, variables()), extraVariables), (_b = {}, _b[artifact.refetch.update === 'prepend' ? 'last' : 'first'] = count, _b));
                            // set the loading state to true
                            loading.set(true);
                            return [4 /*yield*/, network_1.executeQuery(artifact, queryVariables, sessionStore, false)];
                        case 1:
                            _a = _c.sent(), result = _a.result, partialData = _a.partial;
                            partial.set(partialData);
                            // update cache with the result
                            cache_1.default.write({
                                selection: artifact.selection,
                                data: result.data,
                                variables: queryVariables,
                                // overwrite the current data
                                applyUpdates: false,
                            });
                            // we're not loading any more
                            loading.set(false);
                            return [2 /*return*/];
                    }
                });
            });
        },
    };
}
function offsetPaginationHandler(_a) {
    var _this = this;
    var _b;
    var artifact = _a.artifact, extraVariables = _a.queryVariables, loading = _a.loading, refetch = _a.refetch, initialValue = _a.initialValue, store = _a.store, partial = _a.partial;
    // we need to track the most recent offset for this handler
    var currentOffset = ((_b = artifact.refetch) === null || _b === void 0 ? void 0 : _b.start) || 0;
    // grab the context getters
    var variables = context_1.getVariables();
    var sessionStore = adapter_mjs_1.getSession();
    // hold onto the current value
    var value = initialValue;
    store.subscribe(function (val) {
        value = val;
    });
    return {
        loadPage: function (limit) { return __awaiter(_this, void 0, void 0, function () {
            var queryVariables, _a, result, partialData, pageSize;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        queryVariables = __assign(__assign(__assign({}, variables()), extraVariables), { offset: currentOffset });
                        if (limit) {
                            queryVariables.limit = limit;
                        }
                        // if we made it this far without a limit argument and there's no default page size,
                        // they made a mistake
                        if (!queryVariables.limit && !artifact.refetch.pageSize) {
                            throw missingPageSizeError('loadNextPage');
                        }
                        // set the loading state to true
                        loading.set(true);
                        return [4 /*yield*/, network_1.executeQuery(artifact, queryVariables, sessionStore, false)];
                    case 1:
                        _a = _b.sent(), result = _a.result, partialData = _a.partial;
                        partial.set(partialData);
                        // update cache with the result
                        cache_1.default.write({
                            selection: artifact.selection,
                            data: result.data,
                            variables: queryVariables,
                            applyUpdates: true,
                        });
                        pageSize = queryVariables.limit || artifact.refetch.pageSize;
                        currentOffset += pageSize;
                        // we're not loading any more
                        loading.set(false);
                        return [2 /*return*/];
                }
            });
        }); },
        refetch: function (input) {
            return __awaiter(this, void 0, void 0, function () {
                var count, queryVariables, _a, result, partialData;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            // if this document shouldn't be refetched, don't do anything
                            if (!refetch) {
                                return [2 /*return*/];
                            }
                            // if the input is different than the query variables then we just do everything like normal
                            if (input && JSON.stringify(variables()) !== JSON.stringify(input)) {
                                return [2 /*return*/, refetch(input)];
                            }
                            count = utils_1.countPage(artifact.refetch.path, value);
                            queryVariables = __assign(__assign(__assign({}, variables()), extraVariables), { limit: count });
                            // set the loading state to true
                            loading.set(true);
                            return [4 /*yield*/, network_1.executeQuery(artifact, queryVariables, sessionStore, false)];
                        case 1:
                            _a = _b.sent(), result = _a.result, partialData = _a.partial;
                            partial.set(partialData);
                            // update cache with the result
                            cache_1.default.write({
                                selection: artifact.selection,
                                data: result.data,
                                variables: queryVariables,
                                applyUpdates: true,
                            });
                            // we're not loading any more
                            loading.set(false);
                            return [2 /*return*/];
                    }
                });
            });
        },
    };
}
function defaultLoadNextPage() {
    throw new Error('loadNextPage() only works on fields marked @paginate that implement forward cursor or offset pagination.');
}
function defaultLoadPreviousPage() {
    throw new Error('loadPreviousPage() only works on fields marked @paginate that implement backward cursor pagination.');
}
function missingPageSizeError(fnName) {
    return new Error('Loading a page with no page size. If you are paginating a field with a variable page size, ' +
        ("you have to pass a value to `" + fnName + "`. If you don't care to have the page size vary, ") +
        'consider passing a fixed value to the field instead.');
}
