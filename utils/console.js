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
        define("@angular/dev-infra-private/utils/console", ["require", "exports", "tslib", "chalk", "fs", "inquirer", "path", "@angular/dev-infra-private/utils/config"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.captureLogOutputForCommand = exports.warn = exports.log = exports.debug = exports.error = exports.info = exports.DEFAULT_LOG_LEVEL = exports.LOG_LEVELS = exports.promptInput = exports.promptConfirm = exports.blue = exports.bold = exports.yellow = exports.green = exports.red = void 0;
    var tslib_1 = require("tslib");
    var chalk_1 = require("chalk");
    var fs_1 = require("fs");
    var inquirer_1 = require("inquirer");
    var path_1 = require("path");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    /** Reexport of chalk colors for convenient access. */
    exports.red = chalk_1.default.red;
    exports.green = chalk_1.default.green;
    exports.yellow = chalk_1.default.yellow;
    exports.bold = chalk_1.default.bold;
    exports.blue = chalk_1.default.blue;
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
    /** Prompts the user for one line of input. */
    function promptInput(message) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, inquirer_1.prompt({ type: 'input', name: 'result', message: message })];
                    case 1: return [2 /*return*/, (_a.sent()).result];
                }
            });
        });
    }
    exports.promptInput = promptInput;
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
            runConsoleCommand.apply(void 0, tslib_1.__spreadArray([loadCommand, level], tslib_1.__read(text)));
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
            loadCommand().apply(void 0, tslib_1.__spreadArray([], tslib_1.__read(text)));
        }
        printToLogFile.apply(void 0, tslib_1.__spreadArray([logLevel], tslib_1.__read(text)));
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
    /** All text to write to the log file. */
    var LOGGED_TEXT = '';
    /** Whether file logging as been enabled. */
    var FILE_LOGGING_ENABLED = false;
    /**
     * The number of columns used in the prepended log level information on each line of the logging
     * output file.
     */
    var LOG_LEVEL_COLUMNS = 7;
    /**
     * Enable writing the logged outputs to the log file on process exit, sets initial lines from the
     * command execution, containing information about the timing and command parameters.
     *
     * This is expected to be called only once during a command run, and should be called by the
     * middleware of yargs to enable the file logging before the rest of the command parsing and
     * response is executed.
     */
    function captureLogOutputForCommand(argv) {
        if (FILE_LOGGING_ENABLED) {
            throw Error('`captureLogOutputForCommand` cannot be called multiple times');
        }
        /** The date time used for timestamping when the command was invoked. */
        var now = new Date();
        /** Header line to separate command runs in log files. */
        var headerLine = Array(100).fill('#').join('');
        LOGGED_TEXT += headerLine + "\nCommand: " + argv.$0 + " " + argv._.join(' ') + "\nRan at: " + now + "\n";
        // On process exit, write the logged output to the appropriate log files
        process.on('exit', function (code) {
            LOGGED_TEXT += headerLine + "\n";
            LOGGED_TEXT += "Command ran in " + (new Date().getTime() - now.getTime()) + "ms\n";
            LOGGED_TEXT += "Exit Code: " + code + "\n";
            /** Path to the log file location. */
            var logFilePath = path_1.join(config_1.getRepoBaseDir(), '.ng-dev.log');
            // Strip ANSI escape codes from log outputs.
            LOGGED_TEXT = LOGGED_TEXT.replace(/\x1B\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]/g, '');
            fs_1.writeFileSync(logFilePath, LOGGED_TEXT);
            // For failure codes greater than 1, the new logged lines should be written to a specific log
            // file for the command run failure.
            if (code > 1) {
                var logFileName = ".ng-dev.err-" + now.getTime() + ".log";
                console.error("Exit code: " + code + ". Writing full log to " + logFileName);
                fs_1.writeFileSync(path_1.join(config_1.getRepoBaseDir(), logFileName), LOGGED_TEXT);
            }
        });
        // Mark file logging as enabled to prevent the function from executing multiple times.
        FILE_LOGGING_ENABLED = true;
    }
    exports.captureLogOutputForCommand = captureLogOutputForCommand;
    /** Write the provided text to the log file, prepending each line with the log level.  */
    function printToLogFile(logLevel) {
        var text = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            text[_i - 1] = arguments[_i];
        }
        var logLevelText = (LOG_LEVELS[logLevel] + ":").padEnd(LOG_LEVEL_COLUMNS);
        LOGGED_TEXT += text.join(' ').split('\n').map(function (l) { return logLevelText + " " + l + "\n"; }).join('');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9jb25zb2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBMEI7SUFDMUIseUJBQWlDO0lBQ2pDLHFDQUFnQztJQUNoQyw2QkFBMEI7SUFHMUIsa0VBQXdDO0lBRXhDLHNEQUFzRDtJQUN6QyxRQUFBLEdBQUcsR0FBaUIsZUFBSyxDQUFDLEdBQUcsQ0FBQztJQUM5QixRQUFBLEtBQUssR0FBaUIsZUFBSyxDQUFDLEtBQUssQ0FBQztJQUNsQyxRQUFBLE1BQU0sR0FBaUIsZUFBSyxDQUFDLE1BQU0sQ0FBQztJQUNwQyxRQUFBLElBQUksR0FBaUIsZUFBSyxDQUFDLElBQUksQ0FBQztJQUNoQyxRQUFBLElBQUksR0FBaUIsZUFBSyxDQUFDLElBQUksQ0FBQztJQUU3Qyw2RUFBNkU7SUFDN0UsU0FBc0IsYUFBYSxDQUFDLE9BQWUsRUFBRSxZQUFvQjtRQUFwQiw2QkFBQSxFQUFBLG9CQUFvQjs7Ozs0QkFDL0QscUJBQU0saUJBQU0sQ0FBb0I7NEJBQy9CLElBQUksRUFBRSxTQUFTOzRCQUNmLElBQUksRUFBRSxRQUFROzRCQUNkLE9BQU8sRUFBRSxPQUFPOzRCQUNoQixPQUFPLEVBQUUsWUFBWTt5QkFDdEIsQ0FBQyxFQUFBOzRCQUxULHNCQUFPLENBQUMsU0FLQyxDQUFDOzZCQUNMLE1BQU0sRUFBQzs7OztLQUNiO0lBUkQsc0NBUUM7SUFFRCw4Q0FBOEM7SUFDOUMsU0FBc0IsV0FBVyxDQUFDLE9BQWU7Ozs7NEJBQ3ZDLHFCQUFNLGlCQUFNLENBQW1CLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sU0FBQSxFQUFDLENBQUMsRUFBQTs0QkFBaEYsc0JBQU8sQ0FBQyxTQUF3RSxDQUFDLENBQUMsTUFBTSxFQUFDOzs7O0tBQzFG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c291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCBjaGFsayBmcm9tICdjaGFsayc7XG5pbXBvcnQge3dyaXRlRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7cHJvbXB0fSBmcm9tICdpbnF1aXJlcic7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtBcmd1bWVudHN9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtnZXRSZXBvQmFzZURpcn0gZnJvbSAnLi9jb25maWcnO1xuXG4vKiogUmVleHBvcnQgb2YgY2hhbGsgY29sb3JzIGZvciBjb252ZW5pZW50IGFjY2Vzcy4gKi9cbmV4cG9ydCBjb25zdCByZWQ6IHR5cGVvZiBjaGFsayA9IGNoYWxrLnJlZDtcbmV4cG9ydCBjb25zdCBncmVlbjogdHlwZW9mIGNoYWxrID0gY2hhbGsuZ3JlZW47XG5leHBvcnQgY29uc3QgeWVsbG93OiB0eXBlb2YgY2hhbGsgPSBjaGFsay55ZWxsb3c7XG5leHBvcnQgY29uc3QgYm9sZDogdHlwZW9mIGNoYWxrID0gY2hhbGsuYm9sZDtcbmV4cG9ydCBjb25zdCBibHVlOiB0eXBlb2YgY2hhbGsgPSBjaGFsay5ibHVlO1xuXG4vKiogUHJvbXB0cyB0aGUgdXNlciB3aXRoIGEgY29uZmlybWF0aW9uIHF1ZXN0aW9uIGFuZCBhIHNwZWNpZmllZCBtZXNzYWdlLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByb21wdENvbmZpcm0obWVzc2FnZTogc3RyaW5nLCBkZWZhdWx0VmFsdWUgPSBmYWxzZSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICByZXR1cm4gKGF3YWl0IHByb21wdDx7cmVzdWx0OiBib29sZWFufT4oe1xuICAgICAgICAgICB0eXBlOiAnY29uZmlybScsXG4gICAgICAgICAgIG5hbWU6ICdyZXN1bHQnLFxuICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgICAgICBkZWZhdWx0OiBkZWZhdWx0VmFsdWUsXG4gICAgICAgICB9KSlcbiAgICAgIC5yZXN1bHQ7XG59XG5cbi8qKiBQcm9tcHRzIHRoZSB1c2VyIGZvciBvbmUgbGluZSBvZiBpbnB1dC4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm9tcHRJbnB1dChtZXNzYWdlOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gKGF3YWl0IHByb21wdDx7cmVzdWx0OiBzdHJpbmd9Pih7dHlwZTogJ2lucHV0JywgbmFtZTogJ3Jlc3VsdCcsIG1lc3NhZ2V9KSkucmVzdWx0O1xufVxuXG4vKipcbiAqIFN1cHBvcnRlZCBsZXZlbHMgZm9yIGxvZ2dpbmcgZnVuY3Rpb25zLlxuICpcbiAqIExldmVscyBhcmUgbWFwcGVkIHRvIG51bWJlcnMgdG8gcmVwcmVzZW50IGEgaGllcmFyY2h5IG9mIGxvZ2dpbmcgbGV2ZWxzLlxuICovXG5leHBvcnQgZW51bSBMT0dfTEVWRUxTIHtcbiAgU0lMRU5UID0gMCxcbiAgRVJST1IgPSAxLFxuICBXQVJOID0gMixcbiAgTE9HID0gMyxcbiAgSU5GTyA9IDQsXG4gIERFQlVHID0gNSxcbn1cblxuLyoqIERlZmF1bHQgbG9nIGxldmVsIGZvciB0aGUgdG9vbC4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX0xPR19MRVZFTCA9IExPR19MRVZFTFMuSU5GTztcblxuLyoqIFdyaXRlIHRvIHRoZSBjb25zb2xlIGZvciBhdCBJTkZPIGxvZ2dpbmcgbGV2ZWwgKi9cbmV4cG9ydCBjb25zdCBpbmZvID0gYnVpbGRMb2dMZXZlbEZ1bmN0aW9uKCgpID0+IGNvbnNvbGUuaW5mbywgTE9HX0xFVkVMUy5JTkZPKTtcblxuLyoqIFdyaXRlIHRvIHRoZSBjb25zb2xlIGZvciBhdCBFUlJPUiBsb2dnaW5nIGxldmVsICovXG5leHBvcnQgY29uc3QgZXJyb3IgPSBidWlsZExvZ0xldmVsRnVuY3Rpb24oKCkgPT4gY29uc29sZS5lcnJvciwgTE9HX0xFVkVMUy5FUlJPUik7XG5cbi8qKiBXcml0ZSB0byB0aGUgY29uc29sZSBmb3IgYXQgREVCVUcgbG9nZ2luZyBsZXZlbCAqL1xuZXhwb3J0IGNvbnN0IGRlYnVnID0gYnVpbGRMb2dMZXZlbEZ1bmN0aW9uKCgpID0+IGNvbnNvbGUuZGVidWcsIExPR19MRVZFTFMuREVCVUcpO1xuXG4vKiogV3JpdGUgdG8gdGhlIGNvbnNvbGUgZm9yIGF0IExPRyBsb2dnaW5nIGxldmVsICovXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbnNvbGVcbmV4cG9ydCBjb25zdCBsb2cgPSBidWlsZExvZ0xldmVsRnVuY3Rpb24oKCkgPT4gY29uc29sZS5sb2csIExPR19MRVZFTFMuTE9HKTtcblxuLyoqIFdyaXRlIHRvIHRoZSBjb25zb2xlIGZvciBhdCBXQVJOIGxvZ2dpbmcgbGV2ZWwgKi9cbmV4cG9ydCBjb25zdCB3YXJuID0gYnVpbGRMb2dMZXZlbEZ1bmN0aW9uKCgpID0+IGNvbnNvbGUud2FybiwgTE9HX0xFVkVMUy5XQVJOKTtcblxuLyoqIEJ1aWxkIGFuIGluc3RhbmNlIG9mIGEgbG9nZ2luZyBmdW5jdGlvbiBmb3IgdGhlIHByb3ZpZGVkIGxldmVsLiAqL1xuZnVuY3Rpb24gYnVpbGRMb2dMZXZlbEZ1bmN0aW9uKGxvYWRDb21tYW5kOiAoKSA9PiBGdW5jdGlvbiwgbGV2ZWw6IExPR19MRVZFTFMpIHtcbiAgLyoqIFdyaXRlIHRvIHN0ZG91dCBmb3IgdGhlIExPR19MRVZFTC4gKi9cbiAgY29uc3QgbG9nZ2luZ0Z1bmN0aW9uID0gKC4uLnRleHQ6IHN0cmluZ1tdKSA9PiB7XG4gICAgcnVuQ29uc29sZUNvbW1hbmQobG9hZENvbW1hbmQsIGxldmVsLCAuLi50ZXh0KTtcbiAgfTtcblxuICAvKiogU3RhcnQgYSBncm91cCBhdCB0aGUgTE9HX0xFVkVMLCBvcHRpb25hbGx5IHN0YXJ0aW5nIGl0IGFzIGNvbGxhcHNlZC4gKi9cbiAgbG9nZ2luZ0Z1bmN0aW9uLmdyb3VwID0gKHRleHQ6IHN0cmluZywgY29sbGFwc2VkID0gZmFsc2UpID0+IHtcbiAgICBjb25zdCBjb21tYW5kID0gY29sbGFwc2VkID8gY29uc29sZS5ncm91cENvbGxhcHNlZCA6IGNvbnNvbGUuZ3JvdXA7XG4gICAgcnVuQ29uc29sZUNvbW1hbmQoKCkgPT4gY29tbWFuZCwgbGV2ZWwsIHRleHQpO1xuICB9O1xuXG4gIC8qKiBFbmQgdGhlIGdyb3VwIGF0IHRoZSBMT0dfTEVWRUwuICovXG4gIGxvZ2dpbmdGdW5jdGlvbi5ncm91cEVuZCA9ICgpID0+IHtcbiAgICBydW5Db25zb2xlQ29tbWFuZCgoKSA9PiBjb25zb2xlLmdyb3VwRW5kLCBsZXZlbCk7XG4gIH07XG5cbiAgcmV0dXJuIGxvZ2dpbmdGdW5jdGlvbjtcbn1cblxuLyoqXG4gKiBSdW4gdGhlIGNvbnNvbGUgY29tbWFuZCBwcm92aWRlZCwgaWYgdGhlIGVudmlyb25tZW50cyBsb2dnaW5nIGxldmVsIGdyZWF0ZXIgdGhhbiB0aGVcbiAqIHByb3ZpZGVkIGxvZ2dpbmcgbGV2ZWwuXG4gKlxuICogVGhlIGxvYWRDb21tYW5kIHRha2VzIGluIGEgZnVuY3Rpb24gd2hpY2ggaXMgY2FsbGVkIHRvIHJldHJpZXZlIHRoZSBjb25zb2xlLiogZnVuY3Rpb25cbiAqIHRvIGFsbG93IGZvciBqYXNtaW5lIHNwaWVzIHRvIHN0aWxsIHdvcmsgaW4gdGVzdGluZy4gIFdpdGhvdXQgdGhpcyBtZXRob2Qgb2YgcmV0cmlldmFsXG4gKiB0aGUgY29uc29sZS4qIGZ1bmN0aW9uLCB0aGUgZnVuY3Rpb24gaXMgc2F2ZWQgaW50byB0aGUgY2xvc3VyZSBvZiB0aGUgY3JlYXRlZCBsb2dnaW5nXG4gKiBmdW5jdGlvbiBiZWZvcmUgamFzbWluZSBjYW4gc3B5LlxuICovXG5mdW5jdGlvbiBydW5Db25zb2xlQ29tbWFuZChsb2FkQ29tbWFuZDogKCkgPT4gRnVuY3Rpb24sIGxvZ0xldmVsOiBMT0dfTEVWRUxTLCAuLi50ZXh0OiBzdHJpbmdbXSkge1xuICBpZiAoZ2V0TG9nTGV2ZWwoKSA+PSBsb2dMZXZlbCkge1xuICAgIGxvYWRDb21tYW5kKCkoLi4udGV4dCk7XG4gIH1cbiAgcHJpbnRUb0xvZ0ZpbGUobG9nTGV2ZWwsIC4uLnRleHQpO1xufVxuXG4vKipcbiAqIFJldHJpZXZlIHRoZSBsb2cgbGV2ZWwgZnJvbSBlbnZpcm9ubWVudCB2YXJpYWJsZXMsIGlmIHRoZSB2YWx1ZSBmb3VuZFxuICogYmFzZWQgb24gdGhlIExPR19MRVZFTCBlbnZpcm9ubWVudCB2YXJpYWJsZSBpcyB1bmRlZmluZWQsIHJldHVybiB0aGUgZGVmYXVsdFxuICogbG9nZ2luZyBsZXZlbC5cbiAqL1xuZnVuY3Rpb24gZ2V0TG9nTGV2ZWwoKSB7XG4gIGNvbnN0IGxvZ0xldmVsRW52VmFsdWU6IGFueSA9IChwcm9jZXNzLmVudltgTE9HX0xFVkVMYF0gfHwgJycpLnRvVXBwZXJDYXNlKCk7XG4gIGNvbnN0IGxvZ0xldmVsID0gTE9HX0xFVkVMU1tsb2dMZXZlbEVudlZhbHVlXTtcbiAgaWYgKGxvZ0xldmVsID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gREVGQVVMVF9MT0dfTEVWRUw7XG4gIH1cbiAgcmV0dXJuIGxvZ0xldmVsO1xufVxuXG4vKiogQWxsIHRleHQgdG8gd3JpdGUgdG8gdGhlIGxvZyBmaWxlLiAqL1xubGV0IExPR0dFRF9URVhUID0gJyc7XG4vKiogV2hldGhlciBmaWxlIGxvZ2dpbmcgYXMgYmVlbiBlbmFibGVkLiAqL1xubGV0IEZJTEVfTE9HR0lOR19FTkFCTEVEID0gZmFsc2U7XG4vKipcbiAqIFRoZSBudW1iZXIgb2YgY29sdW1ucyB1c2VkIGluIHRoZSBwcmVwZW5kZWQgbG9nIGxldmVsIGluZm9ybWF0aW9uIG9uIGVhY2ggbGluZSBvZiB0aGUgbG9nZ2luZ1xuICogb3V0cHV0IGZpbGUuXG4gKi9cbmNvbnN0IExPR19MRVZFTF9DT0xVTU5TID0gNztcblxuLyoqXG4gKiBFbmFibGUgd3JpdGluZyB0aGUgbG9nZ2VkIG91dHB1dHMgdG8gdGhlIGxvZyBmaWxlIG9uIHByb2Nlc3MgZXhpdCwgc2V0cyBpbml0aWFsIGxpbmVzIGZyb20gdGhlXG4gKiBjb21tYW5kIGV4ZWN1dGlvbiwgY29udGFpbmluZyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgdGltaW5nIGFuZCBjb21tYW5kIHBhcmFtZXRlcnMuXG4gKlxuICogVGhpcyBpcyBleHBlY3RlZCB0byBiZSBjYWxsZWQgb25seSBvbmNlIGR1cmluZyBhIGNvbW1hbmQgcnVuLCBhbmQgc2hvdWxkIGJlIGNhbGxlZCBieSB0aGVcbiAqIG1pZGRsZXdhcmUgb2YgeWFyZ3MgdG8gZW5hYmxlIHRoZSBmaWxlIGxvZ2dpbmcgYmVmb3JlIHRoZSByZXN0IG9mIHRoZSBjb21tYW5kIHBhcnNpbmcgYW5kXG4gKiByZXNwb25zZSBpcyBleGVjdXRlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhcHR1cmVMb2dPdXRwdXRGb3JDb21tYW5kKGFyZ3Y6IEFyZ3VtZW50cykge1xuICBpZiAoRklMRV9MT0dHSU5HX0VOQUJMRUQpIHtcbiAgICB0aHJvdyBFcnJvcignYGNhcHR1cmVMb2dPdXRwdXRGb3JDb21tYW5kYCBjYW5ub3QgYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzJyk7XG4gIH1cbiAgLyoqIFRoZSBkYXRlIHRpbWUgdXNlZCBmb3IgdGltZXN0YW1waW5nIHdoZW4gdGhlIGNvbW1hbmQgd2FzIGludm9rZWQuICovXG4gIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG4gIC8qKiBIZWFkZXIgbGluZSB0byBzZXBhcmF0ZSBjb21tYW5kIHJ1bnMgaW4gbG9nIGZpbGVzLiAqL1xuICBjb25zdCBoZWFkZXJMaW5lID0gQXJyYXkoMTAwKS5maWxsKCcjJykuam9pbignJyk7XG4gIExPR0dFRF9URVhUICs9IGAke2hlYWRlckxpbmV9XFxuQ29tbWFuZDogJHthcmd2LiQwfSAke2FyZ3YuXy5qb2luKCcgJyl9XFxuUmFuIGF0OiAke25vd31cXG5gO1xuXG4gIC8vIE9uIHByb2Nlc3MgZXhpdCwgd3JpdGUgdGhlIGxvZ2dlZCBvdXRwdXQgdG8gdGhlIGFwcHJvcHJpYXRlIGxvZyBmaWxlc1xuICBwcm9jZXNzLm9uKCdleGl0JywgKGNvZGU6IG51bWJlcikgPT4ge1xuICAgIExPR0dFRF9URVhUICs9IGAke2hlYWRlckxpbmV9XFxuYDtcbiAgICBMT0dHRURfVEVYVCArPSBgQ29tbWFuZCByYW4gaW4gJHtuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIG5vdy5nZXRUaW1lKCl9bXNcXG5gO1xuICAgIExPR0dFRF9URVhUICs9IGBFeGl0IENvZGU6ICR7Y29kZX1cXG5gO1xuICAgIC8qKiBQYXRoIHRvIHRoZSBsb2cgZmlsZSBsb2NhdGlvbi4gKi9cbiAgICBjb25zdCBsb2dGaWxlUGF0aCA9IGpvaW4oZ2V0UmVwb0Jhc2VEaXIoKSwgJy5uZy1kZXYubG9nJyk7XG5cbiAgICAvLyBTdHJpcCBBTlNJIGVzY2FwZSBjb2RlcyBmcm9tIGxvZyBvdXRwdXRzLlxuICAgIExPR0dFRF9URVhUID0gTE9HR0VEX1RFWFQucmVwbGFjZSgvXFx4MUJcXFsoWzAtOV17MSwzfSg7WzAtOV17MSwyfSk/KT9bbUdLXS9nLCAnJyk7XG5cbiAgICB3cml0ZUZpbGVTeW5jKGxvZ0ZpbGVQYXRoLCBMT0dHRURfVEVYVCk7XG5cbiAgICAvLyBGb3IgZmFpbHVyZSBjb2RlcyBncmVhdGVyIHRoYW4gMSwgdGhlIG5ldyBsb2dnZWQgbGluZXMgc2hvdWxkIGJlIHdyaXR0ZW4gdG8gYSBzcGVjaWZpYyBsb2dcbiAgICAvLyBmaWxlIGZvciB0aGUgY29tbWFuZCBydW4gZmFpbHVyZS5cbiAgICBpZiAoY29kZSA+IDEpIHtcbiAgICAgIGNvbnN0IGxvZ0ZpbGVOYW1lID0gYC5uZy1kZXYuZXJyLSR7bm93LmdldFRpbWUoKX0ubG9nYDtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYEV4aXQgY29kZTogJHtjb2RlfS4gV3JpdGluZyBmdWxsIGxvZyB0byAke2xvZ0ZpbGVOYW1lfWApO1xuICAgICAgd3JpdGVGaWxlU3luYyhqb2luKGdldFJlcG9CYXNlRGlyKCksIGxvZ0ZpbGVOYW1lKSwgTE9HR0VEX1RFWFQpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gTWFyayBmaWxlIGxvZ2dpbmcgYXMgZW5hYmxlZCB0byBwcmV2ZW50IHRoZSBmdW5jdGlvbiBmcm9tIGV4ZWN1dGluZyBtdWx0aXBsZSB0aW1lcy5cbiAgRklMRV9MT0dHSU5HX0VOQUJMRUQgPSB0cnVlO1xufVxuXG4vKiogV3JpdGUgdGhlIHByb3ZpZGVkIHRleHQgdG8gdGhlIGxvZyBmaWxlLCBwcmVwZW5kaW5nIGVhY2ggbGluZSB3aXRoIHRoZSBsb2cgbGV2ZWwuICAqL1xuZnVuY3Rpb24gcHJpbnRUb0xvZ0ZpbGUobG9nTGV2ZWw6IExPR19MRVZFTFMsIC4uLnRleHQ6IHN0cmluZ1tdKSB7XG4gIGNvbnN0IGxvZ0xldmVsVGV4dCA9IGAke0xPR19MRVZFTFNbbG9nTGV2ZWxdfTpgLnBhZEVuZChMT0dfTEVWRUxfQ09MVU1OUyk7XG4gIExPR0dFRF9URVhUICs9IHRleHQuam9pbignICcpLnNwbGl0KCdcXG4nKS5tYXAobCA9PiBgJHtsb2dMZXZlbFRleHR9ICR7bH1cXG5gKS5qb2luKCcnKTtcbn1cbiJdfQ==