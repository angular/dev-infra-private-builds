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
                if (yield actionType.isActive(activeTrains)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQW9CLE1BQU0sRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUVuRCxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUUvRCxPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDeEYsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRWhELE9BQU8sRUFBc0Isd0JBQXdCLEVBQUUsY0FBYyxFQUFDLE1BQU0scUNBQXFDLENBQUM7QUFDbEgsT0FBTyxFQUFDLGFBQWEsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDN0UsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sbUNBQW1DLENBQUM7QUFJM0UsT0FBTyxFQUFDLHVCQUF1QixFQUFFLDZCQUE2QixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDdkYsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBRXhDLE1BQU0sQ0FBTixJQUFZLGVBSVg7QUFKRCxXQUFZLGVBQWU7SUFDekIsMkRBQU8sQ0FBQTtJQUNQLG1FQUFXLENBQUE7SUFDWCw2RUFBZ0IsQ0FBQTtBQUNsQixDQUFDLEVBSlcsZUFBZSxLQUFmLGVBQWUsUUFJMUI7QUFFRCxNQUFNLE9BQU8sV0FBVztJQU10QixZQUNjLE9BQXNCLEVBQVksT0FBcUIsRUFDdkQsWUFBb0I7UUFEcEIsWUFBTyxHQUFQLE9BQU8sQ0FBZTtRQUFZLFlBQU8sR0FBUCxPQUFPLENBQWM7UUFDdkQsaUJBQVks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QkFDRixNQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2lCQUM5QztnQkFBQyxXQUFNO29CQUNOLE9BQU8sS0FBSyxDQUFDO2lCQUNkO2dCQUNELE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFDRCxPQUFPLEtBQUssQ0FBQzs7S0FDZDtDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TGlzdENob2ljZU9wdGlvbnMsIHByb21wdH0gZnJvbSAnaW5xdWlyZXInO1xuXG5pbXBvcnQge3NwYXduV2l0aERlYnVnT3V0cHV0fSBmcm9tICcuLi8uLi91dGlscy9jaGlsZC1wcm9jZXNzJztcbmltcG9ydCB7R2l0aHViQ29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtkZWJ1ZywgZXJyb3IsIGluZm8sIGxvZywgcHJvbXB0Q29uZmlybSwgcmVkLCB5ZWxsb3d9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9pbmRleCc7XG5pbXBvcnQge1JlbGVhc2VDb25maWd9IGZyb20gJy4uL2NvbmZpZy9pbmRleCc7XG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnMsIGZldGNoQWN0aXZlUmVsZWFzZVRyYWlucywgbmV4dEJyYW5jaE5hbWV9IGZyb20gJy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7bnBtSXNMb2dnZWRJbiwgbnBtTG9naW4sIG5wbUxvZ291dH0gZnJvbSAnLi4vdmVyc2lvbmluZy9ucG0tcHVibGlzaCc7XG5pbXBvcnQge3ByaW50QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vdmVyc2lvbmluZy9wcmludC1hY3RpdmUtdHJhaW5zJztcbmltcG9ydCB7R2l0aHViUmVwb1dpdGhBcGl9IGZyb20gJy4uL3ZlcnNpb25pbmcvdmVyc2lvbi1icmFuY2hlcyc7XG5cbmltcG9ydCB7UmVsZWFzZUFjdGlvbn0gZnJvbSAnLi9hY3Rpb25zJztcbmltcG9ydCB7RmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IsIFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yfSBmcm9tICcuL2FjdGlvbnMtZXJyb3InO1xuaW1wb3J0IHthY3Rpb25zfSBmcm9tICcuL2FjdGlvbnMvaW5kZXgnO1xuXG5leHBvcnQgZW51bSBDb21wbGV0aW9uU3RhdGUge1xuICBTVUNDRVNTLFxuICBGQVRBTF9FUlJPUixcbiAgTUFOVUFMTFlfQUJPUlRFRCxcbn1cblxuZXhwb3J0IGNsYXNzIFJlbGVhc2VUb29sIHtcbiAgLyoqIFRoZSBzaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIEdpdENsaWVudC4gKi9cbiAgcHJpdmF0ZSBfZ2l0ID0gR2l0Q2xpZW50LmdldEF1dGhlbnRpY2F0ZWRJbnN0YW5jZSgpO1xuICAvKiogVGhlIHByZXZpb3VzIGdpdCBjb21taXQgdG8gcmV0dXJuIGJhY2sgdG8gYWZ0ZXIgdGhlIHJlbGVhc2UgdG9vbCBydW5zLiAqL1xuICBwcml2YXRlIHByZXZpb3VzR2l0QnJhbmNoT3JSZXZpc2lvbiA9IHRoaXMuX2dpdC5nZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJvdGVjdGVkIF9jb25maWc6IFJlbGVhc2VDb25maWcsIHByb3RlY3RlZCBfZ2l0aHViOiBHaXRodWJDb25maWcsXG4gICAgICBwcm90ZWN0ZWQgX3Byb2plY3RSb290OiBzdHJpbmcpIHt9XG5cbiAgLyoqIFJ1bnMgdGhlIGludGVyYWN0aXZlIHJlbGVhc2UgdG9vbC4gKi9cbiAgYXN5bmMgcnVuKCk6IFByb21pc2U8Q29tcGxldGlvblN0YXRlPiB7XG4gICAgbG9nKCk7XG4gICAgbG9nKHllbGxvdygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKSk7XG4gICAgbG9nKHllbGxvdygnICBBbmd1bGFyIERldi1JbmZyYSByZWxlYXNlIHN0YWdpbmcgc2NyaXB0JykpO1xuICAgIGxvZyh5ZWxsb3coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJykpO1xuICAgIGxvZygpO1xuXG4gICAgaWYgKCFhd2FpdCB0aGlzLl92ZXJpZnlFbnZpcm9ubWVudEhhc1B5dGhvbjNTeW1saW5rKCkgfHxcbiAgICAgICAgIWF3YWl0IHRoaXMuX3ZlcmlmeU5vVW5jb21taXR0ZWRDaGFuZ2VzKCkgfHwgIWF3YWl0IHRoaXMuX3ZlcmlmeVJ1bm5pbmdGcm9tTmV4dEJyYW5jaCgpKSB7XG4gICAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLkZBVEFMX0VSUk9SO1xuICAgIH1cblxuICAgIGlmICghYXdhaXQgdGhpcy5fdmVyaWZ5TnBtTG9naW5TdGF0ZSgpKSB7XG4gICAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLk1BTlVBTExZX0FCT1JURUQ7XG4gICAgfVxuXG4gICAgY29uc3Qge293bmVyLCBuYW1lfSA9IHRoaXMuX2dpdGh1YjtcbiAgICBjb25zdCByZXBvOiBHaXRodWJSZXBvV2l0aEFwaSA9IHtvd25lciwgbmFtZSwgYXBpOiB0aGlzLl9naXQuZ2l0aHVifTtcbiAgICBjb25zdCByZWxlYXNlVHJhaW5zID0gYXdhaXQgZmV0Y2hBY3RpdmVSZWxlYXNlVHJhaW5zKHJlcG8pO1xuXG4gICAgLy8gUHJpbnQgdGhlIGFjdGl2ZSByZWxlYXNlIHRyYWlucyBzbyB0aGF0IHRoZSBjYXJldGFrZXIgY2FuIGFjY2Vzc1xuICAgIC8vIHRoZSBjdXJyZW50IHByb2plY3QgYnJhbmNoaW5nIHN0YXRlIHdpdGhvdXQgc3dpdGNoaW5nIGNvbnRleHQuXG4gICAgYXdhaXQgcHJpbnRBY3RpdmVSZWxlYXNlVHJhaW5zKHJlbGVhc2VUcmFpbnMsIHRoaXMuX2NvbmZpZyk7XG5cbiAgICBjb25zdCBhY3Rpb24gPSBhd2FpdCB0aGlzLl9wcm9tcHRGb3JSZWxlYXNlQWN0aW9uKHJlbGVhc2VUcmFpbnMpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGFjdGlvbi5wZXJmb3JtKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcikge1xuICAgICAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLk1BTlVBTExZX0FCT1JURUQ7XG4gICAgICB9XG4gICAgICAvLyBPbmx5IHByaW50IHRoZSBlcnJvciBtZXNzYWdlIGFuZCBzdGFjayBpZiB0aGUgZXJyb3IgaXMgbm90IGEga25vd24gZmF0YWwgcmVsZWFzZVxuICAgICAgLy8gYWN0aW9uIGVycm9yIChmb3Igd2hpY2ggd2UgcHJpbnQgdGhlIGVycm9yIGdyYWNlZnVsbHkgdG8gdGhlIGNvbnNvbGUgd2l0aCBjb2xvcnMpLlxuICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKSAmJiBlIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBDb21wbGV0aW9uU3RhdGUuRkFUQUxfRVJST1I7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGF3YWl0IHRoaXMuY2xlYW51cCgpO1xuICAgIH1cblxuICAgIHJldHVybiBDb21wbGV0aW9uU3RhdGUuU1VDQ0VTUztcbiAgfVxuXG4gIC8qKiBSdW4gcG9zdCByZWxlYXNlIHRvb2wgY2xlYW51cHMuICovXG4gIHByaXZhdGUgYXN5bmMgY2xlYW51cCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBSZXR1cm4gYmFjayB0byB0aGUgZ2l0IHN0YXRlIGZyb20gYmVmb3JlIHRoZSByZWxlYXNlIHRvb2wgcmFuLlxuICAgIHRoaXMuX2dpdC5jaGVja291dCh0aGlzLnByZXZpb3VzR2l0QnJhbmNoT3JSZXZpc2lvbiwgdHJ1ZSk7XG4gICAgLy8gRW5zdXJlIGxvZyBvdXQgb2YgTlBNLlxuICAgIGF3YWl0IG5wbUxvZ291dCh0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5KTtcbiAgfVxuXG4gIC8qKiBQcm9tcHRzIHRoZSBjYXJldGFrZXIgZm9yIGEgcmVsZWFzZSBhY3Rpb24gdGhhdCBzaG91bGQgYmUgcGVyZm9ybWVkLiAqL1xuICBwcml2YXRlIGFzeW5jIF9wcm9tcHRGb3JSZWxlYXNlQWN0aW9uKGFjdGl2ZVRyYWluczogQWN0aXZlUmVsZWFzZVRyYWlucykge1xuICAgIGNvbnN0IGNob2ljZXM6IExpc3RDaG9pY2VPcHRpb25zW10gPSBbXTtcblxuICAgIC8vIEZpbmQgYW5kIGluc3RhbnRpYXRlIGFsbCByZWxlYXNlIGFjdGlvbnMgd2hpY2ggYXJlIGN1cnJlbnRseSB2YWxpZC5cbiAgICBmb3IgKGxldCBhY3Rpb25UeXBlIG9mIGFjdGlvbnMpIHtcbiAgICAgIGlmIChhd2FpdCBhY3Rpb25UeXBlLmlzQWN0aXZlKGFjdGl2ZVRyYWlucykpIHtcbiAgICAgICAgY29uc3QgYWN0aW9uOiBSZWxlYXNlQWN0aW9uID1cbiAgICAgICAgICAgIG5ldyBhY3Rpb25UeXBlKGFjdGl2ZVRyYWlucywgdGhpcy5fZ2l0LCB0aGlzLl9jb25maWcsIHRoaXMuX3Byb2plY3RSb290KTtcbiAgICAgICAgY2hvaWNlcy5wdXNoKHtuYW1lOiBhd2FpdCBhY3Rpb24uZ2V0RGVzY3JpcHRpb24oKSwgdmFsdWU6IGFjdGlvbn0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGluZm8oJ1BsZWFzZSBzZWxlY3QgdGhlIHR5cGUgb2YgcmVsZWFzZSB5b3Ugd2FudCB0byBwZXJmb3JtLicpO1xuXG4gICAgY29uc3Qge3JlbGVhc2VBY3Rpb259ID0gYXdhaXQgcHJvbXB0PHtyZWxlYXNlQWN0aW9uOiBSZWxlYXNlQWN0aW9ufT4oe1xuICAgICAgbmFtZTogJ3JlbGVhc2VBY3Rpb24nLFxuICAgICAgbWVzc2FnZTogJ1BsZWFzZSBzZWxlY3QgYW4gYWN0aW9uOicsXG4gICAgICB0eXBlOiAnbGlzdCcsXG4gICAgICBjaG9pY2VzLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlbGVhc2VBY3Rpb247XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgdGhhdCB0aGVyZSBhcmUgbm8gdW5jb21taXR0ZWQgY2hhbmdlcyBpbiB0aGUgcHJvamVjdC5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2VzcyBvciBmYWlsdXJlLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfdmVyaWZ5Tm9VbmNvbW1pdHRlZENoYW5nZXMoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKHRoaXMuX2dpdC5oYXNVbmNvbW1pdHRlZENoYW5nZXMoKSkge1xuICAgICAgZXJyb3IocmVkKCcgIOKcmCAgIFRoZXJlIGFyZSBjaGFuZ2VzIHdoaWNoIGFyZSBub3QgY29tbWl0dGVkIGFuZCBzaG91bGQgYmUgZGlzY2FyZGVkLicpKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgdGhhdCBQeXRob24gY2FuIGJlIHJlc29sdmVkIHdpdGhpbiBzY3JpcHRzIGFuZCBwb2ludHMgdG8gYSBjb21wYXRpYmxlIHZlcnNpb24uIFB5dGhvblxuICAgKiBpcyByZXF1aXJlZCBpbiBCYXplbCBhY3Rpb25zIGFzIHRoZXJlIGNhbiBiZSB0b29scyAoc3VjaCBhcyBgc2t5ZG9jYCkgdGhhdCByZWx5IG9uIGl0LlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyBzdWNjZXNzIG9yIGZhaWx1cmUuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlFbnZpcm9ubWVudEhhc1B5dGhvbjNTeW1saW5rKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRyeSB7XG4gICAgICAvLyBOb3RlOiBXZSBkbyBub3QgcmVseSBvbiBgL3Vzci9iaW4vZW52YCBidXQgcmF0aGVyIGFjY2VzcyB0aGUgYGVudmAgYmluYXJ5IGRpcmVjdGx5IGFzIGl0XG4gICAgICAvLyBzaG91bGQgYmUgcGFydCBvZiB0aGUgc2hlbGwncyBgJFBBVEhgLiBUaGlzIGlzIG5lY2Vzc2FyeSBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIFdpbmRvd3MuXG4gICAgICBjb25zdCBweVZlcnNpb24gPVxuICAgICAgICAgIGF3YWl0IHNwYXduV2l0aERlYnVnT3V0cHV0KCdlbnYnLCBbJ3B5dGhvbicsICctLXZlcnNpb24nXSwge21vZGU6ICdzaWxlbnQnfSk7XG4gICAgICBjb25zdCB2ZXJzaW9uID0gcHlWZXJzaW9uLnN0ZG91dC50cmltKCkgfHwgcHlWZXJzaW9uLnN0ZGVyci50cmltKCk7XG4gICAgICBpZiAodmVyc2lvbi5zdGFydHNXaXRoKCdQeXRob24gMy4nKSkge1xuICAgICAgICBkZWJ1ZyhgTG9jYWwgcHl0aG9uIHZlcnNpb246ICR7dmVyc2lvbn1gKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBlcnJvcihyZWQoYCAg4pyYICAgXFxgL3Vzci9iaW4vcHl0aG9uXFxgIGlzIGN1cnJlbnRseSBzeW1saW5rZWQgdG8gXCIke3ZlcnNpb259XCIsIHBsZWFzZSB1cGRhdGVgKSk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgIHRoZSBzeW1saW5rIHRvIGxpbmsgaW5zdGVhZCB0byBQeXRob24zJykpO1xuICAgICAgZXJyb3IoKTtcbiAgICAgIGVycm9yKHJlZCgnICAgICAgR29vZ2xlcnM6IHBsZWFzZSBydW4gdGhlIGZvbGxvd2luZyBjb21tYW5kIHRvIHN5bWxpbmsgcHl0aG9uIHRvIHB5dGhvbjM6JykpO1xuICAgICAgZXJyb3IocmVkKCcgICAgICAgIHN1ZG8gbG4gLXMgL3Vzci9iaW4vcHl0aG9uMyAvdXNyL2Jpbi9weXRob24nKSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBjYXRjaCB7XG4gICAgICBlcnJvcihyZWQoJyAg4pyYICAgYC91c3IvYmluL3B5dGhvbmAgZG9lcyBub3QgZXhpc3QsIHBsZWFzZSBlbnN1cmUgYC91c3IvYmluL3B5dGhvbmAgaXMnKSk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgIHN5bWxpbmtlZCB0byBQeXRob24zLicpKTtcbiAgICAgIGVycm9yKCk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgIEdvb2dsZXJzOiBwbGVhc2UgcnVuIHRoZSBmb2xsb3dpbmcgY29tbWFuZCB0byBzeW1saW5rIHB5dGhvbiB0byBweXRob24zOicpKTtcbiAgICAgIGVycm9yKHJlZCgnICAgICAgICBzdWRvIGxuIC1zIC91c3IvYmluL3B5dGhvbjMgL3Vzci9iaW4vcHl0aG9uJykpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgdGhhdCB0aGUgbmV4dCBicmFuY2ggZnJvbSB0aGUgY29uZmlndXJlZCByZXBvc2l0b3J5IGlzIGNoZWNrZWQgb3V0LlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyBzdWNjZXNzIG9yIGZhaWx1cmUuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlSdW5uaW5nRnJvbU5leHRCcmFuY2goKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgaGVhZFNoYSA9IHRoaXMuX2dpdC5ydW4oWydyZXYtcGFyc2UnLCAnSEVBRCddKS5zdGRvdXQudHJpbSgpO1xuICAgIGNvbnN0IHtkYXRhfSA9XG4gICAgICAgIGF3YWl0IHRoaXMuX2dpdC5naXRodWIucmVwb3MuZ2V0QnJhbmNoKHsuLi50aGlzLl9naXQucmVtb3RlUGFyYW1zLCBicmFuY2g6IG5leHRCcmFuY2hOYW1lfSk7XG5cbiAgICBpZiAoaGVhZFNoYSAhPT0gZGF0YS5jb21taXQuc2hhKSB7XG4gICAgICBlcnJvcihyZWQoJyAg4pyYICAgUnVubmluZyByZWxlYXNlIHRvb2wgZnJvbSBhbiBvdXRkYXRlZCBsb2NhbCBicmFuY2guJykpO1xuICAgICAgZXJyb3IocmVkKGAgICAgICBQbGVhc2UgbWFrZSBzdXJlIHlvdSBhcmUgcnVubmluZyBmcm9tIHRoZSBcIiR7bmV4dEJyYW5jaE5hbWV9XCIgYnJhbmNoLmApKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgdGhhdCB0aGUgdXNlciBpcyBsb2dnZWQgaW50byBOUE0gYXQgdGhlIGNvcnJlY3QgcmVnaXN0cnksIGlmIGRlZmluZWQgZm9yIHRoZSByZWxlYXNlLlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSB1c2VyIGlzIGxvZ2dlZCBpbnRvIE5QTS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeU5wbUxvZ2luU3RhdGUoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgcmVnaXN0cnkgPSBgTlBNIGF0IHRoZSAke3RoaXMuX2NvbmZpZy5wdWJsaXNoUmVnaXN0cnkgPz8gJ2RlZmF1bHQgTlBNJ30gcmVnaXN0cnlgO1xuICAgIC8vIFRPRE8oam9zZXBocGVycm90dCk6IHJlbW92ZSB3b21iYXQgc3BlY2lmaWMgYmxvY2sgb25jZSB3b21ib3QgYWxsb3dzIGBucG0gd2hvYW1pYCBjaGVjayB0b1xuICAgIC8vIGNoZWNrIHRoZSBzdGF0dXMgb2YgdGhlIGxvY2FsIHRva2VuIGluIHRoZSAubnBtcmMgZmlsZS5cbiAgICBpZiAodGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeT8uaW5jbHVkZXMoJ3dvbWJhdC1kcmVzc2luZy1yb29tLmFwcHNwb3QuY29tJykpIHtcbiAgICAgIGluZm8oJ1VuYWJsZSB0byBkZXRlcm1pbmUgTlBNIGxvZ2luIHN0YXRlIGZvciB3b21iYXQgcHJveHksIHJlcXVpcmluZyBsb2dpbiBub3cuJyk7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBucG1Mb2dpbih0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5KTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGF3YWl0IG5wbUlzTG9nZ2VkSW4odGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSkpIHtcbiAgICAgIGRlYnVnKGBBbHJlYWR5IGxvZ2dlZCBpbnRvICR7cmVnaXN0cnl9LmApO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGVycm9yKHJlZChgICDinJggICBOb3QgY3VycmVudGx5IGxvZ2dlZCBpbnRvICR7cmVnaXN0cnl9LmApKTtcbiAgICBjb25zdCBzaG91bGRMb2dpbiA9IGF3YWl0IHByb21wdENvbmZpcm0oJ1dvdWxkIHlvdSBsaWtlIHRvIGxvZyBpbnRvIE5QTSBub3c/Jyk7XG4gICAgaWYgKHNob3VsZExvZ2luKSB7XG4gICAgICBkZWJ1ZygnU3RhcnRpbmcgTlBNIGxvZ2luLicpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgbnBtTG9naW4odGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIl19