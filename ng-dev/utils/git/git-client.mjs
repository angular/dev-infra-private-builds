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
    config = config_1.getConfig(baseDir)) {
        this.baseDir = baseDir;
        this.config = config;
        /** Short-hand for accessing the default remote configuration. */
        this.remoteConfig = this.config.github;
        /** Octokit request parameters object for targeting the configured remote. */
        this.remoteParams = { owner: this.remoteConfig.owner, repo: this.remoteConfig.name };
        /** Name of the primary branch of the upstream remote. */
        this.mainBranchName = this.config.github.mainBranchName;
        /** Instance of the Github client. */
        this.github = new github_1.GithubClient();
        /**
         * Path to the Git executable. By default, `git` is assumed to exist
         * in the shell environment (using `$PATH`).
         */
        this.gitBinPath = 'git';
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
        if (dry_run_1.isDryRun() && gitCommand === 'push') {
            console_1.debug(`"git push" is not able to be run in dryRun mode.`);
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
        const result = child_process_1.spawnSync(this.gitBinPath, args, {
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
        return github_urls_1.getRepositoryGitUrl(this.remoteConfig);
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
    const { stdout, stderr, status } = child_process_1.spawnSync('git', ['rev-parse --show-toplevel'], {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0LWNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi91dGlscy9naXQvZ2l0LWNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCxpREFBNEU7QUFHNUUsc0NBQStEO0FBQy9ELHdDQUF1QztBQUN2Qyx3Q0FBaUQ7QUFFakQscUNBQXNDO0FBQ3RDLCtDQUFrRDtBQUVsRCxxQ0FBcUM7QUFDckMsTUFBYSxlQUFnQixTQUFRLEtBQUs7SUFDeEMsWUFBWSxNQUFpQixFQUFTLElBQWM7UUFDbEQsa0VBQWtFO1FBQ2xFLHNFQUFzRTtRQUN0RSxrRUFBa0U7UUFDbEUsS0FBSyxDQUFDLHVCQUF1QixNQUFNLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUp6QyxTQUFJLEdBQUosSUFBSSxDQUFVO1FBTWxELHlGQUF5RjtRQUN6RixpQ0FBaUM7UUFDakMsaUhBQWlIO1FBQ2pILE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN6RCxDQUFDO0NBQ0Y7QUFaRCwwQ0FZQztBQU9ELCtFQUErRTtBQUMvRSxNQUFhLFNBQVM7SUFtQnBCO0lBQ0Usd0RBQXdEO0lBQy9DLFVBQVUsMkJBQTJCLEVBQUU7SUFDaEQsdUVBQXVFO0lBQzlELFNBQVMsa0JBQVMsQ0FBQyxPQUFPLENBQUM7UUFGM0IsWUFBTyxHQUFQLE9BQU8sQ0FBZ0M7UUFFdkMsV0FBTSxHQUFOLE1BQU0sQ0FBcUI7UUF0QnRDLGlFQUFpRTtRQUN4RCxpQkFBWSxHQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUV6RCw2RUFBNkU7UUFDcEUsaUJBQVksR0FBRyxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxJQUFJLEVB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aHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtzcGF3blN5bmMsIFNwYXduU3luY09wdGlvbnMsIFNwYXduU3luY1JldHVybnN9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHtPcHRpb25zIGFzIFNlbVZlck9wdGlvbnMsIHBhcnNlLCBTZW1WZXJ9IGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7Z2V0Q29uZmlnLCBHaXRodWJDb25maWcsIE5nRGV2Q29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHtkZWJ1ZywgaW5mb30gZnJvbSAnLi4vY29uc29sZSc7XG5pbXBvcnQge0RyeVJ1bkVycm9yLCBpc0RyeVJ1bn0gZnJvbSAnLi4vZHJ5LXJ1bic7XG5cbmltcG9ydCB7R2l0aHViQ2xpZW50fSBmcm9tICcuL2dpdGh1Yic7XG5pbXBvcnQge2dldFJlcG9zaXRvcnlHaXRVcmx9IGZyb20gJy4vZ2l0aHViLXVybHMnO1xuXG4vKiogRXJyb3IgZm9yIGZhaWxlZCBHaXQgY29tbWFuZHMuICovXG5leHBvcnQgY2xhc3MgR2l0Q29tbWFuZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihjbGllbnQ6IEdpdENsaWVudCwgcHVibGljIGFyZ3M6IHN0cmluZ1tdKSB7XG4gICAgLy8gRXJyb3JzIGFyZSBub3QgZ3VhcmFudGVlZCB0byBiZSBjYXVnaHQuIFRvIGVuc3VyZSB0aGF0IHdlIGRvbid0XG4gICAgLy8gYWNjaWRlbnRhbGx5IGxlYWsgdGhlIEdpdGh1YiB0b2tlbiB0aGF0IG1pZ2h0IGJlIHVzZWQgaW4gYSBjb21tYW5kLFxuICAgIC8vIHdlIHNhbml0aXplIHRoZSBjb21tYW5kIHRoYXQgd2lsbCBiZSBwYXJ0IG9mIHRoZSBlcnJvciBtZXNzYWdlLlxuICAgIHN1cGVyKGBDb21tYW5kIGZhaWxlZDogZ2l0ICR7Y2xpZW50LnNhbml0aXplQ29uc29sZU91dHB1dChhcmdzLmpvaW4oJyAnKSl9YCk7XG5cbiAgICAvLyBTZXQgdGhlIHByb3RvdHlwZSBleHBsaWNpdGx5IGJlY2F1c2UgaW4gRVM1LCB0aGUgcHJvdG90eXBlIGlzIGFjY2lkZW50YWxseSBsb3N0IGR1ZSB0b1xuICAgIC8vIGEgbGltaXRhdGlvbiBpbiBkb3duLWxldmVsaW5nLlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC93aWtpL0ZBUSN3aHktZG9lc250LWV4dGVuZGluZy1idWlsdC1pbnMtbGlrZS1lcnJvci1hcnJheS1hbmQtbWFwLXdvcmsuXG4gICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIEdpdENvbW1hbmRFcnJvci5wcm90b3R5cGUpO1xuICB9XG59XG5cbi8qKiBUaGUgb3B0aW9ucyBhdmFpbGFibGUgZm9yIHRoZSBgR2l0Q2xpZW50YGBydW5gIGFuZCBgcnVuR3JhY2VmdWxgIG1ldGhvZHMuICovXG50eXBlIEdpdENvbW1hbmRSdW5PcHRpb25zID0gU3Bhd25TeW5jT3B0aW9ucyAmIHtcbiAgdmVyYm9zZUxvZ2dpbmc/OiBib29sZWFuO1xufTtcblxuLyoqIENsYXNzIHRoYXQgY2FuIGJlIHVzZWQgdG8gcGVyZm9ybSBHaXQgaW50ZXJhY3Rpb25zIHdpdGggYSBnaXZlbiByZW1vdGUuICoqL1xuZXhwb3J0IGNsYXNzIEdpdENsaWVudCB7XG4gIC8qKiBTaG9ydC1oYW5kIGZvciBhY2Nlc3NpbmcgdGhlIGRlZmF1bHQgcmVtb3RlIGNvbmZpZ3VyYXRpb24uICovXG4gIHJlYWRvbmx5IHJlbW90ZUNvbmZpZzogR2l0aHViQ29uZmlnID0gdGhpcy5jb25maWcuZ2l0aHViO1xuXG4gIC8qKiBPY3Rva2l0IHJlcXVlc3QgcGFyYW1ldGVycyBvYmplY3QgZm9yIHRhcmdldGluZyB0aGUgY29uZmlndXJlZCByZW1vdGUuICovXG4gIHJlYWRvbmx5IHJlbW90ZVBhcmFtcyA9IHtvd25lcjogdGhpcy5yZW1vdGVDb25maWcub3duZXIsIHJlcG86IHRoaXMucmVtb3RlQ29uZmlnLm5hbWV9O1xuXG4gIC8qKiBOYW1lIG9mIHRoZSBwcmltYXJ5IGJyYW5jaCBvZiB0aGUgdXBzdHJlYW0gcmVtb3RlLiAqL1xuICByZWFkb25seSBtYWluQnJhbmNoTmFtZSA9IHRoaXMuY29uZmlnLmdpdGh1Yi5tYWluQnJhbmNoTmFtZTtcblxuICAvKiogSW5zdGFuY2Ugb2YgdGhlIEdpdGh1YiBjbGllbnQuICovXG4gIHJlYWRvbmx5IGdpdGh1YiA9IG5ldyBHaXRodWJDbGllbnQoKTtcblxuICAvKipcbiAgICogUGF0aCB0byB0aGUgR2l0IGV4ZWN1dGFibGUuIEJ5IGRlZmF1bHQsIGBnaXRgIGlzIGFzc3VtZWQgdG8gZXhpc3RcbiAgICogaW4gdGhlIHNoZWxsIGVudmlyb25tZW50ICh1c2luZyBgJFBBVEhgKS5cbiAgICovXG4gIHJlYWRvbmx5IGdpdEJpblBhdGg6IHN0cmluZyA9ICdnaXQnO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBUaGUgZnVsbCBwYXRoIHRvIHRoZSByb290IG9mIHRoZSByZXBvc2l0b3J5IGJhc2UuICovXG4gICAgcmVhZG9ubHkgYmFzZURpciA9IGRldGVybWluZVJlcG9CYXNlRGlyRnJvbUN3ZCgpLFxuICAgIC8qKiBUaGUgY29uZmlndXJhdGlvbiwgY29udGFpbmluZyB0aGUgZ2l0aHViIHNwZWNpZmljIGNvbmZpZ3VyYXRpb24uICovXG4gICAgcmVhZG9ubHkgY29uZmlnID0gZ2V0Q29uZmlnKGJhc2VEaXIpLFxuICApIHt9XG5cbiAgLyoqIEV4ZWN1dGVzIHRoZSBnaXZlbiBnaXQgY29tbWFuZC4gVGhyb3dzIGlmIHRoZSBjb21tYW5kIGZhaWxzLiAqL1xuICBydW4oYXJnczogc3RyaW5nW10sIG9wdGlvbnM/OiBHaXRDb21tYW5kUnVuT3B0aW9ucyk6IE9taXQ8U3Bhd25TeW5jUmV0dXJuczxzdHJpbmc+LCAnc3RhdHVzJz4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMucnVuR3JhY2VmdWwoYXJncywgb3B0aW9ucyk7XG4gICAgaWYgKHJlc3VsdC5zdGF0dXMgIT09IDApIHtcbiAgICAgIHRocm93IG5ldyBHaXRDb21tYW5kRXJyb3IodGhpcywgYXJncyk7XG4gICAgfVxuICAgIC8vIE9taXQgYHN0YXR1c2AgZnJvbSB0aGUgdHlwZSBzbyB0aGF0IGl0J3Mgb2J2aW91cyB0aGF0IHRoZSBzdGF0dXMgaXMgbmV2ZXJcbiAgICAvLyBub24temVybyBhcyBleHBsYWluZWQgaW4gdGhlIG1ldGhvZCBkZXNjcmlwdGlvbi5cbiAgICByZXR1cm4gcmVzdWx0IGFzIE9taXQ8U3Bhd25TeW5jUmV0dXJuczxzdHJpbmc+LCAnc3RhdHVzJz47XG4gIH1cblxuICAvKipcbiAgICogU3Bhd25zIGEgZ2l2ZW4gR2l0IGNvbW1hbmQgcHJvY2Vzcy4gRG9lcyBub3QgdGhyb3cgaWYgdGhlIGNvbW1hbmQgZmFpbHMuIEFkZGl0aW9uYWxseSxcbiAgICogaWYgdGhlcmUgaXMgYW55IHN0ZGVyciBvdXRwdXQsIHRoZSBvdXRwdXQgd2lsbCBiZSBwcmludGVkLiBUaGlzIG1ha2VzIGl0IGVhc2llciB0b1xuICAgKiBpbmZvIGZhaWxlZCBjb21tYW5kcy5cbiAgICovXG4gIHJ1bkdyYWNlZnVsKGFyZ3M6IHN0cmluZ1tdLCBvcHRpb25zOiBHaXRDb21tYW5kUnVuT3B0aW9ucyA9IHt9KTogU3Bhd25TeW5jUmV0dXJuczxzdHJpbmc+IHtcbiAgICAvKiogVGhlIGdpdCBjb21tYW5kIHRvIGJlIHJ1bi4gKi9cbiAgICBjb25zdCBnaXRDb21tYW5kID0gYXJnc1swXTtcblxuICAgIGlmIChpc0RyeVJ1bigpICYmIGdpdENvbW1hbmQgPT09ICdwdXNoJykge1xuICAgICAgZGVidWcoYFwiZ2l0IHB1c2hcIiBpcyBub3QgYWJsZSB0byBiZSBydW4gaW4gZHJ5UnVuIG1vZGUuYCk7XG4gICAgICB0aHJvdyBuZXcgRHJ5UnVuRXJyb3IoKTtcbiAgICB9XG5cbiAgICAvLyBUbyBpbXByb3ZlIHRoZSBkZWJ1Z2dpbmcgZXhwZXJpZW5jZSBpbiBjYXNlIHNvbWV0aGluZyBmYWlscywgd2UgcHJpbnQgYWxsIGV4ZWN1dGVkIEdpdFxuICAgIC8vIGNvbW1hbmRzIGF0IHRoZSBERUJVRyBsZXZlbCB0byBiZXR0ZXIgdW5kZXJzdGFuZCB0aGUgZ2l0IGFjdGlvbnMgb2NjdXJyaW5nLiBWZXJib3NlIGxvZ2dpbmcsXG4gICAgLy8gYWx3YXlzIGxvZ2dpbmcgYXQgdGhlIElORk8gbGV2ZWwsIGNhbiBiZSBlbmFibGVkIGVpdGhlciBieSBzZXR0aW5nIHRoZSB2ZXJib3NlTG9nZ2luZ1xuICAgIC8vIHByb3BlcnR5IG9uIHRoZSBHaXRDbGllbnQgY2xhc3Mgb3IgdGhlIG9wdGlvbnMgb2JqZWN0IHByb3ZpZGVkIHRvIHRoZSBtZXRob2QuXG4gICAgY29uc3QgcHJpbnRGbiA9IEdpdENsaWVudC52ZXJib3NlTG9nZ2luZyB8fCBvcHRpb25zLnZlcmJvc2VMb2dnaW5nID8gaW5mbyA6IGRlYnVnO1xuICAgIC8vIE5vdGUgdGhhdCB3ZSBzYW5pdGl6ZSB0aGUgY29tbWFuZCBiZWZvcmUgcHJpbnRpbmcgaXQgdG8gdGhlIGNvbnNvbGUuIFdlIGRvIG5vdCB3YW50IHRvXG4gICAgLy8gcHJpbnQgYW4gYWNjZXNzIHRva2VuIGlmIGl0IGlzIGNvbnRhaW5lZCBpbiB0aGUgY29tbWFuZC4gSXQncyBjb21tb24gdG8gc2hhcmUgZXJyb3JzIHdpdGhcbiAgICAvLyBvdGhlcnMgaWYgdGhlIHRvb2wgZmFpbGVkLCBhbmQgd2UgZG8gbm90IHdhbnQgdG8gbGVhayB0b2tlbnMuXG4gICAgcHJpbnRGbignRXhlY3V0aW5nOiBnaXQnLCB0aGlzLnNhbml0aXplQ29uc29sZU91dHB1dChhcmdzLmpvaW4oJyAnKSkpO1xuXG4gICAgY29uc3QgcmVzdWx0ID0gc3Bhd25TeW5jKHRoaXMuZ2l0QmluUGF0aCwgYXJncywge1xuICAgICAgY3dkOiB0aGlzLmJhc2VEaXIsXG4gICAgICBzdGRpbzogJ3BpcGUnLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIC8vIEVuY29kaW5nIGlzIGFsd2F5cyBgdXRmOGAgYW5kIG5vdCBvdmVycmlkYWJsZS4gVGhpcyBlbnN1cmVzIHRoYXQgdGhpcyBtZXRob2RcbiAgICAgIC8vIGFsd2F5cyByZXR1cm5zIGBzdHJpbmdgIGFzIG91dHB1dCBpbnN0ZWFkIG9mIGJ1ZmZlcnMuXG4gICAgICBlbmNvZGluZzogJ3V0ZjgnLFxuICAgIH0pO1xuXG4gICAgaWYgKHJlc3VsdC5zdGRlcnIgIT09IG51bGwpIHtcbiAgICAgIC8vIEdpdCBzb21ldGltZXMgcHJpbnRzIHRoZSBjb21tYW5kIGlmIGl0IGZhaWxlZC4gVGhpcyBtZWFucyB0aGF0IGl0IGNvdWxkXG4gICAgICAvLyBwb3RlbnRpYWxseSBsZWFrIHRoZSBHaXRodWIgdG9rZW4gdXNlZCBmb3IgYWNjZXNzaW5nIHRoZSByZW1vdGUuIFRvIGF2b2lkXG4gICAgICAvLyBwcmludGluZyBhIHRva2VuLCB3ZSBzYW5pdGl6ZSB0aGUgc3RyaW5nIGJlZm9yZSBwcmludGluZyB0aGUgc3RkZXJyIG91dHB1dC5cbiAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlKHRoaXMuc2FuaXRpemVDb25zb2xlT3V0cHV0KHJlc3VsdC5zdGRlcnIpKTtcbiAgICB9XG5cbiAgICBpZiAocmVzdWx0LmVycm9yICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIEdpdCBzb21ldGltZXMgcHJpbnRzIHRoZSBjb21tYW5kIGlmIGl0IGZhaWxlZC4gVGhpcyBtZWFucyB0aGF0IGl0IGNvdWxkXG4gICAgICAvLyBwb3RlbnRpYWxseSBsZWFrIHRoZSBHaXRodWIgdG9rZW4gdXNlZCBmb3IgYWNjZXNzaW5nIHRoZSByZW1vdGUuIFRvIGF2b2lkXG4gICAgICAvLyBwcmludGluZyBhIHRva2VuLCB3ZSBzYW5pdGl6ZSB0aGUgc3RyaW5nIGJlZm9yZSBwcmludGluZyB0aGUgc3RkZXJyIG91dHB1dC5cbiAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlKHRoaXMuc2FuaXRpemVDb25zb2xlT3V0cHV0KHJlc3VsdC5lcnJvci5tZXNzYWdlKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKiBHaXQgVVJMIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIGNvbmZpZ3VyZWQgcmVwb3NpdG9yeS4gKi9cbiAgZ2V0UmVwb0dpdFVybCgpIHtcbiAgICByZXR1cm4gZ2V0UmVwb3NpdG9yeUdpdFVybCh0aGlzLnJlbW90ZUNvbmZpZyk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgZ2l2ZW4gYnJhbmNoIGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgU0hBLiAqL1xuICBoYXNDb21taXQoYnJhbmNoTmFtZTogc3RyaW5nLCBzaGE6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJ1bihbJ2JyYW5jaCcsIGJyYW5jaE5hbWUsICctLWNvbnRhaW5zJywgc2hhXSkuc3Rkb3V0ICE9PSAnJztcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBjdXJyZW50bHkgY2hlY2tlZCBvdXQgYnJhbmNoIG9yIHJldmlzaW9uLiAqL1xuICBnZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpOiBzdHJpbmcge1xuICAgIGNvbnN0IGJyYW5jaE5hbWUgPSB0aGlzLnJ1bihbJ3Jldi1wYXJzZScsICctLWFiYnJldi1yZWYnLCAnSEVBRCddKS5zdGRvdXQudHJpbSgpO1xuICAgIC8vIElmIG5vIGJyYW5jaCBuYW1lIGNvdWxkIGJlIHJlc29sdmVkLiBpLmUuIGBIRUFEYCBoYXMgYmVlbiByZXR1cm5lZCwgdGhlbiBHaXRcbiAgICAvLyBpcyBjdXJyZW50bHkgaW4gYSBkZXRhY2hlZCBzdGF0ZS4gSW4gdGhvc2UgY2FzZXMsIHdlIGp1c3Qgd2FudCB0byByZXR1cm4gdGhlXG4gICAgLy8gY3VycmVudGx5IGNoZWNrZWQgb3V0IHJldmlzaW9uL1NIQS5cbiAgICBpZiAoYnJhbmNoTmFtZSA9PT0gJ0hFQUQnKSB7XG4gICAgICByZXR1cm4gdGhpcy5ydW4oWydyZXYtcGFyc2UnLCAnSEVBRCddKS5zdGRvdXQudHJpbSgpO1xuICAgIH1cbiAgICByZXR1cm4gYnJhbmNoTmFtZTtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgdGhlIGN1cnJlbnQgR2l0IHJlcG9zaXRvcnkgaGFzIHVuY29tbWl0dGVkIGNoYW5nZXMuICovXG4gIGhhc1VuY29tbWl0dGVkQ2hhbmdlcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5ydW5HcmFjZWZ1bChbJ2RpZmYtaW5kZXgnLCAnLS1xdWlldCcsICdIRUFEJ10pLnN0YXR1cyAhPT0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgb3V0IGEgcmVxdWVzdGVkIGJyYW5jaCBvciByZXZpc2lvbiwgb3B0aW9uYWxseSBjbGVhbmluZyB0aGUgc3RhdGUgb2YgdGhlIHJlcG9zaXRvcnlcbiAgICogYmVmb3JlIGF0dGVtcHRpbmcgdGhlIGNoZWNraW5nLiBSZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIGJyYW5jaCBvciByZXZpc2lvblxuICAgKiB3YXMgY2xlYW5seSBjaGVja2VkIG91dC5cbiAgICovXG4gIGNoZWNrb3V0KGJyYW5jaE9yUmV2aXNpb246IHN0cmluZywgY2xlYW5TdGF0ZTogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgIGlmIChjbGVhblN0YXRlKSB7XG4gICAgICAvLyBBYm9ydCBhbnkgb3V0c3RhbmRpbmcgYW1zLlxuICAgICAgdGhpcy5ydW5HcmFjZWZ1bChbJ2FtJywgJy0tYWJvcnQnXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuICAgICAgLy8gQWJvcnQgYW55IG91dHN0YW5kaW5nIGNoZXJyeS1waWNrcy5cbiAgICAgIHRoaXMucnVuR3JhY2VmdWwoWydjaGVycnktcGljaycsICctLWFib3J0J10sIHtzdGRpbzogJ2lnbm9yZSd9KTtcbiAgICAgIC8vIEFib3J0IGFueSBvdXRzdGFuZGluZyByZWJhc2VzLlxuICAgICAgdGhpcy5ydW5HcmFjZWZ1bChbJ3JlYmFzZScsICctLWFib3J0J10sIHtzdGRpbzogJ2lnbm9yZSd9KTtcbiAgICAgIC8vIENsZWFyIGFueSBjaGFuZ2VzIGluIHRoZSBjdXJyZW50IHJlcG8uXG4gICAgICB0aGlzLnJ1bkdyYWNlZnVsKFsncmVzZXQnLCAnLS1oYXJkJ10sIHtzdGRpbzogJ2lnbm9yZSd9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucnVuR3JhY2VmdWwoWydjaGVja291dCcsIGJyYW5jaE9yUmV2aXNpb25dLCB7c3RkaW86ICdpZ25vcmUnfSkuc3RhdHVzID09PSAwO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIGEgbGlzdCBvZiBhbGwgZmlsZXMgaW4gdGhlIHJlcG9zaXRvcnkgY2hhbmdlZCBzaW5jZSB0aGUgcHJvdmlkZWQgc2hhT3JSZWYuICovXG4gIGFsbENoYW5nZXNGaWxlc1NpbmNlKHNoYU9yUmVmID0gJ0hFQUQnKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKFxuICAgICAgbmV3IFNldChbXG4gICAgICAgIC4uLmdpdE91dHB1dEFzQXJyYXkodGhpcy5ydW5HcmFjZWZ1bChbJ2RpZmYnLCAnLS1uYW1lLW9ubHknLCAnLS1kaWZmLWZpbHRlcj1kJywgc2hhT3JSZWZdKSksXG4gICAgICAgIC4uLmdpdE91dHB1dEFzQXJyYXkodGhpcy5ydW5HcmFjZWZ1bChbJ2xzLWZpbGVzJywgJy0tb3RoZXJzJywgJy0tZXhjbHVkZS1zdGFuZGFyZCddKSksXG4gICAgICBdKSxcbiAgICApO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIGEgbGlzdCBvZiBhbGwgZmlsZXMgY3VycmVudGx5IHN0YWdlZCBpbiB0aGUgcmVwb3N0aXRvcnkuICovXG4gIGFsbFN0YWdlZEZpbGVzKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gZ2l0T3V0cHV0QXNBcnJheShcbiAgICAgIHRoaXMucnVuR3JhY2VmdWwoWydkaWZmJywgJy0tbmFtZS1vbmx5JywgJy0tZGlmZi1maWx0ZXI9QUNNJywgJy0tc3RhZ2VkJ10pLFxuICAgICk7XG4gIH1cblxuICAvKiogUmV0cmlldmUgYSBsaXN0IG9mIGFsbCBmaWxlcyB0cmFja2VkIGluIHRoZSByZXBvc2l0b3J5LiAqL1xuICBhbGxGaWxlcygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIGdpdE91dHB1dEFzQXJyYXkodGhpcy5ydW5HcmFjZWZ1bChbJ2xzLWZpbGVzJ10pKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTYW5pdGl6ZXMgdGhlIGdpdmVuIGNvbnNvbGUgbWVzc2FnZS4gVGhpcyBtZXRob2QgY2FuIGJlIG92ZXJyaWRkZW4gYnlcbiAgICogZGVyaXZlZCBjbGFzc2VzLiBlLmcuIHRvIHNhbml0aXplIGFjY2VzcyB0b2tlbnMgZnJvbSBHaXQgY29tbWFuZHMuXG4gICAqL1xuICBzYW5pdGl6ZUNvbnNvbGVPdXRwdXQodmFsdWU6IHN0cmluZykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHZlcmJvc2UgbG9nZ2luZyBvZiBHaXQgYWN0aW9ucyBzaG91bGQgYmUgdXNlZC4gKi9cbiAgcHJpdmF0ZSBzdGF0aWMgdmVyYm9zZUxvZ2dpbmcgPSBmYWxzZTtcblxuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgdW5hdXRoZW50aWNhdGVkIGBHaXRDbGllbnRgLiAqL1xuICBwcml2YXRlIHN0YXRpYyBfdW5hdXRoZW50aWNhdGVkSW5zdGFuY2U6IEdpdENsaWVudDtcblxuICAvKiogU2V0IHRoZSB2ZXJib3NlIGxvZ2dpbmcgc3RhdGUgb2YgYWxsIGdpdCBjbGllbnQgaW5zdGFuY2VzLiAqL1xuICBzdGF0aWMgc2V0VmVyYm9zZUxvZ2dpbmdTdGF0ZSh2ZXJib3NlOiBib29sZWFuKSB7XG4gICAgR2l0Q2xpZW50LnZlcmJvc2VMb2dnaW5nID0gdmVyYm9zZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGF0aWMgbWV0aG9kIHRvIGdldCB0aGUgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSBgR2l0Q2xpZW50YCwgY3JlYXRpbmcgaXRcbiAgICogaWYgaXQgaGFzIG5vdCB5ZXQgYmVlbiBjcmVhdGVkLlxuICAgKi9cbiAgc3RhdGljIGdldCgpOiBHaXRDbGllbnQge1xuICAgIGlmICghdGhpcy5fdW5hdXRoZW50aWNhdGVkSW5zdGFuY2UpIHtcbiAgICAgIEdpdENsaWVudC5fdW5hdXRoZW50aWNhdGVkSW5zdGFuY2UgPSBuZXcgR2l0Q2xpZW50KCk7XG4gICAgfVxuICAgIHJldHVybiBHaXRDbGllbnQuX3VuYXV0aGVudGljYXRlZEluc3RhbmNlO1xuICB9XG59XG5cbi8qKlxuICogVGFrZXMgdGhlIG91dHB1dCBmcm9tIGBydW5gIGFuZCBgcnVuR3JhY2VmdWxgIGFuZCByZXR1cm5zIGFuIGFycmF5IG9mIHN0cmluZ3MgZm9yIGVhY2hcbiAqIG5ldyBsaW5lLiBHaXQgY29tbWFuZHMgdHlwaWNhbGx5IHJldHVybiBtdWx0aXBsZSBvdXRwdXQgdmFsdWVzIGZvciBhIGNvbW1hbmQgYSBzZXQgb2ZcbiAqIHN0cmluZ3Mgc2VwYXJhdGVkIGJ5IG5ldyBsaW5lcy5cbiAqXG4gKiBOb3RlOiBUaGlzIGlzIHNwZWNpZmljYWxseSBjcmVhdGVkIGFzIGEgbG9jYWxseSBhdmFpbGFibGUgZnVuY3Rpb24gZm9yIHVzYWdlIGFzIGNvbnZlbmllbmNlXG4gKiB1dGlsaXR5IHdpdGhpbiBgR2l0Q2xpZW50YCdzIG1ldGhvZHMgdG8gY3JlYXRlIG91dHB1dHMgYXMgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGdpdE91dHB1dEFzQXJyYXkoZ2l0Q29tbWFuZFJlc3VsdDogU3Bhd25TeW5jUmV0dXJuczxzdHJpbmc+KTogc3RyaW5nW10ge1xuICByZXR1cm4gZ2l0Q29tbWFuZFJlc3VsdC5zdGRvdXRcbiAgICAuc3BsaXQoJ1xcbicpXG4gICAgLm1hcCgoeCkgPT4geC50cmltKCkpXG4gICAgLmZpbHRlcigoeCkgPT4gISF4KTtcbn1cblxuLyoqIERldGVybWluZXMgdGhlIHJlcG9zaXRvcnkgYmFzZSBkaXJlY3RvcnkgZnJvbSB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS4gKi9cbmZ1bmN0aW9uIGRldGVybWluZVJlcG9CYXNlRGlyRnJvbUN3ZCgpIHtcbiAgLy8gVE9ETyhkZXZ2ZXJzaW9uKTogUmVwbGFjZSB3aXRoIGNvbW1vbiBzcGF3biBzeW5jIHV0aWxpdHkgb25jZSBhdmFpbGFibGUuXG4gIGNvbnN0IHtzdGRvdXQsIHN0ZGVyciwgc3RhdHVzfSA9IHNwYXduU3luYygnZ2l0JywgWydyZXYtcGFyc2UgLS1zaG93LXRvcGxldmVsJ10sIHtcbiAgICBzaGVsbDogdHJ1ZSxcbiAgICBzdGRpbzogJ3BpcGUnLFxuICAgIGVuY29kaW5nOiAndXRmOCcsXG4gIH0pO1xuICBpZiAoc3RhdHVzICE9PSAwKSB7XG4gICAgdGhyb3cgRXJyb3IoXG4gICAgICBgVW5hYmxlIHRvIGZpbmQgdGhlIHBhdGggdG8gdGhlIGJhc2UgZGlyZWN0b3J5IG9mIHRoZSByZXBvc2l0b3J5LlxcbmAgK1xuICAgICAgICBgV2FzIHRoZSBjb21tYW5kIHJ1biBmcm9tIGluc2lkZSBvZiB0aGUgcmVwbz9cXG5cXG5gICtcbiAgICAgICAgYCR7c3RkZXJyfWAsXG4gICAgKTtcbiAgfVxuICByZXR1cm4gc3Rkb3V0LnRyaW0oKTtcbn1cbiJdfQ==