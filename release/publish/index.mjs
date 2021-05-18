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
import { GitClient } from '../../utils/git/index';
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
        /** The singleton instance of the GitClient. */
        this._git = GitClient.getAuthenticatedInstance();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQW9CLE1BQU0sRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUVuRCxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUUvRCxPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDeEYsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRWhELE9BQU8sRUFBc0Isd0JBQXdCLEVBQUUsY0FBYyxFQUFDLE1BQU0scUNBQXFDLENBQUM7QUFDbEgsT0FBTyxFQUFDLGFBQWEsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDN0UsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sbUNBQW1DLENBQUM7QUFJM0UsT0FBTyxFQUFDLHVCQUF1QixFQUFFLDZCQUE2QixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDdkYsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBRXhDLE1BQU0sQ0FBTixJQUFZLGVBSVg7QUFKRCxXQUFZLGVBQWU7SUFDekIsMkRBQU8sQ0FBQTtJQUNQLG1FQUFXLENBQUE7SUFDWCw2RUFBZ0IsQ0FBQTtBQUNsQixDQUFDLEVBSlcsZUFBZSxLQUFmLGVBQWUsUUFJMUI7QUFFRCxNQUFNLE9BQU8sV0FBVztJQU10QixZQUNjLE9BQXNCLEVBQVksT0FBcUIsRUFDdkQsWUFBb0I7UUFEcEIsWUFBTyxHQUFQLE9BQU8sQ0FBZTtRQUFZLFlBQU8sR0FBUCxPQUFPLENBQWM7UUFDdkQsaUJBQVksR0FBWixZQUFZLENBQVE7UUFQbEMsK0NBQStDO1FBQ3ZDLFNBQUksR0FBRyxTQUFTLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUNwRCw2RUFBNkU7UUFDckUsZ0NBQTJCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0lBSXhDLENBQUM7SUFFdEMseUNBQXlDO0lBQ25DLEdBQUc7O1lBQ1AsR0FBRyxFQUFFLENBQUM7WUFDTixHQUFHLENBQUMsTUFBTSxDQUFDLDhDQUE4QyxDQUFDLENBQUMsQ0FBQztZQUM1RCxHQUFHLENBQUMsTUFBTSxDQUFDLDRDQUE0QyxDQUFDLENBQUMsQ0FBQztZQUMxRCxHQUFHLENBQUMsTUFBTSxDQUFDLDhDQUE4QyxDQUFDLENBQUMsQ0FBQztZQUM1RCxHQUFHLEVBQUUsQ0FBQztZQUVOLElBQUksQ0FBQyxDQUFBLE1BQU0sSUFBSSxDQUFDLG1DQUFtQyxFQUFFLENBQUE7Z0JBQ2pELENBQUMsQ0FBQSxNQUFNLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFBLElBQUksQ0FBQyxDQUFBLE1BQU0sSUFBSSxDQUFDLDRCQUE0QixFQUFFLENBQUEsRUFBRTtnQkFDM0YsT0FBTyxlQUFlLENBQUMsV0FBVyxDQUFDO2FBQ3BDO1lBRUQsSUFBSSxDQUFDLENBQUEsTUFBTSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQSxFQUFFO2dCQUN0QyxPQUFPLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQzthQUN6QztZQUVELE1BQU0sRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUNuQyxNQUFNLElBQUksR0FBc0IsRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBQyxDQUFDO1lBQ3JFLE1BQU0sYUFBYSxHQUFHLE1BQU0sd0JBQXdCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFM0QsbUVBQW1FO1lBQ25FLGlFQUFpRTtZQUNqRSxNQUFNLHdCQUF3QixDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFNUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsdUJBQXVCLENBQUMsYUFBYSxDQUFDLENBQUM7WUFFakUsSUFBSTtnQkFDRixNQUFNLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUN4QjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLElBQUksQ0FBQyxZQUFZLDZCQUE2QixFQUFFO29CQUM5QyxPQUFPLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQztpQkFDekM7Z0JBQ0QsbUZBQW1GO2dCQUNuRixxRkFBcUY7Z0JBQ3JGLElBQUksQ0FBQyxDQUFDLENBQUMsWUFBWSx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxLQUFLLEVBQUU7b0JBQ2pFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2xCO2dCQUNELE9BQU8sZUFBZSxDQUFDLFdBQVcsQ0FBQzthQUNwQztvQkFBUztnQkFDUixNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUN0QjtZQUVELE9BQU8sZUFBZSxDQUFDLE9BQU8sQ0FBQztRQUNqQyxDQUFDO0tBQUE7SUFFRCxzQ0FBc0M7SUFDeEIsT0FBTzs7WUFDbkIsaUVBQWlFO1lBQ2pFLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQywyQkFBMkIsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMzRCx5QkFBeUI7WUFDekIsTUFBTSxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNoRCxDQUFDO0tBQUE7SUFFRCwyRUFBMkU7SUFDN0QsdUJBQXVCLENBQUMsWUFBaUM7O1lBQ3JFLE1BQU0sT0FBTyxHQUF3QixFQUFFLENBQUM7WUFFeEMsc0VBQXNFO1lBQ3RFLEtBQUssSUFBSSxVQUFVLElBQUksT0FBTyxFQUFFO2dCQUM5QixJQUFJLE1BQU0sVUFBVSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUN6RCxNQUFNLE1BQU0sR0FDUixJQUFJLFVBQVUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDN0UsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxNQUFNLE1BQU0sQ0FBQyxjQUFjLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztpQkFDcEU7YUFDRjtZQUVELElBQUksQ0FBQyx3REFBd0QsQ0FBQyxDQUFDO1lBRS9ELE1BQU0sRUFBQyxhQUFhLEVBQUMsR0FBRyxNQUFNLE1BQU0sQ0FBaUM7Z0JBQ25FLElBQUksRUFBRSxlQUFlO2dCQUNyQixPQUFPLEVBQUUsMEJBQTBCO2dCQUNuQyxJQUFJLEVBQUUsTUFBTTtnQkFDWixPQUFPO2FBQ1IsQ0FBQyxDQUFDO1lBRUgsT0FBTyxhQUFhLENBQUM7UUFDdkIsQ0FBQztLQUFBO0lBRUQ7OztPQUdHO0lBQ1csMkJBQTJCOztZQUN2QyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBRTtnQkFDckMsS0FBSyxDQUFDLEdBQUcsQ0FBQywwRUFBMEUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZGLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7S0FBQTtJQUVEOzs7O09BSUc7SUFDVyxtQ0FBbUM7O1lBQy9DLElBQUk7Z0JBQ0YsMkZBQTJGO2dCQUMzRiwyRkFBMkY7Z0JBQzNGLE1BQU0sU0FBUyxHQUNYLE1BQU0sb0JBQW9CLENBQUMsS0FBSyxFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7Z0JBQ2pGLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbkUsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFO29CQUNuQyxLQUFLLENBQUMseUJBQXlCLE9BQU8sRUFBRSxDQUFDLENBQUM7b0JBQzFDLE9BQU8sSUFBSSxDQUFDO2lCQUNiO2dCQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsd0RBQXdELE9BQU8sa0JBQWtCLENBQUMsQ0FBQyxDQUFDO2dCQUM5RixLQUFLLENBQUMsR0FBRyxDQUFDLDhDQUE4QyxDQUFDLENBQUMsQ0FBQztnQkFDM0QsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxnRkFBZ0YsQ0FBQyxDQUFDLENBQUM7Z0JBQzdGLEtBQUssQ0FBQyxHQUFHLENBQUMscURBQXFELENBQUMsQ0FBQyxDQUFDO2dCQUNsRSxPQUFPLEtBQUssQ0FBQzthQUNkO1lBQUMsV0FBTTtnQkFDTixLQUFLLENBQUMsR0FBRyxDQUFDLDRFQUE0RSxDQUFDLENBQUMsQ0FBQztnQkFDekYsS0FBSyxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLENBQUM7Z0JBQzFDLEtBQUssRUFBRSxDQUFDO2dCQUNSLEtBQUssQ0FBQyxHQUFHLENBQUMsZ0ZBQWdGLENBQUMsQ0FBQyxDQUFDO2dCQUM3RixLQUFLLENBQUMsR0FBRyxDQUFDLHFEQUFxRCxDQUFDLENBQUMsQ0FBQzthQUNuRTtZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztLQUFBO0lBRUQ7OztPQUdHO0lBQ1csNEJBQTRCOztZQUN4QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNuRSxNQUFNLEVBQUMsSUFBSSxFQUFDLEdBQ1IsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxpQ0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksS0FBRSxNQUFNLEVBQUUsY0FBYyxJQUFFLENBQUM7WUFFaEcsSUFBSSxPQUFPLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUU7Z0JBQy9CLEtBQUssQ0FBQyxHQUFHLENBQUMsMkRBQTJELENBQUMsQ0FBQyxDQUFDO2dCQUN4RSxLQUFLLENBQUMsR0FBRyxDQUFDLG9EQUFvRCxjQUFjLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQzFGLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7S0FBQTtJQUVEOzs7T0FHRztJQUNXLG9CQUFvQjs7O1lBQ2hDLE1BQU0sUUFBUSxHQUFHLGNBQWMsTUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsbUNBQUksYUFBYSxXQUFXLENBQUM7WUFDeEYsNkZBQTZGO1lBQzdGLDBEQUEwRDtZQUMxRCxJQUFJLE1BQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLDBDQUFFLFFBQVEsQ0FBQyxrQ0FBa0MsQ0FBQyxFQUFFO2dCQUM5RSxJQUFJLENBQUMsNEVBQTRFLENBQUMsQ0FBQztnQkFDbkYsSUFBSTtvQkFDRixNQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2lCQUM5QztnQkFBQyxXQUFNO29CQUNOLE9BQU8sS0FBSyxDQUFDO2lCQUNkO2dCQUNELE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFDRCxJQUFJLE1BQU0sYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUU7Z0JBQ3JELEtBQUssQ0FBQyx1QkFBdUIsUUFBUSxHQUFHLENBQUMsQ0FBQztnQkFDMUMsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsbUNBQW1DLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMzRCxNQUFNLFdBQVcsR0FBRyxNQUFNLGFBQWEsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1lBQy9FLElBQUksV0FBVyxFQUFFO2dCQUNmLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2dCQUM3QixJQUFJO29CQUNGLE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7aUJBQzlDO2dCQUFDLFdBQU07b0JBQ04sT0FBTyxLQUFLLENBQUM7aUJBQ2Q7Z0JBQ0QsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUNELE9BQU8sS0FBSyxDQUFDOztLQUNkO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtMaXN0Q2hvaWNlT3B0aW9ucywgcHJvbXB0fSBmcm9tICdpbnF1aXJlcic7XG5cbmltcG9ydCB7c3Bhd25XaXRoRGVidWdPdXRwdXR9IGZyb20gJy4uLy4uL3V0aWxzL2NoaWxkLXByb2Nlc3MnO1xuaW1wb3J0IHtHaXRodWJDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2RlYnVnLCBlcnJvciwgaW5mbywgbG9nLCBwcm9tcHRDb25maXJtLCByZWQsIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2luZGV4JztcbmltcG9ydCB7UmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcbmltcG9ydCB7QWN0aXZlUmVsZWFzZVRyYWlucywgZmV0Y2hBY3RpdmVSZWxlYXNlVHJhaW5zLCBuZXh0QnJhbmNoTmFtZX0gZnJvbSAnLi4vdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtucG1Jc0xvZ2dlZEluLCBucG1Mb2dpbiwgbnBtTG9nb3V0fSBmcm9tICcuLi92ZXJzaW9uaW5nL25wbS1wdWJsaXNoJztcbmltcG9ydCB7cHJpbnRBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi92ZXJzaW9uaW5nL3ByaW50LWFjdGl2ZS10cmFpbnMnO1xuaW1wb3J0IHtHaXRodWJSZXBvV2l0aEFwaX0gZnJvbSAnLi4vdmVyc2lvbmluZy92ZXJzaW9uLWJyYW5jaGVzJztcblxuaW1wb3J0IHtSZWxlYXNlQWN0aW9ufSBmcm9tICcuL2FjdGlvbnMnO1xuaW1wb3J0IHtGYXRhbFJlbGVhc2VBY3Rpb25FcnJvciwgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3J9IGZyb20gJy4vYWN0aW9ucy1lcnJvcic7XG5pbXBvcnQge2FjdGlvbnN9IGZyb20gJy4vYWN0aW9ucy9pbmRleCc7XG5cbmV4cG9ydCBlbnVtIENvbXBsZXRpb25TdGF0ZSB7XG4gIFNVQ0NFU1MsXG4gIEZBVEFMX0VSUk9SLFxuICBNQU5VQUxMWV9BQk9SVEVELFxufVxuXG5leHBvcnQgY2xhc3MgUmVsZWFzZVRvb2wge1xuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgR2l0Q2xpZW50LiAqL1xuICBwcml2YXRlIF9naXQgPSBHaXRDbGllbnQuZ2V0QXV0aGVudGljYXRlZEluc3RhbmNlKCk7XG4gIC8qKiBUaGUgcHJldmlvdXMgZ2l0IGNvbW1pdCB0byByZXR1cm4gYmFjayB0byBhZnRlciB0aGUgcmVsZWFzZSB0b29sIHJ1bnMuICovXG4gIHByaXZhdGUgcHJldmlvdXNHaXRCcmFuY2hPclJldmlzaW9uID0gdGhpcy5fZ2l0LmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcm90ZWN0ZWQgX2NvbmZpZzogUmVsZWFzZUNvbmZpZywgcHJvdGVjdGVkIF9naXRodWI6IEdpdGh1YkNvbmZpZyxcbiAgICAgIHByb3RlY3RlZCBfcHJvamVjdFJvb3Q6IHN0cmluZykge31cblxuICAvKiogUnVucyB0aGUgaW50ZXJhY3RpdmUgcmVsZWFzZSB0b29sLiAqL1xuICBhc3luYyBydW4oKTogUHJvbWlzZTxDb21wbGV0aW9uU3RhdGU+IHtcbiAgICBsb2coKTtcbiAgICBsb2coeWVsbG93KCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpKTtcbiAgICBsb2coeWVsbG93KCcgIEFuZ3VsYXIgRGV2LUluZnJhIHJlbGVhc2Ugc3RhZ2luZyBzY3JpcHQnKSk7XG4gICAgbG9nKHllbGxvdygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKSk7XG4gICAgbG9nKCk7XG5cbiAgICBpZiAoIWF3YWl0IHRoaXMuX3ZlcmlmeUVudmlyb25tZW50SGFzUHl0aG9uM1N5bWxpbmsoKSB8fFxuICAgICAgICAhYXdhaXQgdGhpcy5fdmVyaWZ5Tm9VbmNvbW1pdHRlZENoYW5nZXMoKSB8fCAhYXdhaXQgdGhpcy5fdmVyaWZ5UnVubmluZ0Zyb21OZXh0QnJhbmNoKCkpIHtcbiAgICAgIHJldHVybiBDb21wbGV0aW9uU3RhdGUuRkFUQUxfRVJST1I7XG4gICAgfVxuXG4gICAgaWYgKCFhd2FpdCB0aGlzLl92ZXJpZnlOcG1Mb2dpblN0YXRlKCkpIHtcbiAgICAgIHJldHVybiBDb21wbGV0aW9uU3RhdGUuTUFOVUFMTFlfQUJPUlRFRDtcbiAgICB9XG5cbiAgICBjb25zdCB7b3duZXIsIG5hbWV9ID0gdGhpcy5fZ2l0aHViO1xuICAgIGNvbnN0IHJlcG86IEdpdGh1YlJlcG9XaXRoQXBpID0ge293bmVyLCBuYW1lLCBhcGk6IHRoaXMuX2dpdC5naXRodWJ9O1xuICAgIGNvbnN0IHJlbGVhc2VUcmFpbnMgPSBhd2FpdCBmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnMocmVwbyk7XG5cbiAgICAvLyBQcmludCB0aGUgYWN0aXZlIHJlbGVhc2UgdHJhaW5zIHNvIHRoYXQgdGhlIGNhcmV0YWtlciBjYW4gYWNjZXNzXG4gICAgLy8gdGhlIGN1cnJlbnQgcHJvamVjdCBicmFuY2hpbmcgc3RhdGUgd2l0aG91dCBzd2l0Y2hpbmcgY29udGV4dC5cbiAgICBhd2FpdCBwcmludEFjdGl2ZVJlbGVhc2VUcmFpbnMocmVsZWFzZVRyYWlucywgdGhpcy5fY29uZmlnKTtcblxuICAgIGNvbnN0IGFjdGlvbiA9IGF3YWl0IHRoaXMuX3Byb21wdEZvclJlbGVhc2VBY3Rpb24ocmVsZWFzZVRyYWlucyk7XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgYWN0aW9uLnBlcmZvcm0oKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yKSB7XG4gICAgICAgIHJldHVybiBDb21wbGV0aW9uU3RhdGUuTUFOVUFMTFlfQUJPUlRFRDtcbiAgICAgIH1cbiAgICAgIC8vIE9ubHkgcHJpbnQgdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHN0YWNrIGlmIHRoZSBlcnJvciBpcyBub3QgYSBrbm93biBmYXRhbCByZWxlYXNlXG4gICAgICAvLyBhY3Rpb24gZXJyb3IgKGZvciB3aGljaCB3ZSBwcmludCB0aGUgZXJyb3IgZ3JhY2VmdWxseSB0byB0aGUgY29uc29sZSB3aXRoIGNvbG9ycykuXG4gICAgICBpZiAoIShlIGluc3RhbmNlb2YgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IpICYmIGUgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5GQVRBTF9FUlJPUjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgYXdhaXQgdGhpcy5jbGVhbnVwKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5TVUNDRVNTO1xuICB9XG5cbiAgLyoqIFJ1biBwb3N0IHJlbGVhc2UgdG9vbCBjbGVhbnVwcy4gKi9cbiAgcHJpdmF0ZSBhc3luYyBjbGVhbnVwKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFJldHVybiBiYWNrIHRvIHRoZSBnaXQgc3RhdGUgZnJvbSBiZWZvcmUgdGhlIHJlbGVhc2UgdG9vbCByYW4uXG4gICAgdGhpcy5fZ2l0LmNoZWNrb3V0KHRoaXMucHJldmlvdXNHaXRCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcbiAgICAvLyBFbnN1cmUgbG9nIG91dCBvZiBOUE0uXG4gICAgYXdhaXQgbnBtTG9nb3V0KHRoaXMuX2NvbmZpZy5wdWJsaXNoUmVnaXN0cnkpO1xuICB9XG5cbiAgLyoqIFByb21wdHMgdGhlIGNhcmV0YWtlciBmb3IgYSByZWxlYXNlIGFjdGlvbiB0aGF0IHNob3VsZCBiZSBwZXJmb3JtZWQuICovXG4gIHByaXZhdGUgYXN5bmMgX3Byb21wdEZvclJlbGVhc2VBY3Rpb24oYWN0aXZlVHJhaW5zOiBBY3RpdmVSZWxlYXNlVHJhaW5zKSB7XG4gICAgY29uc3QgY2hvaWNlczogTGlzdENob2ljZU9wdGlvbnNbXSA9IFtdO1xuXG4gICAgLy8gRmluZCBhbmQgaW5zdGFudGlhdGUgYWxsIHJlbGVhc2UgYWN0aW9ucyB3aGljaCBhcmUgY3VycmVudGx5IHZhbGlkLlxuICAgIGZvciAobGV0IGFjdGlvblR5cGUgb2YgYWN0aW9ucykge1xuICAgICAgaWYgKGF3YWl0IGFjdGlvblR5cGUuaXNBY3RpdmUoYWN0aXZlVHJhaW5zLCB0aGlzLl9jb25maWcpKSB7XG4gICAgICAgIGNvbnN0IGFjdGlvbjogUmVsZWFzZUFjdGlvbiA9XG4gICAgICAgICAgICBuZXcgYWN0aW9uVHlwZShhY3RpdmVUcmFpbnMsIHRoaXMuX2dpdCwgdGhpcy5fY29uZmlnLCB0aGlzLl9wcm9qZWN0Um9vdCk7XG4gICAgICAgIGNob2ljZXMucHVzaCh7bmFtZTogYXdhaXQgYWN0aW9uLmdldERlc2NyaXB0aW9uKCksIHZhbHVlOiBhY3Rpb259KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpbmZvKCdQbGVhc2Ugc2VsZWN0IHRoZSB0eXBlIG9mIHJlbGVhc2UgeW91IHdhbnQgdG8gcGVyZm9ybS4nKTtcblxuICAgIGNvbnN0IHtyZWxlYXNlQWN0aW9ufSA9IGF3YWl0IHByb21wdDx7cmVsZWFzZUFjdGlvbjogUmVsZWFzZUFjdGlvbn0+KHtcbiAgICAgIG5hbWU6ICdyZWxlYXNlQWN0aW9uJyxcbiAgICAgIG1lc3NhZ2U6ICdQbGVhc2Ugc2VsZWN0IGFuIGFjdGlvbjonLFxuICAgICAgdHlwZTogJ2xpc3QnLFxuICAgICAgY2hvaWNlcyxcbiAgICB9KTtcblxuICAgIHJldHVybiByZWxlYXNlQWN0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIHRoYXQgdGhlcmUgYXJlIG5vIHVuY29tbWl0dGVkIGNoYW5nZXMgaW4gdGhlIHByb2plY3QuXG4gICAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHN1Y2Nlc3Mgb3IgZmFpbHVyZS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeU5vVW5jb21taXR0ZWRDaGFuZ2VzKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmICh0aGlzLl9naXQuaGFzVW5jb21taXR0ZWRDaGFuZ2VzKCkpIHtcbiAgICAgIGVycm9yKHJlZCgnICDinJggICBUaGVyZSBhcmUgY2hhbmdlcyB3aGljaCBhcmUgbm90IGNvbW1pdHRlZCBhbmQgc2hvdWxkIGJlIGRpc2NhcmRlZC4nKSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIHRoYXQgUHl0aG9uIGNhbiBiZSByZXNvbHZlZCB3aXRoaW4gc2NyaXB0cyBhbmQgcG9pbnRzIHRvIGEgY29tcGF0aWJsZSB2ZXJzaW9uLiBQeXRob25cbiAgICogaXMgcmVxdWlyZWQgaW4gQmF6ZWwgYWN0aW9ucyBhcyB0aGVyZSBjYW4gYmUgdG9vbHMgKHN1Y2ggYXMgYHNreWRvY2ApIHRoYXQgcmVseSBvbiBpdC5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2VzcyBvciBmYWlsdXJlLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfdmVyaWZ5RW52aXJvbm1lbnRIYXNQeXRob24zU3ltbGluaygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0cnkge1xuICAgICAgLy8gTm90ZTogV2UgZG8gbm90IHJlbHkgb24gYC91c3IvYmluL2VudmAgYnV0IHJhdGhlciBhY2Nlc3MgdGhlIGBlbnZgIGJpbmFyeSBkaXJlY3RseSBhcyBpdFxuICAgICAgLy8gc2hvdWxkIGJlIHBhcnQgb2YgdGhlIHNoZWxsJ3MgYCRQQVRIYC4gVGhpcyBpcyBuZWNlc3NhcnkgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBXaW5kb3dzLlxuICAgICAgY29uc3QgcHlWZXJzaW9uID1cbiAgICAgICAgICBhd2FpdCBzcGF3bldpdGhEZWJ1Z091dHB1dCgnZW52JywgWydweXRob24nLCAnLS12ZXJzaW9uJ10sIHttb2RlOiAnc2lsZW50J30pO1xuICAgICAgY29uc3QgdmVyc2lvbiA9IHB5VmVyc2lvbi5zdGRvdXQudHJpbSgpIHx8IHB5VmVyc2lvbi5zdGRlcnIudHJpbSgpO1xuICAgICAgaWYgKHZlcnNpb24uc3RhcnRzV2l0aCgnUHl0aG9uIDMuJykpIHtcbiAgICAgICAgZGVidWcoYExvY2FsIHB5dGhvbiB2ZXJzaW9uOiAke3ZlcnNpb259YCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgZXJyb3IocmVkKGAgIOKcmCAgIFxcYC91c3IvYmluL3B5dGhvblxcYCBpcyBjdXJyZW50bHkgc3ltbGlua2VkIHRvIFwiJHt2ZXJzaW9ufVwiLCBwbGVhc2UgdXBkYXRlYCkpO1xuICAgICAgZXJyb3IocmVkKCcgICAgICB0aGUgc3ltbGluayB0byBsaW5rIGluc3RlYWQgdG8gUHl0aG9uMycpKTtcbiAgICAgIGVycm9yKCk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgIEdvb2dsZXJzOiBwbGVhc2UgcnVuIHRoZSBmb2xsb3dpbmcgY29tbWFuZCB0byBzeW1saW5rIHB5dGhvbiB0byBweXRob24zOicpKTtcbiAgICAgIGVycm9yKHJlZCgnICAgICAgICBzdWRvIGxuIC1zIC91c3IvYmluL3B5dGhvbjMgL3Vzci9iaW4vcHl0aG9uJykpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gY2F0Y2gge1xuICAgICAgZXJyb3IocmVkKCcgIOKcmCAgIGAvdXNyL2Jpbi9weXRob25gIGRvZXMgbm90IGV4aXN0LCBwbGVhc2UgZW5zdXJlIGAvdXNyL2Jpbi9weXRob25gIGlzJykpO1xuICAgICAgZXJyb3IocmVkKCcgICAgICBzeW1saW5rZWQgdG8gUHl0aG9uMy4nKSk7XG4gICAgICBlcnJvcigpO1xuICAgICAgZXJyb3IocmVkKCcgICAgICBHb29nbGVyczogcGxlYXNlIHJ1biB0aGUgZm9sbG93aW5nIGNvbW1hbmQgdG8gc3ltbGluayBweXRob24gdG8gcHl0aG9uMzonKSk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgICAgc3VkbyBsbiAtcyAvdXNyL2Jpbi9weXRob24zIC91c3IvYmluL3B5dGhvbicpKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIHRoYXQgdGhlIG5leHQgYnJhbmNoIGZyb20gdGhlIGNvbmZpZ3VyZWQgcmVwb3NpdG9yeSBpcyBjaGVja2VkIG91dC5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2VzcyBvciBmYWlsdXJlLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfdmVyaWZ5UnVubmluZ0Zyb21OZXh0QnJhbmNoKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGhlYWRTaGEgPSB0aGlzLl9naXQucnVuKFsncmV2LXBhcnNlJywgJ0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgICBjb25zdCB7ZGF0YX0gPVxuICAgICAgICBhd2FpdCB0aGlzLl9naXQuZ2l0aHViLnJlcG9zLmdldEJyYW5jaCh7Li4udGhpcy5fZ2l0LnJlbW90ZVBhcmFtcywgYnJhbmNoOiBuZXh0QnJhbmNoTmFtZX0pO1xuXG4gICAgaWYgKGhlYWRTaGEgIT09IGRhdGEuY29tbWl0LnNoYSkge1xuICAgICAgZXJyb3IocmVkKCcgIOKcmCAgIFJ1bm5pbmcgcmVsZWFzZSB0b29sIGZyb20gYW4gb3V0ZGF0ZWQgbG9jYWwgYnJhbmNoLicpKTtcbiAgICAgIGVycm9yKHJlZChgICAgICAgUGxlYXNlIG1ha2Ugc3VyZSB5b3UgYXJlIHJ1bm5pbmcgZnJvbSB0aGUgXCIke25leHRCcmFuY2hOYW1lfVwiIGJyYW5jaC5gKSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIHRoYXQgdGhlIHVzZXIgaXMgbG9nZ2VkIGludG8gTlBNIGF0IHRoZSBjb3JyZWN0IHJlZ2lzdHJ5LCBpZiBkZWZpbmVkIGZvciB0aGUgcmVsZWFzZS5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgdXNlciBpcyBsb2dnZWQgaW50byBOUE0uXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlOcG1Mb2dpblN0YXRlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHJlZ2lzdHJ5ID0gYE5QTSBhdCB0aGUgJHt0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5ID8/ICdkZWZhdWx0IE5QTSd9IHJlZ2lzdHJ5YDtcbiAgICAvLyBUT0RPKGpvc2VwaHBlcnJvdHQpOiByZW1vdmUgd29tYmF0IHNwZWNpZmljIGJsb2NrIG9uY2Ugd29tYm90IGFsbG93cyBgbnBtIHdob2FtaWAgY2hlY2sgdG9cbiAgICAvLyBjaGVjayB0aGUgc3RhdHVzIG9mIHRoZSBsb2NhbCB0b2tlbiBpbiB0aGUgLm5wbXJjIGZpbGUuXG4gICAgaWYgKHRoaXMuX2NvbmZpZy5wdWJsaXNoUmVnaXN0cnk/LmluY2x1ZGVzKCd3b21iYXQtZHJlc3Npbmctcm9vbS5hcHBzcG90LmNvbScpKSB7XG4gICAgICBpbmZvKCdVbmFibGUgdG8gZGV0ZXJtaW5lIE5QTSBsb2dpbiBzdGF0ZSBmb3Igd29tYmF0IHByb3h5LCByZXF1aXJpbmcgbG9naW4gbm93LicpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgbnBtTG9naW4odGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmIChhd2FpdCBucG1Jc0xvZ2dlZEluKHRoaXMuX2NvbmZpZy5wdWJsaXNoUmVnaXN0cnkpKSB7XG4gICAgICBkZWJ1ZyhgQWxyZWFkeSBsb2dnZWQgaW50byAke3JlZ2lzdHJ5fS5gKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBlcnJvcihyZWQoYCAg4pyYICAgTm90IGN1cnJlbnRseSBsb2dnZWQgaW50byAke3JlZ2lzdHJ5fS5gKSk7XG4gICAgY29uc3Qgc2hvdWxkTG9naW4gPSBhd2FpdCBwcm9tcHRDb25maXJtKCdXb3VsZCB5b3UgbGlrZSB0byBsb2cgaW50byBOUE0gbm93PycpO1xuICAgIGlmIChzaG91bGRMb2dpbikge1xuICAgICAgZGVidWcoJ1N0YXJ0aW5nIE5QTSBsb2dpbi4nKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IG5wbUxvZ2luKHRoaXMuX2NvbmZpZy5wdWJsaXNoUmVnaXN0cnkpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cbiJdfQ==