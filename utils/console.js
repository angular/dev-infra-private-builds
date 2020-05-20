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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9jb25zb2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBMEI7SUFDMUIscUNBQWdDO0lBR2hDLHNEQUFzRDtJQUN6QyxRQUFBLEdBQUcsR0FBaUIsZUFBSyxDQUFDLEdBQUcsQ0FBQztJQUM5QixRQUFBLEtBQUssR0FBaUIsZUFBSyxDQUFDLEtBQUssQ0FBQztJQUNsQyxRQUFBLE1BQU0sR0FBaUIsZUFBSyxDQUFDLE1BQU0sQ0FBQztJQUVqRCw2RUFBNkU7SUFDN0UsU0FBc0IsYUFBYSxDQUFDLE9BQWUsRUFBRSxZQUFvQjtRQUFwQiw2QkFBQSxFQUFBLG9CQUFvQjs7Ozs0QkFDL0QscUJBQU0saUJBQU0sQ0FBb0I7NEJBQy9CLElBQUksRUFBRSxTQUFTOzRCQUNmLElBQUksRUFBRSxRQUFROzRCQUNkLE9BQU8sRUFBRSxPQUFPOzRCQUNoQixPQUFPLEVBQUUsWUFBWTt5QkFDdEIsQ0FBQyxFQUFBOzRCQUxULHNCQUFPLENBQUMsU0FLQyxDQUFDOzZCQUNMLE1BQU0sRUFBQzs7OztLQUNiO0lBUkQsc0NBUUM7SUFFRDs7OztPQUlHO0lBQ0gsSUFBWSxVQU9YO0lBUEQsV0FBWSxVQUFVO1FBQ3BCLCtDQUFVLENBQUE7UUFDViw2Q0FBUyxDQUFBO1FBQ1QsMkNBQVEsQ0FBQTtRQUNSLHlDQUFPLENBQUE7UUFDUCwyQ0FBUSxDQUFBO1FBQ1IsNkNBQVMsQ0FBQTtJQUNYLENBQUMsRUFQVyxVQUFVLEdBQVYsa0JBQVUsS0FBVixrQkFBVSxRQU9yQjtJQUVELHNDQUFzQztJQUN6QixRQUFBLGlCQUFpQixHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7SUFLakQsU0FBZ0IsSUFBSSxDQUFDLEtBQTBCO1FBQUUsY0FBaUI7YUFBakIsVUFBaUIsRUFBakIscUJBQWlCLEVBQWpCLElBQWlCO1lBQWpCLDZCQUFpQjs7UUFDaEUsaUJBQWlCLGlDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLEdBQUssSUFBSSxHQUFFO0lBQ25FLENBQUM7SUFGRCxvQkFFQztJQUtELFNBQWdCLEtBQUssQ0FBQyxLQUEwQjtRQUFFLGNBQWlCO2FBQWpCLFVBQWlCLEVBQWpCLHFCQUFpQixFQUFqQixJQUFpQjtZQUFqQiw2QkFBaUI7O1FBQ2pFLGlCQUFpQixpQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxHQUFLLElBQUksR0FBRTtJQUNyRSxDQUFDO0lBRkQsc0JBRUM7SUFLRCxTQUFnQixLQUFLLENBQUMsS0FBMEI7UUFBRSxjQUFpQjthQUFqQixVQUFpQixFQUFqQixxQkFBaUIsRUFBakIsSUFBaUI7WUFBakIsNkJBQWlCOztRQUNqRSxpQkFBaUIsaUNBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLEtBQUssR0FBSyxJQUFJLEdBQUU7SUFDckUsQ0FBQztJQUZELHNCQUVDO0lBS0QsU0FBZ0IsR0FBRyxDQUFDLEtBQTBCO1FBQUUsY0FBaUI7YUFBakIsVUFBaUIsRUFBakIscUJBQWlCLEVBQWpCLElBQWlCO1lBQWpCLDZCQUFpQjs7UUFDL0QsdUNBQXVDO1FBQ3ZDLGlCQUFpQixpQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxHQUFLLElBQUksR0FBRTtJQUNqRSxDQUFDO0lBSEQsa0JBR0M7SUFLRCxTQUFnQixJQUFJLENBQUMsS0FBMEI7UUFBRSxjQUFpQjthQUFqQixVQUFpQixFQUFqQixxQkFBaUIsRUFBakIsSUFBaUI7WUFBakIsNkJBQWlCOztRQUNoRSxpQkFBaUIsaUNBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssR0FBSyxJQUFJLEdBQUU7SUFDbkUsQ0FBQztJQUZELG9CQUVDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBUyxpQkFBaUIsQ0FDdEIsT0FBaUIsRUFBRSxRQUFvQixFQUFFLEtBQTBCOztRQUFFLGNBQWlCO2FBQWpCLFVBQWlCLEVBQWpCLHFCQUFpQixFQUFqQixJQUFpQjtZQUFqQiw2QkFBaUI7O1FBQ3hGLElBQUksV0FBVyxFQUFFLElBQUksUUFBUSxFQUFFO1lBQzdCLElBQUksT0FBTyxLQUFLLEtBQUssVUFBVSxFQUFFO2dCQUMvQixJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBWixDQUFZLENBQUMsQ0FBQzthQUN4QztpQkFBTTtnQkFDTCxJQUFJLHFCQUFJLEtBQWUsR0FBSyxJQUFJLENBQUMsQ0FBQzthQUNuQzs7Z0JBQ0QsS0FBd0IsSUFBQSxTQUFBLGlCQUFBLElBQUksQ0FBQSwwQkFBQSw0Q0FBRTtvQkFBekIsSUFBTSxTQUFTLGlCQUFBO29CQUNsQixPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7aUJBQ3BCOzs7Ozs7Ozs7U0FDRjtJQUNILENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsU0FBUyxXQUFXO1FBQ2xCLElBQU0sZ0JBQWdCLEdBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzdFLElBQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzlDLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtZQUMxQixPQUFPLHlCQUFpQixDQUFDO1NBQzFCO1FBQ0QsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgY2hhbGsgZnJvbSAnY2hhbGsnO1xuaW1wb3J0IHtwcm9tcHR9IGZyb20gJ2lucXVpcmVyJztcblxuXG4vKiogUmVleHBvcnQgb2YgY2hhbGsgY29sb3JzIGZvciBjb252ZW5pZW50IGFjY2Vzcy4gKi9cbmV4cG9ydCBjb25zdCByZWQ6IHR5cGVvZiBjaGFsayA9IGNoYWxrLnJlZDtcbmV4cG9ydCBjb25zdCBncmVlbjogdHlwZW9mIGNoYWxrID0gY2hhbGsuZ3JlZW47XG5leHBvcnQgY29uc3QgeWVsbG93OiB0eXBlb2YgY2hhbGsgPSBjaGFsay55ZWxsb3c7XG5cbi8qKiBQcm9tcHRzIHRoZSB1c2VyIHdpdGggYSBjb25maXJtYXRpb24gcXVlc3Rpb24gYW5kIGEgc3BlY2lmaWVkIG1lc3NhZ2UuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvbXB0Q29uZmlybShtZXNzYWdlOiBzdHJpbmcsIGRlZmF1bHRWYWx1ZSA9IGZhbHNlKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIHJldHVybiAoYXdhaXQgcHJvbXB0PHtyZXN1bHQ6IGJvb2xlYW59Pih7XG4gICAgICAgICAgIHR5cGU6ICdjb25maXJtJyxcbiAgICAgICAgICAgbmFtZTogJ3Jlc3VsdCcsXG4gICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICAgICAgIGRlZmF1bHQ6IGRlZmF1bHRWYWx1ZSxcbiAgICAgICAgIH0pKVxuICAgICAgLnJlc3VsdDtcbn1cblxuLyoqXG4gKiBTdXBwb3J0ZWQgbGV2ZWxzIGZvciBsb2dnaW5nIGZ1bmN0aW9ucy5cbiAqXG4gKiBMZXZlbHMgYXJlIG1hcHBlZCB0byBudW1iZXJzIHRvIHJlcHJlc2VudCBhIGhpZXJhcmNoeSBvZiBsb2dnaW5nIGxldmVscy5cbiAqL1xuZXhwb3J0IGVudW0gTE9HX0xFVkVMUyB7XG4gIFNJTEVOVCA9IDAsXG4gIEVSUk9SID0gMSxcbiAgV0FSTiA9IDIsXG4gIExPRyA9IDMsXG4gIElORk8gPSA0LFxuICBERUJVRyA9IDUsXG59XG5cbi8qKiBEZWZhdWx0IGxvZyBsZXZlbCBmb3IgdGhlIHRvb2wuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9MT0dfTEVWRUwgPSBMT0dfTEVWRUxTLklORk87XG5cbi8qKiBXcml0ZSB0byB0aGUgY29uc29sZSBmb3IgYXQgSU5GTyBsb2dnaW5nIGxldmVsICovXG5leHBvcnQgZnVuY3Rpb24gaW5mbyguLi50ZXh0OiBzdHJpbmdbXSk6IHZvaWQ7XG5leHBvcnQgZnVuY3Rpb24gaW5mbyhjb2xvcjogdHlwZW9mIGNoYWxrLCAuLi50ZXh0OiBzdHJpbmdbXSk6IHZvaWQ7XG5leHBvcnQgZnVuY3Rpb24gaW5mbyhjb2xvcjogdHlwZW9mIGNoYWxrfHN0cmluZywgLi4udGV4dDogc3RyaW5nW10pIHtcbiAgcnVuQ29uc29sZUNvbW1hbmQoY29uc29sZS5pbmZvLCBMT0dfTEVWRUxTLklORk8sIGNvbG9yLCAuLi50ZXh0KTtcbn1cblxuLyoqIFdyaXRlIHRvIHRoZSBjb25zb2xlIGZvciBhdCBFUlJPUiBsb2dnaW5nIGxldmVsICovXG5leHBvcnQgZnVuY3Rpb24gZXJyb3IoLi4udGV4dDogc3RyaW5nW10pOiB2b2lkO1xuZXhwb3J0IGZ1bmN0aW9uIGVycm9yKGNvbG9yOiB0eXBlb2YgY2hhbGssIC4uLnRleHQ6IHN0cmluZ1tdKTogdm9pZDtcbmV4cG9ydCBmdW5jdGlvbiBlcnJvcihjb2xvcjogdHlwZW9mIGNoYWxrfHN0cmluZywgLi4udGV4dDogc3RyaW5nW10pIHtcbiAgcnVuQ29uc29sZUNvbW1hbmQoY29uc29sZS5lcnJvciwgTE9HX0xFVkVMUy5FUlJPUiwgY29sb3IsIC4uLnRleHQpO1xufVxuXG4vKiogV3JpdGUgdG8gdGhlIGNvbnNvbGUgZm9yIGF0IERFQlVHIGxvZ2dpbmcgbGV2ZWwgKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWJ1ZyguLi50ZXh0OiBzdHJpbmdbXSk6IHZvaWQ7XG5leHBvcnQgZnVuY3Rpb24gZGVidWcoY29sb3I6IHR5cGVvZiBjaGFsaywgLi4udGV4dDogc3RyaW5nW10pOiB2b2lkO1xuZXhwb3J0IGZ1bmN0aW9uIGRlYnVnKGNvbG9yOiB0eXBlb2YgY2hhbGt8c3RyaW5nLCAuLi50ZXh0OiBzdHJpbmdbXSkge1xuICBydW5Db25zb2xlQ29tbWFuZChjb25zb2xlLmRlYnVnLCBMT0dfTEVWRUxTLkRFQlVHLCBjb2xvciwgLi4udGV4dCk7XG59XG5cbi8qKiBXcml0ZSB0byB0aGUgY29uc29sZSBmb3IgYXQgTE9HIGxvZ2dpbmcgbGV2ZWwgKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2coLi4udGV4dDogc3RyaW5nW10pOiB2b2lkO1xuZXhwb3J0IGZ1bmN0aW9uIGxvZyhjb2xvcjogdHlwZW9mIGNoYWxrLCAuLi50ZXh0OiBzdHJpbmdbXSk6IHZvaWQ7XG5leHBvcnQgZnVuY3Rpb24gbG9nKGNvbG9yOiB0eXBlb2YgY2hhbGt8c3RyaW5nLCAuLi50ZXh0OiBzdHJpbmdbXSkge1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbnNvbGVcbiAgcnVuQ29uc29sZUNvbW1hbmQoY29uc29sZS5sb2csIExPR19MRVZFTFMuTE9HLCBjb2xvciwgLi4udGV4dCk7XG59XG5cbi8qKiBXcml0ZSB0byB0aGUgY29uc29sZSBmb3IgYXQgV0FSTiBsb2dnaW5nIGxldmVsICovXG5leHBvcnQgZnVuY3Rpb24gd2FybiguLi50ZXh0OiBzdHJpbmdbXSk6IHZvaWQ7XG5leHBvcnQgZnVuY3Rpb24gd2Fybihjb2xvcjogdHlwZW9mIGNoYWxrLCAuLi50ZXh0OiBzdHJpbmdbXSk6IHZvaWQ7XG5leHBvcnQgZnVuY3Rpb24gd2Fybihjb2xvcjogdHlwZW9mIGNoYWxrfHN0cmluZywgLi4udGV4dDogc3RyaW5nW10pIHtcbiAgcnVuQ29uc29sZUNvbW1hbmQoY29uc29sZS53YXJuLCBMT0dfTEVWRUxTLldBUk4sIGNvbG9yLCAuLi50ZXh0KTtcbn1cblxuLyoqXG4gKiBSdW4gdGhlIGNvbnNvbGUgY29tbWFuZCBwcm92aWRlZCwgaWYgdGhlIGVudmlyb25tZW50cyBsb2dnaW5nIGxldmVsIGdyZWF0ZXIgdGhhbiB0aGVcbiAqIHByb3ZpZGVkIGxvZ2dpbmcgbGV2ZWwuXG4gKi9cbmZ1bmN0aW9uIHJ1bkNvbnNvbGVDb21tYW5kKFxuICAgIGNvbW1hbmQ6IEZ1bmN0aW9uLCBsb2dMZXZlbDogTE9HX0xFVkVMUywgY29sb3I6IHR5cGVvZiBjaGFsa3xzdHJpbmcsIC4uLnRleHQ6IHN0cmluZ1tdKSB7XG4gIGlmIChnZXRMb2dMZXZlbCgpID49IGxvZ0xldmVsKSB7XG4gICAgaWYgKHR5cGVvZiBjb2xvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGV4dCA9IHRleHQubWFwKGVudHJ5ID0+IGNvbG9yKGVudHJ5KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRleHQgPSBbY29sb3IgYXMgc3RyaW5nLCAuLi50ZXh0XTtcbiAgICB9XG4gICAgZm9yIChjb25zdCB0ZXh0RW50cnkgb2YgdGV4dCkge1xuICAgICAgY29tbWFuZCh0ZXh0RW50cnkpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFJldHJpZXZlIHRoZSBsb2cgbGV2ZWwgZnJvbSBlbnZpcm9ubWVudCB2YXJpYWJsZXMsIGlmIHRoZSB2YWx1ZSBmb3VuZFxuICogYmFzZWQgb24gdGhlIExPR19MRVZFTCBlbnZpcm9ubWVudCB2YXJpYWJsZSBpcyB1bmRlZmluZWQsIHJldHVybiB0aGUgZGVmYXVsdFxuICogbG9nZ2luZyBsZXZlbC5cbiAqL1xuZnVuY3Rpb24gZ2V0TG9nTGV2ZWwoKSB7XG4gIGNvbnN0IGxvZ0xldmVsRW52VmFsdWU6IGFueSA9IChwcm9jZXNzLmVudltgTE9HX0xFVkVMYF0gfHwgJycpLnRvVXBwZXJDYXNlKCk7XG4gIGNvbnN0IGxvZ0xldmVsID0gTE9HX0xFVkVMU1tsb2dMZXZlbEVudlZhbHVlXTtcbiAgaWYgKGxvZ0xldmVsID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gREVGQVVMVF9MT0dfTEVWRUw7XG4gIH1cbiAgcmV0dXJuIGxvZ0xldmVsO1xufVxuIl19