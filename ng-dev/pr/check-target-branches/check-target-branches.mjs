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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stdGFyZ2V0LWJyYW5jaGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL2NoZWNrLXRhcmdldC1icmFuY2hlcy9jaGVjay10YXJnZXQtYnJhbmNoZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsK0NBQTZDO0FBQzdDLGlEQUFxRDtBQUNyRCwyREFBcUQ7QUFDckQsNENBQW1FO0FBQ25FLHdEQUkrQjtBQUV4QixLQUFLLFVBQVUsc0JBQXNCLENBQUMsUUFBZ0I7SUFDM0QsZ0NBQWdDO0lBQ2hDLE1BQU0sTUFBTSxHQUFHLGtCQUFTLEVBQUUsQ0FBQztJQUMzQixxREFBcUQ7SUFDckQsTUFBTSxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUMxQywrQ0FBK0M7SUFDL0MsTUFBTSxHQUFHLEdBQUcsc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUM1QixrQ0FBa0M7SUFDbEMsTUFBTSxFQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFDLEdBQUcsTUFBTSw4QkFBcUIsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3RGLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtRQUN4QixNQUFNLEtBQUssQ0FBQyxnQ0FBZ0MsTUFBTSxFQUFFLENBQUMsQ0FBQztLQUN2RDtJQUNELHlEQUF5RDtJQUN6RCxNQUFNLE1BQU0sR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUN2RiwrQ0FBK0M7SUFDL0MsNkZBQTZGO0lBQzdGLFFBQVE7SUFDUixrREFBa0Q7SUFDbEQsc0VBQXNFO0lBQ3RFLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSyxDQUFDLENBQUM7SUFDakQsOENBQThDO0lBQzlDLE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7SUFDM0Msa0VBQWtFO0lBQ2xFLElBQUksV0FBd0IsQ0FBQztJQUU3QixJQUFJO1FBQ0YsV0FBVyxHQUFHLDRDQUE2QixDQUFDLFdBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztLQUNuRTtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsSUFBSSxDQUFDLFlBQVksc0NBQXVCLEVBQUU7WUFDeEMsZUFBSyxDQUFDLGFBQUcsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUM3QixPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztZQUNyQixPQUFPO1NBQ1I7UUFDRCxNQUFNLENBQUMsQ0FBQztLQUNUO0lBQ0QsMkZBQTJGO0lBQzNGLE9BQU8sTUFBTSx5Q0FBMEIsQ0FBQyxXQUFXLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztBQUMzRSxDQUFDO0FBckNELHdEQXFDQztBQUVNLEtBQUssVUFBVSx3QkFBd0IsQ0FBQyxRQUFnQjtJQUM3RCxNQUFNLE9BQU8sR0FBRyxNQUFNLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZELElBQUksT0FBTyxLQUFLLFNBQVMsRUFBRTtRQUN6QixPQUFPO0tBQ1I7SUFDRCxjQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sUUFBUSxtQkFBbUIsQ0FBQyxDQUFDO0lBQy9DLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLGNBQUksQ0FBQyxLQUFLLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNqRCxjQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDbEIsQ0FBQztBQVJELDREQVFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Z2V0Q29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtlcnJvciwgaW5mbywgcmVkfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5pbXBvcnQge2xvYWRBbmRWYWxpZGF0ZUNvbmZpZywgVGFyZ2V0TGFiZWx9IGZyb20gJy4uL21lcmdlL2NvbmZpZyc7XG5pbXBvcnQge1xuICBnZXRCcmFuY2hlc0Zyb21UYXJnZXRMYWJlbCxcbiAgZ2V0VGFyZ2V0TGFiZWxGcm9tUHVsbFJlcXVlc3QsXG4gIEludmFsaWRUYXJnZXRMYWJlbEVycm9yLFxufSBmcm9tICcuLi9tZXJnZS90YXJnZXQtbGFiZWwnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VGFyZ2V0QnJhbmNoZXNGb3JQcihwck51bWJlcjogbnVtYmVyKSB7XG4gIC8qKiBUaGUgbmctZGV2IGNvbmZpZ3VyYXRpb24uICovXG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICAvKiogUmVwbyBvd25lciBhbmQgbmFtZSBmb3IgdGhlIGdpdGh1YiByZXBvc2l0b3J5LiAqL1xuICBjb25zdCB7b3duZXIsIG5hbWU6IHJlcG99ID0gY29uZmlnLmdpdGh1YjtcbiAgLyoqIFRoZSBzaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIEdpdENsaWVudC4gKi9cbiAgY29uc3QgZ2l0ID0gR2l0Q2xpZW50LmdldCgpO1xuICAvKiogVGhlIHZhbGlkYXRlZCBtZXJnZSBjb25maWcuICovXG4gIGNvbnN0IHtjb25maWc6IG1lcmdlQ29uZmlnLCBlcnJvcnN9ID0gYXdhaXQgbG9hZEFuZFZhbGlkYXRlQ29uZmlnKGNvbmZpZywgZ2l0LmdpdGh1Yik7XG4gIGlmIChlcnJvcnMgIT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IEVycm9yKGBJbnZhbGlkIGNvbmZpZ3VyYXRpb24gZm91bmQ6ICR7ZXJyb3JzfWApO1xuICB9XG4gIC8qKiBUaGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgcHVsbCByZXF1ZXN0IGZyb20gR2l0aHViLiAqL1xuICBjb25zdCBwckRhdGEgPSAoYXdhaXQgZ2l0LmdpdGh1Yi5wdWxscy5nZXQoe293bmVyLCByZXBvLCBwdWxsX251bWJlcjogcHJOdW1iZXJ9KSkuZGF0YTtcbiAgLyoqIFRoZSBsaXN0IG9mIGxhYmVscyBvbiB0aGUgUFIgYXMgc3RyaW5ncy4gKi9cbiAgLy8gTm90ZTogVGhlIGBuYW1lYCBwcm9wZXJ0eSBvZiBsYWJlbHMgaXMgYWx3YXlzIHNldCBidXQgdGhlIEdpdGh1YiBPcGVuQVBJIHNwZWMgaXMgaW5jb3JyZWN0XG4gIC8vIGhlcmUuXG4gIC8vIFRPRE8oZGV2dmVyc2lvbik6IFJlbW92ZSB0aGUgbm9uLW51bGwgY2FzdCBvbmNlXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9naXRodWIvcmVzdC1hcGktZGVzY3JpcHRpb24vaXNzdWVzLzE2OSBpcyBmaXhlZC5cbiAgY29uc3QgbGFiZWxzID0gcHJEYXRhLmxhYmVscy5tYXAoKGwpID0+IGwubmFtZSEpO1xuICAvKiogVGhlIGJyYW5jaCB0YXJnZXR0ZWQgdmlhIHRoZSBHaXRodWIgVUkuICovXG4gIGNvbnN0IGdpdGh1YlRhcmdldEJyYW5jaCA9IHByRGF0YS5iYXNlLnJlZjtcbiAgLyoqIFRoZSBhY3RpdmUgbGFiZWwgd2hpY2ggaXMgYmVpbmcgdXNlZCBmb3IgdGFyZ2V0dGluZyB0aGUgUFIuICovXG4gIGxldCB0YXJnZXRMYWJlbDogVGFyZ2V0TGFiZWw7XG5cbiAgdHJ5IHtcbiAgICB0YXJnZXRMYWJlbCA9IGdldFRhcmdldExhYmVsRnJvbVB1bGxSZXF1ZXN0KG1lcmdlQ29uZmlnISwgbGFiZWxzKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChlIGluc3RhbmNlb2YgSW52YWxpZFRhcmdldExhYmVsRXJyb3IpIHtcbiAgICAgIGVycm9yKHJlZChlLmZhaWx1cmVNZXNzYWdlKSk7XG4gICAgICBwcm9jZXNzLmV4aXRDb2RlID0gMTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhyb3cgZTtcbiAgfVxuICAvKiogVGhlIHRhcmdldCBicmFuY2hlcyBiYXNlZCBvbiB0aGUgdGFyZ2V0IGxhYmVsIGFuZCBicmFuY2ggdGFyZ2V0dGVkIGluIHRoZSBHaXRodWIgVUkuICovXG4gIHJldHVybiBhd2FpdCBnZXRCcmFuY2hlc0Zyb21UYXJnZXRMYWJlbCh0YXJnZXRMYWJlbCwgZ2l0aHViVGFyZ2V0QnJhbmNoKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByaW50VGFyZ2V0QnJhbmNoZXNGb3JQcihwck51bWJlcjogbnVtYmVyKSB7XG4gIGNvbnN0IHRhcmdldHMgPSBhd2FpdCBnZXRUYXJnZXRCcmFuY2hlc0ZvclByKHByTnVtYmVyKTtcbiAgaWYgKHRhcmdldHMgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybjtcbiAgfVxuICBpbmZvLmdyb3VwKGBQUiAjJHtwck51bWJlcn0gd2lsbCBtZXJnZSBpbnRvOmApO1xuICB0YXJnZXRzLmZvckVhY2goKHRhcmdldCkgPT4gaW5mbyhgLSAke3RhcmdldH1gKSk7XG4gIGluZm8uZ3JvdXBFbmQoKTtcbn1cbiJdfQ==