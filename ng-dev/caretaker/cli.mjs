"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCaretakerParser = void 0;
const console_1 = require("console");
const config_1 = require("../utils/config");
const cli_1 = require("./check/cli");
const config_2 = require("./config");
const cli_2 = require("./handoff/cli");
/** Build the parser for the caretaker commands. */
function buildCaretakerParser(yargs) {
    return yargs
        .middleware(caretakerCommandCanRun, false)
        .command(cli_1.CheckModule)
        .command(cli_2.HandoffModule);
}
exports.buildCaretakerParser = buildCaretakerParser;
function caretakerCommandCanRun(argv) {
    const config = (0, config_1.getConfig)();
    try {
        (0, config_2.assertValidCaretakerConfig)(config);
    }
    catch {
        (0, console_1.info)('The `caretaker` command is not enabled in this repository.');
        (0, console_1.info)(`   To enable it, provide a caretaker config in the repository's .ng-dev/ directory`);
        process.exit(1);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L2NhcmV0YWtlci9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgscUNBQTZCO0FBRTdCLDRDQUEwQztBQUMxQyxxQ0FBd0M7QUFDeEMscUNBQW9EO0FBQ3BELHVDQUE0QztBQUU1QyxtREFBbUQ7QUFDbkQsU0FBZ0Isb0JBQW9CLENBQUMsS0FBVztJQUM5QyxPQUFPLEtBQUs7U0FDVCxVQUFVLENBQUMsc0JBQXNCLEVBQUUsS0FBSyxDQUFDO1NBQ3pDLE9BQU8sQ0FBQyxpQkFBVyxDQUFDO1NBQ3BCLE9BQU8sQ0FBQyxtQkFBYSxDQUFDLENBQUM7QUFDNUIsQ0FBQztBQUxELG9EQUtDO0FBRUQsU0FBUyxzQkFBc0IsQ0FBQyxJQUFlO0lBQzdDLE1BQU0sTUFBTSxHQUFHLElBQUEsa0JBQVMsR0FBRSxDQUFDO0lBQzNCLElBQUk7UUFDRixJQUFBLG1DQUEwQixFQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3BDO0lBQUMsTUFBTTtRQUNOLElBQUEsY0FBSSxFQUFDLDREQUE0RCxDQUFDLENBQUM7UUFDbkUsSUFBQSxjQUFJLEVBQUMsb0ZBQW9GLENBQUMsQ0FBQztRQUMzRixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2luZm99IGZyb20gJ2NvbnNvbGUnO1xuaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3Z9IGZyb20gJ3lhcmdzJztcbmltcG9ydCB7Z2V0Q29uZmlnfSBmcm9tICcuLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtDaGVja01vZHVsZX0gZnJvbSAnLi9jaGVjay9jbGknO1xuaW1wb3J0IHthc3NlcnRWYWxpZENhcmV0YWtlckNvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtIYW5kb2ZmTW9kdWxlfSBmcm9tICcuL2hhbmRvZmYvY2xpJztcblxuLyoqIEJ1aWxkIHRoZSBwYXJzZXIgZm9yIHRoZSBjYXJldGFrZXIgY29tbWFuZHMuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRDYXJldGFrZXJQYXJzZXIoeWFyZ3M6IEFyZ3YpIHtcbiAgcmV0dXJuIHlhcmdzXG4gICAgLm1pZGRsZXdhcmUoY2FyZXRha2VyQ29tbWFuZENhblJ1biwgZmFsc2UpXG4gICAgLmNvbW1hbmQoQ2hlY2tNb2R1bGUpXG4gICAgLmNvbW1hbmQoSGFuZG9mZk1vZHVsZSk7XG59XG5cbmZ1bmN0aW9uIGNhcmV0YWtlckNvbW1hbmRDYW5SdW4oYXJndjogQXJndW1lbnRzKSB7XG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICB0cnkge1xuICAgIGFzc2VydFZhbGlkQ2FyZXRha2VyQ29uZmlnKGNvbmZpZyk7XG4gIH0gY2F0Y2gge1xuICAgIGluZm8oJ1RoZSBgY2FyZXRha2VyYCBjb21tYW5kIGlzIG5vdCBlbmFibGVkIGluIHRoaXMgcmVwb3NpdG9yeS4nKTtcbiAgICBpbmZvKGAgICBUbyBlbmFibGUgaXQsIHByb3ZpZGUgYSBjYXJldGFrZXIgY29uZmlnIGluIHRoZSByZXBvc2l0b3J5J3MgLm5nLWRldi8gZGlyZWN0b3J5YCk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG59XG4iXX0=