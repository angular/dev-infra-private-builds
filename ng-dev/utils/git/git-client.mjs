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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0LWNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi91dGlscy9naXQvZ2l0LWNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCxpREFBNEU7QUFFNUUsc0NBQTJFO0FBQzNFLHdDQUF1QztBQUN2Qyx3Q0FBaUQ7QUFFakQscUNBQXNDO0FBQ3RDLCtDQUFrRDtBQUVsRCxxQ0FBcUM7QUFDckMsTUFBYSxlQUFnQixTQUFRLEtBQUs7SUFDeEMsWUFBWSxNQUFpQixFQUFTLElBQWM7UUFDbEQsa0VBQWtFO1FBQ2xFLHNFQUFzRTtRQUN0RSxrRUFBa0U7UUFDbEUsS0FBSyxDQUFDLHVCQUF1QixNQUFNLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUp6QyxTQUFJLEdBQUosSUFBSSxDQUFVO0lBS3BELENBQUM7Q0FDRjtBQVBELDBDQU9DO0FBT0QsK0VBQStFO0FBQy9FLE1BQWEsU0FBUztJQXNCcEI7SUFDRSx3REFBd0Q7SUFDL0MsVUFBVSwyQkFBMkIsRUFBRTtJQUNoRCx1RUFBdUU7SUFDdkUsTUFBTSxHQUFHLElBQUEsa0JBQVMsRUFBQyxPQUFPLENBQUM7UUFGbEIsWUFBTyxHQUFQLE9BQU8sQ0FBZ0M7UUFkbEQscUNBQXFDO1FBQzVCLFdBQU0sR0FBRyxJQUFJLHFCQUFZLEVBQUUsQ0FBQztRQUtyQzs7O1dBR0c7UUFDTSxlQUFVLEdBQVcsS0FBSyxDQUFDO1FBUWxDLElBQUEsZ0NBQXVCLEVBQUMsTUFBTSxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxZQUFZLEdBQUcsRUFBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLE1B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LHdCQUF3QixFQUFFO1lBQ2xDLFNBQVMsQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDO1NBQ3REO1FBQ0QsT0FBTyxTQUFTLENBQUMsd0JBQXdCLENBQUM7SUFDNUMsQ0FBQzs7QUFoTUgsOEJBaU1DO0FBckJDLDZEQUE2RDtBQUM5Qyx3QkFBYyxHQUFHLEtBQUssQ0FBQztBQXNCeEM7Ozs7Ozs7R0FPRztBQUNILFNBQVMsZ0JBQWdCLENBQUMsZ0JBQTBDO0lBQ2xFLE9BQU8sZ0JBQWdCLENBQUMsTUFBTTtTQUMzQixLQUFLLENBQUMsSUFBSSxDQUFDO1NBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDcEIsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEIsQ0FBQztBQUVELG1GQUFtRjtBQUNuRixTQUFTLDJCQUEyQjtJQUNsQywyRUFBMkU7SUFDM0UsTUFBTSxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFDLEdBQUcsSUFBQSx5QkFBUyxFQUFDLEtBQUssRUFBRSxDQUFDLDJCQUEyQixDQUFDLEVBQUU7UUFDL0UsS0FBSyxFQUFFLElBQUk7UUFDWCxLQUFLLEVBQUUsTUFBTTtRQUNiLFFBQVEsRUFBRSxNQUFNO0tBQ2pCLENBQUMsQ0FBQztJQUNILElBQUksTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNoQixNQUFNLEtBQUssQ0FDVCxvRUFBb0U7WUFDbEUsa0RBQWtEO1lBQ2xELEdBQUcsTUFBTSxFQUFFLENBQ2QsQ0FBQztLQUNIO0lBQ0QsT0FBTyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDdkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3NwYXduU3luYywgU3Bhd25TeW5jT3B0aW9ucywgU3Bhd25TeW5jUmV0dXJuc30gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5cbmltcG9ydCB7Z2V0Q29uZmlnLCBHaXRodWJDb25maWcsIGFzc2VydFZhbGlkR2l0aHViQ29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHtkZWJ1ZywgaW5mb30gZnJvbSAnLi4vY29uc29sZSc7XG5pbXBvcnQge0RyeVJ1bkVycm9yLCBpc0RyeVJ1bn0gZnJvbSAnLi4vZHJ5LXJ1bic7XG5cbmltcG9ydCB7R2l0aHViQ2xpZW50fSBmcm9tICcuL2dpdGh1Yic7XG5pbXBvcnQge2dldFJlcG9zaXRvcnlHaXRVcmx9IGZyb20gJy4vZ2l0aHViLXVybHMnO1xuXG4vKiogRXJyb3IgZm9yIGZhaWxlZCBHaXQgY29tbWFuZHMuICovXG5leHBvcnQgY2xhc3MgR2l0Q29tbWFuZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihjbGllbnQ6IEdpdENsaWVudCwgcHVibGljIGFyZ3M6IHN0cmluZ1tdKSB7XG4gICAgLy8gRXJyb3JzIGFyZSBub3QgZ3VhcmFudGVlZCB0byBiZSBjYXVnaHQuIFRvIGVuc3VyZSB0aGF0IHdlIGRvbid0XG4gICAgLy8gYWNjaWRlbnRhbGx5IGxlYWsgdGhlIEdpdGh1YiB0b2tlbiB0aGF0IG1pZ2h0IGJlIHVzZWQgaW4gYSBjb21tYW5kLFxuICAgIC8vIHdlIHNhbml0aXplIHRoZSBjb21tYW5kIHRoYXQgd2lsbCBiZSBwYXJ0IG9mIHRoZSBlcnJvciBtZXNzYWdlLlxuICAgIHN1cGVyKGBDb21tYW5kIGZhaWxlZDogZ2l0ICR7Y2xpZW50LnNhbml0aXplQ29uc29sZU91dHB1dChhcmdzLmpvaW4oJyAnKSl9YCk7XG4gIH1cbn1cblxuLyoqIFRoZSBvcHRpb25zIGF2YWlsYWJsZSBmb3IgdGhlIGBHaXRDbGllbnRgYHJ1bmAgYW5kIGBydW5HcmFjZWZ1bGAgbWV0aG9kcy4gKi9cbnR5cGUgR2l0Q29tbWFuZFJ1bk9wdGlvbnMgPSBTcGF3blN5bmNPcHRpb25zICYge1xuICB2ZXJib3NlTG9nZ2luZz86IGJvb2xlYW47XG59O1xuXG4vKiogQ2xhc3MgdGhhdCBjYW4gYmUgdXNlZCB0byBwZXJmb3JtIEdpdCBpbnRlcmFjdGlvbnMgd2l0aCBhIGdpdmVuIHJlbW90ZS4gKiovXG5leHBvcnQgY2xhc3MgR2l0Q2xpZW50IHtcbiAgLyoqIFNob3J0LWhhbmQgZm9yIGFjY2Vzc2luZyB0aGUgZGVmYXVsdCByZW1vdGUgY29uZmlndXJhdGlvbi4gKi9cbiAgcmVhZG9ubHkgcmVtb3RlQ29uZmlnOiBHaXRodWJDb25maWc7XG5cbiAgLyoqIE9jdG9raXQgcmVxdWVzdCBwYXJhbWV0ZXJzIG9iamVjdCBmb3IgdGFyZ2V0aW5nIHRoZSBjb25maWd1cmVkIHJlbW90ZS4gKi9cbiAgcmVhZG9ubHkgcmVtb3RlUGFyYW1zOiB7b3duZXI6IHN0cmluZzsgcmVwbzogc3RyaW5nfTtcblxuICAvKiogTmFtZSBvZiB0aGUgcHJpbWFyeSBicmFuY2ggb2YgdGhlIHVwc3RyZWFtIHJlbW90ZS4gKi9cbiAgcmVhZG9ubHkgbWFpbkJyYW5jaE5hbWU6IHN0cmluZztcblxuICAvKiogSW5zdGFuY2Ugb2YgdGhlIEdpdGh1YiBjbGllbnQuICovXG4gIHJlYWRvbmx5IGdpdGh1YiA9IG5ldyBHaXRodWJDbGllbnQoKTtcblxuICAvKiogVGhlIGNvbmZpZ3VyYXRpb24sIGNvbnRhaW5pbmcgdGhlIGdpdGh1YiBzcGVjaWZpYyBjb25maWd1cmF0aW9uLiAqL1xuICByZWFkb25seSBjb25maWc6IHtnaXRodWI6IEdpdGh1YkNvbmZpZ307XG5cbiAgLyoqXG4gICAqIFBhdGggdG8gdGhlIEdpdCBleGVjdXRhYmxlLiBCeSBkZWZhdWx0LCBgZ2l0YCBpcyBhc3N1bWVkIHRvIGV4aXN0XG4gICAqIGluIHRoZSBzaGVsbCBlbnZpcm9ubWVudCAodXNpbmcgYCRQQVRIYCkuXG4gICAqL1xuICByZWFkb25seSBnaXRCaW5QYXRoOiBzdHJpbmcgPSAnZ2l0JztcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogVGhlIGZ1bGwgcGF0aCB0byB0aGUgcm9vdCBvZiB0aGUgcmVwb3NpdG9yeSBiYXNlLiAqL1xuICAgIHJlYWRvbmx5IGJhc2VEaXIgPSBkZXRlcm1pbmVSZXBvQmFzZURpckZyb21Dd2QoKSxcbiAgICAvKiogVGhlIGNvbmZpZ3VyYXRpb24sIGNvbnRhaW5pbmcgdGhlIGdpdGh1YiBzcGVjaWZpYyBjb25maWd1cmF0aW9uLiAqL1xuICAgIGNvbmZpZyA9IGdldENvbmZpZyhiYXNlRGlyKSxcbiAgKSB7XG4gICAgYXNzZXJ0VmFsaWRHaXRodWJDb25maWcoY29uZmlnKTtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLnJlbW90ZUNvbmZpZyA9IGNvbmZpZy5naXRodWI7XG4gICAgdGhpcy5yZW1vdGVQYXJhbXMgPSB7b3duZXI6IGNvbmZpZy5naXRodWIub3duZXIsIHJlcG86IGNvbmZpZy5naXRodWIubmFtZX07XG4gICAgdGhpcy5tYWluQnJhbmNoTmFtZSA9IGNvbmZpZy5naXRodWIubWFpbkJyYW5jaE5hbWU7XG4gIH1cblxuICAvKiogRXhlY3V0ZXMgdGhlIGdpdmVuIGdpdCBjb21tYW5kLiBUaHJvd3MgaWYgdGhlIGNvbW1hbmQgZmFpbHMuICovXG4gIHJ1bihhcmdzOiBzdHJpbmdbXSwgb3B0aW9ucz86IEdpdENvbW1hbmRSdW5PcHRpb25zKTogT21pdDxTcGF3blN5bmNSZXR1cm5zPHN0cmluZz4sICdzdGF0dXMnPiB7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5ydW5HcmFjZWZ1bChhcmdzLCBvcHRpb25zKTtcbiAgICBpZiAocmVzdWx0LnN0YXR1cyAhPT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEdpdENvbW1hbmRFcnJvcih0aGlzLCBhcmdzKTtcbiAgICB9XG4gICAgLy8gT21pdCBgc3RhdHVzYCBmcm9tIHRoZSB0eXBlIHNvIHRoYXQgaXQncyBvYnZpb3VzIHRoYXQgdGhlIHN0YXR1cyBpcyBuZXZlclxuICAgIC8vIG5vbi16ZXJvIGFzIGV4cGxhaW5lZCBpbiB0aGUgbWV0aG9kIGRlc2NyaXB0aW9uLlxuICAgIHJldHVybiByZXN1bHQgYXMgT21pdDxTcGF3blN5bmNSZXR1cm5zPHN0cmluZz4sICdzdGF0dXMnPjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTcGF3bnMgYSBnaXZlbiBHaXQgY29tbWFuZCBwcm9jZXNzLiBEb2VzIG5vdCB0aHJvdyBpZiB0aGUgY29tbWFuZCBmYWlscy4gQWRkaXRpb25hbGx5LFxuICAgKiBpZiB0aGVyZSBpcyBhbnkgc3RkZXJyIG91dHB1dCwgdGhlIG91dHB1dCB3aWxsIGJlIHByaW50ZWQuIFRoaXMgbWFrZXMgaXQgZWFzaWVyIHRvXG4gICAqIGluZm8gZmFpbGVkIGNvbW1hbmRzLlxuICAgKi9cbiAgcnVuR3JhY2VmdWwoYXJnczogc3RyaW5nW10sIG9wdGlvbnM6IEdpdENvbW1hbmRSdW5PcHRpb25zID0ge30pOiBTcGF3blN5bmNSZXR1cm5zPHN0cmluZz4ge1xuICAgIC8qKiBUaGUgZ2l0IGNvbW1hbmQgdG8gYmUgcnVuLiAqL1xuICAgIGNvbnN0IGdpdENvbW1hbmQgPSBhcmdzWzBdO1xuXG4gICAgaWYgKGlzRHJ5UnVuKCkgJiYgZ2l0Q29tbWFuZCA9PT0gJ3B1c2gnKSB7XG4gICAgICBkZWJ1ZyhgXCJnaXQgcHVzaFwiIGlzIG5vdCBhYmxlIHRvIGJlIHJ1biBpbiBkcnlSdW4gbW9kZS5gKTtcbiAgICAgIHRocm93IG5ldyBEcnlSdW5FcnJvcigpO1xuICAgIH1cblxuICAgIC8vIFRvIGltcHJvdmUgdGhlIGRlYnVnZ2luZyBleHBlcmllbmNlIGluIGNhc2Ugc29tZXRoaW5nIGZhaWxzLCB3ZSBwcmludCBhbGwgZXhlY3V0ZWQgR2l0XG4gICAgLy8gY29tbWFuZHMgYXQgdGhlIERFQlVHIGxldmVsIHRvIGJldHRlciB1bmRlcnN0YW5kIHRoZSBnaXQgYWN0aW9ucyBvY2N1cnJpbmcuIFZlcmJvc2UgbG9nZ2luZyxcbiAgICAvLyBhbHdheXMgbG9nZ2luZyBhdCB0aGUgSU5GTyBsZXZlbCwgY2FuIGJlIGVuYWJsZWQgZWl0aGVyIGJ5IHNldHRpbmcgdGhlIHZlcmJvc2VMb2dnaW5nXG4gICAgLy8gcHJvcGVydHkgb24gdGhlIEdpdENsaWVudCBjbGFzcyBvciB0aGUgb3B0aW9ucyBvYmplY3QgcHJvdmlkZWQgdG8gdGhlIG1ldGhvZC5cbiAgICBjb25zdCBwcmludEZuID0gR2l0Q2xpZW50LnZlcmJvc2VMb2dnaW5nIHx8IG9wdGlvbnMudmVyYm9zZUxvZ2dpbmcgPyBpbmZvIDogZGVidWc7XG4gICAgLy8gTm90ZSB0aGF0IHdlIHNhbml0aXplIHRoZSBjb21tYW5kIGJlZm9yZSBwcmludGluZyBpdCB0byB0aGUgY29uc29sZS4gV2UgZG8gbm90IHdhbnQgdG9cbiAgICAvLyBwcmludCBhbiBhY2Nlc3MgdG9rZW4gaWYgaXQgaXMgY29udGFpbmVkIGluIHRoZSBjb21tYW5kLiBJdCdzIGNvbW1vbiB0byBzaGFyZSBlcnJvcnMgd2l0aFxuICAgIC8vIG90aGVycyBpZiB0aGUgdG9vbCBmYWlsZWQsIGFuZCB3ZSBkbyBub3Qgd2FudCB0byBsZWFrIHRva2Vucy5cbiAgICBwcmludEZuKCdFeGVjdXRpbmc6IGdpdCcsIHRoaXMuc2FuaXRpemVDb25zb2xlT3V0cHV0KGFyZ3Muam9pbignICcpKSk7XG5cbiAgICBjb25zdCByZXN1bHQgPSBzcGF3blN5bmModGhpcy5naXRCaW5QYXRoLCBhcmdzLCB7XG4gICAgICBjd2Q6IHRoaXMuYmFzZURpcixcbiAgICAgIHN0ZGlvOiAncGlwZScsXG4gICAgICAuLi5vcHRpb25zLFxuICAgICAgLy8gRW5jb2RpbmcgaXMgYWx3YXlzIGB1dGY4YCBhbmQgbm90IG92ZXJyaWRhYmxlLiBUaGlzIGVuc3VyZXMgdGhhdCB0aGlzIG1ldGhvZFxuICAgICAgLy8gYWx3YXlzIHJldHVybnMgYHN0cmluZ2AgYXMgb3V0cHV0IGluc3RlYWQgb2YgYnVmZmVycy5cbiAgICAgIGVuY29kaW5nOiAndXRmOCcsXG4gICAgfSk7XG5cbiAgICBpZiAocmVzdWx0LnN0ZGVyciAhPT0gbnVsbCkge1xuICAgICAgLy8gR2l0IHNvbWV0aW1lcyBwcmludHMgdGhlIGNvbW1hbmQgaWYgaXQgZmFpbGVkLiBUaGlzIG1lYW5zIHRoYXQgaXQgY291bGRcbiAgICAgIC8vIHBvdGVudGlhbGx5IGxlYWsgdGhlIEdpdGh1YiB0b2tlbiB1c2VkIGZvciBhY2Nlc3NpbmcgdGhlIHJlbW90ZS4gVG8gYXZvaWRcbiAgICAgIC8vIHByaW50aW5nIGEgdG9rZW4sIHdlIHNhbml0aXplIHRoZSBzdHJpbmcgYmVmb3JlIHByaW50aW5nIHRoZSBzdGRlcnIgb3V0cHV0LlxuICAgICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUodGhpcy5zYW5pdGl6ZUNvbnNvbGVPdXRwdXQocmVzdWx0LnN0ZGVycikpO1xuICAgIH1cblxuICAgIGlmIChyZXN1bHQuZXJyb3IgIT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gR2l0IHNvbWV0aW1lcyBwcmludHMgdGhlIGNvbW1hbmQgaWYgaXQgZmFpbGVkLiBUaGlzIG1lYW5zIHRoYXQgaXQgY291bGRcbiAgICAgIC8vIHBvdGVudGlhbGx5IGxlYWsgdGhlIEdpdGh1YiB0b2tlbiB1c2VkIGZvciBhY2Nlc3NpbmcgdGhlIHJlbW90ZS4gVG8gYXZvaWRcbiAgICAgIC8vIHByaW50aW5nIGEgdG9rZW4sIHdlIHNhbml0aXplIHRoZSBzdHJpbmcgYmVmb3JlIHByaW50aW5nIHRoZSBzdGRlcnIgb3V0cHV0LlxuICAgICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUodGhpcy5zYW5pdGl6ZUNvbnNvbGVPdXRwdXQocmVzdWx0LmVycm9yLm1lc3NhZ2UpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqIEdpdCBVUkwgdGhhdCByZXNvbHZlcyB0byB0aGUgY29uZmlndXJlZCByZXBvc2l0b3J5LiAqL1xuICBnZXRSZXBvR2l0VXJsKCkge1xuICAgIHJldHVybiBnZXRSZXBvc2l0b3J5R2l0VXJsKHRoaXMucmVtb3RlQ29uZmlnKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBnaXZlbiBicmFuY2ggY29udGFpbnMgdGhlIHNwZWNpZmllZCBTSEEuICovXG4gIGhhc0NvbW1pdChicmFuY2hOYW1lOiBzdHJpbmcsIHNoYTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucnVuKFsnYnJhbmNoJywgYnJhbmNoTmFtZSwgJy0tY29udGFpbnMnLCBzaGFdKS5zdGRvdXQgIT09ICcnO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGN1cnJlbnRseSBjaGVja2VkIG91dCBicmFuY2ggb3IgcmV2aXNpb24uICovXG4gIGdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk6IHN0cmluZyB7XG4gICAgY29uc3QgYnJhbmNoTmFtZSA9IHRoaXMucnVuKFsncmV2LXBhcnNlJywgJy0tYWJicmV2LXJlZicsICdIRUFEJ10pLnN0ZG91dC50cmltKCk7XG4gICAgLy8gSWYgbm8gYnJhbmNoIG5hbWUgY291bGQgYmUgcmVzb2x2ZWQuIGkuZS4gYEhFQURgIGhhcyBiZWVuIHJldHVybmVkLCB0aGVuIEdpdFxuICAgIC8vIGlzIGN1cnJlbnRseSBpbiBhIGRldGFjaGVkIHN0YXRlLiBJbiB0aG9zZSBjYXNlcywgd2UganVzdCB3YW50IHRvIHJldHVybiB0aGVcbiAgICAvLyBjdXJyZW50bHkgY2hlY2tlZCBvdXQgcmV2aXNpb24vU0hBLlxuICAgIGlmIChicmFuY2hOYW1lID09PSAnSEVBRCcpIHtcbiAgICAgIHJldHVybiB0aGlzLnJ1bihbJ3Jldi1wYXJzZScsICdIRUFEJ10pLnN0ZG91dC50cmltKCk7XG4gICAgfVxuICAgIHJldHVybiBicmFuY2hOYW1lO1xuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciB0aGUgY3VycmVudCBHaXQgcmVwb3NpdG9yeSBoYXMgdW5jb21taXR0ZWQgY2hhbmdlcy4gKi9cbiAgaGFzVW5jb21taXR0ZWRDaGFuZ2VzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJ1bkdyYWNlZnVsKFsnZGlmZi1pbmRleCcsICctLXF1aWV0JywgJ0hFQUQnXSkuc3RhdHVzICE9PSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBvdXQgYSByZXF1ZXN0ZWQgYnJhbmNoIG9yIHJldmlzaW9uLCBvcHRpb25hbGx5IGNsZWFuaW5nIHRoZSBzdGF0ZSBvZiB0aGUgcmVwb3NpdG9yeVxuICAgKiBiZWZvcmUgYXR0ZW1wdGluZyB0aGUgY2hlY2tpbmcuIFJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgYnJhbmNoIG9yIHJldmlzaW9uXG4gICAqIHdhcyBjbGVhbmx5IGNoZWNrZWQgb3V0LlxuICAgKi9cbiAgY2hlY2tvdXQoYnJhbmNoT3JSZXZpc2lvbjogc3RyaW5nLCBjbGVhblN0YXRlOiBib29sZWFuKTogYm9vbGVhbiB7XG4gICAgaWYgKGNsZWFuU3RhdGUpIHtcbiAgICAgIC8vIEFib3J0IGFueSBvdXRzdGFuZGluZyBhbXMuXG4gICAgICB0aGlzLnJ1bkdyYWNlZnVsKFsnYW0nLCAnLS1hYm9ydCddLCB7c3RkaW86ICdpZ25vcmUnfSk7XG4gICAgICAvLyBBYm9ydCBhbnkgb3V0c3RhbmRpbmcgY2hlcnJ5LXBpY2tzLlxuICAgICAgdGhpcy5ydW5HcmFjZWZ1bChbJ2NoZXJyeS1waWNrJywgJy0tYWJvcnQnXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuICAgICAgLy8gQWJvcnQgYW55IG91dHN0YW5kaW5nIHJlYmFzZXMuXG4gICAgICB0aGlzLnJ1bkdyYWNlZnVsKFsncmViYXNlJywgJy0tYWJvcnQnXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuICAgICAgLy8gQ2xlYXIgYW55IGNoYW5nZXMgaW4gdGhlIGN1cnJlbnQgcmVwby5cbiAgICAgIHRoaXMucnVuR3JhY2VmdWwoWydyZXNldCcsICctLWhhcmQnXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5ydW5HcmFjZWZ1bChbJ2NoZWNrb3V0JywgYnJhbmNoT3JSZXZpc2lvbl0sIHtzdGRpbzogJ2lnbm9yZSd9KS5zdGF0dXMgPT09IDA7XG4gIH1cblxuICAvKiogUmV0cmlldmUgYSBsaXN0IG9mIGFsbCBmaWxlcyBpbiB0aGUgcmVwb3NpdG9yeSBjaGFuZ2VkIHNpbmNlIHRoZSBwcm92aWRlZCBzaGFPclJlZi4gKi9cbiAgYWxsQ2hhbmdlc0ZpbGVzU2luY2Uoc2hhT3JSZWYgPSAnSEVBRCcpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oXG4gICAgICBuZXcgU2V0KFtcbiAgICAgICAgLi4uZ2l0T3V0cHV0QXNBcnJheSh0aGlzLnJ1bkdyYWNlZnVsKFsnZGlmZicsICctLW5hbWUtb25seScsICctLWRpZmYtZmlsdGVyPWQnLCBzaGFPclJlZl0pKSxcbiAgICAgICAgLi4uZ2l0T3V0cHV0QXNBcnJheSh0aGlzLnJ1bkdyYWNlZnVsKFsnbHMtZmlsZXMnLCAnLS1vdGhlcnMnLCAnLS1leGNsdWRlLXN0YW5kYXJkJ10pKSxcbiAgICAgIF0pLFxuICAgICk7XG4gIH1cblxuICAvKiogUmV0cmlldmUgYSBsaXN0IG9mIGFsbCBmaWxlcyBjdXJyZW50bHkgc3RhZ2VkIGluIHRoZSByZXBvc3RpdG9yeS4gKi9cbiAgYWxsU3RhZ2VkRmlsZXMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBnaXRPdXRwdXRBc0FycmF5KFxuICAgICAgdGhpcy5ydW5HcmFjZWZ1bChbJ2RpZmYnLCAnLS1uYW1lLW9ubHknLCAnLS1kaWZmLWZpbHRlcj1BQ00nLCAnLS1zdGFnZWQnXSksXG4gICAgKTtcbiAgfVxuXG4gIC8qKiBSZXRyaWV2ZSBhIGxpc3Qgb2YgYWxsIGZpbGVzIHRyYWNrZWQgaW4gdGhlIHJlcG9zaXRvcnkuICovXG4gIGFsbEZpbGVzKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gZ2l0T3V0cHV0QXNBcnJheSh0aGlzLnJ1bkdyYWNlZnVsKFsnbHMtZmlsZXMnXSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNhbml0aXplcyB0aGUgZ2l2ZW4gY29uc29sZSBtZXNzYWdlLiBUaGlzIG1ldGhvZCBjYW4gYmUgb3ZlcnJpZGRlbiBieVxuICAgKiBkZXJpdmVkIGNsYXNzZXMuIGUuZy4gdG8gc2FuaXRpemUgYWNjZXNzIHRva2VucyBmcm9tIEdpdCBjb21tYW5kcy5cbiAgICovXG4gIHNhbml0aXplQ29uc29sZU91dHB1dCh2YWx1ZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdmVyYm9zZSBsb2dnaW5nIG9mIEdpdCBhY3Rpb25zIHNob3VsZCBiZSB1c2VkLiAqL1xuICBwcml2YXRlIHN0YXRpYyB2ZXJib3NlTG9nZ2luZyA9IGZhbHNlO1xuXG4gIC8qKiBUaGUgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSB1bmF1dGhlbnRpY2F0ZWQgYEdpdENsaWVudGAuICovXG4gIHByaXZhdGUgc3RhdGljIF91bmF1dGhlbnRpY2F0ZWRJbnN0YW5jZTogR2l0Q2xpZW50O1xuXG4gIC8qKiBTZXQgdGhlIHZlcmJvc2UgbG9nZ2luZyBzdGF0ZSBvZiBhbGwgZ2l0IGNsaWVudCBpbnN0YW5jZXMuICovXG4gIHN0YXRpYyBzZXRWZXJib3NlTG9nZ2luZ1N0YXRlKHZlcmJvc2U6IGJvb2xlYW4pIHtcbiAgICBHaXRDbGllbnQudmVyYm9zZUxvZ2dpbmcgPSB2ZXJib3NlO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXRpYyBtZXRob2QgdG8gZ2V0IHRoZSBzaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIGBHaXRDbGllbnRgLCBjcmVhdGluZyBpdFxuICAgKiBpZiBpdCBoYXMgbm90IHlldCBiZWVuIGNyZWF0ZWQuXG4gICAqL1xuICBzdGF0aWMgZ2V0KCk6IEdpdENsaWVudCB7XG4gICAgaWYgKCF0aGlzLl91bmF1dGhlbnRpY2F0ZWRJbnN0YW5jZSkge1xuICAgICAgR2l0Q2xpZW50Ll91bmF1dGhlbnRpY2F0ZWRJbnN0YW5jZSA9IG5ldyBHaXRDbGllbnQoKTtcbiAgICB9XG4gICAgcmV0dXJuIEdpdENsaWVudC5fdW5hdXRoZW50aWNhdGVkSW5zdGFuY2U7XG4gIH1cbn1cblxuLyoqXG4gKiBUYWtlcyB0aGUgb3V0cHV0IGZyb20gYHJ1bmAgYW5kIGBydW5HcmFjZWZ1bGAgYW5kIHJldHVybnMgYW4gYXJyYXkgb2Ygc3RyaW5ncyBmb3IgZWFjaFxuICogbmV3IGxpbmUuIEdpdCBjb21tYW5kcyB0eXBpY2FsbHkgcmV0dXJuIG11bHRpcGxlIG91dHB1dCB2YWx1ZXMgZm9yIGEgY29tbWFuZCBhIHNldCBvZlxuICogc3RyaW5ncyBzZXBhcmF0ZWQgYnkgbmV3IGxpbmVzLlxuICpcbiAqIE5vdGU6IFRoaXMgaXMgc3BlY2lmaWNhbGx5IGNyZWF0ZWQgYXMgYSBsb2NhbGx5IGF2YWlsYWJsZSBmdW5jdGlvbiBmb3IgdXNhZ2UgYXMgY29udmVuaWVuY2VcbiAqIHV0aWxpdHkgd2l0aGluIGBHaXRDbGllbnRgJ3MgbWV0aG9kcyB0byBjcmVhdGUgb3V0cHV0cyBhcyBhcnJheS5cbiAqL1xuZnVuY3Rpb24gZ2l0T3V0cHV0QXNBcnJheShnaXRDb21tYW5kUmVzdWx0OiBTcGF3blN5bmNSZXR1cm5zPHN0cmluZz4pOiBzdHJpbmdbXSB7XG4gIHJldHVybiBnaXRDb21tYW5kUmVzdWx0LnN0ZG91dFxuICAgIC5zcGxpdCgnXFxuJylcbiAgICAubWFwKCh4KSA9PiB4LnRyaW0oKSlcbiAgICAuZmlsdGVyKCh4KSA9PiAhIXgpO1xufVxuXG4vKiogRGV0ZXJtaW5lcyB0aGUgcmVwb3NpdG9yeSBiYXNlIGRpcmVjdG9yeSBmcm9tIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LiAqL1xuZnVuY3Rpb24gZGV0ZXJtaW5lUmVwb0Jhc2VEaXJGcm9tQ3dkKCkge1xuICAvLyBUT0RPKGRldnZlcnNpb24pOiBSZXBsYWNlIHdpdGggY29tbW9uIHNwYXduIHN5bmMgdXRpbGl0eSBvbmNlIGF2YWlsYWJsZS5cbiAgY29uc3Qge3N0ZG91dCwgc3RkZXJyLCBzdGF0dXN9ID0gc3Bhd25TeW5jKCdnaXQnLCBbJ3Jldi1wYXJzZSAtLXNob3ctdG9wbGV2ZWwnXSwge1xuICAgIHNoZWxsOiB0cnVlLFxuICAgIHN0ZGlvOiAncGlwZScsXG4gICAgZW5jb2Rpbmc6ICd1dGY4JyxcbiAgfSk7XG4gIGlmIChzdGF0dXMgIT09IDApIHtcbiAgICB0aHJvdyBFcnJvcihcbiAgICAgIGBVbmFibGUgdG8gZmluZCB0aGUgcGF0aCB0byB0aGUgYmFzZSBkaXJlY3Rvcnkgb2YgdGhlIHJlcG9zaXRvcnkuXFxuYCArXG4gICAgICAgIGBXYXMgdGhlIGNvbW1hbmQgcnVuIGZyb20gaW5zaWRlIG9mIHRoZSByZXBvP1xcblxcbmAgK1xuICAgICAgICBgJHtzdGRlcnJ9YCxcbiAgICApO1xuICB9XG4gIHJldHVybiBzdGRvdXQudHJpbSgpO1xufVxuIl19