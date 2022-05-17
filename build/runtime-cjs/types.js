"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompiledSubscriptionKind = exports.CompiledQueryKind = exports.CompiledMutationKind = exports.CompiledFragmentKind = exports.DataSource = exports.RefetchUpdateMode = exports.ArtifactKind = exports.CachePolicy = void 0;
var CachePolicy;
(function (CachePolicy) {
    CachePolicy["CacheOrNetwork"] = "CacheOrNetwork";
    CachePolicy["CacheOnly"] = "CacheOnly";
    CachePolicy["NetworkOnly"] = "NetworkOnly";
    CachePolicy["CacheAndNetwork"] = "CacheAndNetwork";
})(CachePolicy = exports.CachePolicy || (exports.CachePolicy = {}));
var ArtifactKind;
(function (ArtifactKind) {
    ArtifactKind["Query"] = "HoudiniQuery";
    ArtifactKind["Subcription"] = "HoudiniSubscription";
    ArtifactKind["Mutation"] = "HoudiniMutation";
    ArtifactKind["Fragment"] = "HoudiniFragment";
})(ArtifactKind = exports.ArtifactKind || (exports.ArtifactKind = {}));
var RefetchUpdateMode;
(function (RefetchUpdateMode) {
    RefetchUpdateMode["append"] = "append";
    RefetchUpdateMode["prepend"] = "prepend";
    RefetchUpdateMode["replace"] = "replace";
})(RefetchUpdateMode = exports.RefetchUpdateMode || (exports.RefetchUpdateMode = {}));
var DataSource;
(function (DataSource) {
    DataSource["Cache"] = "cache";
    DataSource["Network"] = "network";
})(DataSource = exports.DataSource || (exports.DataSource = {}));
exports.CompiledFragmentKind = 'HoudiniFragment';
exports.CompiledMutationKind = 'HoudiniMutation';
exports.CompiledQueryKind = 'HoudiniQuery';
exports.CompiledSubscriptionKind = 'HoudiniSubscription';
