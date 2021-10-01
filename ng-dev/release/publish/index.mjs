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
            !(await this._verifyNoShallowRepository())) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS9wdWJsaXNoL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILHVDQUFtRDtBQUVuRCxpREFBd0Y7QUFHeEYsK0VBQWtHO0FBQ2xHLDJEQUE2RTtBQUM3RSwyRUFBMkU7QUFDM0UscUVBQXFGO0FBR3JGLG1EQUF1RjtBQUN2RiwyQ0FBd0M7QUFFeEMsSUFBWSxlQUlYO0FBSkQsV0FBWSxlQUFlO0lBQ3pCLDJEQUFPLENBQUE7SUFDUCxtRUFBVyxDQUFBO0lBQ1gsNkVBQWdCLENBQUE7QUFDbEIsQ0FBQyxFQUpXLGVBQWUsR0FBZix1QkFBZSxLQUFmLHVCQUFlLFFBSTFCO0FBRUQsTUFBYSxXQUFXO0lBSXRCLFlBQ1ksSUFBNEIsRUFDNUIsT0FBc0IsRUFDdEIsT0FBcUIsRUFDckIsWUFBb0I7UUFIcEIsU0FBSSxHQUFKLElBQUksQ0FBd0I7UUFDNUIsWUFBTyxHQUFQLE9BQU8sQ0FBZTtRQUN0QixZQUFPLEdBQVAsT0FBTyxDQUFjO1FBQ3JCLGlCQUFZLEdBQVosWUFBWSxDQUFRO1FBUGhDLDZFQUE2RTtRQUNyRSxnQ0FBMkIsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7SUFPMUUsQ0FBQztJQUVKLHlDQUF5QztJQUN6QyxLQUFLLENBQUMsR0FBRztRQUNQLElBQUEsYUFBRyxHQUFFLENBQUM7UUFDTixJQUFBLGFBQUcsRUFBQyxJQUFBLGdCQUFNLEVBQUMsOENBQThDLENBQUMsQ0FBQyxDQUFDO1FBQzVELElBQUEsYUFBRyxFQUFDLElBQUEsZ0JBQU0sRUFBQyw0Q0FBNEMsQ0FBQyxDQUFDLENBQUM7UUFDMUQsSUFBQSxhQUFHLEVBQUMsSUFBQSxnQkFBTSxFQUFDLDhDQUE4QyxDQUFDLENBQUMsQ0FBQztRQUM1RCxJQUFBLGFBQUcsR0FBRSxDQUFDO1FB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LENBQUMsRUFBRTtZQUNyRCxJQUFBLGVBQUssRUFBQyx1QkFBdUIsUUFBUSxHQUFHLENBQUMsQ0FBQztZQUMxQyxPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsSUFBQSxlQUFLLEVBQUMsSUFBQSxhQUFHLEVBQUMsbUNBQW1DLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMzRCxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUEsdUJBQWEsRUFBQyxxQ0FBcUMsQ0FBQyxDQUFDO1FBQy9FLElBQUksV0FBVyxFQUFFO1lBQ2YsSUFBQSxlQUFLLEVBQUMscUJBQXFCLENBQUMsQ0FBQztZQUM3QixJQUFJO2dCQUNGLE1BQU0sSUFBQSxzQkFBUSxFQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDOUM7WUFBQyxNQUFNO2dCQUNOLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFDRCxPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0NBQ0Y7QUEzTEQsa0NBMkxDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TGlzdENob2ljZU9wdGlvbnMsIHByb21wdH0gZnJvbSAnaW5xdWlyZXInO1xuaW1wb3J0IHtHaXRodWJDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2RlYnVnLCBlcnJvciwgaW5mbywgbG9nLCBwcm9tcHRDb25maXJtLCByZWQsIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHtSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zLCBmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7bnBtSXNMb2dnZWRJbiwgbnBtTG9naW4sIG5wbUxvZ291dH0gZnJvbSAnLi4vdmVyc2lvbmluZy9ucG0tcHVibGlzaCc7XG5pbXBvcnQge3ByaW50QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vdmVyc2lvbmluZy9wcmludC1hY3RpdmUtdHJhaW5zJztcbmltcG9ydCB7Z2V0TmV4dEJyYW5jaE5hbWUsIFJlbGVhc2VSZXBvV2l0aEFwaX0gZnJvbSAnLi4vdmVyc2lvbmluZy92ZXJzaW9uLWJyYW5jaGVzJztcblxuaW1wb3J0IHtSZWxlYXNlQWN0aW9ufSBmcm9tICcuL2FjdGlvbnMnO1xuaW1wb3J0IHtGYXRhbFJlbGVhc2VBY3Rpb25FcnJvciwgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3J9IGZyb20gJy4vYWN0aW9ucy1lcnJvcic7XG5pbXBvcnQge2FjdGlvbnN9IGZyb20gJy4vYWN0aW9ucy9pbmRleCc7XG5cbmV4cG9ydCBlbnVtIENvbXBsZXRpb25TdGF0ZSB7XG4gIFNVQ0NFU1MsXG4gIEZBVEFMX0VSUk9SLFxuICBNQU5VQUxMWV9BQk9SVEVELFxufVxuXG5leHBvcnQgY2xhc3MgUmVsZWFzZVRvb2wge1xuICAvKiogVGhlIHByZXZpb3VzIGdpdCBjb21taXQgdG8gcmV0dXJuIGJhY2sgdG8gYWZ0ZXIgdGhlIHJlbGVhc2UgdG9vbCBydW5zLiAqL1xuICBwcml2YXRlIHByZXZpb3VzR2l0QnJhbmNoT3JSZXZpc2lvbiA9IHRoaXMuX2dpdC5nZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByb3RlY3RlZCBfZ2l0OiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LFxuICAgIHByb3RlY3RlZCBfY29uZmlnOiBSZWxlYXNlQ29uZmlnLFxuICAgIHByb3RlY3RlZCBfZ2l0aHViOiBHaXRodWJDb25maWcsXG4gICAgcHJvdGVjdGVkIF9wcm9qZWN0Um9vdDogc3RyaW5nLFxuICApIHt9XG5cbiAgLyoqIFJ1bnMgdGhlIGludGVyYWN0aXZlIHJlbGVhc2UgdG9vbC4gKi9cbiAgYXN5bmMgcnVuKCk6IFByb21pc2U8Q29tcGxldGlvblN0YXRlPiB7XG4gICAgbG9nKCk7XG4gICAgbG9nKHllbGxvdygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKSk7XG4gICAgbG9nKHllbGxvdygnICBBbmd1bGFyIERldi1JbmZyYSByZWxlYXNlIHN0YWdpbmcgc2NyaXB0JykpO1xuICAgIGxvZyh5ZWxsb3coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJykpO1xuICAgIGxvZygpO1xuXG4gICAgY29uc3Qge293bmVyLCBuYW1lfSA9IHRoaXMuX2dpdGh1YjtcbiAgICBjb25zdCBuZXh0QnJhbmNoTmFtZSA9IGdldE5leHRCcmFuY2hOYW1lKHRoaXMuX2dpdGh1Yik7XG5cbiAgICBpZiAoXG4gICAgICAhKGF3YWl0IHRoaXMuX3ZlcmlmeU5vVW5jb21taXR0ZWRDaGFuZ2VzKCkpIHx8XG4gICAgICAhKGF3YWl0IHRoaXMuX3ZlcmlmeVJ1bm5pbmdGcm9tTmV4dEJyYW5jaChuZXh0QnJhbmNoTmFtZSkpIHx8XG4gICAgICAhKGF3YWl0IHRoaXMuX3ZlcmlmeU5vU2hhbGxvd1JlcG9zaXRvcnkoKSlcbiAgICApIHtcbiAgICAgIHJldHVybiBDb21wbGV0aW9uU3RhdGUuRkFUQUxfRVJST1I7XG4gICAgfVxuXG4gICAgaWYgKCEoYXdhaXQgdGhpcy5fdmVyaWZ5TnBtTG9naW5TdGF0ZSgpKSkge1xuICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5NQU5VQUxMWV9BQk9SVEVEO1xuICAgIH1cblxuICAgIC8vIFNldCB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGUgdG8gc2tpcCBhbGwgZ2l0IGNvbW1pdCBob29rcyB0cmlnZ2VyZWQgYnkgaHVza3kuIFdlIGFyZSB1bmFibGUgdG9cbiAgICAvLyByZWx5IG9uIGAtLW5vLXZlcmlmeWAgYXMgc29tZSBob29rcyBzdGlsbCBydW4sIG5vdGFibHkgdGhlIGBwcmVwYXJlLWNvbW1pdC1tc2dgIGhvb2suXG4gICAgLy8gUnVubmluZyBob29rcyBoYXMgdGhlIGRvd25zaWRlIG9mIHBvdGVudGlhbGx5IHJ1bm5pbmcgY29kZSAobGlrZSB0aGUgYG5nLWRldmAgdG9vbCkgd2hlbiBhIHZlcnNpb25cbiAgICAvLyBicmFuY2ggaXMgY2hlY2tlZCBvdXQsIGJ1dCB0aGUgbm9kZSBtb2R1bGVzIGFyZSBub3QgcmUtaW5zdGFsbGVkLiBUaGUgdG9vbCBzd2l0Y2hlcyBicmFuY2hlc1xuICAgIC8vIG11bHRpcGxlIHRpbWVzIHBlciBleGVjdXRpb24sIGFuZCBpdCBpcyBub3QgZGVzaXJhYmxlIHJlLXJ1bm5pbmcgWWFybiBhbGwgdGhlIHRpbWUuXG4gICAgcHJvY2Vzcy5lbnZbJ0hVU0tZJ10gPSAnMCc7XG5cbiAgICBjb25zdCByZXBvOiBSZWxlYXNlUmVwb1dpdGhBcGkgPSB7b3duZXIsIG5hbWUsIGFwaTogdGhpcy5fZ2l0LmdpdGh1YiwgbmV4dEJyYW5jaE5hbWV9O1xuICAgIGNvbnN0IHJlbGVhc2VUcmFpbnMgPSBhd2FpdCBmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnMocmVwbyk7XG5cbiAgICAvLyBQcmludCB0aGUgYWN0aXZlIHJlbGVhc2UgdHJhaW5zIHNvIHRoYXQgdGhlIGNhcmV0YWtlciBjYW4gYWNjZXNzXG4gICAgLy8gdGhlIGN1cnJlbnQgcHJvamVjdCBicmFuY2hpbmcgc3RhdGUgd2l0aG91dCBzd2l0Y2hpbmcgY29udGV4dC5cbiAgICBhd2FpdCBwcmludEFjdGl2ZVJlbGVhc2VUcmFpbnMocmVsZWFzZVRyYWlucywgdGhpcy5fY29uZmlnKTtcblxuICAgIGNvbnN0IGFjdGlvbiA9IGF3YWl0IHRoaXMuX3Byb21wdEZvclJlbGVhc2VBY3Rpb24ocmVsZWFzZVRyYWlucyk7XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgYWN0aW9uLnBlcmZvcm0oKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yKSB7XG4gICAgICAgIHJldHVybiBDb21wbGV0aW9uU3RhdGUuTUFOVUFMTFlfQUJPUlRFRDtcbiAgICAgIH1cbiAgICAgIC8vIE9ubHkgcHJpbnQgdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHN0YWNrIGlmIHRoZSBlcnJvciBpcyBub3QgYSBrbm93biBmYXRhbCByZWxlYXNlXG4gICAgICAvLyBhY3Rpb24gZXJyb3IgKGZvciB3aGljaCB3ZSBwcmludCB0aGUgZXJyb3IgZ3JhY2VmdWxseSB0byB0aGUgY29uc29sZSB3aXRoIGNvbG9ycykuXG4gICAgICBpZiAoIShlIGluc3RhbmNlb2YgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IpICYmIGUgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5GQVRBTF9FUlJPUjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgYXdhaXQgdGhpcy5jbGVhbnVwKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5TVUNDRVNTO1xuICB9XG5cbiAgLyoqIFJ1biBwb3N0IHJlbGVhc2UgdG9vbCBjbGVhbnVwcy4gKi9cbiAgcHJpdmF0ZSBhc3luYyBjbGVhbnVwKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFJldHVybiBiYWNrIHRvIHRoZSBnaXQgc3RhdGUgZnJvbSBiZWZvcmUgdGhlIHJlbGVhc2UgdG9vbCByYW4uXG4gICAgdGhpcy5fZ2l0LmNoZWNrb3V0KHRoaXMucHJldmlvdXNHaXRCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcbiAgICAvLyBFbnN1cmUgbG9nIG91dCBvZiBOUE0uXG4gICAgYXdhaXQgbnBtTG9nb3V0KHRoaXMuX2NvbmZpZy5wdWJsaXNoUmVnaXN0cnkpO1xuICB9XG5cbiAgLyoqIFByb21wdHMgdGhlIGNhcmV0YWtlciBmb3IgYSByZWxlYXNlIGFjdGlvbiB0aGF0IHNob3VsZCBiZSBwZXJmb3JtZWQuICovXG4gIHByaXZhdGUgYXN5bmMgX3Byb21wdEZvclJlbGVhc2VBY3Rpb24oYWN0aXZlVHJhaW5zOiBBY3RpdmVSZWxlYXNlVHJhaW5zKSB7XG4gICAgY29uc3QgY2hvaWNlczogTGlzdENob2ljZU9wdGlvbnNbXSA9IFtdO1xuXG4gICAgLy8gRmluZCBhbmQgaW5zdGFudGlhdGUgYWxsIHJlbGVhc2UgYWN0aW9ucyB3aGljaCBhcmUgY3VycmVudGx5IHZhbGlkLlxuICAgIGZvciAobGV0IGFjdGlvblR5cGUgb2YgYWN0aW9ucykge1xuICAgICAgaWYgKGF3YWl0IGFjdGlvblR5cGUuaXNBY3RpdmUoYWN0aXZlVHJhaW5zLCB0aGlzLl9jb25maWcpKSB7XG4gICAgICAgIGNvbnN0IGFjdGlvbjogUmVsZWFzZUFjdGlvbiA9IG5ldyBhY3Rpb25UeXBlKFxuICAgICAgICAgIGFjdGl2ZVRyYWlucyxcbiAgICAgICAgICB0aGlzLl9naXQsXG4gICAgICAgICAgdGhpcy5fY29uZmlnLFxuICAgICAgICAgIHRoaXMuX3Byb2plY3RSb290LFxuICAgICAgICApO1xuICAgICAgICBjaG9pY2VzLnB1c2goe25hbWU6IGF3YWl0IGFjdGlvbi5nZXREZXNjcmlwdGlvbigpLCB2YWx1ZTogYWN0aW9ufSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaW5mbygnUGxlYXNlIHNlbGVjdCB0aGUgdHlwZSBvZiByZWxlYXNlIHlvdSB3YW50IHRvIHBlcmZvcm0uJyk7XG5cbiAgICBjb25zdCB7cmVsZWFzZUFjdGlvbn0gPSBhd2FpdCBwcm9tcHQ8e3JlbGVhc2VBY3Rpb246IFJlbGVhc2VBY3Rpb259Pih7XG4gICAgICBuYW1lOiAncmVsZWFzZUFjdGlvbicsXG4gICAgICBtZXNzYWdlOiAnUGxlYXNlIHNlbGVjdCBhbiBhY3Rpb246JyxcbiAgICAgIHR5cGU6ICdsaXN0JyxcbiAgICAgIGNob2ljZXMsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVsZWFzZUFjdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZmllcyB0aGF0IHRoZXJlIGFyZSBubyB1bmNvbW1pdHRlZCBjaGFuZ2VzIGluIHRoZSBwcm9qZWN0LlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyBzdWNjZXNzIG9yIGZhaWx1cmUuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlOb1VuY29tbWl0dGVkQ2hhbmdlcygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAodGhpcy5fZ2l0Lmhhc1VuY29tbWl0dGVkQ2hhbmdlcygpKSB7XG4gICAgICBlcnJvcihyZWQoJyAg4pyYICAgVGhlcmUgYXJlIGNoYW5nZXMgd2hpY2ggYXJlIG5vdCBjb21taXR0ZWQgYW5kIHNob3VsZCBiZSBkaXNjYXJkZWQuJykpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZmllcyB0aGF0IHRoZSBsb2NhbCByZXBvc2l0b3J5IGlzIG5vdCBjb25maWd1cmVkIGFzIHNoYWxsb3cuXG4gICAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHN1Y2Nlc3Mgb3IgZmFpbHVyZS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeU5vU2hhbGxvd1JlcG9zaXRvcnkoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKHRoaXMuX2dpdC5pc1NoYWxsb3dSZXBvKCkpIHtcbiAgICAgIGVycm9yKHJlZCgnICDinJggICBUaGUgbG9jYWwgcmVwb3NpdG9yeSBpcyBjb25maWd1cmVkIGFzIHNoYWxsb3cuJykpO1xuICAgICAgZXJyb3IocmVkKGAgICAgICBQbGVhc2UgY29udmVydCB0aGUgcmVwb3NpdG9yeSB0byBhIGNvbXBsZXRlIG9uZSBieSBzeW5jaW5nIHdpdGggdXBzdHJlYW0uYCkpO1xuICAgICAgZXJyb3IoXG4gICAgICAgIHJlZChgICAgICAgaHR0cHM6Ly9naXQtc2NtLmNvbS9kb2NzL2dpdC1mZXRjaCNEb2N1bWVudGF0aW9uL2dpdC1mZXRjaC50eHQtLS11bnNoYWxsb3dgKSxcbiAgICAgICk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIHRoYXQgdGhlIG5leHQgYnJhbmNoIGZyb20gdGhlIGNvbmZpZ3VyZWQgcmVwb3NpdG9yeSBpcyBjaGVja2VkIG91dC5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2VzcyBvciBmYWlsdXJlLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfdmVyaWZ5UnVubmluZ0Zyb21OZXh0QnJhbmNoKG5leHRCcmFuY2hOYW1lOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBoZWFkU2hhID0gdGhpcy5fZ2l0LnJ1bihbJ3Jldi1wYXJzZScsICdIRUFEJ10pLnN0ZG91dC50cmltKCk7XG4gICAgY29uc3Qge2RhdGF9ID0gYXdhaXQgdGhpcy5fZ2l0LmdpdGh1Yi5yZXBvcy5nZXRCcmFuY2goe1xuICAgICAgLi4udGhpcy5fZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgIGJyYW5jaDogdGhpcy5fZ2l0Lm1haW5CcmFuY2hOYW1lLFxuICAgIH0pO1xuXG4gICAgaWYgKGhlYWRTaGEgIT09IGRhdGEuY29tbWl0LnNoYSkge1xuICAgICAgZXJyb3IocmVkKCcgIOKcmCAgIFJ1bm5pbmcgcmVsZWFzZSB0b29sIGZyb20gYW4gb3V0ZGF0ZWQgbG9jYWwgYnJhbmNoLicpKTtcbiAgICAgIGVycm9yKHJlZChgICAgICAgUGxlYXNlIG1ha2Ugc3VyZSB5b3UgYXJlIHJ1bm5pbmcgZnJvbSB0aGUgXCIke25leHRCcmFuY2hOYW1lfVwiIGJyYW5jaC5gKSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIHRoYXQgdGhlIHVzZXIgaXMgbG9nZ2VkIGludG8gTlBNIGF0IHRoZSBjb3JyZWN0IHJlZ2lzdHJ5LCBpZiBkZWZpbmVkIGZvciB0aGUgcmVsZWFzZS5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgdXNlciBpcyBsb2dnZWQgaW50byBOUE0uXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlOcG1Mb2dpblN0YXRlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHJlZ2lzdHJ5ID0gYE5QTSBhdCB0aGUgJHt0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5ID8/ICdkZWZhdWx0IE5QTSd9IHJlZ2lzdHJ5YDtcbiAgICAvLyBUT0RPKGpvc2VwaHBlcnJvdHQpOiByZW1vdmUgd29tYmF0IHNwZWNpZmljIGJsb2NrIG9uY2Ugd29tYm90IGFsbG93cyBgbnBtIHdob2FtaWAgY2hlY2sgdG9cbiAgICAvLyBjaGVjayB0aGUgc3RhdHVzIG9mIHRoZSBsb2NhbCB0b2tlbiBpbiB0aGUgLm5wbXJjIGZpbGUuXG4gICAgaWYgKHRoaXMuX2NvbmZpZy5wdWJsaXNoUmVnaXN0cnk/LmluY2x1ZGVzKCd3b21iYXQtZHJlc3Npbmctcm9vbS5hcHBzcG90LmNvbScpKSB7XG4gICAgICBpbmZvKCdVbmFibGUgdG8gZGV0ZXJtaW5lIE5QTSBsb2dpbiBzdGF0ZSBmb3Igd29tYmF0IHByb3h5LCByZXF1aXJpbmcgbG9naW4gbm93LicpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgbnBtTG9naW4odGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmIChhd2FpdCBucG1Jc0xvZ2dlZEluKHRoaXMuX2NvbmZpZy5wdWJsaXNoUmVnaXN0cnkpKSB7XG4gICAgICBkZWJ1ZyhgQWxyZWFkeSBsb2dnZWQgaW50byAke3JlZ2lzdHJ5fS5gKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBlcnJvcihyZWQoYCAg4pyYICAgTm90IGN1cnJlbnRseSBsb2dnZWQgaW50byAke3JlZ2lzdHJ5fS5gKSk7XG4gICAgY29uc3Qgc2hvdWxkTG9naW4gPSBhd2FpdCBwcm9tcHRDb25maXJtKCdXb3VsZCB5b3UgbGlrZSB0byBsb2cgaW50byBOUE0gbm93PycpO1xuICAgIGlmIChzaG91bGRMb2dpbikge1xuICAgICAgZGVidWcoJ1N0YXJ0aW5nIE5QTSBsb2dpbi4nKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IG5wbUxvZ2luKHRoaXMuX2NvbmZpZy5wdWJsaXNoUmVnaXN0cnkpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cbiJdfQ==