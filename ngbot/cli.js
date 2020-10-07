(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/ngbot/cli", ["require", "exports", "yargs", "@angular/dev-infra-private/ngbot/verify"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildNgbotParser = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var yargs = require("yargs");
    var verify_1 = require("@angular/dev-infra-private/ngbot/verify");
    /** Build the parser for the NgBot commands. */
    function buildNgbotParser(localYargs) {
        return localYargs.help().strict().demandCommand().command('verify', 'Verify the NgBot config', {}, function () { return verify_1.verify(); });
    }
    exports.buildNgbotParser = buildNgbotParser;
    if (require.main === module) {
        buildNgbotParser(yargs).parse();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL25nYm90L2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCw2QkFBK0I7SUFDL0Isa0VBQWdDO0lBRWhDLCtDQUErQztJQUMvQyxTQUFnQixnQkFBZ0IsQ0FBQyxVQUFzQjtRQUNyRCxPQUFPLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQ3JELFFBQVEsRUFBRSx5QkFBeUIsRUFBRSxFQUFFLEVBQUUsY0FBTSxPQUFBLGVBQU0sRUFBRSxFQUFSLENBQVEsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFIRCw0Q0FHQztJQUVELElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7UUFDM0IsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDakMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcbmltcG9ydCB7dmVyaWZ5fSBmcm9tICcuL3ZlcmlmeSc7XG5cbi8qKiBCdWlsZCB0aGUgcGFyc2VyIGZvciB0aGUgTmdCb3QgY29tbWFuZHMuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGROZ2JvdFBhcnNlcihsb2NhbFlhcmdzOiB5YXJncy5Bcmd2KSB7XG4gIHJldHVybiBsb2NhbFlhcmdzLmhlbHAoKS5zdHJpY3QoKS5kZW1hbmRDb21tYW5kKCkuY29tbWFuZChcbiAgICAgICd2ZXJpZnknLCAnVmVyaWZ5IHRoZSBOZ0JvdCBjb25maWcnLCB7fSwgKCkgPT4gdmVyaWZ5KCkpO1xufVxuXG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgYnVpbGROZ2JvdFBhcnNlcih5YXJncykucGFyc2UoKTtcbn1cbiJdfQ==