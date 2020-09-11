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
    exports.captureLogOutputForCommand = exports.warn = exports.log = exports.debug = exports.error = exports.info = exports.DEFAULT_LOG_LEVEL = exports.LOG_LEVELS = exports.promptInput = exports.promptAutocomplete = exports.promptConfirm = exports.bold = exports.yellow = exports.green = exports.red = void 0;
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
                            choices = tslib_1.__spread([noChoiceText], choices);
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
        printToLogFile.apply(void 0, tslib_1.__spread([logLevel], text));
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
            LOGGED_TEXT += "Command ran in " + (new Date().getTime() - now.getTime()) + "ms";
            /** Path to the log file location. */
            var logFilePath = path_1.join(config_1.getRepoBaseDir(), '.ng-dev.log');
            fs_1.writeFileSync(logFilePath, LOGGED_TEXT);
            // For failure codes greater than 1, the new logged lines should be written to a specific log
            // file for the command run failure.
            if (code > 1) {
                fs_1.writeFileSync(path_1.join(config_1.getRepoBaseDir(), ".ng-dev.err-" + now.getTime() + ".log"), LOGGED_TEXT);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9jb25zb2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBMEI7SUFDMUIseUJBQWlDO0lBQ2pDLHFDQUF1RTtJQUN2RSxtRUFBcUU7SUFDckUsNkJBQTBCO0lBRzFCLGtFQUF3QztJQUV4QyxzREFBc0Q7SUFDekMsUUFBQSxHQUFHLEdBQWlCLGVBQUssQ0FBQyxHQUFHLENBQUM7SUFDOUIsUUFBQSxLQUFLLEdBQWlCLGVBQUssQ0FBQyxLQUFLLENBQUM7SUFDbEMsUUFBQSxNQUFNLEdBQWlCLGVBQUssQ0FBQyxNQUFNLENBQUM7SUFDcEMsUUFBQSxJQUFJLEdBQWlCLGVBQUssQ0FBQyxJQUFJLENBQUM7SUFFN0MsNkVBQTZFO0lBQzdFLFNBQXNCLGFBQWEsQ0FBQyxPQUFlLEVBQUUsWUFBb0I7UUFBcEIsNkJBQUEsRUFBQSxvQkFBb0I7Ozs7NEJBQy9ELHFCQUFNLGlCQUFNLENBQW9COzRCQUMvQixJQUFJLEVBQUUsU0FBUzs0QkFDZixJQUFJLEVBQUUsUUFBUTs0QkFDZCxPQUFPLEVBQUUsT0FBTzs0QkFDaEIsT0FBTyxFQUFFLFlBQVk7eUJBQ3RCLENBQUMsRUFBQTs0QkFMVCxzQkFBTyxDQUFDLFNBS0MsQ0FBQzs2QkFDTCxNQUFNLEVBQUM7Ozs7S0FDYjtJQVJELHNDQVFDO0lBWUQsU0FBc0Isa0JBQWtCLENBQ3BDLE9BQWUsRUFBRSxPQUFxQyxFQUN0RCxZQUFxQjs7Ozs7O3dCQUVqQixNQUFNLEdBQUcsNkJBQWtCLENBQUMsRUFBRSxDQUFDLENBQUMsY0FBYyxDQUFDLGNBQWMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO3dCQUMzRixJQUFJLFlBQVksRUFBRTs0QkFDaEIsT0FBTyxxQkFBSSxZQUFZLEdBQUssT0FBTyxDQUFDLENBQUM7eUJBQ3RDO3dCQUVlLHFC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QyxXQUFJLENBQUMsdUJBQWMsRUFBRSxFQUFFLGlCQUFlLEdBQUcsQ0FBQyxPQUFPLEVBQUUsU0FBTSxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7YUFDeEY7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILHNGQUFzRjtRQUN0RixvQkFBb0IsR0FBRyxJQUFJLENBQUM7SUFDOUIsQ0FBQztJQTNCRCxnRUEyQkM7SUFFRCx5RkFBeUY7SUFDekYsU0FBUyxjQUFjLENBQUMsUUFBb0I7UUFBRSxjQUFpQjthQUFqQixVQUFpQixFQUFqQixxQkFBaUIsRUFBakIsSUFBaUI7WUFBakIsNkJBQWlCOztRQUM3RCxJQUFNLFlBQVksR0FBRyxDQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsTUFBRyxDQUFBLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDMUUsV0FBVyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFHLFlBQVksU0FBSSxDQUFDLE9BQUksRUFBeEIsQ0FBd0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN4RixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCBjaGFsayBmcm9tICdjaGFsayc7XG5pbXBvcnQge3dyaXRlRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7Y3JlYXRlUHJvbXB0TW9kdWxlLCBMaXN0Q2hvaWNlT3B0aW9ucywgcHJvbXB0fSBmcm9tICdpbnF1aXJlcic7XG5pbXBvcnQgKiBhcyBpbnF1aXJlckF1dG9jb21wbGV0ZSBmcm9tICdpbnF1aXJlci1hdXRvY29tcGxldGUtcHJvbXB0JztcbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQge0FyZ3VtZW50c30gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2dldFJlcG9CYXNlRGlyfSBmcm9tICcuL2NvbmZpZyc7XG5cbi8qKiBSZWV4cG9ydCBvZiBjaGFsayBjb2xvcnMgZm9yIGNvbnZlbmllbnQgYWNjZXNzLiAqL1xuZXhwb3J0IGNvbnN0IHJlZDogdHlwZW9mIGNoYWxrID0gY2hhbGsucmVkO1xuZXhwb3J0IGNvbnN0IGdyZWVuOiB0eXBlb2YgY2hhbGsgPSBjaGFsay5ncmVlbjtcbmV4cG9ydCBjb25zdCB5ZWxsb3c6IHR5cGVvZiBjaGFsayA9IGNoYWxrLnllbGxvdztcbmV4cG9ydCBjb25zdCBib2xkOiB0eXBlb2YgY2hhbGsgPSBjaGFsay5ib2xkO1xuXG4vKiogUHJvbXB0cyB0aGUgdXNlciB3aXRoIGEgY29uZmlybWF0aW9uIHF1ZXN0aW9uIGFuZCBhIHNwZWNpZmllZCBtZXNzYWdlLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByb21wdENvbmZpcm0obWVzc2FnZTogc3RyaW5nLCBkZWZhdWx0VmFsdWUgPSBmYWxzZSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICByZXR1cm4gKGF3YWl0IHByb21wdDx7cmVzdWx0OiBib29sZWFufT4oe1xuICAgICAgICAgICB0eXBlOiAnY29uZmlybScsXG4gICAgICAgICAgIG5hbWU6ICdyZXN1bHQnLFxuICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgICAgICBkZWZhdWx0OiBkZWZhdWx0VmFsdWUsXG4gICAgICAgICB9KSlcbiAgICAgIC5yZXN1bHQ7XG59XG5cbi8qKiBQcm9tcHRzIHRoZSB1c2VyIHRvIHNlbGVjdCBhbiBvcHRpb24gZnJvbSBhIGZpbHRlcmFibGUgYXV0b2NvbXBsZXRlIGxpc3QuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvbXB0QXV0b2NvbXBsZXRlKFxuICAgIG1lc3NhZ2U6IHN0cmluZywgY2hvaWNlczogKHN0cmluZ3xMaXN0Q2hvaWNlT3B0aW9ucylbXSk6IFByb21pc2U8c3RyaW5nPjtcbi8qKlxuICogUHJvbXB0cyB0aGUgdXNlciB0byBzZWxlY3QgYW4gb3B0aW9uIGZyb20gYSBmaWx0ZXJhYmxlIGF1dG9jb21wbGV0ZSBsaXN0LCB3aXRoIGFuIG9wdGlvbiB0b1xuICogY2hvb3NlIG5vIHZhbHVlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvbXB0QXV0b2NvbXBsZXRlKFxuICAgIG1lc3NhZ2U6IHN0cmluZywgY2hvaWNlczogKHN0cmluZ3xMaXN0Q2hvaWNlT3B0aW9ucylbXSxcbiAgICBub0Nob2ljZVRleHQ/OiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZ3xmYWxzZT47XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvbXB0QXV0b2NvbXBsZXRlKFxuICAgIG1lc3NhZ2U6IHN0cmluZywgY2hvaWNlczogKHN0cmluZ3xMaXN0Q2hvaWNlT3B0aW9ucylbXSxcbiAgICBub0Nob2ljZVRleHQ/OiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZ3xmYWxzZT4ge1xuICAvLyBDcmVhdGVzIGEgbG9jYWwgcHJvbXB0IG1vZHVsZSB3aXRoIGFuIGF1dG9jb21wbGV0ZSBwcm9tcHQgdHlwZS5cbiAgY29uc3QgcHJvbXB0ID0gY3JlYXRlUHJvbXB0TW9kdWxlKHt9KS5yZWdpc3RlclByb21wdCgnYXV0b2NvbXBsZXRlJywgaW5xdWlyZXJBdXRvY29tcGxldGUpO1xuICBpZiAobm9DaG9pY2VUZXh0KSB7XG4gICAgY2hvaWNlcyA9IFtub0Nob2ljZVRleHQsIC4uLmNob2ljZXNdO1xuICB9XG4gIC8vIGBwcm9tcHRgIG11c3QgYmUgY2FzdCBhcyBgYW55YCBhcyB0aGUgYXV0b2NvbXBsZXRlIHR5cGluZ3MgYXJlIG5vdCBhdmFpbGFibGUuXG4gIGNvbnN0IHJlc3VsdCA9IChhd2FpdCAocHJvbXB0IGFzIGFueSkoe1xuICAgICAgICAgICAgICAgICAgIHR5cGU6ICdhdXRvY29tcGxldGUnLFxuICAgICAgICAgICAgICAgICAgIG5hbWU6ICdyZXN1bHQnLFxuICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgc291cmNlOiAoXzogYW55LCBpbnB1dDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICBpZiAoIWlucHV0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoY2hvaWNlcyk7XG4gICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNob2ljZXMuZmlsdGVyKGNob2ljZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2hvaWNlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjaG9pY2UuaW5jbHVkZXMoaW5wdXQpO1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjaG9pY2UubmFtZSEuaW5jbHVkZXMoaW5wdXQpO1xuICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgfSkpLnJlc3VsdDtcbiAgaWYgKHJlc3VsdCA9PT0gbm9DaG9pY2VUZXh0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKiBQcm9tcHRzIHRoZSB1c2VyIGZvciBvbmUgbGluZSBvZiBpbnB1dC4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm9tcHRJbnB1dChtZXNzYWdlOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gKGF3YWl0IHByb21wdDx7cmVzdWx0OiBzdHJpbmd9Pih7dHlwZTogJ2lucHV0JywgbmFtZTogJ3Jlc3VsdCcsIG1lc3NhZ2V9KSkucmVzdWx0O1xufVxuXG4vKipcbiAqIFN1cHBvcnRlZCBsZXZlbHMgZm9yIGxvZ2dpbmcgZnVuY3Rpb25zLlxuICpcbiAqIExldmVscyBhcmUgbWFwcGVkIHRvIG51bWJlcnMgdG8gcmVwcmVzZW50IGEgaGllcmFyY2h5IG9mIGxvZ2dpbmcgbGV2ZWxzLlxuICovXG5leHBvcnQgZW51bSBMT0dfTEVWRUxTIHtcbiAgU0lMRU5UID0gMCxcbiAgRVJST1IgPSAxLFxuICBXQVJOID0gMixcbiAgTE9HID0gMyxcbiAgSU5GTyA9IDQsXG4gIERFQlVHID0gNSxcbn1cblxuLyoqIERlZmF1bHQgbG9nIGxldmVsIGZvciB0aGUgdG9vbC4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX0xPR19MRVZFTCA9IExPR19MRVZFTFMuSU5GTztcblxuLyoqIFdyaXRlIHRvIHRoZSBjb25zb2xlIGZvciBhdCBJTkZPIGxvZ2dpbmcgbGV2ZWwgKi9cbmV4cG9ydCBjb25zdCBpbmZvID0gYnVpbGRMb2dMZXZlbEZ1bmN0aW9uKCgpID0+IGNvbnNvbGUuaW5mbywgTE9HX0xFVkVMUy5JTkZPKTtcblxuLyoqIFdyaXRlIHRvIHRoZSBjb25zb2xlIGZvciBhdCBFUlJPUiBsb2dnaW5nIGxldmVsICovXG5leHBvcnQgY29uc3QgZXJyb3IgPSBidWlsZExvZ0xldmVsRnVuY3Rpb24oKCkgPT4gY29uc29sZS5lcnJvciwgTE9HX0xFVkVMUy5FUlJPUik7XG5cbi8qKiBXcml0ZSB0byB0aGUgY29uc29sZSBmb3IgYXQgREVCVUcgbG9nZ2luZyBsZXZlbCAqL1xuZXhwb3J0IGNvbnN0IGRlYnVnID0gYnVpbGRMb2dMZXZlbEZ1bmN0aW9uKCgpID0+IGNvbnNvbGUuZGVidWcsIExPR19MRVZFTFMuREVCVUcpO1xuXG4vKiogV3JpdGUgdG8gdGhlIGNvbnNvbGUgZm9yIGF0IExPRyBsb2dnaW5nIGxldmVsICovXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbnNvbGVcbmV4cG9ydCBjb25zdCBsb2cgPSBidWlsZExvZ0xldmVsRnVuY3Rpb24oKCkgPT4gY29uc29sZS5sb2csIExPR19MRVZFTFMuTE9HKTtcblxuLyoqIFdyaXRlIHRvIHRoZSBjb25zb2xlIGZvciBhdCBXQVJOIGxvZ2dpbmcgbGV2ZWwgKi9cbmV4cG9ydCBjb25zdCB3YXJuID0gYnVpbGRMb2dMZXZlbEZ1bmN0aW9uKCgpID0+IGNvbnNvbGUud2FybiwgTE9HX0xFVkVMUy5XQVJOKTtcblxuLyoqIEJ1aWxkIGFuIGluc3RhbmNlIG9mIGEgbG9nZ2luZyBmdW5jdGlvbiBmb3IgdGhlIHByb3ZpZGVkIGxldmVsLiAqL1xuZnVuY3Rpb24gYnVpbGRMb2dMZXZlbEZ1bmN0aW9uKGxvYWRDb21tYW5kOiAoKSA9PiBGdW5jdGlvbiwgbGV2ZWw6IExPR19MRVZFTFMpIHtcbiAgLyoqIFdyaXRlIHRvIHN0ZG91dCBmb3IgdGhlIExPR19MRVZFTC4gKi9cbiAgY29uc3QgbG9nZ2luZ0Z1bmN0aW9uID0gKC4uLnRleHQ6IHN0cmluZ1tdKSA9PiB7XG4gICAgcnVuQ29uc29sZUNvbW1hbmQobG9hZENvbW1hbmQsIGxldmVsLCAuLi50ZXh0KTtcbiAgfTtcblxuICAvKiogU3RhcnQgYSBncm91cCBhdCB0aGUgTE9HX0xFVkVMLCBvcHRpb25hbGx5IHN0YXJ0aW5nIGl0IGFzIGNvbGxhcHNlZC4gKi9cbiAgbG9nZ2luZ0Z1bmN0aW9uLmdyb3VwID0gKHRleHQ6IHN0cmluZywgY29sbGFwc2VkID0gZmFsc2UpID0+IHtcbiAgICBjb25zdCBjb21tYW5kID0gY29sbGFwc2VkID8gY29uc29sZS5ncm91cENvbGxhcHNlZCA6IGNvbnNvbGUuZ3JvdXA7XG4gICAgcnVuQ29uc29sZUNvbW1hbmQoKCkgPT4gY29tbWFuZCwgbGV2ZWwsIHRleHQpO1xuICB9O1xuXG4gIC8qKiBFbmQgdGhlIGdyb3VwIGF0IHRoZSBMT0dfTEVWRUwuICovXG4gIGxvZ2dpbmdGdW5jdGlvbi5ncm91cEVuZCA9ICgpID0+IHtcbiAgICBydW5Db25zb2xlQ29tbWFuZCgoKSA9PiBjb25zb2xlLmdyb3VwRW5kLCBsZXZlbCk7XG4gIH07XG5cbiAgcmV0dXJuIGxvZ2dpbmdGdW5jdGlvbjtcbn1cblxuLyoqXG4gKiBSdW4gdGhlIGNvbnNvbGUgY29tbWFuZCBwcm92aWRlZCwgaWYgdGhlIGVudmlyb25tZW50cyBsb2dnaW5nIGxldmVsIGdyZWF0ZXIgdGhhbiB0aGVcbiAqIHByb3ZpZGVkIGxvZ2dpbmcgbGV2ZWwuXG4gKlxuICogVGhlIGxvYWRDb21tYW5kIHRha2VzIGluIGEgZnVuY3Rpb24gd2hpY2ggaXMgY2FsbGVkIHRvIHJldHJpZXZlIHRoZSBjb25zb2xlLiogZnVuY3Rpb25cbiAqIHRvIGFsbG93IGZvciBqYXNtaW5lIHNwaWVzIHRvIHN0aWxsIHdvcmsgaW4gdGVzdGluZy4gIFdpdGhvdXQgdGhpcyBtZXRob2Qgb2YgcmV0cmlldmFsXG4gKiB0aGUgY29uc29sZS4qIGZ1bmN0aW9uLCB0aGUgZnVuY3Rpb24gaXMgc2F2ZWQgaW50byB0aGUgY2xvc3VyZSBvZiB0aGUgY3JlYXRlZCBsb2dnaW5nXG4gKiBmdW5jdGlvbiBiZWZvcmUgamFzbWluZSBjYW4gc3B5LlxuICovXG5mdW5jdGlvbiBydW5Db25zb2xlQ29tbWFuZChsb2FkQ29tbWFuZDogKCkgPT4gRnVuY3Rpb24sIGxvZ0xldmVsOiBMT0dfTEVWRUxTLCAuLi50ZXh0OiBzdHJpbmdbXSkge1xuICBpZiAoZ2V0TG9nTGV2ZWwoKSA+PSBsb2dMZXZlbCkge1xuICAgIGxvYWRDb21tYW5kKCkoLi4udGV4dCk7XG4gIH1cbiAgcHJpbnRUb0xvZ0ZpbGUobG9nTGV2ZWwsIC4uLnRleHQpO1xufVxuXG4vKipcbiAqIFJldHJpZXZlIHRoZSBsb2cgbGV2ZWwgZnJvbSBlbnZpcm9ubWVudCB2YXJpYWJsZXMsIGlmIHRoZSB2YWx1ZSBmb3VuZFxuICogYmFzZWQgb24gdGhlIExPR19MRVZFTCBlbnZpcm9ubWVudCB2YXJpYWJsZSBpcyB1bmRlZmluZWQsIHJldHVybiB0aGUgZGVmYXVsdFxuICogbG9nZ2luZyBsZXZlbC5cbiAqL1xuZnVuY3Rpb24gZ2V0TG9nTGV2ZWwoKSB7XG4gIGNvbnN0IGxvZ0xldmVsRW52VmFsdWU6IGFueSA9IChwcm9jZXNzLmVudltgTE9HX0xFVkVMYF0gfHwgJycpLnRvVXBwZXJDYXNlKCk7XG4gIGNvbnN0IGxvZ0xldmVsID0gTE9HX0xFVkVMU1tsb2dMZXZlbEVudlZhbHVlXTtcbiAgaWYgKGxvZ0xldmVsID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gREVGQVVMVF9MT0dfTEVWRUw7XG4gIH1cbiAgcmV0dXJuIGxvZ0xldmVsO1xufVxuXG4vKiogQWxsIHRleHQgdG8gd3JpdGUgdG8gdGhlIGxvZyBmaWxlLiAqL1xubGV0IExPR0dFRF9URVhUID0gJyc7XG4vKiogV2hldGhlciBmaWxlIGxvZ2dpbmcgYXMgYmVlbiBlbmFibGVkLiAqL1xubGV0IEZJTEVfTE9HR0lOR19FTkFCTEVEID0gZmFsc2U7XG4vKipcbiAqIFRoZSBudW1iZXIgb2YgY29sdW1ucyB1c2VkIGluIHRoZSBwcmVwZW5kZWQgbG9nIGxldmVsIGluZm9ybWF0aW9uIG9uIGVhY2ggbGluZSBvZiB0aGUgbG9nZ2luZ1xuICogb3V0cHV0IGZpbGUuXG4gKi9cbmNvbnN0IExPR19MRVZFTF9DT0xVTU5TID0gNztcblxuLyoqXG4gKiBFbmFibGUgd3JpdGluZyB0aGUgbG9nZ2VkIG91dHB1dHMgdG8gdGhlIGxvZyBmaWxlIG9uIHByb2Nlc3MgZXhpdCwgc2V0cyBpbml0aWFsIGxpbmVzIGZyb20gdGhlXG4gKiBjb21tYW5kIGV4ZWN1dGlvbiwgY29udGFpbmluZyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgdGltaW5nIGFuZCBjb21tYW5kIHBhcmFtZXRlcnMuXG4gKlxuICogVGhpcyBpcyBleHBlY3RlZCB0byBiZSBjYWxsZWQgb25seSBvbmNlIGR1cmluZyBhIGNvbW1hbmQgcnVuLCBhbmQgc2hvdWxkIGJlIGNhbGxlZCBieSB0aGVcbiAqIG1pZGRsZXdhcmUgb2YgeWFyZ3MgdG8gZW5hYmxlIHRoZSBmaWxlIGxvZ2dpbmcgYmVmb3JlIHRoZSByZXN0IG9mIHRoZSBjb21tYW5kIHBhcnNpbmcgYW5kXG4gKiByZXNwb25zZSBpcyBleGVjdXRlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhcHR1cmVMb2dPdXRwdXRGb3JDb21tYW5kKGFyZ3Y6IEFyZ3VtZW50cykge1xuICBpZiAoRklMRV9MT0dHSU5HX0VOQUJMRUQpIHtcbiAgICB0aHJvdyBFcnJvcignYGNhcHR1cmVMb2dPdXRwdXRGb3JDb21tYW5kYCBjYW5ub3QgYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzJyk7XG4gIH1cbiAgLyoqIFRoZSBkYXRlIHRpbWUgdXNlZCBmb3IgdGltZXN0YW1waW5nIHdoZW4gdGhlIGNvbW1hbmQgd2FzIGludm9rZWQuICovXG4gIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG4gIC8qKiBIZWFkZXIgbGluZSB0byBzZXBhcmF0ZSBjb21tYW5kIHJ1bnMgaW4gbG9nIGZpbGVzLiAqL1xuICBjb25zdCBoZWFkZXJMaW5lID0gQXJyYXkoMTAwKS5maWxsKCcjJykuam9pbignJyk7XG4gIExPR0dFRF9URVhUICs9IGAke2hlYWRlckxpbmV9XFxuQ29tbWFuZDogJHthcmd2LiQwfSAke2FyZ3YuXy5qb2luKCcgJyl9XFxuUmFuIGF0OiAke25vd31cXG5gO1xuXG4gIC8vIE9uIHByb2Nlc3MgZXhpdCwgd3JpdGUgdGhlIGxvZ2dlZCBvdXRwdXQgdG8gdGhlIGFwcHJvcHJpYXRlIGxvZyBmaWxlc1xuICBwcm9jZXNzLm9uKCdleGl0JywgKGNvZGU6IG51bWJlcikgPT4ge1xuICAgIExPR0dFRF9URVhUICs9IGBDb21tYW5kIHJhbiBpbiAke25ldyBEYXRlKCkuZ2V0VGltZSgpIC0gbm93LmdldFRpbWUoKX1tc2A7XG4gICAgLyoqIFBhdGggdG8gdGhlIGxvZyBmaWxlIGxvY2F0aW9uLiAqL1xuICAgIGNvbnN0IGxvZ0ZpbGVQYXRoID0gam9pbihnZXRSZXBvQmFzZURpcigpLCAnLm5nLWRldi5sb2cnKTtcblxuICAgIHdyaXRlRmlsZVN5bmMobG9nRmlsZVBhdGgsIExPR0dFRF9URVhUKTtcblxuICAgIC8vIEZvciBmYWlsdXJlIGNvZGVzIGdyZWF0ZXIgdGhhbiAxLCB0aGUgbmV3IGxvZ2dlZCBsaW5lcyBzaG91bGQgYmUgd3JpdHRlbiB0byBhIHNwZWNpZmljIGxvZ1xuICAgIC8vIGZpbGUgZm9yIHRoZSBjb21tYW5kIHJ1biBmYWlsdXJlLlxuICAgIGlmIChjb2RlID4gMSkge1xuICAgICAgd3JpdGVGaWxlU3luYyhqb2luKGdldFJlcG9CYXNlRGlyKCksIGAubmctZGV2LmVyci0ke25vdy5nZXRUaW1lKCl9LmxvZ2ApLCBMT0dHRURfVEVYVCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBNYXJrIGZpbGUgbG9nZ2luZyBhcyBlbmFibGVkIHRvIHByZXZlbnQgdGhlIGZ1bmN0aW9uIGZyb20gZXhlY3V0aW5nIG11bHRpcGxlIHRpbWVzLlxuICBGSUxFX0xPR0dJTkdfRU5BQkxFRCA9IHRydWU7XG59XG5cbi8qKiBXcml0ZSB0aGUgcHJvdmlkZWQgdGV4dCB0byB0aGUgbG9nIGZpbGUsIHByZXBlbmRpbmcgZWFjaCBsaW5lIHdpdGggdGhlIGxvZyBsZXZlbC4gICovXG5mdW5jdGlvbiBwcmludFRvTG9nRmlsZShsb2dMZXZlbDogTE9HX0xFVkVMUywgLi4udGV4dDogc3RyaW5nW10pIHtcbiAgY29uc3QgbG9nTGV2ZWxUZXh0ID0gYCR7TE9HX0xFVkVMU1tsb2dMZXZlbF19OmAucGFkRW5kKExPR19MRVZFTF9DT0xVTU5TKTtcbiAgTE9HR0VEX1RFWFQgKz0gdGV4dC5qb2luKCcgJykuc3BsaXQoJ1xcbicpLm1hcChsID0+IGAke2xvZ0xldmVsVGV4dH0gJHtsfVxcbmApLmpvaW4oJycpO1xufVxuIl19