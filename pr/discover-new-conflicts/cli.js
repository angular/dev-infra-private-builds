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
        define("@angular/dev-infra-private/pr/discover-new-conflicts/cli", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/github-yargs", "@angular/dev-infra-private/pr/discover-new-conflicts"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.handleDiscoverNewConflictsCommand = exports.buildDiscoverNewConflictsCommand = void 0;
    var tslib_1 = require("tslib");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var github_yargs_1 = require("@angular/dev-infra-private/utils/git/github-yargs");
    var index_1 = require("@angular/dev-infra-private/pr/discover-new-conflicts");
    /** Builds the discover-new-conflicts pull request command. */
    function buildDiscoverNewConflictsCommand(yargs) {
        return github_yargs_1.addGithubTokenOption(yargs)
            .option('date', {
            description: 'Only consider PRs updated since provided date',
            defaultDescription: '30 days ago',
            coerce: function (date) { return typeof date === 'number' ? date : Date.parse(date); },
            default: getThirtyDaysAgoDate(),
        })
            .positional('pr-number', { demandOption: true, type: 'number' });
    }
    exports.buildDiscoverNewConflictsCommand = buildDiscoverNewConflictsCommand;
    /** Handles the discover-new-conflicts pull request command. */
    function handleDiscoverNewConflictsCommand(_a) {
        var prNumber = _a["pr-number"], date = _a.date;
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
        return date.getTime();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL2Rpc2NvdmVyLW5ldy1jb25mbGljdHMvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFJSCxvRUFBMEM7SUFDMUMsa0ZBQWtFO0lBRWxFLDhFQUFrRDtJQVFsRCw4REFBOEQ7SUFDOUQsU0FBZ0IsZ0NBQWdDLENBQUMsS0FBVztRQUUxRCxPQUFPLG1DQUFvQixDQUFDLEtBQUssQ0FBQzthQUM3QixNQUFNLENBQUMsTUFBTSxFQUFFO1lBQ2QsV0FBVyxFQUFFLCtDQUErQztZQUM1RCxrQkFBa0IsRUFBRSxhQUFhO1lBQ2pDLE1BQU0sRUFBRSxVQUFDLElBQUksSUFBSyxPQUFBLE9BQU8sSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFsRCxDQUFrRDtZQUNwRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUU7U0FDaEMsQ0FBQzthQUNELFVBQVUsQ0FBQyxXQUFXLEVBQUUsRUFBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFWRCw0RUFVQztJQUVELCtEQUErRDtJQUMvRCxTQUFzQixpQ0FBaUMsQ0FDbkQsRUFBNEU7WUFBOUQsUUFBUSxrQkFBQSxFQUFFLElBQUksVUFBQTs7Ozs7d0JBQzlCLHlFQUF5RTt3QkFDekUsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUU7NEJBQ2YsZUFBSyxDQUFDLG9EQUFvRCxDQUFDLENBQUM7NEJBQzVELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCO3dCQUNELHFCQUFNLGlDQUF5QixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsRUFBQTs7d0JBQS9DLFNBQStDLENBQUM7Ozs7O0tBQ2pEO0lBUkQsOEVBUUM7SUFFRCxpREFBaUQ7SUFDakQsU0FBUyxvQkFBb0I7UUFDM0IsSUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN4QixpRUFBaUU7UUFDakUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMxQix1Q0FBdUM7UUFDdkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDbEMsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDeEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndn0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2Vycm9yfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7YWRkR2l0aHViVG9rZW5PcHRpb259IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWIteWFyZ3MnO1xuXG5pbXBvcnQge2Rpc2NvdmVyTmV3Q29uZmxpY3RzRm9yUHJ9IGZyb20gJy4vaW5kZXgnO1xuXG4vKiogVGhlIG9wdGlvbnMgYXZhaWxhYmxlIHRvIHRoZSBkaXNjb3Zlci1uZXctY29uZmxpY3RzIGNvbW1hbmQgdmlhIENMSS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGlzY292ZXJOZXdDb25mbGljdHNDb21tYW5kT3B0aW9ucyB7XG4gIGRhdGU6IG51bWJlcjtcbiAgJ3ByLW51bWJlcic6IG51bWJlcjtcbn1cblxuLyoqIEJ1aWxkcyB0aGUgZGlzY292ZXItbmV3LWNvbmZsaWN0cyBwdWxsIHJlcXVlc3QgY29tbWFuZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZERpc2NvdmVyTmV3Q29uZmxpY3RzQ29tbWFuZCh5YXJnczogQXJndik6XG4gICAgQXJndjxEaXNjb3Zlck5ld0NvbmZsaWN0c0NvbW1hbmRPcHRpb25zPiB7XG4gIHJldHVybiBhZGRHaXRodWJUb2tlbk9wdGlvbih5YXJncylcbiAgICAgIC5vcHRpb24oJ2RhdGUnLCB7XG4gICAgICAgIGRlc2NyaXB0aW9uOiAnT25seSBjb25zaWRlciBQUnMgdXBkYXRlZCBzaW5jZSBwcm92aWRlZCBkYXRlJyxcbiAgICAgICAgZGVmYXVsdERlc2NyaXB0aW9uOiAnMzAgZGF5cyBhZ28nLFxuICAgICAgICBjb2VyY2U6IChkYXRlKSA9PiB0eXBlb2YgZGF0ZSA9PT0gJ251bWJlcicgPyBkYXRlIDogRGF0ZS5wYXJzZShkYXRlKSxcbiAgICAgICAgZGVmYXVsdDogZ2V0VGhpcnR5RGF5c0Fnb0RhdGUoKSxcbiAgICAgIH0pXG4gICAgICAucG9zaXRpb25hbCgncHItbnVtYmVyJywge2RlbWFuZE9wdGlvbjogdHJ1ZSwgdHlwZTogJ251bWJlcid9KTtcbn1cblxuLyoqIEhhbmRsZXMgdGhlIGRpc2NvdmVyLW5ldy1jb25mbGljdHMgcHVsbCByZXF1ZXN0IGNvbW1hbmQuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlRGlzY292ZXJOZXdDb25mbGljdHNDb21tYW5kKFxuICAgIHsncHItbnVtYmVyJzogcHJOdW1iZXIsIGRhdGV9OiBBcmd1bWVudHM8RGlzY292ZXJOZXdDb25mbGljdHNDb21tYW5kT3B0aW9ucz4pIHtcbiAgLy8gSWYgYSBwcm92aWRlZCBkYXRlIGlzIG5vdCBhYmxlIHRvIGJlIHBhcnNlZCwgeWFyZ3MgcHJvdmlkZXMgaXQgYXMgTmFOLlxuICBpZiAoaXNOYU4oZGF0ZSkpIHtcbiAgICBlcnJvcignVW5hYmxlIHRvIHBhcnNlIHRoZSB2YWx1ZSBwcm92aWRlZCB2aWEgLS1kYXRlIGZsYWcnKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cbiAgYXdhaXQgZGlzY292ZXJOZXdDb25mbGljdHNGb3JQcihwck51bWJlciwgZGF0ZSk7XG59XG5cbi8qKiBHZXRzIGEgZGF0ZSBvYmplY3QgMzAgZGF5cyBhZ28gZnJvbSB0b2RheS4gKi9cbmZ1bmN0aW9uIGdldFRoaXJ0eURheXNBZ29EYXRlKCkge1xuICBjb25zdCBkYXRlID0gbmV3IERhdGUoKTtcbiAgLy8gU2V0IHRoZSBob3VycywgbWludXRlcyBhbmQgc2Vjb25kcyB0byAwIHRvIG9ubHkgY29uc2lkZXIgZGF0ZS5cbiAgZGF0ZS5zZXRIb3VycygwLCAwLCAwLCAwKTtcbiAgLy8gU2V0IHRoZSBkYXRlIHRvIDMwIGRheXMgaW4gdGhlIHBhc3QuXG4gIGRhdGUuc2V0RGF0ZShkYXRlLmdldERhdGUoKSAtIDMwKTtcbiAgcmV0dXJuIGRhdGUuZ2V0VGltZSgpO1xufVxuIl19