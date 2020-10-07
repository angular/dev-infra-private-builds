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
    exports.spawnWithDebugOutput = void 0;
    var tslib_1 = require("tslib");
    var child_process_1 = require("child_process");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    /**
     * Spawns a given command with the specified arguments inside a shell. All process stdout
     * output is captured and returned as resolution on completion. Depending on the chosen
     * output mode, stdout/stderr output is also printed to the console, or only on error.
     *
     * @returns a Promise resolving with captured stdout on success. The promise
     *   rejects on command failure.
     */
    function spawnWithDebugOutput(command, args, options) {
        if (options === void 0) { options = {}; }
        return new Promise(function (resolve, reject) {
            var commandText = command + " " + args.join(' ');
            var outputMode = options.mode;
            console_1.debug("Executing command: " + commandText);
            var childProcess = child_process_1.spawn(command, args, tslib_1.__assign(tslib_1.__assign({}, options), { shell: true, stdio: ['inherit', 'pipe', 'pipe'] }));
            var logOutput = '';
            var stdout = '';
            // Capture the stdout separately so that it can be passed as resolve value.
            // This is useful if commands return parsable stdout.
            childProcess.stderr.on('data', function (message) {
                logOutput += message;
                // If console output is enabled, print the message directly to the stderr. Note that
                // we intentionally print all output to stderr as stderr should not be polluted.
                if (outputMode === undefined || outputMode === 'enabled') {
                    process.stderr.write(message);
                }
            });
            childProcess.stdout.on('data', function (message) {
                stdout += message;
                logOutput += message;
                // If console output is enabled, print the message directly to the stderr. Note that
                // we intentionally print all output to stderr as stderr should not be polluted.
                if (outputMode === undefined || outputMode === 'enabled') {
                    process.stderr.write(message);
                }
            });
            childProcess.on('exit', function (status, signal) {
                var exitDescription = status !== null ? "exit code \"" + status + "\"" : "signal \"" + signal + "\"";
                var printFn = outputMode === 'on-error' ? console_1.error : console_1.debug;
                printFn("Command " + commandText + " completed with " + exitDescription + ".");
                printFn("Process output: \n" + logOutput);
                // On success, resolve the promise. Otherwise reject with the captured stderr
                // and stdout log output if the output mode was set to `silent`.
                if (status === 0) {
                    resolve({ stdout: stdout });
                }
                else {
                    reject(outputMode === 'silent' ? logOutput : undefined);
                }
            });
        });
    }
    exports.spawnWithDebugOutput = spawnWithDebugOutput;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hpbGQtcHJvY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9jaGlsZC1wcm9jZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQ0FBa0Q7SUFDbEQsb0VBQXVDO0lBY3ZDOzs7Ozs7O09BT0c7SUFDSCxTQUFnQixvQkFBb0IsQ0FDaEMsT0FBZSxFQUFFLElBQWMsRUFDL0IsT0FBbUM7UUFBbkMsd0JBQUEsRUFBQSxZQUFtQztRQUNyQyxPQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU07WUFDakMsSUFBTSxXQUFXLEdBQU0sT0FBTyxTQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFHLENBQUM7WUFDbkQsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztZQUVoQyxlQUFLLENBQUMsd0JBQXNCLFdBQWEsQ0FBQyxDQUFDO1lBRTNDLElBQU0sWUFBWSxHQUNkLHFCQUFLLENBQUMsT0FBTyxFQUFFLElBQUksd0NBQU0sT0FBTyxLQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsSUFBRSxDQUFDO1lBQ3hGLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUNuQixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7WUFFaEIsMkVBQTJFO1lBQzNFLHFEQUFxRDtZQUNyRCxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBQSxPQUFPO2dCQUNwQyxTQUFTLElBQUksT0FBTyxDQUFDO2dCQUNyQixvRkFBb0Y7Z0JBQ3BGLGdGQUFnRjtnQkFDaEYsSUFBSSxVQUFVLEtBQUssU0FBUyxJQUFJLFVBQVUsS0FBSyxTQUFTLEVBQUU7b0JBQ3hELE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUMvQjtZQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0gsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQUEsT0FBTztnQkFDcEMsTUFBTSxJQUFJLE9BQU8sQ0FBQztnQkFDbEIsU0FBUyxJQUFJLE9BQU8sQ0FBQztnQkFDckIsb0ZBQW9GO2dCQUNwRixnRkFBZ0Y7Z0JBQ2hGLElBQUksVUFBVSxLQUFLLFNBQVMsSUFBSSxVQUFVLEtBQUssU0FBUyxFQUFFO29CQUN4RCxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDL0I7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUVILFlBQVksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQUMsTUFBTSxFQUFFLE1BQU07Z0JBQ3JDLElBQU0sZUFBZSxHQUFHLE1BQU0sS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLGlCQUFjLE1BQU0sT0FBRyxDQUFDLENBQUMsQ0FBQyxjQUFXLE1BQU0sT0FBRyxDQUFDO2dCQUN6RixJQUFNLE9BQU8sR0FBRyxVQUFVLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQyxlQUFLLENBQUMsQ0FBQyxDQUFDLGVBQUssQ0FBQztnQkFFMUQsT0FBTyxDQUFDLGFBQVcsV0FBVyx3QkFBbUIsZUFBZSxNQUFHLENBQUMsQ0FBQztnQkFDckUsT0FBTyxDQUFDLHVCQUFxQixTQUFXLENBQUMsQ0FBQztnQkFFMUMsNkVBQTZFO2dCQUM3RSxnRUFBZ0U7Z0JBQ2hFLElBQUksTUFBTSxLQUFLLENBQUMsRUFBRTtvQkFDaEIsT0FBTyxDQUFDLEVBQUMsTUFBTSxRQUFBLEVBQUMsQ0FBQyxDQUFDO2lCQUNuQjtxQkFBTTtvQkFDTCxNQUFNLENBQUMsVUFBVSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztpQkFDekQ7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQWxERCxvREFrREMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtzcGF3biwgU3Bhd25PcHRpb25zfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7ZGVidWcsIGVycm9yfSBmcm9tICcuL2NvbnNvbGUnO1xuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgdGhlIG9wdGlvbnMgZm9yIHNwYXduaW5nIGEgcHJvY2Vzcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3Bhd25lZFByb2Nlc3NPcHRpb25zIGV4dGVuZHMgT21pdDxTcGF3bk9wdGlvbnMsICdzdGRpbyc+IHtcbiAgLyoqIENvbnNvbGUgb3V0cHV0IG1vZGUuIERlZmF1bHRzIHRvIFwiZW5hYmxlZFwiLiAqL1xuICBtb2RlPzogJ2VuYWJsZWQnfCdzaWxlbnQnfCdvbi1lcnJvcic7XG59XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyB0aGUgcmVzdWx0IG9mIGEgc3Bhd25lZCBwcm9jZXNzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBTcGF3bmVkUHJvY2Vzc1Jlc3VsdCB7XG4gIC8qKiBDYXB0dXJlZCBzdGRvdXQgaW4gc3RyaW5nIGZvcm1hdC4gKi9cbiAgc3Rkb3V0OiBzdHJpbmc7XG59XG5cbi8qKlxuICogU3Bhd25zIGEgZ2l2ZW4gY29tbWFuZCB3aXRoIHRoZSBzcGVjaWZpZWQgYXJndW1lbnRzIGluc2lkZSBhIHNoZWxsLiBBbGwgcHJvY2VzcyBzdGRvdXRcbiAqIG91dHB1dCBpcyBjYXB0dXJlZCBhbmQgcmV0dXJuZWQgYXMgcmVzb2x1dGlvbiBvbiBjb21wbGV0aW9uLiBEZXBlbmRpbmcgb24gdGhlIGNob3NlblxuICogb3V0cHV0IG1vZGUsIHN0ZG91dC9zdGRlcnIgb3V0cHV0IGlzIGFsc28gcHJpbnRlZCB0byB0aGUgY29uc29sZSwgb3Igb25seSBvbiBlcnJvci5cbiAqXG4gKiBAcmV0dXJucyBhIFByb21pc2UgcmVzb2x2aW5nIHdpdGggY2FwdHVyZWQgc3Rkb3V0IG9uIHN1Y2Nlc3MuIFRoZSBwcm9taXNlXG4gKiAgIHJlamVjdHMgb24gY29tbWFuZCBmYWlsdXJlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3Bhd25XaXRoRGVidWdPdXRwdXQoXG4gICAgY29tbWFuZDogc3RyaW5nLCBhcmdzOiBzdHJpbmdbXSxcbiAgICBvcHRpb25zOiBTcGF3bmVkUHJvY2Vzc09wdGlvbnMgPSB7fSk6IFByb21pc2U8U3Bhd25lZFByb2Nlc3NSZXN1bHQ+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBjb21tYW5kVGV4dCA9IGAke2NvbW1hbmR9ICR7YXJncy5qb2luKCcgJyl9YDtcbiAgICBjb25zdCBvdXRwdXRNb2RlID0gb3B0aW9ucy5tb2RlO1xuXG4gICAgZGVidWcoYEV4ZWN1dGluZyBjb21tYW5kOiAke2NvbW1hbmRUZXh0fWApO1xuXG4gICAgY29uc3QgY2hpbGRQcm9jZXNzID1cbiAgICAgICAgc3Bhd24oY29tbWFuZCwgYXJncywgey4uLm9wdGlvbnMsIHNoZWxsOiB0cnVlLCBzdGRpbzogWydpbmhlcml0JywgJ3BpcGUnLCAncGlwZSddfSk7XG4gICAgbGV0IGxvZ091dHB1dCA9ICcnO1xuICAgIGxldCBzdGRvdXQgPSAnJztcblxuICAgIC8vIENhcHR1cmUgdGhlIHN0ZG91dCBzZXBhcmF0ZWx5IHNvIHRoYXQgaXQgY2FuIGJlIHBhc3NlZCBhcyByZXNvbHZlIHZhbHVlLlxuICAgIC8vIFRoaXMgaXMgdXNlZnVsIGlmIGNvbW1hbmRzIHJldHVybiBwYXJzYWJsZSBzdGRvdXQuXG4gICAgY2hpbGRQcm9jZXNzLnN0ZGVyci5vbignZGF0YScsIG1lc3NhZ2UgPT4ge1xuICAgICAgbG9nT3V0cHV0ICs9IG1lc3NhZ2U7XG4gICAgICAvLyBJZiBjb25zb2xlIG91dHB1dCBpcyBlbmFibGVkLCBwcmludCB0aGUgbWVzc2FnZSBkaXJlY3RseSB0byB0aGUgc3RkZXJyLiBOb3RlIHRoYXRcbiAgICAgIC8vIHdlIGludGVudGlvbmFsbHkgcHJpbnQgYWxsIG91dHB1dCB0byBzdGRlcnIgYXMgc3RkZXJyIHNob3VsZCBub3QgYmUgcG9sbHV0ZWQuXG4gICAgICBpZiAob3V0cHV0TW9kZSA9PT0gdW5kZWZpbmVkIHx8IG91dHB1dE1vZGUgPT09ICdlbmFibGVkJykge1xuICAgICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZShtZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjaGlsZFByb2Nlc3Muc3Rkb3V0Lm9uKCdkYXRhJywgbWVzc2FnZSA9PiB7XG4gICAgICBzdGRvdXQgKz0gbWVzc2FnZTtcbiAgICAgIGxvZ091dHB1dCArPSBtZXNzYWdlO1xuICAgICAgLy8gSWYgY29uc29sZSBvdXRwdXQgaXMgZW5hYmxlZCwgcHJpbnQgdGhlIG1lc3NhZ2UgZGlyZWN0bHkgdG8gdGhlIHN0ZGVyci4gTm90ZSB0aGF0XG4gICAgICAvLyB3ZSBpbnRlbnRpb25hbGx5IHByaW50IGFsbCBvdXRwdXQgdG8gc3RkZXJyIGFzIHN0ZGVyciBzaG91bGQgbm90IGJlIHBvbGx1dGVkLlxuICAgICAgaWYgKG91dHB1dE1vZGUgPT09IHVuZGVmaW5lZCB8fCBvdXRwdXRNb2RlID09PSAnZW5hYmxlZCcpIHtcbiAgICAgICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUobWVzc2FnZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjaGlsZFByb2Nlc3Mub24oJ2V4aXQnLCAoc3RhdHVzLCBzaWduYWwpID0+IHtcbiAgICAgIGNvbnN0IGV4aXREZXNjcmlwdGlvbiA9IHN0YXR1cyAhPT0gbnVsbCA/IGBleGl0IGNvZGUgXCIke3N0YXR1c31cImAgOiBgc2lnbmFsIFwiJHtzaWduYWx9XCJgO1xuICAgICAgY29uc3QgcHJpbnRGbiA9IG91dHB1dE1vZGUgPT09ICdvbi1lcnJvcicgPyBlcnJvciA6IGRlYnVnO1xuXG4gICAgICBwcmludEZuKGBDb21tYW5kICR7Y29tbWFuZFRleHR9IGNvbXBsZXRlZCB3aXRoICR7ZXhpdERlc2NyaXB0aW9ufS5gKTtcbiAgICAgIHByaW50Rm4oYFByb2Nlc3Mgb3V0cHV0OiBcXG4ke2xvZ091dHB1dH1gKTtcblxuICAgICAgLy8gT24gc3VjY2VzcywgcmVzb2x2ZSB0aGUgcHJvbWlzZS4gT3RoZXJ3aXNlIHJlamVjdCB3aXRoIHRoZSBjYXB0dXJlZCBzdGRlcnJcbiAgICAgIC8vIGFuZCBzdGRvdXQgbG9nIG91dHB1dCBpZiB0aGUgb3V0cHV0IG1vZGUgd2FzIHNldCB0byBgc2lsZW50YC5cbiAgICAgIGlmIChzdGF0dXMgPT09IDApIHtcbiAgICAgICAgcmVzb2x2ZSh7c3Rkb3V0fSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZWplY3Qob3V0cHV0TW9kZSA9PT0gJ3NpbGVudCcgPyBsb2dPdXRwdXQgOiB1bmRlZmluZWQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cbiJdfQ==