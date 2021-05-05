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
     * @returns a Promise resolving with captured stdout and stderr on success. The promise
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hpbGQtcHJvY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9jaGlsZC1wcm9jZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQ0FBa0Q7SUFDbEQsb0VBQXVDO0lBZ0J2Qzs7Ozs7OztPQU9HO0lBQ0gsU0FBZ0Isb0JBQW9CLENBQ2hDLE9BQWUsRUFBRSxJQUFjLEVBQy9CLE9BQW1DO1FBQW5DLHdCQUFBLEVBQUEsWUFBbUM7UUFDckMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNO1lBQ2pDLElBQU0sV0FBVyxHQUFNLE9BQU8sU0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBRyxDQUFDO1lBQ25ELElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFFaEMsZUFBSyxDQUFDLHdCQUFzQixXQUFhLENBQUMsQ0FBQztZQUUzQyxJQUFNLFlBQVksR0FDZCxxQkFBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLHdDQUFNLE9BQU8sS0FBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLElBQUUsQ0FBQztZQUN4RixJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFDbkIsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBQ2hCLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUVoQiwyRUFBMkU7WUFDM0UscURBQXFEO1lBQ3JELFlBQVksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFBLE9BQU87Z0JBQ3BDLE1BQU0sSUFBSSxPQUFPLENBQUM7Z0JBQ2xCLFNBQVMsSUFBSSxPQUFPLENBQUM7Z0JBQ3JCLG9GQUFvRjtnQkFDcEYsZ0ZBQWdGO2dCQUNoRixJQUFJLFVBQVUsS0FBSyxTQUFTLElBQUksVUFBVSxLQUFLLFNBQVMsRUFBRTtvQkFDeEQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQy9CO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFDSCxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBQSxPQUFPO2dCQUNwQyxNQUFNLElBQUksT0FBTyxDQUFDO2dCQUNsQixTQUFTLElBQUksT0FBTyxDQUFDO2dCQUNyQixvRkFBb0Y7Z0JBQ3BGLGdGQUFnRjtnQkFDaEYsSUFBSSxVQUFVLEtBQUssU0FBUyxJQUFJLFVBQVUsS0FBSyxTQUFTLEVBQUU7b0JBQ3hELE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUMvQjtZQUNILENBQUMsQ0FBQyxDQUFDO1lBRUgsWUFBWSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBQyxNQUFNLEVBQUUsTUFBTTtnQkFDckMsSUFBTSxlQUFlLEdBQUcsTUFBTSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsaUJBQWMsTUFBTSxPQUFHLENBQUMsQ0FBQyxDQUFDLGNBQVcsTUFBTSxPQUFHLENBQUM7Z0JBQ3pGLElBQU0sT0FBTyxHQUFHLFVBQVUsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLGVBQUssQ0FBQyxDQUFDLENBQUMsZUFBSyxDQUFDO2dCQUUxRCxPQUFPLENBQUMsZUFBWSxXQUFXLDBCQUFvQixlQUFlLE1BQUcsQ0FBQyxDQUFDO2dCQUN2RSxPQUFPLENBQUMsdUJBQXFCLFNBQVcsQ0FBQyxDQUFDO2dCQUUxQyw2RUFBNkU7Z0JBQzdFLGdFQUFnRTtnQkFDaEUsSUFBSSxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUNoQixPQUFPLENBQUMsRUFBQyxNQUFNLFFBQUEsRUFBRSxNQUFNLFFBQUEsRUFBQyxDQUFDLENBQUM7aUJBQzNCO3FCQUFNO29CQUNMLE1BQU0sQ0FBQyxVQUFVLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2lCQUN6RDtZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBcERELG9EQW9EQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3NwYXduLCBTcGF3bk9wdGlvbnN9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHtkZWJ1ZywgZXJyb3J9IGZyb20gJy4vY29uc29sZSc7XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyB0aGUgb3B0aW9ucyBmb3Igc3Bhd25pbmcgYSBwcm9jZXNzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBTcGF3bmVkUHJvY2Vzc09wdGlvbnMgZXh0ZW5kcyBPbWl0PFNwYXduT3B0aW9ucywgJ3N0ZGlvJz4ge1xuICAvKiogQ29uc29sZSBvdXRwdXQgbW9kZS4gRGVmYXVsdHMgdG8gXCJlbmFibGVkXCIuICovXG4gIG1vZGU/OiAnZW5hYmxlZCd8J3NpbGVudCd8J29uLWVycm9yJztcbn1cblxuLyoqIEludGVyZmFjZSBkZXNjcmliaW5nIHRoZSByZXN1bHQgb2YgYSBzcGF3bmVkIHByb2Nlc3MuICovXG5leHBvcnQgaW50ZXJmYWNlIFNwYXduZWRQcm9jZXNzUmVzdWx0IHtcbiAgLyoqIENhcHR1cmVkIHN0ZG91dCBpbiBzdHJpbmcgZm9ybWF0LiAqL1xuICBzdGRvdXQ6IHN0cmluZztcbiAgLyoqIENhcHR1cmVkIHN0ZGVyciBpbiBzdHJpbmcgZm9ybWF0LiAqL1xuICBzdGRlcnI6IHN0cmluZztcbn1cblxuLyoqXG4gKiBTcGF3bnMgYSBnaXZlbiBjb21tYW5kIHdpdGggdGhlIHNwZWNpZmllZCBhcmd1bWVudHMgaW5zaWRlIGEgc2hlbGwuIEFsbCBwcm9jZXNzIHN0ZG91dFxuICogb3V0cHV0IGlzIGNhcHR1cmVkIGFuZCByZXR1cm5lZCBhcyByZXNvbHV0aW9uIG9uIGNvbXBsZXRpb24uIERlcGVuZGluZyBvbiB0aGUgY2hvc2VuXG4gKiBvdXRwdXQgbW9kZSwgc3Rkb3V0L3N0ZGVyciBvdXRwdXQgaXMgYWxzbyBwcmludGVkIHRvIHRoZSBjb25zb2xlLCBvciBvbmx5IG9uIGVycm9yLlxuICpcbiAqIEByZXR1cm5zIGEgUHJvbWlzZSByZXNvbHZpbmcgd2l0aCBjYXB0dXJlZCBzdGRvdXQgYW5kIHN0ZGVyciBvbiBzdWNjZXNzLiBUaGUgcHJvbWlzZVxuICogICByZWplY3RzIG9uIGNvbW1hbmQgZmFpbHVyZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNwYXduV2l0aERlYnVnT3V0cHV0KFxuICAgIGNvbW1hbmQ6IHN0cmluZywgYXJnczogc3RyaW5nW10sXG4gICAgb3B0aW9uczogU3Bhd25lZFByb2Nlc3NPcHRpb25zID0ge30pOiBQcm9taXNlPFNwYXduZWRQcm9jZXNzUmVzdWx0PiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgY29tbWFuZFRleHQgPSBgJHtjb21tYW5kfSAke2FyZ3Muam9pbignICcpfWA7XG4gICAgY29uc3Qgb3V0cHV0TW9kZSA9IG9wdGlvbnMubW9kZTtcblxuICAgIGRlYnVnKGBFeGVjdXRpbmcgY29tbWFuZDogJHtjb21tYW5kVGV4dH1gKTtcblxuICAgIGNvbnN0IGNoaWxkUHJvY2VzcyA9XG4gICAgICAgIHNwYXduKGNvbW1hbmQsIGFyZ3MsIHsuLi5vcHRpb25zLCBzaGVsbDogdHJ1ZSwgc3RkaW86IFsnaW5oZXJpdCcsICdwaXBlJywgJ3BpcGUnXX0pO1xuICAgIGxldCBsb2dPdXRwdXQgPSAnJztcbiAgICBsZXQgc3Rkb3V0ID0gJyc7XG4gICAgbGV0IHN0ZGVyciA9ICcnO1xuXG4gICAgLy8gQ2FwdHVyZSB0aGUgc3Rkb3V0IHNlcGFyYXRlbHkgc28gdGhhdCBpdCBjYW4gYmUgcGFzc2VkIGFzIHJlc29sdmUgdmFsdWUuXG4gICAgLy8gVGhpcyBpcyB1c2VmdWwgaWYgY29tbWFuZHMgcmV0dXJuIHBhcnNhYmxlIHN0ZG91dC5cbiAgICBjaGlsZFByb2Nlc3Muc3RkZXJyLm9uKCdkYXRhJywgbWVzc2FnZSA9PiB7XG4gICAgICBzdGRlcnIgKz0gbWVzc2FnZTtcbiAgICAgIGxvZ091dHB1dCArPSBtZXNzYWdlO1xuICAgICAgLy8gSWYgY29uc29sZSBvdXRwdXQgaXMgZW5hYmxlZCwgcHJpbnQgdGhlIG1lc3NhZ2UgZGlyZWN0bHkgdG8gdGhlIHN0ZGVyci4gTm90ZSB0aGF0XG4gICAgICAvLyB3ZSBpbnRlbnRpb25hbGx5IHByaW50IGFsbCBvdXRwdXQgdG8gc3RkZXJyIGFzIHN0ZG91dCBzaG91bGQgbm90IGJlIHBvbGx1dGVkLlxuICAgICAgaWYgKG91dHB1dE1vZGUgPT09IHVuZGVmaW5lZCB8fCBvdXRwdXRNb2RlID09PSAnZW5hYmxlZCcpIHtcbiAgICAgICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUobWVzc2FnZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgY2hpbGRQcm9jZXNzLnN0ZG91dC5vbignZGF0YScsIG1lc3NhZ2UgPT4ge1xuICAgICAgc3Rkb3V0ICs9IG1lc3NhZ2U7XG4gICAgICBsb2dPdXRwdXQgKz0gbWVzc2FnZTtcbiAgICAgIC8vIElmIGNvbnNvbGUgb3V0cHV0IGlzIGVuYWJsZWQsIHByaW50IHRoZSBtZXNzYWdlIGRpcmVjdGx5IHRvIHRoZSBzdGRlcnIuIE5vdGUgdGhhdFxuICAgICAgLy8gd2UgaW50ZW50aW9uYWxseSBwcmludCBhbGwgb3V0cHV0IHRvIHN0ZGVyciBhcyBzdGRvdXQgc2hvdWxkIG5vdCBiZSBwb2xsdXRlZC5cbiAgICAgIGlmIChvdXRwdXRNb2RlID09PSB1bmRlZmluZWQgfHwgb3V0cHV0TW9kZSA9PT0gJ2VuYWJsZWQnKSB7XG4gICAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlKG1lc3NhZ2UpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY2hpbGRQcm9jZXNzLm9uKCdleGl0JywgKHN0YXR1cywgc2lnbmFsKSA9PiB7XG4gICAgICBjb25zdCBleGl0RGVzY3JpcHRpb24gPSBzdGF0dXMgIT09IG51bGwgPyBgZXhpdCBjb2RlIFwiJHtzdGF0dXN9XCJgIDogYHNpZ25hbCBcIiR7c2lnbmFsfVwiYDtcbiAgICAgIGNvbnN0IHByaW50Rm4gPSBvdXRwdXRNb2RlID09PSAnb24tZXJyb3InID8gZXJyb3IgOiBkZWJ1ZztcblxuICAgICAgcHJpbnRGbihgQ29tbWFuZCBcIiR7Y29tbWFuZFRleHR9XCIgY29tcGxldGVkIHdpdGggJHtleGl0RGVzY3JpcHRpb259LmApO1xuICAgICAgcHJpbnRGbihgUHJvY2VzcyBvdXRwdXQ6IFxcbiR7bG9nT3V0cHV0fWApO1xuXG4gICAgICAvLyBPbiBzdWNjZXNzLCByZXNvbHZlIHRoZSBwcm9taXNlLiBPdGhlcndpc2UgcmVqZWN0IHdpdGggdGhlIGNhcHR1cmVkIHN0ZGVyclxuICAgICAgLy8gYW5kIHN0ZG91dCBsb2cgb3V0cHV0IGlmIHRoZSBvdXRwdXQgbW9kZSB3YXMgc2V0IHRvIGBzaWxlbnRgLlxuICAgICAgaWYgKHN0YXR1cyA9PT0gMCkge1xuICAgICAgICByZXNvbHZlKHtzdGRvdXQsIHN0ZGVycn0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVqZWN0KG91dHB1dE1vZGUgPT09ICdzaWxlbnQnID8gbG9nT3V0cHV0IDogdW5kZWZpbmVkKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG4iXX0=