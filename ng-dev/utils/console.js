"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureLogOutputForCommand = exports.warn = exports.log = exports.debug = exports.error = exports.info = exports.DEFAULT_LOG_LEVEL = exports.LOG_LEVELS = exports.promptInput = exports.promptConfirm = exports.blue = exports.bold = exports.yellow = exports.green = exports.red = void 0;
const chalk = require("chalk");
const fs_1 = require("fs");
const inquirer_1 = require("inquirer");
const path_1 = require("path");
const git_client_1 = require("./git/git-client");
/** Reexport of chalk colors for convenient access. */
exports.red = chalk.red;
exports.green = chalk.green;
exports.yellow = chalk.yellow;
exports.bold = chalk.bold;
exports.blue = chalk.blue;
/** Prompts the user with a confirmation question and a specified message. */
async function promptConfirm(message, defaultValue = false) {
    return (await (0, inquirer_1.prompt)({
        type: 'confirm',
        name: 'result',
        message: message,
        default: defaultValue,
    })).result;
}
exports.promptConfirm = promptConfirm;
/** Prompts the user for one line of input. */
async function promptInput(message) {
    return (await (0, inquirer_1.prompt)({ type: 'input', name: 'result', message })).result;
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
exports.info = buildLogLevelFunction(() => console.info, LOG_LEVELS.INFO);
/** Write to the console for at ERROR logging level */
exports.error = buildLogLevelFunction(() => console.error, LOG_LEVELS.ERROR);
/** Write to the console for at DEBUG logging level */
exports.debug = buildLogLevelFunction(() => console.debug, LOG_LEVELS.DEBUG);
/** Write to the console for at LOG logging level */
// tslint:disable-next-line: no-console
exports.log = buildLogLevelFunction(() => console.log, LOG_LEVELS.LOG);
/** Write to the console for at WARN logging level */
exports.warn = buildLogLevelFunction(() => console.warn, LOG_LEVELS.WARN);
/** Build an instance of a logging function for the provided level. */
function buildLogLevelFunction(loadCommand, level) {
    /** Write to stdout for the LOG_LEVEL. */
    const loggingFunction = (...text) => {
        runConsoleCommand(loadCommand, level, ...text);
    };
    /** Start a group at the LOG_LEVEL, optionally starting it as collapsed. */
    loggingFunction.group = (label, collapsed = false) => {
        const command = collapsed ? console.groupCollapsed : console.group;
        runConsoleCommand(() => command, level, label);
    };
    /** End the group at the LOG_LEVEL. */
    loggingFunction.groupEnd = () => {
        runConsoleCommand(() => console.groupEnd, level);
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
function runConsoleCommand(loadCommand, logLevel, ...text) {
    if (getLogLevel() >= logLevel) {
        loadCommand()(...text);
    }
    printToLogFile(logLevel, ...text);
}
/**
 * Retrieve the log level from environment variables, if the value found
 * based on the LOG_LEVEL environment variable is undefined, return the default
 * logging level.
 */
function getLogLevel() {
    const logLevelEnvValue = (process.env[`LOG_LEVEL`] || '').toUpperCase();
    const logLevel = LOG_LEVELS[logLevelEnvValue];
    if (logLevel === undefined) {
        return exports.DEFAULT_LOG_LEVEL;
    }
    return logLevel;
}
/** All text to write to the log file. */
let LOGGED_TEXT = '';
/** Whether file logging as been enabled. */
let FILE_LOGGING_ENABLED = false;
/**
 * The number of columns used in the prepended log level information on each line of the logging
 * output file.
 */
const LOG_LEVEL_COLUMNS = 7;
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
    const git = git_client_1.GitClient.get();
    /** The date time used for timestamping when the command was invoked. */
    const now = new Date();
    /** Header line to separate command runs in log files. */
    const headerLine = Array(100).fill('#').join('');
    LOGGED_TEXT += `${headerLine}\nCommand: ${argv.$0} ${argv._.join(' ')}\nRan at: ${now}\n`;
    // On process exit, write the logged output to the appropriate log files
    process.on('exit', (code) => {
        LOGGED_TEXT += `${headerLine}\n`;
        LOGGED_TEXT += `Command ran in ${new Date().getTime() - now.getTime()}ms\n`;
        LOGGED_TEXT += `Exit Code: ${code}\n`;
        /** Path to the log file location. */
        const logFilePath = (0, path_1.join)(git.baseDir, '.ng-dev.log');
        // Strip ANSI escape codes from log outputs.
        LOGGED_TEXT = LOGGED_TEXT.replace(/\x1B\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]/g, '');
        (0, fs_1.writeFileSync)(logFilePath, LOGGED_TEXT);
        // For failure codes greater than 1, the new logged lines should be written to a specific log
        // file for the command run failure.
        if (code > 1) {
            const logFileName = `.ng-dev.err-${now.getTime()}.log`;
            console.error(`Exit code: ${code}. Writing full log to ${logFileName}`);
            (0, fs_1.writeFileSync)((0, path_1.join)(git.baseDir, logFileName), LOGGED_TEXT);
        }
    });
    // Mark file logging as enabled to prevent the function from executing multiple times.
    FILE_LOGGING_ENABLED = true;
}
exports.captureLogOutputForCommand = captureLogOutputForCommand;
/** Write the provided text to the log file, prepending each line with the log level.  */
function printToLogFile(logLevel, ...text) {
    const logLevelText = `${LOG_LEVELS[logLevel]}:`.padEnd(LOG_LEVEL_COLUMNS);
    LOGGED_TEXT += text
        .join(' ')
        .split('\n')
        .map((l) => `${logLevelText} ${l}\n`)
        .join('');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL25nLWRldi91dGlscy9jb25zb2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILCtCQUErQjtBQUMvQiwyQkFBaUM7QUFDakMsdUNBQWdDO0FBQ2hDLCtCQUEwQjtBQUcxQixpREFBMkM7QUFFM0Msc0RBQXNEO0FBQ3pDLFFBQUEsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDaEIsUUFBQSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUNwQixRQUFBLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQ3RCLFFBQUEsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7QUFDbEIsUUFBQSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztBQUUvQiw2RUFBNkU7QUFDdEUsS0FBSyxVQUFVLGFBQWEsQ0FBQyxPQUFlLEVBQUUsWUFBWSxHQUFHLEtBQUs7SUFDdkUsT0FBTyxDQUNMLE1BQU0sSUFBQSxpQkFBTSxFQUFvQjtRQUM5QixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLE9BQU87UUFDaEIsT0FBTyxFQUFFLFlBQVk7S0FDdEIsQ0FBQyxDQUNILENBQUMsTUFBTSxDQUFDO0FBQ1gsQ0FBQztBQVRELHNDQVNDO0FBRUQsOENBQThDO0FBQ3ZDLEtBQUssVUFBVSxXQUFXLENBQUMsT0FBZTtJQUMvQyxPQUFPLENBQUMsTUFBTSxJQUFBLGlCQUFNLEVBQW1CLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDM0YsQ0FBQztBQUZELGtDQUVDO0FBRUQ7Ozs7R0FJRztBQUNILElBQVksVUFPWDtBQVBELFdBQVksVUFBVTtJQUNwQiwrQ0FBVSxD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V0FBVyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMseUNBQXlDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFakYsSUFBQSxrQkFBYSxFQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUV4Qyw2RkFBNkY7UUFDN0Ysb0NBQW9DO1FBQ3BDLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRTtZQUNaLE1BQU0sV0FBVyxHQUFHLGVBQWUsR0FBRyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUM7WUFDdkQsT0FBTyxDQUFDLEtBQUssQ0FBQyxjQUFjLElBQUkseUJBQXlCLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBQSxrQkFBYSxFQUFDLElBQUEsV0FBSSxFQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7U0FDNUQ7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILHNGQUFzRjtJQUN0RixvQkFBb0IsR0FBRyxJQUFJLENBQUM7QUFDOUIsQ0FBQztBQXBDRCxnRUFvQ0M7QUFFRCx5RkFBeUY7QUFDekYsU0FBUyxjQUFjLENBQUMsUUFBb0IsRUFBRSxHQUFHLElBQWU7SUFDOUQsTUFBTSxZQUFZLEdBQUcsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUMxRSxXQUFXLElBQUksSUFBSTtTQUNoQixJQUFJLENBQUMsR0FBRyxDQUFDO1NBQ1QsS0FBSyxDQUFDLElBQUksQ0FBQztTQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxZQUFZLElBQUksQ0FBQyxJQUFJLENBQUM7U0FDcEMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBjaGFsayBmcm9tICdjaGFsayc7XG5pbXBvcnQge3dyaXRlRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7cHJvbXB0fSBmcm9tICdpbnF1aXJlcic7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtBcmd1bWVudHN9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4vZ2l0L2dpdC1jbGllbnQnO1xuXG4vKiogUmVleHBvcnQgb2YgY2hhbGsgY29sb3JzIGZvciBjb252ZW5pZW50IGFjY2Vzcy4gKi9cbmV4cG9ydCBjb25zdCByZWQgPSBjaGFsay5yZWQ7XG5leHBvcnQgY29uc3QgZ3JlZW4gPSBjaGFsay5ncmVlbjtcbmV4cG9ydCBjb25zdCB5ZWxsb3cgPSBjaGFsay55ZWxsb3c7XG5leHBvcnQgY29uc3QgYm9sZCA9IGNoYWxrLmJvbGQ7XG5leHBvcnQgY29uc3QgYmx1ZSA9IGNoYWxrLmJsdWU7XG5cbi8qKiBQcm9tcHRzIHRoZSB1c2VyIHdpdGggYSBjb25maXJtYXRpb24gcXVlc3Rpb24gYW5kIGEgc3BlY2lmaWVkIG1lc3NhZ2UuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvbXB0Q29uZmlybShtZXNzYWdlOiBzdHJpbmcsIGRlZmF1bHRWYWx1ZSA9IGZhbHNlKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIHJldHVybiAoXG4gICAgYXdhaXQgcHJvbXB0PHtyZXN1bHQ6IGJvb2xlYW59Pih7XG4gICAgICB0eXBlOiAnY29uZmlybScsXG4gICAgICBuYW1lOiAncmVzdWx0JyxcbiAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICBkZWZhdWx0OiBkZWZhdWx0VmFsdWUsXG4gICAgfSlcbiAgKS5yZXN1bHQ7XG59XG5cbi8qKiBQcm9tcHRzIHRoZSB1c2VyIGZvciBvbmUgbGluZSBvZiBpbnB1dC4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm9tcHRJbnB1dChtZXNzYWdlOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gKGF3YWl0IHByb21wdDx7cmVzdWx0OiBzdHJpbmd9Pih7dHlwZTogJ2lucHV0JywgbmFtZTogJ3Jlc3VsdCcsIG1lc3NhZ2V9KSkucmVzdWx0O1xufVxuXG4vKipcbiAqIFN1cHBvcnRlZCBsZXZlbHMgZm9yIGxvZ2dpbmcgZnVuY3Rpb25zLlxuICpcbiAqIExldmVscyBhcmUgbWFwcGVkIHRvIG51bWJlcnMgdG8gcmVwcmVzZW50IGEgaGllcmFyY2h5IG9mIGxvZ2dpbmcgbGV2ZWxzLlxuICovXG5leHBvcnQgZW51bSBMT0dfTEVWRUxTIHtcbiAgU0lMRU5UID0gMCxcbiAgRVJST1IgPSAxLFxuICBXQVJOID0gMixcbiAgTE9HID0gMyxcbiAgSU5GTyA9IDQsXG4gIERFQlVHID0gNSxcbn1cblxuLyoqIERlZmF1bHQgbG9nIGxldmVsIGZvciB0aGUgdG9vbC4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX0xPR19MRVZFTCA9IExPR19MRVZFTFMuSU5GTztcblxuLyoqIFdyaXRlIHRvIHRoZSBjb25zb2xlIGZvciBhdCBJTkZPIGxvZ2dpbmcgbGV2ZWwgKi9cbmV4cG9ydCBjb25zdCBpbmZvID0gYnVpbGRMb2dMZXZlbEZ1bmN0aW9uKCgpID0+IGNvbnNvbGUuaW5mbywgTE9HX0xFVkVMUy5JTkZPKTtcblxuLyoqIFdyaXRlIHRvIHRoZSBjb25zb2xlIGZvciBhdCBFUlJPUiBsb2dnaW5nIGxldmVsICovXG5leHBvcnQgY29uc3QgZXJyb3IgPSBidWlsZExvZ0xldmVsRnVuY3Rpb24oKCkgPT4gY29uc29sZS5lcnJvciwgTE9HX0xFVkVMUy5FUlJPUik7XG5cbi8qKiBXcml0ZSB0byB0aGUgY29uc29sZSBmb3IgYXQgREVCVUcgbG9nZ2luZyBsZXZlbCAqL1xuZXhwb3J0IGNvbnN0IGRlYnVnID0gYnVpbGRMb2dMZXZlbEZ1bmN0aW9uKCgpID0+IGNvbnNvbGUuZGVidWcsIExPR19MRVZFTFMuREVCVUcpO1xuXG4vKiogV3JpdGUgdG8gdGhlIGNvbnNvbGUgZm9yIGF0IExPRyBsb2dnaW5nIGxldmVsICovXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbnNvbGVcbmV4cG9ydCBjb25zdCBsb2cgPSBidWlsZExvZ0xldmVsRnVuY3Rpb24oKCkgPT4gY29uc29sZS5sb2csIExPR19MRVZFTFMuTE9HKTtcblxuLyoqIFdyaXRlIHRvIHRoZSBjb25zb2xlIGZvciBhdCBXQVJOIGxvZ2dpbmcgbGV2ZWwgKi9cbmV4cG9ydCBjb25zdCB3YXJuID0gYnVpbGRMb2dMZXZlbEZ1bmN0aW9uKCgpID0+IGNvbnNvbGUud2FybiwgTE9HX0xFVkVMUy5XQVJOKTtcblxuLyoqIEJ1aWxkIGFuIGluc3RhbmNlIG9mIGEgbG9nZ2luZyBmdW5jdGlvbiBmb3IgdGhlIHByb3ZpZGVkIGxldmVsLiAqL1xuZnVuY3Rpb24gYnVpbGRMb2dMZXZlbEZ1bmN0aW9uKGxvYWRDb21tYW5kOiAoKSA9PiBGdW5jdGlvbiwgbGV2ZWw6IExPR19MRVZFTFMpIHtcbiAgLyoqIFdyaXRlIHRvIHN0ZG91dCBmb3IgdGhlIExPR19MRVZFTC4gKi9cbiAgY29uc3QgbG9nZ2luZ0Z1bmN0aW9uID0gKC4uLnRleHQ6IHVua25vd25bXSkgPT4ge1xuICAgIHJ1bkNvbnNvbGVDb21tYW5kKGxvYWRDb21tYW5kLCBsZXZlbCwgLi4udGV4dCk7XG4gIH07XG5cbiAgLyoqIFN0YXJ0IGEgZ3JvdXAgYXQgdGhlIExPR19MRVZFTCwgb3B0aW9uYWxseSBzdGFydGluZyBpdCBhcyBjb2xsYXBzZWQuICovXG4gIGxvZ2dpbmdGdW5jdGlvbi5ncm91cCA9IChsYWJlbDogdW5rbm93biwgY29sbGFwc2VkID0gZmFsc2UpID0+IHtcbiAgICBjb25zdCBjb21tYW5kID0gY29sbGFwc2VkID8gY29uc29sZS5ncm91cENvbGxhcHNlZCA6IGNvbnNvbGUuZ3JvdXA7XG4gICAgcnVuQ29uc29sZUNvbW1hbmQoKCkgPT4gY29tbWFuZCwgbGV2ZWwsIGxhYmVsKTtcbiAgfTtcblxuICAvKiogRW5kIHRoZSBncm91cCBhdCB0aGUgTE9HX0xFVkVMLiAqL1xuICBsb2dnaW5nRnVuY3Rpb24uZ3JvdXBFbmQgPSAoKSA9PiB7XG4gICAgcnVuQ29uc29sZUNvbW1hbmQoKCkgPT4gY29uc29sZS5ncm91cEVuZCwgbGV2ZWwpO1xuICB9O1xuXG4gIHJldHVybiBsb2dnaW5nRnVuY3Rpb247XG59XG5cbi8qKlxuICogUnVuIHRoZSBjb25zb2xlIGNvbW1hbmQgcHJvdmlkZWQsIGlmIHRoZSBlbnZpcm9ubWVudHMgbG9nZ2luZyBsZXZlbCBncmVhdGVyIHRoYW4gdGhlXG4gKiBwcm92aWRlZCBsb2dnaW5nIGxldmVsLlxuICpcbiAqIFRoZSBsb2FkQ29tbWFuZCB0YWtlcyBpbiBhIGZ1bmN0aW9uIHdoaWNoIGlzIGNhbGxlZCB0byByZXRyaWV2ZSB0aGUgY29uc29sZS4qIGZ1bmN0aW9uXG4gKiB0byBhbGxvdyBmb3IgamFzbWluZSBzcGllcyB0byBzdGlsbCB3b3JrIGluIHRlc3RpbmcuICBXaXRob3V0IHRoaXMgbWV0aG9kIG9mIHJldHJpZXZhbFxuICogdGhlIGNvbnNvbGUuKiBmdW5jdGlvbiwgdGhlIGZ1bmN0aW9uIGlzIHNhdmVkIGludG8gdGhlIGNsb3N1cmUgb2YgdGhlIGNyZWF0ZWQgbG9nZ2luZ1xuICogZnVuY3Rpb24gYmVmb3JlIGphc21pbmUgY2FuIHNweS5cbiAqL1xuZnVuY3Rpb24gcnVuQ29uc29sZUNvbW1hbmQobG9hZENvbW1hbmQ6ICgpID0+IEZ1bmN0aW9uLCBsb2dMZXZlbDogTE9HX0xFVkVMUywgLi4udGV4dDogdW5rbm93bltdKSB7XG4gIGlmIChnZXRMb2dMZXZlbCgpID49IGxvZ0xldmVsKSB7XG4gICAgbG9hZENvbW1hbmQoKSguLi50ZXh0KTtcbiAgfVxuICBwcmludFRvTG9nRmlsZShsb2dMZXZlbCwgLi4udGV4dCk7XG59XG5cbi8qKlxuICogUmV0cmlldmUgdGhlIGxvZyBsZXZlbCBmcm9tIGVudmlyb25tZW50IHZhcmlhYmxlcywgaWYgdGhlIHZhbHVlIGZvdW5kXG4gKiBiYXNlZCBvbiB0aGUgTE9HX0xFVkVMIGVudmlyb25tZW50IHZhcmlhYmxlIGlzIHVuZGVmaW5lZCwgcmV0dXJuIHRoZSBkZWZhdWx0XG4gKiBsb2dnaW5nIGxldmVsLlxuICovXG5mdW5jdGlvbiBnZXRMb2dMZXZlbCgpIHtcbiAgY29uc3QgbG9nTGV2ZWxFbnZWYWx1ZTogYW55ID0gKHByb2Nlc3MuZW52W2BMT0dfTEVWRUxgXSB8fCAnJykudG9VcHBlckNhc2UoKTtcbiAgY29uc3QgbG9nTGV2ZWwgPSBMT0dfTEVWRUxTW2xvZ0xldmVsRW52VmFsdWVdO1xuICBpZiAobG9nTGV2ZWwgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBERUZBVUxUX0xPR19MRVZFTDtcbiAgfVxuICByZXR1cm4gbG9nTGV2ZWw7XG59XG5cbi8qKiBBbGwgdGV4dCB0byB3cml0ZSB0byB0aGUgbG9nIGZpbGUuICovXG5sZXQgTE9HR0VEX1RFWFQgPSAnJztcbi8qKiBXaGV0aGVyIGZpbGUgbG9nZ2luZyBhcyBiZWVuIGVuYWJsZWQuICovXG5sZXQgRklMRV9MT0dHSU5HX0VOQUJMRUQgPSBmYWxzZTtcbi8qKlxuICogVGhlIG51bWJlciBvZiBjb2x1bW5zIHVzZWQgaW4gdGhlIHByZXBlbmRlZCBsb2cgbGV2ZWwgaW5mb3JtYXRpb24gb24gZWFjaCBsaW5lIG9mIHRoZSBsb2dnaW5nXG4gKiBvdXRwdXQgZmlsZS5cbiAqL1xuY29uc3QgTE9HX0xFVkVMX0NPTFVNTlMgPSA3O1xuXG4vKipcbiAqIEVuYWJsZSB3cml0aW5nIHRoZSBsb2dnZWQgb3V0cHV0cyB0byB0aGUgbG9nIGZpbGUgb24gcHJvY2VzcyBleGl0LCBzZXRzIGluaXRpYWwgbGluZXMgZnJvbSB0aGVcbiAqIGNvbW1hbmQgZXhlY3V0aW9uLCBjb250YWluaW5nIGluZm9ybWF0aW9uIGFib3V0IHRoZSB0aW1pbmcgYW5kIGNvbW1hbmQgcGFyYW1ldGVycy5cbiAqXG4gKiBUaGlzIGlzIGV4cGVjdGVkIHRvIGJlIGNhbGxlZCBvbmx5IG9uY2UgZHVyaW5nIGEgY29tbWFuZCBydW4sIGFuZCBzaG91bGQgYmUgY2FsbGVkIGJ5IHRoZVxuICogbWlkZGxld2FyZSBvZiB5YXJncyB0byBlbmFibGUgdGhlIGZpbGUgbG9nZ2luZyBiZWZvcmUgdGhlIHJlc3Qgb2YgdGhlIGNvbW1hbmQgcGFyc2luZyBhbmRcbiAqIHJlc3BvbnNlIGlzIGV4ZWN1dGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FwdHVyZUxvZ091dHB1dEZvckNvbW1hbmQoYXJndjogQXJndW1lbnRzKSB7XG4gIGlmIChGSUxFX0xPR0dJTkdfRU5BQkxFRCkge1xuICAgIHRocm93IEVycm9yKCdgY2FwdHVyZUxvZ091dHB1dEZvckNvbW1hbmRgIGNhbm5vdCBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMnKTtcbiAgfVxuXG4gIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgLyoqIFRoZSBkYXRlIHRpbWUgdXNlZCBmb3IgdGltZXN0YW1waW5nIHdoZW4gdGhlIGNvbW1hbmQgd2FzIGludm9rZWQuICovXG4gIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG4gIC8qKiBIZWFkZXIgbGluZSB0byBzZXBhcmF0ZSBjb21tYW5kIHJ1bnMgaW4gbG9nIGZpbGVzLiAqL1xuICBjb25zdCBoZWFkZXJMaW5lID0gQXJyYXkoMTAwKS5maWxsKCcjJykuam9pbignJyk7XG4gIExPR0dFRF9URVhUICs9IGAke2hlYWRlckxpbmV9XFxuQ29tbWFuZDogJHthcmd2LiQwfSAke2FyZ3YuXy5qb2luKCcgJyl9XFxuUmFuIGF0OiAke25vd31cXG5gO1xuXG4gIC8vIE9uIHByb2Nlc3MgZXhpdCwgd3JpdGUgdGhlIGxvZ2dlZCBvdXRwdXQgdG8gdGhlIGFwcHJvcHJpYXRlIGxvZyBmaWxlc1xuICBwcm9jZXNzLm9uKCdleGl0JywgKGNvZGU6IG51bWJlcikgPT4ge1xuICAgIExPR0dFRF9URVhUICs9IGAke2hlYWRlckxpbmV9XFxuYDtcbiAgICBMT0dHRURfVEVYVCArPSBgQ29tbWFuZCByYW4gaW4gJHtuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIG5vdy5nZXRUaW1lKCl9bXNcXG5gO1xuICAgIExPR0dFRF9URVhUICs9IGBFeGl0IENvZGU6ICR7Y29kZX1cXG5gO1xuICAgIC8qKiBQYXRoIHRvIHRoZSBsb2cgZmlsZSBsb2NhdGlvbi4gKi9cbiAgICBjb25zdCBsb2dGaWxlUGF0aCA9IGpvaW4oZ2l0LmJhc2VEaXIsICcubmctZGV2LmxvZycpO1xuXG4gICAgLy8gU3RyaXAgQU5TSSBlc2NhcGUgY29kZXMgZnJvbSBsb2cgb3V0cHV0cy5cbiAgICBMT0dHRURfVEVYVCA9IExPR0dFRF9URVhULnJlcGxhY2UoL1xceDFCXFxbKFswLTldezEsM30oO1swLTldezEsMn0pPyk/W21HS10vZywgJycpO1xuXG4gICAgd3JpdGVGaWxlU3luYyhsb2dGaWxlUGF0aCwgTE9HR0VEX1RFWFQpO1xuXG4gICAgLy8gRm9yIGZhaWx1cmUgY29kZXMgZ3JlYXRlciB0aGFuIDEsIHRoZSBuZXcgbG9nZ2VkIGxpbmVzIHNob3VsZCBiZSB3cml0dGVuIHRvIGEgc3BlY2lmaWMgbG9nXG4gICAgLy8gZmlsZSBmb3IgdGhlIGNvbW1hbmQgcnVuIGZhaWx1cmUuXG4gICAgaWYgKGNvZGUgPiAxKSB7XG4gICAgICBjb25zdCBsb2dGaWxlTmFtZSA9IGAubmctZGV2LmVyci0ke25vdy5nZXRUaW1lKCl9LmxvZ2A7XG4gICAgICBjb25zb2xlLmVycm9yKGBFeGl0IGNvZGU6ICR7Y29kZX0uIFdyaXRpbmcgZnVsbCBsb2cgdG8gJHtsb2dGaWxlTmFtZX1gKTtcbiAgICAgIHdyaXRlRmlsZVN5bmMoam9pbihnaXQuYmFzZURpciwgbG9nRmlsZU5hbWUpLCBMT0dHRURfVEVYVCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBNYXJrIGZpbGUgbG9nZ2luZyBhcyBlbmFibGVkIHRvIHByZXZlbnQgdGhlIGZ1bmN0aW9uIGZyb20gZXhlY3V0aW5nIG11bHRpcGxlIHRpbWVzLlxuICBGSUxFX0xPR0dJTkdfRU5BQkxFRCA9IHRydWU7XG59XG5cbi8qKiBXcml0ZSB0aGUgcHJvdmlkZWQgdGV4dCB0byB0aGUgbG9nIGZpbGUsIHByZXBlbmRpbmcgZWFjaCBsaW5lIHdpdGggdGhlIGxvZyBsZXZlbC4gICovXG5mdW5jdGlvbiBwcmludFRvTG9nRmlsZShsb2dMZXZlbDogTE9HX0xFVkVMUywgLi4udGV4dDogdW5rbm93bltdKSB7XG4gIGNvbnN0IGxvZ0xldmVsVGV4dCA9IGAke0xPR19MRVZFTFNbbG9nTGV2ZWxdfTpgLnBhZEVuZChMT0dfTEVWRUxfQ09MVU1OUyk7XG4gIExPR0dFRF9URVhUICs9IHRleHRcbiAgICAuam9pbignICcpXG4gICAgLnNwbGl0KCdcXG4nKVxuICAgIC5tYXAoKGwpID0+IGAke2xvZ0xldmVsVGV4dH0gJHtsfVxcbmApXG4gICAgLmpvaW4oJycpO1xufVxuIl19