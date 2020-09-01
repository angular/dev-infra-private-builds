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
        define("@angular/dev-infra-private/caretaker/service-statuses/services", ["require", "exports", "tslib", "node-fetch", "@angular/dev-infra-private/utils/console"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.printServiceStatuses = void 0;
    var tslib_1 = require("tslib");
    var node_fetch_1 = require("node-fetch");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    /** The status levels for services. */
    var ServiceStatus;
    (function (ServiceStatus) {
        ServiceStatus[ServiceStatus["GREEN"] = 0] = "GREEN";
        ServiceStatus[ServiceStatus["RED"] = 1] = "RED";
    })(ServiceStatus || (ServiceStatus = {}));
    /** Retrieve and log stasuses for all of the services of concern. */
    function printServiceStatuses() {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            return tslib_1.__generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        console_1.info.group(console_1.bold("Service Statuses (checked: " + new Date().toLocaleString() + ")"));
                        _a = logStatus;
                        _b = ['CircleCI'];
                        return [4 /*yield*/, getCircleCiStatus()];
                    case 1:
                        _a.apply(void 0, _b.concat([_j.sent()]));
                        _c = logStatus;
                        _d = ['Github'];
                        return [4 /*yield*/, getGithubStatus()];
                    case 2:
                        _c.apply(void 0, _d.concat([_j.sent()]));
                        _e = logStatus;
                        _f = ['NPM'];
                        return [4 /*yield*/, getNpmStatus()];
                    case 3:
                        _e.apply(void 0, _f.concat([_j.sent()]));
                        _g = logStatus;
                        _h = ['Saucelabs'];
                        return [4 /*yield*/, getSaucelabsStatus()];
                    case 4:
                        _g.apply(void 0, _h.concat([_j.sent()]));
                        console_1.info.groupEnd();
                        console_1.info();
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.printServiceStatuses = printServiceStatuses;
    /** Log the status of the service to the console. */
    function logStatus(serviceName, status) {
        serviceName = serviceName.padEnd(15);
        if (status.status === ServiceStatus.GREEN) {
            console_1.info(serviceName + " " + console_1.green('✅'));
        }
        else if (status.status === ServiceStatus.RED) {
            console_1.info.group(serviceName + " " + console_1.red('❌') + " (Updated: " + status.lastUpdated.toLocaleString() + ")");
            console_1.info("  Details: " + status.description);
            console_1.info.groupEnd();
        }
    }
    /** Gets the service status information for Saucelabs. */
    function getSaucelabsStatus() {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, getStatusFromStandardApi('https://status.us-west-1.saucelabs.com/api/v2/status.json')];
            });
        });
    }
    /** Gets the service status information for NPM. */
    function getNpmStatus() {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, getStatusFromStandardApi('https://status.npmjs.org/api/v2/status.json')];
            });
        });
    }
    /** Gets the service status information for CircleCI. */
    function getCircleCiStatus() {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, getStatusFromStandardApi('https://status.circleci.com/api/v2/status.json')];
            });
        });
    }
    /** Gets the service status information for Github. */
    function getGithubStatus() {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, getStatusFromStandardApi('https://www.githubstatus.com/api/v2/status.json')];
            });
        });
    }
    /** Retrieve the status information for a service which uses a standard API response. */
    function getStatusFromStandardApi(url) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result, status;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, node_fetch_1.default(url).then(function (result) { return result.json(); })];
                    case 1:
                        result = _a.sent();
                        status = result.status.indicator === 'none' ? ServiceStatus.GREEN : ServiceStatus.RED;
                        return [2 /*return*/, {
                                status: status,
                                description: result.status.description,
                                lastUpdated: new Date(result.page.updated_at)
                            }];
                }
            });
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY2FyZXRha2VyL2NoZWNrL3NlcnZpY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCx5Q0FBK0I7SUFFL0Isb0VBQTJEO0lBRTNELHNDQUFzQztJQUN0QyxJQUFLLGFBR0o7SUFIRCxXQUFLLGFBQWE7UUFDaEIsbURBQUssQ0FBQTtRQUNMLCtDQUFHLENBQUE7SUFDTCxDQUFDLEVBSEksYUFBYSxLQUFiLGFBQWEsUUFHakI7SUFTRCxvRUFBb0U7SUFDcEUsU0FBc0Isb0JBQW9COzs7Ozs7d0JBQ3hDLGNBQUksQ0FBQyxLQUFLLENBQUMsY0FBSSxDQUFDLGdDQUE4QixJQUFJLElBQUksRUFBRSxDQUFDLGNBQWMsRUFBRSxNQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUMvRSxLQUFBLFNBQVMsQ0FBQTs4QkFBQyxVQUFVO3dCQUFFLHFCQUFNLGlCQUFpQixFQUFFLEVBQUE7O3dCQUEvQyw0QkFBc0IsU0FBeUIsR0FBQyxDQUFDO3dCQUNqRCxLQUFBLFNBQVMsQ0FBQTs4QkFBQyxRQUFRO3dCQUFFLHFCQUFNLGVBQWUsRUFBRSxFQUFBOzt3QkFBM0MsNEJBQW9CLFNBQXVCLEdBQUMsQ0FBQzt3QkFDN0MsS0FBQSxTQUFTLENBQUE7OEJBQUMsS0FBSzt3QkFBRSxxQkFBTSxZQUFZLEVBQUUsRUFBQTs7d0JBQXJDLDRCQUFpQixTQUFvQixHQUFDLENBQUM7d0JBQ3ZDLEtBQUEsU0FBUyxDQUFBOzhCQUFDLFdBQVc7d0JBQUUscUJBQU0sa0JBQWtCLEVBQUUsRUFBQTs7d0JBQWpELDRCQUF1QixTQUEwQixHQUFDLENBQUM7d0JBQ25ELGNBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzt3QkFDaEIsY0FBSSxFQUFFLENBQUM7Ozs7O0tBQ1I7SUFSRCxvREFRQztJQUdELG9EQUFvRDtJQUNwRCxTQUFTLFNBQVMsQ0FBQyxXQUFtQixFQUFFLE1BQXlCO1FBQy9ELFdBQVcsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3JDLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxhQUFhLENBQUMsS0FBSyxFQUFFO1lBQ3pDLGNBQUksQ0FBSSxXQUFXLFNBQUksZUFBSyxDQUFDLEdBQUcsQ0FBRyxDQUFDLENBQUM7U0FDdEM7YUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssYUFBYSxDQUFDLEdBQUcsRUFBRTtZQUM5QyxjQUFJLENBQUMsS0FBSyxDQUFJLFdBQVcsU0FBSSxhQUFHLENBQUMsR0FBRyxDQUFDLG1CQUFjLE1BQU0sQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLE1BQUcsQ0FBQyxDQUFDO1lBQzNGLGNBQUksQ0FBQyxnQkFBYyxNQUFNLENBQUMsV0FBYSxDQUFDLENBQUM7WUFDekMsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ2pCO0lBQ0gsQ0FBQztJQUVELHlEQUF5RDtJQUN6RCxTQUFlLGtCQUFrQjs7O2dCQUMvQixzQkFBTyx3QkFBd0IsQ0FBQywyREFBMkQsQ0FBQyxFQUFDOzs7S0FDOUY7SUFFRCxtREFBbUQ7SUFDbkQsU0FBZSxZQUFZOzs7Z0JBQ3pCLHNCQUFPLHdCQUF3QixDQUFDLDZDQUE2QyxDQUFDLEVBQUM7OztLQUNoRjtJQUVELHdEQUF3RDtJQUN4RCxTQUFlLGlCQUFpQjs7O2dCQUM5QixzQkFBTyx3QkFBd0IsQ0FBQyxnREFBZ0QsQ0FBQyxFQUFDOzs7S0FDbkY7SUFFRCxzREFBc0Q7SUFDdEQsU0FBZSxlQUFlOzs7Z0JBQzVCLHNCQUFPLHdCQUF3QixDQUFDLGlEQUFpRCxDQUFDLEVBQUM7OztLQUNwRjtJQUVELHdGQUF3RjtJQUN4RixTQUFlLHdCQUF3QixDQUFDLEdBQVc7Ozs7OzRCQUNsQyxxQkFBTSxvQkFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLE1BQU0sSUFBSSxPQUFBLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBYixDQUFhLENBQUMsRUFBQTs7d0JBQXZELE1BQU0sR0FBRyxTQUE4Qzt3QkFDdkQsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQzt3QkFDNUYsc0JBQU87Z0NBQ0wsTUFBTSxRQUFBO2dDQUNOLFdBQVcsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVc7Z0NBQ3RDLFdBQVcsRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQzs2QkFDOUMsRUFBQzs7OztLQUNIIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCBmZXRjaCBmcm9tICdub2RlLWZldGNoJztcblxuaW1wb3J0IHtib2xkLCBncmVlbiwgaW5mbywgcmVkfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcblxuLyoqIFRoZSBzdGF0dXMgbGV2ZWxzIGZvciBzZXJ2aWNlcy4gKi9cbmVudW0gU2VydmljZVN0YXR1cyB7XG4gIEdSRUVOLFxuICBSRURcbn1cblxuLyoqIFRoZSByZXN1bHRzIG9mIGNoZWNraW5nIHRoZSBzdGF0dXMgb2YgYSBzZXJ2aWNlICovXG5pbnRlcmZhY2UgU3RhdHVzQ2hlY2tSZXN1bHQge1xuICBzdGF0dXM6IFNlcnZpY2VTdGF0dXM7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIGxhc3RVcGRhdGVkOiBEYXRlO1xufVxuXG4vKiogUmV0cmlldmUgYW5kIGxvZyBzdGFzdXNlcyBmb3IgYWxsIG9mIHRoZSBzZXJ2aWNlcyBvZiBjb25jZXJuLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByaW50U2VydmljZVN0YXR1c2VzKCkge1xuICBpbmZvLmdyb3VwKGJvbGQoYFNlcnZpY2UgU3RhdHVzZXMgKGNoZWNrZWQ6ICR7bmV3IERhdGUoKS50b0xvY2FsZVN0cmluZygpfSlgKSk7XG4gIGxvZ1N0YXR1cygnQ2lyY2xlQ0knLCBhd2FpdCBnZXRDaXJjbGVDaVN0YXR1cygpKTtcbiAgbG9nU3RhdHVzKCdHaXRodWInLCBhd2FpdCBnZXRHaXRodWJTdGF0dXMoKSk7XG4gIGxvZ1N0YXR1cygnTlBNJywgYXdhaXQgZ2V0TnBtU3RhdHVzKCkpO1xuICBsb2dTdGF0dXMoJ1NhdWNlbGFicycsIGF3YWl0IGdldFNhdWNlbGFic1N0YXR1cygpKTtcbiAgaW5mby5ncm91cEVuZCgpO1xuICBpbmZvKCk7XG59XG5cblxuLyoqIExvZyB0aGUgc3RhdHVzIG9mIHRoZSBzZXJ2aWNlIHRvIHRoZSBjb25zb2xlLiAqL1xuZnVuY3Rpb24gbG9nU3RhdHVzKHNlcnZpY2VOYW1lOiBzdHJpbmcsIHN0YXR1czogU3RhdHVzQ2hlY2tSZXN1bHQpIHtcbiAgc2VydmljZU5hbWUgPSBzZXJ2aWNlTmFtZS5wYWRFbmQoMTUpO1xuICBpZiAoc3RhdHVzLnN0YXR1cyA9PT0gU2VydmljZVN0YXR1cy5HUkVFTikge1xuICAgIGluZm8oYCR7c2VydmljZU5hbWV9ICR7Z3JlZW4oJ+KchScpfWApO1xuICB9IGVsc2UgaWYgKHN0YXR1cy5zdGF0dXMgPT09IFNlcnZpY2VTdGF0dXMuUkVEKSB7XG4gICAgaW5mby5ncm91cChgJHtzZXJ2aWNlTmFtZX0gJHtyZWQoJ+KdjCcpfSAoVXBkYXRlZDogJHtzdGF0dXMubGFzdFVwZGF0ZWQudG9Mb2NhbGVTdHJpbmcoKX0pYCk7XG4gICAgaW5mbyhgICBEZXRhaWxzOiAke3N0YXR1cy5kZXNjcmlwdGlvbn1gKTtcbiAgICBpbmZvLmdyb3VwRW5kKCk7XG4gIH1cbn1cblxuLyoqIEdldHMgdGhlIHNlcnZpY2Ugc3RhdHVzIGluZm9ybWF0aW9uIGZvciBTYXVjZWxhYnMuICovXG5hc3luYyBmdW5jdGlvbiBnZXRTYXVjZWxhYnNTdGF0dXMoKTogUHJvbWlzZTxTdGF0dXNDaGVja1Jlc3VsdD4ge1xuICByZXR1cm4gZ2V0U3RhdHVzRnJvbVN0YW5kYXJkQXBpKCdodHRwczovL3N0YXR1cy51cy13ZXN0LTEuc2F1Y2VsYWJzLmNvbS9hcGkvdjIvc3RhdHVzLmpzb24nKTtcbn1cblxuLyoqIEdldHMgdGhlIHNlcnZpY2Ugc3RhdHVzIGluZm9ybWF0aW9uIGZvciBOUE0uICovXG5hc3luYyBmdW5jdGlvbiBnZXROcG1TdGF0dXMoKTogUHJvbWlzZTxTdGF0dXNDaGVja1Jlc3VsdD4ge1xuICByZXR1cm4gZ2V0U3RhdHVzRnJvbVN0YW5kYXJkQXBpKCdodHRwczovL3N0YXR1cy5ucG1qcy5vcmcvYXBpL3YyL3N0YXR1cy5qc29uJyk7XG59XG5cbi8qKiBHZXRzIHRoZSBzZXJ2aWNlIHN0YXR1cyBpbmZvcm1hdGlvbiBmb3IgQ2lyY2xlQ0kuICovXG5hc3luYyBmdW5jdGlvbiBnZXRDaXJjbGVDaVN0YXR1cygpOiBQcm9taXNlPFN0YXR1c0NoZWNrUmVzdWx0PiB7XG4gIHJldHVybiBnZXRTdGF0dXNGcm9tU3RhbmRhcmRBcGkoJ2h0dHBzOi8vc3RhdHVzLmNpcmNsZWNpLmNvbS9hcGkvdjIvc3RhdHVzLmpzb24nKTtcbn1cblxuLyoqIEdldHMgdGhlIHNlcnZpY2Ugc3RhdHVzIGluZm9ybWF0aW9uIGZvciBHaXRodWIuICovXG5hc3luYyBmdW5jdGlvbiBnZXRHaXRodWJTdGF0dXMoKTogUHJvbWlzZTxTdGF0dXNDaGVja1Jlc3VsdD4ge1xuICByZXR1cm4gZ2V0U3RhdHVzRnJvbVN0YW5kYXJkQXBpKCdodHRwczovL3d3dy5naXRodWJzdGF0dXMuY29tL2FwaS92Mi9zdGF0dXMuanNvbicpO1xufVxuXG4vKiogUmV0cmlldmUgdGhlIHN0YXR1cyBpbmZvcm1hdGlvbiBmb3IgYSBzZXJ2aWNlIHdoaWNoIHVzZXMgYSBzdGFuZGFyZCBBUEkgcmVzcG9uc2UuICovXG5hc3luYyBmdW5jdGlvbiBnZXRTdGF0dXNGcm9tU3RhbmRhcmRBcGkodXJsOiBzdHJpbmcpIHtcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZmV0Y2godXJsKS50aGVuKHJlc3VsdCA9PiByZXN1bHQuanNvbigpKTtcbiAgY29uc3Qgc3RhdHVzID0gcmVzdWx0LnN0YXR1cy5pbmRpY2F0b3IgPT09ICdub25lJyA/IFNlcnZpY2VTdGF0dXMuR1JFRU4gOiBTZXJ2aWNlU3RhdHVzLlJFRDtcbiAgcmV0dXJuIHtcbiAgICBzdGF0dXMsXG4gICAgZGVzY3JpcHRpb246IHJlc3VsdC5zdGF0dXMuZGVzY3JpcHRpb24sXG4gICAgbGFzdFVwZGF0ZWQ6IG5ldyBEYXRlKHJlc3VsdC5wYWdlLnVwZGF0ZWRfYXQpXG4gIH07XG59XG4iXX0=