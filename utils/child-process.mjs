/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __assign } from "tslib";
import { spawn as _spawn, spawnSync as _spawnSync } from 'child_process';
import { debug, error } from './console';
/**
 * Spawns a given command with the specified arguments inside an interactive shell. All process
 * stdin, stdout and stderr output is printed to the current console.
 *
 * @returns a Promise resolving on success, and rejecting on command failure with the status code.
 */
export function spawnInteractive(command, args, options) {
    if (options === void 0) { options = {}; }
    return new Promise(function (resolve, reject) {
        var commandText = command + " " + args.join(' ');
        debug("Executing command: " + commandText);
        var childProcess = _spawn(command, args, __assign(__assign({}, options), { shell: true, stdio: 'inherit' }));
        childProcess.on('exit', function (status) { return status === 0 ? resolve() : reject(status); });
    });
}
/**
 * Spawns a given command with the specified arguments inside a shell. All process stdout
 * output is captured and returned as resolution on completion. Depending on the chosen
 * output mode, stdout/stderr output is also printed to the console, or only on error.
 *
 * @returns a Promise resolving with captured stdout and stderr on success. The promise
 *   rejects on command failure.
 */
export function spawn(command, args, options) {
    if (options === void 0) { options = {}; }
    return new Promise(function (resolve, reject) {
        var commandText = command + " " + args.join(' ');
        var outputMode = options.mode;
        debug("Executing command: " + commandText);
        var childProcess = _spawn(command, args, __assign(__assign({}, options), { shell: true, stdio: 'pipe' }));
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
            var printFn = outputMode === 'on-error' ? error : debug;
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
/**
 * Spawns a given command with the specified arguments inside a shell synchronously.
 *
 * @returns The command's stdout and stderr.
 */
export function spawnSync(command, args, options) {
    if (options === void 0) { options = {}; }
    var commandText = command + " " + args.join(' ');
    debug("Executing command: " + commandText);
    var _a = _spawnSync(command, args, __assign(__assign({}, options), { encoding: 'utf8', shell: true, stdio: 'pipe' })), exitCode = _a.status, signal = _a.signal, stdout = _a.stdout, stderr = _a.stderr;
    /** The status of the spawn result. */
    var status = statusFromExitCodeAndSignal(exitCode, signal);
    if (status === 0 || options.suppressErrorOnFailingExitCode) {
        return { status: status, stdout: stdout, stderr: stderr };
    }
    throw new Error(stderr);
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hpbGQtcHJvY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9jaGlsZC1wcm9jZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsS0FBSyxJQUFJLE1BQU0sRUFBaUMsU0FBUyxJQUFJLFVBQVUsRUFBd0MsTUFBTSxlQUFlLENBQUM7QUFDN0ksT0FBTyxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUMsTUFBTSxXQUFXLENBQUM7QUE4QnZDOzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLGdCQUFnQixDQUM1QixPQUFlLEVBQUUsSUFBYyxFQUFFLE9BQTRDO0lBQTVDLHdCQUFBLEVBQUEsWUFBNEM7SUFDL0UsT0FBTyxJQUFJLE9BQU8sQ0FBTyxVQUFDLE9BQU8sRUFBRSxNQUFNO1FBQ3ZDLElBQU0sV0FBVyxHQUFNLE9BQU8sU0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBRyxDQUFDO1FBQ25ELEtBQUssQ0FBQyx3QkFBc0IsV0FBYSxDQUFDLENBQUM7UUFDM0MsSUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxJQUFJLHdCQUFNLE9BQU8sS0FBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxTQUFTLElBQUUsQ0FBQztRQUN4RixZQUFZLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFBLE1BQU0sSUFBSSxPQUFBLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQXpDLENBQXlDLENBQUMsQ0FBQztJQUMvRSxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRDs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxVQUFVLEtBQUssQ0FDakIsT0FBZSxFQUFFLElBQWMsRUFBRSxPQUEwQjtJQUExQix3QkFBQSxFQUFBLFlB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QUssQ0FBQyx3QkFBc0IsV0FBYSxDQUFDLENBQUM7SUFFckMsSUFBQSxLQUNGLFVBQVUsQ0FBQyxPQUFPLEVBQUUsSUFBSSx3QkFBTSxPQUFPLEtBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLElBQUUsRUFEMUUsUUFBUSxZQUFBLEVBQUUsTUFBTSxZQUFBLEVBQUUsTUFBTSxZQUFBLEVBQUUsTUFBTSxZQUMwQyxDQUFDO0lBRTFGLHNDQUFzQztJQUN0QyxJQUFNLE1BQU0sR0FBRywyQkFBMkIsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFN0QsSUFBSSxNQUFNLEtBQUssQ0FBQyxJQUFJLE9BQU8sQ0FBQyw4QkFBOEIsRUFBRTtRQUMxRCxPQUFPLEVBQUMsTUFBTSxRQUFBLEVBQUUsTUFBTSxRQUFBLEVBQUUsTUFBTSxRQUFBLEVBQUMsQ0FBQztLQUNqQztJQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUIsQ0FBQztBQUVEOzs7Ozs7O0dBT0c7QUFDSCxTQUFTLDJCQUEyQixDQUFDLFFBQXFCLEVBQUUsTUFBMkI7O0lBQ3JGLE9BQU8sTUFBQSxRQUFRLGFBQVIsUUFBUSxjQUFSLFFBQVEsR0FBSSxNQUFNLG1DQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtzcGF3biBhcyBfc3Bhd24sIFNwYXduT3B0aW9ucyBhcyBfU3Bhd25PcHRpb25zLCBzcGF3blN5bmMgYXMgX3NwYXduU3luYywgU3Bhd25TeW5jT3B0aW9ucyBhcyBfU3Bhd25TeW5jT3B0aW9uc30gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQge2RlYnVnLCBlcnJvcn0gZnJvbSAnLi9jb25zb2xlJztcblxuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgdGhlIG9wdGlvbnMgZm9yIHNwYXduaW5nIGEgcHJvY2VzcyBzeW5jaHJvbm91c2x5LiAqL1xuZXhwb3J0IGludGVyZmFjZSBTcGF3blN5bmNPcHRpb25zIGV4dGVuZHMgT21pdDxfU3Bhd25TeW5jT3B0aW9ucywgJ3NoZWxsJ3wnc3RkaW8nPiB7XG4gIC8qKiBXaGV0aGVyIHRvIHByZXZlbnQgZXhpdCBjb2RlcyBiZWluZyB0cmVhdGVkIGFzIGZhaWx1cmVzLiAqL1xuICBzdXBwcmVzc0Vycm9yT25GYWlsaW5nRXhpdENvZGU/OiBib29sZWFuO1xufVxuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgdGhlIG9wdGlvbnMgZm9yIHNwYXduaW5nIGEgcHJvY2Vzcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3Bhd25PcHRpb25zIGV4dGVuZHMgT21pdDxfU3Bhd25PcHRpb25zLCAnc2hlbGwnfCdzdGRpbyc+IHtcbiAgLyoqIENvbnNvbGUgb3V0cHV0IG1vZGUuIERlZmF1bHRzIHRvIFwiZW5hYmxlZFwiLiAqL1xuICBtb2RlPzogJ2VuYWJsZWQnfCdzaWxlbnQnfCdvbi1lcnJvcic7XG4gIC8qKiBXaGV0aGVyIHRvIHByZXZlbnQgZXhpdCBjb2RlcyBiZWluZyB0cmVhdGVkIGFzIGZhaWx1cmVzLiAqL1xuICBzdXBwcmVzc0Vycm9yT25GYWlsaW5nRXhpdENvZGU/OiBib29sZWFuO1xufVxuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgdGhlIG9wdGlvbnMgZm9yIHNwYXduaW5nIGFuIGludGVyYWN0aXZlIHByb2Nlc3MuICovXG5leHBvcnQgdHlwZSBTcGF3bkludGVyYWN0aXZlQ29tbWFuZE9wdGlvbnMgPSBPbWl0PF9TcGF3bk9wdGlvbnMsICdzaGVsbCd8J3N0ZGlvJz47XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyB0aGUgcmVzdWx0IG9mIGEgc3Bhd25lZCBwcm9jZXNzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBTcGF3blJlc3VsdCB7XG4gIC8qKiBDYXB0dXJlZCBzdGRvdXQgaW4gc3RyaW5nIGZvcm1hdC4gKi9cbiAgc3Rkb3V0OiBzdHJpbmc7XG4gIC8qKiBDYXB0dXJlZCBzdGRlcnIgaW4gc3RyaW5nIGZvcm1hdC4gKi9cbiAgc3RkZXJyOiBzdHJpbmc7XG4gIC8qKiBUaGUgZXhpdCBjb2RlIG9yIHNpZ25hbCBvZiB0aGUgcHJvY2Vzcy4gKi9cbiAgc3RhdHVzOiBudW1iZXJ8Tm9kZUpTLlNpZ25hbHM7XG59XG5cbi8qKlxuICogU3Bhd25zIGEgZ2l2ZW4gY29tbWFuZCB3aXRoIHRoZSBzcGVjaWZpZWQgYXJndW1lbnRzIGluc2lkZSBhbiBpbnRlcmFjdGl2ZSBzaGVsbC4gQWxsIHByb2Nlc3NcbiAqIHN0ZGluLCBzdGRvdXQgYW5kIHN0ZGVyciBvdXRwdXQgaXMgcHJpbnRlZCB0byB0aGUgY3VycmVudCBjb25zb2xlLlxuICpcbiAqIEByZXR1cm5zIGEgUHJvbWlzZSByZXNvbHZpbmcgb24gc3VjY2VzcywgYW5kIHJlamVjdGluZyBvbiBjb21tYW5kIGZhaWx1cmUgd2l0aCB0aGUgc3RhdHVzIGNvZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcGF3bkludGVyYWN0aXZlKFxuICAgIGNvbW1hbmQ6IHN0cmluZywgYXJnczogc3RyaW5nW10sIG9wdGlvbnM6IFNwYXduSW50ZXJhY3RpdmVDb21tYW5kT3B0aW9ucyA9IHt9KSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgY29tbWFuZFRleHQgPSBgJHtjb21tYW5kfSAke2FyZ3Muam9pbignICcpfWA7XG4gICAgZGVidWcoYEV4ZWN1dGluZyBjb21tYW5kOiAke2NvbW1hbmRUZXh0fWApO1xuICAgIGNvbnN0IGNoaWxkUHJvY2VzcyA9IF9zcGF3bihjb21tYW5kLCBhcmdzLCB7Li4ub3B0aW9ucywgc2hlbGw6IHRydWUsIHN0ZGlvOiAnaW5oZXJpdCd9KTtcbiAgICBjaGlsZFByb2Nlc3Mub24oJ2V4aXQnLCBzdGF0dXMgPT4gc3RhdHVzID09PSAwID8gcmVzb2x2ZSgpIDogcmVqZWN0KHN0YXR1cykpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBTcGF3bnMgYSBnaXZlbiBjb21tYW5kIHdpdGggdGhlIHNwZWNpZmllZCBhcmd1bWVudHMgaW5zaWRlIGEgc2hlbGwuIEFsbCBwcm9jZXNzIHN0ZG91dFxuICogb3V0cHV0IGlzIGNhcHR1cmVkIGFuZCByZXR1cm5lZCBhcyByZXNvbHV0aW9uIG9uIGNvbXBsZXRpb24uIERlcGVuZGluZyBvbiB0aGUgY2hvc2VuXG4gKiBvdXRwdXQgbW9kZSwgc3Rkb3V0L3N0ZGVyciBvdXRwdXQgaXMgYWxzbyBwcmludGVkIHRvIHRoZSBjb25zb2xlLCBvciBvbmx5IG9uIGVycm9yLlxuICpcbiAqIEByZXR1cm5zIGEgUHJvbWlzZSByZXNvbHZpbmcgd2l0aCBjYXB0dXJlZCBzdGRvdXQgYW5kIHN0ZGVyciBvbiBzdWNjZXNzLiBUaGUgcHJvbWlzZVxuICogICByZWplY3RzIG9uIGNvbW1hbmQgZmFpbHVyZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNwYXduKFxuICAgIGNvbW1hbmQ6IHN0cmluZywgYXJnczogc3RyaW5nW10sIG9wdGlvbnM6IFNwYXduT3B0aW9ucyA9IHt9KTogUHJvbWlzZTxTcGF3blJlc3VsdD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGNvbW1hbmRUZXh0ID0gYCR7Y29tbWFuZH0gJHthcmdzLmpvaW4oJyAnKX1gO1xuICAgIGNvbnN0IG91dHB1dE1vZGUgPSBvcHRpb25zLm1vZGU7XG5cbiAgICBkZWJ1ZyhgRXhlY3V0aW5nIGNvbW1hbmQ6ICR7Y29tbWFuZFRleHR9YCk7XG5cbiAgICBjb25zdCBjaGlsZFByb2Nlc3MgPSBfc3Bhd24oY29tbWFuZCwgYXJncywgey4uLm9wdGlvbnMsIHNoZWxsOiB0cnVlLCBzdGRpbzogJ3BpcGUnfSk7XG4gICAgbGV0IGxvZ091dHB1dCA9ICcnO1xuICAgIGxldCBzdGRvdXQgPSAnJztcbiAgICBsZXQgc3RkZXJyID0gJyc7XG5cbiAgICAvLyBDYXB0dXJlIHRoZSBzdGRvdXQgc2VwYXJhdGVseSBzbyB0aGF0IGl0IGNhbiBiZSBwYXNzZWQgYXMgcmVzb2x2ZSB2YWx1ZS5cbiAgICAvLyBUaGlzIGlzIHVzZWZ1bCBpZiBjb21tYW5kcyByZXR1cm4gcGFyc2FibGUgc3Rkb3V0LlxuICAgIGNoaWxkUHJvY2Vzcy5zdGRlcnIub24oJ2RhdGEnLCBtZXNzYWdlID0+IHtcbiAgICAgIHN0ZGVyciArPSBtZXNzYWdlO1xuICAgICAgbG9nT3V0cHV0ICs9IG1lc3NhZ2U7XG4gICAgICAvLyBJZiBjb25zb2xlIG91dHB1dCBpcyBlbmFibGVkLCBwcmludCB0aGUgbWVzc2FnZSBkaXJlY3RseSB0byB0aGUgc3RkZXJyLiBOb3RlIHRoYXRcbiAgICAgIC8vIHdlIGludGVudGlvbmFsbHkgcHJpbnQgYWxsIG91dHB1dCB0byBzdGRlcnIgYXMgc3Rkb3V0IHNob3VsZCBub3QgYmUgcG9sbHV0ZWQuXG4gICAgICBpZiAob3V0cHV0TW9kZSA9PT0gdW5kZWZpbmVkIHx8IG91dHB1dE1vZGUgPT09ICdlbmFibGVkJykge1xuICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZShtZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNoaWxkUHJvY2Vzcy5zdGRvdXQub24oJ2RhdGEnLCBtZXNzYWdlID0+IHtcbiAgICAgIHN0ZG91dCArPSBtZXNzYWdlO1xuICAgICAgbG9nT3V0cHV0ICs9IG1lc3NhZ2U7XG4gICAgICAvLyBJZiBjb25zb2xlIG91dHB1dCBpcyBlbmFibGVkLCBwcmludCB0aGUgbWVzc2FnZSBkaXJlY3RseSB0byB0aGUgc3RkZXJyLiBOb3RlIHRoYXRcbiAgICAgIC8vIHdlIGludGVudGlvbmFsbHkgcHJpbnQgYWxsIG91dHB1dCB0byBzdGRlcnIgYXMgc3Rkb3V0IHNob3VsZCBub3QgYmUgcG9sbHV0ZWQuXG4gICAgICBpZiAob3V0cHV0TW9kZSA9PT0gdW5kZWZpbmVkIHx8IG91dHB1dE1vZGUgPT09ICdlbmFibGVkJykge1xuICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZShtZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNoaWxkUHJvY2Vzcy5vbignZXhpdCcsIChleGl0Q29kZSwgc2lnbmFsKSA9PiB7XG4gICAgICBjb25zdCBleGl0RGVzY3JpcHRpb24gPSBleGl0Q29kZSAhPT0gbnVsbCA/IGBleGl0IGNvZGUgXCIke2V4aXRDb2RlfVwiYCA6IGBzaWduYWwgXCIke3NpZ25hbH1cImA7XG4gICAgICBjb25zdCBwcmludEZuID0gb3V0cHV0TW9kZSA9PT0gJ29uLWVycm9yJyA/IGVycm9yIDogZGVidWc7XG4gICAgICBjb25zdCBzdGF0dXMgPSBzdGF0dXNGcm9tRXhpdENvZGVBbmRTaWduYWwoZXhpdENvZGUsIHNpZ25hbCk7XG5cbiAgICAgIHByaW50Rm4oYENvbW1hbmQgXCIke2NvbW1hbmRUZXh0fVwiIGNvbXBsZXRlZCB3aXRoICR7ZXhpdERlc2NyaXB0aW9ufS5gKTtcbiAgICAgIHByaW50Rm4oYFByb2Nlc3Mgb3V0cHV0OiBcXG4ke2xvZ091dHB1dH1gKTtcblxuICAgICAgLy8gT24gc3VjY2VzcywgcmVzb2x2ZSB0aGUgcHJvbWlzZS4gT3RoZXJ3aXNlIHJlamVjdCB3aXRoIHRoZSBjYXB0dXJlZCBzdGRlcnJcbiAgICAgIC8vIGFuZCBzdGRvdXQgbG9nIG91dHB1dCBpZiB0aGUgb3V0cHV0IG1vZGUgd2FzIHNldCB0byBgc2lsZW50YC5cbiAgICAgIGlmIChzdGF0dXMgPT09IDAgfHwgb3B0aW9ucy5zdXBwcmVzc0Vycm9yT25GYWlsaW5nRXhpdENvZGUpIHtcbiAgICAgICAgcmVzb2x2ZSh7c3Rkb3V0LCBzdGRlcnIsIHN0YXR1c30pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVqZWN0KG91dHB1dE1vZGUgPT09ICdzaWxlbnQnID8gbG9nT3V0cHV0IDogdW5kZWZpbmVkKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogU3Bhd25zIGEgZ2l2ZW4gY29tbWFuZCB3aXRoIHRoZSBzcGVjaWZpZWQgYXJndW1lbnRzIGluc2lkZSBhIHNoZWxsIHN5bmNocm9ub3VzbHkuXG4gKlxuICogQHJldHVybnMgVGhlIGNvbW1hbmQncyBzdGRvdXQgYW5kIHN0ZGVyci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNwYXduU3luYyhcbiAgICBjb21tYW5kOiBzdHJpbmcsIGFyZ3M6IHN0cmluZ1tdLCBvcHRpb25zOiBTcGF3blN5bmNPcHRpb25zID0ge30pOiBTcGF3blJlc3VsdCB7XG4gIGNvbnN0IGNvbW1hbmRUZXh0ID0gYCR7Y29tbWFuZH0gJHthcmdzLmpvaW4oJyAnKX1gO1xuICBkZWJ1ZyhgRXhlY3V0aW5nIGNvbW1hbmQ6ICR7Y29tbWFuZFRleHR9YCk7XG5cbiAgY29uc3Qge3N0YXR1czogZXhpdENvZGUsIHNpZ25hbCwgc3Rkb3V0LCBzdGRlcnJ9ID1cbiAgICAgIF9zcGF3blN5bmMoY29tbWFuZCwgYXJncywgey4uLm9wdGlvbnMsIGVuY29kaW5nOiAndXRmOCcsIHNoZWxsOiB0cnVlLCBzdGRpbzogJ3BpcGUnfSk7XG5cbiAgLyoqIFRoZSBzdGF0dXMgb2YgdGhlIHNwYXduIHJlc3VsdC4gKi9cbiAgY29uc3Qgc3RhdHVzID0gc3RhdHVzRnJvbUV4aXRDb2RlQW5kU2lnbmFsKGV4aXRDb2RlLCBzaWduYWwpO1xuXG4gIGlmIChzdGF0dXMgPT09IDAgfHwgb3B0aW9ucy5zdXBwcmVzc0Vycm9yT25GYWlsaW5nRXhpdENvZGUpIHtcbiAgICByZXR1cm4ge3N0YXR1cywgc3Rkb3V0LCBzdGRlcnJ9O1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKHN0ZGVycik7XG59XG5cbi8qKlxuICogQ29udmVydCB0aGUgcHJvdmlkZWQgZXhpdENvZGUgYW5kIHNpZ25hbCB0byBhIHNpbmdsZSBzdGF0dXMgY29kZS5cbiAqXG4gKiBEdXJpbmcgYGV4aXRgIG5vZGUgcHJvdmlkZXMgZWl0aGVyIGEgYGNvZGVgIG9yIGBzaWduYWxgLCBvbmUgb2Ygd2hpY2ggaXMgZ3VhcmFudGVlZCB0byBiZVxuICogbm9uLW51bGwuXG4gKlxuICogRm9yIG1vcmUgZGV0YWlscyBzZWU6IGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvY2hpbGRfcHJvY2Vzcy5odG1sI2NoaWxkX3Byb2Nlc3NfZXZlbnRfZXhpdFxuICovXG5mdW5jdGlvbiBzdGF0dXNGcm9tRXhpdENvZGVBbmRTaWduYWwoZXhpdENvZGU6IG51bWJlcnxudWxsLCBzaWduYWw6IE5vZGVKUy5TaWduYWxzfG51bGwpIHtcbiAgcmV0dXJuIGV4aXRDb2RlID8/IHNpZ25hbCA/PyAtMTtcbn1cbiJdfQ==