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
        const buildProcess = child_process_1.fork(require.resolve('./build-worker'), [`${stampForRelease}`], {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS9idWlsZC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCxpREFBbUM7QUFHbkM7Ozs7OztHQU1HO0FBQ0ksS0FBSyxVQUFVLGtCQUFrQixDQUN0QyxrQkFBMkIsS0FBSztJQUVoQyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7UUFDN0IsTUFBTSxZQUFZLEdBQUcsb0JBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxHQUFHLGVBQWUsRUFBRSxDQUFDLEVBQUU7WUFDbkYsd0ZBQXdGO1lBQ3hGLDJGQUEyRjtZQUMzRiw0RkFBNEY7WUFDNUYsS0FBSyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDO1NBQ2hDLENBQUMsQ0FBQztRQUNILElBQUksYUFBYSxHQUEwQixJQUFJLENBQUM7UUFFaEQsdUVBQXVFO1FBQ3ZFLDJFQUEyRTtRQUMzRSxZQUFZLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLGFBQTZCLEVBQUUsRUFBRSxDQUFDLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFFL0YsdUVBQXVFO1FBQ3ZFLFlBQVksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO0lBQ3hELENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQW5CRCxnREFtQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtmb3JrfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7QnVpbHRQYWNrYWdlfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuXG4vKipcbiAqIEJ1aWxkcyB0aGUgcmVsZWFzZSBvdXRwdXQgd2l0aG91dCBwb2xsdXRpbmcgdGhlIHByb2Nlc3Mgc3Rkb3V0LiBCdWlsZCBzY3JpcHRzIGNvbW1vbmx5XG4gKiBwcmludCBtZXNzYWdlcyB0byBzdGRlcnIgb3Igc3Rkb3V0LiBUaGlzIGlzIGZpbmUgaW4gbW9zdCBjYXNlcywgYnV0IHNvbWV0aW1lcyBvdGhlciB0b29saW5nXG4gKiByZXNlcnZlcyBzdGRvdXQgZm9yIGRhdGEgdHJhbnNmZXIgKGUuZy4gd2hlbiBgbmcgcmVsZWFzZSBidWlsZCAtLWpzb25gIGlzIGludm9rZWQpLiBUbyBub3RcbiAqIHBvbGx1dGUgdGhlIHN0ZG91dCBpbiBzdWNoIGNhc2VzLCB3ZSBsYXVuY2ggYSBjaGlsZCBwcm9jZXNzIGZvciBidWlsZGluZyB0aGUgcmVsZWFzZSBwYWNrYWdlc1xuICogYW5kIHJlZGlyZWN0IGFsbCBzdGRvdXQgb3V0cHV0IHRvIHRoZSBzdGRlcnIgY2hhbm5lbCAod2hpY2ggY2FuIGJlIHJlYWQgaW4gdGhlIHRlcm1pbmFsKS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJ1aWxkUmVsZWFzZU91dHB1dChcbiAgc3RhbXBGb3JSZWxlYXNlOiBib29sZWFuID0gZmFsc2UsXG4pOiBQcm9taXNlPEJ1aWx0UGFja2FnZVtdIHwgbnVsbD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBjb25zdCBidWlsZFByb2Nlc3MgPSBmb3JrKHJlcXVpcmUucmVzb2x2ZSgnLi9idWlsZC13b3JrZXInKSwgW2Ake3N0YW1wRm9yUmVsZWFzZX1gXSwge1xuICAgICAgLy8gVGhlIHN0ZGlvIG9wdGlvbiBpcyBzZXQgdG8gcmVkaXJlY3QgYW55IFwic3Rkb3V0XCIgb3V0cHV0IGRpcmVjdGx5IHRvIHRoZSBcInN0ZGVyclwiIGZpbGVcbiAgICAgIC8vIGRlc2NyaXB0b3IuIEFuIGFkZGl0aW9uYWwgXCJpcGNcIiBmaWxlIGRlc2NyaXB0b3IgaXMgY3JlYXRlZCB0byBzdXBwb3J0IGNvbW11bmljYXRpb24gd2l0aFxuICAgICAgLy8gdGhlIGJ1aWxkIHByb2Nlc3MuIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvY2hpbGRfcHJvY2Vzcy5odG1sI2NoaWxkX3Byb2Nlc3Nfb3B0aW9uc19zdGRpby5cbiAgICAgIHN0ZGlvOiBbJ2luaGVyaXQnLCAyLCAyLCAnaXBjJ10sXG4gICAgfSk7XG4gICAgbGV0IGJ1aWx0UGFja2FnZXM6IEJ1aWx0UGFja2FnZVtdIHwgbnVsbCA9IG51bGw7XG5cbiAgICAvLyBUaGUgY2hpbGQgcHJvY2VzcyB3aWxsIHBhc3MgdGhlIGBidWlsZFBhY2thZ2VzKClgIG91dHB1dCB0aHJvdWdoIHRoZVxuICAgIC8vIElQQyBjaGFubmVsLiBXZSBrZWVwIHRyYWNrIG9mIGl0IHNvIHRoYXQgd2UgY2FuIHVzZSBpdCBhcyByZXNvbHZlIHZhbHVlLlxuICAgIGJ1aWxkUHJvY2Vzcy5vbignbWVzc2FnZScsIChidWlsZFJlc3BvbnNlOiBCdWlsdFBhY2thZ2VbXSkgPT4gKGJ1aWx0UGFja2FnZXMgPSBidWlsZFJlc3BvbnNlKSk7XG5cbiAgICAvLyBPbiBjaGlsZCBwcm9jZXNzIGV4aXQsIHJlc29sdmUgdGhlIHByb21pc2Ugd2l0aCB0aGUgcmVjZWl2ZWQgb3V0cHV0LlxuICAgIGJ1aWxkUHJvY2Vzcy5vbignZXhpdCcsICgpID0+IHJlc29sdmUoYnVpbHRQYWNrYWdlcykpO1xuICB9KTtcbn1cbiJdfQ==