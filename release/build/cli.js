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
        define("@angular/dev-infra-private/release/build/cli", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/release/config", "@angular/dev-infra-private/release/build"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReleaseBuildCommandModule = void 0;
    var tslib_1 = require("tslib");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var index_1 = require("@angular/dev-infra-private/release/config");
    var index_2 = require("@angular/dev-infra-private/release/build");
    /** Yargs command builder for configuring the `ng-dev release build` command. */
    function builder(argv) {
        return argv.option('json', {
            type: 'boolean',
            description: 'Whether the built packages should be printed to stdout as JSON.',
            default: false,
        });
    }
    /** Yargs command handler for building a release. */
    function handler(args) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var npmPackages, builtPackages, missingPackages;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        npmPackages = index_1.getReleaseConfig().npmPackages;
                        return [4 /*yield*/, index_2.buildReleaseOutput()];
                    case 1:
                        builtPackages = _a.sent();
                        // If package building failed, print an error and exit with an error code.
                        if (builtPackages === null) {
                            console_1.error(console_1.red("  \u2718   Could not build release output. Please check output above."));
                            process.exit(1);
                        }
                        // If no packages have been built, we assume that this is never correct
                        // and exit with an error code.
                        if (builtPackages.length === 0) {
                            console_1.error(console_1.red("  \u2718   No release packages have been built. Please ensure that the"));
                            console_1.error(console_1.red("      build script is configured correctly in \".ng-dev\"."));
                            process.exit(1);
                        }
                        missingPackages = npmPackages.filter(function (pkgName) { return !builtPackages.find(function (b) { return b.name === pkgName; }); });
                        // Check for configured release packages which have not been built. We want to
                        // error and exit if any configured package has not been built.
                        if (missingPackages.length > 0) {
                            console_1.error(console_1.red("  \u2718   Release output missing for the following packages:"));
                            missingPackages.forEach(function (pkgName) { return console_1.error(console_1.red("      - " + pkgName)); });
                            process.exit(1);
                        }
                        if (args.json) {
                            process.stdout.write(JSON.stringify(builtPackages, null, 2));
                        }
                        else {
                            console_1.info(console_1.green('  ✓   Built release packages.'));
                            builtPackages.forEach(function (_a) {
                                var name = _a.name;
                                return console_1.info(console_1.green("      - " + name));
                            });
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    /** CLI command module for building release output. */
    exports.ReleaseBuildCommandModule = {
        builder: builder,
        handler: handler,
        command: 'build',
        describe: 'Builds the release output for the current branch.',
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvYnVpbGQvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFLSCxvRUFBMEU7SUFDMUUsbUVBQStEO0lBRS9ELGtFQUEyQztJQU8zQyxnRkFBZ0Y7SUFDaEYsU0FBUyxPQUFPLENBQUMsSUFBVTtRQUN6QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQ3pCLElBQUksRUFBRSxTQUFTO1lBQ2YsV0FBVyxFQUFFLGlFQUFpRTtZQUM5RSxPQUFPLEVBQUUsS0FBSztTQUNmLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxvREFBb0Q7SUFDcEQsU0FBZSxPQUFPLENBQUMsSUFBb0M7Ozs7Ozt3QkFDbEQsV0FBVyxHQUFJLHdCQUFnQixFQUFFLFlBQXRCLENBQXVCO3dCQUNyQixxQkFBTSwwQkFBa0IsRUFBRSxFQUFBOzt3QkFBMUMsYUFBYSxHQUFHLFNBQTBCO3dCQUU5QywwRUFBMEU7d0JBQzFFLElBQUksYUFBYSxLQUFLLElBQUksRUFBRTs0QkFDMUIsZUFBSyxDQUFDLGFBQUcsQ0FBQyx1RUFBa0UsQ0FBQyxDQUFDLENBQUM7NEJBQy9FLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCO3dCQUVELHVFQUF1RTt3QkFDdkUsK0JBQStCO3dCQUMvQixJQUFJLGFBQWEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOzRCQUM5QixlQUFLLENBQUMsYUFBRyxDQUFDLHdFQUFtRSxDQUFDLENBQUMsQ0FBQzs0QkFDaEYsZUFBSyxDQUFDLGFBQUcsQ0FBQyw0REFBMEQsQ0FBQyxDQUFDLENBQUM7NEJBQ3ZFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCO3dCQUVLLGVBQWUsR0FDakIsV0FBVyxDQUFDLE1BQU0sQ0FBQyxVQUFBLE9BQU8sSUFBSSxPQUFBLENBQUMsYUFBYyxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFsQixDQUFrQixDQUFDLEVBQTdDLENBQTZDLENBQUMsQ0FBQzt3QkFFakYsOEVBQThFO3dCQUM5RSwrREFBK0Q7d0JBQy9ELElBQUksZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7NEJBQzlCLGVBQUssQ0FBQyxhQUFHLENBQUMsK0RBQTBELENBQUMsQ0FBQyxDQUFDOzRCQUN2RSxlQUFlLENBQUMsT0FBTyxDQUFDLFVBQUEsT0FBTyxJQUFJLE9BQUEsZUFBSyxDQUFDLGFBQUcsQ0FBQyxhQUFXLE9BQVMsQ0FBQyxDQUFDLEVBQWhDLENBQWdDLENBQUMsQ0FBQzs0QkFDckUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDakI7d0JBRUQsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFOzRCQUNiLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUM5RDs2QkFBTTs0QkFDTCxjQUFJLENBQUMsZUFBSyxDQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQzs0QkFDN0MsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEVBQU07b0NBQUwsSUFBSSxVQUFBO2dDQUFNLE9BQUEsY0FBSSxDQUFDLGVBQUssQ0FBQyxhQUFXLElBQU0sQ0FBQyxDQUFDOzRCQUE5QixDQUE4QixDQUFDLENBQUM7eUJBQ25FOzs7OztLQUNGO0lBRUQsc0RBQXNEO0lBQ3pDLFFBQUEseUJBQXlCLEdBQTJDO1FBQy9FLE9BQU8sU0FBQTtRQUNQLE9BQU8sU0FBQTtRQUNQLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLFFBQVEsRUFBRSxtREFBbUQ7S0FDOUQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2dldENvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZXJyb3IsIGdyZWVuLCBpbmZvLCByZWQsIHdhcm4sIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0J1aWx0UGFja2FnZSwgZ2V0UmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcblxuaW1wb3J0IHtidWlsZFJlbGVhc2VPdXRwdXR9IGZyb20gJy4vaW5kZXgnO1xuXG4vKiogQ29tbWFuZCBsaW5lIG9wdGlvbnMgZm9yIGJ1aWxkaW5nIGEgcmVsZWFzZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVsZWFzZUJ1aWxkT3B0aW9ucyB7XG4gIGpzb246IGJvb2xlYW47XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGJ1aWxkZXIgZm9yIGNvbmZpZ3VyaW5nIHRoZSBgbmctZGV2IHJlbGVhc2UgYnVpbGRgIGNvbW1hbmQuICovXG5mdW5jdGlvbiBidWlsZGVyKGFyZ3Y6IEFyZ3YpOiBBcmd2PFJlbGVhc2VCdWlsZE9wdGlvbnM+IHtcbiAgcmV0dXJuIGFyZ3Yub3B0aW9uKCdqc29uJywge1xuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZXNjcmlwdGlvbjogJ1doZXRoZXIgdGhlIGJ1aWx0IHBhY2thZ2VzIHNob3VsZCBiZSBwcmludGVkIHRvIHN0ZG91dCBhcyBKU09OLicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gIH0pO1xufVxuXG4vKiogWWFyZ3MgY29tbWFuZCBoYW5kbGVyIGZvciBidWlsZGluZyBhIHJlbGVhc2UuICovXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVyKGFyZ3M6IEFyZ3VtZW50czxSZWxlYXNlQnVpbGRPcHRpb25zPikge1xuICBjb25zdCB7bnBtUGFja2FnZXN9ID0gZ2V0UmVsZWFzZUNvbmZpZygpO1xuICBsZXQgYnVpbHRQYWNrYWdlcyA9IGF3YWl0IGJ1aWxkUmVsZWFzZU91dHB1dCgpO1xuXG4gIC8vIElmIHBhY2thZ2UgYnVpbGRpbmcgZmFpbGVkLCBwcmludCBhbiBlcnJvciBhbmQgZXhpdCB3aXRoIGFuIGVycm9yIGNvZGUuXG4gIGlmIChidWlsdFBhY2thZ2VzID09PSBudWxsKSB7XG4gICAgZXJyb3IocmVkKGAgIOKcmCAgIENvdWxkIG5vdCBidWlsZCByZWxlYXNlIG91dHB1dC4gUGxlYXNlIGNoZWNrIG91dHB1dCBhYm92ZS5gKSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgLy8gSWYgbm8gcGFja2FnZXMgaGF2ZSBiZWVuIGJ1aWx0LCB3ZSBhc3N1bWUgdGhhdCB0aGlzIGlzIG5ldmVyIGNvcnJlY3RcbiAgLy8gYW5kIGV4aXQgd2l0aCBhbiBlcnJvciBjb2RlLlxuICBpZiAoYnVpbHRQYWNrYWdlcy5sZW5ndGggPT09IDApIHtcbiAgICBlcnJvcihyZWQoYCAg4pyYICAgTm8gcmVsZWFzZSBwYWNrYWdlcyBoYXZlIGJlZW4gYnVpbHQuIFBsZWFzZSBlbnN1cmUgdGhhdCB0aGVgKSk7XG4gICAgZXJyb3IocmVkKGAgICAgICBidWlsZCBzY3JpcHQgaXMgY29uZmlndXJlZCBjb3JyZWN0bHkgaW4gXCIubmctZGV2XCIuYCkpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIGNvbnN0IG1pc3NpbmdQYWNrYWdlcyA9XG4gICAgICBucG1QYWNrYWdlcy5maWx0ZXIocGtnTmFtZSA9PiAhYnVpbHRQYWNrYWdlcyEuZmluZChiID0+IGIubmFtZSA9PT0gcGtnTmFtZSkpO1xuXG4gIC8vIENoZWNrIGZvciBjb25maWd1cmVkIHJlbGVhc2UgcGFja2FnZXMgd2hpY2ggaGF2ZSBub3QgYmVlbiBidWlsdC4gV2Ugd2FudCB0b1xuICAvLyBlcnJvciBhbmQgZXhpdCBpZiBhbnkgY29uZmlndXJlZCBwYWNrYWdlIGhhcyBub3QgYmVlbiBidWlsdC5cbiAgaWYgKG1pc3NpbmdQYWNrYWdlcy5sZW5ndGggPiAwKSB7XG4gICAgZXJyb3IocmVkKGAgIOKcmCAgIFJlbGVhc2Ugb3V0cHV0IG1pc3NpbmcgZm9yIHRoZSBmb2xsb3dpbmcgcGFja2FnZXM6YCkpO1xuICAgIG1pc3NpbmdQYWNrYWdlcy5mb3JFYWNoKHBrZ05hbWUgPT4gZXJyb3IocmVkKGAgICAgICAtICR7cGtnTmFtZX1gKSkpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIGlmIChhcmdzLmpzb24pIHtcbiAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShKU09OLnN0cmluZ2lmeShidWlsdFBhY2thZ2VzLCBudWxsLCAyKSk7XG4gIH0gZWxzZSB7XG4gICAgaW5mbyhncmVlbignICDinJMgICBCdWlsdCByZWxlYXNlIHBhY2thZ2VzLicpKTtcbiAgICBidWlsdFBhY2thZ2VzLmZvckVhY2goKHtuYW1lfSkgPT4gaW5mbyhncmVlbihgICAgICAgLSAke25hbWV9YCkpKTtcbiAgfVxufVxuXG4vKiogQ0xJIGNvbW1hbmQgbW9kdWxlIGZvciBidWlsZGluZyByZWxlYXNlIG91dHB1dC4gKi9cbmV4cG9ydCBjb25zdCBSZWxlYXNlQnVpbGRDb21tYW5kTW9kdWxlOiBDb21tYW5kTW9kdWxlPHt9LCBSZWxlYXNlQnVpbGRPcHRpb25zPiA9IHtcbiAgYnVpbGRlcixcbiAgaGFuZGxlcixcbiAgY29tbWFuZDogJ2J1aWxkJyxcbiAgZGVzY3JpYmU6ICdCdWlsZHMgdGhlIHJlbGVhc2Ugb3V0cHV0IGZvciB0aGUgY3VycmVudCBicmFuY2guJyxcbn07XG4iXX0=