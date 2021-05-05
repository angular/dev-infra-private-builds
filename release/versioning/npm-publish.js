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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnBtLXB1Ymxpc2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS92ZXJzaW9uaW5nL25wbS1wdWJsaXNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFHSCxnRkFBd0Y7SUFFeEY7OztPQUdHO0lBQ0gsU0FBc0IsYUFBYSxDQUMvQixXQUFtQixFQUFFLE9BQWUsRUFBRSxXQUE2Qjs7Ozs7O3dCQUMvRCxJQUFJLEdBQUcsQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7d0JBQ2pFLDBFQUEwRTt3QkFDMUUsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFOzRCQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQzt5QkFDdEM7d0JBQ0QscUJBQU0sb0NBQW9CLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDLEVBQUE7O3dCQUEzRSxTQUEyRSxDQUFDOzs7OztLQUM3RTtJQVJELHNDQVFDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBc0IsbUJBQW1CLENBQ3JDLFdBQW1CLEVBQUUsT0FBZSxFQUFFLE9BQXNCLEVBQUUsV0FBNkI7Ozs7Ozt3QkFDdkYsSUFBSSxHQUFHLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBSyxXQUFXLFNBQUksT0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO3dCQUN2RSwwRUFBMEU7d0JBQzFFLElBQUksV0FBVyxLQUFLLFNBQVMsRUFBRTs0QkFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7eUJBQ3RDO3dCQUNELHFCQUFNLG9DQUFvQixDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUMsRUFBQTs7d0JBQXpELFNBQXlELENBQUM7Ozs7O0tBQzNEO0lBUkQsa0RBUUM7SUFFRDs7O09BR0c7SUFDSCxTQUFzQixhQUFhLENBQUMsV0FBNkI7Ozs7Ozt3QkFDekQsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQ3hCLDBFQUEwRTt3QkFDMUUsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFOzRCQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQzt5QkFDdEM7Ozs7d0JBRUMscUJBQU0sb0NBQW9CLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQyxFQUFBOzt3QkFBekQsU0FBeUQsQ0FBQzs7Ozt3QkFFMUQsc0JBQU8sS0FBSyxFQUFDOzRCQUVmLHNCQUFPLElBQUksRUFBQzs7OztLQUNiO0lBWkQsc0NBWUM7SUFFRDs7O09BR0c7SUFDSCxTQUFzQixRQUFRLENBQUMsV0FBNkI7Ozs7Ozt3QkFDcEQsSUFBSSxHQUFHLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO3dCQUN2QyxnR0FBZ0c7d0JBQ2hHLHlGQUF5Rjt3QkFDekYsOENBQThDO3dCQUM5QyxJQUFJLFdBQVcsS0FBSyxTQUFTLEVBQUU7NEJBQzdCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7eUJBQzlDO3dCQUNELHdGQUF3Rjt3QkFDeEYsNEVBQTRFO3dCQUM1RSxxQkFBTSx1Q0FBdUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUE7O3dCQUYxQyx3RkFBd0Y7d0JBQ3hGLDRFQUE0RTt3QkFDNUUsU0FBMEMsQ0FBQzs7Ozs7S0FDNUM7SUFYRCw0QkFXQztJQUVEOzs7T0FHRztJQUNILFNBQXNCLFNBQVMsQ0FBQyxXQUE2Qjs7Ozs7O3dCQUNyRCxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDeEIsZ0dBQWdHO3dCQUNoRyx5RkFBeUY7d0JBQ3pGLCtDQUErQzt3QkFDL0MsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFOzRCQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO3lCQUM5Qzs7Ozt3QkFFQyxxQkFBTSxvQ0FBb0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDLEVBQUE7O3dCQUF6RCxTQUF5RCxDQUFDOzs0QkFFMUQsc0JBQU8sYUFBYSxDQUFDLFdBQVcsQ0FBQyxFQUFDOzs7OztLQUVyQztJQWJELDhCQWFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuaW1wb3J0IHtzcGF3bkludGVyYWN0aXZlQ29tbWFuZCwgc3Bhd25XaXRoRGVidWdPdXRwdXR9IGZyb20gJy4uLy4uL3V0aWxzL2NoaWxkLXByb2Nlc3MnO1xuXG4vKipcbiAqIFJ1bnMgTlBNIHB1Ymxpc2ggd2l0aGluIGEgc3BlY2lmaWVkIHBhY2thZ2UgZGlyZWN0b3J5LlxuICogQHRocm93cyBXaXRoIHRoZSBwcm9jZXNzIGxvZyBvdXRwdXQgaWYgdGhlIHB1Ymxpc2ggZmFpbGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuTnBtUHVibGlzaChcbiAgICBwYWNrYWdlUGF0aDogc3RyaW5nLCBkaXN0VGFnOiBzdHJpbmcsIHJlZ2lzdHJ5VXJsOiBzdHJpbmd8dW5kZWZpbmVkKSB7XG4gIGNvbnN0IGFyZ3MgPSBbJ3B1Ymxpc2gnLCAnLS1hY2Nlc3MnLCAncHVibGljJywgJy0tdGFnJywgZGlzdFRhZ107XG4gIC8vIElmIGEgY3VzdG9tIHJlZ2lzdHJ5IFVSTCBoYXMgYmVlbiBzcGVjaWZpZWQsIGFkZCB0aGUgYC0tcmVnaXN0cnlgIGZsYWcuXG4gIGlmIChyZWdpc3RyeVVybCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgYXJncy5wdXNoKCctLXJlZ2lzdHJ5JywgcmVnaXN0cnlVcmwpO1xuICB9XG4gIGF3YWl0IHNwYXduV2l0aERlYnVnT3V0cHV0KCducG0nLCBhcmdzLCB7Y3dkOiBwYWNrYWdlUGF0aCwgbW9kZTogJ3NpbGVudCd9KTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBOUE0gdGFnIHRvIHRoZSBzcGVjaWZpZWQgdmVyc2lvbiBmb3IgdGhlIGdpdmVuIHBhY2thZ2UuXG4gKiBAdGhyb3dzIFdpdGggdGhlIHByb2Nlc3MgbG9nIG91dHB1dCBpZiB0aGUgdGFnZ2luZyBmYWlsZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXROcG1UYWdGb3JQYWNrYWdlKFxuICAgIHBhY2thZ2VOYW1lOiBzdHJpbmcsIGRpc3RUYWc6IHN0cmluZywgdmVyc2lvbjogc2VtdmVyLlNlbVZlciwgcmVnaXN0cnlVcmw6IHN0cmluZ3x1bmRlZmluZWQpIHtcbiAgY29uc3QgYXJncyA9IFsnZGlzdC10YWcnLCAnYWRkJywgYCR7cGFja2FnZU5hbWV9QCR7dmVyc2lvbn1gLCBkaXN0VGFnXTtcbiAgLy8gSWYgYSBjdXN0b20gcmVnaXN0cnkgVVJMIGhhcyBiZWVuIHNwZWNpZmllZCwgYWRkIHRoZSBgLS1yZWdpc3RyeWAgZmxhZy5cbiAgaWYgKHJlZ2lzdHJ5VXJsICE9PSB1bmRlZmluZWQpIHtcbiAgICBhcmdzLnB1c2goJy0tcmVnaXN0cnknLCByZWdpc3RyeVVybCk7XG4gIH1cbiAgYXdhaXQgc3Bhd25XaXRoRGVidWdPdXRwdXQoJ25wbScsIGFyZ3MsIHttb2RlOiAnc2lsZW50J30pO1xufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSB1c2VyIGlzIGN1cnJlbnRseSBsb2dnZWQgaW50byBOUE0uXG4gKiBAcmV0dXJucyBXaGV0aGVyIHRoZSB1c2VyIGlzIGN1cnJlbnRseSBsb2dnZWQgaW50byBOUE0uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBucG1Jc0xvZ2dlZEluKHJlZ2lzdHJ5VXJsOiBzdHJpbmd8dW5kZWZpbmVkKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IGFyZ3MgPSBbJ3dob2FtaSddO1xuICAvLyBJZiBhIGN1c3RvbSByZWdpc3RyeSBVUkwgaGFzIGJlZW4gc3BlY2lmaWVkLCBhZGQgdGhlIGAtLXJlZ2lzdHJ5YCBmbGFnLlxuICBpZiAocmVnaXN0cnlVcmwgIT09IHVuZGVmaW5lZCkge1xuICAgIGFyZ3MucHVzaCgnLS1yZWdpc3RyeScsIHJlZ2lzdHJ5VXJsKTtcbiAgfVxuICB0cnkge1xuICAgIGF3YWl0IHNwYXduV2l0aERlYnVnT3V0cHV0KCducG0nLCBhcmdzLCB7bW9kZTogJ3NpbGVudCd9KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBMb2cgaW50byBOUE0gYXQgYSBwcm92aWRlZCByZWdpc3RyeS5cbiAqIEB0aHJvd3MgV2l0aCB0aGUgYG5wbSBsb2dpbmAgc3RhdHVzIGNvZGUgaWYgdGhlIGxvZ2luIGZhaWxlZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG5wbUxvZ2luKHJlZ2lzdHJ5VXJsOiBzdHJpbmd8dW5kZWZpbmVkKSB7XG4gIGNvbnN0IGFyZ3MgPSBbJ2xvZ2luJywgJy0tbm8tYnJvd3NlciddO1xuICAvLyBJZiBhIGN1c3RvbSByZWdpc3RyeSBVUkwgaGFzIGJlZW4gc3BlY2lmaWVkLCBhZGQgdGhlIGAtLXJlZ2lzdHJ5YCBmbGFnLiBUaGUgYC0tcmVnaXN0cnlgIGZsYWdcbiAgLy8gbXVzdCBiZSBzcGxpY2VkIGludG8gdGhlIGNvcnJlY3QgcGxhY2UgaW4gdGhlIGNvbW1hbmQgYXMgbnBtIGV4cGVjdHMgaXQgdG8gYmUgdGhlIGZsYWdcbiAgLy8gaW1tZWRpYXRlbHkgZm9sbG93aW5nIHRoZSBsb2dpbiBzdWJjb21tYW5kLlxuICBpZiAocmVnaXN0cnlVcmwgIT09IHVuZGVmaW5lZCkge1xuICAgIGFyZ3Muc3BsaWNlKDEsIDAsICctLXJlZ2lzdHJ5JywgcmVnaXN0cnlVcmwpO1xuICB9XG4gIC8vIFRoZSBsb2dpbiBjb21tYW5kIHByb21wdHMgZm9yIHVzZXJuYW1lLCBwYXNzd29yZCBhbmQgb3RoZXIgcHJvZmlsZSBpbmZvcm1hdGlvbi4gSGVuY2VcbiAgLy8gdGhlIHByb2Nlc3MgbmVlZHMgdG8gYmUgaW50ZXJhY3RpdmUgKGkuZS4gcmVzcGVjdGluZyBjdXJyZW50IFRUWXMgc3RkaW4pLlxuICBhd2FpdCBzcGF3bkludGVyYWN0aXZlQ29tbWFuZCgnbnBtJywgYXJncyk7XG59XG5cbi8qKlxuICogTG9nIG91dCBvZiBOUE0gYXQgYSBwcm92aWRlZCByZWdpc3RyeS5cbiAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIHVzZXIgd2FzIGxvZ2dlZCBvdXQgb2YgTlBNLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbnBtTG9nb3V0KHJlZ2lzdHJ5VXJsOiBzdHJpbmd8dW5kZWZpbmVkKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IGFyZ3MgPSBbJ2xvZ291dCddO1xuICAvLyBJZiBhIGN1c3RvbSByZWdpc3RyeSBVUkwgaGFzIGJlZW4gc3BlY2lmaWVkLCBhZGQgdGhlIGAtLXJlZ2lzdHJ5YCBmbGFnLiBUaGUgYC0tcmVnaXN0cnlgIGZsYWdcbiAgLy8gbXVzdCBiZSBzcGxpY2VkIGludG8gdGhlIGNvcnJlY3QgcGxhY2UgaW4gdGhlIGNvbW1hbmQgYXMgbnBtIGV4cGVjdHMgaXQgdG8gYmUgdGhlIGZsYWdcbiAgLy8gaW1tZWRpYXRlbHkgZm9sbG93aW5nIHRoZSBsb2dvdXQgc3ViY29tbWFuZC5cbiAgaWYgKHJlZ2lzdHJ5VXJsICE9PSB1bmRlZmluZWQpIHtcbiAgICBhcmdzLnNwbGljZSgxLCAwLCAnLS1yZWdpc3RyeScsIHJlZ2lzdHJ5VXJsKTtcbiAgfVxuICB0cnkge1xuICAgIGF3YWl0IHNwYXduV2l0aERlYnVnT3V0cHV0KCducG0nLCBhcmdzLCB7bW9kZTogJ3NpbGVudCd9KTtcbiAgfSBmaW5hbGx5IHtcbiAgICByZXR1cm4gbnBtSXNMb2dnZWRJbihyZWdpc3RyeVVybCk7XG4gIH1cbn1cbiJdfQ==