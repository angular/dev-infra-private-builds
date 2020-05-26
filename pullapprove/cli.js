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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3B1bGxhcHByb3ZlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCw2QkFBK0I7SUFDL0Isd0VBQWdDO0lBRWhDLHFEQUFxRDtJQUNyRCxTQUFnQixzQkFBc0IsQ0FBQyxVQUFzQjtRQUMzRCxPQUFPLFVBQVUsQ0FBQyxJQUFJLEVBQUU7YUFDbkIsTUFBTSxFQUFFO2FBQ1IsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFdBQVcsRUFBRSx3QkFBd0IsRUFBQyxDQUFDO2FBQ3hFLGFBQWEsRUFBRTthQUNmLE9BQU8sQ0FBQyxRQUFRLEVBQUUsK0JBQStCLEVBQUUsRUFBRSxFQUFFLFVBQUMsRUFBUztnQkFBUixPQUFPLGFBQUE7WUFBTSxPQUFBLGVBQU0sQ0FBQyxPQUFPLENBQUM7UUFBZixDQUFlLENBQUMsQ0FBQztJQUM5RixDQUFDO0lBTkQsd0RBTUM7SUFFRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO1FBQzNCLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ3ZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHt2ZXJpZnl9IGZyb20gJy4vdmVyaWZ5JztcblxuLyoqIEJ1aWxkIHRoZSBwYXJzZXIgZm9yIHRoZSBwdWxsYXBwcm92ZSBjb21tYW5kcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFB1bGxhcHByb3ZlUGFyc2VyKGxvY2FsWWFyZ3M6IHlhcmdzLkFyZ3YpIHtcbiAgcmV0dXJuIGxvY2FsWWFyZ3MuaGVscCgpXG4gICAgICAuc3RyaWN0KClcbiAgICAgIC5vcHRpb24oJ3ZlcmJvc2UnLCB7YWxpYXM6IFsndiddLCBkZXNjcmlwdGlvbjogJ0VuYWJsZSB2ZXJib3NlIGxvZ2dpbmcnfSlcbiAgICAgIC5kZW1hbmRDb21tYW5kKClcbiAgICAgIC5jb21tYW5kKCd2ZXJpZnknLCAnVmVyaWZ5IHRoZSBwdWxsYXBwcm92ZSBjb25maWcnLCB7fSwgKHt2ZXJib3NlfSkgPT4gdmVyaWZ5KHZlcmJvc2UpKTtcbn1cblxuaWYgKHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlKSB7XG4gIGJ1aWxkUHVsbGFwcHJvdmVQYXJzZXIoeWFyZ3MpLnBhcnNlKCk7XG59XG4iXX0=