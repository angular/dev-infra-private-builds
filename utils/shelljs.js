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
    /* Run an exec command as silent. */
    function exec(cmd, opts) {
        return shelljs_1.exec(cmd, tslib_1.__assign({ silent: true }, opts));
    }
    exports.exec = exec;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hlbGxqcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9zaGVsbGpzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxtQ0FBZ0U7SUFFaEUsb0NBQW9DO0lBQ3BDLFNBQWdCLElBQUksQ0FBQyxHQUFXLEVBQUUsSUFBa0M7UUFDbEUsT0FBTyxjQUFLLENBQUMsR0FBRyxxQkFBRyxNQUFNLEVBQUUsSUFBSSxJQUFLLElBQUksRUFBRSxDQUFDO0lBQzdDLENBQUM7SUFGRCxvQkFFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2V4ZWMgYXMgX2V4ZWMsIEV4ZWNPcHRpb25zLCBTaGVsbFN0cmluZ30gZnJvbSAnc2hlbGxqcyc7XG5cbi8qIFJ1biBhbiBleGVjIGNvbW1hbmQgYXMgc2lsZW50LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4ZWMoY21kOiBzdHJpbmcsIG9wdHM/OiBFeGVjT3B0aW9ucyZ7YXN5bmM/OiBmYWxzZX0pOiBTaGVsbFN0cmluZyB7XG4gIHJldHVybiBfZXhlYyhjbWQsIHtzaWxlbnQ6IHRydWUsIC4uLm9wdHN9KTtcbn1cbiJdfQ==