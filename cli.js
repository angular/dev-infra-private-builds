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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILDZCQUErQjtJQUUvQixnRUFBcUQ7SUFDckQscUVBQThEO0lBQzlELDZEQUErQztJQUMvQyw0REFBNkM7SUFDN0MseURBQXVDO0lBQ3ZDLGtFQUF5RDtJQUN6RCw4REFBaUQ7SUFDakQsNkVBQStFO0lBQy9FLG9FQUEyRDtJQUUzRCxLQUFLLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQztTQUNyQixVQUFVLENBQUMsb0NBQTBCLENBQUM7U0FDdEMsYUFBYSxFQUFFO1NBQ2YsaUJBQWlCLEVBQUU7U0FDbkIsT0FBTyxDQUFDLDBCQUEwQixFQUFFLEVBQUUsRUFBRSw4QkFBd0IsQ0FBQztTQUNqRSxPQUFPLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxFQUFFLHVCQUFpQixDQUFDO1NBQ2xELE9BQU8sQ0FBQyxjQUFjLEVBQUUsRUFBRSxFQUFFLG1CQUFhLENBQUM7U0FDMUMsT0FBTyxDQUFDLHVCQUF1QixFQUFFLEVBQUUsRUFBRSw0QkFBc0IsQ0FBQztTQUM1RCxPQUFPLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxFQUFFLHdCQUFrQixDQUFDO1NBQ3BELE9BQU8sQ0FBQyw0QkFBNEIsRUFBRSxFQUFFLEVBQUUscUNBQTZCLENBQUM7U0FDeEUsT0FBTyxDQUFDLHFCQUFxQixFQUFFLEVBQUUsRUFBRSwwQkFBb0IsQ0FBQztTQUN4RCxPQUFPLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLHNCQUFnQixDQUFDO1NBQ25ELElBQUksQ0FBQyxHQUFHLENBQUM7U0FDVCxNQUFNLEVBQUU7U0FDUixLQUFLLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2J1aWxkQ2FyZXRha2VyUGFyc2VyfSBmcm9tICcuL2NhcmV0YWtlci9jbGknO1xuaW1wb3J0IHtidWlsZENvbW1pdE1lc3NhZ2VQYXJzZXJ9IGZyb20gJy4vY29tbWl0LW1lc3NhZ2UvY2xpJztcbmltcG9ydCB7YnVpbGRGb3JtYXRQYXJzZXJ9IGZyb20gJy4vZm9ybWF0L2NsaSc7XG5pbXBvcnQge2J1aWxkTmdib3RQYXJzZXJ9IGZyb20gJy4vbmdib3QvY2xpJztcbmltcG9ydCB7YnVpbGRQclBhcnNlcn0gZnJvbSAnLi9wci9jbGknO1xuaW1wb3J0IHtidWlsZFB1bGxhcHByb3ZlUGFyc2VyfSBmcm9tICcuL3B1bGxhcHByb3ZlL2NsaSc7XG5pbXBvcnQge2J1aWxkUmVsZWFzZVBhcnNlcn0gZnJvbSAnLi9yZWxlYXNlL2NsaSc7XG5pbXBvcnQge3RzQ2lyY3VsYXJEZXBlbmRlbmNpZXNCdWlsZGVyfSBmcm9tICcuL3RzLWNpcmN1bGFyLWRlcGVuZGVuY2llcy9pbmRleCc7XG5pbXBvcnQge2NhcHR1cmVMb2dPdXRwdXRGb3JDb21tYW5kfSBmcm9tICcuL3V0aWxzL2NvbnNvbGUnO1xuXG55YXJncy5zY3JpcHROYW1lKCduZy1kZXYnKVxuICAgIC5taWRkbGV3YXJlKGNhcHR1cmVMb2dPdXRwdXRGb3JDb21tYW5kKVxuICAgIC5kZW1hbmRDb21tYW5kKClcbiAgICAucmVjb21tZW5kQ29tbWFuZHMoKVxuICAgIC5jb21tYW5kKCdjb21taXQtbWVzc2FnZSA8Y29tbWFuZD4nLCAnJywgYnVpbGRDb21taXRNZXNzYWdlUGFyc2VyKVxuICAgIC5jb21tYW5kKCdmb3JtYXQgPGNvbW1hbmQ+JywgJycsIGJ1aWxkRm9ybWF0UGFyc2VyKVxuICAgIC5jb21tYW5kKCdwciA8Y29tbWFuZD4nLCAnJywgYnVpbGRQclBhcnNlcilcbiAgICAuY29tbWFuZCgncHVsbGFwcHJvdmUgPGNvbW1hbmQ+JywgJycsIGJ1aWxkUHVsbGFwcHJvdmVQYXJzZXIpXG4gICAgLmNvbW1hbmQoJ3JlbGVhc2UgPGNvbW1hbmQ+JywgJycsIGJ1aWxkUmVsZWFzZVBhcnNlcilcbiAgICAuY29tbWFuZCgndHMtY2lyY3VsYXItZGVwcyA8Y29tbWFuZD4nLCAnJywgdHNDaXJjdWxhckRlcGVuZGVuY2llc0J1aWxkZXIpXG4gICAgLmNvbW1hbmQoJ2NhcmV0YWtlciA8Y29tbWFuZD4nLCAnJywgYnVpbGRDYXJldGFrZXJQYXJzZXIpXG4gICAgLmNvbW1hbmQoJ25nYm90IDxjb21tYW5kPicsIGZhbHNlLCBidWlsZE5nYm90UGFyc2VyKVxuICAgIC53cmFwKDEyMClcbiAgICAuc3RyaWN0KClcbiAgICAucGFyc2UoKTtcbiJdfQ==