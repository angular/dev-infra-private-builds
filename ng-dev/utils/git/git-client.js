"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitClient = exports.GitCommandError = void 0;
const child_process_1 = require("child_process");
const config_1 = require("../config");
const console_1 = require("../console");
const dry_run_1 = require("../dry-run");
const github_1 = require("./github");
const github_urls_1 = require("./github-urls");
/** Error for failed Git commands. */
class GitCommandError extends Error {
    // Note: Do not expose the unsanitized arguments as a public property. NodeJS
    // could print the properties of an error instance and leak e.g. a token.
    constructor(client, unsanitizedArgs) {
        // Errors are not guaranteed to be caught. To ensure that we don't
        // accidentally leak the Github token that might be used in a command,
        // we sanitize the command that will be part of the error message.
        super(`Command failed: git ${client.sanitizeConsoleOutput(unsanitizedArgs.join(' '))}`);
    }
}
exports.GitCommandError = GitCommandError;
/** Class that can be used to perform Git interactions with a given remote. **/
class GitClient {
    constructor(
    /** The full path to the root of the repository base. */
    baseDir = determineRepoBaseDirFromCwd(), 
    /** The configuration, containing the github specific configuration. */
    config = (0, config_1.getConfig)(baseDir)) {
        this.baseDir = baseDir;
        /** Instance of the Github client. */
        this.github = new github_1.GithubClient();
        /**
         * Path to the Git executable. By default, `git` is assumed to exist
         * in the shell environment (using `$PATH`).
         */
        this.gitBinPath = 'git';
        (0, config_1.assertValidGithubConfig)(config);
        this.config = config;
        this.remoteConfig = config.github;
        this.remoteParams = { owner: config.github.owner, repo: config.github.name };
        this.mainBranchName = config.github.mainBranchName;
    }
    /** Executes the given git command. Throws if the command fails. */
    run(args, options) {
        const result = this.runGraceful(args, options);
        if (result.status !== 0) {
            throw new GitCommandError(this, args);
        }
        // Omit `status` from the type so that it's obvious that the status is never
        // non-zero as explained in the method description.
        return result;
    }
    /**
     * Spawns a given Git command process. Does not throw if the command fails. Additionally,
     * if there is any stderr output, the output will be printed. This makes it easier to
     * info failed commands.
     */
    runGraceful(args, options = {}) {
        /** The git command to be run. */
        const gitCommand = args[0];
        if ((0, dry_run_1.isDryRun)() && gitCommand === 'push') {
            (0, console_1.debug)(`"git push" is not able to be run in dryRun mode.`);
            throw new dry_run_1.DryRunError();
        }
        // To improve the debugging experience in case something fails, we print all executed Git
        // commands at the DEBUG level to better understand the git actions occurring. Verbose logging,
        // always logging at the INFO level, can be enabled either by setting the verboseLogging
        // property on the GitClient class or the options object provided to the method.
        const printFn = GitClient.verboseLogging || options.verboseLogging ? console_1.info : console_1.debug;
        // Note that we sanitize the command before printing it to the console. We do not want to
        // print an access token if it is contained in the command. It's common to share errors with
        // others if the tool failed, and we do not want to leak tokens.
        printFn('Executing: git', this.sanitizeConsoleOutput(args.join(' ')));
        const result = (0, child_process_1.spawnSync)(this.gitBinPath, args, {
            cwd: this.baseDir,
            stdio: 'pipe',
            ...options,
            // Encoding is always `utf8` and not overridable. This ensures that this method
            // always returns `string` as output instead of buffers.
            encoding: 'utf8',
        });
        if (result.stderr !== null) {
            // Git sometimes prints the command if it failed. This means that it could
            // potentially leak the Github token used for accessing the remote. To avoid
            // printing a token, we sanitize the string before printing the stderr output.
            process.stderr.write(this.sanitizeConsoleOutput(result.stderr));
        }
        if (result.error !== undefined) {
            // Git sometimes prints the command if it failed. This means that it could
            // potentially leak the Github token used for accessing the remote. To avoid
            // printing a token, we sanitize the string before printing the stderr output.
            process.stderr.write(this.sanitizeConsoleOutput(result.error.message));
        }
        return result;
    }
    /** Git URL that resolves to the configured repository. */
    getRepoGitUrl() {
        return (0, github_urls_1.getRepositoryGitUrl)(this.remoteConfig);
    }
    /** Whether the given branch contains the specified SHA. */
    hasCommit(branchName, sha) {
        return this.run(['branch', branchName, '--contains', sha]).stdout !== '';
    }
    /** Whether the local repository is configured as shallow. */
    isShallowRepo() {
        return this.run(['rev-parse', '--is-shallow-repository']).stdout.trim() === 'true';
    }
    /** Gets the currently checked out branch or revision. */
    getCurrentBranchOrRevision() {
        const branchName = this.run(['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim();
        // If no branch name could be resolved. i.e. `HEAD` has been returned, then Git
        // is currently in a detached state. In those cases, we just want to return the
        // currently checked out revision/SHA.
        if (branchName === 'HEAD') {
            return this.run(['rev-parse', 'HEAD']).stdout.trim();
        }
        return branchName;
    }
    /** Gets whether the current Git repository has uncommitted changes. */
    hasUncommittedChanges() {
        return this.runGraceful(['diff-index', '--quiet', 'HEAD']).status !== 0;
    }
    /**
     * Checks out a requested branch or revision, optionally cleaning the state of the repository
     * before attempting the checking. Returns a boolean indicating whether the branch or revision
     * was cleanly checked out.
     */
    checkout(branchOrRevision, cleanState) {
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
    }
    /** Retrieve a list of all files in the repository changed since the provided shaOrRef. */
    allChangesFilesSince(shaOrRef = 'HEAD') {
        return Array.from(new Set([
            ...gitOutputAsArray(this.runGraceful(['diff', '--name-only', '--diff-filter=d', shaOrRef])),
            ...gitOutputAsArray(this.runGraceful(['ls-files', '--others', '--exclude-standard'])),
        ]));
    }
    /** Retrieve a list of all files currently staged in the repostitory. */
    allStagedFiles() {
        return gitOutputAsArray(this.runGraceful(['diff', '--name-only', '--diff-filter=ACM', '--staged']));
    }
    /** Retrieve a list of all files tracked in the repository. */
    allFiles() {
        return gitOutputAsArray(this.runGraceful(['ls-files']));
    }
    /**
     * Sanitizes the given console message. This method can be overridden by
     * derived classes. e.g. to sanitize access tokens from Git commands.
     */
    sanitizeConsoleOutput(value) {
        return value;
    }
    /** Set the verbose logging state of all git client instances. */
    static setVerboseLoggingState(verbose) {
        GitClient.verboseLogging = verbose;
    }
    /**
     * Static method to get the singleton instance of the `GitClient`, creating it
     * if it has not yet been created.
     */
    static get() {
        if (!this._unauthenticatedInstance) {
            GitClient._unauthenticatedInstance = new GitClient();
        }
        return GitClient._unauthenticatedInstance;
    }
}
exports.GitClient = GitClient;
/** Whether verbose logging of Git actions should be used. */
GitClient.verboseLogging = false;
/**
 * Takes the output from `run` and `runGraceful` and returns an array of strings for each
 * new line. Git commands typically return multiple output values for a command a set of
 * strings separated by new lines.
 *
 * Note: This is specifically created as a locally available function for usage as convenience
 * utility within `GitClient`'s methods to create outputs as array.
 */
function gitOutputAsArray(gitCommandResult) {
    return gitCommandResult.stdout
        .split('\n')
        .map((x) => x.trim())
        .filter((x) => !!x);
}
/** Determines the repository base directory from the current working directory. */
function determineRepoBaseDirFromCwd() {
    // TODO(devversion): Replace with common spawn sync utility once available.
    const { stdout, stderr, status } = (0, child_process_1.spawnSync)('git', ['rev-parse --show-toplevel'], {
        shell: true,
        stdio: 'pipe',
        encoding: 'utf8',
    });
    if (status !== 0) {
        throw Error(`Unable to find the path to the base directory of the repository.\n` +
            `Was the command run from inside of the repo?\n\n` +
            `${stderr}`);
    }
    return stdout.trim();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0LWNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi91dGlscy9naXQvZ2l0LWNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCxpREFBNEU7QUFFNUUsc0NBQTJFO0FBQzNFLHdDQUF1QztBQUN2Qyx3Q0FBaUQ7QUFFakQscUNBQXNDO0FBQ3RDLCtDQUFrRDtBQUVsRCxxQ0FBcUM7QUFDckMsTUFBYSxlQUFnQixTQUFRLEtBQUs7SUFDeEMsNkVBQTZFO0lBQzdFLHlFQUF5RTtJQUN6RSxZQUFZLE1BQWlCLEVBQUUsZUFBeUI7UUFDdEQsa0VBQWtFO1FBQ2xFLHNFQUFzRTtRQUN0RSxrRUFBa0U7UUFDbEUsS0FBSyxDQUFDLHVCQUF1QixNQUFNLENBQUMscUJBQXFCLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMxRixDQUFDO0NBQ0Y7QUFURCwwQ0FTQztBQU9ELCtFQUErRTtBQUMvRSxNQUFhLFNBQVM7SUFzQnBCO0lBQ0Usd0RBQXdEO0lBQy9DLFVBQVUsMkJBQTJCLEVBQUU7SUFDaEQsdUVBQXVFO0lBQ3ZFLE1BQU0sR0FBRyxJQUFBLGtCQUFTLEVBQUMsT0FBTyxDQUFDO1FBRmxCLFlBQU8sR0FBUCxPQUFPLENBQWdDO1FBZGxELHFDQUFxQztRQUM1QixXQUFNLEdBQUcsSUFBSSxxQkFBWSxFQUFFLENBQUM7UUFLckM7OztXQUdHO1FBQ00sZUFBVSxHQUFXLEtBQUssQ0FBQztRQVFsQyxJQUFBLGdDQUF1QixFQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUNsQyxJQUFJLENBQUMsWUFBWSxHQUFHLEVBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxN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Q0FBQztBQUN2QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7c3Bhd25TeW5jLCBTcGF3blN5bmNPcHRpb25zLCBTcGF3blN5bmNSZXR1cm5zfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcblxuaW1wb3J0IHtnZXRDb25maWcsIEdpdGh1YkNvbmZpZywgYXNzZXJ0VmFsaWRHaXRodWJDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQge2RlYnVnLCBpbmZvfSBmcm9tICcuLi9jb25zb2xlJztcbmltcG9ydCB7RHJ5UnVuRXJyb3IsIGlzRHJ5UnVufSBmcm9tICcuLi9kcnktcnVuJztcblxuaW1wb3J0IHtHaXRodWJDbGllbnR9IGZyb20gJy4vZ2l0aHViJztcbmltcG9ydCB7Z2V0UmVwb3NpdG9yeUdpdFVybH0gZnJvbSAnLi9naXRodWItdXJscyc7XG5cbi8qKiBFcnJvciBmb3IgZmFpbGVkIEdpdCBjb21tYW5kcy4gKi9cbmV4cG9ydCBjbGFzcyBHaXRDb21tYW5kRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIC8vIE5vdGU6IERvIG5vdCBleHBvc2UgdGhlIHVuc2FuaXRpemVkIGFyZ3VtZW50cyBhcyBhIHB1YmxpYyBwcm9wZXJ0eS4gTm9kZUpTXG4gIC8vIGNvdWxkIHByaW50IHRoZSBwcm9wZXJ0aWVzIG9mIGFuIGVycm9yIGluc3RhbmNlIGFuZCBsZWFrIGUuZy4gYSB0b2tlbi5cbiAgY29uc3RydWN0b3IoY2xpZW50OiBHaXRDbGllbnQsIHVuc2FuaXRpemVkQXJnczogc3RyaW5nW10pIHtcbiAgICAvLyBFcnJvcnMgYXJlIG5vdCBndWFyYW50ZWVkIHRvIGJlIGNhdWdodC4gVG8gZW5zdXJlIHRoYXQgd2UgZG9uJ3RcbiAgICAvLyBhY2NpZGVudGFsbHkgbGVhayB0aGUgR2l0aHViIHRva2VuIHRoYXQgbWlnaHQgYmUgdXNlZCBpbiBhIGNvbW1hbmQsXG4gICAgLy8gd2Ugc2FuaXRpemUgdGhlIGNvbW1hbmQgdGhhdCB3aWxsIGJlIHBhcnQgb2YgdGhlIGVycm9yIG1lc3NhZ2UuXG4gICAgc3VwZXIoYENvbW1hbmQgZmFpbGVkOiBnaXQgJHtjbGllbnQuc2FuaXRpemVDb25zb2xlT3V0cHV0KHVuc2FuaXRpemVkQXJncy5qb2luKCcgJykpfWApO1xuICB9XG59XG5cbi8qKiBUaGUgb3B0aW9ucyBhdmFpbGFibGUgZm9yIHRoZSBgR2l0Q2xpZW50YGBydW5gIGFuZCBgcnVuR3JhY2VmdWxgIG1ldGhvZHMuICovXG50eXBlIEdpdENvbW1hbmRSdW5PcHRpb25zID0gU3Bhd25TeW5jT3B0aW9ucyAmIHtcbiAgdmVyYm9zZUxvZ2dpbmc/OiBib29sZWFuO1xufTtcblxuLyoqIENsYXNzIHRoYXQgY2FuIGJlIHVzZWQgdG8gcGVyZm9ybSBHaXQgaW50ZXJhY3Rpb25zIHdpdGggYSBnaXZlbiByZW1vdGUuICoqL1xuZXhwb3J0IGNsYXNzIEdpdENsaWVudCB7XG4gIC8qKiBTaG9ydC1oYW5kIGZvciBhY2Nlc3NpbmcgdGhlIGRlZmF1bHQgcmVtb3RlIGNvbmZpZ3VyYXRpb24uICovXG4gIHJlYWRvbmx5IHJlbW90ZUNvbmZpZzogR2l0aHViQ29uZmlnO1xuXG4gIC8qKiBPY3Rva2l0IHJlcXVlc3QgcGFyYW1ldGVycyBvYmplY3QgZm9yIHRhcmdldGluZyB0aGUgY29uZmlndXJlZCByZW1vdGUuICovXG4gIHJlYWRvbmx5IHJlbW90ZVBhcmFtczoge293bmVyOiBzdHJpbmc7IHJlcG86IHN0cmluZ307XG5cbiAgLyoqIE5hbWUgb2YgdGhlIHByaW1hcnkgYnJhbmNoIG9mIHRoZSB1cHN0cmVhbSByZW1vdGUuICovXG4gIHJlYWRvbmx5IG1haW5CcmFuY2hOYW1lOiBzdHJpbmc7XG5cbiAgLyoqIEluc3RhbmNlIG9mIHRoZSBHaXRodWIgY2xpZW50LiAqL1xuICByZWFkb25seSBnaXRodWIgPSBuZXcgR2l0aHViQ2xpZW50KCk7XG5cbiAgLyoqIFRoZSBjb25maWd1cmF0aW9uLCBjb250YWluaW5nIHRoZSBnaXRodWIgc3BlY2lmaWMgY29uZmlndXJhdGlvbi4gKi9cbiAgcmVhZG9ubHkgY29uZmlnOiB7Z2l0aHViOiBHaXRodWJDb25maWd9O1xuXG4gIC8qKlxuICAgKiBQYXRoIHRvIHRoZSBHaXQgZXhlY3V0YWJsZS4gQnkgZGVmYXVsdCwgYGdpdGAgaXMgYXNzdW1lZCB0byBleGlzdFxuICAgKiBpbiB0aGUgc2hlbGwgZW52aXJvbm1lbnQgKHVzaW5nIGAkUEFUSGApLlxuICAgKi9cbiAgcmVhZG9ubHkgZ2l0QmluUGF0aDogc3RyaW5nID0gJ2dpdCc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgLyoqIFRoZSBmdWxsIHBhdGggdG8gdGhlIHJvb3Qgb2YgdGhlIHJlcG9zaXRvcnkgYmFzZS4gKi9cbiAgICByZWFkb25seSBiYXNlRGlyID0gZGV0ZXJtaW5lUmVwb0Jhc2VEaXJGcm9tQ3dkKCksXG4gICAgLyoqIFRoZSBjb25maWd1cmF0aW9uLCBjb250YWluaW5nIHRoZSBnaXRodWIgc3BlY2lmaWMgY29uZmlndXJhdGlvbi4gKi9cbiAgICBjb25maWcgPSBnZXRDb25maWcoYmFzZURpciksXG4gICkge1xuICAgIGFzc2VydFZhbGlkR2l0aHViQ29uZmlnKGNvbmZpZyk7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5yZW1vdGVDb25maWcgPSBjb25maWcuZ2l0aHViO1xuICAgIHRoaXMucmVtb3RlUGFyYW1zID0ge293bmVyOiBjb25maWcuZ2l0aHViLm93bmVyLCByZXBvOiBjb25maWcuZ2l0aHViLm5hbWV9O1xuICAgIHRoaXMubWFpbkJyYW5jaE5hbWUgPSBjb25maWcuZ2l0aHViLm1haW5CcmFuY2hOYW1lO1xuICB9XG5cbiAgLyoqIEV4ZWN1dGVzIHRoZSBnaXZlbiBnaXQgY29tbWFuZC4gVGhyb3dzIGlmIHRoZSBjb21tYW5kIGZhaWxzLiAqL1xuICBydW4oYXJnczogc3RyaW5nW10sIG9wdGlvbnM/OiBHaXRDb21tYW5kUnVuT3B0aW9ucyk6IE9taXQ8U3Bhd25TeW5jUmV0dXJuczxzdHJpbmc+LCAnc3RhdHVzJz4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMucnVuR3JhY2VmdWwoYXJncywgb3B0aW9ucyk7XG4gICAgaWYgKHJlc3VsdC5zdGF0dXMgIT09IDApIHtcbiAgICAgIHRocm93IG5ldyBHaXRDb21tYW5kRXJyb3IodGhpcywgYXJncyk7XG4gICAgfVxuICAgIC8vIE9taXQgYHN0YXR1c2AgZnJvbSB0aGUgdHlwZSBzbyB0aGF0IGl0J3Mgb2J2aW91cyB0aGF0IHRoZSBzdGF0dXMgaXMgbmV2ZXJcbiAgICAvLyBub24temVybyBhcyBleHBsYWluZWQgaW4gdGhlIG1ldGhvZCBkZXNjcmlwdGlvbi5cbiAgICByZXR1cm4gcmVzdWx0IGFzIE9taXQ8U3Bhd25TeW5jUmV0dXJuczxzdHJpbmc+LCAnc3RhdHVzJz47XG4gIH1cblxuICAvKipcbiAgICogU3Bhd25zIGEgZ2l2ZW4gR2l0IGNvbW1hbmQgcHJvY2Vzcy4gRG9lcyBub3QgdGhyb3cgaWYgdGhlIGNvbW1hbmQgZmFpbHMuIEFkZGl0aW9uYWxseSxcbiAgICogaWYgdGhlcmUgaXMgYW55IHN0ZGVyciBvdXRwdXQsIHRoZSBvdXRwdXQgd2lsbCBiZSBwcmludGVkLiBUaGlzIG1ha2VzIGl0IGVhc2llciB0b1xuICAgKiBpbmZvIGZhaWxlZCBjb21tYW5kcy5cbiAgICovXG4gIHJ1bkdyYWNlZnVsKGFyZ3M6IHN0cmluZ1tdLCBvcHRpb25zOiBHaXRDb21tYW5kUnVuT3B0aW9ucyA9IHt9KTogU3Bhd25TeW5jUmV0dXJuczxzdHJpbmc+IHtcbiAgICAvKiogVGhlIGdpdCBjb21tYW5kIHRvIGJlIHJ1bi4gKi9cbiAgICBjb25zdCBnaXRDb21tYW5kID0gYXJnc1swXTtcblxuICAgIGlmIChpc0RyeVJ1bigpICYmIGdpdENvbW1hbmQgPT09ICdwdXNoJykge1xuICAgICAgZGVidWcoYFwiZ2l0IHB1c2hcIiBpcyBub3QgYWJsZSB0byBiZSBydW4gaW4gZHJ5UnVuIG1vZGUuYCk7XG4gICAgICB0aHJvdyBuZXcgRHJ5UnVuRXJyb3IoKTtcbiAgICB9XG5cbiAgICAvLyBUbyBpbXByb3ZlIHRoZSBkZWJ1Z2dpbmcgZXhwZXJpZW5jZSBpbiBjYXNlIHNvbWV0aGluZyBmYWlscywgd2UgcHJpbnQgYWxsIGV4ZWN1dGVkIEdpdFxuICAgIC8vIGNvbW1hbmRzIGF0IHRoZSBERUJVRyBsZXZlbCB0byBiZXR0ZXIgdW5kZXJzdGFuZCB0aGUgZ2l0IGFjdGlvbnMgb2NjdXJyaW5nLiBWZXJib3NlIGxvZ2dpbmcsXG4gICAgLy8gYWx3YXlzIGxvZ2dpbmcgYXQgdGhlIElORk8gbGV2ZWwsIGNhbiBiZSBlbmFibGVkIGVpdGhlciBieSBzZXR0aW5nIHRoZSB2ZXJib3NlTG9nZ2luZ1xuICAgIC8vIHByb3BlcnR5IG9uIHRoZSBHaXRDbGllbnQgY2xhc3Mgb3IgdGhlIG9wdGlvbnMgb2JqZWN0IHByb3ZpZGVkIHRvIHRoZSBtZXRob2QuXG4gICAgY29uc3QgcHJpbnRGbiA9IEdpdENsaWVudC52ZXJib3NlTG9nZ2luZyB8fCBvcHRpb25zLnZlcmJvc2VMb2dnaW5nID8gaW5mbyA6IGRlYnVnO1xuICAgIC8vIE5vdGUgdGhhdCB3ZSBzYW5pdGl6ZSB0aGUgY29tbWFuZCBiZWZvcmUgcHJpbnRpbmcgaXQgdG8gdGhlIGNvbnNvbGUuIFdlIGRvIG5vdCB3YW50IHRvXG4gICAgLy8gcHJpbnQgYW4gYWNjZXNzIHRva2VuIGlmIGl0IGlzIGNvbnRhaW5lZCBpbiB0aGUgY29tbWFuZC4gSXQncyBjb21tb24gdG8gc2hhcmUgZXJyb3JzIHdpdGhcbiAgICAvLyBvdGhlcnMgaWYgdGhlIHRvb2wgZmFpbGVkLCBhbmQgd2UgZG8gbm90IHdhbnQgdG8gbGVhayB0b2tlbnMuXG4gICAgcHJpbnRGbignRXhlY3V0aW5nOiBnaXQnLCB0aGlzLnNhbml0aXplQ29uc29sZU91dHB1dChhcmdzLmpvaW4oJyAnKSkpO1xuXG4gICAgY29uc3QgcmVzdWx0ID0gc3Bhd25TeW5jKHRoaXMuZ2l0QmluUGF0aCwgYXJncywge1xuICAgICAgY3dkOiB0aGlzLmJhc2VEaXIsXG4gICAgICBzdGRpbzogJ3BpcGUnLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIC8vIEVuY29kaW5nIGlzIGFsd2F5cyBgdXRmOGAgYW5kIG5vdCBvdmVycmlkYWJsZS4gVGhpcyBlbnN1cmVzIHRoYXQgdGhpcyBtZXRob2RcbiAgICAgIC8vIGFsd2F5cyByZXR1cm5zIGBzdHJpbmdgIGFzIG91dHB1dCBpbnN0ZWFkIG9mIGJ1ZmZlcnMuXG4gICAgICBlbmNvZGluZzogJ3V0ZjgnLFxuICAgIH0pO1xuXG4gICAgaWYgKHJlc3VsdC5zdGRlcnIgIT09IG51bGwpIHtcbiAgICAgIC8vIEdpdCBzb21ldGltZXMgcHJpbnRzIHRoZSBjb21tYW5kIGlmIGl0IGZhaWxlZC4gVGhpcyBtZWFucyB0aGF0IGl0IGNvdWxkXG4gICAgICAvLyBwb3RlbnRpYWxseSBsZWFrIHRoZSBHaXRodWIgdG9rZW4gdXNlZCBmb3IgYWNjZXNzaW5nIHRoZSByZW1vdGUuIFRvIGF2b2lkXG4gICAgICAvLyBwcmludGluZyBhIHRva2VuLCB3ZSBzYW5pdGl6ZSB0aGUgc3RyaW5nIGJlZm9yZSBwcmludGluZyB0aGUgc3RkZXJyIG91dHB1dC5cbiAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlKHRoaXMuc2FuaXRpemVDb25zb2xlT3V0cHV0KHJlc3VsdC5zdGRlcnIpKTtcbiAgICB9XG5cbiAgICBpZiAocmVzdWx0LmVycm9yICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIEdpdCBzb21ldGltZXMgcHJpbnRzIHRoZSBjb21tYW5kIGlmIGl0IGZhaWxlZC4gVGhpcyBtZWFucyB0aGF0IGl0IGNvdWxkXG4gICAgICAvLyBwb3RlbnRpYWxseSBsZWFrIHRoZSBHaXRodWIgdG9rZW4gdXNlZCBmb3IgYWNjZXNzaW5nIHRoZSByZW1vdGUuIFRvIGF2b2lkXG4gICAgICAvLyBwcmludGluZyBhIHRva2VuLCB3ZSBzYW5pdGl6ZSB0aGUgc3RyaW5nIGJlZm9yZSBwcmludGluZyB0aGUgc3RkZXJyIG91dHB1dC5cbiAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlKHRoaXMuc2FuaXRpemVDb25zb2xlT3V0cHV0KHJlc3VsdC5lcnJvci5tZXNzYWdlKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKiBHaXQgVVJMIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIGNvbmZpZ3VyZWQgcmVwb3NpdG9yeS4gKi9cbiAgZ2V0UmVwb0dpdFVybCgpIHtcbiAgICByZXR1cm4gZ2V0UmVwb3NpdG9yeUdpdFVybCh0aGlzLnJlbW90ZUNvbmZpZyk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgZ2l2ZW4gYnJhbmNoIGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgU0hBLiAqL1xuICBoYXNDb21taXQoYnJhbmNoTmFtZTogc3RyaW5nLCBzaGE6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJ1bihbJ2JyYW5jaCcsIGJyYW5jaE5hbWUsICctLWNvbnRhaW5zJywgc2hhXSkuc3Rkb3V0ICE9PSAnJztcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBsb2NhbCByZXBvc2l0b3J5IGlzIGNvbmZpZ3VyZWQgYXMgc2hhbGxvdy4gKi9cbiAgaXNTaGFsbG93UmVwbygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5ydW4oWydyZXYtcGFyc2UnLCAnLS1pcy1zaGFsbG93LXJlcG9zaXRvcnknXSkuc3Rkb3V0LnRyaW0oKSA9PT0gJ3RydWUnO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGN1cnJlbnRseSBjaGVja2VkIG91dCBicmFuY2ggb3IgcmV2aXNpb24uICovXG4gIGdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk6IHN0cmluZyB7XG4gICAgY29uc3QgYnJhbmNoTmFtZSA9IHRoaXMucnVuKFsncmV2LXBhcnNlJywgJy0tYWJicmV2LXJlZicsICdIRUFEJ10pLnN0ZG91dC50cmltKCk7XG4gICAgLy8gSWYgbm8gYnJhbmNoIG5hbWUgY291bGQgYmUgcmVzb2x2ZWQuIGkuZS4gYEhFQURgIGhhcyBiZWVuIHJldHVybmVkLCB0aGVuIEdpdFxuICAgIC8vIGlzIGN1cnJlbnRseSBpbiBhIGRldGFjaGVkIHN0YXRlLiBJbiB0aG9zZSBjYXNlcywgd2UganVzdCB3YW50IHRvIHJldHVybiB0aGVcbiAgICAvLyBjdXJyZW50bHkgY2hlY2tlZCBvdXQgcmV2aXNpb24vU0hBLlxuICAgIGlmIChicmFuY2hOYW1lID09PSAnSEVBRCcpIHtcbiAgICAgIHJldHVybiB0aGlzLnJ1bihbJ3Jldi1wYXJzZScsICdIRUFEJ10pLnN0ZG91dC50cmltKCk7XG4gICAgfVxuICAgIHJldHVybiBicmFuY2hOYW1lO1xuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciB0aGUgY3VycmVudCBHaXQgcmVwb3NpdG9yeSBoYXMgdW5jb21taXR0ZWQgY2hhbmdlcy4gKi9cbiAgaGFzVW5jb21taXR0ZWRDaGFuZ2VzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJ1bkdyYWNlZnVsKFsnZGlmZi1pbmRleCcsICctLXF1aWV0JywgJ0hFQUQnXSkuc3RhdHVzICE9PSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBvdXQgYSByZXF1ZXN0ZWQgYnJhbmNoIG9yIHJldmlzaW9uLCBvcHRpb25hbGx5IGNsZWFuaW5nIHRoZSBzdGF0ZSBvZiB0aGUgcmVwb3NpdG9yeVxuICAgKiBiZWZvcmUgYXR0ZW1wdGluZyB0aGUgY2hlY2tpbmcuIFJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgYnJhbmNoIG9yIHJldmlzaW9uXG4gICAqIHdhcyBjbGVhbmx5IGNoZWNrZWQgb3V0LlxuICAgKi9cbiAgY2hlY2tvdXQoYnJhbmNoT3JSZXZpc2lvbjogc3RyaW5nLCBjbGVhblN0YXRlOiBib29sZWFuKTogYm9vbGVhbiB7XG4gICAgaWYgKGNsZWFuU3RhdGUpIHtcbiAgICAgIC8vIEFib3J0IGFueSBvdXRzdGFuZGluZyBhbXMuXG4gICAgICB0aGlzLnJ1bkdyYWNlZnVsKFsnYW0nLCAnLS1hYm9ydCddLCB7c3RkaW86ICdpZ25vcmUnfSk7XG4gICAgICAvLyBBYm9ydCBhbnkgb3V0c3RhbmRpbmcgY2hlcnJ5LXBpY2tzLlxuICAgICAgdGhpcy5ydW5HcmFjZWZ1bChbJ2NoZXJyeS1waWNrJywgJy0tYWJvcnQnXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuICAgICAgLy8gQWJvcnQgYW55IG91dHN0YW5kaW5nIHJlYmFzZXMuXG4gICAgICB0aGlzLnJ1bkdyYWNlZnVsKFsncmViYXNlJywgJy0tYWJvcnQnXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuICAgICAgLy8gQ2xlYXIgYW55IGNoYW5nZXMgaW4gdGhlIGN1cnJlbnQgcmVwby5cbiAgICAgIHRoaXMucnVuR3JhY2VmdWwoWydyZXNldCcsICctLWhhcmQnXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5ydW5HcmFjZWZ1bChbJ2NoZWNrb3V0JywgYnJhbmNoT3JSZXZpc2lvbl0sIHtzdGRpbzogJ2lnbm9yZSd9KS5zdGF0dXMgPT09IDA7XG4gIH1cblxuICAvKiogUmV0cmlldmUgYSBsaXN0IG9mIGFsbCBmaWxlcyBpbiB0aGUgcmVwb3NpdG9yeSBjaGFuZ2VkIHNpbmNlIHRoZSBwcm92aWRlZCBzaGFPclJlZi4gKi9cbiAgYWxsQ2hhbmdlc0ZpbGVzU2luY2Uoc2hhT3JSZWYgPSAnSEVBRCcpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oXG4gICAgICBuZXcgU2V0KFtcbiAgICAgICAgLi4uZ2l0T3V0cHV0QXNBcnJheSh0aGlzLnJ1bkdyYWNlZnVsKFsnZGlmZicsICctLW5hbWUtb25seScsICctLWRpZmYtZmlsdGVyPWQnLCBzaGFPclJlZl0pKSxcbiAgICAgICAgLi4uZ2l0T3V0cHV0QXNBcnJheSh0aGlzLnJ1bkdyYWNlZnVsKFsnbHMtZmlsZXMnLCAnLS1vdGhlcnMnLCAnLS1leGNsdWRlLXN0YW5kYXJkJ10pKSxcbiAgICAgIF0pLFxuICAgICk7XG4gIH1cblxuICAvKiogUmV0cmlldmUgYSBsaXN0IG9mIGFsbCBmaWxlcyBjdXJyZW50bHkgc3RhZ2VkIGluIHRoZSByZXBvc3RpdG9yeS4gKi9cbiAgYWxsU3RhZ2VkRmlsZXMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBnaXRPdXRwdXRBc0FycmF5KFxuICAgICAgdGhpcy5ydW5HcmFjZWZ1bChbJ2RpZmYnLCAnLS1uYW1lLW9ubHknLCAnLS1kaWZmLWZpbHRlcj1BQ00nLCAnLS1zdGFnZWQnXSksXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBSZXRyaWV2ZSBhIGxpc3Qgb2YgYWxsIGZpbGVzIHRyYWNrZWQgaW4gdGhlIHJlcG9zaXRvcnkuICovXG4gIGFsbEZpbGVzKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gZ2l0T3V0cHV0QXNBcnJheSh0aGlzLnJ1bkdyYWNlZnVsKFsnbHMtZmlsZXMnXSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNhbml0aXplcyB0aGUgZ2l2ZW4gY29uc29sZSBtZXNzYWdlLiBUaGlzIG1ldGhvZCBjYW4gYmUgb3ZlcnJpZGRlbiBieVxuICAgKiBkZXJpdmVkIGNsYXNzZXMuIGUuZy4gdG8gc2FuaXRpemUgYWNjZXNzIHRva2VucyBmcm9tIEdpdCBjb21tYW5kcy5cbiAgICovXG4gIHNhbml0aXplQ29uc29sZU91dHB1dCh2YWx1ZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdmVyYm9zZSBsb2dnaW5nIG9mIEdpdCBhY3Rpb25zIHNob3VsZCBiZSB1c2VkLiAqL1xuICBwcml2YXRlIHN0YXRpYyB2ZXJib3NlTG9nZ2luZyA9IGZhbHNlO1xuXG4gIC8qKiBUaGUgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSB1bmF1dGhlbnRpY2F0ZWQgYEdpdENsaWVudGAuICovXG4gIHByaXZhdGUgc3RhdGljIF91bmF1dGhlbnRpY2F0ZWRJbnN0YW5jZTogR2l0Q2xpZW50O1xuXG4gIC8qKiBTZXQgdGhlIHZlcmJvc2UgbG9nZ2luZyBzdGF0ZSBvZiBhbGwgZ2l0IGNsaWVudCBpbnN0YW5jZXMuICovXG4gIHN0YXRpYyBzZXRWZXJib3NlTG9nZ2luZ1N0YXRlKHZlcmJvc2U6IGJvb2xlYW4pIHtcbiAgICBHaXRDbGllbnQudmVyYm9zZUxvZ2dpbmcgPSB2ZXJib3NlO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXRpYyBtZXRob2QgdG8gZ2V0IHRoZSBzaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIGBHaXRDbGllbnRgLCBjcmVhdGluZyBpdFxuICAgKiBpZiBpdCBoYXMgbm90IHlldCBiZWVuIGNyZWF0ZWQuXG4gICAqL1xuICBzdGF0aWMgZ2V0KCk6IEdpdENsaWVudCB7XG4gICAgaWYgKCF0aGlzLl91bmF1dGhlbnRpY2F0ZWRJbnN0YW5jZSkge1xuICAgICAgR2l0Q2xpZW50Ll91bmF1dGhlbnRpY2F0ZWRJbnN0YW5jZSA9IG5ldyBHaXRDbGllbnQoKTtcbiAgICB9XG4gICAgcmV0dXJuIEdpdENsaWVudC5fdW5hdXRoZW50aWNhdGVkSW5zdGFuY2U7XG4gIH1cbn1cblxuLyoqXG4gKiBUYWtlcyB0aGUgb3V0cHV0IGZyb20gYHJ1bmAgYW5kIGBydW5HcmFjZWZ1bGAgYW5kIHJldHVybnMgYW4gYXJyYXkgb2Ygc3RyaW5ncyBmb3IgZWFjaFxuICogbmV3IGxpbmUuIEdpdCBjb21tYW5kcyB0eXBpY2FsbHkgcmV0dXJuIG11bHRpcGxlIG91dHB1dCB2YWx1ZXMgZm9yIGEgY29tbWFuZCBhIHNldCBvZlxuICogc3RyaW5ncyBzZXBhcmF0ZWQgYnkgbmV3IGxpbmVzLlxuICpcbiAqIE5vdGU6IFRoaXMgaXMgc3BlY2lmaWNhbGx5IGNyZWF0ZWQgYXMgYSBsb2NhbGx5IGF2YWlsYWJsZSBmdW5jdGlvbiBmb3IgdXNhZ2UgYXMgY29udmVuaWVuY2VcbiAqIHV0aWxpdHkgd2l0aGluIGBHaXRDbGllbnRgJ3MgbWV0aG9kcyB0byBjcmVhdGUgb3V0cHV0cyBhcyBhcnJheS5cbiAqL1xuZnVuY3Rpb24gZ2l0T3V0cHV0QXNBcnJheShnaXRDb21tYW5kUmVzdWx0OiBTcGF3blN5bmNSZXR1cm5zPHN0cmluZz4pOiBzdHJpbmdbXSB7XG4gIHJldHVybiBnaXRDb21tYW5kUmVzdWx0LnN0ZG91dFxuICAgIC5zcGxpdCgnXFxuJylcbiAgICAubWFwKCh4KSA9PiB4LnRyaW0oKSlcbiAgICAuZmlsdGVyKCh4KSA9PiAhIXgpO1xufVxuXG4vKiogRGV0ZXJtaW5lcyB0aGUgcmVwb3NpdG9yeSBiYXNlIGRpcmVjdG9yeSBmcm9tIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LiAqL1xuZnVuY3Rpb24gZGV0ZXJtaW5lUmVwb0Jhc2VEaXJGcm9tQ3dkKCkge1xuICAvLyBUT0RPKGRldnZlcnNpb24pOiBSZXBsYWNlIHdpdGggY29tbW9uIHNwYXduIHN5bmMgdXRpbGl0eSBvbmNlIGF2YWlsYWJsZS5cbiAgY29uc3Qge3N0ZG91dCwgc3RkZXJyLCBzdGF0dXN9ID0gc3Bhd25TeW5jKCdnaXQnLCBbJ3Jldi1wYXJzZSAtLXNob3ctdG9wbGV2ZWwnXSwge1xuICAgIHNoZWxsOiB0cnVlLFxuICAgIHN0ZGlvOiAncGlwZScsXG4gICAgZW5jb2Rpbmc6ICd1dGY4JyxcbiAgfSk7XG4gIGlmIChzdGF0dXMgIT09IDApIHtcbiAgICB0aHJvdyBFcnJvcihcbiAgICAgIGBVbmFibGUgdG8gZmluZCB0aGUgcGF0aCB0byB0aGUgYmFzZSBkaXJlY3Rvcnkgb2YgdGhlIHJlcG9zaXRvcnkuXFxuYCArXG4gICAgICAgIGBXYXMgdGhlIGNvbW1hbmQgcnVuIGZyb20gaW5zaWRlIG9mIHRoZSByZXBvP1xcblxcbmAgK1xuICAgICAgICBgJHtzdGRlcnJ9YCxcbiAgICApO1xuICB9XG4gIHJldHVybiBzdGRvdXQudHJpbSgpO1xufVxuIl19