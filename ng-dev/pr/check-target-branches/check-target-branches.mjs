"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.printTargetBranchesForPr = void 0;
const config_1 = require("../../utils/config");
const console_1 = require("../../utils/console");
const git_client_1 = require("../../utils/git/git-client");
const config_2 = require("../merge/config");
const target_label_1 = require("../merge/target-label");
async function getTargetBranchesForPr(prNumber, config) {
    /** Repo owner and name for the github repository. */
    const { owner, name: repo } = config.github;
    /** The singleton instance of the GitClient. */
    const git = git_client_1.GitClient.get();
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
        targetLabel = await target_label_1.getTargetLabelFromPullRequest(config.merge, labels);
    }
    catch (e) {
        if (e instanceof target_label_1.InvalidTargetLabelError) {
            console_1.error(console_1.red(e.failureMessage));
            process.exit(1);
        }
        throw e;
    }
    /** The target branches based on the target label and branch targetted in the Github UI. */
    return await target_label_1.getBranchesFromTargetLabel(targetLabel, githubTargetBranch);
}
async function printTargetBranchesForPr(prNumber) {
    const config = config_1.getConfig();
    config_1.assertValidGithubConfig(config);
    config_2.assertValidMergeConfig(config);
    if (config.merge.noTargetLabeling) {
        console_1.info(`PR #${prNumber} will merge into: ${config.github.mainBranchName}`);
        return;
    }
    const targets = await getTargetBranchesForPr(prNumber, config);
    console_1.info.group(`PR #${prNumber} will merge into:`);
    targets.forEach((target) => console_1.info(`- ${target}`));
    console_1.info.groupEnd();
}
exports.printTargetBranchesForPr = printTargetBranchesForPr;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stdGFyZ2V0LWJyYW5jaGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL2NoZWNrLXRhcmdldC1icmFuY2hlcy9jaGVjay10YXJnZXQtYnJhbmNoZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsK0NBQW9GO0FBQ3BGLGlEQUFxRDtBQUNyRCwyREFBcUQ7QUFDckQsNENBQWlGO0FBQ2pGLHdEQUkrQjtBQUUvQixLQUFLLFVBQVUsc0JBQXNCLENBQ25DLFFBQWdCLEVBQ2hCLE1BQWtEO0lBRWxELHFEQUFxRDtJQUNyRCxNQUFNLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQzFDLCtDQUErQztJQUMvQyxNQUFNLEdBQUcsR0FBRyxzQkFBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBRTVCLHlEQUF5RDtJQUN6RCxNQUFNLE1BQU0sR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUN2RiwrQ0FBK0M7SUFDL0MsNkZBQTZGO0lBQzdGLFFBQVE7SUFDUixrREFBa0Q7SUFDbEQsc0VBQXNFO0lBQ3RFLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSyxDQUFDLENBQUM7SUFDakQsOENBQThDO0lBQzlDLE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7SUFDM0Msa0VBQWtFO0lBQ2xFLElBQUksV0FBd0IsQ0FBQztJQUU3QixJQUFJO1FBQ0YsV0FBVyxHQUFHLE1BQU0sNENBQTZCLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztLQUN6RTtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsSUFBSSxDQUFDLFlBQVksc0NBQXVCLEVBQUU7WUFDeEMsZUFBSyxDQUFDLGFBQUcsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUM3QixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO1FBQ0QsTUFBTSxDQUFDLENBQUM7S0FDVDtJQUNELDJGQUEyRjtJQUMzRixPQUFPLE1BQU0seUNBQTBCLENBQUMsV0FBVyxFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFDM0UsQ0FBQztBQUVNLEtBQUssVUFBVSx3QkFBd0IsQ0FBQyxRQUFnQjtJQUM3RCxNQUFNLE1BQU0sR0FBRyxrQkFBUyxFQUFFLENBQUM7SUFDM0IsZ0NBQXVCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDaEMsK0JBQXNCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFL0IsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFO1FBQ2pDLGNBQUksQ0FBQyxPQUFPLFFBQVEscUJBQXFCLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztRQUN6RSxPQUFPO0tBQ1I7SUFFRCxNQUFNLE9BQU8sR0FBRyxNQUFNLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMvRCxjQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sUUFBUSxtQkFBbUIsQ0FBQyxDQUFDO0lBQy9DLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLGNBQUksQ0FBQyxLQUFLLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNqRCxjQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDbEIsQ0FBQztBQWRELDREQWNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7YXNzZXJ0VmFsaWRHaXRodWJDb25maWcsIGdldENvbmZpZywgR2l0aHViQ29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtlcnJvciwgaW5mbywgcmVkfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5pbXBvcnQge2Fzc2VydFZhbGlkTWVyZ2VDb25maWcsIE1lcmdlQ29uZmlnLCBUYXJnZXRMYWJlbH0gZnJvbSAnLi4vbWVyZ2UvY29uZmlnJztcbmltcG9ydCB7XG4gIGdldEJyYW5jaGVzRnJvbVRhcmdldExhYmVsLFxuICBnZXRUYXJnZXRMYWJlbEZyb21QdWxsUmVxdWVzdCxcbiAgSW52YWxpZFRhcmdldExhYmVsRXJyb3IsXG59IGZyb20gJy4uL21lcmdlL3RhcmdldC1sYWJlbCc7XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFRhcmdldEJyYW5jaGVzRm9yUHIoXG4gIHByTnVtYmVyOiBudW1iZXIsXG4gIGNvbmZpZzoge2dpdGh1YjogR2l0aHViQ29uZmlnOyBtZXJnZTogTWVyZ2VDb25maWd9LFxuKSB7XG4gIC8qKiBSZXBvIG93bmVyIGFuZCBuYW1lIGZvciB0aGUgZ2l0aHViIHJlcG9zaXRvcnkuICovXG4gIGNvbnN0IHtvd25lciwgbmFtZTogcmVwb30gPSBjb25maWcuZ2l0aHViO1xuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgR2l0Q2xpZW50LiAqL1xuICBjb25zdCBnaXQgPSBHaXRDbGllbnQuZ2V0KCk7XG5cbiAgLyoqIFRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBwdWxsIHJlcXVlc3QgZnJvbSBHaXRodWIuICovXG4gIGNvbnN0IHByRGF0YSA9IChhd2FpdCBnaXQuZ2l0aHViLnB1bGxzLmdldCh7b3duZXIsIHJlcG8sIHB1bGxfbnVtYmVyOiBwck51bWJlcn0pKS5kYXRhO1xuICAvKiogVGhlIGxpc3Qgb2YgbGFiZWxzIG9uIHRoZSBQUiBhcyBzdHJpbmdzLiAqL1xuICAvLyBOb3RlOiBUaGUgYG5hbWVgIHByb3BlcnR5IG9mIGxhYmVscyBpcyBhbHdheXMgc2V0IGJ1dCB0aGUgR2l0aHViIE9wZW5BUEkgc3BlYyBpcyBpbmNvcnJlY3RcbiAgLy8gaGVyZS5cbiAgLy8gVE9ETyhkZXZ2ZXJzaW9uKTogUmVtb3ZlIHRoZSBub24tbnVsbCBjYXN0IG9uY2VcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2dpdGh1Yi9yZXN0LWFwaS1kZXNjcmlwdGlvbi9pc3N1ZXMvMTY5IGlzIGZpeGVkLlxuICBjb25zdCBsYWJlbHMgPSBwckRhdGEubGFiZWxzLm1hcCgobCkgPT4gbC5uYW1lISk7XG4gIC8qKiBUaGUgYnJhbmNoIHRhcmdldHRlZCB2aWEgdGhlIEdpdGh1YiBVSS4gKi9cbiAgY29uc3QgZ2l0aHViVGFyZ2V0QnJhbmNoID0gcHJEYXRhLmJhc2UucmVmO1xuICAvKiogVGhlIGFjdGl2ZSBsYWJlbCB3aGljaCBpcyBiZWluZyB1c2VkIGZvciB0YXJnZXR0aW5nIHRoZSBQUi4gKi9cbiAgbGV0IHRhcmdldExhYmVsOiBUYXJnZXRMYWJlbDtcblxuICB0cnkge1xuICAgIHRhcmdldExhYmVsID0gYXdhaXQgZ2V0VGFyZ2V0TGFiZWxGcm9tUHVsbFJlcXVlc3QoY29uZmlnLm1lcmdlLCBsYWJlbHMpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGUgaW5zdGFuY2VvZiBJbnZhbGlkVGFyZ2V0TGFiZWxFcnJvcikge1xuICAgICAgZXJyb3IocmVkKGUuZmFpbHVyZU1lc3NhZ2UpKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG4gICAgdGhyb3cgZTtcbiAgfVxuICAvKiogVGhlIHRhcmdldCBicmFuY2hlcyBiYXNlZCBvbiB0aGUgdGFyZ2V0IGxhYmVsIGFuZCBicmFuY2ggdGFyZ2V0dGVkIGluIHRoZSBHaXRodWIgVUkuICovXG4gIHJldHVybiBhd2FpdCBnZXRCcmFuY2hlc0Zyb21UYXJnZXRMYWJlbCh0YXJnZXRMYWJlbCwgZ2l0aHViVGFyZ2V0QnJhbmNoKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByaW50VGFyZ2V0QnJhbmNoZXNGb3JQcihwck51bWJlcjogbnVtYmVyKSB7XG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICBhc3NlcnRWYWxpZEdpdGh1YkNvbmZpZyhjb25maWcpO1xuICBhc3NlcnRWYWxpZE1lcmdlQ29uZmlnKGNvbmZpZyk7XG5cbiAgaWYgKGNvbmZpZy5tZXJnZS5ub1RhcmdldExhYmVsaW5nKSB7XG4gICAgaW5mbyhgUFIgIyR7cHJOdW1iZXJ9IHdpbGwgbWVyZ2UgaW50bzogJHtjb25maWcuZ2l0aHViLm1haW5CcmFuY2hOYW1lfWApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHRhcmdldHMgPSBhd2FpdCBnZXRUYXJnZXRCcmFuY2hlc0ZvclByKHByTnVtYmVyLCBjb25maWcpO1xuICBpbmZvLmdyb3VwKGBQUiAjJHtwck51bWJlcn0gd2lsbCBtZXJnZSBpbnRvOmApO1xuICB0YXJnZXRzLmZvckVhY2goKHRhcmdldCkgPT4gaW5mbyhgLSAke3RhcmdldH1gKSk7XG4gIGluZm8uZ3JvdXBFbmQoKTtcbn1cbiJdfQ==