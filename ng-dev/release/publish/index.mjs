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
const external_commands_1 = require("./external-commands");
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
            !(await this._verifyInstalledDependenciesAreUpToDate())) {
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
     * Verifiy that the install dependencies match the the versions defined in the package.json and
     * yarn.lock files.
     * @returns a boolean indicating success or failure.
     */
    async _verifyInstalledDependenciesAreUpToDate() {
        try {
            await (0, external_commands_1.invokeYarnVerifyTreeCheck)(this._projectRoot);
            await (0, external_commands_1.invokeYarnIntegryCheck)(this._projectRoot);
            return true;
        }
        catch {
            return false;
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS9wdWJsaXNoL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILHVDQUFtRDtBQUVuRCxpREFBd0Y7QUFHeEYsK0VBQWtHO0FBQ2xHLDJEQUE2RTtBQUM3RSwyRUFBMkU7QUFDM0UscUVBQXFGO0FBR3JGLG1EQUF1RjtBQUN2RiwyQ0FBd0M7QUFDeEMsMkRBQXNGO0FBRXRGLElBQVksZUFJWDtBQUpELFdBQVksZUFBZTtJQUN6QiwyREFBTyxDQUFBO0lBQ1AsbUVBQVcsQ0FBQTtJQUNYLDZFQUFnQixDQUFBO0FBQ2xCLENBQUMsRUFKVyxlQUFlLEdBQWYsdUJBQWUsS0FBZix1QkFBZSxRQUkxQjtBQUVELE1BQWEsV0FBVztJQUl0QixZQUNZLElBQTRCLEVBQzVCLE9BQXNCLEVBQ3RCLE9BQXFCLEVBQ3JCLFlBQW9CO1FBSHBCLFNBQUksR0FBSixJQUFJLENBQXdCO1FBQzVCLFlBQU8sR0FBUCxPQUFPLENBQWU7UUFDdEIsWUFBTyxHQUFQLE9BQU8sQ0FBYztRQUNyQixpQkFBWSxHQUFaLFlBQVksQ0FBUTtRQVBoQyw2RUFBNkU7UUFDckUsZ0NBQTJCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0lBTzFFLENBQUM7SUFFSix5Q0FBeUM7SUFDekMsS0FBSyxDQUFDLEdBQUc7UUFDUCxJQUFBLGFBQUcsR0FBRSxDQUFDO1FBQ04sSUFBQSxhQUFHLEVBQUMsSUFBQSxnQkFBTSxFQUFDLDhDQUE4QyxDQUFDLENBQUMsQ0FBQztRQUM1RCxJQUFBLGFBQUcsRUFBQyxJQUFBLGdCQUFNLEVBQUMsNENBQTRDLENBQUMsQ0FBQyxDQUFDO1FBQzFELElBQUEsYUFBRyxFQUFDLElBQUEsZ0JBQU0sRUFBQyw4Q0FBOEMsQ0FBQyxDQUFDLENBQUM7UUFDNUQsSUFBQSxhQUFH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QUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxRQUFRLENBQUMsa0NBQWtDLENBQUMsRUFBRTtZQUM5RSxJQUFBLGNBQUksRUFBQyw0RUFBNEUsQ0FBQyxDQUFDO1lBQ25GLElBQUk7Z0JBQ0YsTUFBTSxJQUFBLHNCQUFRLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQzthQUM5QztZQUFDLE1BQU07Z0JBQ04sT0FBTyxLQUFLLENBQUM7YUFDZDtZQUNELE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxJQUFJLE1BQU0sSUFBQSwyQkFBYSxFQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUU7WUFDckQsSUFBQSxlQUFLLEVBQUMsdUJBQXVCLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDMUMsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELElBQUEsZUFBSyxFQUFDLElBQUEsYUFBRyxFQUFDLG1DQUFtQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDM0QsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFBLHVCQUFhLEVBQUMscUNBQXFDLENBQUMsQ0FBQztRQUMvRSxJQUFJLFdBQVcsRUFBRTtZQUNmLElBQUEsZUFBSyxFQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDN0IsSUFBSTtnQkFDRixNQUFNLElBQUEsc0JBQVEsRUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2FBQzlDO1lBQUMsTUFBTTtnQkFDTixPQUFPLEtBQUssQ0FBQzthQUNkO1lBQ0QsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztDQUNGO0FBM01ELGtDQTJNQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0xpc3RDaG9pY2VPcHRpb25zLCBwcm9tcHR9IGZyb20gJ2lucXVpcmVyJztcbmltcG9ydCB7R2l0aHViQ29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtkZWJ1ZywgZXJyb3IsIGluZm8sIGxvZywgcHJvbXB0Q29uZmlybSwgcmVkLCB5ZWxsb3d9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtBdXRoZW50aWNhdGVkR2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvYXV0aGVudGljYXRlZC1naXQtY2xpZW50JztcbmltcG9ydCB7UmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcbmltcG9ydCB7QWN0aXZlUmVsZWFzZVRyYWlucywgZmV0Y2hBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi92ZXJzaW9uaW5nL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge25wbUlzTG9nZ2VkSW4sIG5wbUxvZ2luLCBucG1Mb2dvdXR9IGZyb20gJy4uL3ZlcnNpb25pbmcvbnBtLXB1Ymxpc2gnO1xuaW1wb3J0IHtwcmludEFjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uL3ZlcnNpb25pbmcvcHJpbnQtYWN0aXZlLXRyYWlucyc7XG5pbXBvcnQge2dldE5leHRCcmFuY2hOYW1lLCBSZWxlYXNlUmVwb1dpdGhBcGl9IGZyb20gJy4uL3ZlcnNpb25pbmcvdmVyc2lvbi1icmFuY2hlcyc7XG5cbmltcG9ydCB7UmVsZWFzZUFjdGlvbn0gZnJvbSAnLi9hY3Rpb25zJztcbmltcG9ydCB7RmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IsIFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yfSBmcm9tICcuL2FjdGlvbnMtZXJyb3InO1xuaW1wb3J0IHthY3Rpb25zfSBmcm9tICcuL2FjdGlvbnMvaW5kZXgnO1xuaW1wb3J0IHtpbnZva2VZYXJuSW50ZWdyeUNoZWNrLCBpbnZva2VZYXJuVmVyaWZ5VHJlZUNoZWNrfSBmcm9tICcuL2V4dGVybmFsLWNvbW1hbmRzJztcblxuZXhwb3J0IGVudW0gQ29tcGxldGlvblN0YXRlIHtcbiAgU1VDQ0VTUyxcbiAgRkFUQUxfRVJST1IsXG4gIE1BTlVBTExZX0FCT1JURUQsXG59XG5cbmV4cG9ydCBjbGFzcyBSZWxlYXNlVG9vbCB7XG4gIC8qKiBUaGUgcHJldmlvdXMgZ2l0IGNvbW1pdCB0byByZXR1cm4gYmFjayB0byBhZnRlciB0aGUgcmVsZWFzZSB0b29sIHJ1bnMuICovXG4gIHByaXZhdGUgcHJldmlvdXNHaXRCcmFuY2hPclJldmlzaW9uID0gdGhpcy5fZ2l0LmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIF9naXQ6IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQsXG4gICAgcHJvdGVjdGVkIF9jb25maWc6IFJlbGVhc2VDb25maWcsXG4gICAgcHJvdGVjdGVkIF9naXRodWI6IEdpdGh1YkNvbmZpZyxcbiAgICBwcm90ZWN0ZWQgX3Byb2plY3RSb290OiBzdHJpbmcsXG4gICkge31cblxuICAvKiogUnVucyB0aGUgaW50ZXJhY3RpdmUgcmVsZWFzZSB0b29sLiAqL1xuICBhc3luYyBydW4oKTogUHJvbWlzZTxDb21wbGV0aW9uU3RhdGU+IHtcbiAgICBsb2coKTtcbiAgICBsb2coeWVsbG93KCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpKTtcbiAgICBsb2coeWVsbG93KCcgIEFuZ3VsYXIgRGV2LUluZnJhIHJlbGVhc2Ugc3RhZ2luZyBzY3JpcHQnKSk7XG4gICAgbG9nKHllbGxvdygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKSk7XG4gICAgbG9nKCk7XG5cbiAgICBjb25zdCB7b3duZXIsIG5hbWV9ID0gdGhpcy5fZ2l0aHViO1xuICAgIGNvbnN0IG5leHRCcmFuY2hOYW1lID0gZ2V0TmV4dEJyYW5jaE5hbWUodGhpcy5fZ2l0aHViKTtcblxuICAgIGlmIChcbiAgICAgICEoYXdhaXQgdGhpcy5fdmVyaWZ5Tm9VbmNvbW1pdHRlZENoYW5nZXMoKSkgfHxcbiAgICAgICEoYXdhaXQgdGhpcy5fdmVyaWZ5UnVubmluZ0Zyb21OZXh0QnJhbmNoKG5leHRCcmFuY2hOYW1lKSkgfHxcbiAgICAgICEoYXdhaXQgdGhpcy5fdmVyaWZ5Tm9TaGFsbG93UmVwb3NpdG9yeSgpKSB8fFxuICAgICAgIShhd2FpdCB0aGlzLl92ZXJpZnlJbnN0YWxsZWREZXBlbmRlbmNpZXNBcmVVcFRvRGF0ZSgpKVxuICAgICkge1xuICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5GQVRBTF9FUlJPUjtcbiAgICB9XG5cbiAgICBpZiAoIShhd2FpdCB0aGlzLl92ZXJpZnlOcG1Mb2dpblN0YXRlKCkpKSB7XG4gICAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLk1BTlVBTExZX0FCT1JURUQ7XG4gICAgfVxuXG4gICAgLy8gU2V0IHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZSB0byBza2lwIGFsbCBnaXQgY29tbWl0IGhvb2tzIHRyaWdnZXJlZCBieSBodXNreS4gV2UgYXJlIHVuYWJsZSB0b1xuICAgIC8vIHJlbHkgb24gYC0tbm8tdmVyaWZ5YCBhcyBzb21lIGhvb2tzIHN0aWxsIHJ1biwgbm90YWJseSB0aGUgYHByZXBhcmUtY29tbWl0LW1zZ2AgaG9vay5cbiAgICAvLyBSdW5uaW5nIGhvb2tzIGhhcyB0aGUgZG93bnNpZGUgb2YgcG90ZW50aWFsbHkgcnVubmluZyBjb2RlIChsaWtlIHRoZSBgbmctZGV2YCB0b29sKSB3aGVuIGEgdmVyc2lvblxuICAgIC8vIGJyYW5jaCBpcyBjaGVja2VkIG91dCwgYnV0IHRoZSBub2RlIG1vZHVsZXMgYXJlIG5vdCByZS1pbnN0YWxsZWQuIFRoZSB0b29sIHN3aXRjaGVzIGJyYW5jaGVzXG4gICAgLy8gbXVsdGlwbGUgdGltZXMgcGVyIGV4ZWN1dGlvbiwgYW5kIGl0IGlzIG5vdCBkZXNpcmFibGUgcmUtcnVubmluZyBZYXJuIGFsbCB0aGUgdGltZS5cbiAgICBwcm9jZXNzLmVudlsnSFVTS1knXSA9ICcwJztcblxuICAgIGNvbnN0IHJlcG86IFJlbGVhc2VSZXBvV2l0aEFwaSA9IHtvd25lciwgbmFtZSwgYXBpOiB0aGlzLl9naXQuZ2l0aHViLCBuZXh0QnJhbmNoTmFtZX07XG4gICAgY29uc3QgcmVsZWFzZVRyYWlucyA9IGF3YWl0IGZldGNoQWN0aXZlUmVsZWFzZVRyYWlucyhyZXBvKTtcblxuICAgIC8vIFByaW50IHRoZSBhY3RpdmUgcmVsZWFzZSB0cmFpbnMgc28gdGhhdCB0aGUgY2FyZXRha2VyIGNhbiBhY2Nlc3NcbiAgICAvLyB0aGUgY3VycmVudCBwcm9qZWN0IGJyYW5jaGluZyBzdGF0ZSB3aXRob3V0IHN3aXRjaGluZyBjb250ZXh0LlxuICAgIGF3YWl0IHByaW50QWN0aXZlUmVsZWFzZVRyYWlucyhyZWxlYXNlVHJhaW5zLCB0aGlzLl9jb25maWcpO1xuXG4gICAgY29uc3QgYWN0aW9uID0gYXdhaXQgdGhpcy5fcHJvbXB0Rm9yUmVsZWFzZUFjdGlvbihyZWxlYXNlVHJhaW5zKTtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBhY3Rpb24ucGVyZm9ybSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlIGluc3RhbmNlb2YgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5NQU5VQUxMWV9BQk9SVEVEO1xuICAgICAgfVxuICAgICAgLy8gT25seSBwcmludCB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgc3RhY2sgaWYgdGhlIGVycm9yIGlzIG5vdCBhIGtub3duIGZhdGFsIHJlbGVhc2VcbiAgICAgIC8vIGFjdGlvbiBlcnJvciAoZm9yIHdoaWNoIHdlIHByaW50IHRoZSBlcnJvciBncmFjZWZ1bGx5IHRvIHRoZSBjb25zb2xlIHdpdGggY29sb3JzKS5cbiAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcikgJiYgZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLkZBVEFMX0VSUk9SO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBhd2FpdCB0aGlzLmNsZWFudXAoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLlNVQ0NFU1M7XG4gIH1cblxuICAvKiogUnVuIHBvc3QgcmVsZWFzZSB0b29sIGNsZWFudXBzLiAqL1xuICBwcml2YXRlIGFzeW5jIGNsZWFudXAoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gUmV0dXJuIGJhY2sgdG8gdGhlIGdpdCBzdGF0ZSBmcm9tIGJlZm9yZSB0aGUgcmVsZWFzZSB0b29sIHJhbi5cbiAgICB0aGlzLl9naXQuY2hlY2tvdXQodGhpcy5wcmV2aW91c0dpdEJyYW5jaE9yUmV2aXNpb24sIHRydWUpO1xuICAgIC8vIEVuc3VyZSBsb2cgb3V0IG9mIE5QTS5cbiAgICBhd2FpdCBucG1Mb2dvdXQodGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSk7XG4gIH1cblxuICAvKiogUHJvbXB0cyB0aGUgY2FyZXRha2VyIGZvciBhIHJlbGVhc2UgYWN0aW9uIHRoYXQgc2hvdWxkIGJlIHBlcmZvcm1lZC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfcHJvbXB0Rm9yUmVsZWFzZUFjdGlvbihhY3RpdmVUcmFpbnM6IEFjdGl2ZVJlbGVhc2VUcmFpbnMpIHtcbiAgICBjb25zdCBjaG9pY2VzOiBMaXN0Q2hvaWNlT3B0aW9uc1tdID0gW107XG5cbiAgICAvLyBGaW5kIGFuZCBpbnN0YW50aWF0ZSBhbGwgcmVsZWFzZSBhY3Rpb25zIHdoaWNoIGFyZSBjdXJyZW50bHkgdmFsaWQuXG4gICAgZm9yIChsZXQgYWN0aW9uVHlwZSBvZiBhY3Rpb25zKSB7XG4gICAgICBpZiAoYXdhaXQgYWN0aW9uVHlwZS5pc0FjdGl2ZShhY3RpdmVUcmFpbnMsIHRoaXMuX2NvbmZpZykpIHtcbiAgICAgICAgY29uc3QgYWN0aW9uOiBSZWxlYXNlQWN0aW9uID0gbmV3IGFjdGlvblR5cGUoXG4gICAgICAgICAgYWN0aXZlVHJhaW5zLFxuICAgICAgICAgIHRoaXMuX2dpdCxcbiAgICAgICAgICB0aGlzLl9jb25maWcsXG4gICAgICAgICAgdGhpcy5fcHJvamVjdFJvb3QsXG4gICAgICAgICk7XG4gICAgICAgIGNob2ljZXMucHVzaCh7bmFtZTogYXdhaXQgYWN0aW9uLmdldERlc2NyaXB0aW9uKCksIHZhbHVlOiBhY3Rpb259KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpbmZvKCdQbGVhc2Ugc2VsZWN0IHRoZSB0eXBlIG9mIHJlbGVhc2UgeW91IHdhbnQgdG8gcGVyZm9ybS4nKTtcblxuICAgIGNvbnN0IHtyZWxlYXNlQWN0aW9ufSA9IGF3YWl0IHByb21wdDx7cmVsZWFzZUFjdGlvbjogUmVsZWFzZUFjdGlvbn0+KHtcbiAgICAgIG5hbWU6ICdyZWxlYXNlQWN0aW9uJyxcbiAgICAgIG1lc3NhZ2U6ICdQbGVhc2Ugc2VsZWN0IGFuIGFjdGlvbjonLFxuICAgICAgdHlwZTogJ2xpc3QnLFxuICAgICAgY2hvaWNlcyxcbiAgICB9KTtcblxuICAgIHJldHVybiByZWxlYXNlQWN0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIHRoYXQgdGhlcmUgYXJlIG5vIHVuY29tbWl0dGVkIGNoYW5nZXMgaW4gdGhlIHByb2plY3QuXG4gICAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHN1Y2Nlc3Mgb3IgZmFpbHVyZS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeU5vVW5jb21taXR0ZWRDaGFuZ2VzKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmICh0aGlzLl9naXQuaGFzVW5jb21taXR0ZWRDaGFuZ2VzKCkpIHtcbiAgICAgIGVycm9yKHJlZCgnICDinJggICBUaGVyZSBhcmUgY2hhbmdlcyB3aGljaCBhcmUgbm90IGNvbW1pdHRlZCBhbmQgc2hvdWxkIGJlIGRpc2NhcmRlZC4nKSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaXkgdGhhdCB0aGUgaW5zdGFsbCBkZXBlbmRlbmNpZXMgbWF0Y2ggdGhlIHRoZSB2ZXJzaW9ucyBkZWZpbmVkIGluIHRoZSBwYWNrYWdlLmpzb24gYW5kXG4gICAqIHlhcm4ubG9jayBmaWxlcy5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2VzcyBvciBmYWlsdXJlLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfdmVyaWZ5SW5zdGFsbGVkRGVwZW5kZW5jaWVzQXJlVXBUb0RhdGUoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGludm9rZVlhcm5WZXJpZnlUcmVlQ2hlY2sodGhpcy5fcHJvamVjdFJvb3QpO1xuICAgICAgYXdhaXQgaW52b2tlWWFybkludGVncnlDaGVjayh0aGlzLl9wcm9qZWN0Um9vdCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgdGhhdCB0aGUgbG9jYWwgcmVwb3NpdG9yeSBpcyBub3QgY29uZmlndXJlZCBhcyBzaGFsbG93LlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyBzdWNjZXNzIG9yIGZhaWx1cmUuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlOb1NoYWxsb3dSZXBvc2l0b3J5KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmICh0aGlzLl9naXQuaXNTaGFsbG93UmVwbygpKSB7XG4gICAgICBlcnJvcihyZWQoJyAg4pyYICAgVGhlIGxvY2FsIHJlcG9zaXRvcnkgaXMgY29uZmlndXJlZCBhcyBzaGFsbG93LicpKTtcbiAgICAgIGVycm9yKHJlZChgICAgICAgUGxlYXNlIGNvbnZlcnQgdGhlIHJlcG9zaXRvcnkgdG8gYSBjb21wbGV0ZSBvbmUgYnkgc3luY2luZyB3aXRoIHVwc3RyZWFtLmApKTtcbiAgICAgIGVycm9yKFxuICAgICAgICByZWQoYCAgICAgIGh0dHBzOi8vZ2l0LXNjbS5jb20vZG9jcy9naXQtZmV0Y2gjRG9jdW1lbnRhdGlvbi9naXQtZmV0Y2gudHh0LS0tdW5zaGFsbG93YCksXG4gICAgICApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZmllcyB0aGF0IHRoZSBuZXh0IGJyYW5jaCBmcm9tIHRoZSBjb25maWd1cmVkIHJlcG9zaXRvcnkgaXMgY2hlY2tlZCBvdXQuXG4gICAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHN1Y2Nlc3Mgb3IgZmFpbHVyZS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeVJ1bm5pbmdGcm9tTmV4dEJyYW5jaChuZXh0QnJhbmNoTmFtZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgaGVhZFNoYSA9IHRoaXMuX2dpdC5ydW4oWydyZXYtcGFyc2UnLCAnSEVBRCddKS5zdGRvdXQudHJpbSgpO1xuICAgIGNvbnN0IHtkYXRhfSA9IGF3YWl0IHRoaXMuX2dpdC5naXRodWIucmVwb3MuZ2V0QnJhbmNoKHtcbiAgICAgIC4uLnRoaXMuX2dpdC5yZW1vdGVQYXJhbXMsXG4gICAgICBicmFuY2g6IHRoaXMuX2dpdC5tYWluQnJhbmNoTmFtZSxcbiAgICB9KTtcblxuICAgIGlmIChoZWFkU2hhICE9PSBkYXRhLmNvbW1pdC5zaGEpIHtcbiAgICAgIGVycm9yKHJlZCgnICDinJggICBSdW5uaW5nIHJlbGVhc2UgdG9vbCBmcm9tIGFuIG91dGRhdGVkIGxvY2FsIGJyYW5jaC4nKSk7XG4gICAgICBlcnJvcihyZWQoYCAgICAgIFBsZWFzZSBtYWtlIHN1cmUgeW91IGFyZSBydW5uaW5nIGZyb20gdGhlIFwiJHtuZXh0QnJhbmNoTmFtZX1cIiBicmFuY2guYCkpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZmllcyB0aGF0IHRoZSB1c2VyIGlzIGxvZ2dlZCBpbnRvIE5QTSBhdCB0aGUgY29ycmVjdCByZWdpc3RyeSwgaWYgZGVmaW5lZCBmb3IgdGhlIHJlbGVhc2UuXG4gICAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIHVzZXIgaXMgbG9nZ2VkIGludG8gTlBNLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfdmVyaWZ5TnBtTG9naW5TdGF0ZSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCByZWdpc3RyeSA9IGBOUE0gYXQgdGhlICR7dGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSA/PyAnZGVmYXVsdCBOUE0nfSByZWdpc3RyeWA7XG4gICAgLy8gVE9ETyhqb3NlcGhwZXJyb3R0KTogcmVtb3ZlIHdvbWJhdCBzcGVjaWZpYyBibG9jayBvbmNlIHdvbWJvdCBhbGxvd3MgYG5wbSB3aG9hbWlgIGNoZWNrIHRvXG4gICAgLy8gY2hlY2sgdGhlIHN0YXR1cyBvZiB0aGUgbG9jYWwgdG9rZW4gaW4gdGhlIC5ucG1yYyBmaWxlLlxuICAgIGlmICh0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5Py5pbmNsdWRlcygnd29tYmF0LWRyZXNzaW5nLXJvb20uYXBwc3BvdC5jb20nKSkge1xuICAgICAgaW5mbygnVW5hYmxlIHRvIGRldGVybWluZSBOUE0gbG9naW4gc3RhdGUgZm9yIHdvbWJhdCBwcm94eSwgcmVxdWlyaW5nIGxvZ2luIG5vdy4nKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IG5wbUxvZ2luKHRoaXMuX2NvbmZpZy5wdWJsaXNoUmVnaXN0cnkpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoYXdhaXQgbnBtSXNMb2dnZWRJbih0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5KSkge1xuICAgICAgZGVidWcoYEFscmVhZHkgbG9nZ2VkIGludG8gJHtyZWdpc3RyeX0uYCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgZXJyb3IocmVkKGAgIOKcmCAgIE5vdCBjdXJyZW50bHkgbG9nZ2VkIGludG8gJHtyZWdpc3RyeX0uYCkpO1xuICAgIGNvbnN0IHNob3VsZExvZ2luID0gYXdhaXQgcHJvbXB0Q29uZmlybSgnV291bGQgeW91IGxpa2UgdG8gbG9nIGludG8gTlBNIG5vdz8nKTtcbiAgICBpZiAoc2hvdWxkTG9naW4pIHtcbiAgICAgIGRlYnVnKCdTdGFydGluZyBOUE0gbG9naW4uJyk7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBucG1Mb2dpbih0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5KTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iXX0=