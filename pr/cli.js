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
        define("@angular/dev-infra-private/pr/cli", ["require", "exports", "yargs", "@angular/dev-infra-private/pr/discover-new-conflicts/cli", "@angular/dev-infra-private/pr/merge/cli"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var yargs = require("yargs");
    var cli_1 = require("@angular/dev-infra-private/pr/discover-new-conflicts/cli");
    var cli_2 = require("@angular/dev-infra-private/pr/merge/cli");
    /** Build the parser for pull request commands. */
    function buildPrParser(localYargs) {
        return localYargs.help()
            .strict()
            .demandCommand()
            .command('merge <pr-number>', 'Merge pull requests', cli_2.buildMergeCommand, cli_2.handleMergeCommand)
            .command('discover-new-conflicts <pr-number>', 'Check if a pending PR causes new conflicts for other pending PRs', cli_1.buildDiscoverNewConflictsCommand, cli_1.handleDiscoverNewConflictsCommand);
    }
    exports.buildPrParser = buildPrParser;
    if (require.main === module) {
        buildPrParser(yargs).parse();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILDZCQUErQjtJQUUvQixnRkFBaUg7SUFDakgsK0RBQWtFO0lBRWxFLGtEQUFrRDtJQUNsRCxTQUFnQixhQUFhLENBQUMsVUFBc0I7UUFDbEQsT0FBTyxVQUFVLENBQUMsSUFBSSxFQUFFO2FBQ25CLE1BQU0sRUFBRTthQUNSLGFBQWEsRUFBRTthQUNmLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxxQkFBcUIsRUFBRSx1QkFBaUIsRUFBRSx3QkFBa0IsQ0FBQzthQUMxRixPQUFPLENBQ0osb0NBQW9DLEVBQ3BDLGtFQUFrRSxFQUNsRSxzQ0FBZ0MsRUFBRSx1Q0FBaUMsQ0FBQyxDQUFBO0lBQzlFLENBQUM7SUFURCxzQ0FTQztJQUVELElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7UUFDM0IsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQzlCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7YnVpbGREaXNjb3Zlck5ld0NvbmZsaWN0c0NvbW1hbmQsIGhhbmRsZURpc2NvdmVyTmV3Q29uZmxpY3RzQ29tbWFuZH0gZnJvbSAnLi9kaXNjb3Zlci1uZXctY29uZmxpY3RzL2NsaSc7XG5pbXBvcnQge2J1aWxkTWVyZ2VDb21tYW5kLCBoYW5kbGVNZXJnZUNvbW1hbmR9IGZyb20gJy4vbWVyZ2UvY2xpJztcblxuLyoqIEJ1aWxkIHRoZSBwYXJzZXIgZm9yIHB1bGwgcmVxdWVzdCBjb21tYW5kcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFByUGFyc2VyKGxvY2FsWWFyZ3M6IHlhcmdzLkFyZ3YpIHtcbiAgcmV0dXJuIGxvY2FsWWFyZ3MuaGVscCgpXG4gICAgICAuc3RyaWN0KClcbiAgICAgIC5kZW1hbmRDb21tYW5kKClcbiAgICAgIC5jb21tYW5kKCdtZXJnZSA8cHItbnVtYmVyPicsICdNZXJnZSBwdWxsIHJlcXVlc3RzJywgYnVpbGRNZXJnZUNvbW1hbmQsIGhhbmRsZU1lcmdlQ29tbWFuZClcbiAgICAgIC5jb21tYW5kKFxuICAgICAgICAgICdkaXNjb3Zlci1uZXctY29uZmxpY3RzIDxwci1udW1iZXI+JyxcbiAgICAgICAgICAnQ2hlY2sgaWYgYSBwZW5kaW5nIFBSIGNhdXNlcyBuZXcgY29uZmxpY3RzIGZvciBvdGhlciBwZW5kaW5nIFBScycsXG4gICAgICAgICAgYnVpbGREaXNjb3Zlck5ld0NvbmZsaWN0c0NvbW1hbmQsIGhhbmRsZURpc2NvdmVyTmV3Q29uZmxpY3RzQ29tbWFuZClcbn1cblxuaWYgKHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlKSB7XG4gIGJ1aWxkUHJQYXJzZXIoeWFyZ3MpLnBhcnNlKCk7XG59XG4iXX0=