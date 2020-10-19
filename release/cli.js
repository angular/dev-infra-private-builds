(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/release/cli", ["require", "exports", "yargs", "@angular/dev-infra-private/release/build/cli", "@angular/dev-infra-private/release/publish/cli", "@angular/dev-infra-private/release/set-dist-tag/cli", "@angular/dev-infra-private/release/stamping/env-stamp"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildReleaseParser = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var yargs = require("yargs");
    var cli_1 = require("@angular/dev-infra-private/release/build/cli");
    var cli_2 = require("@angular/dev-infra-private/release/publish/cli");
    var cli_3 = require("@angular/dev-infra-private/release/set-dist-tag/cli");
    var env_stamp_1 = require("@angular/dev-infra-private/release/stamping/env-stamp");
    /** Build the parser for the release commands. */
    function buildReleaseParser(localYargs) {
        return localYargs.help()
            .strict()
            .demandCommand()
            .command(cli_2.ReleasePublishCommandModule)
            .command(cli_1.ReleaseBuildCommandModule)
            .command(cli_3.ReleaseSetDistTagCommand)
            .command('build-env-stamp', 'Build the environment stamping information', {}, function () { return env_stamp_1.buildEnvStamp(); });
    }
    exports.buildReleaseParser = buildReleaseParser;
    if (require.main === module) {
        buildReleaseParser(yargs).parse();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILDZCQUErQjtJQUUvQixvRUFBc0Q7SUFDdEQsc0VBQTBEO0lBQzFELDJFQUE0RDtJQUM1RCxtRkFBbUQ7SUFFbkQsaURBQWlEO0lBQ2pELFNBQWdCLGtCQUFrQixDQUFDLFVBQXNCO1FBQ3ZELE9BQU8sVUFBVSxDQUFDLElBQUksRUFBRTthQUNuQixNQUFNLEVBQUU7YUFDUixhQUFhLEVBQUU7YUFDZixPQUFPLENBQUMsaUNBQTJCLENBQUM7YUFDcEMsT0FBTyxDQUFDLCtCQUF5QixDQUFDO2FBQ2xDLE9BQU8sQ0FBQyw4QkFBd0IsQ0FBQzthQUNqQyxPQUFPLENBQ0osaUJBQWlCLEVBQUUsNENBQTRDLEVBQUUsRUFBRSxFQUNuRSxjQUFNLE9BQUEseUJBQWEsRUFBRSxFQUFmLENBQWUsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFWRCxnREFVQztJQUVELElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7UUFDM0Isa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDbkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtSZWxlYXNlQnVpbGRDb21tYW5kTW9kdWxlfSBmcm9tICcuL2J1aWxkL2NsaSc7XG5pbXBvcnQge1JlbGVhc2VQdWJsaXNoQ29tbWFuZE1vZHVsZX0gZnJvbSAnLi9wdWJsaXNoL2NsaSc7XG5pbXBvcnQge1JlbGVhc2VTZXREaXN0VGFnQ29tbWFuZH0gZnJvbSAnLi9zZXQtZGlzdC10YWcvY2xpJztcbmltcG9ydCB7YnVpbGRFbnZTdGFtcH0gZnJvbSAnLi9zdGFtcGluZy9lbnYtc3RhbXAnO1xuXG4vKiogQnVpbGQgdGhlIHBhcnNlciBmb3IgdGhlIHJlbGVhc2UgY29tbWFuZHMuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRSZWxlYXNlUGFyc2VyKGxvY2FsWWFyZ3M6IHlhcmdzLkFyZ3YpIHtcbiAgcmV0dXJuIGxvY2FsWWFyZ3MuaGVscCgpXG4gICAgICAuc3RyaWN0KClcbiAgICAgIC5kZW1hbmRDb21tYW5kKClcbiAgICAgIC5jb21tYW5kKFJlbGVhc2VQdWJsaXNoQ29tbWFuZE1vZHVsZSlcbiAgICAgIC5jb21tYW5kKFJlbGVhc2VCdWlsZENvbW1hbmRNb2R1bGUpXG4gICAgICAuY29tbWFuZChSZWxlYXNlU2V0RGlzdFRhZ0NvbW1hbmQpXG4gICAgICAuY29tbWFuZChcbiAgICAgICAgICAnYnVpbGQtZW52LXN0YW1wJywgJ0J1aWxkIHRoZSBlbnZpcm9ubWVudCBzdGFtcGluZyBpbmZvcm1hdGlvbicsIHt9LFxuICAgICAgICAgICgpID0+IGJ1aWxkRW52U3RhbXAoKSk7XG59XG5cbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSkge1xuICBidWlsZFJlbGVhc2VQYXJzZXIoeWFyZ3MpLnBhcnNlKCk7XG59XG4iXX0=