/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { getConfig } from '../../utils/config';
import { error, green, info, red, yellow } from '../../utils/console';
import { GitClient } from '../../utils/git/git-client';
import { addGithubTokenOption } from '../../utils/git/github-yargs';
import { getReleaseConfig } from '../config/index';
import { CompletionState, ReleaseTool } from './index';
/** Yargs command builder for configuring the `ng-dev release publish` command. */
function builder(argv) {
    return addGithubTokenOption(argv);
}
/** Yargs command handler for staging a release. */
function handler() {
    return __awaiter(this, void 0, void 0, function* () {
        const git = GitClient.get();
        const config = getConfig();
        const releaseConfig = getReleaseConfig(config);
        const projectDir = git.baseDir;
        const task = new ReleaseTool(releaseConfig, config.github, projectDir);
        const result = yield task.run();
        switch (result) {
            case CompletionState.FATAL_ERROR:
                error(red(`Release action has been aborted due to fatal errors. See above.`));
                process.exitCode = 2;
                break;
            case CompletionState.MANUALLY_ABORTED:
                info(yellow(`Release action has been manually aborted.`));
                process.exitCode = 1;
                break;
            case CompletionState.SUCCESS:
                info(green(`Release action has completed successfully.`));
                break;
        }
    });
}
/** CLI command module for publishing a release. */
export const ReleasePublishCommandModule = {
    builder,
    handler,
    command: 'publish',
    describe: 'Publish new releases and configure version branches.',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvcHVibGlzaC9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUlILE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUM3QyxPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3BFLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUNsRSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUVqRCxPQUFPLEVBQUMsZUFBZSxFQUFFLFdBQVcsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQU9yRCxrRkFBa0Y7QUFDbEYsU0FBUyxPQUFPLENBQUMsSUFBVTtJQUN6QixPQUFPLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BDLENBQUM7QUFFRCxtREFBbUQ7QUFDbkQsU0FBZSxPQUFPOztRQUNwQixNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUIsTUFBTSxNQUFNLEdBQUcsU0FBUyxFQUFFLENBQUM7UUFDM0IsTUFBTSxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0MsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQztRQUMvQixNQUFNLElBQUksR0FBRyxJQUFJLFdBQVcsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN2RSxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUVoQyxRQUFRLE1BQU0sRUFBRTtZQUNkLEtBQUssZUFBZSxDQUFDLFdBQVc7Z0JBQzlCLEtBQUssQ0FBQyxHQUFHLENBQUMsaUVBQWlFLENBQUMsQ0FBQyxDQUFDO2dCQUM5RSxPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztnQkFDckIsTUFBTTtZQUNSLEtBQUssZUFBZSxDQUFDLGdCQUFnQjtnQkFDbkMsSUFBSSxDQUFDLE1BQU0sQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFELE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO2dCQUNyQixNQUFNO1lBQ1IsS0FBSyxlQUFlLENBQUMsT0FBTztnQkFDMUIsSUFBSSxDQUFDLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFELE1BQU07U0FDVDtJQUNILENBQUM7Q0FBQTtBQUVELG1EQUFtRDtBQUNuRCxNQUFNLENBQUMsTUFBTSwyQkFBMkIsR0FBNkM7SUFDbkYsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPLEVBQUUsU0FBUztJQUNsQixRQUFRLEVBQUUsc0RBQXNEO0NBQ2pFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3YsIENvbW1hbmRNb2R1bGV9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtnZXRDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2Vycm9yLCBncmVlbiwgaW5mbywgcmVkLCB5ZWxsb3d9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXQtY2xpZW50JztcbmltcG9ydCB7YWRkR2l0aHViVG9rZW5PcHRpb259IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWIteWFyZ3MnO1xuaW1wb3J0IHtnZXRSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuXG5pbXBvcnQge0NvbXBsZXRpb25TdGF0ZSwgUmVsZWFzZVRvb2x9IGZyb20gJy4vaW5kZXgnO1xuXG4vKiogQ29tbWFuZCBsaW5lIG9wdGlvbnMgZm9yIHB1Ymxpc2hpbmcgYSByZWxlYXNlLiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWxlYXNlUHVibGlzaE9wdGlvbnMge1xuICBnaXRodWJUb2tlbjogc3RyaW5nO1xufVxuXG4vKiogWWFyZ3MgY29tbWFuZCBidWlsZGVyIGZvciBjb25maWd1cmluZyB0aGUgYG5nLWRldiByZWxlYXNlIHB1Ymxpc2hgIGNvbW1hbmQuICovXG5mdW5jdGlvbiBidWlsZGVyKGFyZ3Y6IEFyZ3YpOiBBcmd2PFJlbGVhc2VQdWJsaXNoT3B0aW9ucz4ge1xuICByZXR1cm4gYWRkR2l0aHViVG9rZW5PcHRpb24oYXJndik7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGhhbmRsZXIgZm9yIHN0YWdpbmcgYSByZWxlYXNlLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcigpIHtcbiAgY29uc3QgZ2l0ID0gR2l0Q2xpZW50LmdldCgpO1xuICBjb25zdCBjb25maWcgPSBnZXRDb25maWcoKTtcbiAgY29uc3QgcmVsZWFzZUNvbmZpZyA9IGdldFJlbGVhc2VDb25maWcoY29uZmlnKTtcbiAgY29uc3QgcHJvamVjdERpciA9IGdpdC5iYXNlRGlyO1xuICBjb25zdCB0YXNrID0gbmV3IFJlbGVhc2VUb29sKHJlbGVhc2VDb25maWcsIGNvbmZpZy5naXRodWIsIHByb2plY3REaXIpO1xuICBjb25zdCByZXN1bHQgPSBhd2FpdCB0YXNrLnJ1bigpO1xuXG4gIHN3aXRjaCAocmVzdWx0KSB7XG4gICAgY2FzZSBDb21wbGV0aW9uU3RhdGUuRkFUQUxfRVJST1I6XG4gICAgICBlcnJvcihyZWQoYFJlbGVhc2UgYWN0aW9uIGhhcyBiZWVuIGFib3J0ZWQgZHVlIHRvIGZhdGFsIGVycm9ycy4gU2VlIGFib3ZlLmApKTtcbiAgICAgIHByb2Nlc3MuZXhpdENvZGUgPSAyO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBDb21wbGV0aW9uU3RhdGUuTUFOVUFMTFlfQUJPUlRFRDpcbiAgICAgIGluZm8oeWVsbG93KGBSZWxlYXNlIGFjdGlvbiBoYXMgYmVlbiBtYW51YWxseSBhYm9ydGVkLmApKTtcbiAgICAgIHByb2Nlc3MuZXhpdENvZGUgPSAxO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBDb21wbGV0aW9uU3RhdGUuU1VDQ0VTUzpcbiAgICAgIGluZm8oZ3JlZW4oYFJlbGVhc2UgYWN0aW9uIGhhcyBjb21wbGV0ZWQgc3VjY2Vzc2Z1bGx5LmApKTtcbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbi8qKiBDTEkgY29tbWFuZCBtb2R1bGUgZm9yIHB1Ymxpc2hpbmcgYSByZWxlYXNlLiAqL1xuZXhwb3J0IGNvbnN0IFJlbGVhc2VQdWJsaXNoQ29tbWFuZE1vZHVsZTogQ29tbWFuZE1vZHVsZTx7fSwgUmVsZWFzZVB1Ymxpc2hPcHRpb25zPiA9IHtcbiAgYnVpbGRlcixcbiAgaGFuZGxlcixcbiAgY29tbWFuZDogJ3B1Ymxpc2gnLFxuICBkZXNjcmliZTogJ1B1Ymxpc2ggbmV3IHJlbGVhc2VzIGFuZCBjb25maWd1cmUgdmVyc2lvbiBicmFuY2hlcy4nLFxufTtcbiJdfQ==