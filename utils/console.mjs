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
import { GitClient } from './git/index';
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
    var git = GitClient.getInstance();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9jb25zb2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sSUFBSSxDQUFDO0FBQ2pDLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDaEMsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUcxQixPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBRXRDLHNEQUFzRDtBQUN0RCxNQUFNLENBQUMsSUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQztBQUM3QixNQUFNLENBQUMsSUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUNqQyxNQUFNLENBQUMsSUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUNuQyxNQUFNLENBQUMsSUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztBQUMvQixNQUFNLENBQUMsSUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztBQUUvQiw2RUFBNkU7QUFDN0UsTUFBTSxVQUFnQixhQUFhLENBQUMsT0FBZSxFQUFFLFlBQW9CO0lBQXBCLDZCQUFBLEVBQUEsb0JBQW9COzs7O3dCQUMvRCxxQkFBTSxNQUFNLENBQW9CO3dCQUMvQixJQUFJLEVBQUUsU0FBUzt3QkFDZixJQUFJLEVBQUUsUUFBUTt3QkFDZCxPQUFPLEVBQUUsT0FBTzt3QkFDaEIsT0FBTyxFQUFFLFlBQVk7cUJBQ3RCLENBQUMsRUFBQTt3QkFMVCxzQkFBTyxDQUFDLFNBS0MsQ0FBQzt5QkFDTCxNQUFNLEVBQUM7Ozs7Q0FDYjtBQUVELDhDQUE4QztBQUM5QyxNQUFNLFVBQWdC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VUFBVSxDQUFDLFFBQVEsQ0FBQyxNQUFHLENBQUEsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUMxRSxXQUFXLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUcsWUFBWSxTQUFJLENBQUMsT0FBSSxFQUF4QixDQUF3QixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgY2hhbGsgZnJvbSAnY2hhbGsnO1xuaW1wb3J0IHt3cml0ZUZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge3Byb21wdH0gZnJvbSAnaW5xdWlyZXInO1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCB7QXJndW1lbnRzfSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuL2dpdC9pbmRleCc7XG5cbi8qKiBSZWV4cG9ydCBvZiBjaGFsayBjb2xvcnMgZm9yIGNvbnZlbmllbnQgYWNjZXNzLiAqL1xuZXhwb3J0IGNvbnN0IHJlZCA9IGNoYWxrLnJlZDtcbmV4cG9ydCBjb25zdCBncmVlbiA9IGNoYWxrLmdyZWVuO1xuZXhwb3J0IGNvbnN0IHllbGxvdyA9IGNoYWxrLnllbGxvdztcbmV4cG9ydCBjb25zdCBib2xkID0gY2hhbGsuYm9sZDtcbmV4cG9ydCBjb25zdCBibHVlID0gY2hhbGsuYmx1ZTtcblxuLyoqIFByb21wdHMgdGhlIHVzZXIgd2l0aCBhIGNvbmZpcm1hdGlvbiBxdWVzdGlvbiBhbmQgYSBzcGVjaWZpZWQgbWVzc2FnZS4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm9tcHRDb25maXJtKG1lc3NhZ2U6IHN0cmluZywgZGVmYXVsdFZhbHVlID0gZmFsc2UpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgcmV0dXJuIChhd2FpdCBwcm9tcHQ8e3Jlc3VsdDogYm9vbGVhbn0+KHtcbiAgICAgICAgICAgdHlwZTogJ2NvbmZpcm0nLFxuICAgICAgICAgICBuYW1lOiAncmVzdWx0JyxcbiAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgICAgICAgZGVmYXVsdDogZGVmYXVsdFZhbHVlLFxuICAgICAgICAgfSkpXG4gICAgICAucmVzdWx0O1xufVxuXG4vKiogUHJvbXB0cyB0aGUgdXNlciBmb3Igb25lIGxpbmUgb2YgaW5wdXQuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvbXB0SW5wdXQobWVzc2FnZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgcmV0dXJuIChhd2FpdCBwcm9tcHQ8e3Jlc3VsdDogc3RyaW5nfT4oe3R5cGU6ICdpbnB1dCcsIG5hbWU6ICdyZXN1bHQnLCBtZXNzYWdlfSkpLnJlc3VsdDtcbn1cblxuLyoqXG4gKiBTdXBwb3J0ZWQgbGV2ZWxzIGZvciBsb2dnaW5nIGZ1bmN0aW9ucy5cbiAqXG4gKiBMZXZlbHMgYXJlIG1hcHBlZCB0byBudW1iZXJzIHRvIHJlcHJlc2VudCBhIGhpZXJhcmNoeSBvZiBsb2dnaW5nIGxldmVscy5cbiAqL1xuZXhwb3J0IGVudW0gTE9HX0xFVkVMUyB7XG4gIFNJTEVOVCA9IDAsXG4gIEVSUk9SID0gMSxcbiAgV0FSTiA9IDIsXG4gIExPRyA9IDMsXG4gIElORk8gPSA0LFxuICBERUJVRyA9IDUsXG59XG5cbi8qKiBEZWZhdWx0IGxvZyBsZXZlbCBmb3IgdGhlIHRvb2wuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9MT0dfTEVWRUwgPSBMT0dfTEVWRUxTLklORk87XG5cbi8qKiBXcml0ZSB0byB0aGUgY29uc29sZSBmb3IgYXQgSU5GTyBsb2dnaW5nIGxldmVsICovXG5leHBvcnQgY29uc3QgaW5mbyA9IGJ1aWxkTG9nTGV2ZWxGdW5jdGlvbigoKSA9PiBjb25zb2xlLmluZm8sIExPR19MRVZFTFMuSU5GTyk7XG5cbi8qKiBXcml0ZSB0byB0aGUgY29uc29sZSBmb3IgYXQgRVJST1IgbG9nZ2luZyBsZXZlbCAqL1xuZXhwb3J0IGNvbnN0IGVycm9yID0gYnVpbGRMb2dMZXZlbEZ1bmN0aW9uKCgpID0+IGNvbnNvbGUuZXJyb3IsIExPR19MRVZFTFMuRVJST1IpO1xuXG4vKiogV3JpdGUgdG8gdGhlIGNvbnNvbGUgZm9yIGF0IERFQlVHIGxvZ2dpbmcgbGV2ZWwgKi9cbmV4cG9ydCBjb25zdCBkZWJ1ZyA9IGJ1aWxkTG9nTGV2ZWxGdW5jdGlvbigoKSA9PiBjb25zb2xlLmRlYnVnLCBMT0dfTEVWRUxTLkRFQlVHKTtcblxuLyoqIFdyaXRlIHRvIHRoZSBjb25zb2xlIGZvciBhdCBMT0cgbG9nZ2luZyBsZXZlbCAqL1xuLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBuby1jb25zb2xlXG5leHBvcnQgY29uc3QgbG9nID0gYnVpbGRMb2dMZXZlbEZ1bmN0aW9uKCgpID0+IGNvbnNvbGUubG9nLCBMT0dfTEVWRUxTLkxPRyk7XG5cbi8qKiBXcml0ZSB0byB0aGUgY29uc29sZSBmb3IgYXQgV0FSTiBsb2dnaW5nIGxldmVsICovXG5leHBvcnQgY29uc3Qgd2FybiA9IGJ1aWxkTG9nTGV2ZWxGdW5jdGlvbigoKSA9PiBjb25zb2xlLndhcm4sIExPR19MRVZFTFMuV0FSTik7XG5cbi8qKiBCdWlsZCBhbiBpbnN0YW5jZSBvZiBhIGxvZ2dpbmcgZnVuY3Rpb24gZm9yIHRoZSBwcm92aWRlZCBsZXZlbC4gKi9cbmZ1bmN0aW9uIGJ1aWxkTG9nTGV2ZWxGdW5jdGlvbihsb2FkQ29tbWFuZDogKCkgPT4gRnVuY3Rpb24sIGxldmVsOiBMT0dfTEVWRUxTKSB7XG4gIC8qKiBXcml0ZSB0byBzdGRvdXQgZm9yIHRoZSBMT0dfTEVWRUwuICovXG4gIGNvbnN0IGxvZ2dpbmdGdW5jdGlvbiA9ICguLi50ZXh0OiBzdHJpbmdbXSkgPT4ge1xuICAgIHJ1bkNvbnNvbGVDb21tYW5kKGxvYWRDb21tYW5kLCBsZXZlbCwgLi4udGV4dCk7XG4gIH07XG5cbiAgLyoqIFN0YXJ0IGEgZ3JvdXAgYXQgdGhlIExPR19MRVZFTCwgb3B0aW9uYWxseSBzdGFydGluZyBpdCBhcyBjb2xsYXBzZWQuICovXG4gIGxvZ2dpbmdGdW5jdGlvbi5ncm91cCA9ICh0ZXh0OiBzdHJpbmcsIGNvbGxhcHNlZCA9IGZhbHNlKSA9PiB7XG4gICAgY29uc3QgY29tbWFuZCA9IGNvbGxhcHNlZCA/IGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQgOiBjb25zb2xlLmdyb3VwO1xuICAgIHJ1bkNvbnNvbGVDb21tYW5kKCgpID0+IGNvbW1hbmQsIGxldmVsLCB0ZXh0KTtcbiAgfTtcblxuICAvKiogRW5kIHRoZSBncm91cCBhdCB0aGUgTE9HX0xFVkVMLiAqL1xuICBsb2dnaW5nRnVuY3Rpb24uZ3JvdXBFbmQgPSAoKSA9PiB7XG4gICAgcnVuQ29uc29sZUNvbW1hbmQoKCkgPT4gY29uc29sZS5ncm91cEVuZCwgbGV2ZWwpO1xuICB9O1xuXG4gIHJldHVybiBsb2dnaW5nRnVuY3Rpb247XG59XG5cbi8qKlxuICogUnVuIHRoZSBjb25zb2xlIGNvbW1hbmQgcHJvdmlkZWQsIGlmIHRoZSBlbnZpcm9ubWVudHMgbG9nZ2luZyBsZXZlbCBncmVhdGVyIHRoYW4gdGhlXG4gKiBwcm92aWRlZCBsb2dnaW5nIGxldmVsLlxuICpcbiAqIFRoZSBsb2FkQ29tbWFuZCB0YWtlcyBpbiBhIGZ1bmN0aW9uIHdoaWNoIGlzIGNhbGxlZCB0byByZXRyaWV2ZSB0aGUgY29uc29sZS4qIGZ1bmN0aW9uXG4gKiB0byBhbGxvdyBmb3IgamFzbWluZSBzcGllcyB0byBzdGlsbCB3b3JrIGluIHRlc3RpbmcuICBXaXRob3V0IHRoaXMgbWV0aG9kIG9mIHJldHJpZXZhbFxuICogdGhlIGNvbnNvbGUuKiBmdW5jdGlvbiwgdGhlIGZ1bmN0aW9uIGlzIHNhdmVkIGludG8gdGhlIGNsb3N1cmUgb2YgdGhlIGNyZWF0ZWQgbG9nZ2luZ1xuICogZnVuY3Rpb24gYmVmb3JlIGphc21pbmUgY2FuIHNweS5cbiAqL1xuZnVuY3Rpb24gcnVuQ29uc29sZUNvbW1hbmQobG9hZENvbW1hbmQ6ICgpID0+IEZ1bmN0aW9uLCBsb2dMZXZlbDogTE9HX0xFVkVMUywgLi4udGV4dDogc3RyaW5nW10pIHtcbiAgaWYgKGdldExvZ0xldmVsKCkgPj0gbG9nTGV2ZWwpIHtcbiAgICBsb2FkQ29tbWFuZCgpKC4uLnRleHQpO1xuICB9XG4gIHByaW50VG9Mb2dGaWxlKGxvZ0xldmVsLCAuLi50ZXh0KTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZSB0aGUgbG9nIGxldmVsIGZyb20gZW52aXJvbm1lbnQgdmFyaWFibGVzLCBpZiB0aGUgdmFsdWUgZm91bmRcbiAqIGJhc2VkIG9uIHRoZSBMT0dfTEVWRUwgZW52aXJvbm1lbnQgdmFyaWFibGUgaXMgdW5kZWZpbmVkLCByZXR1cm4gdGhlIGRlZmF1bHRcbiAqIGxvZ2dpbmcgbGV2ZWwuXG4gKi9cbmZ1bmN0aW9uIGdldExvZ0xldmVsKCkge1xuICBjb25zdCBsb2dMZXZlbEVudlZhbHVlOiBhbnkgPSAocHJvY2Vzcy5lbnZbYExPR19MRVZFTGBdIHx8ICcnKS50b1VwcGVyQ2FzZSgpO1xuICBjb25zdCBsb2dMZXZlbCA9IExPR19MRVZFTFNbbG9nTGV2ZWxFbnZWYWx1ZV07XG4gIGlmIChsb2dMZXZlbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIERFRkFVTFRfTE9HX0xFVkVMO1xuICB9XG4gIHJldHVybiBsb2dMZXZlbDtcbn1cblxuLyoqIEFsbCB0ZXh0IHRvIHdyaXRlIHRvIHRoZSBsb2cgZmlsZS4gKi9cbmxldCBMT0dHRURfVEVYVCA9ICcnO1xuLyoqIFdoZXRoZXIgZmlsZSBsb2dnaW5nIGFzIGJlZW4gZW5hYmxlZC4gKi9cbmxldCBGSUxFX0xPR0dJTkdfRU5BQkxFRCA9IGZhbHNlO1xuLyoqXG4gKiBUaGUgbnVtYmVyIG9mIGNvbHVtbnMgdXNlZCBpbiB0aGUgcHJlcGVuZGVkIGxvZyBsZXZlbCBpbmZvcm1hdGlvbiBvbiBlYWNoIGxpbmUgb2YgdGhlIGxvZ2dpbmdcbiAqIG91dHB1dCBmaWxlLlxuICovXG5jb25zdCBMT0dfTEVWRUxfQ09MVU1OUyA9IDc7XG5cbi8qKlxuICogRW5hYmxlIHdyaXRpbmcgdGhlIGxvZ2dlZCBvdXRwdXRzIHRvIHRoZSBsb2cgZmlsZSBvbiBwcm9jZXNzIGV4aXQsIHNldHMgaW5pdGlhbCBsaW5lcyBmcm9tIHRoZVxuICogY29tbWFuZCBleGVjdXRpb24sIGNvbnRhaW5pbmcgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHRpbWluZyBhbmQgY29tbWFuZCBwYXJhbWV0ZXJzLlxuICpcbiAqIFRoaXMgaXMgZXhwZWN0ZWQgdG8gYmUgY2FsbGVkIG9ubHkgb25jZSBkdXJpbmcgYSBjb21tYW5kIHJ1biwgYW5kIHNob3VsZCBiZSBjYWxsZWQgYnkgdGhlXG4gKiBtaWRkbGV3YXJlIG9mIHlhcmdzIHRvIGVuYWJsZSB0aGUgZmlsZSBsb2dnaW5nIGJlZm9yZSB0aGUgcmVzdCBvZiB0aGUgY29tbWFuZCBwYXJzaW5nIGFuZFxuICogcmVzcG9uc2UgaXMgZXhlY3V0ZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYXB0dXJlTG9nT3V0cHV0Rm9yQ29tbWFuZChhcmd2OiBBcmd1bWVudHMpIHtcbiAgaWYgKEZJTEVfTE9HR0lOR19FTkFCTEVEKSB7XG4gICAgdGhyb3cgRXJyb3IoJ2BjYXB0dXJlTG9nT3V0cHV0Rm9yQ29tbWFuZGAgY2Fubm90IGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcycpO1xuICB9XG5cbiAgY29uc3QgZ2l0ID0gR2l0Q2xpZW50LmdldEluc3RhbmNlKCk7XG4gIC8qKiBUaGUgZGF0ZSB0aW1lIHVzZWQgZm9yIHRpbWVzdGFtcGluZyB3aGVuIHRoZSBjb21tYW5kIHdhcyBpbnZva2VkLiAqL1xuICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xuICAvKiogSGVhZGVyIGxpbmUgdG8gc2VwYXJhdGUgY29tbWFuZCBydW5zIGluIGxvZyBmaWxlcy4gKi9cbiAgY29uc3QgaGVhZGVyTGluZSA9IEFycmF5KDEwMCkuZmlsbCgnIycpLmpvaW4oJycpO1xuICBMT0dHRURfVEVYVCArPSBgJHtoZWFkZXJMaW5lfVxcbkNvbW1hbmQ6ICR7YXJndi4kMH0gJHthcmd2Ll8uam9pbignICcpfVxcblJhbiBhdDogJHtub3d9XFxuYDtcblxuICAvLyBPbiBwcm9jZXNzIGV4aXQsIHdyaXRlIHRoZSBsb2dnZWQgb3V0cHV0IHRvIHRoZSBhcHByb3ByaWF0ZSBsb2cgZmlsZXNcbiAgcHJvY2Vzcy5vbignZXhpdCcsIChjb2RlOiBudW1iZXIpID0+IHtcbiAgICBMT0dHRURfVEVYVCArPSBgJHtoZWFkZXJMaW5lfVxcbmA7XG4gICAgTE9HR0VEX1RFWFQgKz0gYENvbW1hbmQgcmFuIGluICR7bmV3IERhdGUoKS5nZXRUaW1lKCkgLSBub3cuZ2V0VGltZSgpfW1zXFxuYDtcbiAgICBMT0dHRURfVEVYVCArPSBgRXhpdCBDb2RlOiAke2NvZGV9XFxuYDtcbiAgICAvKiogUGF0aCB0byB0aGUgbG9nIGZpbGUgbG9jYXRpb24uICovXG4gICAgY29uc3QgbG9nRmlsZVBhdGggPSBqb2luKGdpdC5iYXNlRGlyLCAnLm5nLWRldi5sb2cnKTtcblxuICAgIC8vIFN0cmlwIEFOU0kgZXNjYXBlIGNvZGVzIGZyb20gbG9nIG91dHB1dHMuXG4gICAgTE9HR0VEX1RFWFQgPSBMT0dHRURfVEVYVC5yZXBsYWNlKC9cXHgxQlxcWyhbMC05XXsxLDN9KDtbMC05XXsxLDJ9KT8pP1ttR0tdL2csICcnKTtcblxuICAgIHdyaXRlRmlsZVN5bmMobG9nRmlsZVBhdGgsIExPR0dFRF9URVhUKTtcblxuICAgIC8vIEZvciBmYWlsdXJlIGNvZGVzIGdyZWF0ZXIgdGhhbiAxLCB0aGUgbmV3IGxvZ2dlZCBsaW5lcyBzaG91bGQgYmUgd3JpdHRlbiB0byBhIHNwZWNpZmljIGxvZ1xuICAgIC8vIGZpbGUgZm9yIHRoZSBjb21tYW5kIHJ1biBmYWlsdXJlLlxuICAgIGlmIChjb2RlID4gMSkge1xuICAgICAgY29uc3QgbG9nRmlsZU5hbWUgPSBgLm5nLWRldi5lcnItJHtub3cuZ2V0VGltZSgpfS5sb2dgO1xuICAgICAgY29uc29sZS5lcnJvcihgRXhpdCBjb2RlOiAke2NvZGV9LiBXcml0aW5nIGZ1bGwgbG9nIHRvICR7bG9nRmlsZU5hbWV9YCk7XG4gICAgICB3cml0ZUZpbGVTeW5jKGpvaW4oZ2l0LmJhc2VEaXIsIGxvZ0ZpbGVOYW1lKSwgTE9HR0VEX1RFWFQpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gTWFyayBmaWxlIGxvZ2dpbmcgYXMgZW5hYmxlZCB0byBwcmV2ZW50IHRoZSBmdW5jdGlvbiBmcm9tIGV4ZWN1dGluZyBtdWx0aXBsZSB0aW1lcy5cbiAgRklMRV9MT0dHSU5HX0VOQUJMRUQgPSB0cnVlO1xufVxuXG4vKiogV3JpdGUgdGhlIHByb3ZpZGVkIHRleHQgdG8gdGhlIGxvZyBmaWxlLCBwcmVwZW5kaW5nIGVhY2ggbGluZSB3aXRoIHRoZSBsb2cgbGV2ZWwuICAqL1xuZnVuY3Rpb24gcHJpbnRUb0xvZ0ZpbGUobG9nTGV2ZWw6IExPR19MRVZFTFMsIC4uLnRleHQ6IHN0cmluZ1tdKSB7XG4gIGNvbnN0IGxvZ0xldmVsVGV4dCA9IGAke0xPR19MRVZFTFNbbG9nTGV2ZWxdfTpgLnBhZEVuZChMT0dfTEVWRUxfQ09MVU1OUyk7XG4gIExPR0dFRF9URVhUICs9IHRleHQuam9pbignICcpLnNwbGl0KCdcXG4nKS5tYXAobCA9PiBgJHtsb2dMZXZlbFRleHR9ICR7bH1cXG5gKS5qb2luKCcnKTtcbn1cbiJdfQ==