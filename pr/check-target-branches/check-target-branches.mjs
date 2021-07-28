/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { getConfig } from '../../utils/config';
import { error, info, red } from '../../utils/console';
import { GitClient } from '../../utils/git/git-client';
import { loadAndValidateConfig } from '../merge/config';
import { getBranchesFromTargetLabel, getTargetLabelFromPullRequest, InvalidTargetLabelError } from '../merge/target-label';
export function getTargetBranchesForPr(prNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        /** The ng-dev configuration. */
        const config = getConfig();
        /** Repo owner and name for the github repository. */
        const { owner, name: repo } = config.github;
        /** The singleton instance of the GitClient. */
        const git = GitClient.get();
        /** The validated merge config. */
        const { config: mergeConfig, errors } = yield loadAndValidateConfig(config, git.github);
        if (errors !== undefined) {
            throw Error(`Invalid configuration found: ${errors}`);
        }
        /** The current state of the pull request from Github. */
        const prData = (yield git.github.pulls.get({ owner, repo, pull_number: prNumber })).data;
        /** The list of labels on the PR as strings. */
        // Note: The `name` property of labels is always set but the Github OpenAPI spec is incorrect
        // here.
        // TODO(devversion): Remove the non-null cast once
        // https://github.com/github/rest-api-description/issues/169 is fixed.
        const labels = prData.labels.map(l => l.name);
        /** The branch targetted via the Github UI. */
        const githubTargetBranch = prData.base.ref;
        /** The active label which is being used for targetting the PR. */
        let targetLabel;
        try {
            targetLabel = getTargetLabelFromPullRequest(mergeConfig, labels);
        }
        catch (e) {
            if (e instanceof InvalidTargetLabelError) {
                error(red(e.failureMessage));
                process.exitCode = 1;
                return;
            }
            throw e;
        }
        /** The target branches based on the target label and branch targetted in the Github UI. */
        return yield getBranchesFromTargetLabel(targetLabel, githubTargetBranch);
    });
}
export function printTargetBranchesForPr(prNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        const targets = yield getTargetBranchesForPr(prNumber);
        if (targets === undefined) {
            return;
        }
        info.group(`PR #${prNumber} will merge into:`);
        targets.forEach(target => info(`- ${target}`));
        info.groupEnd();
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stdGFyZ2V0LWJyYW5jaGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL2NoZWNrLXRhcmdldC1icmFuY2hlcy9jaGVjay10YXJnZXQtYnJhbmNoZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUM3QyxPQUFPLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDckQsT0FBTyxFQUFDLHFCQUFxQixFQUFjLE1BQU0saUJBQWlCLENBQUM7QUFDbkUsT0FBTyxFQUFDLDBCQUEwQixFQUFFLDZCQUE2QixFQUFFLHVCQUF1QixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFekgsTUFBTSxVQUFnQixzQkFBc0IsQ0FBQyxRQUFnQjs7UUFDM0QsZ0NBQWdDO1FBQ2hDLE1BQU0sTUFBTSxHQUFHLFNBQVMsRUFBRSxDQUFDO1FBQzNCLHFEQUFxRDtRQUNyRCxNQUFNLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQzFDLCtDQUErQztRQUMvQyxNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUIsa0NBQWtDO1FBQ2xDLE1BQU0sRUFBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBQyxHQUFHLE1BQU0scUJBQXFCLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0RixJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7WUFDeEIsTUFBTSxLQUFLLENBQUMsZ0NBQWdDLE1BQU0sRUFBRSxDQUFDLENBQUM7U0FDdkQ7UUFDRCx5REFBeUQ7UUFDekQsTUFBTSxNQUFNLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDdkYsK0NBQStDO1FBQy9DLDZGQUE2RjtRQUM3RixRQUFRO1FBQ1Isa0RBQWtEO1FBQ2xELHNFQUFzRTtRQUN0RSxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFLLENBQUMsQ0FBQztRQUMvQyw4Q0FBOEM7UUFDOUMsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUMzQyxrRUFBa0U7UUFDbEUsSUFBSSxXQUF3QixDQUFDO1FBRTdCLElBQUk7WUFDRixXQUFXLEdBQUcsNkJBQTZCLENBQUMsV0FBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ25FO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixJQUFJLENBQUMsWUFBWSx1QkFBdUIsRUFBRTtnQkFDeEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztnQkFDN0IsT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7Z0JBQ3JCLE9BQU87YUFDUjtZQUNELE1BQU0sQ0FBQyxDQUFDO1NBQ1Q7UUFDRCwyRkFBMkY7UUFDM0YsT0FBTyxNQUFNLDBCQUEwQixDQUFDLFdBQVcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0lBQzNFLENBQUM7Q0FBQTtBQUdELE1BQU0sVUFBZ0Isd0JBQXdCLENBQUMsUUFBZ0I7O1FBQzdELE1BQU0sT0FBTyxHQUFHLE1BQU0sc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkQsSUFBSSxPQUFPLEtBQUssU0FBUyxFQUFFO1lBQ3pCLE9BQU87U0FDUjtRQUNELElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxRQUFRLG1CQUFtQixDQUFDLENBQUM7UUFDL0MsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbEIsQ0FBQztDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Z2V0Q29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtlcnJvciwgaW5mbywgcmVkfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5pbXBvcnQge2xvYWRBbmRWYWxpZGF0ZUNvbmZpZywgVGFyZ2V0TGFiZWx9IGZyb20gJy4uL21lcmdlL2NvbmZpZyc7XG5pbXBvcnQge2dldEJyYW5jaGVzRnJvbVRhcmdldExhYmVsLCBnZXRUYXJnZXRMYWJlbEZyb21QdWxsUmVxdWVzdCwgSW52YWxpZFRhcmdldExhYmVsRXJyb3J9IGZyb20gJy4uL21lcmdlL3RhcmdldC1sYWJlbCc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUYXJnZXRCcmFuY2hlc0ZvclByKHByTnVtYmVyOiBudW1iZXIpIHtcbiAgLyoqIFRoZSBuZy1kZXYgY29uZmlndXJhdGlvbi4gKi9cbiAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gIC8qKiBSZXBvIG93bmVyIGFuZCBuYW1lIGZvciB0aGUgZ2l0aHViIHJlcG9zaXRvcnkuICovXG4gIGNvbnN0IHtvd25lciwgbmFtZTogcmVwb30gPSBjb25maWcuZ2l0aHViO1xuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgR2l0Q2xpZW50LiAqL1xuICBjb25zdCBnaXQgPSBHaXRDbGllbnQuZ2V0KCk7XG4gIC8qKiBUaGUgdmFsaWRhdGVkIG1lcmdlIGNvbmZpZy4gKi9cbiAgY29uc3Qge2NvbmZpZzogbWVyZ2VDb25maWcsIGVycm9yc30gPSBhd2FpdCBsb2FkQW5kVmFsaWRhdGVDb25maWcoY29uZmlnLCBnaXQuZ2l0aHViKTtcbiAgaWYgKGVycm9ycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgRXJyb3IoYEludmFsaWQgY29uZmlndXJhdGlvbiBmb3VuZDogJHtlcnJvcnN9YCk7XG4gIH1cbiAgLyoqIFRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBwdWxsIHJlcXVlc3QgZnJvbSBHaXRodWIuICovXG4gIGNvbnN0IHByRGF0YSA9IChhd2FpdCBnaXQuZ2l0aHViLnB1bGxzLmdldCh7b3duZXIsIHJlcG8sIHB1bGxfbnVtYmVyOiBwck51bWJlcn0pKS5kYXRhO1xuICAvKiogVGhlIGxpc3Qgb2YgbGFiZWxzIG9uIHRoZSBQUiBhcyBzdHJpbmdzLiAqL1xuICAvLyBOb3RlOiBUaGUgYG5hbWVgIHByb3BlcnR5IG9mIGxhYmVscyBpcyBhbHdheXMgc2V0IGJ1dCB0aGUgR2l0aHViIE9wZW5BUEkgc3BlYyBpcyBpbmNvcnJlY3RcbiAgLy8gaGVyZS5cbiAgLy8gVE9ETyhkZXZ2ZXJzaW9uKTogUmVtb3ZlIHRoZSBub24tbnVsbCBjYXN0IG9uY2VcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2dpdGh1Yi9yZXN0LWFwaS1kZXNjcmlwdGlvbi9pc3N1ZXMvMTY5IGlzIGZpeGVkLlxuICBjb25zdCBsYWJlbHMgPSBwckRhdGEubGFiZWxzLm1hcChsID0+IGwubmFtZSEpO1xuICAvKiogVGhlIGJyYW5jaCB0YXJnZXR0ZWQgdmlhIHRoZSBHaXRodWIgVUkuICovXG4gIGNvbnN0IGdpdGh1YlRhcmdldEJyYW5jaCA9IHByRGF0YS5iYXNlLnJlZjtcbiAgLyoqIFRoZSBhY3RpdmUgbGFiZWwgd2hpY2ggaXMgYmVpbmcgdXNlZCBmb3IgdGFyZ2V0dGluZyB0aGUgUFIuICovXG4gIGxldCB0YXJnZXRMYWJlbDogVGFyZ2V0TGFiZWw7XG5cbiAgdHJ5IHtcbiAgICB0YXJnZXRMYWJlbCA9IGdldFRhcmdldExhYmVsRnJvbVB1bGxSZXF1ZXN0KG1lcmdlQ29uZmlnISwgbGFiZWxzKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChlIGluc3RhbmNlb2YgSW52YWxpZFRhcmdldExhYmVsRXJyb3IpIHtcbiAgICAgIGVycm9yKHJlZChlLmZhaWx1cmVNZXNzYWdlKSk7XG4gICAgICBwcm9jZXNzLmV4aXRDb2RlID0gMTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhyb3cgZTtcbiAgfVxuICAvKiogVGhlIHRhcmdldCBicmFuY2hlcyBiYXNlZCBvbiB0aGUgdGFyZ2V0IGxhYmVsIGFuZCBicmFuY2ggdGFyZ2V0dGVkIGluIHRoZSBHaXRodWIgVUkuICovXG4gIHJldHVybiBhd2FpdCBnZXRCcmFuY2hlc0Zyb21UYXJnZXRMYWJlbCh0YXJnZXRMYWJlbCwgZ2l0aHViVGFyZ2V0QnJhbmNoKTtcbn1cblxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJpbnRUYXJnZXRCcmFuY2hlc0ZvclByKHByTnVtYmVyOiBudW1iZXIpIHtcbiAgY29uc3QgdGFyZ2V0cyA9IGF3YWl0IGdldFRhcmdldEJyYW5jaGVzRm9yUHIocHJOdW1iZXIpO1xuICBpZiAodGFyZ2V0cyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGluZm8uZ3JvdXAoYFBSICMke3ByTnVtYmVyfSB3aWxsIG1lcmdlIGludG86YCk7XG4gIHRhcmdldHMuZm9yRWFjaCh0YXJnZXQgPT4gaW5mbyhgLSAke3RhcmdldH1gKSk7XG4gIGluZm8uZ3JvdXBFbmQoKTtcbn1cbiJdfQ==