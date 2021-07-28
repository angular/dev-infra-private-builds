/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __assign, __extends, __read, __spreadArray } from "tslib";
import { spawnSync } from 'child_process';
import { parse, SemVer } from 'semver';
import { getConfig } from '../config';
import { debug, info } from '../console';
import { DryRunError, isDryRun } from '../dry-run';
import { GithubClient } from './github';
import { getRepositoryGitUrl } from './github-urls';
/** Error for failed Git commands. */
var GitCommandError = /** @class */ (function (_super) {
    __extends(GitCommandError, _super);
    function GitCommandError(client, args) {
        var _this = 
        // Errors are not guaranteed to be caught. To ensure that we don't
        // accidentally leak the Github token that might be used in a command,
        // we sanitize the command that will be part of the error message.
        _super.call(this, "Command failed: git " + client.sanitizeConsoleOutput(args.join(' '))) || this;
        _this.args = args;
        // Set the prototype explicitly because in ES5, the prototype is accidentally lost due to
        // a limitation in down-leveling.
        // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
        Object.setPrototypeOf(_this, GitCommandError.prototype);
        return _this;
    }
    return GitCommandError;
}(Error));
export { GitCommandError };
/** Class that can be used to perform Git interactions with a given remote. **/
var GitClient = /** @class */ (function () {
    function GitClient(
    /** The full path to the root of the repository base. */
    baseDir, 
    /** The configuration, containing the github specific configuration. */
    config) {
        if (baseDir === void 0) { baseDir = determineRepoBaseDirFromCwd(); }
        if (config === void 0) { config = getConfig(baseDir); }
        this.baseDir = baseDir;
        this.config = config;
        /** Short-hand for accessing the default remote configuration. */
        this.remoteConfig = this.config.github;
        /** Octokit request parameters object for targeting the configured remote. */
        this.remoteParams = { owner: this.remoteConfig.owner, repo: this.remoteConfig.name };
        /** Instance of the Github client. */
        this.github = new GithubClient();
    }
    /** Executes the given git command. Throws if the command fails. */
    GitClient.prototype.run = function (args, options) {
        var result = this.runGraceful(args, options);
        if (result.status !== 0) {
            throw new GitCommandError(this, args);
        }
        // Omit `status` from the type so that it's obvious that the status is never
        // non-zero as explained in the method description.
        return result;
    };
    /**
     * Spawns a given Git command process. Does not throw if the command fails. Additionally,
     * if there is any stderr output, the output will be printed. This makes it easier to
     * info failed commands.
     */
    GitClient.prototype.runGraceful = function (args, options) {
        if (options === void 0) { options = {}; }
        /** The git command to be run. */
        var gitCommand = args[0];
        if (isDryRun() && gitCommand === 'push') {
            debug("\"git push\" is not able to be run in dryRun mode.");
            throw new DryRunError();
        }
        // To improve the debugging experience in case something fails, we print all executed Git
        // commands at the DEBUG level to better understand the git actions occurring. Verbose logging,
        // always logging at the INFO level, can be enabled either by setting the verboseLogging
        // property on the GitClient class or the options object provided to the method.
        var printFn = (GitClient.verboseLogging || options.verboseLogging) ? info : debug;
        // Note that we sanitize the command before printing it to the console. We do not want to
        // print an access token if it is contained in the command. It's common to share errors with
        // others if the tool failed, and we do not want to leak tokens.
        printFn('Executing: git', this.sanitizeConsoleOutput(args.join(' ')));
        var result = spawnSync('git', args, __assign(__assign({ cwd: this.baseDir, stdio: 'pipe' }, options), { 
            // Encoding is always `utf8` and not overridable. This ensures that this method
            // always returns `string` as output instead of buffers.
            encoding: 'utf8' }));
        if (result.stderr !== null) {
            // Git sometimes prints the command if it failed. This means that it could
            // potentially leak the Github token used for accessing the remote. To avoid
            // printing a token, we sanitize the string before printing the stderr output.
            process.stderr.write(this.sanitizeConsoleOutput(result.stderr));
        }
        return result;
    };
    /** Git URL that resolves to the configured repository. */
    GitClient.prototype.getRepoGitUrl = function () {
        return getRepositoryGitUrl(this.remoteConfig);
    };
    /** Whether the given branch contains the specified SHA. */
    GitClient.prototype.hasCommit = function (branchName, sha) {
        return this.run(['branch', branchName, '--contains', sha]).stdout !== '';
    };
    /** Gets the currently checked out branch or revision. */
    GitClient.prototype.getCurrentBranchOrRevision = function () {
        var branchName = this.run(['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim();
        // If no branch name could be resolved. i.e. `HEAD` has been returned, then Git
        // is currently in a detached state. In those cases, we just want to return the
        // currently checked out revision/SHA.
        if (branchName === 'HEAD') {
            return this.run(['rev-parse', 'HEAD']).stdout.trim();
        }
        return branchName;
    };
    /** Gets whether the current Git repository has uncommitted changes. */
    GitClient.prototype.hasUncommittedChanges = function () {
        return this.runGraceful(['diff-index', '--quiet', 'HEAD']).status !== 0;
    };
    /**
     * Checks out a requested branch or revision, optionally cleaning the state of the repository
     * before attempting the checking. Returns a boolean indicating whether the branch or revision
     * was cleanly checked out.
     */
    GitClient.prototype.checkout = function (branchOrRevision, cleanState) {
        if (cleanState) {
            // Abort any outstanding ams.
            this.runGraceful(['am', '--abort'], { stdio: 'ignore' });
            // Abort any outstanding cherry-picks.
            this.runGraceful(['cherry-pick', '--abort'], { stdio: 'ignore' });
            // Abort any outstanding rebases.
            this.runGraceful(['rebase', '--abort'], { stdio: 'ignore' });
            // Clear any changes in the current repo.
            this.runGraceful(['reset', '--hard'], { stdio: 'ignore' });
        }
        return this.runGraceful(['checkout', branchOrRevision], { stdio: 'ignore' }).status === 0;
    };
    /** Gets the latest git tag on the current branch that matches SemVer. */
    GitClient.prototype.getLatestSemverTag = function () {
        var semVerOptions = { loose: true };
        var tags = this.runGraceful(['tag', '--sort=-committerdate', '--merged']).stdout.split('\n');
        var latestTag = tags.find(function (tag) { return parse(tag, semVerOptions); });
        if (latestTag === undefined) {
            throw new Error("Unable to find a SemVer matching tag on \"" + this.getCurrentBranchOrRevision() + "\"");
        }
        return new SemVer(latestTag, semVerOptions);
    };
    /** Retrieves the git tag matching the provided SemVer, if it exists. */
    GitClient.prototype.getMatchingTagForSemver = function (semver) {
        var semVerOptions = { loose: true };
        var tags = this.runGraceful(['tag', '--sort=-committerdate', '--merged']).stdout.split('\n');
        var matchingTag = tags.find(function (tag) { var _a; return ((_a = parse(tag, semVerOptions)) === null || _a === void 0 ? void 0 : _a.compare(semver)) === 0; });
        if (matchingTag === undefined) {
            throw new Error("Unable to find a tag for the version: \"" + semver.format() + "\"");
        }
        return matchingTag;
    };
    /** Retrieve a list of all files in the repository changed since the provided shaOrRef. */
    GitClient.prototype.allChangesFilesSince = function (shaOrRef) {
        if (shaOrRef === void 0) { shaOrRef = 'HEAD'; }
        return Array.from(new Set(__spreadArray(__spreadArray([], __read(gitOutputAsArray(this.runGraceful(['diff', '--name-only', '--diff-filter=d', shaOrRef])))), __read(gitOutputAsArray(this.runGraceful(['ls-files', '--others', '--exclude-standard']))))));
    };
    /** Retrieve a list of all files currently staged in the repostitory. */
    GitClient.prototype.allStagedFiles = function () {
        return gitOutputAsArray(this.runGraceful(['diff', '--name-only', '--diff-filter=ACM', '--staged']));
    };
    /** Retrieve a list of all files tracked in the repository. */
    GitClient.prototype.allFiles = function () {
        return gitOutputAsArray(this.runGraceful(['ls-files']));
    };
    /**
     * Sanitizes the given console message. This method can be overridden by
     * derived classes. e.g. to sanitize access tokens from Git commands.
     */
    GitClient.prototype.sanitizeConsoleOutput = function (value) {
        return value;
    };
    /** Set the verbose logging state of all git client instances. */
    GitClient.setVerboseLoggingState = function (verbose) {
        GitClient.verboseLogging = verbose;
    };
    /**
     * Static method to get the singleton instance of the `GitClient`, creating it
     * if it has not yet been created.
     */
    GitClient.get = function () {
        if (!this._unauthenticatedInstance) {
            GitClient._unauthenticatedInstance = new GitClient();
        }
        return GitClient._unauthenticatedInstance;
    };
    /** Whether verbose logging of Git actions should be used. */
    GitClient.verboseLogging = false;
    return GitClient;
}());
export { GitClient };
/**
 * Takes the output from `run` and `runGraceful` and returns an array of strings for each
 * new line. Git commands typically return multiple output values for a command a set of
 * strings separated by new lines.
 *
 * Note: This is specifically created as a locally available function for usage as convenience
 * utility within `GitClient`'s methods to create outputs as array.
 */
function gitOutputAsArray(gitCommandResult) {
    return gitCommandResult.stdout.split('\n').map(function (x) { return x.trim(); }).filter(function (x) { return !!x; });
}
/** Determines the repository base directory from the current working directory. */
function determineRepoBaseDirFromCwd() {
    // TODO(devversion): Replace with common spawn sync utility once available.
    var _a = spawnSync('git', ['rev-parse --show-toplevel'], { shell: true, stdio: 'pipe', encoding: 'utf8' }), stdout = _a.stdout, stderr = _a.stderr, status = _a.status;
    if (status !== 0) {
        throw Error("Unable to find the path to the base directory of the repository.\n" +
            "Was the command run from inside of the repo?\n\n" +
            ("" + stderr));
    }
    return stdout.trim();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0LWNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9naXQvZ2l0LWNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBcUMsTUFBTSxlQUFlLENBQUM7QUFDNUUsT0FBTyxFQUEyQixLQUFLLEVBQUUsTUFBTSxFQUFDLE1BQU0sUUFBUSxDQUFDO0FBRS9ELE9BQU8sRUFBQyxTQUFTLEVBQTRCLE1BQU0sV0FBVyxDQUFDO0FBQy9ELE9BQU8sRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxXQUFXLEVBQUUsUUFBUSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBRWpELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDdEMsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRWxELHFDQUFxQztBQUNyQztJQUFxQyxtQ0FBSztJQUN4Qyx5QkFBWSxNQUFpQixFQUFTLElBQWM7UUFBcEQ7UUFDRSxrRUFBa0U7UUFDbEUsc0VBQXNFO1FBQ3RFLGtFQUFrRTtRQUNsRSxrQkFBTSx5QkFBdUIsTUFBTSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUcsQ0FBQyxTQU03RTtRQVZxQyxVQUFJLEdBQUosSUFBSSxDQUFVO1FBTWxELHlGQUF5RjtRQUN6RixpQ0FBaUM7UUFDakMsaUhBQWlIO1FBQ2pILE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSSxFQUFFLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7SUFDekQsQ0FBQztJQUNILHNCQUFDO0FBQUQsQ0FBQyxBQVpELENBQXFDLEtBQUssR0FZekM7O0FBT0QsK0VBQStFO0FBQy9FO0lBVUU7SUFDSSx3REFBd0Q7SUFDL0MsT0FBdUM7SUFD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Q0FBQyxFQUFFO1FBQ2hCLE1BQU0sS0FBSyxDQUNQLG9FQUFvRTtZQUNwRSxrREFBa0Q7YUFDbEQsS0FBRyxNQUFRLENBQUEsQ0FBQyxDQUFDO0tBQ2xCO0lBQ0QsT0FBTyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDdkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3NwYXduU3luYywgU3Bhd25TeW5jT3B0aW9ucywgU3Bhd25TeW5jUmV0dXJuc30gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQge09wdGlvbnMgYXMgU2VtVmVyT3B0aW9ucywgcGFyc2UsIFNlbVZlcn0gZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtnZXRDb25maWcsIEdpdGh1YkNvbmZpZywgTmdEZXZDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQge2RlYnVnLCBpbmZvfSBmcm9tICcuLi9jb25zb2xlJztcbmltcG9ydCB7RHJ5UnVuRXJyb3IsIGlzRHJ5UnVufSBmcm9tICcuLi9kcnktcnVuJztcblxuaW1wb3J0IHtHaXRodWJDbGllbnR9IGZyb20gJy4vZ2l0aHViJztcbmltcG9ydCB7Z2V0UmVwb3NpdG9yeUdpdFVybH0gZnJvbSAnLi9naXRodWItdXJscyc7XG5cbi8qKiBFcnJvciBmb3IgZmFpbGVkIEdpdCBjb21tYW5kcy4gKi9cbmV4cG9ydCBjbGFzcyBHaXRDb21tYW5kRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKGNsaWVudDogR2l0Q2xpZW50LCBwdWJsaWMgYXJnczogc3RyaW5nW10pIHtcbiAgICAvLyBFcnJvcnMgYXJlIG5vdCBndWFyYW50ZWVkIHRvIGJlIGNhdWdodC4gVG8gZW5zdXJlIHRoYXQgd2UgZG9uJ3RcbiAgICAvLyBhY2NpZGVudGFsbHkgbGVhayB0aGUgR2l0aHViIHRva2VuIHRoYXQgbWlnaHQgYmUgdXNlZCBpbiBhIGNvbW1hbmQsXG4gICAgLy8gd2Ugc2FuaXRpemUgdGhlIGNvbW1hbmQgdGhhdCB3aWxsIGJlIHBhcnQgb2YgdGhlIGVycm9yIG1lc3NhZ2UuXG4gICAgc3VwZXIoYENvbW1hbmQgZmFpbGVkOiBnaXQgJHtjbGllbnQuc2FuaXRpemVDb25zb2xlT3V0cHV0KGFyZ3Muam9pbignICcpKX1gKTtcblxuICAgIC8vIFNldCB0aGUgcHJvdG90eXBlIGV4cGxpY2l0bHkgYmVjYXVzZSBpbiBFUzUsIHRoZSBwcm90b3R5cGUgaXMgYWNjaWRlbnRhbGx5IGxvc3QgZHVlIHRvXG4gICAgLy8gYSBsaW1pdGF0aW9uIGluIGRvd24tbGV2ZWxpbmcuXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L3dpa2kvRkFRI3doeS1kb2VzbnQtZXh0ZW5kaW5nLWJ1aWx0LWlucy1saWtlLWVycm9yLWFycmF5LWFuZC1tYXAtd29yay5cbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgR2l0Q29tbWFuZEVycm9yLnByb3RvdHlwZSk7XG4gIH1cbn1cblxuLyoqIFRoZSBvcHRpb25zIGF2YWlsYWJsZSBmb3IgdGhlIGBHaXRDbGllbnRgYHJ1bmAgYW5kIGBydW5HcmFjZWZ1bGAgbWV0aG9kcy4gKi9cbnR5cGUgR2l0Q29tbWFuZFJ1bk9wdGlvbnMgPSBTcGF3blN5bmNPcHRpb25zJntcbiAgdmVyYm9zZUxvZ2dpbmc/OiBib29sZWFuO1xufTtcblxuLyoqIENsYXNzIHRoYXQgY2FuIGJlIHVzZWQgdG8gcGVyZm9ybSBHaXQgaW50ZXJhY3Rpb25zIHdpdGggYSBnaXZlbiByZW1vdGUuICoqL1xuZXhwb3J0IGNsYXNzIEdpdENsaWVudCB7XG4gIC8qKiBTaG9ydC1oYW5kIGZvciBhY2Nlc3NpbmcgdGhlIGRlZmF1bHQgcmVtb3RlIGNvbmZpZ3VyYXRpb24uICovXG4gIHJlYWRvbmx5IHJlbW90ZUNvbmZpZzogR2l0aHViQ29uZmlnID0gdGhpcy5jb25maWcuZ2l0aHViO1xuXG4gIC8qKiBPY3Rva2l0IHJlcXVlc3QgcGFyYW1ldGVycyBvYmplY3QgZm9yIHRhcmdldGluZyB0aGUgY29uZmlndXJlZCByZW1vdGUuICovXG4gIHJlYWRvbmx5IHJlbW90ZVBhcmFtcyA9IHtvd25lcjogdGhpcy5yZW1vdGVDb25maWcub3duZXIsIHJlcG86IHRoaXMucmVtb3RlQ29uZmlnLm5hbWV9O1xuXG4gIC8qKiBJbnN0YW5jZSBvZiB0aGUgR2l0aHViIGNsaWVudC4gKi9cbiAgcmVhZG9ubHkgZ2l0aHViID0gbmV3IEdpdGh1YkNsaWVudCgpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgLyoqIFRoZSBmdWxsIHBhdGggdG8gdGhlIHJvb3Qgb2YgdGhlIHJlcG9zaXRvcnkgYmFzZS4gKi9cbiAgICAgIHJlYWRvbmx5IGJhc2VEaXIgPSBkZXRlcm1pbmVSZXBvQmFzZURpckZyb21Dd2QoKSxcbiAgICAgIC8qKiBUaGUgY29uZmlndXJhdGlvbiwgY29udGFpbmluZyB0aGUgZ2l0aHViIHNwZWNpZmljIGNvbmZpZ3VyYXRpb24uICovXG4gICAgICByZWFkb25seSBjb25maWcgPSBnZXRDb25maWcoYmFzZURpcikpIHt9XG5cbiAgLyoqIEV4ZWN1dGVzIHRoZSBnaXZlbiBnaXQgY29tbWFuZC4gVGhyb3dzIGlmIHRoZSBjb21tYW5kIGZhaWxzLiAqL1xuICBydW4oYXJnczogc3RyaW5nW10sIG9wdGlvbnM/OiBHaXRDb21tYW5kUnVuT3B0aW9ucyk6IE9taXQ8U3Bhd25TeW5jUmV0dXJuczxzdHJpbmc+LCAnc3RhdHVzJz4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMucnVuR3JhY2VmdWwoYXJncywgb3B0aW9ucyk7XG4gICAgaWYgKHJlc3VsdC5zdGF0dXMgIT09IDApIHtcbiAgICAgIHRocm93IG5ldyBHaXRDb21tYW5kRXJyb3IodGhpcywgYXJncyk7XG4gICAgfVxuICAgIC8vIE9taXQgYHN0YXR1c2AgZnJvbSB0aGUgdHlwZSBzbyB0aGF0IGl0J3Mgb2J2aW91cyB0aGF0IHRoZSBzdGF0dXMgaXMgbmV2ZXJcbiAgICAvLyBub24temVybyBhcyBleHBsYWluZWQgaW4gdGhlIG1ldGhvZCBkZXNjcmlwdGlvbi5cbiAgICByZXR1cm4gcmVzdWx0IGFzIE9taXQ8U3Bhd25TeW5jUmV0dXJuczxzdHJpbmc+LCAnc3RhdHVzJz47XG4gIH1cblxuICAvKipcbiAgICogU3Bhd25zIGEgZ2l2ZW4gR2l0IGNvbW1hbmQgcHJvY2Vzcy4gRG9lcyBub3QgdGhyb3cgaWYgdGhlIGNvbW1hbmQgZmFpbHMuIEFkZGl0aW9uYWxseSxcbiAgICogaWYgdGhlcmUgaXMgYW55IHN0ZGVyciBvdXRwdXQsIHRoZSBvdXRwdXQgd2lsbCBiZSBwcmludGVkLiBUaGlzIG1ha2VzIGl0IGVhc2llciB0b1xuICAgKiBpbmZvIGZhaWxlZCBjb21tYW5kcy5cbiAgICovXG4gIHJ1bkdyYWNlZnVsKGFyZ3M6IHN0cmluZ1tdLCBvcHRpb25zOiBHaXRDb21tYW5kUnVuT3B0aW9ucyA9IHt9KTogU3Bhd25TeW5jUmV0dXJuczxzdHJpbmc+IHtcbiAgICAvKiogVGhlIGdpdCBjb21tYW5kIHRvIGJlIHJ1bi4gKi9cbiAgICBjb25zdCBnaXRDb21tYW5kID0gYXJnc1swXTtcblxuICAgIGlmIChpc0RyeVJ1bigpICYmIGdpdENvbW1hbmQgPT09ICdwdXNoJykge1xuICAgICAgZGVidWcoYFwiZ2l0IHB1c2hcIiBpcyBub3QgYWJsZSB0byBiZSBydW4gaW4gZHJ5UnVuIG1vZGUuYCk7XG4gICAgICB0aHJvdyBuZXcgRHJ5UnVuRXJyb3IoKTtcbiAgICB9XG5cbiAgICAvLyBUbyBpbXByb3ZlIHRoZSBkZWJ1Z2dpbmcgZXhwZXJpZW5jZSBpbiBjYXNlIHNvbWV0aGluZyBmYWlscywgd2UgcHJpbnQgYWxsIGV4ZWN1dGVkIEdpdFxuICAgIC8vIGNvbW1hbmRzIGF0IHRoZSBERUJVRyBsZXZlbCB0byBiZXR0ZXIgdW5kZXJzdGFuZCB0aGUgZ2l0IGFjdGlvbnMgb2NjdXJyaW5nLiBWZXJib3NlIGxvZ2dpbmcsXG4gICAgLy8gYWx3YXlzIGxvZ2dpbmcgYXQgdGhlIElORk8gbGV2ZWwsIGNhbiBiZSBlbmFibGVkIGVpdGhlciBieSBzZXR0aW5nIHRoZSB2ZXJib3NlTG9nZ2luZ1xuICAgIC8vIHByb3BlcnR5IG9uIHRoZSBHaXRDbGllbnQgY2xhc3Mgb3IgdGhlIG9wdGlvbnMgb2JqZWN0IHByb3ZpZGVkIHRvIHRoZSBtZXRob2QuXG4gICAgY29uc3QgcHJpbnRGbiA9IChHaXRDbGllbnQudmVyYm9zZUxvZ2dpbmcgfHwgb3B0aW9ucy52ZXJib3NlTG9nZ2luZykgPyBpbmZvIDogZGVidWc7XG4gICAgLy8gTm90ZSB0aGF0IHdlIHNhbml0aXplIHRoZSBjb21tYW5kIGJlZm9yZSBwcmludGluZyBpdCB0byB0aGUgY29uc29sZS4gV2UgZG8gbm90IHdhbnQgdG9cbiAgICAvLyBwcmludCBhbiBhY2Nlc3MgdG9rZW4gaWYgaXQgaXMgY29udGFpbmVkIGluIHRoZSBjb21tYW5kLiBJdCdzIGNvbW1vbiB0byBzaGFyZSBlcnJvcnMgd2l0aFxuICAgIC8vIG90aGVycyBpZiB0aGUgdG9vbCBmYWlsZWQsIGFuZCB3ZSBkbyBub3Qgd2FudCB0byBsZWFrIHRva2Vucy5cbiAgICBwcmludEZuKCdFeGVjdXRpbmc6IGdpdCcsIHRoaXMuc2FuaXRpemVDb25zb2xlT3V0cHV0KGFyZ3Muam9pbignICcpKSk7XG5cbiAgICBjb25zdCByZXN1bHQgPSBzcGF3blN5bmMoJ2dpdCcsIGFyZ3MsIHtcbiAgICAgIGN3ZDogdGhpcy5iYXNlRGlyLFxuICAgICAgc3RkaW86ICdwaXBlJyxcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAvLyBFbmNvZGluZyBpcyBhbHdheXMgYHV0ZjhgIGFuZCBub3Qgb3ZlcnJpZGFibGUuIFRoaXMgZW5zdXJlcyB0aGF0IHRoaXMgbWV0aG9kXG4gICAgICAvLyBhbHdheXMgcmV0dXJucyBgc3RyaW5nYCBhcyBvdXRwdXQgaW5zdGVhZCBvZiBidWZmZXJzLlxuICAgICAgZW5jb2Rpbmc6ICd1dGY4JyxcbiAgICB9KTtcblxuICAgIGlmIChyZXN1bHQuc3RkZXJyICE9PSBudWxsKSB7XG4gICAgICAvLyBHaXQgc29tZXRpbWVzIHByaW50cyB0aGUgY29tbWFuZCBpZiBpdCBmYWlsZWQuIFRoaXMgbWVhbnMgdGhhdCBpdCBjb3VsZFxuICAgICAgLy8gcG90ZW50aWFsbHkgbGVhayB0aGUgR2l0aHViIHRva2VuIHVzZWQgZm9yIGFjY2Vzc2luZyB0aGUgcmVtb3RlLiBUbyBhdm9pZFxuICAgICAgLy8gcHJpbnRpbmcgYSB0b2tlbiwgd2Ugc2FuaXRpemUgdGhlIHN0cmluZyBiZWZvcmUgcHJpbnRpbmcgdGhlIHN0ZGVyciBvdXRwdXQuXG4gICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZSh0aGlzLnNhbml0aXplQ29uc29sZU91dHB1dChyZXN1bHQuc3RkZXJyKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKiBHaXQgVVJMIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIGNvbmZpZ3VyZWQgcmVwb3NpdG9yeS4gKi9cbiAgZ2V0UmVwb0dpdFVybCgpIHtcbiAgICByZXR1cm4gZ2V0UmVwb3NpdG9yeUdpdFVybCh0aGlzLnJlbW90ZUNvbmZpZyk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgZ2l2ZW4gYnJhbmNoIGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgU0hBLiAqL1xuICBoYXNDb21taXQoYnJhbmNoTmFtZTogc3RyaW5nLCBzaGE6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJ1bihbJ2JyYW5jaCcsIGJyYW5jaE5hbWUsICctLWNvbnRhaW5zJywgc2hhXSkuc3Rkb3V0ICE9PSAnJztcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBjdXJyZW50bHkgY2hlY2tlZCBvdXQgYnJhbmNoIG9yIHJldmlzaW9uLiAqL1xuICBnZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpOiBzdHJpbmcge1xuICAgIGNvbnN0IGJyYW5jaE5hbWUgPSB0aGlzLnJ1bihbJ3Jldi1wYXJzZScsICctLWFiYnJldi1yZWYnLCAnSEVBRCddKS5zdGRvdXQudHJpbSgpO1xuICAgIC8vIElmIG5vIGJyYW5jaCBuYW1lIGNvdWxkIGJlIHJlc29sdmVkLiBpLmUuIGBIRUFEYCBoYXMgYmVlbiByZXR1cm5lZCwgdGhlbiBHaXRcbiAgICAvLyBpcyBjdXJyZW50bHkgaW4gYSBkZXRhY2hlZCBzdGF0ZS4gSW4gdGhvc2UgY2FzZXMsIHdlIGp1c3Qgd2FudCB0byByZXR1cm4gdGhlXG4gICAgLy8gY3VycmVudGx5IGNoZWNrZWQgb3V0IHJldmlzaW9uL1NIQS5cbiAgICBpZiAoYnJhbmNoTmFtZSA9PT0gJ0hFQUQnKSB7XG4gICAgICByZXR1cm4gdGhpcy5ydW4oWydyZXYtcGFyc2UnLCAnSEVBRCddKS5zdGRvdXQudHJpbSgpO1xuICAgIH1cbiAgICByZXR1cm4gYnJhbmNoTmFtZTtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgdGhlIGN1cnJlbnQgR2l0IHJlcG9zaXRvcnkgaGFzIHVuY29tbWl0dGVkIGNoYW5nZXMuICovXG4gIGhhc1VuY29tbWl0dGVkQ2hhbmdlcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5ydW5HcmFjZWZ1bChbJ2RpZmYtaW5kZXgnLCAnLS1xdWlldCcsICdIRUFEJ10pLnN0YXR1cyAhPT0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgb3V0IGEgcmVxdWVzdGVkIGJyYW5jaCBvciByZXZpc2lvbiwgb3B0aW9uYWxseSBjbGVhbmluZyB0aGUgc3RhdGUgb2YgdGhlIHJlcG9zaXRvcnlcbiAgICogYmVmb3JlIGF0dGVtcHRpbmcgdGhlIGNoZWNraW5nLiBSZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIGJyYW5jaCBvciByZXZpc2lvblxuICAgKiB3YXMgY2xlYW5seSBjaGVja2VkIG91dC5cbiAgICovXG4gIGNoZWNrb3V0KGJyYW5jaE9yUmV2aXNpb246IHN0cmluZywgY2xlYW5TdGF0ZTogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgIGlmIChjbGVhblN0YXRlKSB7XG4gICAgICAvLyBBYm9ydCBhbnkgb3V0c3RhbmRpbmcgYW1zLlxuICAgICAgdGhpcy5ydW5HcmFjZWZ1bChbJ2FtJywgJy0tYWJvcnQnXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuICAgICAgLy8gQWJvcnQgYW55IG91dHN0YW5kaW5nIGNoZXJyeS1waWNrcy5cbiAgICAgIHRoaXMucnVuR3JhY2VmdWwoWydjaGVycnktcGljaycsICctLWFib3J0J10sIHtzdGRpbzogJ2lnbm9yZSd9KTtcbiAgICAgIC8vIEFib3J0IGFueSBvdXRzdGFuZGluZyByZWJhc2VzLlxuICAgICAgdGhpcy5ydW5HcmFjZWZ1bChbJ3JlYmFzZScsICctLWFib3J0J10sIHtzdGRpbzogJ2lnbm9yZSd9KTtcbiAgICAgIC8vIENsZWFyIGFueSBjaGFuZ2VzIGluIHRoZSBjdXJyZW50IHJlcG8uXG4gICAgICB0aGlzLnJ1bkdyYWNlZnVsKFsncmVzZXQnLCAnLS1oYXJkJ10sIHtzdGRpbzogJ2lnbm9yZSd9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucnVuR3JhY2VmdWwoWydjaGVja291dCcsIGJyYW5jaE9yUmV2aXNpb25dLCB7c3RkaW86ICdpZ25vcmUnfSkuc3RhdHVzID09PSAwO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGxhdGVzdCBnaXQgdGFnIG9uIHRoZSBjdXJyZW50IGJyYW5jaCB0aGF0IG1hdGNoZXMgU2VtVmVyLiAqL1xuICBnZXRMYXRlc3RTZW12ZXJUYWcoKTogU2VtVmVyIHtcbiAgICBjb25zdCBzZW1WZXJPcHRpb25zOiBTZW1WZXJPcHRpb25zID0ge2xvb3NlOiB0cnVlfTtcbiAgICBjb25zdCB0YWdzID0gdGhpcy5ydW5HcmFjZWZ1bChbJ3RhZycsICctLXNvcnQ9LWNvbW1pdHRlcmRhdGUnLCAnLS1tZXJnZWQnXSkuc3Rkb3V0LnNwbGl0KCdcXG4nKTtcbiAgICBjb25zdCBsYXRlc3RUYWcgPSB0YWdzLmZpbmQoKHRhZzogc3RyaW5nKSA9PiBwYXJzZSh0YWcsIHNlbVZlck9wdGlvbnMpKTtcblxuICAgIGlmIChsYXRlc3RUYWcgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBVbmFibGUgdG8gZmluZCBhIFNlbVZlciBtYXRjaGluZyB0YWcgb24gXCIke3RoaXMuZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKX1cImApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFNlbVZlcihsYXRlc3RUYWcsIHNlbVZlck9wdGlvbnMpO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlcyB0aGUgZ2l0IHRhZyBtYXRjaGluZyB0aGUgcHJvdmlkZWQgU2VtVmVyLCBpZiBpdCBleGlzdHMuICovXG4gIGdldE1hdGNoaW5nVGFnRm9yU2VtdmVyKHNlbXZlcjogU2VtVmVyKTogc3RyaW5nIHtcbiAgICBjb25zdCBzZW1WZXJPcHRpb25zOiBTZW1WZXJPcHRpb25zID0ge2xvb3NlOiB0cnVlfTtcbiAgICBjb25zdCB0YWdzID0gdGhpcy5ydW5HcmFjZWZ1bChbJ3RhZycsICctLXNvcnQ9LWNvbW1pdHRlcmRhdGUnLCAnLS1tZXJnZWQnXSkuc3Rkb3V0LnNwbGl0KCdcXG4nKTtcbiAgICBjb25zdCBtYXRjaGluZ1RhZyA9XG4gICAgICAgIHRhZ3MuZmluZCgodGFnOiBzdHJpbmcpID0+IHBhcnNlKHRhZywgc2VtVmVyT3B0aW9ucyk/LmNvbXBhcmUoc2VtdmVyKSA9PT0gMCk7XG5cbiAgICBpZiAobWF0Y2hpbmdUYWcgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gZmluZCBhIHRhZyBmb3IgdGhlIHZlcnNpb246IFwiJHtzZW12ZXIuZm9ybWF0KCl9XCJgKTtcbiAgICB9XG4gICAgcmV0dXJuIG1hdGNoaW5nVGFnO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIGEgbGlzdCBvZiBhbGwgZmlsZXMgaW4gdGhlIHJlcG9zaXRvcnkgY2hhbmdlZCBzaW5jZSB0aGUgcHJvdmlkZWQgc2hhT3JSZWYuICovXG4gIGFsbENoYW5nZXNGaWxlc1NpbmNlKHNoYU9yUmVmID0gJ0hFQUQnKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKG5ldyBTZXQoW1xuICAgICAgLi4uZ2l0T3V0cHV0QXNBcnJheSh0aGlzLnJ1bkdyYWNlZnVsKFsnZGlmZicsICctLW5hbWUtb25seScsICctLWRpZmYtZmlsdGVyPWQnLCBzaGFPclJlZl0pKSxcbiAgICAgIC4uLmdpdE91dHB1dEFzQXJyYXkodGhpcy5ydW5HcmFjZWZ1bChbJ2xzLWZpbGVzJywgJy0tb3RoZXJzJywgJy0tZXhjbHVkZS1zdGFuZGFyZCddKSksXG4gICAgXSkpO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIGEgbGlzdCBvZiBhbGwgZmlsZXMgY3VycmVudGx5IHN0YWdlZCBpbiB0aGUgcmVwb3N0aXRvcnkuICovXG4gIGFsbFN0YWdlZEZpbGVzKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gZ2l0T3V0cHV0QXNBcnJheShcbiAgICAgICAgdGhpcy5ydW5HcmFjZWZ1bChbJ2RpZmYnLCAnLS1uYW1lLW9ubHknLCAnLS1kaWZmLWZpbHRlcj1BQ00nLCAnLS1zdGFnZWQnXSkpO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIGEgbGlzdCBvZiBhbGwgZmlsZXMgdHJhY2tlZCBpbiB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgYWxsRmlsZXMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBnaXRPdXRwdXRBc0FycmF5KHRoaXMucnVuR3JhY2VmdWwoWydscy1maWxlcyddKSk7XG4gIH1cblxuICAvKipcbiAgICogU2FuaXRpemVzIHRoZSBnaXZlbiBjb25zb2xlIG1lc3NhZ2UuIFRoaXMgbWV0aG9kIGNhbiBiZSBvdmVycmlkZGVuIGJ5XG4gICAqIGRlcml2ZWQgY2xhc3Nlcy4gZS5nLiB0byBzYW5pdGl6ZSBhY2Nlc3MgdG9rZW5zIGZyb20gR2l0IGNvbW1hbmRzLlxuICAgKi9cbiAgc2FuaXRpemVDb25zb2xlT3V0cHV0KHZhbHVlOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICAvKiogV2hldGhlciB2ZXJib3NlIGxvZ2dpbmcgb2YgR2l0IGFjdGlvbnMgc2hvdWxkIGJlIHVzZWQuICovXG4gIHByaXZhdGUgc3RhdGljIHZlcmJvc2VMb2dnaW5nID0gZmFsc2U7XG5cbiAgLyoqIFRoZSBzaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIHVuYXV0aGVudGljYXRlZCBgR2l0Q2xpZW50YC4gKi9cbiAgcHJpdmF0ZSBzdGF0aWMgX3VuYXV0aGVudGljYXRlZEluc3RhbmNlOiBHaXRDbGllbnQ7XG5cbiAgLyoqIFNldCB0aGUgdmVyYm9zZSBsb2dnaW5nIHN0YXRlIG9mIGFsbCBnaXQgY2xpZW50IGluc3RhbmNlcy4gKi9cbiAgc3RhdGljIHNldFZlcmJvc2VMb2dnaW5nU3RhdGUodmVyYm9zZTogYm9vbGVhbikge1xuICAgIEdpdENsaWVudC52ZXJib3NlTG9nZ2luZyA9IHZlcmJvc2U7XG4gIH1cblxuICAvKipcbiAgICogU3RhdGljIG1ldGhvZCB0byBnZXQgdGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgYEdpdENsaWVudGAsIGNyZWF0aW5nIGl0XG4gICAqIGlmIGl0IGhhcyBub3QgeWV0IGJlZW4gY3JlYXRlZC5cbiAgICovXG4gIHN0YXRpYyBnZXQoKTogR2l0Q2xpZW50IHtcbiAgICBpZiAoIXRoaXMuX3VuYXV0aGVudGljYXRlZEluc3RhbmNlKSB7XG4gICAgICBHaXRDbGllbnQuX3VuYXV0aGVudGljYXRlZEluc3RhbmNlID0gbmV3IEdpdENsaWVudCgpO1xuICAgIH1cbiAgICByZXR1cm4gR2l0Q2xpZW50Ll91bmF1dGhlbnRpY2F0ZWRJbnN0YW5jZTtcbiAgfVxufVxuXG4vKipcbiAqIFRha2VzIHRoZSBvdXRwdXQgZnJvbSBgcnVuYCBhbmQgYHJ1bkdyYWNlZnVsYCBhbmQgcmV0dXJucyBhbiBhcnJheSBvZiBzdHJpbmdzIGZvciBlYWNoXG4gKiBuZXcgbGluZS4gR2l0IGNvbW1hbmRzIHR5cGljYWxseSByZXR1cm4gbXVsdGlwbGUgb3V0cHV0IHZhbHVlcyBmb3IgYSBjb21tYW5kIGEgc2V0IG9mXG4gKiBzdHJpbmdzIHNlcGFyYXRlZCBieSBuZXcgbGluZXMuXG4gKlxuICogTm90ZTogVGhpcyBpcyBzcGVjaWZpY2FsbHkgY3JlYXRlZCBhcyBhIGxvY2FsbHkgYXZhaWxhYmxlIGZ1bmN0aW9uIGZvciB1c2FnZSBhcyBjb252ZW5pZW5jZVxuICogdXRpbGl0eSB3aXRoaW4gYEdpdENsaWVudGAncyBtZXRob2RzIHRvIGNyZWF0ZSBvdXRwdXRzIGFzIGFycmF5LlxuICovXG5mdW5jdGlvbiBnaXRPdXRwdXRBc0FycmF5KGdpdENvbW1hbmRSZXN1bHQ6IFNwYXduU3luY1JldHVybnM8c3RyaW5nPik6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIGdpdENvbW1hbmRSZXN1bHQuc3Rkb3V0LnNwbGl0KCdcXG4nKS5tYXAoeCA9PiB4LnRyaW0oKSkuZmlsdGVyKHggPT4gISF4KTtcbn1cblxuLyoqIERldGVybWluZXMgdGhlIHJlcG9zaXRvcnkgYmFzZSBkaXJlY3RvcnkgZnJvbSB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS4gKi9cbmZ1bmN0aW9uIGRldGVybWluZVJlcG9CYXNlRGlyRnJvbUN3ZCgpIHtcbiAgLy8gVE9ETyhkZXZ2ZXJzaW9uKTogUmVwbGFjZSB3aXRoIGNvbW1vbiBzcGF3biBzeW5jIHV0aWxpdHkgb25jZSBhdmFpbGFibGUuXG4gIGNvbnN0IHtzdGRvdXQsIHN0ZGVyciwgc3RhdHVzfSA9IHNwYXduU3luYyhcbiAgICAgICdnaXQnLCBbJ3Jldi1wYXJzZSAtLXNob3ctdG9wbGV2ZWwnXSwge3NoZWxsOiB0cnVlLCBzdGRpbzogJ3BpcGUnLCBlbmNvZGluZzogJ3V0ZjgnfSk7XG4gIGlmIChzdGF0dXMgIT09IDApIHtcbiAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgYFVuYWJsZSB0byBmaW5kIHRoZSBwYXRoIHRvIHRoZSBiYXNlIGRpcmVjdG9yeSBvZiB0aGUgcmVwb3NpdG9yeS5cXG5gICtcbiAgICAgICAgYFdhcyB0aGUgY29tbWFuZCBydW4gZnJvbSBpbnNpZGUgb2YgdGhlIHJlcG8/XFxuXFxuYCArXG4gICAgICAgIGAke3N0ZGVycn1gKTtcbiAgfVxuICByZXR1cm4gc3Rkb3V0LnRyaW0oKTtcbn1cbiJdfQ==