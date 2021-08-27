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
    const config = (0, config_1.getConfig)();
    (0, config_2.assertValidCaretakerConfig)(config);
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
    confirm, } = await (0, inquirer_1.prompt)([
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
        (0, console_1.info)((0, console_1.yellow)('  ⚠  Skipping caretaker group update.'));
        return;
    }
    if (JSON.stringify(selected) === JSON.stringify(current)) {
        (0, console_1.info)((0, console_1.green)('  √  Caretaker group already up to date.'));
        return;
    }
    try {
        await setCaretakerGroup(caretakerGroup, selected);
    }
    catch {
        (0, console_1.info)((0, console_1.red)('  ✘  Failed to update caretaker group.'));
        return;
    }
    (0, console_1.info)((0, console_1.green)('  √  Successfully updated caretaker group'));
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
        (0, console_1.debug)(`Adding ${username} to ${fullSlug}.`);
        await git.github.teams.addOrUpdateMembershipForUserInOrg({
            org: git.remoteConfig.owner,
            team_slug: group,
            username,
            role: 'maintainer',
        });
    };
    /** Remove a user from the group. */
    const remove = async (username) => {
        (0, console_1.debug)(`Removing ${username} from ${fullSlug}.`);
        await git.github.teams.removeMembershipForUserInOrg({
            org: git.remoteConfig.owner,
            team_slug: group,
            username,
        });
    };
    console_1.debug.group(`Caretaker Group: ${fullSlug}`);
    (0, console_1.debug)(`Current Membership: ${current.join(', ')}`);
    (0, console_1.debug)(`New Membership:     ${members.join(', ')}`);
    (0, console_1.debug)(`Removed:            ${removed.join(', ')}`);
    console_1.debug.groupEnd();
    // Add members before removing to prevent the account performing the action from removing their
    // permissions to change the group membership early.
    await Promise.all(members.map(add));
    await Promise.all(removed.map(remove));
    (0, console_1.debug)(`Successfuly updated ${fullSlug}`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLWdpdGh1Yi10ZWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L2NhcmV0YWtlci9oYW5kb2ZmL3VwZGF0ZS1naXRodWItdGVhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCx1Q0FBZ0M7QUFDaEMsK0NBQTZDO0FBRTdDLGlEQUFvRTtBQUNwRSx1RkFBZ0Y7QUFDaEYsc0NBQXFEO0FBRXJELG9HQUFvRztBQUM3RixLQUFLLFVBQVUsNEJBQTRCO0lBQ2hELHdDQUF3QztJQUN4QyxNQUFNLE1BQU0sR0FBRyxJQUFBLGtCQUFTLEdBQUUsQ0FBQztJQUMzQixJQUFBLG1DQUEwQixFQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ25DLE1BQU0sRUFBQyxjQUFjLEVBQUMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO0lBRTFDLElBQUksY0FBYyxLQUFLLFNBQVMsRUFBRTtRQUNoQyxNQUFNLEtBQUssQ0FBQywyREFBMkQsQ0FBQyxDQUFDO0tBQzFFO0lBRUQsZ0RBQWdEO0lBQ2hELE1BQU0sT0FBTyxHQUFHLE1BQU0sZUFBZSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3RELCtGQUErRjtJQUMvRixNQUFNLE1BQU0sR0FBRyxNQUFNLGVBQWUsQ0FBQyxHQUFHLGNBQWMsU0FBUyxDQUFDLENBQUM7SUFDakUsTUFBTTtJQUNKLHVFQUF1RTtJQUN2RSxRQUFRO0lBQ1IsK0RBQStEO0lBQy9ELE9BQU8sR0FDUixHQUFHLE1BQU0sSUFBQSxpQkFBTSxFQUFDO1FBQ2Y7WUFDRSxJQUFJLEVBQUUsVUFBVTtZQUNoQixPQUFPLEVBQUUsTUFBTTtZQUNmLE9BQU8sRUFBRSxnREFBZ0Q7WUFDekQsT0FBTyxFQUFFLE9BQU87WUFDaEIsSUFBSSxFQUFFLFVBQVU7WUFDaEIsTUFBTSxFQUFFLEVBQUU7WUFDVixRQUFRLEVBQUUsQ0FBQyxRQUFrQixFQUFFLEVBQUU7Z0JBQy9CLElB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TSxHQUFHLEtBQUssRUFBRSxRQUFnQixFQUFFLEVBQUU7UUFDeEMsSUFBQSxlQUFLLEVBQUMsWUFBWSxRQUFRLFNBQVMsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNoRCxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLDRCQUE0QixDQUFDO1lBQ2xELEdBQUcsRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLEtBQUs7WUFDM0IsU0FBUyxFQUFFLEtBQUs7WUFDaEIsUUFBUTtTQUNULENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQztJQUVGLGVBQUssQ0FBQyxLQUFLLENBQUMsb0JBQW9CLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDNUMsSUFBQSxlQUFLLEVBQUMsdUJBQXVCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ25ELElBQUEsZUFBSyxFQUFDLHVCQUF1QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNuRCxJQUFBLGVBQUssRUFBQyx1QkFBdUIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbkQsZUFBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBRWpCLCtGQUErRjtJQUMvRixvREFBb0Q7SUFDcEQsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNwQyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBRXZDLElBQUEsZUFBSyxFQUFDLHVCQUF1QixRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQzNDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtwcm9tcHR9IGZyb20gJ2lucXVpcmVyJztcbmltcG9ydCB7Z2V0Q29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuXG5pbXBvcnQge2RlYnVnLCBncmVlbiwgaW5mbywgcmVkLCB5ZWxsb3d9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtBdXRoZW50aWNhdGVkR2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvYXV0aGVudGljYXRlZC1naXQtY2xpZW50JztcbmltcG9ydCB7YXNzZXJ0VmFsaWRDYXJldGFrZXJDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5cbi8qKiBVcGRhdGUgdGhlIEdpdGh1YiBjYXJldGFrZXIgZ3JvdXAsIHVzaW5nIGEgcHJvbXB0IHRvIG9idGFpbiB0aGUgbmV3IGNhcmV0YWtlciBncm91cCBtZW1iZXJzLiAgKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVDYXJldGFrZXJUZWFtVmlhUHJvbXB0KCkge1xuICAvKiogQ2FyZXRha2VyIHNwZWNpZmljIGNvbmZpZ3VyYXRpb24uICovXG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICBhc3NlcnRWYWxpZENhcmV0YWtlckNvbmZpZyhjb25maWcpO1xuICBjb25zdCB7Y2FyZXRha2VyR3JvdXB9ID0gY29uZmlnLmNhcmV0YWtlcjtcblxuICBpZiAoY2FyZXRha2VyR3JvdXAgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IEVycm9yKCdgY2FyZXRha2VyR3JvdXBgIGlzIG5vdCBkZWZpbmVkIGluIHRoZSBgY2FyZXRha2VyYCBjb25maWcnKTtcbiAgfVxuXG4gIC8qKiBUaGUgbGlzdCBvZiBjdXJyZW50IG1lbWJlcnMgaW4gdGhlIGdyb3VwLiAqL1xuICBjb25zdCBjdXJyZW50ID0gYXdhaXQgZ2V0R3JvdXBNZW1iZXJzKGNhcmV0YWtlckdyb3VwKTtcbiAgLyoqIFRoZSBsaXN0IG9mIG1lbWJlcnMgYWJsZSB0byBiZSBhZGRlZCB0byB0aGUgZ3JvdXAgYXMgZGVmaW5lZCBieSBhIHNlcGFyYXRlIHJvc3RlciBncm91cC4gKi9cbiAgY29uc3Qgcm9zdGVyID0gYXdhaXQgZ2V0R3JvdXBNZW1iZXJzKGAke2NhcmV0YWtlckdyb3VwfS1yb3N0ZXJgKTtcbiAgY29uc3Qge1xuICAgIC8qKiBUaGUgbGlzdCBvZiB1c2VycyBzZWxlY3RlZCB0byBiZSBtZW1iZXJzIG9mIHRoZSBjYXJldGFrZXIgZ3JvdXAuICovXG4gICAgc2VsZWN0ZWQsXG4gICAgLyoqIFdoZXRoZXIgdGhlIHVzZXIgcG9zaXRpdmVseSBjb25maXJtZWQgdGhlIHNlbGVjdGVkIG1hZGUuICovXG4gICAgY29uZmlybSxcbiAgfSA9IGF3YWl0IHByb21wdChbXG4gICAge1xuICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgIGNob2ljZXM6IHJvc3RlcixcbiAgICAgIG1lc3NhZ2U6ICdTZWxlY3QgMiBjYXJldGFrZXJzIGZvciB0aGUgdXBjb21pbmcgcm90YXRpb246JyxcbiAgICAgIGRlZmF1bHQ6IGN1cnJlbnQsXG4gICAgICBuYW1lOiAnc2VsZWN0ZWQnLFxuICAgICAgcHJlZml4OiAnJyxcbiAgICAgIHZhbGlkYXRlOiAoc2VsZWN0ZWQ6IHN0cmluZ1tdKSA9PiB7XG4gICAgICAgIGlmIChzZWxlY3RlZC5sZW5ndGggIT09IDIpIHtcbiAgICAgICAgICByZXR1cm4gJ1BsZWFzZSBzZWxlY3QgZXhhY3RseSAyIGNhcmV0YWtlcnMgZm9yIHRoZSB1cGNvbWluZyByb3RhdGlvbi4nO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHR5cGU6ICdjb25maXJtJyxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICBwcmVmaXg6ICcnLFxuICAgICAgbWVzc2FnZTogJ0FyZSB5b3Ugc3VyZT8nLFxuICAgICAgbmFtZTogJ2NvbmZpcm0nLFxuICAgIH0sXG4gIF0pO1xuXG4gIGlmIChjb25maXJtID09PSBmYWxzZSkge1xuICAgIGluZm8oeWVsbG93KCcgIOKaoCAgU2tpcHBpbmcgY2FyZXRha2VyIGdyb3VwIHVwZGF0ZS4nKSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKEpTT04uc3RyaW5naWZ5KHNlbGVjdGVkKSA9PT0gSlNPTi5zdHJpbmdpZnkoY3VycmVudCkpIHtcbiAgICBpbmZvKGdyZWVuKCcgIOKImiAgQ2FyZXRha2VyIGdyb3VwIGFscmVhZHkgdXAgdG8gZGF0ZS4nKSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBhd2FpdCBzZXRDYXJldGFrZXJHcm91cChjYXJldGFrZXJHcm91cCwgc2VsZWN0ZWQpO1xuICB9IGNhdGNoIHtcbiAgICBpbmZvKHJlZCgnICDinJggIEZhaWxlZCB0byB1cGRhdGUgY2FyZXRha2VyIGdyb3VwLicpKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaW5mbyhncmVlbignICDiiJogIFN1Y2Nlc3NmdWxseSB1cGRhdGVkIGNhcmV0YWtlciBncm91cCcpKTtcbn1cblxuLyoqIFJldHJpZXZlIHRoZSBjdXJyZW50IGxpc3Qgb2YgbWVtYmVycyBmb3IgdGhlIHByb3ZpZGVkIGdyb3VwLiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0R3JvdXBNZW1iZXJzKGdyb3VwOiBzdHJpbmcpIHtcbiAgLyoqIFRoZSBhdXRoZW50aWNhdGVkIEdpdENsaWVudCBpbnN0YW5jZS4gKi9cbiAgY29uc3QgZ2l0ID0gQXV0aGVudGljYXRlZEdpdENsaWVudC5nZXQoKTtcblxuICByZXR1cm4gKFxuICAgIGF3YWl0IGdpdC5naXRodWIudGVhbXMubGlzdE1lbWJlcnNJbk9yZyh7XG4gICAgICBvcmc6IGdpdC5yZW1vdGVDb25maWcub3duZXIsXG4gICAgICB0ZWFtX3NsdWc6IGdyb3VwLFxuICAgIH0pXG4gICkuZGF0YVxuICAgIC5maWx0ZXIoKF8pID0+ICEhXylcbiAgICAubWFwKChtZW1iZXIpID0+IG1lbWJlciEubG9naW4pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzZXRDYXJldGFrZXJHcm91cChncm91cDogc3RyaW5nLCBtZW1iZXJzOiBzdHJpbmdbXSkge1xuICAvKiogVGhlIGF1dGhlbnRpY2F0ZWQgR2l0Q2xpZW50IGluc3RhbmNlLiAqL1xuICBjb25zdCBnaXQgPSBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LmdldCgpO1xuICAvKiogVGhlIGZ1bGwgbmFtZSBvZiB0aGUgZ3JvdXAgPG9yZz4vPGdyb3VwIG5hbWU+LiAqL1xuICBjb25zdCBmdWxsU2x1ZyA9IGAke2dpdC5yZW1vdGVDb25maWcub3duZXJ9LyR7Z3JvdXB9YDtcbiAgLyoqIFRoZSBsaXN0IG9mIGN1cnJlbnQgbWVtYmVycyBvZiB0aGUgZ3JvdXAuICovXG4gIGNvbnN0IGN1cnJlbnQgPSBhd2FpdCBnZXRHcm91cE1lbWJlcnMoZ3JvdXApO1xuICAvKiogVGhlIGxpc3Qgb2YgdXNlcnMgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSBncm91cC4gKi9cbiAgY29uc3QgcmVtb3ZlZCA9IGN1cnJlbnQuZmlsdGVyKChsb2dpbikgPT4gIW1lbWJlcnMuaW5jbHVkZXMobG9naW4pKTtcbiAgLyoqIEFkZCBhIHVzZXIgdG8gdGhlIGdyb3VwLiAqL1xuICBjb25zdCBhZGQgPSBhc3luYyAodXNlcm5hbWU6IHN0cmluZykgPT4ge1xuICAgIGRlYnVnKGBBZGRpbmcgJHt1c2VybmFtZX0gdG8gJHtmdWxsU2x1Z30uYCk7XG4gICAgYXdhaXQgZ2l0LmdpdGh1Yi50ZWFtcy5hZGRPclVwZGF0ZU1lbWJlcnNoaXBGb3JVc2VySW5Pcmcoe1xuICAgICAgb3JnOiBnaXQucmVtb3RlQ29uZmlnLm93bmVyLFxuICAgICAgdGVhbV9zbHVnOiBncm91cCxcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgcm9sZTogJ21haW50YWluZXInLFxuICAgIH0pO1xuICB9O1xuICAvKiogUmVtb3ZlIGEgdXNlciBmcm9tIHRoZSBncm91cC4gKi9cbiAgY29uc3QgcmVtb3ZlID0gYXN5bmMgKHVzZXJuYW1lOiBzdHJpbmcpID0+IHtcbiAgICBkZWJ1ZyhgUmVtb3ZpbmcgJHt1c2VybmFtZX0gZnJvbSAke2Z1bGxTbHVnfS5gKTtcbiAgICBhd2FpdCBnaXQuZ2l0aHViLnRlYW1zLnJlbW92ZU1lbWJlcnNoaXBGb3JVc2VySW5Pcmcoe1xuICAgICAgb3JnOiBnaXQucmVtb3RlQ29uZmlnLm93bmVyLFxuICAgICAgdGVhbV9zbHVnOiBncm91cCxcbiAgICAgIHVzZXJuYW1lLFxuICAgIH0pO1xuICB9O1xuXG4gIGRlYnVnLmdyb3VwKGBDYXJldGFrZXIgR3JvdXA6ICR7ZnVsbFNsdWd9YCk7XG4gIGRlYnVnKGBDdXJyZW50IE1lbWJlcnNoaXA6ICR7Y3VycmVudC5qb2luKCcsICcpfWApO1xuICBkZWJ1ZyhgTmV3IE1lbWJlcnNoaXA6ICAgICAke21lbWJlcnMuam9pbignLCAnKX1gKTtcbiAgZGVidWcoYFJlbW92ZWQ6ICAgICAgICAgICAgJHtyZW1vdmVkLmpvaW4oJywgJyl9YCk7XG4gIGRlYnVnLmdyb3VwRW5kKCk7XG5cbiAgLy8gQWRkIG1lbWJlcnMgYmVmb3JlIHJlbW92aW5nIHRvIHByZXZlbnQgdGhlIGFjY291bnQgcGVyZm9ybWluZyB0aGUgYWN0aW9uIGZyb20gcmVtb3ZpbmcgdGhlaXJcbiAgLy8gcGVybWlzc2lvbnMgdG8gY2hhbmdlIHRoZSBncm91cCBtZW1iZXJzaGlwIGVhcmx5LlxuICBhd2FpdCBQcm9taXNlLmFsbChtZW1iZXJzLm1hcChhZGQpKTtcbiAgYXdhaXQgUHJvbWlzZS5hbGwocmVtb3ZlZC5tYXAocmVtb3ZlKSk7XG5cbiAgZGVidWcoYFN1Y2Nlc3NmdWx5IHVwZGF0ZWQgJHtmdWxsU2x1Z31gKTtcbn1cbiJdfQ==