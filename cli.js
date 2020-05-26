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
     * Copyright Google LLC All Rights Reserved.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFDQTs7Ozs7O09BTUc7SUFDSCw2QkFBK0I7SUFDL0IsNkVBQStFO0lBQy9FLGtFQUF5RDtJQUN6RCxxRUFBOEQ7SUFDOUQsNkRBQStDO0lBQy9DLDhEQUFpRDtJQUNqRCx5REFBdUM7SUFFdkMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7U0FDckIsYUFBYSxFQUFFO1NBQ2YsaUJBQWlCLEVBQUU7U0FDbkIsT0FBTyxDQUFDLDBCQUEwQixFQUFFLEVBQUUsRUFBRSw4QkFBd0IsQ0FBQztTQUNqRSxPQUFPLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxFQUFFLHVCQUFpQixDQUFDO1NBQ2xELE9BQU8sQ0FBQyxjQUFjLEVBQUUsRUFBRSxFQUFFLG1CQUFhLENBQUM7U0FDMUMsT0FBTyxDQUFDLHVCQUF1QixFQUFFLEVBQUUsRUFBRSw0QkFBc0IsQ0FBQztTQUM1RCxPQUFPLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxFQUFFLHdCQUFrQixDQUFDO1NBQ3BELE9BQU8sQ0FBQyw0QkFBNEIsRUFBRSxFQUFFLEVBQUUscUNBQTZCLENBQUM7U0FDeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQztTQUNULE1BQU0sRUFBRTtTQUNSLEtBQUssRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5pbXBvcnQge3RzQ2lyY3VsYXJEZXBlbmRlbmNpZXNCdWlsZGVyfSBmcm9tICcuL3RzLWNpcmN1bGFyLWRlcGVuZGVuY2llcy9pbmRleCc7XG5pbXBvcnQge2J1aWxkUHVsbGFwcHJvdmVQYXJzZXJ9IGZyb20gJy4vcHVsbGFwcHJvdmUvY2xpJztcbmltcG9ydCB7YnVpbGRDb21taXRNZXNzYWdlUGFyc2VyfSBmcm9tICcuL2NvbW1pdC1tZXNzYWdlL2NsaSc7XG5pbXBvcnQge2J1aWxkRm9ybWF0UGFyc2VyfSBmcm9tICcuL2Zvcm1hdC9jbGknO1xuaW1wb3J0IHtidWlsZFJlbGVhc2VQYXJzZXJ9IGZyb20gJy4vcmVsZWFzZS9jbGknO1xuaW1wb3J0IHtidWlsZFByUGFyc2VyfSBmcm9tICcuL3ByL2NsaSc7XG5cbnlhcmdzLnNjcmlwdE5hbWUoJ25nLWRldicpXG4gICAgLmRlbWFuZENvbW1hbmQoKVxuICAgIC5yZWNvbW1lbmRDb21tYW5kcygpXG4gICAgLmNvbW1hbmQoJ2NvbW1pdC1tZXNzYWdlIDxjb21tYW5kPicsICcnLCBidWlsZENvbW1pdE1lc3NhZ2VQYXJzZXIpXG4gICAgLmNvbW1hbmQoJ2Zvcm1hdCA8Y29tbWFuZD4nLCAnJywgYnVpbGRGb3JtYXRQYXJzZXIpXG4gICAgLmNvbW1hbmQoJ3ByIDxjb21tYW5kPicsICcnLCBidWlsZFByUGFyc2VyKVxuICAgIC5jb21tYW5kKCdwdWxsYXBwcm92ZSA8Y29tbWFuZD4nLCAnJywgYnVpbGRQdWxsYXBwcm92ZVBhcnNlcilcbiAgICAuY29tbWFuZCgncmVsZWFzZSA8Y29tbWFuZD4nLCAnJywgYnVpbGRSZWxlYXNlUGFyc2VyKVxuICAgIC5jb21tYW5kKCd0cy1jaXJjdWxhci1kZXBzIDxjb21tYW5kPicsICcnLCB0c0NpcmN1bGFyRGVwZW5kZW5jaWVzQnVpbGRlcilcbiAgICAud3JhcCgxMjApXG4gICAgLnN0cmljdCgpXG4gICAgLnBhcnNlKCk7XG4iXX0=