/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/caretaker/handoff/update-github-team", ["require", "exports", "tslib", "inquirer", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/authenticated-git-client", "@angular/dev-infra-private/caretaker/config"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.updateCaretakerTeamViaPrompt = void 0;
    var tslib_1 = require("tslib");
    var inquirer_1 = require("inquirer");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var authenticated_git_client_1 = require("@angular/dev-infra-private/utils/git/authenticated-git-client");
    var config_1 = require("@angular/dev-infra-private/caretaker/config");
    /** Update the Github caretaker group, using a prompt to obtain the new caretaker group members.  */
    function updateCaretakerTeamViaPrompt() {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var caretakerConfig, current, roster, _a, 
            /** The list of users selected to be members of the caretaker group. */
            selected, 
            /** Whether the user positively confirmed the selected made. */
            confirm, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        caretakerConfig = config_1.getCaretakerConfig().caretaker;
                        if (caretakerConfig.caretakerGroup === undefined) {
                            throw Error('`caretakerGroup` is not defined in the `caretaker` config');
                        }
                        return [4 /*yield*/, getGroupMembers(caretakerConfig.caretakerGroup)];
                    case 1:
                        current = _c.sent();
                        return [4 /*yield*/, getGroupMembers(caretakerConfig.caretakerGroup + "-roster")];
                    case 2:
                        roster = _c.sent();
                        return [4 /*yield*/, inquirer_1.prompt([
                                {
                                    type: 'checkbox',
                                    choices: roster,
                                    message: 'Select 2 caretakers for the upcoming rotation:',
                                    default: current,
                                    name: 'selected',
                                    prefix: '',
                                    validate: function (selected) {
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
                            ])];
                    case 3:
                        _a = _c.sent(), selected = _a.selected, confirm = _a.confirm;
                        if (confirm === false) {
                            console_1.info(console_1.yellow('  ⚠  Skipping caretaker group update.'));
                            return [2 /*return*/];
                        }
                        if (JSON.stringify(selected) === JSON.stringify(current)) {
                            console_1.info(console_1.green('  √  Caretaker group already up to date.'));
                            return [2 /*return*/];
                        }
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, setCaretakerGroup(caretakerConfig.caretakerGroup, selected)];
                    case 5:
                        _c.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        _b = _c.sent();
                        console_1.info(console_1.red('  ✘  Failed to update caretaker group.'));
                        return [2 /*return*/];
                    case 7:
                        console_1.info(console_1.green('  √  Successfully updated caretaker group'));
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.updateCaretakerTeamViaPrompt = updateCaretakerTeamViaPrompt;
    /** Retrieve the current list of members for the provided group. */
    function getGroupMembers(group) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var git;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        git = authenticated_git_client_1.AuthenticatedGitClient.get();
                        return [4 /*yield*/, git.github.teams.listMembersInOrg({
                                org: git.remoteConfig.owner,
                                team_slug: group,
                            })];
                    case 1: return [2 /*return*/, (_a.sent())
                            .data.filter(function (_) { return !!_; })
                            .map(function (member) { return member.login; })];
                }
            });
        });
    }
    function setCaretakerGroup(group, members) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var git, fullSlug, current, removed, add, remove;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        git = authenticated_git_client_1.AuthenticatedGitClient.get();
                        fullSlug = git.remoteConfig.owner + "/" + group;
                        return [4 /*yield*/, getGroupMembers(group)];
                    case 1:
                        current = _a.sent();
                        removed = current.filter(function (login) { return !members.includes(login); });
                        add = function (username) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            return tslib_1.__generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        console_1.debug("Adding " + username + " to " + fullSlug + ".");
                                        return [4 /*yield*/, git.github.teams.addOrUpdateMembershipForUserInOrg({
                                                org: git.remoteConfig.owner,
                                                team_slug: group,
                                                username: username,
                                                role: 'maintainer',
                                            })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        remove = function (username) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            return tslib_1.__generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        console_1.debug("Removing " + username + " from " + fullSlug + ".");
                                        return [4 /*yield*/, git.github.teams.removeMembershipForUserInOrg({
                                                org: git.remoteConfig.owner,
                                                team_slug: group,
                                                username: username,
                                            })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        console_1.debug.group("Caretaker Group: " + fullSlug);
                        console_1.debug("Current Membership: " + current.join(', '));
                        console_1.debug("New Membership:     " + members.join(', '));
                        console_1.debug("Removed:            " + removed.join(', '));
                        console_1.debug.groupEnd();
                        // Add members before removing to prevent the account performing the action from removing their
                        // permissions to change the group membership early.
                        return [4 /*yield*/, Promise.all(members.map(add))];
                    case 2:
                        // Add members before removing to prevent the account performing the action from removing their
                        // permissions to change the group membership early.
                        _a.sent();
                        return [4 /*yield*/, Promise.all(removed.map(remove))];
                    case 3:
                        _a.sent();
                        console_1.debug("Successfuly updated " + fullSlug);
                        return [2 /*return*/];
                }
            });
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLWdpdGh1Yi10ZWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NhcmV0YWtlci9oYW5kb2ZmL3VwZGF0ZS1naXRodWItdGVhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgscUNBQWdDO0lBRWhDLG9FQUFvRTtJQUNwRSwwR0FBZ0Y7SUFDaEYsc0VBQTZDO0lBRTdDLG9HQUFvRztJQUNwRyxTQUFzQiw0QkFBNEI7Ozs7Ozs7Ozs7d0JBRTFDLGVBQWUsR0FBRywyQkFBa0IsRUFBRSxDQUFDLFNBQVMsQ0FBQzt3QkFFdkQsSUFBSSxlQUFlLENBQUMsY0FBYyxLQUFLLFNBQVMsRUFBRTs0QkFDaEQsTUFBTSxLQUFLLENBQUMsMkRBQTJELENBQUMsQ0FBQzt5QkFDMUU7d0JBR2UscUJBQU0sZUFBZSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsRUFBQTs7d0JBQS9ELE9BQU8sR0FBRyxTQUFxRDt3QkFFdEQscUJBQU0sZUFBZSxDQUFJLGVBQWUsQ0FBQyxjQUFjLFlBQVMsQ0FBQyxFQUFBOzt3QkFBMUUsTUFBTSxHQUFHLFNBQWlFO3dCQU81RSxxQkFBTSxpQkFBTSxDQUFDO2dDQUNYO29DQUNFLElBQUksRUFBRSxVQUFVO29DQUNoQixPQUFPLEVBQUUsTUFBTTtvQ0FDZixPQUFPLEVBQUUsZ0RBQWdEO29DQUN6RCxPQUFPLEVBQUUsT0FBTztvQ0FDaEIsSUFBSSxFQUFFLFVBQVU7b0NBQ2hCLE1BQU0sRUFBRSxFQUFFO29DQUNWLFFBQVEsRUFBRSxVQUFDLFFBQWtCO3dDQUMzQixJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOzRDQUN6QixPQUFPLCtEQUErRCxDQUFDO3lDQUN4RTt3Q0FDRCxPQUFPLElBQUksQ0FBQztvQ0FDZCxDQUFDO2lDQUNGO2dDQUNEO29DQUNFLElBQUksRUFBRSxTQUFTO29DQUNmLE9B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QVksQ0FBQyxLQUFLO2dEQUMzQixTQUFTLEVBQUUsS0FBSztnREFDaEIsUUFBUSxVQUFBOzZDQUNULENBQUMsRUFBQTs7d0NBSkYsU0FJRSxDQUFDOzs7OzZCQUNKLENBQUM7d0JBRUYsZUFBSyxDQUFDLEtBQUssQ0FBQyxzQkFBb0IsUUFBVSxDQUFDLENBQUM7d0JBQzVDLGVBQUssQ0FBQyx5QkFBdUIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUcsQ0FBQyxDQUFDO3dCQUNuRCxlQUFLLENBQUMseUJBQXVCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFHLENBQUMsQ0FBQzt3QkFDbkQsZUFBSyxDQUFDLHlCQUF1QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBRyxDQUFDLENBQUM7d0JBQ25ELGVBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQzt3QkFFakIsK0ZBQStGO3dCQUMvRixvREFBb0Q7d0JBQ3BELHFCQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFBOzt3QkFGbkMsK0ZBQStGO3dCQUMvRixvREFBb0Q7d0JBQ3BELFNBQW1DLENBQUM7d0JBQ3BDLHFCQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFBOzt3QkFBdEMsU0FBc0MsQ0FBQzt3QkFFdkMsZUFBSyxDQUFDLHlCQUF1QixRQUFVLENBQUMsQ0FBQzs7Ozs7S0FDMUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtwcm9tcHR9IGZyb20gJ2lucXVpcmVyJztcblxuaW1wb3J0IHtkZWJ1ZywgZ3JlZW4sIGluZm8sIHJlZCwgeWVsbG93fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2F1dGhlbnRpY2F0ZWQtZ2l0LWNsaWVudCc7XG5pbXBvcnQge2dldENhcmV0YWtlckNvbmZpZ30gZnJvbSAnLi4vY29uZmlnJztcblxuLyoqIFVwZGF0ZSB0aGUgR2l0aHViIGNhcmV0YWtlciBncm91cCwgdXNpbmcgYSBwcm9tcHQgdG8gb2J0YWluIHRoZSBuZXcgY2FyZXRha2VyIGdyb3VwIG1lbWJlcnMuICAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZUNhcmV0YWtlclRlYW1WaWFQcm9tcHQoKSB7XG4gIC8qKiBDYXJldGFrZXIgc3BlY2lmaWMgY29uZmlndXJhdGlvbi4gKi9cbiAgY29uc3QgY2FyZXRha2VyQ29uZmlnID0gZ2V0Q2FyZXRha2VyQ29uZmlnKCkuY2FyZXRha2VyO1xuXG4gIGlmIChjYXJldGFrZXJDb25maWcuY2FyZXRha2VyR3JvdXAgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IEVycm9yKCdgY2FyZXRha2VyR3JvdXBgIGlzIG5vdCBkZWZpbmVkIGluIHRoZSBgY2FyZXRha2VyYCBjb25maWcnKTtcbiAgfVxuXG4gIC8qKiBUaGUgbGlzdCBvZiBjdXJyZW50IG1lbWJlcnMgaW4gdGhlIGdyb3VwLiAqL1xuICBjb25zdCBjdXJyZW50ID0gYXdhaXQgZ2V0R3JvdXBNZW1iZXJzKGNhcmV0YWtlckNvbmZpZy5jYXJldGFrZXJHcm91cCk7XG4gIC8qKiBUaGUgbGlzdCBvZiBtZW1iZXJzIGFibGUgdG8gYmUgYWRkZWQgdG8gdGhlIGdyb3VwIGFzIGRlZmluZWQgYnkgYSBzZXBhcmF0ZSByb3N0ZXIgZ3JvdXAuICovXG4gIGNvbnN0IHJvc3RlciA9IGF3YWl0IGdldEdyb3VwTWVtYmVycyhgJHtjYXJldGFrZXJDb25maWcuY2FyZXRha2VyR3JvdXB9LXJvc3RlcmApO1xuICBjb25zdCB7XG4gICAgLyoqIFRoZSBsaXN0IG9mIHVzZXJzIHNlbGVjdGVkIHRvIGJlIG1lbWJlcnMgb2YgdGhlIGNhcmV0YWtlciBncm91cC4gKi9cbiAgICBzZWxlY3RlZCxcbiAgICAvKiogV2hldGhlciB0aGUgdXNlciBwb3NpdGl2ZWx5IGNvbmZpcm1lZCB0aGUgc2VsZWN0ZWQgbWFkZS4gKi9cbiAgICBjb25maXJtXG4gIH0gPVxuICAgICAgYXdhaXQgcHJvbXB0KFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgICAgY2hvaWNlczogcm9zdGVyLFxuICAgICAgICAgIG1lc3NhZ2U6ICdTZWxlY3QgMiBjYXJldGFrZXJzIGZvciB0aGUgdXBjb21pbmcgcm90YXRpb246JyxcbiAgICAgICAgICBkZWZhdWx0OiBjdXJyZW50LFxuICAgICAgICAgIG5hbWU6ICdzZWxlY3RlZCcsXG4gICAgICAgICAgcHJlZml4OiAnJyxcbiAgICAgICAgICB2YWxpZGF0ZTogKHNlbGVjdGVkOiBzdHJpbmdbXSkgPT4ge1xuICAgICAgICAgICAgaWYgKHNlbGVjdGVkLmxlbmd0aCAhPT0gMikge1xuICAgICAgICAgICAgICByZXR1cm4gJ1BsZWFzZSBzZWxlY3QgZXhhY3RseSAyIGNhcmV0YWtlcnMgZm9yIHRoZSB1cGNvbWluZyByb3RhdGlvbi4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdjb25maXJtJyxcbiAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICAgIHByZWZpeDogJycsXG4gICAgICAgICAgbWVzc2FnZTogJ0FyZSB5b3Ugc3VyZT8nLFxuICAgICAgICAgIG5hbWU6ICdjb25maXJtJyxcbiAgICAgICAgfVxuICAgICAgXSk7XG5cbiAgaWYgKGNvbmZpcm0gPT09IGZhbHNlKSB7XG4gICAgaW5mbyh5ZWxsb3coJyAg4pqgICBTa2lwcGluZyBjYXJldGFrZXIgZ3JvdXAgdXBkYXRlLicpKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoSlNPTi5zdHJpbmdpZnkoc2VsZWN0ZWQpID09PSBKU09OLnN0cmluZ2lmeShjdXJyZW50KSkge1xuICAgIGluZm8oZ3JlZW4oJyAg4oiaICBDYXJldGFrZXIgZ3JvdXAgYWxyZWFkeSB1cCB0byBkYXRlLicpKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0cnkge1xuICAgIGF3YWl0IHNldENhcmV0YWtlckdyb3VwKGNhcmV0YWtlckNvbmZpZy5jYXJldGFrZXJHcm91cCwgc2VsZWN0ZWQpO1xuICB9IGNhdGNoIHtcbiAgICBpbmZvKHJlZCgnICDinJggIEZhaWxlZCB0byB1cGRhdGUgY2FyZXRha2VyIGdyb3VwLicpKTtcbiAgICByZXR1cm47XG4gIH1cbiAgaW5mbyhncmVlbignICDiiJogIFN1Y2Nlc3NmdWxseSB1cGRhdGVkIGNhcmV0YWtlciBncm91cCcpKTtcbn1cblxuXG4vKiogUmV0cmlldmUgdGhlIGN1cnJlbnQgbGlzdCBvZiBtZW1iZXJzIGZvciB0aGUgcHJvdmlkZWQgZ3JvdXAuICovXG5hc3luYyBmdW5jdGlvbiBnZXRHcm91cE1lbWJlcnMoZ3JvdXA6IHN0cmluZykge1xuICAvKiogVGhlIGF1dGhlbnRpY2F0ZWQgR2l0Q2xpZW50IGluc3RhbmNlLiAqL1xuICBjb25zdCBnaXQgPSBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LmdldCgpO1xuXG4gIHJldHVybiAoYXdhaXQgZ2l0LmdpdGh1Yi50ZWFtcy5saXN0TWVtYmVyc0luT3JnKHtcbiAgICAgICAgICAgb3JnOiBnaXQucmVtb3RlQ29uZmlnLm93bmVyLFxuICAgICAgICAgICB0ZWFtX3NsdWc6IGdyb3VwLFxuICAgICAgICAgfSkpXG4gICAgICAuZGF0YS5maWx0ZXIoXyA9PiAhIV8pXG4gICAgICAubWFwKG1lbWJlciA9PiBtZW1iZXIhLmxvZ2luKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2V0Q2FyZXRha2VyR3JvdXAoZ3JvdXA6IHN0cmluZywgbWVtYmVyczogc3RyaW5nW10pIHtcbiAgLyoqIFRoZSBhdXRoZW50aWNhdGVkIEdpdENsaWVudCBpbnN0YW5jZS4gKi9cbiAgY29uc3QgZ2l0ID0gQXV0aGVudGljYXRlZEdpdENsaWVudC5nZXQoKTtcbiAgLyoqIFRoZSBmdWxsIG5hbWUgb2YgdGhlIGdyb3VwIDxvcmc+Lzxncm91cCBuYW1lPi4gKi9cbiAgY29uc3QgZnVsbFNsdWcgPSBgJHtnaXQucmVtb3RlQ29uZmlnLm93bmVyfS8ke2dyb3VwfWA7XG4gIC8qKiBUaGUgbGlzdCBvZiBjdXJyZW50IG1lbWJlcnMgb2YgdGhlIGdyb3VwLiAqL1xuICBjb25zdCBjdXJyZW50ID0gYXdhaXQgZ2V0R3JvdXBNZW1iZXJzKGdyb3VwKTtcbiAgLyoqIFRoZSBsaXN0IG9mIHVzZXJzIHRvIGJlIHJlbW92ZWQgZnJvbSB0aGUgZ3JvdXAuICovXG4gIGNvbnN0IHJlbW92ZWQgPSBjdXJyZW50LmZpbHRlcihsb2dpbiA9PiAhbWVtYmVycy5pbmNsdWRlcyhsb2dpbikpO1xuICAvKiogQWRkIGEgdXNlciB0byB0aGUgZ3JvdXAuICovXG4gIGNvbnN0IGFkZCA9IGFzeW5jICh1c2VybmFtZTogc3RyaW5nKSA9PiB7XG4gICAgZGVidWcoYEFkZGluZyAke3VzZXJuYW1lfSB0byAke2Z1bGxTbHVnfS5gKTtcbiAgICBhd2FpdCBnaXQuZ2l0aHViLnRlYW1zLmFkZE9yVXBkYXRlTWVtYmVyc2hpcEZvclVzZXJJbk9yZyh7XG4gICAgICBvcmc6IGdpdC5yZW1vdGVDb25maWcub3duZXIsXG4gICAgICB0ZWFtX3NsdWc6IGdyb3VwLFxuICAgICAgdXNlcm5hbWUsXG4gICAgICByb2xlOiAnbWFpbnRhaW5lcicsXG4gICAgfSk7XG4gIH07XG4gIC8qKiBSZW1vdmUgYSB1c2VyIGZyb20gdGhlIGdyb3VwLiAqL1xuICBjb25zdCByZW1vdmUgPSBhc3luYyAodXNlcm5hbWU6IHN0cmluZykgPT4ge1xuICAgIGRlYnVnKGBSZW1vdmluZyAke3VzZXJuYW1lfSBmcm9tICR7ZnVsbFNsdWd9LmApO1xuICAgIGF3YWl0IGdpdC5naXRodWIudGVhbXMucmVtb3ZlTWVtYmVyc2hpcEZvclVzZXJJbk9yZyh7XG4gICAgICBvcmc6IGdpdC5yZW1vdGVDb25maWcub3duZXIsXG4gICAgICB0ZWFtX3NsdWc6IGdyb3VwLFxuICAgICAgdXNlcm5hbWUsXG4gICAgfSk7XG4gIH07XG5cbiAgZGVidWcuZ3JvdXAoYENhcmV0YWtlciBHcm91cDogJHtmdWxsU2x1Z31gKTtcbiAgZGVidWcoYEN1cnJlbnQgTWVtYmVyc2hpcDogJHtjdXJyZW50LmpvaW4oJywgJyl9YCk7XG4gIGRlYnVnKGBOZXcgTWVtYmVyc2hpcDogICAgICR7bWVtYmVycy5qb2luKCcsICcpfWApO1xuICBkZWJ1ZyhgUmVtb3ZlZDogICAgICAgICAgICAke3JlbW92ZWQuam9pbignLCAnKX1gKTtcbiAgZGVidWcuZ3JvdXBFbmQoKTtcblxuICAvLyBBZGQgbWVtYmVycyBiZWZvcmUgcmVtb3ZpbmcgdG8gcHJldmVudCB0aGUgYWNjb3VudCBwZXJmb3JtaW5nIHRoZSBhY3Rpb24gZnJvbSByZW1vdmluZyB0aGVpclxuICAvLyBwZXJtaXNzaW9ucyB0byBjaGFuZ2UgdGhlIGdyb3VwIG1lbWJlcnNoaXAgZWFybHkuXG4gIGF3YWl0IFByb21pc2UuYWxsKG1lbWJlcnMubWFwKGFkZCkpO1xuICBhd2FpdCBQcm9taXNlLmFsbChyZW1vdmVkLm1hcChyZW1vdmUpKTtcblxuICBkZWJ1ZyhgU3VjY2Vzc2Z1bHkgdXBkYXRlZCAke2Z1bGxTbHVnfWApO1xufVxuIl19