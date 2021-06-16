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
    exports.spawnWithDebugOutput = exports.spawnInteractiveCommand = void 0;
    var tslib_1 = require("tslib");
    var child_process_1 = require("child_process");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    /**
     * Spawns a given command with the specified arguments inside an interactive shell. All process
     * stdin, stdout and stderr output is printed to the current console.
     *
     * @returns a Promise resolving on success, and rejecting on command failure with the status code.
     */
    function spawnInteractiveCommand(command, args, options) {
        if (options === void 0) { options = {}; }
        return new Promise(function (resolve, reject) {
            var commandText = command + " " + args.join(' ');
            console_1.debug("Executing command: " + commandText);
            var childProcess = child_process_1.spawn(command, args, tslib_1.__assign(tslib_1.__assign({}, options), { shell: true, stdio: 'inherit' }));
            childProcess.on('exit', function (status) { return status === 0 ? resolve() : reject(status); });
        });
    }
    exports.spawnInteractiveCommand = spawnInteractiveCommand;
    /**
     * Spawns a given command with the specified arguments inside a shell. All process stdout
     * output is captured and returned as resolution on completion. Depending on the chosen
     * output mode, stdout/stderr output is also printed to the console, or only on error.
     *
     * @returns a Promise resolving with captured stdout and stderr on success. The promise
     *   rejects on command failure.
     */
    function spawnWithDebugOutput(command, args, options) {
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
            childProcess.on('exit', function (status, signal) {
                var exitDescription = status !== null ? "exit code \"" + status + "\"" : "signal \"" + signal + "\"";
                var printFn = outputMode === 'on-error' ? console_1.error : console_1.debug;
                printFn("Command \"" + commandText + "\" completed with " + exitDescription + ".");
                printFn("Process output: \n" + logOutput);
                // On success, resolve the promise. Otherwise reject with the captured stderr
                // and stdout log output if the output mode was set to `silent`.
                if (status === 0) {
                    resolve({ stdout: stdout, stderr: stderr });
                }
                else {
                    reject(outputMode === 'silent' ? logOutput : undefined);
                }
            });
        });
    }
    exports.spawnWithDebugOutput = spawnWithDebugOutput;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hpbGQtcHJvY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9jaGlsZC1wcm9jZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQ0FBa0Q7SUFDbEQsb0VBQXVDO0lBZ0J2Qzs7Ozs7T0FLRztJQUNILFNBQWdCLHVCQUF1QixDQUNuQyxPQUFlLEVBQUUsSUFBYyxFQUFFLE9BQXlDO1FBQXpDLHdCQUFBLEVBQUEsWUFBeUM7UUFDNUUsT0FBTyxJQUFJLE9BQU8sQ0FBTyxVQUFDLE9BQU8sRUFBRSxNQUFNO1lBQ3ZDLElBQU0sV0FBVyxHQUFNLE9BQU8sU0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBRyxDQUFDO1lBQ25ELGVBQUssQ0FBQyx3QkFBc0IsV0FBYSxDQUFDLENBQUM7WUFDM0MsSUFBTSxZQUFZLEdBQUcscUJBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSx3Q0FBTSxPQUFPLEtBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsU0FBUyxJQUFFLENBQUM7WUFDdkYsWUFBWSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBQSxNQUFNLElBQUksT0FBQSxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUF6QyxDQUF5QyxDQUFDLENBQUM7UUFDL0UsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBUkQsMERBUUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsU0FBZ0Isb0JBQW9CLENBQ2hDLE9BQWUsRUFBRSxJQUFjLEVBQy9CLE9BQW1DO1FBQW5DLHdCQUFBLEVBQUEsWUFBbUM7UUFDckMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNO1lBQ2pDLElBQU0sV0FBVyxHQUFNLE9BQU8sU0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBRyxDQUFDO1lBQ25ELElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFFaEMsZUFBSyxDQUFDLHdCQUFzQixXQUFhLENBQUMsQ0FBQztZQUUzQyxJQUFNLFlBQVksR0FBRyxxQkFBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLHdDQUFNLE9BQU8sS0FBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLElBQUUsQ0FBQztZQUNwRixJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFDbkIsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBQ2hCLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUVoQiwyRUFBMkU7WUFDM0UscURBQXFEO1lBQ3JELFlBQVksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFBLE9BQU87Z0JBQ3BDLE1BQU0sSUFBSSxPQUFPLENBQUM7Z0JBQ2xCLFNBQVMsSUFBSSxPQUFPLENBQUM7Z0JBQ3JCLG9GQUFvRjtnQkFDcEYsZ0ZBQWdGO2dCQUNoRixJQUFJLFVBQVUsS0FBSyxTQUFTLElBQUksVUFBVSxLQUFLLFNBQVMsRUFBRTtvQkFDeEQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQy9CO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFFSCxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBQSxPQUFPO2dCQUNwQyxNQUFNLElBQUksT0FBTyxDQUFDO2dCQUNsQixTQUFTLElBQUksT0FBTyxDQUFDO2dCQUNyQixvRkFBb0Y7Z0JBQ3BGLGdGQUFnRjtnQkFDaEYsSUFBSSxVQUFVLEtBQUssU0FBUyxJQUFJLFVBQVUsS0FBSyxTQUFTLEVBQUU7b0JBQ3hELE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUMvQjtZQUNILENBQUMsQ0FBQyxDQUFDO1lBRUgsWUFBWSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBQyxNQUFNLEVBQUUsTUFBTTtnQkFDckMsSUFBTSxlQUFlLEdBQUcsTUFBTSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsaUJBQWMsTUFBTSxPQUFHLENBQUMsQ0FBQyxDQUFDLGNBQVcsTUFBTSxPQUFHLENBQUM7Z0JBQ3pGLElBQU0sT0FBTyxHQUFHLFVBQVUsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLGVBQUssQ0FBQyxDQUFDLENBQUMsZUFBSyxDQUFDO2dCQUUxRCxPQUFPLENBQUMsZUFBWSxXQUFXLDBCQUFvQixlQUFlLE1BQUcsQ0FBQyxDQUFDO2dCQUN2RSxPQUFPLENBQUMsdUJBQXFCLFNBQVcsQ0FBQyxDQUFDO2dCQUUxQyw2RUFBNkU7Z0JBQzdFLGdFQUFnRTtnQkFDaEUsSUFBSSxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUNoQixPQUFPLENBQUMsRUFBQyxNQUFNLFFBQUEsRUFBRSxNQUFNLFFBQUEsRUFBQyxDQUFDLENBQUM7aUJBQzNCO3FCQUFNO29CQUNMLE1BQU0sQ0FBQyxVQUFVLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2lCQUN6RDtZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBcERELG9EQW9EQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3NwYXduLCBTcGF3bk9wdGlvbnN9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHtkZWJ1ZywgZXJyb3J9IGZyb20gJy4vY29uc29sZSc7XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyB0aGUgb3B0aW9ucyBmb3Igc3Bhd25pbmcgYSBwcm9jZXNzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBTcGF3bmVkUHJvY2Vzc09wdGlvbnMgZXh0ZW5kcyBPbWl0PFNwYXduT3B0aW9ucywgJ3N0ZGlvJz4ge1xuICAvKiogQ29uc29sZSBvdXRwdXQgbW9kZS4gRGVmYXVsdHMgdG8gXCJlbmFibGVkXCIuICovXG4gIG1vZGU/OiAnZW5hYmxlZCd8J3NpbGVudCd8J29uLWVycm9yJztcbn1cblxuLyoqIEludGVyZmFjZSBkZXNjcmliaW5nIHRoZSByZXN1bHQgb2YgYSBzcGF3bmVkIHByb2Nlc3MuICovXG5leHBvcnQgaW50ZXJmYWNlIFNwYXduZWRQcm9jZXNzUmVzdWx0IHtcbiAgLyoqIENhcHR1cmVkIHN0ZG91dCBpbiBzdHJpbmcgZm9ybWF0LiAqL1xuICBzdGRvdXQ6IHN0cmluZztcbiAgLyoqIENhcHR1cmVkIHN0ZGVyciBpbiBzdHJpbmcgZm9ybWF0LiAqL1xuICBzdGRlcnI6IHN0cmluZztcbn1cblxuLyoqXG4gKiBTcGF3bnMgYSBnaXZlbiBjb21tYW5kIHdpdGggdGhlIHNwZWNpZmllZCBhcmd1bWVudHMgaW5zaWRlIGFuIGludGVyYWN0aXZlIHNoZWxsLiBBbGwgcHJvY2Vzc1xuICogc3RkaW4sIHN0ZG91dCBhbmQgc3RkZXJyIG91dHB1dCBpcyBwcmludGVkIHRvIHRoZSBjdXJyZW50IGNvbnNvbGUuXG4gKlxuICogQHJldHVybnMgYSBQcm9taXNlIHJlc29sdmluZyBvbiBzdWNjZXNzLCBhbmQgcmVqZWN0aW5nIG9uIGNvbW1hbmQgZmFpbHVyZSB3aXRoIHRoZSBzdGF0dXMgY29kZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNwYXduSW50ZXJhY3RpdmVDb21tYW5kKFxuICAgIGNvbW1hbmQ6IHN0cmluZywgYXJnczogc3RyaW5nW10sIG9wdGlvbnM6IE9taXQ8U3Bhd25PcHRpb25zLCAnc3RkaW8nPiA9IHt9KSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgY29tbWFuZFRleHQgPSBgJHtjb21tYW5kfSAke2FyZ3Muam9pbignICcpfWA7XG4gICAgZGVidWcoYEV4ZWN1dGluZyBjb21tYW5kOiAke2NvbW1hbmRUZXh0fWApO1xuICAgIGNvbnN0IGNoaWxkUHJvY2VzcyA9IHNwYXduKGNvbW1hbmQsIGFyZ3MsIHsuLi5vcHRpb25zLCBzaGVsbDogdHJ1ZSwgc3RkaW86ICdpbmhlcml0J30pO1xuICAgIGNoaWxkUHJvY2Vzcy5vbignZXhpdCcsIHN0YXR1cyA9PiBzdGF0dXMgPT09IDAgPyByZXNvbHZlKCkgOiByZWplY3Qoc3RhdHVzKSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFNwYXducyBhIGdpdmVuIGNvbW1hbmQgd2l0aCB0aGUgc3BlY2lmaWVkIGFyZ3VtZW50cyBpbnNpZGUgYSBzaGVsbC4gQWxsIHByb2Nlc3Mgc3Rkb3V0XG4gKiBvdXRwdXQgaXMgY2FwdHVyZWQgYW5kIHJldHVybmVkIGFzIHJlc29sdXRpb24gb24gY29tcGxldGlvbi4gRGVwZW5kaW5nIG9uIHRoZSBjaG9zZW5cbiAqIG91dHB1dCBtb2RlLCBzdGRvdXQvc3RkZXJyIG91dHB1dCBpcyBhbHNvIHByaW50ZWQgdG8gdGhlIGNvbnNvbGUsIG9yIG9ubHkgb24gZXJyb3IuXG4gKlxuICogQHJldHVybnMgYSBQcm9taXNlIHJlc29sdmluZyB3aXRoIGNhcHR1cmVkIHN0ZG91dCBhbmQgc3RkZXJyIG9uIHN1Y2Nlc3MuIFRoZSBwcm9taXNlXG4gKiAgIHJlamVjdHMgb24gY29tbWFuZCBmYWlsdXJlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3Bhd25XaXRoRGVidWdPdXRwdXQoXG4gICAgY29tbWFuZDogc3RyaW5nLCBhcmdzOiBzdHJpbmdbXSxcbiAgICBvcHRpb25zOiBTcGF3bmVkUHJvY2Vzc09wdGlvbnMgPSB7fSk6IFByb21pc2U8U3Bhd25lZFByb2Nlc3NSZXN1bHQ+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBjb21tYW5kVGV4dCA9IGAke2NvbW1hbmR9ICR7YXJncy5qb2luKCcgJyl9YDtcbiAgICBjb25zdCBvdXRwdXRNb2RlID0gb3B0aW9ucy5tb2RlO1xuXG4gICAgZGVidWcoYEV4ZWN1dGluZyBjb21tYW5kOiAke2NvbW1hbmRUZXh0fWApO1xuXG4gICAgY29uc3QgY2hpbGRQcm9jZXNzID0gc3Bhd24oY29tbWFuZCwgYXJncywgey4uLm9wdGlvbnMsIHNoZWxsOiB0cnVlLCBzdGRpbzogJ3BpcGUnfSk7XG4gICAgbGV0IGxvZ091dHB1dCA9ICcnO1xuICAgIGxldCBzdGRvdXQgPSAnJztcbiAgICBsZXQgc3RkZXJyID0gJyc7XG5cbiAgICAvLyBDYXB0dXJlIHRoZSBzdGRvdXQgc2VwYXJhdGVseSBzbyB0aGF0IGl0IGNhbiBiZSBwYXNzZWQgYXMgcmVzb2x2ZSB2YWx1ZS5cbiAgICAvLyBUaGlzIGlzIHVzZWZ1bCBpZiBjb21tYW5kcyByZXR1cm4gcGFyc2FibGUgc3Rkb3V0LlxuICAgIGNoaWxkUHJvY2Vzcy5zdGRlcnIub24oJ2RhdGEnLCBtZXNzYWdlID0+IHtcbiAgICAgIHN0ZGVyciArPSBtZXNzYWdlO1xuICAgICAgbG9nT3V0cHV0ICs9IG1lc3NhZ2U7XG4gICAgICAvLyBJZiBjb25zb2xlIG91dHB1dCBpcyBlbmFibGVkLCBwcmludCB0aGUgbWVzc2FnZSBkaXJlY3RseSB0byB0aGUgc3RkZXJyLiBOb3RlIHRoYXRcbiAgICAgIC8vIHdlIGludGVudGlvbmFsbHkgcHJpbnQgYWxsIG91dHB1dCB0byBzdGRlcnIgYXMgc3Rkb3V0IHNob3VsZCBub3QgYmUgcG9sbHV0ZWQuXG4gICAgICBpZiAob3V0cHV0TW9kZSA9PT0gdW5kZWZpbmVkIHx8IG91dHB1dE1vZGUgPT09ICdlbmFibGVkJykge1xuICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZShtZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNoaWxkUHJvY2Vzcy5zdGRvdXQub24oJ2RhdGEnLCBtZXNzYWdlID0+IHtcbiAgICAgIHN0ZG91dCArPSBtZXNzYWdlO1xuICAgICAgbG9nT3V0cHV0ICs9IG1lc3NhZ2U7XG4gICAgICAvLyBJZiBjb25zb2xlIG91dHB1dCBpcyBlbmFibGVkLCBwcmludCB0aGUgbWVzc2FnZSBkaXJlY3RseSB0byB0aGUgc3RkZXJyLiBOb3RlIHRoYXRcbiAgICAgIC8vIHdlIGludGVudGlvbmFsbHkgcHJpbnQgYWxsIG91dHB1dCB0byBzdGRlcnIgYXMgc3Rkb3V0IHNob3VsZCBub3QgYmUgcG9sbHV0ZWQuXG4gICAgICBpZiAob3V0cHV0TW9kZSA9PT0gdW5kZWZpbmVkIHx8IG91dHB1dE1vZGUgPT09ICdlbmFibGVkJykge1xuICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZShtZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNoaWxkUHJvY2Vzcy5vbignZXhpdCcsIChzdGF0dXMsIHNpZ25hbCkgPT4ge1xuICAgICAgY29uc3QgZXhpdERlc2NyaXB0aW9uID0gc3RhdHVzICE9PSBudWxsID8gYGV4aXQgY29kZSBcIiR7c3RhdHVzfVwiYCA6IGBzaWduYWwgXCIke3NpZ25hbH1cImA7XG4gICAgICBjb25zdCBwcmludEZuID0gb3V0cHV0TW9kZSA9PT0gJ29uLWVycm9yJyA/IGVycm9yIDogZGVidWc7XG5cbiAgICAgIHByaW50Rm4oYENvbW1hbmQgXCIke2NvbW1hbmRUZXh0fVwiIGNvbXBsZXRlZCB3aXRoICR7ZXhpdERlc2NyaXB0aW9ufS5gKTtcbiAgICAgIHByaW50Rm4oYFByb2Nlc3Mgb3V0cHV0OiBcXG4ke2xvZ091dHB1dH1gKTtcblxuICAgICAgLy8gT24gc3VjY2VzcywgcmVzb2x2ZSB0aGUgcHJvbWlzZS4gT3RoZXJ3aXNlIHJlamVjdCB3aXRoIHRoZSBjYXB0dXJlZCBzdGRlcnJcbiAgICAgIC8vIGFuZCBzdGRvdXQgbG9nIG91dHB1dCBpZiB0aGUgb3V0cHV0IG1vZGUgd2FzIHNldCB0byBgc2lsZW50YC5cbiAgICAgIGlmIChzdGF0dXMgPT09IDApIHtcbiAgICAgICAgcmVzb2x2ZSh7c3Rkb3V0LCBzdGRlcnJ9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlamVjdChvdXRwdXRNb2RlID09PSAnc2lsZW50JyA/IGxvZ091dHB1dCA6IHVuZGVmaW5lZCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuIl19