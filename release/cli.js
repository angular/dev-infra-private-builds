(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/release/cli", ["require", "exports", "yargs", "@angular/dev-infra-private/release/env-stamp"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildReleaseParser = void 0;
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var yargs = require("yargs");
    var env_stamp_1 = require("@angular/dev-infra-private/release/env-stamp");
    /** Build the parser for the release commands. */
    function buildReleaseParser(localYargs) {
        return localYargs.help().strict().demandCommand().command('build-env-stamp', 'Build the environment stamping information', {}, function () { return env_stamp_1.buildEnvStamp(); });
    }
    exports.buildReleaseParser = buildReleaseParser;
    if (require.main === module) {
        buildReleaseParser(yargs).parse();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILDZCQUErQjtJQUMvQiwwRUFBMEM7SUFFMUMsaURBQWlEO0lBQ2pELFNBQWdCLGtCQUFrQixDQUFDLFVBQXNCO1FBQ3ZELE9BQU8sVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FDckQsaUJBQWlCLEVBQUUsNENBQTRDLEVBQUUsRUFBRSxFQUFFLGNBQU0sT0FBQSx5QkFBYSxFQUFFLEVBQWYsQ0FBZSxDQUFDLENBQUM7SUFDbEcsQ0FBQztJQUhELGdEQUdDO0lBRUQsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRTtRQUMzQixrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUNuQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcbmltcG9ydCB7YnVpbGRFbnZTdGFtcH0gZnJvbSAnLi9lbnYtc3RhbXAnO1xuXG4vKiogQnVpbGQgdGhlIHBhcnNlciBmb3IgdGhlIHJlbGVhc2UgY29tbWFuZHMuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRSZWxlYXNlUGFyc2VyKGxvY2FsWWFyZ3M6IHlhcmdzLkFyZ3YpIHtcbiAgcmV0dXJuIGxvY2FsWWFyZ3MuaGVscCgpLnN0cmljdCgpLmRlbWFuZENvbW1hbmQoKS5jb21tYW5kKFxuICAgICAgJ2J1aWxkLWVudi1zdGFtcCcsICdCdWlsZCB0aGUgZW52aXJvbm1lbnQgc3RhbXBpbmcgaW5mb3JtYXRpb24nLCB7fSwgKCkgPT4gYnVpbGRFbnZTdGFtcCgpKTtcbn1cblxuaWYgKHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlKSB7XG4gIGJ1aWxkUmVsZWFzZVBhcnNlcih5YXJncykucGFyc2UoKTtcbn1cbiJdfQ==