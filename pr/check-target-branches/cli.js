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
        return yargs
            .positional('pr', {
            description: 'The pull request number',
            type: 'number',
            demandOption: true,
        })
            .option('json', {
            type: 'boolean',
            default: false,
            description: 'Print response as json',
        });
    }
    /** Handles the command. */
    function handler(_a) {
        var pr = _a.pr, json = _a.json;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, check_target_branches_1.checkTargetBranchesForPr(pr, json)];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL2NoZWNrLXRhcmdldC1icmFuY2hlcy9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUlILG1IQUFpRTtJQU9qRSwwQkFBMEI7SUFDMUIsU0FBUyxPQUFPLENBQUMsS0FBVztRQUMxQixPQUFPLEtBQUs7YUFDUCxVQUFVLENBQUMsSUFBSSxFQUFFO1lBQ2hCLFdBQVcsRUFBRSx5QkFBeUI7WUFDdEMsSUFBSSxFQUFFLFFBQVE7WUFDZCxZQUFZLEVBQUUsSUFBSTtTQUNuQixDQUFDO2FBQ0QsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUNkLElBQUksRUFBRSxTQUFTO1lBQ2YsT0FBTyxFQUFFLEtBQUs7WUFDZCxXQUFXLEVBQUUsd0JBQXdCO1NBQ3RDLENBQUMsQ0FBQztJQUNULENBQUM7SUFFRCwyQkFBMkI7SUFDM0IsU0FBZSxPQUFPLENBQUMsRUFBaUQ7WUFBaEQsRUFBRSxRQUFBLEVBQUUsSUFBSSxVQUFBOzs7OzRCQUM5QixxQkFBTSxnREFBd0IsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUE7O3dCQUF4QyxTQUF3QyxDQUFDOzs7OztLQUMxQztJQUVELG9EQUFvRDtJQUN2QyxRQUFBLHlCQUF5QixHQUFrRDtRQUN0RixPQUFPLFNBQUE7UUFDUCxPQUFPLFNBQUE7UUFDUCxPQUFPLEVBQUUsNEJBQTRCO1FBQ3JDLFFBQVEsRUFBRSxpRUFBaUU7S0FDNUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2NoZWNrVGFyZ2V0QnJhbmNoZXNGb3JQcn0gZnJvbSAnLi9jaGVjay10YXJnZXQtYnJhbmNoZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIENoZWNrVGFyZ2V0QnJhbmNoZXNPcHRpb25zIHtcbiAgcHI6IG51bWJlcjtcbiAganNvbjogYm9vbGVhbjtcbn1cblxuLyoqIEJ1aWxkcyB0aGUgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIGJ1aWxkZXIoeWFyZ3M6IEFyZ3YpIHtcbiAgcmV0dXJuIHlhcmdzXG4gICAgICAucG9zaXRpb25hbCgncHInLCB7XG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHB1bGwgcmVxdWVzdCBudW1iZXInLFxuICAgICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgICAgZGVtYW5kT3B0aW9uOiB0cnVlLFxuICAgICAgfSlcbiAgICAgIC5vcHRpb24oJ2pzb24nLCB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUHJpbnQgcmVzcG9uc2UgYXMganNvbicsXG4gICAgICB9KTtcbn1cblxuLyoqIEhhbmRsZXMgdGhlIGNvbW1hbmQuICovXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVyKHtwciwganNvbn06IEFyZ3VtZW50czxDaGVja1RhcmdldEJyYW5jaGVzT3B0aW9ucz4pIHtcbiAgYXdhaXQgY2hlY2tUYXJnZXRCcmFuY2hlc0ZvclByKHByLCBqc29uKTtcbn1cblxuLyoqIHlhcmdzIGNvbW1hbmQgbW9kdWxlIGRlc2NyaWJpbmcgdGhlIGNvbW1hbmQuICAqL1xuZXhwb3J0IGNvbnN0IENoZWNrVGFyZ2V0QnJhbmNoZXNNb2R1bGU6IENvbW1hbmRNb2R1bGU8e30sIENoZWNrVGFyZ2V0QnJhbmNoZXNPcHRpb25zPiA9IHtcbiAgaGFuZGxlcixcbiAgYnVpbGRlcixcbiAgY29tbWFuZDogJ2NoZWNrLXRhcmdldC1icmFuY2hlcyA8cHI+JyxcbiAgZGVzY3JpYmU6ICdDaGVjayBhIFBSIHRvIGRldGVybWluZSB3aGF0IGJyYW5jaGVzIGl0IGlzIGN1cnJlbnRseSB0YXJnZXRpbmcnLFxufTtcbiJdfQ==