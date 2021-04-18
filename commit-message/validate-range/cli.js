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
        return yargs
            .positional('startingRef', {
            description: 'The first ref in the range to select',
            type: 'string',
            demandOption: true,
        })
            .positional('endingRef', {
            description: 'The last ref in the range to select',
            type: 'string',
            default: 'HEAD',
        });
    }
    /** Handles the command. */
    function handler(_a) {
        var startingRef = _a.startingRef, endingRef = _a.endingRef;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // If on CI, and no pull request number is provided, assume the branch
                        // being run on is an upstream branch.
                        if (process.env['CI'] && process.env['CI_PULL_REQUEST'] === 'false') {
                            console_1.info("Since valid commit messages are enforced by PR linting on CI, we do not");
                            console_1.info("need to validate commit messages on CI runs on upstream branches.");
                            console_1.info();
                            console_1.info("Skipping check of provided commit range");
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, validate_range_1.validateCommitRange(startingRef, endingRef)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    /** yargs command module describing the command. */
    exports.ValidateRangeModule = {
        handler: handler,
        builder: builder,
        command: 'validate-range <starting-ref> [ending-ref]',
        describe: 'Validate a range of commit messages',
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL3ZhbGlkYXRlLXJhbmdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBSUgsb0VBQXlDO0lBRXpDLDBHQUFxRDtJQVFyRCwwQkFBMEI7SUFDMUIsU0FBUyxPQUFPLENBQUMsS0FBVztRQUMxQixPQUFPLEtBQUs7YUFDUCxVQUFVLENBQUMsYUFBYSxFQUFFO1lBQ3pCLFdBQVcsRUFBRSxzQ0FBc0M7WUFDbkQsSUFBSSxFQUFFLFFBQVE7WUFDZCxZQUFZLEVBQUUsSUFBSTtTQUNuQixDQUFDO2FBQ0QsVUFBVSxDQUFDLFdBQVcsRUFBRTtZQUN2QixXQUFXLEVBQUUscUNBQXFDO1lBQ2xELElBQUksRUFBRSxRQUFRO1lBQ2QsT0FBTyxFQUFFLE1BQU07U0FDaEIsQ0FBQyxDQUFDO0lBQ1QsQ0FBQztJQUVELDJCQUEyQjtJQUMzQixTQUFlLE9BQU8sQ0FBQyxFQUF5RDtZQUF4RCxXQUFXLGlCQUFBLEVBQUUsU0FBUyxlQUFBOzs7Ozt3QkFDNUMsc0VBQXNFO3dCQUN0RSxzQ0FBc0M7d0JBQ3RDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLEtBQUssT0FBTyxFQUFFOzRCQUNuRSxjQUFJLENBQUMseUVBQXlFLENBQUMsQ0FBQzs0QkFDaEYsY0FBSSxDQUFDLG1FQUFtRSxDQUFDLENBQUM7NEJBQzFFLGNBQUksRUFBRSxDQUFDOzRCQUNQLGNBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDOzRCQUNoRCxzQkFBTzt5QkFDUjt3QkFDRCxxQkFBTSxvQ0FBbUIsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLEVBQUE7O3dCQUFqRCxTQUFpRCxDQUFDOzs7OztLQUNuRDtJQUVELG1EQUFtRDtJQUN0QyxRQUFBLG1CQUFtQixHQUE0QztRQUMxRSxPQUFPLFNBQUE7UUFDUCxPQUFPLFNBQUE7UUFDUCxPQUFPLEVBQUUsNENBQTRDO1FBQ3JELFFBQVEsRUFBRSxxQ0FBcUM7S0FDaEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2luZm99IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge3ZhbGlkYXRlQ29tbWl0UmFuZ2V9IGZyb20gJy4vdmFsaWRhdGUtcmFuZ2UnO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGVSYW5nZU9wdGlvbnMge1xuICBzdGFydGluZ1JlZjogc3RyaW5nO1xuICBlbmRpbmdSZWY6IHN0cmluZztcbn1cblxuLyoqIEJ1aWxkcyB0aGUgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIGJ1aWxkZXIoeWFyZ3M6IEFyZ3YpIHtcbiAgcmV0dXJuIHlhcmdzXG4gICAgICAucG9zaXRpb25hbCgnc3RhcnRpbmdSZWYnLCB7XG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGZpcnN0IHJlZiBpbiB0aGUgcmFuZ2UgdG8gc2VsZWN0JyxcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlbWFuZE9wdGlvbjogdHJ1ZSxcbiAgICAgIH0pXG4gICAgICAucG9zaXRpb25hbCgnZW5kaW5nUmVmJywge1xuICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBsYXN0IHJlZiBpbiB0aGUgcmFuZ2UgdG8gc2VsZWN0JyxcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICdIRUFEJyxcbiAgICAgIH0pO1xufVxuXG4vKiogSGFuZGxlcyB0aGUgY29tbWFuZC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoe3N0YXJ0aW5nUmVmLCBlbmRpbmdSZWZ9OiBBcmd1bWVudHM8VmFsaWRhdGVSYW5nZU9wdGlvbnM+KSB7XG4gIC8vIElmIG9uIENJLCBhbmQgbm8gcHVsbCByZXF1ZXN0IG51bWJlciBpcyBwcm92aWRlZCwgYXNzdW1lIHRoZSBicmFuY2hcbiAgLy8gYmVpbmcgcnVuIG9uIGlzIGFuIHVwc3RyZWFtIGJyYW5jaC5cbiAgaWYgKHByb2Nlc3MuZW52WydDSSddICYmIHByb2Nlc3MuZW52WydDSV9QVUxMX1JFUVVFU1QnXSA9PT0gJ2ZhbHNlJykge1xuICAgIGluZm8oYFNpbmNlIHZhbGlkIGNvbW1pdCBtZXNzYWdlcyBhcmUgZW5mb3JjZWQgYnkgUFIgbGludGluZyBvbiBDSSwgd2UgZG8gbm90YCk7XG4gICAgaW5mbyhgbmVlZCB0byB2YWxpZGF0ZSBjb21taXQgbWVzc2FnZXMgb24gQ0kgcnVucyBvbiB1cHN0cmVhbSBicmFuY2hlcy5gKTtcbiAgICBpbmZvKCk7XG4gICAgaW5mbyhgU2tpcHBpbmcgY2hlY2sgb2YgcHJvdmlkZWQgY29tbWl0IHJhbmdlYCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGF3YWl0IHZhbGlkYXRlQ29tbWl0UmFuZ2Uoc3RhcnRpbmdSZWYsIGVuZGluZ1JlZik7XG59XG5cbi8qKiB5YXJncyBjb21tYW5kIG1vZHVsZSBkZXNjcmliaW5nIHRoZSBjb21tYW5kLiAqL1xuZXhwb3J0IGNvbnN0IFZhbGlkYXRlUmFuZ2VNb2R1bGU6IENvbW1hbmRNb2R1bGU8e30sIFZhbGlkYXRlUmFuZ2VPcHRpb25zPiA9IHtcbiAgaGFuZGxlcixcbiAgYnVpbGRlcixcbiAgY29tbWFuZDogJ3ZhbGlkYXRlLXJhbmdlIDxzdGFydGluZy1yZWY+IFtlbmRpbmctcmVmXScsXG4gIGRlc2NyaWJlOiAnVmFsaWRhdGUgYSByYW5nZSBvZiBjb21taXQgbWVzc2FnZXMnLFxufTtcbiJdfQ==