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
    exports.handleDiscoverNewConflictsCommand = exports.buildDiscoverNewConflictsCommand = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL2Rpc2NvdmVyLW5ldy1jb25mbGljdHMvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFFQSxvRUFBMEM7SUFFMUMsOEVBQWtEO0lBRWxELDhEQUE4RDtJQUM5RCxTQUFnQixnQ0FBZ0MsQ0FBQyxLQUFXO1FBQzFELE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDMUIsV0FBVyxFQUFFLCtDQUErQztZQUM1RCxrQkFBa0IsRUFBRSxhQUFhO1lBQ2pDLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSztZQUNsQixPQUFPLEVBQUUsb0JBQW9CO1NBQzlCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFQRCw0RUFPQztJQUVELCtEQUErRDtJQUMvRCxTQUFzQixpQ0FBaUMsQ0FBQyxFQUEyQjtZQUExQixRQUFRLGNBQUEsRUFBRSxJQUFJLFVBQUE7Ozs7O3dCQUNyRSx5RUFBeUU7d0JBQ3pFLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFOzRCQUNmLGVBQUssQ0FBQyxvREFBb0QsQ0FBQyxDQUFDOzRCQUM1RCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNqQjt3QkFDRCxxQkFBTSxpQ0FBeUIsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEVBQUE7O3dCQUEvQyxTQUErQyxDQUFDOzs7OztLQUNqRDtJQVBELDhFQU9DO0lBRUQsaURBQWlEO0lBQ2pELFNBQVMsb0JBQW9CO1FBQzNCLElBQU0sSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDeEIsaUVBQWlFO1FBQ2pFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDMUIsdUNBQXVDO1FBQ3ZDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ2xDLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QXJndW1lbnRzLCBBcmd2fSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7ZXJyb3J9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge2Rpc2NvdmVyTmV3Q29uZmxpY3RzRm9yUHJ9IGZyb20gJy4vaW5kZXgnO1xuXG4vKiogQnVpbGRzIHRoZSBkaXNjb3Zlci1uZXctY29uZmxpY3RzIHB1bGwgcmVxdWVzdCBjb21tYW5kLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkRGlzY292ZXJOZXdDb25mbGljdHNDb21tYW5kKHlhcmdzOiBBcmd2KSB7XG4gIHJldHVybiB5YXJncy5vcHRpb24oJ2RhdGUnLCB7XG4gICAgZGVzY3JpcHRpb246ICdPbmx5IGNvbnNpZGVyIFBScyB1cGRhdGVkIHNpbmNlIHByb3ZpZGVkIGRhdGUnLFxuICAgIGRlZmF1bHREZXNjcmlwdGlvbjogJzMwIGRheXMgYWdvJyxcbiAgICBjb2VyY2U6IERhdGUucGFyc2UsXG4gICAgZGVmYXVsdDogZ2V0VGhpcnR5RGF5c0Fnb0RhdGUsXG4gIH0pO1xufVxuXG4vKiogSGFuZGxlcyB0aGUgZGlzY292ZXItbmV3LWNvbmZsaWN0cyBwdWxsIHJlcXVlc3QgY29tbWFuZC4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVEaXNjb3Zlck5ld0NvbmZsaWN0c0NvbW1hbmQoe3ByTnVtYmVyLCBkYXRlfTogQXJndW1lbnRzKSB7XG4gIC8vIElmIGEgcHJvdmlkZWQgZGF0ZSBpcyBub3QgYWJsZSB0byBiZSBwYXJzZWQsIHlhcmdzIHByb3ZpZGVzIGl0IGFzIE5hTi5cbiAgaWYgKGlzTmFOKGRhdGUpKSB7XG4gICAgZXJyb3IoJ1VuYWJsZSB0byBwYXJzZSB0aGUgdmFsdWUgcHJvdmlkZWQgdmlhIC0tZGF0ZSBmbGFnJyk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG4gIGF3YWl0IGRpc2NvdmVyTmV3Q29uZmxpY3RzRm9yUHIocHJOdW1iZXIsIGRhdGUpO1xufVxuXG4vKiogR2V0cyBhIGRhdGUgb2JqZWN0IDMwIGRheXMgYWdvIGZyb20gdG9kYXkuICovXG5mdW5jdGlvbiBnZXRUaGlydHlEYXlzQWdvRGF0ZSgpOiBEYXRlIHtcbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gIC8vIFNldCB0aGUgaG91cnMsIG1pbnV0ZXMgYW5kIHNlY29uZHMgdG8gMCB0byBvbmx5IGNvbnNpZGVyIGRhdGUuXG4gIGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCk7XG4gIC8vIFNldCB0aGUgZGF0ZSB0byAzMCBkYXlzIGluIHRoZSBwYXN0LlxuICBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgLSAzMCk7XG4gIHJldHVybiBkYXRlO1xufVxuIl19