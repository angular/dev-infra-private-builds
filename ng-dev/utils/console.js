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
    return (await inquirer_1.prompt({
        type: 'confirm',
        name: 'result',
        message: message,
        default: defaultValue,
    })).result;
}
exports.promptConfirm = promptConfirm;
/** Prompts the user for one line of input. */
async function promptInput(message) {
    return (await inquirer_1.prompt({ type: 'input', name: 'result', message })).result;
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
    loggingFunction.group = (text, collapsed = false) => {
        const command = collapsed ? console.groupCollapsed : console.group;
        runConsoleCommand(() => command, level, text);
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
        const logFilePath = path_1.join(git.baseDir, '.ng-dev.log');
        // Strip ANSI escape codes from log outputs.
        LOGGED_TEXT = LOGGED_TEXT.replace(/\x1B\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]/g, '');
        fs_1.writeFileSync(logFilePath, LOGGED_TEXT);
        // For failure codes greater than 1, the new logged lines should be written to a specific log
        // file for the command run failure.
        if (code > 1) {
            const logFileName = `.ng-dev.err-${now.getTime()}.log`;
            console.error(`Exit code: ${code}. Writing full log to ${logFileName}`);
            fs_1.writeFileSync(path_1.join(git.baseDir, logFileName), LOGGED_TEXT);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL25nLWRldi91dGlscy9jb25zb2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILCtCQUErQjtBQUMvQiwyQkFBaUM7QUFDakMsdUNBQWdDO0FBQ2hDLCtCQUEwQjtBQUcxQixpREFBMkM7QUFFM0Msc0RBQXNEO0FBQ3pDLFFBQUEsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDaEIsUUFBQSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUNwQixRQUFBLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQ3RCLFFBQUEsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7QUFDbEIsUUFBQSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztBQUUvQiw2RUFBNkU7QUFDdEUsS0FBSyxVQUFVLGFBQWEsQ0FBQyxPQUFlLEVBQUUsWUFBWSxHQUFHLEtBQUs7SUFDdkUsT0FBTyxDQUNMLE1BQU0saUJBQU0sQ0FBb0I7UUFDOUIsSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsUUFBUTtRQUNkLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLE9BQU8sRUFBRSxZQUFZO0tBQ3RCLENBQUMsQ0FDSCxDQUFDLE1BQU0sQ0FBQztBQUNYLENBQUM7QUFURCxzQ0FTQztBQUVELDhDQUE4QztBQUN2QyxLQUFLLFVBQVUsV0FBVyxDQUFDLE9BQWU7SUFDL0MsT0FBTyxDQUFDLE1BQU0saUJBQU0sQ0FBbUIsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUMzRixDQUFDO0FBRkQsa0NBRUM7QUFFRDs7OztHQUlHO0FBQ0gsSUFBWSxVQU9YO0FBUEQsV0FBWSxVQUFVO0lBQ3BCLCtDQUFVLENBQUE7SUFDViw2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Q0FBQyxPQUFPLENBQUMseUNBQXlDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFakYsa0JBQWEsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFeEMsNkZBQTZGO1FBQzdGLG9DQUFvQztRQUNwQyxJQUFJLElBQUksR0FBRyxDQUFDLEVBQUU7WUFDWixNQUFNLFdBQVcsR0FBRyxlQUFlLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDO1lBQ3ZELE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBYyxJQUFJLHlCQUF5QixXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLGtCQUFhLENBQUMsV0FBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7U0FDNUQ7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILHNGQUFzRjtJQUN0RixvQkFBb0IsR0FBRyxJQUFJLENBQUM7QUFDOUIsQ0FBQztBQXBDRCxnRUFvQ0M7QUFFRCx5RkFBeUY7QUFDekYsU0FBUyxjQUFjLENBQUMsUUFBb0IsRUFBRSxHQUFHLElBQWM7SUFDN0QsTUFBTSxZQUFZLEdBQUcsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUMxRSxXQUFXLElBQUksSUFBSTtTQUNoQixJQUFJLENBQUMsR0FBRyxDQUFDO1NBQ1QsS0FBSyxDQUFDLElBQUksQ0FBQztTQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxZQUFZLElBQUksQ0FBQyxJQUFJLENBQUM7U0FDcEMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBjaGFsayBmcm9tICdjaGFsayc7XG5pbXBvcnQge3dyaXRlRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7cHJvbXB0fSBmcm9tICdpbnF1aXJlcic7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtBcmd1bWVudHN9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4vZ2l0L2dpdC1jbGllbnQnO1xuXG4vKiogUmVleHBvcnQgb2YgY2hhbGsgY29sb3JzIGZvciBjb252ZW5pZW50IGFjY2Vzcy4gKi9cbmV4cG9ydCBjb25zdCByZWQgPSBjaGFsay5yZWQ7XG5leHBvcnQgY29uc3QgZ3JlZW4gPSBjaGFsay5ncmVlbjtcbmV4cG9ydCBjb25zdCB5ZWxsb3cgPSBjaGFsay55ZWxsb3c7XG5leHBvcnQgY29uc3QgYm9sZCA9IGNoYWxrLmJvbGQ7XG5leHBvcnQgY29uc3QgYmx1ZSA9IGNoYWxrLmJsdWU7XG5cbi8qKiBQcm9tcHRzIHRoZSB1c2VyIHdpdGggYSBjb25maXJtYXRpb24gcXVlc3Rpb24gYW5kIGEgc3BlY2lmaWVkIG1lc3NhZ2UuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvbXB0Q29uZmlybShtZXNzYWdlOiBzdHJpbmcsIGRlZmF1bHRWYWx1ZSA9IGZhbHNlKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIHJldHVybiAoXG4gICAgYXdhaXQgcHJvbXB0PHtyZXN1bHQ6IGJvb2xlYW59Pih7XG4gICAgICB0eXBlOiAnY29uZmlybScsXG4gICAgICBuYW1lOiAncmVzdWx0JyxcbiAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICBkZWZhdWx0OiBkZWZhdWx0VmFsdWUsXG4gICAgfSlcbiAgKS5yZXN1bHQ7XG59XG5cbi8qKiBQcm9tcHRzIHRoZSB1c2VyIGZvciBvbmUgbGluZSBvZiBpbnB1dC4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm9tcHRJbnB1dChtZXNzYWdlOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gKGF3YWl0IHByb21wdDx7cmVzdWx0OiBzdHJpbmd9Pih7dHlwZTogJ2lucHV0JywgbmFtZTogJ3Jlc3VsdCcsIG1lc3NhZ2V9KSkucmVzdWx0O1xufVxuXG4vKipcbiAqIFN1cHBvcnRlZCBsZXZlbHMgZm9yIGxvZ2dpbmcgZnVuY3Rpb25zLlxuICpcbiAqIExldmVscyBhcmUgbWFwcGVkIHRvIG51bWJlcnMgdG8gcmVwcmVzZW50IGEgaGllcmFyY2h5IG9mIGxvZ2dpbmcgbGV2ZWxzLlxuICovXG5leHBvcnQgZW51bSBMT0dfTEVWRUxTIHtcbiAgU0lMRU5UID0gMCxcbiAgRVJST1IgPSAxLFxuICBXQVJOID0gMixcbiAgTE9HID0gMyxcbiAgSU5GTyA9IDQsXG4gIERFQlVHID0gNSxcbn1cblxuLyoqIERlZmF1bHQgbG9nIGxldmVsIGZvciB0aGUgdG9vbC4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX0xPR19MRVZFTCA9IExPR19MRVZFTFMuSU5GTztcblxuLyoqIFdyaXRlIHRvIHRoZSBjb25zb2xlIGZvciBhdCBJTkZPIGxvZ2dpbmcgbGV2ZWwgKi9cbmV4cG9ydCBjb25zdCBpbmZvID0gYnVpbGRMb2dMZXZlbEZ1bmN0aW9uKCgpID0+IGNvbnNvbGUuaW5mbywgTE9HX0xFVkVMUy5JTkZPKTtcblxuLyoqIFdyaXRlIHRvIHRoZSBjb25zb2xlIGZvciBhdCBFUlJPUiBsb2dnaW5nIGxldmVsICovXG5leHBvcnQgY29uc3QgZXJyb3IgPSBidWlsZExvZ0xldmVsRnVuY3Rpb24oKCkgPT4gY29uc29sZS5lcnJvciwgTE9HX0xFVkVMUy5FUlJPUik7XG5cbi8qKiBXcml0ZSB0byB0aGUgY29uc29sZSBmb3IgYXQgREVCVUcgbG9nZ2luZyBsZXZlbCAqL1xuZXhwb3J0IGNvbnN0IGRlYnVnID0gYnVpbGRMb2dMZXZlbEZ1bmN0aW9uKCgpID0+IGNvbnNvbGUuZGVidWcsIExPR19MRVZFTFMuREVCVUcpO1xuXG4vKiogV3JpdGUgdG8gdGhlIGNvbnNvbGUgZm9yIGF0IExPRyBsb2dnaW5nIGxldmVsICovXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbnNvbGVcbmV4cG9ydCBjb25zdCBsb2cgPSBidWlsZExvZ0xldmVsRnVuY3Rpb24oKCkgPT4gY29uc29sZS5sb2csIExPR19MRVZFTFMuTE9HKTtcblxuLyoqIFdyaXRlIHRvIHRoZSBjb25zb2xlIGZvciBhdCBXQVJOIGxvZ2dpbmcgbGV2ZWwgKi9cbmV4cG9ydCBjb25zdCB3YXJuID0gYnVpbGRMb2dMZXZlbEZ1bmN0aW9uKCgpID0+IGNvbnNvbGUud2FybiwgTE9HX0xFVkVMUy5XQVJOKTtcblxuLyoqIEJ1aWxkIGFuIGluc3RhbmNlIG9mIGEgbG9nZ2luZyBmdW5jdGlvbiBmb3IgdGhlIHByb3ZpZGVkIGxldmVsLiAqL1xuZnVuY3Rpb24gYnVpbGRMb2dMZXZlbEZ1bmN0aW9uKGxvYWRDb21tYW5kOiAoKSA9PiBGdW5jdGlvbiwgbGV2ZWw6IExPR19MRVZFTFMpIHtcbiAgLyoqIFdyaXRlIHRvIHN0ZG91dCBmb3IgdGhlIExPR19MRVZFTC4gKi9cbiAgY29uc3QgbG9nZ2luZ0Z1bmN0aW9uID0gKC4uLnRleHQ6IHN0cmluZ1tdKSA9PiB7XG4gICAgcnVuQ29uc29sZUNvbW1hbmQobG9hZENvbW1hbmQsIGxldmVsLCAuLi50ZXh0KTtcbiAgfTtcblxuICAvKiogU3RhcnQgYSBncm91cCBhdCB0aGUgTE9HX0xFVkVMLCBvcHRpb25hbGx5IHN0YXJ0aW5nIGl0IGFzIGNvbGxhcHNlZC4gKi9cbiAgbG9nZ2luZ0Z1bmN0aW9uLmdyb3VwID0gKHRleHQ6IHN0cmluZywgY29sbGFwc2VkID0gZmFsc2UpID0+IHtcbiAgICBjb25zdCBjb21tYW5kID0gY29sbGFwc2VkID8gY29uc29sZS5ncm91cENvbGxhcHNlZCA6IGNvbnNvbGUuZ3JvdXA7XG4gICAgcnVuQ29uc29sZUNvbW1hbmQoKCkgPT4gY29tbWFuZCwgbGV2ZWwsIHRleHQpO1xuICB9O1xuXG4gIC8qKiBFbmQgdGhlIGdyb3VwIGF0IHRoZSBMT0dfTEVWRUwuICovXG4gIGxvZ2dpbmdGdW5jdGlvbi5ncm91cEVuZCA9ICgpID0+IHtcbiAgICBydW5Db25zb2xlQ29tbWFuZCgoKSA9PiBjb25zb2xlLmdyb3VwRW5kLCBsZXZlbCk7XG4gIH07XG5cbiAgcmV0dXJuIGxvZ2dpbmdGdW5jdGlvbjtcbn1cblxuLyoqXG4gKiBSdW4gdGhlIGNvbnNvbGUgY29tbWFuZCBwcm92aWRlZCwgaWYgdGhlIGVudmlyb25tZW50cyBsb2dnaW5nIGxldmVsIGdyZWF0ZXIgdGhhbiB0aGVcbiAqIHByb3ZpZGVkIGxvZ2dpbmcgbGV2ZWwuXG4gKlxuICogVGhlIGxvYWRDb21tYW5kIHRha2VzIGluIGEgZnVuY3Rpb24gd2hpY2ggaXMgY2FsbGVkIHRvIHJldHJpZXZlIHRoZSBjb25zb2xlLiogZnVuY3Rpb25cbiAqIHRvIGFsbG93IGZvciBqYXNtaW5lIHNwaWVzIHRvIHN0aWxsIHdvcmsgaW4gdGVzdGluZy4gIFdpdGhvdXQgdGhpcyBtZXRob2Qgb2YgcmV0cmlldmFsXG4gKiB0aGUgY29uc29sZS4qIGZ1bmN0aW9uLCB0aGUgZnVuY3Rpb24gaXMgc2F2ZWQgaW50byB0aGUgY2xvc3VyZSBvZiB0aGUgY3JlYXRlZCBsb2dnaW5nXG4gKiBmdW5jdGlvbiBiZWZvcmUgamFzbWluZSBjYW4gc3B5LlxuICovXG5mdW5jdGlvbiBydW5Db25zb2xlQ29tbWFuZChsb2FkQ29tbWFuZDogKCkgPT4gRnVuY3Rpb24sIGxvZ0xldmVsOiBMT0dfTEVWRUxTLCAuLi50ZXh0OiBzdHJpbmdbXSkge1xuICBpZiAoZ2V0TG9nTGV2ZWwoKSA+PSBsb2dMZXZlbCkge1xuICAgIGxvYWRDb21tYW5kKCkoLi4udGV4dCk7XG4gIH1cbiAgcHJpbnRUb0xvZ0ZpbGUobG9nTGV2ZWwsIC4uLnRleHQpO1xufVxuXG4vKipcbiAqIFJldHJpZXZlIHRoZSBsb2cgbGV2ZWwgZnJvbSBlbnZpcm9ubWVudCB2YXJpYWJsZXMsIGlmIHRoZSB2YWx1ZSBmb3VuZFxuICogYmFzZWQgb24gdGhlIExPR19MRVZFTCBlbnZpcm9ubWVudCB2YXJpYWJsZSBpcyB1bmRlZmluZWQsIHJldHVybiB0aGUgZGVmYXVsdFxuICogbG9nZ2luZyBsZXZlbC5cbiAqL1xuZnVuY3Rpb24gZ2V0TG9nTGV2ZWwoKSB7XG4gIGNvbnN0IGxvZ0xldmVsRW52VmFsdWU6IGFueSA9IChwcm9jZXNzLmVudltgTE9HX0xFVkVMYF0gfHwgJycpLnRvVXBwZXJDYXNlKCk7XG4gIGNvbnN0IGxvZ0xldmVsID0gTE9HX0xFVkVMU1tsb2dMZXZlbEVudlZhbHVlXTtcbiAgaWYgKGxvZ0xldmVsID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gREVGQVVMVF9MT0dfTEVWRUw7XG4gIH1cbiAgcmV0dXJuIGxvZ0xldmVsO1xufVxuXG4vKiogQWxsIHRleHQgdG8gd3JpdGUgdG8gdGhlIGxvZyBmaWxlLiAqL1xubGV0IExPR0dFRF9URVhUID0gJyc7XG4vKiogV2hldGhlciBmaWxlIGxvZ2dpbmcgYXMgYmVlbiBlbmFibGVkLiAqL1xubGV0IEZJTEVfTE9HR0lOR19FTkFCTEVEID0gZmFsc2U7XG4vKipcbiAqIFRoZSBudW1iZXIgb2YgY29sdW1ucyB1c2VkIGluIHRoZSBwcmVwZW5kZWQgbG9nIGxldmVsIGluZm9ybWF0aW9uIG9uIGVhY2ggbGluZSBvZiB0aGUgbG9nZ2luZ1xuICogb3V0cHV0IGZpbGUuXG4gKi9cbmNvbnN0IExPR19MRVZFTF9DT0xVTU5TID0gNztcblxuLyoqXG4gKiBFbmFibGUgd3JpdGluZyB0aGUgbG9nZ2VkIG91dHB1dHMgdG8gdGhlIGxvZyBmaWxlIG9uIHByb2Nlc3MgZXhpdCwgc2V0cyBpbml0aWFsIGxpbmVzIGZyb20gdGhlXG4gKiBjb21tYW5kIGV4ZWN1dGlvbiwgY29udGFpbmluZyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgdGltaW5nIGFuZCBjb21tYW5kIHBhcmFtZXRlcnMuXG4gKlxuICogVGhpcyBpcyBleHBlY3RlZCB0byBiZSBjYWxsZWQgb25seSBvbmNlIGR1cmluZyBhIGNvbW1hbmQgcnVuLCBhbmQgc2hvdWxkIGJlIGNhbGxlZCBieSB0aGVcbiAqIG1pZGRsZXdhcmUgb2YgeWFyZ3MgdG8gZW5hYmxlIHRoZSBmaWxlIGxvZ2dpbmcgYmVmb3JlIHRoZSByZXN0IG9mIHRoZSBjb21tYW5kIHBhcnNpbmcgYW5kXG4gKiByZXNwb25zZSBpcyBleGVjdXRlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhcHR1cmVMb2dPdXRwdXRGb3JDb21tYW5kKGFyZ3Y6IEFyZ3VtZW50cykge1xuICBpZiAoRklMRV9MT0dHSU5HX0VOQUJMRUQpIHtcbiAgICB0aHJvdyBFcnJvcignYGNhcHR1cmVMb2dPdXRwdXRGb3JDb21tYW5kYCBjYW5ub3QgYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzJyk7XG4gIH1cblxuICBjb25zdCBnaXQgPSBHaXRDbGllbnQuZ2V0KCk7XG4gIC8qKiBUaGUgZGF0ZSB0aW1lIHVzZWQgZm9yIHRpbWVzdGFtcGluZyB3aGVuIHRoZSBjb21tYW5kIHdhcyBpbnZva2VkLiAqL1xuICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xuICAvKiogSGVhZGVyIGxpbmUgdG8gc2VwYXJhdGUgY29tbWFuZCBydW5zIGluIGxvZyBmaWxlcy4gKi9cbiAgY29uc3QgaGVhZGVyTGluZSA9IEFycmF5KDEwMCkuZmlsbCgnIycpLmpvaW4oJycpO1xuICBMT0dHRURfVEVYVCArPSBgJHtoZWFkZXJMaW5lfVxcbkNvbW1hbmQ6ICR7YXJndi4kMH0gJHthcmd2Ll8uam9pbignICcpfVxcblJhbiBhdDogJHtub3d9XFxuYDtcblxuICAvLyBPbiBwcm9jZXNzIGV4aXQsIHdyaXRlIHRoZSBsb2dnZWQgb3V0cHV0IHRvIHRoZSBhcHByb3ByaWF0ZSBsb2cgZmlsZXNcbiAgcHJvY2Vzcy5vbignZXhpdCcsIChjb2RlOiBudW1iZXIpID0+IHtcbiAgICBMT0dHRURfVEVYVCArPSBgJHtoZWFkZXJMaW5lfVxcbmA7XG4gICAgTE9HR0VEX1RFWFQgKz0gYENvbW1hbmQgcmFuIGluICR7bmV3IERhdGUoKS5nZXRUaW1lKCkgLSBub3cuZ2V0VGltZSgpfW1zXFxuYDtcbiAgICBMT0dHRURfVEVYVCArPSBgRXhpdCBDb2RlOiAke2NvZGV9XFxuYDtcbiAgICAvKiogUGF0aCB0byB0aGUgbG9nIGZpbGUgbG9jYXRpb24uICovXG4gICAgY29uc3QgbG9nRmlsZVBhdGggPSBqb2luKGdpdC5iYXNlRGlyLCAnLm5nLWRldi5sb2cnKTtcblxuICAgIC8vIFN0cmlwIEFOU0kgZXNjYXBlIGNvZGVzIGZyb20gbG9nIG91dHB1dHMuXG4gICAgTE9HR0VEX1RFWFQgPSBMT0dHRURfVEVYVC5yZXBsYWNlKC9cXHgxQlxcWyhbMC05XXsxLDN9KDtbMC05XXsxLDJ9KT8pP1ttR0tdL2csICcnKTtcblxuICAgIHdyaXRlRmlsZVN5bmMobG9nRmlsZVBhdGgsIExPR0dFRF9URVhUKTtcblxuICAgIC8vIEZvciBmYWlsdXJlIGNvZGVzIGdyZWF0ZXIgdGhhbiAxLCB0aGUgbmV3IGxvZ2dlZCBsaW5lcyBzaG91bGQgYmUgd3JpdHRlbiB0byBhIHNwZWNpZmljIGxvZ1xuICAgIC8vIGZpbGUgZm9yIHRoZSBjb21tYW5kIHJ1biBmYWlsdXJlLlxuICAgIGlmIChjb2RlID4gMSkge1xuICAgICAgY29uc3QgbG9nRmlsZU5hbWUgPSBgLm5nLWRldi5lcnItJHtub3cuZ2V0VGltZSgpfS5sb2dgO1xuICAgICAgY29uc29sZS5lcnJvcihgRXhpdCBjb2RlOiAke2NvZGV9LiBXcml0aW5nIGZ1bGwgbG9nIHRvICR7bG9nRmlsZU5hbWV9YCk7XG4gICAgICB3cml0ZUZpbGVTeW5jKGpvaW4oZ2l0LmJhc2VEaXIsIGxvZ0ZpbGVOYW1lKSwgTE9HR0VEX1RFWFQpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gTWFyayBmaWxlIGxvZ2dpbmcgYXMgZW5hYmxlZCB0byBwcmV2ZW50IHRoZSBmdW5jdGlvbiBmcm9tIGV4ZWN1dGluZyBtdWx0aXBsZSB0aW1lcy5cbiAgRklMRV9MT0dHSU5HX0VOQUJMRUQgPSB0cnVlO1xufVxuXG4vKiogV3JpdGUgdGhlIHByb3ZpZGVkIHRleHQgdG8gdGhlIGxvZyBmaWxlLCBwcmVwZW5kaW5nIGVhY2ggbGluZSB3aXRoIHRoZSBsb2cgbGV2ZWwuICAqL1xuZnVuY3Rpb24gcHJpbnRUb0xvZ0ZpbGUobG9nTGV2ZWw6IExPR19MRVZFTFMsIC4uLnRleHQ6IHN0cmluZ1tdKSB7XG4gIGNvbnN0IGxvZ0xldmVsVGV4dCA9IGAke0xPR19MRVZFTFNbbG9nTGV2ZWxdfTpgLnBhZEVuZChMT0dfTEVWRUxfQ09MVU1OUyk7XG4gIExPR0dFRF9URVhUICs9IHRleHRcbiAgICAuam9pbignICcpXG4gICAgLnNwbGl0KCdcXG4nKVxuICAgIC5tYXAoKGwpID0+IGAke2xvZ0xldmVsVGV4dH0gJHtsfVxcbmApXG4gICAgLmpvaW4oJycpO1xufVxuIl19