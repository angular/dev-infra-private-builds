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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3B1bGxhcHByb3ZlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCw2QkFBK0I7SUFDL0Isd0VBQWdDO0lBRWhDLHFEQUFxRDtJQUNyRCxTQUFnQixzQkFBc0IsQ0FBQyxVQUFzQjtRQUMzRCxPQUFPLFVBQVUsQ0FBQyxJQUFJLEVBQUU7YUFDbkIsTUFBTSxFQUFFO2FBQ1IsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFdBQVcsRUFBRSx3QkFBd0IsRUFBQyxDQUFDO2FBQ3hFLGFBQWEsRUFBRTthQUNmLE9BQU8sQ0FBQyxRQUFRLEVBQUUsK0JBQStCLEVBQUUsRUFBRSxFQUFFLFVBQUMsRUFBUztnQkFBUixPQUFPLGFBQUE7WUFBTSxPQUFBLGVBQU0sQ0FBQyxPQUFPLENBQUM7UUFBZixDQUFlLENBQUMsQ0FBQztJQUM5RixDQUFDO0lBTkQsd0RBTUM7SUFFRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO1FBQzNCLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ3ZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5pbXBvcnQge3ZlcmlmeX0gZnJvbSAnLi92ZXJpZnknO1xuXG4vKiogQnVpbGQgdGhlIHBhcnNlciBmb3IgdGhlIHB1bGxhcHByb3ZlIGNvbW1hbmRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUHVsbGFwcHJvdmVQYXJzZXIobG9jYWxZYXJnczogeWFyZ3MuQXJndikge1xuICByZXR1cm4gbG9jYWxZYXJncy5oZWxwKClcbiAgICAgIC5zdHJpY3QoKVxuICAgICAgLm9wdGlvbigndmVyYm9zZScsIHthbGlhczogWyd2J10sIGRlc2NyaXB0aW9uOiAnRW5hYmxlIHZlcmJvc2UgbG9nZ2luZyd9KVxuICAgICAgLmRlbWFuZENvbW1hbmQoKVxuICAgICAgLmNvbW1hbmQoJ3ZlcmlmeScsICdWZXJpZnkgdGhlIHB1bGxhcHByb3ZlIGNvbmZpZycsIHt9LCAoe3ZlcmJvc2V9KSA9PiB2ZXJpZnkodmVyYm9zZSkpO1xufVxuXG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgYnVpbGRQdWxsYXBwcm92ZVBhcnNlcih5YXJncykucGFyc2UoKTtcbn1cbiJdfQ==