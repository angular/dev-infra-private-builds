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
        define("@angular/dev-infra-private/pr/cli", ["require", "exports", "@angular/dev-infra-private/pr/check-target-branches/cli", "@angular/dev-infra-private/pr/checkout/cli", "@angular/dev-infra-private/pr/discover-new-conflicts/cli", "@angular/dev-infra-private/pr/merge/cli", "@angular/dev-infra-private/pr/rebase/cli"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildPrParser = void 0;
    var cli_1 = require("@angular/dev-infra-private/pr/check-target-branches/cli");
    var cli_2 = require("@angular/dev-infra-private/pr/checkout/cli");
    var cli_3 = require("@angular/dev-infra-private/pr/discover-new-conflicts/cli");
    var cli_4 = require("@angular/dev-infra-private/pr/merge/cli");
    var cli_5 = require("@angular/dev-infra-private/pr/rebase/cli");
    /** Build the parser for pull request commands. */
    function buildPrParser(localYargs) {
        return localYargs.help()
            .strict()
            .demandCommand()
            .command('merge <pr-number>', 'Merge pull requests', cli_4.buildMergeCommand, cli_4.handleMergeCommand)
            .command('discover-new-conflicts <pr-number>', 'Check if a pending PR causes new conflicts for other pending PRs', cli_3.buildDiscoverNewConflictsCommand, cli_3.handleDiscoverNewConflictsCommand)
            .command('rebase <pr-number>', 'Rebase a pending PR and push the rebased commits back to Github', cli_5.buildRebaseCommand, cli_5.handleRebaseCommand)
            .command(cli_2.CheckoutCommandModule)
            .command(cli_1.CheckTargetBranchesModule);
    }
    exports.buildPrParser = buildPrParser;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFJSCwrRUFBc0U7SUFDdEUsa0VBQXFEO0lBQ3JELGdGQUFpSDtJQUNqSCwrREFBa0U7SUFDbEUsZ0VBQXFFO0lBRXJFLGtEQUFrRDtJQUNsRCxTQUFnQixhQUFhLENBQUMsVUFBc0I7UUFDbEQsT0FBTyxVQUFVLENBQUMsSUFBSSxFQUFFO2FBQ25CLE1BQU0sRUFBRTthQUNSLGFBQWEsRUFBRTthQUNmLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxxQkFBcUIsRUFBRSx1QkFBaUIsRUFBRSx3QkFBa0IsQ0FBQzthQUMxRixPQUFPLENBQ0osb0NBQW9DLEVBQ3BDLGtFQUFrRSxFQUNsRSxzQ0FBZ0MsRUFBRSx1Q0FBaUMsQ0FBQzthQUN2RSxPQUFPLENBQ0osb0JBQW9CLEVBQUUsaUVBQWlFLEVBQ3ZGLHdCQUFrQixFQUFFLHlCQUFtQixDQUFDO2FBQzNDLE9BQU8sQ0FBQywyQkFBcUIsQ0FBQzthQUM5QixPQUFPLENBQUMsK0JBQXlCLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBZEQsc0NBY0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge0NoZWNrVGFyZ2V0QnJhbmNoZXNNb2R1bGV9IGZyb20gJy4vY2hlY2stdGFyZ2V0LWJyYW5jaGVzL2NsaSc7XG5pbXBvcnQge0NoZWNrb3V0Q29tbWFuZE1vZHVsZX0gZnJvbSAnLi9jaGVja291dC9jbGknO1xuaW1wb3J0IHtidWlsZERpc2NvdmVyTmV3Q29uZmxpY3RzQ29tbWFuZCwgaGFuZGxlRGlzY292ZXJOZXdDb25mbGljdHNDb21tYW5kfSBmcm9tICcuL2Rpc2NvdmVyLW5ldy1jb25mbGljdHMvY2xpJztcbmltcG9ydCB7YnVpbGRNZXJnZUNvbW1hbmQsIGhhbmRsZU1lcmdlQ29tbWFuZH0gZnJvbSAnLi9tZXJnZS9jbGknO1xuaW1wb3J0IHtidWlsZFJlYmFzZUNvbW1hbmQsIGhhbmRsZVJlYmFzZUNvbW1hbmR9IGZyb20gJy4vcmViYXNlL2NsaSc7XG5cbi8qKiBCdWlsZCB0aGUgcGFyc2VyIGZvciBwdWxsIHJlcXVlc3QgY29tbWFuZHMuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRQclBhcnNlcihsb2NhbFlhcmdzOiB5YXJncy5Bcmd2KSB7XG4gIHJldHVybiBsb2NhbFlhcmdzLmhlbHAoKVxuICAgICAgLnN0cmljdCgpXG4gICAgICAuZGVtYW5kQ29tbWFuZCgpXG4gICAgICAuY29tbWFuZCgnbWVyZ2UgPHByLW51bWJlcj4nLCAnTWVyZ2UgcHVsbCByZXF1ZXN0cycsIGJ1aWxkTWVyZ2VDb21tYW5kLCBoYW5kbGVNZXJnZUNvbW1hbmQpXG4gICAgICAuY29tbWFuZChcbiAgICAgICAgICAnZGlzY292ZXItbmV3LWNvbmZsaWN0cyA8cHItbnVtYmVyPicsXG4gICAgICAgICAgJ0NoZWNrIGlmIGEgcGVuZGluZyBQUiBjYXVzZXMgbmV3IGNvbmZsaWN0cyBmb3Igb3RoZXIgcGVuZGluZyBQUnMnLFxuICAgICAgICAgIGJ1aWxkRGlzY292ZXJOZXdDb25mbGljdHNDb21tYW5kLCBoYW5kbGVEaXNjb3Zlck5ld0NvbmZsaWN0c0NvbW1hbmQpXG4gICAgICAuY29tbWFuZChcbiAgICAgICAgICAncmViYXNlIDxwci1udW1iZXI+JywgJ1JlYmFzZSBhIHBlbmRpbmcgUFIgYW5kIHB1c2ggdGhlIHJlYmFzZWQgY29tbWl0cyBiYWNrIHRvIEdpdGh1YicsXG4gICAgICAgICAgYnVpbGRSZWJhc2VDb21tYW5kLCBoYW5kbGVSZWJhc2VDb21tYW5kKVxuICAgICAgLmNvbW1hbmQoQ2hlY2tvdXRDb21tYW5kTW9kdWxlKVxuICAgICAgLmNvbW1hbmQoQ2hlY2tUYXJnZXRCcmFuY2hlc01vZHVsZSk7XG59XG4iXX0=