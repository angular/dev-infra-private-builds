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
    exports.warn = exports.log = exports.debug = exports.error = exports.info = exports.DEFAULT_LOG_LEVEL = exports.LOG_LEVELS = exports.promptConfirm = exports.yellow = exports.green = exports.red = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9jb25zb2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBMEI7SUFDMUIscUNBQWdDO0lBR2hDLHNEQUFzRDtJQUN6QyxRQUFBLEdBQUcsR0FBaUIsZUFBSyxDQUFDLEdBQUcsQ0FBQztJQUM5QixRQUFBLEtBQUssR0FBaUIsZUFBSyxDQUFDLEtBQUssQ0FBQztJQUNsQyxRQUFBLE1BQU0sR0FBaUIsZUFBSyxDQUFDLE1BQU0sQ0FBQztJQUVqRCw2RUFBNkU7SUFDN0UsU0FBc0IsYUFBYSxDQUFDLE9BQWUsRUFBRSxZQUFvQjtRQUFwQiw2QkFBQSxFQUFBLG9CQUFvQjs7Ozs0QkFDL0QscUJBQU0saUJBQU0sQ0FBb0I7NEJBQy9CLElBQUksRUFBRSxTQUFTOzRCQUNmLElBQUksRUFBRSxRQUFROzRCQUNkLE9BQU8sRUFBRSxPQUFPOzRCQUNoQixPQUFPLEVBQUUsWUFBWTt5QkFDdEIsQ0FBQyxFQUFBOzRCQUxULHNCQUFPLENBQUMsU0FLQyxDQUFDOzZCQUNMLE1BQU0sRUFBQzs7OztLQUNiO0lBUkQsc0NBUUM7SUFFRDs7OztPQUlHO0lBQ0gsSUFBWSxVQU9YO0lBUEQsV0FBWSxVQUFVO1FBQ3BCLCtDQUFVLENBQUE7UUFDViw2Q0FBUyxDQUFBO1FBQ1QsMkNBQVEsQ0FBQTtRQUNSLHlDQUFPLENBQUE7UUFDUCwyQ0FBUSxDQUFBO1FBQ1IsNkNBQVMsQ0FBQTtJQUNYLENBQUMsRUFQVyxVQUFVLEdBQVYsa0JBQVUsS0FBVixrQkFBVSxRQU9yQjtJQUVELHNDQUFzQztJQUN6QixRQUFBLGlCQUFpQixHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7SUFFakQscURBQXFEO0lBQ3hDLFFBQUEsSUFBSSxHQUFHLHFCQUFxQixDQUFDLGNBQU0sT0FBQSxPQUFPLENBQUMsSUFBSSxFQUFaLENBQVksRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFL0Usc0RBQXNEO0lBQ3pDLFFBQUEsS0FBSyxHQUFHLHFCQUFxQixDQUFDLGNBQU0sT0FBQSxPQUFPLENBQUMsS0FBSyxFQUFiLENBQWEsRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFbEYsc0RBQXNEO0lBQ3pDLFFBQUEsS0FBSyxHQUFHLHFCQUFxQixDQUFDLGNBQU0sT0FBQSxPQUFPLENBQUMsS0FBSyxFQUFiLENBQWEsRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFbEYsb0RBQW9EO0lBQ3BELHVDQUF1QztJQUMxQixRQUFBLEdBQUcsR0FBRyxxQkFBcUIsQ0FBQyxjQUFNLE9BQUEsT0FBTyxDQUFDLEdBQUcsRUFBWCxDQUFXLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRTVFLHFEQUFxRDtJQUN4QyxRQUFBLElBQUksR0FBRyxxQkFBcUIsQ0FBQyxjQUFNLE9BQUEsT0FBTyxDQUFDLElBQUksRUFBWixDQUFZLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRS9FLHNFQUFzRTtJQUN0RSxTQUFTLHFCQUFxQixDQUFDLFdBQTJCLEVBQUUsS0FBaUI7UUFDM0UseUNBQXlDO1FBQ3pDLElBQU0sZUFBZSxHQUFHO1lBQUMsY0FBaUI7aUJBQWpCLFVBQWlCLEVBQWpCLHFCQUFpQixFQUFqQixJQUFpQjtnQkFBakIseUJBQWlCOztZQUN4QyxpQkFBaUIsaUNBQUMsV0FBVyxFQUFFLEtBQUssR0FBSyxJQUFJLEdBQUU7UUFDakQsQ0FBQyxDQUFDO1FBRUYsMkVBQTJFO1FBQzNFLGVBQWUsQ0FBQyxLQUFLLEdBQUcsVUFBQyxJQUFZLEVBQUUsU0FBaUI7WUFBakIsMEJBQUEsRUFBQSxpQkFBaUI7WUFDdEQsSUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1lBQ25FLGlCQUFpQixDQUFDLGNBQU0sT0FBQSxPQUFPLEVBQVAsQ0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNoRCxDQUFDLENBQUM7UUFFRixzQ0FBc0M7UUFDdEMsZUFBZSxDQUFDLFFBQVEsR0FBRztZQUN6QixpQkFBaUIsQ0FBQyxjQUFNLE9BQUEsT0FBTyxDQUFDLFFBQVEsRUFBaEIsQ0FBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNuRCxDQUFDLENBQUM7UUFFRixPQUFPLGVBQWUsQ0FBQztJQUN6QixDQUFDO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSCxTQUFTLGlCQUFpQixDQUFDLFdBQTJCLEVBQUUsUUFBb0I7UUFBRSxjQUFpQjthQUFqQixVQUFpQixFQUFqQixxQkFBaUIsRUFBakIsSUFBaUI7WUFBakIsNkJBQWlCOztRQUM3RixJQUFJLFdBQVcsRUFBRSxJQUFJLFFBQVEsRUFBRTtZQUM3QixXQUFXLEVBQUUsZ0NBQUksSUFBSSxHQUFFO1NBQ3hCO0lBQ0gsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxTQUFTLFdBQVc7UUFDbEIsSUFBTSxnQkFBZ0IsR0FBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDN0UsSUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDOUMsSUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO1lBQzFCLE9BQU8seUJBQWlCLENBQUM7U0FDMUI7UUFDRCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCBjaGFsayBmcm9tICdjaGFsayc7XG5pbXBvcnQge3Byb21wdH0gZnJvbSAnaW5xdWlyZXInO1xuXG5cbi8qKiBSZWV4cG9ydCBvZiBjaGFsayBjb2xvcnMgZm9yIGNvbnZlbmllbnQgYWNjZXNzLiAqL1xuZXhwb3J0IGNvbnN0IHJlZDogdHlwZW9mIGNoYWxrID0gY2hhbGsucmVkO1xuZXhwb3J0IGNvbnN0IGdyZWVuOiB0eXBlb2YgY2hhbGsgPSBjaGFsay5ncmVlbjtcbmV4cG9ydCBjb25zdCB5ZWxsb3c6IHR5cGVvZiBjaGFsayA9IGNoYWxrLnllbGxvdztcblxuLyoqIFByb21wdHMgdGhlIHVzZXIgd2l0aCBhIGNvbmZpcm1hdGlvbiBxdWVzdGlvbiBhbmQgYSBzcGVjaWZpZWQgbWVzc2FnZS4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm9tcHRDb25maXJtKG1lc3NhZ2U6IHN0cmluZywgZGVmYXVsdFZhbHVlID0gZmFsc2UpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgcmV0dXJuIChhd2FpdCBwcm9tcHQ8e3Jlc3VsdDogYm9vbGVhbn0+KHtcbiAgICAgICAgICAgdHlwZTogJ2NvbmZpcm0nLFxuICAgICAgICAgICBuYW1lOiAncmVzdWx0JyxcbiAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgICAgICAgZGVmYXVsdDogZGVmYXVsdFZhbHVlLFxuICAgICAgICAgfSkpXG4gICAgICAucmVzdWx0O1xufVxuXG4vKipcbiAqIFN1cHBvcnRlZCBsZXZlbHMgZm9yIGxvZ2dpbmcgZnVuY3Rpb25zLlxuICpcbiAqIExldmVscyBhcmUgbWFwcGVkIHRvIG51bWJlcnMgdG8gcmVwcmVzZW50IGEgaGllcmFyY2h5IG9mIGxvZ2dpbmcgbGV2ZWxzLlxuICovXG5leHBvcnQgZW51bSBMT0dfTEVWRUxTIHtcbiAgU0lMRU5UID0gMCxcbiAgRVJST1IgPSAxLFxuICBXQVJOID0gMixcbiAgTE9HID0gMyxcbiAgSU5GTyA9IDQsXG4gIERFQlVHID0gNSxcbn1cblxuLyoqIERlZmF1bHQgbG9nIGxldmVsIGZvciB0aGUgdG9vbC4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX0xPR19MRVZFTCA9IExPR19MRVZFTFMuSU5GTztcblxuLyoqIFdyaXRlIHRvIHRoZSBjb25zb2xlIGZvciBhdCBJTkZPIGxvZ2dpbmcgbGV2ZWwgKi9cbmV4cG9ydCBjb25zdCBpbmZvID0gYnVpbGRMb2dMZXZlbEZ1bmN0aW9uKCgpID0+IGNvbnNvbGUuaW5mbywgTE9HX0xFVkVMUy5JTkZPKTtcblxuLyoqIFdyaXRlIHRvIHRoZSBjb25zb2xlIGZvciBhdCBFUlJPUiBsb2dnaW5nIGxldmVsICovXG5leHBvcnQgY29uc3QgZXJyb3IgPSBidWlsZExvZ0xldmVsRnVuY3Rpb24oKCkgPT4gY29uc29sZS5lcnJvciwgTE9HX0xFVkVMUy5FUlJPUik7XG5cbi8qKiBXcml0ZSB0byB0aGUgY29uc29sZSBmb3IgYXQgREVCVUcgbG9nZ2luZyBsZXZlbCAqL1xuZXhwb3J0IGNvbnN0IGRlYnVnID0gYnVpbGRMb2dMZXZlbEZ1bmN0aW9uKCgpID0+IGNvbnNvbGUuZGVidWcsIExPR19MRVZFTFMuREVCVUcpO1xuXG4vKiogV3JpdGUgdG8gdGhlIGNvbnNvbGUgZm9yIGF0IExPRyBsb2dnaW5nIGxldmVsICovXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbnNvbGVcbmV4cG9ydCBjb25zdCBsb2cgPSBidWlsZExvZ0xldmVsRnVuY3Rpb24oKCkgPT4gY29uc29sZS5sb2csIExPR19MRVZFTFMuTE9HKTtcblxuLyoqIFdyaXRlIHRvIHRoZSBjb25zb2xlIGZvciBhdCBXQVJOIGxvZ2dpbmcgbGV2ZWwgKi9cbmV4cG9ydCBjb25zdCB3YXJuID0gYnVpbGRMb2dMZXZlbEZ1bmN0aW9uKCgpID0+IGNvbnNvbGUud2FybiwgTE9HX0xFVkVMUy5XQVJOKTtcblxuLyoqIEJ1aWxkIGFuIGluc3RhbmNlIG9mIGEgbG9nZ2luZyBmdW5jdGlvbiBmb3IgdGhlIHByb3ZpZGVkIGxldmVsLiAqL1xuZnVuY3Rpb24gYnVpbGRMb2dMZXZlbEZ1bmN0aW9uKGxvYWRDb21tYW5kOiAoKSA9PiBGdW5jdGlvbiwgbGV2ZWw6IExPR19MRVZFTFMpIHtcbiAgLyoqIFdyaXRlIHRvIHN0ZG91dCBmb3IgdGhlIExPR19MRVZFTC4gKi9cbiAgY29uc3QgbG9nZ2luZ0Z1bmN0aW9uID0gKC4uLnRleHQ6IHN0cmluZ1tdKSA9PiB7XG4gICAgcnVuQ29uc29sZUNvbW1hbmQobG9hZENvbW1hbmQsIGxldmVsLCAuLi50ZXh0KTtcbiAgfTtcblxuICAvKiogU3RhcnQgYSBncm91cCBhdCB0aGUgTE9HX0xFVkVMLCBvcHRpb25hbGx5IHN0YXJ0aW5nIGl0IGFzIGNvbGxhcHNlZC4gKi9cbiAgbG9nZ2luZ0Z1bmN0aW9uLmdyb3VwID0gKHRleHQ6IHN0cmluZywgY29sbGFwc2VkID0gZmFsc2UpID0+IHtcbiAgICBjb25zdCBjb21tYW5kID0gY29sbGFwc2VkID8gY29uc29sZS5ncm91cENvbGxhcHNlZCA6IGNvbnNvbGUuZ3JvdXA7XG4gICAgcnVuQ29uc29sZUNvbW1hbmQoKCkgPT4gY29tbWFuZCwgbGV2ZWwsIHRleHQpO1xuICB9O1xuXG4gIC8qKiBFbmQgdGhlIGdyb3VwIGF0IHRoZSBMT0dfTEVWRUwuICovXG4gIGxvZ2dpbmdGdW5jdGlvbi5ncm91cEVuZCA9ICgpID0+IHtcbiAgICBydW5Db25zb2xlQ29tbWFuZCgoKSA9PiBjb25zb2xlLmdyb3VwRW5kLCBsZXZlbCk7XG4gIH07XG5cbiAgcmV0dXJuIGxvZ2dpbmdGdW5jdGlvbjtcbn1cblxuLyoqXG4gKiBSdW4gdGhlIGNvbnNvbGUgY29tbWFuZCBwcm92aWRlZCwgaWYgdGhlIGVudmlyb25tZW50cyBsb2dnaW5nIGxldmVsIGdyZWF0ZXIgdGhhbiB0aGVcbiAqIHByb3ZpZGVkIGxvZ2dpbmcgbGV2ZWwuXG4gKlxuICogVGhlIGxvYWRDb21tYW5kIHRha2VzIGluIGEgZnVuY3Rpb24gd2hpY2ggaXMgY2FsbGVkIHRvIHJldHJpZXZlIHRoZSBjb25zb2xlLiogZnVuY3Rpb25cbiAqIHRvIGFsbG93IGZvciBqYXNtaW5lIHNwaWVzIHRvIHN0aWxsIHdvcmsgaW4gdGVzdGluZy4gIFdpdGhvdXQgdGhpcyBtZXRob2Qgb2YgcmV0cmlldmFsXG4gKiB0aGUgY29uc29sZS4qIGZ1bmN0aW9uLCB0aGUgZnVuY3Rpb24gaXMgc2F2ZWQgaW50byB0aGUgY2xvc3VyZSBvZiB0aGUgY3JlYXRlZCBsb2dnaW5nXG4gKiBmdW5jdGlvbiBiZWZvcmUgamFzbWluZSBjYW4gc3B5LlxuICovXG5mdW5jdGlvbiBydW5Db25zb2xlQ29tbWFuZChsb2FkQ29tbWFuZDogKCkgPT4gRnVuY3Rpb24sIGxvZ0xldmVsOiBMT0dfTEVWRUxTLCAuLi50ZXh0OiBzdHJpbmdbXSkge1xuICBpZiAoZ2V0TG9nTGV2ZWwoKSA+PSBsb2dMZXZlbCkge1xuICAgIGxvYWRDb21tYW5kKCkoLi4udGV4dCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXRyaWV2ZSB0aGUgbG9nIGxldmVsIGZyb20gZW52aXJvbm1lbnQgdmFyaWFibGVzLCBpZiB0aGUgdmFsdWUgZm91bmRcbiAqIGJhc2VkIG9uIHRoZSBMT0dfTEVWRUwgZW52aXJvbm1lbnQgdmFyaWFibGUgaXMgdW5kZWZpbmVkLCByZXR1cm4gdGhlIGRlZmF1bHRcbiAqIGxvZ2dpbmcgbGV2ZWwuXG4gKi9cbmZ1bmN0aW9uIGdldExvZ0xldmVsKCkge1xuICBjb25zdCBsb2dMZXZlbEVudlZhbHVlOiBhbnkgPSAocHJvY2Vzcy5lbnZbYExPR19MRVZFTGBdIHx8ICcnKS50b1VwcGVyQ2FzZSgpO1xuICBjb25zdCBsb2dMZXZlbCA9IExPR19MRVZFTFNbbG9nTGV2ZWxFbnZWYWx1ZV07XG4gIGlmIChsb2dMZXZlbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIERFRkFVTFRfTE9HX0xFVkVMO1xuICB9XG4gIHJldHVybiBsb2dMZXZlbDtcbn1cbiJdfQ==