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
const console_1 = require("../../utils/console");
const authenticated_git_client_1 = require("../../utils/git/authenticated-git-client");
const config_1 = require("../config");
/** Update the Github caretaker group, using a prompt to obtain the new caretaker group members.  */
async function updateCaretakerTeamViaPrompt() {
    /** Caretaker specific configuration. */
    const caretakerConfig = config_1.getCaretakerConfig().caretaker;
    if (caretakerConfig.caretakerGroup === undefined) {
        throw Error('`caretakerGroup` is not defined in the `caretaker` config');
    }
    /** The list of current members in the group. */
    const current = await getGroupMembers(caretakerConfig.caretakerGroup);
    /** The list of members able to be added to the group as defined by a separate roster group. */
    const roster = await getGroupMembers(`${caretakerConfig.caretakerGroup}-roster`);
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
        await setCaretakerGroup(caretakerConfig.caretakerGroup, selected);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLWdpdGh1Yi10ZWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L2NhcmV0YWtlci9oYW5kb2ZmL3VwZGF0ZS1naXRodWItdGVhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCx1Q0FBZ0M7QUFFaEMsaURBQW9FO0FBQ3BFLHVGQUFnRjtBQUNoRixzQ0FBNkM7QUFFN0Msb0dBQW9HO0FBQzdGLEtBQUssVUFBVSw0QkFBNEI7SUFDaEQsd0NBQXdDO0lBQ3hDLE1BQU0sZUFBZSxHQUFHLDJCQUFrQixFQUFFLENBQUMsU0FBUyxDQUFDO0lBRXZELElBQUksZUFBZSxDQUFDLGNBQWMsS0FBSyxTQUFTLEVBQUU7UUFDaEQsTUFBTSxLQUFLLENBQUMsMkRBQTJELENBQUMsQ0FBQztLQUMxRTtJQUVELGdEQUFnRDtJQUNoRCxNQUFNLE9BQU8sR0FBRyxNQUFNLGVBQWUsQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDdEUsK0ZBQStGO0lBQy9GLE1BQU0sTUFBTSxHQUFHLE1BQU0sZUFBZSxDQUFDLEdBQUcsZUFBZSxDQUFDLGNBQWMsU0FBUyxDQUFDLENBQUM7SUFDakYsTUFBTTtJQUNKLHVFQUF1RTtJQUN2RSxRQUFRO0lBQ1IsK0RBQStEO0lBQy9ELE9BQU8sR0FDUixHQUFHLE1BQU0saUJBQU0sQ0FBQztRQUNmO1lBQ0UsSUFBSSxFQUFFLFVBQVU7WUFDaEIsT0FBTyxFQUFFLE1BQU07WUFDZixPQUFPLEVBQUUsZ0RBQWdEO1lBQ3pELE9BQU8sRUFBRSxPQUFPO1lBQ2hCLElBQUksRUFBRSxVQUFVO1lBQ2hCLE1BQU0sRUFBRSxFQUFFO1lBQ1YsUUFBUSxFQUFFLENBQUMsUUFBa0IsRUFBRSxFQUFFO2dCQUMvQixJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUN6QixPQUFPLCtEQUErRCxDQUFDO2lCQUN4RTtnQkFDRCxP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QUFNLENBQUMsS0FBSyxDQUFDLDRCQUE0QixDQUFDO1lBQ2xELEdBQUcsRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLEtBQUs7WUFDM0IsU0FBUyxFQUFFLEtBQUs7WUFDaEIsUUFBUTtTQUNULENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQztJQUVGLGVBQUssQ0FBQyxLQUFLLENBQUMsb0JBQW9CLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDNUMsZUFBSyxDQUFDLHVCQUF1QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNuRCxlQUFLLENBQUMsdUJBQXVCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ25ELGVBQUssQ0FBQyx1QkFBdUIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbkQsZUFBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBRWpCLCtGQUErRjtJQUMvRixvREFBb0Q7SUFDcEQsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNwQyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBRXZDLGVBQUssQ0FBQyx1QkFBdUIsUUFBUSxFQUFFLENBQUMsQ0FBQztBQUMzQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cHJvbXB0fSBmcm9tICdpbnF1aXJlcic7XG5cbmltcG9ydCB7ZGVidWcsIGdyZWVuLCBpbmZvLCByZWQsIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHtnZXRDYXJldGFrZXJDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5cbi8qKiBVcGRhdGUgdGhlIEdpdGh1YiBjYXJldGFrZXIgZ3JvdXAsIHVzaW5nIGEgcHJvbXB0IHRvIG9idGFpbiB0aGUgbmV3IGNhcmV0YWtlciBncm91cCBtZW1iZXJzLiAgKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVDYXJldGFrZXJUZWFtVmlhUHJvbXB0KCkge1xuICAvKiogQ2FyZXRha2VyIHNwZWNpZmljIGNvbmZpZ3VyYXRpb24uICovXG4gIGNvbnN0IGNhcmV0YWtlckNvbmZpZyA9IGdldENhcmV0YWtlckNvbmZpZygpLmNhcmV0YWtlcjtcblxuICBpZiAoY2FyZXRha2VyQ29uZmlnLmNhcmV0YWtlckdyb3VwID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBFcnJvcignYGNhcmV0YWtlckdyb3VwYCBpcyBub3QgZGVmaW5lZCBpbiB0aGUgYGNhcmV0YWtlcmAgY29uZmlnJyk7XG4gIH1cblxuICAvKiogVGhlIGxpc3Qgb2YgY3VycmVudCBtZW1iZXJzIGluIHRoZSBncm91cC4gKi9cbiAgY29uc3QgY3VycmVudCA9IGF3YWl0IGdldEdyb3VwTWVtYmVycyhjYXJldGFrZXJDb25maWcuY2FyZXRha2VyR3JvdXApO1xuICAvKiogVGhlIGxpc3Qgb2YgbWVtYmVycyBhYmxlIHRvIGJlIGFkZGVkIHRvIHRoZSBncm91cCBhcyBkZWZpbmVkIGJ5IGEgc2VwYXJhdGUgcm9zdGVyIGdyb3VwLiAqL1xuICBjb25zdCByb3N0ZXIgPSBhd2FpdCBnZXRHcm91cE1lbWJlcnMoYCR7Y2FyZXRha2VyQ29uZmlnLmNhcmV0YWtlckdyb3VwfS1yb3N0ZXJgKTtcbiAgY29uc3Qge1xuICAgIC8qKiBUaGUgbGlzdCBvZiB1c2VycyBzZWxlY3RlZCB0byBiZSBtZW1iZXJzIG9mIHRoZSBjYXJldGFrZXIgZ3JvdXAuICovXG4gICAgc2VsZWN0ZWQsXG4gICAgLyoqIFdoZXRoZXIgdGhlIHVzZXIgcG9zaXRpdmVseSBjb25maXJtZWQgdGhlIHNlbGVjdGVkIG1hZGUuICovXG4gICAgY29uZmlybSxcbiAgfSA9IGF3YWl0IHByb21wdChbXG4gICAge1xuICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgIGNob2ljZXM6IHJvc3RlcixcbiAgICAgIG1lc3NhZ2U6ICdTZWxlY3QgMiBjYXJldGFrZXJzIGZvciB0aGUgdXBjb21pbmcgcm90YXRpb246JyxcbiAgICAgIGRlZmF1bHQ6IGN1cnJlbnQsXG4gICAgICBuYW1lOiAnc2VsZWN0ZWQnLFxuICAgICAgcHJlZml4OiAnJyxcbiAgICAgIHZhbGlkYXRlOiAoc2VsZWN0ZWQ6IHN0cmluZ1tdKSA9PiB7XG4gICAgICAgIGlmIChzZWxlY3RlZC5sZW5ndGggIT09IDIpIHtcbiAgICAgICAgICByZXR1cm4gJ1BsZWFzZSBzZWxlY3QgZXhhY3RseSAyIGNhcmV0YWtlcnMgZm9yIHRoZSB1cGNvbWluZyByb3RhdGlvbi4nO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHR5cGU6ICdjb25maXJtJyxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICBwcmVmaXg6ICcnLFxuICAgICAgbWVzc2FnZTogJ0FyZSB5b3Ugc3VyZT8nLFxuICAgICAgbmFtZTogJ2NvbmZpcm0nLFxuICAgIH0sXG4gIF0pO1xuXG4gIGlmIChjb25maXJtID09PSBmYWxzZSkge1xuICAgIGluZm8oeWVsbG93KCcgIOKaoCAgU2tpcHBpbmcgY2FyZXRha2VyIGdyb3VwIHVwZGF0ZS4nKSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKEpTT04uc3RyaW5naWZ5KHNlbGVjdGVkKSA9PT0gSlNPTi5zdHJpbmdpZnkoY3VycmVudCkpIHtcbiAgICBpbmZvKGdyZWVuKCcgIOKImiAgQ2FyZXRha2VyIGdyb3VwIGFscmVhZHkgdXAgdG8gZGF0ZS4nKSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBhd2FpdCBzZXRDYXJldGFrZXJHcm91cChjYXJldGFrZXJDb25maWcuY2FyZXRha2VyR3JvdXAsIHNlbGVjdGVkKTtcbiAgfSBjYXRjaCB7XG4gICAgaW5mbyhyZWQoJyAg4pyYICBGYWlsZWQgdG8gdXBkYXRlIGNhcmV0YWtlciBncm91cC4nKSk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGluZm8oZ3JlZW4oJyAg4oiaICBTdWNjZXNzZnVsbHkgdXBkYXRlZCBjYXJldGFrZXIgZ3JvdXAnKSk7XG59XG5cbi8qKiBSZXRyaWV2ZSB0aGUgY3VycmVudCBsaXN0IG9mIG1lbWJlcnMgZm9yIHRoZSBwcm92aWRlZCBncm91cC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdldEdyb3VwTWVtYmVycyhncm91cDogc3RyaW5nKSB7XG4gIC8qKiBUaGUgYXV0aGVudGljYXRlZCBHaXRDbGllbnQgaW5zdGFuY2UuICovXG4gIGNvbnN0IGdpdCA9IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQuZ2V0KCk7XG5cbiAgcmV0dXJuIChcbiAgICBhd2FpdCBnaXQuZ2l0aHViLnRlYW1zLmxpc3RNZW1iZXJzSW5Pcmcoe1xuICAgICAgb3JnOiBnaXQucmVtb3RlQ29uZmlnLm93bmVyLFxuICAgICAgdGVhbV9zbHVnOiBncm91cCxcbiAgICB9KVxuICApLmRhdGFcbiAgICAuZmlsdGVyKChfKSA9PiAhIV8pXG4gICAgLm1hcCgobWVtYmVyKSA9PiBtZW1iZXIhLmxvZ2luKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2V0Q2FyZXRha2VyR3JvdXAoZ3JvdXA6IHN0cmluZywgbWVtYmVyczogc3RyaW5nW10pIHtcbiAgLyoqIFRoZSBhdXRoZW50aWNhdGVkIEdpdENsaWVudCBpbnN0YW5jZS4gKi9cbiAgY29uc3QgZ2l0ID0gQXV0aGVudGljYXRlZEdpdENsaWVudC5nZXQoKTtcbiAgLyoqIFRoZSBmdWxsIG5hbWUgb2YgdGhlIGdyb3VwIDxvcmc+Lzxncm91cCBuYW1lPi4gKi9cbiAgY29uc3QgZnVsbFNsdWcgPSBgJHtnaXQucmVtb3RlQ29uZmlnLm93bmVyfS8ke2dyb3VwfWA7XG4gIC8qKiBUaGUgbGlzdCBvZiBjdXJyZW50IG1lbWJlcnMgb2YgdGhlIGdyb3VwLiAqL1xuICBjb25zdCBjdXJyZW50ID0gYXdhaXQgZ2V0R3JvdXBNZW1iZXJzKGdyb3VwKTtcbiAgLyoqIFRoZSBsaXN0IG9mIHVzZXJzIHRvIGJlIHJlbW92ZWQgZnJvbSB0aGUgZ3JvdXAuICovXG4gIGNvbnN0IHJlbW92ZWQgPSBjdXJyZW50LmZpbHRlcigobG9naW4pID0+ICFtZW1iZXJzLmluY2x1ZGVzKGxvZ2luKSk7XG4gIC8qKiBBZGQgYSB1c2VyIHRvIHRoZSBncm91cC4gKi9cbiAgY29uc3QgYWRkID0gYXN5bmMgKHVzZXJuYW1lOiBzdHJpbmcpID0+IHtcbiAgICBkZWJ1ZyhgQWRkaW5nICR7dXNlcm5hbWV9IHRvICR7ZnVsbFNsdWd9LmApO1xuICAgIGF3YWl0IGdpdC5naXRodWIudGVhbXMuYWRkT3JVcGRhdGVNZW1iZXJzaGlwRm9yVXNlckluT3JnKHtcbiAgICAgIG9yZzogZ2l0LnJlbW90ZUNvbmZpZy5vd25lcixcbiAgICAgIHRlYW1fc2x1ZzogZ3JvdXAsXG4gICAgICB1c2VybmFtZSxcbiAgICAgIHJvbGU6ICdtYWludGFpbmVyJyxcbiAgICB9KTtcbiAgfTtcbiAgLyoqIFJlbW92ZSBhIHVzZXIgZnJvbSB0aGUgZ3JvdXAuICovXG4gIGNvbnN0IHJlbW92ZSA9IGFzeW5jICh1c2VybmFtZTogc3RyaW5nKSA9PiB7XG4gICAgZGVidWcoYFJlbW92aW5nICR7dXNlcm5hbWV9IGZyb20gJHtmdWxsU2x1Z30uYCk7XG4gICAgYXdhaXQgZ2l0LmdpdGh1Yi50ZWFtcy5yZW1vdmVNZW1iZXJzaGlwRm9yVXNlckluT3JnKHtcbiAgICAgIG9yZzogZ2l0LnJlbW90ZUNvbmZpZy5vd25lcixcbiAgICAgIHRlYW1fc2x1ZzogZ3JvdXAsXG4gICAgICB1c2VybmFtZSxcbiAgICB9KTtcbiAgfTtcblxuICBkZWJ1Zy5ncm91cChgQ2FyZXRha2VyIEdyb3VwOiAke2Z1bGxTbHVnfWApO1xuICBkZWJ1ZyhgQ3VycmVudCBNZW1iZXJzaGlwOiAke2N1cnJlbnQuam9pbignLCAnKX1gKTtcbiAgZGVidWcoYE5ldyBNZW1iZXJzaGlwOiAgICAgJHttZW1iZXJzLmpvaW4oJywgJyl9YCk7XG4gIGRlYnVnKGBSZW1vdmVkOiAgICAgICAgICAgICR7cmVtb3ZlZC5qb2luKCcsICcpfWApO1xuICBkZWJ1Zy5ncm91cEVuZCgpO1xuXG4gIC8vIEFkZCBtZW1iZXJzIGJlZm9yZSByZW1vdmluZyB0byBwcmV2ZW50IHRoZSBhY2NvdW50IHBlcmZvcm1pbmcgdGhlIGFjdGlvbiBmcm9tIHJlbW92aW5nIHRoZWlyXG4gIC8vIHBlcm1pc3Npb25zIHRvIGNoYW5nZSB0aGUgZ3JvdXAgbWVtYmVyc2hpcCBlYXJseS5cbiAgYXdhaXQgUHJvbWlzZS5hbGwobWVtYmVycy5tYXAoYWRkKSk7XG4gIGF3YWl0IFByb21pc2UuYWxsKHJlbW92ZWQubWFwKHJlbW92ZSkpO1xuXG4gIGRlYnVnKGBTdWNjZXNzZnVseSB1cGRhdGVkICR7ZnVsbFNsdWd9YCk7XG59XG4iXX0=