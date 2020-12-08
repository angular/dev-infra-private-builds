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
        define("@angular/dev-infra-private/pr/check-target-branches/cli", ["require", "exports", "tslib", "@angular/dev-infra-private/pr/check-target-branches/check-target-branches"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CheckTargetBranchesModule = void 0;
    var tslib_1 = require("tslib");
    var check_target_branches_1 = require("@angular/dev-infra-private/pr/check-target-branches/check-target-branches");
    /** Builds the command. */
    function builder(yargs) {
        return yargs.positional('pr', {
            description: 'The pull request number',
            type: 'number',
            demandOption: true,
        });
    }
    /** Handles the command. */
    function handler(_a) {
        var pr = _a.pr;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, check_target_branches_1.printTargetBranchesForPr(pr)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    /** yargs command module describing the command.  */
    exports.CheckTargetBranchesModule = {
        handler: handler,
        builder: builder,
        command: 'check-target-branches <pr>',
        describe: 'Check a PR to determine what branches it is currently targeting',
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL2NoZWNrLXRhcmdldC1icmFuY2hlcy9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUlILG1IQUFpRTtJQU1qRSwwQkFBMEI7SUFDMUIsU0FBUyxPQUFPLENBQUMsS0FBVztRQUMxQixPQUFPLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFO1lBQzVCLFdBQVcsRUFBRSx5QkFBeUI7WUFDdEMsSUFBSSxFQUFFLFFBQVE7WUFDZCxZQUFZLEVBQUUsSUFBSTtTQUNuQixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsMkJBQTJCO0lBQzNCLFNBQWUsT0FBTyxDQUFDLEVBQTJDO1lBQTFDLEVBQUUsUUFBQTs7Ozs0QkFDeEIscUJBQU0sZ0RBQXdCLENBQUMsRUFBRSxDQUFDLEVBQUE7O3dCQUFsQyxTQUFrQyxDQUFDOzs7OztLQUNwQztJQUVELG9EQUFvRDtJQUN2QyxRQUFBLHlCQUF5QixHQUFrRDtRQUN0RixPQUFPLFNBQUE7UUFDUCxPQUFPLFNBQUE7UUFDUCxPQUFPLEVBQUUsNEJBQTRCO1FBQ3JDLFFBQVEsRUFBRSxpRUFBaUU7S0FDNUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge3ByaW50VGFyZ2V0QnJhbmNoZXNGb3JQcn0gZnJvbSAnLi9jaGVjay10YXJnZXQtYnJhbmNoZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIENoZWNrVGFyZ2V0QnJhbmNoZXNPcHRpb25zIHtcbiAgcHI6IG51bWJlcjtcbn1cblxuLyoqIEJ1aWxkcyB0aGUgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIGJ1aWxkZXIoeWFyZ3M6IEFyZ3YpIHtcbiAgcmV0dXJuIHlhcmdzLnBvc2l0aW9uYWwoJ3ByJywge1xuICAgIGRlc2NyaXB0aW9uOiAnVGhlIHB1bGwgcmVxdWVzdCBudW1iZXInLFxuICAgIHR5cGU6ICdudW1iZXInLFxuICAgIGRlbWFuZE9wdGlvbjogdHJ1ZSxcbiAgfSk7XG59XG5cbi8qKiBIYW5kbGVzIHRoZSBjb21tYW5kLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcih7cHJ9OiBBcmd1bWVudHM8Q2hlY2tUYXJnZXRCcmFuY2hlc09wdGlvbnM+KSB7XG4gIGF3YWl0IHByaW50VGFyZ2V0QnJhbmNoZXNGb3JQcihwcik7XG59XG5cbi8qKiB5YXJncyBjb21tYW5kIG1vZHVsZSBkZXNjcmliaW5nIHRoZSBjb21tYW5kLiAgKi9cbmV4cG9ydCBjb25zdCBDaGVja1RhcmdldEJyYW5jaGVzTW9kdWxlOiBDb21tYW5kTW9kdWxlPHt9LCBDaGVja1RhcmdldEJyYW5jaGVzT3B0aW9ucz4gPSB7XG4gIGhhbmRsZXIsXG4gIGJ1aWxkZXIsXG4gIGNvbW1hbmQ6ICdjaGVjay10YXJnZXQtYnJhbmNoZXMgPHByPicsXG4gIGRlc2NyaWJlOiAnQ2hlY2sgYSBQUiB0byBkZXRlcm1pbmUgd2hhdCBicmFuY2hlcyBpdCBpcyBjdXJyZW50bHkgdGFyZ2V0aW5nJyxcbn07XG4iXX0=