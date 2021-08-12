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
    return github_yargs_1.addGithubTokenOption(argv);
}
/** Yargs command handler for staging a release. */
async function handler() {
    const git = git_client_1.GitClient.get();
    const config = config_1.getConfig();
    const releaseConfig = index_1.getReleaseConfig(config);
    const task = new index_2.ReleaseTool(releaseConfig, config.github, git.baseDir);
    const result = await task.run();
    switch (result) {
        case index_2.CompletionState.FATAL_ERROR:
            console_1.error(console_1.red(`Release action has been aborted due to fatal errors. See above.`));
            process.exitCode = 2;
            break;
        case index_2.CompletionState.MANUALLY_ABORTED:
            console_1.info(console_1.yellow(`Release action has been manually aborted.`));
            process.exitCode = 1;
            break;
        case index_2.CompletionState.SUCCESS:
            console_1.info(console_1.green(`Release action has completed successfully.`));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2UvcHVibGlzaC9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBSUgsK0NBQTZDO0FBQzdDLGlEQUFvRTtBQUNwRSwyREFBcUQ7QUFDckQsK0RBQWtFO0FBQ2xFLDJDQUFpRDtBQUVqRCxtQ0FBcUQ7QUFPckQsa0ZBQWtGO0FBQ2xGLFNBQVMsT0FBTyxDQUFDLElBQVU7SUFDekIsT0FBTyxtQ0FBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBRUQsbURBQW1EO0FBQ25ELEtBQUssVUFBVSxPQUFPO0lBQ3BCLE1BQU0sR0FBRyxHQUFHLHNCQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDNUIsTUFBTSxNQUFNLEdBQUcsa0JBQVMsRUFBRSxDQUFDO0lBQzNCLE1BQU0sYUFBYSxHQUFHLHdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9DLE1BQU0sSUFBSSxHQUFHLElBQUksbUJBQVcsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDeEUsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFFaEMsUUFBUSxNQUFNLEVBQUU7UUFDZCxLQUFLLHVCQUFlLENBQUMsV0FBVztZQUM5QixlQUFLLENBQUMsYUFBRyxDQUFDLGlFQUFpRSxDQUFDLENBQUMsQ0FBQztZQUM5RSxPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztZQUNyQixNQUFNO1FBQ1IsS0FBSyx1QkFBZSxDQUFDLGdCQUFnQjtZQUNuQyxjQUFJLENBQUMsZ0JBQU0sQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDLENBQUM7WUFDMUQsT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDckIsTUFBTTtRQUNSLEtBQUssdUJBQWUsQ0FBQyxPQUFPO1lBQzFCLGNBQUksQ0FBQyxlQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQyxDQUFDO1lBQzFELE1BQU07S0FDVDtBQUNILENBQUM7QUFFRCxtREFBbUQ7QUFDdEMsUUFBQSwyQkFBMkIsR0FBNkM7SUFDbkYsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPLEVBQUUsU0FBUztJQUNsQixRQUFRLEVBQUUsc0RBQXNEO0NBQ2pFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcmd2LCBDb21tYW5kTW9kdWxlfSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7Z2V0Q29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtlcnJvciwgZ3JlZW4sIGluZm8sIHJlZCwgeWVsbG93fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5pbXBvcnQge2FkZEdpdGh1YlRva2VuT3B0aW9ufSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViLXlhcmdzJztcbmltcG9ydCB7Z2V0UmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcblxuaW1wb3J0IHtDb21wbGV0aW9uU3RhdGUsIFJlbGVhc2VUb29sfSBmcm9tICcuL2luZGV4JztcblxuLyoqIENvbW1hbmQgbGluZSBvcHRpb25zIGZvciBwdWJsaXNoaW5nIGEgcmVsZWFzZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVsZWFzZVB1Ymxpc2hPcHRpb25zIHtcbiAgZ2l0aHViVG9rZW46IHN0cmluZztcbn1cblxuLyoqIFlhcmdzIGNvbW1hbmQgYnVpbGRlciBmb3IgY29uZmlndXJpbmcgdGhlIGBuZy1kZXYgcmVsZWFzZSBwdWJsaXNoYCBjb21tYW5kLiAqL1xuZnVuY3Rpb24gYnVpbGRlcihhcmd2OiBBcmd2KTogQXJndjxSZWxlYXNlUHVibGlzaE9wdGlvbnM+IHtcbiAgcmV0dXJuIGFkZEdpdGh1YlRva2VuT3B0aW9uKGFyZ3YpO1xufVxuXG4vKiogWWFyZ3MgY29tbWFuZCBoYW5kbGVyIGZvciBzdGFnaW5nIGEgcmVsZWFzZS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoKSB7XG4gIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gIGNvbnN0IHJlbGVhc2VDb25maWcgPSBnZXRSZWxlYXNlQ29uZmlnKGNvbmZpZyk7XG4gIGNvbnN0IHRhc2sgPSBuZXcgUmVsZWFzZVRvb2wocmVsZWFzZUNvbmZpZywgY29uZmlnLmdpdGh1YiwgZ2l0LmJhc2VEaXIpO1xuICBjb25zdCByZXN1bHQgPSBhd2FpdCB0YXNrLnJ1bigpO1xuXG4gIHN3aXRjaCAocmVzdWx0KSB7XG4gICAgY2FzZSBDb21wbGV0aW9uU3RhdGUuRkFUQUxfRVJST1I6XG4gICAgICBlcnJvcihyZWQoYFJlbGVhc2UgYWN0aW9uIGhhcyBiZWVuIGFib3J0ZWQgZHVlIHRvIGZhdGFsIGVycm9ycy4gU2VlIGFib3ZlLmApKTtcbiAgICAgIHByb2Nlc3MuZXhpdENvZGUgPSAyO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBDb21wbGV0aW9uU3RhdGUuTUFOVUFMTFlfQUJPUlRFRDpcbiAgICAgIGluZm8oeWVsbG93KGBSZWxlYXNlIGFjdGlvbiBoYXMgYmVlbiBtYW51YWxseSBhYm9ydGVkLmApKTtcbiAgICAgIHByb2Nlc3MuZXhpdENvZGUgPSAxO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBDb21wbGV0aW9uU3RhdGUuU1VDQ0VTUzpcbiAgICAgIGluZm8oZ3JlZW4oYFJlbGVhc2UgYWN0aW9uIGhhcyBjb21wbGV0ZWQgc3VjY2Vzc2Z1bGx5LmApKTtcbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbi8qKiBDTEkgY29tbWFuZCBtb2R1bGUgZm9yIHB1Ymxpc2hpbmcgYSByZWxlYXNlLiAqL1xuZXhwb3J0IGNvbnN0IFJlbGVhc2VQdWJsaXNoQ29tbWFuZE1vZHVsZTogQ29tbWFuZE1vZHVsZTx7fSwgUmVsZWFzZVB1Ymxpc2hPcHRpb25zPiA9IHtcbiAgYnVpbGRlcixcbiAgaGFuZGxlcixcbiAgY29tbWFuZDogJ3B1Ymxpc2gnLFxuICBkZXNjcmliZTogJ1B1Ymxpc2ggbmV3IHJlbGVhc2VzIGFuZCBjb25maWd1cmUgdmVyc2lvbiBicmFuY2hlcy4nLFxufTtcbiJdfQ==