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
    exports.buildPrParser = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw2QkFBK0I7SUFFL0IsZ0ZBQWlIO0lBQ2pILCtEQUFrRTtJQUVsRSxrREFBa0Q7SUFDbEQsU0FBZ0IsYUFBYSxDQUFDLFVBQXNCO1FBQ2xELE9BQU8sVUFBVSxDQUFDLElBQUksRUFBRTthQUNuQixNQUFNLEVBQUU7YUFDUixhQUFhLEVBQUU7YUFDZixPQUFPLENBQUMsbUJBQW1CLEVBQUUscUJBQXFCLEVBQUUsdUJBQWlCLEVBQUUsd0JBQWtCLENBQUM7YUFDMUYsT0FBTyxDQUNKLG9DQUFvQyxFQUNwQyxrRUFBa0UsRUFDbEUsc0NBQWdDLEVBQUUsdUNBQWlDLENBQUMsQ0FBQTtJQUM5RSxDQUFDO0lBVEQsc0NBU0M7SUFFRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO1FBQzNCLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUM5QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2J1aWxkRGlzY292ZXJOZXdDb25mbGljdHNDb21tYW5kLCBoYW5kbGVEaXNjb3Zlck5ld0NvbmZsaWN0c0NvbW1hbmR9IGZyb20gJy4vZGlzY292ZXItbmV3LWNvbmZsaWN0cy9jbGknO1xuaW1wb3J0IHtidWlsZE1lcmdlQ29tbWFuZCwgaGFuZGxlTWVyZ2VDb21tYW5kfSBmcm9tICcuL21lcmdlL2NsaSc7XG5cbi8qKiBCdWlsZCB0aGUgcGFyc2VyIGZvciBwdWxsIHJlcXVlc3QgY29tbWFuZHMuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRQclBhcnNlcihsb2NhbFlhcmdzOiB5YXJncy5Bcmd2KSB7XG4gIHJldHVybiBsb2NhbFlhcmdzLmhlbHAoKVxuICAgICAgLnN0cmljdCgpXG4gICAgICAuZGVtYW5kQ29tbWFuZCgpXG4gICAgICAuY29tbWFuZCgnbWVyZ2UgPHByLW51bWJlcj4nLCAnTWVyZ2UgcHVsbCByZXF1ZXN0cycsIGJ1aWxkTWVyZ2VDb21tYW5kLCBoYW5kbGVNZXJnZUNvbW1hbmQpXG4gICAgICAuY29tbWFuZChcbiAgICAgICAgICAnZGlzY292ZXItbmV3LWNvbmZsaWN0cyA8cHItbnVtYmVyPicsXG4gICAgICAgICAgJ0NoZWNrIGlmIGEgcGVuZGluZyBQUiBjYXVzZXMgbmV3IGNvbmZsaWN0cyBmb3Igb3RoZXIgcGVuZGluZyBQUnMnLFxuICAgICAgICAgIGJ1aWxkRGlzY292ZXJOZXdDb25mbGljdHNDb21tYW5kLCBoYW5kbGVEaXNjb3Zlck5ld0NvbmZsaWN0c0NvbW1hbmQpXG59XG5cbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSkge1xuICBidWlsZFByUGFyc2VyKHlhcmdzKS5wYXJzZSgpO1xufVxuIl19