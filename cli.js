#!/usr/bin/env node
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/cli", ["require", "exports", "yargs", "@angular/dev-infra-private/caretaker/cli", "@angular/dev-infra-private/commit-message/cli", "@angular/dev-infra-private/format/cli", "@angular/dev-infra-private/ngbot/cli", "@angular/dev-infra-private/pr/cli", "@angular/dev-infra-private/pullapprove/cli", "@angular/dev-infra-private/release/cli", "@angular/dev-infra-private/ts-circular-dependencies", "@angular/dev-infra-private/utils/console"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var yargs = require("yargs");
    var cli_1 = require("@angular/dev-infra-private/caretaker/cli");
    var cli_2 = require("@angular/dev-infra-private/commit-message/cli");
    var cli_3 = require("@angular/dev-infra-private/format/cli");
    var cli_4 = require("@angular/dev-infra-private/ngbot/cli");
    var cli_5 = require("@angular/dev-infra-private/pr/cli");
    var cli_6 = require("@angular/dev-infra-private/pullapprove/cli");
    var cli_7 = require("@angular/dev-infra-private/release/cli");
    var index_1 = require("@angular/dev-infra-private/ts-circular-dependencies");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    yargs.scriptName('ng-dev')
        .middleware(console_1.captureLogOutputForCommand)
        .demandCommand()
        .recommendCommands()
        .command('commit-message <command>', '', cli_2.buildCommitMessageParser)
        .command('format <command>', '', cli_3.buildFormatParser)
        .command('pr <command>', '', cli_5.buildPrParser)
        .command('pullapprove <command>', '', cli_6.buildPullapproveParser)
        .command('release <command>', '', cli_7.buildReleaseParser)
        .command('ts-circular-deps <command>', '', index_1.tsCircularDependenciesBuilder)
        .command('caretaker <command>', '', cli_1.buildCaretakerParser)
        .command('ngbot <command>', false, cli_4.buildNgbotParser)
        .wrap(120)
        .strict()
        .parse();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFDQTs7Ozs7O09BTUc7SUFDSCw2QkFBK0I7SUFFL0IsZ0VBQXFEO0lBQ3JELHFFQUE4RDtJQUM5RCw2REFBK0M7SUFDL0MsNERBQTZDO0lBQzdDLHlEQUF1QztJQUN2QyxrRUFBeUQ7SUFDekQsOERBQWlEO0lBQ2pELDZFQUErRTtJQUMvRSxvRUFBMkQ7SUFFM0QsS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7U0FDckIsVUFBVSxDQUFDLG9DQUEwQixDQUFDO1NBQ3RDLGFBQWEsRUFBRTtTQUNmLGlCQUFpQixFQUFFO1NBQ25CLE9BQU8sQ0FBQywwQkFBMEIsRUFBRSxFQUFFLEVBQUUsOEJBQXdCLENBQUM7U0FDakUsT0FBTyxDQUFDLGtCQUFrQixFQUFFLEVBQUUsRUFBRSx1QkFBaUIsQ0FBQztTQUNsRCxPQUFPLENBQUMsY0FBYyxFQUFFLEVBQUUsRUFBRSxtQkFBYSxDQUFDO1NBQzFDLE9BQU8sQ0FBQyx1QkFBdUIsRUFBRSxFQUFFLEVBQUUsNEJBQXNCLENBQUM7U0FDNUQsT0FBTyxDQUFDLG1CQUFtQixFQUFFLEVBQUUsRUFBRSx3QkFBa0IsQ0FBQztTQUNwRCxPQUFPLENBQUMsNEJBQTRCLEVBQUUsRUFBRSxFQUFFLHFDQUE2QixDQUFDO1NBQ3hFLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxFQUFFLEVBQUUsMEJBQW9CLENBQUM7U0FDeEQsT0FBTyxDQUFDLGlCQUFpQixFQUFFLEtBQUssRUFBRSxzQkFBZ0IsQ0FBQztTQUNuRCxJQUFJLENBQUMsR0FBRyxDQUFDO1NBQ1QsTUFBTSxFQUFFO1NBQ1IsS0FBSyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtidWlsZENhcmV0YWtlclBhcnNlcn0gZnJvbSAnLi9jYXJldGFrZXIvY2xpJztcbmltcG9ydCB7YnVpbGRDb21taXRNZXNzYWdlUGFyc2VyfSBmcm9tICcuL2NvbW1pdC1tZXNzYWdlL2NsaSc7XG5pbXBvcnQge2J1aWxkRm9ybWF0UGFyc2VyfSBmcm9tICcuL2Zvcm1hdC9jbGknO1xuaW1wb3J0IHtidWlsZE5nYm90UGFyc2VyfSBmcm9tICcuL25nYm90L2NsaSc7XG5pbXBvcnQge2J1aWxkUHJQYXJzZXJ9IGZyb20gJy4vcHIvY2xpJztcbmltcG9ydCB7YnVpbGRQdWxsYXBwcm92ZVBhcnNlcn0gZnJvbSAnLi9wdWxsYXBwcm92ZS9jbGknO1xuaW1wb3J0IHtidWlsZFJlbGVhc2VQYXJzZXJ9IGZyb20gJy4vcmVsZWFzZS9jbGknO1xuaW1wb3J0IHt0c0NpcmN1bGFyRGVwZW5kZW5jaWVzQnVpbGRlcn0gZnJvbSAnLi90cy1jaXJjdWxhci1kZXBlbmRlbmNpZXMvaW5kZXgnO1xuaW1wb3J0IHtjYXB0dXJlTG9nT3V0cHV0Rm9yQ29tbWFuZH0gZnJvbSAnLi91dGlscy9jb25zb2xlJztcblxueWFyZ3Muc2NyaXB0TmFtZSgnbmctZGV2JylcbiAgICAubWlkZGxld2FyZShjYXB0dXJlTG9nT3V0cHV0Rm9yQ29tbWFuZClcbiAgICAuZGVtYW5kQ29tbWFuZCgpXG4gICAgLnJlY29tbWVuZENvbW1hbmRzKClcbiAgICAuY29tbWFuZCgnY29tbWl0LW1lc3NhZ2UgPGNvbW1hbmQ+JywgJycsIGJ1aWxkQ29tbWl0TWVzc2FnZVBhcnNlcilcbiAgICAuY29tbWFuZCgnZm9ybWF0IDxjb21tYW5kPicsICcnLCBidWlsZEZvcm1hdFBhcnNlcilcbiAgICAuY29tbWFuZCgncHIgPGNvbW1hbmQ+JywgJycsIGJ1aWxkUHJQYXJzZXIpXG4gICAgLmNvbW1hbmQoJ3B1bGxhcHByb3ZlIDxjb21tYW5kPicsICcnLCBidWlsZFB1bGxhcHByb3ZlUGFyc2VyKVxuICAgIC5jb21tYW5kKCdyZWxlYXNlIDxjb21tYW5kPicsICcnLCBidWlsZFJlbGVhc2VQYXJzZXIpXG4gICAgLmNvbW1hbmQoJ3RzLWNpcmN1bGFyLWRlcHMgPGNvbW1hbmQ+JywgJycsIHRzQ2lyY3VsYXJEZXBlbmRlbmNpZXNCdWlsZGVyKVxuICAgIC5jb21tYW5kKCdjYXJldGFrZXIgPGNvbW1hbmQ+JywgJycsIGJ1aWxkQ2FyZXRha2VyUGFyc2VyKVxuICAgIC5jb21tYW5kKCduZ2JvdCA8Y29tbWFuZD4nLCBmYWxzZSwgYnVpbGROZ2JvdFBhcnNlcilcbiAgICAud3JhcCgxMjApXG4gICAgLnN0cmljdCgpXG4gICAgLnBhcnNlKCk7XG4iXX0=