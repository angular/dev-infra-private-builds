/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { prompt } from 'inquirer';
import { spawn } from '../../utils/child-process';
import { debug, error, info, log, promptConfirm, red, yellow } from '../../utils/console';
import { AuthenticatedGitClient } from '../../utils/git/authenticated-git-client';
import { fetchActiveReleaseTrains, nextBranchName } from '../versioning/active-release-trains';
import { npmIsLoggedIn, npmLogin, npmLogout } from '../versioning/npm-publish';
import { printActiveReleaseTrains } from '../versioning/print-active-trains';
import { FatalReleaseActionError, UserAbortedReleaseActionError } from './actions-error';
import { actions } from './actions/index';
export var CompletionState;
(function (CompletionState) {
    CompletionState[CompletionState["SUCCESS"] = 0] = "SUCCESS";
    CompletionState[CompletionState["FATAL_ERROR"] = 1] = "FATAL_ERROR";
    CompletionState[CompletionState["MANUALLY_ABORTED"] = 2] = "MANUALLY_ABORTED";
})(CompletionState || (CompletionState = {}));
export class ReleaseTool {
    constructor(_config, _github, _projectRoot) {
        this._config = _config;
        this._github = _github;
        this._projectRoot = _projectRoot;
        /** The singleton instance of the authenticated git client. */
        this._git = AuthenticatedGitClient.get();
        /** The previous git commit to return back to after the release tool runs. */
        this.previousGitBranchOrRevision = this._git.getCurrentBranchOrRevision();
    }
    /** Runs the interactive release tool. */
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            log();
            log(yellow('--------------------------------------------'));
            log(yellow('  Angular Dev-Infra release staging script'));
            log(yellow('--------------------------------------------'));
            log();
            if (!(yield this._verifyEnvironmentHasPython3Symlink()) ||
                !(yield this._verifyNoUncommittedChanges()) || !(yield this._verifyRunningFromNextBranch())) {
                return CompletionState.FATAL_ERROR;
            }
            if (!(yield this._verifyNpmLoginState())) {
                return CompletionState.MANUALLY_ABORTED;
            }
            const { owner, name } = this._github;
            const repo = { owner, name, api: this._git.github };
            const releaseTrains = yield fetchActiveReleaseTrains(repo);
            // Print the active release trains so that the caretaker can access
            // the current project branching state without switching context.
            yield printActiveReleaseTrains(releaseTrains, this._config);
            const action = yield this._promptForReleaseAction(releaseTrains);
            try {
                yield action.perform();
            }
            catch (e) {
                if (e instanceof UserAbortedReleaseActionError) {
                    return CompletionState.MANUALLY_ABORTED;
                }
                // Only print the error message and stack if the error is not a known fatal release
                // action error (for which we print the error gracefully to the console with colors).
                if (!(e instanceof FatalReleaseActionError) && e instanceof Error) {
                    console.error(e);
                }
                return CompletionState.FATAL_ERROR;
            }
            finally {
                yield this.cleanup();
            }
            return CompletionState.SUCCESS;
        });
    }
    /** Run post release tool cleanups. */
    cleanup() {
        return __awaiter(this, void 0, void 0, function* () {
            // Return back to the git state from before the release tool ran.
            this._git.checkout(this.previousGitBranchOrRevision, true);
            // Ensure log out of NPM.
            yield npmLogout(this._config.publishRegistry);
        });
    }
    /** Prompts the caretaker for a release action that should be performed. */
    _promptForReleaseAction(activeTrains) {
        return __awaiter(this, void 0, void 0, function* () {
            const choices = [];
            // Find and instantiate all release actions which are currently valid.
            for (let actionType of actions) {
                if (yield actionType.isActive(activeTrains, this._config)) {
                    const action = new actionType(activeTrains, this._git, this._config, this._projectRoot);
                    choices.push({ name: yield action.getDescription(), value: action });
                }
            }
            info('Please select the type of release you want to perform.');
            const { releaseAction } = yield prompt({
                name: 'releaseAction',
                message: 'Please select an action:',
                type: 'list',
                choices,
            });
            return releaseAction;
        });
    }
    /**
     * Verifies that there are no uncommitted changes in the project.
     * @returns a boolean indicating success or failure.
     */
    _verifyNoUncommittedChanges() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._git.hasUncommittedChanges()) {
                error(red('  ✘   There are changes which are not committed and should be discarded.'));
                return false;
            }
            return true;
        });
    }
    /**
     * Verifies that Python can be resolved within scripts and points to a compatible version. Python
     * is required in Bazel actions as there can be tools (such as `skydoc`) that rely on it.
     * @returns a boolean indicating success or failure.
     */
    _verifyEnvironmentHasPython3Symlink() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Note: We do not rely on `/usr/bin/env` but rather access the `env` binary directly as it
                // should be part of the shell's `$PATH`. This is necessary for compatibility with Windows.
                const pyVersion = yield spawn('env', ['python', '--version'], { mode: 'silent' });
                const version = pyVersion.stdout.trim() || pyVersion.stderr.trim();
                if (version.startsWith('Python 3.')) {
                    debug(`Local python version: ${version}`);
                    return true;
                }
                error(red(`  ✘   \`/usr/bin/python\` is currently symlinked to "${version}", please update`));
                error(red('      the symlink to link instead to Python3'));
                error();
                error(red('      Googlers: please run the following command to symlink python to python3:'));
                error(red('        sudo ln -s /usr/bin/python3 /usr/bin/python'));
                return false;
            }
            catch (_a) {
                error(red('  ✘   `/usr/bin/python` does not exist, please ensure `/usr/bin/python` is'));
                error(red('      symlinked to Python3.'));
                error();
                error(red('      Googlers: please run the following command to symlink python to python3:'));
                error(red('        sudo ln -s /usr/bin/python3 /usr/bin/python'));
            }
            return false;
        });
    }
    /**
     * Verifies that the next branch from the configured repository is checked out.
     * @returns a boolean indicating success or failure.
     */
    _verifyRunningFromNextBranch() {
        return __awaiter(this, void 0, void 0, function* () {
            const headSha = this._git.run(['rev-parse', 'HEAD']).stdout.trim();
            const { data } = yield this._git.github.repos.getBranch(Object.assign(Object.assign({}, this._git.remoteParams), { branch: nextBranchName }));
            if (headSha !== data.commit.sha) {
                error(red('  ✘   Running release tool from an outdated local branch.'));
                error(red(`      Please make sure you are running from the "${nextBranchName}" branch.`));
                return false;
            }
            return true;
        });
    }
    /**
     * Verifies that the user is logged into NPM at the correct registry, if defined for the release.
     * @returns a boolean indicating whether the user is logged into NPM.
     */
    _verifyNpmLoginState() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const registry = `NPM at the ${(_a = this._config.publishRegistry) !== null && _a !== void 0 ? _a : 'default NPM'} registry`;
            if (yield npmIsLoggedIn(this._config.publishRegistry)) {
                debug(`Already logged into ${registry}.`);
                return true;
            }
            error(red(`  ✘   Not currently logged into ${registry}.`));
            const shouldLogin = yield promptConfirm('Would you like to log into NPM now?');
            if (shouldLogin) {
                debug('Starting NPM login.');
                try {
                    yield npmLogin(this._config.publishRegistry);
                }
                catch (_b) {
                    return false;
                }
                return true;
            }
            return false;
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQW9CLE1BQU0sRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUVuRCxPQUFPLEVBQUMsS0FBSyxFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFFaEQsT0FBTyxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxhQUFhLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3hGLE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLDBDQUEwQyxDQUFDO0FBRWhGLE9BQU8sRUFBc0Isd0JBQXdCLEVBQUUsY0FBYyxFQUFDLE1BQU0scUNBQXFDLENBQUM7QUFDbEgsT0FBTyxFQUFDLGFBQWEsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDN0UsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sbUNBQW1DLENBQUM7QUFJM0UsT0FBTyxFQUFDLHVCQUF1QixFQUFFLDZCQUE2QixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDdkYsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBRXhDLE1BQU0sQ0FBTixJQUFZLGVBSVg7QUFKRCxXQUFZLGVBQWU7SUFDekIsMkRBQU8sQ0FBQTtJQUNQLG1FQUFXLENBQUE7SUFDWCw2RUFBZ0IsQ0FBQTtBQUNsQixDQUFDLEVBSlcsZUFBZSxLQUFmLGVBQWUsUUFJMUI7QUFFRCxNQUFNLE9BQU8sV0FBVztJQU10QixZQUNjLE9BQXNCLEVBQVksT0FBcUIsRUFDdkQsWUFBb0I7UUFEcEIsWUFBTyxHQUFQLE9BQU8sQ0FBZTtRQUFZLFlBQU8sR0FBUCxPQUFPLENBQWM7UUFDdkQsaUJBQVks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QWMsSUFBRSxDQUFDO1lBRWhHLElBQUksT0FBTyxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFO2dCQUMvQixLQUFLLENBQUMsR0FBRyxDQUFDLDJEQUEyRCxDQUFDLENBQUMsQ0FBQztnQkFDeEUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxvREFBb0QsY0FBYyxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUMxRixPQUFPLEtBQUssQ0FBQzthQUNkO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDVyxvQkFBb0I7OztZQUNoQyxNQUFNLFFBQVEsR0FBRyxjQUFjLE1BQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLG1DQUFJLGFBQWEsV0FBVyxDQUFDO1lBQ3hGLElBQUksTUFBTSxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFBRTtnQkFDckQsS0FBSyxDQUFDLHVCQUF1QixRQUFRLEdBQUcsQ0FBQyxDQUFDO2dCQUMxQyxPQUFPLElBQUksQ0FBQzthQUNiO1lBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzNELE1BQU0sV0FBVyxHQUFHLE1BQU0sYUFBYSxDQUFDLHFDQUFxQyxDQUFDLENBQUM7WUFDL0UsSUFBSSxXQUFXLEVBQUU7Z0JBQ2YsS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7Z0JBQzdCLElBQUk7b0JBQ0YsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztpQkFDOUM7Z0JBQUMsV0FBTTtvQkFDTixPQUFPLEtBQUssQ0FBQztpQkFDZDtnQkFDRCxPQUFPLElBQUksQ0FBQzthQUNiO1lBQ0QsT0FBTyxLQUFLLENBQUM7O0tBQ2Q7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0xpc3RDaG9pY2VPcHRpb25zLCBwcm9tcHR9IGZyb20gJ2lucXVpcmVyJztcblxuaW1wb3J0IHtzcGF3bn0gZnJvbSAnLi4vLi4vdXRpbHMvY2hpbGQtcHJvY2Vzcyc7XG5pbXBvcnQge0dpdGh1YkNvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZGVidWcsIGVycm9yLCBpbmZvLCBsb2csIHByb21wdENvbmZpcm0sIHJlZCwgeWVsbG93fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2F1dGhlbnRpY2F0ZWQtZ2l0LWNsaWVudCc7XG5pbXBvcnQge1JlbGVhc2VDb25maWd9IGZyb20gJy4uL2NvbmZpZy9pbmRleCc7XG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnMsIGZldGNoQWN0aXZlUmVsZWFzZVRyYWlucywgbmV4dEJyYW5jaE5hbWV9IGZyb20gJy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7bnBtSXNMb2dnZWRJbiwgbnBtTG9naW4sIG5wbUxvZ291dH0gZnJvbSAnLi4vdmVyc2lvbmluZy9ucG0tcHVibGlzaCc7XG5pbXBvcnQge3ByaW50QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vdmVyc2lvbmluZy9wcmludC1hY3RpdmUtdHJhaW5zJztcbmltcG9ydCB7R2l0aHViUmVwb1dpdGhBcGl9IGZyb20gJy4uL3ZlcnNpb25pbmcvdmVyc2lvbi1icmFuY2hlcyc7XG5cbmltcG9ydCB7UmVsZWFzZUFjdGlvbn0gZnJvbSAnLi9hY3Rpb25zJztcbmltcG9ydCB7RmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IsIFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yfSBmcm9tICcuL2FjdGlvbnMtZXJyb3InO1xuaW1wb3J0IHthY3Rpb25zfSBmcm9tICcuL2FjdGlvbnMvaW5kZXgnO1xuXG5leHBvcnQgZW51bSBDb21wbGV0aW9uU3RhdGUge1xuICBTVUNDRVNTLFxuICBGQVRBTF9FUlJPUixcbiAgTUFOVUFMTFlfQUJPUlRFRCxcbn1cblxuZXhwb3J0IGNsYXNzIFJlbGVhc2VUb29sIHtcbiAgLyoqIFRoZSBzaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIGF1dGhlbnRpY2F0ZWQgZ2l0IGNsaWVudC4gKi9cbiAgcHJpdmF0ZSBfZ2l0ID0gQXV0aGVudGljYXRlZEdpdENsaWVudC5nZXQoKTtcbiAgLyoqIFRoZSBwcmV2aW91cyBnaXQgY29tbWl0IHRvIHJldHVybiBiYWNrIHRvIGFmdGVyIHRoZSByZWxlYXNlIHRvb2wgcnVucy4gKi9cbiAgcHJpdmF0ZSBwcmV2aW91c0dpdEJyYW5jaE9yUmV2aXNpb24gPSB0aGlzLl9naXQuZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCBfY29uZmlnOiBSZWxlYXNlQ29uZmlnLCBwcm90ZWN0ZWQgX2dpdGh1YjogR2l0aHViQ29uZmlnLFxuICAgICAgcHJvdGVjdGVkIF9wcm9qZWN0Um9vdDogc3RyaW5nKSB7fVxuXG4gIC8qKiBSdW5zIHRoZSBpbnRlcmFjdGl2ZSByZWxlYXNlIHRvb2wuICovXG4gIGFzeW5jIHJ1bigpOiBQcm9taXNlPENvbXBsZXRpb25TdGF0ZT4ge1xuICAgIGxvZygpO1xuICAgIGxvZyh5ZWxsb3coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJykpO1xuICAgIGxvZyh5ZWxsb3coJyAgQW5ndWxhciBEZXYtSW5mcmEgcmVsZWFzZSBzdGFnaW5nIHNjcmlwdCcpKTtcbiAgICBsb2coeWVsbG93KCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpKTtcbiAgICBsb2coKTtcblxuICAgIGlmICghYXdhaXQgdGhpcy5fdmVyaWZ5RW52aXJvbm1lbnRIYXNQeXRob24zU3ltbGluaygpIHx8XG4gICAgICAgICFhd2FpdCB0aGlzLl92ZXJpZnlOb1VuY29tbWl0dGVkQ2hhbmdlcygpIHx8ICFhd2FpdCB0aGlzLl92ZXJpZnlSdW5uaW5nRnJvbU5leHRCcmFuY2goKSkge1xuICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5GQVRBTF9FUlJPUjtcbiAgICB9XG5cbiAgICBpZiAoIWF3YWl0IHRoaXMuX3ZlcmlmeU5wbUxvZ2luU3RhdGUoKSkge1xuICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5NQU5VQUxMWV9BQk9SVEVEO1xuICAgIH1cblxuICAgIGNvbnN0IHtvd25lciwgbmFtZX0gPSB0aGlzLl9naXRodWI7XG4gICAgY29uc3QgcmVwbzogR2l0aHViUmVwb1dpdGhBcGkgPSB7b3duZXIsIG5hbWUsIGFwaTogdGhpcy5fZ2l0LmdpdGh1Yn07XG4gICAgY29uc3QgcmVsZWFzZVRyYWlucyA9IGF3YWl0IGZldGNoQWN0aXZlUmVsZWFzZVRyYWlucyhyZXBvKTtcblxuICAgIC8vIFByaW50IHRoZSBhY3RpdmUgcmVsZWFzZSB0cmFpbnMgc28gdGhhdCB0aGUgY2FyZXRha2VyIGNhbiBhY2Nlc3NcbiAgICAvLyB0aGUgY3VycmVudCBwcm9qZWN0IGJyYW5jaGluZyBzdGF0ZSB3aXRob3V0IHN3aXRjaGluZyBjb250ZXh0LlxuICAgIGF3YWl0IHByaW50QWN0aXZlUmVsZWFzZVRyYWlucyhyZWxlYXNlVHJhaW5zLCB0aGlzLl9jb25maWcpO1xuXG4gICAgY29uc3QgYWN0aW9uID0gYXdhaXQgdGhpcy5fcHJvbXB0Rm9yUmVsZWFzZUFjdGlvbihyZWxlYXNlVHJhaW5zKTtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBhY3Rpb24ucGVyZm9ybSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlIGluc3RhbmNlb2YgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5NQU5VQUxMWV9BQk9SVEVEO1xuICAgICAgfVxuICAgICAgLy8gT25seSBwcmludCB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgc3RhY2sgaWYgdGhlIGVycm9yIGlzIG5vdCBhIGtub3duIGZhdGFsIHJlbGVhc2VcbiAgICAgIC8vIGFjdGlvbiBlcnJvciAoZm9yIHdoaWNoIHdlIHByaW50IHRoZSBlcnJvciBncmFjZWZ1bGx5IHRvIHRoZSBjb25zb2xlIHdpdGggY29sb3JzKS5cbiAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcikgJiYgZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLkZBVEFMX0VSUk9SO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBhd2FpdCB0aGlzLmNsZWFudXAoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLlNVQ0NFU1M7XG4gIH1cblxuICAvKiogUnVuIHBvc3QgcmVsZWFzZSB0b29sIGNsZWFudXBzLiAqL1xuICBwcml2YXRlIGFzeW5jIGNsZWFudXAoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gUmV0dXJuIGJhY2sgdG8gdGhlIGdpdCBzdGF0ZSBmcm9tIGJlZm9yZSB0aGUgcmVsZWFzZSB0b29sIHJhbi5cbiAgICB0aGlzLl9naXQuY2hlY2tvdXQodGhpcy5wcmV2aW91c0dpdEJyYW5jaE9yUmV2aXNpb24sIHRydWUpO1xuICAgIC8vIEVuc3VyZSBsb2cgb3V0IG9mIE5QTS5cbiAgICBhd2FpdCBucG1Mb2dvdXQodGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSk7XG4gIH1cblxuICAvKiogUHJvbXB0cyB0aGUgY2FyZXRha2VyIGZvciBhIHJlbGVhc2UgYWN0aW9uIHRoYXQgc2hvdWxkIGJlIHBlcmZvcm1lZC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfcHJvbXB0Rm9yUmVsZWFzZUFjdGlvbihhY3RpdmVUcmFpbnM6IEFjdGl2ZVJlbGVhc2VUcmFpbnMpIHtcbiAgICBjb25zdCBjaG9pY2VzOiBMaXN0Q2hvaWNlT3B0aW9uc1tdID0gW107XG5cbiAgICAvLyBGaW5kIGFuZCBpbnN0YW50aWF0ZSBhbGwgcmVsZWFzZSBhY3Rpb25zIHdoaWNoIGFyZSBjdXJyZW50bHkgdmFsaWQuXG4gICAgZm9yIChsZXQgYWN0aW9uVHlwZSBvZiBhY3Rpb25zKSB7XG4gICAgICBpZiAoYXdhaXQgYWN0aW9uVHlwZS5pc0FjdGl2ZShhY3RpdmVUcmFpbnMsIHRoaXMuX2NvbmZpZykpIHtcbiAgICAgICAgY29uc3QgYWN0aW9uOiBSZWxlYXNlQWN0aW9uID1cbiAgICAgICAgICAgIG5ldyBhY3Rpb25UeXBlKGFjdGl2ZVRyYWlucywgdGhpcy5fZ2l0LCB0aGlzLl9jb25maWcsIHRoaXMuX3Byb2plY3RSb290KTtcbiAgICAgICAgY2hvaWNlcy5wdXNoKHtuYW1lOiBhd2FpdCBhY3Rpb24uZ2V0RGVzY3JpcHRpb24oKSwgdmFsdWU6IGFjdGlvbn0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGluZm8oJ1BsZWFzZSBzZWxlY3QgdGhlIHR5cGUgb2YgcmVsZWFzZSB5b3Ugd2FudCB0byBwZXJmb3JtLicpO1xuXG4gICAgY29uc3Qge3JlbGVhc2VBY3Rpb259ID0gYXdhaXQgcHJvbXB0PHtyZWxlYXNlQWN0aW9uOiBSZWxlYXNlQWN0aW9ufT4oe1xuICAgICAgbmFtZTogJ3JlbGVhc2VBY3Rpb24nLFxuICAgICAgbWVzc2FnZTogJ1BsZWFzZSBzZWxlY3QgYW4gYWN0aW9uOicsXG4gICAgICB0eXBlOiAnbGlzdCcsXG4gICAgICBjaG9pY2VzLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlbGVhc2VBY3Rpb247XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgdGhhdCB0aGVyZSBhcmUgbm8gdW5jb21taXR0ZWQgY2hhbmdlcyBpbiB0aGUgcHJvamVjdC5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2VzcyBvciBmYWlsdXJlLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfdmVyaWZ5Tm9VbmNvbW1pdHRlZENoYW5nZXMoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKHRoaXMuX2dpdC5oYXNVbmNvbW1pdHRlZENoYW5nZXMoKSkge1xuICAgICAgZXJyb3IocmVkKCcgIOKcmCAgIFRoZXJlIGFyZSBjaGFuZ2VzIHdoaWNoIGFyZSBub3QgY29tbWl0dGVkIGFuZCBzaG91bGQgYmUgZGlzY2FyZGVkLicpKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgdGhhdCBQeXRob24gY2FuIGJlIHJlc29sdmVkIHdpdGhpbiBzY3JpcHRzIGFuZCBwb2ludHMgdG8gYSBjb21wYXRpYmxlIHZlcnNpb24uIFB5dGhvblxuICAgKiBpcyByZXF1aXJlZCBpbiBCYXplbCBhY3Rpb25zIGFzIHRoZXJlIGNhbiBiZSB0b29scyAoc3VjaCBhcyBgc2t5ZG9jYCkgdGhhdCByZWx5IG9uIGl0LlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyBzdWNjZXNzIG9yIGZhaWx1cmUuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlFbnZpcm9ubWVudEhhc1B5dGhvbjNTeW1saW5rKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRyeSB7XG4gICAgICAvLyBOb3RlOiBXZSBkbyBub3QgcmVseSBvbiBgL3Vzci9iaW4vZW52YCBidXQgcmF0aGVyIGFjY2VzcyB0aGUgYGVudmAgYmluYXJ5IGRpcmVjdGx5IGFzIGl0XG4gICAgICAvLyBzaG91bGQgYmUgcGFydCBvZiB0aGUgc2hlbGwncyBgJFBBVEhgLiBUaGlzIGlzIG5lY2Vzc2FyeSBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIFdpbmRvd3MuXG4gICAgICBjb25zdCBweVZlcnNpb24gPSBhd2FpdCBzcGF3bignZW52JywgWydweXRob24nLCAnLS12ZXJzaW9uJ10sIHttb2RlOiAnc2lsZW50J30pO1xuICAgICAgY29uc3QgdmVyc2lvbiA9IHB5VmVyc2lvbi5zdGRvdXQudHJpbSgpIHx8IHB5VmVyc2lvbi5zdGRlcnIudHJpbSgpO1xuICAgICAgaWYgKHZlcnNpb24uc3RhcnRzV2l0aCgnUHl0aG9uIDMuJykpIHtcbiAgICAgICAgZGVidWcoYExvY2FsIHB5dGhvbiB2ZXJzaW9uOiAke3ZlcnNpb259YCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgZXJyb3IocmVkKGAgIOKcmCAgIFxcYC91c3IvYmluL3B5dGhvblxcYCBpcyBjdXJyZW50bHkgc3ltbGlua2VkIHRvIFwiJHt2ZXJzaW9ufVwiLCBwbGVhc2UgdXBkYXRlYCkpO1xuICAgICAgZXJyb3IocmVkKCcgICAgICB0aGUgc3ltbGluayB0byBsaW5rIGluc3RlYWQgdG8gUHl0aG9uMycpKTtcbiAgICAgIGVycm9yKCk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgIEdvb2dsZXJzOiBwbGVhc2UgcnVuIHRoZSBmb2xsb3dpbmcgY29tbWFuZCB0byBzeW1saW5rIHB5dGhvbiB0byBweXRob24zOicpKTtcbiAgICAgIGVycm9yKHJlZCgnICAgICAgICBzdWRvIGxuIC1zIC91c3IvYmluL3B5dGhvbjMgL3Vzci9iaW4vcHl0aG9uJykpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gY2F0Y2gge1xuICAgICAgZXJyb3IocmVkKCcgIOKcmCAgIGAvdXNyL2Jpbi9weXRob25gIGRvZXMgbm90IGV4aXN0LCBwbGVhc2UgZW5zdXJlIGAvdXNyL2Jpbi9weXRob25gIGlzJykpO1xuICAgICAgZXJyb3IocmVkKCcgICAgICBzeW1saW5rZWQgdG8gUHl0aG9uMy4nKSk7XG4gICAgICBlcnJvcigpO1xuICAgICAgZXJyb3IocmVkKCcgICAgICBHb29nbGVyczogcGxlYXNlIHJ1biB0aGUgZm9sbG93aW5nIGNvbW1hbmQgdG8gc3ltbGluayBweXRob24gdG8gcHl0aG9uMzonKSk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgICAgc3VkbyBsbiAtcyAvdXNyL2Jpbi9weXRob24zIC91c3IvYmluL3B5dGhvbicpKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIHRoYXQgdGhlIG5leHQgYnJhbmNoIGZyb20gdGhlIGNvbmZpZ3VyZWQgcmVwb3NpdG9yeSBpcyBjaGVja2VkIG91dC5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2VzcyBvciBmYWlsdXJlLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfdmVyaWZ5UnVubmluZ0Zyb21OZXh0QnJhbmNoKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGhlYWRTaGEgPSB0aGlzLl9naXQucnVuKFsncmV2LXBhcnNlJywgJ0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgICBjb25zdCB7ZGF0YX0gPVxuICAgICAgICBhd2FpdCB0aGlzLl9naXQuZ2l0aHViLnJlcG9zLmdldEJyYW5jaCh7Li4udGhpcy5fZ2l0LnJlbW90ZVBhcmFtcywgYnJhbmNoOiBuZXh0QnJhbmNoTmFtZX0pO1xuXG4gICAgaWYgKGhlYWRTaGEgIT09IGRhdGEuY29tbWl0LnNoYSkge1xuICAgICAgZXJyb3IocmVkKCcgIOKcmCAgIFJ1bm5pbmcgcmVsZWFzZSB0b29sIGZyb20gYW4gb3V0ZGF0ZWQgbG9jYWwgYnJhbmNoLicpKTtcbiAgICAgIGVycm9yKHJlZChgICAgICAgUGxlYXNlIG1ha2Ugc3VyZSB5b3UgYXJlIHJ1bm5pbmcgZnJvbSB0aGUgXCIke25leHRCcmFuY2hOYW1lfVwiIGJyYW5jaC5gKSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIHRoYXQgdGhlIHVzZXIgaXMgbG9nZ2VkIGludG8gTlBNIGF0IHRoZSBjb3JyZWN0IHJlZ2lzdHJ5LCBpZiBkZWZpbmVkIGZvciB0aGUgcmVsZWFzZS5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgdXNlciBpcyBsb2dnZWQgaW50byBOUE0uXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlOcG1Mb2dpblN0YXRlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHJlZ2lzdHJ5ID0gYE5QTSBhdCB0aGUgJHt0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5ID8/ICdkZWZhdWx0IE5QTSd9IHJlZ2lzdHJ5YDtcbiAgICBpZiAoYXdhaXQgbnBtSXNMb2dnZWRJbih0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5KSkge1xuICAgICAgZGVidWcoYEFscmVhZHkgbG9nZ2VkIGludG8gJHtyZWdpc3RyeX0uYCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgZXJyb3IocmVkKGAgIOKcmCAgIE5vdCBjdXJyZW50bHkgbG9nZ2VkIGludG8gJHtyZWdpc3RyeX0uYCkpO1xuICAgIGNvbnN0IHNob3VsZExvZ2luID0gYXdhaXQgcHJvbXB0Q29uZmlybSgnV291bGQgeW91IGxpa2UgdG8gbG9nIGludG8gTlBNIG5vdz8nKTtcbiAgICBpZiAoc2hvdWxkTG9naW4pIHtcbiAgICAgIGRlYnVnKCdTdGFydGluZyBOUE0gbG9naW4uJyk7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBucG1Mb2dpbih0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5KTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iXX0=