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
    constructor(client, args) {
        // Errors are not guaranteed to be caught. To ensure that we don't
        // accidentally leak the Github token that might be used in a command,
        // we sanitize the command that will be part of the error message.
        super(`Command failed: git ${client.sanitizeConsoleOutput(args.join(' '))}`);
        this.args = args;
        // Set the prototype explicitly because in ES5, the prototype is accidentally lost due to
        // a limitation in down-leveling.
        // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
        Object.setPrototypeOf(this, GitCommandError.prototype);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0LWNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi91dGlscy9naXQvZ2l0LWNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCxpREFBNEU7QUFFNUUsc0NBQTJFO0FBQzNFLHdDQUF1QztBQUN2Qyx3Q0FBaUQ7QUFFakQscUNBQXNDO0FBQ3RDLCtDQUFrRDtBQUVsRCxxQ0FBcUM7QUFDckMsTUFBYSxlQUFnQixTQUFRLEtBQUs7SUFDeEMsWUFBWSxNQUFpQixFQUFTLElBQWM7UUFDbEQsa0VBQWtFO1FBQ2xFLHNFQUFzRTtRQUN0RSxrRUFBa0U7UUFDbEUsS0FBSyxDQUFDLHVCQUF1QixNQUFNLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUp6QyxTQUFJLEdBQUosSUFBSSxDQUFVO1FBTWxELHlGQUF5RjtRQUN6RixpQ0FBaUM7UUFDakMsaUhBQWlIO1FBQ2pILE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN6RCxDQUFDO0NBQ0Y7QUFaRCwwQ0FZQztBQU9ELCtFQUErRTtBQUMvRSxNQUFhLFNBQVM7SUFzQnBCO0lBQ0Usd0RBQXdEO0lBQy9DLFVBQVUsMkJBQTJCLEVBQUU7SUFDaEQsdUVBQXVFO0lBQ3ZFLE1BQU0sR0FBRyxJQUFBLGtCQUFTLEVBQUMsT0FBTyxDQUFDO1FBRmxCLFlBQU8sR0FBUCxPQUFPLENBQWdDO1FBZGxELHFDQUFxQztRQUM1QixXQUFNLEdBQUcsSUFBSSxxQkFBWSxFQUFFLENBQUM7UUFLckM7OztXQUdHO1FBQ00sZUFBVSxHQUFXLEtBQUssQ0FBQztRQVFsQyxJQUFBLGdDQUF1QixFQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFD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KipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtzcGF3blN5bmMsIFNwYXduU3luY09wdGlvbnMsIFNwYXduU3luY1JldHVybnN9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuXG5pbXBvcnQge2dldENvbmZpZywgR2l0aHViQ29uZmlnLCBhc3NlcnRWYWxpZEdpdGh1YkNvbmZpZ30gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7ZGVidWcsIGluZm99IGZyb20gJy4uL2NvbnNvbGUnO1xuaW1wb3J0IHtEcnlSdW5FcnJvciwgaXNEcnlSdW59IGZyb20gJy4uL2RyeS1ydW4nO1xuXG5pbXBvcnQge0dpdGh1YkNsaWVudH0gZnJvbSAnLi9naXRodWInO1xuaW1wb3J0IHtnZXRSZXBvc2l0b3J5R2l0VXJsfSBmcm9tICcuL2dpdGh1Yi11cmxzJztcblxuLyoqIEVycm9yIGZvciBmYWlsZWQgR2l0IGNvbW1hbmRzLiAqL1xuZXhwb3J0IGNsYXNzIEdpdENvbW1hbmRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoY2xpZW50OiBHaXRDbGllbnQsIHB1YmxpYyBhcmdzOiBzdHJpbmdbXSkge1xuICAgIC8vIEVycm9ycyBhcmUgbm90IGd1YXJhbnRlZWQgdG8gYmUgY2F1Z2h0LiBUbyBlbnN1cmUgdGhhdCB3ZSBkb24ndFxuICAgIC8vIGFjY2lkZW50YWxseSBsZWFrIHRoZSBHaXRodWIgdG9rZW4gdGhhdCBtaWdodCBiZSB1c2VkIGluIGEgY29tbWFuZCxcbiAgICAvLyB3ZSBzYW5pdGl6ZSB0aGUgY29tbWFuZCB0aGF0IHdpbGwgYmUgcGFydCBvZiB0aGUgZXJyb3IgbWVzc2FnZS5cbiAgICBzdXBlcihgQ29tbWFuZCBmYWlsZWQ6IGdpdCAke2NsaWVudC5zYW5pdGl6ZUNvbnNvbGVPdXRwdXQoYXJncy5qb2luKCcgJykpfWApO1xuXG4gICAgLy8gU2V0IHRoZSBwcm90b3R5cGUgZXhwbGljaXRseSBiZWNhdXNlIGluIEVTNSwgdGhlIHByb3RvdHlwZSBpcyBhY2NpZGVudGFsbHkgbG9zdCBkdWUgdG9cbiAgICAvLyBhIGxpbWl0YXRpb24gaW4gZG93bi1sZXZlbGluZy5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvd2lraS9GQVEjd2h5LWRvZXNudC1leHRlbmRpbmctYnVpbHQtaW5zLWxpa2UtZXJyb3ItYXJyYXktYW5kLW1hcC13b3JrLlxuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBHaXRDb21tYW5kRXJyb3IucHJvdG90eXBlKTtcbiAgfVxufVxuXG4vKiogVGhlIG9wdGlvbnMgYXZhaWxhYmxlIGZvciB0aGUgYEdpdENsaWVudGBgcnVuYCBhbmQgYHJ1bkdyYWNlZnVsYCBtZXRob2RzLiAqL1xudHlwZSBHaXRDb21tYW5kUnVuT3B0aW9ucyA9IFNwYXduU3luY09wdGlvbnMgJiB7XG4gIHZlcmJvc2VMb2dnaW5nPzogYm9vbGVhbjtcbn07XG5cbi8qKiBDbGFzcyB0aGF0IGNhbiBiZSB1c2VkIHRvIHBlcmZvcm0gR2l0IGludGVyYWN0aW9ucyB3aXRoIGEgZ2l2ZW4gcmVtb3RlLiAqKi9cbmV4cG9ydCBjbGFzcyBHaXRDbGllbnQge1xuICAvKiogU2hvcnQtaGFuZCBmb3IgYWNjZXNzaW5nIHRoZSBkZWZhdWx0IHJlbW90ZSBjb25maWd1cmF0aW9uLiAqL1xuICByZWFkb25seSByZW1vdGVDb25maWc6IEdpdGh1YkNvbmZpZztcblxuICAvKiogT2N0b2tpdCByZXF1ZXN0IHBhcmFtZXRlcnMgb2JqZWN0IGZvciB0YXJnZXRpbmcgdGhlIGNvbmZpZ3VyZWQgcmVtb3RlLiAqL1xuICByZWFkb25seSByZW1vdGVQYXJhbXM6IHtvd25lcjogc3RyaW5nOyByZXBvOiBzdHJpbmd9O1xuXG4gIC8qKiBOYW1lIG9mIHRoZSBwcmltYXJ5IGJyYW5jaCBvZiB0aGUgdXBzdHJlYW0gcmVtb3RlLiAqL1xuICByZWFkb25seSBtYWluQnJhbmNoTmFtZTogc3RyaW5nO1xuXG4gIC8qKiBJbnN0YW5jZSBvZiB0aGUgR2l0aHViIGNsaWVudC4gKi9cbiAgcmVhZG9ubHkgZ2l0aHViID0gbmV3IEdpdGh1YkNsaWVudCgpO1xuXG4gIC8qKiBUaGUgY29uZmlndXJhdGlvbiwgY29udGFpbmluZyB0aGUgZ2l0aHViIHNwZWNpZmljIGNvbmZpZ3VyYXRpb24uICovXG4gIHJlYWRvbmx5IGNvbmZpZzoge2dpdGh1YjogR2l0aHViQ29uZmlnfTtcblxuICAvKipcbiAgICogUGF0aCB0byB0aGUgR2l0IGV4ZWN1dGFibGUuIEJ5IGRlZmF1bHQsIGBnaXRgIGlzIGFzc3VtZWQgdG8gZXhpc3RcbiAgICogaW4gdGhlIHNoZWxsIGVudmlyb25tZW50ICh1c2luZyBgJFBBVEhgKS5cbiAgICovXG4gIHJlYWRvbmx5IGdpdEJpblBhdGg6IHN0cmluZyA9ICdnaXQnO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBUaGUgZnVsbCBwYXRoIHRvIHRoZSByb290IG9mIHRoZSByZXBvc2l0b3J5IGJhc2UuICovXG4gICAgcmVhZG9ubHkgYmFzZURpciA9IGRldGVybWluZVJlcG9CYXNlRGlyRnJvbUN3ZCgpLFxuICAgIC8qKiBUaGUgY29uZmlndXJhdGlvbiwgY29udGFpbmluZyB0aGUgZ2l0aHViIHNwZWNpZmljIGNvbmZpZ3VyYXRpb24uICovXG4gICAgY29uZmlnID0gZ2V0Q29uZmlnKGJhc2VEaXIpLFxuICApIHtcbiAgICBhc3NlcnRWYWxpZEdpdGh1YkNvbmZpZyhjb25maWcpO1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMucmVtb3RlQ29uZmlnID0gY29uZmlnLmdpdGh1YjtcbiAgICB0aGlzLnJlbW90ZVBhcmFtcyA9IHtvd25lcjogY29uZmlnLmdpdGh1Yi5vd25lciwgcmVwbzogY29uZmlnLmdpdGh1Yi5uYW1lfTtcbiAgICB0aGlzLm1haW5CcmFuY2hOYW1lID0gY29uZmlnLmdpdGh1Yi5tYWluQnJhbmNoTmFtZTtcbiAgfVxuXG4gIC8qKiBFeGVjdXRlcyB0aGUgZ2l2ZW4gZ2l0IGNvbW1hbmQuIFRocm93cyBpZiB0aGUgY29tbWFuZCBmYWlscy4gKi9cbiAgcnVuKGFyZ3M6IHN0cmluZ1tdLCBvcHRpb25zPzogR2l0Q29tbWFuZFJ1bk9wdGlvbnMpOiBPbWl0PFNwYXduU3luY1JldHVybnM8c3RyaW5nPiwgJ3N0YXR1cyc+IHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLnJ1bkdyYWNlZnVsKGFyZ3MsIG9wdGlvbnMpO1xuICAgIGlmIChyZXN1bHQuc3RhdHVzICE9PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgR2l0Q29tbWFuZEVycm9yKHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgICAvLyBPbWl0IGBzdGF0dXNgIGZyb20gdGhlIHR5cGUgc28gdGhhdCBpdCdzIG9idmlvdXMgdGhhdCB0aGUgc3RhdHVzIGlzIG5ldmVyXG4gICAgLy8gbm9uLXplcm8gYXMgZXhwbGFpbmVkIGluIHRoZSBtZXRob2QgZGVzY3JpcHRpb24uXG4gICAgcmV0dXJuIHJlc3VsdCBhcyBPbWl0PFNwYXduU3luY1JldHVybnM8c3RyaW5nPiwgJ3N0YXR1cyc+O1xuICB9XG5cbiAgLyoqXG4gICAqIFNwYXducyBhIGdpdmVuIEdpdCBjb21tYW5kIHByb2Nlc3MuIERvZXMgbm90IHRocm93IGlmIHRoZSBjb21tYW5kIGZhaWxzLiBBZGRpdGlvbmFsbHksXG4gICAqIGlmIHRoZXJlIGlzIGFueSBzdGRlcnIgb3V0cHV0LCB0aGUgb3V0cHV0IHdpbGwgYmUgcHJpbnRlZC4gVGhpcyBtYWtlcyBpdCBlYXNpZXIgdG9cbiAgICogaW5mbyBmYWlsZWQgY29tbWFuZHMuXG4gICAqL1xuICBydW5HcmFjZWZ1bChhcmdzOiBzdHJpbmdbXSwgb3B0aW9uczogR2l0Q29tbWFuZFJ1bk9wdGlvbnMgPSB7fSk6IFNwYXduU3luY1JldHVybnM8c3RyaW5nPiB7XG4gICAgLyoqIFRoZSBnaXQgY29tbWFuZCB0byBiZSBydW4uICovXG4gICAgY29uc3QgZ2l0Q29tbWFuZCA9IGFyZ3NbMF07XG5cbiAgICBpZiAoaXNEcnlSdW4oKSAmJiBnaXRDb21tYW5kID09PSAncHVzaCcpIHtcbiAgICAgIGRlYnVnKGBcImdpdCBwdXNoXCIgaXMgbm90IGFibGUgdG8gYmUgcnVuIGluIGRyeVJ1biBtb2RlLmApO1xuICAgICAgdGhyb3cgbmV3IERyeVJ1bkVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gVG8gaW1wcm92ZSB0aGUgZGVidWdnaW5nIGV4cGVyaWVuY2UgaW4gY2FzZSBzb21ldGhpbmcgZmFpbHMsIHdlIHByaW50IGFsbCBleGVjdXRlZCBHaXRcbiAgICAvLyBjb21tYW5kcyBhdCB0aGUgREVCVUcgbGV2ZWwgdG8gYmV0dGVyIHVuZGVyc3RhbmQgdGhlIGdpdCBhY3Rpb25zIG9jY3VycmluZy4gVmVyYm9zZSBsb2dnaW5nLFxuICAgIC8vIGFsd2F5cyBsb2dnaW5nIGF0IHRoZSBJTkZPIGxldmVsLCBjYW4gYmUgZW5hYmxlZCBlaXRoZXIgYnkgc2V0dGluZyB0aGUgdmVyYm9zZUxvZ2dpbmdcbiAgICAvLyBwcm9wZXJ0eSBvbiB0aGUgR2l0Q2xpZW50IGNsYXNzIG9yIHRoZSBvcHRpb25zIG9iamVjdCBwcm92aWRlZCB0byB0aGUgbWV0aG9kLlxuICAgIGNvbnN0IHByaW50Rm4gPSBHaXRDbGllbnQudmVyYm9zZUxvZ2dpbmcgfHwgb3B0aW9ucy52ZXJib3NlTG9nZ2luZyA/IGluZm8gOiBkZWJ1ZztcbiAgICAvLyBOb3RlIHRoYXQgd2Ugc2FuaXRpemUgdGhlIGNvbW1hbmQgYmVmb3JlIHByaW50aW5nIGl0IHRvIHRoZSBjb25zb2xlLiBXZSBkbyBub3Qgd2FudCB0b1xuICAgIC8vIHByaW50IGFuIGFjY2VzcyB0b2tlbiBpZiBpdCBpcyBjb250YWluZWQgaW4gdGhlIGNvbW1hbmQuIEl0J3MgY29tbW9uIHRvIHNoYXJlIGVycm9ycyB3aXRoXG4gICAgLy8gb3RoZXJzIGlmIHRoZSB0b29sIGZhaWxlZCwgYW5kIHdlIGRvIG5vdCB3YW50IHRvIGxlYWsgdG9rZW5zLlxuICAgIHByaW50Rm4oJ0V4ZWN1dGluZzogZ2l0JywgdGhpcy5zYW5pdGl6ZUNvbnNvbGVPdXRwdXQoYXJncy5qb2luKCcgJykpKTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IHNwYXduU3luYyh0aGlzLmdpdEJpblBhdGgsIGFyZ3MsIHtcbiAgICAgIGN3ZDogdGhpcy5iYXNlRGlyLFxuICAgICAgc3RkaW86ICdwaXBlJyxcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAvLyBFbmNvZGluZyBpcyBhbHdheXMgYHV0ZjhgIGFuZCBub3Qgb3ZlcnJpZGFibGUuIFRoaXMgZW5zdXJlcyB0aGF0IHRoaXMgbWV0aG9kXG4gICAgICAvLyBhbHdheXMgcmV0dXJucyBgc3RyaW5nYCBhcyBvdXRwdXQgaW5zdGVhZCBvZiBidWZmZXJzLlxuICAgICAgZW5jb2Rpbmc6ICd1dGY4JyxcbiAgICB9KTtcblxuICAgIGlmIChyZXN1bHQuc3RkZXJyICE9PSBudWxsKSB7XG4gICAgICAvLyBHaXQgc29tZXRpbWVzIHByaW50cyB0aGUgY29tbWFuZCBpZiBpdCBmYWlsZWQuIFRoaXMgbWVhbnMgdGhhdCBpdCBjb3VsZFxuICAgICAgLy8gcG90ZW50aWFsbHkgbGVhayB0aGUgR2l0aHViIHRva2VuIHVzZWQgZm9yIGFjY2Vzc2luZyB0aGUgcmVtb3RlLiBUbyBhdm9pZFxuICAgICAgLy8gcHJpbnRpbmcgYSB0b2tlbiwgd2Ugc2FuaXRpemUgdGhlIHN0cmluZyBiZWZvcmUgcHJpbnRpbmcgdGhlIHN0ZGVyciBvdXRwdXQuXG4gICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZSh0aGlzLnNhbml0aXplQ29uc29sZU91dHB1dChyZXN1bHQuc3RkZXJyKSk7XG4gICAgfVxuXG4gICAgaWYgKHJlc3VsdC5lcnJvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBHaXQgc29tZXRpbWVzIHByaW50cyB0aGUgY29tbWFuZCBpZiBpdCBmYWlsZWQuIFRoaXMgbWVhbnMgdGhhdCBpdCBjb3VsZFxuICAgICAgLy8gcG90ZW50aWFsbHkgbGVhayB0aGUgR2l0aHViIHRva2VuIHVzZWQgZm9yIGFjY2Vzc2luZyB0aGUgcmVtb3RlLiBUbyBhdm9pZFxuICAgICAgLy8gcHJpbnRpbmcgYSB0b2tlbiwgd2Ugc2FuaXRpemUgdGhlIHN0cmluZyBiZWZvcmUgcHJpbnRpbmcgdGhlIHN0ZGVyciBvdXRwdXQuXG4gICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZSh0aGlzLnNhbml0aXplQ29uc29sZU91dHB1dChyZXN1bHQuZXJyb3IubWVzc2FnZSkpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiogR2l0IFVSTCB0aGF0IHJlc29sdmVzIHRvIHRoZSBjb25maWd1cmVkIHJlcG9zaXRvcnkuICovXG4gIGdldFJlcG9HaXRVcmwoKSB7XG4gICAgcmV0dXJuIGdldFJlcG9zaXRvcnlHaXRVcmwodGhpcy5yZW1vdGVDb25maWcpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGdpdmVuIGJyYW5jaCBjb250YWlucyB0aGUgc3BlY2lmaWVkIFNIQS4gKi9cbiAgaGFzQ29tbWl0KGJyYW5jaE5hbWU6IHN0cmluZywgc2hhOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5ydW4oWydicmFuY2gnLCBicmFuY2hOYW1lLCAnLS1jb250YWlucycsIHNoYV0pLnN0ZG91dCAhPT0gJyc7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgY3VycmVudGx5IGNoZWNrZWQgb3V0IGJyYW5jaCBvciByZXZpc2lvbi4gKi9cbiAgZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTogc3RyaW5nIHtcbiAgICBjb25zdCBicmFuY2hOYW1lID0gdGhpcy5ydW4oWydyZXYtcGFyc2UnLCAnLS1hYmJyZXYtcmVmJywgJ0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgICAvLyBJZiBubyBicmFuY2ggbmFtZSBjb3VsZCBiZSByZXNvbHZlZC4gaS5lLiBgSEVBRGAgaGFzIGJlZW4gcmV0dXJuZWQsIHRoZW4gR2l0XG4gICAgLy8gaXMgY3VycmVudGx5IGluIGEgZGV0YWNoZWQgc3RhdGUuIEluIHRob3NlIGNhc2VzLCB3ZSBqdXN0IHdhbnQgdG8gcmV0dXJuIHRoZVxuICAgIC8vIGN1cnJlbnRseSBjaGVja2VkIG91dCByZXZpc2lvbi9TSEEuXG4gICAgaWYgKGJyYW5jaE5hbWUgPT09ICdIRUFEJykge1xuICAgICAgcmV0dXJuIHRoaXMucnVuKFsncmV2LXBhcnNlJywgJ0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgICB9XG4gICAgcmV0dXJuIGJyYW5jaE5hbWU7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIHRoZSBjdXJyZW50IEdpdCByZXBvc2l0b3J5IGhhcyB1bmNvbW1pdHRlZCBjaGFuZ2VzLiAqL1xuICBoYXNVbmNvbW1pdHRlZENoYW5nZXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucnVuR3JhY2VmdWwoWydkaWZmLWluZGV4JywgJy0tcXVpZXQnLCAnSEVBRCddKS5zdGF0dXMgIT09IDA7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIG91dCBhIHJlcXVlc3RlZCBicmFuY2ggb3IgcmV2aXNpb24sIG9wdGlvbmFsbHkgY2xlYW5pbmcgdGhlIHN0YXRlIG9mIHRoZSByZXBvc2l0b3J5XG4gICAqIGJlZm9yZSBhdHRlbXB0aW5nIHRoZSBjaGVja2luZy4gUmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBicmFuY2ggb3IgcmV2aXNpb25cbiAgICogd2FzIGNsZWFubHkgY2hlY2tlZCBvdXQuXG4gICAqL1xuICBjaGVja291dChicmFuY2hPclJldmlzaW9uOiBzdHJpbmcsIGNsZWFuU3RhdGU6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICBpZiAoY2xlYW5TdGF0ZSkge1xuICAgICAgLy8gQWJvcnQgYW55IG91dHN0YW5kaW5nIGFtcy5cbiAgICAgIHRoaXMucnVuR3JhY2VmdWwoWydhbScsICctLWFib3J0J10sIHtzdGRpbzogJ2lnbm9yZSd9KTtcbiAgICAgIC8vIEFib3J0IGFueSBvdXRzdGFuZGluZyBjaGVycnktcGlja3MuXG4gICAgICB0aGlzLnJ1bkdyYWNlZnVsKFsnY2hlcnJ5LXBpY2snLCAnLS1hYm9ydCddLCB7c3RkaW86ICdpZ25vcmUnfSk7XG4gICAgICAvLyBBYm9ydCBhbnkgb3V0c3RhbmRpbmcgcmViYXNlcy5cbiAgICAgIHRoaXMucnVuR3JhY2VmdWwoWydyZWJhc2UnLCAnLS1hYm9ydCddLCB7c3RkaW86ICdpZ25vcmUnfSk7XG4gICAgICAvLyBDbGVhciBhbnkgY2hhbmdlcyBpbiB0aGUgY3VycmVudCByZXBvLlxuICAgICAgdGhpcy5ydW5HcmFjZWZ1bChbJ3Jlc2V0JywgJy0taGFyZCddLCB7c3RkaW86ICdpZ25vcmUnfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJ1bkdyYWNlZnVsKFsnY2hlY2tvdXQnLCBicmFuY2hPclJldmlzaW9uXSwge3N0ZGlvOiAnaWdub3JlJ30pLnN0YXR1cyA9PT0gMDtcbiAgfVxuXG4gIC8qKiBSZXRyaWV2ZSBhIGxpc3Qgb2YgYWxsIGZpbGVzIGluIHRoZSByZXBvc2l0b3J5IGNoYW5nZWQgc2luY2UgdGhlIHByb3ZpZGVkIHNoYU9yUmVmLiAqL1xuICBhbGxDaGFuZ2VzRmlsZXNTaW5jZShzaGFPclJlZiA9ICdIRUFEJyk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShcbiAgICAgIG5ldyBTZXQoW1xuICAgICAgICAuLi5naXRPdXRwdXRBc0FycmF5KHRoaXMucnVuR3JhY2VmdWwoWydkaWZmJywgJy0tbmFtZS1vbmx5JywgJy0tZGlmZi1maWx0ZXI9ZCcsIHNoYU9yUmVmXSkpLFxuICAgICAgICAuLi5naXRPdXRwdXRBc0FycmF5KHRoaXMucnVuR3JhY2VmdWwoWydscy1maWxlcycsICctLW90aGVycycsICctLWV4Y2x1ZGUtc3RhbmRhcmQnXSkpLFxuICAgICAgXSksXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBSZXRyaWV2ZSBhIGxpc3Qgb2YgYWxsIGZpbGVzIGN1cnJlbnRseSBzdGFnZWQgaW4gdGhlIHJlcG9zdGl0b3J5LiAqL1xuICBhbGxTdGFnZWRGaWxlcygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIGdpdE91dHB1dEFzQXJyYXkoXG4gICAgICB0aGlzLnJ1bkdyYWNlZnVsKFsnZGlmZicsICctLW5hbWUtb25seScsICctLWRpZmYtZmlsdGVyPUFDTScsICctLXN0YWdlZCddKSxcbiAgICApO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIGEgbGlzdCBvZiBhbGwgZmlsZXMgdHJhY2tlZCBpbiB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgYWxsRmlsZXMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBnaXRPdXRwdXRBc0FycmF5KHRoaXMucnVuR3JhY2VmdWwoWydscy1maWxlcyddKSk7XG4gIH1cblxuICAvKipcbiAgICogU2FuaXRpemVzIHRoZSBnaXZlbiBjb25zb2xlIG1lc3NhZ2UuIFRoaXMgbWV0aG9kIGNhbiBiZSBvdmVycmlkZGVuIGJ5XG4gICAqIGRlcml2ZWQgY2xhc3Nlcy4gZS5nLiB0byBzYW5pdGl6ZSBhY2Nlc3MgdG9rZW5zIGZyb20gR2l0IGNvbW1hbmRzLlxuICAgKi9cbiAgc2FuaXRpemVDb25zb2xlT3V0cHV0KHZhbHVlOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICAvKiogV2hldGhlciB2ZXJib3NlIGxvZ2dpbmcgb2YgR2l0IGFjdGlvbnMgc2hvdWxkIGJlIHVzZWQuICovXG4gIHByaXZhdGUgc3RhdGljIHZlcmJvc2VMb2dnaW5nID0gZmFsc2U7XG5cbiAgLyoqIFRoZSBzaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIHVuYXV0aGVudGljYXRlZCBgR2l0Q2xpZW50YC4gKi9cbiAgcHJpdmF0ZSBzdGF0aWMgX3VuYXV0aGVudGljYXRlZEluc3RhbmNlOiBHaXRDbGllbnQ7XG5cbiAgLyoqIFNldCB0aGUgdmVyYm9zZSBsb2dnaW5nIHN0YXRlIG9mIGFsbCBnaXQgY2xpZW50IGluc3RhbmNlcy4gKi9cbiAgc3RhdGljIHNldFZlcmJvc2VMb2dnaW5nU3RhdGUodmVyYm9zZTogYm9vbGVhbikge1xuICAgIEdpdENsaWVudC52ZXJib3NlTG9nZ2luZyA9IHZlcmJvc2U7XG4gIH1cblxuICAvKipcbiAgICogU3RhdGljIG1ldGhvZCB0byBnZXQgdGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgYEdpdENsaWVudGAsIGNyZWF0aW5nIGl0XG4gICAqIGlmIGl0IGhhcyBub3QgeWV0IGJlZW4gY3JlYXRlZC5cbiAgICovXG4gIHN0YXRpYyBnZXQoKTogR2l0Q2xpZW50IHtcbiAgICBpZiAoIXRoaXMuX3VuYXV0aGVudGljYXRlZEluc3RhbmNlKSB7XG4gICAgICBHaXRDbGllbnQuX3VuYXV0aGVudGljYXRlZEluc3RhbmNlID0gbmV3IEdpdENsaWVudCgpO1xuICAgIH1cbiAgICByZXR1cm4gR2l0Q2xpZW50Ll91bmF1dGhlbnRpY2F0ZWRJbnN0YW5jZTtcbiAgfVxufVxuXG4vKipcbiAqIFRha2VzIHRoZSBvdXRwdXQgZnJvbSBgcnVuYCBhbmQgYHJ1bkdyYWNlZnVsYCBhbmQgcmV0dXJucyBhbiBhcnJheSBvZiBzdHJpbmdzIGZvciBlYWNoXG4gKiBuZXcgbGluZS4gR2l0IGNvbW1hbmRzIHR5cGljYWxseSByZXR1cm4gbXVsdGlwbGUgb3V0cHV0IHZhbHVlcyBmb3IgYSBjb21tYW5kIGEgc2V0IG9mXG4gKiBzdHJpbmdzIHNlcGFyYXRlZCBieSBuZXcgbGluZXMuXG4gKlxuICogTm90ZTogVGhpcyBpcyBzcGVjaWZpY2FsbHkgY3JlYXRlZCBhcyBhIGxvY2FsbHkgYXZhaWxhYmxlIGZ1bmN0aW9uIGZvciB1c2FnZSBhcyBjb252ZW5pZW5jZVxuICogdXRpbGl0eSB3aXRoaW4gYEdpdENsaWVudGAncyBtZXRob2RzIHRvIGNyZWF0ZSBvdXRwdXRzIGFzIGFycmF5LlxuICovXG5mdW5jdGlvbiBnaXRPdXRwdXRBc0FycmF5KGdpdENvbW1hbmRSZXN1bHQ6IFNwYXduU3luY1JldHVybnM8c3RyaW5nPik6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIGdpdENvbW1hbmRSZXN1bHQuc3Rkb3V0XG4gICAgLnNwbGl0KCdcXG4nKVxuICAgIC5tYXAoKHgpID0+IHgudHJpbSgpKVxuICAgIC5maWx0ZXIoKHgpID0+ICEheCk7XG59XG5cbi8qKiBEZXRlcm1pbmVzIHRoZSByZXBvc2l0b3J5IGJhc2UgZGlyZWN0b3J5IGZyb20gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuICovXG5mdW5jdGlvbiBkZXRlcm1pbmVSZXBvQmFzZURpckZyb21Dd2QoKSB7XG4gIC8vIFRPRE8oZGV2dmVyc2lvbik6IFJlcGxhY2Ugd2l0aCBjb21tb24gc3Bhd24gc3luYyB1dGlsaXR5IG9uY2UgYXZhaWxhYmxlLlxuICBjb25zdCB7c3Rkb3V0LCBzdGRlcnIsIHN0YXR1c30gPSBzcGF3blN5bmMoJ2dpdCcsIFsncmV2LXBhcnNlIC0tc2hvdy10b3BsZXZlbCddLCB7XG4gICAgc2hlbGw6IHRydWUsXG4gICAgc3RkaW86ICdwaXBlJyxcbiAgICBlbmNvZGluZzogJ3V0ZjgnLFxuICB9KTtcbiAgaWYgKHN0YXR1cyAhPT0gMCkge1xuICAgIHRocm93IEVycm9yKFxuICAgICAgYFVuYWJsZSB0byBmaW5kIHRoZSBwYXRoIHRvIHRoZSBiYXNlIGRpcmVjdG9yeSBvZiB0aGUgcmVwb3NpdG9yeS5cXG5gICtcbiAgICAgICAgYFdhcyB0aGUgY29tbWFuZCBydW4gZnJvbSBpbnNpZGUgb2YgdGhlIHJlcG8/XFxuXFxuYCArXG4gICAgICAgIGAke3N0ZGVycn1gLFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHN0ZG91dC50cmltKCk7XG59XG4iXX0=