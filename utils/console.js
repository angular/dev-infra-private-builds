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
        define("@angular/dev-infra-private/utils/console", ["require", "exports", "tslib", "chalk", "fs", "inquirer", "path", "@angular/dev-infra-private/utils/git/index"], factory);
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
    var index_1 = require("@angular/dev-infra-private/utils/git/index");
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
        var git = index_1.GitClient.getInstance();
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
            var logFilePath = path_1.join(git.baseDir, '.ng-dev.log');
            // Strip ANSI escape codes from log outputs.
            LOGGED_TEXT = LOGGED_TEXT.replace(/\x1B\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]/g, '');
            fs_1.writeFileSync(logFilePath, LOGGED_TEXT);
            // For failure codes greater than 1, the new logged lines should be written to a specific log
            // file for the command run failure.
            if (code > 1) {
                var logFileName = ".ng-dev.err-" + now.getTime() + ".log";
                console.error("Exit code: " + code + ". Writing full log to " + logFileName);
                fs_1.writeFileSync(path_1.join(git.baseDir, logFileName), LOGGED_TEXT);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9jb25zb2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBMEI7SUFDMUIseUJBQWlDO0lBQ2pDLHFDQUFnQztJQUNoQyw2QkFBMEI7SUFHMUIsb0VBQXNDO0lBRXRDLHNEQUFzRDtJQUN6QyxRQUFBLEdBQUcsR0FBaUIsZUFBSyxDQUFDLEdBQUcsQ0FBQztJQUM5QixRQUFBLEtBQUssR0FBaUIsZUFBSyxDQUFDLEtBQUssQ0FBQztJQUNsQyxRQUFBLE1BQU0sR0FBaUIsZUFBSyxDQUFDLE1BQU0sQ0FBQztJQUNwQyxRQUFBLElBQUksR0FBaUIsZUFBSyxDQUFDLElBQUksQ0FBQztJQUNoQyxRQUFBLElBQUksR0FBaUIsZUFBSyxDQUFDLElBQUksQ0FBQztJQUU3Qyw2RUFBNkU7SUFDN0UsU0FBc0IsYUFBYSxDQUFDLE9BQWUsRUFBRSxZQUFvQjtRQUFwQiw2QkFBQSxFQUFBLG9CQUFvQjs7Ozs0QkFDL0QscUJBQU0saUJBQU0sQ0FBb0I7NEJBQy9CLElBQUksRUFBRSxTQUFTOzRCQUNmLElBQUksRUFBRSxRQUFROzRCQUNkLE9BQU8sRUFBRSxPQUFPOzRCQUNoQixPQUFPLEVBQUUsWUFBWTt5QkFDdEIsQ0FBQyxFQUFBOzRCQUxULHNCQUFPLENBQUMsU0FLQyxDQUFDOzZCQUNMLE1BQU0sRUFBQzs7OztLQUNiO0lBUkQsc0NBUUM7SUFFRCw4Q0FBOEM7SUFDOUMsU0FBc0IsV0FBVyxDQUFDLE9BQWU7Ozs7NEJBQ3ZDLHFCQUFNLGlCQUFNLENBQW1CLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sU0FBQSxFQUFDLENBQUMsRUFBQTs0QkFBaEYsc0JBQU8sQ0FBQyxTQUF3RSxDQUFDLENBQUMsTUFBTSxFQUFDOzs7O0tBQzFGO0lBRkQsa0NBRUM7SUFFRDs7OztPQUlHO0lBQ0gsSUFBWSxVQU9YO0lBUEQsV0FBWSxVQUFVO1FBQ3BCLCtDQUFVLENBQUE7UUFDViw2Q0FBUyxDQUFBO1FBQ1QsMkNBQVEsQ0FBQTtRQUNSLHlDQUFPLENBQUE7UUFDUCwyQ0FBUSxDQUFBO1FBQ1IsNkNBQVMsQ0FBQTtJQUNYLENBQUMsRUFQVyxVQUFVLEdBQVYsa0JBQVUsS0FBVixrQkFBVSxRQU9yQjtJQUVELHNDQUFzQztJQUN6QixRQUFBLGlCQUFpQixHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7SUFFakQscURBQXFEO0lBQ3hDLFFBQUEsSUFBSSxHQUFHLHFCQUFxQixDQUFDLGNBQU0sT0FBQSxPQUFPLENBQUMsSUFBSSxFQUFaLENBQVksRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFL0Usc0RBQXNEO0lBQ3pDLFFBQUEsS0FBSyxHQUFHLHFCQUFxQixDQUFDLGNBQU0sT0FBQSxPQUFPLENBQUMsS0FBSyxFQUFiLENBQWEsRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFbEYsc0RBQXNEO0lBQ3pDLFFBQUEsS0FBSyxHQUFHLHFCQUFxQixDQUFDLGNBQU0sT0FBQSxPQUFPLENBQUMsS0FBSyxFQUFiLENBQWEsRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFbEYsb0RBQW9EO0lBQ3BELHVDQUF1QztJQUMxQixRQUFBLEdBQUcsR0FBRyxxQkFBcUIsQ0FBQyxjQUFNLE9BQUEsT0FBTyxDQUFDLEdBQUcsRUFBWCxDQUFXLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRTVFLHFEQUFxRDtJQUN4QyxRQUFBLElBQUksR0FBRyxxQkFBcUIsQ0FBQyxjQUFNLE9BQUEsT0FBTyxDQUFDLElBQUksRUFBWixDQUFZLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRS9FLHNFQUFzRTtJQUN0RSxTQUFTLHFCQUFxQixDQUFDLFdBQTJCLEVBQUUsS0FBaUI7UUFDM0UseUNBQXlDO1FBQ3pDLElBQU0sZUFBZSxHQUFHO1lBQUMsY0FBaUI7aUJBQWpCLFVBQWlCLEVBQWpCLHFCQUFpQixFQUFqQixJQUFpQjtnQkFBakIseUJBQWlCOztZQUN4QyxpQkFBaUIsc0NBQUMsV0FBVyxFQUFFLEtBQUssa0JBQUssSUFBSSxJQUFFO1FBQ2pELENBQUMsQ0FBQztRQUVGLDJFQUEyRTtRQUMzRSxlQUFlLENBQUMsS0FBSyxHQUFHLFVBQUMsSUFBWSxFQUFFLFNBQWlCO1lBQWpCLDBCQUFBLEVBQUEsaUJBQWlCO1lBQ3RELElBQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUNuRSxpQkFBaUIsQ0FBQyxjQUFNLE9BQUEsT0FBTyxFQUFQLENBQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDaEQsQ0FBQyxDQUFDO1FBRUYsc0NBQXNDO1FBQ3RDLGVBQWUsQ0FBQyxRQUFRLEdBQUc7WUFDekIsaUJBQWlCLENBQUMsY0FBTSxPQUFBLE9BQU8sQ0FBQyxRQUFRLEVBQWhCLENBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbkQsQ0FBQyxDQUFDO1FBRUYsT0FBTyxlQUFlLENBQUM7SUFDekIsQ0FBQztJQUVEOzs7Ozs7OztPQVFHO0lBQ0gsU0FBUyxpQkFBaUIsQ0FBQyxXQUEyQixFQUFFLFFBQW9CO1FBQUUsY0FBaUI7YUFBakIsVUFBaUIsRUFBakIscUJBQWlCLEVBQWpCLElBQWlCO1lBQWpCLDZCQUFpQjs7UUFDN0YsSUFBSSxXQUFXLEVBQUUsSUFBSSxRQUFRLEVBQUU7WUFDN0IsV0FBVyxFQUFFLHdEQUFJLElBQUksSUFBRTtTQUN4QjtRQUNELGNBQWMsc0NBQUMsUUFBUSxrQkFBSyxJQUFJLElBQUU7SUFDcEMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxTQUFTLFdBQVc7UUFDbEIsSUFBTSxnQkFBZ0IsR0FBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDN0UsSUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDOUMsSUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO1lBQzFCLE9BQU8seUJBQWlCLENBQUM7U0FDMUI7UUFDRCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBRUQseUNBQXlDO0lBQ3pDLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztJQUNyQiw0Q0FBNEM7SUFDNUMsSUFBSSxvQkFBb0IsR0FBRyxLQUFLLENBQUM7SUFDakM7OztPQUdHO0lBQ0gsSUFBTSxpQkFBaUIsR0FBRyxDQUFDLENBQUM7SUFFNUI7Ozs7Ozs7T0FPRztJQUNILFNBQWdCLDBCQUEwQixDQUFDLElBQWU7UUFDeEQsSUFBSSxvQkFBb0IsRUFBRTtZQUN4QixNQUFNLEtBQUssQ0FBQyw4REFBOEQsQ0FBQyxDQUFDO1NBQzdFO1FBRUQsSUFBTSxHQUFHLEdBQUcsaUJBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNwQyx3RUFBd0U7UUFDeEUsSUFBTSxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN2Qix5REFBeUQ7UUFDekQsSUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakQsV0FBVyxJQUFPLFVBQVUsbUJBQWMsSUFBSSxDQUFDLEVBQUUsU0FBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsa0JBQWEsR0FBRyxPQUFJLENBQUM7UUFFMUYsd0VBQXdFO1FBQ3hFLE9BQU8sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQUMsSUFBWTtZQUM5QixXQUFXLElBQU8sVUFBVSxPQUFJLENBQUM7WUFDakMsV0FBVyxJQUFJLHFCQUFrQixJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLEdBQUcsQ0FBQyxPQUFPLEVBQUUsVUFBTSxDQUFDO1lBQzVFLFdBQVcsSUFBSSxnQkFBYyxJQUFJLE9BQUksQ0FBQztZQUN0QyxxQ0FBcUM7WUFDckMsSUFBTSxXQUFXLEdBQUcsV0FBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFFckQsNENBQTRDO1lBQzVDLFdBQVcsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLHlDQUF5QyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRWpGLGtCQUFhLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBRXhDLDZGQUE2RjtZQUM3RixvQ0FBb0M7WUFDcEMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFO2dCQUNaLElBQU0sV0FBVyxHQUFHLGlCQUFlLEdBQUcsQ0FBQyxPQUFPLEVBQUUsU0FBTSxDQUFDO2dCQUN2RCxPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFjLElBQUksOEJBQXlCLFdBQWEsQ0FBQyxDQUFDO2dCQUN4RSxrQkFBYSxDQUFDLFdBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2FBQzVEO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxzRkFBc0Y7UUFDdEYsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO0lBQzlCLENBQUM7SUFwQ0QsZ0VBb0NDO0lBRUQseUZBQXlGO0lBQ3pGLFNBQVMsY0FBYyxDQUFDLFFBQW9CO1FBQUUsY0FBaUI7YUFBakIsVUFBaUIsRUFBakIscUJBQWlCLEVBQWpCLElBQWlCO1lBQWpCLDZCQUFpQjs7UUFDN0QsSUFBTSxZQUFZLEdBQUcsQ0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLE1BQUcsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzFFLFdBQVcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBRyxZQUFZLFNBQUksQ0FBQyxPQUFJLEVBQXhCLENBQXdCLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDeEYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgY2hhbGsgZnJvbSAnY2hhbGsnO1xuaW1wb3J0IHt3cml0ZUZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge3Byb21wdH0gZnJvbSAnaW5xdWlyZXInO1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCB7QXJndW1lbnRzfSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuL2dpdC9pbmRleCc7XG5cbi8qKiBSZWV4cG9ydCBvZiBjaGFsayBjb2xvcnMgZm9yIGNvbnZlbmllbnQgYWNjZXNzLiAqL1xuZXhwb3J0IGNvbnN0IHJlZDogdHlwZW9mIGNoYWxrID0gY2hhbGsucmVkO1xuZXhwb3J0IGNvbnN0IGdyZWVuOiB0eXBlb2YgY2hhbGsgPSBjaGFsay5ncmVlbjtcbmV4cG9ydCBjb25zdCB5ZWxsb3c6IHR5cGVvZiBjaGFsayA9IGNoYWxrLnllbGxvdztcbmV4cG9ydCBjb25zdCBib2xkOiB0eXBlb2YgY2hhbGsgPSBjaGFsay5ib2xkO1xuZXhwb3J0IGNvbnN0IGJsdWU6IHR5cGVvZiBjaGFsayA9IGNoYWxrLmJsdWU7XG5cbi8qKiBQcm9tcHRzIHRoZSB1c2VyIHdpdGggYSBjb25maXJtYXRpb24gcXVlc3Rpb24gYW5kIGEgc3BlY2lmaWVkIG1lc3NhZ2UuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvbXB0Q29uZmlybShtZXNzYWdlOiBzdHJpbmcsIGRlZmF1bHRWYWx1ZSA9IGZhbHNlKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIHJldHVybiAoYXdhaXQgcHJvbXB0PHtyZXN1bHQ6IGJvb2xlYW59Pih7XG4gICAgICAgICAgIHR5cGU6ICdjb25maXJtJyxcbiAgICAgICAgICAgbmFtZTogJ3Jlc3VsdCcsXG4gICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICAgICAgIGRlZmF1bHQ6IGRlZmF1bHRWYWx1ZSxcbiAgICAgICAgIH0pKVxuICAgICAgLnJlc3VsdDtcbn1cblxuLyoqIFByb21wdHMgdGhlIHVzZXIgZm9yIG9uZSBsaW5lIG9mIGlucHV0LiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByb21wdElucHV0KG1lc3NhZ2U6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiAoYXdhaXQgcHJvbXB0PHtyZXN1bHQ6IHN0cmluZ30+KHt0eXBlOiAnaW5wdXQnLCBuYW1lOiAncmVzdWx0JywgbWVzc2FnZX0pKS5yZXN1bHQ7XG59XG5cbi8qKlxuICogU3VwcG9ydGVkIGxldmVscyBmb3IgbG9nZ2luZyBmdW5jdGlvbnMuXG4gKlxuICogTGV2ZWxzIGFyZSBtYXBwZWQgdG8gbnVtYmVycyB0byByZXByZXNlbnQgYSBoaWVyYXJjaHkgb2YgbG9nZ2luZyBsZXZlbHMuXG4gKi9cbmV4cG9ydCBlbnVtIExPR19MRVZFTFMge1xuICBTSUxFTlQgPSAwLFxuICBFUlJPUiA9IDEsXG4gIFdBUk4gPSAyLFxuICBMT0cgPSAzLFxuICBJTkZPID0gNCxcbiAgREVCVUcgPSA1LFxufVxuXG4vKiogRGVmYXVsdCBsb2cgbGV2ZWwgZm9yIHRoZSB0b29sLiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfTE9HX0xFVkVMID0gTE9HX0xFVkVMUy5JTkZPO1xuXG4vKiogV3JpdGUgdG8gdGhlIGNvbnNvbGUgZm9yIGF0IElORk8gbG9nZ2luZyBsZXZlbCAqL1xuZXhwb3J0IGNvbnN0IGluZm8gPSBidWlsZExvZ0xldmVsRnVuY3Rpb24oKCkgPT4gY29uc29sZS5pbmZvLCBMT0dfTEVWRUxTLklORk8pO1xuXG4vKiogV3JpdGUgdG8gdGhlIGNvbnNvbGUgZm9yIGF0IEVSUk9SIGxvZ2dpbmcgbGV2ZWwgKi9cbmV4cG9ydCBjb25zdCBlcnJvciA9IGJ1aWxkTG9nTGV2ZWxGdW5jdGlvbigoKSA9PiBjb25zb2xlLmVycm9yLCBMT0dfTEVWRUxTLkVSUk9SKTtcblxuLyoqIFdyaXRlIHRvIHRoZSBjb25zb2xlIGZvciBhdCBERUJVRyBsb2dnaW5nIGxldmVsICovXG5leHBvcnQgY29uc3QgZGVidWcgPSBidWlsZExvZ0xldmVsRnVuY3Rpb24oKCkgPT4gY29uc29sZS5kZWJ1ZywgTE9HX0xFVkVMUy5ERUJVRyk7XG5cbi8qKiBXcml0ZSB0byB0aGUgY29uc29sZSBmb3IgYXQgTE9HIGxvZ2dpbmcgbGV2ZWwgKi9cbi8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8tY29uc29sZVxuZXhwb3J0IGNvbnN0IGxvZyA9IGJ1aWxkTG9nTGV2ZWxGdW5jdGlvbigoKSA9PiBjb25zb2xlLmxvZywgTE9HX0xFVkVMUy5MT0cpO1xuXG4vKiogV3JpdGUgdG8gdGhlIGNvbnNvbGUgZm9yIGF0IFdBUk4gbG9nZ2luZyBsZXZlbCAqL1xuZXhwb3J0IGNvbnN0IHdhcm4gPSBidWlsZExvZ0xldmVsRnVuY3Rpb24oKCkgPT4gY29uc29sZS53YXJuLCBMT0dfTEVWRUxTLldBUk4pO1xuXG4vKiogQnVpbGQgYW4gaW5zdGFuY2Ugb2YgYSBsb2dnaW5nIGZ1bmN0aW9uIGZvciB0aGUgcHJvdmlkZWQgbGV2ZWwuICovXG5mdW5jdGlvbiBidWlsZExvZ0xldmVsRnVuY3Rpb24obG9hZENvbW1hbmQ6ICgpID0+IEZ1bmN0aW9uLCBsZXZlbDogTE9HX0xFVkVMUykge1xuICAvKiogV3JpdGUgdG8gc3Rkb3V0IGZvciB0aGUgTE9HX0xFVkVMLiAqL1xuICBjb25zdCBsb2dnaW5nRnVuY3Rpb24gPSAoLi4udGV4dDogc3RyaW5nW10pID0+IHtcbiAgICBydW5Db25zb2xlQ29tbWFuZChsb2FkQ29tbWFuZCwgbGV2ZWwsIC4uLnRleHQpO1xuICB9O1xuXG4gIC8qKiBTdGFydCBhIGdyb3VwIGF0IHRoZSBMT0dfTEVWRUwsIG9wdGlvbmFsbHkgc3RhcnRpbmcgaXQgYXMgY29sbGFwc2VkLiAqL1xuICBsb2dnaW5nRnVuY3Rpb24uZ3JvdXAgPSAodGV4dDogc3RyaW5nLCBjb2xsYXBzZWQgPSBmYWxzZSkgPT4ge1xuICAgIGNvbnN0IGNvbW1hbmQgPSBjb2xsYXBzZWQgPyBjb25zb2xlLmdyb3VwQ29sbGFwc2VkIDogY29uc29sZS5ncm91cDtcbiAgICBydW5Db25zb2xlQ29tbWFuZCgoKSA9PiBjb21tYW5kLCBsZXZlbCwgdGV4dCk7XG4gIH07XG5cbiAgLyoqIEVuZCB0aGUgZ3JvdXAgYXQgdGhlIExPR19MRVZFTC4gKi9cbiAgbG9nZ2luZ0Z1bmN0aW9uLmdyb3VwRW5kID0gKCkgPT4ge1xuICAgIHJ1bkNvbnNvbGVDb21tYW5kKCgpID0+IGNvbnNvbGUuZ3JvdXBFbmQsIGxldmVsKTtcbiAgfTtcblxuICByZXR1cm4gbG9nZ2luZ0Z1bmN0aW9uO1xufVxuXG4vKipcbiAqIFJ1biB0aGUgY29uc29sZSBjb21tYW5kIHByb3ZpZGVkLCBpZiB0aGUgZW52aXJvbm1lbnRzIGxvZ2dpbmcgbGV2ZWwgZ3JlYXRlciB0aGFuIHRoZVxuICogcHJvdmlkZWQgbG9nZ2luZyBsZXZlbC5cbiAqXG4gKiBUaGUgbG9hZENvbW1hbmQgdGFrZXMgaW4gYSBmdW5jdGlvbiB3aGljaCBpcyBjYWxsZWQgdG8gcmV0cmlldmUgdGhlIGNvbnNvbGUuKiBmdW5jdGlvblxuICogdG8gYWxsb3cgZm9yIGphc21pbmUgc3BpZXMgdG8gc3RpbGwgd29yayBpbiB0ZXN0aW5nLiAgV2l0aG91dCB0aGlzIG1ldGhvZCBvZiByZXRyaWV2YWxcbiAqIHRoZSBjb25zb2xlLiogZnVuY3Rpb24sIHRoZSBmdW5jdGlvbiBpcyBzYXZlZCBpbnRvIHRoZSBjbG9zdXJlIG9mIHRoZSBjcmVhdGVkIGxvZ2dpbmdcbiAqIGZ1bmN0aW9uIGJlZm9yZSBqYXNtaW5lIGNhbiBzcHkuXG4gKi9cbmZ1bmN0aW9uIHJ1bkNvbnNvbGVDb21tYW5kKGxvYWRDb21tYW5kOiAoKSA9PiBGdW5jdGlvbiwgbG9nTGV2ZWw6IExPR19MRVZFTFMsIC4uLnRleHQ6IHN0cmluZ1tdKSB7XG4gIGlmIChnZXRMb2dMZXZlbCgpID49IGxvZ0xldmVsKSB7XG4gICAgbG9hZENvbW1hbmQoKSguLi50ZXh0KTtcbiAgfVxuICBwcmludFRvTG9nRmlsZShsb2dMZXZlbCwgLi4udGV4dCk7XG59XG5cbi8qKlxuICogUmV0cmlldmUgdGhlIGxvZyBsZXZlbCBmcm9tIGVudmlyb25tZW50IHZhcmlhYmxlcywgaWYgdGhlIHZhbHVlIGZvdW5kXG4gKiBiYXNlZCBvbiB0aGUgTE9HX0xFVkVMIGVudmlyb25tZW50IHZhcmlhYmxlIGlzIHVuZGVmaW5lZCwgcmV0dXJuIHRoZSBkZWZhdWx0XG4gKiBsb2dnaW5nIGxldmVsLlxuICovXG5mdW5jdGlvbiBnZXRMb2dMZXZlbCgpIHtcbiAgY29uc3QgbG9nTGV2ZWxFbnZWYWx1ZTogYW55ID0gKHByb2Nlc3MuZW52W2BMT0dfTEVWRUxgXSB8fCAnJykudG9VcHBlckNhc2UoKTtcbiAgY29uc3QgbG9nTGV2ZWwgPSBMT0dfTEVWRUxTW2xvZ0xldmVsRW52VmFsdWVdO1xuICBpZiAobG9nTGV2ZWwgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBERUZBVUxUX0xPR19MRVZFTDtcbiAgfVxuICByZXR1cm4gbG9nTGV2ZWw7XG59XG5cbi8qKiBBbGwgdGV4dCB0byB3cml0ZSB0byB0aGUgbG9nIGZpbGUuICovXG5sZXQgTE9HR0VEX1RFWFQgPSAnJztcbi8qKiBXaGV0aGVyIGZpbGUgbG9nZ2luZyBhcyBiZWVuIGVuYWJsZWQuICovXG5sZXQgRklMRV9MT0dHSU5HX0VOQUJMRUQgPSBmYWxzZTtcbi8qKlxuICogVGhlIG51bWJlciBvZiBjb2x1bW5zIHVzZWQgaW4gdGhlIHByZXBlbmRlZCBsb2cgbGV2ZWwgaW5mb3JtYXRpb24gb24gZWFjaCBsaW5lIG9mIHRoZSBsb2dnaW5nXG4gKiBvdXRwdXQgZmlsZS5cbiAqL1xuY29uc3QgTE9HX0xFVkVMX0NPTFVNTlMgPSA3O1xuXG4vKipcbiAqIEVuYWJsZSB3cml0aW5nIHRoZSBsb2dnZWQgb3V0cHV0cyB0byB0aGUgbG9nIGZpbGUgb24gcHJvY2VzcyBleGl0LCBzZXRzIGluaXRpYWwgbGluZXMgZnJvbSB0aGVcbiAqIGNvbW1hbmQgZXhlY3V0aW9uLCBjb250YWluaW5nIGluZm9ybWF0aW9uIGFib3V0IHRoZSB0aW1pbmcgYW5kIGNvbW1hbmQgcGFyYW1ldGVycy5cbiAqXG4gKiBUaGlzIGlzIGV4cGVjdGVkIHRvIGJlIGNhbGxlZCBvbmx5IG9uY2UgZHVyaW5nIGEgY29tbWFuZCBydW4sIGFuZCBzaG91bGQgYmUgY2FsbGVkIGJ5IHRoZVxuICogbWlkZGxld2FyZSBvZiB5YXJncyB0byBlbmFibGUgdGhlIGZpbGUgbG9nZ2luZyBiZWZvcmUgdGhlIHJlc3Qgb2YgdGhlIGNvbW1hbmQgcGFyc2luZyBhbmRcbiAqIHJlc3BvbnNlIGlzIGV4ZWN1dGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FwdHVyZUxvZ091dHB1dEZvckNvbW1hbmQoYXJndjogQXJndW1lbnRzKSB7XG4gIGlmIChGSUxFX0xPR0dJTkdfRU5BQkxFRCkge1xuICAgIHRocm93IEVycm9yKCdgY2FwdHVyZUxvZ091dHB1dEZvckNvbW1hbmRgIGNhbm5vdCBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMnKTtcbiAgfVxuXG4gIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXRJbnN0YW5jZSgpO1xuICAvKiogVGhlIGRhdGUgdGltZSB1c2VkIGZvciB0aW1lc3RhbXBpbmcgd2hlbiB0aGUgY29tbWFuZCB3YXMgaW52b2tlZC4gKi9cbiAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcbiAgLyoqIEhlYWRlciBsaW5lIHRvIHNlcGFyYXRlIGNvbW1hbmQgcnVucyBpbiBsb2cgZmlsZXMuICovXG4gIGNvbnN0IGhlYWRlckxpbmUgPSBBcnJheSgxMDApLmZpbGwoJyMnKS5qb2luKCcnKTtcbiAgTE9HR0VEX1RFWFQgKz0gYCR7aGVhZGVyTGluZX1cXG5Db21tYW5kOiAke2FyZ3YuJDB9ICR7YXJndi5fLmpvaW4oJyAnKX1cXG5SYW4gYXQ6ICR7bm93fVxcbmA7XG5cbiAgLy8gT24gcHJvY2VzcyBleGl0LCB3cml0ZSB0aGUgbG9nZ2VkIG91dHB1dCB0byB0aGUgYXBwcm9wcmlhdGUgbG9nIGZpbGVzXG4gIHByb2Nlc3Mub24oJ2V4aXQnLCAoY29kZTogbnVtYmVyKSA9PiB7XG4gICAgTE9HR0VEX1RFWFQgKz0gYCR7aGVhZGVyTGluZX1cXG5gO1xuICAgIExPR0dFRF9URVhUICs9IGBDb21tYW5kIHJhbiBpbiAke25ldyBEYXRlKCkuZ2V0VGltZSgpIC0gbm93LmdldFRpbWUoKX1tc1xcbmA7XG4gICAgTE9HR0VEX1RFWFQgKz0gYEV4aXQgQ29kZTogJHtjb2RlfVxcbmA7XG4gICAgLyoqIFBhdGggdG8gdGhlIGxvZyBmaWxlIGxvY2F0aW9uLiAqL1xuICAgIGNvbnN0IGxvZ0ZpbGVQYXRoID0gam9pbihnaXQuYmFzZURpciwgJy5uZy1kZXYubG9nJyk7XG5cbiAgICAvLyBTdHJpcCBBTlNJIGVzY2FwZSBjb2RlcyBmcm9tIGxvZyBvdXRwdXRzLlxuICAgIExPR0dFRF9URVhUID0gTE9HR0VEX1RFWFQucmVwbGFjZSgvXFx4MUJcXFsoWzAtOV17MSwzfSg7WzAtOV17MSwyfSk/KT9bbUdLXS9nLCAnJyk7XG5cbiAgICB3cml0ZUZpbGVTeW5jKGxvZ0ZpbGVQYXRoLCBMT0dHRURfVEVYVCk7XG5cbiAgICAvLyBGb3IgZmFpbHVyZSBjb2RlcyBncmVhdGVyIHRoYW4gMSwgdGhlIG5ldyBsb2dnZWQgbGluZXMgc2hvdWxkIGJlIHdyaXR0ZW4gdG8gYSBzcGVjaWZpYyBsb2dcbiAgICAvLyBmaWxlIGZvciB0aGUgY29tbWFuZCBydW4gZmFpbHVyZS5cbiAgICBpZiAoY29kZSA+IDEpIHtcbiAgICAgIGNvbnN0IGxvZ0ZpbGVOYW1lID0gYC5uZy1kZXYuZXJyLSR7bm93LmdldFRpbWUoKX0ubG9nYDtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYEV4aXQgY29kZTogJHtjb2RlfS4gV3JpdGluZyBmdWxsIGxvZyB0byAke2xvZ0ZpbGVOYW1lfWApO1xuICAgICAgd3JpdGVGaWxlU3luYyhqb2luKGdpdC5iYXNlRGlyLCBsb2dGaWxlTmFtZSksIExPR0dFRF9URVhUKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIE1hcmsgZmlsZSBsb2dnaW5nIGFzIGVuYWJsZWQgdG8gcHJldmVudCB0aGUgZnVuY3Rpb24gZnJvbSBleGVjdXRpbmcgbXVsdGlwbGUgdGltZXMuXG4gIEZJTEVfTE9HR0lOR19FTkFCTEVEID0gdHJ1ZTtcbn1cblxuLyoqIFdyaXRlIHRoZSBwcm92aWRlZCB0ZXh0IHRvIHRoZSBsb2cgZmlsZSwgcHJlcGVuZGluZyBlYWNoIGxpbmUgd2l0aCB0aGUgbG9nIGxldmVsLiAgKi9cbmZ1bmN0aW9uIHByaW50VG9Mb2dGaWxlKGxvZ0xldmVsOiBMT0dfTEVWRUxTLCAuLi50ZXh0OiBzdHJpbmdbXSkge1xuICBjb25zdCBsb2dMZXZlbFRleHQgPSBgJHtMT0dfTEVWRUxTW2xvZ0xldmVsXX06YC5wYWRFbmQoTE9HX0xFVkVMX0NPTFVNTlMpO1xuICBMT0dHRURfVEVYVCArPSB0ZXh0LmpvaW4oJyAnKS5zcGxpdCgnXFxuJykubWFwKGwgPT4gYCR7bG9nTGV2ZWxUZXh0fSAke2x9XFxuYCkuam9pbignJyk7XG59XG4iXX0=