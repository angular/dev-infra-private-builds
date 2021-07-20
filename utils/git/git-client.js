/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/utils/git/git-client", ["require", "exports", "tslib", "child_process", "semver", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/dry-run", "@angular/dev-infra-private/utils/git/github", "@angular/dev-infra-private/utils/git/github-urls"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GitClient = exports.GitCommandError = void 0;
    var tslib_1 = require("tslib");
    var child_process_1 = require("child_process");
    var semver_1 = require("semver");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var dry_run_1 = require("@angular/dev-infra-private/utils/dry-run");
    var github_1 = require("@angular/dev-infra-private/utils/git/github");
    var github_urls_1 = require("@angular/dev-infra-private/utils/git/github-urls");
    /** Error for failed Git commands. */
    var GitCommandError = /** @class */ (function (_super) {
        tslib_1.__extends(GitCommandError, _super);
        function GitCommandError(client, args) {
            var _this = 
            // Errors are not guaranteed to be caught. To ensure that we don't
            // accidentally leak the Github token that might be used in a command,
            // we sanitize the command that will be part of the error message.
            _super.call(this, "Command failed: git " + client.sanitizeConsoleOutput(args.join(' '))) || this;
            _this.args = args;
            return _this;
        }
        return GitCommandError;
    }(Error));
    exports.GitCommandError = GitCommandError;
    /** Class that can be used to perform Git interactions with a given remote. **/
    var GitClient = /** @class */ (function () {
        function GitClient(
        /** The full path to the root of the repository base. */
        baseDir, 
        /** The configuration, containing the github specific configuration. */
        config) {
            if (baseDir === void 0) { baseDir = determineRepoBaseDirFromCwd(); }
            if (config === void 0) { config = config_1.getConfig(baseDir); }
            this.baseDir = baseDir;
            this.config = config;
            /** Short-hand for accessing the default remote configuration. */
            this.remoteConfig = this.config.github;
            /** Octokit request parameters object for targeting the configured remote. */
            this.remoteParams = { owner: this.remoteConfig.owner, repo: this.remoteConfig.name };
            /** Instance of the Github client. */
            this.github = new github_1.GithubClient();
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
            if (dry_run_1.isDryRun() && gitCommand === 'push') {
                console_1.debug("\"git push\" is not able to be run in dryRun mode.");
                throw new dry_run_1.DryRunError();
            }
            // To improve the debugging experience in case something fails, we print all executed Git
            // commands at the DEBUG level to better understand the git actions occurring. Verbose logging,
            // always logging at the INFO level, can be enabled either by setting the verboseLogging
            // property on the GitClient class or the options object provided to the method.
            var printFn = (GitClient.verboseLogging || options.verboseLogging) ? console_1.info : console_1.debug;
            // Note that we sanitize the command before printing it to the console. We do not want to
            // print an access token if it is contained in the command. It's common to share errors with
            // others if the tool failed, and we do not want to leak tokens.
            printFn('Executing: git', this.sanitizeConsoleOutput(args.join(' ')));
            var result = child_process_1.spawnSync('git', args, tslib_1.__assign(tslib_1.__assign({ cwd: this.baseDir, stdio: 'pipe' }, options), { 
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
            return github_urls_1.getRepositoryGitUrl(this.remoteConfig);
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
            var latestTag = tags.find(function (tag) { return semver_1.parse(tag, semVerOptions); });
            if (latestTag === undefined) {
                throw new Error("Unable to find a SemVer matching tag on \"" + this.getCurrentBranchOrRevision() + "\"");
            }
            return new semver_1.SemVer(latestTag, semVerOptions);
        };
        /** Retrieves the git tag matching the provided SemVer, if it exists. */
        GitClient.prototype.getMatchingTagForSemver = function (semver) {
            var semVerOptions = { loose: true };
            var tags = this.runGraceful(['tag', '--sort=-committerdate', '--merged']).stdout.split('\n');
            var matchingTag = tags.find(function (tag) { var _a; return ((_a = semver_1.parse(tag, semVerOptions)) === null || _a === void 0 ? void 0 : _a.compare(semver)) === 0; });
            if (matchingTag === undefined) {
                throw new Error("Unable to find a tag for the version: \"" + semver.format() + "\"");
            }
            return matchingTag;
        };
        /** Retrieve a list of all files in the repository changed since the provided shaOrRef. */
        GitClient.prototype.allChangesFilesSince = function (shaOrRef) {
            if (shaOrRef === void 0) { shaOrRef = 'HEAD'; }
            return Array.from(new Set(tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(gitOutputAsArray(this.runGraceful(['diff', '--name-only', '--diff-filter=d', shaOrRef])))), tslib_1.__read(gitOutputAsArray(this.runGraceful(['ls-files', '--others', '--exclude-standard']))))));
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
    exports.GitClient = GitClient;
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
        var _a = child_process_1.spawnSync('git', ['rev-parse --show-toplevel'], { shell: true, stdio: 'pipe', encoding: 'utf8' }), stdout = _a.stdout, stderr = _a.stderr, status = _a.status;
        if (status !== 0) {
            throw Error("Unable to find the path to the base directory of the repository.\n" +
                "Was the command run from inside of the repo?\n\n" +
                ("" + stderr));
        }
        return stdout.trim();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0LWNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9naXQvZ2l0LWNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsK0NBQTRFO0lBQzVFLGlDQUErRDtJQUcvRCxrRUFBK0Q7SUFDL0Qsb0VBQXVDO0lBQ3ZDLG9FQUFpRDtJQUVqRCxzRUFBc0M7SUFDdEMsZ0ZBQWtEO0lBRWxELHFDQUFxQztJQUNyQztRQUFxQywyQ0FBSztRQUN4Qyx5QkFBWSxNQUFpQixFQUFTLElBQWM7WUFBcEQ7WUFDRSxrRUFBa0U7WUFDbEUsc0VBQXNFO1lBQ3RFLGtFQUFrRTtZQUNsRSxrQkFBTSx5QkFBdUIsTUFBTSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUcsQ0FBQyxTQUM3RTtZQUxxQyxVQUFJLEdBQUosSUFBSSxDQUFVOztRQUtwRCxDQUFDO1FBQ0gsc0JBQUM7SUFBRCxDQUFDLEFBUEQsQ0FBcUMsS0FBSyxHQU96QztJQVBZLDBDQUFlO0lBYzVCLCtFQUErRTtJQUMvRTtRQVVFO1FBQ0ksd0RBQXdEO1FBQy9DLE9BQXVDO1FBQ2hELHVFQUF1RTtRQUM5RCxNQUEyQjtZQUYzQix3QkFBQSxFQUFBLFVBQVUsMkJBQTJCLEVBQUU7WUFFdkMsdUJBQUEsRUFBQSxTQUFTLGtCQUFTLENBQUMsT0FBTyxDQUFDO1lBRjNCLFlBQU8sR0FBUCxPQUFPLENBQWdDO1lBRXZDLFdBQU0sR0FBTixNQUFNLENBQXFCO1lBYnhDLGlFQUFpRTtZQUN4RCxpQkFBWSxHQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUV6RCw2RUFBNkU7WUFDcEUsaUJBQVksR0FBRyxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFD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QUNELE9BQU8sU0FBUyxDQUFDLHdCQUF3QixDQUFDO1FBQzVDLENBQUM7UUFwQkQsNkRBQTZEO1FBQzlDLHdCQUFjLEdBQUcsS0FBSyxDQUFDO1FBb0J4QyxnQkFBQztLQUFBLEFBOUxELElBOExDO0lBOUxZLDhCQUFTO0lBZ010Qjs7Ozs7OztPQU9HO0lBQ0gsU0FBUyxnQkFBZ0IsQ0FBQyxnQkFBMEM7UUFDbEUsT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBUixDQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsQ0FBQyxFQUFILENBQUcsQ0FBQyxDQUFDO0lBQ2pGLENBQUM7SUFFRCxtRkFBbUY7SUFDbkYsU0FBUywyQkFBMkI7UUFDbEMsMkVBQTJFO1FBQ3JFLElBQUEsS0FBMkIseUJBQVMsQ0FDdEMsS0FBSyxFQUFFLENBQUMsMkJBQTJCLENBQUMsRUFBRSxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFDLENBQUMsRUFEbEYsTUFBTSxZQUFBLEVBQUUsTUFBTSxZQUFBLEVBQUUsTUFBTSxZQUM0RCxDQUFDO1FBQzFGLElBQUksTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNoQixNQUFNLEtBQUssQ0FDUCxvRUFBb0U7Z0JBQ3BFLGtEQUFrRDtpQkFDbEQsS0FBRyxNQUFRLENBQUEsQ0FBQyxDQUFDO1NBQ2xCO1FBQ0QsT0FBTyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3NwYXduU3luYywgU3Bhd25TeW5jT3B0aW9ucywgU3Bhd25TeW5jUmV0dXJuc30gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQge09wdGlvbnMgYXMgU2VtVmVyT3B0aW9ucywgcGFyc2UsIFNlbVZlcn0gZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtzcGF3bldpdGhEZWJ1Z091dHB1dH0gZnJvbSAnLi4vY2hpbGQtcHJvY2Vzcyc7XG5pbXBvcnQge2dldENvbmZpZywgR2l0aHViQ29uZmlnLCBOZ0RldkNvbmZpZ30gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7ZGVidWcsIGluZm99IGZyb20gJy4uL2NvbnNvbGUnO1xuaW1wb3J0IHtEcnlSdW5FcnJvciwgaXNEcnlSdW59IGZyb20gJy4uL2RyeS1ydW4nO1xuXG5pbXBvcnQge0dpdGh1YkNsaWVudH0gZnJvbSAnLi9naXRodWInO1xuaW1wb3J0IHtnZXRSZXBvc2l0b3J5R2l0VXJsfSBmcm9tICcuL2dpdGh1Yi11cmxzJztcblxuLyoqIEVycm9yIGZvciBmYWlsZWQgR2l0IGNvbW1hbmRzLiAqL1xuZXhwb3J0IGNsYXNzIEdpdENvbW1hbmRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoY2xpZW50OiBHaXRDbGllbnQsIHB1YmxpYyBhcmdzOiBzdHJpbmdbXSkge1xuICAgIC8vIEVycm9ycyBhcmUgbm90IGd1YXJhbnRlZWQgdG8gYmUgY2F1Z2h0LiBUbyBlbnN1cmUgdGhhdCB3ZSBkb24ndFxuICAgIC8vIGFjY2lkZW50YWxseSBsZWFrIHRoZSBHaXRodWIgdG9rZW4gdGhhdCBtaWdodCBiZSB1c2VkIGluIGEgY29tbWFuZCxcbiAgICAvLyB3ZSBzYW5pdGl6ZSB0aGUgY29tbWFuZCB0aGF0IHdpbGwgYmUgcGFydCBvZiB0aGUgZXJyb3IgbWVzc2FnZS5cbiAgICBzdXBlcihgQ29tbWFuZCBmYWlsZWQ6IGdpdCAke2NsaWVudC5zYW5pdGl6ZUNvbnNvbGVPdXRwdXQoYXJncy5qb2luKCcgJykpfWApO1xuICB9XG59XG5cbi8qKiBUaGUgb3B0aW9ucyBhdmFpbGFibGUgZm9yIHRoZSBgR2l0Q2xpZW50YGBydW5gIGFuZCBgcnVuR3JhY2VmdWxgIG1ldGhvZHMuICovXG50eXBlIEdpdENvbW1hbmRSdW5PcHRpb25zID0gU3Bhd25TeW5jT3B0aW9ucyZ7XG4gIHZlcmJvc2VMb2dnaW5nPzogYm9vbGVhbjtcbn07XG5cbi8qKiBDbGFzcyB0aGF0IGNhbiBiZSB1c2VkIHRvIHBlcmZvcm0gR2l0IGludGVyYWN0aW9ucyB3aXRoIGEgZ2l2ZW4gcmVtb3RlLiAqKi9cbmV4cG9ydCBjbGFzcyBHaXRDbGllbnQge1xuICAvKiogU2hvcnQtaGFuZCBmb3IgYWNjZXNzaW5nIHRoZSBkZWZhdWx0IHJlbW90ZSBjb25maWd1cmF0aW9uLiAqL1xuICByZWFkb25seSByZW1vdGVDb25maWc6IEdpdGh1YkNvbmZpZyA9IHRoaXMuY29uZmlnLmdpdGh1YjtcblxuICAvKiogT2N0b2tpdCByZXF1ZXN0IHBhcmFtZXRlcnMgb2JqZWN0IGZvciB0YXJnZXRpbmcgdGhlIGNvbmZpZ3VyZWQgcmVtb3RlLiAqL1xuICByZWFkb25seSByZW1vdGVQYXJhbXMgPSB7b3duZXI6IHRoaXMucmVtb3RlQ29uZmlnLm93bmVyLCByZXBvOiB0aGlzLnJlbW90ZUNvbmZpZy5uYW1lfTtcblxuICAvKiogSW5zdGFuY2Ugb2YgdGhlIEdpdGh1YiBjbGllbnQuICovXG4gIHJlYWRvbmx5IGdpdGh1YiA9IG5ldyBHaXRodWJDbGllbnQoKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBUaGUgZnVsbCBwYXRoIHRvIHRoZSByb290IG9mIHRoZSByZXBvc2l0b3J5IGJhc2UuICovXG4gICAgICByZWFkb25seSBiYXNlRGlyID0gZGV0ZXJtaW5lUmVwb0Jhc2VEaXJGcm9tQ3dkKCksXG4gICAgICAvKiogVGhlIGNvbmZpZ3VyYXRpb24sIGNvbnRhaW5pbmcgdGhlIGdpdGh1YiBzcGVjaWZpYyBjb25maWd1cmF0aW9uLiAqL1xuICAgICAgcmVhZG9ubHkgY29uZmlnID0gZ2V0Q29uZmlnKGJhc2VEaXIpKSB7fVxuXG4gIC8qKiBFeGVjdXRlcyB0aGUgZ2l2ZW4gZ2l0IGNvbW1hbmQuIFRocm93cyBpZiB0aGUgY29tbWFuZCBmYWlscy4gKi9cbiAgcnVuKGFyZ3M6IHN0cmluZ1tdLCBvcHRpb25zPzogR2l0Q29tbWFuZFJ1bk9wdGlvbnMpOiBPbWl0PFNwYXduU3luY1JldHVybnM8c3RyaW5nPiwgJ3N0YXR1cyc+IHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLnJ1bkdyYWNlZnVsKGFyZ3MsIG9wdGlvbnMpO1xuICAgIGlmIChyZXN1bHQuc3RhdHVzICE9PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgR2l0Q29tbWFuZEVycm9yKHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgICAvLyBPbWl0IGBzdGF0dXNgIGZyb20gdGhlIHR5cGUgc28gdGhhdCBpdCdzIG9idmlvdXMgdGhhdCB0aGUgc3RhdHVzIGlzIG5ldmVyXG4gICAgLy8gbm9uLXplcm8gYXMgZXhwbGFpbmVkIGluIHRoZSBtZXRob2QgZGVzY3JpcHRpb24uXG4gICAgcmV0dXJuIHJlc3VsdCBhcyBPbWl0PFNwYXduU3luY1JldHVybnM8c3RyaW5nPiwgJ3N0YXR1cyc+O1xuICB9XG5cbiAgLyoqXG4gICAqIFNwYXducyBhIGdpdmVuIEdpdCBjb21tYW5kIHByb2Nlc3MuIERvZXMgbm90IHRocm93IGlmIHRoZSBjb21tYW5kIGZhaWxzLiBBZGRpdGlvbmFsbHksXG4gICAqIGlmIHRoZXJlIGlzIGFueSBzdGRlcnIgb3V0cHV0LCB0aGUgb3V0cHV0IHdpbGwgYmUgcHJpbnRlZC4gVGhpcyBtYWtlcyBpdCBlYXNpZXIgdG9cbiAgICogaW5mbyBmYWlsZWQgY29tbWFuZHMuXG4gICAqL1xuICBydW5HcmFjZWZ1bChhcmdzOiBzdHJpbmdbXSwgb3B0aW9uczogR2l0Q29tbWFuZFJ1bk9wdGlvbnMgPSB7fSk6IFNwYXduU3luY1JldHVybnM8c3RyaW5nPiB7XG4gICAgLyoqIFRoZSBnaXQgY29tbWFuZCB0byBiZSBydW4uICovXG4gICAgY29uc3QgZ2l0Q29tbWFuZCA9IGFyZ3NbMF07XG5cbiAgICBpZiAoaXNEcnlSdW4oKSAmJiBnaXRDb21tYW5kID09PSAncHVzaCcpIHtcbiAgICAgIGRlYnVnKGBcImdpdCBwdXNoXCIgaXMgbm90IGFibGUgdG8gYmUgcnVuIGluIGRyeVJ1biBtb2RlLmApO1xuICAgICAgdGhyb3cgbmV3IERyeVJ1bkVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gVG8gaW1wcm92ZSB0aGUgZGVidWdnaW5nIGV4cGVyaWVuY2UgaW4gY2FzZSBzb21ldGhpbmcgZmFpbHMsIHdlIHByaW50IGFsbCBleGVjdXRlZCBHaXRcbiAgICAvLyBjb21tYW5kcyBhdCB0aGUgREVCVUcgbGV2ZWwgdG8gYmV0dGVyIHVuZGVyc3RhbmQgdGhlIGdpdCBhY3Rpb25zIG9jY3VycmluZy4gVmVyYm9zZSBsb2dnaW5nLFxuICAgIC8vIGFsd2F5cyBsb2dnaW5nIGF0IHRoZSBJTkZPIGxldmVsLCBjYW4gYmUgZW5hYmxlZCBlaXRoZXIgYnkgc2V0dGluZyB0aGUgdmVyYm9zZUxvZ2dpbmdcbiAgICAvLyBwcm9wZXJ0eSBvbiB0aGUgR2l0Q2xpZW50IGNsYXNzIG9yIHRoZSBvcHRpb25zIG9iamVjdCBwcm92aWRlZCB0byB0aGUgbWV0aG9kLlxuICAgIGNvbnN0IHByaW50Rm4gPSAoR2l0Q2xpZW50LnZlcmJvc2VMb2dnaW5nIHx8IG9wdGlvbnMudmVyYm9zZUxvZ2dpbmcpID8gaW5mbyA6IGRlYnVnO1xuICAgIC8vIE5vdGUgdGhhdCB3ZSBzYW5pdGl6ZSB0aGUgY29tbWFuZCBiZWZvcmUgcHJpbnRpbmcgaXQgdG8gdGhlIGNvbnNvbGUuIFdlIGRvIG5vdCB3YW50IHRvXG4gICAgLy8gcHJpbnQgYW4gYWNjZXNzIHRva2VuIGlmIGl0IGlzIGNvbnRhaW5lZCBpbiB0aGUgY29tbWFuZC4gSXQncyBjb21tb24gdG8gc2hhcmUgZXJyb3JzIHdpdGhcbiAgICAvLyBvdGhlcnMgaWYgdGhlIHRvb2wgZmFpbGVkLCBhbmQgd2UgZG8gbm90IHdhbnQgdG8gbGVhayB0b2tlbnMuXG4gICAgcHJpbnRGbignRXhlY3V0aW5nOiBnaXQnLCB0aGlzLnNhbml0aXplQ29uc29sZU91dHB1dChhcmdzLmpvaW4oJyAnKSkpO1xuXG4gICAgY29uc3QgcmVzdWx0ID0gc3Bhd25TeW5jKCdnaXQnLCBhcmdzLCB7XG4gICAgICBjd2Q6IHRoaXMuYmFzZURpcixcbiAgICAgIHN0ZGlvOiAncGlwZScsXG4gICAgICAuLi5vcHRpb25zLFxuICAgICAgLy8gRW5jb2RpbmcgaXMgYWx3YXlzIGB1dGY4YCBhbmQgbm90IG92ZXJyaWRhYmxlLiBUaGlzIGVuc3VyZXMgdGhhdCB0aGlzIG1ldGhvZFxuICAgICAgLy8gYWx3YXlzIHJldHVybnMgYHN0cmluZ2AgYXMgb3V0cHV0IGluc3RlYWQgb2YgYnVmZmVycy5cbiAgICAgIGVuY29kaW5nOiAndXRmOCcsXG4gICAgfSk7XG5cbiAgICBpZiAocmVzdWx0LnN0ZGVyciAhPT0gbnVsbCkge1xuICAgICAgLy8gR2l0IHNvbWV0aW1lcyBwcmludHMgdGhlIGNvbW1hbmQgaWYgaXQgZmFpbGVkLiBUaGlzIG1lYW5zIHRoYXQgaXQgY291bGRcbiAgICAgIC8vIHBvdGVudGlhbGx5IGxlYWsgdGhlIEdpdGh1YiB0b2tlbiB1c2VkIGZvciBhY2Nlc3NpbmcgdGhlIHJlbW90ZS4gVG8gYXZvaWRcbiAgICAgIC8vIHByaW50aW5nIGEgdG9rZW4sIHdlIHNhbml0aXplIHRoZSBzdHJpbmcgYmVmb3JlIHByaW50aW5nIHRoZSBzdGRlcnIgb3V0cHV0LlxuICAgICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUodGhpcy5zYW5pdGl6ZUNvbnNvbGVPdXRwdXQocmVzdWx0LnN0ZGVycikpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiogR2l0IFVSTCB0aGF0IHJlc29sdmVzIHRvIHRoZSBjb25maWd1cmVkIHJlcG9zaXRvcnkuICovXG4gIGdldFJlcG9HaXRVcmwoKSB7XG4gICAgcmV0dXJuIGdldFJlcG9zaXRvcnlHaXRVcmwodGhpcy5yZW1vdGVDb25maWcpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGdpdmVuIGJyYW5jaCBjb250YWlucyB0aGUgc3BlY2lmaWVkIFNIQS4gKi9cbiAgaGFzQ29tbWl0KGJyYW5jaE5hbWU6IHN0cmluZywgc2hhOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5ydW4oWydicmFuY2gnLCBicmFuY2hOYW1lLCAnLS1jb250YWlucycsIHNoYV0pLnN0ZG91dCAhPT0gJyc7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgY3VycmVudGx5IGNoZWNrZWQgb3V0IGJyYW5jaCBvciByZXZpc2lvbi4gKi9cbiAgZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTogc3RyaW5nIHtcbiAgICBjb25zdCBicmFuY2hOYW1lID0gdGhpcy5ydW4oWydyZXYtcGFyc2UnLCAnLS1hYmJyZXYtcmVmJywgJ0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgICAvLyBJZiBubyBicmFuY2ggbmFtZSBjb3VsZCBiZSByZXNvbHZlZC4gaS5lLiBgSEVBRGAgaGFzIGJlZW4gcmV0dXJuZWQsIHRoZW4gR2l0XG4gICAgLy8gaXMgY3VycmVudGx5IGluIGEgZGV0YWNoZWQgc3RhdGUuIEluIHRob3NlIGNhc2VzLCB3ZSBqdXN0IHdhbnQgdG8gcmV0dXJuIHRoZVxuICAgIC8vIGN1cnJlbnRseSBjaGVja2VkIG91dCByZXZpc2lvbi9TSEEuXG4gICAgaWYgKGJyYW5jaE5hbWUgPT09ICdIRUFEJykge1xuICAgICAgcmV0dXJuIHRoaXMucnVuKFsncmV2LXBhcnNlJywgJ0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgICB9XG4gICAgcmV0dXJuIGJyYW5jaE5hbWU7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIHRoZSBjdXJyZW50IEdpdCByZXBvc2l0b3J5IGhhcyB1bmNvbW1pdHRlZCBjaGFuZ2VzLiAqL1xuICBoYXNVbmNvbW1pdHRlZENoYW5nZXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucnVuR3JhY2VmdWwoWydkaWZmLWluZGV4JywgJy0tcXVpZXQnLCAnSEVBRCddKS5zdGF0dXMgIT09IDA7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIG91dCBhIHJlcXVlc3RlZCBicmFuY2ggb3IgcmV2aXNpb24sIG9wdGlvbmFsbHkgY2xlYW5pbmcgdGhlIHN0YXRlIG9mIHRoZSByZXBvc2l0b3J5XG4gICAqIGJlZm9yZSBhdHRlbXB0aW5nIHRoZSBjaGVja2luZy4gUmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBicmFuY2ggb3IgcmV2aXNpb25cbiAgICogd2FzIGNsZWFubHkgY2hlY2tlZCBvdXQuXG4gICAqL1xuICBjaGVja291dChicmFuY2hPclJldmlzaW9uOiBzdHJpbmcsIGNsZWFuU3RhdGU6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICBpZiAoY2xlYW5TdGF0ZSkge1xuICAgICAgLy8gQWJvcnQgYW55IG91dHN0YW5kaW5nIGFtcy5cbiAgICAgIHRoaXMucnVuR3JhY2VmdWwoWydhbScsICctLWFib3J0J10sIHtzdGRpbzogJ2lnbm9yZSd9KTtcbiAgICAgIC8vIEFib3J0IGFueSBvdXRzdGFuZGluZyBjaGVycnktcGlja3MuXG4gICAgICB0aGlzLnJ1bkdyYWNlZnVsKFsnY2hlcnJ5LXBpY2snLCAnLS1hYm9ydCddLCB7c3RkaW86ICdpZ25vcmUnfSk7XG4gICAgICAvLyBBYm9ydCBhbnkgb3V0c3RhbmRpbmcgcmViYXNlcy5cbiAgICAgIHRoaXMucnVuR3JhY2VmdWwoWydyZWJhc2UnLCAnLS1hYm9ydCddLCB7c3RkaW86ICdpZ25vcmUnfSk7XG4gICAgICAvLyBDbGVhciBhbnkgY2hhbmdlcyBpbiB0aGUgY3VycmVudCByZXBvLlxuICAgICAgdGhpcy5ydW5HcmFjZWZ1bChbJ3Jlc2V0JywgJy0taGFyZCddLCB7c3RkaW86ICdpZ25vcmUnfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJ1bkdyYWNlZnVsKFsnY2hlY2tvdXQnLCBicmFuY2hPclJldmlzaW9uXSwge3N0ZGlvOiAnaWdub3JlJ30pLnN0YXR1cyA9PT0gMDtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBsYXRlc3QgZ2l0IHRhZyBvbiB0aGUgY3VycmVudCBicmFuY2ggdGhhdCBtYXRjaGVzIFNlbVZlci4gKi9cbiAgZ2V0TGF0ZXN0U2VtdmVyVGFnKCk6IFNlbVZlciB7XG4gICAgY29uc3Qgc2VtVmVyT3B0aW9uczogU2VtVmVyT3B0aW9ucyA9IHtsb29zZTogdHJ1ZX07XG4gICAgY29uc3QgdGFncyA9IHRoaXMucnVuR3JhY2VmdWwoWyd0YWcnLCAnLS1zb3J0PS1jb21taXR0ZXJkYXRlJywgJy0tbWVyZ2VkJ10pLnN0ZG91dC5zcGxpdCgnXFxuJyk7XG4gICAgY29uc3QgbGF0ZXN0VGFnID0gdGFncy5maW5kKCh0YWc6IHN0cmluZykgPT4gcGFyc2UodGFnLCBzZW1WZXJPcHRpb25zKSk7XG5cbiAgICBpZiAobGF0ZXN0VGFnID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgVW5hYmxlIHRvIGZpbmQgYSBTZW1WZXIgbWF0Y2hpbmcgdGFnIG9uIFwiJHt0aGlzLmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCl9XCJgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBTZW1WZXIobGF0ZXN0VGFnLCBzZW1WZXJPcHRpb25zKTtcbiAgfVxuXG4gIC8qKiBSZXRyaWV2ZXMgdGhlIGdpdCB0YWcgbWF0Y2hpbmcgdGhlIHByb3ZpZGVkIFNlbVZlciwgaWYgaXQgZXhpc3RzLiAqL1xuICBnZXRNYXRjaGluZ1RhZ0ZvclNlbXZlcihzZW12ZXI6IFNlbVZlcik6IHN0cmluZyB7XG4gICAgY29uc3Qgc2VtVmVyT3B0aW9uczogU2VtVmVyT3B0aW9ucyA9IHtsb29zZTogdHJ1ZX07XG4gICAgY29uc3QgdGFncyA9IHRoaXMucnVuR3JhY2VmdWwoWyd0YWcnLCAnLS1zb3J0PS1jb21taXR0ZXJkYXRlJywgJy0tbWVyZ2VkJ10pLnN0ZG91dC5zcGxpdCgnXFxuJyk7XG4gICAgY29uc3QgbWF0Y2hpbmdUYWcgPVxuICAgICAgICB0YWdzLmZpbmQoKHRhZzogc3RyaW5nKSA9PiBwYXJzZSh0YWcsIHNlbVZlck9wdGlvbnMpPy5jb21wYXJlKHNlbXZlcikgPT09IDApO1xuXG4gICAgaWYgKG1hdGNoaW5nVGFnID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGZpbmQgYSB0YWcgZm9yIHRoZSB2ZXJzaW9uOiBcIiR7c2VtdmVyLmZvcm1hdCgpfVwiYCk7XG4gICAgfVxuICAgIHJldHVybiBtYXRjaGluZ1RhZztcbiAgfVxuXG4gIC8qKiBSZXRyaWV2ZSBhIGxpc3Qgb2YgYWxsIGZpbGVzIGluIHRoZSByZXBvc2l0b3J5IGNoYW5nZWQgc2luY2UgdGhlIHByb3ZpZGVkIHNoYU9yUmVmLiAqL1xuICBhbGxDaGFuZ2VzRmlsZXNTaW5jZShzaGFPclJlZiA9ICdIRUFEJyk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KFtcbiAgICAgIC4uLmdpdE91dHB1dEFzQXJyYXkodGhpcy5ydW5HcmFjZWZ1bChbJ2RpZmYnLCAnLS1uYW1lLW9ubHknLCAnLS1kaWZmLWZpbHRlcj1kJywgc2hhT3JSZWZdKSksXG4gICAgICAuLi5naXRPdXRwdXRBc0FycmF5KHRoaXMucnVuR3JhY2VmdWwoWydscy1maWxlcycsICctLW90aGVycycsICctLWV4Y2x1ZGUtc3RhbmRhcmQnXSkpLFxuICAgIF0pKTtcbiAgfVxuXG4gIC8qKiBSZXRyaWV2ZSBhIGxpc3Qgb2YgYWxsIGZpbGVzIGN1cnJlbnRseSBzdGFnZWQgaW4gdGhlIHJlcG9zdGl0b3J5LiAqL1xuICBhbGxTdGFnZWRGaWxlcygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIGdpdE91dHB1dEFzQXJyYXkoXG4gICAgICAgIHRoaXMucnVuR3JhY2VmdWwoWydkaWZmJywgJy0tbmFtZS1vbmx5JywgJy0tZGlmZi1maWx0ZXI9QUNNJywgJy0tc3RhZ2VkJ10pKTtcbiAgfVxuXG4gIC8qKiBSZXRyaWV2ZSBhIGxpc3Qgb2YgYWxsIGZpbGVzIHRyYWNrZWQgaW4gdGhlIHJlcG9zaXRvcnkuICovXG4gIGFsbEZpbGVzKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gZ2l0T3V0cHV0QXNBcnJheSh0aGlzLnJ1bkdyYWNlZnVsKFsnbHMtZmlsZXMnXSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNhbml0aXplcyB0aGUgZ2l2ZW4gY29uc29sZSBtZXNzYWdlLiBUaGlzIG1ldGhvZCBjYW4gYmUgb3ZlcnJpZGRlbiBieVxuICAgKiBkZXJpdmVkIGNsYXNzZXMuIGUuZy4gdG8gc2FuaXRpemUgYWNjZXNzIHRva2VucyBmcm9tIEdpdCBjb21tYW5kcy5cbiAgICovXG4gIHNhbml0aXplQ29uc29sZU91dHB1dCh2YWx1ZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdmVyYm9zZSBsb2dnaW5nIG9mIEdpdCBhY3Rpb25zIHNob3VsZCBiZSB1c2VkLiAqL1xuICBwcml2YXRlIHN0YXRpYyB2ZXJib3NlTG9nZ2luZyA9IGZhbHNlO1xuXG4gIC8qKiBUaGUgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSB1bmF1dGhlbnRpY2F0ZWQgYEdpdENsaWVudGAuICovXG4gIHByaXZhdGUgc3RhdGljIF91bmF1dGhlbnRpY2F0ZWRJbnN0YW5jZTogR2l0Q2xpZW50O1xuXG4gIC8qKiBTZXQgdGhlIHZlcmJvc2UgbG9nZ2luZyBzdGF0ZSBvZiBhbGwgZ2l0IGNsaWVudCBpbnN0YW5jZXMuICovXG4gIHN0YXRpYyBzZXRWZXJib3NlTG9nZ2luZ1N0YXRlKHZlcmJvc2U6IGJvb2xlYW4pIHtcbiAgICBHaXRDbGllbnQudmVyYm9zZUxvZ2dpbmcgPSB2ZXJib3NlO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXRpYyBtZXRob2QgdG8gZ2V0IHRoZSBzaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIGBHaXRDbGllbnRgLCBjcmVhdGluZyBpdFxuICAgKiBpZiBpdCBoYXMgbm90IHlldCBiZWVuIGNyZWF0ZWQuXG4gICAqL1xuICBzdGF0aWMgZ2V0KCk6IEdpdENsaWVudCB7XG4gICAgaWYgKCF0aGlzLl91bmF1dGhlbnRpY2F0ZWRJbnN0YW5jZSkge1xuICAgICAgR2l0Q2xpZW50Ll91bmF1dGhlbnRpY2F0ZWRJbnN0YW5jZSA9IG5ldyBHaXRDbGllbnQoKTtcbiAgICB9XG4gICAgcmV0dXJuIEdpdENsaWVudC5fdW5hdXRoZW50aWNhdGVkSW5zdGFuY2U7XG4gIH1cbn1cblxuLyoqXG4gKiBUYWtlcyB0aGUgb3V0cHV0IGZyb20gYHJ1bmAgYW5kIGBydW5HcmFjZWZ1bGAgYW5kIHJldHVybnMgYW4gYXJyYXkgb2Ygc3RyaW5ncyBmb3IgZWFjaFxuICogbmV3IGxpbmUuIEdpdCBjb21tYW5kcyB0eXBpY2FsbHkgcmV0dXJuIG11bHRpcGxlIG91dHB1dCB2YWx1ZXMgZm9yIGEgY29tbWFuZCBhIHNldCBvZlxuICogc3RyaW5ncyBzZXBhcmF0ZWQgYnkgbmV3IGxpbmVzLlxuICpcbiAqIE5vdGU6IFRoaXMgaXMgc3BlY2lmaWNhbGx5IGNyZWF0ZWQgYXMgYSBsb2NhbGx5IGF2YWlsYWJsZSBmdW5jdGlvbiBmb3IgdXNhZ2UgYXMgY29udmVuaWVuY2VcbiAqIHV0aWxpdHkgd2l0aGluIGBHaXRDbGllbnRgJ3MgbWV0aG9kcyB0byBjcmVhdGUgb3V0cHV0cyBhcyBhcnJheS5cbiAqL1xuZnVuY3Rpb24gZ2l0T3V0cHV0QXNBcnJheShnaXRDb21tYW5kUmVzdWx0OiBTcGF3blN5bmNSZXR1cm5zPHN0cmluZz4pOiBzdHJpbmdbXSB7XG4gIHJldHVybiBnaXRDb21tYW5kUmVzdWx0LnN0ZG91dC5zcGxpdCgnXFxuJykubWFwKHggPT4geC50cmltKCkpLmZpbHRlcih4ID0+ICEheCk7XG59XG5cbi8qKiBEZXRlcm1pbmVzIHRoZSByZXBvc2l0b3J5IGJhc2UgZGlyZWN0b3J5IGZyb20gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuICovXG5mdW5jdGlvbiBkZXRlcm1pbmVSZXBvQmFzZURpckZyb21Dd2QoKSB7XG4gIC8vIFRPRE8oZGV2dmVyc2lvbik6IFJlcGxhY2Ugd2l0aCBjb21tb24gc3Bhd24gc3luYyB1dGlsaXR5IG9uY2UgYXZhaWxhYmxlLlxuICBjb25zdCB7c3Rkb3V0LCBzdGRlcnIsIHN0YXR1c30gPSBzcGF3blN5bmMoXG4gICAgICAnZ2l0JywgWydyZXYtcGFyc2UgLS1zaG93LXRvcGxldmVsJ10sIHtzaGVsbDogdHJ1ZSwgc3RkaW86ICdwaXBlJywgZW5jb2Rpbmc6ICd1dGY4J30pO1xuICBpZiAoc3RhdHVzICE9PSAwKSB7XG4gICAgdGhyb3cgRXJyb3IoXG4gICAgICAgIGBVbmFibGUgdG8gZmluZCB0aGUgcGF0aCB0byB0aGUgYmFzZSBkaXJlY3Rvcnkgb2YgdGhlIHJlcG9zaXRvcnkuXFxuYCArXG4gICAgICAgIGBXYXMgdGhlIGNvbW1hbmQgcnVuIGZyb20gaW5zaWRlIG9mIHRoZSByZXBvP1xcblxcbmAgK1xuICAgICAgICBgJHtzdGRlcnJ9YCk7XG4gIH1cbiAgcmV0dXJuIHN0ZG91dC50cmltKCk7XG59XG4iXX0=