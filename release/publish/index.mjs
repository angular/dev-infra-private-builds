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
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const registry = `NPM at the ${(_a = this._config.publishRegistry) !== null && _a !== void 0 ? _a : 'default NPM'} registry`;
            // TODO(josephperrott): remove wombat specific block once wombot allows `npm whoami` check to
            // check the status of the local token in the .npmrc file.
            if ((_b = this._config.publishRegistry) === null || _b === void 0 ? void 0 : _b.includes('wombat-dressing-room.appspot.com')) {
                info('Unable to determine NPM login state for wombat proxy, requiring login now.');
                try {
                    yield npmLogin(this._config.publishRegistry);
                }
                catch (_c) {
                    return false;
                }
                return true;
            }
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
                catch (_d) {
                    return false;
                }
                return true;
            }
            return false;
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQW9CLE1BQU0sRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUVuRCxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUUvRCxPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDeEYsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sMENBQTBDLENBQUM7QUFFaEYsT0FBTyxFQUFzQix3QkFBd0IsRUFBRSxjQUFjLEVBQUMsTUFBTSxxQ0FBcUMsQ0FBQztBQUNsSCxPQUFPLEVBQUMsYUFBYSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUM3RSxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQUkzRSxPQUFPLEVBQUMsdUJBQXVCLEVBQUUsNkJBQTZCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN2RixPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFFeEMsTUFBTSxDQUFOLElBQVksZUFJWDtBQUpELFdBQVksZUFBZTtJQUN6QiwyREFBTyxDQUFBO0lBQ1AsbUVBQVcsQ0FBQTtJQUNYLDZFQUFnQixDQUFBO0FBQ2xCLENBQUMsRUFKVyxlQUFlLEtBQWYsZUFBZSxRQUkxQjtBQUVELE1BQU0sT0FBTyxXQUFXO0lBTXRCLFlBQ2MsT0FBc0IsRUFBWSxPQUFxQixFQUN2RCxZQUFvQjtRQURwQixZQUFPLEdBQVAsT0FBTyxDQUFlO1FBQVksWUFBTyxHQUFQLE9BQU8sQ0FBYztRQUN2RCxpQkFBWSxHQUFaLFlBQVksQ0FBUTtRQVBsQyw4REFBOEQ7UUFDdEQsU0FBSSxHQUFHLHNCQUFzQixDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVDLDZFQUE2RTtRQUNyRSxnQ0FBMkIsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7SUFJeEMsQ0FBQztJQUV0Qyx5Q0FBeUM7SUFDbkMsR0FBRzs7WUFDUCxHQUFHLEVBQUUsQ0FBQztZQUNOLEdBQUcsQ0FBQyxNQUFNLENBQUMsOENBQThDLENBQUMsQ0FBQyxDQUFDO1lBQzVELEdBQUcsQ0FBQyxNQUFNLENBQUMsNENBQTRDLENBQUMsQ0FBQyxDQUFDO1lBQzFELEdBQUcsQ0FBQyxNQUFNLENBQUMsOENBQThDLENBQUMsQ0FBQyxDQUFDO1lBQzVELEdBQUcsRUFBRSxDQUFDO1lBRU4sSUFBSSxDQUFDLENBQUEsTUFBTSxJQUFJLENBQUMsbUNBQW1DLEVBQUUsQ0FBQTtnQkFDakQsQ0FBQyxDQUFBLE1BQU0sSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUEsSUFBSSxDQUFDLENBQUEsTUFBTSxJQUFJLENBQUMsNEJBQTRCLEVBQUUsQ0FBQSxFQUFFO2dCQUMzRixPQUFPLGVBQWUsQ0FBQyxXQUFXLENBQUM7YUFDcEM7WUFFRCxJQUFJLENBQUMsQ0FBQSxNQUFNLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFBLEVBQUU7Z0JBQ3RDLE9BQU8sZUFBZSxDQUFDLGdCQUFnQixDQUFDO2FBQ3pDO1lBRUQsTUFBTSxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ25DLE1BQU0sSUFBSSxHQUFzQixFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFDLENBQUM7WUFDckUsTUFBTSxhQUFhLEdBQUcsTUFBTSx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUUzRCxtRUFBbUU7WUFDbkUsaUVBQWlFO1lBQ2pFLE1BQU0sd0JBQXdCLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUU1RCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUVqRSxJQUFJO2dCQUNGLE1BQU0sTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ3hCO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsSUFBSSxDQUFDLFlBQVksNkJBQTZCLEVBQUU7b0JBQzlDLE9BQU8sZUFBZSxDQUFDLGdCQUFnQixDQUFDO2lCQUN6QztnQkFDRCxtRkFBbUY7Z0JBQ25GLHFGQUFxRjtnQkFDckYsSUFBSSxDQUFDLENBQUMsQ0FBQyxZQUFZLHVCQUF1QixDQUFDLElBQUksQ0FBQyxZQUFZLEtBQUssRUFBRTtvQkFDakUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDbEI7Z0JBQ0QsT0FBTyxlQUFlLENBQUMsV0FBVyxDQUFDO2FBQ3BDO29CQUFTO2dCQUNSLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ3RCO1lBRUQsT0FBTyxlQUFlLENBQUMsT0FBTyxDQUFDO1FBQ2pDLENBQUM7S0FBQTtJQUVELHNDQUFzQztJQUN4QixPQUFPOztZQUNuQixpRUFBaUU7WUFDakUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLDJCQUEyQixFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzNELHlCQUF5QjtZQUN6QixNQUFNLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ2hELENBQUM7S0FBQTtJQUVELDJFQUEyRTtJQUM3RCx1QkFBdUIsQ0FBQyxZQUFpQzs7WUFDckUsTUFBTSxPQUFPLEdBQXdCLEVBQUUsQ0FBQztZQUV4QyxzRUFBc0U7WUFDdEUsS0FBSyxJQUFJLFVBQVUsSUFBSSxPQUFPLEVBQUU7Z0JBQzlCLElBQUksTUFBTSxVQUFVLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ3pELE1BQU0sTUFBTSxHQUNSLElBQUksVUFBVSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUM3RSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLE1BQU0sTUFBTSxDQUFDLGNBQWMsRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO2lCQUNwRTthQUNGO1lBRUQsSUFBSSxDQUFDLHdEQUF3RCxDQUFDLENBQUM7WUFFL0QsTUFBTSxFQUFDLGFBQWEsRUFBQyxHQUFHLE1BQU0sTUFBTSxDQUFpQztnQkFDbkUsSUFBSSxFQUFFLGVBQWU7Z0JBQ3JCLE9BQU8sRUFBRSwwQkFBMEI7Z0JBQ25DLElBQUksRUFBRSxNQUFNO2dCQUNaLE9BQU87YUFDUixDQUFDLENBQUM7WUFFSCxPQUFPLGFBQWEsQ0FBQztRQUN2QixDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDVywyQkFBMkI7O1lBQ3ZDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFFO2dCQUNyQyxLQUFLLENBQUMsR0FBRyxDQUFDLDBFQUEwRSxDQUFDLENBQUMsQ0FBQztnQkFDdkYsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztLQUFBO0lBRUQ7Ozs7T0FJRztJQUNXLG1DQUFtQzs7WUFDL0MsSUFBSTtnQkFDRiwyRkFBMkY7Z0JBQzNGLDJGQUEyRjtnQkFDM0YsTUFBTSxTQUFTLEdBQ1gsTUFBTSxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztnQkFDakYsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNuRSxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLEVBQUU7b0JBQ25DLEtBQUssQ0FBQyx5QkFBeUIsT0FBTyxFQUFFLENBQUMsQ0FBQztvQkFDMUMsT0FBTyxJQUFJLENBQUM7aUJBQ2I7Z0JBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyx3REFBd0QsT0FBTyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7Z0JBQzlGLEtBQUssQ0FBQyxHQUFHLENBQUMsOENBQThDLENBQUMsQ0FBQyxDQUFDO2dCQUMzRCxLQUFLLEVBQUUsQ0FBQztnQkFDUixLQUFLLENBQUMsR0FBRyxDQUFDLGdGQUFnRixDQUFDLENBQUMsQ0FBQztnQkFDN0YsS0FBSyxDQUFDLEdBQUcsQ0FBQyxxREFBcUQsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xFLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFBQyxXQUFNO2dCQUNOLEtBQUssQ0FBQyxHQUFHLENBQUMsNEVBQTRFLENBQUMsQ0FBQyxDQUFDO2dCQUN6RixLQUFLLENBQUMsR0FBRyxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQztnQkFDMUMsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxnRkFBZ0YsQ0FBQyxDQUFDLENBQUM7Z0JBQzdGLEtBQUssQ0FBQyxHQUFHLENBQUMscURBQXFELENBQUMsQ0FBQyxDQUFDO2FBQ25FO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDVyw0QkFBNEI7O1lBQ3hDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ25FLE1BQU0sRUFBQyxJQUFJLEVBQUMsR0FDUixNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLGlDQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxLQUFFLE1BQU0sRUFBRSxjQUFjLElBQUUsQ0FBQztZQUVoRyxJQUFJLE9BQU8sS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRTtnQkFDL0IsS0FBSyxDQUFDLEdBQUcsQ0FBQywyREFBMkQsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hFLEtBQUssQ0FBQyxHQUFHLENBQUMsb0RBQW9ELGNBQWMsV0FBVyxDQUFDLENBQUMsQ0FBQztnQkFDMUYsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztLQUFBO0lBRUQ7OztPQUdHO0lBQ1csb0JBQW9COzs7WUFDaEMsTUFBTSxRQUFRLEdBQUcsY0FBYyxNQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxtQ0FBSSxhQUFhLFdBQVcsQ0FBQztZQUN4Riw2RkFBNkY7WUFDN0YsMERBQTBEO1lBQzFELElBQUksTUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsMENBQUUsUUFBUSxDQUFDLGtDQUFrQyxDQUFDLEVBQUU7Z0JBQzlFLElBQUksQ0FBQyw0RUFBNEUsQ0FBQyxDQUFDO2dCQUNuRixJQUFJO29CQUNGLE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7aUJBQzlDO2dCQUFDLFdBQU07b0JBQ04sT0FBTyxLQUFLLENBQUM7aUJBQ2Q7Z0JBQ0QsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUNELElBQUksTUFBTSxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFBRTtnQkFDckQsS0FBSyxDQUFDLHVCQUF1QixRQUFRLEdBQUcsQ0FBQyxDQUFDO2dCQUMxQyxPQUFPLElBQUksQ0FBQzthQUNiO1lBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzNELE1BQU0sV0FBVyxHQUFHLE1BQU0sYUFBYSxDQUFDLHFDQUFxQyxDQUFDLENBQUM7WUFDL0UsSUFBSSxXQUFXLEVBQUU7Z0JBQ2YsS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7Z0JBQzdCLElBQUk7b0JBQ0YsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztpQkFDOUM7Z0JBQUMsV0FBTTtvQkFDTixPQUFPLEtBQUssQ0FBQztpQkFDZDtnQkFDRCxPQUFPLElBQUksQ0FBQzthQUNiO1lBQ0QsT0FBTyxLQUFLLENBQUM7O0tBQ2Q7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0xpc3RDaG9pY2VPcHRpb25zLCBwcm9tcHR9IGZyb20gJ2lucXVpcmVyJztcblxuaW1wb3J0IHtzcGF3bldpdGhEZWJ1Z091dHB1dH0gZnJvbSAnLi4vLi4vdXRpbHMvY2hpbGQtcHJvY2Vzcyc7XG5pbXBvcnQge0dpdGh1YkNvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZGVidWcsIGVycm9yLCBpbmZvLCBsb2csIHByb21wdENvbmZpcm0sIHJlZCwgeWVsbG93fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2F1dGhlbnRpY2F0ZWQtZ2l0LWNsaWVudCc7XG5pbXBvcnQge1JlbGVhc2VDb25maWd9IGZyb20gJy4uL2NvbmZpZy9pbmRleCc7XG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnMsIGZldGNoQWN0aXZlUmVsZWFzZVRyYWlucywgbmV4dEJyYW5jaE5hbWV9IGZyb20gJy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7bnBtSXNMb2dnZWRJbiwgbnBtTG9naW4sIG5wbUxvZ291dH0gZnJvbSAnLi4vdmVyc2lvbmluZy9ucG0tcHVibGlzaCc7XG5pbXBvcnQge3ByaW50QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vdmVyc2lvbmluZy9wcmludC1hY3RpdmUtdHJhaW5zJztcbmltcG9ydCB7R2l0aHViUmVwb1dpdGhBcGl9IGZyb20gJy4uL3ZlcnNpb25pbmcvdmVyc2lvbi1icmFuY2hlcyc7XG5cbmltcG9ydCB7UmVsZWFzZUFjdGlvbn0gZnJvbSAnLi9hY3Rpb25zJztcbmltcG9ydCB7RmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IsIFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yfSBmcm9tICcuL2FjdGlvbnMtZXJyb3InO1xuaW1wb3J0IHthY3Rpb25zfSBmcm9tICcuL2FjdGlvbnMvaW5kZXgnO1xuXG5leHBvcnQgZW51bSBDb21wbGV0aW9uU3RhdGUge1xuICBTVUNDRVNTLFxuICBGQVRBTF9FUlJPUixcbiAgTUFOVUFMTFlfQUJPUlRFRCxcbn1cblxuZXhwb3J0IGNsYXNzIFJlbGVhc2VUb29sIHtcbiAgLyoqIFRoZSBzaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIGF1dGhlbnRpY2F0ZWQgZ2l0IGNsaWVudC4gKi9cbiAgcHJpdmF0ZSBfZ2l0ID0gQXV0aGVudGljYXRlZEdpdENsaWVudC5nZXQoKTtcbiAgLyoqIFRoZSBwcmV2aW91cyBnaXQgY29tbWl0IHRvIHJldHVybiBiYWNrIHRvIGFmdGVyIHRoZSByZWxlYXNlIHRvb2wgcnVucy4gKi9cbiAgcHJpdmF0ZSBwcmV2aW91c0dpdEJyYW5jaE9yUmV2aXNpb24gPSB0aGlzLl9naXQuZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCBfY29uZmlnOiBSZWxlYXNlQ29uZmlnLCBwcm90ZWN0ZWQgX2dpdGh1YjogR2l0aHViQ29uZmlnLFxuICAgICAgcHJvdGVjdGVkIF9wcm9qZWN0Um9vdDogc3RyaW5nKSB7fVxuXG4gIC8qKiBSdW5zIHRoZSBpbnRlcmFjdGl2ZSByZWxlYXNlIHRvb2wuICovXG4gIGFzeW5jIHJ1bigpOiBQcm9taXNlPENvbXBsZXRpb25TdGF0ZT4ge1xuICAgIGxvZygpO1xuICAgIGxvZyh5ZWxsb3coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJykpO1xuICAgIGxvZyh5ZWxsb3coJyAgQW5ndWxhciBEZXYtSW5mcmEgcmVsZWFzZSBzdGFnaW5nIHNjcmlwdCcpKTtcbiAgICBsb2coeWVsbG93KCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpKTtcbiAgICBsb2coKTtcblxuICAgIGlmICghYXdhaXQgdGhpcy5fdmVyaWZ5RW52aXJvbm1lbnRIYXNQeXRob24zU3ltbGluaygpIHx8XG4gICAgICAgICFhd2FpdCB0aGlzLl92ZXJpZnlOb1VuY29tbWl0dGVkQ2hhbmdlcygpIHx8ICFhd2FpdCB0aGlzLl92ZXJpZnlSdW5uaW5nRnJvbU5leHRCcmFuY2goKSkge1xuICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5GQVRBTF9FUlJPUjtcbiAgICB9XG5cbiAgICBpZiAoIWF3YWl0IHRoaXMuX3ZlcmlmeU5wbUxvZ2luU3RhdGUoKSkge1xuICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5NQU5VQUxMWV9BQk9SVEVEO1xuICAgIH1cblxuICAgIGNvbnN0IHtvd25lciwgbmFtZX0gPSB0aGlzLl9naXRodWI7XG4gICAgY29uc3QgcmVwbzogR2l0aHViUmVwb1dpdGhBcGkgPSB7b3duZXIsIG5hbWUsIGFwaTogdGhpcy5fZ2l0LmdpdGh1Yn07XG4gICAgY29uc3QgcmVsZWFzZVRyYWlucyA9IGF3YWl0IGZldGNoQWN0aXZlUmVsZWFzZVRyYWlucyhyZXBvKTtcblxuICAgIC8vIFByaW50IHRoZSBhY3RpdmUgcmVsZWFzZSB0cmFpbnMgc28gdGhhdCB0aGUgY2FyZXRha2VyIGNhbiBhY2Nlc3NcbiAgICAvLyB0aGUgY3VycmVudCBwcm9qZWN0IGJyYW5jaGluZyBzdGF0ZSB3aXRob3V0IHN3aXRjaGluZyBjb250ZXh0LlxuICAgIGF3YWl0IHByaW50QWN0aXZlUmVsZWFzZVRyYWlucyhyZWxlYXNlVHJhaW5zLCB0aGlzLl9jb25maWcpO1xuXG4gICAgY29uc3QgYWN0aW9uID0gYXdhaXQgdGhpcy5fcHJvbXB0Rm9yUmVsZWFzZUFjdGlvbihyZWxlYXNlVHJhaW5zKTtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBhY3Rpb24ucGVyZm9ybSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlIGluc3RhbmNlb2YgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5NQU5VQUxMWV9BQk9SVEVEO1xuICAgICAgfVxuICAgICAgLy8gT25seSBwcmludCB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgc3RhY2sgaWYgdGhlIGVycm9yIGlzIG5vdCBhIGtub3duIGZhdGFsIHJlbGVhc2VcbiAgICAgIC8vIGFjdGlvbiBlcnJvciAoZm9yIHdoaWNoIHdlIHByaW50IHRoZSBlcnJvciBncmFjZWZ1bGx5IHRvIHRoZSBjb25zb2xlIHdpdGggY29sb3JzKS5cbiAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcikgJiYgZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLkZBVEFMX0VSUk9SO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBhd2FpdCB0aGlzLmNsZWFudXAoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLlNVQ0NFU1M7XG4gIH1cblxuICAvKiogUnVuIHBvc3QgcmVsZWFzZSB0b29sIGNsZWFudXBzLiAqL1xuICBwcml2YXRlIGFzeW5jIGNsZWFudXAoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gUmV0dXJuIGJhY2sgdG8gdGhlIGdpdCBzdGF0ZSBmcm9tIGJlZm9yZSB0aGUgcmVsZWFzZSB0b29sIHJhbi5cbiAgICB0aGlzLl9naXQuY2hlY2tvdXQodGhpcy5wcmV2aW91c0dpdEJyYW5jaE9yUmV2aXNpb24sIHRydWUpO1xuICAgIC8vIEVuc3VyZSBsb2cgb3V0IG9mIE5QTS5cbiAgICBhd2FpdCBucG1Mb2dvdXQodGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSk7XG4gIH1cblxuICAvKiogUHJvbXB0cyB0aGUgY2FyZXRha2VyIGZvciBhIHJlbGVhc2UgYWN0aW9uIHRoYXQgc2hvdWxkIGJlIHBlcmZvcm1lZC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfcHJvbXB0Rm9yUmVsZWFzZUFjdGlvbihhY3RpdmVUcmFpbnM6IEFjdGl2ZVJlbGVhc2VUcmFpbnMpIHtcbiAgICBjb25zdCBjaG9pY2VzOiBMaXN0Q2hvaWNlT3B0aW9uc1tdID0gW107XG5cbiAgICAvLyBGaW5kIGFuZCBpbnN0YW50aWF0ZSBhbGwgcmVsZWFzZSBhY3Rpb25zIHdoaWNoIGFyZSBjdXJyZW50bHkgdmFsaWQuXG4gICAgZm9yIChsZXQgYWN0aW9uVHlwZSBvZiBhY3Rpb25zKSB7XG4gICAgICBpZiAoYXdhaXQgYWN0aW9uVHlwZS5pc0FjdGl2ZShhY3RpdmVUcmFpbnMsIHRoaXMuX2NvbmZpZykpIHtcbiAgICAgICAgY29uc3QgYWN0aW9uOiBSZWxlYXNlQWN0aW9uID1cbiAgICAgICAgICAgIG5ldyBhY3Rpb25UeXBlKGFjdGl2ZVRyYWlucywgdGhpcy5fZ2l0LCB0aGlzLl9jb25maWcsIHRoaXMuX3Byb2plY3RSb290KTtcbiAgICAgICAgY2hvaWNlcy5wdXNoKHtuYW1lOiBhd2FpdCBhY3Rpb24uZ2V0RGVzY3JpcHRpb24oKSwgdmFsdWU6IGFjdGlvbn0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGluZm8oJ1BsZWFzZSBzZWxlY3QgdGhlIHR5cGUgb2YgcmVsZWFzZSB5b3Ugd2FudCB0byBwZXJmb3JtLicpO1xuXG4gICAgY29uc3Qge3JlbGVhc2VBY3Rpb259ID0gYXdhaXQgcHJvbXB0PHtyZWxlYXNlQWN0aW9uOiBSZWxlYXNlQWN0aW9ufT4oe1xuICAgICAgbmFtZTogJ3JlbGVhc2VBY3Rpb24nLFxuICAgICAgbWVzc2FnZTogJ1BsZWFzZSBzZWxlY3QgYW4gYWN0aW9uOicsXG4gICAgICB0eXBlOiAnbGlzdCcsXG4gICAgICBjaG9pY2VzLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlbGVhc2VBY3Rpb247XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgdGhhdCB0aGVyZSBhcmUgbm8gdW5jb21taXR0ZWQgY2hhbmdlcyBpbiB0aGUgcHJvamVjdC5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2VzcyBvciBmYWlsdXJlLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfdmVyaWZ5Tm9VbmNvbW1pdHRlZENoYW5nZXMoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKHRoaXMuX2dpdC5oYXNVbmNvbW1pdHRlZENoYW5nZXMoKSkge1xuICAgICAgZXJyb3IocmVkKCcgIOKcmCAgIFRoZXJlIGFyZSBjaGFuZ2VzIHdoaWNoIGFyZSBub3QgY29tbWl0dGVkIGFuZCBzaG91bGQgYmUgZGlzY2FyZGVkLicpKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgdGhhdCBQeXRob24gY2FuIGJlIHJlc29sdmVkIHdpdGhpbiBzY3JpcHRzIGFuZCBwb2ludHMgdG8gYSBjb21wYXRpYmxlIHZlcnNpb24uIFB5dGhvblxuICAgKiBpcyByZXF1aXJlZCBpbiBCYXplbCBhY3Rpb25zIGFzIHRoZXJlIGNhbiBiZSB0b29scyAoc3VjaCBhcyBgc2t5ZG9jYCkgdGhhdCByZWx5IG9uIGl0LlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyBzdWNjZXNzIG9yIGZhaWx1cmUuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlFbnZpcm9ubWVudEhhc1B5dGhvbjNTeW1saW5rKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRyeSB7XG4gICAgICAvLyBOb3RlOiBXZSBkbyBub3QgcmVseSBvbiBgL3Vzci9iaW4vZW52YCBidXQgcmF0aGVyIGFjY2VzcyB0aGUgYGVudmAgYmluYXJ5IGRpcmVjdGx5IGFzIGl0XG4gICAgICAvLyBzaG91bGQgYmUgcGFydCBvZiB0aGUgc2hlbGwncyBgJFBBVEhgLiBUaGlzIGlzIG5lY2Vzc2FyeSBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIFdpbmRvd3MuXG4gICAgICBjb25zdCBweVZlcnNpb24gPVxuICAgICAgICAgIGF3YWl0IHNwYXduV2l0aERlYnVnT3V0cHV0KCdlbnYnLCBbJ3B5dGhvbicsICctLXZlcnNpb24nXSwge21vZGU6ICdzaWxlbnQnfSk7XG4gICAgICBjb25zdCB2ZXJzaW9uID0gcHlWZXJzaW9uLnN0ZG91dC50cmltKCkgfHwgcHlWZXJzaW9uLnN0ZGVyci50cmltKCk7XG4gICAgICBpZiAodmVyc2lvbi5zdGFydHNXaXRoKCdQeXRob24gMy4nKSkge1xuICAgICAgICBkZWJ1ZyhgTG9jYWwgcHl0aG9uIHZlcnNpb246ICR7dmVyc2lvbn1gKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBlcnJvcihyZWQoYCAg4pyYICAgXFxgL3Vzci9iaW4vcHl0aG9uXFxgIGlzIGN1cnJlbnRseSBzeW1saW5rZWQgdG8gXCIke3ZlcnNpb259XCIsIHBsZWFzZSB1cGRhdGVgKSk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgIHRoZSBzeW1saW5rIHRvIGxpbmsgaW5zdGVhZCB0byBQeXRob24zJykpO1xuICAgICAgZXJyb3IoKTtcbiAgICAgIGVycm9yKHJlZCgnICAgICAgR29vZ2xlcnM6IHBsZWFzZSBydW4gdGhlIGZvbGxvd2luZyBjb21tYW5kIHRvIHN5bWxpbmsgcHl0aG9uIHRvIHB5dGhvbjM6JykpO1xuICAgICAgZXJyb3IocmVkKCcgICAgICAgIHN1ZG8gbG4gLXMgL3Vzci9iaW4vcHl0aG9uMyAvdXNyL2Jpbi9weXRob24nKSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBjYXRjaCB7XG4gICAgICBlcnJvcihyZWQoJyAg4pyYICAgYC91c3IvYmluL3B5dGhvbmAgZG9lcyBub3QgZXhpc3QsIHBsZWFzZSBlbnN1cmUgYC91c3IvYmluL3B5dGhvbmAgaXMnKSk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgIHN5bWxpbmtlZCB0byBQeXRob24zLicpKTtcbiAgICAgIGVycm9yKCk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgIEdvb2dsZXJzOiBwbGVhc2UgcnVuIHRoZSBmb2xsb3dpbmcgY29tbWFuZCB0byBzeW1saW5rIHB5dGhvbiB0byBweXRob24zOicpKTtcbiAgICAgIGVycm9yKHJlZCgnICAgICAgICBzdWRvIGxuIC1zIC91c3IvYmluL3B5dGhvbjMgL3Vzci9iaW4vcHl0aG9uJykpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgdGhhdCB0aGUgbmV4dCBicmFuY2ggZnJvbSB0aGUgY29uZmlndXJlZCByZXBvc2l0b3J5IGlzIGNoZWNrZWQgb3V0LlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyBzdWNjZXNzIG9yIGZhaWx1cmUuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlSdW5uaW5nRnJvbU5leHRCcmFuY2goKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgaGVhZFNoYSA9IHRoaXMuX2dpdC5ydW4oWydyZXYtcGFyc2UnLCAnSEVBRCddKS5zdGRvdXQudHJpbSgpO1xuICAgIGNvbnN0IHtkYXRhfSA9XG4gICAgICAgIGF3YWl0IHRoaXMuX2dpdC5naXRodWIucmVwb3MuZ2V0QnJhbmNoKHsuLi50aGlzLl9naXQucmVtb3RlUGFyYW1zLCBicmFuY2g6IG5leHRCcmFuY2hOYW1lfSk7XG5cbiAgICBpZiAoaGVhZFNoYSAhPT0gZGF0YS5jb21taXQuc2hhKSB7XG4gICAgICBlcnJvcihyZWQoJyAg4pyYICAgUnVubmluZyByZWxlYXNlIHRvb2wgZnJvbSBhbiBvdXRkYXRlZCBsb2NhbCBicmFuY2guJykpO1xuICAgICAgZXJyb3IocmVkKGAgICAgICBQbGVhc2UgbWFrZSBzdXJlIHlvdSBhcmUgcnVubmluZyBmcm9tIHRoZSBcIiR7bmV4dEJyYW5jaE5hbWV9XCIgYnJhbmNoLmApKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgdGhhdCB0aGUgdXNlciBpcyBsb2dnZWQgaW50byBOUE0gYXQgdGhlIGNvcnJlY3QgcmVnaXN0cnksIGlmIGRlZmluZWQgZm9yIHRoZSByZWxlYXNlLlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSB1c2VyIGlzIGxvZ2dlZCBpbnRvIE5QTS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeU5wbUxvZ2luU3RhdGUoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgcmVnaXN0cnkgPSBgTlBNIGF0IHRoZSAke3RoaXMuX2NvbmZpZy5wdWJsaXNoUmVnaXN0cnkgPz8gJ2RlZmF1bHQgTlBNJ30gcmVnaXN0cnlgO1xuICAgIC8vIFRPRE8oam9zZXBocGVycm90dCk6IHJlbW92ZSB3b21iYXQgc3BlY2lmaWMgYmxvY2sgb25jZSB3b21ib3QgYWxsb3dzIGBucG0gd2hvYW1pYCBjaGVjayB0b1xuICAgIC8vIGNoZWNrIHRoZSBzdGF0dXMgb2YgdGhlIGxvY2FsIHRva2VuIGluIHRoZSAubnBtcmMgZmlsZS5cbiAgICBpZiAodGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeT8uaW5jbHVkZXMoJ3dvbWJhdC1kcmVzc2luZy1yb29tLmFwcHNwb3QuY29tJykpIHtcbiAgICAgIGluZm8oJ1VuYWJsZSB0byBkZXRlcm1pbmUgTlBNIGxvZ2luIHN0YXRlIGZvciB3b21iYXQgcHJveHksIHJlcXVpcmluZyBsb2dpbiBub3cuJyk7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBucG1Mb2dpbih0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5KTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGF3YWl0IG5wbUlzTG9nZ2VkSW4odGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSkpIHtcbiAgICAgIGRlYnVnKGBBbHJlYWR5IGxvZ2dlZCBpbnRvICR7cmVnaXN0cnl9LmApO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGVycm9yKHJlZChgICDinJggICBOb3QgY3VycmVudGx5IGxvZ2dlZCBpbnRvICR7cmVnaXN0cnl9LmApKTtcbiAgICBjb25zdCBzaG91bGRMb2dpbiA9IGF3YWl0IHByb21wdENvbmZpcm0oJ1dvdWxkIHlvdSBsaWtlIHRvIGxvZyBpbnRvIE5QTSBub3c/Jyk7XG4gICAgaWYgKHNob3VsZExvZ2luKSB7XG4gICAgICBkZWJ1ZygnU3RhcnRpbmcgTlBNIGxvZ2luLicpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgbnBtTG9naW4odGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIl19