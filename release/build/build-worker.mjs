/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
/*
 * This file will be spawned as a separate process when the `ng-dev release build` command is
 * invoked. A separate process allows us to hide any superfluous stdout output from arbitrary
 * build commands that we cannot control. This is necessary as the `ng-dev release build` command
 * supports stdout JSON output that should be parsable and not polluted from other stdout messages.
 */
import { getReleaseConfig } from '../config/index';
// Start the release package building.
main();
/** Main function for building the release packages. */
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.send === undefined) {
            throw Error('This script needs to be invoked as a NodeJS worker.');
        }
        const config = getReleaseConfig();
        const builtPackages = yield config.buildPackages();
        // Transfer the built packages back to the parent process.
        process.send(builtPackages);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQtd29ya2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvYnVpbGQvYnVpbGQtd29ya2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSDs7Ozs7R0FLRztBQUVILE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBRWpELHNDQUFzQztBQUN0QyxJQUFJLEVBQUUsQ0FBQztBQUVQLHVEQUF1RDtBQUN2RCxTQUFlLElBQUk7O1FBQ2pCLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7WUFDOUIsTUFBTSxLQUFLLENBQUMscURBQXFELENBQUMsQ0FBQztTQUNwRTtRQUVELE1BQU0sTUFBTSxHQUFHLGdCQUFnQixFQUFFLENBQUM7UUFDbEMsTUFBTSxhQUFhLEdBQUcsTUFBTSxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFbkQsMERBQTBEO1FBQzFELE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDOUIsQ0FBQztDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qXG4gKiBUaGlzIGZpbGUgd2lsbCBiZSBzcGF3bmVkIGFzIGEgc2VwYXJhdGUgcHJvY2VzcyB3aGVuIHRoZSBgbmctZGV2IHJlbGVhc2UgYnVpbGRgIGNvbW1hbmQgaXNcbiAqIGludm9rZWQuIEEgc2VwYXJhdGUgcHJvY2VzcyBhbGxvd3MgdXMgdG8gaGlkZSBhbnkgc3VwZXJmbHVvdXMgc3Rkb3V0IG91dHB1dCBmcm9tIGFyYml0cmFyeVxuICogYnVpbGQgY29tbWFuZHMgdGhhdCB3ZSBjYW5ub3QgY29udHJvbC4gVGhpcyBpcyBuZWNlc3NhcnkgYXMgdGhlIGBuZy1kZXYgcmVsZWFzZSBidWlsZGAgY29tbWFuZFxuICogc3VwcG9ydHMgc3Rkb3V0IEpTT04gb3V0cHV0IHRoYXQgc2hvdWxkIGJlIHBhcnNhYmxlIGFuZCBub3QgcG9sbHV0ZWQgZnJvbSBvdGhlciBzdGRvdXQgbWVzc2FnZXMuXG4gKi9cblxuaW1wb3J0IHtnZXRSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuXG4vLyBTdGFydCB0aGUgcmVsZWFzZSBwYWNrYWdlIGJ1aWxkaW5nLlxubWFpbigpO1xuXG4vKiogTWFpbiBmdW5jdGlvbiBmb3IgYnVpbGRpbmcgdGhlIHJlbGVhc2UgcGFja2FnZXMuICovXG5hc3luYyBmdW5jdGlvbiBtYWluKCkge1xuICBpZiAocHJvY2Vzcy5zZW5kID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBFcnJvcignVGhpcyBzY3JpcHQgbmVlZHMgdG8gYmUgaW52b2tlZCBhcyBhIE5vZGVKUyB3b3JrZXIuJyk7XG4gIH1cblxuICBjb25zdCBjb25maWcgPSBnZXRSZWxlYXNlQ29uZmlnKCk7XG4gIGNvbnN0IGJ1aWx0UGFja2FnZXMgPSBhd2FpdCBjb25maWcuYnVpbGRQYWNrYWdlcygpO1xuXG4gIC8vIFRyYW5zZmVyIHRoZSBidWlsdCBwYWNrYWdlcyBiYWNrIHRvIHRoZSBwYXJlbnQgcHJvY2Vzcy5cbiAgcHJvY2Vzcy5zZW5kKGJ1aWx0UGFja2FnZXMpO1xufVxuIl19