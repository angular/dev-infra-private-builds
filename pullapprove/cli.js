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
    exports.buildPullapproveParser = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var yargs = require("yargs");
    var verify_1 = require("@angular/dev-infra-private/pullapprove/verify");
    /** Build the parser for the pullapprove commands. */
    function buildPullapproveParser(localYargs) {
        return localYargs.help().strict().demandCommand().command('verify', 'Verify the pullapprove config', {}, function () { return verify_1.verify(); });
    }
    exports.buildPullapproveParser = buildPullapproveParser;
    if (require.main === module) {
        buildPullapproveParser(yargs).parse();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3B1bGxhcHByb3ZlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCw2QkFBK0I7SUFDL0Isd0VBQWdDO0lBRWhDLHFEQUFxRDtJQUNyRCxTQUFnQixzQkFBc0IsQ0FBQyxVQUFzQjtRQUMzRCxPQUFPLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQ3JELFFBQVEsRUFBRSwrQkFBK0IsRUFBRSxFQUFFLEVBQUUsY0FBTSxPQUFBLGVBQU0sRUFBRSxFQUFSLENBQVEsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFIRCx3REFHQztJQUVELElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7UUFDM0Isc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDdkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcbmltcG9ydCB7dmVyaWZ5fSBmcm9tICcuL3ZlcmlmeSc7XG5cbi8qKiBCdWlsZCB0aGUgcGFyc2VyIGZvciB0aGUgcHVsbGFwcHJvdmUgY29tbWFuZHMuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRQdWxsYXBwcm92ZVBhcnNlcihsb2NhbFlhcmdzOiB5YXJncy5Bcmd2KSB7XG4gIHJldHVybiBsb2NhbFlhcmdzLmhlbHAoKS5zdHJpY3QoKS5kZW1hbmRDb21tYW5kKCkuY29tbWFuZChcbiAgICAgICd2ZXJpZnknLCAnVmVyaWZ5IHRoZSBwdWxsYXBwcm92ZSBjb25maWcnLCB7fSwgKCkgPT4gdmVyaWZ5KCkpO1xufVxuXG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgYnVpbGRQdWxsYXBwcm92ZVBhcnNlcih5YXJncykucGFyc2UoKTtcbn1cbiJdfQ==