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
        define("@angular/dev-infra-private/commit-message/validate-range/cli", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/commit-message/validate-range/validate-range"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ValidateRangeModule = void 0;
    var tslib_1 = require("tslib");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var validate_range_1 = require("@angular/dev-infra-private/commit-message/validate-range/validate-range");
    /** Builds the command. */
    function builder(yargs) {
        return yargs.option('range', {
            description: 'The range of commits to check, e.g. --range abc123..xyz456',
            demandOption: '  A range must be provided, e.g. --range abc123..xyz456',
            type: 'string',
            requiresArg: true,
        });
    }
    /** Handles the command. */
    function handler(_a) {
        var range = _a.range;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_b) {
                // If on CI, and no pull request number is provided, assume the branch
                // being run on is an upstream branch.
                if (process.env['CI'] && process.env['CI_PULL_REQUEST'] === 'false') {
                    console_1.info("Since valid commit messages are enforced by PR linting on CI, we do not");
                    console_1.info("need to validate commit messages on CI runs on upstream branches.");
                    console_1.info();
                    console_1.info("Skipping check of provided commit range");
                    return [2 /*return*/];
                }
                validate_range_1.validateCommitRange(range);
                return [2 /*return*/];
            });
        });
    }
    /** yargs command module describing the command.  */
    exports.ValidateRangeModule = {
        handler: handler,
        builder: builder,
        command: 'validate-range',
        describe: 'Validate a range of commit messages',
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL3ZhbGlkYXRlLXJhbmdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBSUgsb0VBQXlDO0lBRXpDLDBHQUFxRDtJQU9yRCwwQkFBMEI7SUFDMUIsU0FBUyxPQUFPLENBQUMsS0FBVztRQUMxQixPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFO1lBQzNCLFdBQVcsRUFBRSw0REFBNEQ7WUFDekUsWUFBWSxFQUFFLHlEQUF5RDtZQUN2RSxJQUFJLEVBQUUsUUFBUTtZQUNkLFdBQVcsRUFBRSxJQUFJO1NBQ2xCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCwyQkFBMkI7SUFDM0IsU0FBZSxPQUFPLENBQUMsRUFBd0M7WUFBdkMsS0FBSyxXQUFBOzs7Z0JBQzNCLHNFQUFzRTtnQkFDdEUsc0NBQXNDO2dCQUN0QyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLE9BQU8sRUFBRTtvQkFDbkUsY0FBSSxDQUFDLHlFQUF5RSxDQUFDLENBQUM7b0JBQ2hGLGNBQUksQ0FBQyxtRUFBbUUsQ0FBQyxDQUFDO29CQUMxRSxjQUFJLEVBQUUsQ0FBQztvQkFDUCxjQUFJLENBQUMseUNBQXlDLENBQUMsQ0FBQztvQkFDaEQsc0JBQU87aUJBQ1I7Z0JBQ0Qsb0NBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7Ozs7S0FDNUI7SUFFRCxvREFBb0Q7SUFDdkMsUUFBQSxtQkFBbUIsR0FBNEM7UUFDMUUsT0FBTyxTQUFBO1FBQ1AsT0FBTyxTQUFBO1FBQ1AsT0FBTyxFQUFFLGdCQUFnQjtRQUN6QixRQUFRLEVBQUUscUNBQXFDO0tBQ2hELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3YsIENvbW1hbmRNb2R1bGV9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHt2YWxpZGF0ZUNvbW1pdFJhbmdlfSBmcm9tICcuL3ZhbGlkYXRlLXJhbmdlJztcblxuXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRlUmFuZ2VPcHRpb25zIHtcbiAgcmFuZ2U6IHN0cmluZztcbn1cblxuLyoqIEJ1aWxkcyB0aGUgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIGJ1aWxkZXIoeWFyZ3M6IEFyZ3YpIHtcbiAgcmV0dXJuIHlhcmdzLm9wdGlvbigncmFuZ2UnLCB7XG4gICAgZGVzY3JpcHRpb246ICdUaGUgcmFuZ2Ugb2YgY29tbWl0cyB0byBjaGVjaywgZS5nLiAtLXJhbmdlIGFiYzEyMy4ueHl6NDU2JyxcbiAgICBkZW1hbmRPcHRpb246ICcgIEEgcmFuZ2UgbXVzdCBiZSBwcm92aWRlZCwgZS5nLiAtLXJhbmdlIGFiYzEyMy4ueHl6NDU2JyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICByZXF1aXJlc0FyZzogdHJ1ZSxcbiAgfSk7XG59XG5cbi8qKiBIYW5kbGVzIHRoZSBjb21tYW5kLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcih7cmFuZ2V9OiBBcmd1bWVudHM8VmFsaWRhdGVSYW5nZU9wdGlvbnM+KSB7XG4gIC8vIElmIG9uIENJLCBhbmQgbm8gcHVsbCByZXF1ZXN0IG51bWJlciBpcyBwcm92aWRlZCwgYXNzdW1lIHRoZSBicmFuY2hcbiAgLy8gYmVpbmcgcnVuIG9uIGlzIGFuIHVwc3RyZWFtIGJyYW5jaC5cbiAgaWYgKHByb2Nlc3MuZW52WydDSSddICYmIHByb2Nlc3MuZW52WydDSV9QVUxMX1JFUVVFU1QnXSA9PT0gJ2ZhbHNlJykge1xuICAgIGluZm8oYFNpbmNlIHZhbGlkIGNvbW1pdCBtZXNzYWdlcyBhcmUgZW5mb3JjZWQgYnkgUFIgbGludGluZyBvbiBDSSwgd2UgZG8gbm90YCk7XG4gICAgaW5mbyhgbmVlZCB0byB2YWxpZGF0ZSBjb21taXQgbWVzc2FnZXMgb24gQ0kgcnVucyBvbiB1cHN0cmVhbSBicmFuY2hlcy5gKTtcbiAgICBpbmZvKCk7XG4gICAgaW5mbyhgU2tpcHBpbmcgY2hlY2sgb2YgcHJvdmlkZWQgY29tbWl0IHJhbmdlYCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhbGlkYXRlQ29tbWl0UmFuZ2UocmFuZ2UpO1xufVxuXG4vKiogeWFyZ3MgY29tbWFuZCBtb2R1bGUgZGVzY3JpYmluZyB0aGUgY29tbWFuZC4gICovXG5leHBvcnQgY29uc3QgVmFsaWRhdGVSYW5nZU1vZHVsZTogQ29tbWFuZE1vZHVsZTx7fSwgVmFsaWRhdGVSYW5nZU9wdGlvbnM+ID0ge1xuICBoYW5kbGVyLFxuICBidWlsZGVyLFxuICBjb21tYW5kOiAndmFsaWRhdGUtcmFuZ2UnLFxuICBkZXNjcmliZTogJ1ZhbGlkYXRlIGEgcmFuZ2Ugb2YgY29tbWl0IG1lc3NhZ2VzJyxcbn07XG4iXX0=