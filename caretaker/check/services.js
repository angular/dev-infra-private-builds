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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY2FyZXRha2VyL2NoZWNrL3NlcnZpY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCx5Q0FBK0I7SUFFL0Isb0VBQStDO0lBQy9DLHdFQUFrQztJQWVsQywwQ0FBMEM7SUFDN0IsUUFBQSxRQUFRLEdBQW9CO1FBQ3ZDO1lBQ0UsR0FBRyxFQUFFLDJEQUEyRDtZQUNoRSxJQUFJLEVBQUUsV0FBVztTQUNsQjtRQUNEO1lBQ0UsR0FBRyxFQUFFLDZDQUE2QztZQUNsRCxJQUFJLEVBQUUsS0FBSztTQUNaO1FBQ0Q7WUFDRSxHQUFHLEVBQUUsZ0RBQWdEO1lBQ3JELElBQUksRUFBRSxVQUFVO1NBQ2pCO1FBQ0Q7WUFDRSxHQUFHLEVBQUUsaURBQWlEO1lBQ3RELElBQUksRUFBRSxRQUFRO1NBQ2Y7S0FDRixDQUFDO0lBRUY7UUFBb0MsMENBQStCO1FBQW5FOztRQWtDQSxDQUFDO1FBakNnQixxQ0FBWSxHQUEzQjs7OztvQkFDRSxzQkFBTyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFRLENBQUMsR0FBRyxDQUFDLFVBQUEsT0FBTyxJQUFJLE9BQUEsS0FBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sQ0FBQyxFQUF0QyxDQUFzQyxDQUFDLENBQUMsRUFBQzs7O1NBQ3JGO1FBRWMsd0NBQWUsR0FBOUI7Ozs7OztnQ0FDbUIscUJBQU0sSUFBSSxDQUFDLElBQUksRUFBQTs7NEJBQTFCLFFBQVEsR0FBRyxTQUFlOzRCQUMxQixvQkFBb0IsR0FBRyxJQUFJLENBQUMsR0FBRyxPQUFSLElBQUksMkNBQVEsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFBLE9BQU8sSUFBSSxPQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFuQixDQUFtQixDQUFDLEdBQUMsQ0FBQzs0QkFDdkYsY0FBSSxDQUFDLEtBQUssQ0FBQyxjQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDOztnQ0FDckMsS0FBcUIsYUFBQSxpQkFBQSxRQUFRLENBQUEsMEZBQUU7b0NBQTFCO29DQUNHLFNBQU8sUUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQztvQ0FDdEQsSUFBSSxRQUFNLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTt3Q0FDL0IsY0FBSSxDQUFJLE1BQUksWUFBSSxDQUFDLENBQUM7cUNBQ25CO3lDQUFNO3dDQUNMLGNBQUksQ0FBQyxLQUFLLENBQUksTUFBSSwwQkFBZ0IsUUFBTSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsTUFBRyxDQUFDLENBQUM7d0NBQzFFLGNBQUksQ0FBQyxnQkFBYyxRQUFNLENBQUMsV0FBYSxDQUFDLENBQUM7d0NBQ3pDLGNBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztxQ0FDakI7aUNBQ0Y7Ozs7Ozs7Ozs0QkFDRCxjQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7NEJBQ2hCLGNBQUksRUFBRSxDQUFDOzs7OztTQUNSO1FBRUQsd0ZBQXdGO1FBQ2xGLGlEQUF3QixHQUE5QixVQUErQixPQUFzQjs7Ozs7Z0NBQ3BDLHFCQUFNLG9CQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLE1BQU0sSUFBSSxPQUFBLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBYixDQUFhLENBQUMsRUFBQTs7NEJBQS9ELE1BQU0sR0FBRyxTQUFzRDs0QkFDL0QsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7NEJBQzFFLHNCQUFPO29DQUNMLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtvQ0FDbEIsTUFBTSxRQUFBO29DQUNOLFdBQVcsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVc7b0NBQ3RDLFdBQVcsRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztpQ0FDOUMsRUFBQzs7OztTQUNIO1FBQ0gscUJBQUM7SUFBRCxDQUFDLEFBbENELENBQW9DLGlCQUFVLEdBa0M3QztJQWxDWSx3Q0FBYyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgZmV0Y2ggZnJvbSAnbm9kZS1mZXRjaCc7XG5cbmltcG9ydCB7Ym9sZCwgaW5mb30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0Jhc2VNb2R1bGV9IGZyb20gJy4vYmFzZSc7XG5cbmludGVyZmFjZSBTZXJ2aWNlQ29uZmlnIHtcbiAgbmFtZTogc3RyaW5nO1xuICB1cmw6IHN0cmluZztcbn1cblxuLyoqIFRoZSByZXN1bHRzIG9mIGNoZWNraW5nIHRoZSBzdGF0dXMgb2YgYSBzZXJ2aWNlICovXG5pbnRlcmZhY2UgU3RhdHVzQ2hlY2tSZXN1bHQge1xuICBuYW1lOiBzdHJpbmc7XG4gIHN0YXR1czogJ3Bhc3NpbmcnfCdmYWlsaW5nJztcbiAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgbGFzdFVwZGF0ZWQ6IERhdGU7XG59XG5cbi8qKiBMaXN0IG9mIHNlcnZpY2VzIEFuZ3VsYXIgcmVsaWVzIG9uLiAqL1xuZXhwb3J0IGNvbnN0IHNlcnZpY2VzOiBTZXJ2aWNlQ29uZmlnW10gPSBbXG4gIHtcbiAgICB1cmw6ICdodHRwczovL3N0YXR1cy51cy13ZXN0LTEuc2F1Y2VsYWJzLmNvbS9hcGkvdjIvc3RhdHVzLmpzb24nLFxuICAgIG5hbWU6ICdTYXVjZWxhYnMnLFxuICB9LFxuICB7XG4gICAgdXJsOiAnaHR0cHM6Ly9zdGF0dXMubnBtanMub3JnL2FwaS92Mi9zdGF0dXMuanNvbicsXG4gICAgbmFtZTogJ05wbScsXG4gIH0sXG4gIHtcbiAgICB1cmw6ICdodHRwczovL3N0YXR1cy5jaXJjbGVjaS5jb20vYXBpL3YyL3N0YXR1cy5qc29uJyxcbiAgICBuYW1lOiAnQ2lyY2xlQ2knLFxuICB9LFxuICB7XG4gICAgdXJsOiAnaHR0cHM6Ly93d3cuZ2l0aHVic3RhdHVzLmNvbS9hcGkvdjIvc3RhdHVzLmpzb24nLFxuICAgIG5hbWU6ICdHaXRodWInLFxuICB9LFxuXTtcblxuZXhwb3J0IGNsYXNzIFNlcnZpY2VzTW9kdWxlIGV4dGVuZHMgQmFzZU1vZHVsZTxTdGF0dXNDaGVja1Jlc3VsdFtdPiB7XG4gIG92ZXJyaWRlIGFzeW5jIHJldHJpZXZlRGF0YSgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoc2VydmljZXMubWFwKHNlcnZpY2UgPT4gdGhpcy5nZXRTdGF0dXNGcm9tU3RhbmRhcmRBcGkoc2VydmljZSkpKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGFzeW5jIHByaW50VG9UZXJtaW5hbCgpIHtcbiAgICBjb25zdCBzdGF0dXNlcyA9IGF3YWl0IHRoaXMuZGF0YTtcbiAgICBjb25zdCBzZXJ2aWNlTmFtZU1pbkxlbmd0aCA9IE1hdGgubWF4KC4uLnN0YXR1c2VzLm1hcChzZXJ2aWNlID0+IHNlcnZpY2UubmFtZS5sZW5ndGgpKTtcbiAgICBpbmZvLmdyb3VwKGJvbGQoJ1NlcnZpY2UgU3RhdHVzZXMnKSk7XG4gICAgZm9yIChjb25zdCBzdGF0dXMgb2Ygc3RhdHVzZXMpIHtcbiAgICAgIGNvbnN0IG5hbWUgPSBzdGF0dXMubmFtZS5wYWRFbmQoc2VydmljZU5hbWVNaW5MZW5ndGgpO1xuICAgICAgaWYgKHN0YXR1cy5zdGF0dXMgPT09ICdwYXNzaW5nJykge1xuICAgICAgICBpbmZvKGAke25hbWV9IOKchWApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5mby5ncm91cChgJHtuYW1lfSDinYwgKFVwZGF0ZWQ6ICR7c3RhdHVzLmxhc3RVcGRhdGVkLnRvTG9jYWxlU3RyaW5nKCl9KWApO1xuICAgICAgICBpbmZvKGAgIERldGFpbHM6ICR7c3RhdHVzLmRlc2NyaXB0aW9ufWApO1xuICAgICAgICBpbmZvLmdyb3VwRW5kKCk7XG4gICAgICB9XG4gICAgfVxuICAgIGluZm8uZ3JvdXBFbmQoKTtcbiAgICBpbmZvKCk7XG4gIH1cblxuICAvKiogUmV0cmlldmUgdGhlIHN0YXR1cyBpbmZvcm1hdGlvbiBmb3IgYSBzZXJ2aWNlIHdoaWNoIHVzZXMgYSBzdGFuZGFyZCBBUEkgcmVzcG9uc2UuICovXG4gIGFzeW5jIGdldFN0YXR1c0Zyb21TdGFuZGFyZEFwaShzZXJ2aWNlOiBTZXJ2aWNlQ29uZmlnKTogUHJvbWlzZTxTdGF0dXNDaGVja1Jlc3VsdD4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGZldGNoKHNlcnZpY2UudXJsKS50aGVuKHJlc3VsdCA9PiByZXN1bHQuanNvbigpKTtcbiAgICBjb25zdCBzdGF0dXMgPSByZXN1bHQuc3RhdHVzLmluZGljYXRvciA9PT0gJ25vbmUnID8gJ3Bhc3NpbmcnIDogJ2ZhaWxpbmcnO1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiBzZXJ2aWNlLm5hbWUsXG4gICAgICBzdGF0dXMsXG4gICAgICBkZXNjcmlwdGlvbjogcmVzdWx0LnN0YXR1cy5kZXNjcmlwdGlvbixcbiAgICAgIGxhc3RVcGRhdGVkOiBuZXcgRGF0ZShyZXN1bHQucGFnZS51cGRhdGVkX2F0KVxuICAgIH07XG4gIH1cbn1cbiJdfQ==