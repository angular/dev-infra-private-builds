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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWwtY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2V4dGVybmFsLWNvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCx5QkFBMkI7SUFHM0IsZ0ZBQStEO0lBQy9ELG9FQUE0RDtJQUc1RCwwRkFBd0Q7SUFFeEQ7Ozs7Ozs7Ozs7Ozs7OztPQWVHO0lBRUg7OztPQUdHO0lBQ0gsU0FBc0IsdUJBQXVCLENBQUMsVUFBa0IsRUFBRSxPQUFzQjs7Ozs7Ozt3QkFFcEYsbUZBQW1GO3dCQUNuRixxQkFBTSxvQ0FBb0IsQ0FDdEIsTUFBTSxFQUFFLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFBOzt3QkFGNUYsbUZBQW1GO3dCQUNuRixTQUM0RixDQUFDO3dCQUM3RixjQUFJLENBQUMsZUFBSyxDQUFDLHNCQUFjLFVBQVUsNkNBQXVDLE9BQU8sTUFBRyxDQUFDLENBQUMsQ0FBQzs7Ozt3QkFFdkYsZUFBSyxDQUFDLEdBQUMsQ0FBQyxDQUFDO3dCQUNULGVBQUssQ0FBQyxhQUFHLENBQUMsdUVBQStELFVBQVUsUUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDMUYsTUFBTSxJQUFJLHVDQUF1QixFQUFFLENBQUM7Ozs7O0tBRXZDO0lBWEQsMERBV0M7SUFFRDs7O09BR0c7SUFDSCxTQUFzQix5QkFBeUI7Ozs7Ozt3QkFDdkMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7Ozs7d0JBSW5ELHFCQUFNLG9DQUFvQixDQUN2QyxNQUFNLEVBQUUsQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUMsRUFBQTs7d0JBRDVFLE1BQU0sR0FBSSxDQUFBLFNBQ2tFLENBQUEsT0FEdEU7d0JBRWIsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO3dCQUNmLGNBQUksQ0FBQyxlQUFLLENBQUMsOENBQThDLENBQUMsQ0FBQyxDQUFDO3dCQUM1RCxtRUFBbUU7d0JBQ25FLHFFQUFxRTt3QkFDckUsc0JBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQW1CLEVBQUM7Ozt3QkFFbkQsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO3dCQUNmLGVBQUssQ0FBQyxHQUFDLENBQUMsQ0FBQzt3QkFDVCxlQUFLLENBQUMsYUFBRyxDQUFDLDhEQUE4RCxDQUFDLENBQUMsQ0FBQzt3QkFDM0UsTUFBTSxJQUFJLHVDQUF1QixFQUFFLENBQUM7Ozs7O0tBRXZDO0lBbEJELDhEQWtCQztJQUVEOzs7T0FHRztJQUNILFNBQXNCLHdCQUF3QixDQUFDLFVBQWtCOzs7Ozs7O3dCQUU3RCxtRkFBbUY7d0JBQ25GLGdGQUFnRjt3QkFDaEYscUJBQU0sb0NBQW9CLENBQ3RCLE1BQU0sRUFBRSxDQUFDLFNBQVMsRUFBRSxtQkFBbUIsRUFBRSxtQkFBbUIsQ0FBQyxFQUFFLEVBQUMsR0FBRyxFQUFFLFVBQVUsRUFBQyxDQUFDLEVBQUE7O3dCQUhyRixtRkFBbUY7d0JBQ25GLGdGQUFnRjt3QkFDaEYsU0FDcUYsQ0FBQzt3QkFDdEYsY0FBSSxDQUFDLGVBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDLENBQUM7Ozs7d0JBRXJELGVBQUssQ0FBQyxHQUFDLENBQUMsQ0FBQzt3QkFDVCxlQUFLLENBQUMsYUFBRyxDQUFDLHdEQUF3RCxDQUFDLENBQUMsQ0FBQzt3QkFDckUsTUFBTSxJQUFJLHVDQUF1QixFQUFFLENBQUM7Ozs7O0tBRXZDO0lBWkQsNERBWUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgb3JhIGZyb20gJ29yYSc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtzcGF3bldpdGhEZWJ1Z091dHB1dH0gZnJvbSAnLi4vLi4vdXRpbHMvY2hpbGQtcHJvY2Vzcyc7XG5pbXBvcnQge2Vycm9yLCBncmVlbiwgaW5mbywgcmVkfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7QnVpbHRQYWNrYWdlfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuXG5pbXBvcnQge0ZhdGFsUmVsZWFzZUFjdGlvbkVycm9yfSBmcm9tICcuL2FjdGlvbnMtZXJyb3InO1xuXG4vKlxuICogIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gKlxuICogVGhpcyBmaWxlIGNvbnRhaW5zIGhlbHBlcnMgZm9yIGludm9raW5nIGV4dGVybmFsIGBuZy1kZXZgIGNvbW1hbmRzLiBBIHN1YnNldCBvZiBhY3Rpb25zLFxuICogbGlrZSBidWlsZGluZyByZWxlYXNlIG91dHB1dCBvciBzZXR0aW5nIGHOvSBOUE0gZGlzdCB0YWcgZm9yIHJlbGVhc2UgcGFja2FnZXMsIGNhbm5vdCBiZVxuICogcGVyZm9ybWVkIGRpcmVjdGx5IGFzIHBhcnQgb2YgdGhlIHJlbGVhc2UgdG9vbCBhbmQgbmVlZCB0byBiZSBkZWxlZ2F0ZWQgdG8gZXh0ZXJuYWwgYG5nLWRldmBcbiAqIGNvbW1hbmRzIHRoYXQgZXhpc3QgYWNyb3NzIGFyYml0cmFyeSB2ZXJzaW9uIGJyYW5jaGVzLlxuICpcbiAqIEluIGEgY29uY3JldGUgZXhhbXBsZTogQ29uc2lkZXIgYSBuZXcgcGF0Y2ggdmVyc2lvbiBpcyByZWxlYXNlZCBhbmQgdGhhdCBhIG5ldyByZWxlYXNlXG4gKiBwYWNrYWdlIGhhcyBiZWVuIGFkZGVkIHRvIHRoZSBgbmV4dGAgYnJhbmNoLiBUaGUgcGF0Y2ggYnJhbmNoIHdpbGwgbm90IGNvbnRhaW4gdGhlIG5ld1xuICogcmVsZWFzZSBwYWNrYWdlLCBzbyB3ZSBjb3VsZCBub3QgYnVpbGQgdGhlIHJlbGVhc2Ugb3V0cHV0IGZvciBpdC4gVG8gd29yayBhcm91bmQgdGhpcywgd2VcbiAqIGNhbGwgdGhlIG5nLWRldiBidWlsZCBjb21tYW5kIGZvciB0aGUgcGF0Y2ggdmVyc2lvbiBicmFuY2ggYW5kIGV4cGVjdCBpdCB0byByZXR1cm4gYSBsaXN0XG4gKiBvZiBidWlsdCBwYWNrYWdlcyB0aGF0IG5lZWQgdG8gYmUgcmVsZWFzZWQgYXMgcGFydCBvZiB0aGlzIHJlbGVhc2UgdHJhaW4uXG4gKlxuICogIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gKi9cblxuLyoqXG4gKiBJbnZva2VzIHRoZSBgbmctZGV2IHJlbGVhc2Ugc2V0LWRpc3QtdGFnYCBjb21tYW5kIGluIG9yZGVyIHRvIHNldCB0aGUgc3BlY2lmaWVkXG4gKiBOUE0gZGlzdCB0YWcgZm9yIGFsbCBwYWNrYWdlcyBpbiB0aGUgY2hlY2tlZCBvdXQgYnJhbmNoIHRvIHRoZSBnaXZlbiB2ZXJzaW9uLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW52b2tlU2V0TnBtRGlzdENvbW1hbmQobnBtRGlzdFRhZzogc3RyaW5nLCB2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyKSB7XG4gIHRyeSB7XG4gICAgLy8gTm90ZTogTm8gcHJvZ3Jlc3MgaW5kaWNhdG9yIG5lZWRlZCBhcyB0aGF0IGlzIHRoZSByZXNwb25zaWJpbGl0eSBvZiB0aGUgY29tbWFuZC5cbiAgICBhd2FpdCBzcGF3bldpdGhEZWJ1Z091dHB1dChcbiAgICAgICAgJ3lhcm4nLCBbJy0tc2lsZW50JywgJ25nLWRldicsICdyZWxlYXNlJywgJ3NldC1kaXN0LXRhZycsIG5wbURpc3RUYWcsIHZlcnNpb24uZm9ybWF0KCldKTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFNldCBcIiR7bnBtRGlzdFRhZ31cIiBOUE0gZGlzdCB0YWcgZm9yIGFsbCBwYWNrYWdlcyB0byB2JHt2ZXJzaW9ufS5gKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBlcnJvcihlKTtcbiAgICBlcnJvcihyZWQoYCAg4pyYICAgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgc2V0dGluZyB0aGUgTlBNIGRpc3QgdGFnIGZvciBcIiR7bnBtRGlzdFRhZ31cIi5gKSk7XG4gICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBJbnZva2VzIHRoZSBgbmctZGV2IHJlbGVhc2UgYnVpbGRgIGNvbW1hbmQgaW4gb3JkZXIgdG8gYnVpbGQgdGhlIHJlbGVhc2VcbiAqIHBhY2thZ2VzIGZvciB0aGUgY3VycmVudGx5IGNoZWNrZWQgb3V0IGJyYW5jaC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGludm9rZVJlbGVhc2VCdWlsZENvbW1hbmQoKTogUHJvbWlzZTxCdWlsdFBhY2thZ2VbXT4ge1xuICBjb25zdCBzcGlubmVyID0gb3JhLmNhbGwodW5kZWZpbmVkKS5zdGFydCgnQnVpbGRpbmcgcmVsZWFzZSBvdXRwdXQuJyk7XG4gIHRyeSB7XG4gICAgLy8gU2luY2Ugd2UgZXhwZWN0IEpTT04gdG8gYmUgcHJpbnRlZCBmcm9tIHRoZSBgbmctZGV2IHJlbGVhc2UgYnVpbGRgIGNvbW1hbmQsXG4gICAgLy8gd2Ugc3Bhd24gdGhlIHByb2Nlc3MgaW4gc2lsZW50IG1vZGUuIFdlIGhhdmUgc2V0IHVwIGFuIE9yYSBwcm9ncmVzcyBzcGlubmVyLlxuICAgIGNvbnN0IHtzdGRvdXR9ID0gYXdhaXQgc3Bhd25XaXRoRGVidWdPdXRwdXQoXG4gICAgICAgICd5YXJuJywgWyctLXNpbGVudCcsICduZy1kZXYnLCAncmVsZWFzZScsICdidWlsZCcsICctLWpzb24nXSwge21vZGU6ICdzaWxlbnQnfSk7XG4gICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgaW5mbyhncmVlbignICDinJMgICBCdWlsdCByZWxlYXNlIG91dHB1dCBmb3IgYWxsIHBhY2thZ2VzLicpKTtcbiAgICAvLyBUaGUgYG5nLWRldiByZWxlYXNlIGJ1aWxkYCBjb21tYW5kIHByaW50cyBhIEpTT04gYXJyYXkgdG8gc3Rkb3V0XG4gICAgLy8gdGhhdCByZXByZXNlbnRzIHRoZSBidWlsdCByZWxlYXNlIHBhY2thZ2VzIGFuZCB0aGVpciBvdXRwdXQgcGF0aHMuXG4gICAgcmV0dXJuIEpTT04ucGFyc2Uoc3Rkb3V0LnRyaW0oKSkgYXMgQnVpbHRQYWNrYWdlW107XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBzcGlubmVyLnN0b3AoKTtcbiAgICBlcnJvcihlKTtcbiAgICBlcnJvcihyZWQoJyAg4pyYICAgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgYnVpbGRpbmcgdGhlIHJlbGVhc2UgcGFja2FnZXMuJykpO1xuICAgIHRocm93IG5ldyBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICB9XG59XG5cbi8qKlxuICogSW52b2tlcyB0aGUgYHlhcm4gaW5zdGFsbGAgY29tbWFuZCBpbiBvcmRlciB0byBpbnN0YWxsIGRlcGVuZGVuY2llcyBmb3JcbiAqIHRoZSBjb25maWd1cmVkIHByb2plY3Qgd2l0aCB0aGUgY3VycmVudGx5IGNoZWNrZWQgb3V0IHJldmlzaW9uLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW52b2tlWWFybkluc3RhbGxDb21tYW5kKHByb2plY3REaXI6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICB0cnkge1xuICAgIC8vIE5vdGU6IE5vIHByb2dyZXNzIGluZGljYXRvciBuZWVkZWQgYXMgdGhhdCBpcyB0aGUgcmVzcG9uc2liaWxpdHkgb2YgdGhlIGNvbW1hbmQuXG4gICAgLy8gVE9ETzogQ29uc2lkZXIgdXNpbmcgYW4gT3JhIHNwaW5uZXIgaW5zdGVhZCB0byBlbnN1cmUgbWluaW1hbCBjb25zb2xlIG91dHB1dC5cbiAgICBhd2FpdCBzcGF3bldpdGhEZWJ1Z091dHB1dChcbiAgICAgICAgJ3lhcm4nLCBbJ2luc3RhbGwnLCAnLS1mcm96ZW4tbG9ja2ZpbGUnLCAnLS1ub24taW50ZXJhY3RpdmUnXSwge2N3ZDogcHJvamVjdERpcn0pO1xuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgSW5zdGFsbGVkIHByb2plY3QgZGVwZW5kZW5jaWVzLicpKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGVycm9yKGUpO1xuICAgIGVycm9yKHJlZCgnICDinJggICBBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBpbnN0YWxsaW5nIGRlcGVuZGVuY2llcy4nKSk7XG4gICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gIH1cbn1cbiJdfQ==