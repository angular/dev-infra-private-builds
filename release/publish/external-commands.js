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
                        return [4 /*yield*/, child_process_1.spawnWithDebugOutput('yarn', ['--silent', 'ng-dev', 'release', 'set-dist-tag', npmDistTag, version.format()])];
                    case 1:
                        // Note: No progress indicator needed as that is the responsibility of the command.
                        _a.sent();
                        console_1.info(console_1.green("  \u2713   Set \"" + npmDistTag + "\" NPM dist tag for all packages to v" + version + "."));
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        console_1.error(e_1);
                        console_1.error(console_1.red('  ✘   An error occurred while setting the NPM dist tag for "${npmDistTag}".'));
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
                        spinner = ora().start('Building release output.');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, child_process_1.spawnWithDebugOutput('yarn', ['--silent', 'ng-dev', 'release', 'build', '--json'], { mode: 'silent' })];
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
                        return [4 /*yield*/, child_process_1.spawnWithDebugOutput('yarn', ['install', '--frozen-lockfile', '--non-interactive'], { cwd: projectDir })];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWwtY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2V4dGVybmFsLWNvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCx5QkFBMkI7SUFHM0IsZ0ZBQStEO0lBQy9ELG9FQUE0RDtJQUc1RCwwRkFBd0Q7SUFFeEQ7Ozs7Ozs7Ozs7Ozs7OztPQWVHO0lBRUg7OztPQUdHO0lBQ0gsU0FBc0IsdUJBQXVCLENBQUMsVUFBa0IsRUFBRSxPQUFzQjs7Ozs7Ozt3QkFFcEYsbUZBQW1GO3dCQUNuRixxQkFBTSxvQ0FBb0IsQ0FDdEIsTUFBTSxFQUFFLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFBOzt3QkFGNUYsbUZBQW1GO3dCQUNuRixTQUM0RixDQUFDO3dCQUM3RixjQUFJLENBQUMsZUFBSyxDQUFDLHNCQUFjLFVBQVUsNkNBQXVDLE9BQU8sTUFBRyxDQUFDLENBQUMsQ0FBQzs7Ozt3QkFFdkYsZUFBSyxDQUFDLEdBQUMsQ0FBQyxDQUFDO3dCQUNULGVBQUssQ0FBQyxhQUFHLENBQUMsNkVBQTZFLENBQUMsQ0FBQyxDQUFDO3dCQUMxRixNQUFNLElBQUksdUNBQXVCLEVBQUUsQ0FBQzs7Ozs7S0FFdkM7SUFYRCwwREFXQztJQUVEOzs7T0FHRztJQUNILFNBQXNCLHlCQUF5Qjs7Ozs7O3dCQUN2QyxPQUFPLEdBQUcsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7Ozs7d0JBSXJDLHFCQUFNLG9DQUFvQixDQUN2QyxNQUFNLEVBQUUsQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUMsRUFBQTs7d0JBRDVFLE1BQU0sR0FBSSxDQUFBLFNBQ2tFLENBQUEsT0FEdEU7d0JBRWIsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO3dCQUNmLGNBQUksQ0FBQyxlQUFLLENBQUMsOENBQThDLENBQUMsQ0FBQyxDQUFDO3dCQUM1RCxtRUFBbUU7d0JBQ25FLHFFQUFxRTt3QkFDckUsc0JBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBQzs7O3dCQUVqQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBQ2YsZUFBSyxDQUFDLEdBQUMsQ0FBQyxDQUFDO3dCQUNULGVBQUssQ0FBQyxhQUFHLENBQUMsOERBQThELENBQUMsQ0FBQyxDQUFDO3dCQUMzRSxNQUFNLElBQUksdUNBQXVCLEVBQUUsQ0FBQzs7Ozs7S0FFdkM7SUFsQkQsOERBa0JDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBc0Isd0JBQXdCLENBQUMsVUFBa0I7Ozs7Ozs7d0JBRTdELG1GQUFtRjt3QkFDbkYsZ0ZBQWdGO3dCQUNoRixxQkFBTSxvQ0FBb0IsQ0FDdEIsTUFBTSxFQUFFLENBQUMsU0FBUyxFQUFFLG1CQUFtQixFQUFFLG1CQUFtQixDQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUUsVUFBVSxFQUFDLENBQUMsRUFBQTs7d0JBSHJGLG1GQUFtRjt3QkFDbkYsZ0ZBQWdGO3dCQUNoRixTQUNxRixDQUFDO3dCQUN0RixjQUFJLENBQUMsZUFBSyxDQUFDLHVDQUF1QyxDQUFDLENBQUMsQ0FBQzs7Ozt3QkFFckQsZUFBSyxDQUFDLEdBQUMsQ0FBQyxDQUFDO3dCQUNULGVBQUssQ0FBQyxhQUFHLENBQUMsd0RBQXdELENBQUMsQ0FBQyxDQUFDO3dCQUNyRSxNQUFNLElBQUksdUNBQXVCLEVBQUUsQ0FBQzs7Ozs7S0FFdkM7SUFaRCw0REFZQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBvcmEgZnJvbSAnb3JhJztcbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge3NwYXduV2l0aERlYnVnT3V0cHV0fSBmcm9tICcuLi8uLi91dGlscy9jaGlsZC1wcm9jZXNzJztcbmltcG9ydCB7ZXJyb3IsIGdyZWVuLCBpbmZvLCByZWR9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtCdWlsdFBhY2thZ2V9IGZyb20gJy4uL2NvbmZpZy9pbmRleCc7XG5cbmltcG9ydCB7RmF0YWxSZWxlYXNlQWN0aW9uRXJyb3J9IGZyb20gJy4vYWN0aW9ucy1lcnJvcic7XG5cbi8qXG4gKiAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAqXG4gKiBUaGlzIGZpbGUgY29udGFpbnMgaGVscGVycyBmb3IgaW52b2tpbmcgZXh0ZXJuYWwgYG5nLWRldmAgY29tbWFuZHMuIEEgc3Vic2V0IG9mIGFjdGlvbnMsXG4gKiBsaWtlIGJ1aWxkaW5nIHJlbGVhc2Ugb3V0cHV0IG9yIHNldHRpbmcgYc69IE5QTSBkaXN0IHRhZyBmb3IgcmVsZWFzZSBwYWNrYWdlcywgY2Fubm90IGJlXG4gKiBwZXJmb3JtZWQgZGlyZWN0bHkgYXMgcGFydCBvZiB0aGUgcmVsZWFzZSB0b29sIGFuZCBuZWVkIHRvIGJlIGRlbGVnYXRlZCB0byBleHRlcm5hbCBgbmctZGV2YFxuICogY29tbWFuZHMgdGhhdCBleGlzdCBhY3Jvc3MgYXJiaXRyYXJ5IHZlcnNpb24gYnJhbmNoZXMuXG4gKlxuICogSW4gYSBjb25jcmV0ZSBleGFtcGxlOiBDb25zaWRlciBhIG5ldyBwYXRjaCB2ZXJzaW9uIGlzIHJlbGVhc2VkIGFuZCB0aGF0IGEgbmV3IHJlbGVhc2VcbiAqIHBhY2thZ2UgaGFzIGJlZW4gYWRkZWQgdG8gdGhlIGBuZXh0YCBicmFuY2guIFRoZSBwYXRjaCBicmFuY2ggd2lsbCBub3QgY29udGFpbiB0aGUgbmV3XG4gKiByZWxlYXNlIHBhY2thZ2UsIHNvIHdlIGNvdWxkIG5vdCBidWlsZCB0aGUgcmVsZWFzZSBvdXRwdXQgZm9yIGl0LiBUbyB3b3JrIGFyb3VuZCB0aGlzLCB3ZVxuICogY2FsbCB0aGUgbmctZGV2IGJ1aWxkIGNvbW1hbmQgZm9yIHRoZSBwYXRjaCB2ZXJzaW9uIGJyYW5jaCBhbmQgZXhwZWN0IGl0IHRvIHJldHVybiBhIGxpc3RcbiAqIG9mIGJ1aWx0IHBhY2thZ2VzIHRoYXQgbmVlZCB0byBiZSByZWxlYXNlZCBhcyBwYXJ0IG9mIHRoaXMgcmVsZWFzZSB0cmFpbi5cbiAqXG4gKiAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAqL1xuXG4vKipcbiAqIEludm9rZXMgdGhlIGBuZy1kZXYgcmVsZWFzZSBzZXQtZGlzdC10YWdgIGNvbW1hbmQgaW4gb3JkZXIgdG8gc2V0IHRoZSBzcGVjaWZpZWRcbiAqIE5QTSBkaXN0IHRhZyBmb3IgYWxsIHBhY2thZ2VzIGluIHRoZSBjaGVja2VkIG91dCBicmFuY2ggdG8gdGhlIGdpdmVuIHZlcnNpb24uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbnZva2VTZXROcG1EaXN0Q29tbWFuZChucG1EaXN0VGFnOiBzdHJpbmcsIHZlcnNpb246IHNlbXZlci5TZW1WZXIpIHtcbiAgdHJ5IHtcbiAgICAvLyBOb3RlOiBObyBwcm9ncmVzcyBpbmRpY2F0b3IgbmVlZGVkIGFzIHRoYXQgaXMgdGhlIHJlc3BvbnNpYmlsaXR5IG9mIHRoZSBjb21tYW5kLlxuICAgIGF3YWl0IHNwYXduV2l0aERlYnVnT3V0cHV0KFxuICAgICAgICAneWFybicsIFsnLS1zaWxlbnQnLCAnbmctZGV2JywgJ3JlbGVhc2UnLCAnc2V0LWRpc3QtdGFnJywgbnBtRGlzdFRhZywgdmVyc2lvbi5mb3JtYXQoKV0pO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgU2V0IFwiJHtucG1EaXN0VGFnfVwiIE5QTSBkaXN0IHRhZyBmb3IgYWxsIHBhY2thZ2VzIHRvIHYke3ZlcnNpb259LmApKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGVycm9yKGUpO1xuICAgIGVycm9yKHJlZCgnICDinJggICBBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBzZXR0aW5nIHRoZSBOUE0gZGlzdCB0YWcgZm9yIFwiJHtucG1EaXN0VGFnfVwiLicpKTtcbiAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgfVxufVxuXG4vKipcbiAqIEludm9rZXMgdGhlIGBuZy1kZXYgcmVsZWFzZSBidWlsZGAgY29tbWFuZCBpbiBvcmRlciB0byBidWlsZCB0aGUgcmVsZWFzZVxuICogcGFja2FnZXMgZm9yIHRoZSBjdXJyZW50bHkgY2hlY2tlZCBvdXQgYnJhbmNoLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW52b2tlUmVsZWFzZUJ1aWxkQ29tbWFuZCgpOiBQcm9taXNlPEJ1aWx0UGFja2FnZVtdPiB7XG4gIGNvbnN0IHNwaW5uZXIgPSBvcmEoKS5zdGFydCgnQnVpbGRpbmcgcmVsZWFzZSBvdXRwdXQuJyk7XG4gIHRyeSB7XG4gICAgLy8gU2luY2Ugd2UgZXhwZWN0IEpTT04gdG8gYmUgcHJpbnRlZCBmcm9tIHRoZSBgbmctZGV2IHJlbGVhc2UgYnVpbGRgIGNvbW1hbmQsXG4gICAgLy8gd2Ugc3Bhd24gdGhlIHByb2Nlc3MgaW4gc2lsZW50IG1vZGUuIFdlIGhhdmUgc2V0IHVwIGFuIE9yYSBwcm9ncmVzcyBzcGlubmVyLlxuICAgIGNvbnN0IHtzdGRvdXR9ID0gYXdhaXQgc3Bhd25XaXRoRGVidWdPdXRwdXQoXG4gICAgICAgICd5YXJuJywgWyctLXNpbGVudCcsICduZy1kZXYnLCAncmVsZWFzZScsICdidWlsZCcsICctLWpzb24nXSwge21vZGU6ICdzaWxlbnQnfSk7XG4gICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgaW5mbyhncmVlbignICDinJMgICBCdWlsdCByZWxlYXNlIG91dHB1dCBmb3IgYWxsIHBhY2thZ2VzLicpKTtcbiAgICAvLyBUaGUgYG5nLWRldiByZWxlYXNlIGJ1aWxkYCBjb21tYW5kIHByaW50cyBhIEpTT04gYXJyYXkgdG8gc3Rkb3V0XG4gICAgLy8gdGhhdCByZXByZXNlbnRzIHRoZSBidWlsdCByZWxlYXNlIHBhY2thZ2VzIGFuZCB0aGVpciBvdXRwdXQgcGF0aHMuXG4gICAgcmV0dXJuIEpTT04ucGFyc2Uoc3Rkb3V0LnRyaW0oKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBzcGlubmVyLnN0b3AoKTtcbiAgICBlcnJvcihlKTtcbiAgICBlcnJvcihyZWQoJyAg4pyYICAgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgYnVpbGRpbmcgdGhlIHJlbGVhc2UgcGFja2FnZXMuJykpO1xuICAgIHRocm93IG5ldyBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICB9XG59XG5cbi8qKlxuICogSW52b2tlcyB0aGUgYHlhcm4gaW5zdGFsbGAgY29tbWFuZCBpbiBvcmRlciB0byBpbnN0YWxsIGRlcGVuZGVuY2llcyBmb3JcbiAqIHRoZSBjb25maWd1cmVkIHByb2plY3Qgd2l0aCB0aGUgY3VycmVudGx5IGNoZWNrZWQgb3V0IHJldmlzaW9uLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW52b2tlWWFybkluc3RhbGxDb21tYW5kKHByb2plY3REaXI6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICB0cnkge1xuICAgIC8vIE5vdGU6IE5vIHByb2dyZXNzIGluZGljYXRvciBuZWVkZWQgYXMgdGhhdCBpcyB0aGUgcmVzcG9uc2liaWxpdHkgb2YgdGhlIGNvbW1hbmQuXG4gICAgLy8gVE9ETzogQ29uc2lkZXIgdXNpbmcgYW4gT3JhIHNwaW5uZXIgaW5zdGVhZCB0byBlbnN1cmUgbWluaW1hbCBjb25zb2xlIG91dHB1dC5cbiAgICBhd2FpdCBzcGF3bldpdGhEZWJ1Z091dHB1dChcbiAgICAgICAgJ3lhcm4nLCBbJ2luc3RhbGwnLCAnLS1mcm96ZW4tbG9ja2ZpbGUnLCAnLS1ub24taW50ZXJhY3RpdmUnXSwge2N3ZDogcHJvamVjdERpcn0pO1xuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgSW5zdGFsbGVkIHByb2plY3QgZGVwZW5kZW5jaWVzLicpKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGVycm9yKGUpO1xuICAgIGVycm9yKHJlZCgnICDinJggICBBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBpbnN0YWxsaW5nIGRlcGVuZGVuY2llcy4nKSk7XG4gICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gIH1cbn1cbiJdfQ==