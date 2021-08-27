"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildReleaseOutput = void 0;
const child_process_1 = require("child_process");
/**
 * Builds the release output without polluting the process stdout. Build scripts commonly
 * print messages to stderr or stdout. This is fine in most cases, but sometimes other tooling
 * reserves stdout for data transfer (e.g. when `ng release build --json` is invoked). To not
 * pollute the stdout in such cases, we launch a child process for building the release packages
 * and redirect all stdout output to the stderr channel (which can be read in the terminal).
 */
async function buildReleaseOutput(stampForRelease = false) {
    return new Promise((resolve) => {
        const buildProcess = (0, child_process_1.fork)(require.resolve('./build-worker'), [`${stampForRelease}`], {
            // The stdio option is set to redirect any "stdout" output directly to the "stderr" file
            // descriptor. An additional "ipc" file descriptor is created to support communication with
            // the build process. https://nodejs.org/api/child_process.html#child_process_options_stdio.
            stdio: ['inherit', 2, 2, 'ipc'],
        });
        let builtPackages = null;
        // The child process will pass the `buildPackages()` output through the
        // IPC channel. We keep track of it so that we can use it as resolve value.
        buildProcess.on('message', (buildResponse) => (builtPackages = buildResponse));
        // On child process exit, resolve the promise with the received output.
        buildProcess.on('exit', () => resolve(builtPackages));
    });
}
exports.buildReleaseOutput = buildReleaseOutput;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS9idWlsZC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCxpREFBbUM7QUFHbkM7Ozs7OztHQU1HO0FBQ0ksS0FBSyxVQUFVLGtCQUFrQixDQUN0QyxrQkFBMkIsS0FBSztJQUVoQyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7UUFDN0IsTUFBTSxZQUFZLEdBQUcsSUFBQSxvQkFBSSxFQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLEdBQUcsZUFBZSxFQUFFLENBQUMsRUFBRTtZQUNuRix3RkFBd0Y7WUFDeEYsMkZBQTJGO1lBQzNGLDRGQUE0RjtZQUM1RixLQUFLLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUM7U0FDaEMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxhQUFhLEdBQTBCLElBQUksQ0FBQztRQUVoRCx1RUFBdUU7UUFDdkUsMkVBQTJFO1FBQzNFLFlBQVksQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsYUFBNkIsRUFBRSxFQUFFLENBQUMsQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUUvRix1RUFBdUU7UUFDdkUsWUFBWSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7SUFDeEQsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBbkJELGdEQW1CQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Zvcmt9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHtCdWlsdFBhY2thZ2V9IGZyb20gJy4uL2NvbmZpZy9pbmRleCc7XG5cbi8qKlxuICogQnVpbGRzIHRoZSByZWxlYXNlIG91dHB1dCB3aXRob3V0IHBvbGx1dGluZyB0aGUgcHJvY2VzcyBzdGRvdXQuIEJ1aWxkIHNjcmlwdHMgY29tbW9ubHlcbiAqIHByaW50IG1lc3NhZ2VzIHRvIHN0ZGVyciBvciBzdGRvdXQuIFRoaXMgaXMgZmluZSBpbiBtb3N0IGNhc2VzLCBidXQgc29tZXRpbWVzIG90aGVyIHRvb2xpbmdcbiAqIHJlc2VydmVzIHN0ZG91dCBmb3IgZGF0YSB0cmFuc2ZlciAoZS5nLiB3aGVuIGBuZyByZWxlYXNlIGJ1aWxkIC0tanNvbmAgaXMgaW52b2tlZCkuIFRvIG5vdFxuICogcG9sbHV0ZSB0aGUgc3Rkb3V0IGluIHN1Y2ggY2FzZXMsIHdlIGxhdW5jaCBhIGNoaWxkIHByb2Nlc3MgZm9yIGJ1aWxkaW5nIHRoZSByZWxlYXNlIHBhY2thZ2VzXG4gKiBhbmQgcmVkaXJlY3QgYWxsIHN0ZG91dCBvdXRwdXQgdG8gdGhlIHN0ZGVyciBjaGFubmVsICh3aGljaCBjYW4gYmUgcmVhZCBpbiB0aGUgdGVybWluYWwpLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYnVpbGRSZWxlYXNlT3V0cHV0KFxuICBzdGFtcEZvclJlbGVhc2U6IGJvb2xlYW4gPSBmYWxzZSxcbik6IFByb21pc2U8QnVpbHRQYWNrYWdlW10gfCBudWxsPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIGNvbnN0IGJ1aWxkUHJvY2VzcyA9IGZvcmsocmVxdWlyZS5yZXNvbHZlKCcuL2J1aWxkLXdvcmtlcicpLCBbYCR7c3RhbXBGb3JSZWxlYXNlfWBdLCB7XG4gICAgICAvLyBUaGUgc3RkaW8gb3B0aW9uIGlzIHNldCB0byByZWRpcmVjdCBhbnkgXCJzdGRvdXRcIiBvdXRwdXQgZGlyZWN0bHkgdG8gdGhlIFwic3RkZXJyXCIgZmlsZVxuICAgICAgLy8gZGVzY3JpcHRvci4gQW4gYWRkaXRpb25hbCBcImlwY1wiIGZpbGUgZGVzY3JpcHRvciBpcyBjcmVhdGVkIHRvIHN1cHBvcnQgY29tbXVuaWNhdGlvbiB3aXRoXG4gICAgICAvLyB0aGUgYnVpbGQgcHJvY2Vzcy4gaHR0cHM6Ly9ub2RlanMub3JnL2FwaS9jaGlsZF9wcm9jZXNzLmh0bWwjY2hpbGRfcHJvY2Vzc19vcHRpb25zX3N0ZGlvLlxuICAgICAgc3RkaW86IFsnaW5oZXJpdCcsIDIsIDIsICdpcGMnXSxcbiAgICB9KTtcbiAgICBsZXQgYnVpbHRQYWNrYWdlczogQnVpbHRQYWNrYWdlW10gfCBudWxsID0gbnVsbDtcblxuICAgIC8vIFRoZSBjaGlsZCBwcm9jZXNzIHdpbGwgcGFzcyB0aGUgYGJ1aWxkUGFja2FnZXMoKWAgb3V0cHV0IHRocm91Z2ggdGhlXG4gICAgLy8gSVBDIGNoYW5uZWwuIFdlIGtlZXAgdHJhY2sgb2YgaXQgc28gdGhhdCB3ZSBjYW4gdXNlIGl0IGFzIHJlc29sdmUgdmFsdWUuXG4gICAgYnVpbGRQcm9jZXNzLm9uKCdtZXNzYWdlJywgKGJ1aWxkUmVzcG9uc2U6IEJ1aWx0UGFja2FnZVtdKSA9PiAoYnVpbHRQYWNrYWdlcyA9IGJ1aWxkUmVzcG9uc2UpKTtcblxuICAgIC8vIE9uIGNoaWxkIHByb2Nlc3MgZXhpdCwgcmVzb2x2ZSB0aGUgcHJvbWlzZSB3aXRoIHRoZSByZWNlaXZlZCBvdXRwdXQuXG4gICAgYnVpbGRQcm9jZXNzLm9uKCdleGl0JywgKCkgPT4gcmVzb2x2ZShidWlsdFBhY2thZ2VzKSk7XG4gIH0pO1xufVxuIl19