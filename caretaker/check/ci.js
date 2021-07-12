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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY2FyZXRha2VyL2NoZWNrL2NpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCx5Q0FBK0I7SUFDL0IsdUVBQXNGO0lBRXRGLG9FQUFzRDtJQUN0RCx3RUFBa0M7SUFjbEM7UUFBOEIsb0NBQWtCO1FBQWhEOztRQTZEQSxDQUFDO1FBNURnQiwrQkFBWSxHQUEzQjs7Ozs7Ozs0QkFDUSxjQUFjLHNCQUFJLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sSUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDOzRCQUNsRCxxQkFBTSxnQ0FBd0IsQ0FBQyxjQUFjLENBQUMsRUFBQTs7NEJBQTlELGFBQWEsR0FBRyxTQUE4Qzs0QkFFOUQsZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBTyxFQUVOO29DQUZNLEtBQUEscUJBRU4sRUFGTyxTQUFTLFFBQUEsRUFBRSxLQUFLLFFBQUE7Ozs7OztnREFHakYsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO29EQUNsQixzQkFBTzs0REFDTCxNQUFNLEVBQUUsS0FBSzs0REFDYixJQUFJLEVBQUUsU0FBUzs0REFDZixLQUFLLEVBQUUsRUFBRTs0REFDVCxNQUFNLEVBQUUsV0FBb0I7eURBQzdCLEVBQUM7aURBQ0g7O29EQUdDLE1BQU0sRUFBRSxJQUFJO29EQUNaLElBQUksRUFBRSxLQUFLLENBQUMsVUFBVTtvREFDdEIsS0FBSyxFQUFLLFNBQVMsVUFBSyxLQUFLLENBQUMsVUFBVSxNQUFHOztnREFDbkMscUJBQU0sSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBQTtvREFKNUQsdUJBSUUsU0FBTSxHQUFFLFNBQWtEO3lEQUMxRDs7Ozs2QkFDSCxDQUFDLENBQUM7NEJBRUkscUJBQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFBO2dDQUExQyxzQkFBTyxTQUFtQyxFQUFDOzs7O1NBQzVDO1FBRWMsa0NBQWUsR0FBOUI7Ozs7O2dDQUNlLHFCQUFNLElBQUksQ0FBQyxJQUFJLEVBQUE7OzRCQUF0QixJQUFJLEdBQUcsU0FBZTs0QkFDdEIsY0FBYyxHQUFHLElBQUksQ0FBQyxHQUFHLE9BQVIsSUFBSSwyQ0FBUSxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUEsTUFBTSxJQUFJLE9BQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQW5CLENBQW1CLENBQUMsR0FBQyxDQUFDOzRCQUM1RSxjQUFJLENBQUMsS0FBSyxDQUFDLGNBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOzRCQUN2QixJQUFJLENBQUMsT0FBTyxDQUFDLFVBQUEsTUFBTTtnQ0FDakIsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLEtBQUssRUFBRTtvQ0FDM0IsZUFBSyxDQUFDLGlDQUErQixNQUFNLENBQUMsSUFBTSxDQUFDLENBQUM7b0NBQ3BELE9BQU87aUNBQ1I7Z0NBQ0QsSUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7Z0NBQ2xELElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxXQUFXLEVBQUU7b0NBQ2pDLGNBQUksQ0FBSSxNQUFNLENBQUMsSUFBSSwrQkFBNEIsQ0FBQyxDQUFDO2lDQUNsRDtxQ0FBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO29DQUN0QyxjQUFJLENBQUksS0FBSyxZQUFJLENBQUMsQ0FBQztpQ0FDcEI7cUNBQU07b0NBQ0wsY0FBSSxDQUFJLEtBQUssWUFBSSxDQUFDLENBQUM7aUNBQ3BCOzRCQUNILENBQUMsQ0FBQyxDQUFDOzRCQUNILGNBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzs0QkFDaEIsY0FBSSxFQUFFLENBQUM7Ozs7O1NBQ1I7UUFFRCx5REFBeUQ7UUFDM0Msd0NBQXFCLEdBQW5DLFVBQW9DLE1BQWM7Ozs7Ozs0QkFDMUMsS0FBZ0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQXBDLEtBQUssV0FBQSxFQUFFLElBQUksVUFBQSxDQUEwQjs0QkFDdEMsR0FBRyxHQUFHLDZCQUEyQixLQUFLLFNBQUksSUFBSSxjQUFTLE1BQU0sc0JBQW1CLENBQUM7NEJBQ3hFLHFCQUFNLG9CQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsTUFBTSxJQUFJLE9BQUEsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFiLENBQWEsQ0FBQyxFQUFBOzs0QkFBdkQsTUFBTSxHQUFHLFNBQThDOzRCQUU3RCxJQUFJLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0NBQzNDLHNCQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFDOzZCQUMxRDs0QkFDRCxzQkFBTyxXQUFXLEVBQUM7Ozs7U0FDcEI7UUFDSCxlQUFDO0lBQUQsQ0FBQyxBQTdERCxDQUE4QixpQkFBVSxHQTZEdkM7SUE3RFksNEJBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IGZldGNoIGZyb20gJ25vZGUtZmV0Y2gnO1xuaW1wb3J0IHtmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnMsIFJlbGVhc2VUcmFpbn0gZnJvbSAnLi4vLi4vcmVsZWFzZS92ZXJzaW9uaW5nL2luZGV4JztcblxuaW1wb3J0IHtib2xkLCBkZWJ1ZywgaW5mb30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0Jhc2VNb2R1bGV9IGZyb20gJy4vYmFzZSc7XG5cblxuLyoqIFRoZSByZXN1bHQgb2YgY2hlY2tpbmcgYSBicmFuY2ggb24gQ0kuICovXG50eXBlIENpQnJhbmNoU3RhdHVzID0gJ3N1Y2Nlc3MnfCdmYWlsZWQnfCdub3QgZm91bmQnO1xuXG4vKiogQSBsaXN0IG9mIHJlc3VsdHMgZm9yIGNoZWNraW5nIENJIGJyYW5jaGVzLiAqL1xudHlwZSBDaURhdGEgPSB7XG4gIGFjdGl2ZTogYm9vbGVhbixcbiAgbmFtZTogc3RyaW5nLFxuICBsYWJlbDogc3RyaW5nLFxuICBzdGF0dXM6IENpQnJhbmNoU3RhdHVzLFxufVtdO1xuXG5leHBvcnQgY2xhc3MgQ2lNb2R1bGUgZXh0ZW5kcyBCYXNlTW9kdWxlPENpRGF0YT4ge1xuICBvdmVycmlkZSBhc3luYyByZXRyaWV2ZURhdGEoKSB7XG4gICAgY29uc3QgZ2l0UmVwb1dpdGhBcGkgPSB7YXBpOiB0aGlzLmdpdC5naXRodWIsIC4uLnRoaXMuZ2l0LnJlbW90ZUNvbmZpZ307XG4gICAgY29uc3QgcmVsZWFzZVRyYWlucyA9IGF3YWl0IGZldGNoQWN0aXZlUmVsZWFzZVRyYWlucyhnaXRSZXBvV2l0aEFwaSk7XG5cbiAgICBjb25zdCBjaVJlc3VsdFByb21pc2VzID0gT2JqZWN0LmVudHJpZXMocmVsZWFzZVRyYWlucykubWFwKGFzeW5jIChbdHJhaW5OYW1lLCB0cmFpbl06IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5nLCBSZWxlYXNlVHJhaW58bnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgPT4ge1xuICAgICAgaWYgKHRyYWluID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgYWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICBuYW1lOiB0cmFpbk5hbWUsXG4gICAgICAgICAgbGFiZWw6ICcnLFxuICAgICAgICAgIHN0YXR1czogJ25vdCBmb3VuZCcgYXMgY29uc3QsXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgICAgbmFtZTogdHJhaW4uYnJhbmNoTmFtZSxcbiAgICAgICAgbGFiZWw6IGAke3RyYWluTmFtZX0gKCR7dHJhaW4uYnJhbmNoTmFtZX0pYCxcbiAgICAgICAgc3RhdHVzOiBhd2FpdCB0aGlzLmdldEJyYW5jaFN0YXR1c0Zyb21DaSh0cmFpbi5icmFuY2hOYW1lKSxcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICByZXR1cm4gYXdhaXQgUHJvbWlzZS5hbGwoY2lSZXN1bHRQcm9taXNlcyk7XG4gIH1cblxuICBvdmVycmlkZSBhc3luYyBwcmludFRvVGVybWluYWwoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuZGF0YTtcbiAgICBjb25zdCBtaW5MYWJlbExlbmd0aCA9IE1hdGgubWF4KC4uLmRhdGEubWFwKHJlc3VsdCA9PiByZXN1bHQubGFiZWwubGVuZ3RoKSk7XG4gICAgaW5mby5ncm91cChib2xkKGBDSWApKTtcbiAgICBkYXRhLmZvckVhY2gocmVzdWx0ID0+IHtcbiAgICAgIGlmIChyZXN1bHQuYWN0aXZlID09PSBmYWxzZSkge1xuICAgICAgICBkZWJ1ZyhgTm8gYWN0aXZlIHJlbGVhc2UgdHJhaW4gZm9yICR7cmVzdWx0Lm5hbWV9YCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGxhYmVsID0gcmVzdWx0LmxhYmVsLnBhZEVuZChtaW5MYWJlbExlbmd0aCk7XG4gICAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ25vdCBmb3VuZCcpIHtcbiAgICAgICAgaW5mbyhgJHtyZXN1bHQubmFtZX0gd2FzIG5vdCBmb3VuZCBvbiBDaXJjbGVDSWApO1xuICAgICAgfSBlbHNlIGlmIChyZXN1bHQuc3RhdHVzID09PSAnc3VjY2VzcycpIHtcbiAgICAgICAgaW5mbyhgJHtsYWJlbH0g4pyFYCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmZvKGAke2xhYmVsfSDinYxgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpbmZvLmdyb3VwRW5kKCk7XG4gICAgaW5mbygpO1xuICB9XG5cbiAgLyoqIEdldCB0aGUgQ0kgc3RhdHVzIG9mIGEgZ2l2ZW4gYnJhbmNoIGZyb20gQ2lyY2xlQ0kuICovXG4gIHByaXZhdGUgYXN5bmMgZ2V0QnJhbmNoU3RhdHVzRnJvbUNpKGJyYW5jaDogc3RyaW5nKTogUHJvbWlzZTxDaUJyYW5jaFN0YXR1cz4ge1xuICAgIGNvbnN0IHtvd25lciwgbmFtZX0gPSB0aGlzLmdpdC5yZW1vdGVDb25maWc7XG4gICAgY29uc3QgdXJsID0gYGh0dHBzOi8vY2lyY2xlY2kuY29tL2doLyR7b3duZXJ9LyR7bmFtZX0vdHJlZS8ke2JyYW5jaH0uc3ZnP3N0eWxlPXNoaWVsZGA7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZmV0Y2godXJsKS50aGVuKHJlc3VsdCA9PiByZXN1bHQudGV4dCgpKTtcblxuICAgIGlmIChyZXN1bHQgJiYgIXJlc3VsdC5pbmNsdWRlcygnbm8gYnVpbGRzJykpIHtcbiAgICAgIHJldHVybiByZXN1bHQuaW5jbHVkZXMoJ3Bhc3NpbmcnKSA/ICdzdWNjZXNzJyA6ICdmYWlsZWQnO1xuICAgIH1cbiAgICByZXR1cm4gJ25vdCBmb3VuZCc7XG4gIH1cbn1cbiJdfQ==