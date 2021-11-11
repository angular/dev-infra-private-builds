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
        const localVersion = `0.0.0-a42b88d761070a0921c4198d7977b214160b4e05`;
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
            const expectedVersion = lockFileObject[`${constants_1.ngDevNpmPackageName}@${devInfraPkgVersion}`].version;
            if (localVersion !== expectedVersion) {
                (0, console_1.error)((0, console_1.red)('  ✘   Your locally installed version of the `ng-dev` tool is outdated and not'));
                (0, console_1.error)((0, console_1.red)('      matching with the version in the `package.json` file.'));
                (0, console_1.error)((0, console_1.red)('      Re-install the dependencies to ensure you are using the correct version.'));
                return false;
            }
            return true;
        }
        catch (e) {
            (0, console_1.error)(e);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS9wdWJsaXNoL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILDZCQUE2QjtBQUM3Qix5QkFBeUI7QUFDekIsdUNBQW1EO0FBQ25ELGdEQUE2RTtBQUc3RSxpREFBd0Y7QUFHeEYsK0VBQWtHO0FBQ2xHLDJEQUE2RTtBQUM3RSwyRUFBMkU7QUFDM0UscUVBQXFGO0FBQ3JGLHFEQUEwRDtBQUcxRCxtREFBdUY7QUFDdkYsMkNBQXdDO0FBQ3hDLDJDQUE4RDtBQUU5RCxJQUFZLGVBSVg7QUFKRCxXQUFZLGVBQWU7SUFDekIsMkRBQU8sQ0FBQTtJQUNQLG1FQUFXLENBQUE7SUFDWCw2RUFBZ0IsQ0FBQTtBQUNsQixDQUFDLEVBSlcsZUFBZSxHQUFmLHVCQUFlLEtBQWYsdUJBQWUsUUFJMUI7QUFFRCxNQUFhLFdBQVc7SUFJdEIsWUFDWSxJQUE0QixFQUM1QixPQUFzQixFQUN0QixPQUFxQixFQUNyQixZQUFvQjtRQUhwQixTQUFJLEdBQUosSUFBSSxDQUF3QjtRQUM1QixZQUFPLEdBQVAsT0FBTyxDQUFlO1FBQ3RCLFlBQU8sR0FBUCxPQUFPLENBQWM7UUFDckIsaUJBQVksR0FBWixZQUFZLENBQVE7UUFQaEMsNkVBQTZFO1FBQ3JFLGdDQUEyQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztJQU8xRSxDQUFDO0lBRUoseUNBQXlDO0lBQ3pDLEtBQUssQ0FBQyxHQUFHO1FBQ1AsSUFBQSxhQUFHLEdBQUUsQ0FBQztRQUNOLElBQUEsYUFBRyxFQUFDLElBQUEsZ0JBQU0sRUFBQyw4Q0FBOEMsQ0FBQyxDQUFDLENBQUM7UUFDNUQsSUFBQSxhQUFHLEVBQUMsSUFBQSxnQkFBTSxFQUFDLDRDQUE0QyxDQUFDLENBQUMsQ0FBQztRQUMxRCxJQUFBLGFBQUcsRUFBQyxJ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QztJQUNmLENBQUM7Q0FDRjtBQTVPRCxrQ0E0T0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCB7TGlzdENob2ljZU9wdGlvbnMsIHByb21wdH0gZnJvbSAnaW5xdWlyZXInO1xuaW1wb3J0IHtwYXJzZSBhcyBwYXJzZVlhcm5Mb2NrZmlsZSwgTG9ja0ZpbGVPYmplY3R9IGZyb20gJ0B5YXJucGtnL2xvY2tmaWxlJztcblxuaW1wb3J0IHtHaXRodWJDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2RlYnVnLCBlcnJvciwgaW5mbywgbG9nLCBwcm9tcHRDb25maXJtLCByZWQsIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHtSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zLCBmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7bnBtSXNMb2dnZWRJbiwgbnBtTG9naW4sIG5wbUxvZ291dH0gZnJvbSAnLi4vdmVyc2lvbmluZy9ucG0tcHVibGlzaCc7XG5pbXBvcnQge3ByaW50QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vdmVyc2lvbmluZy9wcmludC1hY3RpdmUtdHJhaW5zJztcbmltcG9ydCB7Z2V0TmV4dEJyYW5jaE5hbWUsIFJlbGVhc2VSZXBvV2l0aEFwaX0gZnJvbSAnLi4vdmVyc2lvbmluZy92ZXJzaW9uLWJyYW5jaGVzJztcbmltcG9ydCB7bmdEZXZOcG1QYWNrYWdlTmFtZX0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc3RhbnRzJztcblxuaW1wb3J0IHtSZWxlYXNlQWN0aW9ufSBmcm9tICcuL2FjdGlvbnMnO1xuaW1wb3J0IHtGYXRhbFJlbGVhc2VBY3Rpb25FcnJvciwgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3J9IGZyb20gJy4vYWN0aW9ucy1lcnJvcic7XG5pbXBvcnQge2FjdGlvbnN9IGZyb20gJy4vYWN0aW9ucy9pbmRleCc7XG5pbXBvcnQge3BhY2thZ2VKc29uUGF0aCwgeWFybkxvY2tGaWxlUGF0aH0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5leHBvcnQgZW51bSBDb21wbGV0aW9uU3RhdGUge1xuICBTVUNDRVNTLFxuICBGQVRBTF9FUlJPUixcbiAgTUFOVUFMTFlfQUJPUlRFRCxcbn1cblxuZXhwb3J0IGNsYXNzIFJlbGVhc2VUb29sIHtcbiAgLyoqIFRoZSBwcmV2aW91cyBnaXQgY29tbWl0IHRvIHJldHVybiBiYWNrIHRvIGFmdGVyIHRoZSByZWxlYXNlIHRvb2wgcnVucy4gKi9cbiAgcHJpdmF0ZSBwcmV2aW91c0dpdEJyYW5jaE9yUmV2aXNpb24gPSB0aGlzLl9naXQuZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcm90ZWN0ZWQgX2dpdDogQXV0aGVudGljYXRlZEdpdENsaWVudCxcbiAgICBwcm90ZWN0ZWQgX2NvbmZpZzogUmVsZWFzZUNvbmZpZyxcbiAgICBwcm90ZWN0ZWQgX2dpdGh1YjogR2l0aHViQ29uZmlnLFxuICAgIHByb3RlY3RlZCBfcHJvamVjdFJvb3Q6IHN0cmluZyxcbiAgKSB7fVxuXG4gIC8qKiBSdW5zIHRoZSBpbnRlcmFjdGl2ZSByZWxlYXNlIHRvb2wuICovXG4gIGFzeW5jIHJ1bigpOiBQcm9taXNlPENvbXBsZXRpb25TdGF0ZT4ge1xuICAgIGxvZygpO1xuICAgIGxvZyh5ZWxsb3coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJykpO1xuICAgIGxvZyh5ZWxsb3coJyAgQW5ndWxhciBEZXYtSW5mcmEgcmVsZWFzZSBzdGFnaW5nIHNjcmlwdCcpKTtcbiAgICBsb2coeWVsbG93KCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpKTtcbiAgICBsb2coKTtcblxuICAgIGNvbnN0IHtvd25lciwgbmFtZX0gPSB0aGlzLl9naXRodWI7XG4gICAgY29uc3QgbmV4dEJyYW5jaE5hbWUgPSBnZXROZXh0QnJhbmNoTmFtZSh0aGlzLl9naXRodWIpO1xuXG4gICAgaWYgKFxuICAgICAgIShhd2FpdCB0aGlzLl92ZXJpZnlOb1VuY29tbWl0dGVkQ2hhbmdlcygpKSB8fFxuICAgICAgIShhd2FpdCB0aGlzLl92ZXJpZnlSdW5uaW5nRnJvbU5leHRCcmFuY2gobmV4dEJyYW5jaE5hbWUpKSB8fFxuICAgICAgIShhd2FpdCB0aGlzLl92ZXJpZnlOb1NoYWxsb3dSZXBvc2l0b3J5KCkpIHx8XG4gICAgICAhKGF3YWl0IHRoaXMuX3ZlcmlmeUluc3RhbGxlZERlcGVuZGVuY2llc0FyZVVwVG9EYXRlKCkpXG4gICAgKSB7XG4gICAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLkZBVEFMX0VSUk9SO1xuICAgIH1cblxuICAgIGlmICghKGF3YWl0IHRoaXMuX3ZlcmlmeU5wbUxvZ2luU3RhdGUoKSkpIHtcbiAgICAgIHJldHVybiBDb21wbGV0aW9uU3RhdGUuTUFOVUFMTFlfQUJPUlRFRDtcbiAgICB9XG5cbiAgICAvLyBTZXQgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlIHRvIHNraXAgYWxsIGdpdCBjb21taXQgaG9va3MgdHJpZ2dlcmVkIGJ5IGh1c2t5LiBXZSBhcmUgdW5hYmxlIHRvXG4gICAgLy8gcmVseSBvbiBgLS1uby12ZXJpZnlgIGFzIHNvbWUgaG9va3Mgc3RpbGwgcnVuLCBub3RhYmx5IHRoZSBgcHJlcGFyZS1jb21taXQtbXNnYCBob29rLlxuICAgIC8vIFJ1bm5pbmcgaG9va3MgaGFzIHRoZSBkb3duc2lkZSBvZiBwb3RlbnRpYWxseSBydW5uaW5nIGNvZGUgKGxpa2UgdGhlIGBuZy1kZXZgIHRvb2wpIHdoZW4gYSB2ZXJzaW9uXG4gICAgLy8gYnJhbmNoIGlzIGNoZWNrZWQgb3V0LCBidXQgdGhlIG5vZGUgbW9kdWxlcyBhcmUgbm90IHJlLWluc3RhbGxlZC4gVGhlIHRvb2wgc3dpdGNoZXMgYnJhbmNoZXNcbiAgICAvLyBtdWx0aXBsZSB0aW1lcyBwZXIgZXhlY3V0aW9uLCBhbmQgaXQgaXMgbm90IGRlc2lyYWJsZSByZS1ydW5uaW5nIFlhcm4gYWxsIHRoZSB0aW1lLlxuICAgIHByb2Nlc3MuZW52WydIVVNLWSddID0gJzAnO1xuXG4gICAgY29uc3QgcmVwbzogUmVsZWFzZVJlcG9XaXRoQXBpID0ge293bmVyLCBuYW1lLCBhcGk6IHRoaXMuX2dpdC5naXRodWIsIG5leHRCcmFuY2hOYW1lfTtcbiAgICBjb25zdCByZWxlYXNlVHJhaW5zID0gYXdhaXQgZmV0Y2hBY3RpdmVSZWxlYXNlVHJhaW5zKHJlcG8pO1xuXG4gICAgLy8gUHJpbnQgdGhlIGFjdGl2ZSByZWxlYXNlIHRyYWlucyBzbyB0aGF0IHRoZSBjYXJldGFrZXIgY2FuIGFjY2Vzc1xuICAgIC8vIHRoZSBjdXJyZW50IHByb2plY3QgYnJhbmNoaW5nIHN0YXRlIHdpdGhvdXQgc3dpdGNoaW5nIGNvbnRleHQuXG4gICAgYXdhaXQgcHJpbnRBY3RpdmVSZWxlYXNlVHJhaW5zKHJlbGVhc2VUcmFpbnMsIHRoaXMuX2NvbmZpZyk7XG5cbiAgICBjb25zdCBhY3Rpb24gPSBhd2FpdCB0aGlzLl9wcm9tcHRGb3JSZWxlYXNlQWN0aW9uKHJlbGVhc2VUcmFpbnMpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGFjdGlvbi5wZXJmb3JtKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcikge1xuICAgICAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLk1BTlVBTExZX0FCT1JURUQ7XG4gICAgICB9XG4gICAgICAvLyBPbmx5IHByaW50IHRoZSBlcnJvciBtZXNzYWdlIGFuZCBzdGFjayBpZiB0aGUgZXJyb3IgaXMgbm90IGEga25vd24gZmF0YWwgcmVsZWFzZVxuICAgICAgLy8gYWN0aW9uIGVycm9yIChmb3Igd2hpY2ggd2UgcHJpbnQgdGhlIGVycm9yIGdyYWNlZnVsbHkgdG8gdGhlIGNvbnNvbGUgd2l0aCBjb2xvcnMpLlxuICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKSAmJiBlIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBDb21wbGV0aW9uU3RhdGUuRkFUQUxfRVJST1I7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGF3YWl0IHRoaXMuY2xlYW51cCgpO1xuICAgIH1cblxuICAgIHJldHVybiBDb21wbGV0aW9uU3RhdGUuU1VDQ0VTUztcbiAgfVxuXG4gIC8qKiBSdW4gcG9zdCByZWxlYXNlIHRvb2wgY2xlYW51cHMuICovXG4gIHByaXZhdGUgYXN5bmMgY2xlYW51cCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBSZXR1cm4gYmFjayB0byB0aGUgZ2l0IHN0YXRlIGZyb20gYmVmb3JlIHRoZSByZWxlYXNlIHRvb2wgcmFuLlxuICAgIHRoaXMuX2dpdC5jaGVja291dCh0aGlzLnByZXZpb3VzR2l0QnJhbmNoT3JSZXZpc2lvbiwgdHJ1ZSk7XG4gICAgLy8gRW5zdXJlIGxvZyBvdXQgb2YgTlBNLlxuICAgIGF3YWl0IG5wbUxvZ291dCh0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5KTtcbiAgfVxuXG4gIC8qKiBQcm9tcHRzIHRoZSBjYXJldGFrZXIgZm9yIGEgcmVsZWFzZSBhY3Rpb24gdGhhdCBzaG91bGQgYmUgcGVyZm9ybWVkLiAqL1xuICBwcml2YXRlIGFzeW5jIF9wcm9tcHRGb3JSZWxlYXNlQWN0aW9uKGFjdGl2ZVRyYWluczogQWN0aXZlUmVsZWFzZVRyYWlucykge1xuICAgIGNvbnN0IGNob2ljZXM6IExpc3RDaG9pY2VPcHRpb25zW10gPSBbXTtcblxuICAgIC8vIEZpbmQgYW5kIGluc3RhbnRpYXRlIGFsbCByZWxlYXNlIGFjdGlvbnMgd2hpY2ggYXJlIGN1cnJlbnRseSB2YWxpZC5cbiAgICBmb3IgKGxldCBhY3Rpb25UeXBlIG9mIGFjdGlvbnMpIHtcbiAgICAgIGlmIChhd2FpdCBhY3Rpb25UeXBlLmlzQWN0aXZlKGFjdGl2ZVRyYWlucywgdGhpcy5fY29uZmlnKSkge1xuICAgICAgICBjb25zdCBhY3Rpb246IFJlbGVhc2VBY3Rpb24gPSBuZXcgYWN0aW9uVHlwZShcbiAgICAgICAgICBhY3RpdmVUcmFpbnMsXG4gICAgICAgICAgdGhpcy5fZ2l0LFxuICAgICAgICAgIHRoaXMuX2NvbmZpZyxcbiAgICAgICAgICB0aGlzLl9wcm9qZWN0Um9vdCxcbiAgICAgICAgKTtcbiAgICAgICAgY2hvaWNlcy5wdXNoKHtuYW1lOiBhd2FpdCBhY3Rpb24uZ2V0RGVzY3JpcHRpb24oKSwgdmFsdWU6IGFjdGlvbn0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGluZm8oJ1BsZWFzZSBzZWxlY3QgdGhlIHR5cGUgb2YgcmVsZWFzZSB5b3Ugd2FudCB0byBwZXJmb3JtLicpO1xuXG4gICAgY29uc3Qge3JlbGVhc2VBY3Rpb259ID0gYXdhaXQgcHJvbXB0PHtyZWxlYXNlQWN0aW9uOiBSZWxlYXNlQWN0aW9ufT4oe1xuICAgICAgbmFtZTogJ3JlbGVhc2VBY3Rpb24nLFxuICAgICAgbWVzc2FnZTogJ1BsZWFzZSBzZWxlY3QgYW4gYWN0aW9uOicsXG4gICAgICB0eXBlOiAnbGlzdCcsXG4gICAgICBjaG9pY2VzLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlbGVhc2VBY3Rpb247XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgdGhhdCB0aGVyZSBhcmUgbm8gdW5jb21taXR0ZWQgY2hhbmdlcyBpbiB0aGUgcHJvamVjdC5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2VzcyBvciBmYWlsdXJlLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfdmVyaWZ5Tm9VbmNvbW1pdHRlZENoYW5nZXMoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKHRoaXMuX2dpdC5oYXNVbmNvbW1pdHRlZENoYW5nZXMoKSkge1xuICAgICAgZXJyb3IocmVkKCcgIOKcmCAgIFRoZXJlIGFyZSBjaGFuZ2VzIHdoaWNoIGFyZSBub3QgY29tbWl0dGVkIGFuZCBzaG91bGQgYmUgZGlzY2FyZGVkLicpKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpeSB0aGF0IHRoZSBpbnN0YWxsIGRlcGVuZGVuY2llcyBtYXRjaCB0aGUgdGhlIHZlcnNpb25zIGRlZmluZWQgaW4gdGhlIHBhY2thZ2UuanNvbiBhbmRcbiAgICogeWFybi5sb2NrIGZpbGVzLlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyBzdWNjZXNzIG9yIGZhaWx1cmUuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlJbnN0YWxsZWREZXBlbmRlbmNpZXNBcmVVcFRvRGF0ZSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAvLyBUaGUgcGxhY2Vob2xkZXIgd2lsbCBiZSByZXBsYWNlZCBieSB0aGUgYHBrZ19ucG1gIHN1YnN0aXR1dGlvbnMuXG4gICAgY29uc3QgbG9jYWxWZXJzaW9uID0gYDAuMC4wLXtTQ01fSEVBRF9TSEF9YDtcbiAgICBjb25zdCBwcm9qZWN0UGFja2FnZUpzb25GaWxlID0gcGF0aC5qb2luKHRoaXMuX3Byb2plY3RSb290LCBwYWNrYWdlSnNvblBhdGgpO1xuICAgIGNvbnN0IHByb2plY3REaXJMb2NrRmlsZSA9IHBhdGguam9pbih0aGlzLl9wcm9qZWN0Um9vdCwgeWFybkxvY2tGaWxlUGF0aCk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgbG9ja0ZpbGVDb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKHByb2plY3REaXJMb2NrRmlsZSwgJ3V0ZjgnKTtcbiAgICAgIGNvbnN0IHBhY2thZ2VKc29uID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocHJvamVjdFBhY2thZ2VKc29uRmlsZSwgJ3V0ZjgnKSkgYXMgYW55O1xuICAgICAgY29uc3QgbG9ja0ZpbGUgPSBwYXJzZVlhcm5Mb2NrZmlsZShsb2NrRmlsZUNvbnRlbnQpO1xuXG4gICAgICBpZiAobG9ja0ZpbGUudHlwZSAhPT0gJ3N1Y2Nlc3MnKSB7XG4gICAgICAgIHRocm93IEVycm9yKCdVbmFibGUgdG8gcGFyc2UgcHJvamVjdCBsb2NrIGZpbGUuIFBsZWFzZSBlbnN1cmUgdGhlIGZpbGUgaXMgdmFsaWQuJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHdlIGFyZSBvcGVyYXRpbmcgaW4gdGhlIGFjdHVhbCBkZXYtaW5mcmEgcmVwbywgYWx3YXlzIHJldHVybiBgdHJ1ZWAuXG4gICAgICBpZiAocGFja2FnZUpzb24ubmFtZSA9PT0gbmdEZXZOcG1QYWNrYWdlTmFtZSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbG9ja0ZpbGVPYmplY3QgPSBsb2NrRmlsZS5vYmplY3QgYXMgTG9ja0ZpbGVPYmplY3Q7XG4gICAgICBjb25zdCBkZXZJbmZyYVBrZ1ZlcnNpb24gPVxuICAgICAgICBwYWNrYWdlSnNvbj8uZGVwZW5kZW5jaWVzPy5bbmdEZXZOcG1QYWNrYWdlTmFtZV0gPz9cbiAgICAgICAgcGFja2FnZUpzb24/LmRldkRlcGVuZGVuY2llcz8uW25nRGV2TnBtUGFja2FnZU5hbWVdID8/XG4gICAgICAgIHBhY2thZ2VKc29uPy5vcHRpb25hbERlcGVuZGVuY2llcz8uW25nRGV2TnBtUGFja2FnZU5hbWVdO1xuICAgICAgY29uc3QgZXhwZWN0ZWRWZXJzaW9uID1cbiAgICAgICAgbG9ja0ZpbGVPYmplY3RbYCR7bmdEZXZOcG1QYWNrYWdlTmFtZX1AJHtkZXZJbmZyYVBrZ1ZlcnNpb259YF0udmVyc2lvbjtcblxuICAgICAgaWYgKGxvY2FsVmVyc2lvbiAhPT0gZXhwZWN0ZWRWZXJzaW9uKSB7XG4gICAgICAgIGVycm9yKHJlZCgnICDinJggICBZb3VyIGxvY2FsbHkgaW5zdGFsbGVkIHZlcnNpb24gb2YgdGhlIGBuZy1kZXZgIHRvb2wgaXMgb3V0ZGF0ZWQgYW5kIG5vdCcpKTtcbiAgICAgICAgZXJyb3IocmVkKCcgICAgICBtYXRjaGluZyB3aXRoIHRoZSB2ZXJzaW9uIGluIHRoZSBgcGFja2FnZS5qc29uYCBmaWxlLicpKTtcbiAgICAgICAgZXJyb3IoXG4gICAgICAgICAgcmVkKCcgICAgICBSZS1pbnN0YWxsIHRoZSBkZXBlbmRlbmNpZXMgdG8gZW5zdXJlIHlvdSBhcmUgdXNpbmcgdGhlIGNvcnJlY3QgdmVyc2lvbi4nKSxcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZXJyb3IoZSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIHRoYXQgdGhlIGxvY2FsIHJlcG9zaXRvcnkgaXMgbm90IGNvbmZpZ3VyZWQgYXMgc2hhbGxvdy5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2VzcyBvciBmYWlsdXJlLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfdmVyaWZ5Tm9TaGFsbG93UmVwb3NpdG9yeSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAodGhpcy5fZ2l0LmlzU2hhbGxvd1JlcG8oKSkge1xuICAgICAgZXJyb3IocmVkKCcgIOKcmCAgIFRoZSBsb2NhbCByZXBvc2l0b3J5IGlzIGNvbmZpZ3VyZWQgYXMgc2hhbGxvdy4nKSk7XG4gICAgICBlcnJvcihyZWQoYCAgICAgIFBsZWFzZSBjb252ZXJ0IHRoZSByZXBvc2l0b3J5IHRvIGEgY29tcGxldGUgb25lIGJ5IHN5bmNpbmcgd2l0aCB1cHN0cmVhbS5gKSk7XG4gICAgICBlcnJvcihcbiAgICAgICAgcmVkKGAgICAgICBodHRwczovL2dpdC1zY20uY29tL2RvY3MvZ2l0LWZldGNoI0RvY3VtZW50YXRpb24vZ2l0LWZldGNoLnR4dC0tLXVuc2hhbGxvd2ApLFxuICAgICAgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgdGhhdCB0aGUgbmV4dCBicmFuY2ggZnJvbSB0aGUgY29uZmlndXJlZCByZXBvc2l0b3J5IGlzIGNoZWNrZWQgb3V0LlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyBzdWNjZXNzIG9yIGZhaWx1cmUuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlSdW5uaW5nRnJvbU5leHRCcmFuY2gobmV4dEJyYW5jaE5hbWU6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGhlYWRTaGEgPSB0aGlzLl9naXQucnVuKFsncmV2LXBhcnNlJywgJ0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgICBjb25zdCB7ZGF0YX0gPSBhd2FpdCB0aGlzLl9naXQuZ2l0aHViLnJlcG9zLmdldEJyYW5jaCh7XG4gICAgICAuLi50aGlzLl9naXQucmVtb3RlUGFyYW1zLFxuICAgICAgYnJhbmNoOiB0aGlzLl9naXQubWFpbkJyYW5jaE5hbWUsXG4gICAgfSk7XG5cbiAgICBpZiAoaGVhZFNoYSAhPT0gZGF0YS5jb21taXQuc2hhKSB7XG4gICAgICBlcnJvcihyZWQoJyAg4pyYICAgUnVubmluZyByZWxlYXNlIHRvb2wgZnJvbSBhbiBvdXRkYXRlZCBsb2NhbCBicmFuY2guJykpO1xuICAgICAgZXJyb3IocmVkKGAgICAgICBQbGVhc2UgbWFrZSBzdXJlIHlvdSBhcmUgcnVubmluZyBmcm9tIHRoZSBcIiR7bmV4dEJyYW5jaE5hbWV9XCIgYnJhbmNoLmApKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgdGhhdCB0aGUgdXNlciBpcyBsb2dnZWQgaW50byBOUE0gYXQgdGhlIGNvcnJlY3QgcmVnaXN0cnksIGlmIGRlZmluZWQgZm9yIHRoZSByZWxlYXNlLlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSB1c2VyIGlzIGxvZ2dlZCBpbnRvIE5QTS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeU5wbUxvZ2luU3RhdGUoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgcmVnaXN0cnkgPSBgTlBNIGF0IHRoZSAke3RoaXMuX2NvbmZpZy5wdWJsaXNoUmVnaXN0cnkgPz8gJ2RlZmF1bHQgTlBNJ30gcmVnaXN0cnlgO1xuICAgIC8vIFRPRE8oam9zZXBocGVycm90dCk6IHJlbW92ZSB3b21iYXQgc3BlY2lmaWMgYmxvY2sgb25jZSB3b21ib3QgYWxsb3dzIGBucG0gd2hvYW1pYCBjaGVjayB0b1xuICAgIC8vIGNoZWNrIHRoZSBzdGF0dXMgb2YgdGhlIGxvY2FsIHRva2VuIGluIHRoZSAubnBtcmMgZmlsZS5cbiAgICBpZiAodGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeT8uaW5jbHVkZXMoJ3dvbWJhdC1kcmVzc2luZy1yb29tLmFwcHNwb3QuY29tJykpIHtcbiAgICAgIGluZm8oJ1VuYWJsZSB0byBkZXRlcm1pbmUgTlBNIGxvZ2luIHN0YXRlIGZvciB3b21iYXQgcHJveHksIHJlcXVpcmluZyBsb2dpbiBub3cuJyk7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBucG1Mb2dpbih0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5KTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGF3YWl0IG5wbUlzTG9nZ2VkSW4odGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSkpIHtcbiAgICAgIGRlYnVnKGBBbHJlYWR5IGxvZ2dlZCBpbnRvICR7cmVnaXN0cnl9LmApO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGVycm9yKHJlZChgICDinJggICBOb3QgY3VycmVudGx5IGxvZ2dlZCBpbnRvICR7cmVnaXN0cnl9LmApKTtcbiAgICBjb25zdCBzaG91bGRMb2dpbiA9IGF3YWl0IHByb21wdENvbmZpcm0oJ1dvdWxkIHlvdSBsaWtlIHRvIGxvZyBpbnRvIE5QTSBub3c/Jyk7XG4gICAgaWYgKHNob3VsZExvZ2luKSB7XG4gICAgICBkZWJ1ZygnU3RhcnRpbmcgTlBNIGxvZ2luLicpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgbnBtTG9naW4odGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIl19