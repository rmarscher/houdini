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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.componentQuery = exports.routeQuery = exports.query = void 0;
// externals
var store_1 = require("svelte/store");
var svelte_1 = require("svelte");
var types_1 = require("./types");
var cache_1 = __importDefault(require("./cache"));
var context_1 = require("./context");
var network_1 = require("./network");
var scalars_1 = require("./scalars");
// @ts-ignore: this file will get generated and does not exist in the source code
var adapter_mjs_1 = require("./adapter.mjs");
function query(document) {
    var _a;
    // make sure we got a query document
    if (document.kind !== 'HoudiniQuery') {
        throw new Error('query() must be passed a query document');
    }
    // we might get re-exported values nested under default
    // @ts-ignore: typing esm/cjs interop is hard
    var artifact = document.artifact.default || document.artifact;
    // @ts-ignore: typing esm/cjs interop is hard
    var config = document.config.default || document.config;
    // a query is never 'loading'
    var loading = (0, store_1.writable)(false);
    // track the partial state
    var partial = (0, store_1.writable)(document.partial);
    // this payload has already been marshaled
    var variables = document.variables;
    // embed the variables in the components context
    (0, context_1.setVariables)(function () {
        return variables;
    });
    // dry the reference to the initial value
    var initialValue = (_a = document.initialValue) === null || _a === void 0 ? void 0 : _a.data;
    // define the store we will hold the data
    var store = (0, store_1.writable)((0, scalars_1.unmarshalSelection)(config, artifact.selection, initialValue));
    // pull out the writer for internal use
    var subscriptionSpec = {
        rootType: artifact.rootType,
        selection: artifact.selection,
        variables: function () { return variables; },
        set: store.set,
    };
    // when the component mounts
    (0, svelte_1.onMount)(function () {
        // if we were given data on mount
        if (initialValue) {
            // update the cache with the data that we just ran into
            cache_1.default.write({
                selection: artifact.selection,
                data: initialValue,
                variables: variables,
            });
            // stay up to date
            if (subscriptionSpec) {
                cache_1.default.subscribe(subscriptionSpec, variables);
            }
        }
    });
    // the function used to clean up the store
    (0, svelte_1.onDestroy)(function () {
        subscriptionSpec = null;
        cache_1.default.unsubscribe({
            rootType: artifact.rootType,
            selection: artifact.selection,
            set: store.set,
            variables: function () { return variables; },
        }, variables);
    });
    var sessionStore = (0, adapter_mjs_1.getSession)();
    function writeData(newData, newVariables) {
        var updated = subscriptionSpec && JSON.stringify(variables) !== JSON.stringify(newVariables);
        // if the variables changed we need to unsubscribe from the old fields and
        // listen to the new ones
        if (updated) {
            cache_1.default.unsubscribe(subscriptionSpec, variables);
        }
        // write the data we received
        cache_1.default.write({
            selection: artifact.selection,
            data: newData.data,
            variables: newVariables,
        });
        if (updated) {
            cache_1.default.subscribe(subscriptionSpec, newVariables);
        }
        // update the local store
        store.set((0, scalars_1.unmarshalSelection)(config, artifact.selection, newData.data));
        // save the new variables
        variables = newVariables || {};
    }
    return {
        // the store should be read-only from the caller's perspective
        data: { subscribe: store.subscribe },
        // the refetch function can be used to refetch queries possibly with new variables/arguments
        refetch: function (newVariables) {
            return __awaiter(this, void 0, void 0, function () {
                var variableBag, _a, result, partialData, error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            loading.set(true);
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            variableBag = variables;
                            // If new variables are set spread the new variables over the previous ones.
                            if (newVariables) {
                                variableBag = __assign(__assign({}, variableBag), newVariables);
                            }
                            return [4 /*yield*/, (0, network_1.executeQuery)(artifact, variableBag, sessionStore, false)];
                        case 2:
                            _a = _b.sent(), result = _a.result, partialData = _a.partial;
                            partial.set(partialData);
                            // Write the data to the cache
                            writeData(result, variableBag);
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _b.sent();
                            throw error_1;
                        case 4:
                            // track the loading state
                            loading.set(false);
                            return [2 /*return*/];
                    }
                });
            });
        },
        // used primarily by the preprocessor to keep local state in sync with
        // the data given by preload
        writeData: writeData,
        loading: { subscribe: loading.subscribe },
        partial: { subscribe: partial.subscribe },
        error: (0, store_1.readable)(null, function () { }),
        onLoad: function (newValue) {
            // we got new data from mounting, write it
            writeData(newValue.result, newValue.variables);
            // keep the partial store in sync
            partial.set(newValue.partial);
            // if we are mounting on a browser we might need to perform an additional network request
            if (adapter_mjs_1.isBrowser) {
                // if the data was loaded from a cached value, and the document cache policy wants a
                // network request to be sent after the data was loaded, load the data
                if (newValue.source === types_1.DataSource.Cache &&
                    artifact.policy === types_1.CachePolicy.CacheAndNetwork) {
                    // this will invoke pagination's refetch because of javascript's magic this binding
                    this.refetch();
                }
                // if we have a partial result and we can load the rest of the data
                // from the network, send the request
                if (newValue.partial && artifact.policy === types_1.CachePolicy.CacheOrNetwork) {
                    this.refetch();
                }
            }
        },
    };
}
exports.query = query;
// we need something to dress up the result of `query` to be used for a route.
var routeQuery = function (_a) {
    var queryHandler = _a.queryHandler, artifact = _a.artifact, source = _a.source;
    // the query handler doesn't need any extra treatment for a route
    return queryHandler;
};
exports.routeQuery = routeQuery;
// component queries are implemented as wrappers over the normal query that fire the
// appropriate network request and then write the result to the underlying store
var componentQuery = function (_a) {
    var config = _a.config, artifact = _a.artifact, queryHandler = _a.queryHandler, variableFunction = _a.variableFunction, getProps = _a.getProps;
    // pull out the function we'll use to update the store after we've fired it
    var writeData = queryHandler.writeData, refetch = queryHandler.refetch;
    // we need our own store to track loading state (the handler's isn't meaningful)
    var loading = (0, store_1.writable)(true);
    // a store to track the error state
    var error = (0, store_1.writable)(null);
    // compute the variables for the request
    var variables;
    var variableError = null;
    // the function invoked by `this.error` inside of the variable function
    var setVariableError = function (code, msg) {
        // create an error
        variableError = new Error(msg);
        variableError.code = code;
        // return no variables to assign
        return null;
    };
    // the context to invoke the variable function with
    var variableContext = {
        redirect: adapter_mjs_1.goTo,
        error: setVariableError,
    };
    // the function to call to reload the data while updating the internal stores
    var reload = function (vars) {
        // set the loading state
        loading.set(true);
        // fire the query
        return refetch(vars)
            .catch(function (err) {
            error.set(err.message ? err : new Error(err));
        })
            .finally(function () {
            loading.set(false);
        });
    };
    $: {
        // clear any previous variable error
        variableError = null;
        // compute the new variables
        variables = (0, scalars_1.marshalInputs)({
            artifact: artifact,
            config: config,
            input: (variableFunction === null || variableFunction === void 0 ? void 0 : variableFunction.call(variableContext, {
                page: (0, store_1.get)((0, adapter_mjs_1.getPage)()),
                session: (0, store_1.get)((0, adapter_mjs_1.getSession)()),
                props: getProps(),
            })) || {},
        });
    }
    // a component should fire the query and then write the result to the store
    $: {
        // remember if the data was loaded from cache
        var cached = false;
        // if there was an error while computing variables
        if (variableError) {
            error.set(variableError);
        }
        // the artifact might have a defined cache policy we need to enforce
        else if ([
            types_1.CachePolicy.CacheOrNetwork,
            types_1.CachePolicy.CacheOnly,
            types_1.CachePolicy.CacheAndNetwork,
        ].includes(artifact.policy)) {
            var cachedValue = cache_1.default.read({ selection: artifact.selection, variables: variables });
            // if there is something to write
            if (cachedValue.data) {
                writeData({
                    data: cachedValue.data,
                    errors: [],
                }, variables);
                cached = true;
            }
            // nothing cached
            else {
                // load the query
                reload(variables);
            }
        }
        // there was no error while computing the variables
        else {
            // load the query
            reload(variables);
        }
        // if we loaded a cached value and we haven't sent the follow up
        if (cached && artifact.policy === types_1.CachePolicy.CacheAndNetwork) {
            // reload the query
            reload(variables);
        }
    }
    // return the handler to the user
    return __assign(__assign({}, queryHandler), { refetch: reload, loading: { subscribe: loading.subscribe }, error: { subscribe: error.subscribe } });
};
exports.componentQuery = componentQuery;
