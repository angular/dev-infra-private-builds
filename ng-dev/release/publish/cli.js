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
    const projectDir = git.baseDir;
    const task = new index_2.ReleaseTool(releaseConfig, config.github, projectDir);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2UvcHVibGlzaC9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBSUgsK0NBQTZDO0FBQzdDLGlEQUFvRTtBQUNwRSwyREFBcUQ7QUFDckQsK0RBQWtFO0FBQ2xFLDJDQUFpRDtBQUVqRCxtQ0FBcUQ7QUFPckQsa0ZBQWtGO0FBQ2xGLFNBQVMsT0FBTyxDQUFDLElBQVU7SUFDekIsT0FBTyxtQ0FBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBRUQsbURBQW1EO0FBQ25ELEtBQUssVUFBVSxPQUFPO0lBQ3BCLE1BQU0sR0FBRyxHQUFHLHNCQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDNUIsTUFBTSxNQUFNLEdBQUcsa0JBQVMsRUFBRSxDQUFDO0lBQzNCLE1BQU0sYUFBYSxHQUFHLHdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9DLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUM7SUFDL0IsTUFBTSxJQUFJLEdBQUcsSUFBSSxtQkFBVyxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3ZFLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBRWhDLFFBQVEsTUFBTSxFQUFFO1FBQ2QsS0FBSyx1QkFBZSxDQUFDLFdBQVc7WUFDOUIsZUFBSyxDQUFDLGFBQUcsQ0FBQyxpRUFBaUUsQ0FBQyxDQUFDLENBQUM7WUFDOUUsT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDckIsTUFBTTtRQUNSLEtBQUssdUJBQWUsQ0FBQyxnQkFBZ0I7WUFDbkMsY0FBSSxDQUFDLGdCQUFNLENBQUMsMkNBQTJDLENBQUMsQ0FBQyxDQUFDO1lBQzFELE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ3JCLE1BQU07UUFDUixLQUFLLHVCQUFlLENBQUMsT0FBTztZQUMxQixjQUFJLENBQUMsZUFBSyxDQUFDLDRDQUE0QyxDQUFDLENBQUMsQ0FBQztZQUMxRCxNQUFNO0tBQ1Q7QUFDSCxDQUFDO0FBRUQsbURBQW1EO0FBQ3RDLFFBQUEsMkJBQTJCLEdBQTZDO0lBQ25GLE9BQU87SUFDUCxPQUFPO0lBQ1AsT0FBTyxFQUFFLFNBQVM7SUFDbEIsUUFBUSxFQUFFLHNEQUFzRDtDQUNqRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXJndW1lbnRzLCBBcmd2LCBDb21tYW5kTW9kdWxlfSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7Z2V0Q29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtlcnJvciwgZ3JlZW4sIGluZm8sIHJlZCwgeWVsbG93fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5pbXBvcnQge2FkZEdpdGh1YlRva2VuT3B0aW9ufSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViLXlhcmdzJztcbmltcG9ydCB7Z2V0UmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcblxuaW1wb3J0IHtDb21wbGV0aW9uU3RhdGUsIFJlbGVhc2VUb29sfSBmcm9tICcuL2luZGV4JztcblxuLyoqIENvbW1hbmQgbGluZSBvcHRpb25zIGZvciBwdWJsaXNoaW5nIGEgcmVsZWFzZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVsZWFzZVB1Ymxpc2hPcHRpb25zIHtcbiAgZ2l0aHViVG9rZW46IHN0cmluZztcbn1cblxuLyoqIFlhcmdzIGNvbW1hbmQgYnVpbGRlciBmb3IgY29uZmlndXJpbmcgdGhlIGBuZy1kZXYgcmVsZWFzZSBwdWJsaXNoYCBjb21tYW5kLiAqL1xuZnVuY3Rpb24gYnVpbGRlcihhcmd2OiBBcmd2KTogQXJndjxSZWxlYXNlUHVibGlzaE9wdGlvbnM+IHtcbiAgcmV0dXJuIGFkZEdpdGh1YlRva2VuT3B0aW9uKGFyZ3YpO1xufVxuXG4vKiogWWFyZ3MgY29tbWFuZCBoYW5kbGVyIGZvciBzdGFnaW5nIGEgcmVsZWFzZS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoKSB7XG4gIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gIGNvbnN0IHJlbGVhc2VDb25maWcgPSBnZXRSZWxlYXNlQ29uZmlnKGNvbmZpZyk7XG4gIGNvbnN0IHByb2plY3REaXIgPSBnaXQuYmFzZURpcjtcbiAgY29uc3QgdGFzayA9IG5ldyBSZWxlYXNlVG9vbChyZWxlYXNlQ29uZmlnLCBjb25maWcuZ2l0aHViLCBwcm9qZWN0RGlyKTtcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGFzay5ydW4oKTtcblxuICBzd2l0Y2ggKHJlc3VsdCkge1xuICAgIGNhc2UgQ29tcGxldGlvblN0YXRlLkZBVEFMX0VSUk9SOlxuICAgICAgZXJyb3IocmVkKGBSZWxlYXNlIGFjdGlvbiBoYXMgYmVlbiBhYm9ydGVkIGR1ZSB0byBmYXRhbCBlcnJvcnMuIFNlZSBhYm92ZS5gKSk7XG4gICAgICBwcm9jZXNzLmV4aXRDb2RlID0gMjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgQ29tcGxldGlvblN0YXRlLk1BTlVBTExZX0FCT1JURUQ6XG4gICAgICBpbmZvKHllbGxvdyhgUmVsZWFzZSBhY3Rpb24gaGFzIGJlZW4gbWFudWFsbHkgYWJvcnRlZC5gKSk7XG4gICAgICBwcm9jZXNzLmV4aXRDb2RlID0gMTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgQ29tcGxldGlvblN0YXRlLlNVQ0NFU1M6XG4gICAgICBpbmZvKGdyZWVuKGBSZWxlYXNlIGFjdGlvbiBoYXMgY29tcGxldGVkIHN1Y2Nlc3NmdWxseS5gKSk7XG4gICAgICBicmVhaztcbiAgfVxufVxuXG4vKiogQ0xJIGNvbW1hbmQgbW9kdWxlIGZvciBwdWJsaXNoaW5nIGEgcmVsZWFzZS4gKi9cbmV4cG9ydCBjb25zdCBSZWxlYXNlUHVibGlzaENvbW1hbmRNb2R1bGU6IENvbW1hbmRNb2R1bGU8e30sIFJlbGVhc2VQdWJsaXNoT3B0aW9ucz4gPSB7XG4gIGJ1aWxkZXIsXG4gIGhhbmRsZXIsXG4gIGNvbW1hbmQ6ICdwdWJsaXNoJyxcbiAgZGVzY3JpYmU6ICdQdWJsaXNoIG5ldyByZWxlYXNlcyBhbmQgY29uZmlndXJlIHZlcnNpb24gYnJhbmNoZXMuJyxcbn07XG4iXX0=