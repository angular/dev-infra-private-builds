#!/usr/bin/env node
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/cli", ["require", "exports", "yargs", "@angular/dev-infra-private/ts-circular-dependencies", "@angular/dev-infra-private/pullapprove/cli", "@angular/dev-infra-private/commit-message/cli", "@angular/dev-infra-private/format/cli", "@angular/dev-infra-private/release/cli", "@angular/dev-infra-private/pr/cli"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var yargs = require("yargs");
    var index_1 = require("@angular/dev-infra-private/ts-circular-dependencies");
    var cli_1 = require("@angular/dev-infra-private/pullapprove/cli");
    var cli_2 = require("@angular/dev-infra-private/commit-message/cli");
    var cli_3 = require("@angular/dev-infra-private/format/cli");
    var cli_4 = require("@angular/dev-infra-private/release/cli");
    var cli_5 = require("@angular/dev-infra-private/pr/cli");
    yargs.scriptName('ng-dev')
        .demandCommand()
        .recommendCommands()
        .command('commit-message <command>', '', cli_2.buildCommitMessageParser)
        .command('format <command>', '', cli_3.buildFormatParser)
        .command('pr <command>', '', cli_5.buildPrParser)
        .command('pullapprove <command>', '', cli_1.buildPullapproveParser)
        .command('release <command>', '', cli_4.buildReleaseParser)
        .command('ts-circular-deps <command>', '', index_1.tsCircularDependenciesBuilder)
        .wrap(120)
        .strict()
        .parse();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFDQTs7Ozs7O09BTUc7SUFDSCw2QkFBK0I7SUFDL0IsNkVBQStFO0lBQy9FLGtFQUF5RDtJQUN6RCxxRUFBOEQ7SUFDOUQsNkRBQStDO0lBQy9DLDhEQUFpRDtJQUNqRCx5REFBdUM7SUFFdkMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7U0FDckIsYUFBYSxFQUFFO1NBQ2YsaUJBQWlCLEVBQUU7U0FDbkIsT0FBTyxDQUFDLDBCQUEwQixFQUFFLEVBQUUsRUFBRSw4QkFBd0IsQ0FBQztTQUNqRSxPQUFPLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxFQUFFLHVCQUFpQixDQUFDO1NBQ2xELE9BQU8sQ0FBQyxjQUFjLEVBQUUsRUFBRSxFQUFFLG1CQUFhLENBQUM7U0FDMUMsT0FBTyxDQUFDLHVCQUF1QixFQUFFLEVBQUUsRUFBRSw0QkFBc0IsQ0FBQztTQUM1RCxPQUFPLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxFQUFFLHdCQUFrQixDQUFDO1NBQ3BELE9BQU8sQ0FBQyw0QkFBNEIsRUFBRSxFQUFFLEVBQUUscUNBQTZCLENBQUM7U0FDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQztTQUNULE1BQU0sRUFBRTtTQUNSLEtBQUssRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHt0c0NpcmN1bGFyRGVwZW5kZW5jaWVzQnVpbGRlcn0gZnJvbSAnLi90cy1jaXJjdWxhci1kZXBlbmRlbmNpZXMvaW5kZXgnO1xuaW1wb3J0IHtidWlsZFB1bGxhcHByb3ZlUGFyc2VyfSBmcm9tICcuL3B1bGxhcHByb3ZlL2NsaSc7XG5pbXBvcnQge2J1aWxkQ29tbWl0TWVzc2FnZVBhcnNlcn0gZnJvbSAnLi9jb21taXQtbWVzc2FnZS9jbGknO1xuaW1wb3J0IHtidWlsZEZvcm1hdFBhcnNlcn0gZnJvbSAnLi9mb3JtYXQvY2xpJztcbmltcG9ydCB7YnVpbGRSZWxlYXNlUGFyc2VyfSBmcm9tICcuL3JlbGVhc2UvY2xpJztcbmltcG9ydCB7YnVpbGRQclBhcnNlcn0gZnJvbSAnLi9wci9jbGknO1xuXG55YXJncy5zY3JpcHROYW1lKCduZy1kZXYnKVxuICAgIC5kZW1hbmRDb21tYW5kKClcbiAgICAucmVjb21tZW5kQ29tbWFuZHMoKVxuICAgIC5jb21tYW5kKCdjb21taXQtbWVzc2FnZSA8Y29tbWFuZD4nLCAnJywgYnVpbGRDb21taXRNZXNzYWdlUGFyc2VyKVxuICAgIC5jb21tYW5kKCdmb3JtYXQgPGNvbW1hbmQ+JywgJycsIGJ1aWxkRm9ybWF0UGFyc2VyKVxuICAgIC5jb21tYW5kKCdwciA8Y29tbWFuZD4nLCAnJywgYnVpbGRQclBhcnNlcilcbiAgICAuY29tbWFuZCgncHVsbGFwcHJvdmUgPGNvbW1hbmQ+JywgJycsIGJ1aWxkUHVsbGFwcHJvdmVQYXJzZXIpXG4gICAgLmNvbW1hbmQoJ3JlbGVhc2UgPGNvbW1hbmQ+JywgJycsIGJ1aWxkUmVsZWFzZVBhcnNlcilcbiAgICAuY29tbWFuZCgndHMtY2lyY3VsYXItZGVwcyA8Y29tbWFuZD4nLCAnJywgdHNDaXJjdWxhckRlcGVuZGVuY2llc0J1aWxkZXIpXG4gICAgLndyYXAoMTIwKVxuICAgIC5zdHJpY3QoKVxuICAgIC5wYXJzZSgpO1xuIl19