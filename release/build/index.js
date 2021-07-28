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
        define("@angular/dev-infra-private/release/build", ["require", "exports", "tslib", "child_process"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildReleaseOutput = void 0;
    var tslib_1 = require("tslib");
    var child_process_1 = require("child_process");
    /**
     * Builds the release output without polluting the process stdout. Build scripts commonly
     * print messages to stderr or stdout. This is fine in most cases, but sometimes other tooling
     * reserves stdout for data transfer (e.g. when `ng release build --json` is invoked). To not
     * pollute the stdout in such cases, we launch a child process for building the release packages
     * and redirect all stdout output to the stderr channel (which can be read in the terminal).
     */
    function buildReleaseOutput(stampForRelease) {
        if (stampForRelease === void 0) { stampForRelease = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        var buildProcess = child_process_1.fork(require.resolve('./build-worker'), ["" + stampForRelease], {
                            // The stdio option is set to redirect any "stdout" output directly to the "stderr" file
                            // descriptor. An additional "ipc" file descriptor is created to support communication with
                            // the build process. https://nodejs.org/api/child_process.html#child_process_options_stdio.
                            stdio: ['inherit', 2, 2, 'ipc'],
                        });
                        var builtPackages = null;
                        // The child process will pass the `buildPackages()` output through the
                        // IPC channel. We keep track of it so that we can use it as resolve value.
                        buildProcess.on('message', function (buildResponse) { return builtPackages = buildResponse; });
                        // On child process exit, resolve the promise with the received output.
                        buildProcess.on('exit', function () { return resolve(builtPackages); });
                    })];
            });
        });
    }
    exports.buildReleaseOutput = buildReleaseOutput;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9idWlsZC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsK0NBQW1DO0lBR25DOzs7Ozs7T0FNRztJQUNILFNBQXNCLGtCQUFrQixDQUFDLGVBQWdDO1FBQWhDLGdDQUFBLEVBQUEsdUJBQWdDOzs7Z0JBRXZFLHNCQUFPLElBQUksT0FBTyxDQUFDLFVBQUEsT0FBTzt3QkFDeEIsSUFBTSxZQUFZLEdBQUcsb0JBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxLQUFHLGVBQWlCLENBQUMsRUFBRTs0QkFDbkYsd0ZBQXdGOzRCQUN4RiwyRkFBMkY7NEJBQzNGLDRGQUE0Rjs0QkFDNUYsS0FBSyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDO3lCQUNoQyxDQUFDLENBQUM7d0JBQ0gsSUFBSSxhQUFhLEdBQXdCLElBQUksQ0FBQzt3QkFFOUMsdUVBQXVFO3dCQUN2RSwyRUFBMkU7d0JBQzNFLFlBQVksQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLFVBQUEsYUFBYSxJQUFJLE9BQUEsYUFBYSxHQUFHLGFBQWEsRUFBN0IsQ0FBNkIsQ0FBQyxDQUFDO3dCQUUzRSx1RUFBdUU7d0JBQ3ZFLFlBQVksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLGNBQU0sT0FBQSxPQUFPLENBQUMsYUFBYSxDQUFDLEVBQXRCLENBQXNCLENBQUMsQ0FBQztvQkFDeEQsQ0FBQyxDQUFDLEVBQUM7OztLQUNKO0lBbEJELGdEQWtCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Zvcmt9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHtCdWlsdFBhY2thZ2V9IGZyb20gJy4uL2NvbmZpZy9pbmRleCc7XG5cbi8qKlxuICogQnVpbGRzIHRoZSByZWxlYXNlIG91dHB1dCB3aXRob3V0IHBvbGx1dGluZyB0aGUgcHJvY2VzcyBzdGRvdXQuIEJ1aWxkIHNjcmlwdHMgY29tbW9ubHlcbiAqIHByaW50IG1lc3NhZ2VzIHRvIHN0ZGVyciBvciBzdGRvdXQuIFRoaXMgaXMgZmluZSBpbiBtb3N0IGNhc2VzLCBidXQgc29tZXRpbWVzIG90aGVyIHRvb2xpbmdcbiAqIHJlc2VydmVzIHN0ZG91dCBmb3IgZGF0YSB0cmFuc2ZlciAoZS5nLiB3aGVuIGBuZyByZWxlYXNlIGJ1aWxkIC0tanNvbmAgaXMgaW52b2tlZCkuIFRvIG5vdFxuICogcG9sbHV0ZSB0aGUgc3Rkb3V0IGluIHN1Y2ggY2FzZXMsIHdlIGxhdW5jaCBhIGNoaWxkIHByb2Nlc3MgZm9yIGJ1aWxkaW5nIHRoZSByZWxlYXNlIHBhY2thZ2VzXG4gKiBhbmQgcmVkaXJlY3QgYWxsIHN0ZG91dCBvdXRwdXQgdG8gdGhlIHN0ZGVyciBjaGFubmVsICh3aGljaCBjYW4gYmUgcmVhZCBpbiB0aGUgdGVybWluYWwpLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYnVpbGRSZWxlYXNlT3V0cHV0KHN0YW1wRm9yUmVsZWFzZTogYm9vbGVhbiA9IGZhbHNlKTpcbiAgICBQcm9taXNlPEJ1aWx0UGFja2FnZVtdfG51bGw+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgIGNvbnN0IGJ1aWxkUHJvY2VzcyA9IGZvcmsocmVxdWlyZS5yZXNvbHZlKCcuL2J1aWxkLXdvcmtlcicpLCBbYCR7c3RhbXBGb3JSZWxlYXNlfWBdLCB7XG4gICAgICAvLyBUaGUgc3RkaW8gb3B0aW9uIGlzIHNldCB0byByZWRpcmVjdCBhbnkgXCJzdGRvdXRcIiBvdXRwdXQgZGlyZWN0bHkgdG8gdGhlIFwic3RkZXJyXCIgZmlsZVxuICAgICAgLy8gZGVzY3JpcHRvci4gQW4gYWRkaXRpb25hbCBcImlwY1wiIGZpbGUgZGVzY3JpcHRvciBpcyBjcmVhdGVkIHRvIHN1cHBvcnQgY29tbXVuaWNhdGlvbiB3aXRoXG4gICAgICAvLyB0aGUgYnVpbGQgcHJvY2Vzcy4gaHR0cHM6Ly9ub2RlanMub3JnL2FwaS9jaGlsZF9wcm9jZXNzLmh0bWwjY2hpbGRfcHJvY2Vzc19vcHRpb25zX3N0ZGlvLlxuICAgICAgc3RkaW86IFsnaW5oZXJpdCcsIDIsIDIsICdpcGMnXSxcbiAgICB9KTtcbiAgICBsZXQgYnVpbHRQYWNrYWdlczogQnVpbHRQYWNrYWdlW118bnVsbCA9IG51bGw7XG5cbiAgICAvLyBUaGUgY2hpbGQgcHJvY2VzcyB3aWxsIHBhc3MgdGhlIGBidWlsZFBhY2thZ2VzKClgIG91dHB1dCB0aHJvdWdoIHRoZVxuICAgIC8vIElQQyBjaGFubmVsLiBXZSBrZWVwIHRyYWNrIG9mIGl0IHNvIHRoYXQgd2UgY2FuIHVzZSBpdCBhcyByZXNvbHZlIHZhbHVlLlxuICAgIGJ1aWxkUHJvY2Vzcy5vbignbWVzc2FnZScsIGJ1aWxkUmVzcG9uc2UgPT4gYnVpbHRQYWNrYWdlcyA9IGJ1aWxkUmVzcG9uc2UpO1xuXG4gICAgLy8gT24gY2hpbGQgcHJvY2VzcyBleGl0LCByZXNvbHZlIHRoZSBwcm9taXNlIHdpdGggdGhlIHJlY2VpdmVkIG91dHB1dC5cbiAgICBidWlsZFByb2Nlc3Mub24oJ2V4aXQnLCAoKSA9PiByZXNvbHZlKGJ1aWx0UGFja2FnZXMpKTtcbiAgfSk7XG59XG4iXX0=