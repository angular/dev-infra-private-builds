#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const yargs = require("yargs");
const cli_1 = require("./caretaker/cli");
const cli_2 = require("./commit-message/cli");
const cli_3 = require("./format/cli");
const cli_4 = require("./ngbot/cli");
const cli_5 = require("./pr/cli");
const cli_6 = require("./pullapprove/cli");
const cli_7 = require("./release/cli");
const index_1 = require("./ts-circular-dependencies/index");
const console_1 = require("./utils/console");
const cli_8 = require("./misc/cli");
yargs
    .scriptName('ng-dev')
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
    .command('misc <command>', '', cli_8.buildMiscParser)
    .command('ngbot <command>', false, cli_4.buildNgbotParser)
    .wrap(120)
    .strict()
    .parse();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vbmctZGV2L2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQTs7Ozs7O0dBTUc7QUFDSCwrQkFBK0I7QUFFL0IseUNBQXFEO0FBQ3JELDhDQUE4RDtBQUM5RCxzQ0FBK0M7QUFDL0MscUNBQTZDO0FBQzdDLGtDQUF1QztBQUN2QywyQ0FBeUQ7QUFDekQsdUNBQWlEO0FBQ2pELDREQUErRTtBQUMvRSw2Q0FBMkQ7QUFDM0Qsb0NBQTJDO0FBRTNDLEtBQUs7S0FDRixVQUFVLENBQUMsUUFBUSxDQUFDO0tBQ3BCLFVBQVUsQ0FBQyxvQ0FBMEIsQ0FBQztLQUN0QyxhQUFhLEVBQUU7S0FDZixpQkFBaUIsRUFBRTtLQUNuQixPQUFPLENBQUMsMEJBQTBCLEVBQUUsRUFBRSxFQUFFLDhCQUF3QixDQUFDO0tBQ2pFLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLEVBQUUsdUJBQWlCLENBQUM7S0FDbEQsT0FBTyxDQUFDLGNBQWMsRUFBRSxFQUFFLEVBQUUsbUJBQWEsQ0FBQztLQUMxQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxFQUFFLDRCQUFzQixDQUFDO0tBQzVELE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLEVBQUUsd0JBQWtCLENBQUM7S0FDcEQsT0FBTyxDQUFDLDRCQUE0QixFQUFFLEVBQUUsRUFBRSxxQ0FBNkIsQ0FBQztLQUN4RSxPQUFPLENBQUMscUJBQXFCLEVBQUUsRUFBRSxFQUFFLDBCQUFvQixDQUFDO0tBQ3hELE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLEVBQUUscUJBQWUsQ0FBQztLQUM5QyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLHNCQUFnQixDQUFDO0tBQ25ELElBQUksQ0FBQyxHQUFHLENBQUM7S0FDVCxNQUFNLEVBQUU7S0FDUixLQUFLLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2J1aWxkQ2FyZXRha2VyUGFyc2VyfSBmcm9tICcuL2NhcmV0YWtlci9jbGknO1xuaW1wb3J0IHtidWlsZENvbW1pdE1lc3NhZ2VQYXJzZXJ9IGZyb20gJy4vY29tbWl0LW1lc3NhZ2UvY2xpJztcbmltcG9ydCB7YnVpbGRGb3JtYXRQYXJzZXJ9IGZyb20gJy4vZm9ybWF0L2NsaSc7XG5pbXBvcnQge2J1aWxkTmdib3RQYXJzZXJ9IGZyb20gJy4vbmdib3QvY2xpJztcbmltcG9ydCB7YnVpbGRQclBhcnNlcn0gZnJvbSAnLi9wci9jbGknO1xuaW1wb3J0IHtidWlsZFB1bGxhcHByb3ZlUGFyc2VyfSBmcm9tICcuL3B1bGxhcHByb3ZlL2NsaSc7XG5pbXBvcnQge2J1aWxkUmVsZWFzZVBhcnNlcn0gZnJvbSAnLi9yZWxlYXNlL2NsaSc7XG5pbXBvcnQge3RzQ2lyY3VsYXJEZXBlbmRlbmNpZXNCdWlsZGVyfSBmcm9tICcuL3RzLWNpcmN1bGFyLWRlcGVuZGVuY2llcy9pbmRleCc7XG5pbXBvcnQge2NhcHR1cmVMb2dPdXRwdXRGb3JDb21tYW5kfSBmcm9tICcuL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtidWlsZE1pc2NQYXJzZXJ9IGZyb20gJy4vbWlzYy9jbGknO1xuXG55YXJnc1xuICAuc2NyaXB0TmFtZSgnbmctZGV2JylcbiAgLm1pZGRsZXdhcmUoY2FwdHVyZUxvZ091dHB1dEZvckNvbW1hbmQpXG4gIC5kZW1hbmRDb21tYW5kKClcbiAgLnJlY29tbWVuZENvbW1hbmRzKClcbiAgLmNvbW1hbmQoJ2NvbW1pdC1tZXNzYWdlIDxjb21tYW5kPicsICcnLCBidWlsZENvbW1pdE1lc3NhZ2VQYXJzZXIpXG4gIC5jb21tYW5kKCdmb3JtYXQgPGNvbW1hbmQ+JywgJycsIGJ1aWxkRm9ybWF0UGFyc2VyKVxuICAuY29tbWFuZCgncHIgPGNvbW1hbmQ+JywgJycsIGJ1aWxkUHJQYXJzZXIpXG4gIC5jb21tYW5kKCdwdWxsYXBwcm92ZSA8Y29tbWFuZD4nLCAnJywgYnVpbGRQdWxsYXBwcm92ZVBhcnNlcilcbiAgLmNvbW1hbmQoJ3JlbGVhc2UgPGNvbW1hbmQ+JywgJycsIGJ1aWxkUmVsZWFzZVBhcnNlcilcbiAgLmNvbW1hbmQoJ3RzLWNpcmN1bGFyLWRlcHMgPGNvbW1hbmQ+JywgJycsIHRzQ2lyY3VsYXJEZXBlbmRlbmNpZXNCdWlsZGVyKVxuICAuY29tbWFuZCgnY2FyZXRha2VyIDxjb21tYW5kPicsICcnLCBidWlsZENhcmV0YWtlclBhcnNlcilcbiAgLmNvbW1hbmQoJ21pc2MgPGNvbW1hbmQ+JywgJycsIGJ1aWxkTWlzY1BhcnNlcilcbiAgLmNvbW1hbmQoJ25nYm90IDxjb21tYW5kPicsIGZhbHNlLCBidWlsZE5nYm90UGFyc2VyKVxuICAud3JhcCgxMjApXG4gIC5zdHJpY3QoKVxuICAucGFyc2UoKTtcbiJdfQ==