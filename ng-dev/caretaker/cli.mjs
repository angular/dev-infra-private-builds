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
    try {
        (0, config_1.getConfig)([config_2.assertValidCaretakerConfig, config_1.assertValidGithubConfig]);
    }
    catch {
        (0, console_1.info)('The `caretaker` command is not enabled in this repository.');
        (0, console_1.info)(`   To enable it, provide a caretaker config in the repository's .ng-dev/ directory`);
        process.exit(1);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L2NhcmV0YWtlci9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgscUNBQTZCO0FBRTdCLDRDQUFtRTtBQUNuRSxxQ0FBd0M7QUFDeEMscUNBQW9EO0FBQ3BELHVDQUE0QztBQUU1QyxtREFBbUQ7QUFDbkQsU0FBZ0Isb0JBQW9CLENBQUMsS0FBVztJQUM5QyxPQUFPLEtBQUs7U0FDVCxVQUFVLENBQUMsc0JBQXNCLEVBQUUsS0FBSyxDQUFDO1NBQ3pDLE9BQU8sQ0FBQyxpQkFBVyxDQUFDO1NBQ3BCLE9BQU8sQ0FBQyxtQkFBYSxDQUFDLENBQUM7QUFDNUIsQ0FBQztBQUxELG9EQUtDO0FBRUQsU0FBUyxzQkFBc0IsQ0FBQyxJQUFlO0lBQzdDLElBQUk7UUFDRixJQUFBLGtCQUFTLEVBQUMsQ0FBQyxtQ0FBMEIsRUFBRSxnQ0FBdUIsQ0FBQyxDQUFDLENBQUM7S0FDbEU7SUFBQyxNQUFNO1FBQ04sSUFBQSxjQUFJLEVBQUMsNERBQTRELENBQUMsQ0FBQztRQUNuRSxJQUFBLGNBQUksRUFBQyxvRkFBb0YsQ0FBQyxDQUFDO1FBQzNGLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aW5mb30gZnJvbSAnY29uc29sZSc7XG5pbXBvcnQge0FyZ3VtZW50cywgQXJndn0gZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHthc3NlcnRWYWxpZEdpdGh1YkNvbmZpZywgZ2V0Q29uZmlnfSBmcm9tICcuLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtDaGVja01vZHVsZX0gZnJvbSAnLi9jaGVjay9jbGknO1xuaW1wb3J0IHthc3NlcnRWYWxpZENhcmV0YWtlckNvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtIYW5kb2ZmTW9kdWxlfSBmcm9tICcuL2hhbmRvZmYvY2xpJztcblxuLyoqIEJ1aWxkIHRoZSBwYXJzZXIgZm9yIHRoZSBjYXJldGFrZXIgY29tbWFuZHMuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRDYXJldGFrZXJQYXJzZXIoeWFyZ3M6IEFyZ3YpIHtcbiAgcmV0dXJuIHlhcmdzXG4gICAgLm1pZGRsZXdhcmUoY2FyZXRha2VyQ29tbWFuZENhblJ1biwgZmFsc2UpXG4gICAgLmNvbW1hbmQoQ2hlY2tNb2R1bGUpXG4gICAgLmNvbW1hbmQoSGFuZG9mZk1vZHVsZSk7XG59XG5cbmZ1bmN0aW9uIGNhcmV0YWtlckNvbW1hbmRDYW5SdW4oYXJndjogQXJndW1lbnRzKSB7XG4gIHRyeSB7XG4gICAgZ2V0Q29uZmlnKFthc3NlcnRWYWxpZENhcmV0YWtlckNvbmZpZywgYXNzZXJ0VmFsaWRHaXRodWJDb25maWddKTtcbiAgfSBjYXRjaCB7XG4gICAgaW5mbygnVGhlIGBjYXJldGFrZXJgIGNvbW1hbmQgaXMgbm90IGVuYWJsZWQgaW4gdGhpcyByZXBvc2l0b3J5LicpO1xuICAgIGluZm8oYCAgIFRvIGVuYWJsZSBpdCwgcHJvdmlkZSBhIGNhcmV0YWtlciBjb25maWcgaW4gdGhlIHJlcG9zaXRvcnkncyAubmctZGV2LyBkaXJlY3RvcnlgKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cbn1cbiJdfQ==