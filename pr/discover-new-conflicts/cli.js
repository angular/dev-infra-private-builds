(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/pr/discover-new-conflicts/cli", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/pr/discover-new-conflicts"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var index_1 = require("@angular/dev-infra-private/pr/discover-new-conflicts");
    /** Builds the discover-new-conflicts pull request command. */
    function buildDiscoverNewConflictsCommand(yargs) {
        return yargs.option('date', {
            description: 'Only consider PRs updated since provided date',
            defaultDescription: '30 days ago',
            coerce: Date.parse,
            default: getThirtyDaysAgoDate,
        });
    }
    exports.buildDiscoverNewConflictsCommand = buildDiscoverNewConflictsCommand;
    /** Handles the discover-new-conflicts pull request command. */
    function handleDiscoverNewConflictsCommand(_a) {
        var prNumber = _a.prNumber, date = _a.date;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // If a provided date is not able to be parsed, yargs provides it as NaN.
                        if (isNaN(date)) {
                            console_1.error('Unable to parse the value provided via --date flag');
                            process.exit(1);
                        }
                        return [4 /*yield*/, index_1.discoverNewConflictsForPr(prNumber, date)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.handleDiscoverNewConflictsCommand = handleDiscoverNewConflictsCommand;
    /** Gets a date object 30 days ago from today. */
    function getThirtyDaysAgoDate() {
        var date = new Date();
        // Set the hours, minutes and seconds to 0 to only consider date.
        date.setHours(0, 0, 0, 0);
        // Set the date to 30 days in the past.
        date.setDate(date.getDate() - 30);
        return date;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL2Rpc2NvdmVyLW5ldy1jb25mbGljdHMvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUVBLG9FQUEwQztJQUUxQyw4RUFBa0Q7SUFFbEQsOERBQThEO0lBQzlELFNBQWdCLGdDQUFnQyxDQUFDLEtBQVc7UUFDMUQsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUMxQixXQUFXLEVBQUUsK0NBQStDO1lBQzVELGtCQUFrQixFQUFFLGFBQWE7WUFDakMsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLO1lBQ2xCLE9BQU8sRUFBRSxvQkFBb0I7U0FDOUIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQVBELDRFQU9DO0lBRUQsK0RBQStEO0lBQy9ELFNBQXNCLGlDQUFpQyxDQUFDLEVBQTJCO1lBQTFCLHNCQUFRLEVBQUUsY0FBSTs7Ozs7d0JBQ3JFLHlFQUF5RTt3QkFDekUsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUU7NEJBQ2YsZUFBSyxDQUFDLG9EQUFvRCxDQUFDLENBQUM7NEJBQzVELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCO3dCQUNELHFCQUFNLGlDQUF5QixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsRUFBQTs7d0JBQS9DLFNBQStDLENBQUM7Ozs7O0tBQ2pEO0lBUEQsOEVBT0M7SUFFRCxpREFBaUQ7SUFDakQsU0FBUyxvQkFBb0I7UUFDM0IsSUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN4QixpRUFBaUU7UUFDakUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMxQix1Q0FBdUM7UUFDdkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDbEMsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3Z9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtlcnJvcn0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7ZGlzY292ZXJOZXdDb25mbGljdHNGb3JQcn0gZnJvbSAnLi9pbmRleCc7XG5cbi8qKiBCdWlsZHMgdGhlIGRpc2NvdmVyLW5ldy1jb25mbGljdHMgcHVsbCByZXF1ZXN0IGNvbW1hbmQuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGREaXNjb3Zlck5ld0NvbmZsaWN0c0NvbW1hbmQoeWFyZ3M6IEFyZ3YpIHtcbiAgcmV0dXJuIHlhcmdzLm9wdGlvbignZGF0ZScsIHtcbiAgICBkZXNjcmlwdGlvbjogJ09ubHkgY29uc2lkZXIgUFJzIHVwZGF0ZWQgc2luY2UgcHJvdmlkZWQgZGF0ZScsXG4gICAgZGVmYXVsdERlc2NyaXB0aW9uOiAnMzAgZGF5cyBhZ28nLFxuICAgIGNvZXJjZTogRGF0ZS5wYXJzZSxcbiAgICBkZWZhdWx0OiBnZXRUaGlydHlEYXlzQWdvRGF0ZSxcbiAgfSk7XG59XG5cbi8qKiBIYW5kbGVzIHRoZSBkaXNjb3Zlci1uZXctY29uZmxpY3RzIHB1bGwgcmVxdWVzdCBjb21tYW5kLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZURpc2NvdmVyTmV3Q29uZmxpY3RzQ29tbWFuZCh7cHJOdW1iZXIsIGRhdGV9OiBBcmd1bWVudHMpIHtcbiAgLy8gSWYgYSBwcm92aWRlZCBkYXRlIGlzIG5vdCBhYmxlIHRvIGJlIHBhcnNlZCwgeWFyZ3MgcHJvdmlkZXMgaXQgYXMgTmFOLlxuICBpZiAoaXNOYU4oZGF0ZSkpIHtcbiAgICBlcnJvcignVW5hYmxlIHRvIHBhcnNlIHRoZSB2YWx1ZSBwcm92aWRlZCB2aWEgLS1kYXRlIGZsYWcnKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cbiAgYXdhaXQgZGlzY292ZXJOZXdDb25mbGljdHNGb3JQcihwck51bWJlciwgZGF0ZSk7XG59XG5cbi8qKiBHZXRzIGEgZGF0ZSBvYmplY3QgMzAgZGF5cyBhZ28gZnJvbSB0b2RheS4gKi9cbmZ1bmN0aW9uIGdldFRoaXJ0eURheXNBZ29EYXRlKCk6IERhdGUge1xuICBjb25zdCBkYXRlID0gbmV3IERhdGUoKTtcbiAgLy8gU2V0IHRoZSBob3VycywgbWludXRlcyBhbmQgc2Vjb25kcyB0byAwIHRvIG9ubHkgY29uc2lkZXIgZGF0ZS5cbiAgZGF0ZS5zZXRIb3VycygwLCAwLCAwLCAwKTtcbiAgLy8gU2V0IHRoZSBkYXRlIHRvIDMwIGRheXMgaW4gdGhlIHBhc3QuXG4gIGRhdGUuc2V0RGF0ZShkYXRlLmdldERhdGUoKSAtIDMwKTtcbiAgcmV0dXJuIGRhdGU7XG59XG4iXX0=