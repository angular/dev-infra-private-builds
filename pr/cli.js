/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
        define("@angular/dev-infra-private/pr/cli", ["require", "exports", "yargs", "@angular/dev-infra-private/pr/discover-new-conflicts/cli", "@angular/dev-infra-private/pr/merge/cli", "@angular/dev-infra-private/pr/rebase/cli"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var yargs = require("yargs");
    var cli_1 = require("@angular/dev-infra-private/pr/discover-new-conflicts/cli");
    var cli_2 = require("@angular/dev-infra-private/pr/merge/cli");
    var cli_3 = require("@angular/dev-infra-private/pr/rebase/cli");
    /** Build the parser for pull request commands. */
    function buildPrParser(localYargs) {
        return localYargs.help()
            .strict()
            .demandCommand()
            .command('merge <pr-number>', 'Merge pull requests', cli_2.buildMergeCommand, cli_2.handleMergeCommand)
            .command('discover-new-conflicts <pr-number>', 'Check if a pending PR causes new conflicts for other pending PRs', cli_1.buildDiscoverNewConflictsCommand, cli_1.handleDiscoverNewConflictsCommand)
            .command('rebase <pr-number>', 'Rebase a pending PR and push the rebased commits back to Github', cli_3.buildRebaseCommand, cli_3.handleRebaseCommand);
    }
    exports.buildPrParser = buildPrParser;
    if (require.main === module) {
        buildPrParser(yargs).parse();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILDZCQUErQjtJQUUvQixnRkFBaUg7SUFDakgsK0RBQWtFO0lBQ2xFLGdFQUFxRTtJQUVyRSxrREFBa0Q7SUFDbEQsU0FBZ0IsYUFBYSxDQUFDLFVBQXNCO1FBQ2xELE9BQU8sVUFBVSxDQUFDLElBQUksRUFBRTthQUNuQixNQUFNLEVBQUU7YUFDUixhQUFhLEVBQUU7YUFDZixPQUFPLENBQUMsbUJBQW1CLEVBQUUscUJBQXFCLEVBQUUsdUJBQWlCLEVBQUUsd0JBQWtCLENBQUM7YUFDMUYsT0FBTyxDQUNKLG9DQUFvQyxFQUNwQyxrRUFBa0UsRUFDbEUsc0NBQWdDLEVBQUUsdUNBQWlDLENBQUM7YUFDdkUsT0FBTyxDQUNKLG9CQUFvQixFQUFFLGlFQUFpRSxFQUN2Rix3QkFBa0IsRUFBRSx5QkFBbUIsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFaRCxzQ0FZQztJQUVELElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7UUFDM0IsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQzlCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7YnVpbGREaXNjb3Zlck5ld0NvbmZsaWN0c0NvbW1hbmQsIGhhbmRsZURpc2NvdmVyTmV3Q29uZmxpY3RzQ29tbWFuZH0gZnJvbSAnLi9kaXNjb3Zlci1uZXctY29uZmxpY3RzL2NsaSc7XG5pbXBvcnQge2J1aWxkTWVyZ2VDb21tYW5kLCBoYW5kbGVNZXJnZUNvbW1hbmR9IGZyb20gJy4vbWVyZ2UvY2xpJztcbmltcG9ydCB7YnVpbGRSZWJhc2VDb21tYW5kLCBoYW5kbGVSZWJhc2VDb21tYW5kfSBmcm9tICcuL3JlYmFzZS9jbGknO1xuXG4vKiogQnVpbGQgdGhlIHBhcnNlciBmb3IgcHVsbCByZXF1ZXN0IGNvbW1hbmRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUHJQYXJzZXIobG9jYWxZYXJnczogeWFyZ3MuQXJndikge1xuICByZXR1cm4gbG9jYWxZYXJncy5oZWxwKClcbiAgICAgIC5zdHJpY3QoKVxuICAgICAgLmRlbWFuZENvbW1hbmQoKVxuICAgICAgLmNvbW1hbmQoJ21lcmdlIDxwci1udW1iZXI+JywgJ01lcmdlIHB1bGwgcmVxdWVzdHMnLCBidWlsZE1lcmdlQ29tbWFuZCwgaGFuZGxlTWVyZ2VDb21tYW5kKVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ2Rpc2NvdmVyLW5ldy1jb25mbGljdHMgPHByLW51bWJlcj4nLFxuICAgICAgICAgICdDaGVjayBpZiBhIHBlbmRpbmcgUFIgY2F1c2VzIG5ldyBjb25mbGljdHMgZm9yIG90aGVyIHBlbmRpbmcgUFJzJyxcbiAgICAgICAgICBidWlsZERpc2NvdmVyTmV3Q29uZmxpY3RzQ29tbWFuZCwgaGFuZGxlRGlzY292ZXJOZXdDb25mbGljdHNDb21tYW5kKVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ3JlYmFzZSA8cHItbnVtYmVyPicsICdSZWJhc2UgYSBwZW5kaW5nIFBSIGFuZCBwdXNoIHRoZSByZWJhc2VkIGNvbW1pdHMgYmFjayB0byBHaXRodWInLFxuICAgICAgICAgIGJ1aWxkUmViYXNlQ29tbWFuZCwgaGFuZGxlUmViYXNlQ29tbWFuZCk7XG59XG5cbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSkge1xuICBidWlsZFByUGFyc2VyKHlhcmdzKS5wYXJzZSgpO1xufVxuIl19