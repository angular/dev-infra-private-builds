(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/pr/discover-new-conflicts/cli", ["require", "exports", "tslib", "@angular/dev-infra-private/pr/discover-new-conflicts"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
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
                            console.error('Unable to parse the value provided via --date flag');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL2Rpc2NvdmVyLW5ldy1jb25mbGljdHMvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUVBLDhFQUFrRDtJQUVsRCw4REFBOEQ7SUFDOUQsU0FBZ0IsZ0NBQWdDLENBQUMsS0FBVztRQUMxRCxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQzFCLFdBQVcsRUFBRSwrQ0FBK0M7WUFDNUQsa0JBQWtCLEVBQUUsYUFBYTtZQUNqQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUs7WUFDbEIsT0FBTyxFQUFFLG9CQUFvQjtTQUM5QixDQUFDLENBQUM7SUFDTCxDQUFDO0lBUEQsNEVBT0M7SUFFRCwrREFBK0Q7SUFDL0QsU0FBc0IsaUNBQWlDLENBQUMsRUFBMkI7WUFBMUIsc0JBQVEsRUFBRSxjQUFJOzs7Ozt3QkFDckUseUVBQXlFO3dCQUN6RSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTs0QkFDZixPQUFPLENBQUMsS0FBSyxDQUFDLG9EQUFvRCxDQUFDLENBQUM7NEJBQ3BFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCO3dCQUNELHFCQUFNLGlDQUF5QixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsRUFBQTs7d0JBQS9DLFNBQStDLENBQUM7Ozs7O0tBQ2pEO0lBUEQsOEVBT0M7SUFFRCxpREFBaUQ7SUFDakQsU0FBUyxvQkFBb0I7UUFDM0IsSUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN4QixpRUFBaUU7UUFDakUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMxQix1Q0FBdUM7UUFDdkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDbEMsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3Z9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtkaXNjb3Zlck5ld0NvbmZsaWN0c0ZvclByfSBmcm9tICcuL2luZGV4JztcblxuLyoqIEJ1aWxkcyB0aGUgZGlzY292ZXItbmV3LWNvbmZsaWN0cyBwdWxsIHJlcXVlc3QgY29tbWFuZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZERpc2NvdmVyTmV3Q29uZmxpY3RzQ29tbWFuZCh5YXJnczogQXJndikge1xuICByZXR1cm4geWFyZ3Mub3B0aW9uKCdkYXRlJywge1xuICAgIGRlc2NyaXB0aW9uOiAnT25seSBjb25zaWRlciBQUnMgdXBkYXRlZCBzaW5jZSBwcm92aWRlZCBkYXRlJyxcbiAgICBkZWZhdWx0RGVzY3JpcHRpb246ICczMCBkYXlzIGFnbycsXG4gICAgY29lcmNlOiBEYXRlLnBhcnNlLFxuICAgIGRlZmF1bHQ6IGdldFRoaXJ0eURheXNBZ29EYXRlLFxuICB9KTtcbn1cblxuLyoqIEhhbmRsZXMgdGhlIGRpc2NvdmVyLW5ldy1jb25mbGljdHMgcHVsbCByZXF1ZXN0IGNvbW1hbmQuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlRGlzY292ZXJOZXdDb25mbGljdHNDb21tYW5kKHtwck51bWJlciwgZGF0ZX06IEFyZ3VtZW50cykge1xuICAvLyBJZiBhIHByb3ZpZGVkIGRhdGUgaXMgbm90IGFibGUgdG8gYmUgcGFyc2VkLCB5YXJncyBwcm92aWRlcyBpdCBhcyBOYU4uXG4gIGlmIChpc05hTihkYXRlKSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1VuYWJsZSB0byBwYXJzZSB0aGUgdmFsdWUgcHJvdmlkZWQgdmlhIC0tZGF0ZSBmbGFnJyk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG4gIGF3YWl0IGRpc2NvdmVyTmV3Q29uZmxpY3RzRm9yUHIocHJOdW1iZXIsIGRhdGUpO1xufVxuXG4vKiogR2V0cyBhIGRhdGUgb2JqZWN0IDMwIGRheXMgYWdvIGZyb20gdG9kYXkuICovXG5mdW5jdGlvbiBnZXRUaGlydHlEYXlzQWdvRGF0ZSgpOiBEYXRlIHtcbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gIC8vIFNldCB0aGUgaG91cnMsIG1pbnV0ZXMgYW5kIHNlY29uZHMgdG8gMCB0byBvbmx5IGNvbnNpZGVyIGRhdGUuXG4gIGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCk7XG4gIC8vIFNldCB0aGUgZGF0ZSB0byAzMCBkYXlzIGluIHRoZSBwYXN0LlxuICBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgLSAzMCk7XG4gIHJldHVybiBkYXRlO1xufVxuIl19