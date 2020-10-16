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
    var config_2 = require("@angular/dev-infra-private/release/config");
    var index_1 = require("@angular/dev-infra-private/release/publish");
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
                        releaseConfig = config_2.getReleaseConfig(config);
                        projectDir = config_1.getRepoBaseDir();
                        task = new index_1.ReleaseTool(releaseConfig, config.github, args.githubToken, projectDir);
                        return [4 /*yield*/, task.run()];
                    case 1:
                        result = _a.sent();
                        switch (result) {
                            case index_1.CompletionState.FATAL_ERROR:
                                console_1.error(console_1.red("Release action has been aborted due to fatal errors. See above."));
                                process.exitCode = 1;
                                break;
                            case index_1.CompletionState.MANUALLY_ABORTED:
                                console_1.info(console_1.yellow("Release action has been manually aborted."));
                                break;
                            case index_1.CompletionState.SUCCESS:
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvcHVibGlzaC9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUlILGtFQUE2RDtJQUM3RCxvRUFBb0U7SUFDcEUsa0ZBQWtFO0lBQ2xFLG9FQUEyQztJQUUzQyxvRUFBcUQ7SUFPckQsa0ZBQWtGO0lBQ2xGLFNBQVMsT0FBTyxDQUFDLElBQVU7UUFDekIsT0FBTyxtQ0FBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQsbURBQW1EO0lBQ25ELFNBQWUsT0FBTyxDQUFDLElBQXNDOzs7Ozs7d0JBQ3JELE1BQU0sR0FBRyxrQkFBUyxFQUFFLENBQUM7d0JBQ3JCLGFBQWEsR0FBRyx5QkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDekMsVUFBVSxHQUFHLHVCQUFjLEVBQUUsQ0FBQzt3QkFDOUIsSUFBSSxHQUFHLElBQUksbUJBQVcsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO3dCQUMxRSxxQkFBTSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUE7O3dCQUF6QixNQUFNLEdBQUcsU0FBZ0I7d0JBRS9CLFFBQVEsTUFBTSxFQUFFOzRCQUNkLEtBQUssdUJBQWUsQ0FBQyxXQUFXO2dDQUM5QixlQUFLLENBQUMsYUFBRyxDQUFDLGlFQUFpRSxDQUFDLENBQUMsQ0FBQztnQ0FDOUUsT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7Z0NBQ3JCLE1BQU07NEJBQ1IsS0FBSyx1QkFBZSxDQUFDLGdCQUFnQjtnQ0FDbkMsY0FBSSxDQUFDLGdCQUFNLENBQUMsMkNBQTJDLENBQUMsQ0FBQyxDQUFDO2dDQUMxRCxNQUFNOzRCQUNSLEtBQUssdUJBQWUsQ0FBQyxPQUFPO2dDQUMxQixjQUFJLENBQUMsZUFBSyxDQUFDLDRDQUE0QyxDQUFDLENBQUMsQ0FBQztnQ0FDMUQsTUFBTTt5QkFDVDs7Ozs7S0FDRjtJQUVELG1EQUFtRDtJQUN0QyxRQUFBLDJCQUEyQixHQUE2QztRQUNuRixPQUFPLFNBQUE7UUFDUCxPQUFPLFNBQUE7UUFDUCxPQUFPLEVBQUUsU0FBUztRQUNsQixRQUFRLEVBQUUsc0RBQXNEO0tBQ2pFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3YsIENvbW1hbmRNb2R1bGV9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtnZXRDb25maWcsIGdldFJlcG9CYXNlRGlyfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtlcnJvciwgZ3JlZW4sIGluZm8sIHJlZCwgeWVsbG93fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7YWRkR2l0aHViVG9rZW5PcHRpb259IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWIteWFyZ3MnO1xuaW1wb3J0IHtnZXRSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuXG5pbXBvcnQge0NvbXBsZXRpb25TdGF0ZSwgUmVsZWFzZVRvb2x9IGZyb20gJy4vaW5kZXgnO1xuXG4vKiogQ29tbWFuZCBsaW5lIG9wdGlvbnMgZm9yIHB1Ymxpc2hpbmcgYSByZWxlYXNlLiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWxlYXNlUHVibGlzaE9wdGlvbnMge1xuICBnaXRodWJUb2tlbjogc3RyaW5nO1xufVxuXG4vKiogWWFyZ3MgY29tbWFuZCBidWlsZGVyIGZvciBjb25maWd1cmluZyB0aGUgYG5nLWRldiByZWxlYXNlIHB1Ymxpc2hgIGNvbW1hbmQuICovXG5mdW5jdGlvbiBidWlsZGVyKGFyZ3Y6IEFyZ3YpOiBBcmd2PFJlbGVhc2VQdWJsaXNoT3B0aW9ucz4ge1xuICByZXR1cm4gYWRkR2l0aHViVG9rZW5PcHRpb24oYXJndik7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGhhbmRsZXIgZm9yIHN0YWdpbmcgYSByZWxlYXNlLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihhcmdzOiBBcmd1bWVudHM8UmVsZWFzZVB1Ymxpc2hPcHRpb25zPikge1xuICBjb25zdCBjb25maWcgPSBnZXRDb25maWcoKTtcbiAgY29uc3QgcmVsZWFzZUNvbmZpZyA9IGdldFJlbGVhc2VDb25maWcoY29uZmlnKTtcbiAgY29uc3QgcHJvamVjdERpciA9IGdldFJlcG9CYXNlRGlyKCk7XG4gIGNvbnN0IHRhc2sgPSBuZXcgUmVsZWFzZVRvb2wocmVsZWFzZUNvbmZpZywgY29uZmlnLmdpdGh1YiwgYXJncy5naXRodWJUb2tlbiwgcHJvamVjdERpcik7XG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRhc2sucnVuKCk7XG5cbiAgc3dpdGNoIChyZXN1bHQpIHtcbiAgICBjYXNlIENvbXBsZXRpb25TdGF0ZS5GQVRBTF9FUlJPUjpcbiAgICAgIGVycm9yKHJlZChgUmVsZWFzZSBhY3Rpb24gaGFzIGJlZW4gYWJvcnRlZCBkdWUgdG8gZmF0YWwgZXJyb3JzLiBTZWUgYWJvdmUuYCkpO1xuICAgICAgcHJvY2Vzcy5leGl0Q29kZSA9IDE7XG4gICAgICBicmVhaztcbiAgICBjYXNlIENvbXBsZXRpb25TdGF0ZS5NQU5VQUxMWV9BQk9SVEVEOlxuICAgICAgaW5mbyh5ZWxsb3coYFJlbGVhc2UgYWN0aW9uIGhhcyBiZWVuIG1hbnVhbGx5IGFib3J0ZWQuYCkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBDb21wbGV0aW9uU3RhdGUuU1VDQ0VTUzpcbiAgICAgIGluZm8oZ3JlZW4oYFJlbGVhc2UgYWN0aW9uIGhhcyBjb21wbGV0ZWQgc3VjY2Vzc2Z1bGx5LmApKTtcbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbi8qKiBDTEkgY29tbWFuZCBtb2R1bGUgZm9yIHB1Ymxpc2hpbmcgYSByZWxlYXNlLiAqL1xuZXhwb3J0IGNvbnN0IFJlbGVhc2VQdWJsaXNoQ29tbWFuZE1vZHVsZTogQ29tbWFuZE1vZHVsZTx7fSwgUmVsZWFzZVB1Ymxpc2hPcHRpb25zPiA9IHtcbiAgYnVpbGRlcixcbiAgaGFuZGxlcixcbiAgY29tbWFuZDogJ3B1Ymxpc2gnLFxuICBkZXNjcmliZTogJ1B1Ymxpc2ggbmV3IHJlbGVhc2VzIGFuZCBjb25maWd1cmUgdmVyc2lvbiBicmFuY2hlcy4nLFxufTtcbiJdfQ==