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
            // Set the prototype explicitly because in ES5, the prototype is accidentally lost due to
            // a limitation in down-leveling.
            // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
            Object.setPrototypeOf(_this, GitCommandError.prototype);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0LWNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9naXQvZ2l0LWNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsK0NBQTRFO0lBQzVFLGlDQUErRDtJQUUvRCxrRUFBK0Q7SUFDL0Qsb0VBQXVDO0lBQ3ZDLG9FQUFpRDtJQUVqRCxzRUFBc0M7SUFDdEMsZ0ZBQWtEO0lBRWxELHFDQUFxQztJQUNyQztRQUFxQywyQ0FBSztRQUN4Qyx5QkFBWSxNQUFpQixFQUFTLElBQWM7WUFBcEQ7WUFDRSxrRUFBa0U7WUFDbEUsc0VBQXNFO1lBQ3RFLGtFQUFrRTtZQUNsRSxrQkFBTSx5QkFBdUIsTUFBTSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUcsQ0FBQyxTQU03RTtZQVZxQyxVQUFJLEdBQUosSUFBSSxDQUFVO1lBTWxELHlGQUF5RjtZQUN6RixpQ0FBaUM7WUFDakMsaUhBQWlIO1lBQ2pILE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSSxFQUFFLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7UUFDekQsQ0FBQztRQUNILHNCQUFDO0lBQUQsQ0FBQyxBQVpELENBQXFDLEtBQUssR0FZekM7SUFaWSwwQ0FBZTtJQW1CNUIsK0VBQStFO0lBQy9FO1FBVUU7UUFDSSx3REFBd0Q7UUFDL0MsT0FBdUM7UUFDaEQsdUVBQXVFO1FBQzlELE1BQTJCO1lBRjNCLHdCQUFBLEVBQUEsVUFBVSwyQkFBMkIsRUFBRTtZQUV2Qyx1QkFBQSxFQUFBLFNBQVMsa0JBQVMsQ0FBQyxPQUFPLENBQUM7WUFGM0IsWUFBTyxHQUFQLE9BQU8sQ0FBZ0M7WUFFdkMsV0FBTSxHQUFOLE1BQU0sQ0FBcUI7WUFieEMsaUVBQWlFO1lBQ3hELGlCQUFZLEdBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFB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Q29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7c3Bhd25TeW5jLCBTcGF3blN5bmNPcHRpb25zLCBTcGF3blN5bmNSZXR1cm5zfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7T3B0aW9ucyBhcyBTZW1WZXJPcHRpb25zLCBwYXJzZSwgU2VtVmVyfSBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge2dldENvbmZpZywgR2l0aHViQ29uZmlnLCBOZ0RldkNvbmZpZ30gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7ZGVidWcsIGluZm99IGZyb20gJy4uL2NvbnNvbGUnO1xuaW1wb3J0IHtEcnlSdW5FcnJvciwgaXNEcnlSdW59IGZyb20gJy4uL2RyeS1ydW4nO1xuXG5pbXBvcnQge0dpdGh1YkNsaWVudH0gZnJvbSAnLi9naXRodWInO1xuaW1wb3J0IHtnZXRSZXBvc2l0b3J5R2l0VXJsfSBmcm9tICcuL2dpdGh1Yi11cmxzJztcblxuLyoqIEVycm9yIGZvciBmYWlsZWQgR2l0IGNvbW1hbmRzLiAqL1xuZXhwb3J0IGNsYXNzIEdpdENvbW1hbmRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoY2xpZW50OiBHaXRDbGllbnQsIHB1YmxpYyBhcmdzOiBzdHJpbmdbXSkge1xuICAgIC8vIEVycm9ycyBhcmUgbm90IGd1YXJhbnRlZWQgdG8gYmUgY2F1Z2h0LiBUbyBlbnN1cmUgdGhhdCB3ZSBkb24ndFxuICAgIC8vIGFjY2lkZW50YWxseSBsZWFrIHRoZSBHaXRodWIgdG9rZW4gdGhhdCBtaWdodCBiZSB1c2VkIGluIGEgY29tbWFuZCxcbiAgICAvLyB3ZSBzYW5pdGl6ZSB0aGUgY29tbWFuZCB0aGF0IHdpbGwgYmUgcGFydCBvZiB0aGUgZXJyb3IgbWVzc2FnZS5cbiAgICBzdXBlcihgQ29tbWFuZCBmYWlsZWQ6IGdpdCAke2NsaWVudC5zYW5pdGl6ZUNvbnNvbGVPdXRwdXQoYXJncy5qb2luKCcgJykpfWApO1xuXG4gICAgLy8gU2V0IHRoZSBwcm90b3R5cGUgZXhwbGljaXRseSBiZWNhdXNlIGluIEVTNSwgdGhlIHByb3RvdHlwZSBpcyBhY2NpZGVudGFsbHkgbG9zdCBkdWUgdG9cbiAgICAvLyBhIGxpbWl0YXRpb24gaW4gZG93bi1sZXZlbGluZy5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvd2lraS9GQVEjd2h5LWRvZXNudC1leHRlbmRpbmctYnVpbHQtaW5zLWxpa2UtZXJyb3ItYXJyYXktYW5kLW1hcC13b3JrLlxuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBHaXRDb21tYW5kRXJyb3IucHJvdG90eXBlKTtcbiAgfVxufVxuXG4vKiogVGhlIG9wdGlvbnMgYXZhaWxhYmxlIGZvciB0aGUgYEdpdENsaWVudGBgcnVuYCBhbmQgYHJ1bkdyYWNlZnVsYCBtZXRob2RzLiAqL1xudHlwZSBHaXRDb21tYW5kUnVuT3B0aW9ucyA9IFNwYXduU3luY09wdGlvbnMme1xuICB2ZXJib3NlTG9nZ2luZz86IGJvb2xlYW47XG59O1xuXG4vKiogQ2xhc3MgdGhhdCBjYW4gYmUgdXNlZCB0byBwZXJmb3JtIEdpdCBpbnRlcmFjdGlvbnMgd2l0aCBhIGdpdmVuIHJlbW90ZS4gKiovXG5leHBvcnQgY2xhc3MgR2l0Q2xpZW50IHtcbiAgLyoqIFNob3J0LWhhbmQgZm9yIGFjY2Vzc2luZyB0aGUgZGVmYXVsdCByZW1vdGUgY29uZmlndXJhdGlvbi4gKi9cbiAgcmVhZG9ubHkgcmVtb3RlQ29uZmlnOiBHaXRodWJDb25maWcgPSB0aGlzLmNvbmZpZy5naXRodWI7XG5cbiAgLyoqIE9jdG9raXQgcmVxdWVzdCBwYXJhbWV0ZXJzIG9iamVjdCBmb3IgdGFyZ2V0aW5nIHRoZSBjb25maWd1cmVkIHJlbW90ZS4gKi9cbiAgcmVhZG9ubHkgcmVtb3RlUGFyYW1zID0ge293bmVyOiB0aGlzLnJlbW90ZUNvbmZpZy5vd25lciwgcmVwbzogdGhpcy5yZW1vdGVDb25maWcubmFtZX07XG5cbiAgLyoqIEluc3RhbmNlIG9mIHRoZSBHaXRodWIgY2xpZW50LiAqL1xuICByZWFkb25seSBnaXRodWIgPSBuZXcgR2l0aHViQ2xpZW50KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICAvKiogVGhlIGZ1bGwgcGF0aCB0byB0aGUgcm9vdCBvZiB0aGUgcmVwb3NpdG9yeSBiYXNlLiAqL1xuICAgICAgcmVhZG9ubHkgYmFzZURpciA9IGRldGVybWluZVJlcG9CYXNlRGlyRnJvbUN3ZCgpLFxuICAgICAgLyoqIFRoZSBjb25maWd1cmF0aW9uLCBjb250YWluaW5nIHRoZSBnaXRodWIgc3BlY2lmaWMgY29uZmlndXJhdGlvbi4gKi9cbiAgICAgIHJlYWRvbmx5IGNvbmZpZyA9IGdldENvbmZpZyhiYXNlRGlyKSkge31cblxuICAvKiogRXhlY3V0ZXMgdGhlIGdpdmVuIGdpdCBjb21tYW5kLiBUaHJvd3MgaWYgdGhlIGNvbW1hbmQgZmFpbHMuICovXG4gIHJ1bihhcmdzOiBzdHJpbmdbXSwgb3B0aW9ucz86IEdpdENvbW1hbmRSdW5PcHRpb25zKTogT21pdDxTcGF3blN5bmNSZXR1cm5zPHN0cmluZz4sICdzdGF0dXMnPiB7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5ydW5HcmFjZWZ1bChhcmdzLCBvcHRpb25zKTtcbiAgICBpZiAocmVzdWx0LnN0YXR1cyAhPT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEdpdENvbW1hbmRFcnJvcih0aGlzLCBhcmdzKTtcbiAgICB9XG4gICAgLy8gT21pdCBgc3RhdHVzYCBmcm9tIHRoZSB0eXBlIHNvIHRoYXQgaXQncyBvYnZpb3VzIHRoYXQgdGhlIHN0YXR1cyBpcyBuZXZlclxuICAgIC8vIG5vbi16ZXJvIGFzIGV4cGxhaW5lZCBpbiB0aGUgbWV0aG9kIGRlc2NyaXB0aW9uLlxuICAgIHJldHVybiByZXN1bHQgYXMgT21pdDxTcGF3blN5bmNSZXR1cm5zPHN0cmluZz4sICdzdGF0dXMnPjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTcGF3bnMgYSBnaXZlbiBHaXQgY29tbWFuZCBwcm9jZXNzLiBEb2VzIG5vdCB0aHJvdyBpZiB0aGUgY29tbWFuZCBmYWlscy4gQWRkaXRpb25hbGx5LFxuICAgKiBpZiB0aGVyZSBpcyBhbnkgc3RkZXJyIG91dHB1dCwgdGhlIG91dHB1dCB3aWxsIGJlIHByaW50ZWQuIFRoaXMgbWFrZXMgaXQgZWFzaWVyIHRvXG4gICAqIGluZm8gZmFpbGVkIGNvbW1hbmRzLlxuICAgKi9cbiAgcnVuR3JhY2VmdWwoYXJnczogc3RyaW5nW10sIG9wdGlvbnM6IEdpdENvbW1hbmRSdW5PcHRpb25zID0ge30pOiBTcGF3blN5bmNSZXR1cm5zPHN0cmluZz4ge1xuICAgIC8qKiBUaGUgZ2l0IGNvbW1hbmQgdG8gYmUgcnVuLiAqL1xuICAgIGNvbnN0IGdpdENvbW1hbmQgPSBhcmdzWzBdO1xuXG4gICAgaWYgKGlzRHJ5UnVuKCkgJiYgZ2l0Q29tbWFuZCA9PT0gJ3B1c2gnKSB7XG4gICAgICBkZWJ1ZyhgXCJnaXQgcHVzaFwiIGlzIG5vdCBhYmxlIHRvIGJlIHJ1biBpbiBkcnlSdW4gbW9kZS5gKTtcbiAgICAgIHRocm93IG5ldyBEcnlSdW5FcnJvcigpO1xuICAgIH1cblxuICAgIC8vIFRvIGltcHJvdmUgdGhlIGRlYnVnZ2luZyBleHBlcmllbmNlIGluIGNhc2Ugc29tZXRoaW5nIGZhaWxzLCB3ZSBwcmludCBhbGwgZXhlY3V0ZWQgR2l0XG4gICAgLy8gY29tbWFuZHMgYXQgdGhlIERFQlVHIGxldmVsIHRvIGJldHRlciB1bmRlcnN0YW5kIHRoZSBnaXQgYWN0aW9ucyBvY2N1cnJpbmcuIFZlcmJvc2UgbG9nZ2luZyxcbiAgICAvLyBhbHdheXMgbG9nZ2luZyBhdCB0aGUgSU5GTyBsZXZlbCwgY2FuIGJlIGVuYWJsZWQgZWl0aGVyIGJ5IHNldHRpbmcgdGhlIHZlcmJvc2VMb2dnaW5nXG4gICAgLy8gcHJvcGVydHkgb24gdGhlIEdpdENsaWVudCBjbGFzcyBvciB0aGUgb3B0aW9ucyBvYmplY3QgcHJvdmlkZWQgdG8gdGhlIG1ldGhvZC5cbiAgICBjb25zdCBwcmludEZuID0gKEdpdENsaWVudC52ZXJib3NlTG9nZ2luZyB8fCBvcHRpb25zLnZlcmJvc2VMb2dnaW5nKSA/IGluZm8gOiBkZWJ1ZztcbiAgICAvLyBOb3RlIHRoYXQgd2Ugc2FuaXRpemUgdGhlIGNvbW1hbmQgYmVmb3JlIHByaW50aW5nIGl0IHRvIHRoZSBjb25zb2xlLiBXZSBkbyBub3Qgd2FudCB0b1xuICAgIC8vIHByaW50IGFuIGFjY2VzcyB0b2tlbiBpZiBpdCBpcyBjb250YWluZWQgaW4gdGhlIGNvbW1hbmQuIEl0J3MgY29tbW9uIHRvIHNoYXJlIGVycm9ycyB3aXRoXG4gICAgLy8gb3RoZXJzIGlmIHRoZSB0b29sIGZhaWxlZCwgYW5kIHdlIGRvIG5vdCB3YW50IHRvIGxlYWsgdG9rZW5zLlxuICAgIHByaW50Rm4oJ0V4ZWN1dGluZzogZ2l0JywgdGhpcy5zYW5pdGl6ZUNvbnNvbGVPdXRwdXQoYXJncy5qb2luKCcgJykpKTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IHNwYXduU3luYygnZ2l0JywgYXJncywge1xuICAgICAgY3dkOiB0aGlzLmJhc2VEaXIsXG4gICAgICBzdGRpbzogJ3BpcGUnLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIC8vIEVuY29kaW5nIGlzIGFsd2F5cyBgdXRmOGAgYW5kIG5vdCBvdmVycmlkYWJsZS4gVGhpcyBlbnN1cmVzIHRoYXQgdGhpcyBtZXRob2RcbiAgICAgIC8vIGFsd2F5cyByZXR1cm5zIGBzdHJpbmdgIGFzIG91dHB1dCBpbnN0ZWFkIG9mIGJ1ZmZlcnMuXG4gICAgICBlbmNvZGluZzogJ3V0ZjgnLFxuICAgIH0pO1xuXG4gICAgaWYgKHJlc3VsdC5zdGRlcnIgIT09IG51bGwpIHtcbiAgICAgIC8vIEdpdCBzb21ldGltZXMgcHJpbnRzIHRoZSBjb21tYW5kIGlmIGl0IGZhaWxlZC4gVGhpcyBtZWFucyB0aGF0IGl0IGNvdWxkXG4gICAgICAvLyBwb3RlbnRpYWxseSBsZWFrIHRoZSBHaXRodWIgdG9rZW4gdXNlZCBmb3IgYWNjZXNzaW5nIHRoZSByZW1vdGUuIFRvIGF2b2lkXG4gICAgICAvLyBwcmludGluZyBhIHRva2VuLCB3ZSBzYW5pdGl6ZSB0aGUgc3RyaW5nIGJlZm9yZSBwcmludGluZyB0aGUgc3RkZXJyIG91dHB1dC5cbiAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlKHRoaXMuc2FuaXRpemVDb25zb2xlT3V0cHV0KHJlc3VsdC5zdGRlcnIpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqIEdpdCBVUkwgdGhhdCByZXNvbHZlcyB0byB0aGUgY29uZmlndXJlZCByZXBvc2l0b3J5LiAqL1xuICBnZXRSZXBvR2l0VXJsKCkge1xuICAgIHJldHVybiBnZXRSZXBvc2l0b3J5R2l0VXJsKHRoaXMucmVtb3RlQ29uZmlnKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBnaXZlbiBicmFuY2ggY29udGFpbnMgdGhlIHNwZWNpZmllZCBTSEEuICovXG4gIGhhc0NvbW1pdChicmFuY2hOYW1lOiBzdHJpbmcsIHNoYTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucnVuKFsnYnJhbmNoJywgYnJhbmNoTmFtZSwgJy0tY29udGFpbnMnLCBzaGFdKS5zdGRvdXQgIT09ICcnO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGN1cnJlbnRseSBjaGVja2VkIG91dCBicmFuY2ggb3IgcmV2aXNpb24uICovXG4gIGdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk6IHN0cmluZyB7XG4gICAgY29uc3QgYnJhbmNoTmFtZSA9IHRoaXMucnVuKFsncmV2LXBhcnNlJywgJy0tYWJicmV2LXJlZicsICdIRUFEJ10pLnN0ZG91dC50cmltKCk7XG4gICAgLy8gSWYgbm8gYnJhbmNoIG5hbWUgY291bGQgYmUgcmVzb2x2ZWQuIGkuZS4gYEhFQURgIGhhcyBiZWVuIHJldHVybmVkLCB0aGVuIEdpdFxuICAgIC8vIGlzIGN1cnJlbnRseSBpbiBhIGRldGFjaGVkIHN0YXRlLiBJbiB0aG9zZSBjYXNlcywgd2UganVzdCB3YW50IHRvIHJldHVybiB0aGVcbiAgICAvLyBjdXJyZW50bHkgY2hlY2tlZCBvdXQgcmV2aXNpb24vU0hBLlxuICAgIGlmIChicmFuY2hOYW1lID09PSAnSEVBRCcpIHtcbiAgICAgIHJldHVybiB0aGlzLnJ1bihbJ3Jldi1wYXJzZScsICdIRUFEJ10pLnN0ZG91dC50cmltKCk7XG4gICAgfVxuICAgIHJldHVybiBicmFuY2hOYW1lO1xuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciB0aGUgY3VycmVudCBHaXQgcmVwb3NpdG9yeSBoYXMgdW5jb21taXR0ZWQgY2hhbmdlcy4gKi9cbiAgaGFzVW5jb21taXR0ZWRDaGFuZ2VzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJ1bkdyYWNlZnVsKFsnZGlmZi1pbmRleCcsICctLXF1aWV0JywgJ0hFQUQnXSkuc3RhdHVzICE9PSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBvdXQgYSByZXF1ZXN0ZWQgYnJhbmNoIG9yIHJldmlzaW9uLCBvcHRpb25hbGx5IGNsZWFuaW5nIHRoZSBzdGF0ZSBvZiB0aGUgcmVwb3NpdG9yeVxuICAgKiBiZWZvcmUgYXR0ZW1wdGluZyB0aGUgY2hlY2tpbmcuIFJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgYnJhbmNoIG9yIHJldmlzaW9uXG4gICAqIHdhcyBjbGVhbmx5IGNoZWNrZWQgb3V0LlxuICAgKi9cbiAgY2hlY2tvdXQoYnJhbmNoT3JSZXZpc2lvbjogc3RyaW5nLCBjbGVhblN0YXRlOiBib29sZWFuKTogYm9vbGVhbiB7XG4gICAgaWYgKGNsZWFuU3RhdGUpIHtcbiAgICAgIC8vIEFib3J0IGFueSBvdXRzdGFuZGluZyBhbXMuXG4gICAgICB0aGlzLnJ1bkdyYWNlZnVsKFsnYW0nLCAnLS1hYm9ydCddLCB7c3RkaW86ICdpZ25vcmUnfSk7XG4gICAgICAvLyBBYm9ydCBhbnkgb3V0c3RhbmRpbmcgY2hlcnJ5LXBpY2tzLlxuICAgICAgdGhpcy5ydW5HcmFjZWZ1bChbJ2NoZXJyeS1waWNrJywgJy0tYWJvcnQnXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuICAgICAgLy8gQWJvcnQgYW55IG91dHN0YW5kaW5nIHJlYmFzZXMuXG4gICAgICB0aGlzLnJ1bkdyYWNlZnVsKFsncmViYXNlJywgJy0tYWJvcnQnXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuICAgICAgLy8gQ2xlYXIgYW55IGNoYW5nZXMgaW4gdGhlIGN1cnJlbnQgcmVwby5cbiAgICAgIHRoaXMucnVuR3JhY2VmdWwoWydyZXNldCcsICctLWhhcmQnXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5ydW5HcmFjZWZ1bChbJ2NoZWNrb3V0JywgYnJhbmNoT3JSZXZpc2lvbl0sIHtzdGRpbzogJ2lnbm9yZSd9KS5zdGF0dXMgPT09IDA7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgbGF0ZXN0IGdpdCB0YWcgb24gdGhlIGN1cnJlbnQgYnJhbmNoIHRoYXQgbWF0Y2hlcyBTZW1WZXIuICovXG4gIGdldExhdGVzdFNlbXZlclRhZygpOiBTZW1WZXIge1xuICAgIGNvbnN0IHNlbVZlck9wdGlvbnM6IFNlbVZlck9wdGlvbnMgPSB7bG9vc2U6IHRydWV9O1xuICAgIGNvbnN0IHRhZ3MgPSB0aGlzLnJ1bkdyYWNlZnVsKFsndGFnJywgJy0tc29ydD0tY29tbWl0dGVyZGF0ZScsICctLW1lcmdlZCddKS5zdGRvdXQuc3BsaXQoJ1xcbicpO1xuICAgIGNvbnN0IGxhdGVzdFRhZyA9IHRhZ3MuZmluZCgodGFnOiBzdHJpbmcpID0+IHBhcnNlKHRhZywgc2VtVmVyT3B0aW9ucykpO1xuXG4gICAgaWYgKGxhdGVzdFRhZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFVuYWJsZSB0byBmaW5kIGEgU2VtVmVyIG1hdGNoaW5nIHRhZyBvbiBcIiR7dGhpcy5nZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpfVwiYCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU2VtVmVyKGxhdGVzdFRhZywgc2VtVmVyT3B0aW9ucyk7XG4gIH1cblxuICAvKiogUmV0cmlldmVzIHRoZSBnaXQgdGFnIG1hdGNoaW5nIHRoZSBwcm92aWRlZCBTZW1WZXIsIGlmIGl0IGV4aXN0cy4gKi9cbiAgZ2V0TWF0Y2hpbmdUYWdGb3JTZW12ZXIoc2VtdmVyOiBTZW1WZXIpOiBzdHJpbmcge1xuICAgIGNvbnN0IHNlbVZlck9wdGlvbnM6IFNlbVZlck9wdGlvbnMgPSB7bG9vc2U6IHRydWV9O1xuICAgIGNvbnN0IHRhZ3MgPSB0aGlzLnJ1bkdyYWNlZnVsKFsndGFnJywgJy0tc29ydD0tY29tbWl0dGVyZGF0ZScsICctLW1lcmdlZCddKS5zdGRvdXQuc3BsaXQoJ1xcbicpO1xuICAgIGNvbnN0IG1hdGNoaW5nVGFnID1cbiAgICAgICAgdGFncy5maW5kKCh0YWc6IHN0cmluZykgPT4gcGFyc2UodGFnLCBzZW1WZXJPcHRpb25zKT8uY29tcGFyZShzZW12ZXIpID09PSAwKTtcblxuICAgIGlmIChtYXRjaGluZ1RhZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBmaW5kIGEgdGFnIGZvciB0aGUgdmVyc2lvbjogXCIke3NlbXZlci5mb3JtYXQoKX1cImApO1xuICAgIH1cbiAgICByZXR1cm4gbWF0Y2hpbmdUYWc7XG4gIH1cblxuICAvKiogUmV0cmlldmUgYSBsaXN0IG9mIGFsbCBmaWxlcyBpbiB0aGUgcmVwb3NpdG9yeSBjaGFuZ2VkIHNpbmNlIHRoZSBwcm92aWRlZCBzaGFPclJlZi4gKi9cbiAgYWxsQ2hhbmdlc0ZpbGVzU2luY2Uoc2hhT3JSZWYgPSAnSEVBRCcpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChbXG4gICAgICAuLi5naXRPdXRwdXRBc0FycmF5KHRoaXMucnVuR3JhY2VmdWwoWydkaWZmJywgJy0tbmFtZS1vbmx5JywgJy0tZGlmZi1maWx0ZXI9ZCcsIHNoYU9yUmVmXSkpLFxuICAgICAgLi4uZ2l0T3V0cHV0QXNBcnJheSh0aGlzLnJ1bkdyYWNlZnVsKFsnbHMtZmlsZXMnLCAnLS1vdGhlcnMnLCAnLS1leGNsdWRlLXN0YW5kYXJkJ10pKSxcbiAgICBdKSk7XG4gIH1cblxuICAvKiogUmV0cmlldmUgYSBsaXN0IG9mIGFsbCBmaWxlcyBjdXJyZW50bHkgc3RhZ2VkIGluIHRoZSByZXBvc3RpdG9yeS4gKi9cbiAgYWxsU3RhZ2VkRmlsZXMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBnaXRPdXRwdXRBc0FycmF5KFxuICAgICAgICB0aGlzLnJ1bkdyYWNlZnVsKFsnZGlmZicsICctLW5hbWUtb25seScsICctLWRpZmYtZmlsdGVyPUFDTScsICctLXN0YWdlZCddKSk7XG4gIH1cblxuICAvKiogUmV0cmlldmUgYSBsaXN0IG9mIGFsbCBmaWxlcyB0cmFja2VkIGluIHRoZSByZXBvc2l0b3J5LiAqL1xuICBhbGxGaWxlcygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIGdpdE91dHB1dEFzQXJyYXkodGhpcy5ydW5HcmFjZWZ1bChbJ2xzLWZpbGVzJ10pKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTYW5pdGl6ZXMgdGhlIGdpdmVuIGNvbnNvbGUgbWVzc2FnZS4gVGhpcyBtZXRob2QgY2FuIGJlIG92ZXJyaWRkZW4gYnlcbiAgICogZGVyaXZlZCBjbGFzc2VzLiBlLmcuIHRvIHNhbml0aXplIGFjY2VzcyB0b2tlbnMgZnJvbSBHaXQgY29tbWFuZHMuXG4gICAqL1xuICBzYW5pdGl6ZUNvbnNvbGVPdXRwdXQodmFsdWU6IHN0cmluZykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHZlcmJvc2UgbG9nZ2luZyBvZiBHaXQgYWN0aW9ucyBzaG91bGQgYmUgdXNlZC4gKi9cbiAgcHJpdmF0ZSBzdGF0aWMgdmVyYm9zZUxvZ2dpbmcgPSBmYWxzZTtcblxuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgdW5hdXRoZW50aWNhdGVkIGBHaXRDbGllbnRgLiAqL1xuICBwcml2YXRlIHN0YXRpYyBfdW5hdXRoZW50aWNhdGVkSW5zdGFuY2U6IEdpdENsaWVudDtcblxuICAvKiogU2V0IHRoZSB2ZXJib3NlIGxvZ2dpbmcgc3RhdGUgb2YgYWxsIGdpdCBjbGllbnQgaW5zdGFuY2VzLiAqL1xuICBzdGF0aWMgc2V0VmVyYm9zZUxvZ2dpbmdTdGF0ZSh2ZXJib3NlOiBib29sZWFuKSB7XG4gICAgR2l0Q2xpZW50LnZlcmJvc2VMb2dnaW5nID0gdmVyYm9zZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGF0aWMgbWV0aG9kIHRvIGdldCB0aGUgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSBgR2l0Q2xpZW50YCwgY3JlYXRpbmcgaXRcbiAgICogaWYgaXQgaGFzIG5vdCB5ZXQgYmVlbiBjcmVhdGVkLlxuICAgKi9cbiAgc3RhdGljIGdldCgpOiBHaXRDbGllbnQge1xuICAgIGlmICghdGhpcy5fdW5hdXRoZW50aWNhdGVkSW5zdGFuY2UpIHtcbiAgICAgIEdpdENsaWVudC5fdW5hdXRoZW50aWNhdGVkSW5zdGFuY2UgPSBuZXcgR2l0Q2xpZW50KCk7XG4gICAgfVxuICAgIHJldHVybiBHaXRDbGllbnQuX3VuYXV0aGVudGljYXRlZEluc3RhbmNlO1xuICB9XG59XG5cbi8qKlxuICogVGFrZXMgdGhlIG91dHB1dCBmcm9tIGBydW5gIGFuZCBgcnVuR3JhY2VmdWxgIGFuZCByZXR1cm5zIGFuIGFycmF5IG9mIHN0cmluZ3MgZm9yIGVhY2hcbiAqIG5ldyBsaW5lLiBHaXQgY29tbWFuZHMgdHlwaWNhbGx5IHJldHVybiBtdWx0aXBsZSBvdXRwdXQgdmFsdWVzIGZvciBhIGNvbW1hbmQgYSBzZXQgb2ZcbiAqIHN0cmluZ3Mgc2VwYXJhdGVkIGJ5IG5ldyBsaW5lcy5cbiAqXG4gKiBOb3RlOiBUaGlzIGlzIHNwZWNpZmljYWxseSBjcmVhdGVkIGFzIGEgbG9jYWxseSBhdmFpbGFibGUgZnVuY3Rpb24gZm9yIHVzYWdlIGFzIGNvbnZlbmllbmNlXG4gKiB1dGlsaXR5IHdpdGhpbiBgR2l0Q2xpZW50YCdzIG1ldGhvZHMgdG8gY3JlYXRlIG91dHB1dHMgYXMgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGdpdE91dHB1dEFzQXJyYXkoZ2l0Q29tbWFuZFJlc3VsdDogU3Bhd25TeW5jUmV0dXJuczxzdHJpbmc+KTogc3RyaW5nW10ge1xuICByZXR1cm4gZ2l0Q29tbWFuZFJlc3VsdC5zdGRvdXQuc3BsaXQoJ1xcbicpLm1hcCh4ID0+IHgudHJpbSgpKS5maWx0ZXIoeCA9PiAhIXgpO1xufVxuXG4vKiogRGV0ZXJtaW5lcyB0aGUgcmVwb3NpdG9yeSBiYXNlIGRpcmVjdG9yeSBmcm9tIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5LiAqL1xuZnVuY3Rpb24gZGV0ZXJtaW5lUmVwb0Jhc2VEaXJGcm9tQ3dkKCkge1xuICAvLyBUT0RPKGRldnZlcnNpb24pOiBSZXBsYWNlIHdpdGggY29tbW9uIHNwYXduIHN5bmMgdXRpbGl0eSBvbmNlIGF2YWlsYWJsZS5cbiAgY29uc3Qge3N0ZG91dCwgc3RkZXJyLCBzdGF0dXN9ID0gc3Bhd25TeW5jKFxuICAgICAgJ2dpdCcsIFsncmV2LXBhcnNlIC0tc2hvdy10b3BsZXZlbCddLCB7c2hlbGw6IHRydWUsIHN0ZGlvOiAncGlwZScsIGVuY29kaW5nOiAndXRmOCd9KTtcbiAgaWYgKHN0YXR1cyAhPT0gMCkge1xuICAgIHRocm93IEVycm9yKFxuICAgICAgICBgVW5hYmxlIHRvIGZpbmQgdGhlIHBhdGggdG8gdGhlIGJhc2UgZGlyZWN0b3J5IG9mIHRoZSByZXBvc2l0b3J5LlxcbmAgK1xuICAgICAgICBgV2FzIHRoZSBjb21tYW5kIHJ1biBmcm9tIGluc2lkZSBvZiB0aGUgcmVwbz9cXG5cXG5gICtcbiAgICAgICAgYCR7c3RkZXJyfWApO1xuICB9XG4gIHJldHVybiBzdGRvdXQudHJpbSgpO1xufVxuIl19