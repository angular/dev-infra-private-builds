/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { prompt } from 'inquirer';
import { debug, green, info, red, yellow } from '../../utils/console';
import { AuthenticatedGitClient } from '../../utils/git/authenticated-git-client';
import { getCaretakerConfig } from '../config';
/** Update the Github caretaker group, using a prompt to obtain the new caretaker group members.  */
export function updateCaretakerTeamViaPrompt() {
    return __awaiter(this, void 0, void 0, function* () {
        /** Caretaker specific configuration. */
        const caretakerConfig = getCaretakerConfig().caretaker;
        if (caretakerConfig.caretakerGroup === undefined) {
            throw Error('`caretakerGroup` is not defined in the `caretaker` config');
        }
        /** The list of current members in the group. */
        const current = yield getGroupMembers(caretakerConfig.caretakerGroup);
        /** The list of members able to be added to the group as defined by a separate roster group. */
        const roster = yield getGroupMembers(`${caretakerConfig.caretakerGroup}-roster`);
        const { 
        /** The list of users selected to be members of the caretaker group. */
        selected, 
        /** Whether the user positively confirmed the selected made. */
        confirm } = yield prompt([
            {
                type: 'checkbox',
                choices: roster,
                message: 'Select 2 caretakers for the upcoming rotation:',
                default: current,
                name: 'selected',
                prefix: '',
                validate: (selected) => {
                    if (selected.length !== 2) {
                        return 'Please select exactly 2 caretakers for the upcoming rotation.';
                    }
                    return true;
                },
            },
            {
                type: 'confirm',
                default: true,
                prefix: '',
                message: 'Are you sure?',
                name: 'confirm',
            }
        ]);
        if (confirm === false) {
            info(yellow('  ⚠  Skipping caretaker group update.'));
            return;
        }
        if (JSON.stringify(selected) === JSON.stringify(current)) {
            info(green('  √  Caretaker group already up to date.'));
            return;
        }
        try {
            yield setCaretakerGroup(caretakerConfig.caretakerGroup, selected);
        }
        catch (_a) {
            info(red('  ✘  Failed to update caretaker group.'));
            return;
        }
        info(green('  √  Successfully updated caretaker group'));
    });
}
/** Retrieve the current list of members for the provided group. */
function getGroupMembers(group) {
    return __awaiter(this, void 0, void 0, function* () {
        /** The authenticated GitClient instance. */
        const git = AuthenticatedGitClient.get();
        return (yield git.github.teams.listMembersInOrg({
            org: git.remoteConfig.owner,
            team_slug: group,
        }))
            .data.filter(_ => !!_)
            .map(member => member.login);
    });
}
function setCaretakerGroup(group, members) {
    return __awaiter(this, void 0, void 0, function* () {
        /** The authenticated GitClient instance. */
        const git = AuthenticatedGitClient.get();
        /** The full name of the group <org>/<group name>. */
        const fullSlug = `${git.remoteConfig.owner}/${group}`;
        /** The list of current members of the group. */
        const current = yield getGroupMembers(group);
        /** The list of users to be removed from the group. */
        const removed = current.filter(login => !members.includes(login));
        /** Add a user to the group. */
        const add = (username) => __awaiter(this, void 0, void 0, function* () {
            debug(`Adding ${username} to ${fullSlug}.`);
            yield git.github.teams.addOrUpdateMembershipForUserInOrg({
                org: git.remoteConfig.owner,
                team_slug: group,
                username,
                role: 'maintainer',
            });
        });
        /** Remove a user from the group. */
        const remove = (username) => __awaiter(this, void 0, void 0, function* () {
            debug(`Removing ${username} from ${fullSlug}.`);
            yield git.github.teams.removeMembershipForUserInOrg({
                org: git.remoteConfig.owner,
                team_slug: group,
                username,
            });
        });
        debug.group(`Caretaker Group: ${fullSlug}`);
        debug(`Current Membership: ${current.join(', ')}`);
        debug(`New Membership:     ${members.join(', ')}`);
        debug(`Removed:            ${removed.join(', ')}`);
        debug.groupEnd();
        // Add members before removing to prevent the account performing the action from removing their
        // permissions to change the group membership early.
        yield Promise.all(members.map(add));
        yield Promise.all(removed.map(remove));
        debug(`Successfuly updated ${fullSlug}`);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLWdpdGh1Yi10ZWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NhcmV0YWtlci9oYW5kb2ZmL3VwZGF0ZS1naXRodWItdGVhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUVoQyxPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3BFLE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLDBDQUEwQyxDQUFDO0FBQ2hGLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUU3QyxvR0FBb0c7QUFDcEcsTUFBTSxVQUFnQiw0QkFBNEI7O1FBQ2hELHdDQUF3QztRQUN4QyxNQUFNLGVBQWUsR0FBRyxrQkFBa0IsRUFBRSxDQUFDLFNBQVMsQ0FBQztRQUV2RCxJQUFJLGVBQWUsQ0FBQyxjQUFjLEtBQUssU0FBUyxFQUFFO1lBQ2hELE1BQU0sS0FBSyxDQUFDLDJEQUEyRCxDQUFDLENBQUM7U0FDMUU7UUFFRCxnREFBZ0Q7UUFDaEQsTUFBTSxPQUFPLEdBQUcsTUFBTSxlQUFlLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3RFLCtGQUErRjtRQUMvRixNQUFNLE1BQU0sR0FBRyxNQUFNLGVBQWUsQ0FBQyxHQUFHLGVBQWUsQ0FBQyxjQUFjLFNBQVMsQ0FBQyxDQUFDO1FBQ2pGLE1BQU07UUFDSix1RUFBdUU7UUFDdkUsUUFBUTtRQUNSLCtEQUErRDtRQUMvRCxPQUFPLEVBQ1IsR0FDRyxNQUFNLE1BQU0sQ0FBQztZQUNYO2dCQUNFLElBQUksRUFBRSxVQUFVO2dCQUNoQixPQUFPLEVBQUUsTUFBTTtnQkFDZixPQUFPLEVBQUUsZ0RBQWdEO2dCQUN6RCxPQUFPLEVBQUUsT0FBTztnQkFDaEIsSUFBSSxFQUFFLFVBQVU7Z0JBQ2hCLE1BQU0sRUFBRSxFQUFFO2dCQUNWLFFBQVEsRUFBRSxDQUFDLFFBQWtCLEVBQUUsRUFBRTtvQkFDL0IsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTt3QkFDekIsT0FBTywrREFBK0QsQ0FBQztxQkFDeEU7b0JBQ0QsT0FBTyxJQUFJLENBQUM7Z0JBQ2QsQ0FBQzthQUNGO1lBQ0Q7Z0JBQ0UsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsTUFBTSxFQUFFLEVBQUU7Z0JBQ1YsT0FBTyxFQUFFLGVBQWU7Z0JBQ3hCLElBQUksRUFBRSxTQUFTO2FBQ2hCO1NBQ0YsQ0FBQyxDQUFDO1FBRVAsSUFBSSxPQUFPLEtBQUssS0FBSyxFQUFFO1lBQ3JCLElBQUksQ0FBQyxNQUFNLENBQUMsdUNBQXVDLENBQUMsQ0FBQyxDQUFDO1lBQ3RELE9BQU87U0FDUjtRQUVELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ3hELElBQUksQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDO1lBQ3hELE9BQU87U0FDUjtRQUVELElBQUk7WUFDRixNQUFNLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDbkU7UUFBQyxXQUFNO1lBQ04sSUFBSSxDQUFDLEdBQUcsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDLENBQUM7WUFDcEQsT0FBTztTQUNSO1FBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDLENBQUM7SUFDM0QsQ0FBQztDQUFBO0FBR0QsbUVBQW1FO0FBQ25FLFNBQWUsZUFBZSxDQUFDLEtBQWE7O1FBQzFDLDRDQUE0QztRQUM1QyxNQUFNLEdBQUcsR0FBRyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUV6QyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQztZQUN2QyxHQUFHLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxLQUFLO1lBQzNCLFNBQVMsRUFBRSxLQUFLO1NBQ2pCLENBQUMsQ0FBQzthQUNMLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3JCLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwQyxDQUFDO0NBQUE7QUFFRCxTQUFlLGlCQUFpQixDQUFDLEtBQWEsRUFBRSxPQUFpQjs7UUFDL0QsNENBQTRDO1FBQzVDLE1BQU0sR0FBRyxHQUFHLHNCQUFzQixDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3pDLHFEQUFxRDtRQUNyRCxNQUFNLFFBQVEsR0FBRyxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ3RELGdEQUFnRDtRQUNoRCxNQUFNLE9BQU8sR0FBRyxNQUFNLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3QyxzREFBc0Q7UUFDdEQsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2xFLCtCQUErQjtRQUMvQixNQUFNLEdBQUcsR0FBRyxDQUFPLFFBQWdCLEVBQUUsRUFBRTtZQUNyQyxLQUFLLENBQUMsVUFBVSxRQUFRLE9BQU8sUUFBUSxHQUFHLENBQUMsQ0FBQztZQUM1QyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGlDQUFpQyxDQUFDO2dCQUN2RCxHQUFHLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxLQUFLO2dCQUMzQixTQUFTLEVBQUUsS0FBSztnQkFDaEIsUUFBUTtnQkFDUixJQUFJLEVBQUUsWUFBWTthQUNuQixDQUFDLENBQUM7UUFDTCxDQUFDLENBQUEsQ0FBQztRQUNGLG9DQUFvQztRQUNwQyxNQUFNLE1BQU0sR0FBRyxDQUFPLFFBQWdCLEVBQUUsRUFBRTtZQUN4QyxLQUFLLENBQUMsWUFBWSxRQUFRLFNBQVMsUUFBUSxHQUFHLENBQUMsQ0FBQztZQUNoRCxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLDRCQUE0QixDQUFDO2dCQUNsRCxHQUFHLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxLQUFLO2dCQUMzQixTQUFTLEVBQUUsS0FBSztnQkFDaEIsUUFBUTthQUNULENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQSxDQUFDO1FBRUYsS0FBSyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUM1QyxLQUFLLENBQUMsdUJBQXVCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ25ELEtBQUssQ0FBQyx1QkFBdUIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbkQsS0FBSyxDQUFDLHVCQUF1QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNuRCxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFakIsK0ZBQStGO1FBQy9GLG9EQUFvRDtRQUNwRCxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFFdkMsS0FBSyxDQUFDLHVCQUF1QixRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQzNDLENBQUM7Q0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3Byb21wdH0gZnJvbSAnaW5xdWlyZXInO1xuXG5pbXBvcnQge2RlYnVnLCBncmVlbiwgaW5mbywgcmVkLCB5ZWxsb3d9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtBdXRoZW50aWNhdGVkR2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvYXV0aGVudGljYXRlZC1naXQtY2xpZW50JztcbmltcG9ydCB7Z2V0Q2FyZXRha2VyQ29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuXG4vKiogVXBkYXRlIHRoZSBHaXRodWIgY2FyZXRha2VyIGdyb3VwLCB1c2luZyBhIHByb21wdCB0byBvYnRhaW4gdGhlIG5ldyBjYXJldGFrZXIgZ3JvdXAgbWVtYmVycy4gICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlQ2FyZXRha2VyVGVhbVZpYVByb21wdCgpIHtcbiAgLyoqIENhcmV0YWtlciBzcGVjaWZpYyBjb25maWd1cmF0aW9uLiAqL1xuICBjb25zdCBjYXJldGFrZXJDb25maWcgPSBnZXRDYXJldGFrZXJDb25maWcoKS5jYXJldGFrZXI7XG5cbiAgaWYgKGNhcmV0YWtlckNvbmZpZy5jYXJldGFrZXJHcm91cCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgRXJyb3IoJ2BjYXJldGFrZXJHcm91cGAgaXMgbm90IGRlZmluZWQgaW4gdGhlIGBjYXJldGFrZXJgIGNvbmZpZycpO1xuICB9XG5cbiAgLyoqIFRoZSBsaXN0IG9mIGN1cnJlbnQgbWVtYmVycyBpbiB0aGUgZ3JvdXAuICovXG4gIGNvbnN0IGN1cnJlbnQgPSBhd2FpdCBnZXRHcm91cE1lbWJlcnMoY2FyZXRha2VyQ29uZmlnLmNhcmV0YWtlckdyb3VwKTtcbiAgLyoqIFRoZSBsaXN0IG9mIG1lbWJlcnMgYWJsZSB0byBiZSBhZGRlZCB0byB0aGUgZ3JvdXAgYXMgZGVmaW5lZCBieSBhIHNlcGFyYXRlIHJvc3RlciBncm91cC4gKi9cbiAgY29uc3Qgcm9zdGVyID0gYXdhaXQgZ2V0R3JvdXBNZW1iZXJzKGAke2NhcmV0YWtlckNvbmZpZy5jYXJldGFrZXJHcm91cH0tcm9zdGVyYCk7XG4gIGNvbnN0IHtcbiAgICAvKiogVGhlIGxpc3Qgb2YgdXNlcnMgc2VsZWN0ZWQgdG8gYmUgbWVtYmVycyBvZiB0aGUgY2FyZXRha2VyIGdyb3VwLiAqL1xuICAgIHNlbGVjdGVkLFxuICAgIC8qKiBXaGV0aGVyIHRoZSB1c2VyIHBvc2l0aXZlbHkgY29uZmlybWVkIHRoZSBzZWxlY3RlZCBtYWRlLiAqL1xuICAgIGNvbmZpcm1cbiAgfSA9XG4gICAgICBhd2FpdCBwcm9tcHQoW1xuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgICBjaG9pY2VzOiByb3N0ZXIsXG4gICAgICAgICAgbWVzc2FnZTogJ1NlbGVjdCAyIGNhcmV0YWtlcnMgZm9yIHRoZSB1cGNvbWluZyByb3RhdGlvbjonLFxuICAgICAgICAgIGRlZmF1bHQ6IGN1cnJlbnQsXG4gICAgICAgICAgbmFtZTogJ3NlbGVjdGVkJyxcbiAgICAgICAgICBwcmVmaXg6ICcnLFxuICAgICAgICAgIHZhbGlkYXRlOiAoc2VsZWN0ZWQ6IHN0cmluZ1tdKSA9PiB7XG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWQubGVuZ3RoICE9PSAyKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnUGxlYXNlIHNlbGVjdCBleGFjdGx5IDIgY2FyZXRha2VycyBmb3IgdGhlIHVwY29taW5nIHJvdGF0aW9uLic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ2NvbmZpcm0nLFxuICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgICAgcHJlZml4OiAnJyxcbiAgICAgICAgICBtZXNzYWdlOiAnQXJlIHlvdSBzdXJlPycsXG4gICAgICAgICAgbmFtZTogJ2NvbmZpcm0nLFxuICAgICAgICB9XG4gICAgICBdKTtcblxuICBpZiAoY29uZmlybSA9PT0gZmFsc2UpIHtcbiAgICBpbmZvKHllbGxvdygnICDimqAgIFNraXBwaW5nIGNhcmV0YWtlciBncm91cCB1cGRhdGUuJykpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChKU09OLnN0cmluZ2lmeShzZWxlY3RlZCkgPT09IEpTT04uc3RyaW5naWZ5KGN1cnJlbnQpKSB7XG4gICAgaW5mbyhncmVlbignICDiiJogIENhcmV0YWtlciBncm91cCBhbHJlYWR5IHVwIHRvIGRhdGUuJykpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRyeSB7XG4gICAgYXdhaXQgc2V0Q2FyZXRha2VyR3JvdXAoY2FyZXRha2VyQ29uZmlnLmNhcmV0YWtlckdyb3VwLCBzZWxlY3RlZCk7XG4gIH0gY2F0Y2gge1xuICAgIGluZm8ocmVkKCcgIOKcmCAgRmFpbGVkIHRvIHVwZGF0ZSBjYXJldGFrZXIgZ3JvdXAuJykpO1xuICAgIHJldHVybjtcbiAgfVxuICBpbmZvKGdyZWVuKCcgIOKImiAgU3VjY2Vzc2Z1bGx5IHVwZGF0ZWQgY2FyZXRha2VyIGdyb3VwJykpO1xufVxuXG5cbi8qKiBSZXRyaWV2ZSB0aGUgY3VycmVudCBsaXN0IG9mIG1lbWJlcnMgZm9yIHRoZSBwcm92aWRlZCBncm91cC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdldEdyb3VwTWVtYmVycyhncm91cDogc3RyaW5nKSB7XG4gIC8qKiBUaGUgYXV0aGVudGljYXRlZCBHaXRDbGllbnQgaW5zdGFuY2UuICovXG4gIGNvbnN0IGdpdCA9IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQuZ2V0KCk7XG5cbiAgcmV0dXJuIChhd2FpdCBnaXQuZ2l0aHViLnRlYW1zLmxpc3RNZW1iZXJzSW5Pcmcoe1xuICAgICAgICAgICBvcmc6IGdpdC5yZW1vdGVDb25maWcub3duZXIsXG4gICAgICAgICAgIHRlYW1fc2x1ZzogZ3JvdXAsXG4gICAgICAgICB9KSlcbiAgICAgIC5kYXRhLmZpbHRlcihfID0+ICEhXylcbiAgICAgIC5tYXAobWVtYmVyID0+IG1lbWJlciEubG9naW4pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzZXRDYXJldGFrZXJHcm91cChncm91cDogc3RyaW5nLCBtZW1iZXJzOiBzdHJpbmdbXSkge1xuICAvKiogVGhlIGF1dGhlbnRpY2F0ZWQgR2l0Q2xpZW50IGluc3RhbmNlLiAqL1xuICBjb25zdCBnaXQgPSBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LmdldCgpO1xuICAvKiogVGhlIGZ1bGwgbmFtZSBvZiB0aGUgZ3JvdXAgPG9yZz4vPGdyb3VwIG5hbWU+LiAqL1xuICBjb25zdCBmdWxsU2x1ZyA9IGAke2dpdC5yZW1vdGVDb25maWcub3duZXJ9LyR7Z3JvdXB9YDtcbiAgLyoqIFRoZSBsaXN0IG9mIGN1cnJlbnQgbWVtYmVycyBvZiB0aGUgZ3JvdXAuICovXG4gIGNvbnN0IGN1cnJlbnQgPSBhd2FpdCBnZXRHcm91cE1lbWJlcnMoZ3JvdXApO1xuICAvKiogVGhlIGxpc3Qgb2YgdXNlcnMgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSBncm91cC4gKi9cbiAgY29uc3QgcmVtb3ZlZCA9IGN1cnJlbnQuZmlsdGVyKGxvZ2luID0+ICFtZW1iZXJzLmluY2x1ZGVzKGxvZ2luKSk7XG4gIC8qKiBBZGQgYSB1c2VyIHRvIHRoZSBncm91cC4gKi9cbiAgY29uc3QgYWRkID0gYXN5bmMgKHVzZXJuYW1lOiBzdHJpbmcpID0+IHtcbiAgICBkZWJ1ZyhgQWRkaW5nICR7dXNlcm5hbWV9IHRvICR7ZnVsbFNsdWd9LmApO1xuICAgIGF3YWl0IGdpdC5naXRodWIudGVhbXMuYWRkT3JVcGRhdGVNZW1iZXJzaGlwRm9yVXNlckluT3JnKHtcbiAgICAgIG9yZzogZ2l0LnJlbW90ZUNvbmZpZy5vd25lcixcbiAgICAgIHRlYW1fc2x1ZzogZ3JvdXAsXG4gICAgICB1c2VybmFtZSxcbiAgICAgIHJvbGU6ICdtYWludGFpbmVyJyxcbiAgICB9KTtcbiAgfTtcbiAgLyoqIFJlbW92ZSBhIHVzZXIgZnJvbSB0aGUgZ3JvdXAuICovXG4gIGNvbnN0IHJlbW92ZSA9IGFzeW5jICh1c2VybmFtZTogc3RyaW5nKSA9PiB7XG4gICAgZGVidWcoYFJlbW92aW5nICR7dXNlcm5hbWV9IGZyb20gJHtmdWxsU2x1Z30uYCk7XG4gICAgYXdhaXQgZ2l0LmdpdGh1Yi50ZWFtcy5yZW1vdmVNZW1iZXJzaGlwRm9yVXNlckluT3JnKHtcbiAgICAgIG9yZzogZ2l0LnJlbW90ZUNvbmZpZy5vd25lcixcbiAgICAgIHRlYW1fc2x1ZzogZ3JvdXAsXG4gICAgICB1c2VybmFtZSxcbiAgICB9KTtcbiAgfTtcblxuICBkZWJ1Zy5ncm91cChgQ2FyZXRha2VyIEdyb3VwOiAke2Z1bGxTbHVnfWApO1xuICBkZWJ1ZyhgQ3VycmVudCBNZW1iZXJzaGlwOiAke2N1cnJlbnQuam9pbignLCAnKX1gKTtcbiAgZGVidWcoYE5ldyBNZW1iZXJzaGlwOiAgICAgJHttZW1iZXJzLmpvaW4oJywgJyl9YCk7XG4gIGRlYnVnKGBSZW1vdmVkOiAgICAgICAgICAgICR7cmVtb3ZlZC5qb2luKCcsICcpfWApO1xuICBkZWJ1Zy5ncm91cEVuZCgpO1xuXG4gIC8vIEFkZCBtZW1iZXJzIGJlZm9yZSByZW1vdmluZyB0byBwcmV2ZW50IHRoZSBhY2NvdW50IHBlcmZvcm1pbmcgdGhlIGFjdGlvbiBmcm9tIHJlbW92aW5nIHRoZWlyXG4gIC8vIHBlcm1pc3Npb25zIHRvIGNoYW5nZSB0aGUgZ3JvdXAgbWVtYmVyc2hpcCBlYXJseS5cbiAgYXdhaXQgUHJvbWlzZS5hbGwobWVtYmVycy5tYXAoYWRkKSk7XG4gIGF3YWl0IFByb21pc2UuYWxsKHJlbW92ZWQubWFwKHJlbW92ZSkpO1xuXG4gIGRlYnVnKGBTdWNjZXNzZnVseSB1cGRhdGVkICR7ZnVsbFNsdWd9YCk7XG59XG4iXX0=