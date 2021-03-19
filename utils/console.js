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
        define("@angular/dev-infra-private/utils/console", ["require", "exports", "tslib", "chalk", "fs", "inquirer", "inquirer-autocomplete-prompt", "path", "@angular/dev-infra-private/utils/config"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.captureLogOutputForCommand = exports.warn = exports.log = exports.debug = exports.error = exports.info = exports.DEFAULT_LOG_LEVEL = exports.LOG_LEVELS = exports.promptInput = exports.promptAutocomplete = exports.promptConfirm = exports.blue = exports.bold = exports.yellow = exports.green = exports.red = void 0;
    var tslib_1 = require("tslib");
    var chalk_1 = require("chalk");
    var fs_1 = require("fs");
    var inquirer_1 = require("inquirer");
    var inquirerAutocomplete = require("inquirer-autocomplete-prompt");
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
    function promptAutocomplete(message, choices, noChoiceText) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var prompt, result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prompt = inquirer_1.createPromptModule({}).registerPrompt('autocomplete', inquirerAutocomplete);
                        if (noChoiceText) {
                            choices = tslib_1.__spreadArray([noChoiceText], tslib_1.__read(choices));
                        }
                        return [4 /*yield*/, prompt({
                                type: 'autocomplete',
                                name: 'result',
                                message: message,
                                source: function (_, input) {
                                    if (!input) {
                                        return Promise.resolve(choices);
                                    }
                                    return Promise.resolve(choices.filter(function (choice) {
                                        if (typeof choice === 'string') {
                                            return choice.includes(input);
                                        }
                                        return choice.name.includes(input);
                                    }));
                                }
                            })];
                    case 1:
                        result = (_a.sent()).result;
                        if (result === noChoiceText) {
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    }
    exports.promptAutocomplete = promptAutocomplete;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9jb25zb2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBMEI7SUFDMUIseUJBQWlDO0lBQ2pDLHFDQUF1RTtJQUN2RSxtRUFBcUU7SUFDckUsNkJBQTBCO0lBRzFCLGtFQUF3QztJQUV4QyxzREFBc0Q7SUFDekMsUUFBQSxHQUFHLEdBQWlCLGVBQUssQ0FBQyxHQUFHLENBQUM7SUFDOUIsUUFBQSxLQUFLLEdBQWlCLGVBQUssQ0FBQyxLQUFLLENBQUM7SUFDbEMsUUFBQSxNQUFNLEdBQWlCLGVBQUssQ0FBQyxNQUFNLENBQUM7SUFDcEMsUUFBQSxJQUFJLEdBQWlCLGVBQUssQ0FBQyxJQUFJLENBQUM7SUFDaEMsUUFBQSxJQUFJLEdBQWlCLGVBQUssQ0FBQyxJQUFJLENBQUM7SUFFN0MsNkVBQTZFO0lBQzdFLFNBQXNCLGFBQWEsQ0FBQyxPQUFlLEVBQUUsWUFBb0I7UUFBcEIsNkJBQUEsRUFBQSxvQkFBb0I7Ozs7NEJBQy9ELHFCQUFNLGlCQUFNLENBQW9COzRCQUMvQixJQUFJLEVBQUUsU0FBUzs0QkFDZixJQUFJLEVBQUUsUUFBUTs0QkFDZCxPQUFPLEVBQUUsT0FBTzs0QkFDaEIsT0FBTyxFQUFFLFlBQVk7eUJBQ3RCLENBQUMsRUFBQTs0QkFMVCxzQkFBTyxDQUFDLFNBS0MsQ0FBQzs2QkFDTCxNQUFNLEVBQUM7Ozs7S0FDYjtJQVJELHNDQVFDO0lBWUQsU0FBc0Isa0JBQWtCLENBQ3BDLE9BQWUsRUFBRSxPQUFxQyxFQUN0RCxZQUFxQjs7Ozs7O3dCQUVqQixNQUFNLEdBQUcsNkJBQWtCLENBQUMsRUFBRSxDQUFDLENBQUMsY0FBYyxDQUFDLGNBQWMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO3dCQUMzRixJQUFJLFlBQVksRUFBRTs0QkFDaEIsT0FBTywwQkFB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QUUxRCw0Q0FBNEM7WUFDNUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMseUNBQXlDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFakYsa0JBQWEsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFFeEMsNkZBQTZGO1lBQzdGLG9DQUFvQztZQUNwQyxJQUFJLElBQUksR0FBRyxDQUFDLEVBQUU7Z0JBQ1osSUFBTSxXQUFXLEdBQUcsaUJBQWUsR0FBRyxDQUFDLE9BQU8sRUFBRSxTQUFNLENBQUM7Z0JBQ3ZELE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0JBQWMsSUFBSSw4QkFBeUIsV0FBYSxDQUFDLENBQUM7Z0JBQ3hFLGtCQUFhLENBQUMsV0FBSSxDQUFDLHVCQUFjLEVBQUUsRUFBRSxXQUFXLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQzthQUNqRTtRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsc0ZBQXNGO1FBQ3RGLG9CQUFvQixHQUFHLElBQUksQ0FBQztJQUM5QixDQUFDO0lBbENELGdFQWtDQztJQUVELHlGQUF5RjtJQUN6RixTQUFTLGNBQWMsQ0FBQyxRQUFvQjtRQUFFLGNBQWlCO2FBQWpCLFVBQWlCLEVBQWpCLHFCQUFpQixFQUFqQixJQUFpQjtZQUFqQiw2QkFBaUI7O1FBQzdELElBQU0sWUFBWSxHQUFHLENBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxNQUFHLENBQUEsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUMxRSxXQUFXLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUcsWUFBWSxTQUFJLENBQUMsT0FBSSxFQUF4QixDQUF3QixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3hGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IGNoYWxrIGZyb20gJ2NoYWxrJztcbmltcG9ydCB7d3JpdGVGaWxlU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IHtjcmVhdGVQcm9tcHRNb2R1bGUsIExpc3RDaG9pY2VPcHRpb25zLCBwcm9tcHR9IGZyb20gJ2lucXVpcmVyJztcbmltcG9ydCAqIGFzIGlucXVpcmVyQXV0b2NvbXBsZXRlIGZyb20gJ2lucXVpcmVyLWF1dG9jb21wbGV0ZS1wcm9tcHQnO1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCB7QXJndW1lbnRzfSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7Z2V0UmVwb0Jhc2VEaXJ9IGZyb20gJy4vY29uZmlnJztcblxuLyoqIFJlZXhwb3J0IG9mIGNoYWxrIGNvbG9ycyBmb3IgY29udmVuaWVudCBhY2Nlc3MuICovXG5leHBvcnQgY29uc3QgcmVkOiB0eXBlb2YgY2hhbGsgPSBjaGFsay5yZWQ7XG5leHBvcnQgY29uc3QgZ3JlZW46IHR5cGVvZiBjaGFsayA9IGNoYWxrLmdyZWVuO1xuZXhwb3J0IGNvbnN0IHllbGxvdzogdHlwZW9mIGNoYWxrID0gY2hhbGsueWVsbG93O1xuZXhwb3J0IGNvbnN0IGJvbGQ6IHR5cGVvZiBjaGFsayA9IGNoYWxrLmJvbGQ7XG5leHBvcnQgY29uc3QgYmx1ZTogdHlwZW9mIGNoYWxrID0gY2hhbGsuYmx1ZTtcblxuLyoqIFByb21wdHMgdGhlIHVzZXIgd2l0aCBhIGNvbmZpcm1hdGlvbiBxdWVzdGlvbiBhbmQgYSBzcGVjaWZpZWQgbWVzc2FnZS4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm9tcHRDb25maXJtKG1lc3NhZ2U6IHN0cmluZywgZGVmYXVsdFZhbHVlID0gZmFsc2UpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgcmV0dXJuIChhd2FpdCBwcm9tcHQ8e3Jlc3VsdDogYm9vbGVhbn0+KHtcbiAgICAgICAgICAgdHlwZTogJ2NvbmZpcm0nLFxuICAgICAgICAgICBuYW1lOiAncmVzdWx0JyxcbiAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgICAgICAgZGVmYXVsdDogZGVmYXVsdFZhbHVlLFxuICAgICAgICAgfSkpXG4gICAgICAucmVzdWx0O1xufVxuXG4vKiogUHJvbXB0cyB0aGUgdXNlciB0byBzZWxlY3QgYW4gb3B0aW9uIGZyb20gYSBmaWx0ZXJhYmxlIGF1dG9jb21wbGV0ZSBsaXN0LiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByb21wdEF1dG9jb21wbGV0ZShcbiAgICBtZXNzYWdlOiBzdHJpbmcsIGNob2ljZXM6IChzdHJpbmd8TGlzdENob2ljZU9wdGlvbnMpW10pOiBQcm9taXNlPHN0cmluZz47XG4vKipcbiAqIFByb21wdHMgdGhlIHVzZXIgdG8gc2VsZWN0IGFuIG9wdGlvbiBmcm9tIGEgZmlsdGVyYWJsZSBhdXRvY29tcGxldGUgbGlzdCwgd2l0aCBhbiBvcHRpb24gdG9cbiAqIGNob29zZSBubyB2YWx1ZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByb21wdEF1dG9jb21wbGV0ZShcbiAgICBtZXNzYWdlOiBzdHJpbmcsIGNob2ljZXM6IChzdHJpbmd8TGlzdENob2ljZU9wdGlvbnMpW10sXG4gICAgbm9DaG9pY2VUZXh0Pzogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmd8ZmFsc2U+O1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByb21wdEF1dG9jb21wbGV0ZShcbiAgICBtZXNzYWdlOiBzdHJpbmcsIGNob2ljZXM6IChzdHJpbmd8TGlzdENob2ljZU9wdGlvbnMpW10sXG4gICAgbm9DaG9pY2VUZXh0Pzogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmd8ZmFsc2U+IHtcbiAgLy8gQ3JlYXRlcyBhIGxvY2FsIHByb21wdCBtb2R1bGUgd2l0aCBhbiBhdXRvY29tcGxldGUgcHJvbXB0IHR5cGUuXG4gIGNvbnN0IHByb21wdCA9IGNyZWF0ZVByb21wdE1vZHVsZSh7fSkucmVnaXN0ZXJQcm9tcHQoJ2F1dG9jb21wbGV0ZScsIGlucXVpcmVyQXV0b2NvbXBsZXRlKTtcbiAgaWYgKG5vQ2hvaWNlVGV4dCkge1xuICAgIGNob2ljZXMgPSBbbm9DaG9pY2VUZXh0LCAuLi5jaG9pY2VzXTtcbiAgfVxuICAvLyBgcHJvbXB0YCBtdXN0IGJlIGNhc3QgYXMgYGFueWAgYXMgdGhlIGF1dG9jb21wbGV0ZSB0eXBpbmdzIGFyZSBub3QgYXZhaWxhYmxlLlxuICBjb25zdCByZXN1bHQgPSAoYXdhaXQgKHByb21wdCBhcyBhbnkpKHtcbiAgICAgICAgICAgICAgICAgICB0eXBlOiAnYXV0b2NvbXBsZXRlJyxcbiAgICAgICAgICAgICAgICAgICBuYW1lOiAncmVzdWx0JyxcbiAgICAgICAgICAgICAgICAgICBtZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgIHNvdXJjZTogKF86IGFueSwgaW5wdXQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgaWYgKCFpbnB1dCkge1xuICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNob2ljZXMpO1xuICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjaG9pY2VzLmZpbHRlcihjaG9pY2UgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNob2ljZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2hvaWNlLmluY2x1ZGVzKGlucHV0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2hvaWNlLm5hbWUhLmluY2x1ZGVzKGlucHV0KTtcbiAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgIH0pKS5yZXN1bHQ7XG4gIGlmIChyZXN1bHQgPT09IG5vQ2hvaWNlVGV4dCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKiogUHJvbXB0cyB0aGUgdXNlciBmb3Igb25lIGxpbmUgb2YgaW5wdXQuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvbXB0SW5wdXQobWVzc2FnZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgcmV0dXJuIChhd2FpdCBwcm9tcHQ8e3Jlc3VsdDogc3RyaW5nfT4oe3R5cGU6ICdpbnB1dCcsIG5hbWU6ICdyZXN1bHQnLCBtZXNzYWdlfSkpLnJlc3VsdDtcbn1cblxuLyoqXG4gKiBTdXBwb3J0ZWQgbGV2ZWxzIGZvciBsb2dnaW5nIGZ1bmN0aW9ucy5cbiAqXG4gKiBMZXZlbHMgYXJlIG1hcHBlZCB0byBudW1iZXJzIHRvIHJlcHJlc2VudCBhIGhpZXJhcmNoeSBvZiBsb2dnaW5nIGxldmVscy5cbiAqL1xuZXhwb3J0IGVudW0gTE9HX0xFVkVMUyB7XG4gIFNJTEVOVCA9IDAsXG4gIEVSUk9SID0gMSxcbiAgV0FSTiA9IDIsXG4gIExPRyA9IDMsXG4gIElORk8gPSA0LFxuICBERUJVRyA9IDUsXG59XG5cbi8qKiBEZWZhdWx0IGxvZyBsZXZlbCBmb3IgdGhlIHRvb2wuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9MT0dfTEVWRUwgPSBMT0dfTEVWRUxTLklORk87XG5cbi8qKiBXcml0ZSB0byB0aGUgY29uc29sZSBmb3IgYXQgSU5GTyBsb2dnaW5nIGxldmVsICovXG5leHBvcnQgY29uc3QgaW5mbyA9IGJ1aWxkTG9nTGV2ZWxGdW5jdGlvbigoKSA9PiBjb25zb2xlLmluZm8sIExPR19MRVZFTFMuSU5GTyk7XG5cbi8qKiBXcml0ZSB0byB0aGUgY29uc29sZSBmb3IgYXQgRVJST1IgbG9nZ2luZyBsZXZlbCAqL1xuZXhwb3J0IGNvbnN0IGVycm9yID0gYnVpbGRMb2dMZXZlbEZ1bmN0aW9uKCgpID0+IGNvbnNvbGUuZXJyb3IsIExPR19MRVZFTFMuRVJST1IpO1xuXG4vKiogV3JpdGUgdG8gdGhlIGNvbnNvbGUgZm9yIGF0IERFQlVHIGxvZ2dpbmcgbGV2ZWwgKi9cbmV4cG9ydCBjb25zdCBkZWJ1ZyA9IGJ1aWxkTG9nTGV2ZWxGdW5jdGlvbigoKSA9PiBjb25zb2xlLmRlYnVnLCBMT0dfTEVWRUxTLkRFQlVHKTtcblxuLyoqIFdyaXRlIHRvIHRoZSBjb25zb2xlIGZvciBhdCBMT0cgbG9nZ2luZyBsZXZlbCAqL1xuLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBuby1jb25zb2xlXG5leHBvcnQgY29uc3QgbG9nID0gYnVpbGRMb2dMZXZlbEZ1bmN0aW9uKCgpID0+IGNvbnNvbGUubG9nLCBMT0dfTEVWRUxTLkxPRyk7XG5cbi8qKiBXcml0ZSB0byB0aGUgY29uc29sZSBmb3IgYXQgV0FSTiBsb2dnaW5nIGxldmVsICovXG5leHBvcnQgY29uc3Qgd2FybiA9IGJ1aWxkTG9nTGV2ZWxGdW5jdGlvbigoKSA9PiBjb25zb2xlLndhcm4sIExPR19MRVZFTFMuV0FSTik7XG5cbi8qKiBCdWlsZCBhbiBpbnN0YW5jZSBvZiBhIGxvZ2dpbmcgZnVuY3Rpb24gZm9yIHRoZSBwcm92aWRlZCBsZXZlbC4gKi9cbmZ1bmN0aW9uIGJ1aWxkTG9nTGV2ZWxGdW5jdGlvbihsb2FkQ29tbWFuZDogKCkgPT4gRnVuY3Rpb24sIGxldmVsOiBMT0dfTEVWRUxTKSB7XG4gIC8qKiBXcml0ZSB0byBzdGRvdXQgZm9yIHRoZSBMT0dfTEVWRUwuICovXG4gIGNvbnN0IGxvZ2dpbmdGdW5jdGlvbiA9ICguLi50ZXh0OiBzdHJpbmdbXSkgPT4ge1xuICAgIHJ1bkNvbnNvbGVDb21tYW5kKGxvYWRDb21tYW5kLCBsZXZlbCwgLi4udGV4dCk7XG4gIH07XG5cbiAgLyoqIFN0YXJ0IGEgZ3JvdXAgYXQgdGhlIExPR19MRVZFTCwgb3B0aW9uYWxseSBzdGFydGluZyBpdCBhcyBjb2xsYXBzZWQuICovXG4gIGxvZ2dpbmdGdW5jdGlvbi5ncm91cCA9ICh0ZXh0OiBzdHJpbmcsIGNvbGxhcHNlZCA9IGZhbHNlKSA9PiB7XG4gICAgY29uc3QgY29tbWFuZCA9IGNvbGxhcHNlZCA/IGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQgOiBjb25zb2xlLmdyb3VwO1xuICAgIHJ1bkNvbnNvbGVDb21tYW5kKCgpID0+IGNvbW1hbmQsIGxldmVsLCB0ZXh0KTtcbiAgfTtcblxuICAvKiogRW5kIHRoZSBncm91cCBhdCB0aGUgTE9HX0xFVkVMLiAqL1xuICBsb2dnaW5nRnVuY3Rpb24uZ3JvdXBFbmQgPSAoKSA9PiB7XG4gICAgcnVuQ29uc29sZUNvbW1hbmQoKCkgPT4gY29uc29sZS5ncm91cEVuZCwgbGV2ZWwpO1xuICB9O1xuXG4gIHJldHVybiBsb2dnaW5nRnVuY3Rpb247XG59XG5cbi8qKlxuICogUnVuIHRoZSBjb25zb2xlIGNvbW1hbmQgcHJvdmlkZWQsIGlmIHRoZSBlbnZpcm9ubWVudHMgbG9nZ2luZyBsZXZlbCBncmVhdGVyIHRoYW4gdGhlXG4gKiBwcm92aWRlZCBsb2dnaW5nIGxldmVsLlxuICpcbiAqIFRoZSBsb2FkQ29tbWFuZCB0YWtlcyBpbiBhIGZ1bmN0aW9uIHdoaWNoIGlzIGNhbGxlZCB0byByZXRyaWV2ZSB0aGUgY29uc29sZS4qIGZ1bmN0aW9uXG4gKiB0byBhbGxvdyBmb3IgamFzbWluZSBzcGllcyB0byBzdGlsbCB3b3JrIGluIHRlc3RpbmcuICBXaXRob3V0IHRoaXMgbWV0aG9kIG9mIHJldHJpZXZhbFxuICogdGhlIGNvbnNvbGUuKiBmdW5jdGlvbiwgdGhlIGZ1bmN0aW9uIGlzIHNhdmVkIGludG8gdGhlIGNsb3N1cmUgb2YgdGhlIGNyZWF0ZWQgbG9nZ2luZ1xuICogZnVuY3Rpb24gYmVmb3JlIGphc21pbmUgY2FuIHNweS5cbiAqL1xuZnVuY3Rpb24gcnVuQ29uc29sZUNvbW1hbmQobG9hZENvbW1hbmQ6ICgpID0+IEZ1bmN0aW9uLCBsb2dMZXZlbDogTE9HX0xFVkVMUywgLi4udGV4dDogc3RyaW5nW10pIHtcbiAgaWYgKGdldExvZ0xldmVsKCkgPj0gbG9nTGV2ZWwpIHtcbiAgICBsb2FkQ29tbWFuZCgpKC4uLnRleHQpO1xuICB9XG4gIHByaW50VG9Mb2dGaWxlKGxvZ0xldmVsLCAuLi50ZXh0KTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZSB0aGUgbG9nIGxldmVsIGZyb20gZW52aXJvbm1lbnQgdmFyaWFibGVzLCBpZiB0aGUgdmFsdWUgZm91bmRcbiAqIGJhc2VkIG9uIHRoZSBMT0dfTEVWRUwgZW52aXJvbm1lbnQgdmFyaWFibGUgaXMgdW5kZWZpbmVkLCByZXR1cm4gdGhlIGRlZmF1bHRcbiAqIGxvZ2dpbmcgbGV2ZWwuXG4gKi9cbmZ1bmN0aW9uIGdldExvZ0xldmVsKCkge1xuICBjb25zdCBsb2dMZXZlbEVudlZhbHVlOiBhbnkgPSAocHJvY2Vzcy5lbnZbYExPR19MRVZFTGBdIHx8ICcnKS50b1VwcGVyQ2FzZSgpO1xuICBjb25zdCBsb2dMZXZlbCA9IExPR19MRVZFTFNbbG9nTGV2ZWxFbnZWYWx1ZV07XG4gIGlmIChsb2dMZXZlbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIERFRkFVTFRfTE9HX0xFVkVMO1xuICB9XG4gIHJldHVybiBsb2dMZXZlbDtcbn1cblxuLyoqIEFsbCB0ZXh0IHRvIHdyaXRlIHRvIHRoZSBsb2cgZmlsZS4gKi9cbmxldCBMT0dHRURfVEVYVCA9ICcnO1xuLyoqIFdoZXRoZXIgZmlsZSBsb2dnaW5nIGFzIGJlZW4gZW5hYmxlZC4gKi9cbmxldCBGSUxFX0xPR0dJTkdfRU5BQkxFRCA9IGZhbHNlO1xuLyoqXG4gKiBUaGUgbnVtYmVyIG9mIGNvbHVtbnMgdXNlZCBpbiB0aGUgcHJlcGVuZGVkIGxvZyBsZXZlbCBpbmZvcm1hdGlvbiBvbiBlYWNoIGxpbmUgb2YgdGhlIGxvZ2dpbmdcbiAqIG91dHB1dCBmaWxlLlxuICovXG5jb25zdCBMT0dfTEVWRUxfQ09MVU1OUyA9IDc7XG5cbi8qKlxuICogRW5hYmxlIHdyaXRpbmcgdGhlIGxvZ2dlZCBvdXRwdXRzIHRvIHRoZSBsb2cgZmlsZSBvbiBwcm9jZXNzIGV4aXQsIHNldHMgaW5pdGlhbCBsaW5lcyBmcm9tIHRoZVxuICogY29tbWFuZCBleGVjdXRpb24sIGNvbnRhaW5pbmcgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHRpbWluZyBhbmQgY29tbWFuZCBwYXJhbWV0ZXJzLlxuICpcbiAqIFRoaXMgaXMgZXhwZWN0ZWQgdG8gYmUgY2FsbGVkIG9ubHkgb25jZSBkdXJpbmcgYSBjb21tYW5kIHJ1biwgYW5kIHNob3VsZCBiZSBjYWxsZWQgYnkgdGhlXG4gKiBtaWRkbGV3YXJlIG9mIHlhcmdzIHRvIGVuYWJsZSB0aGUgZmlsZSBsb2dnaW5nIGJlZm9yZSB0aGUgcmVzdCBvZiB0aGUgY29tbWFuZCBwYXJzaW5nIGFuZFxuICogcmVzcG9uc2UgaXMgZXhlY3V0ZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYXB0dXJlTG9nT3V0cHV0Rm9yQ29tbWFuZChhcmd2OiBBcmd1bWVudHMpIHtcbiAgaWYgKEZJTEVfTE9HR0lOR19FTkFCTEVEKSB7XG4gICAgdGhyb3cgRXJyb3IoJ2BjYXB0dXJlTG9nT3V0cHV0Rm9yQ29tbWFuZGAgY2Fubm90IGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcycpO1xuICB9XG4gIC8qKiBUaGUgZGF0ZSB0aW1lIHVzZWQgZm9yIHRpbWVzdGFtcGluZyB3aGVuIHRoZSBjb21tYW5kIHdhcyBpbnZva2VkLiAqL1xuICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xuICAvKiogSGVhZGVyIGxpbmUgdG8gc2VwYXJhdGUgY29tbWFuZCBydW5zIGluIGxvZyBmaWxlcy4gKi9cbiAgY29uc3QgaGVhZGVyTGluZSA9IEFycmF5KDEwMCkuZmlsbCgnIycpLmpvaW4oJycpO1xuICBMT0dHRURfVEVYVCArPSBgJHtoZWFkZXJMaW5lfVxcbkNvbW1hbmQ6ICR7YXJndi4kMH0gJHthcmd2Ll8uam9pbignICcpfVxcblJhbiBhdDogJHtub3d9XFxuYDtcblxuICAvLyBPbiBwcm9jZXNzIGV4aXQsIHdyaXRlIHRoZSBsb2dnZWQgb3V0cHV0IHRvIHRoZSBhcHByb3ByaWF0ZSBsb2cgZmlsZXNcbiAgcHJvY2Vzcy5vbignZXhpdCcsIChjb2RlOiBudW1iZXIpID0+IHtcbiAgICBMT0dHRURfVEVYVCArPSBgJHtoZWFkZXJMaW5lfVxcbmA7XG4gICAgTE9HR0VEX1RFWFQgKz0gYENvbW1hbmQgcmFuIGluICR7bmV3IERhdGUoKS5nZXRUaW1lKCkgLSBub3cuZ2V0VGltZSgpfW1zXFxuYDtcbiAgICBMT0dHRURfVEVYVCArPSBgRXhpdCBDb2RlOiAke2NvZGV9XFxuYDtcbiAgICAvKiogUGF0aCB0byB0aGUgbG9nIGZpbGUgbG9jYXRpb24uICovXG4gICAgY29uc3QgbG9nRmlsZVBhdGggPSBqb2luKGdldFJlcG9CYXNlRGlyKCksICcubmctZGV2LmxvZycpO1xuXG4gICAgLy8gU3RyaXAgQU5TSSBlc2NhcGUgY29kZXMgZnJvbSBsb2cgb3V0cHV0cy5cbiAgICBMT0dHRURfVEVYVCA9IExPR0dFRF9URVhULnJlcGxhY2UoL1xceDFCXFxbKFswLTldezEsM30oO1swLTldezEsMn0pPyk/W21HS10vZywgJycpO1xuXG4gICAgd3JpdGVGaWxlU3luYyhsb2dGaWxlUGF0aCwgTE9HR0VEX1RFWFQpO1xuXG4gICAgLy8gRm9yIGZhaWx1cmUgY29kZXMgZ3JlYXRlciB0aGFuIDEsIHRoZSBuZXcgbG9nZ2VkIGxpbmVzIHNob3VsZCBiZSB3cml0dGVuIHRvIGEgc3BlY2lmaWMgbG9nXG4gICAgLy8gZmlsZSBmb3IgdGhlIGNvbW1hbmQgcnVuIGZhaWx1cmUuXG4gICAgaWYgKGNvZGUgPiAxKSB7XG4gICAgICBjb25zdCBsb2dGaWxlTmFtZSA9IGAubmctZGV2LmVyci0ke25vdy5nZXRUaW1lKCl9LmxvZ2A7XG4gICAgICBjb25zb2xlLmVycm9yKGBFeGl0IGNvZGU6ICR7Y29kZX0uIFdyaXRpbmcgZnVsbCBsb2cgdG8gJHtsb2dGaWxlTmFtZX1gKTtcbiAgICAgIHdyaXRlRmlsZVN5bmMoam9pbihnZXRSZXBvQmFzZURpcigpLCBsb2dGaWxlTmFtZSksIExPR0dFRF9URVhUKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIE1hcmsgZmlsZSBsb2dnaW5nIGFzIGVuYWJsZWQgdG8gcHJldmVudCB0aGUgZnVuY3Rpb24gZnJvbSBleGVjdXRpbmcgbXVsdGlwbGUgdGltZXMuXG4gIEZJTEVfTE9HR0lOR19FTkFCTEVEID0gdHJ1ZTtcbn1cblxuLyoqIFdyaXRlIHRoZSBwcm92aWRlZCB0ZXh0IHRvIHRoZSBsb2cgZmlsZSwgcHJlcGVuZGluZyBlYWNoIGxpbmUgd2l0aCB0aGUgbG9nIGxldmVsLiAgKi9cbmZ1bmN0aW9uIHByaW50VG9Mb2dGaWxlKGxvZ0xldmVsOiBMT0dfTEVWRUxTLCAuLi50ZXh0OiBzdHJpbmdbXSkge1xuICBjb25zdCBsb2dMZXZlbFRleHQgPSBgJHtMT0dfTEVWRUxTW2xvZ0xldmVsXX06YC5wYWRFbmQoTE9HX0xFVkVMX0NPTFVNTlMpO1xuICBMT0dHRURfVEVYVCArPSB0ZXh0LmpvaW4oJyAnKS5zcGxpdCgnXFxuJykubWFwKGwgPT4gYCR7bG9nTGV2ZWxUZXh0fSAke2x9XFxuYCkuam9pbignJyk7XG59XG4iXX0=