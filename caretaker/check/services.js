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
        define("@angular/dev-infra-private/caretaker/check/services", ["require", "exports", "tslib", "node-fetch", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/caretaker/check/base"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ServicesModule = exports.services = void 0;
    var tslib_1 = require("tslib");
    var node_fetch_1 = require("node-fetch");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var base_1 = require("@angular/dev-infra-private/caretaker/check/base");
    /** List of services Angular relies on. */
    exports.services = [
        {
            url: 'https://status.us-west-1.saucelabs.com/api/v2/status.json',
            name: 'Saucelabs',
        },
        {
            url: 'https://status.npmjs.org/api/v2/status.json',
            name: 'Npm',
        },
        {
            url: 'https://status.circleci.com/api/v2/status.json',
            name: 'CircleCi',
        },
        {
            url: 'https://www.githubstatus.com/api/v2/status.json',
            name: 'Github',
        },
    ];
    var ServicesModule = /** @class */ (function (_super) {
        tslib_1.__extends(ServicesModule, _super);
        function ServicesModule() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ServicesModule.prototype.retrieveData = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _this = this;
                return tslib_1.__generator(this, function (_a) {
                    return [2 /*return*/, Promise.all(exports.services.map(function (service) { return _this.getStatusFromStandardApi(service); }))];
                });
            });
        };
        ServicesModule.prototype.printToTerminal = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var statuses, serviceNameMinLength, statuses_1, statuses_1_1, status_1, name_1;
                var e_1, _a;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.data];
                        case 1:
                            statuses = _b.sent();
                            serviceNameMinLength = Math.max.apply(Math, tslib_1.__spreadArray([], tslib_1.__read(statuses.map(function (service) { return service.name.length; }))));
                            console_1.info.group(console_1.bold('Service Statuses'));
                            try {
                                for (statuses_1 = tslib_1.__values(statuses), statuses_1_1 = statuses_1.next(); !statuses_1_1.done; statuses_1_1 = statuses_1.next()) {
                                    status_1 = statuses_1_1.value;
                                    name_1 = status_1.name.padEnd(serviceNameMinLength);
                                    if (status_1.status === 'passing') {
                                        console_1.info(name_1 + " \u2705");
                                    }
                                    else {
                                        console_1.info.group(name_1 + " \u274C (Updated: " + status_1.lastUpdated.toLocaleString() + ")");
                                        console_1.info("  Details: " + status_1.description);
                                        console_1.info.groupEnd();
                                    }
                                }
                            }
                            catch (e_1_1) { e_1 = { error: e_1_1 }; }
                            finally {
                                try {
                                    if (statuses_1_1 && !statuses_1_1.done && (_a = statuses_1.return)) _a.call(statuses_1);
                                }
                                finally { if (e_1) throw e_1.error; }
                            }
                            console_1.info.groupEnd();
                            console_1.info();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Retrieve the status information for a service which uses a standard API response. */
        ServicesModule.prototype.getStatusFromStandardApi = function (service) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var result, status;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, node_fetch_1.default(service.url).then(function (result) { return result.json(); })];
                        case 1:
                            result = _a.sent();
                            status = result.status.indicator === 'none' ? 'passing' : 'failing';
                            return [2 /*return*/, {
                                    name: service.name,
                                    status: status,
                                    description: result.status.description,
                                    lastUpdated: new Date(result.page.updated_at)
                                }];
                    }
                });
            });
        };
        return ServicesModule;
    }(base_1.BaseModule));
    exports.ServicesModule = ServicesModule;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY2FyZXRha2VyL2NoZWNrL3NlcnZpY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCx5Q0FBK0I7SUFFL0Isb0VBQStDO0lBQy9DLHdFQUFrQztJQWVsQywwQ0FBMEM7SUFDN0IsUUFBQSxRQUFRLEdBQW9CO1FBQ3ZDO1lBQ0UsR0FBRyxFQUFFLDJEQUEyRDtZQUNoRSxJQUFJLEVBQUUsV0FBVztTQUNsQjtRQUNEO1lBQ0UsR0FBRyxFQUFFLDZDQUE2QztZQUNsRCxJQUFJLEVBQUUsS0FBSztTQUNaO1FBQ0Q7WUFDRSxHQUFHLEVBQUUsZ0RBQWdEO1lBQ3JELElBQUksRUFBRSxVQUFVO1NBQ2pCO1FBQ0Q7WUFDRSxHQUFHLEVBQUUsaURBQWlEO1lBQ3RELElBQUksRUFBRSxRQUFRO1NBQ2Y7S0FDRixDQUFDO0lBRUY7UUFBb0MsMENBQStCO1FBQW5FOztRQWtDQSxDQUFDO1FBakNPLHFDQUFZLEdBQWxCOzs7O29CQUNFLHNCQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQSxPQUFPLElBQUksT0FBQSxLQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUFDLEVBQXRDLENBQXNDLENBQUMsQ0FBQyxFQUFDOzs7U0FDckY7UUFFSyx3Q0FBZSxHQUFyQjs7Ozs7O2dDQUNtQixxQkFBTSxJQUFJLENBQUMsSUFBSSxFQUFBOzs0QkFBMUIsUUFBUSxHQUFHLFNBQWU7NEJBQzFCLG9CQUFvQixHQUFHLElBQUksQ0FBQyxHQUFHLE9BQVIsSUFBSSwyQ0FBUSxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUEsT0FBTyxJQUFJLE9BQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQW5CLENBQW1CLENBQUMsR0FBQyxDQUFDOzRCQUN2RixjQUFJLENBQUMsS0FBSyxDQUFDLGNBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7O2dDQUNyQyxLQUFxQixhQUFBLGlCQUFBLFFBQVEsQ0FBQSwwRkFBRTtvQ0FBMUI7b0NBQ0csU0FBTyxRQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO29DQUN0RCxJQUFJLFFBQU0sQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO3dDQUMvQixjQUFJLENBQUksTUFBSSxZQUFJLENBQUMsQ0FBQztxQ0FDbkI7eUNBQU07d0NBQ0wsY0FBSSxDQUFDLEtBQUssQ0FBSSxNQUFJLDBCQUFnQixRQUFNLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxNQUFHLENBQUMsQ0FBQzt3Q0FDMUUsY0FBSSxDQUFDLGdCQUFjLFFBQU0sQ0FBQyxXQUFhLENBQUMsQ0FBQzt3Q0FDekMsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO3FDQUNqQjtpQ0FDRjs7Ozs7Ozs7OzRCQUNELGNBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzs0QkFDaEIsY0FBSSxFQUFFLENBQUM7Ozs7O1NBQ1I7UUFFRCx3RkFBd0Y7UUFDbEYsaURBQXdCLEdBQTlCLFVBQStCLE9BQXNCOzs7OztnQ0FDcEMscUJBQU0sb0JBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsTUFBTSxJQUFJLE9BQUEsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFiLENBQWEsQ0FBQyxFQUFBOzs0QkFBL0QsTUFBTSxHQUFHLFNBQXNEOzRCQUMvRCxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQzs0QkFDMUUsc0JBQU87b0NBQ0wsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO29DQUNsQixNQUFNLFFBQUE7b0NBQ04sV0FBVyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVztvQ0FDdEMsV0FBVyxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO2lDQUM5QyxFQUFDOzs7O1NBQ0g7UUFDSCxxQkFBQztJQUFELENBQUMsQUFsQ0QsQ0FBb0MsaUJBQVUsR0FrQzdDO0lBbENZLHdDQUFjIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCBmZXRjaCBmcm9tICdub2RlLWZldGNoJztcblxuaW1wb3J0IHtib2xkLCBpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7QmFzZU1vZHVsZX0gZnJvbSAnLi9iYXNlJztcblxuaW50ZXJmYWNlIFNlcnZpY2VDb25maWcge1xuICBuYW1lOiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xufVxuXG4vKiogVGhlIHJlc3VsdHMgb2YgY2hlY2tpbmcgdGhlIHN0YXR1cyBvZiBhIHNlcnZpY2UgKi9cbmludGVyZmFjZSBTdGF0dXNDaGVja1Jlc3VsdCB7XG4gIG5hbWU6IHN0cmluZztcbiAgc3RhdHVzOiAncGFzc2luZyd8J2ZhaWxpbmcnO1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICBsYXN0VXBkYXRlZDogRGF0ZTtcbn1cblxuLyoqIExpc3Qgb2Ygc2VydmljZXMgQW5ndWxhciByZWxpZXMgb24uICovXG5leHBvcnQgY29uc3Qgc2VydmljZXM6IFNlcnZpY2VDb25maWdbXSA9IFtcbiAge1xuICAgIHVybDogJ2h0dHBzOi8vc3RhdHVzLnVzLXdlc3QtMS5zYXVjZWxhYnMuY29tL2FwaS92Mi9zdGF0dXMuanNvbicsXG4gICAgbmFtZTogJ1NhdWNlbGFicycsXG4gIH0sXG4gIHtcbiAgICB1cmw6ICdodHRwczovL3N0YXR1cy5ucG1qcy5vcmcvYXBpL3YyL3N0YXR1cy5qc29uJyxcbiAgICBuYW1lOiAnTnBtJyxcbiAgfSxcbiAge1xuICAgIHVybDogJ2h0dHBzOi8vc3RhdHVzLmNpcmNsZWNpLmNvbS9hcGkvdjIvc3RhdHVzLmpzb24nLFxuICAgIG5hbWU6ICdDaXJjbGVDaScsXG4gIH0sXG4gIHtcbiAgICB1cmw6ICdodHRwczovL3d3dy5naXRodWJzdGF0dXMuY29tL2FwaS92Mi9zdGF0dXMuanNvbicsXG4gICAgbmFtZTogJ0dpdGh1YicsXG4gIH0sXG5dO1xuXG5leHBvcnQgY2xhc3MgU2VydmljZXNNb2R1bGUgZXh0ZW5kcyBCYXNlTW9kdWxlPFN0YXR1c0NoZWNrUmVzdWx0W10+IHtcbiAgYXN5bmMgcmV0cmlldmVEYXRhKCkge1xuICAgIHJldHVybiBQcm9taXNlLmFsbChzZXJ2aWNlcy5tYXAoc2VydmljZSA9PiB0aGlzLmdldFN0YXR1c0Zyb21TdGFuZGFyZEFwaShzZXJ2aWNlKSkpO1xuICB9XG5cbiAgYXN5bmMgcHJpbnRUb1Rlcm1pbmFsKCkge1xuICAgIGNvbnN0IHN0YXR1c2VzID0gYXdhaXQgdGhpcy5kYXRhO1xuICAgIGNvbnN0IHNlcnZpY2VOYW1lTWluTGVuZ3RoID0gTWF0aC5tYXgoLi4uc3RhdHVzZXMubWFwKHNlcnZpY2UgPT4gc2VydmljZS5uYW1lLmxlbmd0aCkpO1xuICAgIGluZm8uZ3JvdXAoYm9sZCgnU2VydmljZSBTdGF0dXNlcycpKTtcbiAgICBmb3IgKGNvbnN0IHN0YXR1cyBvZiBzdGF0dXNlcykge1xuICAgICAgY29uc3QgbmFtZSA9IHN0YXR1cy5uYW1lLnBhZEVuZChzZXJ2aWNlTmFtZU1pbkxlbmd0aCk7XG4gICAgICBpZiAoc3RhdHVzLnN0YXR1cyA9PT0gJ3Bhc3NpbmcnKSB7XG4gICAgICAgIGluZm8oYCR7bmFtZX0g4pyFYCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmZvLmdyb3VwKGAke25hbWV9IOKdjCAoVXBkYXRlZDogJHtzdGF0dXMubGFzdFVwZGF0ZWQudG9Mb2NhbGVTdHJpbmcoKX0pYCk7XG4gICAgICAgIGluZm8oYCAgRGV0YWlsczogJHtzdGF0dXMuZGVzY3JpcHRpb259YCk7XG4gICAgICAgIGluZm8uZ3JvdXBFbmQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaW5mby5ncm91cEVuZCgpO1xuICAgIGluZm8oKTtcbiAgfVxuXG4gIC8qKiBSZXRyaWV2ZSB0aGUgc3RhdHVzIGluZm9ybWF0aW9uIGZvciBhIHNlcnZpY2Ugd2hpY2ggdXNlcyBhIHN0YW5kYXJkIEFQSSByZXNwb25zZS4gKi9cbiAgYXN5bmMgZ2V0U3RhdHVzRnJvbVN0YW5kYXJkQXBpKHNlcnZpY2U6IFNlcnZpY2VDb25maWcpOiBQcm9taXNlPFN0YXR1c0NoZWNrUmVzdWx0PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZmV0Y2goc2VydmljZS51cmwpLnRoZW4ocmVzdWx0ID0+IHJlc3VsdC5qc29uKCkpO1xuICAgIGNvbnN0IHN0YXR1cyA9IHJlc3VsdC5zdGF0dXMuaW5kaWNhdG9yID09PSAnbm9uZScgPyAncGFzc2luZycgOiAnZmFpbGluZyc7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IHNlcnZpY2UubmFtZSxcbiAgICAgIHN0YXR1cyxcbiAgICAgIGRlc2NyaXB0aW9uOiByZXN1bHQuc3RhdHVzLmRlc2NyaXB0aW9uLFxuICAgICAgbGFzdFVwZGF0ZWQ6IG5ldyBEYXRlKHJlc3VsdC5wYWdlLnVwZGF0ZWRfYXQpXG4gICAgfTtcbiAgfVxufVxuIl19