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
        define("@angular/dev-infra-private/utils/console", ["require", "exports", "tslib", "chalk", "inquirer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var chalk_1 = require("chalk");
    var inquirer_1 = require("inquirer");
    /** Reexport of chalk colors for convenient access. */
    exports.red = chalk_1.default.red;
    exports.green = chalk_1.default.green;
    exports.yellow = chalk_1.default.yellow;
    /** Prompts the user with a confirmation question and a specified message. */
    function promptConfirm(message, defaultValue) {
        if (defaultValue === void 0) { defaultValue = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, inquirer_1.prompt({
                            type: 'confirm',
                            name: 'result',
                            message: message,
                            default: defaultValue,
                        })];
                    case 1: return [2 /*return*/, (_a.sent())
                            .result];
                }
            });
        });
    }
    exports.promptConfirm = promptConfirm;
    /**
     * Supported levels for logging functions.
     *
     * Levels are mapped to numbers to represent a hierarchy of logging levels.
     */
    var LOG_LEVELS;
    (function (LOG_LEVELS) {
        LOG_LEVELS[LOG_LEVELS["SILENT"] = 0] = "SILENT";
        LOG_LEVELS[LOG_LEVELS["ERROR"] = 1] = "ERROR";
        LOG_LEVELS[LOG_LEVELS["WARN"] = 2] = "WARN";
        LOG_LEVELS[LOG_LEVELS["LOG"] = 3] = "LOG";
        LOG_LEVELS[LOG_LEVELS["INFO"] = 4] = "INFO";
        LOG_LEVELS[LOG_LEVELS["DEBUG"] = 5] = "DEBUG";
    })(LOG_LEVELS = exports.LOG_LEVELS || (exports.LOG_LEVELS = {}));
    /** Default log level for the tool. */
    exports.DEFAULT_LOG_LEVEL = LOG_LEVELS.INFO;
    /** Write to the console for at INFO logging level */
    exports.info = buildLogLevelFunction(function () { return console.info; }, LOG_LEVELS.INFO);
    /** Write to the console for at ERROR logging level */
    exports.error = buildLogLevelFunction(function () { return console.error; }, LOG_LEVELS.ERROR);
    /** Write to the console for at DEBUG logging level */
    exports.debug = buildLogLevelFunction(function () { return console.debug; }, LOG_LEVELS.DEBUG);
    /** Write to the console for at LOG logging level */
    // tslint:disable-next-line: no-console
    exports.log = buildLogLevelFunction(function () { return console.log; }, LOG_LEVELS.LOG);
    /** Write to the console for at WARN logging level */
    exports.warn = buildLogLevelFunction(function () { return console.warn; }, LOG_LEVELS.WARN);
    /** Build an instance of a logging function for the provided level. */
    function buildLogLevelFunction(loadCommand, level) {
        /** Write to stdout for the LOG_LEVEL. */
        var loggingFunction = function () {
            var text = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                text[_i] = arguments[_i];
            }
            runConsoleCommand.apply(void 0, tslib_1.__spread([loadCommand, level], text));
        };
        /** Start a group at the LOG_LEVEL, optionally starting it as collapsed. */
        loggingFunction.group = function (text, collapsed) {
            if (collapsed === void 0) { collapsed = false; }
            var command = collapsed ? console.groupCollapsed : console.group;
            runConsoleCommand(function () { return command; }, level, text);
        };
        /** End the group at the LOG_LEVEL. */
        loggingFunction.groupEnd = function () {
            runConsoleCommand(function () { return console.groupEnd; }, level);
        };
        return loggingFunction;
    }
    /**
     * Run the console command provided, if the environments logging level greater than the
     * provided logging level.
     *
     * The loadCommand takes in a function which is called to retrieve the console.* function
     * to allow for jasmine spies to still work in testing.  Without this method of retrieval
     * the console.* function, the function is saved into the closure of the created logging
     * function before jasmine can spy.
     */
    function runConsoleCommand(loadCommand, logLevel) {
        var text = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            text[_i - 2] = arguments[_i];
        }
        if (getLogLevel() >= logLevel) {
            loadCommand().apply(void 0, tslib_1.__spread(text));
        }
    }
    /**
     * Retrieve the log level from environment variables, if the value found
     * based on the LOG_LEVEL environment variable is undefined, return the default
     * logging level.
     */
    function getLogLevel() {
        var logLevelEnvValue = (process.env["LOG_LEVEL"] || '').toUpperCase();
        var logLevel = LOG_LEVELS[logLevelEnvValue];
        if (logLevel === undefined) {
            return exports.DEFAULT_LOG_LEVEL;
        }
        return logLevel;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9jb25zb2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILCtCQUEwQjtJQUMxQixxQ0FBZ0M7SUFHaEMsc0RBQXNEO0lBQ3pDLFFBQUEsR0FBRyxHQUFpQixlQUFLLENBQUMsR0FBRyxDQUFDO0lBQzlCLFFBQUEsS0FBSyxHQUFpQixlQUFLLENBQUMsS0FBSyxDQUFDO0lBQ2xDLFFBQUEsTUFBTSxHQUFpQixlQUFLLENBQUMsTUFBTSxDQUFDO0lBRWpELDZFQUE2RTtJQUM3RSxTQUFzQixhQUFhLENBQUMsT0FBZSxFQUFFLFlBQW9CO1FBQXBCLDZCQUFBLEVBQUEsb0JBQW9COzs7OzRCQUMvRCxxQkFBTSxpQkFBTSxDQUFvQjs0QkFDL0IsSUFBSSxFQUFFLFNBQVM7NEJBQ2YsSUFBSSxFQUFFLFFBQVE7NEJBQ2QsT0FBTyxFQUFFLE9BQU87NEJBQ2hCLE9BQU8sRUFBRSxZQUFZO3lCQUN0QixDQUFDLEVBQUE7NEJBTFQsc0JBQU8sQ0FBQyxTQUtDLENBQUM7NkJBQ0wsTUFBTSxFQUFDOzs7O0tBQ2I7SUFSRCxzQ0FRQztJQUVEOzs7O09BSUc7SUFDSCxJQUFZLFVBT1g7SUFQRCxXQUFZLFVBQVU7UUFDcEIsK0NBQVUsQ0FBQTtRQUNWLDZDQUFTLENBQUE7UUFDVCwyQ0FBUSxDQUFBO1FBQ1IseUNBQU8sQ0FBQTtRQUNQLDJDQUFRLENBQUE7UUFDUiw2Q0FBUyxDQUFBO0lBQ1gsQ0FBQyxFQVBXLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBT3JCO0lBRUQsc0NBQXNDO0lBQ3pCLFFBQUEsaUJBQWlCLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztJQUVqRCxxREFBcUQ7SUFDeEMsUUFBQSxJQUFJLEdBQUcscUJBQXFCLENBQUMsY0FBTSxPQUFBLE9BQU8sQ0FBQyxJQUFJLEVBQVosQ0FBWSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUUvRSxzREFBc0Q7SUFDekMsUUFBQSxLQUFLLEdBQUcscUJBQXFCLENBQUMsY0FBTSxPQUFBLE9BQU8sQ0FBQyxLQUFLLEVBQWIsQ0FBYSxFQUFFLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUVsRixzREFBc0Q7SUFDekMsUUFBQSxLQUFLLEdBQUcscUJBQXFCLENBQUMsY0FBTSxPQUFBLE9BQU8sQ0FBQyxLQUFLLEVBQWIsQ0FBYSxFQUFFLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUVsRixvREFBb0Q7SUFDcEQsdUNBQXVDO0lBQzFCLFFBQUEsR0FBRyxHQUFHLHFCQUFxQixDQUFDLGNBQU0sT0FBQSxPQUFPLENBQUMsR0FBRyxFQUFYLENBQVcsRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFNUUscURBQXFEO0lBQ3hDLFFBQUEsSUFBSSxHQUFHLHFCQUFxQixDQUFDLGNBQU0sT0FBQSxPQUFPLENBQUMsSUFBSSxFQUFaLENBQVksRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFL0Usc0VBQXNFO0lBQ3RFLFNBQVMscUJBQXFCLENBQUMsV0FBMkIsRUFBRSxLQUFpQjtRQUMzRSx5Q0FBeUM7UUFDekMsSUFBTSxlQUFlLEdBQUc7WUFBQyxjQUFpQjtpQkFBakIsVUFBaUIsRUFBakIscUJBQWlCLEVBQWpCLElBQWlCO2dCQUFqQix5QkFBaUI7O1lBQ3hDLGlCQUFpQixpQ0FBQyxXQUFXLEVBQUUsS0FBSyxHQUFLLElBQUksR0FBRTtRQUNqRCxDQUFDLENBQUM7UUFFRiwyRUFBMkU7UUFDM0UsZUFBZSxDQUFDLEtBQUssR0FBRyxVQUFDLElBQVksRUFBRSxTQUFpQjtZQUFqQiwwQkFBQSxFQUFBLGlCQUFpQjtZQUN0RCxJQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFDbkUsaUJBQWlCLENBQUMsY0FBTSxPQUFBLE9BQU8sRUFBUCxDQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2hELENBQUMsQ0FBQztRQUVGLHNDQUFzQztRQUN0QyxlQUFlLENBQUMsUUFBUSxHQUFHO1lBQ3pCLGlCQUFpQixDQUFDLGNBQU0sT0FBQSxPQUFPLENBQUMsUUFBUSxFQUFoQixDQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQztRQUVGLE9BQU8sZUFBZSxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNILFNBQVMsaUJBQWlCLENBQUMsV0FBMkIsRUFBRSxRQUFvQjtRQUFFLGNBQWlCO2FBQWpCLFVBQWlCLEVBQWpCLHFCQUFpQixFQUFqQixJQUFpQjtZQUFqQiw2QkFBaUI7O1FBQzdGLElBQUksV0FBVyxFQUFFLElBQUksUUFBUSxFQUFFO1lBQzdCLFdBQVcsRUFBRSxnQ0FBSSxJQUFJLEdBQUU7U0FDeEI7SUFDSCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFNBQVMsV0FBVztRQUNsQixJQUFNLGdCQUFnQixHQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM3RSxJQUFNLFFBQVEsR0FBRyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUM5QyxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7WUFDMUIsT0FBTyx5QkFBaUIsQ0FBQztTQUMxQjtRQUNELE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IGNoYWxrIGZyb20gJ2NoYWxrJztcbmltcG9ydCB7cHJvbXB0fSBmcm9tICdpbnF1aXJlcic7XG5cblxuLyoqIFJlZXhwb3J0IG9mIGNoYWxrIGNvbG9ycyBmb3IgY29udmVuaWVudCBhY2Nlc3MuICovXG5leHBvcnQgY29uc3QgcmVkOiB0eXBlb2YgY2hhbGsgPSBjaGFsay5yZWQ7XG5leHBvcnQgY29uc3QgZ3JlZW46IHR5cGVvZiBjaGFsayA9IGNoYWxrLmdyZWVuO1xuZXhwb3J0IGNvbnN0IHllbGxvdzogdHlwZW9mIGNoYWxrID0gY2hhbGsueWVsbG93O1xuXG4vKiogUHJvbXB0cyB0aGUgdXNlciB3aXRoIGEgY29uZmlybWF0aW9uIHF1ZXN0aW9uIGFuZCBhIHNwZWNpZmllZCBtZXNzYWdlLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByb21wdENvbmZpcm0obWVzc2FnZTogc3RyaW5nLCBkZWZhdWx0VmFsdWUgPSBmYWxzZSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICByZXR1cm4gKGF3YWl0IHByb21wdDx7cmVzdWx0OiBib29sZWFufT4oe1xuICAgICAgICAgICB0eXBlOiAnY29uZmlybScsXG4gICAgICAgICAgIG5hbWU6ICdyZXN1bHQnLFxuICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgICAgICBkZWZhdWx0OiBkZWZhdWx0VmFsdWUsXG4gICAgICAgICB9KSlcbiAgICAgIC5yZXN1bHQ7XG59XG5cbi8qKlxuICogU3VwcG9ydGVkIGxldmVscyBmb3IgbG9nZ2luZyBmdW5jdGlvbnMuXG4gKlxuICogTGV2ZWxzIGFyZSBtYXBwZWQgdG8gbnVtYmVycyB0byByZXByZXNlbnQgYSBoaWVyYXJjaHkgb2YgbG9nZ2luZyBsZXZlbHMuXG4gKi9cbmV4cG9ydCBlbnVtIExPR19MRVZFTFMge1xuICBTSUxFTlQgPSAwLFxuICBFUlJPUiA9IDEsXG4gIFdBUk4gPSAyLFxuICBMT0cgPSAzLFxuICBJTkZPID0gNCxcbiAgREVCVUcgPSA1LFxufVxuXG4vKiogRGVmYXVsdCBsb2cgbGV2ZWwgZm9yIHRoZSB0b29sLiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfTE9HX0xFVkVMID0gTE9HX0xFVkVMUy5JTkZPO1xuXG4vKiogV3JpdGUgdG8gdGhlIGNvbnNvbGUgZm9yIGF0IElORk8gbG9nZ2luZyBsZXZlbCAqL1xuZXhwb3J0IGNvbnN0IGluZm8gPSBidWlsZExvZ0xldmVsRnVuY3Rpb24oKCkgPT4gY29uc29sZS5pbmZvLCBMT0dfTEVWRUxTLklORk8pO1xuXG4vKiogV3JpdGUgdG8gdGhlIGNvbnNvbGUgZm9yIGF0IEVSUk9SIGxvZ2dpbmcgbGV2ZWwgKi9cbmV4cG9ydCBjb25zdCBlcnJvciA9IGJ1aWxkTG9nTGV2ZWxGdW5jdGlvbigoKSA9PiBjb25zb2xlLmVycm9yLCBMT0dfTEVWRUxTLkVSUk9SKTtcblxuLyoqIFdyaXRlIHRvIHRoZSBjb25zb2xlIGZvciBhdCBERUJVRyBsb2dnaW5nIGxldmVsICovXG5leHBvcnQgY29uc3QgZGVidWcgPSBidWlsZExvZ0xldmVsRnVuY3Rpb24oKCkgPT4gY29uc29sZS5kZWJ1ZywgTE9HX0xFVkVMUy5ERUJVRyk7XG5cbi8qKiBXcml0ZSB0byB0aGUgY29uc29sZSBmb3IgYXQgTE9HIGxvZ2dpbmcgbGV2ZWwgKi9cbi8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8tY29uc29sZVxuZXhwb3J0IGNvbnN0IGxvZyA9IGJ1aWxkTG9nTGV2ZWxGdW5jdGlvbigoKSA9PiBjb25zb2xlLmxvZywgTE9HX0xFVkVMUy5MT0cpO1xuXG4vKiogV3JpdGUgdG8gdGhlIGNvbnNvbGUgZm9yIGF0IFdBUk4gbG9nZ2luZyBsZXZlbCAqL1xuZXhwb3J0IGNvbnN0IHdhcm4gPSBidWlsZExvZ0xldmVsRnVuY3Rpb24oKCkgPT4gY29uc29sZS53YXJuLCBMT0dfTEVWRUxTLldBUk4pO1xuXG4vKiogQnVpbGQgYW4gaW5zdGFuY2Ugb2YgYSBsb2dnaW5nIGZ1bmN0aW9uIGZvciB0aGUgcHJvdmlkZWQgbGV2ZWwuICovXG5mdW5jdGlvbiBidWlsZExvZ0xldmVsRnVuY3Rpb24obG9hZENvbW1hbmQ6ICgpID0+IEZ1bmN0aW9uLCBsZXZlbDogTE9HX0xFVkVMUykge1xuICAvKiogV3JpdGUgdG8gc3Rkb3V0IGZvciB0aGUgTE9HX0xFVkVMLiAqL1xuICBjb25zdCBsb2dnaW5nRnVuY3Rpb24gPSAoLi4udGV4dDogc3RyaW5nW10pID0+IHtcbiAgICBydW5Db25zb2xlQ29tbWFuZChsb2FkQ29tbWFuZCwgbGV2ZWwsIC4uLnRleHQpO1xuICB9O1xuXG4gIC8qKiBTdGFydCBhIGdyb3VwIGF0IHRoZSBMT0dfTEVWRUwsIG9wdGlvbmFsbHkgc3RhcnRpbmcgaXQgYXMgY29sbGFwc2VkLiAqL1xuICBsb2dnaW5nRnVuY3Rpb24uZ3JvdXAgPSAodGV4dDogc3RyaW5nLCBjb2xsYXBzZWQgPSBmYWxzZSkgPT4ge1xuICAgIGNvbnN0IGNvbW1hbmQgPSBjb2xsYXBzZWQgPyBjb25zb2xlLmdyb3VwQ29sbGFwc2VkIDogY29uc29sZS5ncm91cDtcbiAgICBydW5Db25zb2xlQ29tbWFuZCgoKSA9PiBjb21tYW5kLCBsZXZlbCwgdGV4dCk7XG4gIH07XG5cbiAgLyoqIEVuZCB0aGUgZ3JvdXAgYXQgdGhlIExPR19MRVZFTC4gKi9cbiAgbG9nZ2luZ0Z1bmN0aW9uLmdyb3VwRW5kID0gKCkgPT4ge1xuICAgIHJ1bkNvbnNvbGVDb21tYW5kKCgpID0+IGNvbnNvbGUuZ3JvdXBFbmQsIGxldmVsKTtcbiAgfTtcblxuICByZXR1cm4gbG9nZ2luZ0Z1bmN0aW9uO1xufVxuXG4vKipcbiAqIFJ1biB0aGUgY29uc29sZSBjb21tYW5kIHByb3ZpZGVkLCBpZiB0aGUgZW52aXJvbm1lbnRzIGxvZ2dpbmcgbGV2ZWwgZ3JlYXRlciB0aGFuIHRoZVxuICogcHJvdmlkZWQgbG9nZ2luZyBsZXZlbC5cbiAqXG4gKiBUaGUgbG9hZENvbW1hbmQgdGFrZXMgaW4gYSBmdW5jdGlvbiB3aGljaCBpcyBjYWxsZWQgdG8gcmV0cmlldmUgdGhlIGNvbnNvbGUuKiBmdW5jdGlvblxuICogdG8gYWxsb3cgZm9yIGphc21pbmUgc3BpZXMgdG8gc3RpbGwgd29yayBpbiB0ZXN0aW5nLiAgV2l0aG91dCB0aGlzIG1ldGhvZCBvZiByZXRyaWV2YWxcbiAqIHRoZSBjb25zb2xlLiogZnVuY3Rpb24sIHRoZSBmdW5jdGlvbiBpcyBzYXZlZCBpbnRvIHRoZSBjbG9zdXJlIG9mIHRoZSBjcmVhdGVkIGxvZ2dpbmdcbiAqIGZ1bmN0aW9uIGJlZm9yZSBqYXNtaW5lIGNhbiBzcHkuXG4gKi9cbmZ1bmN0aW9uIHJ1bkNvbnNvbGVDb21tYW5kKGxvYWRDb21tYW5kOiAoKSA9PiBGdW5jdGlvbiwgbG9nTGV2ZWw6IExPR19MRVZFTFMsIC4uLnRleHQ6IHN0cmluZ1tdKSB7XG4gIGlmIChnZXRMb2dMZXZlbCgpID49IGxvZ0xldmVsKSB7XG4gICAgbG9hZENvbW1hbmQoKSguLi50ZXh0KTtcbiAgfVxufVxuXG4vKipcbiAqIFJldHJpZXZlIHRoZSBsb2cgbGV2ZWwgZnJvbSBlbnZpcm9ubWVudCB2YXJpYWJsZXMsIGlmIHRoZSB2YWx1ZSBmb3VuZFxuICogYmFzZWQgb24gdGhlIExPR19MRVZFTCBlbnZpcm9ubWVudCB2YXJpYWJsZSBpcyB1bmRlZmluZWQsIHJldHVybiB0aGUgZGVmYXVsdFxuICogbG9nZ2luZyBsZXZlbC5cbiAqL1xuZnVuY3Rpb24gZ2V0TG9nTGV2ZWwoKSB7XG4gIGNvbnN0IGxvZ0xldmVsRW52VmFsdWU6IGFueSA9IChwcm9jZXNzLmVudltgTE9HX0xFVkVMYF0gfHwgJycpLnRvVXBwZXJDYXNlKCk7XG4gIGNvbnN0IGxvZ0xldmVsID0gTE9HX0xFVkVMU1tsb2dMZXZlbEVudlZhbHVlXTtcbiAgaWYgKGxvZ0xldmVsID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gREVGQVVMVF9MT0dfTEVWRUw7XG4gIH1cbiAgcmV0dXJuIGxvZ0xldmVsO1xufVxuIl19