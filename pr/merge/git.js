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
        define("@angular/dev-infra-private/pr/merge/git", ["require", "exports", "tslib", "@octokit/rest", "child_process"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var Octokit = require("@octokit/rest");
    var child_process_1 = require("child_process");
    /** Error for failed Github API requests. */
    var GithubApiRequestError = /** @class */ (function (_super) {
        tslib_1.__extends(GithubApiRequestError, _super);
        function GithubApiRequestError(status, message) {
            var _this = _super.call(this, message) || this;
            _this.status = status;
            return _this;
        }
        return GithubApiRequestError;
    }(Error));
    exports.GithubApiRequestError = GithubApiRequestError;
    /** Error for failed Git commands. */
    var GitCommandError = /** @class */ (function (_super) {
        tslib_1.__extends(GitCommandError, _super);
        function GitCommandError(client, args) {
            var _this = 
            // Errors are not guaranteed to be caught. To ensure that we don't
            // accidentally leak the Github token that might be used in a command,
            // we sanitize the command that will be part of the error message.
            _super.call(this, "Command failed: git " + client.omitGithubTokenFromMessage(args.join(' '))) || this;
            _this.args = args;
            return _this;
        }
        return GitCommandError;
    }(Error));
    exports.GitCommandError = GitCommandError;
    var GitClient = /** @class */ (function () {
        function GitClient(_projectRoot, _githubToken, _config) {
            this._projectRoot = _projectRoot;
            this._githubToken = _githubToken;
            this._config = _config;
            /** Short-hand for accessing the remote configuration. */
            this.remoteConfig = this._config.remote;
            /** Octokit request parameters object for targeting the configured remote. */
            this.remoteParams = { owner: this.remoteConfig.owner, repo: this.remoteConfig.name };
            /** URL that resolves to the configured repository. */
            this.repoGitUrl = this.remoteConfig.useSsh ?
                "git@github.com:" + this.remoteConfig.owner + "/" + this.remoteConfig.name + ".git" :
                "https://" + this._githubToken + "@github.com/" + this.remoteConfig.owner + "/" + this.remoteConfig.name + ".git";
            /** Regular expression that matches the provided Github token. */
            this._tokenRegex = new RegExp(this._githubToken, 'g');
            this.api = new Octokit({ auth: _githubToken });
            this.api.hook.error('request', function (error) {
                // Wrap API errors in a known error class. This allows us to
                // expect Github API errors better and in a non-ambiguous way.
                throw new GithubApiRequestError(error.status, error.message);
            });
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
         * debug failed commands.
         */
        GitClient.prototype.runGraceful = function (args, options) {
            if (options === void 0) { options = {}; }
            // To improve the debugging experience in case something fails, we print all executed
            // Git commands. Note that we do not want to print the token if is contained in the
            // command. It's common to share errors with others if the tool failed.
            console.info('Executing: git', this.omitGithubTokenFromMessage(args.join(' ')));
            var result = child_process_1.spawnSync('git', args, tslib_1.__assign(tslib_1.__assign({ cwd: this._projectRoot, stdio: 'pipe' }, options), { 
                // Encoding is always `utf8` and not overridable. This ensures that this method
                // always returns `string` as output instead of buffers.
                encoding: 'utf8' }));
            if (result.stderr !== null) {
                // Git sometimes prints the command if it failed. This means that it could
                // potentially leak the Github token used for accessing the remote. To avoid
                // printing a token, we sanitize the string before printing the stderr output.
                process.stderr.write(this.omitGithubTokenFromMessage(result.stderr));
            }
            return result;
        };
        /** Whether the given branch contains the specified SHA. */
        GitClient.prototype.hasCommit = function (branchName, sha) {
            return this.run(['branch', branchName, '--contains', sha]).stdout !== '';
        };
        /** Gets the currently checked out branch. */
        GitClient.prototype.getCurrentBranch = function () {
            return this.run(['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim();
        };
        /** Gets whether the current Git repository has uncommitted changes. */
        GitClient.prototype.hasUncommittedChanges = function () {
            return this.runGraceful(['diff-index', '--quiet', 'HEAD']).status !== 0;
        };
        /** Sanitizes a given message by omitting the provided Github token if present. */
        GitClient.prototype.omitGithubTokenFromMessage = function (value) {
            return value.replace(this._tokenRegex, '<TOKEN>');
        };
        return GitClient;
    }());
    exports.GitClient = GitClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL2dpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCx1Q0FBeUM7SUFDekMsK0NBQTRFO0lBRzVFLDRDQUE0QztJQUM1QztRQUEyQyxpREFBSztRQUM5QywrQkFBbUIsTUFBYyxFQUFFLE9BQWU7WUFBbEQsWUFDRSxrQkFBTSxPQUFPLENBQUMsU0FDZjtZQUZrQixZQUFNLEdBQU4sTUFBTSxDQUFROztRQUVqQyxDQUFDO1FBQ0gsNEJBQUM7SUFBRCxDQUFDLEFBSkQsQ0FBMkMsS0FBSyxHQUkvQztJQUpZLHNEQUFxQjtJQU1sQyxxQ0FBcUM7SUFDckM7UUFBcUMsMkNBQUs7UUFDeEMseUJBQVksTUFBaUIsRUFBUyxJQUFjO1lBQXBEO1lBQ0Usa0VBQWtFO1lBQ2xFLHNFQUFzRTtZQUN0RSxrRUFBa0U7WUFDbEUsa0JBQU0seUJBQXVCLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFHLENBQUMsU0FDbEY7WUFMcUMsVUFBSSxHQUFKLElBQUksQ0FBVTs7UUFLcEQsQ0FBQztRQUNILHNCQUFDO0lBQUQsQ0FBQyxBQVBELENBQXFDLEtBQUssR0FPekM7SUFQWSwwQ0FBZTtJQVM1QjtRQWdCRSxtQkFDWSxZQUFvQixFQUFVLFlBQW9CLEVBQ2xELE9BQThCO1lBRDlCLGlCQUFZLEdBQVosWUFBWSxDQUFRO1lBQVUsaUJBQVksR0FBWixZQUFZLENBQVE7WUFDbEQsWUFBTyxHQUFQLE9BQU8sQ0FBdUI7WUFqQjFDLHlEQUF5RDtZQUN6RCxpQkFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQ25DLDZFQUE2RTtZQUM3RSxpQkFBWSxHQUFHLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBQyxDQUFDO1lBQzlFLHNEQUFzRDtZQUN0RCxlQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDbkMsb0JBQWtCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxTQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxTQUFNLENBQUMsQ0FBQztnQkFDM0UsYUFBVyxJQUFJLENBQUMsWUFBWSxvQkFBZSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssU0FDOUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLFNBQU0sQ0FBQztZQUlyQyxpRUFBaUU7WUFDekQsZ0JBQVcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBS3ZELElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxPQUFPLENBQUMsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFDLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLFVBQUEsS0FBSztnQkFDbEMsNERBQTREO2dCQUM1RCw4REFBOEQ7Z0JBQzlELE1BQU0sSUFBSSxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMvRCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxtRUFBbUU7UUFDbkUsdUJBQUcsR0FBSCxVQUFJLElBQWMsRUFBRSxPQUEwQjtZQUM1QyxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMvQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN2QixNQUFNLElBQUksZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQzthQUN2QztZQUNELDRFQUE0RTtZQUM1RSxtREFBbUQ7WUFDbkQsT0FBTyxNQUFrRCxDQUFDO1FBQzVELENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsK0JBQVcsR0FBWCxVQUFZLElBQWMsRUFBRSxPQUE4QjtZQUE5Qix3QkFBQSxFQUFBLFlBQThCO1lBQ3hELHFGQUFxRjtZQUNyRixtRkFBbUY7WUFDbkYsdUVBQXVFO1lBQ3ZFLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWhGLElBQU0sTUFBTSxHQUFHLHlCQUFTLENBQUMsS0FBSyxFQUFFLElBQUksc0NBQ2xDLEdBQUcsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUN0QixLQUFLLEVBQUUsTUFBTSxJQUNWLE9BQU87Z0JBQ1YsK0VBQStFO2dCQUMvRSx3REFBd0Q7Z0JBQ3hELFFBQVEsRUFBRSxNQUFNLElBQ2hCLENBQUM7WUFFSCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssSUFBSSxFQUFFO2dCQUMxQiwwRUFBMEU7Z0JBQzFFLDRFQUE0RTtnQkFDNUUsOEVBQThFO2dCQUM5RSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7YUFDdEU7WUFFRCxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO1FBRUQsMkRBQTJEO1FBQzNELDZCQUFTLEdBQVQsVUFBVSxVQUFrQixFQUFFLEdBQVc7WUFDdkMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssRUFBRSxDQUFDO1FBQzNFLENBQUM7UUFFRCw2Q0FBNkM7UUFDN0Msb0NBQWdCLEdBQWhCO1lBQ0UsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLGNBQWMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN2RSxDQUFDO1FBRUQsdUVBQXVFO1FBQ3ZFLHlDQUFxQixHQUFyQjtZQUNFLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLFlBQVksRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1FBQzFFLENBQUM7UUFFRCxrRkFBa0Y7UUFDbEYsOENBQTBCLEdBQTFCLFVBQTJCLEtBQWE7WUFDdEMsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUNILGdCQUFDO0lBQUQsQ0FBQyxBQXZGRCxJQXVGQztJQXZGWSw4QkFBUyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBPY3Rva2l0IGZyb20gJ0BvY3Rva2l0L3Jlc3QnO1xuaW1wb3J0IHtzcGF3blN5bmMsIFNwYXduU3luY09wdGlvbnMsIFNwYXduU3luY1JldHVybnN9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHtNZXJnZUNvbmZpZ1dpdGhSZW1vdGV9IGZyb20gJy4vY29uZmlnJztcblxuLyoqIEVycm9yIGZvciBmYWlsZWQgR2l0aHViIEFQSSByZXF1ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBHaXRodWJBcGlSZXF1ZXN0RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzdGF0dXM6IG51bWJlciwgbWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gIH1cbn1cblxuLyoqIEVycm9yIGZvciBmYWlsZWQgR2l0IGNvbW1hbmRzLiAqL1xuZXhwb3J0IGNsYXNzIEdpdENvbW1hbmRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoY2xpZW50OiBHaXRDbGllbnQsIHB1YmxpYyBhcmdzOiBzdHJpbmdbXSkge1xuICAgIC8vIEVycm9ycyBhcmUgbm90IGd1YXJhbnRlZWQgdG8gYmUgY2F1Z2h0LiBUbyBlbnN1cmUgdGhhdCB3ZSBkb24ndFxuICAgIC8vIGFjY2lkZW50YWxseSBsZWFrIHRoZSBHaXRodWIgdG9rZW4gdGhhdCBtaWdodCBiZSB1c2VkIGluIGEgY29tbWFuZCxcbiAgICAvLyB3ZSBzYW5pdGl6ZSB0aGUgY29tbWFuZCB0aGF0IHdpbGwgYmUgcGFydCBvZiB0aGUgZXJyb3IgbWVzc2FnZS5cbiAgICBzdXBlcihgQ29tbWFuZCBmYWlsZWQ6IGdpdCAke2NsaWVudC5vbWl0R2l0aHViVG9rZW5Gcm9tTWVzc2FnZShhcmdzLmpvaW4oJyAnKSl9YCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEdpdENsaWVudCB7XG4gIC8qKiBTaG9ydC1oYW5kIGZvciBhY2Nlc3NpbmcgdGhlIHJlbW90ZSBjb25maWd1cmF0aW9uLiAqL1xuICByZW1vdGVDb25maWcgPSB0aGlzLl9jb25maWcucmVtb3RlO1xuICAvKiogT2N0b2tpdCByZXF1ZXN0IHBhcmFtZXRlcnMgb2JqZWN0IGZvciB0YXJnZXRpbmcgdGhlIGNvbmZpZ3VyZWQgcmVtb3RlLiAqL1xuICByZW1vdGVQYXJhbXMgPSB7b3duZXI6IHRoaXMucmVtb3RlQ29uZmlnLm93bmVyLCByZXBvOiB0aGlzLnJlbW90ZUNvbmZpZy5uYW1lfTtcbiAgLyoqIFVSTCB0aGF0IHJlc29sdmVzIHRvIHRoZSBjb25maWd1cmVkIHJlcG9zaXRvcnkuICovXG4gIHJlcG9HaXRVcmwgPSB0aGlzLnJlbW90ZUNvbmZpZy51c2VTc2ggP1xuICAgICAgYGdpdEBnaXRodWIuY29tOiR7dGhpcy5yZW1vdGVDb25maWcub3duZXJ9LyR7dGhpcy5yZW1vdGVDb25maWcubmFtZX0uZ2l0YCA6XG4gICAgICBgaHR0cHM6Ly8ke3RoaXMuX2dpdGh1YlRva2VufUBnaXRodWIuY29tLyR7dGhpcy5yZW1vdGVDb25maWcub3duZXJ9LyR7XG4gICAgICAgICAgdGhpcy5yZW1vdGVDb25maWcubmFtZX0uZ2l0YDtcbiAgLyoqIEluc3RhbmNlIG9mIHRoZSBhdXRoZW50aWNhdGVkIEdpdGh1YiBvY3Rva2l0IEFQSS4gKi9cbiAgYXBpOiBPY3Rva2l0O1xuXG4gIC8qKiBSZWd1bGFyIGV4cHJlc3Npb24gdGhhdCBtYXRjaGVzIHRoZSBwcm92aWRlZCBHaXRodWIgdG9rZW4uICovXG4gIHByaXZhdGUgX3Rva2VuUmVnZXggPSBuZXcgUmVnRXhwKHRoaXMuX2dpdGh1YlRva2VuLCAnZycpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfcHJvamVjdFJvb3Q6IHN0cmluZywgcHJpdmF0ZSBfZ2l0aHViVG9rZW46IHN0cmluZyxcbiAgICAgIHByaXZhdGUgX2NvbmZpZzogTWVyZ2VDb25maWdXaXRoUmVtb3RlKSB7XG4gICAgdGhpcy5hcGkgPSBuZXcgT2N0b2tpdCh7YXV0aDogX2dpdGh1YlRva2VufSk7XG4gICAgdGhpcy5hcGkuaG9vay5lcnJvcigncmVxdWVzdCcsIGVycm9yID0+IHtcbiAgICAgIC8vIFdyYXAgQVBJIGVycm9ycyBpbiBhIGtub3duIGVycm9yIGNsYXNzLiBUaGlzIGFsbG93cyB1cyB0b1xuICAgICAgLy8gZXhwZWN0IEdpdGh1YiBBUEkgZXJyb3JzIGJldHRlciBhbmQgaW4gYSBub24tYW1iaWd1b3VzIHdheS5cbiAgICAgIHRocm93IG5ldyBHaXRodWJBcGlSZXF1ZXN0RXJyb3IoZXJyb3Iuc3RhdHVzLCBlcnJvci5tZXNzYWdlKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBFeGVjdXRlcyB0aGUgZ2l2ZW4gZ2l0IGNvbW1hbmQuIFRocm93cyBpZiB0aGUgY29tbWFuZCBmYWlscy4gKi9cbiAgcnVuKGFyZ3M6IHN0cmluZ1tdLCBvcHRpb25zPzogU3Bhd25TeW5jT3B0aW9ucyk6IE9taXQ8U3Bhd25TeW5jUmV0dXJuczxzdHJpbmc+LCAnc3RhdHVzJz4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMucnVuR3JhY2VmdWwoYXJncywgb3B0aW9ucyk7XG4gICAgaWYgKHJlc3VsdC5zdGF0dXMgIT09IDApIHtcbiAgICAgIHRocm93IG5ldyBHaXRDb21tYW5kRXJyb3IodGhpcywgYXJncyk7XG4gICAgfVxuICAgIC8vIE9taXQgYHN0YXR1c2AgZnJvbSB0aGUgdHlwZSBzbyB0aGF0IGl0J3Mgb2J2aW91cyB0aGF0IHRoZSBzdGF0dXMgaXMgbmV2ZXJcbiAgICAvLyBub24temVybyBhcyBleHBsYWluZWQgaW4gdGhlIG1ldGhvZCBkZXNjcmlwdGlvbi5cbiAgICByZXR1cm4gcmVzdWx0IGFzIE9taXQ8U3Bhd25TeW5jUmV0dXJuczxzdHJpbmc+LCAnc3RhdHVzJz47XG4gIH1cblxuICAvKipcbiAgICogU3Bhd25zIGEgZ2l2ZW4gR2l0IGNvbW1hbmQgcHJvY2Vzcy4gRG9lcyBub3QgdGhyb3cgaWYgdGhlIGNvbW1hbmQgZmFpbHMuIEFkZGl0aW9uYWxseSxcbiAgICogaWYgdGhlcmUgaXMgYW55IHN0ZGVyciBvdXRwdXQsIHRoZSBvdXRwdXQgd2lsbCBiZSBwcmludGVkLiBUaGlzIG1ha2VzIGl0IGVhc2llciB0b1xuICAgKiBkZWJ1ZyBmYWlsZWQgY29tbWFuZHMuXG4gICAqL1xuICBydW5HcmFjZWZ1bChhcmdzOiBzdHJpbmdbXSwgb3B0aW9uczogU3Bhd25TeW5jT3B0aW9ucyA9IHt9KTogU3Bhd25TeW5jUmV0dXJuczxzdHJpbmc+IHtcbiAgICAvLyBUbyBpbXByb3ZlIHRoZSBkZWJ1Z2dpbmcgZXhwZXJpZW5jZSBpbiBjYXNlIHNvbWV0aGluZyBmYWlscywgd2UgcHJpbnQgYWxsIGV4ZWN1dGVkXG4gICAgLy8gR2l0IGNvbW1hbmRzLiBOb3RlIHRoYXQgd2UgZG8gbm90IHdhbnQgdG8gcHJpbnQgdGhlIHRva2VuIGlmIGlzIGNvbnRhaW5lZCBpbiB0aGVcbiAgICAvLyBjb21tYW5kLiBJdCdzIGNvbW1vbiB0byBzaGFyZSBlcnJvcnMgd2l0aCBvdGhlcnMgaWYgdGhlIHRvb2wgZmFpbGVkLlxuICAgIGNvbnNvbGUuaW5mbygnRXhlY3V0aW5nOiBnaXQnLCB0aGlzLm9taXRHaXRodWJUb2tlbkZyb21NZXNzYWdlKGFyZ3Muam9pbignICcpKSk7XG5cbiAgICBjb25zdCByZXN1bHQgPSBzcGF3blN5bmMoJ2dpdCcsIGFyZ3MsIHtcbiAgICAgIGN3ZDogdGhpcy5fcHJvamVjdFJvb3QsXG4gICAgICBzdGRpbzogJ3BpcGUnLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIC8vIEVuY29kaW5nIGlzIGFsd2F5cyBgdXRmOGAgYW5kIG5vdCBvdmVycmlkYWJsZS4gVGhpcyBlbnN1cmVzIHRoYXQgdGhpcyBtZXRob2RcbiAgICAgIC8vIGFsd2F5cyByZXR1cm5zIGBzdHJpbmdgIGFzIG91dHB1dCBpbnN0ZWFkIG9mIGJ1ZmZlcnMuXG4gICAgICBlbmNvZGluZzogJ3V0ZjgnLFxuICAgIH0pO1xuXG4gICAgaWYgKHJlc3VsdC5zdGRlcnIgIT09IG51bGwpIHtcbiAgICAgIC8vIEdpdCBzb21ldGltZXMgcHJpbnRzIHRoZSBjb21tYW5kIGlmIGl0IGZhaWxlZC4gVGhpcyBtZWFucyB0aGF0IGl0IGNvdWxkXG4gICAgICAvLyBwb3RlbnRpYWxseSBsZWFrIHRoZSBHaXRodWIgdG9rZW4gdXNlZCBmb3IgYWNjZXNzaW5nIHRoZSByZW1vdGUuIFRvIGF2b2lkXG4gICAgICAvLyBwcmludGluZyBhIHRva2VuLCB3ZSBzYW5pdGl6ZSB0aGUgc3RyaW5nIGJlZm9yZSBwcmludGluZyB0aGUgc3RkZXJyIG91dHB1dC5cbiAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlKHRoaXMub21pdEdpdGh1YlRva2VuRnJvbU1lc3NhZ2UocmVzdWx0LnN0ZGVycikpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgZ2l2ZW4gYnJhbmNoIGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgU0hBLiAqL1xuICBoYXNDb21taXQoYnJhbmNoTmFtZTogc3RyaW5nLCBzaGE6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJ1bihbJ2JyYW5jaCcsIGJyYW5jaE5hbWUsICctLWNvbnRhaW5zJywgc2hhXSkuc3Rkb3V0ICE9PSAnJztcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBjdXJyZW50bHkgY2hlY2tlZCBvdXQgYnJhbmNoLiAqL1xuICBnZXRDdXJyZW50QnJhbmNoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucnVuKFsncmV2LXBhcnNlJywgJy0tYWJicmV2LXJlZicsICdIRUFEJ10pLnN0ZG91dC50cmltKCk7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIHRoZSBjdXJyZW50IEdpdCByZXBvc2l0b3J5IGhhcyB1bmNvbW1pdHRlZCBjaGFuZ2VzLiAqL1xuICBoYXNVbmNvbW1pdHRlZENoYW5nZXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucnVuR3JhY2VmdWwoWydkaWZmLWluZGV4JywgJy0tcXVpZXQnLCAnSEVBRCddKS5zdGF0dXMgIT09IDA7XG4gIH1cblxuICAvKiogU2FuaXRpemVzIGEgZ2l2ZW4gbWVzc2FnZSBieSBvbWl0dGluZyB0aGUgcHJvdmlkZWQgR2l0aHViIHRva2VuIGlmIHByZXNlbnQuICovXG4gIG9taXRHaXRodWJUb2tlbkZyb21NZXNzYWdlKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKHRoaXMuX3Rva2VuUmVnZXgsICc8VE9LRU4+Jyk7XG4gIH1cbn1cbiJdfQ==