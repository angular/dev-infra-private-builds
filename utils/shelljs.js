/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/utils/shelljs", ["require", "exports", "tslib", "shelljs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.exec = void 0;
    var tslib_1 = require("tslib");
    var shelljs_1 = require("shelljs");
    /**
     * Runs an given command as child process. By default, child process
     * output will not be printed.
     */
    function exec(cmd, opts) {
        return shelljs_1.exec(cmd, tslib_1.__assign(tslib_1.__assign({ silent: true }, opts), { async: false }));
    }
    exports.exec = exec;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hlbGxqcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9zaGVsbGpzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxtQ0FBZ0U7SUFFaEU7OztPQUdHO0lBQ0gsU0FBZ0IsSUFBSSxDQUFDLEdBQVcsRUFBRSxJQUFpQztRQUNqRSxPQUFPLGNBQUssQ0FBQyxHQUFHLHNDQUFHLE1BQU0sRUFBRSxJQUFJLElBQUssSUFBSSxLQUFFLEtBQUssRUFBRSxLQUFLLElBQUUsQ0FBQztJQUMzRCxDQUFDO0lBRkQsb0JBRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtleGVjIGFzIF9leGVjLCBFeGVjT3B0aW9ucywgU2hlbGxTdHJpbmd9IGZyb20gJ3NoZWxsanMnO1xuXG4vKipcbiAqIFJ1bnMgYW4gZ2l2ZW4gY29tbWFuZCBhcyBjaGlsZCBwcm9jZXNzLiBCeSBkZWZhdWx0LCBjaGlsZCBwcm9jZXNzXG4gKiBvdXRwdXQgd2lsbCBub3QgYmUgcHJpbnRlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4ZWMoY21kOiBzdHJpbmcsIG9wdHM/OiBPbWl0PEV4ZWNPcHRpb25zLCAnYXN5bmMnPik6IFNoZWxsU3RyaW5nIHtcbiAgcmV0dXJuIF9leGVjKGNtZCwge3NpbGVudDogdHJ1ZSwgLi4ub3B0cywgYXN5bmM6IGZhbHNlfSk7XG59XG4iXX0=