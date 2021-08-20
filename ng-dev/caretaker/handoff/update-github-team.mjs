"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCaretakerTeamViaPrompt = void 0;
const inquirer_1 = require("inquirer");
const config_1 = require("../../utils/config");
const console_1 = require("../../utils/console");
const authenticated_git_client_1 = require("../../utils/git/authenticated-git-client");
const config_2 = require("../config");
/** Update the Github caretaker group, using a prompt to obtain the new caretaker group members.  */
async function updateCaretakerTeamViaPrompt() {
    /** Caretaker specific configuration. */
    const config = config_1.getConfig();
    config_2.assertValidCaretakerConfig(config);
    const { caretakerGroup } = config.caretaker;
    if (caretakerGroup === undefined) {
        throw Error('`caretakerGroup` is not defined in the `caretaker` config');
    }
    /** The list of current members in the group. */
    const current = await getGroupMembers(caretakerGroup);
    /** The list of members able to be added to the group as defined by a separate roster group. */
    const roster = await getGroupMembers(`${caretakerGroup}-roster`);
    const { 
    /** The list of users selected to be members of the caretaker group. */
    selected, 
    /** Whether the user positively confirmed the selected made. */
    confirm, } = await inquirer_1.prompt([
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
        },
    ]);
    if (confirm === false) {
        console_1.info(console_1.yellow('  ⚠  Skipping caretaker group update.'));
        return;
    }
    if (JSON.stringify(selected) === JSON.stringify(current)) {
        console_1.info(console_1.green('  √  Caretaker group already up to date.'));
        return;
    }
    try {
        await setCaretakerGroup(caretakerGroup, selected);
    }
    catch {
        console_1.info(console_1.red('  ✘  Failed to update caretaker group.'));
        return;
    }
    console_1.info(console_1.green('  √  Successfully updated caretaker group'));
}
exports.updateCaretakerTeamViaPrompt = updateCaretakerTeamViaPrompt;
/** Retrieve the current list of members for the provided group. */
async function getGroupMembers(group) {
    /** The authenticated GitClient instance. */
    const git = authenticated_git_client_1.AuthenticatedGitClient.get();
    return (await git.github.teams.listMembersInOrg({
        org: git.remoteConfig.owner,
        team_slug: group,
    })).data
        .filter((_) => !!_)
        .map((member) => member.login);
}
async function setCaretakerGroup(group, members) {
    /** The authenticated GitClient instance. */
    const git = authenticated_git_client_1.AuthenticatedGitClient.get();
    /** The full name of the group <org>/<group name>. */
    const fullSlug = `${git.remoteConfig.owner}/${group}`;
    /** The list of current members of the group. */
    const current = await getGroupMembers(group);
    /** The list of users to be removed from the group. */
    const removed = current.filter((login) => !members.includes(login));
    /** Add a user to the group. */
    const add = async (username) => {
        console_1.debug(`Adding ${username} to ${fullSlug}.`);
        await git.github.teams.addOrUpdateMembershipForUserInOrg({
            org: git.remoteConfig.owner,
            team_slug: group,
            username,
            role: 'maintainer',
        });
    };
    /** Remove a user from the group. */
    const remove = async (username) => {
        console_1.debug(`Removing ${username} from ${fullSlug}.`);
        await git.github.teams.removeMembershipForUserInOrg({
            org: git.remoteConfig.owner,
            team_slug: group,
            username,
        });
    };
    console_1.debug.group(`Caretaker Group: ${fullSlug}`);
    console_1.debug(`Current Membership: ${current.join(', ')}`);
    console_1.debug(`New Membership:     ${members.join(', ')}`);
    console_1.debug(`Removed:            ${removed.join(', ')}`);
    console_1.debug.groupEnd();
    // Add members before removing to prevent the account performing the action from removing their
    // permissions to change the group membership early.
    await Promise.all(members.map(add));
    await Promise.all(removed.map(remove));
    console_1.debug(`Successfuly updated ${fullSlug}`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLWdpdGh1Yi10ZWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L2NhcmV0YWtlci9oYW5kb2ZmL3VwZGF0ZS1naXRodWItdGVhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCx1Q0FBZ0M7QUFDaEMsK0NBQTZDO0FBRTdDLGlEQUFvRTtBQUNwRSx1RkFBZ0Y7QUFDaEYsc0NBQXFEO0FBRXJELG9HQUFvRztBQUM3RixLQUFLLFVBQVUsNEJBQTRCO0lBQ2hELHdDQUF3QztJQUN4QyxNQUFNLE1BQU0sR0FBRyxrQkFBUyxFQUFFLENBQUM7SUFDM0IsbUNBQTBCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkMsTUFBTSxFQUFDLGNBQWMsRUFBQyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFFMUMsSUFBSSxjQUFjLEtBQUssU0FBUyxFQUFFO1FBQ2hDLE1BQU0sS0FBSyxDQUFDLDJEQUEyRCxDQUFDLENBQUM7S0FDMUU7SUFFRCxnREFBZ0Q7SUFDaEQsTUFBTSxPQUFPLEdBQUcsTUFBTSxlQUFlLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDdEQsK0ZBQStGO0lBQy9GLE1BQU0sTUFBTSxHQUFHLE1BQU0sZUFBZSxDQUFDLEdBQUcsY0FBYyxTQUFTLENBQUMsQ0FBQztJQUNqRSxNQUFNO0lBQ0osdUVBQXVFO0lBQ3ZFLFFBQVE7SUFDUiwrREFBK0Q7SUFDL0QsT0FBTyxHQUNSLEdBQUcsTUFBTSxpQkFBTSxDQUFDO1FBQ2Y7WUFDRSxJQUFJLEVBQUUsVUFBVTtZQUNoQixPQUFPLEVBQUUsTUFBTTtZQUNmLE9BQU8sRUFBRSxnREFBZ0Q7WUFDekQsT0FBTyxFQUFFLE9BQU87WUFDaEIsSUFBSSxFQUFFLFVBQVU7WUFDaEIsTUFBTSxFQUFFLEVBQUU7WUFDVixRQUFRLEVBQUUsQ0FBQyxRQUFrQixFQUFFLEVBQUU7Z0JBQy9CLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQ3pCLE9BQU8sK0RBQStELENBQUM7aUJBQ3hFO2dCQUNELE9BQU8sSUFBSSxDQUFDO1lBQ2QsQ0FBQztTQUNGO1FBQ0Q7WUFDRSxJQUFJLEVBQUUsU0FBUztZQUNmLE9BQU8sRUFBRSxJQUFJO1lBQ2IsTUFBTSxFQUFFLEVBQUU7WUFDVixPQUFPLEVBQUUsZUFBZTtZQUN4QixJQUFJLEVBQUUsU0FBUztTQUNoQjtLQUNGLENBQUMsQ0FBQztJQUVILElBQUksT0FBTyxLQUFLLEtBQUssRUFBRTtRQUNyQixjQUFJLENBQUMsZ0JBQU0sQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDLENBQUM7UUFDdEQsT0FBTztLQUNSO0lBRUQsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDeEQsY0FBSSxDQUFDLGVBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLENBQUM7UUFDeEQsT0FBTztLQUNSO0lBRUQsSUFBSTtRQUNGLE1BQU0saUJBQWlCLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQ25EO0lBQUMsTUFBTTtRQUNOLGNBQUksQ0FBQyxhQUFHLENBQUMsd0NBQXdDLENBQUMsQ0FBQyxDQUFDO1FBQ3BELE9BQU87S0FDUjtJQUNELGNBQUksQ0FBQyxlQUFLLENBQUMsMkNBQTJDLENBQUMsQ0FBQyxDQUFDO0FBQzNELENBQUM7QUE1REQsb0VBNERDO0FBRUQsbUVBQW1FO0FBQ25FLEtBQUssVUFBVSxlQUFlLENBQUMsS0FBYTtJQUMxQyw0Q0FBNEM7SUFDNUMsTUFBTSxHQUFHLEdBQUcsaURBQXNCLENBQUMsR0FBRyxFQUFFLENBQUM7SUFFekMsT0FBTyxDQUNMLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUM7UUFDdEMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSztRQUMzQixTQUFTLEVBQUUsS0FBSztLQUNqQixDQUFDLENBQ0gsQ0FBQyxJQUFJO1NBQ0gsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2xCLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3BDLENBQUM7QUFFRCxLQUFLLFVBQVUsaUJBQWlCLENBQUMsS0FBYSxFQUFFLE9BQWlCO0lBQy9ELDRDQUE0QztJQUM1QyxNQUFNLEdBQUcsR0FBRyxpREFBc0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUN6QyxxREFBcUQ7SUFDckQsTUFBTSxRQUFRLEdBQUcsR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLEtBQUssSUFBSSxLQUFLLEVBQUUsQ0FBQztJQUN0RCxnREFBZ0Q7SUFDaEQsTUFBTSxPQUFPLEdBQUcsTUFBTSxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDN0Msc0RBQXNEO0lBQ3RELE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3BFLCtCQUErQjtJQUMvQixNQUFNLEdBQUcsR0FBRyxLQUFLLEVBQUUsUUFBZ0IsRUFBRSxFQUFFO1FBQ3JDLGVBQUssQ0FBQyxVQUFVLFFBQVEsT0FBTyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQzVDLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsaUNBQWlDLENBQUM7WUFDdkQsR0FBRyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSztZQUMzQixTQUFTLEVBQUUsS0FBSztZQUNoQixRQUFRO1lBQ1IsSUFBSSxFQUFFLFlBQVk7U0FDbkIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDO0lBQ0Ysb0NBQW9DO0lBQ3BDLE1BQU0sTUFBTSxHQUFHLEtBQUssRUFBRSxRQUFnQixFQUFFLEVBQUU7UUFDeEMsZUFBSyxDQUFDLFlBQVksUUFBUSxTQUFTLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDaEQsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQztZQUNsRCxHQUFHLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxLQUFLO1lBQzNCLFNBQVMsRUFBRSxLQUFLO1lBQ2hCLFFBQVE7U0FDVCxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUM7SUFFRixlQUFLLENBQUMsS0FBSyxDQUFDLG9CQUFvQixRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQzVDLGVBQUssQ0FBQyx1QkFBdUIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbkQsZUFBSyxDQUFDLHVCQUF1QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNuRCxlQUFLLENBQUMsdUJBQXVCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ25ELGVBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUVqQiwrRkFBK0Y7SUFDL0Ysb0RBQW9EO0lBQ3BELE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDcEMsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUV2QyxlQUFLLENBQUMsdUJBQXVCLFFBQVEsRUFBRSxDQUFDLENBQUM7QUFDM0MsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3Byb21wdH0gZnJvbSAnaW5xdWlyZXInO1xuaW1wb3J0IHtnZXRDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5cbmltcG9ydCB7ZGVidWcsIGdyZWVuLCBpbmZvLCByZWQsIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHthc3NlcnRWYWxpZENhcmV0YWtlckNvbmZpZ30gZnJvbSAnLi4vY29uZmlnJztcblxuLyoqIFVwZGF0ZSB0aGUgR2l0aHViIGNhcmV0YWtlciBncm91cCwgdXNpbmcgYSBwcm9tcHQgdG8gb2J0YWluIHRoZSBuZXcgY2FyZXRha2VyIGdyb3VwIG1lbWJlcnMuICAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZUNhcmV0YWtlclRlYW1WaWFQcm9tcHQoKSB7XG4gIC8qKiBDYXJldGFrZXIgc3BlY2lmaWMgY29uZmlndXJhdGlvbi4gKi9cbiAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gIGFzc2VydFZhbGlkQ2FyZXRha2VyQ29uZmlnKGNvbmZpZyk7XG4gIGNvbnN0IHtjYXJldGFrZXJHcm91cH0gPSBjb25maWcuY2FyZXRha2VyO1xuXG4gIGlmIChjYXJldGFrZXJHcm91cCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgRXJyb3IoJ2BjYXJldGFrZXJHcm91cGAgaXMgbm90IGRlZmluZWQgaW4gdGhlIGBjYXJldGFrZXJgIGNvbmZpZycpO1xuICB9XG5cbiAgLyoqIFRoZSBsaXN0IG9mIGN1cnJlbnQgbWVtYmVycyBpbiB0aGUgZ3JvdXAuICovXG4gIGNvbnN0IGN1cnJlbnQgPSBhd2FpdCBnZXRHcm91cE1lbWJlcnMoY2FyZXRha2VyR3JvdXApO1xuICAvKiogVGhlIGxpc3Qgb2YgbWVtYmVycyBhYmxlIHRvIGJlIGFkZGVkIHRvIHRoZSBncm91cCBhcyBkZWZpbmVkIGJ5IGEgc2VwYXJhdGUgcm9zdGVyIGdyb3VwLiAqL1xuICBjb25zdCByb3N0ZXIgPSBhd2FpdCBnZXRHcm91cE1lbWJlcnMoYCR7Y2FyZXRha2VyR3JvdXB9LXJvc3RlcmApO1xuICBjb25zdCB7XG4gICAgLyoqIFRoZSBsaXN0IG9mIHVzZXJzIHNlbGVjdGVkIHRvIGJlIG1lbWJlcnMgb2YgdGhlIGNhcmV0YWtlciBncm91cC4gKi9cbiAgICBzZWxlY3RlZCxcbiAgICAvKiogV2hldGhlciB0aGUgdXNlciBwb3NpdGl2ZWx5IGNvbmZpcm1lZCB0aGUgc2VsZWN0ZWQgbWFkZS4gKi9cbiAgICBjb25maXJtLFxuICB9ID0gYXdhaXQgcHJvbXB0KFtcbiAgICB7XG4gICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgY2hvaWNlczogcm9zdGVyLFxuICAgICAgbWVzc2FnZTogJ1NlbGVjdCAyIGNhcmV0YWtlcnMgZm9yIHRoZSB1cGNvbWluZyByb3RhdGlvbjonLFxuICAgICAgZGVmYXVsdDogY3VycmVudCxcbiAgICAgIG5hbWU6ICdzZWxlY3RlZCcsXG4gICAgICBwcmVmaXg6ICcnLFxuICAgICAgdmFsaWRhdGU6IChzZWxlY3RlZDogc3RyaW5nW10pID0+IHtcbiAgICAgICAgaWYgKHNlbGVjdGVkLmxlbmd0aCAhPT0gMikge1xuICAgICAgICAgIHJldHVybiAnUGxlYXNlIHNlbGVjdCBleGFjdGx5IDIgY2FyZXRha2VycyBmb3IgdGhlIHVwY29taW5nIHJvdGF0aW9uLic7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgdHlwZTogJ2NvbmZpcm0nLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgIHByZWZpeDogJycsXG4gICAgICBtZXNzYWdlOiAnQXJlIHlvdSBzdXJlPycsXG4gICAgICBuYW1lOiAnY29uZmlybScsXG4gICAgfSxcbiAgXSk7XG5cbiAgaWYgKGNvbmZpcm0gPT09IGZhbHNlKSB7XG4gICAgaW5mbyh5ZWxsb3coJyAg4pqgICBTa2lwcGluZyBjYXJldGFrZXIgZ3JvdXAgdXBkYXRlLicpKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoSlNPTi5zdHJpbmdpZnkoc2VsZWN0ZWQpID09PSBKU09OLnN0cmluZ2lmeShjdXJyZW50KSkge1xuICAgIGluZm8oZ3JlZW4oJyAg4oiaICBDYXJldGFrZXIgZ3JvdXAgYWxyZWFkeSB1cCB0byBkYXRlLicpKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0cnkge1xuICAgIGF3YWl0IHNldENhcmV0YWtlckdyb3VwKGNhcmV0YWtlckdyb3VwLCBzZWxlY3RlZCk7XG4gIH0gY2F0Y2gge1xuICAgIGluZm8ocmVkKCcgIOKcmCAgRmFpbGVkIHRvIHVwZGF0ZSBjYXJldGFrZXIgZ3JvdXAuJykpO1xuICAgIHJldHVybjtcbiAgfVxuICBpbmZvKGdyZWVuKCcgIOKImiAgU3VjY2Vzc2Z1bGx5IHVwZGF0ZWQgY2FyZXRha2VyIGdyb3VwJykpO1xufVxuXG4vKiogUmV0cmlldmUgdGhlIGN1cnJlbnQgbGlzdCBvZiBtZW1iZXJzIGZvciB0aGUgcHJvdmlkZWQgZ3JvdXAuICovXG5hc3luYyBmdW5jdGlvbiBnZXRHcm91cE1lbWJlcnMoZ3JvdXA6IHN0cmluZykge1xuICAvKiogVGhlIGF1dGhlbnRpY2F0ZWQgR2l0Q2xpZW50IGluc3RhbmNlLiAqL1xuICBjb25zdCBnaXQgPSBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LmdldCgpO1xuXG4gIHJldHVybiAoXG4gICAgYXdhaXQgZ2l0LmdpdGh1Yi50ZWFtcy5saXN0TWVtYmVyc0luT3JnKHtcbiAgICAgIG9yZzogZ2l0LnJlbW90ZUNvbmZpZy5vd25lcixcbiAgICAgIHRlYW1fc2x1ZzogZ3JvdXAsXG4gICAgfSlcbiAgKS5kYXRhXG4gICAgLmZpbHRlcigoXykgPT4gISFfKVxuICAgIC5tYXAoKG1lbWJlcikgPT4gbWVtYmVyIS5sb2dpbik7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNldENhcmV0YWtlckdyb3VwKGdyb3VwOiBzdHJpbmcsIG1lbWJlcnM6IHN0cmluZ1tdKSB7XG4gIC8qKiBUaGUgYXV0aGVudGljYXRlZCBHaXRDbGllbnQgaW5zdGFuY2UuICovXG4gIGNvbnN0IGdpdCA9IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQuZ2V0KCk7XG4gIC8qKiBUaGUgZnVsbCBuYW1lIG9mIHRoZSBncm91cCA8b3JnPi88Z3JvdXAgbmFtZT4uICovXG4gIGNvbnN0IGZ1bGxTbHVnID0gYCR7Z2l0LnJlbW90ZUNvbmZpZy5vd25lcn0vJHtncm91cH1gO1xuICAvKiogVGhlIGxpc3Qgb2YgY3VycmVudCBtZW1iZXJzIG9mIHRoZSBncm91cC4gKi9cbiAgY29uc3QgY3VycmVudCA9IGF3YWl0IGdldEdyb3VwTWVtYmVycyhncm91cCk7XG4gIC8qKiBUaGUgbGlzdCBvZiB1c2VycyB0byBiZSByZW1vdmVkIGZyb20gdGhlIGdyb3VwLiAqL1xuICBjb25zdCByZW1vdmVkID0gY3VycmVudC5maWx0ZXIoKGxvZ2luKSA9PiAhbWVtYmVycy5pbmNsdWRlcyhsb2dpbikpO1xuICAvKiogQWRkIGEgdXNlciB0byB0aGUgZ3JvdXAuICovXG4gIGNvbnN0IGFkZCA9IGFzeW5jICh1c2VybmFtZTogc3RyaW5nKSA9PiB7XG4gICAgZGVidWcoYEFkZGluZyAke3VzZXJuYW1lfSB0byAke2Z1bGxTbHVnfS5gKTtcbiAgICBhd2FpdCBnaXQuZ2l0aHViLnRlYW1zLmFkZE9yVXBkYXRlTWVtYmVyc2hpcEZvclVzZXJJbk9yZyh7XG4gICAgICBvcmc6IGdpdC5yZW1vdGVDb25maWcub3duZXIsXG4gICAgICB0ZWFtX3NsdWc6IGdyb3VwLFxuICAgICAgdXNlcm5hbWUsXG4gICAgICByb2xlOiAnbWFpbnRhaW5lcicsXG4gICAgfSk7XG4gIH07XG4gIC8qKiBSZW1vdmUgYSB1c2VyIGZyb20gdGhlIGdyb3VwLiAqL1xuICBjb25zdCByZW1vdmUgPSBhc3luYyAodXNlcm5hbWU6IHN0cmluZykgPT4ge1xuICAgIGRlYnVnKGBSZW1vdmluZyAke3VzZXJuYW1lfSBmcm9tICR7ZnVsbFNsdWd9LmApO1xuICAgIGF3YWl0IGdpdC5naXRodWIudGVhbXMucmVtb3ZlTWVtYmVyc2hpcEZvclVzZXJJbk9yZyh7XG4gICAgICBvcmc6IGdpdC5yZW1vdGVDb25maWcub3duZXIsXG4gICAgICB0ZWFtX3NsdWc6IGdyb3VwLFxuICAgICAgdXNlcm5hbWUsXG4gICAgfSk7XG4gIH07XG5cbiAgZGVidWcuZ3JvdXAoYENhcmV0YWtlciBHcm91cDogJHtmdWxsU2x1Z31gKTtcbiAgZGVidWcoYEN1cnJlbnQgTWVtYmVyc2hpcDogJHtjdXJyZW50LmpvaW4oJywgJyl9YCk7XG4gIGRlYnVnKGBOZXcgTWVtYmVyc2hpcDogICAgICR7bWVtYmVycy5qb2luKCcsICcpfWApO1xuICBkZWJ1ZyhgUmVtb3ZlZDogICAgICAgICAgICAke3JlbW92ZWQuam9pbignLCAnKX1gKTtcbiAgZGVidWcuZ3JvdXBFbmQoKTtcblxuICAvLyBBZGQgbWVtYmVycyBiZWZvcmUgcmVtb3ZpbmcgdG8gcHJldmVudCB0aGUgYWNjb3VudCBwZXJmb3JtaW5nIHRoZSBhY3Rpb24gZnJvbSByZW1vdmluZyB0aGVpclxuICAvLyBwZXJtaXNzaW9ucyB0byBjaGFuZ2UgdGhlIGdyb3VwIG1lbWJlcnNoaXAgZWFybHkuXG4gIGF3YWl0IFByb21pc2UuYWxsKG1lbWJlcnMubWFwKGFkZCkpO1xuICBhd2FpdCBQcm9taXNlLmFsbChyZW1vdmVkLm1hcChyZW1vdmUpKTtcblxuICBkZWJ1ZyhgU3VjY2Vzc2Z1bHkgdXBkYXRlZCAke2Z1bGxTbHVnfWApO1xufVxuIl19