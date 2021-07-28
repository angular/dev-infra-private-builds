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
        define("@angular/dev-infra-private/utils/child-process", ["require", "exports", "tslib", "child_process", "@angular/dev-infra-private/utils/console"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.spawnSync = exports.spawn = exports.spawnInteractive = void 0;
    var tslib_1 = require("tslib");
    var child_process_1 = require("child_process");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    /**
     * Spawns a given command with the specified arguments inside an interactive shell. All process
     * stdin, stdout and stderr output is printed to the current console.
     *
     * @returns a Promise resolving on success, and rejecting on command failure with the status code.
     */
    function spawnInteractive(command, args, options) {
        if (options === void 0) { options = {}; }
        return new Promise(function (resolve, reject) {
            var commandText = command + " " + args.join(' ');
            console_1.debug("Executing command: " + commandText);
            var childProcess = child_process_1.spawn(command, args, tslib_1.__assign(tslib_1.__assign({}, options), { shell: true, stdio: 'inherit' }));
            childProcess.on('exit', function (status) { return status === 0 ? resolve() : reject(status); });
        });
    }
    exports.spawnInteractive = spawnInteractive;
    /**
     * Spawns a given command with the specified arguments inside a shell. All process stdout
     * output is captured and returned as resolution on completion. Depending on the chosen
     * output mode, stdout/stderr output is also printed to the console, or only on error.
     *
     * @returns a Promise resolving with captured stdout and stderr on success. The promise
     *   rejects on command failure.
     */
    function spawn(command, args, options) {
        if (options === void 0) { options = {}; }
        return new Promise(function (resolve, reject) {
            var commandText = command + " " + args.join(' ');
            var outputMode = options.mode;
            console_1.debug("Executing command: " + commandText);
            var childProcess = child_process_1.spawn(command, args, tslib_1.__assign(tslib_1.__assign({}, options), { shell: true, stdio: 'pipe' }));
            var logOutput = '';
            var stdout = '';
            var stderr = '';
            // Capture the stdout separately so that it can be passed as resolve value.
            // This is useful if commands return parsable stdout.
            childProcess.stderr.on('data', function (message) {
                stderr += message;
                logOutput += message;
                // If console output is enabled, print the message directly to the stderr. Note that
                // we intentionally print all output to stderr as stdout should not be polluted.
                if (outputMode === undefined || outputMode === 'enabled') {
                    process.stderr.write(message);
                }
            });
            childProcess.stdout.on('data', function (message) {
                stdout += message;
                logOutput += message;
                // If console output is enabled, print the message directly to the stderr. Note that
                // we intentionally print all output to stderr as stdout should not be polluted.
                if (outputMode === undefined || outputMode === 'enabled') {
                    process.stderr.write(message);
                }
            });
            childProcess.on('exit', function (exitCode, signal) {
                var exitDescription = exitCode !== null ? "exit code \"" + exitCode + "\"" : "signal \"" + signal + "\"";
                var printFn = outputMode === 'on-error' ? console_1.error : console_1.debug;
                var status = statusFromExitCodeAndSignal(exitCode, signal);
                printFn("Command \"" + commandText + "\" completed with " + exitDescription + ".");
                printFn("Process output: \n" + logOutput);
                // On success, resolve the promise. Otherwise reject with the captured stderr
                // and stdout log output if the output mode was set to `silent`.
                if (status === 0 || options.suppressErrorOnFailingExitCode) {
                    resolve({ stdout: stdout, stderr: stderr, status: status });
                }
                else {
                    reject(outputMode === 'silent' ? logOutput : undefined);
                }
            });
        });
    }
    exports.spawn = spawn;
    /**
     * Spawns a given command with the specified arguments inside a shell synchronously.
     *
     * @returns The command's stdout and stderr.
     */
    function spawnSync(command, args, options) {
        if (options === void 0) { options = {}; }
        var commandText = command + " " + args.join(' ');
        console_1.debug("Executing command: " + commandText);
        var _a = child_process_1.spawnSync(command, args, tslib_1.__assign(tslib_1.__assign({}, options), { encoding: 'utf8', shell: true, stdio: 'pipe' })), exitCode = _a.status, signal = _a.signal, stdout = _a.stdout, stderr = _a.stderr;
        /** The status of the spawn result. */
        var status = statusFromExitCodeAndSignal(exitCode, signal);
        if (status === 0 || options.suppressErrorOnFailingExitCode) {
            return { status: status, stdout: stdout, stderr: stderr };
        }
        throw new Error(stderr);
    }
    exports.spawnSync = spawnSync;
    /**
     * Convert the provided exitCode and signal to a single status code.
     *
     * During `exit` node provides either a `code` or `signal`, one of which is guaranteed to be
     * non-null.
     *
     * For more details see: https://nodejs.org/api/child_process.html#child_process_event_exit
     */
    function statusFromExitCodeAndSignal(exitCode, signal) {
        var _a;
        return (_a = exitCode !== null && exitCode !== void 0 ? exitCode : signal) !== null && _a !== void 0 ? _a : -1;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hpbGQtcHJvY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9jaGlsZC1wcm9jZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQ0FBNkk7SUFDN0ksb0VBQXVDO0lBOEJ2Qzs7Ozs7T0FLRztJQUNILFNBQWdCLGdCQUFnQixDQUM1QixPQUFlLEVBQUUsSUFBYyxFQUFFLE9BQTRDO1FBQTVDLHdCQUFBLEVBQUEsWUFBNEM7UUFDL0UsT0FBTyxJQUFJLE9BQU8sQ0FBTyxVQUFDLE9BQU8sRUFBRSxNQUFNO1lBQ3ZDLElBQU0sV0FBVyxHQUFNLE9BQU8sU0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBRyxDQUFDO1lBQ25ELGVBQUssQ0FBQyx3QkFBc0IsV0FBYSxDQUFDLENBQUM7WUFDM0MsSUFBTSxZQUFZLEdBQUcscUJBQU0sQ0FBQyxPQUFPLEVBQUUsSUFBSSx3Q0FBTSxPQUFPLEtBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsU0FBUyxJQUFFLENBQUM7WUFDeEYsWUFBWSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBQSxNQUFNLElBQUksT0FBQSxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUF6QyxDQUF5QyxDQUFDLENBQUM7UUFDL0UsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBUkQsNENBUUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsU0FBZ0IsS0FBSyxDQUNqQixPQUFlLEVBQUUsSUFBYyxFQUFFLE9BQTBCO1FBQTFCLHdCQUFBLEVBQUEsWUFBMEI7UUFDN0QsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNO1lBQ2pDLElBQU0sV0FBVyxHQUFNLE9BQU8sU0FBSSxJ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VSxDQUFDLE9BQU8sRUFBRSxJQUFJLHdDQUFNLE9BQU8sS0FBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sSUFBRSxFQUQxRSxRQUFRLFlBQUEsRUFBRSxNQUFNLFlBQUEsRUFBRSxNQUFNLFlBQUEsRUFBRSxNQUFNLFlBQzBDLENBQUM7UUFFMUYsc0NBQXNDO1FBQ3RDLElBQU0sTUFBTSxHQUFHLDJCQUEyQixDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUU3RCxJQUFJLE1BQU0sS0FBSyxDQUFDLElBQUksT0FBTyxDQUFDLDhCQUE4QixFQUFFO1lBQzFELE9BQU8sRUFBQyxNQUFNLFFBQUEsRUFBRSxNQUFNLFFBQUEsRUFBRSxNQUFNLFFBQUEsRUFBQyxDQUFDO1NBQ2pDO1FBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBaEJELDhCQWdCQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxTQUFTLDJCQUEyQixDQUFDLFFBQXFCLEVBQUUsTUFBMkI7O1FBQ3JGLE9BQU8sTUFBQSxRQUFRLGFBQVIsUUFBUSxjQUFSLFFBQVEsR0FBSSxNQUFNLG1DQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2xDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtzcGF3biBhcyBfc3Bhd24sIFNwYXduT3B0aW9ucyBhcyBfU3Bhd25PcHRpb25zLCBzcGF3blN5bmMgYXMgX3NwYXduU3luYywgU3Bhd25TeW5jT3B0aW9ucyBhcyBfU3Bhd25TeW5jT3B0aW9uc30gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQge2RlYnVnLCBlcnJvcn0gZnJvbSAnLi9jb25zb2xlJztcblxuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgdGhlIG9wdGlvbnMgZm9yIHNwYXduaW5nIGEgcHJvY2VzcyBzeW5jaHJvbm91c2x5LiAqL1xuZXhwb3J0IGludGVyZmFjZSBTcGF3blN5bmNPcHRpb25zIGV4dGVuZHMgT21pdDxfU3Bhd25TeW5jT3B0aW9ucywgJ3NoZWxsJ3wnc3RkaW8nPiB7XG4gIC8qKiBXaGV0aGVyIHRvIHByZXZlbnQgZXhpdCBjb2RlcyBiZWluZyB0cmVhdGVkIGFzIGZhaWx1cmVzLiAqL1xuICBzdXBwcmVzc0Vycm9yT25GYWlsaW5nRXhpdENvZGU/OiBib29sZWFuO1xufVxuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgdGhlIG9wdGlvbnMgZm9yIHNwYXduaW5nIGEgcHJvY2Vzcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3Bhd25PcHRpb25zIGV4dGVuZHMgT21pdDxfU3Bhd25PcHRpb25zLCAnc2hlbGwnfCdzdGRpbyc+IHtcbiAgLyoqIENvbnNvbGUgb3V0cHV0IG1vZGUuIERlZmF1bHRzIHRvIFwiZW5hYmxlZFwiLiAqL1xuICBtb2RlPzogJ2VuYWJsZWQnfCdzaWxlbnQnfCdvbi1lcnJvcic7XG4gIC8qKiBXaGV0aGVyIHRvIHByZXZlbnQgZXhpdCBjb2RlcyBiZWluZyB0cmVhdGVkIGFzIGZhaWx1cmVzLiAqL1xuICBzdXBwcmVzc0Vycm9yT25GYWlsaW5nRXhpdENvZGU/OiBib29sZWFuO1xufVxuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgdGhlIG9wdGlvbnMgZm9yIHNwYXduaW5nIGFuIGludGVyYWN0aXZlIHByb2Nlc3MuICovXG5leHBvcnQgdHlwZSBTcGF3bkludGVyYWN0aXZlQ29tbWFuZE9wdGlvbnMgPSBPbWl0PF9TcGF3bk9wdGlvbnMsICdzaGVsbCd8J3N0ZGlvJz47XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyB0aGUgcmVzdWx0IG9mIGEgc3Bhd25lZCBwcm9jZXNzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBTcGF3blJlc3VsdCB7XG4gIC8qKiBDYXB0dXJlZCBzdGRvdXQgaW4gc3RyaW5nIGZvcm1hdC4gKi9cbiAgc3Rkb3V0OiBzdHJpbmc7XG4gIC8qKiBDYXB0dXJlZCBzdGRlcnIgaW4gc3RyaW5nIGZvcm1hdC4gKi9cbiAgc3RkZXJyOiBzdHJpbmc7XG4gIC8qKiBUaGUgZXhpdCBjb2RlIG9yIHNpZ25hbCBvZiB0aGUgcHJvY2Vzcy4gKi9cbiAgc3RhdHVzOiBudW1iZXJ8Tm9kZUpTLlNpZ25hbHM7XG59XG5cbi8qKlxuICogU3Bhd25zIGEgZ2l2ZW4gY29tbWFuZCB3aXRoIHRoZSBzcGVjaWZpZWQgYXJndW1lbnRzIGluc2lkZSBhbiBpbnRlcmFjdGl2ZSBzaGVsbC4gQWxsIHByb2Nlc3NcbiAqIHN0ZGluLCBzdGRvdXQgYW5kIHN0ZGVyciBvdXRwdXQgaXMgcHJpbnRlZCB0byB0aGUgY3VycmVudCBjb25zb2xlLlxuICpcbiAqIEByZXR1cm5zIGEgUHJvbWlzZSByZXNvbHZpbmcgb24gc3VjY2VzcywgYW5kIHJlamVjdGluZyBvbiBjb21tYW5kIGZhaWx1cmUgd2l0aCB0aGUgc3RhdHVzIGNvZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcGF3bkludGVyYWN0aXZlKFxuICAgIGNvbW1hbmQ6IHN0cmluZywgYXJnczogc3RyaW5nW10sIG9wdGlvbnM6IFNwYXduSW50ZXJhY3RpdmVDb21tYW5kT3B0aW9ucyA9IHt9KSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgY29tbWFuZFRleHQgPSBgJHtjb21tYW5kfSAke2FyZ3Muam9pbignICcpfWA7XG4gICAgZGVidWcoYEV4ZWN1dGluZyBjb21tYW5kOiAke2NvbW1hbmRUZXh0fWApO1xuICAgIGNvbnN0IGNoaWxkUHJvY2VzcyA9IF9zcGF3bihjb21tYW5kLCBhcmdzLCB7Li4ub3B0aW9ucywgc2hlbGw6IHRydWUsIHN0ZGlvOiAnaW5oZXJpdCd9KTtcbiAgICBjaGlsZFByb2Nlc3Mub24oJ2V4aXQnLCBzdGF0dXMgPT4gc3RhdHVzID09PSAwID8gcmVzb2x2ZSgpIDogcmVqZWN0KHN0YXR1cykpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBTcGF3bnMgYSBnaXZlbiBjb21tYW5kIHdpdGggdGhlIHNwZWNpZmllZCBhcmd1bWVudHMgaW5zaWRlIGEgc2hlbGwuIEFsbCBwcm9jZXNzIHN0ZG91dFxuICogb3V0cHV0IGlzIGNhcHR1cmVkIGFuZCByZXR1cm5lZCBhcyByZXNvbHV0aW9uIG9uIGNvbXBsZXRpb24uIERlcGVuZGluZyBvbiB0aGUgY2hvc2VuXG4gKiBvdXRwdXQgbW9kZSwgc3Rkb3V0L3N0ZGVyciBvdXRwdXQgaXMgYWxzbyBwcmludGVkIHRvIHRoZSBjb25zb2xlLCBvciBvbmx5IG9uIGVycm9yLlxuICpcbiAqIEByZXR1cm5zIGEgUHJvbWlzZSByZXNvbHZpbmcgd2l0aCBjYXB0dXJlZCBzdGRvdXQgYW5kIHN0ZGVyciBvbiBzdWNjZXNzLiBUaGUgcHJvbWlzZVxuICogICByZWplY3RzIG9uIGNvbW1hbmQgZmFpbHVyZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNwYXduKFxuICAgIGNvbW1hbmQ6IHN0cmluZywgYXJnczogc3RyaW5nW10sIG9wdGlvbnM6IFNwYXduT3B0aW9ucyA9IHt9KTogUHJvbWlzZTxTcGF3blJlc3VsdD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGNvbW1hbmRUZXh0ID0gYCR7Y29tbWFuZH0gJHthcmdzLmpvaW4oJyAnKX1gO1xuICAgIGNvbnN0IG91dHB1dE1vZGUgPSBvcHRpb25zLm1vZGU7XG5cbiAgICBkZWJ1ZyhgRXhlY3V0aW5nIGNvbW1hbmQ6ICR7Y29tbWFuZFRleHR9YCk7XG5cbiAgICBjb25zdCBjaGlsZFByb2Nlc3MgPSBfc3Bhd24oY29tbWFuZCwgYXJncywgey4uLm9wdGlvbnMsIHNoZWxsOiB0cnVlLCBzdGRpbzogJ3BpcGUnfSk7XG4gICAgbGV0IGxvZ091dHB1dCA9ICcnO1xuICAgIGxldCBzdGRvdXQgPSAnJztcbiAgICBsZXQgc3RkZXJyID0gJyc7XG5cbiAgICAvLyBDYXB0dXJlIHRoZSBzdGRvdXQgc2VwYXJhdGVseSBzbyB0aGF0IGl0IGNhbiBiZSBwYXNzZWQgYXMgcmVzb2x2ZSB2YWx1ZS5cbiAgICAvLyBUaGlzIGlzIHVzZWZ1bCBpZiBjb21tYW5kcyByZXR1cm4gcGFyc2FibGUgc3Rkb3V0LlxuICAgIGNoaWxkUHJvY2Vzcy5zdGRlcnIub24oJ2RhdGEnLCBtZXNzYWdlID0+IHtcbiAgICAgIHN0ZGVyciArPSBtZXNzYWdlO1xuICAgICAgbG9nT3V0cHV0ICs9IG1lc3NhZ2U7XG4gICAgICAvLyBJZiBjb25zb2xlIG91dHB1dCBpcyBlbmFibGVkLCBwcmludCB0aGUgbWVzc2FnZSBkaXJlY3RseSB0byB0aGUgc3RkZXJyLiBOb3RlIHRoYXRcbiAgICAgIC8vIHdlIGludGVudGlvbmFsbHkgcHJpbnQgYWxsIG91dHB1dCB0byBzdGRlcnIgYXMgc3Rkb3V0IHNob3VsZCBub3QgYmUgcG9sbHV0ZWQuXG4gICAgICBpZiAob3V0cHV0TW9kZSA9PT0gdW5kZWZpbmVkIHx8IG91dHB1dE1vZGUgPT09ICdlbmFibGVkJykge1xuICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZShtZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNoaWxkUHJvY2Vzcy5zdGRvdXQub24oJ2RhdGEnLCBtZXNzYWdlID0+IHtcbiAgICAgIHN0ZG91dCArPSBtZXNzYWdlO1xuICAgICAgbG9nT3V0cHV0ICs9IG1lc3NhZ2U7XG4gICAgICAvLyBJZiBjb25zb2xlIG91dHB1dCBpcyBlbmFibGVkLCBwcmludCB0aGUgbWVzc2FnZSBkaXJlY3RseSB0byB0aGUgc3RkZXJyLiBOb3RlIHRoYXRcbiAgICAgIC8vIHdlIGludGVudGlvbmFsbHkgcHJpbnQgYWxsIG91dHB1dCB0byBzdGRlcnIgYXMgc3Rkb3V0IHNob3VsZCBub3QgYmUgcG9sbHV0ZWQuXG4gICAgICBpZiAob3V0cHV0TW9kZSA9PT0gdW5kZWZpbmVkIHx8IG91dHB1dE1vZGUgPT09ICdlbmFibGVkJykge1xuICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZShtZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNoaWxkUHJvY2Vzcy5vbignZXhpdCcsIChleGl0Q29kZSwgc2lnbmFsKSA9PiB7XG4gICAgICBjb25zdCBleGl0RGVzY3JpcHRpb24gPSBleGl0Q29kZSAhPT0gbnVsbCA/IGBleGl0IGNvZGUgXCIke2V4aXRDb2RlfVwiYCA6IGBzaWduYWwgXCIke3NpZ25hbH1cImA7XG4gICAgICBjb25zdCBwcmludEZuID0gb3V0cHV0TW9kZSA9PT0gJ29uLWVycm9yJyA/IGVycm9yIDogZGVidWc7XG4gICAgICBjb25zdCBzdGF0dXMgPSBzdGF0dXNGcm9tRXhpdENvZGVBbmRTaWduYWwoZXhpdENvZGUsIHNpZ25hbCk7XG5cbiAgICAgIHByaW50Rm4oYENvbW1hbmQgXCIke2NvbW1hbmRUZXh0fVwiIGNvbXBsZXRlZCB3aXRoICR7ZXhpdERlc2NyaXB0aW9ufS5gKTtcbiAgICAgIHByaW50Rm4oYFByb2Nlc3Mgb3V0cHV0OiBcXG4ke2xvZ091dHB1dH1gKTtcblxuICAgICAgLy8gT24gc3VjY2VzcywgcmVzb2x2ZSB0aGUgcHJvbWlzZS4gT3RoZXJ3aXNlIHJlamVjdCB3aXRoIHRoZSBjYXB0dXJlZCBzdGRlcnJcbiAgICAgIC8vIGFuZCBzdGRvdXQgbG9nIG91dHB1dCBpZiB0aGUgb3V0cHV0IG1vZGUgd2FzIHNldCB0byBgc2lsZW50YC5cbiAgICAgIGlmIChzdGF0dXMgPT09IDAgfHwgb3B0aW9ucy5zdXBwcmVzc0Vycm9yT25GYWlsaW5nRXhpdENvZGUpIHtcbiAgICAgICAgcmVzb2x2ZSh7c3Rkb3V0LCBzdGRlcnIsIHN0YXR1c30pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVqZWN0KG91dHB1dE1vZGUgPT09ICdzaWxlbnQnID8gbG9nT3V0cHV0IDogdW5kZWZpbmVkKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogU3Bhd25zIGEgZ2l2ZW4gY29tbWFuZCB3aXRoIHRoZSBzcGVjaWZpZWQgYXJndW1lbnRzIGluc2lkZSBhIHNoZWxsIHN5bmNocm9ub3VzbHkuXG4gKlxuICogQHJldHVybnMgVGhlIGNvbW1hbmQncyBzdGRvdXQgYW5kIHN0ZGVyci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNwYXduU3luYyhcbiAgICBjb21tYW5kOiBzdHJpbmcsIGFyZ3M6IHN0cmluZ1tdLCBvcHRpb25zOiBTcGF3blN5bmNPcHRpb25zID0ge30pOiBTcGF3blJlc3VsdCB7XG4gIGNvbnN0IGNvbW1hbmRUZXh0ID0gYCR7Y29tbWFuZH0gJHthcmdzLmpvaW4oJyAnKX1gO1xuICBkZWJ1ZyhgRXhlY3V0aW5nIGNvbW1hbmQ6ICR7Y29tbWFuZFRleHR9YCk7XG5cbiAgY29uc3Qge3N0YXR1czogZXhpdENvZGUsIHNpZ25hbCwgc3Rkb3V0LCBzdGRlcnJ9ID1cbiAgICAgIF9zcGF3blN5bmMoY29tbWFuZCwgYXJncywgey4uLm9wdGlvbnMsIGVuY29kaW5nOiAndXRmOCcsIHNoZWxsOiB0cnVlLCBzdGRpbzogJ3BpcGUnfSk7XG5cbiAgLyoqIFRoZSBzdGF0dXMgb2YgdGhlIHNwYXduIHJlc3VsdC4gKi9cbiAgY29uc3Qgc3RhdHVzID0gc3RhdHVzRnJvbUV4aXRDb2RlQW5kU2lnbmFsKGV4aXRDb2RlLCBzaWduYWwpO1xuXG4gIGlmIChzdGF0dXMgPT09IDAgfHwgb3B0aW9ucy5zdXBwcmVzc0Vycm9yT25GYWlsaW5nRXhpdENvZGUpIHtcbiAgICByZXR1cm4ge3N0YXR1cywgc3Rkb3V0LCBzdGRlcnJ9O1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKHN0ZGVycik7XG59XG5cbi8qKlxuICogQ29udmVydCB0aGUgcHJvdmlkZWQgZXhpdENvZGUgYW5kIHNpZ25hbCB0byBhIHNpbmdsZSBzdGF0dXMgY29kZS5cbiAqXG4gKiBEdXJpbmcgYGV4aXRgIG5vZGUgcHJvdmlkZXMgZWl0aGVyIGEgYGNvZGVgIG9yIGBzaWduYWxgLCBvbmUgb2Ygd2hpY2ggaXMgZ3VhcmFudGVlZCB0byBiZVxuICogbm9uLW51bGwuXG4gKlxuICogRm9yIG1vcmUgZGV0YWlscyBzZWU6IGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvY2hpbGRfcHJvY2Vzcy5odG1sI2NoaWxkX3Byb2Nlc3NfZXZlbnRfZXhpdFxuICovXG5mdW5jdGlvbiBzdGF0dXNGcm9tRXhpdENvZGVBbmRTaWduYWwoZXhpdENvZGU6IG51bWJlcnxudWxsLCBzaWduYWw6IE5vZGVKUy5TaWduYWxzfG51bGwpIHtcbiAgcmV0dXJuIGV4aXRDb2RlID8/IHNpZ25hbCA/PyAtMTtcbn1cbiJdfQ==