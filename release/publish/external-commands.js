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
        define("@angular/dev-infra-private/release/publish/external-commands", ["require", "exports", "tslib", "ora", "@angular/dev-infra-private/utils/child-process", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/release/publish/actions-error"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.invokeYarnInstallCommand = exports.invokeReleaseBuildCommand = exports.invokeSetNpmDistCommand = void 0;
    var tslib_1 = require("tslib");
    var ora = require("ora");
    var child_process_1 = require("@angular/dev-infra-private/utils/child-process");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var actions_error_1 = require("@angular/dev-infra-private/release/publish/actions-error");
    /*
     * ###############################################################
     *
     * This file contains helpers for invoking external `ng-dev` commands. A subset of actions,
     * like building release output or setting aν NPM dist tag for release packages, cannot be
     * performed directly as part of the release tool and need to be delegated to external `ng-dev`
     * commands that exist across arbitrary version branches.
     *
     * In a concrete example: Consider a new patch version is released and that a new release
     * package has been added to the `next` branch. The patch branch will not contain the new
     * release package, so we could not build the release output for it. To work around this, we
     * call the ng-dev build command for the patch version branch and expect it to return a list
     * of built packages that need to be released as part of this release train.
     *
     * ###############################################################
     */
    /**
     * Invokes the `ng-dev release set-dist-tag` command in order to set the specified
     * NPM dist tag for all packages in the checked out branch to the given version.
     */
    function invokeSetNpmDistCommand(npmDistTag, version) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var e_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // Note: No progress indicator needed as that is the responsibility of the command.
                        return [4 /*yield*/, child_process_1.spawn('yarn', ['--silent', 'ng-dev', 'release', 'set-dist-tag', npmDistTag, version.format()])];
                    case 1:
                        // Note: No progress indicator needed as that is the responsibility of the command.
                        _a.sent();
                        console_1.info(console_1.green("  \u2713   Set \"" + npmDistTag + "\" NPM dist tag for all packages to v" + version + "."));
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        console_1.error(e_1);
                        console_1.error(console_1.red("  \u2718   An error occurred while setting the NPM dist tag for \"" + npmDistTag + "\"."));
                        throw new actions_error_1.FatalReleaseActionError();
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
    exports.invokeSetNpmDistCommand = invokeSetNpmDistCommand;
    /**
     * Invokes the `ng-dev release build` command in order to build the release
     * packages for the currently checked out branch.
     */
    function invokeReleaseBuildCommand() {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var spinner, stdout, e_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        spinner = ora.call(undefined).start('Building release output.');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, child_process_1.spawn('yarn', ['--silent', 'ng-dev', 'release', 'build', '--json'], { mode: 'silent' })];
                    case 2:
                        stdout = (_a.sent()).stdout;
                        spinner.stop();
                        console_1.info(console_1.green('  ✓   Built release output for all packages.'));
                        // The `ng-dev release build` command prints a JSON array to stdout
                        // that represents the built release packages and their output paths.
                        return [2 /*return*/, JSON.parse(stdout.trim())];
                    case 3:
                        e_2 = _a.sent();
                        spinner.stop();
                        console_1.error(e_2);
                        console_1.error(console_1.red('  ✘   An error occurred while building the release packages.'));
                        throw new actions_error_1.FatalReleaseActionError();
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    exports.invokeReleaseBuildCommand = invokeReleaseBuildCommand;
    /**
     * Invokes the `yarn install` command in order to install dependencies for
     * the configured project with the currently checked out revision.
     */
    function invokeYarnInstallCommand(projectDir) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var e_3;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // Note: No progress indicator needed as that is the responsibility of the command.
                        // TODO: Consider using an Ora spinner instead to ensure minimal console output.
                        return [4 /*yield*/, child_process_1.spawn('yarn', ['install', '--frozen-lockfile', '--non-interactive'], { cwd: projectDir })];
                    case 1:
                        // Note: No progress indicator needed as that is the responsibility of the command.
                        // TODO: Consider using an Ora spinner instead to ensure minimal console output.
                        _a.sent();
                        console_1.info(console_1.green('  ✓   Installed project dependencies.'));
                        return [3 /*break*/, 3];
                    case 2:
                        e_3 = _a.sent();
                        console_1.error(e_3);
                        console_1.error(console_1.red('  ✘   An error occurred while installing dependencies.'));
                        throw new actions_error_1.FatalReleaseActionError();
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
    exports.invokeYarnInstallCommand = invokeYarnInstallCommand;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWwtY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2V4dGVybmFsLWNvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCx5QkFBMkI7SUFHM0IsZ0ZBQWdEO0lBQ2hELG9FQUE0RDtJQUk1RCwwRkFBd0Q7SUFFeEQ7Ozs7Ozs7Ozs7Ozs7OztPQWVHO0lBRUg7OztPQUdHO0lBQ0gsU0FBc0IsdUJBQXVCLENBQUMsVUFBc0IsRUFBRSxPQUFzQjs7Ozs7Ozt3QkFFeEYsbUZBQW1GO3dCQUNuRixxQkFBTSxxQkFBSyxDQUNQLE1BQU0sRUFBRSxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBQTs7d0JBRjVGLG1GQUFtRjt3QkFDbkYsU0FDNEYsQ0FBQzt3QkFDN0YsY0FBSSxDQUFDLGVBQUssQ0FBQyxzQkFBYyxVQUFVLDZDQUF1QyxPQUFPLE1BQUcsQ0FBQyxDQUFDLENBQUM7Ozs7d0JBRXZGLGVBQUssQ0FBQyxHQUFDLENBQUMsQ0FBQzt3QkFDVCxlQUFLLENBQUMsYUFBRyxDQUFDLHVFQUErRCxVQUFVLFFBQUksQ0FBQyxDQUFDLENBQUM7d0JBQzFGLE1BQU0sSUFBSSx1Q0FBdUIsRUFBRSxDQUFDOzs7OztLQUV2QztJQVhELDBEQVdDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBc0IseUJBQXlCOzs7Ozs7d0JBQ3ZDLE9BQU8sR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDOzs7O3dCQUtoRSxxQkFBTSxxQkFBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQyxFQUFBOzt3QkFEeEYsTUFBTSxHQUNULENBQUEsU0FBMkYsQ0FBQSxPQURsRjt3QkFFYixPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBQ2YsY0FBSSxDQUFDLGVBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDLENBQUM7d0JBQzVELG1FQUFtRTt3QkFDbkUscUVBQXFFO3dCQUNyRSxzQkFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBbUIsRUFBQzs7O3dCQUVuRCxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBQ2YsZUFBSyxDQUFDLEdBQUMsQ0FBQyxDQUFDO3dCQUNULGVBQUssQ0FBQyxhQUFHLENBQUMsOERBQThELENBQUMsQ0FBQyxDQUFDO3dCQUMzRSxNQUFNLElBQUksdUNBQXVCLEVBQUUsQ0FBQzs7Ozs7S0FFdkM7SUFsQkQsOERBa0JDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBc0Isd0JBQXdCLENBQUMsVUFBa0I7Ozs7Ozs7d0JBRTdELG1GQUFtRjt3QkFDbkYsZ0ZBQWdGO3dCQUNoRixxQkFBTSxxQkFBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLFNBQVMsRUFBRSxtQkFBbUIsRUFBRSxtQkFBbUIsQ0FBQyxFQUFFLEVBQUMsR0FBRyxFQUFFLFVBQVUsRUFBQyxDQUFDLEVBQUE7O3dCQUY3RixtRkFBbUY7d0JBQ25GLGdGQUFnRjt3QkFDaEYsU0FBNkYsQ0FBQzt3QkFDOUYsY0FBSSxDQUFDLGVBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDLENBQUM7Ozs7d0JBRXJELGVBQUssQ0FBQyxHQUFDLENBQUMsQ0FBQzt3QkFDVCxlQUFLLENBQUMsYUFBRyxDQUFDLHdEQUF3RCxDQUFDLENBQUMsQ0FBQzt3QkFDckUsTUFBTSxJQUFJLHVDQUF1QixFQUFFLENBQUM7Ozs7O0tBRXZDO0lBWEQsNERBV0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgb3JhIGZyb20gJ29yYSc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtzcGF3bn0gZnJvbSAnLi4vLi4vdXRpbHMvY2hpbGQtcHJvY2Vzcyc7XG5pbXBvcnQge2Vycm9yLCBncmVlbiwgaW5mbywgcmVkfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7QnVpbHRQYWNrYWdlfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtOcG1EaXN0VGFnfSBmcm9tICcuLi92ZXJzaW9uaW5nJztcblxuaW1wb3J0IHtGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcn0gZnJvbSAnLi9hY3Rpb25zLWVycm9yJztcblxuLypcbiAqICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICpcbiAqIFRoaXMgZmlsZSBjb250YWlucyBoZWxwZXJzIGZvciBpbnZva2luZyBleHRlcm5hbCBgbmctZGV2YCBjb21tYW5kcy4gQSBzdWJzZXQgb2YgYWN0aW9ucyxcbiAqIGxpa2UgYnVpbGRpbmcgcmVsZWFzZSBvdXRwdXQgb3Igc2V0dGluZyBhzr0gTlBNIGRpc3QgdGFnIGZvciByZWxlYXNlIHBhY2thZ2VzLCBjYW5ub3QgYmVcbiAqIHBlcmZvcm1lZCBkaXJlY3RseSBhcyBwYXJ0IG9mIHRoZSByZWxlYXNlIHRvb2wgYW5kIG5lZWQgdG8gYmUgZGVsZWdhdGVkIHRvIGV4dGVybmFsIGBuZy1kZXZgXG4gKiBjb21tYW5kcyB0aGF0IGV4aXN0IGFjcm9zcyBhcmJpdHJhcnkgdmVyc2lvbiBicmFuY2hlcy5cbiAqXG4gKiBJbiBhIGNvbmNyZXRlIGV4YW1wbGU6IENvbnNpZGVyIGEgbmV3IHBhdGNoIHZlcnNpb24gaXMgcmVsZWFzZWQgYW5kIHRoYXQgYSBuZXcgcmVsZWFzZVxuICogcGFja2FnZSBoYXMgYmVlbiBhZGRlZCB0byB0aGUgYG5leHRgIGJyYW5jaC4gVGhlIHBhdGNoIGJyYW5jaCB3aWxsIG5vdCBjb250YWluIHRoZSBuZXdcbiAqIHJlbGVhc2UgcGFja2FnZSwgc28gd2UgY291bGQgbm90IGJ1aWxkIHRoZSByZWxlYXNlIG91dHB1dCBmb3IgaXQuIFRvIHdvcmsgYXJvdW5kIHRoaXMsIHdlXG4gKiBjYWxsIHRoZSBuZy1kZXYgYnVpbGQgY29tbWFuZCBmb3IgdGhlIHBhdGNoIHZlcnNpb24gYnJhbmNoIGFuZCBleHBlY3QgaXQgdG8gcmV0dXJuIGEgbGlzdFxuICogb2YgYnVpbHQgcGFja2FnZXMgdGhhdCBuZWVkIHRvIGJlIHJlbGVhc2VkIGFzIHBhcnQgb2YgdGhpcyByZWxlYXNlIHRyYWluLlxuICpcbiAqICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICovXG5cbi8qKlxuICogSW52b2tlcyB0aGUgYG5nLWRldiByZWxlYXNlIHNldC1kaXN0LXRhZ2AgY29tbWFuZCBpbiBvcmRlciB0byBzZXQgdGhlIHNwZWNpZmllZFxuICogTlBNIGRpc3QgdGFnIGZvciBhbGwgcGFja2FnZXMgaW4gdGhlIGNoZWNrZWQgb3V0IGJyYW5jaCB0byB0aGUgZ2l2ZW4gdmVyc2lvbi5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGludm9rZVNldE5wbURpc3RDb21tYW5kKG5wbURpc3RUYWc6IE5wbURpc3RUYWcsIHZlcnNpb246IHNlbXZlci5TZW1WZXIpIHtcbiAgdHJ5IHtcbiAgICAvLyBOb3RlOiBObyBwcm9ncmVzcyBpbmRpY2F0b3IgbmVlZGVkIGFzIHRoYXQgaXMgdGhlIHJlc3BvbnNpYmlsaXR5IG9mIHRoZSBjb21tYW5kLlxuICAgIGF3YWl0IHNwYXduKFxuICAgICAgICAneWFybicsIFsnLS1zaWxlbnQnLCAnbmctZGV2JywgJ3JlbGVhc2UnLCAnc2V0LWRpc3QtdGFnJywgbnBtRGlzdFRhZywgdmVyc2lvbi5mb3JtYXQoKV0pO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgU2V0IFwiJHtucG1EaXN0VGFnfVwiIE5QTSBkaXN0IHRhZyBmb3IgYWxsIHBhY2thZ2VzIHRvIHYke3ZlcnNpb259LmApKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGVycm9yKGUpO1xuICAgIGVycm9yKHJlZChgICDinJggICBBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBzZXR0aW5nIHRoZSBOUE0gZGlzdCB0YWcgZm9yIFwiJHtucG1EaXN0VGFnfVwiLmApKTtcbiAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgfVxufVxuXG4vKipcbiAqIEludm9rZXMgdGhlIGBuZy1kZXYgcmVsZWFzZSBidWlsZGAgY29tbWFuZCBpbiBvcmRlciB0byBidWlsZCB0aGUgcmVsZWFzZVxuICogcGFja2FnZXMgZm9yIHRoZSBjdXJyZW50bHkgY2hlY2tlZCBvdXQgYnJhbmNoLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW52b2tlUmVsZWFzZUJ1aWxkQ29tbWFuZCgpOiBQcm9taXNlPEJ1aWx0UGFja2FnZVtdPiB7XG4gIGNvbnN0IHNwaW5uZXIgPSBvcmEuY2FsbCh1bmRlZmluZWQpLnN0YXJ0KCdCdWlsZGluZyByZWxlYXNlIG91dHB1dC4nKTtcbiAgdHJ5IHtcbiAgICAvLyBTaW5jZSB3ZSBleHBlY3QgSlNPTiB0byBiZSBwcmludGVkIGZyb20gdGhlIGBuZy1kZXYgcmVsZWFzZSBidWlsZGAgY29tbWFuZCxcbiAgICAvLyB3ZSBzcGF3biB0aGUgcHJvY2VzcyBpbiBzaWxlbnQgbW9kZS4gV2UgaGF2ZSBzZXQgdXAgYW4gT3JhIHByb2dyZXNzIHNwaW5uZXIuXG4gICAgY29uc3Qge3N0ZG91dH0gPVxuICAgICAgICBhd2FpdCBzcGF3bigneWFybicsIFsnLS1zaWxlbnQnLCAnbmctZGV2JywgJ3JlbGVhc2UnLCAnYnVpbGQnLCAnLS1qc29uJ10sIHttb2RlOiAnc2lsZW50J30pO1xuICAgIHNwaW5uZXIuc3RvcCgpO1xuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgQnVpbHQgcmVsZWFzZSBvdXRwdXQgZm9yIGFsbCBwYWNrYWdlcy4nKSk7XG4gICAgLy8gVGhlIGBuZy1kZXYgcmVsZWFzZSBidWlsZGAgY29tbWFuZCBwcmludHMgYSBKU09OIGFycmF5IHRvIHN0ZG91dFxuICAgIC8vIHRoYXQgcmVwcmVzZW50cyB0aGUgYnVpbHQgcmVsZWFzZSBwYWNrYWdlcyBhbmQgdGhlaXIgb3V0cHV0IHBhdGhzLlxuICAgIHJldHVybiBKU09OLnBhcnNlKHN0ZG91dC50cmltKCkpIGFzIEJ1aWx0UGFja2FnZVtdO1xuICB9IGNhdGNoIChlKSB7XG4gICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgZXJyb3IoZSk7XG4gICAgZXJyb3IocmVkKCcgIOKcmCAgIEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIGJ1aWxkaW5nIHRoZSByZWxlYXNlIHBhY2thZ2VzLicpKTtcbiAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgfVxufVxuXG4vKipcbiAqIEludm9rZXMgdGhlIGB5YXJuIGluc3RhbGxgIGNvbW1hbmQgaW4gb3JkZXIgdG8gaW5zdGFsbCBkZXBlbmRlbmNpZXMgZm9yXG4gKiB0aGUgY29uZmlndXJlZCBwcm9qZWN0IHdpdGggdGhlIGN1cnJlbnRseSBjaGVja2VkIG91dCByZXZpc2lvbi5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGludm9rZVlhcm5JbnN0YWxsQ29tbWFuZChwcm9qZWN0RGlyOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgdHJ5IHtcbiAgICAvLyBOb3RlOiBObyBwcm9ncmVzcyBpbmRpY2F0b3IgbmVlZGVkIGFzIHRoYXQgaXMgdGhlIHJlc3BvbnNpYmlsaXR5IG9mIHRoZSBjb21tYW5kLlxuICAgIC8vIFRPRE86IENvbnNpZGVyIHVzaW5nIGFuIE9yYSBzcGlubmVyIGluc3RlYWQgdG8gZW5zdXJlIG1pbmltYWwgY29uc29sZSBvdXRwdXQuXG4gICAgYXdhaXQgc3Bhd24oJ3lhcm4nLCBbJ2luc3RhbGwnLCAnLS1mcm96ZW4tbG9ja2ZpbGUnLCAnLS1ub24taW50ZXJhY3RpdmUnXSwge2N3ZDogcHJvamVjdERpcn0pO1xuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgSW5zdGFsbGVkIHByb2plY3QgZGVwZW5kZW5jaWVzLicpKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGVycm9yKGUpO1xuICAgIGVycm9yKHJlZCgnICDinJggICBBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBpbnN0YWxsaW5nIGRlcGVuZGVuY2llcy4nKSk7XG4gICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gIH1cbn1cbiJdfQ==