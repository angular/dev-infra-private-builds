"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.printTargetBranchesForPr = exports.getTargetBranchesForPr = void 0;
const config_1 = require("../../utils/config");
const console_1 = require("../../utils/console");
const git_client_1 = require("../../utils/git/git-client");
const config_2 = require("../merge/config");
const target_label_1 = require("../merge/target-label");
async function getTargetBranchesForPr(prNumber) {
    /** The ng-dev configuration. */
    const config = config_1.getConfig();
    config_1.assertValidGithubConfig(config);
    /** Repo owner and name for the github repository. */
    const { owner, name: repo } = config.github;
    /** The singleton instance of the GitClient. */
    const git = git_client_1.GitClient.get();
    /** The validated merge config. */
    const { config: mergeConfig, errors } = await config_2.loadAndValidateConfig(config, git.github);
    if (errors !== undefined) {
        throw Error(`Invalid configuration found: ${errors}`);
    }
    /** The current state of the pull request from Github. */
    const prData = (await git.github.pulls.get({ owner, repo, pull_number: prNumber })).data;
    /** The list of labels on the PR as strings. */
    // Note: The `name` property of labels is always set but the Github OpenAPI spec is incorrect
    // here.
    // TODO(devversion): Remove the non-null cast once
    // https://github.com/github/rest-api-description/issues/169 is fixed.
    const labels = prData.labels.map((l) => l.name);
    /** The branch targetted via the Github UI. */
    const githubTargetBranch = prData.base.ref;
    /** The active label which is being used for targetting the PR. */
    let targetLabel;
    try {
        targetLabel = target_label_1.getTargetLabelFromPullRequest(mergeConfig, labels);
    }
    catch (e) {
        if (e instanceof target_label_1.InvalidTargetLabelError) {
            console_1.error(console_1.red(e.failureMessage));
            process.exitCode = 1;
            return;
        }
        throw e;
    }
    /** The target branches based on the target label and branch targetted in the Github UI. */
    return await target_label_1.getBranchesFromTargetLabel(targetLabel, githubTargetBranch);
}
exports.getTargetBranchesForPr = getTargetBranchesForPr;
async function printTargetBranchesForPr(prNumber) {
    const targets = await getTargetBranchesForPr(prNumber);
    if (targets === undefined) {
        return;
    }
    console_1.info.group(`PR #${prNumber} will merge into:`);
    targets.forEach((target) => console_1.info(`- ${target}`));
    console_1.info.groupEnd();
}
exports.printTargetBranchesForPr = printTargetBranchesForPr;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stdGFyZ2V0LWJyYW5jaGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL2NoZWNrLXRhcmdldC1icmFuY2hlcy9jaGVjay10YXJnZXQtYnJhbmNoZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsK0NBQXNFO0FBQ3RFLGlEQUFxRDtBQUNyRCwyREFBcUQ7QUFDckQsNENBQW1FO0FBQ25FLHdEQUkrQjtBQUV4QixLQUFLLFVBQVUsc0JBQXNCLENBQUMsUUFBZ0I7SUFDM0QsZ0NBQWdDO0lBQ2hDLE1BQU0sTUFBTSxHQUFHLGtCQUFTLEVBQUUsQ0FBQztJQUMzQixnQ0FBdUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNoQyxxREFBcUQ7SUFDckQsTUFBTSxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUMxQywrQ0FBK0M7SUFDL0MsTUFBTSxHQUFHLEdBQUcsc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUM1QixrQ0FBa0M7SUFDbEMsTUFBTSxFQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFDLEdBQUcsTUFBTSw4QkFBcUIsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3RGLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtRQUN4QixNQUFNLEtBQUssQ0FBQyxnQ0FBZ0MsTUFBTSxFQUFFLENBQUMsQ0FBQztLQUN2RDtJQUNELHlEQUF5RDtJQUN6RCxNQUFNLE1BQU0sR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUN2RiwrQ0FBK0M7SUFDL0MsNkZBQTZGO0lBQzdGLFFBQVE7SUFDUixrREFBa0Q7SUFDbEQsc0VBQXNFO0lBQ3RFLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSyxDQUFDLENBQUM7SUFDakQsOENBQThDO0lBQzlDLE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7SUFDM0Msa0VBQWtFO0lBQ2xFLElBQUksV0FBd0IsQ0FBQztJQUU3QixJQUFJO1FBQ0YsV0FBVyxHQUFHLDRDQUE2QixDQUFDLFdBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztLQUNuRTtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsSUFBSSxDQUFDLFlBQVksc0NBQXVCLEVBQUU7WUFDeEMsZUFBSyxDQUFDLGFBQUcsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUM3QixPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztZQUNyQixPQUFPO1NBQ1I7UUFDRCxNQUFNLENBQUMsQ0FBQztLQUNUO0lBQ0QsMkZBQTJGO0lBQzNGLE9BQU8sTUFBTSx5Q0FBMEIsQ0FBQyxXQUFXLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztBQUMzRSxDQUFDO0FBdENELHdEQXNDQztBQUVNLEtBQUssVUFBVSx3QkFBd0IsQ0FBQyxRQUFnQjtJQUM3RCxNQUFNLE9BQU8sR0FBRyxNQUFNLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZELElBQUksT0FBTyxLQUFLLFNBQVMsRUFBRTtRQUN6QixPQUFPO0tBQ1I7SUFDRCxjQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sUUFBUSxtQkFBbUIsQ0FBQyxDQUFDO0lBQy9DLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLGNBQUksQ0FBQyxLQUFLLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNqRCxjQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDbEIsQ0FBQztBQVJELDREQVFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7YXNzZXJ0VmFsaWRHaXRodWJDb25maWcsIGdldENvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZXJyb3IsIGluZm8sIHJlZH0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdC1jbGllbnQnO1xuaW1wb3J0IHtsb2FkQW5kVmFsaWRhdGVDb25maWcsIFRhcmdldExhYmVsfSBmcm9tICcuLi9tZXJnZS9jb25maWcnO1xuaW1wb3J0IHtcbiAgZ2V0QnJhbmNoZXNGcm9tVGFyZ2V0TGFiZWwsXG4gIGdldFRhcmdldExhYmVsRnJvbVB1bGxSZXF1ZXN0LFxuICBJbnZhbGlkVGFyZ2V0TGFiZWxFcnJvcixcbn0gZnJvbSAnLi4vbWVyZ2UvdGFyZ2V0LWxhYmVsJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFRhcmdldEJyYW5jaGVzRm9yUHIocHJOdW1iZXI6IG51bWJlcikge1xuICAvKiogVGhlIG5nLWRldiBjb25maWd1cmF0aW9uLiAqL1xuICBjb25zdCBjb25maWcgPSBnZXRDb25maWcoKTtcbiAgYXNzZXJ0VmFsaWRHaXRodWJDb25maWcoY29uZmlnKTtcbiAgLyoqIFJlcG8gb3duZXIgYW5kIG5hbWUgZm9yIHRoZSBnaXRodWIgcmVwb3NpdG9yeS4gKi9cbiAgY29uc3Qge293bmVyLCBuYW1lOiByZXBvfSA9IGNvbmZpZy5naXRodWI7XG4gIC8qKiBUaGUgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSBHaXRDbGllbnQuICovXG4gIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgLyoqIFRoZSB2YWxpZGF0ZWQgbWVyZ2UgY29uZmlnLiAqL1xuICBjb25zdCB7Y29uZmlnOiBtZXJnZUNvbmZpZywgZXJyb3JzfSA9IGF3YWl0IGxvYWRBbmRWYWxpZGF0ZUNvbmZpZyhjb25maWcsIGdpdC5naXRodWIpO1xuICBpZiAoZXJyb3JzICE9PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBFcnJvcihgSW52YWxpZCBjb25maWd1cmF0aW9uIGZvdW5kOiAke2Vycm9yc31gKTtcbiAgfVxuICAvKiogVGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIHB1bGwgcmVxdWVzdCBmcm9tIEdpdGh1Yi4gKi9cbiAgY29uc3QgcHJEYXRhID0gKGF3YWl0IGdpdC5naXRodWIucHVsbHMuZ2V0KHtvd25lciwgcmVwbywgcHVsbF9udW1iZXI6IHByTnVtYmVyfSkpLmRhdGE7XG4gIC8qKiBUaGUgbGlzdCBvZiBsYWJlbHMgb24gdGhlIFBSIGFzIHN0cmluZ3MuICovXG4gIC8vIE5vdGU6IFRoZSBgbmFtZWAgcHJvcGVydHkgb2YgbGFiZWxzIGlzIGFsd2F5cyBzZXQgYnV0IHRoZSBHaXRodWIgT3BlbkFQSSBzcGVjIGlzIGluY29ycmVjdFxuICAvLyBoZXJlLlxuICAvLyBUT0RPKGRldnZlcnNpb24pOiBSZW1vdmUgdGhlIG5vbi1udWxsIGNhc3Qgb25jZVxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vZ2l0aHViL3Jlc3QtYXBpLWRlc2NyaXB0aW9uL2lzc3Vlcy8xNjkgaXMgZml4ZWQuXG4gIGNvbnN0IGxhYmVscyA9IHByRGF0YS5sYWJlbHMubWFwKChsKSA9PiBsLm5hbWUhKTtcbiAgLyoqIFRoZSBicmFuY2ggdGFyZ2V0dGVkIHZpYSB0aGUgR2l0aHViIFVJLiAqL1xuICBjb25zdCBnaXRodWJUYXJnZXRCcmFuY2ggPSBwckRhdGEuYmFzZS5yZWY7XG4gIC8qKiBUaGUgYWN0aXZlIGxhYmVsIHdoaWNoIGlzIGJlaW5nIHVzZWQgZm9yIHRhcmdldHRpbmcgdGhlIFBSLiAqL1xuICBsZXQgdGFyZ2V0TGFiZWw6IFRhcmdldExhYmVsO1xuXG4gIHRyeSB7XG4gICAgdGFyZ2V0TGFiZWwgPSBnZXRUYXJnZXRMYWJlbEZyb21QdWxsUmVxdWVzdChtZXJnZUNvbmZpZyEsIGxhYmVscyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoZSBpbnN0YW5jZW9mIEludmFsaWRUYXJnZXRMYWJlbEVycm9yKSB7XG4gICAgICBlcnJvcihyZWQoZS5mYWlsdXJlTWVzc2FnZSkpO1xuICAgICAgcHJvY2Vzcy5leGl0Q29kZSA9IDE7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH1cbiAgLyoqIFRoZSB0YXJnZXQgYnJhbmNoZXMgYmFzZWQgb24gdGhlIHRhcmdldCBsYWJlbCBhbmQgYnJhbmNoIHRhcmdldHRlZCBpbiB0aGUgR2l0aHViIFVJLiAqL1xuICByZXR1cm4gYXdhaXQgZ2V0QnJhbmNoZXNGcm9tVGFyZ2V0TGFiZWwodGFyZ2V0TGFiZWwsIGdpdGh1YlRhcmdldEJyYW5jaCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcmludFRhcmdldEJyYW5jaGVzRm9yUHIocHJOdW1iZXI6IG51bWJlcikge1xuICBjb25zdCB0YXJnZXRzID0gYXdhaXQgZ2V0VGFyZ2V0QnJhbmNoZXNGb3JQcihwck51bWJlcik7XG4gIGlmICh0YXJnZXRzID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaW5mby5ncm91cChgUFIgIyR7cHJOdW1iZXJ9IHdpbGwgbWVyZ2UgaW50bzpgKTtcbiAgdGFyZ2V0cy5mb3JFYWNoKCh0YXJnZXQpID0+IGluZm8oYC0gJHt0YXJnZXR9YCkpO1xuICBpbmZvLmdyb3VwRW5kKCk7XG59XG4iXX0=