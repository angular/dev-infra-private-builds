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
const child_process_1 = require("../../utils/child-process");
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
        if (!(await this._verifyEnvironmentHasPython3Symlink()) ||
            !(await this._verifyNoUncommittedChanges()) ||
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
     * Verifies that Python can be resolved within scripts and points to a compatible version. Python
     * is required in Bazel actions as there can be tools (such as `skydoc`) that rely on it.
     * @returns a boolean indicating success or failure.
     */
    async _verifyEnvironmentHasPython3Symlink() {
        try {
            // Note: We do not rely on `/usr/bin/env` but rather access the `env` binary directly as it
            // should be part of the shell's `$PATH`. This is necessary for compatibility with Windows.
            const pyVersion = await child_process_1.spawn('env', ['python', '--version'], { mode: 'silent' });
            const version = pyVersion.stdout.trim() || pyVersion.stderr.trim();
            if (version.startsWith('Python 3.')) {
                console_1.debug(`Local python version: ${version}`);
                return true;
            }
            console_1.error(console_1.red(`  ✘   \`/usr/bin/python\` is currently symlinked to "${version}", please update`));
            console_1.error(console_1.red('      the symlink to link instead to Python3'));
            console_1.error();
            console_1.error(console_1.red('      Googlers: please run the following command to symlink python to python3:'));
            console_1.error(console_1.red('        sudo ln -s /usr/bin/python3 /usr/bin/python'));
            return false;
        }
        catch {
            console_1.error(console_1.red('  ✘   `/usr/bin/python` does not exist, please ensure `/usr/bin/python` is'));
            console_1.error(console_1.red('      symlinked to Python3.'));
            console_1.error();
            console_1.error(console_1.red('      Googlers: please run the following command to symlink python to python3:'));
            console_1.error(console_1.red('        sudo ln -s /usr/bin/python3 /usr/bin/python'));
        }
        return false;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS9wdWJsaXNoL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILHVDQUFtRDtBQUVuRCw2REFBZ0Q7QUFFaEQsaURBQXdGO0FBQ3hGLHVGQUFnRjtBQUVoRiwrRUFBa0c7QUFDbEcsMkRBQTZFO0FBQzdFLDJFQUEyRTtBQUMzRSxxRUFBcUY7QUFHckYsbURBQXVGO0FBQ3ZGLDJDQUF3QztBQUV4QyxJQUFZLGVBSVg7QUFKRCxXQUFZLGVBQWU7SUFDekIsMkRBQU8sQ0FBQTtJQUNQLG1FQUFXLENBQUE7SUFDWCw2RUFBZ0IsQ0FBQTtBQUNsQixDQUFDLEVBSlcsZUFBZSxHQUFmLHVCQUFlLEtBQWYsdUJBQWUsUUFJMUI7QUFFRCxNQUFhLFdBQVc7SUFNdEIsWUFDWSxPQUFzQixFQUN0QixPQUFxQixFQUNyQixZQUFvQjtRQUZwQixZQUFPLEdBQVAsT0FBTyxDQUFlO1FBQ3RCLFlBQU8sR0FBUCxPQUFPLENBQWM7UUFDckIsaUJBQVksR0FBWixZQUFZLENBQVE7UUFSaEMsOERBQThEO1FBQ3RELFNBQUksR0FBRyxpREFBc0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1Qyw2RUFBNkU7UUFDckUsZ0NBQTJCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0lBTTFFLENBQUM7SUFFSix5Q0FBeUM7SUFDekMsS0FBSyxDQUFDLEdBQUc7UUFDUCxhQUFHLEVBQUUsQ0FBQztRQUNOLGFBQUcsQ0FBQyxnQkFBTSxDQUFDLDhDQUE4QyxDQUFDLENBQUMsQ0FBQztRQUM1RCxhQUFHLENBQUMsZ0JBQU0sQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDLENBQUM7UUFDMUQsYUFBRyxDQUFDLGdCQUFNLENBQUMsOENBQThDLENBQUMsQ0FBQyxDQUFDO1FBQzVELGFBQUcsRUFBRSxDQUFD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QUFLLENBQUMsb0JBQW9CO1FBQ2hDLE1BQU0sUUFBUSxHQUFHLGNBQWMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLElBQUksYUFBYSxXQUFXLENBQUM7UUFDeEYsNkZBQTZGO1FBQzdGLDBEQUEwRDtRQUMxRCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQyxrQ0FBa0MsQ0FBQyxFQUFFO1lBQzlFLGNBQUksQ0FBQyw0RUFBNEUsQ0FBQyxDQUFDO1lBQ25GLElBQUk7Z0JBQ0YsTUFBTSxzQkFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDOUM7WUFBQyxNQUFNO2dCQUNOLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFDRCxPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsSUFBSSxNQUFNLDJCQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFBRTtZQUNyRCxlQUFLLENBQUMsdUJBQXVCLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDMUMsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELGVBQUssQ0FBQyxhQUFHLENBQUMsbUNBQW1DLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMzRCxNQUFNLFdBQVcsR0FBRyxNQUFNLHVCQUFhLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUMvRSxJQUFJLFdBQVcsRUFBRTtZQUNmLGVBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBQzdCLElBQUk7Z0JBQ0YsTUFBTSxzQkFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDOUM7WUFBQyxNQUFNO2dCQUNOLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFDRCxPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0NBQ0Y7QUFwTUQsa0NBb01DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TGlzdENob2ljZU9wdGlvbnMsIHByb21wdH0gZnJvbSAnaW5xdWlyZXInO1xuXG5pbXBvcnQge3NwYXdufSBmcm9tICcuLi8uLi91dGlscy9jaGlsZC1wcm9jZXNzJztcbmltcG9ydCB7R2l0aHViQ29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtkZWJ1ZywgZXJyb3IsIGluZm8sIGxvZywgcHJvbXB0Q29uZmlybSwgcmVkLCB5ZWxsb3d9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtBdXRoZW50aWNhdGVkR2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvYXV0aGVudGljYXRlZC1naXQtY2xpZW50JztcbmltcG9ydCB7UmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcbmltcG9ydCB7QWN0aXZlUmVsZWFzZVRyYWlucywgZmV0Y2hBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi92ZXJzaW9uaW5nL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge25wbUlzTG9nZ2VkSW4sIG5wbUxvZ2luLCBucG1Mb2dvdXR9IGZyb20gJy4uL3ZlcnNpb25pbmcvbnBtLXB1Ymxpc2gnO1xuaW1wb3J0IHtwcmludEFjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uL3ZlcnNpb25pbmcvcHJpbnQtYWN0aXZlLXRyYWlucyc7XG5pbXBvcnQge2dldE5leHRCcmFuY2hOYW1lLCBSZWxlYXNlUmVwb1dpdGhBcGl9IGZyb20gJy4uL3ZlcnNpb25pbmcvdmVyc2lvbi1icmFuY2hlcyc7XG5cbmltcG9ydCB7UmVsZWFzZUFjdGlvbn0gZnJvbSAnLi9hY3Rpb25zJztcbmltcG9ydCB7RmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IsIFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yfSBmcm9tICcuL2FjdGlvbnMtZXJyb3InO1xuaW1wb3J0IHthY3Rpb25zfSBmcm9tICcuL2FjdGlvbnMvaW5kZXgnO1xuXG5leHBvcnQgZW51bSBDb21wbGV0aW9uU3RhdGUge1xuICBTVUNDRVNTLFxuICBGQVRBTF9FUlJPUixcbiAgTUFOVUFMTFlfQUJPUlRFRCxcbn1cblxuZXhwb3J0IGNsYXNzIFJlbGVhc2VUb29sIHtcbiAgLyoqIFRoZSBzaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIGF1dGhlbnRpY2F0ZWQgZ2l0IGNsaWVudC4gKi9cbiAgcHJpdmF0ZSBfZ2l0ID0gQXV0aGVudGljYXRlZEdpdENsaWVudC5nZXQoKTtcbiAgLyoqIFRoZSBwcmV2aW91cyBnaXQgY29tbWl0IHRvIHJldHVybiBiYWNrIHRvIGFmdGVyIHRoZSByZWxlYXNlIHRvb2wgcnVucy4gKi9cbiAgcHJpdmF0ZSBwcmV2aW91c0dpdEJyYW5jaE9yUmV2aXNpb24gPSB0aGlzLl9naXQuZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcm90ZWN0ZWQgX2NvbmZpZzogUmVsZWFzZUNvbmZpZyxcbiAgICBwcm90ZWN0ZWQgX2dpdGh1YjogR2l0aHViQ29uZmlnLFxuICAgIHByb3RlY3RlZCBfcHJvamVjdFJvb3Q6IHN0cmluZyxcbiAgKSB7fVxuXG4gIC8qKiBSdW5zIHRoZSBpbnRlcmFjdGl2ZSByZWxlYXNlIHRvb2wuICovXG4gIGFzeW5jIHJ1bigpOiBQcm9taXNlPENvbXBsZXRpb25TdGF0ZT4ge1xuICAgIGxvZygpO1xuICAgIGxvZyh5ZWxsb3coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJykpO1xuICAgIGxvZyh5ZWxsb3coJyAgQW5ndWxhciBEZXYtSW5mcmEgcmVsZWFzZSBzdGFnaW5nIHNjcmlwdCcpKTtcbiAgICBsb2coeWVsbG93KCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpKTtcbiAgICBsb2coKTtcblxuICAgIGNvbnN0IHtvd25lciwgbmFtZX0gPSB0aGlzLl9naXRodWI7XG4gICAgY29uc3QgbmV4dEJyYW5jaE5hbWUgPSBnZXROZXh0QnJhbmNoTmFtZSh0aGlzLl9naXRodWIpO1xuXG4gICAgaWYgKFxuICAgICAgIShhd2FpdCB0aGlzLl92ZXJpZnlFbnZpcm9ubWVudEhhc1B5dGhvbjNTeW1saW5rKCkpIHx8XG4gICAgICAhKGF3YWl0IHRoaXMuX3ZlcmlmeU5vVW5jb21taXR0ZWRDaGFuZ2VzKCkpIHx8XG4gICAgICAhKGF3YWl0IHRoaXMuX3ZlcmlmeVJ1bm5pbmdGcm9tTmV4dEJyYW5jaChuZXh0QnJhbmNoTmFtZSkpXG4gICAgKSB7XG4gICAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLkZBVEFMX0VSUk9SO1xuICAgIH1cblxuICAgIGlmICghKGF3YWl0IHRoaXMuX3ZlcmlmeU5wbUxvZ2luU3RhdGUoKSkpIHtcbiAgICAgIHJldHVybiBDb21wbGV0aW9uU3RhdGUuTUFOVUFMTFlfQUJPUlRFRDtcbiAgICB9XG5cbiAgICBjb25zdCByZXBvOiBSZWxlYXNlUmVwb1dpdGhBcGkgPSB7b3duZXIsIG5hbWUsIGFwaTogdGhpcy5fZ2l0LmdpdGh1YiwgbmV4dEJyYW5jaE5hbWV9O1xuICAgIGNvbnN0IHJlbGVhc2VUcmFpbnMgPSBhd2FpdCBmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnMocmVwbyk7XG5cbiAgICAvLyBQcmludCB0aGUgYWN0aXZlIHJlbGVhc2UgdHJhaW5zIHNvIHRoYXQgdGhlIGNhcmV0YWtlciBjYW4gYWNjZXNzXG4gICAgLy8gdGhlIGN1cnJlbnQgcHJvamVjdCBicmFuY2hpbmcgc3RhdGUgd2l0aG91dCBzd2l0Y2hpbmcgY29udGV4dC5cbiAgICBhd2FpdCBwcmludEFjdGl2ZVJlbGVhc2VUcmFpbnMocmVsZWFzZVRyYWlucywgdGhpcy5fY29uZmlnKTtcblxuICAgIGNvbnN0IGFjdGlvbiA9IGF3YWl0IHRoaXMuX3Byb21wdEZvclJlbGVhc2VBY3Rpb24ocmVsZWFzZVRyYWlucyk7XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgYWN0aW9uLnBlcmZvcm0oKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yKSB7XG4gICAgICAgIHJldHVybiBDb21wbGV0aW9uU3RhdGUuTUFOVUFMTFlfQUJPUlRFRDtcbiAgICAgIH1cbiAgICAgIC8vIE9ubHkgcHJpbnQgdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHN0YWNrIGlmIHRoZSBlcnJvciBpcyBub3QgYSBrbm93biBmYXRhbCByZWxlYXNlXG4gICAgICAvLyBhY3Rpb24gZXJyb3IgKGZvciB3aGljaCB3ZSBwcmludCB0aGUgZXJyb3IgZ3JhY2VmdWxseSB0byB0aGUgY29uc29sZSB3aXRoIGNvbG9ycykuXG4gICAgICBpZiAoIShlIGluc3RhbmNlb2YgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IpICYmIGUgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5GQVRBTF9FUlJPUjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgYXdhaXQgdGhpcy5jbGVhbnVwKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5TVUNDRVNTO1xuICB9XG5cbiAgLyoqIFJ1biBwb3N0IHJlbGVhc2UgdG9vbCBjbGVhbnVwcy4gKi9cbiAgcHJpdmF0ZSBhc3luYyBjbGVhbnVwKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFJldHVybiBiYWNrIHRvIHRoZSBnaXQgc3RhdGUgZnJvbSBiZWZvcmUgdGhlIHJlbGVhc2UgdG9vbCByYW4uXG4gICAgdGhpcy5fZ2l0LmNoZWNrb3V0KHRoaXMucHJldmlvdXNHaXRCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcbiAgICAvLyBFbnN1cmUgbG9nIG91dCBvZiBOUE0uXG4gICAgYXdhaXQgbnBtTG9nb3V0KHRoaXMuX2NvbmZpZy5wdWJsaXNoUmVnaXN0cnkpO1xuICB9XG5cbiAgLyoqIFByb21wdHMgdGhlIGNhcmV0YWtlciBmb3IgYSByZWxlYXNlIGFjdGlvbiB0aGF0IHNob3VsZCBiZSBwZXJmb3JtZWQuICovXG4gIHByaXZhdGUgYXN5bmMgX3Byb21wdEZvclJlbGVhc2VBY3Rpb24oYWN0aXZlVHJhaW5zOiBBY3RpdmVSZWxlYXNlVHJhaW5zKSB7XG4gICAgY29uc3QgY2hvaWNlczogTGlzdENob2ljZU9wdGlvbnNbXSA9IFtdO1xuXG4gICAgLy8gRmluZCBhbmQgaW5zdGFudGlhdGUgYWxsIHJlbGVhc2UgYWN0aW9ucyB3aGljaCBhcmUgY3VycmVudGx5IHZhbGlkLlxuICAgIGZvciAobGV0IGFjdGlvblR5cGUgb2YgYWN0aW9ucykge1xuICAgICAgaWYgKGF3YWl0IGFjdGlvblR5cGUuaXNBY3RpdmUoYWN0aXZlVHJhaW5zLCB0aGlzLl9jb25maWcpKSB7XG4gICAgICAgIGNvbnN0IGFjdGlvbjogUmVsZWFzZUFjdGlvbiA9IG5ldyBhY3Rpb25UeXBlKFxuICAgICAgICAgIGFjdGl2ZVRyYWlucyxcbiAgICAgICAgICB0aGlzLl9naXQsXG4gICAgICAgICAgdGhpcy5fY29uZmlnLFxuICAgICAgICAgIHRoaXMuX3Byb2plY3RSb290LFxuICAgICAgICApO1xuICAgICAgICBjaG9pY2VzLnB1c2goe25hbWU6IGF3YWl0IGFjdGlvbi5nZXREZXNjcmlwdGlvbigpLCB2YWx1ZTogYWN0aW9ufSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaW5mbygnUGxlYXNlIHNlbGVjdCB0aGUgdHlwZSBvZiByZWxlYXNlIHlvdSB3YW50IHRvIHBlcmZvcm0uJyk7XG5cbiAgICBjb25zdCB7cmVsZWFzZUFjdGlvbn0gPSBhd2FpdCBwcm9tcHQ8e3JlbGVhc2VBY3Rpb246IFJlbGVhc2VBY3Rpb259Pih7XG4gICAgICBuYW1lOiAncmVsZWFzZUFjdGlvbicsXG4gICAgICBtZXNzYWdlOiAnUGxlYXNlIHNlbGVjdCBhbiBhY3Rpb246JyxcbiAgICAgIHR5cGU6ICdsaXN0JyxcbiAgICAgIGNob2ljZXMsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVsZWFzZUFjdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZmllcyB0aGF0IHRoZXJlIGFyZSBubyB1bmNvbW1pdHRlZCBjaGFuZ2VzIGluIHRoZSBwcm9qZWN0LlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyBzdWNjZXNzIG9yIGZhaWx1cmUuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlOb1VuY29tbWl0dGVkQ2hhbmdlcygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAodGhpcy5fZ2l0Lmhhc1VuY29tbWl0dGVkQ2hhbmdlcygpKSB7XG4gICAgICBlcnJvcihyZWQoJyAg4pyYICAgVGhlcmUgYXJlIGNoYW5nZXMgd2hpY2ggYXJlIG5vdCBjb21taXR0ZWQgYW5kIHNob3VsZCBiZSBkaXNjYXJkZWQuJykpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZmllcyB0aGF0IFB5dGhvbiBjYW4gYmUgcmVzb2x2ZWQgd2l0aGluIHNjcmlwdHMgYW5kIHBvaW50cyB0byBhIGNvbXBhdGlibGUgdmVyc2lvbi4gUHl0aG9uXG4gICAqIGlzIHJlcXVpcmVkIGluIEJhemVsIGFjdGlvbnMgYXMgdGhlcmUgY2FuIGJlIHRvb2xzIChzdWNoIGFzIGBza3lkb2NgKSB0aGF0IHJlbHkgb24gaXQuXG4gICAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHN1Y2Nlc3Mgb3IgZmFpbHVyZS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeUVudmlyb25tZW50SGFzUHl0aG9uM1N5bWxpbmsoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIE5vdGU6IFdlIGRvIG5vdCByZWx5IG9uIGAvdXNyL2Jpbi9lbnZgIGJ1dCByYXRoZXIgYWNjZXNzIHRoZSBgZW52YCBiaW5hcnkgZGlyZWN0bHkgYXMgaXRcbiAgICAgIC8vIHNob3VsZCBiZSBwYXJ0IG9mIHRoZSBzaGVsbCdzIGAkUEFUSGAuIFRoaXMgaXMgbmVjZXNzYXJ5IGZvciBjb21wYXRpYmlsaXR5IHdpdGggV2luZG93cy5cbiAgICAgIGNvbnN0IHB5VmVyc2lvbiA9IGF3YWl0IHNwYXduKCdlbnYnLCBbJ3B5dGhvbicsICctLXZlcnNpb24nXSwge21vZGU6ICdzaWxlbnQnfSk7XG4gICAgICBjb25zdCB2ZXJzaW9uID0gcHlWZXJzaW9uLnN0ZG91dC50cmltKCkgfHwgcHlWZXJzaW9uLnN0ZGVyci50cmltKCk7XG4gICAgICBpZiAodmVyc2lvbi5zdGFydHNXaXRoKCdQeXRob24gMy4nKSkge1xuICAgICAgICBkZWJ1ZyhgTG9jYWwgcHl0aG9uIHZlcnNpb246ICR7dmVyc2lvbn1gKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBlcnJvcihyZWQoYCAg4pyYICAgXFxgL3Vzci9iaW4vcHl0aG9uXFxgIGlzIGN1cnJlbnRseSBzeW1saW5rZWQgdG8gXCIke3ZlcnNpb259XCIsIHBsZWFzZSB1cGRhdGVgKSk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgIHRoZSBzeW1saW5rIHRvIGxpbmsgaW5zdGVhZCB0byBQeXRob24zJykpO1xuICAgICAgZXJyb3IoKTtcbiAgICAgIGVycm9yKHJlZCgnICAgICAgR29vZ2xlcnM6IHBsZWFzZSBydW4gdGhlIGZvbGxvd2luZyBjb21tYW5kIHRvIHN5bWxpbmsgcHl0aG9uIHRvIHB5dGhvbjM6JykpO1xuICAgICAgZXJyb3IocmVkKCcgICAgICAgIHN1ZG8gbG4gLXMgL3Vzci9iaW4vcHl0aG9uMyAvdXNyL2Jpbi9weXRob24nKSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBjYXRjaCB7XG4gICAgICBlcnJvcihyZWQoJyAg4pyYICAgYC91c3IvYmluL3B5dGhvbmAgZG9lcyBub3QgZXhpc3QsIHBsZWFzZSBlbnN1cmUgYC91c3IvYmluL3B5dGhvbmAgaXMnKSk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgIHN5bWxpbmtlZCB0byBQeXRob24zLicpKTtcbiAgICAgIGVycm9yKCk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgIEdvb2dsZXJzOiBwbGVhc2UgcnVuIHRoZSBmb2xsb3dpbmcgY29tbWFuZCB0byBzeW1saW5rIHB5dGhvbiB0byBweXRob24zOicpKTtcbiAgICAgIGVycm9yKHJlZCgnICAgICAgICBzdWRvIGxuIC1zIC91c3IvYmluL3B5dGhvbjMgL3Vzci9iaW4vcHl0aG9uJykpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgdGhhdCB0aGUgbmV4dCBicmFuY2ggZnJvbSB0aGUgY29uZmlndXJlZCByZXBvc2l0b3J5IGlzIGNoZWNrZWQgb3V0LlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyBzdWNjZXNzIG9yIGZhaWx1cmUuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlSdW5uaW5nRnJvbU5leHRCcmFuY2gobmV4dEJyYW5jaE5hbWU6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGhlYWRTaGEgPSB0aGlzLl9naXQucnVuKFsncmV2LXBhcnNlJywgJ0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgICBjb25zdCB7ZGF0YX0gPSBhd2FpdCB0aGlzLl9naXQuZ2l0aHViLnJlcG9zLmdldEJyYW5jaCh7XG4gICAgICAuLi50aGlzLl9naXQucmVtb3RlUGFyYW1zLFxuICAgICAgYnJhbmNoOiB0aGlzLl9naXQubWFpbkJyYW5jaE5hbWUsXG4gICAgfSk7XG5cbiAgICBpZiAoaGVhZFNoYSAhPT0gZGF0YS5jb21taXQuc2hhKSB7XG4gICAgICBlcnJvcihyZWQoJyAg4pyYICAgUnVubmluZyByZWxlYXNlIHRvb2wgZnJvbSBhbiBvdXRkYXRlZCBsb2NhbCBicmFuY2guJykpO1xuICAgICAgZXJyb3IocmVkKGAgICAgICBQbGVhc2UgbWFrZSBzdXJlIHlvdSBhcmUgcnVubmluZyBmcm9tIHRoZSBcIiR7bmV4dEJyYW5jaE5hbWV9XCIgYnJhbmNoLmApKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgdGhhdCB0aGUgdXNlciBpcyBsb2dnZWQgaW50byBOUE0gYXQgdGhlIGNvcnJlY3QgcmVnaXN0cnksIGlmIGRlZmluZWQgZm9yIHRoZSByZWxlYXNlLlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSB1c2VyIGlzIGxvZ2dlZCBpbnRvIE5QTS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeU5wbUxvZ2luU3RhdGUoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgcmVnaXN0cnkgPSBgTlBNIGF0IHRoZSAke3RoaXMuX2NvbmZpZy5wdWJsaXNoUmVnaXN0cnkgPz8gJ2RlZmF1bHQgTlBNJ30gcmVnaXN0cnlgO1xuICAgIC8vIFRPRE8oam9zZXBocGVycm90dCk6IHJlbW92ZSB3b21iYXQgc3BlY2lmaWMgYmxvY2sgb25jZSB3b21ib3QgYWxsb3dzIGBucG0gd2hvYW1pYCBjaGVjayB0b1xuICAgIC8vIGNoZWNrIHRoZSBzdGF0dXMgb2YgdGhlIGxvY2FsIHRva2VuIGluIHRoZSAubnBtcmMgZmlsZS5cbiAgICBpZiAodGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeT8uaW5jbHVkZXMoJ3dvbWJhdC1kcmVzc2luZy1yb29tLmFwcHNwb3QuY29tJykpIHtcbiAgICAgIGluZm8oJ1VuYWJsZSB0byBkZXRlcm1pbmUgTlBNIGxvZ2luIHN0YXRlIGZvciB3b21iYXQgcHJveHksIHJlcXVpcmluZyBsb2dpbiBub3cuJyk7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBucG1Mb2dpbih0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5KTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGF3YWl0IG5wbUlzTG9nZ2VkSW4odGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSkpIHtcbiAgICAgIGRlYnVnKGBBbHJlYWR5IGxvZ2dlZCBpbnRvICR7cmVnaXN0cnl9LmApO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGVycm9yKHJlZChgICDinJggICBOb3QgY3VycmVudGx5IGxvZ2dlZCBpbnRvICR7cmVnaXN0cnl9LmApKTtcbiAgICBjb25zdCBzaG91bGRMb2dpbiA9IGF3YWl0IHByb21wdENvbmZpcm0oJ1dvdWxkIHlvdSBsaWtlIHRvIGxvZyBpbnRvIE5QTSBub3c/Jyk7XG4gICAgaWYgKHNob3VsZExvZ2luKSB7XG4gICAgICBkZWJ1ZygnU3RhcnRpbmcgTlBNIGxvZ2luLicpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgbnBtTG9naW4odGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIl19