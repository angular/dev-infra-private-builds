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
const path = require("path");
const fs = require("fs");
const inquirer_1 = require("inquirer");
const lockfile_1 = require("@yarnpkg/lockfile");
const console_1 = require("../../utils/console");
const active_release_trains_1 = require("../versioning/active-release-trains");
const npm_publish_1 = require("../versioning/npm-publish");
const print_active_trains_1 = require("../versioning/print-active-trains");
const version_branches_1 = require("../versioning/version-branches");
const constants_1 = require("../../utils/constants");
const actions_error_1 = require("./actions-error");
const index_1 = require("./actions/index");
const constants_2 = require("./constants");
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
        // The placeholder will be replaced by the `pkg_npm` substitutions.
        const expectedVersion = `0.0.0-8ac0a8fe87552a393d29f51cee3de8aef322d0d2`;
        const projectPackageJsonFile = path.join(this._projectRoot, constants_2.packageJsonPath);
        const projectDirLockFile = path.join(this._projectRoot, constants_2.yarnLockFilePath);
        try {
            const lockFileContent = fs.readFileSync(projectDirLockFile, 'utf8');
            const packageJson = JSON.parse(fs.readFileSync(projectPackageJsonFile, 'utf8'));
            const lockFile = (0, lockfile_1.parse)(lockFileContent);
            if (lockFile.type !== 'success') {
                throw Error('Unable to parse project lock file. Please ensure the file is valid.');
            }
            // If we are operating in the actual dev-infra repo, always return `true`.
            if (packageJson.name === constants_1.ngDevNpmPackageName) {
                return true;
            }
            const lockFileObject = lockFile.object;
            const devInfraPkgVersion = packageJson?.dependencies?.[constants_1.ngDevNpmPackageName] ??
                packageJson?.devDependencies?.[constants_1.ngDevNpmPackageName] ??
                packageJson?.optionalDependencies?.[constants_1.ngDevNpmPackageName];
            return (lockFileObject[`${constants_1.ngDevNpmPackageName}@${devInfraPkgVersion}`].version === expectedVersion);
        }
        catch (e) {
            (0, console_1.debug)('_verifyInstalledDependenciesAreUpToDate failed:', e);
            (0, console_1.error)((0, console_1.red)('  ✘   Your locally installed version of the `ng-dev` tool is outdated and not'));
            (0, console_1.error)((0, console_1.red)('      matching with the version in the `package.json` file.'));
            (0, console_1.error)((0, console_1.red)('      Please re-run `yarn install` to ensure you are using the latest version.'));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS9wdWJsaXNoL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILDZCQUE2QjtBQUM3Qix5QkFBeUI7QUFDekIsdUNBQW1EO0FBQ25ELGdEQUE2RTtBQUc3RSxpREFBd0Y7QUFHeEYsK0VBQWtHO0FBQ2xHLDJEQUE2RTtBQUM3RSwyRUFBMkU7QUFDM0UscUVBQXFGO0FBQ3JGLHFEQUEwRDtBQUcxRCxtREFBdUY7QUFDdkYsMkNBQXdDO0FBQ3hDLDJDQUE4RDtBQUU5RCxJQUFZLGVBSVg7QUFKRCxXQUFZLGVBQWU7SUFDekIsMkRBQU8sQ0FBQTtJQUNQLG1FQUFXLENBQUE7SUFDWCw2RUFBZ0IsQ0FBQTtBQUNsQixDQUFDLEVBSlcsZUFBZSxHQUFmLHVCQUFlLEtBQWYsdUJBQWUsUUFJMUI7QUFFRCxNQUFhLFdBQVc7SUFJdEIsWUFDWSxJQUE0QixFQUM1QixPQUFzQixFQUN0QixPQUFxQixFQUNyQixZQUFvQjtRQUhwQixTQUFJLEdBQUosSUFBSSxDQUF3QjtRQUM1QixZQUFPLEdBQVAsT0FBTyxDQUFlO1FBQ3RCLFlBQU8sR0FBUCxPQUFPLENBQWM7UUFDckIsaUJBQVksR0FBWixZQUFZLENBQVE7UUFQaEMsNkVBQTZFO1FBQ3JFLGdDQUEyQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztJQU8xRSxDQUFDO0lBRUoseUNBQXlDO0lBQ3pDLEtBQUssQ0FBQyxHQUFHO1FBQ1AsSUFBQSxhQUFHLEdBQUUsQ0FBQztRQUNOLElBQUEsYUFBRyxFQUFDLElBQUEsZ0JBQU0sRUFBQyw4Q0FBOEMsQ0FBQyxDQUFDLENBQUM7UUFDNUQsSUFBQSxhQUFHLEVBQUMsSUFBQSxnQkFBTSxFQUFDLDRDQUE0QyxDQUFDLENBQUMsQ0FBQztRQUMxRCxJQUFBLGFBQUcsRUFBQyxJ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QGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHtMaXN0Q2hvaWNlT3B0aW9ucywgcHJvbXB0fSBmcm9tICdpbnF1aXJlcic7XG5pbXBvcnQge3BhcnNlIGFzIHBhcnNlWWFybkxvY2tmaWxlLCBMb2NrRmlsZU9iamVjdH0gZnJvbSAnQHlhcm5wa2cvbG9ja2ZpbGUnO1xuXG5pbXBvcnQge0dpdGh1YkNvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZGVidWcsIGVycm9yLCBpbmZvLCBsb2csIHByb21wdENvbmZpcm0sIHJlZCwgeWVsbG93fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2F1dGhlbnRpY2F0ZWQtZ2l0LWNsaWVudCc7XG5pbXBvcnQge1JlbGVhc2VDb25maWd9IGZyb20gJy4uL2NvbmZpZy9pbmRleCc7XG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnMsIGZldGNoQWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtucG1Jc0xvZ2dlZEluLCBucG1Mb2dpbiwgbnBtTG9nb3V0fSBmcm9tICcuLi92ZXJzaW9uaW5nL25wbS1wdWJsaXNoJztcbmltcG9ydCB7cHJpbnRBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi92ZXJzaW9uaW5nL3ByaW50LWFjdGl2ZS10cmFpbnMnO1xuaW1wb3J0IHtnZXROZXh0QnJhbmNoTmFtZSwgUmVsZWFzZVJlcG9XaXRoQXBpfSBmcm9tICcuLi92ZXJzaW9uaW5nL3ZlcnNpb24tYnJhbmNoZXMnO1xuaW1wb3J0IHtuZ0Rldk5wbVBhY2thZ2VOYW1lfSBmcm9tICcuLi8uLi91dGlscy9jb25zdGFudHMnO1xuXG5pbXBvcnQge1JlbGVhc2VBY3Rpb259IGZyb20gJy4vYWN0aW9ucyc7XG5pbXBvcnQge0ZhdGFsUmVsZWFzZUFjdGlvbkVycm9yLCBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcn0gZnJvbSAnLi9hY3Rpb25zLWVycm9yJztcbmltcG9ydCB7YWN0aW9uc30gZnJvbSAnLi9hY3Rpb25zL2luZGV4JztcbmltcG9ydCB7cGFja2FnZUpzb25QYXRoLCB5YXJuTG9ja0ZpbGVQYXRofSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmV4cG9ydCBlbnVtIENvbXBsZXRpb25TdGF0ZSB7XG4gIFNVQ0NFU1MsXG4gIEZBVEFMX0VSUk9SLFxuICBNQU5VQUxMWV9BQk9SVEVELFxufVxuXG5leHBvcnQgY2xhc3MgUmVsZWFzZVRvb2wge1xuICAvKiogVGhlIHByZXZpb3VzIGdpdCBjb21taXQgdG8gcmV0dXJuIGJhY2sgdG8gYWZ0ZXIgdGhlIHJlbGVhc2UgdG9vbCBydW5zLiAqL1xuICBwcml2YXRlIHByZXZpb3VzR2l0QnJhbmNoT3JSZXZpc2lvbiA9IHRoaXMuX2dpdC5nZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByb3RlY3RlZCBfZ2l0OiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LFxuICAgIHByb3RlY3RlZCBfY29uZmlnOiBSZWxlYXNlQ29uZmlnLFxuICAgIHByb3RlY3RlZCBfZ2l0aHViOiBHaXRodWJDb25maWcsXG4gICAgcHJvdGVjdGVkIF9wcm9qZWN0Um9vdDogc3RyaW5nLFxuICApIHt9XG5cbiAgLyoqIFJ1bnMgdGhlIGludGVyYWN0aXZlIHJlbGVhc2UgdG9vbC4gKi9cbiAgYXN5bmMgcnVuKCk6IFByb21pc2U8Q29tcGxldGlvblN0YXRlPiB7XG4gICAgbG9nKCk7XG4gICAgbG9nKHllbGxvdygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKSk7XG4gICAgbG9nKHllbGxvdygnICBBbmd1bGFyIERldi1JbmZyYSByZWxlYXNlIHN0YWdpbmcgc2NyaXB0JykpO1xuICAgIGxvZyh5ZWxsb3coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJykpO1xuICAgIGxvZygpO1xuXG4gICAgY29uc3Qge293bmVyLCBuYW1lfSA9IHRoaXMuX2dpdGh1YjtcbiAgICBjb25zdCBuZXh0QnJhbmNoTmFtZSA9IGdldE5leHRCcmFuY2hOYW1lKHRoaXMuX2dpdGh1Yik7XG5cbiAgICBpZiAoXG4gICAgICAhKGF3YWl0IHRoaXMuX3ZlcmlmeU5vVW5jb21taXR0ZWRDaGFuZ2VzKCkpIHx8XG4gICAgICAhKGF3YWl0IHRoaXMuX3ZlcmlmeVJ1bm5pbmdGcm9tTmV4dEJyYW5jaChuZXh0QnJhbmNoTmFtZSkpIHx8XG4gICAgICAhKGF3YWl0IHRoaXMuX3ZlcmlmeU5vU2hhbGxvd1JlcG9zaXRvcnkoKSkgfHxcbiAgICAgICEoYXdhaXQgdGhpcy5fdmVyaWZ5SW5zdGFsbGVkRGVwZW5kZW5jaWVzQXJlVXBUb0RhdGUoKSlcbiAgICApIHtcbiAgICAgIHJldHVybiBDb21wbGV0aW9uU3RhdGUuRkFUQUxfRVJST1I7XG4gICAgfVxuXG4gICAgaWYgKCEoYXdhaXQgdGhpcy5fdmVyaWZ5TnBtTG9naW5TdGF0ZSgpKSkge1xuICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5NQU5VQUxMWV9BQk9SVEVEO1xuICAgIH1cblxuICAgIC8vIFNldCB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGUgdG8gc2tpcCBhbGwgZ2l0IGNvbW1pdCBob29rcyB0cmlnZ2VyZWQgYnkgaHVza3kuIFdlIGFyZSB1bmFibGUgdG9cbiAgICAvLyByZWx5IG9uIGAtLW5vLXZlcmlmeWAgYXMgc29tZSBob29rcyBzdGlsbCBydW4sIG5vdGFibHkgdGhlIGBwcmVwYXJlLWNvbW1pdC1tc2dgIGhvb2suXG4gICAgLy8gUnVubmluZyBob29rcyBoYXMgdGhlIGRvd25zaWRlIG9mIHBvdGVudGlhbGx5IHJ1bm5pbmcgY29kZSAobGlrZSB0aGUgYG5nLWRldmAgdG9vbCkgd2hlbiBhIHZlcnNpb25cbiAgICAvLyBicmFuY2ggaXMgY2hlY2tlZCBvdXQsIGJ1dCB0aGUgbm9kZSBtb2R1bGVzIGFyZSBub3QgcmUtaW5zdGFsbGVkLiBUaGUgdG9vbCBzd2l0Y2hlcyBicmFuY2hlc1xuICAgIC8vIG11bHRpcGxlIHRpbWVzIHBlciBleGVjdXRpb24sIGFuZCBpdCBpcyBub3QgZGVzaXJhYmxlIHJlLXJ1bm5pbmcgWWFybiBhbGwgdGhlIHRpbWUuXG4gICAgcHJvY2Vzcy5lbnZbJ0hVU0tZJ10gPSAnMCc7XG5cbiAgICBjb25zdCByZXBvOiBSZWxlYXNlUmVwb1dpdGhBcGkgPSB7b3duZXIsIG5hbWUsIGFwaTogdGhpcy5fZ2l0LmdpdGh1YiwgbmV4dEJyYW5jaE5hbWV9O1xuICAgIGNvbnN0IHJlbGVhc2VUcmFpbnMgPSBhd2FpdCBmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnMocmVwbyk7XG5cbiAgICAvLyBQcmludCB0aGUgYWN0aXZlIHJlbGVhc2UgdHJhaW5zIHNvIHRoYXQgdGhlIGNhcmV0YWtlciBjYW4gYWNjZXNzXG4gICAgLy8gdGhlIGN1cnJlbnQgcHJvamVjdCBicmFuY2hpbmcgc3RhdGUgd2l0aG91dCBzd2l0Y2hpbmcgY29udGV4dC5cbiAgICBhd2FpdCBwcmludEFjdGl2ZVJlbGVhc2VUcmFpbnMocmVsZWFzZVRyYWlucywgdGhpcy5fY29uZmlnKTtcblxuICAgIGNvbnN0IGFjdGlvbiA9IGF3YWl0IHRoaXMuX3Byb21wdEZvclJlbGVhc2VBY3Rpb24ocmVsZWFzZVRyYWlucyk7XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgYWN0aW9uLnBlcmZvcm0oKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yKSB7XG4gICAgICAgIHJldHVybiBDb21wbGV0aW9uU3RhdGUuTUFOVUFMTFlfQUJPUlRFRDtcbiAgICAgIH1cbiAgICAgIC8vIE9ubHkgcHJpbnQgdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHN0YWNrIGlmIHRoZSBlcnJvciBpcyBub3QgYSBrbm93biBmYXRhbCByZWxlYXNlXG4gICAgICAvLyBhY3Rpb24gZXJyb3IgKGZvciB3aGljaCB3ZSBwcmludCB0aGUgZXJyb3IgZ3JhY2VmdWxseSB0byB0aGUgY29uc29sZSB3aXRoIGNvbG9ycykuXG4gICAgICBpZiAoIShlIGluc3RhbmNlb2YgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IpICYmIGUgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5GQVRBTF9FUlJPUjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgYXdhaXQgdGhpcy5jbGVhbnVwKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5TVUNDRVNTO1xuICB9XG5cbiAgLyoqIFJ1biBwb3N0IHJlbGVhc2UgdG9vbCBjbGVhbnVwcy4gKi9cbiAgcHJpdmF0ZSBhc3luYyBjbGVhbnVwKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFJldHVybiBiYWNrIHRvIHRoZSBnaXQgc3RhdGUgZnJvbSBiZWZvcmUgdGhlIHJlbGVhc2UgdG9vbCByYW4uXG4gICAgdGhpcy5fZ2l0LmNoZWNrb3V0KHRoaXMucHJldmlvdXNHaXRCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcbiAgICAvLyBFbnN1cmUgbG9nIG91dCBvZiBOUE0uXG4gICAgYXdhaXQgbnBtTG9nb3V0KHRoaXMuX2NvbmZpZy5wdWJsaXNoUmVnaXN0cnkpO1xuICB9XG5cbiAgLyoqIFByb21wdHMgdGhlIGNhcmV0YWtlciBmb3IgYSByZWxlYXNlIGFjdGlvbiB0aGF0IHNob3VsZCBiZSBwZXJmb3JtZWQuICovXG4gIHByaXZhdGUgYXN5bmMgX3Byb21wdEZvclJlbGVhc2VBY3Rpb24oYWN0aXZlVHJhaW5zOiBBY3RpdmVSZWxlYXNlVHJhaW5zKSB7XG4gICAgY29uc3QgY2hvaWNlczogTGlzdENob2ljZU9wdGlvbnNbXSA9IFtdO1xuXG4gICAgLy8gRmluZCBhbmQgaW5zdGFudGlhdGUgYWxsIHJlbGVhc2UgYWN0aW9ucyB3aGljaCBhcmUgY3VycmVudGx5IHZhbGlkLlxuICAgIGZvciAobGV0IGFjdGlvblR5cGUgb2YgYWN0aW9ucykge1xuICAgICAgaWYgKGF3YWl0IGFjdGlvblR5cGUuaXNBY3RpdmUoYWN0aXZlVHJhaW5zLCB0aGlzLl9jb25maWcpKSB7XG4gICAgICAgIGNvbnN0IGFjdGlvbjogUmVsZWFzZUFjdGlvbiA9IG5ldyBhY3Rpb25UeXBlKFxuICAgICAgICAgIGFjdGl2ZVRyYWlucyxcbiAgICAgICAgICB0aGlzLl9naXQsXG4gICAgICAgICAgdGhpcy5fY29uZmlnLFxuICAgICAgICAgIHRoaXMuX3Byb2plY3RSb290LFxuICAgICAgICApO1xuICAgICAgICBjaG9pY2VzLnB1c2goe25hbWU6IGF3YWl0IGFjdGlvbi5nZXREZXNjcmlwdGlvbigpLCB2YWx1ZTogYWN0aW9ufSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaW5mbygnUGxlYXNlIHNlbGVjdCB0aGUgdHlwZSBvZiByZWxlYXNlIHlvdSB3YW50IHRvIHBlcmZvcm0uJyk7XG5cbiAgICBjb25zdCB7cmVsZWFzZUFjdGlvbn0gPSBhd2FpdCBwcm9tcHQ8e3JlbGVhc2VBY3Rpb246IFJlbGVhc2VBY3Rpb259Pih7XG4gICAgICBuYW1lOiAncmVsZWFzZUFjdGlvbicsXG4gICAgICBtZXNzYWdlOiAnUGxlYXNlIHNlbGVjdCBhbiBhY3Rpb246JyxcbiAgICAgIHR5cGU6ICdsaXN0JyxcbiAgICAgIGNob2ljZXMsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVsZWFzZUFjdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZmllcyB0aGF0IHRoZXJlIGFyZSBubyB1bmNvbW1pdHRlZCBjaGFuZ2VzIGluIHRoZSBwcm9qZWN0LlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyBzdWNjZXNzIG9yIGZhaWx1cmUuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlOb1VuY29tbWl0dGVkQ2hhbmdlcygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAodGhpcy5fZ2l0Lmhhc1VuY29tbWl0dGVkQ2hhbmdlcygpKSB7XG4gICAgICBlcnJvcihyZWQoJyAg4pyYICAgVGhlcmUgYXJlIGNoYW5nZXMgd2hpY2ggYXJlIG5vdCBjb21taXR0ZWQgYW5kIHNob3VsZCBiZSBkaXNjYXJkZWQuJykpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZml5IHRoYXQgdGhlIGluc3RhbGwgZGVwZW5kZW5jaWVzIG1hdGNoIHRoZSB0aGUgdmVyc2lvbnMgZGVmaW5lZCBpbiB0aGUgcGFja2FnZS5qc29uIGFuZFxuICAgKiB5YXJuLmxvY2sgZmlsZXMuXG4gICAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHN1Y2Nlc3Mgb3IgZmFpbHVyZS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeUluc3RhbGxlZERlcGVuZGVuY2llc0FyZVVwVG9EYXRlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIC8vIFRoZSBwbGFjZWhvbGRlciB3aWxsIGJlIHJlcGxhY2VkIGJ5IHRoZSBgcGtnX25wbWAgc3Vic3RpdHV0aW9ucy5cbiAgICBjb25zdCBleHBlY3RlZFZlcnNpb24gPSBgMC4wLjAte1NDTV9IRUFEX1NIQX1gO1xuICAgIGNvbnN0IHByb2plY3RQYWNrYWdlSnNvbkZpbGUgPSBwYXRoLmpvaW4odGhpcy5fcHJvamVjdFJvb3QsIHBhY2thZ2VKc29uUGF0aCk7XG4gICAgY29uc3QgcHJvamVjdERpckxvY2tGaWxlID0gcGF0aC5qb2luKHRoaXMuX3Byb2plY3RSb290LCB5YXJuTG9ja0ZpbGVQYXRoKTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBsb2NrRmlsZUNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMocHJvamVjdERpckxvY2tGaWxlLCAndXRmOCcpO1xuICAgICAgY29uc3QgcGFja2FnZUpzb24gPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwcm9qZWN0UGFja2FnZUpzb25GaWxlLCAndXRmOCcpKSBhcyBhbnk7XG4gICAgICBjb25zdCBsb2NrRmlsZSA9IHBhcnNlWWFybkxvY2tmaWxlKGxvY2tGaWxlQ29udGVudCk7XG5cbiAgICAgIGlmIChsb2NrRmlsZS50eXBlICE9PSAnc3VjY2VzcycpIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ1VuYWJsZSB0byBwYXJzZSBwcm9qZWN0IGxvY2sgZmlsZS4gUGxlYXNlIGVuc3VyZSB0aGUgZmlsZSBpcyB2YWxpZC4nKTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgd2UgYXJlIG9wZXJhdGluZyBpbiB0aGUgYWN0dWFsIGRldi1pbmZyYSByZXBvLCBhbHdheXMgcmV0dXJuIGB0cnVlYC5cbiAgICAgIGlmIChwYWNrYWdlSnNvbi5uYW1lID09PSBuZ0Rldk5wbVBhY2thZ2VOYW1lKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBsb2NrRmlsZU9iamVjdCA9IGxvY2tGaWxlLm9iamVjdCBhcyBMb2NrRmlsZU9iamVjdDtcbiAgICAgIGNvbnN0IGRldkluZnJhUGtnVmVyc2lvbiA9XG4gICAgICAgIHBhY2thZ2VKc29uPy5kZXBlbmRlbmNpZXM/LltuZ0Rldk5wbVBhY2thZ2VOYW1lXSA/P1xuICAgICAgICBwYWNrYWdlSnNvbj8uZGV2RGVwZW5kZW5jaWVzPy5bbmdEZXZOcG1QYWNrYWdlTmFtZV0gPz9cbiAgICAgICAgcGFja2FnZUpzb24/Lm9wdGlvbmFsRGVwZW5kZW5jaWVzPy5bbmdEZXZOcG1QYWNrYWdlTmFtZV07XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIGxvY2tGaWxlT2JqZWN0W2Ake25nRGV2TnBtUGFja2FnZU5hbWV9QCR7ZGV2SW5mcmFQa2dWZXJzaW9ufWBdLnZlcnNpb24gPT09IGV4cGVjdGVkVmVyc2lvblxuICAgICAgKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBkZWJ1ZygnX3ZlcmlmeUluc3RhbGxlZERlcGVuZGVuY2llc0FyZVVwVG9EYXRlIGZhaWxlZDonLCBlKTtcbiAgICAgIGVycm9yKHJlZCgnICDinJggICBZb3VyIGxvY2FsbHkgaW5zdGFsbGVkIHZlcnNpb24gb2YgdGhlIGBuZy1kZXZgIHRvb2wgaXMgb3V0ZGF0ZWQgYW5kIG5vdCcpKTtcbiAgICAgIGVycm9yKHJlZCgnICAgICAgbWF0Y2hpbmcgd2l0aCB0aGUgdmVyc2lvbiBpbiB0aGUgYHBhY2thZ2UuanNvbmAgZmlsZS4nKSk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgIFBsZWFzZSByZS1ydW4gYHlhcm4gaW5zdGFsbGAgdG8gZW5zdXJlIHlvdSBhcmUgdXNpbmcgdGhlIGxhdGVzdCB2ZXJzaW9uLicpKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgdGhhdCB0aGUgbG9jYWwgcmVwb3NpdG9yeSBpcyBub3QgY29uZmlndXJlZCBhcyBzaGFsbG93LlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyBzdWNjZXNzIG9yIGZhaWx1cmUuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlOb1NoYWxsb3dSZXBvc2l0b3J5KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmICh0aGlzLl9naXQuaXNTaGFsbG93UmVwbygpKSB7XG4gICAgICBlcnJvcihyZWQoJyAg4pyYICAgVGhlIGxvY2FsIHJlcG9zaXRvcnkgaXMgY29uZmlndXJlZCBhcyBzaGFsbG93LicpKTtcbiAgICAgIGVycm9yKHJlZChgICAgICAgUGxlYXNlIGNvbnZlcnQgdGhlIHJlcG9zaXRvcnkgdG8gYSBjb21wbGV0ZSBvbmUgYnkgc3luY2luZyB3aXRoIHVwc3RyZWFtLmApKTtcbiAgICAgIGVycm9yKFxuICAgICAgICByZWQoYCAgICAgIGh0dHBzOi8vZ2l0LXNjbS5jb20vZG9jcy9naXQtZmV0Y2gjRG9jdW1lbnRhdGlvbi9naXQtZmV0Y2gudHh0LS0tdW5zaGFsbG93YCksXG4gICAgICApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZmllcyB0aGF0IHRoZSBuZXh0IGJyYW5jaCBmcm9tIHRoZSBjb25maWd1cmVkIHJlcG9zaXRvcnkgaXMgY2hlY2tlZCBvdXQuXG4gICAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHN1Y2Nlc3Mgb3IgZmFpbHVyZS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeVJ1bm5pbmdGcm9tTmV4dEJyYW5jaChuZXh0QnJhbmNoTmFtZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgaGVhZFNoYSA9IHRoaXMuX2dpdC5ydW4oWydyZXYtcGFyc2UnLCAnSEVBRCddKS5zdGRvdXQudHJpbSgpO1xuICAgIGNvbnN0IHtkYXRhfSA9IGF3YWl0IHRoaXMuX2dpdC5naXRodWIucmVwb3MuZ2V0QnJhbmNoKHtcbiAgICAgIC4uLnRoaXMuX2dpdC5yZW1vdGVQYXJhbXMsXG4gICAgICBicmFuY2g6IHRoaXMuX2dpdC5tYWluQnJhbmNoTmFtZSxcbiAgICB9KTtcblxuICAgIGlmIChoZWFkU2hhICE9PSBkYXRhLmNvbW1pdC5zaGEpIHtcbiAgICAgIGVycm9yKHJlZCgnICDinJggICBSdW5uaW5nIHJlbGVhc2UgdG9vbCBmcm9tIGFuIG91dGRhdGVkIGxvY2FsIGJyYW5jaC4nKSk7XG4gICAgICBlcnJvcihyZWQoYCAgICAgIFBsZWFzZSBtYWtlIHN1cmUgeW91IGFyZSBydW5uaW5nIGZyb20gdGhlIFwiJHtuZXh0QnJhbmNoTmFtZX1cIiBicmFuY2guYCkpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZmllcyB0aGF0IHRoZSB1c2VyIGlzIGxvZ2dlZCBpbnRvIE5QTSBhdCB0aGUgY29ycmVjdCByZWdpc3RyeSwgaWYgZGVmaW5lZCBmb3IgdGhlIHJlbGVhc2UuXG4gICAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIHVzZXIgaXMgbG9nZ2VkIGludG8gTlBNLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfdmVyaWZ5TnBtTG9naW5TdGF0ZSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCByZWdpc3RyeSA9IGBOUE0gYXQgdGhlICR7dGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSA/PyAnZGVmYXVsdCBOUE0nfSByZWdpc3RyeWA7XG4gICAgLy8gVE9ETyhqb3NlcGhwZXJyb3R0KTogcmVtb3ZlIHdvbWJhdCBzcGVjaWZpYyBibG9jayBvbmNlIHdvbWJvdCBhbGxvd3MgYG5wbSB3aG9hbWlgIGNoZWNrIHRvXG4gICAgLy8gY2hlY2sgdGhlIHN0YXR1cyBvZiB0aGUgbG9jYWwgdG9rZW4gaW4gdGhlIC5ucG1yYyBmaWxlLlxuICAgIGlmICh0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5Py5pbmNsdWRlcygnd29tYmF0LWRyZXNzaW5nLXJvb20uYXBwc3BvdC5jb20nKSkge1xuICAgICAgaW5mbygnVW5hYmxlIHRvIGRldGVybWluZSBOUE0gbG9naW4gc3RhdGUgZm9yIHdvbWJhdCBwcm94eSwgcmVxdWlyaW5nIGxvZ2luIG5vdy4nKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IG5wbUxvZ2luKHRoaXMuX2NvbmZpZy5wdWJsaXNoUmVnaXN0cnkpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoYXdhaXQgbnBtSXNMb2dnZWRJbih0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5KSkge1xuICAgICAgZGVidWcoYEFscmVhZHkgbG9nZ2VkIGludG8gJHtyZWdpc3RyeX0uYCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgZXJyb3IocmVkKGAgIOKcmCAgIE5vdCBjdXJyZW50bHkgbG9nZ2VkIGludG8gJHtyZWdpc3RyeX0uYCkpO1xuICAgIGNvbnN0IHNob3VsZExvZ2luID0gYXdhaXQgcHJvbXB0Q29uZmlybSgnV291bGQgeW91IGxpa2UgdG8gbG9nIGludG8gTlBNIG5vdz8nKTtcbiAgICBpZiAoc2hvdWxkTG9naW4pIHtcbiAgICAgIGRlYnVnKCdTdGFydGluZyBOUE0gbG9naW4uJyk7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBucG1Mb2dpbih0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5KTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iXX0=