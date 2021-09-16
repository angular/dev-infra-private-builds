"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleasePublishCommandModule = void 0;
const config_1 = require("../../utils/config");
const console_1 = require("../../utils/console");
const github_yargs_1 = require("../../utils/git/github-yargs");
const index_1 = require("../config/index");
const index_2 = require("./index");
const authenticated_git_client_1 = require("../../utils/git/authenticated-git-client");
/** Yargs command builder for configuring the `ng-dev release publish` command. */
function builder(argv) {
    return (0, github_yargs_1.addGithubTokenOption)(argv);
}
/** Yargs command handler for staging a release. */
async function handler() {
    const git = authenticated_git_client_1.AuthenticatedGitClient.get();
    const config = (0, config_1.getConfig)();
    (0, index_1.assertValidReleaseConfig)(config);
    (0, config_1.assertValidGithubConfig)(config);
    const task = new index_2.ReleaseTool(git, config.release, config.github, git.baseDir);
    const result = await task.run();
    switch (result) {
        case index_2.CompletionState.FATAL_ERROR:
            (0, console_1.error)((0, console_1.red)(`Release action has been aborted due to fatal errors. See above.`));
            process.exitCode = 2;
            break;
        case index_2.CompletionState.MANUALLY_ABORTED:
            (0, console_1.info)((0, console_1.yellow)(`Release action has been manually aborted.`));
            process.exitCode = 1;
            break;
        case index_2.CompletionState.SUCCESS:
            (0, console_1.info)((0, console_1.green)(`Release action has completed successfully.`));
            break;
    }
}
/** CLI command module for publishing a release. */
exports.ReleasePublishCommandModule = {
    builder,
    handler,
    command: 'publish',
    describe: 'Publish new releases and configure version branches.',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2UvcHVibGlzaC9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBSUgsK0NBQXNFO0FBQ3RFLGlEQUFvRTtBQUNwRSwrREFBa0U7QUFDbEUsMkNBQXlEO0FBRXpELG1DQUFxRDtBQUNyRCx1RkFBZ0Y7QUFPaEYsa0ZBQWtGO0FBQ2xGLFNBQVMsT0FBTyxDQUFDLElBQVU7SUFDekIsT0FBTyxJQUFBLG1DQUFvQixFQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BDLENBQUM7QUFFRCxtREFBbUQ7QUFDbkQsS0FBSyxVQUFVLE9BQU87SUFDcEIsTUFBTSxHQUFHLEdBQUcsaURBQXNCLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDekMsTUFBTSxNQUFNLEdBQUcsSUFBQSxrQkFBUyxHQUFFLENBQUM7SUFDM0IsSUFBQSxnQ0FBd0IsRUFBQyxNQUFNLENBQUMsQ0FBQztJQUNqQyxJQUFBLGdDQUF1QixFQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2hDLE1BQU0sSUFBSSxHQUFHLElBQUksbUJBQVcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM5RSxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUVoQyxRQUFRLE1BQU0sRUFBRTtRQUNkLEtBQUssdUJBQWUsQ0FBQyxXQUFXO1lBQzlCLElBQUEsZUFBSyxFQUFDLElBQUEsYUFBRyxFQUFDLGlFQUFpRSxDQUFDLENBQUMsQ0FBQztZQUM5RSxPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztZQUNyQixNQUFNO1FBQ1IsS0FBSyx1QkFBZSxDQUFDLGdCQUFnQjtZQUNuQyxJQUFBLGNBQUksRUFBQyxJQUFBLGdCQUFNLEVBQUMsMkNBQTJDLENBQUMsQ0FBQyxDQUFDO1lBQzFELE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ3JCLE1BQU07UUFDUixLQUFLLHVCQUFlLENBQUMsT0FBTztZQUMxQixJQUFBLGNBQUksRUFBQyxJQUFBLGVBQUssRUFBQyw0Q0FBNEMsQ0FBQyxDQUFDLENBQUM7WUFDMUQsTUFBTTtLQUNUO0FBQ0gsQ0FBQztBQUVELG1EQUFtRDtBQUN0QyxRQUFBLDJCQUEyQixHQUE2QztJQUNuRixPQUFPO0lBQ1AsT0FBTztJQUNQLE9BQU8sRUFBRSxTQUFTO0lBQ2xCLFFBQVEsRUFBRSxzREFBc0Q7Q0FDakUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3YsIENvbW1hbmRNb2R1bGV9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHthc3NlcnRWYWxpZEdpdGh1YkNvbmZpZywgZ2V0Q29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtlcnJvciwgZ3JlZW4sIGluZm8sIHJlZCwgeWVsbG93fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7YWRkR2l0aHViVG9rZW5PcHRpb259IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWIteWFyZ3MnO1xuaW1wb3J0IHthc3NlcnRWYWxpZFJlbGVhc2VDb25maWd9IGZyb20gJy4uL2NvbmZpZy9pbmRleCc7XG5cbmltcG9ydCB7Q29tcGxldGlvblN0YXRlLCBSZWxlYXNlVG9vbH0gZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuXG4vKiogQ29tbWFuZCBsaW5lIG9wdGlvbnMgZm9yIHB1Ymxpc2hpbmcgYSByZWxlYXNlLiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWxlYXNlUHVibGlzaE9wdGlvbnMge1xuICBnaXRodWJUb2tlbjogc3RyaW5nO1xufVxuXG4vKiogWWFyZ3MgY29tbWFuZCBidWlsZGVyIGZvciBjb25maWd1cmluZyB0aGUgYG5nLWRldiByZWxlYXNlIHB1Ymxpc2hgIGNvbW1hbmQuICovXG5mdW5jdGlvbiBidWlsZGVyKGFyZ3Y6IEFyZ3YpOiBBcmd2PFJlbGVhc2VQdWJsaXNoT3B0aW9ucz4ge1xuICByZXR1cm4gYWRkR2l0aHViVG9rZW5PcHRpb24oYXJndik7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGhhbmRsZXIgZm9yIHN0YWdpbmcgYSByZWxlYXNlLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcigpIHtcbiAgY29uc3QgZ2l0ID0gQXV0aGVudGljYXRlZEdpdENsaWVudC5nZXQoKTtcbiAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gIGFzc2VydFZhbGlkUmVsZWFzZUNvbmZpZyhjb25maWcpO1xuICBhc3NlcnRWYWxpZEdpdGh1YkNvbmZpZyhjb25maWcpO1xuICBjb25zdCB0YXNrID0gbmV3IFJlbGVhc2VUb29sKGdpdCwgY29uZmlnLnJlbGVhc2UsIGNvbmZpZy5naXRodWIsIGdpdC5iYXNlRGlyKTtcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGFzay5ydW4oKTtcblxuICBzd2l0Y2ggKHJlc3VsdCkge1xuICAgIGNhc2UgQ29tcGxldGlvblN0YXRlLkZBVEFMX0VSUk9SOlxuICAgICAgZXJyb3IocmVkKGBSZWxlYXNlIGFjdGlvbiBoYXMgYmVlbiBhYm9ydGVkIGR1ZSB0byBmYXRhbCBlcnJvcnMuIFNlZSBhYm92ZS5gKSk7XG4gICAgICBwcm9jZXNzLmV4aXRDb2RlID0gMjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgQ29tcGxldGlvblN0YXRlLk1BTlVBTExZX0FCT1JURUQ6XG4gICAgICBpbmZvKHllbGxvdyhgUmVsZWFzZSBhY3Rpb24gaGFzIGJlZW4gbWFudWFsbHkgYWJvcnRlZC5gKSk7XG4gICAgICBwcm9jZXNzLmV4aXRDb2RlID0gMTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgQ29tcGxldGlvblN0YXRlLlNVQ0NFU1M6XG4gICAgICBpbmZvKGdyZWVuKGBSZWxlYXNlIGFjdGlvbiBoYXMgY29tcGxldGVkIHN1Y2Nlc3NmdWxseS5gKSk7XG4gICAgICBicmVhaztcbiAgfVxufVxuXG4vKiogQ0xJIGNvbW1hbmQgbW9kdWxlIGZvciBwdWJsaXNoaW5nIGEgcmVsZWFzZS4gKi9cbmV4cG9ydCBjb25zdCBSZWxlYXNlUHVibGlzaENvbW1hbmRNb2R1bGU6IENvbW1hbmRNb2R1bGU8e30sIFJlbGVhc2VQdWJsaXNoT3B0aW9ucz4gPSB7XG4gIGJ1aWxkZXIsXG4gIGhhbmRsZXIsXG4gIGNvbW1hbmQ6ICdwdWJsaXNoJyxcbiAgZGVzY3JpYmU6ICdQdWJsaXNoIG5ldyByZWxlYXNlcyBhbmQgY29uZmlndXJlIHZlcnNpb24gYnJhbmNoZXMuJyxcbn07XG4iXX0=