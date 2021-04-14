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
        define("@angular/dev-infra-private/caretaker/check/ci", ["require", "exports", "tslib", "node-fetch", "@angular/dev-infra-private/release/versioning", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/caretaker/check/base"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CiModule = void 0;
    var tslib_1 = require("tslib");
    var node_fetch_1 = require("node-fetch");
    var index_1 = require("@angular/dev-infra-private/release/versioning");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var base_1 = require("@angular/dev-infra-private/caretaker/check/base");
    var CiModule = /** @class */ (function (_super) {
        tslib_1.__extends(CiModule, _super);
        function CiModule() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CiModule.prototype.retrieveData = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var gitRepoWithApi, releaseTrains, ciResultPromises;
                var _this = this;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            gitRepoWithApi = tslib_1.__assign({ api: this.git.github }, this.git.remoteConfig);
                            return [4 /*yield*/, index_1.fetchActiveReleaseTrains(gitRepoWithApi)];
                        case 1:
                            releaseTrains = _a.sent();
                            ciResultPromises = Object.entries(releaseTrains).map(function (_a) {
                                var _b = tslib_1.__read(_a, 2), trainName = _b[0], train = _b[1];
                                return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                    var _c;
                                    return tslib_1.__generator(this, function (_d) {
                                        switch (_d.label) {
                                            case 0:
                                                if (train === null) {
                                                    return [2 /*return*/, {
                                                            active: false,
                                                            name: trainName,
                                                            label: '',
                                                            status: 'not found',
                                                        }];
                                                }
                                                _c = {
                                                    active: true,
                                                    name: train.branchName,
                                                    label: trainName + " (" + train.branchName + ")"
                                                };
                                                return [4 /*yield*/, this.getBranchStatusFromCi(train.branchName)];
                                            case 1: return [2 /*return*/, (_c.status = _d.sent(),
                                                    _c)];
                                        }
                                    });
                                });
                            });
                            return [4 /*yield*/, Promise.all(ciResultPromises)];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        CiModule.prototype.printToTerminal = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var data, minLabelLength;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.data];
                        case 1:
                            data = _a.sent();
                            minLabelLength = Math.max.apply(Math, tslib_1.__spreadArray([], tslib_1.__read(data.map(function (result) { return result.label.length; }))));
                            console_1.info.group(console_1.bold("CI"));
                            data.forEach(function (result) {
                                if (result.active === false) {
                                    console_1.debug("No active release train for " + result.name);
                                    return;
                                }
                                var label = result.label.padEnd(minLabelLength);
                                if (result.status === 'not found') {
                                    console_1.info(result.name + " was not found on CircleCI");
                                }
                                else if (result.status === 'success') {
                                    console_1.info(label + " \u2705");
                                }
                                else {
                                    console_1.info(label + " \u274C");
                                }
                            });
                            console_1.info.groupEnd();
                            console_1.info();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Get the CI status of a given branch from CircleCI. */
        CiModule.prototype.getBranchStatusFromCi = function (branch) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, owner, name, url, result;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = this.git.remoteConfig, owner = _a.owner, name = _a.name;
                            url = "https://circleci.com/gh/" + owner + "/" + name + "/tree/" + branch + ".svg?style=shield";
                            return [4 /*yield*/, node_fetch_1.default(url).then(function (result) { return result.text(); })];
                        case 1:
                            result = _b.sent();
                            if (result && !result.includes('no builds')) {
                                return [2 /*return*/, result.includes('passing') ? 'success' : 'failed'];
                            }
                            return [2 /*return*/, 'not found'];
                    }
                });
            });
        };
        return CiModule;
    }(base_1.BaseModule));
    exports.CiModule = CiModule;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY2FyZXRha2VyL2NoZWNrL2NpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCx5Q0FBK0I7SUFDL0IsdUVBQXNGO0lBRXRGLG9FQUFzRDtJQUN0RCx3RUFBa0M7SUFjbEM7UUFBOEIsb0NBQWtCO1FBQWhEOztRQTZEQSxDQUFDO1FBNURPLCtCQUFZLEdBQWxCOzs7Ozs7OzRCQUNRLGNBQWMsc0JBQUksR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxJQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7NEJBQ2xELHFCQUFNLGdDQUF3QixDQUFDLGNBQWMsQ0FBQyxFQUFBOzs0QkFBOUQsYUFBYSxHQUFHLFNBQThDOzRCQUU5RCxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFPLEVBRU47b0NBRk0sS0FBQSxxQkFFTixFQUZPLFNBQVMsUUFBQSxFQUFFLEtBQUssUUFBQTs7Ozs7O2dEQUdqRixJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7b0RBQ2xCLHNCQUFPOzREQUNMLE1BQU0sRUFBRSxLQUFLOzREQUNiLElBQUksRUFBRSxTQUFTOzREQUNmLEtBQUssRUFBRSxFQUFFOzREQUNULE1BQU0sRUFBRSxXQUFvQjt5REFDN0IsRUFBQztpREFDSDs7b0RBR0MsTUFBTSxFQUFFLElBQUk7b0RBQ1osSUFBSSxFQUFFLEtBQUssQ0FBQyxVQUFVO29EQUN0QixLQUFLLEVBQUssU0FBUyxVQUFLLEtBQUssQ0FBQyxVQUFVLE1BQUc7O2dEQUNuQyxxQkFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFBO29EQUo1RCx1QkFJRSxTQUFNLEdBQUUsU0FBa0Q7eURBQzFEOzs7OzZCQUNILENBQUMsQ0FBQzs0QkFFSSxxQkFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEVBQUE7Z0NBQTFDLHNCQUFPLFNBQW1DLEVBQUM7Ozs7U0FDNUM7UUFFSyxrQ0FBZSxHQUFyQjs7Ozs7Z0NBQ2UscUJBQU0sSUFBSSxDQUFDLElBQUksRUFBQTs7NEJBQXRCLElBQUksR0FBRyxTQUFlOzRCQUN0QixjQUFjLEdBQUcsSUFBSSxDQUFDLEdBQUcsT0FBUixJQUFJLDJDQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQSxNQUFNLElBQUksT0FBQSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBbkIsQ0FBbUIsQ0FBQyxHQUFDLENBQUM7NEJBQzVFLGNBQUksQ0FBQyxLQUFLLENBQUMsY0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7NEJBQ3ZCLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBQSxNQUFNO2dDQUNqQixJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssS0FBSyxFQUFFO29DQUMzQixlQUFLLENBQUMsaUNBQStCLE1BQU0sQ0FBQyxJQUFNLENBQUMsQ0FBQztvQ0FDcEQsT0FBTztpQ0FDUjtnQ0FDRCxJQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztnQ0FDbEQsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLFdBQVcsRUFBRTtvQ0FDakMsY0FBSSxDQUFJLE1BQU0sQ0FBQyxJQUFJLCtCQUE0QixDQUFDLENBQUM7aUNBQ2xEO3FDQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7b0NBQ3RDLGNBQUksQ0FBSSxLQUFLLFlBQUksQ0FBQyxDQUFDO2lDQUNwQjtxQ0FBTTtvQ0FDTCxjQUFJLENBQUksS0FBSyxZQUFJLENBQUMsQ0FBQztpQ0FDcEI7NEJBQ0gsQ0FBQyxDQUFDLENBQUM7NEJBQ0gsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDOzRCQUNoQixjQUFJLEVBQUUsQ0FBQzs7Ozs7U0FDUjtRQUVELHlEQUF5RDtRQUMzQyx3Q0FBcUIsR0FBbkMsVUFBb0MsTUFBYzs7Ozs7OzRCQUMxQyxLQUFnQixJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBcEMsS0FBSyxXQUFBLEVBQUUsSUFBSSxVQUFBLENBQTBCOzRCQUN0QyxHQUFHLEdBQUcsNkJBQTJCLEtBQUssU0FBSSxJQUFJLGNBQVMsTUFBTSxzQkFBbUIsQ0FBQzs0QkFDeEUscUJBQU0sb0JBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxNQUFNLElBQUksT0FBQSxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQWIsQ0FBYSxDQUFDLEVBQUE7OzRCQUF2RCxNQUFNLEdBQUcsU0FBOEM7NEJBRTdELElBQUksTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtnQ0FDM0Msc0JBQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUM7NkJBQzFEOzRCQUNELHNCQUFPLFdBQVcsRUFBQzs7OztTQUNwQjtRQUNILGVBQUM7SUFBRCxDQUFDLEFBN0RELENBQThCLGlCQUFVLEdBNkR2QztJQTdEWSw0QkFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgZmV0Y2ggZnJvbSAnbm9kZS1mZXRjaCc7XG5pbXBvcnQge2ZldGNoQWN0aXZlUmVsZWFzZVRyYWlucywgUmVsZWFzZVRyYWlufSBmcm9tICcuLi8uLi9yZWxlYXNlL3ZlcnNpb25pbmcvaW5kZXgnO1xuXG5pbXBvcnQge2JvbGQsIGRlYnVnLCBpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7QmFzZU1vZHVsZX0gZnJvbSAnLi9iYXNlJztcblxuXG4vKiogVGhlIHJlc3VsdCBvZiBjaGVja2luZyBhIGJyYW5jaCBvbiBDSS4gKi9cbnR5cGUgQ2lCcmFuY2hTdGF0dXMgPSAnc3VjY2Vzcyd8J2ZhaWxlZCd8J25vdCBmb3VuZCc7XG5cbi8qKiBBIGxpc3Qgb2YgcmVzdWx0cyBmb3IgY2hlY2tpbmcgQ0kgYnJhbmNoZXMuICovXG50eXBlIENpRGF0YSA9IHtcbiAgYWN0aXZlOiBib29sZWFuLFxuICBuYW1lOiBzdHJpbmcsXG4gIGxhYmVsOiBzdHJpbmcsXG4gIHN0YXR1czogQ2lCcmFuY2hTdGF0dXMsXG59W107XG5cbmV4cG9ydCBjbGFzcyBDaU1vZHVsZSBleHRlbmRzIEJhc2VNb2R1bGU8Q2lEYXRhPiB7XG4gIGFzeW5jIHJldHJpZXZlRGF0YSgpIHtcbiAgICBjb25zdCBnaXRSZXBvV2l0aEFwaSA9IHthcGk6IHRoaXMuZ2l0LmdpdGh1YiwgLi4udGhpcy5naXQucmVtb3RlQ29uZmlnfTtcbiAgICBjb25zdCByZWxlYXNlVHJhaW5zID0gYXdhaXQgZmV0Y2hBY3RpdmVSZWxlYXNlVHJhaW5zKGdpdFJlcG9XaXRoQXBpKTtcblxuICAgIGNvbnN0IGNpUmVzdWx0UHJvbWlzZXMgPSBPYmplY3QuZW50cmllcyhyZWxlYXNlVHJhaW5zKS5tYXAoYXN5bmMgKFt0cmFpbk5hbWUsIHRyYWluXTogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmcsIFJlbGVhc2VUcmFpbnxudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA9PiB7XG4gICAgICBpZiAodHJhaW4gPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBhY3RpdmU6IGZhbHNlLFxuICAgICAgICAgIG5hbWU6IHRyYWluTmFtZSxcbiAgICAgICAgICBsYWJlbDogJycsXG4gICAgICAgICAgc3RhdHVzOiAnbm90IGZvdW5kJyBhcyBjb25zdCxcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgICBuYW1lOiB0cmFpbi5icmFuY2hOYW1lLFxuICAgICAgICBsYWJlbDogYCR7dHJhaW5OYW1lfSAoJHt0cmFpbi5icmFuY2hOYW1lfSlgLFxuICAgICAgICBzdGF0dXM6IGF3YWl0IHRoaXMuZ2V0QnJhbmNoU3RhdHVzRnJvbUNpKHRyYWluLmJyYW5jaE5hbWUpLFxuICAgICAgfTtcbiAgICB9KTtcblxuICAgIHJldHVybiBhd2FpdCBQcm9taXNlLmFsbChjaVJlc3VsdFByb21pc2VzKTtcbiAgfVxuXG4gIGFzeW5jIHByaW50VG9UZXJtaW5hbCgpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5kYXRhO1xuICAgIGNvbnN0IG1pbkxhYmVsTGVuZ3RoID0gTWF0aC5tYXgoLi4uZGF0YS5tYXAocmVzdWx0ID0+IHJlc3VsdC5sYWJlbC5sZW5ndGgpKTtcbiAgICBpbmZvLmdyb3VwKGJvbGQoYENJYCkpO1xuICAgIGRhdGEuZm9yRWFjaChyZXN1bHQgPT4ge1xuICAgICAgaWYgKHJlc3VsdC5hY3RpdmUgPT09IGZhbHNlKSB7XG4gICAgICAgIGRlYnVnKGBObyBhY3RpdmUgcmVsZWFzZSB0cmFpbiBmb3IgJHtyZXN1bHQubmFtZX1gKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgbGFiZWwgPSByZXN1bHQubGFiZWwucGFkRW5kKG1pbkxhYmVsTGVuZ3RoKTtcbiAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSAnbm90IGZvdW5kJykge1xuICAgICAgICBpbmZvKGAke3Jlc3VsdC5uYW1lfSB3YXMgbm90IGZvdW5kIG9uIENpcmNsZUNJYCk7XG4gICAgICB9IGVsc2UgaWYgKHJlc3VsdC5zdGF0dXMgPT09ICdzdWNjZXNzJykge1xuICAgICAgICBpbmZvKGAke2xhYmVsfSDinIVgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluZm8oYCR7bGFiZWx9IOKdjGApO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGluZm8uZ3JvdXBFbmQoKTtcbiAgICBpbmZvKCk7XG4gIH1cblxuICAvKiogR2V0IHRoZSBDSSBzdGF0dXMgb2YgYSBnaXZlbiBicmFuY2ggZnJvbSBDaXJjbGVDSS4gKi9cbiAgcHJpdmF0ZSBhc3luYyBnZXRCcmFuY2hTdGF0dXNGcm9tQ2koYnJhbmNoOiBzdHJpbmcpOiBQcm9taXNlPENpQnJhbmNoU3RhdHVzPiB7XG4gICAgY29uc3Qge293bmVyLCBuYW1lfSA9IHRoaXMuZ2l0LnJlbW90ZUNvbmZpZztcbiAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9jaXJjbGVjaS5jb20vZ2gvJHtvd25lcn0vJHtuYW1lfS90cmVlLyR7YnJhbmNofS5zdmc/c3R5bGU9c2hpZWxkYDtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBmZXRjaCh1cmwpLnRoZW4ocmVzdWx0ID0+IHJlc3VsdC50ZXh0KCkpO1xuXG4gICAgaWYgKHJlc3VsdCAmJiAhcmVzdWx0LmluY2x1ZGVzKCdubyBidWlsZHMnKSkge1xuICAgICAgcmV0dXJuIHJlc3VsdC5pbmNsdWRlcygncGFzc2luZycpID8gJ3N1Y2Nlc3MnIDogJ2ZhaWxlZCc7XG4gICAgfVxuICAgIHJldHVybiAnbm90IGZvdW5kJztcbiAgfVxufVxuIl19