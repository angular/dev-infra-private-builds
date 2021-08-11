"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.spawnSync = exports.spawn = exports.spawnInteractive = void 0;
const child_process_1 = require("child_process");
const console_1 = require("./console");
/**
 * Spawns a given command with the specified arguments inside an interactive shell. All process
 * stdin, stdout and stderr output is printed to the current console.
 *
 * @returns a Promise resolving on success, and rejecting on command failure with the status code.
 */
function spawnInteractive(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        const commandText = `${command} ${args.join(' ')}`;
        console_1.debug(`Executing command: ${commandText}`);
        const childProcess = child_process_1.spawn(command, args, { ...options, shell: true, stdio: 'inherit' });
        // The `close` event is used because the process is guaranteed to have completed writing to
        // stdout and stderr, using the `exit` event can cause inconsistent information in stdout and
        // stderr due to a race condition around exiting.
        childProcess.on('close', (status) => (status === 0 ? resolve() : reject(status)));
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
function spawn(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        const commandText = `${command} ${args.join(' ')}`;
        const outputMode = options.mode;
        console_1.debug(`Executing command: ${commandText}`);
        const childProcess = child_process_1.spawn(command, args, { ...options, shell: true, stdio: 'pipe' });
        let logOutput = '';
        let stdout = '';
        let stderr = '';
        // Capture the stdout separately so that it can be passed as resolve value.
        // This is useful if commands return parsable stdout.
        childProcess.stderr.on('data', (message) => {
            stderr += message;
            logOutput += message;
            // If console output is enabled, print the message directly to the stderr. Note that
            // we intentionally print all output to stderr as stdout should not be polluted.
            if (outputMode === undefined || outputMode === 'enabled') {
                process.stderr.write(message);
            }
        });
        childProcess.stdout.on('data', (message) => {
            stdout += message;
            logOutput += message;
            // If console output is enabled, print the message directly to the stderr. Note that
            // we intentionally print all output to stderr as stdout should not be polluted.
            if (outputMode === undefined || outputMode === 'enabled') {
                process.stderr.write(message);
            }
        });
        // The `close` event is used because the process is guaranteed to have completed writing to
        // stdout and stderr, using the `exit` event can cause inconsistent information in stdout and
        // stderr due to a race condition around exiting.
        childProcess.on('close', (exitCode, signal) => {
            const exitDescription = exitCode !== null ? `exit code "${exitCode}"` : `signal "${signal}"`;
            const printFn = outputMode === 'on-error' ? console_1.error : console_1.debug;
            const status = statusFromExitCodeAndSignal(exitCode, signal);
            printFn(`Command "${commandText}" completed with ${exitDescription}.`);
            printFn(`Process output: \n${logOutput}`);
            // On success, resolve the promise. Otherwise reject with the captured stderr
            // and stdout log output if the output mode was set to `silent`.
            if (status === 0 || options.suppressErrorOnFailingExitCode) {
                resolve({ stdout, stderr, status });
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
function spawnSync(command, args, options = {}) {
    const commandText = `${command} ${args.join(' ')}`;
    console_1.debug(`Executing command: ${commandText}`);
    const { status: exitCode, signal, stdout, stderr, } = child_process_1.spawnSync(command, args, { ...options, encoding: 'utf8', shell: true, stdio: 'pipe' });
    /** The status of the spawn result. */
    const status = statusFromExitCodeAndSignal(exitCode, signal);
    if (status === 0 || options.suppressErrorOnFailingExitCode) {
        return { status, stdout, stderr };
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
    return exitCode ?? signal ?? -1;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hpbGQtcHJvY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL25nLWRldi91dGlscy9jaGlsZC1wcm9jZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILGlEQUt1QjtBQUN2Qix1Q0FBdUM7QUE2QnZDOzs7OztHQUtHO0FBQ0gsU0FBZ0IsZ0JBQWdCLENBQzlCLE9BQWUsRUFDZixJQUFjLEVBQ2QsVUFBMEMsRUFBRTtJQUU1QyxPQUFPLElBQUksT0FBTyxDQUFPLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQzNDLE1BQU0sV0FBVyxHQUFHLEdBQUcsT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNuRCxlQUFLLENBQUMsc0JBQXNCLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDM0MsTUFBTSxZQUFZLEdBQUcscUJBQU0sQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUMsR0FBRyxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFDLENBQUMsQ0FBQztRQUN4RiwyRkFBMkY7UUFDM0YsNkZBQTZGO1FBQzdGLGlEQUFpRDtRQUNqRCxZQUFZLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwRixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFkRCw0Q0FjQztBQUVEOzs7Ozs7O0dBT0c7QUFDSCxTQUFnQixLQUFLLENBQ25CLE9BQWUsRUFDZixJQUFjLEVBQ2QsVUFBd0IsRUFBRTtJQUUxQixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0s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LElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztJQUNuRCxlQUFLLENBQUMsc0JBQXNCLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFFM0MsTUFBTSxFQUNKLE1BQU0sRUFBRSxRQUFRLEVBQ2hCLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxHQUNQLEdBQUcseUJBQVUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUMsR0FBRyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO0lBRTFGLHNDQUFzQztJQUN0QyxNQUFNLE1BQU0sR0FBRywyQkFBMkIsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFN0QsSUFBSSxNQUFNLEtBQUssQ0FBQyxJQUFJLE9BQU8sQ0FBQyw4QkFBOEIsRUFBRTtRQUMxRCxPQUFPLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQztLQUNqQztJQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUIsQ0FBQztBQXZCRCw4QkF1QkM7QUFFRDs7Ozs7OztHQU9HO0FBQ0gsU0FBUywyQkFBMkIsQ0FBQyxRQUF1QixFQUFFLE1BQTZCO0lBQ3pGLE9BQU8sUUFBUSxJQUFJLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNsQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIHNwYXduIGFzIF9zcGF3bixcbiAgU3Bhd25PcHRpb25zIGFzIF9TcGF3bk9wdGlvbnMsXG4gIHNwYXduU3luYyBhcyBfc3Bhd25TeW5jLFxuICBTcGF3blN5bmNPcHRpb25zIGFzIF9TcGF3blN5bmNPcHRpb25zLFxufSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7ZGVidWcsIGVycm9yfSBmcm9tICcuL2NvbnNvbGUnO1xuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgdGhlIG9wdGlvbnMgZm9yIHNwYXduaW5nIGEgcHJvY2VzcyBzeW5jaHJvbm91c2x5LiAqL1xuZXhwb3J0IGludGVyZmFjZSBTcGF3blN5bmNPcHRpb25zIGV4dGVuZHMgT21pdDxfU3Bhd25TeW5jT3B0aW9ucywgJ3NoZWxsJyB8ICdzdGRpbyc+IHtcbiAgLyoqIFdoZXRoZXIgdG8gcHJldmVudCBleGl0IGNvZGVzIGJlaW5nIHRyZWF0ZWQgYXMgZmFpbHVyZXMuICovXG4gIHN1cHByZXNzRXJyb3JPbkZhaWxpbmdFeGl0Q29kZT86IGJvb2xlYW47XG59XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyB0aGUgb3B0aW9ucyBmb3Igc3Bhd25pbmcgYSBwcm9jZXNzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBTcGF3bk9wdGlvbnMgZXh0ZW5kcyBPbWl0PF9TcGF3bk9wdGlvbnMsICdzaGVsbCcgfCAnc3RkaW8nPiB7XG4gIC8qKiBDb25zb2xlIG91dHB1dCBtb2RlLiBEZWZhdWx0cyB0byBcImVuYWJsZWRcIi4gKi9cbiAgbW9kZT86ICdlbmFibGVkJyB8ICdzaWxlbnQnIHwgJ29uLWVycm9yJztcbiAgLyoqIFdoZXRoZXIgdG8gcHJldmVudCBleGl0IGNvZGVzIGJlaW5nIHRyZWF0ZWQgYXMgZmFpbHVyZXMuICovXG4gIHN1cHByZXNzRXJyb3JPbkZhaWxpbmdFeGl0Q29kZT86IGJvb2xlYW47XG59XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyB0aGUgb3B0aW9ucyBmb3Igc3Bhd25pbmcgYW4gaW50ZXJhY3RpdmUgcHJvY2Vzcy4gKi9cbmV4cG9ydCB0eXBlIFNwYXduSW50ZXJhY3RpdmVDb21tYW5kT3B0aW9ucyA9IE9taXQ8X1NwYXduT3B0aW9ucywgJ3NoZWxsJyB8ICdzdGRpbyc+O1xuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgdGhlIHJlc3VsdCBvZiBhIHNwYXduZWQgcHJvY2Vzcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3Bhd25SZXN1bHQge1xuICAvKiogQ2FwdHVyZWQgc3Rkb3V0IGluIHN0cmluZyBmb3JtYXQuICovXG4gIHN0ZG91dDogc3RyaW5nO1xuICAvKiogQ2FwdHVyZWQgc3RkZXJyIGluIHN0cmluZyBmb3JtYXQuICovXG4gIHN0ZGVycjogc3RyaW5nO1xuICAvKiogVGhlIGV4aXQgY29kZSBvciBzaWduYWwgb2YgdGhlIHByb2Nlc3MuICovXG4gIHN0YXR1czogbnVtYmVyIHwgTm9kZUpTLlNpZ25hbHM7XG59XG5cbi8qKlxuICogU3Bhd25zIGEgZ2l2ZW4gY29tbWFuZCB3aXRoIHRoZSBzcGVjaWZpZWQgYXJndW1lbnRzIGluc2lkZSBhbiBpbnRlcmFjdGl2ZSBzaGVsbC4gQWxsIHByb2Nlc3NcbiAqIHN0ZGluLCBzdGRvdXQgYW5kIHN0ZGVyciBvdXRwdXQgaXMgcHJpbnRlZCB0byB0aGUgY3VycmVudCBjb25zb2xlLlxuICpcbiAqIEByZXR1cm5zIGEgUHJvbWlzZSByZXNvbHZpbmcgb24gc3VjY2VzcywgYW5kIHJlamVjdGluZyBvbiBjb21tYW5kIGZhaWx1cmUgd2l0aCB0aGUgc3RhdHVzIGNvZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcGF3bkludGVyYWN0aXZlKFxuICBjb21tYW5kOiBzdHJpbmcsXG4gIGFyZ3M6IHN0cmluZ1tdLFxuICBvcHRpb25zOiBTcGF3bkludGVyYWN0aXZlQ29tbWFuZE9wdGlvbnMgPSB7fSxcbikge1xuICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGNvbW1hbmRUZXh0ID0gYCR7Y29tbWFuZH0gJHthcmdzLmpvaW4oJyAnKX1gO1xuICAgIGRlYnVnKGBFeGVjdXRpbmcgY29tbWFuZDogJHtjb21tYW5kVGV4dH1gKTtcbiAgICBjb25zdCBjaGlsZFByb2Nlc3MgPSBfc3Bhd24oY29tbWFuZCwgYXJncywgey4uLm9wdGlvbnMsIHNoZWxsOiB0cnVlLCBzdGRpbzogJ2luaGVyaXQnfSk7XG4gICAgLy8gVGhlIGBjbG9zZWAgZXZlbnQgaXMgdXNlZCBiZWNhdXNlIHRoZSBwcm9jZXNzIGlzIGd1YXJhbnRlZWQgdG8gaGF2ZSBjb21wbGV0ZWQgd3JpdGluZyB0b1xuICAgIC8vIHN0ZG91dCBhbmQgc3RkZXJyLCB1c2luZyB0aGUgYGV4aXRgIGV2ZW50IGNhbiBjYXVzZSBpbmNvbnNpc3RlbnQgaW5mb3JtYXRpb24gaW4gc3Rkb3V0IGFuZFxuICAgIC8vIHN0ZGVyciBkdWUgdG8gYSByYWNlIGNvbmRpdGlvbiBhcm91bmQgZXhpdGluZy5cbiAgICBjaGlsZFByb2Nlc3Mub24oJ2Nsb3NlJywgKHN0YXR1cykgPT4gKHN0YXR1cyA9PT0gMCA/IHJlc29sdmUoKSA6IHJlamVjdChzdGF0dXMpKSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFNwYXducyBhIGdpdmVuIGNvbW1hbmQgd2l0aCB0aGUgc3BlY2lmaWVkIGFyZ3VtZW50cyBpbnNpZGUgYSBzaGVsbC4gQWxsIHByb2Nlc3Mgc3Rkb3V0XG4gKiBvdXRwdXQgaXMgY2FwdHVyZWQgYW5kIHJldHVybmVkIGFzIHJlc29sdXRpb24gb24gY29tcGxldGlvbi4gRGVwZW5kaW5nIG9uIHRoZSBjaG9zZW5cbiAqIG91dHB1dCBtb2RlLCBzdGRvdXQvc3RkZXJyIG91dHB1dCBpcyBhbHNvIHByaW50ZWQgdG8gdGhlIGNvbnNvbGUsIG9yIG9ubHkgb24gZXJyb3IuXG4gKlxuICogQHJldHVybnMgYSBQcm9taXNlIHJlc29sdmluZyB3aXRoIGNhcHR1cmVkIHN0ZG91dCBhbmQgc3RkZXJyIG9uIHN1Y2Nlc3MuIFRoZSBwcm9taXNlXG4gKiAgIHJlamVjdHMgb24gY29tbWFuZCBmYWlsdXJlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3Bhd24oXG4gIGNvbW1hbmQ6IHN0cmluZyxcbiAgYXJnczogc3RyaW5nW10sXG4gIG9wdGlvbnM6IFNwYXduT3B0aW9ucyA9IHt9LFxuKTogUHJvbWlzZTxTcGF3blJlc3VsdD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGNvbW1hbmRUZXh0ID0gYCR7Y29tbWFuZH0gJHthcmdzLmpvaW4oJyAnKX1gO1xuICAgIGNvbnN0IG91dHB1dE1vZGUgPSBvcHRpb25zLm1vZGU7XG5cbiAgICBkZWJ1ZyhgRXhlY3V0aW5nIGNvbW1hbmQ6ICR7Y29tbWFuZFRleHR9YCk7XG5cbiAgICBjb25zdCBjaGlsZFByb2Nlc3MgPSBfc3Bhd24oY29tbWFuZCwgYXJncywgey4uLm9wdGlvbnMsIHNoZWxsOiB0cnVlLCBzdGRpbzogJ3BpcGUnfSk7XG4gICAgbGV0IGxvZ091dHB1dCA9ICcnO1xuICAgIGxldCBzdGRvdXQgPSAnJztcbiAgICBsZXQgc3RkZXJyID0gJyc7XG5cbiAgICAvLyBDYXB0dXJlIHRoZSBzdGRvdXQgc2VwYXJhdGVseSBzbyB0aGF0IGl0IGNhbiBiZSBwYXNzZWQgYXMgcmVzb2x2ZSB2YWx1ZS5cbiAgICAvLyBUaGlzIGlzIHVzZWZ1bCBpZiBjb21tYW5kcyByZXR1cm4gcGFyc2FibGUgc3Rkb3V0LlxuICAgIGNoaWxkUHJvY2Vzcy5zdGRlcnIub24oJ2RhdGEnLCAobWVzc2FnZSkgPT4ge1xuICAgICAgc3RkZXJyICs9IG1lc3NhZ2U7XG4gICAgICBsb2dPdXRwdXQgKz0gbWVzc2FnZTtcbiAgICAgIC8vIElmIGNvbnNvbGUgb3V0cHV0IGlzIGVuYWJsZWQsIHByaW50IHRoZSBtZXNzYWdlIGRpcmVjdGx5IHRvIHRoZSBzdGRlcnIuIE5vdGUgdGhhdFxuICAgICAgLy8gd2UgaW50ZW50aW9uYWxseSBwcmludCBhbGwgb3V0cHV0IHRvIHN0ZGVyciBhcyBzdGRvdXQgc2hvdWxkIG5vdCBiZSBwb2xsdXRlZC5cbiAgICAgIGlmIChvdXRwdXRNb2RlID09PSB1bmRlZmluZWQgfHwgb3V0cHV0TW9kZSA9PT0gJ2VuYWJsZWQnKSB7XG4gICAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlKG1lc3NhZ2UpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY2hpbGRQcm9jZXNzLnN0ZG91dC5vbignZGF0YScsIChtZXNzYWdlKSA9PiB7XG4gICAgICBzdGRvdXQgKz0gbWVzc2FnZTtcbiAgICAgIGxvZ091dHB1dCArPSBtZXNzYWdlO1xuICAgICAgLy8gSWYgY29uc29sZSBvdXRwdXQgaXMgZW5hYmxlZCwgcHJpbnQgdGhlIG1lc3NhZ2UgZGlyZWN0bHkgdG8gdGhlIHN0ZGVyci4gTm90ZSB0aGF0XG4gICAgICAvLyB3ZSBpbnRlbnRpb25hbGx5IHByaW50IGFsbCBvdXRwdXQgdG8gc3RkZXJyIGFzIHN0ZG91dCBzaG91bGQgbm90IGJlIHBvbGx1dGVkLlxuICAgICAgaWYgKG91dHB1dE1vZGUgPT09IHVuZGVmaW5lZCB8fCBvdXRwdXRNb2RlID09PSAnZW5hYmxlZCcpIHtcbiAgICAgICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUobWVzc2FnZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBUaGUgYGNsb3NlYCBldmVudCBpcyB1c2VkIGJlY2F1c2UgdGhlIHByb2Nlc3MgaXMgZ3VhcmFudGVlZCB0byBoYXZlIGNvbXBsZXRlZCB3cml0aW5nIHRvXG4gICAgLy8gc3Rkb3V0IGFuZCBzdGRlcnIsIHVzaW5nIHRoZSBgZXhpdGAgZXZlbnQgY2FuIGNhdXNlIGluY29uc2lzdGVudCBpbmZvcm1hdGlvbiBpbiBzdGRvdXQgYW5kXG4gICAgLy8gc3RkZXJyIGR1ZSB0byBhIHJhY2UgY29uZGl0aW9uIGFyb3VuZCBleGl0aW5nLlxuICAgIGNoaWxkUHJvY2Vzcy5vbignY2xvc2UnLCAoZXhpdENvZGUsIHNpZ25hbCkgPT4ge1xuICAgICAgY29uc3QgZXhpdERlc2NyaXB0aW9uID0gZXhpdENvZGUgIT09IG51bGwgPyBgZXhpdCBjb2RlIFwiJHtleGl0Q29kZX1cImAgOiBgc2lnbmFsIFwiJHtzaWduYWx9XCJgO1xuICAgICAgY29uc3QgcHJpbnRGbiA9IG91dHB1dE1vZGUgPT09ICdvbi1lcnJvcicgPyBlcnJvciA6IGRlYnVnO1xuICAgICAgY29uc3Qgc3RhdHVzID0gc3RhdHVzRnJvbUV4aXRDb2RlQW5kU2lnbmFsKGV4aXRDb2RlLCBzaWduYWwpO1xuXG4gICAgICBwcmludEZuKGBDb21tYW5kIFwiJHtjb21tYW5kVGV4dH1cIiBjb21wbGV0ZWQgd2l0aCAke2V4aXREZXNjcmlwdGlvbn0uYCk7XG4gICAgICBwcmludEZuKGBQcm9jZXNzIG91dHB1dDogXFxuJHtsb2dPdXRwdXR9YCk7XG5cbiAgICAgIC8vIE9uIHN1Y2Nlc3MsIHJlc29sdmUgdGhlIHByb21pc2UuIE90aGVyd2lzZSByZWplY3Qgd2l0aCB0aGUgY2FwdHVyZWQgc3RkZXJyXG4gICAgICAvLyBhbmQgc3Rkb3V0IGxvZyBvdXRwdXQgaWYgdGhlIG91dHB1dCBtb2RlIHdhcyBzZXQgdG8gYHNpbGVudGAuXG4gICAgICBpZiAoc3RhdHVzID09PSAwIHx8IG9wdGlvbnMuc3VwcHJlc3NFcnJvck9uRmFpbGluZ0V4aXRDb2RlKSB7XG4gICAgICAgIHJlc29sdmUoe3N0ZG91dCwgc3RkZXJyLCBzdGF0dXN9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlamVjdChvdXRwdXRNb2RlID09PSAnc2lsZW50JyA/IGxvZ091dHB1dCA6IHVuZGVmaW5lZCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFNwYXducyBhIGdpdmVuIGNvbW1hbmQgd2l0aCB0aGUgc3BlY2lmaWVkIGFyZ3VtZW50cyBpbnNpZGUgYSBzaGVsbCBzeW5jaHJvbm91c2x5LlxuICpcbiAqIEByZXR1cm5zIFRoZSBjb21tYW5kJ3Mgc3Rkb3V0IGFuZCBzdGRlcnIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcGF3blN5bmMoXG4gIGNvbW1hbmQ6IHN0cmluZyxcbiAgYXJnczogc3RyaW5nW10sXG4gIG9wdGlvbnM6IFNwYXduU3luY09wdGlvbnMgPSB7fSxcbik6IFNwYXduUmVzdWx0IHtcbiAgY29uc3QgY29tbWFuZFRleHQgPSBgJHtjb21tYW5kfSAke2FyZ3Muam9pbignICcpfWA7XG4gIGRlYnVnKGBFeGVjdXRpbmcgY29tbWFuZDogJHtjb21tYW5kVGV4dH1gKTtcblxuICBjb25zdCB7XG4gICAgc3RhdHVzOiBleGl0Q29kZSxcbiAgICBzaWduYWwsXG4gICAgc3Rkb3V0LFxuICAgIHN0ZGVycixcbiAgfSA9IF9zcGF3blN5bmMoY29tbWFuZCwgYXJncywgey4uLm9wdGlvbnMsIGVuY29kaW5nOiAndXRmOCcsIHNoZWxsOiB0cnVlLCBzdGRpbzogJ3BpcGUnfSk7XG5cbiAgLyoqIFRoZSBzdGF0dXMgb2YgdGhlIHNwYXduIHJlc3VsdC4gKi9cbiAgY29uc3Qgc3RhdHVzID0gc3RhdHVzRnJvbUV4aXRDb2RlQW5kU2lnbmFsKGV4aXRDb2RlLCBzaWduYWwpO1xuXG4gIGlmIChzdGF0dXMgPT09IDAgfHwgb3B0aW9ucy5zdXBwcmVzc0Vycm9yT25GYWlsaW5nRXhpdENvZGUpIHtcbiAgICByZXR1cm4ge3N0YXR1cywgc3Rkb3V0LCBzdGRlcnJ9O1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKHN0ZGVycik7XG59XG5cbi8qKlxuICogQ29udmVydCB0aGUgcHJvdmlkZWQgZXhpdENvZGUgYW5kIHNpZ25hbCB0byBhIHNpbmdsZSBzdGF0dXMgY29kZS5cbiAqXG4gKiBEdXJpbmcgYGV4aXRgIG5vZGUgcHJvdmlkZXMgZWl0aGVyIGEgYGNvZGVgIG9yIGBzaWduYWxgLCBvbmUgb2Ygd2hpY2ggaXMgZ3VhcmFudGVlZCB0byBiZVxuICogbm9uLW51bGwuXG4gKlxuICogRm9yIG1vcmUgZGV0YWlscyBzZWU6IGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvY2hpbGRfcHJvY2Vzcy5odG1sI2NoaWxkX3Byb2Nlc3NfZXZlbnRfZXhpdFxuICovXG5mdW5jdGlvbiBzdGF0dXNGcm9tRXhpdENvZGVBbmRTaWduYWwoZXhpdENvZGU6IG51bWJlciB8IG51bGwsIHNpZ25hbDogTm9kZUpTLlNpZ25hbHMgfCBudWxsKSB7XG4gIHJldHVybiBleGl0Q29kZSA/PyBzaWduYWwgPz8gLTE7XG59XG4iXX0=