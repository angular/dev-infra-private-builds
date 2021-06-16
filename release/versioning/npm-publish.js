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
        define("@angular/dev-infra-private/release/versioning/npm-publish", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/child-process"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.npmLogout = exports.npmLogin = exports.npmIsLoggedIn = exports.setNpmTagForPackage = exports.runNpmPublish = void 0;
    var tslib_1 = require("tslib");
    var child_process_1 = require("@angular/dev-infra-private/utils/child-process");
    /**
     * Runs NPM publish within a specified package directory.
     * @throws With the process log output if the publish failed.
     */
    function runNpmPublish(packagePath, distTag, registryUrl) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var args;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        args = ['publish', '--access', 'public', '--tag', distTag];
                        // If a custom registry URL has been specified, add the `--registry` flag.
                        if (registryUrl !== undefined) {
                            args.push('--registry', registryUrl);
                        }
                        return [4 /*yield*/, child_process_1.spawnWithDebugOutput('npm', args, { cwd: packagePath, mode: 'silent' })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.runNpmPublish = runNpmPublish;
    /**
     * Sets the NPM tag to the specified version for the given package.
     * @throws With the process log output if the tagging failed.
     */
    function setNpmTagForPackage(packageName, distTag, version, registryUrl) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var args;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        args = ['dist-tag', 'add', packageName + "@" + version, distTag];
                        // If a custom registry URL has been specified, add the `--registry` flag.
                        if (registryUrl !== undefined) {
                            args.push('--registry', registryUrl);
                        }
                        return [4 /*yield*/, child_process_1.spawnWithDebugOutput('npm', args, { mode: 'silent' })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.setNpmTagForPackage = setNpmTagForPackage;
    /**
     * Checks whether the user is currently logged into NPM.
     * @returns Whether the user is currently logged into NPM.
     */
    function npmIsLoggedIn(registryUrl) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var args, e_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        args = ['whoami'];
                        // If a custom registry URL has been specified, add the `--registry` flag.
                        if (registryUrl !== undefined) {
                            args.push('--registry', registryUrl);
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, child_process_1.spawnWithDebugOutput('npm', args, { mode: 'silent' })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/, true];
                }
            });
        });
    }
    exports.npmIsLoggedIn = npmIsLoggedIn;
    /**
     * Log into NPM at a provided registry.
     * @throws With the `npm login` status code if the login failed.
     */
    function npmLogin(registryUrl) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var args;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        args = ['login', '--no-browser'];
                        // If a custom registry URL has been specified, add the `--registry` flag. The `--registry` flag
                        // must be spliced into the correct place in the command as npm expects it to be the flag
                        // immediately following the login subcommand.
                        if (registryUrl !== undefined) {
                            args.splice(1, 0, '--registry', registryUrl);
                        }
                        // The login command prompts for username, password and other profile information. Hence
                        // the process needs to be interactive (i.e. respecting current TTYs stdin).
                        return [4 /*yield*/, child_process_1.spawnInteractiveCommand('npm', args)];
                    case 1:
                        // The login command prompts for username, password and other profile information. Hence
                        // the process needs to be interactive (i.e. respecting current TTYs stdin).
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.npmLogin = npmLogin;
    /**
     * Log out of NPM at a provided registry.
     * @returns Whether the user was logged out of NPM.
     */
    function npmLogout(registryUrl) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var args;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        args = ['logout'];
                        // If a custom registry URL has been specified, add the `--registry` flag. The `--registry` flag
                        // must be spliced into the correct place in the command as npm expects it to be the flag
                        // immediately following the logout subcommand.
                        if (registryUrl !== undefined) {
                            args.splice(1, 0, '--registry', registryUrl);
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        return [4 /*yield*/, child_process_1.spawnWithDebugOutput('npm', args, { mode: 'silent' })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3: return [2 /*return*/, npmIsLoggedIn(registryUrl)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    exports.npmLogout = npmLogout;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnBtLXB1Ymxpc2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS92ZXJzaW9uaW5nL25wbS1wdWJsaXNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFHSCxnRkFBd0Y7SUFHeEY7OztPQUdHO0lBQ0gsU0FBc0IsYUFBYSxDQUMvQixXQUFtQixFQUFFLE9BQW1CLEVBQUUsV0FBNkI7Ozs7Ozt3QkFDbkUsSUFBSSxHQUFHLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO3dCQUNqRSwwRUFBMEU7d0JBQzFFLElBQUksV0FBVyxLQUFLLFNBQVMsRUFBRTs0QkFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7eUJBQ3RDO3dCQUNELHFCQUFNLG9DQUFvQixDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBQyxHQUFHLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQyxFQUFBOzt3QkFBM0UsU0FBMkUsQ0FBQzs7Ozs7S0FDN0U7SUFSRCxzQ0FRQztJQUVEOzs7T0FHRztJQUNILFNBQXNCLG1CQUFtQixDQUNyQyxXQUFtQixFQUFFLE9BQWUsRUFBRSxPQUFzQixFQUFFLFdBQTZCOzs7Ozs7d0JBQ3ZGLElBQUksR0FBRyxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUssV0FBVyxTQUFJLE9BQVMsRUFBRSxPQUFPLENBQUMsQ0FBQzt3QkFDdkUsMEVBQTBFO3dCQUMxRSxJQUFJLFdBQVcsS0FBSyxTQUFTLEVBQUU7NEJBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO3lCQUN0Qzt3QkFDRCxxQkFBTSxvQ0FBb0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDLEVBQUE7O3dCQUF6RCxTQUF5RCxDQUFDOzs7OztLQUMzRDtJQVJELGtEQVFDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBc0IsYUFBYSxDQUFDLFdBQTZCOzs7Ozs7d0JBQ3pELElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUN4QiwwRUFBMEU7d0JBQzFFLElBQUksV0FBVyxLQUFLLFNBQVMsRUFBRTs0QkFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7eUJBQ3RDOzs7O3dCQUVDLHFCQUFNLG9DQUFvQixDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUMsRUFBQTs7d0JBQXpELFNBQXlELENBQUM7Ozs7d0JBRTFELHNCQUFPLEtBQUssRUFBQzs0QkFFZixzQkFBTyxJQUFJLEVBQUM7Ozs7S0FDYjtJQVpELHNDQVlDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBc0IsUUFBUSxDQUFDLFdBQTZCOzs7Ozs7d0JBQ3BELElBQUksR0FBRyxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQzt3QkFDdkMsZ0dBQWdHO3dCQUNoRyx5RkFBeUY7d0JBQ3pGLDhDQUE4Qzt3QkFDOUMsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFOzRCQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO3lCQUM5Qzt3QkFDRCx3RkFBd0Y7d0JBQ3hGLDRFQUE0RTt3QkFDNUUscUJBQU0sdUNBQXVCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFBOzt3QkFGMUMsd0ZBQXdGO3dCQUN4Riw0RUFBNEU7d0JBQzVFLFNBQTBDLENBQUM7Ozs7O0tBQzVDO0lBWEQsNEJBV0M7SUFFRDs7O09BR0c7SUFDSCxTQUFzQixTQUFTLENBQUMsV0FBNkI7Ozs7Ozt3QkFDckQsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQ3hCLGdHQUFnRzt3QkFDaEcseUZBQXlGO3dCQUN6RiwrQ0FBK0M7d0JBQy9DLElBQUksV0FBVyxLQUFLLFNBQVMsRUFBRTs0QkFDN0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQzt5QkFDOUM7Ozs7d0JBRUMscUJBQU0sb0NBQW9CLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQyxFQUFBOzt3QkFBekQsU0FBeUQsQ0FBQzs7NEJBRTFELHNCQUFPLGFBQWEsQ0FBQyxXQUFXLENBQUMsRUFBQzs7Ozs7S0FFckM7SUFiRCw4QkFhQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7c3Bhd25JbnRlcmFjdGl2ZUNvbW1hbmQsIHNwYXduV2l0aERlYnVnT3V0cHV0fSBmcm9tICcuLi8uLi91dGlscy9jaGlsZC1wcm9jZXNzJztcbmltcG9ydCB7TnBtRGlzdFRhZ30gZnJvbSAnLi9ucG0tcmVnaXN0cnknO1xuXG4vKipcbiAqIFJ1bnMgTlBNIHB1Ymxpc2ggd2l0aGluIGEgc3BlY2lmaWVkIHBhY2thZ2UgZGlyZWN0b3J5LlxuICogQHRocm93cyBXaXRoIHRoZSBwcm9jZXNzIGxvZyBvdXRwdXQgaWYgdGhlIHB1Ymxpc2ggZmFpbGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuTnBtUHVibGlzaChcbiAgICBwYWNrYWdlUGF0aDogc3RyaW5nLCBkaXN0VGFnOiBOcG1EaXN0VGFnLCByZWdpc3RyeVVybDogc3RyaW5nfHVuZGVmaW5lZCkge1xuICBjb25zdCBhcmdzID0gWydwdWJsaXNoJywgJy0tYWNjZXNzJywgJ3B1YmxpYycsICctLXRhZycsIGRpc3RUYWddO1xuICAvLyBJZiBhIGN1c3RvbSByZWdpc3RyeSBVUkwgaGFzIGJlZW4gc3BlY2lmaWVkLCBhZGQgdGhlIGAtLXJlZ2lzdHJ5YCBmbGFnLlxuICBpZiAocmVnaXN0cnlVcmwgIT09IHVuZGVmaW5lZCkge1xuICAgIGFyZ3MucHVzaCgnLS1yZWdpc3RyeScsIHJlZ2lzdHJ5VXJsKTtcbiAgfVxuICBhd2FpdCBzcGF3bldpdGhEZWJ1Z091dHB1dCgnbnBtJywgYXJncywge2N3ZDogcGFja2FnZVBhdGgsIG1vZGU6ICdzaWxlbnQnfSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgTlBNIHRhZyB0byB0aGUgc3BlY2lmaWVkIHZlcnNpb24gZm9yIHRoZSBnaXZlbiBwYWNrYWdlLlxuICogQHRocm93cyBXaXRoIHRoZSBwcm9jZXNzIGxvZyBvdXRwdXQgaWYgdGhlIHRhZ2dpbmcgZmFpbGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0TnBtVGFnRm9yUGFja2FnZShcbiAgICBwYWNrYWdlTmFtZTogc3RyaW5nLCBkaXN0VGFnOiBzdHJpbmcsIHZlcnNpb246IHNlbXZlci5TZW1WZXIsIHJlZ2lzdHJ5VXJsOiBzdHJpbmd8dW5kZWZpbmVkKSB7XG4gIGNvbnN0IGFyZ3MgPSBbJ2Rpc3QtdGFnJywgJ2FkZCcsIGAke3BhY2thZ2VOYW1lfUAke3ZlcnNpb259YCwgZGlzdFRhZ107XG4gIC8vIElmIGEgY3VzdG9tIHJlZ2lzdHJ5IFVSTCBoYXMgYmVlbiBzcGVjaWZpZWQsIGFkZCB0aGUgYC0tcmVnaXN0cnlgIGZsYWcuXG4gIGlmIChyZWdpc3RyeVVybCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgYXJncy5wdXNoKCctLXJlZ2lzdHJ5JywgcmVnaXN0cnlVcmwpO1xuICB9XG4gIGF3YWl0IHNwYXduV2l0aERlYnVnT3V0cHV0KCducG0nLCBhcmdzLCB7bW9kZTogJ3NpbGVudCd9KTtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgdXNlciBpcyBjdXJyZW50bHkgbG9nZ2VkIGludG8gTlBNLlxuICogQHJldHVybnMgV2hldGhlciB0aGUgdXNlciBpcyBjdXJyZW50bHkgbG9nZ2VkIGludG8gTlBNLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbnBtSXNMb2dnZWRJbihyZWdpc3RyeVVybDogc3RyaW5nfHVuZGVmaW5lZCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBjb25zdCBhcmdzID0gWyd3aG9hbWknXTtcbiAgLy8gSWYgYSBjdXN0b20gcmVnaXN0cnkgVVJMIGhhcyBiZWVuIHNwZWNpZmllZCwgYWRkIHRoZSBgLS1yZWdpc3RyeWAgZmxhZy5cbiAgaWYgKHJlZ2lzdHJ5VXJsICE9PSB1bmRlZmluZWQpIHtcbiAgICBhcmdzLnB1c2goJy0tcmVnaXN0cnknLCByZWdpc3RyeVVybCk7XG4gIH1cbiAgdHJ5IHtcbiAgICBhd2FpdCBzcGF3bldpdGhEZWJ1Z091dHB1dCgnbnBtJywgYXJncywge21vZGU6ICdzaWxlbnQnfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogTG9nIGludG8gTlBNIGF0IGEgcHJvdmlkZWQgcmVnaXN0cnkuXG4gKiBAdGhyb3dzIFdpdGggdGhlIGBucG0gbG9naW5gIHN0YXR1cyBjb2RlIGlmIHRoZSBsb2dpbiBmYWlsZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBucG1Mb2dpbihyZWdpc3RyeVVybDogc3RyaW5nfHVuZGVmaW5lZCkge1xuICBjb25zdCBhcmdzID0gWydsb2dpbicsICctLW5vLWJyb3dzZXInXTtcbiAgLy8gSWYgYSBjdXN0b20gcmVnaXN0cnkgVVJMIGhhcyBiZWVuIHNwZWNpZmllZCwgYWRkIHRoZSBgLS1yZWdpc3RyeWAgZmxhZy4gVGhlIGAtLXJlZ2lzdHJ5YCBmbGFnXG4gIC8vIG11c3QgYmUgc3BsaWNlZCBpbnRvIHRoZSBjb3JyZWN0IHBsYWNlIGluIHRoZSBjb21tYW5kIGFzIG5wbSBleHBlY3RzIGl0IHRvIGJlIHRoZSBmbGFnXG4gIC8vIGltbWVkaWF0ZWx5IGZvbGxvd2luZyB0aGUgbG9naW4gc3ViY29tbWFuZC5cbiAgaWYgKHJlZ2lzdHJ5VXJsICE9PSB1bmRlZmluZWQpIHtcbiAgICBhcmdzLnNwbGljZSgxLCAwLCAnLS1yZWdpc3RyeScsIHJlZ2lzdHJ5VXJsKTtcbiAgfVxuICAvLyBUaGUgbG9naW4gY29tbWFuZCBwcm9tcHRzIGZvciB1c2VybmFtZSwgcGFzc3dvcmQgYW5kIG90aGVyIHByb2ZpbGUgaW5mb3JtYXRpb24uIEhlbmNlXG4gIC8vIHRoZSBwcm9jZXNzIG5lZWRzIHRvIGJlIGludGVyYWN0aXZlIChpLmUuIHJlc3BlY3RpbmcgY3VycmVudCBUVFlzIHN0ZGluKS5cbiAgYXdhaXQgc3Bhd25JbnRlcmFjdGl2ZUNvbW1hbmQoJ25wbScsIGFyZ3MpO1xufVxuXG4vKipcbiAqIExvZyBvdXQgb2YgTlBNIGF0IGEgcHJvdmlkZWQgcmVnaXN0cnkuXG4gKiBAcmV0dXJucyBXaGV0aGVyIHRoZSB1c2VyIHdhcyBsb2dnZWQgb3V0IG9mIE5QTS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG5wbUxvZ291dChyZWdpc3RyeVVybDogc3RyaW5nfHVuZGVmaW5lZCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBjb25zdCBhcmdzID0gWydsb2dvdXQnXTtcbiAgLy8gSWYgYSBjdXN0b20gcmVnaXN0cnkgVVJMIGhhcyBiZWVuIHNwZWNpZmllZCwgYWRkIHRoZSBgLS1yZWdpc3RyeWAgZmxhZy4gVGhlIGAtLXJlZ2lzdHJ5YCBmbGFnXG4gIC8vIG11c3QgYmUgc3BsaWNlZCBpbnRvIHRoZSBjb3JyZWN0IHBsYWNlIGluIHRoZSBjb21tYW5kIGFzIG5wbSBleHBlY3RzIGl0IHRvIGJlIHRoZSBmbGFnXG4gIC8vIGltbWVkaWF0ZWx5IGZvbGxvd2luZyB0aGUgbG9nb3V0IHN1YmNvbW1hbmQuXG4gIGlmIChyZWdpc3RyeVVybCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgYXJncy5zcGxpY2UoMSwgMCwgJy0tcmVnaXN0cnknLCByZWdpc3RyeVVybCk7XG4gIH1cbiAgdHJ5IHtcbiAgICBhd2FpdCBzcGF3bldpdGhEZWJ1Z091dHB1dCgnbnBtJywgYXJncywge21vZGU6ICdzaWxlbnQnfSk7XG4gIH0gZmluYWxseSB7XG4gICAgcmV0dXJuIG5wbUlzTG9nZ2VkSW4ocmVnaXN0cnlVcmwpO1xuICB9XG59XG4iXX0=