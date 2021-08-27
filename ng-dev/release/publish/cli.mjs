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
const git_client_1 = require("../../utils/git/git-client");
const github_yargs_1 = require("../../utils/git/github-yargs");
const index_1 = require("../config/index");
const index_2 = require("./index");
/** Yargs command builder for configuring the `ng-dev release publish` command. */
function builder(argv) {
    return (0, github_yargs_1.addGithubTokenOption)(argv);
}
/** Yargs command handler for staging a release. */
async function handler() {
    const git = git_client_1.GitClient.get();
    const config = (0, config_1.getConfig)();
    (0, index_1.assertValidReleaseConfig)(config);
    (0, config_1.assertValidGithubConfig)(config);
    const task = new index_2.ReleaseTool(config.release, config.github, git.baseDir);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2UvcHVibGlzaC9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBSUgsK0NBQXNFO0FBQ3RFLGlEQUFvRTtBQUNwRSwyREFBcUQ7QUFDckQsK0RBQWtFO0FBQ2xFLDJDQUF5RDtBQUV6RCxtQ0FBcUQ7QUFPckQsa0ZBQWtGO0FBQ2xGLFNBQVMsT0FBTyxDQUFDLElBQVU7SUFDekIsT0FBTyxJQUFBLG1DQUFvQixFQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BDLENBQUM7QUFFRCxtREFBbUQ7QUFDbkQsS0FBSyxVQUFVLE9BQU87SUFDcEIsTUFBTSxHQUFHLEdBQUcsc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUM1QixNQUFNLE1BQU0sR0FBRyxJQUFBLGtCQUFTLEdBQUUsQ0FBQztJQUMzQixJQUFBLGdDQUF3QixFQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2pDLElBQUEsZ0NBQXVCLEVBQUMsTUFBTSxDQUFDLENBQUM7SUFDaEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxtQkFBVyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDekUsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFFaEMsUUFBUSxNQUFNLEVBQUU7UUFDZCxLQUFLLHVCQUFlLENBQUMsV0FBVztZQUM5QixJQUFBLGVBQUssRUFBQyxJQUFBLGFBQUcsRUFBQyxpRUFBaUUsQ0FBQyxDQUFDLENBQUM7WUFDOUUsT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDckIsTUFBTTtRQUNSLEtBQUssdUJBQWUsQ0FBQyxnQkFBZ0I7WUFDbkMsSUFBQSxjQUFJLEVBQUMsSUFBQSxnQkFBTSxFQUFDLDJDQUEyQyxDQUFDLENBQUMsQ0FBQztZQUMxRCxPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztZQUNyQixNQUFNO1FBQ1IsS0FBSyx1QkFBZSxDQUFDLE9BQU87WUFDMUIsSUFBQSxjQUFJLEVBQUMsSUFBQSxlQUFLLEVBQUMsNENBQTRDLENBQUMsQ0FBQyxDQUFDO1lBQzFELE1BQU07S0FDVDtBQUNILENBQUM7QUFFRCxtREFBbUQ7QUFDdEMsUUFBQSwyQkFBMkIsR0FBNkM7SUFDbkYsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPLEVBQUUsU0FBUztJQUNsQixRQUFRLEVBQUUsc0RBQXNEO0NBQ2pFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcmd2LCBDb21tYW5kTW9kdWxlfSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7YXNzZXJ0VmFsaWRHaXRodWJDb25maWcsIGdldENvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZXJyb3IsIGdyZWVuLCBpbmZvLCByZWQsIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdC1jbGllbnQnO1xuaW1wb3J0IHthZGRHaXRodWJUb2tlbk9wdGlvbn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yi15YXJncyc7XG5pbXBvcnQge2Fzc2VydFZhbGlkUmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcblxuaW1wb3J0IHtDb21wbGV0aW9uU3RhdGUsIFJlbGVhc2VUb29sfSBmcm9tICcuL2luZGV4JztcblxuLyoqIENvbW1hbmQgbGluZSBvcHRpb25zIGZvciBwdWJsaXNoaW5nIGEgcmVsZWFzZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVsZWFzZVB1Ymxpc2hPcHRpb25zIHtcbiAgZ2l0aHViVG9rZW46IHN0cmluZztcbn1cblxuLyoqIFlhcmdzIGNvbW1hbmQgYnVpbGRlciBmb3IgY29uZmlndXJpbmcgdGhlIGBuZy1kZXYgcmVsZWFzZSBwdWJsaXNoYCBjb21tYW5kLiAqL1xuZnVuY3Rpb24gYnVpbGRlcihhcmd2OiBBcmd2KTogQXJndjxSZWxlYXNlUHVibGlzaE9wdGlvbnM+IHtcbiAgcmV0dXJuIGFkZEdpdGh1YlRva2VuT3B0aW9uKGFyZ3YpO1xufVxuXG4vKiogWWFyZ3MgY29tbWFuZCBoYW5kbGVyIGZvciBzdGFnaW5nIGEgcmVsZWFzZS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoKSB7XG4gIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gIGFzc2VydFZhbGlkUmVsZWFzZUNvbmZpZyhjb25maWcpO1xuICBhc3NlcnRWYWxpZEdpdGh1YkNvbmZpZyhjb25maWcpO1xuICBjb25zdCB0YXNrID0gbmV3IFJlbGVhc2VUb29sKGNvbmZpZy5yZWxlYXNlLCBjb25maWcuZ2l0aHViLCBnaXQuYmFzZURpcik7XG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRhc2sucnVuKCk7XG5cbiAgc3dpdGNoIChyZXN1bHQpIHtcbiAgICBjYXNlIENvbXBsZXRpb25TdGF0ZS5GQVRBTF9FUlJPUjpcbiAgICAgIGVycm9yKHJlZChgUmVsZWFzZSBhY3Rpb24gaGFzIGJlZW4gYWJvcnRlZCBkdWUgdG8gZmF0YWwgZXJyb3JzLiBTZWUgYWJvdmUuYCkpO1xuICAgICAgcHJvY2Vzcy5leGl0Q29kZSA9IDI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIENvbXBsZXRpb25TdGF0ZS5NQU5VQUxMWV9BQk9SVEVEOlxuICAgICAgaW5mbyh5ZWxsb3coYFJlbGVhc2UgYWN0aW9uIGhhcyBiZWVuIG1hbnVhbGx5IGFib3J0ZWQuYCkpO1xuICAgICAgcHJvY2Vzcy5leGl0Q29kZSA9IDE7XG4gICAgICBicmVhaztcbiAgICBjYXNlIENvbXBsZXRpb25TdGF0ZS5TVUNDRVNTOlxuICAgICAgaW5mbyhncmVlbihgUmVsZWFzZSBhY3Rpb24gaGFzIGNvbXBsZXRlZCBzdWNjZXNzZnVsbHkuYCkpO1xuICAgICAgYnJlYWs7XG4gIH1cbn1cblxuLyoqIENMSSBjb21tYW5kIG1vZHVsZSBmb3IgcHVibGlzaGluZyBhIHJlbGVhc2UuICovXG5leHBvcnQgY29uc3QgUmVsZWFzZVB1Ymxpc2hDb21tYW5kTW9kdWxlOiBDb21tYW5kTW9kdWxlPHt9LCBSZWxlYXNlUHVibGlzaE9wdGlvbnM+ID0ge1xuICBidWlsZGVyLFxuICBoYW5kbGVyLFxuICBjb21tYW5kOiAncHVibGlzaCcsXG4gIGRlc2NyaWJlOiAnUHVibGlzaCBuZXcgcmVsZWFzZXMgYW5kIGNvbmZpZ3VyZSB2ZXJzaW9uIGJyYW5jaGVzLicsXG59O1xuIl19