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
        define("@angular/dev-infra-private/release/publish/cli", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/github-yargs", "@angular/dev-infra-private/release/config", "@angular/dev-infra-private/release/publish"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReleasePublishCommandModule = void 0;
    var tslib_1 = require("tslib");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var github_yargs_1 = require("@angular/dev-infra-private/utils/git/github-yargs");
    var index_1 = require("@angular/dev-infra-private/release/config");
    var index_2 = require("@angular/dev-infra-private/release/publish");
    /** Yargs command builder for configuring the `ng-dev release publish` command. */
    function builder(argv) {
        return github_yargs_1.addGithubTokenOption(argv);
    }
    /** Yargs command handler for staging a release. */
    function handler(args) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var config, releaseConfig, projectDir, task, result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = config_1.getConfig();
                        releaseConfig = index_1.getReleaseConfig(config);
                        projectDir = config_1.getRepoBaseDir();
                        task = new index_2.ReleaseTool(releaseConfig, config.github, args.githubToken, projectDir);
                        return [4 /*yield*/, task.run()];
                    case 1:
                        result = _a.sent();
                        switch (result) {
                            case index_2.CompletionState.FATAL_ERROR:
                                console_1.error(console_1.red("Release action has been aborted due to fatal errors. See above."));
                                process.exitCode = 2;
                                break;
                            case index_2.CompletionState.MANUALLY_ABORTED:
                                console_1.info(console_1.yellow("Release action has been manually aborted."));
                                process.exitCode = 1;
                                break;
                            case index_2.CompletionState.SUCCESS:
                                console_1.info(console_1.green("Release action has completed successfully."));
                                break;
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    /** CLI command module for publishing a release. */
    exports.ReleasePublishCommandModule = {
        builder: builder,
        handler: handler,
        command: 'publish',
        describe: 'Publish new releases and configure version branches.',
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvcHVibGlzaC9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUlILGtFQUE2RDtJQUM3RCxvRUFBb0U7SUFDcEUsa0ZBQWtFO0lBQ2xFLG1FQUFpRDtJQUVqRCxvRUFBcUQ7SUFPckQsa0ZBQWtGO0lBQ2xGLFNBQVMsT0FBTyxDQUFDLElBQVU7UUFDekIsT0FBTyxtQ0FBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQsbURBQW1EO0lBQ25ELFNBQWUsT0FBTyxDQUFDLElBQXNDOzs7Ozs7d0JBQ3JELE1BQU0sR0FBRyxrQkFBUyxFQUFFLENBQUM7d0JBQ3JCLGFBQWEsR0FBRyx3QkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDekMsVUFBVSxHQUFHLHVCQUFjLEVBQUUsQ0FBQzt3QkFDOUIsSUFBSSxHQUFHLElBQUksbUJBQVcsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO3dCQUMxRSxxQkFBTSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUE7O3dCQUF6QixNQUFNLEdBQUcsU0FBZ0I7d0JBRS9CLFFBQVEsTUFBTSxFQUFFOzRCQUNkLEtBQUssdUJBQWUsQ0FBQyxXQUFXO2dDQUM5QixlQUFLLENBQUMsYUFBRyxDQUFDLGlFQUFpRSxDQUFDLENBQUMsQ0FBQztnQ0FDOUUsT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7Z0NBQ3JCLE1BQU07NEJBQ1IsS0FBSyx1QkFBZSxDQUFDLGdCQUFnQjtnQ0FDbkMsY0FBSSxDQUFDLGdCQUFNLENBQUMsMkNBQTJDLENBQUMsQ0FBQyxDQUFDO2dDQUMxRCxPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztnQ0FDckIsTUFBTTs0QkFDUixLQUFLLHVCQUFlLENBQUMsT0FBTztnQ0FDMUIsY0FBSSxDQUFDLGVBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDLENBQUM7Z0NBQzFELE1BQU07eUJBQ1Q7Ozs7O0tBQ0Y7SUFFRCxtREFBbUQ7SUFDdEMsUUFBQSwyQkFBMkIsR0FBNkM7UUFDbkYsT0FBTyxTQUFBO1FBQ1AsT0FBTyxTQUFBO1FBQ1AsT0FBTyxFQUFFLFNBQVM7UUFDbEIsUUFBUSxFQUFFLHNEQUFzRDtLQUNqRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXJndW1lbnRzLCBBcmd2LCBDb21tYW5kTW9kdWxlfSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7Z2V0Q29uZmlnLCBnZXRSZXBvQmFzZURpcn0gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZXJyb3IsIGdyZWVuLCBpbmZvLCByZWQsIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge2FkZEdpdGh1YlRva2VuT3B0aW9ufSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViLXlhcmdzJztcbmltcG9ydCB7Z2V0UmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcblxuaW1wb3J0IHtDb21wbGV0aW9uU3RhdGUsIFJlbGVhc2VUb29sfSBmcm9tICcuL2luZGV4JztcblxuLyoqIENvbW1hbmQgbGluZSBvcHRpb25zIGZvciBwdWJsaXNoaW5nIGEgcmVsZWFzZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVsZWFzZVB1Ymxpc2hPcHRpb25zIHtcbiAgZ2l0aHViVG9rZW46IHN0cmluZztcbn1cblxuLyoqIFlhcmdzIGNvbW1hbmQgYnVpbGRlciBmb3IgY29uZmlndXJpbmcgdGhlIGBuZy1kZXYgcmVsZWFzZSBwdWJsaXNoYCBjb21tYW5kLiAqL1xuZnVuY3Rpb24gYnVpbGRlcihhcmd2OiBBcmd2KTogQXJndjxSZWxlYXNlUHVibGlzaE9wdGlvbnM+IHtcbiAgcmV0dXJuIGFkZEdpdGh1YlRva2VuT3B0aW9uKGFyZ3YpO1xufVxuXG4vKiogWWFyZ3MgY29tbWFuZCBoYW5kbGVyIGZvciBzdGFnaW5nIGEgcmVsZWFzZS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoYXJnczogQXJndW1lbnRzPFJlbGVhc2VQdWJsaXNoT3B0aW9ucz4pIHtcbiAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gIGNvbnN0IHJlbGVhc2VDb25maWcgPSBnZXRSZWxlYXNlQ29uZmlnKGNvbmZpZyk7XG4gIGNvbnN0IHByb2plY3REaXIgPSBnZXRSZXBvQmFzZURpcigpO1xuICBjb25zdCB0YXNrID0gbmV3IFJlbGVhc2VUb29sKHJlbGVhc2VDb25maWcsIGNvbmZpZy5naXRodWIsIGFyZ3MuZ2l0aHViVG9rZW4sIHByb2plY3REaXIpO1xuICBjb25zdCByZXN1bHQgPSBhd2FpdCB0YXNrLnJ1bigpO1xuXG4gIHN3aXRjaCAocmVzdWx0KSB7XG4gICAgY2FzZSBDb21wbGV0aW9uU3RhdGUuRkFUQUxfRVJST1I6XG4gICAgICBlcnJvcihyZWQoYFJlbGVhc2UgYWN0aW9uIGhhcyBiZWVuIGFib3J0ZWQgZHVlIHRvIGZhdGFsIGVycm9ycy4gU2VlIGFib3ZlLmApKTtcbiAgICAgIHByb2Nlc3MuZXhpdENvZGUgPSAyO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBDb21wbGV0aW9uU3RhdGUuTUFOVUFMTFlfQUJPUlRFRDpcbiAgICAgIGluZm8oeWVsbG93KGBSZWxlYXNlIGFjdGlvbiBoYXMgYmVlbiBtYW51YWxseSBhYm9ydGVkLmApKTtcbiAgICAgIHByb2Nlc3MuZXhpdENvZGUgPSAxO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBDb21wbGV0aW9uU3RhdGUuU1VDQ0VTUzpcbiAgICAgIGluZm8oZ3JlZW4oYFJlbGVhc2UgYWN0aW9uIGhhcyBjb21wbGV0ZWQgc3VjY2Vzc2Z1bGx5LmApKTtcbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbi8qKiBDTEkgY29tbWFuZCBtb2R1bGUgZm9yIHB1Ymxpc2hpbmcgYSByZWxlYXNlLiAqL1xuZXhwb3J0IGNvbnN0IFJlbGVhc2VQdWJsaXNoQ29tbWFuZE1vZHVsZTogQ29tbWFuZE1vZHVsZTx7fSwgUmVsZWFzZVB1Ymxpc2hPcHRpb25zPiA9IHtcbiAgYnVpbGRlcixcbiAgaGFuZGxlcixcbiAgY29tbWFuZDogJ3B1Ymxpc2gnLFxuICBkZXNjcmliZTogJ1B1Ymxpc2ggbmV3IHJlbGVhc2VzIGFuZCBjb25maWd1cmUgdmVyc2lvbiBicmFuY2hlcy4nLFxufTtcbiJdfQ==