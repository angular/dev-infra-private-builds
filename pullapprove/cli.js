(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/pullapprove/cli", ["require", "exports", "yargs", "@angular/dev-infra-private/pullapprove/verify"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var yargs = require("yargs");
    var verify_1 = require("@angular/dev-infra-private/pullapprove/verify");
    /** Build the parser for the pullapprove commands. */
    function buildPullapproveParser(localYargs) {
        return localYargs.help()
            .strict()
            .option('verbose', { alias: ['v'], description: 'Enable verbose logging' })
            .demandCommand()
            .command('verify', 'Verify the pullapprove config', {}, function (_a) {
            var verbose = _a.verbose;
            return verify_1.verify(verbose);
        });
    }
    exports.buildPullapproveParser = buildPullapproveParser;
    if (require.main === module) {
        buildPullapproveParser(yargs).parse();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3B1bGxhcHByb3ZlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILDZCQUErQjtJQUMvQix3RUFBZ0M7SUFFaEMscURBQXFEO0lBQ3JELFNBQWdCLHNCQUFzQixDQUFDLFVBQXNCO1FBQzNELE9BQU8sVUFBVSxDQUFDLElBQUksRUFBRTthQUNuQixNQUFNLEVBQUU7YUFDUixNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsV0FBVyxFQUFFLHdCQUF3QixFQUFDLENBQUM7YUFDeEUsYUFBYSxFQUFFO2FBQ2YsT0FBTyxDQUFDLFFBQVEsRUFBRSwrQkFBK0IsRUFBRSxFQUFFLEVBQUUsVUFBQyxFQUFTO2dCQUFSLG9CQUFPO1lBQU0sT0FBQSxlQUFNLENBQUMsT0FBTyxDQUFDO1FBQWYsQ0FBZSxDQUFDLENBQUM7SUFDOUYsQ0FBQztJQU5ELHdEQU1DO0lBRUQsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRTtRQUMzQixzQkFBc0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUN2QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcbmltcG9ydCB7dmVyaWZ5fSBmcm9tICcuL3ZlcmlmeSc7XG5cbi8qKiBCdWlsZCB0aGUgcGFyc2VyIGZvciB0aGUgcHVsbGFwcHJvdmUgY29tbWFuZHMuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRQdWxsYXBwcm92ZVBhcnNlcihsb2NhbFlhcmdzOiB5YXJncy5Bcmd2KSB7XG4gIHJldHVybiBsb2NhbFlhcmdzLmhlbHAoKVxuICAgICAgLnN0cmljdCgpXG4gICAgICAub3B0aW9uKCd2ZXJib3NlJywge2FsaWFzOiBbJ3YnXSwgZGVzY3JpcHRpb246ICdFbmFibGUgdmVyYm9zZSBsb2dnaW5nJ30pXG4gICAgICAuZGVtYW5kQ29tbWFuZCgpXG4gICAgICAuY29tbWFuZCgndmVyaWZ5JywgJ1ZlcmlmeSB0aGUgcHVsbGFwcHJvdmUgY29uZmlnJywge30sICh7dmVyYm9zZX0pID0+IHZlcmlmeSh2ZXJib3NlKSk7XG59XG5cbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSkge1xuICBidWlsZFB1bGxhcHByb3ZlUGFyc2VyKHlhcmdzKS5wYXJzZSgpO1xufVxuIl19