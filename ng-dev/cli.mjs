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
const cli_9 = require("./ci/cli");
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
    .command('ci <command>', false, cli_9.buildCiParser)
    .wrap(120)
    .strict()
    .parse();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vbmctZGV2L2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQTs7Ozs7O0dBTUc7QUFDSCwrQkFBK0I7QUFFL0IseUNBQXFEO0FBQ3JELDhDQUE4RDtBQUM5RCxzQ0FBK0M7QUFDL0MscUNBQTZDO0FBQzdDLGtDQUF1QztBQUN2QywyQ0FBeUQ7QUFDekQsdUNBQWlEO0FBQ2pELDREQUErRTtBQUMvRSw2Q0FBMkQ7QUFDM0Qsb0NBQTJDO0FBQzNDLGtDQUF1QztBQUV2QyxLQUFLO0tBQ0YsVUFBVSxDQUFDLFFBQVEsQ0FBQztLQUNwQixVQUFVLENBQUMsb0NBQTBCLENBQUM7S0FDdEMsYUFBYSxFQUFFO0tBQ2YsaUJBQWlCLEVBQUU7S0FDbkIsT0FBTyxDQUFDLDBCQUEwQixFQUFFLEVBQUUsRUFBRSw4QkFBd0IsQ0FBQztLQUNqRSxPQUFPLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxFQUFFLHVCQUFpQixDQUFDO0tBQ2xELE9BQU8sQ0FBQyxjQUFjLEVBQUUsRUFBRSxFQUFFLG1CQUFhLENBQUM7S0FDMUMsT0FBTyxDQUFDLHVCQUF1QixFQUFFLEVBQUUsRUFBRSw0QkFBc0IsQ0FBQztLQUM1RCxPQUFPLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxFQUFFLHdCQUFrQixDQUFDO0tBQ3BELE9BQU8sQ0FBQyw0QkFBNEIsRUFBRSxFQUFFLEVBQUUscUNBQTZCLENBQUM7S0FDeEUsT0FBTyxDQUFDLHFCQUFxQixFQUFFLEVBQUUsRUFBRSwwQkFBb0IsQ0FBQztLQUN4RCxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxFQUFFLHFCQUFlLENBQUM7S0FDOUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLEtBQUssRUFBRSxzQkFBZ0IsQ0FBQztLQUNuRCxPQUFPLENBQUMsY0FBYyxFQUFFLEtBQUssRUFBRSxtQkFBYSxDQUFDO0tBQzdDLElBQUksQ0FBQyxHQUFHLENBQUM7S0FDVCxNQUFNLEVBQUU7S0FDUixLQUFLLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2J1aWxkQ2FyZXRha2VyUGFyc2VyfSBmcm9tICcuL2NhcmV0YWtlci9jbGknO1xuaW1wb3J0IHtidWlsZENvbW1pdE1lc3NhZ2VQYXJzZXJ9IGZyb20gJy4vY29tbWl0LW1lc3NhZ2UvY2xpJztcbmltcG9ydCB7YnVpbGRGb3JtYXRQYXJzZXJ9IGZyb20gJy4vZm9ybWF0L2NsaSc7XG5pbXBvcnQge2J1aWxkTmdib3RQYXJzZXJ9IGZyb20gJy4vbmdib3QvY2xpJztcbmltcG9ydCB7YnVpbGRQclBhcnNlcn0gZnJvbSAnLi9wci9jbGknO1xuaW1wb3J0IHtidWlsZFB1bGxhcHByb3ZlUGFyc2VyfSBmcm9tICcuL3B1bGxhcHByb3ZlL2NsaSc7XG5pbXBvcnQge2J1aWxkUmVsZWFzZVBhcnNlcn0gZnJvbSAnLi9yZWxlYXNlL2NsaSc7XG5pbXBvcnQge3RzQ2lyY3VsYXJEZXBlbmRlbmNpZXNCdWlsZGVyfSBmcm9tICcuL3RzLWNpcmN1bGFyLWRlcGVuZGVuY2llcy9pbmRleCc7XG5pbXBvcnQge2NhcHR1cmVMb2dPdXRwdXRGb3JDb21tYW5kfSBmcm9tICcuL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtidWlsZE1pc2NQYXJzZXJ9IGZyb20gJy4vbWlzYy9jbGknO1xuaW1wb3J0IHtidWlsZENpUGFyc2VyfSBmcm9tICcuL2NpL2NsaSc7XG5cbnlhcmdzXG4gIC5zY3JpcHROYW1lKCduZy1kZXYnKVxuICAubWlkZGxld2FyZShjYXB0dXJlTG9nT3V0cHV0Rm9yQ29tbWFuZClcbiAgLmRlbWFuZENvbW1hbmQoKVxuICAucmVjb21tZW5kQ29tbWFuZHMoKVxuICAuY29tbWFuZCgnY29tbWl0LW1lc3NhZ2UgPGNvbW1hbmQ+JywgJycsIGJ1aWxkQ29tbWl0TWVzc2FnZVBhcnNlcilcbiAgLmNvbW1hbmQoJ2Zvcm1hdCA8Y29tbWFuZD4nLCAnJywgYnVpbGRGb3JtYXRQYXJzZXIpXG4gIC5jb21tYW5kKCdwciA8Y29tbWFuZD4nLCAnJywgYnVpbGRQclBhcnNlcilcbiAgLmNvbW1hbmQoJ3B1bGxhcHByb3ZlIDxjb21tYW5kPicsICcnLCBidWlsZFB1bGxhcHByb3ZlUGFyc2VyKVxuICAuY29tbWFuZCgncmVsZWFzZSA8Y29tbWFuZD4nLCAnJywgYnVpbGRSZWxlYXNlUGFyc2VyKVxuICAuY29tbWFuZCgndHMtY2lyY3VsYXItZGVwcyA8Y29tbWFuZD4nLCAnJywgdHNDaXJjdWxhckRlcGVuZGVuY2llc0J1aWxkZXIpXG4gIC5jb21tYW5kKCdjYXJldGFrZXIgPGNvbW1hbmQ+JywgJycsIGJ1aWxkQ2FyZXRha2VyUGFyc2VyKVxuICAuY29tbWFuZCgnbWlzYyA8Y29tbWFuZD4nLCAnJywgYnVpbGRNaXNjUGFyc2VyKVxuICAuY29tbWFuZCgnbmdib3QgPGNvbW1hbmQ+JywgZmFsc2UsIGJ1aWxkTmdib3RQYXJzZXIpXG4gIC5jb21tYW5kKCdjaSA8Y29tbWFuZD4nLCBmYWxzZSwgYnVpbGRDaVBhcnNlcilcbiAgLndyYXAoMTIwKVxuICAuc3RyaWN0KClcbiAgLnBhcnNlKCk7XG4iXX0=