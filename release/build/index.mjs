/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { fork } from 'child_process';
/**
 * Builds the release output without polluting the process stdout. Build scripts commonly
 * print messages to stderr or stdout. This is fine in most cases, but sometimes other tooling
 * reserves stdout for data transfer (e.g. when `ng release build --json` is invoked). To not
 * pollute the stdout in such cases, we launch a child process for building the release packages
 * and redirect all stdout output to the stderr channel (which can be read in the terminal).
 */
export function buildReleaseOutput() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            const buildProcess = fork(require.resolve('./build-worker'), [], {
                // The stdio option is set to redirect any "stdout" output directly to the "stderr" file
                // descriptor. An additional "ipc" file descriptor is created to support communication with
                // the build process. https://nodejs.org/api/child_process.html#child_process_options_stdio.
                stdio: ['inherit', 2, 2, 'ipc'],
            });
            let builtPackages = null;
            // The child process will pass the `buildPackages()` output through the
            // IPC channel. We keep track of it so that we can use it as resolve value.
            buildProcess.on('message', buildResponse => builtPackages = buildResponse);
            // On child process exit, resolve the promise with the received output.
            buildProcess.on('exit', () => resolve(builtPackages));
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9idWlsZC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUduQzs7Ozs7O0dBTUc7QUFDSCxNQUFNLFVBQWdCLGtCQUFrQjs7UUFDdEMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUMzQixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsRUFBRTtnQkFDL0Qsd0ZBQXdGO2dCQUN4RiwyRkFBMkY7Z0JBQzNGLDRGQUE0RjtnQkFDNUYsS0FBSyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDO2FBQ2hDLENBQUMsQ0FBQztZQUNILElBQUksYUFBYSxHQUF3QixJQUFJLENBQUM7WUFFOUMsdUVBQXVFO1lBQ3ZFLDJFQUEyRTtZQUMzRSxZQUFZLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsRUFBRSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUMsQ0FBQztZQUUzRSx1RUFBdUU7WUFDdkUsWUFBWSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtmb3JrfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7QnVpbHRQYWNrYWdlfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuXG4vKipcbiAqIEJ1aWxkcyB0aGUgcmVsZWFzZSBvdXRwdXQgd2l0aG91dCBwb2xsdXRpbmcgdGhlIHByb2Nlc3Mgc3Rkb3V0LiBCdWlsZCBzY3JpcHRzIGNvbW1vbmx5XG4gKiBwcmludCBtZXNzYWdlcyB0byBzdGRlcnIgb3Igc3Rkb3V0LiBUaGlzIGlzIGZpbmUgaW4gbW9zdCBjYXNlcywgYnV0IHNvbWV0aW1lcyBvdGhlciB0b29saW5nXG4gKiByZXNlcnZlcyBzdGRvdXQgZm9yIGRhdGEgdHJhbnNmZXIgKGUuZy4gd2hlbiBgbmcgcmVsZWFzZSBidWlsZCAtLWpzb25gIGlzIGludm9rZWQpLiBUbyBub3RcbiAqIHBvbGx1dGUgdGhlIHN0ZG91dCBpbiBzdWNoIGNhc2VzLCB3ZSBsYXVuY2ggYSBjaGlsZCBwcm9jZXNzIGZvciBidWlsZGluZyB0aGUgcmVsZWFzZSBwYWNrYWdlc1xuICogYW5kIHJlZGlyZWN0IGFsbCBzdGRvdXQgb3V0cHV0IHRvIHRoZSBzdGRlcnIgY2hhbm5lbCAod2hpY2ggY2FuIGJlIHJlYWQgaW4gdGhlIHRlcm1pbmFsKS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJ1aWxkUmVsZWFzZU91dHB1dCgpOiBQcm9taXNlPEJ1aWx0UGFja2FnZVtdfG51bGw+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgIGNvbnN0IGJ1aWxkUHJvY2VzcyA9IGZvcmsocmVxdWlyZS5yZXNvbHZlKCcuL2J1aWxkLXdvcmtlcicpLCBbXSwge1xuICAgICAgLy8gVGhlIHN0ZGlvIG9wdGlvbiBpcyBzZXQgdG8gcmVkaXJlY3QgYW55IFwic3Rkb3V0XCIgb3V0cHV0IGRpcmVjdGx5IHRvIHRoZSBcInN0ZGVyclwiIGZpbGVcbiAgICAgIC8vIGRlc2NyaXB0b3IuIEFuIGFkZGl0aW9uYWwgXCJpcGNcIiBmaWxlIGRlc2NyaXB0b3IgaXMgY3JlYXRlZCB0byBzdXBwb3J0IGNvbW11bmljYXRpb24gd2l0aFxuICAgICAgLy8gdGhlIGJ1aWxkIHByb2Nlc3MuIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvY2hpbGRfcHJvY2Vzcy5odG1sI2NoaWxkX3Byb2Nlc3Nfb3B0aW9uc19zdGRpby5cbiAgICAgIHN0ZGlvOiBbJ2luaGVyaXQnLCAyLCAyLCAnaXBjJ10sXG4gICAgfSk7XG4gICAgbGV0IGJ1aWx0UGFja2FnZXM6IEJ1aWx0UGFja2FnZVtdfG51bGwgPSBudWxsO1xuXG4gICAgLy8gVGhlIGNoaWxkIHByb2Nlc3Mgd2lsbCBwYXNzIHRoZSBgYnVpbGRQYWNrYWdlcygpYCBvdXRwdXQgdGhyb3VnaCB0aGVcbiAgICAvLyBJUEMgY2hhbm5lbC4gV2Uga2VlcCB0cmFjayBvZiBpdCBzbyB0aGF0IHdlIGNhbiB1c2UgaXQgYXMgcmVzb2x2ZSB2YWx1ZS5cbiAgICBidWlsZFByb2Nlc3Mub24oJ21lc3NhZ2UnLCBidWlsZFJlc3BvbnNlID0+IGJ1aWx0UGFja2FnZXMgPSBidWlsZFJlc3BvbnNlKTtcblxuICAgIC8vIE9uIGNoaWxkIHByb2Nlc3MgZXhpdCwgcmVzb2x2ZSB0aGUgcHJvbWlzZSB3aXRoIHRoZSByZWNlaXZlZCBvdXRwdXQuXG4gICAgYnVpbGRQcm9jZXNzLm9uKCdleGl0JywgKCkgPT4gcmVzb2x2ZShidWlsdFBhY2thZ2VzKSk7XG4gIH0pO1xufVxuIl19