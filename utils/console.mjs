/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter, __generator, __read, __spreadArray } from "tslib";
import * as chalk from 'chalk';
import { writeFileSync } from 'fs';
import { prompt } from 'inquirer';
import { join } from 'path';
import { GitClient } from './git/git-client';
/** Reexport of chalk colors for convenient access. */
export var red = chalk.red;
export var green = chalk.green;
export var yellow = chalk.yellow;
export var bold = chalk.bold;
export var blue = chalk.blue;
/** Prompts the user with a confirmation question and a specified message. */
export function promptConfirm(message, defaultValue) {
    if (defaultValue === void 0) { defaultValue = false; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prompt({
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
/** Prompts the user for one line of input. */
export function promptInput(message) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prompt({ type: 'input', name: 'result', message: message })];
                case 1: return [2 /*return*/, (_a.sent()).result];
            }
        });
    });
}
/**
 * Supported levels for logging functions.
 *
 * Levels are mapped to numbers to represent a hierarchy of logging levels.
 */
export var LOG_LEVELS;
(function (LOG_LEVELS) {
    LOG_LEVELS[LOG_LEVELS["SILENT"] = 0] = "SILENT";
    LOG_LEVELS[LOG_LEVELS["ERROR"] = 1] = "ERROR";
    LOG_LEVELS[LOG_LEVELS["WARN"] = 2] = "WARN";
    LOG_LEVELS[LOG_LEVELS["LOG"] = 3] = "LOG";
    LOG_LEVELS[LOG_LEVELS["INFO"] = 4] = "INFO";
    LOG_LEVELS[LOG_LEVELS["DEBUG"] = 5] = "DEBUG";
})(LOG_LEVELS || (LOG_LEVELS = {}));
/** Default log level for the tool. */
export var DEFAULT_LOG_LEVEL = LOG_LEVELS.INFO;
/** Write to the console for at INFO logging level */
export var info = buildLogLevelFunction(function () { return console.info; }, LOG_LEVELS.INFO);
/** Write to the console for at ERROR logging level */
export var error = buildLogLevelFunction(function () { return console.error; }, LOG_LEVELS.ERROR);
/** Write to the console for at DEBUG logging level */
export var debug = buildLogLevelFunction(function () { return console.debug; }, LOG_LEVELS.DEBUG);
/** Write to the console for at LOG logging level */
// tslint:disable-next-line: no-console
export var log = buildLogLevelFunction(function () { return console.log; }, LOG_LEVELS.LOG);
/** Write to the console for at WARN logging level */
export var warn = buildLogLevelFunction(function () { return console.warn; }, LOG_LEVELS.WARN);
/** Build an instance of a logging function for the provided level. */
function buildLogLevelFunction(loadCommand, level) {
    /** Write to stdout for the LOG_LEVEL. */
    var loggingFunction = function () {
        var text = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            text[_i] = arguments[_i];
        }
        runConsoleCommand.apply(void 0, __spreadArray([loadCommand, level], __read(text)));
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
        loadCommand().apply(void 0, __spreadArray([], __read(text)));
    }
    printToLogFile.apply(void 0, __spreadArray([logLevel], __read(text)));
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
        return DEFAULT_LOG_LEVEL;
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
export function captureLogOutputForCommand(argv) {
    if (FILE_LOGGING_ENABLED) {
        throw Error('`captureLogOutputForCommand` cannot be called multiple times');
    }
    var git = GitClient.get();
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
        var logFilePath = join(git.baseDir, '.ng-dev.log');
        // Strip ANSI escape codes from log outputs.
        LOGGED_TEXT = LOGGED_TEXT.replace(/\x1B\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]/g, '');
        writeFileSync(logFilePath, LOGGED_TEXT);
        // For failure codes greater than 1, the new logged lines should be written to a specific log
        // file for the command run failure.
        if (code > 1) {
            var logFileName = ".ng-dev.err-" + now.getTime() + ".log";
            console.error("Exit code: " + code + ". Writing full log to " + logFileName);
            writeFileSync(join(git.baseDir, logFileName), LOGGED_TEXT);
        }
    });
    // Mark file logging as enabled to prevent the function from executing multiple times.
    FILE_LOGGING_ENABLED = true;
}
/** Write the provided text to the log file, prepending each line with the log level.  */
function printToLogFile(logLevel) {
    var text = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        text[_i - 1] = arguments[_i];
    }
    var logLevelText = (LOG_LEVELS[logLevel] + ":").padEnd(LOG_LEVEL_COLUMNS);
    LOGGED_TEXT += text.join(' ').split('\n').map(function (l) { return logLevelText + " " + l + "\n"; }).join('');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9jb25zb2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sSUFBSSxDQUFDO0FBQ2pDLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDaEMsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUcxQixPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFFM0Msc0RBQXNEO0FBQ3RELE1BQU0sQ0FBQyxJQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDO0FBQzdCLE1BQU0sQ0FBQyxJQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQ2pDLE1BQU0sQ0FBQyxJQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQ25DLE1BQU0sQ0FBQyxJQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQy9CLE1BQU0sQ0FBQyxJQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBRS9CLDZFQUE2RTtBQUM3RSxNQUFNLFVBQWdCLGFBQWEsQ0FBQyxPQUFlLEVBQUUsWUFBb0I7SUFBcEIsNkJBQUEsRUFBQSxvQkFBb0I7Ozs7d0JBQy9ELHFCQUFNLE1BQU0sQ0FBb0I7d0JBQy9CLElBQUksRUFBRSxTQUFTO3dCQUNmLElBQUksRUFBRSxRQUFRO3dCQUNkLE9BQU8sRUFBRSxPQUFPO3dCQUNoQixPQUFPLEVBQUUsWUFBWTtxQkFDdEIsQ0FBQyxFQUFBO3dCQUxULHNCQUFPLENBQUMsU0FLQyxDQUFDO3lCQUNMLE1BQU0sRUFBQzs7OztDQUNiO0FBRUQsOENBQThDO0FBQzlDLE1BQU0sVUFB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RyxVQUFVLENBQUMsUUFBUSxDQUFDLE1BQUcsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQzFFLFdBQVcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBRyxZQUFZLFNBQUksQ0FBQyxPQUFJLEVBQXhCLENBQXdCLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBjaGFsayBmcm9tICdjaGFsayc7XG5pbXBvcnQge3dyaXRlRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7cHJvbXB0fSBmcm9tICdpbnF1aXJlcic7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtBcmd1bWVudHN9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4vZ2l0L2dpdC1jbGllbnQnO1xuXG4vKiogUmVleHBvcnQgb2YgY2hhbGsgY29sb3JzIGZvciBjb252ZW5pZW50IGFjY2Vzcy4gKi9cbmV4cG9ydCBjb25zdCByZWQgPSBjaGFsay5yZWQ7XG5leHBvcnQgY29uc3QgZ3JlZW4gPSBjaGFsay5ncmVlbjtcbmV4cG9ydCBjb25zdCB5ZWxsb3cgPSBjaGFsay55ZWxsb3c7XG5leHBvcnQgY29uc3QgYm9sZCA9IGNoYWxrLmJvbGQ7XG5leHBvcnQgY29uc3QgYmx1ZSA9IGNoYWxrLmJsdWU7XG5cbi8qKiBQcm9tcHRzIHRoZSB1c2VyIHdpdGggYSBjb25maXJtYXRpb24gcXVlc3Rpb24gYW5kIGEgc3BlY2lmaWVkIG1lc3NhZ2UuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvbXB0Q29uZmlybShtZXNzYWdlOiBzdHJpbmcsIGRlZmF1bHRWYWx1ZSA9IGZhbHNlKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIHJldHVybiAoYXdhaXQgcHJvbXB0PHtyZXN1bHQ6IGJvb2xlYW59Pih7XG4gICAgICAgICAgIHR5cGU6ICdjb25maXJtJyxcbiAgICAgICAgICAgbmFtZTogJ3Jlc3VsdCcsXG4gICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICAgICAgIGRlZmF1bHQ6IGRlZmF1bHRWYWx1ZSxcbiAgICAgICAgIH0pKVxuICAgICAgLnJlc3VsdDtcbn1cblxuLyoqIFByb21wdHMgdGhlIHVzZXIgZm9yIG9uZSBsaW5lIG9mIGlucHV0LiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByb21wdElucHV0KG1lc3NhZ2U6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiAoYXdhaXQgcHJvbXB0PHtyZXN1bHQ6IHN0cmluZ30+KHt0eXBlOiAnaW5wdXQnLCBuYW1lOiAncmVzdWx0JywgbWVzc2FnZX0pKS5yZXN1bHQ7XG59XG5cbi8qKlxuICogU3VwcG9ydGVkIGxldmVscyBmb3IgbG9nZ2luZyBmdW5jdGlvbnMuXG4gKlxuICogTGV2ZWxzIGFyZSBtYXBwZWQgdG8gbnVtYmVycyB0byByZXByZXNlbnQgYSBoaWVyYXJjaHkgb2YgbG9nZ2luZyBsZXZlbHMuXG4gKi9cbmV4cG9ydCBlbnVtIExPR19MRVZFTFMge1xuICBTSUxFTlQgPSAwLFxuICBFUlJPUiA9IDEsXG4gIFdBUk4gPSAyLFxuICBMT0cgPSAzLFxuICBJTkZPID0gNCxcbiAgREVCVUcgPSA1LFxufVxuXG4vKiogRGVmYXVsdCBsb2cgbGV2ZWwgZm9yIHRoZSB0b29sLiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfTE9HX0xFVkVMID0gTE9HX0xFVkVMUy5JTkZPO1xuXG4vKiogV3JpdGUgdG8gdGhlIGNvbnNvbGUgZm9yIGF0IElORk8gbG9nZ2luZyBsZXZlbCAqL1xuZXhwb3J0IGNvbnN0IGluZm8gPSBidWlsZExvZ0xldmVsRnVuY3Rpb24oKCkgPT4gY29uc29sZS5pbmZvLCBMT0dfTEVWRUxTLklORk8pO1xuXG4vKiogV3JpdGUgdG8gdGhlIGNvbnNvbGUgZm9yIGF0IEVSUk9SIGxvZ2dpbmcgbGV2ZWwgKi9cbmV4cG9ydCBjb25zdCBlcnJvciA9IGJ1aWxkTG9nTGV2ZWxGdW5jdGlvbigoKSA9PiBjb25zb2xlLmVycm9yLCBMT0dfTEVWRUxTLkVSUk9SKTtcblxuLyoqIFdyaXRlIHRvIHRoZSBjb25zb2xlIGZvciBhdCBERUJVRyBsb2dnaW5nIGxldmVsICovXG5leHBvcnQgY29uc3QgZGVidWcgPSBidWlsZExvZ0xldmVsRnVuY3Rpb24oKCkgPT4gY29uc29sZS5kZWJ1ZywgTE9HX0xFVkVMUy5ERUJVRyk7XG5cbi8qKiBXcml0ZSB0byB0aGUgY29uc29sZSBmb3IgYXQgTE9HIGxvZ2dpbmcgbGV2ZWwgKi9cbi8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8tY29uc29sZVxuZXhwb3J0IGNvbnN0IGxvZyA9IGJ1aWxkTG9nTGV2ZWxGdW5jdGlvbigoKSA9PiBjb25zb2xlLmxvZywgTE9HX0xFVkVMUy5MT0cpO1xuXG4vKiogV3JpdGUgdG8gdGhlIGNvbnNvbGUgZm9yIGF0IFdBUk4gbG9nZ2luZyBsZXZlbCAqL1xuZXhwb3J0IGNvbnN0IHdhcm4gPSBidWlsZExvZ0xldmVsRnVuY3Rpb24oKCkgPT4gY29uc29sZS53YXJuLCBMT0dfTEVWRUxTLldBUk4pO1xuXG4vKiogQnVpbGQgYW4gaW5zdGFuY2Ugb2YgYSBsb2dnaW5nIGZ1bmN0aW9uIGZvciB0aGUgcHJvdmlkZWQgbGV2ZWwuICovXG5mdW5jdGlvbiBidWlsZExvZ0xldmVsRnVuY3Rpb24obG9hZENvbW1hbmQ6ICgpID0+IEZ1bmN0aW9uLCBsZXZlbDogTE9HX0xFVkVMUykge1xuICAvKiogV3JpdGUgdG8gc3Rkb3V0IGZvciB0aGUgTE9HX0xFVkVMLiAqL1xuICBjb25zdCBsb2dnaW5nRnVuY3Rpb24gPSAoLi4udGV4dDogc3RyaW5nW10pID0+IHtcbiAgICBydW5Db25zb2xlQ29tbWFuZChsb2FkQ29tbWFuZCwgbGV2ZWwsIC4uLnRleHQpO1xuICB9O1xuXG4gIC8qKiBTdGFydCBhIGdyb3VwIGF0IHRoZSBMT0dfTEVWRUwsIG9wdGlvbmFsbHkgc3RhcnRpbmcgaXQgYXMgY29sbGFwc2VkLiAqL1xuICBsb2dnaW5nRnVuY3Rpb24uZ3JvdXAgPSAodGV4dDogc3RyaW5nLCBjb2xsYXBzZWQgPSBmYWxzZSkgPT4ge1xuICAgIGNvbnN0IGNvbW1hbmQgPSBjb2xsYXBzZWQgPyBjb25zb2xlLmdyb3VwQ29sbGFwc2VkIDogY29uc29sZS5ncm91cDtcbiAgICBydW5Db25zb2xlQ29tbWFuZCgoKSA9PiBjb21tYW5kLCBsZXZlbCwgdGV4dCk7XG4gIH07XG5cbiAgLyoqIEVuZCB0aGUgZ3JvdXAgYXQgdGhlIExPR19MRVZFTC4gKi9cbiAgbG9nZ2luZ0Z1bmN0aW9uLmdyb3VwRW5kID0gKCkgPT4ge1xuICAgIHJ1bkNvbnNvbGVDb21tYW5kKCgpID0+IGNvbnNvbGUuZ3JvdXBFbmQsIGxldmVsKTtcbiAgfTtcblxuICByZXR1cm4gbG9nZ2luZ0Z1bmN0aW9uO1xufVxuXG4vKipcbiAqIFJ1biB0aGUgY29uc29sZSBjb21tYW5kIHByb3ZpZGVkLCBpZiB0aGUgZW52aXJvbm1lbnRzIGxvZ2dpbmcgbGV2ZWwgZ3JlYXRlciB0aGFuIHRoZVxuICogcHJvdmlkZWQgbG9nZ2luZyBsZXZlbC5cbiAqXG4gKiBUaGUgbG9hZENvbW1hbmQgdGFrZXMgaW4gYSBmdW5jdGlvbiB3aGljaCBpcyBjYWxsZWQgdG8gcmV0cmlldmUgdGhlIGNvbnNvbGUuKiBmdW5jdGlvblxuICogdG8gYWxsb3cgZm9yIGphc21pbmUgc3BpZXMgdG8gc3RpbGwgd29yayBpbiB0ZXN0aW5nLiAgV2l0aG91dCB0aGlzIG1ldGhvZCBvZiByZXRyaWV2YWxcbiAqIHRoZSBjb25zb2xlLiogZnVuY3Rpb24sIHRoZSBmdW5jdGlvbiBpcyBzYXZlZCBpbnRvIHRoZSBjbG9zdXJlIG9mIHRoZSBjcmVhdGVkIGxvZ2dpbmdcbiAqIGZ1bmN0aW9uIGJlZm9yZSBqYXNtaW5lIGNhbiBzcHkuXG4gKi9cbmZ1bmN0aW9uIHJ1bkNvbnNvbGVDb21tYW5kKGxvYWRDb21tYW5kOiAoKSA9PiBGdW5jdGlvbiwgbG9nTGV2ZWw6IExPR19MRVZFTFMsIC4uLnRleHQ6IHN0cmluZ1tdKSB7XG4gIGlmIChnZXRMb2dMZXZlbCgpID49IGxvZ0xldmVsKSB7XG4gICAgbG9hZENvbW1hbmQoKSguLi50ZXh0KTtcbiAgfVxuICBwcmludFRvTG9nRmlsZShsb2dMZXZlbCwgLi4udGV4dCk7XG59XG5cbi8qKlxuICogUmV0cmlldmUgdGhlIGxvZyBsZXZlbCBmcm9tIGVudmlyb25tZW50IHZhcmlhYmxlcywgaWYgdGhlIHZhbHVlIGZvdW5kXG4gKiBiYXNlZCBvbiB0aGUgTE9HX0xFVkVMIGVudmlyb25tZW50IHZhcmlhYmxlIGlzIHVuZGVmaW5lZCwgcmV0dXJuIHRoZSBkZWZhdWx0XG4gKiBsb2dnaW5nIGxldmVsLlxuICovXG5mdW5jdGlvbiBnZXRMb2dMZXZlbCgpIHtcbiAgY29uc3QgbG9nTGV2ZWxFbnZWYWx1ZTogYW55ID0gKHByb2Nlc3MuZW52W2BMT0dfTEVWRUxgXSB8fCAnJykudG9VcHBlckNhc2UoKTtcbiAgY29uc3QgbG9nTGV2ZWwgPSBMT0dfTEVWRUxTW2xvZ0xldmVsRW52VmFsdWVdO1xuICBpZiAobG9nTGV2ZWwgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBERUZBVUxUX0xPR19MRVZFTDtcbiAgfVxuICByZXR1cm4gbG9nTGV2ZWw7XG59XG5cbi8qKiBBbGwgdGV4dCB0byB3cml0ZSB0byB0aGUgbG9nIGZpbGUuICovXG5sZXQgTE9HR0VEX1RFWFQgPSAnJztcbi8qKiBXaGV0aGVyIGZpbGUgbG9nZ2luZyBhcyBiZWVuIGVuYWJsZWQuICovXG5sZXQgRklMRV9MT0dHSU5HX0VOQUJMRUQgPSBmYWxzZTtcbi8qKlxuICogVGhlIG51bWJlciBvZiBjb2x1bW5zIHVzZWQgaW4gdGhlIHByZXBlbmRlZCBsb2cgbGV2ZWwgaW5mb3JtYXRpb24gb24gZWFjaCBsaW5lIG9mIHRoZSBsb2dnaW5nXG4gKiBvdXRwdXQgZmlsZS5cbiAqL1xuY29uc3QgTE9HX0xFVkVMX0NPTFVNTlMgPSA3O1xuXG4vKipcbiAqIEVuYWJsZSB3cml0aW5nIHRoZSBsb2dnZWQgb3V0cHV0cyB0byB0aGUgbG9nIGZpbGUgb24gcHJvY2VzcyBleGl0LCBzZXRzIGluaXRpYWwgbGluZXMgZnJvbSB0aGVcbiAqIGNvbW1hbmQgZXhlY3V0aW9uLCBjb250YWluaW5nIGluZm9ybWF0aW9uIGFib3V0IHRoZSB0aW1pbmcgYW5kIGNvbW1hbmQgcGFyYW1ldGVycy5cbiAqXG4gKiBUaGlzIGlzIGV4cGVjdGVkIHRvIGJlIGNhbGxlZCBvbmx5IG9uY2UgZHVyaW5nIGEgY29tbWFuZCBydW4sIGFuZCBzaG91bGQgYmUgY2FsbGVkIGJ5IHRoZVxuICogbWlkZGxld2FyZSBvZiB5YXJncyB0byBlbmFibGUgdGhlIGZpbGUgbG9nZ2luZyBiZWZvcmUgdGhlIHJlc3Qgb2YgdGhlIGNvbW1hbmQgcGFyc2luZyBhbmRcbiAqIHJlc3BvbnNlIGlzIGV4ZWN1dGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FwdHVyZUxvZ091dHB1dEZvckNvbW1hbmQoYXJndjogQXJndW1lbnRzKSB7XG4gIGlmIChGSUxFX0xPR0dJTkdfRU5BQkxFRCkge1xuICAgIHRocm93IEVycm9yKCdgY2FwdHVyZUxvZ091dHB1dEZvckNvbW1hbmRgIGNhbm5vdCBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMnKTtcbiAgfVxuXG4gIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgLyoqIFRoZSBkYXRlIHRpbWUgdXNlZCBmb3IgdGltZXN0YW1waW5nIHdoZW4gdGhlIGNvbW1hbmQgd2FzIGludm9rZWQuICovXG4gIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG4gIC8qKiBIZWFkZXIgbGluZSB0byBzZXBhcmF0ZSBjb21tYW5kIHJ1bnMgaW4gbG9nIGZpbGVzLiAqL1xuICBjb25zdCBoZWFkZXJMaW5lID0gQXJyYXkoMTAwKS5maWxsKCcjJykuam9pbignJyk7XG4gIExPR0dFRF9URVhUICs9IGAke2hlYWRlckxpbmV9XFxuQ29tbWFuZDogJHthcmd2LiQwfSAke2FyZ3YuXy5qb2luKCcgJyl9XFxuUmFuIGF0OiAke25vd31cXG5gO1xuXG4gIC8vIE9uIHByb2Nlc3MgZXhpdCwgd3JpdGUgdGhlIGxvZ2dlZCBvdXRwdXQgdG8gdGhlIGFwcHJvcHJpYXRlIGxvZyBmaWxlc1xuICBwcm9jZXNzLm9uKCdleGl0JywgKGNvZGU6IG51bWJlcikgPT4ge1xuICAgIExPR0dFRF9URVhUICs9IGAke2hlYWRlckxpbmV9XFxuYDtcbiAgICBMT0dHRURfVEVYVCArPSBgQ29tbWFuZCByYW4gaW4gJHtuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIG5vdy5nZXRUaW1lKCl9bXNcXG5gO1xuICAgIExPR0dFRF9URVhUICs9IGBFeGl0IENvZGU6ICR7Y29kZX1cXG5gO1xuICAgIC8qKiBQYXRoIHRvIHRoZSBsb2cgZmlsZSBsb2NhdGlvbi4gKi9cbiAgICBjb25zdCBsb2dGaWxlUGF0aCA9IGpvaW4oZ2l0LmJhc2VEaXIsICcubmctZGV2LmxvZycpO1xuXG4gICAgLy8gU3RyaXAgQU5TSSBlc2NhcGUgY29kZXMgZnJvbSBsb2cgb3V0cHV0cy5cbiAgICBMT0dHRURfVEVYVCA9IExPR0dFRF9URVhULnJlcGxhY2UoL1xceDFCXFxbKFswLTldezEsM30oO1swLTldezEsMn0pPyk/W21HS10vZywgJycpO1xuXG4gICAgd3JpdGVGaWxlU3luYyhsb2dGaWxlUGF0aCwgTE9HR0VEX1RFWFQpO1xuXG4gICAgLy8gRm9yIGZhaWx1cmUgY29kZXMgZ3JlYXRlciB0aGFuIDEsIHRoZSBuZXcgbG9nZ2VkIGxpbmVzIHNob3VsZCBiZSB3cml0dGVuIHRvIGEgc3BlY2lmaWMgbG9nXG4gICAgLy8gZmlsZSBmb3IgdGhlIGNvbW1hbmQgcnVuIGZhaWx1cmUuXG4gICAgaWYgKGNvZGUgPiAxKSB7XG4gICAgICBjb25zdCBsb2dGaWxlTmFtZSA9IGAubmctZGV2LmVyci0ke25vdy5nZXRUaW1lKCl9LmxvZ2A7XG4gICAgICBjb25zb2xlLmVycm9yKGBFeGl0IGNvZGU6ICR7Y29kZX0uIFdyaXRpbmcgZnVsbCBsb2cgdG8gJHtsb2dGaWxlTmFtZX1gKTtcbiAgICAgIHdyaXRlRmlsZVN5bmMoam9pbihnaXQuYmFzZURpciwgbG9nRmlsZU5hbWUpLCBMT0dHRURfVEVYVCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBNYXJrIGZpbGUgbG9nZ2luZyBhcyBlbmFibGVkIHRvIHByZXZlbnQgdGhlIGZ1bmN0aW9uIGZyb20gZXhlY3V0aW5nIG11bHRpcGxlIHRpbWVzLlxuICBGSUxFX0xPR0dJTkdfRU5BQkxFRCA9IHRydWU7XG59XG5cbi8qKiBXcml0ZSB0aGUgcHJvdmlkZWQgdGV4dCB0byB0aGUgbG9nIGZpbGUsIHByZXBlbmRpbmcgZWFjaCBsaW5lIHdpdGggdGhlIGxvZyBsZXZlbC4gICovXG5mdW5jdGlvbiBwcmludFRvTG9nRmlsZShsb2dMZXZlbDogTE9HX0xFVkVMUywgLi4udGV4dDogc3RyaW5nW10pIHtcbiAgY29uc3QgbG9nTGV2ZWxUZXh0ID0gYCR7TE9HX0xFVkVMU1tsb2dMZXZlbF19OmAucGFkRW5kKExPR19MRVZFTF9DT0xVTU5TKTtcbiAgTE9HR0VEX1RFWFQgKz0gdGV4dC5qb2luKCcgJykuc3BsaXQoJ1xcbicpLm1hcChsID0+IGAke2xvZ0xldmVsVGV4dH0gJHtsfVxcbmApLmpvaW4oJycpO1xufVxuIl19