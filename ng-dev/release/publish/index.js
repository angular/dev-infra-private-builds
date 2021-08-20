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
const authenticated_git_client_1 = require("../../utils/git/authenticated-git-client");
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
    constructor(_config, _github, _projectRoot) {
        this._config = _config;
        this._github = _github;
        this._projectRoot = _projectRoot;
        /** The singleton instance of the authenticated git client. */
        this._git = authenticated_git_client_1.AuthenticatedGitClient.get();
        /** The previous git commit to return back to after the release tool runs. */
        this.previousGitBranchOrRevision = this._git.getCurrentBranchOrRevision();
    }
    /** Runs the interactive release tool. */
    async run() {
        console_1.log();
        console_1.log(console_1.yellow('--------------------------------------------'));
        console_1.log(console_1.yellow('  Angular Dev-Infra release staging script'));
        console_1.log(console_1.yellow('--------------------------------------------'));
        console_1.log();
        const { owner, name } = this._github;
        const nextBranchName = version_branches_1.getNextBranchName(this._github);
        if (!(await this._verifyNoUncommittedChanges()) ||
            !(await this._verifyRunningFromNextBranch(nextBranchName))) {
            return CompletionState.FATAL_ERROR;
        }
        if (!(await this._verifyNpmLoginState())) {
            return CompletionState.MANUALLY_ABORTED;
        }
        const repo = { owner, name, api: this._git.github, nextBranchName };
        const releaseTrains = await active_release_trains_1.fetchActiveReleaseTrains(repo);
        // Print the active release trains so that the caretaker can access
        // the current project branching state without switching context.
        await print_active_trains_1.printActiveReleaseTrains(releaseTrains, this._config);
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
        await npm_publish_1.npmLogout(this._config.publishRegistry);
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
        console_1.info('Please select the type of release you want to perform.');
        const { releaseAction } = await inquirer_1.prompt({
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
            console_1.error(console_1.red('  ✘   There are changes which are not committed and should be discarded.'));
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
            console_1.error(console_1.red('  ✘   Running release tool from an outdated local branch.'));
            console_1.error(console_1.red(`      Please make sure you are running from the "${nextBranchName}" branch.`));
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
            console_1.info('Unable to determine NPM login state for wombat proxy, requiring login now.');
            try {
                await npm_publish_1.npmLogin(this._config.publishRegistry);
            }
            catch {
                return false;
            }
            return true;
        }
        if (await npm_publish_1.npmIsLoggedIn(this._config.publishRegistry)) {
            console_1.debug(`Already logged into ${registry}.`);
            return true;
        }
        console_1.error(console_1.red(`  ✘   Not currently logged into ${registry}.`));
        const shouldLogin = await console_1.promptConfirm('Would you like to log into NPM now?');
        if (shouldLogin) {
            console_1.debug('Starting NPM login.');
            try {
                await npm_publish_1.npmLogin(this._config.publishRegistry);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS9wdWJsaXNoL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILHVDQUFtRDtBQUVuRCxpREFBd0Y7QUFDeEYsdUZBQWdGO0FBRWhGLCtFQUFrRztBQUNsRywyREFBNkU7QUFDN0UsMkVBQTJFO0FBQzNFLHFFQUFxRjtBQUdyRixtREFBdUY7QUFDdkYsMkNBQXdDO0FBRXhDLElBQVksZUFJWDtBQUpELFdBQVksZUFBZTtJQUN6QiwyREFBTyxDQUFBO0lBQ1AsbUVBQVcsQ0FBQTtJQUNYLDZFQUFnQixDQUFBO0FBQ2xCLENBQUMsRUFKVyxlQUFlLEdBQWYsdUJBQWUsS0FBZix1QkFBZSxRQUkxQjtBQUVELE1BQWEsV0FBVztJQU10QixZQUNZLE9BQXNCLEVBQ3RCLE9BQXdCLEVBQ3hCLFlBQW9CO1FBRnBCLFlBQU8sR0FBUCxPQUFPLENBQWU7UUFDdEIsWUFBTyxHQUFQLE9BQU8sQ0FBaUI7UUFDeEIsaUJBQVksR0FBWixZQUFZLENBQVE7UUFSaEMsOERBQThEO1FBQ3RELFNBQUksR0FBRyxpREFBc0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1Qyw2RUFBNkU7UUFDckUsZ0NBQTJCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0lBTTFFLENBQUM7SUFFSix5Q0FBeUM7SUFDekMsS0FBSyxDQUFDLEdBQUc7UUFDUCxhQUFHLEVBQUUsQ0FBQztRQUNOLGFBQUcsQ0FBQyxnQkFBTSxDQUFDLDhDQUE4QyxDQUFDLENBQUMsQ0FBQztRQUM1RCxhQUFHLENBQUMsZ0JBQU0sQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDLENBQUM7UUFDMUQsYUFBRyxDQUFDLGdCQUFNLENBQUMsOENBQThDLENBQUMsQ0FBQyxDQUFDO1FBQzVELGFBQUcsRUFBRSxDQUFDO1FBRU4sTUFBTSxF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Q0FBQyxlQUFlLElBQUksYUFBYSxXQUFXLENBQUM7UUFDeEYsNkZBQTZGO1FBQzdGLDBEQUEwRDtRQUMxRCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQyxrQ0FBa0MsQ0FBQyxFQUFFO1lBQzlFLGNBQUksQ0FBQyw0RUFBNEUsQ0FBQyxDQUFDO1lBQ25GLElBQUk7Z0JBQ0YsTUFBTSxzQkFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDOUM7WUFBQyxNQUFNO2dCQUNOLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFDRCxPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsSUFBSSxNQUFNLDJCQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFBRTtZQUNyRCxlQUFLLENBQUMsdUJBQXVCLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDMUMsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELGVBQUssQ0FBQyxhQUFHLENBQUMsbUNBQW1DLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMzRCxNQUFNLFdBQVcsR0FBRyxNQUFNLHVCQUFhLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUMvRSxJQUFJLFdBQVcsRUFBRTtZQUNmLGVBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBQzdCLElBQUk7Z0JBQ0YsTUFBTSxzQkFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDOUM7WUFBQyxNQUFNO2dCQUNOLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFDRCxPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0NBQ0Y7QUFwS0Qsa0NBb0tDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TGlzdENob2ljZU9wdGlvbnMsIHByb21wdH0gZnJvbSAnaW5xdWlyZXInO1xuaW1wb3J0IHtHaXRDbGllbnRDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2RlYnVnLCBlcnJvciwgaW5mbywgbG9nLCBwcm9tcHRDb25maXJtLCByZWQsIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHtSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zLCBmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7bnBtSXNMb2dnZWRJbiwgbnBtTG9naW4sIG5wbUxvZ291dH0gZnJvbSAnLi4vdmVyc2lvbmluZy9ucG0tcHVibGlzaCc7XG5pbXBvcnQge3ByaW50QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vdmVyc2lvbmluZy9wcmludC1hY3RpdmUtdHJhaW5zJztcbmltcG9ydCB7Z2V0TmV4dEJyYW5jaE5hbWUsIFJlbGVhc2VSZXBvV2l0aEFwaX0gZnJvbSAnLi4vdmVyc2lvbmluZy92ZXJzaW9uLWJyYW5jaGVzJztcblxuaW1wb3J0IHtSZWxlYXNlQWN0aW9ufSBmcm9tICcuL2FjdGlvbnMnO1xuaW1wb3J0IHtGYXRhbFJlbGVhc2VBY3Rpb25FcnJvciwgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3J9IGZyb20gJy4vYWN0aW9ucy1lcnJvcic7XG5pbXBvcnQge2FjdGlvbnN9IGZyb20gJy4vYWN0aW9ucy9pbmRleCc7XG5cbmV4cG9ydCBlbnVtIENvbXBsZXRpb25TdGF0ZSB7XG4gIFNVQ0NFU1MsXG4gIEZBVEFMX0VSUk9SLFxuICBNQU5VQUxMWV9BQk9SVEVELFxufVxuXG5leHBvcnQgY2xhc3MgUmVsZWFzZVRvb2wge1xuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgYXV0aGVudGljYXRlZCBnaXQgY2xpZW50LiAqL1xuICBwcml2YXRlIF9naXQgPSBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LmdldCgpO1xuICAvKiogVGhlIHByZXZpb3VzIGdpdCBjb21taXQgdG8gcmV0dXJuIGJhY2sgdG8gYWZ0ZXIgdGhlIHJlbGVhc2UgdG9vbCBydW5zLiAqL1xuICBwcml2YXRlIHByZXZpb3VzR2l0QnJhbmNoT3JSZXZpc2lvbiA9IHRoaXMuX2dpdC5nZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByb3RlY3RlZCBfY29uZmlnOiBSZWxlYXNlQ29uZmlnLFxuICAgIHByb3RlY3RlZCBfZ2l0aHViOiBHaXRDbGllbnRDb25maWcsXG4gICAgcHJvdGVjdGVkIF9wcm9qZWN0Um9vdDogc3RyaW5nLFxuICApIHt9XG5cbiAgLyoqIFJ1bnMgdGhlIGludGVyYWN0aXZlIHJlbGVhc2UgdG9vbC4gKi9cbiAgYXN5bmMgcnVuKCk6IFByb21pc2U8Q29tcGxldGlvblN0YXRlPiB7XG4gICAgbG9nKCk7XG4gICAgbG9nKHllbGxvdygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKSk7XG4gICAgbG9nKHllbGxvdygnICBBbmd1bGFyIERldi1JbmZyYSByZWxlYXNlIHN0YWdpbmcgc2NyaXB0JykpO1xuICAgIGxvZyh5ZWxsb3coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJykpO1xuICAgIGxvZygpO1xuXG4gICAgY29uc3Qge293bmVyLCBuYW1lfSA9IHRoaXMuX2dpdGh1YjtcbiAgICBjb25zdCBuZXh0QnJhbmNoTmFtZSA9IGdldE5leHRCcmFuY2hOYW1lKHRoaXMuX2dpdGh1Yik7XG5cbiAgICBpZiAoXG4gICAgICAhKGF3YWl0IHRoaXMuX3ZlcmlmeU5vVW5jb21taXR0ZWRDaGFuZ2VzKCkpIHx8XG4gICAgICAhKGF3YWl0IHRoaXMuX3ZlcmlmeVJ1bm5pbmdGcm9tTmV4dEJyYW5jaChuZXh0QnJhbmNoTmFtZSkpXG4gICAgKSB7XG4gICAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLkZBVEFMX0VSUk9SO1xuICAgIH1cblxuICAgIGlmICghKGF3YWl0IHRoaXMuX3ZlcmlmeU5wbUxvZ2luU3RhdGUoKSkpIHtcbiAgICAgIHJldHVybiBDb21wbGV0aW9uU3RhdGUuTUFOVUFMTFlfQUJPUlRFRDtcbiAgICB9XG5cbiAgICBjb25zdCByZXBvOiBSZWxlYXNlUmVwb1dpdGhBcGkgPSB7b3duZXIsIG5hbWUsIGFwaTogdGhpcy5fZ2l0LmdpdGh1YiwgbmV4dEJyYW5jaE5hbWV9O1xuICAgIGNvbnN0IHJlbGVhc2VUcmFpbnMgPSBhd2FpdCBmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnMocmVwbyk7XG5cbiAgICAvLyBQcmludCB0aGUgYWN0aXZlIHJlbGVhc2UgdHJhaW5zIHNvIHRoYXQgdGhlIGNhcmV0YWtlciBjYW4gYWNjZXNzXG4gICAgLy8gdGhlIGN1cnJlbnQgcHJvamVjdCBicmFuY2hpbmcgc3RhdGUgd2l0aG91dCBzd2l0Y2hpbmcgY29udGV4dC5cbiAgICBhd2FpdCBwcmludEFjdGl2ZVJlbGVhc2VUcmFpbnMocmVsZWFzZVRyYWlucywgdGhpcy5fY29uZmlnKTtcblxuICAgIGNvbnN0IGFjdGlvbiA9IGF3YWl0IHRoaXMuX3Byb21wdEZvclJlbGVhc2VBY3Rpb24ocmVsZWFzZVRyYWlucyk7XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgYWN0aW9uLnBlcmZvcm0oKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yKSB7XG4gICAgICAgIHJldHVybiBDb21wbGV0aW9uU3RhdGUuTUFOVUFMTFlfQUJPUlRFRDtcbiAgICAgIH1cbiAgICAgIC8vIE9ubHkgcHJpbnQgdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHN0YWNrIGlmIHRoZSBlcnJvciBpcyBub3QgYSBrbm93biBmYXRhbCByZWxlYXNlXG4gICAgICAvLyBhY3Rpb24gZXJyb3IgKGZvciB3aGljaCB3ZSBwcmludCB0aGUgZXJyb3IgZ3JhY2VmdWxseSB0byB0aGUgY29uc29sZSB3aXRoIGNvbG9ycykuXG4gICAgICBpZiAoIShlIGluc3RhbmNlb2YgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IpICYmIGUgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5GQVRBTF9FUlJPUjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgYXdhaXQgdGhpcy5jbGVhbnVwKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5TVUNDRVNTO1xuICB9XG5cbiAgLyoqIFJ1biBwb3N0IHJlbGVhc2UgdG9vbCBjbGVhbnVwcy4gKi9cbiAgcHJpdmF0ZSBhc3luYyBjbGVhbnVwKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFJldHVybiBiYWNrIHRvIHRoZSBnaXQgc3RhdGUgZnJvbSBiZWZvcmUgdGhlIHJlbGVhc2UgdG9vbCByYW4uXG4gICAgdGhpcy5fZ2l0LmNoZWNrb3V0KHRoaXMucHJldmlvdXNHaXRCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcbiAgICAvLyBFbnN1cmUgbG9nIG91dCBvZiBOUE0uXG4gICAgYXdhaXQgbnBtTG9nb3V0KHRoaXMuX2NvbmZpZy5wdWJsaXNoUmVnaXN0cnkpO1xuICB9XG5cbiAgLyoqIFByb21wdHMgdGhlIGNhcmV0YWtlciBmb3IgYSByZWxlYXNlIGFjdGlvbiB0aGF0IHNob3VsZCBiZSBwZXJmb3JtZWQuICovXG4gIHByaXZhdGUgYXN5bmMgX3Byb21wdEZvclJlbGVhc2VBY3Rpb24oYWN0aXZlVHJhaW5zOiBBY3RpdmVSZWxlYXNlVHJhaW5zKSB7XG4gICAgY29uc3QgY2hvaWNlczogTGlzdENob2ljZU9wdGlvbnNbXSA9IFtdO1xuXG4gICAgLy8gRmluZCBhbmQgaW5zdGFudGlhdGUgYWxsIHJlbGVhc2UgYWN0aW9ucyB3aGljaCBhcmUgY3VycmVudGx5IHZhbGlkLlxuICAgIGZvciAobGV0IGFjdGlvblR5cGUgb2YgYWN0aW9ucykge1xuICAgICAgaWYgKGF3YWl0IGFjdGlvblR5cGUuaXNBY3RpdmUoYWN0aXZlVHJhaW5zLCB0aGlzLl9jb25maWcpKSB7XG4gICAgICAgIGNvbnN0IGFjdGlvbjogUmVsZWFzZUFjdGlvbiA9IG5ldyBhY3Rpb25UeXBlKFxuICAgICAgICAgIGFjdGl2ZVRyYWlucyxcbiAgICAgICAgICB0aGlzLl9naXQsXG4gICAgICAgICAgdGhpcy5fY29uZmlnLFxuICAgICAgICAgIHRoaXMuX3Byb2plY3RSb290LFxuICAgICAgICApO1xuICAgICAgICBjaG9pY2VzLnB1c2goe25hbWU6IGF3YWl0IGFjdGlvbi5nZXREZXNjcmlwdGlvbigpLCB2YWx1ZTogYWN0aW9ufSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaW5mbygnUGxlYXNlIHNlbGVjdCB0aGUgdHlwZSBvZiByZWxlYXNlIHlvdSB3YW50IHRvIHBlcmZvcm0uJyk7XG5cbiAgICBjb25zdCB7cmVsZWFzZUFjdGlvbn0gPSBhd2FpdCBwcm9tcHQ8e3JlbGVhc2VBY3Rpb246IFJlbGVhc2VBY3Rpb259Pih7XG4gICAgICBuYW1lOiAncmVsZWFzZUFjdGlvbicsXG4gICAgICBtZXNzYWdlOiAnUGxlYXNlIHNlbGVjdCBhbiBhY3Rpb246JyxcbiAgICAgIHR5cGU6ICdsaXN0JyxcbiAgICAgIGNob2ljZXMsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVsZWFzZUFjdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZmllcyB0aGF0IHRoZXJlIGFyZSBubyB1bmNvbW1pdHRlZCBjaGFuZ2VzIGluIHRoZSBwcm9qZWN0LlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyBzdWNjZXNzIG9yIGZhaWx1cmUuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlOb1VuY29tbWl0dGVkQ2hhbmdlcygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAodGhpcy5fZ2l0Lmhhc1VuY29tbWl0dGVkQ2hhbmdlcygpKSB7XG4gICAgICBlcnJvcihyZWQoJyAg4pyYICAgVGhlcmUgYXJlIGNoYW5nZXMgd2hpY2ggYXJlIG5vdCBjb21taXR0ZWQgYW5kIHNob3VsZCBiZSBkaXNjYXJkZWQuJykpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZmllcyB0aGF0IHRoZSBuZXh0IGJyYW5jaCBmcm9tIHRoZSBjb25maWd1cmVkIHJlcG9zaXRvcnkgaXMgY2hlY2tlZCBvdXQuXG4gICAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHN1Y2Nlc3Mgb3IgZmFpbHVyZS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeVJ1bm5pbmdGcm9tTmV4dEJyYW5jaChuZXh0QnJhbmNoTmFtZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgaGVhZFNoYSA9IHRoaXMuX2dpdC5ydW4oWydyZXYtcGFyc2UnLCAnSEVBRCddKS5zdGRvdXQudHJpbSgpO1xuICAgIGNvbnN0IHtkYXRhfSA9IGF3YWl0IHRoaXMuX2dpdC5naXRodWIucmVwb3MuZ2V0QnJhbmNoKHtcbiAgICAgIC4uLnRoaXMuX2dpdC5yZW1vdGVQYXJhbXMsXG4gICAgICBicmFuY2g6IHRoaXMuX2dpdC5tYWluQnJhbmNoTmFtZSxcbiAgICB9KTtcblxuICAgIGlmIChoZWFkU2hhICE9PSBkYXRhLmNvbW1pdC5zaGEpIHtcbiAgICAgIGVycm9yKHJlZCgnICDinJggICBSdW5uaW5nIHJlbGVhc2UgdG9vbCBmcm9tIGFuIG91dGRhdGVkIGxvY2FsIGJyYW5jaC4nKSk7XG4gICAgICBlcnJvcihyZWQoYCAgICAgIFBsZWFzZSBtYWtlIHN1cmUgeW91IGFyZSBydW5uaW5nIGZyb20gdGhlIFwiJHtuZXh0QnJhbmNoTmFtZX1cIiBicmFuY2guYCkpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZmllcyB0aGF0IHRoZSB1c2VyIGlzIGxvZ2dlZCBpbnRvIE5QTSBhdCB0aGUgY29ycmVjdCByZWdpc3RyeSwgaWYgZGVmaW5lZCBmb3IgdGhlIHJlbGVhc2UuXG4gICAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIHVzZXIgaXMgbG9nZ2VkIGludG8gTlBNLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfdmVyaWZ5TnBtTG9naW5TdGF0ZSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCByZWdpc3RyeSA9IGBOUE0gYXQgdGhlICR7dGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSA/PyAnZGVmYXVsdCBOUE0nfSByZWdpc3RyeWA7XG4gICAgLy8gVE9ETyhqb3NlcGhwZXJyb3R0KTogcmVtb3ZlIHdvbWJhdCBzcGVjaWZpYyBibG9jayBvbmNlIHdvbWJvdCBhbGxvd3MgYG5wbSB3aG9hbWlgIGNoZWNrIHRvXG4gICAgLy8gY2hlY2sgdGhlIHN0YXR1cyBvZiB0aGUgbG9jYWwgdG9rZW4gaW4gdGhlIC5ucG1yYyBmaWxlLlxuICAgIGlmICh0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5Py5pbmNsdWRlcygnd29tYmF0LWRyZXNzaW5nLXJvb20uYXBwc3BvdC5jb20nKSkge1xuICAgICAgaW5mbygnVW5hYmxlIHRvIGRldGVybWluZSBOUE0gbG9naW4gc3RhdGUgZm9yIHdvbWJhdCBwcm94eSwgcmVxdWlyaW5nIGxvZ2luIG5vdy4nKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IG5wbUxvZ2luKHRoaXMuX2NvbmZpZy5wdWJsaXNoUmVnaXN0cnkpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoYXdhaXQgbnBtSXNMb2dnZWRJbih0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5KSkge1xuICAgICAgZGVidWcoYEFscmVhZHkgbG9nZ2VkIGludG8gJHtyZWdpc3RyeX0uYCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgZXJyb3IocmVkKGAgIOKcmCAgIE5vdCBjdXJyZW50bHkgbG9nZ2VkIGludG8gJHtyZWdpc3RyeX0uYCkpO1xuICAgIGNvbnN0IHNob3VsZExvZ2luID0gYXdhaXQgcHJvbXB0Q29uZmlybSgnV291bGQgeW91IGxpa2UgdG8gbG9nIGludG8gTlBNIG5vdz8nKTtcbiAgICBpZiAoc2hvdWxkTG9naW4pIHtcbiAgICAgIGRlYnVnKCdTdGFydGluZyBOUE0gbG9naW4uJyk7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBucG1Mb2dpbih0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5KTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iXX0=