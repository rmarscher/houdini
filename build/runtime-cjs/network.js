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
exports.RequestContext = exports.fetchQuery = exports.convertKitPayload = exports.executeQuery = exports.getEnvironment = exports.setEnvironment = exports.Environment = void 0;
// externals
var store_1 = require("svelte/store");
var types_1 = require("./types");
var scalars_1 = require("./scalars");
var cache_1 = __importDefault(require("./cache"));
var Environment = /** @class */ (function () {
    function Environment(networkFn, subscriptionHandler) {
        this.fetch = networkFn;
        this.socket = subscriptionHandler;
    }
    Environment.prototype.sendRequest = function (ctx, params, session) {
        return this.fetch.call(ctx, params, session);
    };
    return Environment;
}());
exports.Environment = Environment;
var currentEnv = null;
function setEnvironment(env) {
    currentEnv = env;
}
exports.setEnvironment = setEnvironment;
function getEnvironment() {
    return currentEnv;
}
exports.getEnvironment = getEnvironment;
// This function is responsible for simulating the fetch context, getting the current session and executing the fetchQuery.
// It is mainly used for mutations, refetch and possible other client side operations in the future.
function executeQuery(artifact, variables, sessionStore, cached) {
    return __awaiter(this, void 0, void 0, function () {
        var session, fetchCtx, _a, res, partial;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    session = store_1.get(sessionStore);
                    fetchCtx = {
                        fetch: window.fetch.bind(window),
                        session: session,
                        stuff: {},
                        page: {
                            host: '',
                            path: '',
                            params: {},
                            query: new URLSearchParams(),
                        },
                    };
                    return [4 /*yield*/, fetchQuery({
                            context: fetchCtx,
                            artifact: artifact,
                            session: session,
                            variables: variables,
                            cached: cached,
                        })
                        // we could have gotten a null response
                    ];
                case 1:
                    _a = _b.sent(), res = _a.result, partial = _a.partial;
                    // we could have gotten a null response
                    if (res.errors && res.errors.length > 0) {
                        throw res.errors;
                    }
                    if (!res.data) {
                        throw new Error('Encountered empty data response in payload');
                    }
                    return [2 /*return*/, { result: res, partial: partial }];
            }
        });
    });
}
exports.executeQuery = executeQuery;
// convertKitPayload is responsible for taking the result of kit's load
function convertKitPayload(context, loader, page, session) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loader({
                        page: page,
                        session: session,
                        stuff: {},
                        fetch: context.fetch,
                    })
                    // if the response contains an error
                ];
                case 1:
                    result = _a.sent();
                    // if the response contains an error
                    if (result.error) {
                        // 500 - internal server error
                        context.error(result.status || 500, result.error);
                        return [2 /*return*/];
                    }
                    // if the response contains a redirect
                    if (result.redirect) {
                        // 307 - temporary redirect
                        context.redirect(result.status || 307, result.redirect);
                        return [2 /*return*/];
                    }
                    // the response contains data!
                    if (result.props) {
                        return [2 /*return*/, result.props];
                    }
                    // we shouldn't get here
                    throw new Error('Could not handle response from loader: ' + JSON.stringify(result));
            }
        });
    });
}
exports.convertKitPayload = convertKitPayload;
function fetchQuery(_a) {
    var context = _a.context, artifact = _a.artifact, variables = _a.variables, session = _a.session, _b = _a.cached, cached = _b === void 0 ? true : _b;
    return __awaiter(this, void 0, void 0, function () {
        var environment, value, allowed, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    environment = getEnvironment();
                    // if there is no environment
                    if (!environment) {
                        return [2 /*return*/, {
                                result: { data: {}, errors: [{ message: 'could not find houdini environment' }] },
                                source: null,
                                partial: false,
                            }];
                    }
                    // enforce cache policies for queries
                    if (cached && artifact.kind === 'HoudiniQuery') {
                        // tick the garbage collector asynchronously
                        setTimeout(function () {
                            cache_1.default._internal_unstable.collectGarbage();
                        }, 0);
                        // this function is called as the first step in requesting data. If the policy prefers
                        // cached data, we need to load data from the cache (if its available). If the policy
                        // prefers network data we need to send a request (the onLoad of the component will
                        // resolve the next data)
                        // if the cache policy allows for cached data, look at the caches value first
                        if (artifact.policy !== types_1.CachePolicy.NetworkOnly) {
                            value = cache_1.default.read({ selection: artifact.selection, variables: variables });
                            allowed = !value.partial || artifact.partial;
                            // if we have data, use that unless its partial data and we dont allow that
                            if (value.data !== null && allowed) {
                                return [2 /*return*/, {
                                        result: {
                                            data: value.data,
                                            errors: [],
                                        },
                                        source: types_1.DataSource.Cache,
                                        partial: value.partial,
                                    }];
                            }
                            // if the policy is cacheOnly and we got this far, we need to return null (no network request will be sent)
                            else if (artifact.policy === types_1.CachePolicy.CacheOnly) {
                                return [2 /*return*/, {
                                        result: {
                                            data: null,
                                            errors: [],
                                        },
                                        source: types_1.DataSource.Cache,
                                        partial: false,
                                    }];
                            }
                        }
                    }
                    _c = {};
                    return [4 /*yield*/, environment.sendRequest(context, { text: artifact.raw, hash: artifact.hash, variables: variables }, session)];
                case 1: 
                // the request must be resolved against the network
                return [2 /*return*/, (_c.result = _d.sent(),
                        _c.source = types_1.DataSource.Network,
                        _c.partial = false,
                        _c)];
            }
        });
    });
}
exports.fetchQuery = fetchQuery;
var RequestContext = /** @class */ (function () {
    function RequestContext(ctx) {
        this.continue = true;
        this.returnValue = {};
        this.context = ctx;
    }
    RequestContext.prototype.error = function (status, message) {
        this.continue = false;
        this.returnValue = {
            error: message,
            status: status,
        };
    };
    RequestContext.prototype.redirect = function (status, location) {
        this.continue = false;
        this.returnValue = {
            redirect: location,
            status: status,
        };
    };
    RequestContext.prototype.fetch = function (input, init) {
        // make sure to bind the window object to the fetch in a browser
        var fetch = typeof window !== 'undefined' ? this.context.fetch.bind(window) : this.context.fetch;
        return fetch(input, init);
    };
    RequestContext.prototype.graphqlErrors = function (payload) {
        // if we have a list of errors
        if (payload.errors) {
            return this.error(500, payload.errors.map(function (_a) {
                var message = _a.message;
                return message;
            }).join('\n'));
        }
        return this.error(500, 'Encountered invalid response: ' + JSON.stringify(payload));
    };
    // This hook fires before executing any queries, it allows to redirect/error based on session state for example
    // It also allows to return custom props that should be returned from the corresponding load function.
    RequestContext.prototype.invokeLoadHook = function (_a) {
        var variant = _a.variant, framework = _a.framework, hookFn = _a.hookFn, input = _a.input, data = _a.data;
        return __awaiter(this, void 0, void 0, function () {
            var hookCall, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (framework === 'kit') {
                            if (variant === 'before') {
                                hookCall = hookFn.call(this, this.context);
                            }
                            else {
                                hookCall = hookFn.call(this, __assign(__assign({}, this.context), { input: input,
                                    data: data }));
                            }
                        }
                        else {
                            // sapper
                            if (variant === 'before') {
                                hookCall = hookFn.call(this, this.context.page, this.context.session);
                            }
                            else {
                                hookCall = hookFn.call(this, this.context.page, this.context.session, data, input);
                            }
                        }
                        return [4 /*yield*/, hookCall
                            // If the returnValue is already set through this.error or this.redirect return early
                        ];
                    case 1:
                        result = _b.sent();
                        // If the returnValue is already set through this.error or this.redirect return early
                        if (!this.continue) {
                            return [2 /*return*/];
                        }
                        // If the result is null or undefined, or the result isn't an object return early
                        if (result == null || typeof result !== 'object') {
                            return [2 /*return*/];
                        }
                        this.returnValue = result;
                        return [2 /*return*/];
                }
            });
        });
    };
    // compute the inputs for an operation should reflect the framework's conventions.
    // in sapper, this means preparing a `this` for the function. for kit, we can just pass
    // the context
    RequestContext.prototype.computeInput = function (_a) {
        var config = _a.config, framework = _a.framework, variableFunction = _a.variableFunction, artifact = _a.artifact;
        // call the variable function to match the framework
        var input = framework === 'kit'
            ? // in kit just pass the context directly
                variableFunction.call(this, this.context)
            : // we are in sapper mode, so we need to prepare the function context
                variableFunction.call(this, this.context.page, this.context.session);
        // and pass page and session
        return scalars_1.marshalInputs({ artifact: artifact, config: config, input: input });
    };
    return RequestContext;
}());
exports.RequestContext = RequestContext;
