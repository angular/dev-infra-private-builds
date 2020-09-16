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
        define("@angular/dev-infra-private/caretaker/check/ci", ["require", "exports", "tslib", "node-fetch", "@angular/dev-infra-private/utils/console"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.printCiStatus = void 0;
    var tslib_1 = require("tslib");
    var node_fetch_1 = require("node-fetch");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    /** Retrieve and log status of CI for the project. */
    function printCiStatus(git) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console_1.info.group(console_1.bold("CI"));
                        // TODO(josephperrott): Expand list of branches checked to all active branches.
                        return [4 /*yield*/, printStatus(git, 'master')];
                    case 1:
                        // TODO(josephperrott): Expand list of branches checked to all active branches.
                        _a.sent();
                        console_1.info.groupEnd();
                        console_1.info();
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.printCiStatus = printCiStatus;
    /** Log the status of CI for a given branch to the console. */
    function printStatus(git, branch) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result, branchName;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getStatusOfBranch(git, branch)];
                    case 1:
                        result = _a.sent();
                        branchName = branch.padEnd(10);
                        if (result === null) {
                            console_1.info(branchName + " was not found on CircleCI");
                        }
                        else if (result.status === 'success') {
                            console_1.info(branchName + " \u2705");
                        }
                        else {
                            console_1.info(branchName + " \u274C (Ran at: " + result.timestamp.toLocaleString() + ")");
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    /** Get the CI status of a given branch from CircleCI. */
    function getStatusOfBranch(git, branch) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _b, owner, name, url, result;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = git.remoteConfig, owner = _b.owner, name = _b.name;
                        url = "https://circleci.com/api/v1.1/project/gh/" + owner + "/" + name + "/tree/" + branch + "?limit=1&filter=completed&shallow=true";
                        return [4 /*yield*/, node_fetch_1.default(url).then(function (result) { return result.json(); })];
                    case 1:
                        result = (_a = (_c.sent())) === null || _a === void 0 ? void 0 : _a[0];
                        if (result) {
                            return [2 /*return*/, {
                                    status: result.outcome,
                                    timestamp: new Date(result.stop_time),
                                    buildUrl: result.build_url
                                }];
                        }
                        return [2 /*return*/, null];
                }
            });
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY2FyZXRha2VyL2NoZWNrL2NpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCx5Q0FBK0I7SUFFL0Isb0VBQTJEO0lBVzNELHFEQUFxRDtJQUNyRCxTQUFzQixhQUFhLENBQUMsR0FBYzs7Ozs7d0JBQ2hELGNBQUksQ0FBQyxLQUFLLENBQUMsY0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7d0JBQ3ZCLCtFQUErRTt3QkFDL0UscUJBQU0sV0FBVyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsRUFBQTs7d0JBRGhDLCtFQUErRTt3QkFDL0UsU0FBZ0MsQ0FBQzt3QkFDakMsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO3dCQUNoQixjQUFJLEVBQUUsQ0FBQzs7Ozs7S0FDUjtJQU5ELHNDQU1DO0lBRUQsOERBQThEO0lBQzlELFNBQWUsV0FBVyxDQUFDLEdBQWMsRUFBRSxNQUFjOzs7Ozs0QkFDeEMscUJBQU0saUJBQWlCLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUFBOzt3QkFBN0MsTUFBTSxHQUFHLFNBQW9DO3dCQUM3QyxVQUFVLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDckMsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFOzRCQUNuQixjQUFJLENBQUksVUFBVSwrQkFBNEIsQ0FBQyxDQUFDO3lCQUNqRDs2QkFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFOzRCQUN0QyxjQUFJLENBQUksVUFBVSxZQUFJLENBQUMsQ0FBQzt5QkFDekI7NkJBQU07NEJBQ0wsY0FBSSxDQUFJLFVBQVUseUJBQWUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsTUFBRyxDQUFDLENBQUM7eUJBQ3hFOzs7OztLQUNGO0lBRUQseURBQXlEO0lBQ3pELFNBQWUsaUJBQWlCLENBQUMsR0FBYyxFQUFFLE1BQWM7Ozs7Ozs7d0JBQ3ZELEtBQWdCLEdBQUcsQ0FBQyxZQUFZLEVBQS9CLEtBQUssV0FBQSxFQUFFLElBQUksVUFBQSxDQUFxQjt3QkFDakMsR0FBRyxHQUFHLDhDQUE0QyxLQUFLLFNBQUksSUFBSSxjQUNqRSxNQUFNLDJDQUF3QyxDQUFDO3dCQUNuQyxxQkFBTSxvQkFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLE1BQU0sSUFBSSxPQUFBLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBYixDQUFhLENBQUMsRUFBQTs7d0JBQXhELE1BQU0sU0FBRyxDQUFDLFNBQThDLENBQUMsMENBQUcsQ0FBQyxDQUFDO3dCQUVwRSxJQUFJLE1BQU0sRUFBRTs0QkFDVixzQkFBTztvQ0FDTCxNQUFNLEVBQUUsTUFBTSxDQUFDLE9BQU87b0NBQ3RCLFNBQVMsRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO29DQUNyQyxRQUFRLEVBQUUsTUFBTSxDQUFDLFNBQVM7aUNBQzNCLEVBQUM7eUJBQ0g7d0JBQ0Qsc0JBQU8sSUFBSSxFQUFDOzs7O0tBQ2IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IGZldGNoIGZyb20gJ25vZGUtZmV0Y2gnO1xuXG5pbXBvcnQge2JvbGQsIGdyZWVuLCBpbmZvLCByZWR9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdCc7XG5cblxuLyoqIFRoZSByZXN1bHRzIG9mIGNoZWNraW5nIHRoZSBzdGF0dXMgb2YgQ0kuICAqL1xuaW50ZXJmYWNlIFN0YXR1c0NoZWNrUmVzdWx0IHtcbiAgc3RhdHVzOiAnc3VjY2Vzcyd8J2ZhaWxlZCd8J2NhbmNlbGVkJ3wnaW5mcmFzdHJ1Y3R1cmVfZmFpbCd8J3RpbWVkb3V0J3wnZmFpbGVkJ3wnbm9fdGVzdHMnO1xuICB0aW1lc3RhbXA6IERhdGU7XG4gIGJ1aWxkVXJsOiBzdHJpbmc7XG59XG5cbi8qKiBSZXRyaWV2ZSBhbmQgbG9nIHN0YXR1cyBvZiBDSSBmb3IgdGhlIHByb2plY3QuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJpbnRDaVN0YXR1cyhnaXQ6IEdpdENsaWVudCkge1xuICBpbmZvLmdyb3VwKGJvbGQoYENJYCkpO1xuICAvLyBUT0RPKGpvc2VwaHBlcnJvdHQpOiBFeHBhbmQgbGlzdCBvZiBicmFuY2hlcyBjaGVja2VkIHRvIGFsbCBhY3RpdmUgYnJhbmNoZXMuXG4gIGF3YWl0IHByaW50U3RhdHVzKGdpdCwgJ21hc3RlcicpO1xuICBpbmZvLmdyb3VwRW5kKCk7XG4gIGluZm8oKTtcbn1cblxuLyoqIExvZyB0aGUgc3RhdHVzIG9mIENJIGZvciBhIGdpdmVuIGJyYW5jaCB0byB0aGUgY29uc29sZS4gKi9cbmFzeW5jIGZ1bmN0aW9uIHByaW50U3RhdHVzKGdpdDogR2l0Q2xpZW50LCBicmFuY2g6IHN0cmluZykge1xuICBjb25zdCByZXN1bHQgPSBhd2FpdCBnZXRTdGF0dXNPZkJyYW5jaChnaXQsIGJyYW5jaCk7XG4gIGNvbnN0IGJyYW5jaE5hbWUgPSBicmFuY2gucGFkRW5kKDEwKTtcbiAgaWYgKHJlc3VsdCA9PT0gbnVsbCkge1xuICAgIGluZm8oYCR7YnJhbmNoTmFtZX0gd2FzIG5vdCBmb3VuZCBvbiBDaXJjbGVDSWApO1xuICB9IGVsc2UgaWYgKHJlc3VsdC5zdGF0dXMgPT09ICdzdWNjZXNzJykge1xuICAgIGluZm8oYCR7YnJhbmNoTmFtZX0g4pyFYCk7XG4gIH0gZWxzZSB7XG4gICAgaW5mbyhgJHticmFuY2hOYW1lfSDinYwgKFJhbiBhdDogJHtyZXN1bHQudGltZXN0YW1wLnRvTG9jYWxlU3RyaW5nKCl9KWApO1xuICB9XG59XG5cbi8qKiBHZXQgdGhlIENJIHN0YXR1cyBvZiBhIGdpdmVuIGJyYW5jaCBmcm9tIENpcmNsZUNJLiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0U3RhdHVzT2ZCcmFuY2goZ2l0OiBHaXRDbGllbnQsIGJyYW5jaDogc3RyaW5nKTogUHJvbWlzZTxTdGF0dXNDaGVja1Jlc3VsdHxudWxsPiB7XG4gIGNvbnN0IHtvd25lciwgbmFtZX0gPSBnaXQucmVtb3RlQ29uZmlnO1xuICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9jaXJjbGVjaS5jb20vYXBpL3YxLjEvcHJvamVjdC9naC8ke293bmVyfS8ke25hbWV9L3RyZWUvJHtcbiAgICAgIGJyYW5jaH0/bGltaXQ9MSZmaWx0ZXI9Y29tcGxldGVkJnNoYWxsb3c9dHJ1ZWA7XG4gIGNvbnN0IHJlc3VsdCA9IChhd2FpdCBmZXRjaCh1cmwpLnRoZW4ocmVzdWx0ID0+IHJlc3VsdC5qc29uKCkpKT8uWzBdO1xuXG4gIGlmIChyZXN1bHQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzOiByZXN1bHQub3V0Y29tZSxcbiAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUocmVzdWx0LnN0b3BfdGltZSksXG4gICAgICBidWlsZFVybDogcmVzdWx0LmJ1aWxkX3VybFxuICAgIH07XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG4iXX0=