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
        define("@angular/dev-infra-private/pr/cli", ["require", "exports", "@angular/dev-infra-private/pr/checkout/cli", "@angular/dev-infra-private/pr/discover-new-conflicts/cli", "@angular/dev-infra-private/pr/merge/cli", "@angular/dev-infra-private/pr/rebase/cli"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildPrParser = void 0;
    var cli_1 = require("@angular/dev-infra-private/pr/checkout/cli");
    var cli_2 = require("@angular/dev-infra-private/pr/discover-new-conflicts/cli");
    var cli_3 = require("@angular/dev-infra-private/pr/merge/cli");
    var cli_4 = require("@angular/dev-infra-private/pr/rebase/cli");
    /** Build the parser for pull request commands. */
    function buildPrParser(localYargs) {
        return localYargs.help()
            .strict()
            .demandCommand()
            .command('merge <pr-number>', 'Merge pull requests', cli_3.buildMergeCommand, cli_3.handleMergeCommand)
            .command('discover-new-conflicts <pr-number>', 'Check if a pending PR causes new conflicts for other pending PRs', cli_2.buildDiscoverNewConflictsCommand, cli_2.handleDiscoverNewConflictsCommand)
            .command('rebase <pr-number>', 'Rebase a pending PR and push the rebased commits back to Github', cli_4.buildRebaseCommand, cli_4.handleRebaseCommand)
            .command(cli_1.CheckoutCommandModule);
    }
    exports.buildPrParser = buildPrParser;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFJSCxrRUFBcUQ7SUFDckQsZ0ZBQWlIO0lBQ2pILCtEQUFrRTtJQUNsRSxnRUFBcUU7SUFFckUsa0RBQWtEO0lBQ2xELFNBQWdCLGFBQWEsQ0FBQyxVQUFzQjtRQUNsRCxPQUFPLFVBQVUsQ0FBQyxJQUFJLEVBQUU7YUFDbkIsTUFBTSxFQUFFO2FBQ1IsYUFBYSxFQUFFO2FBQ2YsT0FBTyxDQUFDLG1CQUFtQixFQUFFLHFCQUFxQixFQUFFLHVCQUFpQixFQUFFLHdCQUFrQixDQUFDO2FBQzFGLE9BQU8sQ0FDSixvQ0FBb0MsRUFDcEMsa0VBQWtFLEVBQ2xFLHNDQUFnQyxFQUFFLHVDQUFpQyxDQUFDO2FBQ3ZFLE9BQU8sQ0FDSixvQkFBb0IsRUFBRSxpRUFBaUUsRUFDdkYsd0JBQWtCLEVBQUUseUJBQW1CLENBQUM7YUFDM0MsT0FBTyxDQUFDLDJCQUFxQixDQUFDLENBQUM7SUFDdEMsQ0FBQztJQWJELHNDQWFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtDaGVja291dENvbW1hbmRNb2R1bGV9IGZyb20gJy4vY2hlY2tvdXQvY2xpJztcbmltcG9ydCB7YnVpbGREaXNjb3Zlck5ld0NvbmZsaWN0c0NvbW1hbmQsIGhhbmRsZURpc2NvdmVyTmV3Q29uZmxpY3RzQ29tbWFuZH0gZnJvbSAnLi9kaXNjb3Zlci1uZXctY29uZmxpY3RzL2NsaSc7XG5pbXBvcnQge2J1aWxkTWVyZ2VDb21tYW5kLCBoYW5kbGVNZXJnZUNvbW1hbmR9IGZyb20gJy4vbWVyZ2UvY2xpJztcbmltcG9ydCB7YnVpbGRSZWJhc2VDb21tYW5kLCBoYW5kbGVSZWJhc2VDb21tYW5kfSBmcm9tICcuL3JlYmFzZS9jbGknO1xuXG4vKiogQnVpbGQgdGhlIHBhcnNlciBmb3IgcHVsbCByZXF1ZXN0IGNvbW1hbmRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUHJQYXJzZXIobG9jYWxZYXJnczogeWFyZ3MuQXJndikge1xuICByZXR1cm4gbG9jYWxZYXJncy5oZWxwKClcbiAgICAgIC5zdHJpY3QoKVxuICAgICAgLmRlbWFuZENvbW1hbmQoKVxuICAgICAgLmNvbW1hbmQoJ21lcmdlIDxwci1udW1iZXI+JywgJ01lcmdlIHB1bGwgcmVxdWVzdHMnLCBidWlsZE1lcmdlQ29tbWFuZCwgaGFuZGxlTWVyZ2VDb21tYW5kKVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ2Rpc2NvdmVyLW5ldy1jb25mbGljdHMgPHByLW51bWJlcj4nLFxuICAgICAgICAgICdDaGVjayBpZiBhIHBlbmRpbmcgUFIgY2F1c2VzIG5ldyBjb25mbGljdHMgZm9yIG90aGVyIHBlbmRpbmcgUFJzJyxcbiAgICAgICAgICBidWlsZERpc2NvdmVyTmV3Q29uZmxpY3RzQ29tbWFuZCwgaGFuZGxlRGlzY292ZXJOZXdDb25mbGljdHNDb21tYW5kKVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ3JlYmFzZSA8cHItbnVtYmVyPicsICdSZWJhc2UgYSBwZW5kaW5nIFBSIGFuZCBwdXNoIHRoZSByZWJhc2VkIGNvbW1pdHMgYmFjayB0byBHaXRodWInLFxuICAgICAgICAgIGJ1aWxkUmViYXNlQ29tbWFuZCwgaGFuZGxlUmViYXNlQ29tbWFuZClcbiAgICAgIC5jb21tYW5kKENoZWNrb3V0Q29tbWFuZE1vZHVsZSk7XG59XG4iXX0=