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
const cli_1 = require("./check/cli");
const config_1 = require("./config");
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
    const config = config_1.getCaretakerConfig();
    if (config.caretaker === undefined) {
        console_1.info('The `caretaker` command is not enabled in this repository.');
        console_1.info(`   To enable it, provide a caretaker config in the repository's .ng-dev/ directory`);
        process.exit(1);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L2NhcmV0YWtlci9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgscUNBQTZCO0FBRTdCLHFDQUF3QztBQUN4QyxxQ0FBNEM7QUFDNUMsdUNBQTRDO0FBRTVDLG1EQUFtRDtBQUNuRCxTQUFnQixvQkFBb0IsQ0FBQyxLQUFXO0lBQzlDLE9BQU8sS0FBSztTQUNULFVBQVUsQ0FBQyxzQkFBc0IsRUFBRSxLQUFLLENBQUM7U0FDekMsT0FBTyxDQUFDLGlCQUFXLENBQUM7U0FDcEIsT0FBTyxDQUFDLG1CQUFhLENBQUMsQ0FBQztBQUM1QixDQUFDO0FBTEQsb0RBS0M7QUFFRCxTQUFTLHNCQUFzQixDQUFDLElBQWU7SUFDN0MsTUFBTSxNQUFNLEdBQUcsMkJBQWtCLEVBQUUsQ0FBQztJQUNwQyxJQUFJLE1BQU0sQ0FBQyxTQUFTLEtBQUssU0FBUyxFQUFFO1FBQ2xDLGNBQUksQ0FBQyw0REFBNEQsQ0FBQyxDQUFDO1FBQ25FLGNBQUksQ0FBQyxvRkFBb0YsQ0FBQyxDQUFDO1FBQzNGLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aW5mb30gZnJvbSAnY29uc29sZSc7XG5pbXBvcnQge0FyZ3VtZW50cywgQXJndn0gZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHtDaGVja01vZHVsZX0gZnJvbSAnLi9jaGVjay9jbGknO1xuaW1wb3J0IHtnZXRDYXJldGFrZXJDb25maWd9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7SGFuZG9mZk1vZHVsZX0gZnJvbSAnLi9oYW5kb2ZmL2NsaSc7XG5cbi8qKiBCdWlsZCB0aGUgcGFyc2VyIGZvciB0aGUgY2FyZXRha2VyIGNvbW1hbmRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQ2FyZXRha2VyUGFyc2VyKHlhcmdzOiBBcmd2KSB7XG4gIHJldHVybiB5YXJnc1xuICAgIC5taWRkbGV3YXJlKGNhcmV0YWtlckNvbW1hbmRDYW5SdW4sIGZhbHNlKVxuICAgIC5jb21tYW5kKENoZWNrTW9kdWxlKVxuICAgIC5jb21tYW5kKEhhbmRvZmZNb2R1bGUpO1xufVxuXG5mdW5jdGlvbiBjYXJldGFrZXJDb21tYW5kQ2FuUnVuKGFyZ3Y6IEFyZ3VtZW50cykge1xuICBjb25zdCBjb25maWcgPSBnZXRDYXJldGFrZXJDb25maWcoKTtcbiAgaWYgKGNvbmZpZy5jYXJldGFrZXIgPT09IHVuZGVmaW5lZCkge1xuICAgIGluZm8oJ1RoZSBgY2FyZXRha2VyYCBjb21tYW5kIGlzIG5vdCBlbmFibGVkIGluIHRoaXMgcmVwb3NpdG9yeS4nKTtcbiAgICBpbmZvKGAgICBUbyBlbmFibGUgaXQsIHByb3ZpZGUgYSBjYXJldGFrZXIgY29uZmlnIGluIHRoZSByZXBvc2l0b3J5J3MgLm5nLWRldi8gZGlyZWN0b3J5YCk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG59XG4iXX0=