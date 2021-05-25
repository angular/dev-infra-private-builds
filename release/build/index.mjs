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
export function buildReleaseOutput(stampForRelease = false) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            const buildProcess = fork(require.resolve('./build-worker'), [`${stampForRelease}`], {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9idWlsZC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUduQzs7Ozs7O0dBTUc7QUFDSCxNQUFNLFVBQWdCLGtCQUFrQixDQUFDLGtCQUEyQixLQUFLOztRQUV2RSxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQzNCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxHQUFHLGVBQWUsRUFBRSxDQUFDLEVBQUU7Z0JBQ25GLHdGQUF3RjtnQkFDeEYsMkZBQTJGO2dCQUMzRiw0RkFBNEY7Z0JBQzVGLEtBQUssRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQzthQUNoQyxDQUFDLENBQUM7WUFDSCxJQUFJLGFBQWEsR0FBd0IsSUFBSSxDQUFDO1lBRTlDLHVFQUF1RTtZQUN2RSwyRUFBMkU7WUFDM0UsWUFBWSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDLENBQUM7WUFFM0UsdUVBQXVFO1lBQ3ZFLFlBQVksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1FBQ3hELENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Zm9ya30gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQge0J1aWx0UGFja2FnZX0gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcblxuLyoqXG4gKiBCdWlsZHMgdGhlIHJlbGVhc2Ugb3V0cHV0IHdpdGhvdXQgcG9sbHV0aW5nIHRoZSBwcm9jZXNzIHN0ZG91dC4gQnVpbGQgc2NyaXB0cyBjb21tb25seVxuICogcHJpbnQgbWVzc2FnZXMgdG8gc3RkZXJyIG9yIHN0ZG91dC4gVGhpcyBpcyBmaW5lIGluIG1vc3QgY2FzZXMsIGJ1dCBzb21ldGltZXMgb3RoZXIgdG9vbGluZ1xuICogcmVzZXJ2ZXMgc3Rkb3V0IGZvciBkYXRhIHRyYW5zZmVyIChlLmcuIHdoZW4gYG5nIHJlbGVhc2UgYnVpbGQgLS1qc29uYCBpcyBpbnZva2VkKS4gVG8gbm90XG4gKiBwb2xsdXRlIHRoZSBzdGRvdXQgaW4gc3VjaCBjYXNlcywgd2UgbGF1bmNoIGEgY2hpbGQgcHJvY2VzcyBmb3IgYnVpbGRpbmcgdGhlIHJlbGVhc2UgcGFja2FnZXNcbiAqIGFuZCByZWRpcmVjdCBhbGwgc3Rkb3V0IG91dHB1dCB0byB0aGUgc3RkZXJyIGNoYW5uZWwgKHdoaWNoIGNhbiBiZSByZWFkIGluIHRoZSB0ZXJtaW5hbCkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBidWlsZFJlbGVhc2VPdXRwdXQoc3RhbXBGb3JSZWxlYXNlOiBib29sZWFuID0gZmFsc2UpOlxuICAgIFByb21pc2U8QnVpbHRQYWNrYWdlW118bnVsbD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgY29uc3QgYnVpbGRQcm9jZXNzID0gZm9yayhyZXF1aXJlLnJlc29sdmUoJy4vYnVpbGQtd29ya2VyJyksIFtgJHtzdGFtcEZvclJlbGVhc2V9YF0sIHtcbiAgICAgIC8vIFRoZSBzdGRpbyBvcHRpb24gaXMgc2V0IHRvIHJlZGlyZWN0IGFueSBcInN0ZG91dFwiIG91dHB1dCBkaXJlY3RseSB0byB0aGUgXCJzdGRlcnJcIiBmaWxlXG4gICAgICAvLyBkZXNjcmlwdG9yLiBBbiBhZGRpdGlvbmFsIFwiaXBjXCIgZmlsZSBkZXNjcmlwdG9yIGlzIGNyZWF0ZWQgdG8gc3VwcG9ydCBjb21tdW5pY2F0aW9uIHdpdGhcbiAgICAgIC8vIHRoZSBidWlsZCBwcm9jZXNzLiBodHRwczovL25vZGVqcy5vcmcvYXBpL2NoaWxkX3Byb2Nlc3MuaHRtbCNjaGlsZF9wcm9jZXNzX29wdGlvbnNfc3RkaW8uXG4gICAgICBzdGRpbzogWydpbmhlcml0JywgMiwgMiwgJ2lwYyddLFxuICAgIH0pO1xuICAgIGxldCBidWlsdFBhY2thZ2VzOiBCdWlsdFBhY2thZ2VbXXxudWxsID0gbnVsbDtcblxuICAgIC8vIFRoZSBjaGlsZCBwcm9jZXNzIHdpbGwgcGFzcyB0aGUgYGJ1aWxkUGFja2FnZXMoKWAgb3V0cHV0IHRocm91Z2ggdGhlXG4gICAgLy8gSVBDIGNoYW5uZWwuIFdlIGtlZXAgdHJhY2sgb2YgaXQgc28gdGhhdCB3ZSBjYW4gdXNlIGl0IGFzIHJlc29sdmUgdmFsdWUuXG4gICAgYnVpbGRQcm9jZXNzLm9uKCdtZXNzYWdlJywgYnVpbGRSZXNwb25zZSA9PiBidWlsdFBhY2thZ2VzID0gYnVpbGRSZXNwb25zZSk7XG5cbiAgICAvLyBPbiBjaGlsZCBwcm9jZXNzIGV4aXQsIHJlc29sdmUgdGhlIHByb21pc2Ugd2l0aCB0aGUgcmVjZWl2ZWQgb3V0cHV0LlxuICAgIGJ1aWxkUHJvY2Vzcy5vbignZXhpdCcsICgpID0+IHJlc29sdmUoYnVpbHRQYWNrYWdlcykpO1xuICB9KTtcbn1cbiJdfQ==