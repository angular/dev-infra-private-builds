"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseTool = exports.CompletionState = void 0;
const inquirer_1 = require("inquirer");
const console_1 = require("../../utils/console");
const active_release_trains_1 = require("../versioning/active-release-trains");
const npm_publish_1 = require("../versioning/npm-publish");
const print_active_trains_1 = require("../versioning/print-active-trains");
const version_branches_1 = require("../versioning/version-branches");
const actions_error_1 = require("./actions-error");
const index_1 = require("./actions/index");
const version_check_1 = require("../../utils/version-check");
var CompletionState;
(function (CompletionState) {
    CompletionState[CompletionState["SUCCESS"] = 0] = "SUCCESS";
    CompletionState[CompletionState["FATAL_ERROR"] = 1] = "FATAL_ERROR";
    CompletionState[CompletionState["MANUALLY_ABORTED"] = 2] = "MANUALLY_ABORTED";
})(CompletionState = exports.CompletionState || (exports.CompletionState = {}));
class ReleaseTool {
    constructor(_git, _config, _github, _projectRoot) {
        this._git = _git;
        this._config = _config;
        this._github = _github;
        this._projectRoot = _projectRoot;
        /** The previous git commit to return back to after the release tool runs. */
        this.previousGitBranchOrRevision = this._git.getCurrentBranchOrRevision();
    }
    /** Runs the interactive release tool. */
    async run() {
        (0, console_1.log)();
        (0, console_1.log)((0, console_1.yellow)('--------------------------------------------'));
        (0, console_1.log)((0, console_1.yellow)('  Angular Dev-Infra release staging script'));
        (0, console_1.log)((0, console_1.yellow)('--------------------------------------------'));
        (0, console_1.log)();
        const { owner, name } = this._github;
        const nextBranchName = (0, version_branches_1.getNextBranchName)(this._github);
        if (!(await this._verifyNoUncommittedChanges()) ||
            !(await this._verifyRunningFromNextBranch(nextBranchName)) ||
            !(await this._verifyNoShallowRepository()) ||
            !(await (0, version_check_1.verifyNgDevToolIsUpToDate)(this._projectRoot))) {
            return CompletionState.FATAL_ERROR;
        }
        if (!(await this._verifyNpmLoginState())) {
            return CompletionState.MANUALLY_ABORTED;
        }
        // Set the environment variable to skip all git commit hooks triggered by husky. We are unable to
        // rely on `--no-verify` as some hooks still run, notably the `prepare-commit-msg` hook.
        // Running hooks has the downside of potentially running code (like the `ng-dev` tool) when a version
        // branch is checked out, but the node modules are not re-installed. The tool switches branches
        // multiple times per execution, and it is not desirable re-running Yarn all the time.
        process.env['HUSKY'] = '0';
        const repo = { owner, name, api: this._git.github, nextBranchName };
        const releaseTrains = await (0, active_release_trains_1.fetchActiveReleaseTrains)(repo);
        // Print the active release trains so that the caretaker can access
        // the current project branching state without switching context.
        await (0, print_active_trains_1.printActiveReleaseTrains)(releaseTrains, this._config);
        const action = await this._promptForReleaseAction(releaseTrains);
        try {
            await action.perform();
        }
        catch (e) {
            if (e instanceof actions_error_1.UserAbortedReleaseActionError) {
                return CompletionState.MANUALLY_ABORTED;
            }
            // Only print the error message and stack if the error is not a known fatal release
            // action error (for which we print the error gracefully to the console with colors).
            if (!(e instanceof actions_error_1.FatalReleaseActionError) && e instanceof Error) {
                console.error(e);
            }
            return CompletionState.FATAL_ERROR;
        }
        finally {
            await this.cleanup();
        }
        return CompletionState.SUCCESS;
    }
    /** Run post release tool cleanups. */
    async cleanup() {
        // Return back to the git state from before the release tool ran.
        this._git.checkout(this.previousGitBranchOrRevision, true);
        // Ensure log out of NPM.
        await (0, npm_publish_1.npmLogout)(this._config.publishRegistry);
    }
    /** Prompts the caretaker for a release action that should be performed. */
    async _promptForReleaseAction(activeTrains) {
        const choices = [];
        // Find and instantiate all release actions which are currently valid.
        for (let actionType of index_1.actions) {
            if (await actionType.isActive(activeTrains, this._config)) {
                const action = new actionType(activeTrains, this._git, this._config, this._projectRoot);
                choices.push({ name: await action.getDescription(), value: action });
            }
        }
        (0, console_1.info)('Please select the type of release you want to perform.');
        const { releaseAction } = await (0, inquirer_1.prompt)({
            name: 'releaseAction',
            message: 'Please select an action:',
            type: 'list',
            choices,
        });
        return releaseAction;
    }
    /**
     * Verifies that there are no uncommitted changes in the project.
     * @returns a boolean indicating success or failure.
     */
    async _verifyNoUncommittedChanges() {
        if (this._git.hasUncommittedChanges()) {
            (0, console_1.error)((0, console_1.red)('  ✘   There are changes which are not committed and should be discarded.'));
            return false;
        }
        return true;
    }
    /**
     * Verifies that the local repository is not configured as shallow.
     * @returns a boolean indicating success or failure.
     */
    async _verifyNoShallowRepository() {
        if (this._git.isShallowRepo()) {
            (0, console_1.error)((0, console_1.red)('  ✘   The local repository is configured as shallow.'));
            (0, console_1.error)((0, console_1.red)(`      Please convert the repository to a complete one by syncing with upstream.`));
            (0, console_1.error)((0, console_1.red)(`      https://git-scm.com/docs/git-fetch#Documentation/git-fetch.txt---unshallow`));
            return false;
        }
        return true;
    }
    /**
     * Verifies that the next branch from the configured repository is checked out.
     * @returns a boolean indicating success or failure.
     */
    async _verifyRunningFromNextBranch(nextBranchName) {
        const headSha = this._git.run(['rev-parse', 'HEAD']).stdout.trim();
        const { data } = await this._git.github.repos.getBranch({
            ...this._git.remoteParams,
            branch: this._git.mainBranchName,
        });
        if (headSha !== data.commit.sha) {
            (0, console_1.error)((0, console_1.red)('  ✘   Running release tool from an outdated local branch.'));
            (0, console_1.error)((0, console_1.red)(`      Please make sure you are running from the "${nextBranchName}" branch.`));
            return false;
        }
        return true;
    }
    /**
     * Verifies that the user is logged into NPM at the correct registry, if defined for the release.
     * @returns a boolean indicating whether the user is logged into NPM.
     */
    async _verifyNpmLoginState() {
        const registry = `NPM at the ${this._config.publishRegistry ?? 'default NPM'} registry`;
        // TODO(josephperrott): remove wombat specific block once wombot allows `npm whoami` check to
        // check the status of the local token in the .npmrc file.
        if (this._config.publishRegistry?.includes('wombat-dressing-room.appspot.com')) {
            (0, console_1.info)('Unable to determine NPM login state for wombat proxy, requiring login now.');
            try {
                await (0, npm_publish_1.npmLogin)(this._config.publishRegistry);
            }
            catch {
                return false;
            }
            return true;
        }
        if (await (0, npm_publish_1.npmIsLoggedIn)(this._config.publishRegistry)) {
            (0, console_1.debug)(`Already logged into ${registry}.`);
            return true;
        }
        (0, console_1.error)((0, console_1.red)(`  ✘   Not currently logged into ${registry}.`));
        const shouldLogin = await (0, console_1.promptConfirm)('Would you like to log into NPM now?');
        if (shouldLogin) {
            (0, console_1.debug)('Starting NPM login.');
            try {
                await (0, npm_publish_1.npmLogin)(this._config.publishRegistry);
            }
            catch {
                return false;
            }
            return true;
        }
        return false;
    }
}
exports.ReleaseTool = ReleaseTool;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS9wdWJsaXNoL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILHVDQUFtRDtBQUduRCxpREFBd0Y7QUFHeEYsK0VBQWtHO0FBQ2xHLDJEQUE2RTtBQUM3RSwyRUFBMkU7QUFDM0UscUVBQXFGO0FBR3JGLG1EQUF1RjtBQUN2RiwyQ0FBd0M7QUFDeEMsNkRBQW9FO0FBRXBFLElBQVksZUFJWDtBQUpELFdBQVksZUFBZTtJQUN6QiwyREFBTyxDQUFBO0lBQ1AsbUVBQVcsQ0FBQTtJQUNYLDZFQUFnQixDQUFBO0FBQ2xCLENBQUMsRUFKVyxlQUFlLEdBQWYsdUJBQWUsS0FBZix1QkFBZSxRQUkxQjtBQUVELE1BQWEsV0FBVztJQUl0QixZQUNZLElBQTRCLEVBQzVCLE9BQXNCLEVBQ3RCLE9BQXFCLEVBQ3JCLFlBQW9CO1FBSHBCLFNBQUksR0FBSixJQUFJLENBQXdCO1FBQzVCLFlBQU8sR0FBUCxPQUFPLENBQWU7UUFDdEIsWUFBTyxHQUFQLE9BQU8sQ0FBYztRQUNyQixpQkFBWSxHQUFaLFlBQVksQ0FBUTtRQVBoQyw2RUFBNkU7UUFDckUsZ0NBQTJCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0lBTzFFLENBQUM7SUFFSix5Q0FBeUM7SUFDekMsS0FBSyxDQUFDLEdBQUc7UUFDUCxJQUFBLGFBQUcsR0FBRSxDQUFDO1FBQ04sSUFBQSxhQUFHLEVBQUMsSUFBQSxnQkFBTSxFQUFDLDhDQUE4QyxDQUFDLENBQUMsQ0FBQztRQUM1RCxJQUFBLGFBQUcsRUFBQyxJQUFBLGdCQUFNLEVBQUMsNENBQTRDLENBQUMsQ0FBQyxDQUFDO1FBQzFELElBQUEsYUFBRyxFQUFDLElBQUEsZ0JBQU0sRUFBQyw4Q0FBOEMsQ0FBQyxDQUFDLENBQUM7UUFDNUQsSUFBQSxhQUFH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LE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxJQUFJLE1BQU0sSUFBQSwyQkFBYSxFQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUU7WUFDckQsSUFBQSxlQUFLLEVBQUMsdUJBQXVCLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDMUMsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELElBQUEsZUFBSyxFQUFDLElBQUEsYUFBRyxFQUFDLG1DQUFtQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDM0QsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFBLHVCQUFhLEVBQUMscUNBQXFDLENBQUMsQ0FBQztRQUMvRSxJQUFJLFdBQVcsRUFBRTtZQUNmLElBQUEsZUFBSyxFQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDN0IsSUFBSTtnQkFDRixNQUFNLElBQUEsc0JBQVEsRUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2FBQzlDO1lBQUMsTUFBTTtnQkFDTixPQUFPLEtBQUssQ0FBQzthQUNkO1lBQ0QsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztDQUNGO0FBNUxELGtDQTRMQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0xpc3RDaG9pY2VPcHRpb25zLCBwcm9tcHR9IGZyb20gJ2lucXVpcmVyJztcblxuaW1wb3J0IHtHaXRodWJDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2RlYnVnLCBlcnJvciwgaW5mbywgbG9nLCBwcm9tcHRDb25maXJtLCByZWQsIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHtSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zLCBmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7bnBtSXNMb2dnZWRJbiwgbnBtTG9naW4sIG5wbUxvZ291dH0gZnJvbSAnLi4vdmVyc2lvbmluZy9ucG0tcHVibGlzaCc7XG5pbXBvcnQge3ByaW50QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vdmVyc2lvbmluZy9wcmludC1hY3RpdmUtdHJhaW5zJztcbmltcG9ydCB7Z2V0TmV4dEJyYW5jaE5hbWUsIFJlbGVhc2VSZXBvV2l0aEFwaX0gZnJvbSAnLi4vdmVyc2lvbmluZy92ZXJzaW9uLWJyYW5jaGVzJztcblxuaW1wb3J0IHtSZWxlYXNlQWN0aW9ufSBmcm9tICcuL2FjdGlvbnMnO1xuaW1wb3J0IHtGYXRhbFJlbGVhc2VBY3Rpb25FcnJvciwgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3J9IGZyb20gJy4vYWN0aW9ucy1lcnJvcic7XG5pbXBvcnQge2FjdGlvbnN9IGZyb20gJy4vYWN0aW9ucy9pbmRleCc7XG5pbXBvcnQge3ZlcmlmeU5nRGV2VG9vbElzVXBUb0RhdGV9IGZyb20gJy4uLy4uL3V0aWxzL3ZlcnNpb24tY2hlY2snO1xuXG5leHBvcnQgZW51bSBDb21wbGV0aW9uU3RhdGUge1xuICBTVUNDRVNTLFxuICBGQVRBTF9FUlJPUixcbiAgTUFOVUFMTFlfQUJPUlRFRCxcbn1cblxuZXhwb3J0IGNsYXNzIFJlbGVhc2VUb29sIHtcbiAgLyoqIFRoZSBwcmV2aW91cyBnaXQgY29tbWl0IHRvIHJldHVybiBiYWNrIHRvIGFmdGVyIHRoZSByZWxlYXNlIHRvb2wgcnVucy4gKi9cbiAgcHJpdmF0ZSBwcmV2aW91c0dpdEJyYW5jaE9yUmV2aXNpb24gPSB0aGlzLl9naXQuZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcm90ZWN0ZWQgX2dpdDogQXV0aGVudGljYXRlZEdpdENsaWVudCxcbiAgICBwcm90ZWN0ZWQgX2NvbmZpZzogUmVsZWFzZUNvbmZpZyxcbiAgICBwcm90ZWN0ZWQgX2dpdGh1YjogR2l0aHViQ29uZmlnLFxuICAgIHByb3RlY3RlZCBfcHJvamVjdFJvb3Q6IHN0cmluZyxcbiAgKSB7fVxuXG4gIC8qKiBSdW5zIHRoZSBpbnRlcmFjdGl2ZSByZWxlYXNlIHRvb2wuICovXG4gIGFzeW5jIHJ1bigpOiBQcm9taXNlPENvbXBsZXRpb25TdGF0ZT4ge1xuICAgIGxvZygpO1xuICAgIGxvZyh5ZWxsb3coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJykpO1xuICAgIGxvZyh5ZWxsb3coJyAgQW5ndWxhciBEZXYtSW5mcmEgcmVsZWFzZSBzdGFnaW5nIHNjcmlwdCcpKTtcbiAgICBsb2coeWVsbG93KCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpKTtcbiAgICBsb2coKTtcblxuICAgIGNvbnN0IHtvd25lciwgbmFtZX0gPSB0aGlzLl9naXRodWI7XG4gICAgY29uc3QgbmV4dEJyYW5jaE5hbWUgPSBnZXROZXh0QnJhbmNoTmFtZSh0aGlzLl9naXRodWIpO1xuXG4gICAgaWYgKFxuICAgICAgIShhd2FpdCB0aGlzLl92ZXJpZnlOb1VuY29tbWl0dGVkQ2hhbmdlcygpKSB8fFxuICAgICAgIShhd2FpdCB0aGlzLl92ZXJpZnlSdW5uaW5nRnJvbU5leHRCcmFuY2gobmV4dEJyYW5jaE5hbWUpKSB8fFxuICAgICAgIShhd2FpdCB0aGlzLl92ZXJpZnlOb1NoYWxsb3dSZXBvc2l0b3J5KCkpIHx8XG4gICAgICAhKGF3YWl0IHZlcmlmeU5nRGV2VG9vbElzVXBUb0RhdGUodGhpcy5fcHJvamVjdFJvb3QpKVxuICAgICkge1xuICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5GQVRBTF9FUlJPUjtcbiAgICB9XG5cbiAgICBpZiAoIShhd2FpdCB0aGlzLl92ZXJpZnlOcG1Mb2dpblN0YXRlKCkpKSB7XG4gICAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLk1BTlVBTExZX0FCT1JURUQ7XG4gICAgfVxuXG4gICAgLy8gU2V0IHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZSB0byBza2lwIGFsbCBnaXQgY29tbWl0IGhvb2tzIHRyaWdnZXJlZCBieSBodXNreS4gV2UgYXJlIHVuYWJsZSB0b1xuICAgIC8vIHJlbHkgb24gYC0tbm8tdmVyaWZ5YCBhcyBzb21lIGhvb2tzIHN0aWxsIHJ1biwgbm90YWJseSB0aGUgYHByZXBhcmUtY29tbWl0LW1zZ2AgaG9vay5cbiAgICAvLyBSdW5uaW5nIGhvb2tzIGhhcyB0aGUgZG93bnNpZGUgb2YgcG90ZW50aWFsbHkgcnVubmluZyBjb2RlIChsaWtlIHRoZSBgbmctZGV2YCB0b29sKSB3aGVuIGEgdmVyc2lvblxuICAgIC8vIGJyYW5jaCBpcyBjaGVja2VkIG91dCwgYnV0IHRoZSBub2RlIG1vZHVsZXMgYXJlIG5vdCByZS1pbnN0YWxsZWQuIFRoZSB0b29sIHN3aXRjaGVzIGJyYW5jaGVzXG4gICAgLy8gbXVsdGlwbGUgdGltZXMgcGVyIGV4ZWN1dGlvbiwgYW5kIGl0IGlzIG5vdCBkZXNpcmFibGUgcmUtcnVubmluZyBZYXJuIGFsbCB0aGUgdGltZS5cbiAgICBwcm9jZXNzLmVudlsnSFVTS1knXSA9ICcwJztcblxuICAgIGNvbnN0IHJlcG86IFJlbGVhc2VSZXBvV2l0aEFwaSA9IHtvd25lciwgbmFtZSwgYXBpOiB0aGlzLl9naXQuZ2l0aHViLCBuZXh0QnJhbmNoTmFtZX07XG4gICAgY29uc3QgcmVsZWFzZVRyYWlucyA9IGF3YWl0IGZldGNoQWN0aXZlUmVsZWFzZVRyYWlucyhyZXBvKTtcblxuICAgIC8vIFByaW50IHRoZSBhY3RpdmUgcmVsZWFzZSB0cmFpbnMgc28gdGhhdCB0aGUgY2FyZXRha2VyIGNhbiBhY2Nlc3NcbiAgICAvLyB0aGUgY3VycmVudCBwcm9qZWN0IGJyYW5jaGluZyBzdGF0ZSB3aXRob3V0IHN3aXRjaGluZyBjb250ZXh0LlxuICAgIGF3YWl0IHByaW50QWN0aXZlUmVsZWFzZVRyYWlucyhyZWxlYXNlVHJhaW5zLCB0aGlzLl9jb25maWcpO1xuXG4gICAgY29uc3QgYWN0aW9uID0gYXdhaXQgdGhpcy5fcHJvbXB0Rm9yUmVsZWFzZUFjdGlvbihyZWxlYXNlVHJhaW5zKTtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBhY3Rpb24ucGVyZm9ybSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlIGluc3RhbmNlb2YgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5NQU5VQUxMWV9BQk9SVEVEO1xuICAgICAgfVxuICAgICAgLy8gT25seSBwcmludCB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgc3RhY2sgaWYgdGhlIGVycm9yIGlzIG5vdCBhIGtub3duIGZhdGFsIHJlbGVhc2VcbiAgICAgIC8vIGFjdGlvbiBlcnJvciAoZm9yIHdoaWNoIHdlIHByaW50IHRoZSBlcnJvciBncmFjZWZ1bGx5IHRvIHRoZSBjb25zb2xlIHdpdGggY29sb3JzKS5cbiAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcikgJiYgZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLkZBVEFMX0VSUk9SO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBhd2FpdCB0aGlzLmNsZWFudXAoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLlNVQ0NFU1M7XG4gIH1cblxuICAvKiogUnVuIHBvc3QgcmVsZWFzZSB0b29sIGNsZWFudXBzLiAqL1xuICBwcml2YXRlIGFzeW5jIGNsZWFudXAoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gUmV0dXJuIGJhY2sgdG8gdGhlIGdpdCBzdGF0ZSBmcm9tIGJlZm9yZSB0aGUgcmVsZWFzZSB0b29sIHJhbi5cbiAgICB0aGlzLl9naXQuY2hlY2tvdXQodGhpcy5wcmV2aW91c0dpdEJyYW5jaE9yUmV2aXNpb24sIHRydWUpO1xuICAgIC8vIEVuc3VyZSBsb2cgb3V0IG9mIE5QTS5cbiAgICBhd2FpdCBucG1Mb2dvdXQodGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSk7XG4gIH1cblxuICAvKiogUHJvbXB0cyB0aGUgY2FyZXRha2VyIGZvciBhIHJlbGVhc2UgYWN0aW9uIHRoYXQgc2hvdWxkIGJlIHBlcmZvcm1lZC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfcHJvbXB0Rm9yUmVsZWFzZUFjdGlvbihhY3RpdmVUcmFpbnM6IEFjdGl2ZVJlbGVhc2VUcmFpbnMpIHtcbiAgICBjb25zdCBjaG9pY2VzOiBMaXN0Q2hvaWNlT3B0aW9uc1tdID0gW107XG5cbiAgICAvLyBGaW5kIGFuZCBpbnN0YW50aWF0ZSBhbGwgcmVsZWFzZSBhY3Rpb25zIHdoaWNoIGFyZSBjdXJyZW50bHkgdmFsaWQuXG4gICAgZm9yIChsZXQgYWN0aW9uVHlwZSBvZiBhY3Rpb25zKSB7XG4gICAgICBpZiAoYXdhaXQgYWN0aW9uVHlwZS5pc0FjdGl2ZShhY3RpdmVUcmFpbnMsIHRoaXMuX2NvbmZpZykpIHtcbiAgICAgICAgY29uc3QgYWN0aW9uOiBSZWxlYXNlQWN0aW9uID0gbmV3IGFjdGlvblR5cGUoXG4gICAgICAgICAgYWN0aXZlVHJhaW5zLFxuICAgICAgICAgIHRoaXMuX2dpdCxcbiAgICAgICAgICB0aGlzLl9jb25maWcsXG4gICAgICAgICAgdGhpcy5fcHJvamVjdFJvb3QsXG4gICAgICAgICk7XG4gICAgICAgIGNob2ljZXMucHVzaCh7bmFtZTogYXdhaXQgYWN0aW9uLmdldERlc2NyaXB0aW9uKCksIHZhbHVlOiBhY3Rpb259KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpbmZvKCdQbGVhc2Ugc2VsZWN0IHRoZSB0eXBlIG9mIHJlbGVhc2UgeW91IHdhbnQgdG8gcGVyZm9ybS4nKTtcblxuICAgIGNvbnN0IHtyZWxlYXNlQWN0aW9ufSA9IGF3YWl0IHByb21wdDx7cmVsZWFzZUFjdGlvbjogUmVsZWFzZUFjdGlvbn0+KHtcbiAgICAgIG5hbWU6ICdyZWxlYXNlQWN0aW9uJyxcbiAgICAgIG1lc3NhZ2U6ICdQbGVhc2Ugc2VsZWN0IGFuIGFjdGlvbjonLFxuICAgICAgdHlwZTogJ2xpc3QnLFxuICAgICAgY2hvaWNlcyxcbiAgICB9KTtcblxuICAgIHJldHVybiByZWxlYXNlQWN0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIHRoYXQgdGhlcmUgYXJlIG5vIHVuY29tbWl0dGVkIGNoYW5nZXMgaW4gdGhlIHByb2plY3QuXG4gICAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHN1Y2Nlc3Mgb3IgZmFpbHVyZS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeU5vVW5jb21taXR0ZWRDaGFuZ2VzKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmICh0aGlzLl9naXQuaGFzVW5jb21taXR0ZWRDaGFuZ2VzKCkpIHtcbiAgICAgIGVycm9yKHJlZCgnICDinJggICBUaGVyZSBhcmUgY2hhbmdlcyB3aGljaCBhcmUgbm90IGNvbW1pdHRlZCBhbmQgc2hvdWxkIGJlIGRpc2NhcmRlZC4nKSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIHRoYXQgdGhlIGxvY2FsIHJlcG9zaXRvcnkgaXMgbm90IGNvbmZpZ3VyZWQgYXMgc2hhbGxvdy5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2VzcyBvciBmYWlsdXJlLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfdmVyaWZ5Tm9TaGFsbG93UmVwb3NpdG9yeSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAodGhpcy5fZ2l0LmlzU2hhbGxvd1JlcG8oKSkge1xuICAgICAgZXJyb3IocmVkKCcgIOKcmCAgIFRoZSBsb2NhbCByZXBvc2l0b3J5IGlzIGNvbmZpZ3VyZWQgYXMgc2hhbGxvdy4nKSk7XG4gICAgICBlcnJvcihyZWQoYCAgICAgIFBsZWFzZSBjb252ZXJ0IHRoZSByZXBvc2l0b3J5IHRvIGEgY29tcGxldGUgb25lIGJ5IHN5bmNpbmcgd2l0aCB1cHN0cmVhbS5gKSk7XG4gICAgICBlcnJvcihcbiAgICAgICAgcmVkKGAgICAgICBodHRwczovL2dpdC1zY20uY29tL2RvY3MvZ2l0LWZldGNoI0RvY3VtZW50YXRpb24vZ2l0LWZldGNoLnR4dC0tLXVuc2hhbGxvd2ApLFxuICAgICAgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgdGhhdCB0aGUgbmV4dCBicmFuY2ggZnJvbSB0aGUgY29uZmlndXJlZCByZXBvc2l0b3J5IGlzIGNoZWNrZWQgb3V0LlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyBzdWNjZXNzIG9yIGZhaWx1cmUuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlSdW5uaW5nRnJvbU5leHRCcmFuY2gobmV4dEJyYW5jaE5hbWU6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGhlYWRTaGEgPSB0aGlzLl9naXQucnVuKFsncmV2LXBhcnNlJywgJ0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgICBjb25zdCB7ZGF0YX0gPSBhd2FpdCB0aGlzLl9naXQuZ2l0aHViLnJlcG9zLmdldEJyYW5jaCh7XG4gICAgICAuLi50aGlzLl9naXQucmVtb3RlUGFyYW1zLFxuICAgICAgYnJhbmNoOiB0aGlzLl9naXQubWFpbkJyYW5jaE5hbWUsXG4gICAgfSk7XG5cbiAgICBpZiAoaGVhZFNoYSAhPT0gZGF0YS5jb21taXQuc2hhKSB7XG4gICAgICBlcnJvcihyZWQoJyAg4pyYICAgUnVubmluZyByZWxlYXNlIHRvb2wgZnJvbSBhbiBvdXRkYXRlZCBsb2NhbCBicmFuY2guJykpO1xuICAgICAgZXJyb3IocmVkKGAgICAgICBQbGVhc2UgbWFrZSBzdXJlIHlvdSBhcmUgcnVubmluZyBmcm9tIHRoZSBcIiR7bmV4dEJyYW5jaE5hbWV9XCIgYnJhbmNoLmApKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgdGhhdCB0aGUgdXNlciBpcyBsb2dnZWQgaW50byBOUE0gYXQgdGhlIGNvcnJlY3QgcmVnaXN0cnksIGlmIGRlZmluZWQgZm9yIHRoZSByZWxlYXNlLlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSB1c2VyIGlzIGxvZ2dlZCBpbnRvIE5QTS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeU5wbUxvZ2luU3RhdGUoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgcmVnaXN0cnkgPSBgTlBNIGF0IHRoZSAke3RoaXMuX2NvbmZpZy5wdWJsaXNoUmVnaXN0cnkgPz8gJ2RlZmF1bHQgTlBNJ30gcmVnaXN0cnlgO1xuICAgIC8vIFRPRE8oam9zZXBocGVycm90dCk6IHJlbW92ZSB3b21iYXQgc3BlY2lmaWMgYmxvY2sgb25jZSB3b21ib3QgYWxsb3dzIGBucG0gd2hvYW1pYCBjaGVjayB0b1xuICAgIC8vIGNoZWNrIHRoZSBzdGF0dXMgb2YgdGhlIGxvY2FsIHRva2VuIGluIHRoZSAubnBtcmMgZmlsZS5cbiAgICBpZiAodGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeT8uaW5jbHVkZXMoJ3dvbWJhdC1kcmVzc2luZy1yb29tLmFwcHNwb3QuY29tJykpIHtcbiAgICAgIGluZm8oJ1VuYWJsZSB0byBkZXRlcm1pbmUgTlBNIGxvZ2luIHN0YXRlIGZvciB3b21iYXQgcHJveHksIHJlcXVpcmluZyBsb2dpbiBub3cuJyk7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBucG1Mb2dpbih0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5KTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGF3YWl0IG5wbUlzTG9nZ2VkSW4odGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSkpIHtcbiAgICAgIGRlYnVnKGBBbHJlYWR5IGxvZ2dlZCBpbnRvICR7cmVnaXN0cnl9LmApO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGVycm9yKHJlZChgICDinJggICBOb3QgY3VycmVudGx5IGxvZ2dlZCBpbnRvICR7cmVnaXN0cnl9LmApKTtcbiAgICBjb25zdCBzaG91bGRMb2dpbiA9IGF3YWl0IHByb21wdENvbmZpcm0oJ1dvdWxkIHlvdSBsaWtlIHRvIGxvZyBpbnRvIE5QTSBub3c/Jyk7XG4gICAgaWYgKHNob3VsZExvZ2luKSB7XG4gICAgICBkZWJ1ZygnU3RhcnRpbmcgTlBNIGxvZ2luLicpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgbnBtTG9naW4odGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIl19