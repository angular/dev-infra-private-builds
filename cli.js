#!/usr/bin/env node
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/cli", ["require", "exports", "yargs", "@angular/dev-infra-private/ts-circular-dependencies", "@angular/dev-infra-private/pullapprove/cli", "@angular/dev-infra-private/commit-message/cli"], factory);
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
    yargs.scriptName('ng-dev')
        .demandCommand()
        .recommendCommands()
        .command('ts-circular-deps <command>', '', index_1.tsCircularDependenciesBuilder)
        .command('pullapprove <command>', '', cli_1.buildPullapproveParser)
        .command('commit-message <command>', '', cli_2.buildCommitMessageParser)
        .wrap(120)
        .strict()
        .parse();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFDQTs7Ozs7O09BTUc7SUFDSCw2QkFBK0I7SUFDL0IsNkVBQStFO0lBQy9FLGtFQUF5RDtJQUN6RCxxRUFBOEQ7SUFFOUQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7U0FDckIsYUFBYSxFQUFFO1NBQ2YsaUJBQWlCLEVBQUU7U0FDbkIsT0FBTyxDQUFDLDRCQUE0QixFQUFFLEVBQUUsRUFBRSxxQ0FBNkIsQ0FBQztTQUN4RSxPQUFPLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxFQUFFLDRCQUFzQixDQUFDO1NBQzVELE9BQU8sQ0FBQywwQkFBMEIsRUFBRSxFQUFFLEVBQUUsOEJBQXdCLENBQUM7U0FDakUsSUFBSSxDQUFDLEdBQUcsQ0FBQztTQUNULE1BQU0sRUFBRTtTQUNSLEtBQUssRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHt0c0NpcmN1bGFyRGVwZW5kZW5jaWVzQnVpbGRlcn0gZnJvbSAnLi90cy1jaXJjdWxhci1kZXBlbmRlbmNpZXMvaW5kZXgnO1xuaW1wb3J0IHtidWlsZFB1bGxhcHByb3ZlUGFyc2VyfSBmcm9tICcuL3B1bGxhcHByb3ZlL2NsaSc7XG5pbXBvcnQge2J1aWxkQ29tbWl0TWVzc2FnZVBhcnNlcn0gZnJvbSAnLi9jb21taXQtbWVzc2FnZS9jbGknO1xuXG55YXJncy5zY3JpcHROYW1lKCduZy1kZXYnKVxuICAgIC5kZW1hbmRDb21tYW5kKClcbiAgICAucmVjb21tZW5kQ29tbWFuZHMoKVxuICAgIC5jb21tYW5kKCd0cy1jaXJjdWxhci1kZXBzIDxjb21tYW5kPicsICcnLCB0c0NpcmN1bGFyRGVwZW5kZW5jaWVzQnVpbGRlcilcbiAgICAuY29tbWFuZCgncHVsbGFwcHJvdmUgPGNvbW1hbmQ+JywgJycsIGJ1aWxkUHVsbGFwcHJvdmVQYXJzZXIpXG4gICAgLmNvbW1hbmQoJ2NvbW1pdC1tZXNzYWdlIDxjb21tYW5kPicsICcnLCBidWlsZENvbW1pdE1lc3NhZ2VQYXJzZXIpXG4gICAgLndyYXAoMTIwKVxuICAgIC5zdHJpY3QoKVxuICAgIC5wYXJzZSgpO1xuIl19