/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { prompt } from 'inquirer';
import { spawnWithDebugOutput } from '../../utils/child-process';
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
                const pyVersion = yield spawnWithDebugOutput('env', ['python', '--version'], { mode: 'silent' });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQW9CLE1BQU0sRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUVuRCxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUUvRCxPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDeEYsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sMENBQTBDLENBQUM7QUFFaEYsT0FBTyxFQUFzQix3QkFBd0IsRUFBRSxjQUFjLEVBQUMsTUFBTSxxQ0FBcUMsQ0FBQztBQUNsSCxPQUFPLEVBQUMsYUFBYSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUM3RSxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQUkzRSxPQUFPLEVBQUMsdUJBQXVCLEVBQUUsNkJBQTZCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN2RixPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFFeEMsTUFBTSxDQUFOLElBQVksZUFJWDtBQUpELFdBQVksZUFBZTtJQUN6QiwyREFBTyxDQUFBO0lBQ1AsbUVBQVcsQ0FBQTtJQUNYLDZFQUFnQixDQUFBO0FBQ2xCLENBQUMsRUFKVyxlQUFlLEtBQWYsZUFBZSxRQUkxQjtBQUVELE1BQU0sT0FBTyxXQUFXO0lBTXRCLFlBQ2MsT0FBc0IsRUFBWSxPQUFxQixFQUN2RCxZQUFvQjtRQURwQixZQUFPLEdBQVAsT0FBTyxDQUFlO1FBQVksWUFBTyxHQUFQLE9BQU8sQ0FBYztRQUN2RCxpQkFBWSxHQUFaLFlBQVksQ0FBUTtRQVBsQyw4REFBOEQ7UUFDdEQsU0FBSSxHQUFHLHNCQUFzQixDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVDLDZFQUE2RTtRQUNyRSxnQ0FBMkIsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7SUFJeEMsQ0FBQztJQUV0Qyx5Q0FBeUM7SUFDbkMsR0FBRzs7WUFDUCxHQUFHLEVBQUUsQ0FBQztZQUNOLEdBQUcsQ0FBQyxNQUFNLENBQUMsOENBQThDLENBQUMsQ0FBQyxDQUFDO1lBQzVELEdBQUcsQ0FBQyxNQUFNLENBQUMsNENBQTRDLENBQUMsQ0FBQyxDQUFDO1lBQzFELEdBQUcsQ0FBQyxNQUFNLENBQUMsOENBQThDLENBQUMsQ0FBQyxDQUFDO1lBQzVELEdBQUcsRUFBRSxDQUFDO1lBRU4sSUFBSSxDQUFDLENBQUEsTUFBTSxJQUFJLENBQUMsbUNBQW1DLEVBQUUsQ0FBQTtnQkFDakQsQ0FBQyxDQUFBLE1BQU0sSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUEsSUFBSSxDQUFDLENBQUEsTUFBTSxJQUFJLENBQUMsNEJBQTRCLEVBQUUsQ0FBQSxFQUFFO2dCQUMzRixPQUFPLGVBQWUsQ0FBQyxXQUFXLENBQUM7YUFDcEM7WUFFRCxJQUFJLENBQUMsQ0FBQSxNQUFNLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFBLEVBQUU7Z0JBQ3RDLE9BQU8sZUFBZSxDQUFDLGdCQUFnQixDQUFDO2FBQ3pDO1lBRUQsTUFBTSxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ25DLE1BQU0sSUFBSSxHQUFzQixFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFDLENBQUM7WUFDckUsTUFBTSxhQUFhLEdBQUcsTUFBTSx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUUzRCxtRUFBbUU7WUFDbkUsaUVBQWlFO1lBQ2pFLE1BQU0sd0JBQXdCLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUU1RCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUVqRSxJQUFJO2dCQUNGLE1BQU0sTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ3hCO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsSUFBSSxDQUFDLFlBQVksNkJBQTZCLEVBQUU7b0JBQzlDLE9BQU8sZUFBZSxDQUFDLGdCQUFnQixDQUFDO2lCQUN6QztnQkFDRCxtRkFBbUY7Z0JBQ25GLHFGQUFxRjtnQkFDckYsSUFBSSxDQUFDLENBQUMsQ0FBQyxZQUFZLHVCQUF1QixDQUFDLElBQUksQ0FBQyxZQUFZLEtBQUssRUFBRTtvQkFDakUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDbEI7Z0JBQ0QsT0FBTyxlQUFlLENBQUMsV0FBVyxDQUFDO2FBQ3BDO29CQUFTO2dCQUNSLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ3RCO1lBRUQsT0FBTyxlQUFlLENBQUMsT0FBTyxDQUFDO1FBQ2pDLENBQUM7S0FBQTtJQUVELHNDQUFzQztJQUN4QixPQUFPOztZQUNuQixpRUFBaUU7WUFDakUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLDJCQUEyQixFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzNELHlCQUF5QjtZQUN6QixNQUFNLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ2hELENBQUM7S0FBQTtJQUVELDJFQUEyRTtJQUM3RCx1QkFBdUIsQ0FBQyxZQUFpQzs7WUFDckUsTUFBTSxPQUFPLEdBQXdCLEVBQUUsQ0FBQztZQUV4QyxzRUFBc0U7WUFDdEUsS0FBSyxJQUFJLFVBQVUsSUFBSSxPQUFPLEVBQUU7Z0JBQzlCLElBQUksTUFBTSxVQUFVLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ3pELE1BQU0sTUFBTSxHQUNSLElBQUksVUFBVSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUM3RSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLE1BQU0sTUFBTSxDQUFDLGNBQWMsRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO2lCQUNwRTthQUNGO1lBRUQsSUFBSSxDQUFDLHdEQUF3RCxDQUFDLENBQUM7WUFFL0QsTUFBTSxFQUFDLGFBQWEsRUFBQyxHQUFHLE1BQU0sTUFBTSxDQUFpQztnQkFDbkUsSUFBSSxFQUFFLGVBQWU7Z0JBQ3JCLE9BQU8sRUFBRSwwQkFBMEI7Z0JBQ25DLElBQUksRUFBRSxNQUFNO2dCQUNaLE9BQU87YUFDUixDQUFDLENBQUM7WUFFSCxPQUFPLGFBQWEsQ0FBQztRQUN2QixDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDVywyQkFBMkI7O1lBQ3ZDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFFO2dCQUNyQyxLQUFLLENBQUMsR0FBRyxDQUFDLDBFQUEwRSxDQUFDLENBQUMsQ0FBQztnQkFDdkYsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztLQUFBO0lBRUQ7Ozs7T0FJRztJQUNXLG1DQUFtQzs7WUFDL0MsSUFBSTtnQkFDRiwyRkFBMkY7Z0JBQzNGLDJGQUEyRjtnQkFDM0YsTUFBTSxTQUFTLEdBQ1gsTUFBTSxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztnQkFDakYsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNuRSxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLEVBQUU7b0JBQ25DLEtBQUssQ0FBQyx5QkFBeUIsT0FBTyxFQUFFLENBQUMsQ0FBQztvQkFDMUMsT0FBTyxJQUFJLENBQUM7aUJBQ2I7Z0JBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyx3REFBd0QsT0FBTyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7Z0JBQzlGLEtBQUssQ0FBQyxHQUFHLENBQUMsOENBQThDLENBQUMsQ0FBQyxDQUFDO2dCQUMzRCxLQUFLLEVBQUUsQ0FBQztnQkFDUixLQUFLLENBQUMsR0FBRyxDQUFDLGdGQUFnRixDQUFDLENBQUMsQ0FBQztnQkFDN0YsS0FBSyxDQUFDLEdBQUcsQ0FBQyxxREFBcUQsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xFLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFBQyxXQUFNO2dCQUNOLEtBQUssQ0FBQyxHQUFHLENBQUMsNEVBQTRFLENBQUMsQ0FBQyxDQUFDO2dCQUN6RixLQUFLLENBQUMsR0FBRyxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQztnQkFDMUMsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxnRkFBZ0YsQ0FBQyxDQUFDLENBQUM7Z0JBQzdGLEtBQUssQ0FBQyxHQUFHLENBQUMscURBQXFELENBQUMsQ0FBQyxDQUFDO2FBQ25FO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDVyw0QkFBNEI7O1lBQ3hDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ25FLE1BQU0sRUFBQyxJQUFJLEVBQUMsR0FDUixNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLGlDQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxLQUFFLE1BQU0sRUFBRSxjQUFjLElBQUUsQ0FBQztZQUVoRyxJQUFJLE9BQU8sS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRTtnQkFDL0IsS0FBSyxDQUFDLEdBQUcsQ0FBQywyREFBMkQsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hFLEtBQUssQ0FBQyxHQUFHLENBQUMsb0RBQW9ELGNBQWMsV0FBVyxDQUFDLENBQUMsQ0FBQztnQkFDMUYsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztLQUFBO0lBRUQ7OztPQUdHO0lBQ1csb0JBQW9COzs7WUFDaEMsTUFBTSxRQUFRLEdBQUcsY0FBYyxNQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxtQ0FBSSxhQUFhLFdBQVcsQ0FBQztZQUN4RixJQUFJLE1BQU0sYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUU7Z0JBQ3JELEtBQUssQ0FBQyx1QkFBdUIsUUFBUSxHQUFHLENBQUMsQ0FBQztnQkFDMUMsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsbUNBQW1DLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMzRCxNQUFNLFdBQVcsR0FBRyxNQUFNLGFBQWEsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1lBQy9FLElBQUksV0FBVyxFQUFFO2dCQUNmLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2dCQUM3QixJQUFJO29CQUNGLE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7aUJBQzlDO2dCQUFDLFdBQU07b0JBQ04sT0FBTyxLQUFLLENBQUM7aUJBQ2Q7Z0JBQ0QsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUNELE9BQU8sS0FBSyxDQUFDOztLQUNkO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtMaXN0Q2hvaWNlT3B0aW9ucywgcHJvbXB0fSBmcm9tICdpbnF1aXJlcic7XG5cbmltcG9ydCB7c3Bhd25XaXRoRGVidWdPdXRwdXR9IGZyb20gJy4uLy4uL3V0aWxzL2NoaWxkLXByb2Nlc3MnO1xuaW1wb3J0IHtHaXRodWJDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2RlYnVnLCBlcnJvciwgaW5mbywgbG9nLCBwcm9tcHRDb25maXJtLCByZWQsIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHtSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zLCBmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnMsIG5leHRCcmFuY2hOYW1lfSBmcm9tICcuLi92ZXJzaW9uaW5nL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge25wbUlzTG9nZ2VkSW4sIG5wbUxvZ2luLCBucG1Mb2dvdXR9IGZyb20gJy4uL3ZlcnNpb25pbmcvbnBtLXB1Ymxpc2gnO1xuaW1wb3J0IHtwcmludEFjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uL3ZlcnNpb25pbmcvcHJpbnQtYWN0aXZlLXRyYWlucyc7XG5pbXBvcnQge0dpdGh1YlJlcG9XaXRoQXBpfSBmcm9tICcuLi92ZXJzaW9uaW5nL3ZlcnNpb24tYnJhbmNoZXMnO1xuXG5pbXBvcnQge1JlbGVhc2VBY3Rpb259IGZyb20gJy4vYWN0aW9ucyc7XG5pbXBvcnQge0ZhdGFsUmVsZWFzZUFjdGlvbkVycm9yLCBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcn0gZnJvbSAnLi9hY3Rpb25zLWVycm9yJztcbmltcG9ydCB7YWN0aW9uc30gZnJvbSAnLi9hY3Rpb25zL2luZGV4JztcblxuZXhwb3J0IGVudW0gQ29tcGxldGlvblN0YXRlIHtcbiAgU1VDQ0VTUyxcbiAgRkFUQUxfRVJST1IsXG4gIE1BTlVBTExZX0FCT1JURUQsXG59XG5cbmV4cG9ydCBjbGFzcyBSZWxlYXNlVG9vbCB7XG4gIC8qKiBUaGUgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSBhdXRoZW50aWNhdGVkIGdpdCBjbGllbnQuICovXG4gIHByaXZhdGUgX2dpdCA9IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQuZ2V0KCk7XG4gIC8qKiBUaGUgcHJldmlvdXMgZ2l0IGNvbW1pdCB0byByZXR1cm4gYmFjayB0byBhZnRlciB0aGUgcmVsZWFzZSB0b29sIHJ1bnMuICovXG4gIHByaXZhdGUgcHJldmlvdXNHaXRCcmFuY2hPclJldmlzaW9uID0gdGhpcy5fZ2l0LmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcm90ZWN0ZWQgX2NvbmZpZzogUmVsZWFzZUNvbmZpZywgcHJvdGVjdGVkIF9naXRodWI6IEdpdGh1YkNvbmZpZyxcbiAgICAgIHByb3RlY3RlZCBfcHJvamVjdFJvb3Q6IHN0cmluZykge31cblxuICAvKiogUnVucyB0aGUgaW50ZXJhY3RpdmUgcmVsZWFzZSB0b29sLiAqL1xuICBhc3luYyBydW4oKTogUHJvbWlzZTxDb21wbGV0aW9uU3RhdGU+IHtcbiAgICBsb2coKTtcbiAgICBsb2coeWVsbG93KCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpKTtcbiAgICBsb2coeWVsbG93KCcgIEFuZ3VsYXIgRGV2LUluZnJhIHJlbGVhc2Ugc3RhZ2luZyBzY3JpcHQnKSk7XG4gICAgbG9nKHllbGxvdygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKSk7XG4gICAgbG9nKCk7XG5cbiAgICBpZiAoIWF3YWl0IHRoaXMuX3ZlcmlmeUVudmlyb25tZW50SGFzUHl0aG9uM1N5bWxpbmsoKSB8fFxuICAgICAgICAhYXdhaXQgdGhpcy5fdmVyaWZ5Tm9VbmNvbW1pdHRlZENoYW5nZXMoKSB8fCAhYXdhaXQgdGhpcy5fdmVyaWZ5UnVubmluZ0Zyb21OZXh0QnJhbmNoKCkpIHtcbiAgICAgIHJldHVybiBDb21wbGV0aW9uU3RhdGUuRkFUQUxfRVJST1I7XG4gICAgfVxuXG4gICAgaWYgKCFhd2FpdCB0aGlzLl92ZXJpZnlOcG1Mb2dpblN0YXRlKCkpIHtcbiAgICAgIHJldHVybiBDb21wbGV0aW9uU3RhdGUuTUFOVUFMTFlfQUJPUlRFRDtcbiAgICB9XG5cbiAgICBjb25zdCB7b3duZXIsIG5hbWV9ID0gdGhpcy5fZ2l0aHViO1xuICAgIGNvbnN0IHJlcG86IEdpdGh1YlJlcG9XaXRoQXBpID0ge293bmVyLCBuYW1lLCBhcGk6IHRoaXMuX2dpdC5naXRodWJ9O1xuICAgIGNvbnN0IHJlbGVhc2VUcmFpbnMgPSBhd2FpdCBmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnMocmVwbyk7XG5cbiAgICAvLyBQcmludCB0aGUgYWN0aXZlIHJlbGVhc2UgdHJhaW5zIHNvIHRoYXQgdGhlIGNhcmV0YWtlciBjYW4gYWNjZXNzXG4gICAgLy8gdGhlIGN1cnJlbnQgcHJvamVjdCBicmFuY2hpbmcgc3RhdGUgd2l0aG91dCBzd2l0Y2hpbmcgY29udGV4dC5cbiAgICBhd2FpdCBwcmludEFjdGl2ZVJlbGVhc2VUcmFpbnMocmVsZWFzZVRyYWlucywgdGhpcy5fY29uZmlnKTtcblxuICAgIGNvbnN0IGFjdGlvbiA9IGF3YWl0IHRoaXMuX3Byb21wdEZvclJlbGVhc2VBY3Rpb24ocmVsZWFzZVRyYWlucyk7XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgYWN0aW9uLnBlcmZvcm0oKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yKSB7XG4gICAgICAgIHJldHVybiBDb21wbGV0aW9uU3RhdGUuTUFOVUFMTFlfQUJPUlRFRDtcbiAgICAgIH1cbiAgICAgIC8vIE9ubHkgcHJpbnQgdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHN0YWNrIGlmIHRoZSBlcnJvciBpcyBub3QgYSBrbm93biBmYXRhbCByZWxlYXNlXG4gICAgICAvLyBhY3Rpb24gZXJyb3IgKGZvciB3aGljaCB3ZSBwcmludCB0aGUgZXJyb3IgZ3JhY2VmdWxseSB0byB0aGUgY29uc29sZSB3aXRoIGNvbG9ycykuXG4gICAgICBpZiAoIShlIGluc3RhbmNlb2YgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IpICYmIGUgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5GQVRBTF9FUlJPUjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgYXdhaXQgdGhpcy5jbGVhbnVwKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5TVUNDRVNTO1xuICB9XG5cbiAgLyoqIFJ1biBwb3N0IHJlbGVhc2UgdG9vbCBjbGVhbnVwcy4gKi9cbiAgcHJpdmF0ZSBhc3luYyBjbGVhbnVwKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFJldHVybiBiYWNrIHRvIHRoZSBnaXQgc3RhdGUgZnJvbSBiZWZvcmUgdGhlIHJlbGVhc2UgdG9vbCByYW4uXG4gICAgdGhpcy5fZ2l0LmNoZWNrb3V0KHRoaXMucHJldmlvdXNHaXRCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcbiAgICAvLyBFbnN1cmUgbG9nIG91dCBvZiBOUE0uXG4gICAgYXdhaXQgbnBtTG9nb3V0KHRoaXMuX2NvbmZpZy5wdWJsaXNoUmVnaXN0cnkpO1xuICB9XG5cbiAgLyoqIFByb21wdHMgdGhlIGNhcmV0YWtlciBmb3IgYSByZWxlYXNlIGFjdGlvbiB0aGF0IHNob3VsZCBiZSBwZXJmb3JtZWQuICovXG4gIHByaXZhdGUgYXN5bmMgX3Byb21wdEZvclJlbGVhc2VBY3Rpb24oYWN0aXZlVHJhaW5zOiBBY3RpdmVSZWxlYXNlVHJhaW5zKSB7XG4gICAgY29uc3QgY2hvaWNlczogTGlzdENob2ljZU9wdGlvbnNbXSA9IFtdO1xuXG4gICAgLy8gRmluZCBhbmQgaW5zdGFudGlhdGUgYWxsIHJlbGVhc2UgYWN0aW9ucyB3aGljaCBhcmUgY3VycmVudGx5IHZhbGlkLlxuICAgIGZvciAobGV0IGFjdGlvblR5cGUgb2YgYWN0aW9ucykge1xuICAgICAgaWYgKGF3YWl0IGFjdGlvblR5cGUuaXNBY3RpdmUoYWN0aXZlVHJhaW5zLCB0aGlzLl9jb25maWcpKSB7XG4gICAgICAgIGNvbnN0IGFjdGlvbjogUmVsZWFzZUFjdGlvbiA9XG4gICAgICAgICAgICBuZXcgYWN0aW9uVHlwZShhY3RpdmVUcmFpbnMsIHRoaXMuX2dpdCwgdGhpcy5fY29uZmlnLCB0aGlzLl9wcm9qZWN0Um9vdCk7XG4gICAgICAgIGNob2ljZXMucHVzaCh7bmFtZTogYXdhaXQgYWN0aW9uLmdldERlc2NyaXB0aW9uKCksIHZhbHVlOiBhY3Rpb259KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpbmZvKCdQbGVhc2Ugc2VsZWN0IHRoZSB0eXBlIG9mIHJlbGVhc2UgeW91IHdhbnQgdG8gcGVyZm9ybS4nKTtcblxuICAgIGNvbnN0IHtyZWxlYXNlQWN0aW9ufSA9IGF3YWl0IHByb21wdDx7cmVsZWFzZUFjdGlvbjogUmVsZWFzZUFjdGlvbn0+KHtcbiAgICAgIG5hbWU6ICdyZWxlYXNlQWN0aW9uJyxcbiAgICAgIG1lc3NhZ2U6ICdQbGVhc2Ugc2VsZWN0IGFuIGFjdGlvbjonLFxuICAgICAgdHlwZTogJ2xpc3QnLFxuICAgICAgY2hvaWNlcyxcbiAgICB9KTtcblxuICAgIHJldHVybiByZWxlYXNlQWN0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIHRoYXQgdGhlcmUgYXJlIG5vIHVuY29tbWl0dGVkIGNoYW5nZXMgaW4gdGhlIHByb2plY3QuXG4gICAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHN1Y2Nlc3Mgb3IgZmFpbHVyZS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeU5vVW5jb21taXR0ZWRDaGFuZ2VzKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmICh0aGlzLl9naXQuaGFzVW5jb21taXR0ZWRDaGFuZ2VzKCkpIHtcbiAgICAgIGVycm9yKHJlZCgnICDinJggICBUaGVyZSBhcmUgY2hhbmdlcyB3aGljaCBhcmUgbm90IGNvbW1pdHRlZCBhbmQgc2hvdWxkIGJlIGRpc2NhcmRlZC4nKSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIHRoYXQgUHl0aG9uIGNhbiBiZSByZXNvbHZlZCB3aXRoaW4gc2NyaXB0cyBhbmQgcG9pbnRzIHRvIGEgY29tcGF0aWJsZSB2ZXJzaW9uLiBQeXRob25cbiAgICogaXMgcmVxdWlyZWQgaW4gQmF6ZWwgYWN0aW9ucyBhcyB0aGVyZSBjYW4gYmUgdG9vbHMgKHN1Y2ggYXMgYHNreWRvY2ApIHRoYXQgcmVseSBvbiBpdC5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2VzcyBvciBmYWlsdXJlLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfdmVyaWZ5RW52aXJvbm1lbnRIYXNQeXRob24zU3ltbGluaygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0cnkge1xuICAgICAgLy8gTm90ZTogV2UgZG8gbm90IHJlbHkgb24gYC91c3IvYmluL2VudmAgYnV0IHJhdGhlciBhY2Nlc3MgdGhlIGBlbnZgIGJpbmFyeSBkaXJlY3RseSBhcyBpdFxuICAgICAgLy8gc2hvdWxkIGJlIHBhcnQgb2YgdGhlIHNoZWxsJ3MgYCRQQVRIYC4gVGhpcyBpcyBuZWNlc3NhcnkgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBXaW5kb3dzLlxuICAgICAgY29uc3QgcHlWZXJzaW9uID1cbiAgICAgICAgICBhd2FpdCBzcGF3bldpdGhEZWJ1Z091dHB1dCgnZW52JywgWydweXRob24nLCAnLS12ZXJzaW9uJ10sIHttb2RlOiAnc2lsZW50J30pO1xuICAgICAgY29uc3QgdmVyc2lvbiA9IHB5VmVyc2lvbi5zdGRvdXQudHJpbSgpIHx8IHB5VmVyc2lvbi5zdGRlcnIudHJpbSgpO1xuICAgICAgaWYgKHZlcnNpb24uc3RhcnRzV2l0aCgnUHl0aG9uIDMuJykpIHtcbiAgICAgICAgZGVidWcoYExvY2FsIHB5dGhvbiB2ZXJzaW9uOiAke3ZlcnNpb259YCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgZXJyb3IocmVkKGAgIOKcmCAgIFxcYC91c3IvYmluL3B5dGhvblxcYCBpcyBjdXJyZW50bHkgc3ltbGlua2VkIHRvIFwiJHt2ZXJzaW9ufVwiLCBwbGVhc2UgdXBkYXRlYCkpO1xuICAgICAgZXJyb3IocmVkKCcgICAgICB0aGUgc3ltbGluayB0byBsaW5rIGluc3RlYWQgdG8gUHl0aG9uMycpKTtcbiAgICAgIGVycm9yKCk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgIEdvb2dsZXJzOiBwbGVhc2UgcnVuIHRoZSBmb2xsb3dpbmcgY29tbWFuZCB0byBzeW1saW5rIHB5dGhvbiB0byBweXRob24zOicpKTtcbiAgICAgIGVycm9yKHJlZCgnICAgICAgICBzdWRvIGxuIC1zIC91c3IvYmluL3B5dGhvbjMgL3Vzci9iaW4vcHl0aG9uJykpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gY2F0Y2gge1xuICAgICAgZXJyb3IocmVkKCcgIOKcmCAgIGAvdXNyL2Jpbi9weXRob25gIGRvZXMgbm90IGV4aXN0LCBwbGVhc2UgZW5zdXJlIGAvdXNyL2Jpbi9weXRob25gIGlzJykpO1xuICAgICAgZXJyb3IocmVkKCcgICAgICBzeW1saW5rZWQgdG8gUHl0aG9uMy4nKSk7XG4gICAgICBlcnJvcigpO1xuICAgICAgZXJyb3IocmVkKCcgICAgICBHb29nbGVyczogcGxlYXNlIHJ1biB0aGUgZm9sbG93aW5nIGNvbW1hbmQgdG8gc3ltbGluayBweXRob24gdG8gcHl0aG9uMzonKSk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgICAgc3VkbyBsbiAtcyAvdXNyL2Jpbi9weXRob24zIC91c3IvYmluL3B5dGhvbicpKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIHRoYXQgdGhlIG5leHQgYnJhbmNoIGZyb20gdGhlIGNvbmZpZ3VyZWQgcmVwb3NpdG9yeSBpcyBjaGVja2VkIG91dC5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2VzcyBvciBmYWlsdXJlLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfdmVyaWZ5UnVubmluZ0Zyb21OZXh0QnJhbmNoKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGhlYWRTaGEgPSB0aGlzLl9naXQucnVuKFsncmV2LXBhcnNlJywgJ0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgICBjb25zdCB7ZGF0YX0gPVxuICAgICAgICBhd2FpdCB0aGlzLl9naXQuZ2l0aHViLnJlcG9zLmdldEJyYW5jaCh7Li4udGhpcy5fZ2l0LnJlbW90ZVBhcmFtcywgYnJhbmNoOiBuZXh0QnJhbmNoTmFtZX0pO1xuXG4gICAgaWYgKGhlYWRTaGEgIT09IGRhdGEuY29tbWl0LnNoYSkge1xuICAgICAgZXJyb3IocmVkKCcgIOKcmCAgIFJ1bm5pbmcgcmVsZWFzZSB0b29sIGZyb20gYW4gb3V0ZGF0ZWQgbG9jYWwgYnJhbmNoLicpKTtcbiAgICAgIGVycm9yKHJlZChgICAgICAgUGxlYXNlIG1ha2Ugc3VyZSB5b3UgYXJlIHJ1bm5pbmcgZnJvbSB0aGUgXCIke25leHRCcmFuY2hOYW1lfVwiIGJyYW5jaC5gKSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIHRoYXQgdGhlIHVzZXIgaXMgbG9nZ2VkIGludG8gTlBNIGF0IHRoZSBjb3JyZWN0IHJlZ2lzdHJ5LCBpZiBkZWZpbmVkIGZvciB0aGUgcmVsZWFzZS5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgdXNlciBpcyBsb2dnZWQgaW50byBOUE0uXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlOcG1Mb2dpblN0YXRlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHJlZ2lzdHJ5ID0gYE5QTSBhdCB0aGUgJHt0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5ID8/ICdkZWZhdWx0IE5QTSd9IHJlZ2lzdHJ5YDtcbiAgICBpZiAoYXdhaXQgbnBtSXNMb2dnZWRJbih0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5KSkge1xuICAgICAgZGVidWcoYEFscmVhZHkgbG9nZ2VkIGludG8gJHtyZWdpc3RyeX0uYCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgZXJyb3IocmVkKGAgIOKcmCAgIE5vdCBjdXJyZW50bHkgbG9nZ2VkIGludG8gJHtyZWdpc3RyeX0uYCkpO1xuICAgIGNvbnN0IHNob3VsZExvZ2luID0gYXdhaXQgcHJvbXB0Q29uZmlybSgnV291bGQgeW91IGxpa2UgdG8gbG9nIGludG8gTlBNIG5vdz8nKTtcbiAgICBpZiAoc2hvdWxkTG9naW4pIHtcbiAgICAgIGRlYnVnKCdTdGFydGluZyBOUE0gbG9naW4uJyk7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBucG1Mb2dpbih0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5KTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iXX0=