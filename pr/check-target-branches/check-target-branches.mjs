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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stdGFyZ2V0LWJyYW5jaGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL2NoZWNrLXRhcmdldC1icmFuY2hlcy9jaGVjay10YXJnZXQtYnJhbmNoZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUM3QyxPQUFPLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDckQsT0FBTyxFQUFDLHFCQUFxQixFQUFjLE1BQU0saUJBQWlCLENBQUM7QUFDbkUsT0FBTyxFQUFDLDBCQUEwQixFQUFFLDZCQUE2QixFQUFFLHVCQUF1QixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFekgsTUFBTSxVQUFnQixzQkFBc0IsQ0FBQyxRQUFnQjs7UUFDM0QsZ0NBQWdDO1FBQ2hDLE1BQU0sTUFBTSxHQUFHLFNBQVMsRUFBRSxDQUFDO1FBQzNCLHFEQUFxRDtRQUNyRCxNQUFNLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQzFDLCtDQUErQztRQUMvQyxNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUIsa0NBQWtDO1FBQ2xDLE1BQU0sRUFBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBQyxHQUFHLE1BQU0scUJBQXFCLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0RixJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7WUFDeEIsTUFBTSxLQUFLLENBQUMsZ0NBQWdDLE1BQU0sRUFBRSxDQUFDLENBQUM7U0FDdkQ7UUFDRCx5REFBeUQ7UUFDekQsTUFBTSxNQUFNLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDdkYsK0NBQStDO1FBQy9DLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlDLDhDQUE4QztRQUM5QyxNQUFNLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQzNDLGtFQUFrRTtRQUNsRSxJQUFJLFdBQXdCLENBQUM7UUFFN0IsSUFBSTtZQUNGLFdBQVcsR0FBRyw2QkFBNkIsQ0FBQyxXQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDbkU7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLElBQUksQ0FBQyxZQUFZLHVCQUF1QixFQUFFO2dCQUN4QyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO2dCQUM3QixPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztnQkFDckIsT0FBTzthQUNSO1lBQ0QsTUFBTSxDQUFDLENBQUM7U0FDVDtRQUNELDJGQUEyRjtRQUMzRixPQUFPLE1BQU0sMEJBQTBCLENBQUMsV0FBVyxFQUFFLGtCQUFrQixDQUFDLENBQUM7SUFDM0UsQ0FBQztDQUFBO0FBR0QsTUFBTSxVQUFnQix3QkFBd0IsQ0FBQyxRQUFnQjs7UUFDN0QsTUFBTSxPQUFPLEdBQUcsTUFBTSxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN2RCxJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUU7WUFDekIsT0FBTztTQUNSO1FBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLFFBQVEsbUJBQW1CLENBQUMsQ0FBQztRQUMvQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQy9DLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNsQixDQUFDO0NBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtnZXRDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2Vycm9yLCBpbmZvLCByZWR9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXQtY2xpZW50JztcbmltcG9ydCB7bG9hZEFuZFZhbGlkYXRlQ29uZmlnLCBUYXJnZXRMYWJlbH0gZnJvbSAnLi4vbWVyZ2UvY29uZmlnJztcbmltcG9ydCB7Z2V0QnJhbmNoZXNGcm9tVGFyZ2V0TGFiZWwsIGdldFRhcmdldExhYmVsRnJvbVB1bGxSZXF1ZXN0LCBJbnZhbGlkVGFyZ2V0TGFiZWxFcnJvcn0gZnJvbSAnLi4vbWVyZ2UvdGFyZ2V0LWxhYmVsJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFRhcmdldEJyYW5jaGVzRm9yUHIocHJOdW1iZXI6IG51bWJlcikge1xuICAvKiogVGhlIG5nLWRldiBjb25maWd1cmF0aW9uLiAqL1xuICBjb25zdCBjb25maWcgPSBnZXRDb25maWcoKTtcbiAgLyoqIFJlcG8gb3duZXIgYW5kIG5hbWUgZm9yIHRoZSBnaXRodWIgcmVwb3NpdG9yeS4gKi9cbiAgY29uc3Qge293bmVyLCBuYW1lOiByZXBvfSA9IGNvbmZpZy5naXRodWI7XG4gIC8qKiBUaGUgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSBHaXRDbGllbnQuICovXG4gIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgLyoqIFRoZSB2YWxpZGF0ZWQgbWVyZ2UgY29uZmlnLiAqL1xuICBjb25zdCB7Y29uZmlnOiBtZXJnZUNvbmZpZywgZXJyb3JzfSA9IGF3YWl0IGxvYWRBbmRWYWxpZGF0ZUNvbmZpZyhjb25maWcsIGdpdC5naXRodWIpO1xuICBpZiAoZXJyb3JzICE9PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBFcnJvcihgSW52YWxpZCBjb25maWd1cmF0aW9uIGZvdW5kOiAke2Vycm9yc31gKTtcbiAgfVxuICAvKiogVGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIHB1bGwgcmVxdWVzdCBmcm9tIEdpdGh1Yi4gKi9cbiAgY29uc3QgcHJEYXRhID0gKGF3YWl0IGdpdC5naXRodWIucHVsbHMuZ2V0KHtvd25lciwgcmVwbywgcHVsbF9udW1iZXI6IHByTnVtYmVyfSkpLmRhdGE7XG4gIC8qKiBUaGUgbGlzdCBvZiBsYWJlbHMgb24gdGhlIFBSIGFzIHN0cmluZ3MuICovXG4gIGNvbnN0IGxhYmVscyA9IHByRGF0YS5sYWJlbHMubWFwKGwgPT4gbC5uYW1lKTtcbiAgLyoqIFRoZSBicmFuY2ggdGFyZ2V0dGVkIHZpYSB0aGUgR2l0aHViIFVJLiAqL1xuICBjb25zdCBnaXRodWJUYXJnZXRCcmFuY2ggPSBwckRhdGEuYmFzZS5yZWY7XG4gIC8qKiBUaGUgYWN0aXZlIGxhYmVsIHdoaWNoIGlzIGJlaW5nIHVzZWQgZm9yIHRhcmdldHRpbmcgdGhlIFBSLiAqL1xuICBsZXQgdGFyZ2V0TGFiZWw6IFRhcmdldExhYmVsO1xuXG4gIHRyeSB7XG4gICAgdGFyZ2V0TGFiZWwgPSBnZXRUYXJnZXRMYWJlbEZyb21QdWxsUmVxdWVzdChtZXJnZUNvbmZpZyEsIGxhYmVscyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoZSBpbnN0YW5jZW9mIEludmFsaWRUYXJnZXRMYWJlbEVycm9yKSB7XG4gICAgICBlcnJvcihyZWQoZS5mYWlsdXJlTWVzc2FnZSkpO1xuICAgICAgcHJvY2Vzcy5leGl0Q29kZSA9IDE7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH1cbiAgLyoqIFRoZSB0YXJnZXQgYnJhbmNoZXMgYmFzZWQgb24gdGhlIHRhcmdldCBsYWJlbCBhbmQgYnJhbmNoIHRhcmdldHRlZCBpbiB0aGUgR2l0aHViIFVJLiAqL1xuICByZXR1cm4gYXdhaXQgZ2V0QnJhbmNoZXNGcm9tVGFyZ2V0TGFiZWwodGFyZ2V0TGFiZWwsIGdpdGh1YlRhcmdldEJyYW5jaCk7XG59XG5cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByaW50VGFyZ2V0QnJhbmNoZXNGb3JQcihwck51bWJlcjogbnVtYmVyKSB7XG4gIGNvbnN0IHRhcmdldHMgPSBhd2FpdCBnZXRUYXJnZXRCcmFuY2hlc0ZvclByKHByTnVtYmVyKTtcbiAgaWYgKHRhcmdldHMgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybjtcbiAgfVxuICBpbmZvLmdyb3VwKGBQUiAjJHtwck51bWJlcn0gd2lsbCBtZXJnZSBpbnRvOmApO1xuICB0YXJnZXRzLmZvckVhY2godGFyZ2V0ID0+IGluZm8oYC0gJHt0YXJnZXR9YCkpO1xuICBpbmZvLmdyb3VwRW5kKCk7XG59XG4iXX0=