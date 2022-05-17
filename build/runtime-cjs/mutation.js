"use strict";
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
exports.mutation = void 0;
var network_1 = require("./network");
var cache_1 = __importDefault(require("./cache"));
var scalars_1 = require("./scalars");
// @ts-ignore: this file will get generated and does not exist in the source code
var adapter_mjs_1 = require("./adapter.mjs");
// mutation returns a handler that will send the mutation to the server when
// invoked
function mutation(document) {
    var _this = this;
    // make sure we got a query document
    if (document.kind !== 'HoudiniMutation') {
        throw new Error('mutation() must be passed a mutation document');
    }
    // we might get re-exported values nested under default
    // @ts-ignore: typing esm/cjs interop is hard
    var artifact = document.artifact.default || document.artifact;
    // @ts-ignore: typing esm/cjs interop is hard
    var config = document.config.default || document.config;
    // grab the session from the adapter
    var sessionStore = adapter_mjs_1.getSession();
    // return an async function that sends the mutation go the server
    return function (variables, mutationConfig) { return __awaiter(_this, void 0, void 0, function () {
        var layer, optimisticResponse, toNotify, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    layer = cache_1.default._internal_unstable.storage.createLayer(true);
                    optimisticResponse = mutationConfig === null || mutationConfig === void 0 ? void 0 : mutationConfig.optimisticResponse;
                    toNotify = [];
                    if (optimisticResponse) {
                        toNotify = cache_1.default.write({
                            selection: artifact.selection,
                            // make sure that any scalar values get processed into something we can cache
                            data: scalars_1.marshalSelection({
                                config: config,
                                selection: artifact.selection,
                                data: optimisticResponse,
                            }),
                            variables: variables,
                            layer: layer.id,
                        });
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, network_1.executeQuery(artifact, scalars_1.marshalInputs({
                            input: variables,
                            artifact: document.artifact,
                            config: config,
                        }), sessionStore, false)
                        // clear the layer holding any mutation results
                    ];
                case 2:
                    result = (_a.sent()).result;
                    // clear the layer holding any mutation results
                    layer.clear();
                    // write the result of the mutation to the cache
                    cache_1.default.write({
                        selection: artifact.selection,
                        data: result.data,
                        variables: variables,
                        // write to the mutation's layer
                        layer: layer.id,
                        // notify any subscribers that we updated with the optimistic response
                        // in order to address situations where the optimistic update was wrong
                        notifySubscribers: toNotify,
                        // make sure that we notify subscribers for any values that we overwrite
                        // in order to address any race conditions when comparing the previous value
                        forceNotify: true,
                    });
                    // merge the layer back into the cache
                    cache_1.default._internal_unstable.storage.resolveLayer(layer.id);
                    // turn any scalars in the response into their complex form
                    return [2 /*return*/, scalars_1.unmarshalSelection(config, artifact.selection, result.data)];
                case 3:
                    error_1 = _a.sent();
                    // if the mutation failed, roll the layer back and delete it
                    layer.clear();
                    cache_1.default._internal_unstable.storage.resolveLayer(layer.id);
                    // bubble the mutation error up to the caller
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    }); };
}
exports.mutation = mutation;
