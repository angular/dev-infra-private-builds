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
        define("@angular/dev-infra-private/caretaker/check/ci", ["require", "exports", "tslib", "node-fetch", "@angular/dev-infra-private/release/versioning", "@angular/dev-infra-private/utils/console"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.printCiStatus = void 0;
    var tslib_1 = require("tslib");
    var node_fetch_1 = require("node-fetch");
    var index_1 = require("@angular/dev-infra-private/release/versioning");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    /** Retrieve and log status of CI for the project. */
    function printCiStatus(git) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var releaseTrains, _a, _b, _c, trainName, train, status_1, e_1_1;
            var e_1, _d;
            return tslib_1.__generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, index_1.fetchActiveReleaseTrains(tslib_1.__assign({ api: git.github }, git.remoteConfig))];
                    case 1:
                        releaseTrains = _e.sent();
                        console_1.info.group(console_1.bold("CI"));
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 8, 9, 10]);
                        _a = tslib_1.__values(Object.entries(releaseTrains)), _b = _a.next();
                        _e.label = 3;
                    case 3:
                        if (!!_b.done) return [3 /*break*/, 7];
                        _c = tslib_1.__read(_b.value, 2), trainName = _c[0], train = _c[1];
                        if (train === null) {
                            console_1.debug("No active release train for " + trainName);
                            return [3 /*break*/, 6];
                        }
                        return [4 /*yield*/, getStatusOfBranch(git, train.branchName)];
                    case 4:
                        status_1 = _e.sent();
                        return [4 /*yield*/, printStatus(trainName.padEnd(6) + " (" + train.branchName + ")", status_1)];
                    case 5:
                        _e.sent();
                        _e.label = 6;
                    case 6:
                        _b = _a.next();
                        return [3 /*break*/, 3];
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        e_1_1 = _e.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 10];
                    case 9:
                        try {
                            if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 10:
                        console_1.info.groupEnd();
                        console_1.info();
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.printCiStatus = printCiStatus;
    /** Log the status of CI for a given branch to the console. */
    function printStatus(label, status) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var branchName;
            return tslib_1.__generator(this, function (_a) {
                branchName = label.padEnd(16);
                if (status === null) {
                    console_1.info(branchName + " was not found on CircleCI");
                }
                else if (status.status === 'success') {
                    console_1.info(branchName + " \u2705");
                }
                else {
                    console_1.info(branchName + " \u274C");
                }
                return [2 /*return*/];
            });
        });
    }
    /** Get the CI status of a given branch from CircleCI. */
    function getStatusOfBranch(git, branch) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, owner, name, url, result;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = git.remoteConfig, owner = _a.owner, name = _a.name;
                        url = "https://circleci.com/gh/" + owner + "/" + name + "/tree/" + branch + ".svg?style=shield";
                        return [4 /*yield*/, node_fetch_1.default(url).then(function (result) { return result.text(); })];
                    case 1:
                        result = _b.sent();
                        if (result && !result.includes('no builds')) {
                            return [2 /*return*/, {
                                    status: result.includes('passing') ? 'success' : 'failed',
                                }];
                        }
                        return [2 /*return*/, null];
                }
            });
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY2FyZXRha2VyL2NoZWNrL2NpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCx5Q0FBK0I7SUFDL0IsdUVBQXdFO0lBRXhFLG9FQUFzRDtJQVN0RCxxREFBcUQ7SUFDckQsU0FBc0IsYUFBYSxDQUFDLEdBQWM7Ozs7Ozs0QkFDMUIscUJBQU0sZ0NBQXdCLG9CQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsTUFBTSxJQUFLLEdBQUcsQ0FBQyxZQUFZLEVBQUUsRUFBQTs7d0JBQXRGLGFBQWEsR0FBRyxTQUFzRTt3QkFFNUYsY0FBSSxDQUFDLEtBQUssQ0FBQyxjQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7Ozt3QkFDVSxLQUFBLGlCQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUE7Ozs7d0JBQW5ELEtBQUEsMkJBQWtCLEVBQWpCLFNBQVMsUUFBQSxFQUFFLEtBQUssUUFBQTt3QkFDMUIsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFOzRCQUNsQixlQUFLLENBQUMsaUNBQStCLFNBQVcsQ0FBQyxDQUFDOzRCQUNsRCx3QkFBUzt5QkFDVjt3QkFDYyxxQkFBTSxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFBOzt3QkFBdkQsV0FBUyxTQUE4Qzt3QkFDN0QscUJBQU0sV0FBVyxDQUFJLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFVBQUssS0FBSyxDQUFDLFVBQVUsTUFBRyxFQUFFLFFBQU0sQ0FBQyxFQUFBOzt3QkFBekUsU0FBeUUsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7d0JBRTVFLGNBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzt3QkFDaEIsY0FBSSxFQUFFLENBQUM7Ozs7O0tBQ1I7SUFkRCxzQ0FjQztJQUVELDhEQUE4RDtJQUM5RCxTQUFlLFdBQVcsQ0FBQyxLQUFhLEVBQUUsTUFBOEI7Ozs7Z0JBQ2hFLFVBQVUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNwQyxJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7b0JBQ25CLGNBQUksQ0FBSSxVQUFVLCtCQUE0QixDQUFDLENBQUM7aUJBQ2pEO3FCQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7b0JBQ3RDLGNBQUksQ0FBSSxVQUFVLFlBQUksQ0FBQyxDQUFDO2lCQUN6QjtxQkFBTTtvQkFDTCxjQUFJLENBQUksVUFBVSxZQUFJLENBQUMsQ0FBQztpQkFDekI7Ozs7S0FDRjtJQUVELHlEQUF5RDtJQUN6RCxTQUFlLGlCQUFpQixDQUFDLEdBQWMsRUFBRSxNQUFjOzs7Ozs7d0JBQ3ZELEtBQWdCLEdBQUcsQ0FBQyxZQUFZLEVBQS9CLEtBQUssV0FBQSxFQUFFLElBQUksVUFBQSxDQUFxQjt3QkFDakMsR0FBRyxHQUFHLDZCQUEyQixLQUFLLFNBQUksSUFBSSxjQUFTLE1BQU0sc0JBQW1CLENBQUM7d0JBQ3hFLHFCQUFNLG9CQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsTUFBTSxJQUFJLE9BQUEsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFiLENBQWEsQ0FBQyxFQUFBOzt3QkFBdkQsTUFBTSxHQUFHLFNBQThDO3dCQUU3RCxJQUFJLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7NEJBQzNDLHNCQUFPO29DQUNMLE1BQU0sRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVE7aUNBQzFELEVBQUM7eUJBQ0g7d0JBQ0Qsc0JBQU8sSUFBSSxFQUFDOzs7O0tBQ2IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IGZldGNoIGZyb20gJ25vZGUtZmV0Y2gnO1xuaW1wb3J0IHtmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uLy4uL3JlbGVhc2UvdmVyc2lvbmluZy9pbmRleCc7XG5cbmltcG9ydCB7Ym9sZCwgZGVidWcsIGluZm99IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9pbmRleCc7XG5cblxuLyoqIFRoZSByZXN1bHRzIG9mIGNoZWNraW5nIHRoZSBzdGF0dXMgb2YgQ0kuICAqL1xuaW50ZXJmYWNlIFN0YXR1c0NoZWNrUmVzdWx0IHtcbiAgc3RhdHVzOiAnc3VjY2Vzcyd8J2ZhaWxlZCc7XG59XG5cbi8qKiBSZXRyaWV2ZSBhbmQgbG9nIHN0YXR1cyBvZiBDSSBmb3IgdGhlIHByb2plY3QuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJpbnRDaVN0YXR1cyhnaXQ6IEdpdENsaWVudCkge1xuICBjb25zdCByZWxlYXNlVHJhaW5zID0gYXdhaXQgZmV0Y2hBY3RpdmVSZWxlYXNlVHJhaW5zKHthcGk6IGdpdC5naXRodWIsIC4uLmdpdC5yZW1vdGVDb25maWd9KTtcblxuICBpbmZvLmdyb3VwKGJvbGQoYENJYCkpO1xuICBmb3IgKGNvbnN0IFt0cmFpbk5hbWUsIHRyYWluXSBvZiBPYmplY3QuZW50cmllcyhyZWxlYXNlVHJhaW5zKSkge1xuICAgIGlmICh0cmFpbiA9PT0gbnVsbCkge1xuICAgICAgZGVidWcoYE5vIGFjdGl2ZSByZWxlYXNlIHRyYWluIGZvciAke3RyYWluTmFtZX1gKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBjb25zdCBzdGF0dXMgPSBhd2FpdCBnZXRTdGF0dXNPZkJyYW5jaChnaXQsIHRyYWluLmJyYW5jaE5hbWUpO1xuICAgIGF3YWl0IHByaW50U3RhdHVzKGAke3RyYWluTmFtZS5wYWRFbmQoNil9ICgke3RyYWluLmJyYW5jaE5hbWV9KWAsIHN0YXR1cyk7XG4gIH1cbiAgaW5mby5ncm91cEVuZCgpO1xuICBpbmZvKCk7XG59XG5cbi8qKiBMb2cgdGhlIHN0YXR1cyBvZiBDSSBmb3IgYSBnaXZlbiBicmFuY2ggdG8gdGhlIGNvbnNvbGUuICovXG5hc3luYyBmdW5jdGlvbiBwcmludFN0YXR1cyhsYWJlbDogc3RyaW5nLCBzdGF0dXM6IFN0YXR1c0NoZWNrUmVzdWx0fG51bGwpIHtcbiAgY29uc3QgYnJhbmNoTmFtZSA9IGxhYmVsLnBhZEVuZCgxNik7XG4gIGlmIChzdGF0dXMgPT09IG51bGwpIHtcbiAgICBpbmZvKGAke2JyYW5jaE5hbWV9IHdhcyBub3QgZm91bmQgb24gQ2lyY2xlQ0lgKTtcbiAgfSBlbHNlIGlmIChzdGF0dXMuc3RhdHVzID09PSAnc3VjY2VzcycpIHtcbiAgICBpbmZvKGAke2JyYW5jaE5hbWV9IOKchWApO1xuICB9IGVsc2Uge1xuICAgIGluZm8oYCR7YnJhbmNoTmFtZX0g4p2MYCk7XG4gIH1cbn1cblxuLyoqIEdldCB0aGUgQ0kgc3RhdHVzIG9mIGEgZ2l2ZW4gYnJhbmNoIGZyb20gQ2lyY2xlQ0kuICovXG5hc3luYyBmdW5jdGlvbiBnZXRTdGF0dXNPZkJyYW5jaChnaXQ6IEdpdENsaWVudCwgYnJhbmNoOiBzdHJpbmcpOiBQcm9taXNlPFN0YXR1c0NoZWNrUmVzdWx0fG51bGw+IHtcbiAgY29uc3Qge293bmVyLCBuYW1lfSA9IGdpdC5yZW1vdGVDb25maWc7XG4gIGNvbnN0IHVybCA9IGBodHRwczovL2NpcmNsZWNpLmNvbS9naC8ke293bmVyfS8ke25hbWV9L3RyZWUvJHticmFuY2h9LnN2Zz9zdHlsZT1zaGllbGRgO1xuICBjb25zdCByZXN1bHQgPSBhd2FpdCBmZXRjaCh1cmwpLnRoZW4ocmVzdWx0ID0+IHJlc3VsdC50ZXh0KCkpO1xuXG4gIGlmIChyZXN1bHQgJiYgIXJlc3VsdC5pbmNsdWRlcygnbm8gYnVpbGRzJykpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzOiByZXN1bHQuaW5jbHVkZXMoJ3Bhc3NpbmcnKSA/ICdzdWNjZXNzJyA6ICdmYWlsZWQnLFxuICAgIH07XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG4iXX0=