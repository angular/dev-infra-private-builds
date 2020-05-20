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
    function info(color) {
        var text = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            text[_i - 1] = arguments[_i];
        }
        runConsoleCommand.apply(void 0, tslib_1.__spread([console.info, LOG_LEVELS.INFO, color], text));
    }
    exports.info = info;
    function error(color) {
        var text = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            text[_i - 1] = arguments[_i];
        }
        runConsoleCommand.apply(void 0, tslib_1.__spread([console.error, LOG_LEVELS.ERROR, color], text));
    }
    exports.error = error;
    function debug(color) {
        var text = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            text[_i - 1] = arguments[_i];
        }
        runConsoleCommand.apply(void 0, tslib_1.__spread([console.debug, LOG_LEVELS.DEBUG, color], text));
    }
    exports.debug = debug;
    function log(color) {
        var text = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            text[_i - 1] = arguments[_i];
        }
        // tslint:disable-next-line: no-console
        runConsoleCommand.apply(void 0, tslib_1.__spread([console.log, LOG_LEVELS.LOG, color], text));
    }
    exports.log = log;
    function warn(color) {
        var text = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            text[_i - 1] = arguments[_i];
        }
        runConsoleCommand.apply(void 0, tslib_1.__spread([console.warn, LOG_LEVELS.WARN, color], text));
    }
    exports.warn = warn;
    /**
     * Run the console command provided, if the environments logging level greater than the
     * provided logging level.
     */
    function runConsoleCommand(command, logLevel, color) {
        var e_1, _a;
        var text = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            text[_i - 3] = arguments[_i];
        }
        if (getLogLevel() >= logLevel) {
            if (typeof color === 'function') {
                text = text.map(function (entry) { return color(entry); });
            }
            else {
                text = tslib_1.__spread([color], text);
            }
            try {
                for (var text_1 = tslib_1.__values(text), text_1_1 = text_1.next(); !text_1_1.done; text_1_1 = text_1.next()) {
                    var textEntry = text_1_1.value;
                    command(textEntry);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (text_1_1 && !text_1_1.done && (_a = text_1.return)) _a.call(text_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9jb25zb2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILCtCQUEwQjtJQUMxQixxQ0FBZ0M7SUFHaEMsc0RBQXNEO0lBQ3pDLFFBQUEsR0FBRyxHQUFpQixlQUFLLENBQUMsR0FBRyxDQUFDO0lBQzlCLFFBQUEsS0FBSyxHQUFpQixlQUFLLENBQUMsS0FBSyxDQUFDO0lBQ2xDLFFBQUEsTUFBTSxHQUFpQixlQUFLLENBQUMsTUFBTSxDQUFDO0lBRWpELDZFQUE2RTtJQUM3RSxTQUFzQixhQUFhLENBQUMsT0FBZSxFQUFFLFlBQW9CO1FBQXBCLDZCQUFBLEVBQUEsb0JBQW9COzs7OzRCQUMvRCxxQkFBTSxpQkFBTSxDQUFvQjs0QkFDL0IsSUFBSSxFQUFFLFNBQVM7NEJBQ2YsSUFBSSxFQUFFLFFBQVE7NEJBQ2QsT0FBTyxFQUFFLE9BQU87NEJBQ2hCLE9BQU8sRUFBRSxZQUFZO3lCQUN0QixDQUFDLEVBQUE7NEJBTFQsc0JBQU8sQ0FBQyxTQUtDLENBQUM7NkJBQ0wsTUFBTSxFQUFDOzs7O0tBQ2I7SUFSRCxzQ0FRQztJQUVEOzs7O09BSUc7SUFDSCxJQUFZLFVBT1g7SUFQRCxXQUFZLFVBQVU7UUFDcEIsK0NBQVUsQ0FBQTtRQUNWLDZDQUFTLENBQUE7UUFDVCwyQ0FBUSxDQUFBO1FBQ1IseUNBQU8sQ0FBQTtRQUNQLDJDQUFRLENBQUE7UUFDUiw2Q0FBUyxDQUFBO0lBQ1gsQ0FBQyxFQVBXLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBT3JCO0lBRUQsc0NBQXNDO0lBQ3pCLFFBQUEsaUJBQWlCLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztJQUtqRCxTQUFnQixJQUFJLENBQUMsS0FBMEI7UUFBRSxjQUFpQjthQUFqQixVQUFpQixFQUFqQixxQkFBaUIsRUFBakIsSUFBaUI7WUFBakIsNkJBQWlCOztRQUNoRSxpQkFBaUIsaUNBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssR0FBSyxJQUFJLEdBQUU7SUFDbkUsQ0FBQztJQUZELG9CQUVDO0lBS0QsU0FBZ0IsS0FBSyxDQUFDLEtBQTBCO1FBQUUsY0FBaUI7YUFBakIsVUFBaUIsRUFBakIscUJBQWlCLEVBQWpCLElBQWlCO1lBQWpCLDZCQUFpQjs7UUFDakUsaUJBQWlCLGlDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLEdBQUssSUFBSSxHQUFFO0lBQ3JFLENBQUM7SUFGRCxzQkFFQztJQUtELFNBQWdCLEtBQUssQ0FBQyxLQUEwQjtRQUFFLGNBQWlCO2FBQWpCLFVBQWlCLEVBQWpCLHFCQUFpQixFQUFqQixJQUFpQjtZQUFqQiw2QkFBaUI7O1FBQ2pFLGlCQUFpQixpQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxHQUFLLElBQUksR0FBRTtJQUNyRSxDQUFDO0lBRkQsc0JBRUM7SUFLRCxTQUFnQixHQUFHLENBQUMsS0FBMEI7UUFBRSxjQUFpQjthQUFqQixVQUFpQixFQUFqQixxQkFBaUIsRUFBakIsSUFBaUI7WUFBakIsNkJBQWlCOztRQUMvRCx1Q0FBdUM7UUFDdkMsaUJBQWlCLGlDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLEdBQUcsRUFBRSxLQUFLLEdBQUssSUFBSSxHQUFFO0lBQ2pFLENBQUM7SUFIRCxrQkFHQztJQUtELFNBQWdCLElBQUksQ0FBQyxLQUEwQjtRQUFFLGNBQWlCO2FBQWpCLFVBQWlCLEVBQWpCLHFCQUFpQixFQUFqQixJQUFpQjtZQUFqQiw2QkFBaUI7O1FBQ2hFLGlCQUFpQixpQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxHQUFLLElBQUksR0FBRTtJQUNuRSxDQUFDO0lBRkQsb0JBRUM7SUFFRDs7O09BR0c7SUFDSCxTQUFTLGlCQUFpQixDQUN0QixPQUFpQixFQUFFLFFBQW9CLEVBQUUsS0FBMEI7O1FBQUUsY0FBaUI7YUFBakIsVUFBaUIsRUFBakIscUJBQWlCLEVBQWpCLElBQWlCO1lBQWpCLDZCQUFpQjs7UUFDeEYsSUFBSSxXQUFXLEVBQUUsSUFBSSxRQUFRLEVBQUU7WUFDN0IsSUFBSSxPQUFPLEtBQUssS0FBSyxVQUFVLEVBQUU7Z0JBQy9CLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFaLENBQVksQ0FBQyxDQUFDO2FBQ3hDO2lCQUFNO2dCQUNMLElBQUkscUJBQUksS0FBZSxHQUFLLElBQUksQ0FBQyxDQUFDO2FBQ25DOztnQkFDRCxLQUF3QixJQUFBLFNBQUEsaUJBQUEsSUFBSSxDQUFBLDBCQUFBLDRDQUFFO29CQUF6QixJQUFNLFNBQVMsaUJBQUE7b0JBQ2xCLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztpQkFDcEI7Ozs7Ozs7OztTQUNGO0lBQ0gsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxTQUFTLFdBQVc7UUFDbEIsSUFBTSxnQkFBZ0IsR0FBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDN0UsSUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDOUMsSUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO1lBQzFCLE9BQU8seUJBQWlCLENBQUM7U0FDMUI7UUFDRCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCBjaGFsayBmcm9tICdjaGFsayc7XG5pbXBvcnQge3Byb21wdH0gZnJvbSAnaW5xdWlyZXInO1xuXG5cbi8qKiBSZWV4cG9ydCBvZiBjaGFsayBjb2xvcnMgZm9yIGNvbnZlbmllbnQgYWNjZXNzLiAqL1xuZXhwb3J0IGNvbnN0IHJlZDogdHlwZW9mIGNoYWxrID0gY2hhbGsucmVkO1xuZXhwb3J0IGNvbnN0IGdyZWVuOiB0eXBlb2YgY2hhbGsgPSBjaGFsay5ncmVlbjtcbmV4cG9ydCBjb25zdCB5ZWxsb3c6IHR5cGVvZiBjaGFsayA9IGNoYWxrLnllbGxvdztcblxuLyoqIFByb21wdHMgdGhlIHVzZXIgd2l0aCBhIGNvbmZpcm1hdGlvbiBxdWVzdGlvbiBhbmQgYSBzcGVjaWZpZWQgbWVzc2FnZS4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm9tcHRDb25maXJtKG1lc3NhZ2U6IHN0cmluZywgZGVmYXVsdFZhbHVlID0gZmFsc2UpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgcmV0dXJuIChhd2FpdCBwcm9tcHQ8e3Jlc3VsdDogYm9vbGVhbn0+KHtcbiAgICAgICAgICAgdHlwZTogJ2NvbmZpcm0nLFxuICAgICAgICAgICBuYW1lOiAncmVzdWx0JyxcbiAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgICAgICAgZGVmYXVsdDogZGVmYXVsdFZhbHVlLFxuICAgICAgICAgfSkpXG4gICAgICAucmVzdWx0O1xufVxuXG4vKipcbiAqIFN1cHBvcnRlZCBsZXZlbHMgZm9yIGxvZ2dpbmcgZnVuY3Rpb25zLlxuICpcbiAqIExldmVscyBhcmUgbWFwcGVkIHRvIG51bWJlcnMgdG8gcmVwcmVzZW50IGEgaGllcmFyY2h5IG9mIGxvZ2dpbmcgbGV2ZWxzLlxuICovXG5leHBvcnQgZW51bSBMT0dfTEVWRUxTIHtcbiAgU0lMRU5UID0gMCxcbiAgRVJST1IgPSAxLFxuICBXQVJOID0gMixcbiAgTE9HID0gMyxcbiAgSU5GTyA9IDQsXG4gIERFQlVHID0gNSxcbn1cblxuLyoqIERlZmF1bHQgbG9nIGxldmVsIGZvciB0aGUgdG9vbC4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX0xPR19MRVZFTCA9IExPR19MRVZFTFMuSU5GTztcblxuLyoqIFdyaXRlIHRvIHRoZSBjb25zb2xlIGZvciBhdCBJTkZPIGxvZ2dpbmcgbGV2ZWwgKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmZvKC4uLnRleHQ6IHN0cmluZ1tdKTogdm9pZDtcbmV4cG9ydCBmdW5jdGlvbiBpbmZvKGNvbG9yOiB0eXBlb2YgY2hhbGssIC4uLnRleHQ6IHN0cmluZ1tdKTogdm9pZDtcbmV4cG9ydCBmdW5jdGlvbiBpbmZvKGNvbG9yOiB0eXBlb2YgY2hhbGt8c3RyaW5nLCAuLi50ZXh0OiBzdHJpbmdbXSkge1xuICBydW5Db25zb2xlQ29tbWFuZChjb25zb2xlLmluZm8sIExPR19MRVZFTFMuSU5GTywgY29sb3IsIC4uLnRleHQpO1xufVxuXG4vKiogV3JpdGUgdG8gdGhlIGNvbnNvbGUgZm9yIGF0IEVSUk9SIGxvZ2dpbmcgbGV2ZWwgKi9cbmV4cG9ydCBmdW5jdGlvbiBlcnJvciguLi50ZXh0OiBzdHJpbmdbXSk6IHZvaWQ7XG5leHBvcnQgZnVuY3Rpb24gZXJyb3IoY29sb3I6IHR5cGVvZiBjaGFsaywgLi4udGV4dDogc3RyaW5nW10pOiB2b2lkO1xuZXhwb3J0IGZ1bmN0aW9uIGVycm9yKGNvbG9yOiB0eXBlb2YgY2hhbGt8c3RyaW5nLCAuLi50ZXh0OiBzdHJpbmdbXSkge1xuICBydW5Db25zb2xlQ29tbWFuZChjb25zb2xlLmVycm9yLCBMT0dfTEVWRUxTLkVSUk9SLCBjb2xvciwgLi4udGV4dCk7XG59XG5cbi8qKiBXcml0ZSB0byB0aGUgY29uc29sZSBmb3IgYXQgREVCVUcgbG9nZ2luZyBsZXZlbCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlYnVnKC4uLnRleHQ6IHN0cmluZ1tdKTogdm9pZDtcbmV4cG9ydCBmdW5jdGlvbiBkZWJ1Zyhjb2xvcjogdHlwZW9mIGNoYWxrLCAuLi50ZXh0OiBzdHJpbmdbXSk6IHZvaWQ7XG5leHBvcnQgZnVuY3Rpb24gZGVidWcoY29sb3I6IHR5cGVvZiBjaGFsa3xzdHJpbmcsIC4uLnRleHQ6IHN0cmluZ1tdKSB7XG4gIHJ1bkNvbnNvbGVDb21tYW5kKGNvbnNvbGUuZGVidWcsIExPR19MRVZFTFMuREVCVUcsIGNvbG9yLCAuLi50ZXh0KTtcbn1cblxuLyoqIFdyaXRlIHRvIHRoZSBjb25zb2xlIGZvciBhdCBMT0cgbG9nZ2luZyBsZXZlbCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvZyguLi50ZXh0OiBzdHJpbmdbXSk6IHZvaWQ7XG5leHBvcnQgZnVuY3Rpb24gbG9nKGNvbG9yOiB0eXBlb2YgY2hhbGssIC4uLnRleHQ6IHN0cmluZ1tdKTogdm9pZDtcbmV4cG9ydCBmdW5jdGlvbiBsb2coY29sb3I6IHR5cGVvZiBjaGFsa3xzdHJpbmcsIC4uLnRleHQ6IHN0cmluZ1tdKSB7XG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8tY29uc29sZVxuICBydW5Db25zb2xlQ29tbWFuZChjb25zb2xlLmxvZywgTE9HX0xFVkVMUy5MT0csIGNvbG9yLCAuLi50ZXh0KTtcbn1cblxuLyoqIFdyaXRlIHRvIHRoZSBjb25zb2xlIGZvciBhdCBXQVJOIGxvZ2dpbmcgbGV2ZWwgKi9cbmV4cG9ydCBmdW5jdGlvbiB3YXJuKC4uLnRleHQ6IHN0cmluZ1tdKTogdm9pZDtcbmV4cG9ydCBmdW5jdGlvbiB3YXJuKGNvbG9yOiB0eXBlb2YgY2hhbGssIC4uLnRleHQ6IHN0cmluZ1tdKTogdm9pZDtcbmV4cG9ydCBmdW5jdGlvbiB3YXJuKGNvbG9yOiB0eXBlb2YgY2hhbGt8c3RyaW5nLCAuLi50ZXh0OiBzdHJpbmdbXSkge1xuICBydW5Db25zb2xlQ29tbWFuZChjb25zb2xlLndhcm4sIExPR19MRVZFTFMuV0FSTiwgY29sb3IsIC4uLnRleHQpO1xufVxuXG4vKipcbiAqIFJ1biB0aGUgY29uc29sZSBjb21tYW5kIHByb3ZpZGVkLCBpZiB0aGUgZW52aXJvbm1lbnRzIGxvZ2dpbmcgbGV2ZWwgZ3JlYXRlciB0aGFuIHRoZVxuICogcHJvdmlkZWQgbG9nZ2luZyBsZXZlbC5cbiAqL1xuZnVuY3Rpb24gcnVuQ29uc29sZUNvbW1hbmQoXG4gICAgY29tbWFuZDogRnVuY3Rpb24sIGxvZ0xldmVsOiBMT0dfTEVWRUxTLCBjb2xvcjogdHlwZW9mIGNoYWxrfHN0cmluZywgLi4udGV4dDogc3RyaW5nW10pIHtcbiAgaWYgKGdldExvZ0xldmVsKCkgPj0gbG9nTGV2ZWwpIHtcbiAgICBpZiAodHlwZW9mIGNvbG9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0ZXh0ID0gdGV4dC5tYXAoZW50cnkgPT4gY29sb3IoZW50cnkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGV4dCA9IFtjb2xvciBhcyBzdHJpbmcsIC4uLnRleHRdO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IHRleHRFbnRyeSBvZiB0ZXh0KSB7XG4gICAgICBjb21tYW5kKHRleHRFbnRyeSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUmV0cmlldmUgdGhlIGxvZyBsZXZlbCBmcm9tIGVudmlyb25tZW50IHZhcmlhYmxlcywgaWYgdGhlIHZhbHVlIGZvdW5kXG4gKiBiYXNlZCBvbiB0aGUgTE9HX0xFVkVMIGVudmlyb25tZW50IHZhcmlhYmxlIGlzIHVuZGVmaW5lZCwgcmV0dXJuIHRoZSBkZWZhdWx0XG4gKiBsb2dnaW5nIGxldmVsLlxuICovXG5mdW5jdGlvbiBnZXRMb2dMZXZlbCgpIHtcbiAgY29uc3QgbG9nTGV2ZWxFbnZWYWx1ZTogYW55ID0gKHByb2Nlc3MuZW52W2BMT0dfTEVWRUxgXSB8fCAnJykudG9VcHBlckNhc2UoKTtcbiAgY29uc3QgbG9nTGV2ZWwgPSBMT0dfTEVWRUxTW2xvZ0xldmVsRW52VmFsdWVdO1xuICBpZiAobG9nTGV2ZWwgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBERUZBVUxUX0xPR19MRVZFTDtcbiAgfVxuICByZXR1cm4gbG9nTGV2ZWw7XG59XG4iXX0=