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
        return argv
            .option('json', {
            type: 'boolean',
            description: 'Whether the built packages should be printed to stdout as JSON.',
            default: false,
        })
            .option('stampForRelease', {
            type: 'boolean',
            description: 'Whether the built packages should be stamped for release.',
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
                        return [4 /*yield*/, index_2.buildReleaseOutput(args.stampForRelease)];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvYnVpbGQvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFLSCxvRUFBMEU7SUFDMUUsbUVBQStEO0lBRS9ELGtFQUEyQztJQVEzQyxnRkFBZ0Y7SUFDaEYsU0FBUyxPQUFPLENBQUMsSUFBVTtRQUN6QixPQUFPLElBQUk7YUFDTixNQUFNLENBQUMsTUFBTSxFQUFFO1lBQ2QsSUFBSSxFQUFFLFNBQVM7WUFDZixXQUFXLEVBQUUsaUVBQWlFO1lBQzlFLE9BQU8sRUFBRSxLQUFLO1NBQ2YsQ0FBQzthQUNELE1BQU0sQ0FBQyxpQkFBaUIsRUFBRTtZQUN6QixJQUFJLEVBQUUsU0FBUztZQUNmLFdBQVcsRUFBRSwyREFBMkQ7WUFDeEUsT0FBTyxFQUFFLEtBQUs7U0FDZixDQUFDLENBQUM7SUFDVCxDQUFDO0lBRUQsb0RBQW9EO0lBQ3BELFNBQWUsT0FBTyxDQUFDLElBQW9DOzs7Ozs7d0JBQ2xELFdBQVcsR0FBSSx3QkFBZ0IsRUFBRSxZQUF0QixDQUF1Qjt3QkFDckIscUJBQU0sMEJBQWtCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFBOzt3QkFBOUQsYUFBYSxHQUFHLFNBQThDO3dCQUVsRSwwRUFBMEU7d0JBQzFFLElBQUksYUFBYSxLQUFLLElBQUksRUFBRTs0QkFDMUIsZUFBSyxDQUFDLGFBQUcsQ0FBQyx1RUFBa0UsQ0FBQyxDQUFDLENBQUM7NEJBQy9FLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCO3dCQUVELHVFQUF1RTt3QkFDdkUsK0JBQStCO3dCQUMvQixJQUFJLGFBQWEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOzRCQUM5QixlQUFLLENBQUMsYUFBRyxDQUFDLHdFQUFtRSxDQUFDLENBQUMsQ0FBQzs0QkFDaEYsZUFBSyxDQUFDLGFBQUcsQ0FBQyw0REFBMEQsQ0FBQyxDQUFDLENBQUM7NEJBQ3ZFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCO3dCQUVLLGVBQWUsR0FDakIsV0FBVyxDQUFDLE1BQU0sQ0FBQyxVQUFBLE9BQU8sSUFBSSxPQUFBLENBQUMsYUFBYyxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFsQixDQUFrQixDQUFDLEVBQTdDLENBQTZDLENBQUMsQ0FBQzt3QkFFakYsOEVBQThFO3dCQUM5RSwrREFBK0Q7d0JBQy9ELElBQUksZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7NEJBQzlCLGVBQUssQ0FBQyxhQUFHLENBQUMsK0RBQTBELENBQUMsQ0FBQyxDQUFDOzRCQUN2RSxlQUFlLENBQUMsT0FBTyxDQUFDLFVBQUEsT0FBTyxJQUFJLE9BQUEsZUFBSyxDQUFDLGFBQUcsQ0FBQyxhQUFXLE9BQVMsQ0FBQyxDQUFDLEVBQWhDLENBQWdDLENBQUMsQ0FBQzs0QkFDckUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDakI7d0JBRUQsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFOzRCQUNiLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUM5RDs2QkFBTTs0QkFDTCxjQUFJLENBQUMsZUFBSyxDQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQzs0QkFDN0MsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEVBQU07b0NBQUwsSUFBSSxVQUFBO2dDQUFNLE9BQUEsY0FBSSxDQUFDLGVBQUssQ0FBQyxhQUFXLElBQU0sQ0FBQyxDQUFDOzRCQUE5QixDQUE4QixDQUFDLENBQUM7eUJBQ25FOzs7OztLQUNGO0lBRUQsc0RBQXNEO0lBQ3pDLFFBQUEseUJBQXlCLEdBQTJDO1FBQy9FLE9BQU8sU0FBQTtRQUNQLE9BQU8sU0FBQTtRQUNQLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLFFBQVEsRUFBRSxtREFBbUQ7S0FDOUQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2dldENvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZXJyb3IsIGdyZWVuLCBpbmZvLCByZWQsIHdhcm4sIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0J1aWx0UGFja2FnZSwgZ2V0UmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcblxuaW1wb3J0IHtidWlsZFJlbGVhc2VPdXRwdXR9IGZyb20gJy4vaW5kZXgnO1xuXG4vKiogQ29tbWFuZCBsaW5lIG9wdGlvbnMgZm9yIGJ1aWxkaW5nIGEgcmVsZWFzZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVsZWFzZUJ1aWxkT3B0aW9ucyB7XG4gIGpzb246IGJvb2xlYW47XG4gIHN0YW1wRm9yUmVsZWFzZTogYm9vbGVhbjtcbn1cblxuLyoqIFlhcmdzIGNvbW1hbmQgYnVpbGRlciBmb3IgY29uZmlndXJpbmcgdGhlIGBuZy1kZXYgcmVsZWFzZSBidWlsZGAgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIGJ1aWxkZXIoYXJndjogQXJndik6IEFyZ3Y8UmVsZWFzZUJ1aWxkT3B0aW9ucz4ge1xuICByZXR1cm4gYXJndlxuICAgICAgLm9wdGlvbignanNvbicsIHtcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1doZXRoZXIgdGhlIGJ1aWx0IHBhY2thZ2VzIHNob3VsZCBiZSBwcmludGVkIHRvIHN0ZG91dCBhcyBKU09OLicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgfSlcbiAgICAgIC5vcHRpb24oJ3N0YW1wRm9yUmVsZWFzZScsIHtcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1doZXRoZXIgdGhlIGJ1aWx0IHBhY2thZ2VzIHNob3VsZCBiZSBzdGFtcGVkIGZvciByZWxlYXNlLicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgfSk7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGhhbmRsZXIgZm9yIGJ1aWxkaW5nIGEgcmVsZWFzZS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoYXJnczogQXJndW1lbnRzPFJlbGVhc2VCdWlsZE9wdGlvbnM+KSB7XG4gIGNvbnN0IHtucG1QYWNrYWdlc30gPSBnZXRSZWxlYXNlQ29uZmlnKCk7XG4gIGxldCBidWlsdFBhY2thZ2VzID0gYXdhaXQgYnVpbGRSZWxlYXNlT3V0cHV0KGFyZ3Muc3RhbXBGb3JSZWxlYXNlKTtcblxuICAvLyBJZiBwYWNrYWdlIGJ1aWxkaW5nIGZhaWxlZCwgcHJpbnQgYW4gZXJyb3IgYW5kIGV4aXQgd2l0aCBhbiBlcnJvciBjb2RlLlxuICBpZiAoYnVpbHRQYWNrYWdlcyA9PT0gbnVsbCkge1xuICAgIGVycm9yKHJlZChgICDinJggICBDb3VsZCBub3QgYnVpbGQgcmVsZWFzZSBvdXRwdXQuIFBsZWFzZSBjaGVjayBvdXRwdXQgYWJvdmUuYCkpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8vIElmIG5vIHBhY2thZ2VzIGhhdmUgYmVlbiBidWlsdCwgd2UgYXNzdW1lIHRoYXQgdGhpcyBpcyBuZXZlciBjb3JyZWN0XG4gIC8vIGFuZCBleGl0IHdpdGggYW4gZXJyb3IgY29kZS5cbiAgaWYgKGJ1aWx0UGFja2FnZXMubGVuZ3RoID09PSAwKSB7XG4gICAgZXJyb3IocmVkKGAgIOKcmCAgIE5vIHJlbGVhc2UgcGFja2FnZXMgaGF2ZSBiZWVuIGJ1aWx0LiBQbGVhc2UgZW5zdXJlIHRoYXQgdGhlYCkpO1xuICAgIGVycm9yKHJlZChgICAgICAgYnVpbGQgc2NyaXB0IGlzIGNvbmZpZ3VyZWQgY29ycmVjdGx5IGluIFwiLm5nLWRldlwiLmApKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICBjb25zdCBtaXNzaW5nUGFja2FnZXMgPVxuICAgICAgbnBtUGFja2FnZXMuZmlsdGVyKHBrZ05hbWUgPT4gIWJ1aWx0UGFja2FnZXMhLmZpbmQoYiA9PiBiLm5hbWUgPT09IHBrZ05hbWUpKTtcblxuICAvLyBDaGVjayBmb3IgY29uZmlndXJlZCByZWxlYXNlIHBhY2thZ2VzIHdoaWNoIGhhdmUgbm90IGJlZW4gYnVpbHQuIFdlIHdhbnQgdG9cbiAgLy8gZXJyb3IgYW5kIGV4aXQgaWYgYW55IGNvbmZpZ3VyZWQgcGFja2FnZSBoYXMgbm90IGJlZW4gYnVpbHQuXG4gIGlmIChtaXNzaW5nUGFja2FnZXMubGVuZ3RoID4gMCkge1xuICAgIGVycm9yKHJlZChgICDinJggICBSZWxlYXNlIG91dHB1dCBtaXNzaW5nIGZvciB0aGUgZm9sbG93aW5nIHBhY2thZ2VzOmApKTtcbiAgICBtaXNzaW5nUGFja2FnZXMuZm9yRWFjaChwa2dOYW1lID0+IGVycm9yKHJlZChgICAgICAgLSAke3BrZ05hbWV9YCkpKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICBpZiAoYXJncy5qc29uKSB7XG4gICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoSlNPTi5zdHJpbmdpZnkoYnVpbHRQYWNrYWdlcywgbnVsbCwgMikpO1xuICB9IGVsc2Uge1xuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgQnVpbHQgcmVsZWFzZSBwYWNrYWdlcy4nKSk7XG4gICAgYnVpbHRQYWNrYWdlcy5mb3JFYWNoKCh7bmFtZX0pID0+IGluZm8oZ3JlZW4oYCAgICAgIC0gJHtuYW1lfWApKSk7XG4gIH1cbn1cblxuLyoqIENMSSBjb21tYW5kIG1vZHVsZSBmb3IgYnVpbGRpbmcgcmVsZWFzZSBvdXRwdXQuICovXG5leHBvcnQgY29uc3QgUmVsZWFzZUJ1aWxkQ29tbWFuZE1vZHVsZTogQ29tbWFuZE1vZHVsZTx7fSwgUmVsZWFzZUJ1aWxkT3B0aW9ucz4gPSB7XG4gIGJ1aWxkZXIsXG4gIGhhbmRsZXIsXG4gIGNvbW1hbmQ6ICdidWlsZCcsXG4gIGRlc2NyaWJlOiAnQnVpbGRzIHRoZSByZWxlYXNlIG91dHB1dCBmb3IgdGhlIGN1cnJlbnQgYnJhbmNoLicsXG59O1xuIl19