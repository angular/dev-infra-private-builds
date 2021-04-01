(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/validate-range/validate-range", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/commit-message/utils", "@angular/dev-infra-private/commit-message/validate"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateCommitRange = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var utils_1 = require("@angular/dev-infra-private/commit-message/utils");
    var validate_1 = require("@angular/dev-infra-private/commit-message/validate");
    // Whether the provided commit is a fixup commit.
    var isNonFixup = function (commit) { return !commit.isFixup; };
    // Extracts commit header (first line of commit message).
    var extractCommitHeader = function (commit) { return commit.header; };
    /** Validate all commits in a provided git commit range. */
    function validateCommitRange(from, to) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var errors, commits, allCommitsInRangeValid;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        errors = [];
                        return [4 /*yield*/, utils_1.getCommitsInRange(from, to)];
                    case 1:
                        commits = _a.sent();
                        console_1.info("Examining " + commits.length + " commit(s) in the provided range: " + from + ".." + to);
                        allCommitsInRangeValid = commits.every(function (commit, i) {
                            var options = {
                                disallowSquash: true,
                                nonFixupCommitHeaders: isNonFixup(commit) ?
                                    undefined :
                                    commits.slice(i + 1).filter(isNonFixup).map(extractCommitHeader)
                            };
                            var _a = validate_1.validateCommitMessage(commit, options), valid = _a.valid, localErrors = _a.errors;
                            if (localErrors.length) {
                                errors.push([commit.header, localErrors]);
                            }
                            return valid;
                        });
                        if (allCommitsInRangeValid) {
                            console_1.info(console_1.green('√  All commit messages in range valid.'));
                        }
                        else {
                            console_1.error(console_1.red('✘  Invalid commit message'));
                            errors.forEach(function (_a) {
                                var _b = tslib_1.__read(_a, 2), header = _b[0], validationErrors = _b[1];
                                console_1.error.group(header);
                                validate_1.printValidationErrors(validationErrors);
                                console_1.error.groupEnd();
                            });
                            // Exit with a non-zero exit code if invalid commit messages have
                            // been discovered.
                            process.exit(1);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.validateCommitRange = validateCommitRange;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtcmFuZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUtcmFuZ2UvdmFsaWRhdGUtcmFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILG9FQUE0RDtJQUU1RCx5RUFBMkM7SUFDM0MsK0VBQXVHO0lBRXZHLGlEQUFpRDtJQUNqRCxJQUFNLFVBQVUsR0FBRyxVQUFDLE1BQWMsSUFBSyxPQUFBLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBZixDQUFlLENBQUM7SUFFdkQseURBQXlEO0lBQ3pELElBQU0sbUJBQW1CLEdBQUcsVUFBQyxNQUFjLElBQUssT0FBQSxNQUFNLENBQUMsTUFBTSxFQUFiLENBQWEsQ0FBQztJQUU5RCwyREFBMkQ7SUFDM0QsU0FBc0IsbUJBQW1CLENBQUMsSUFBWSxFQUFFLEVBQVU7Ozs7Ozt3QkFFMUQsTUFBTSxHQUErQyxFQUFFLENBQUM7d0JBRzlDLHFCQUFNLHlCQUFpQixDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBQTs7d0JBQTNDLE9BQU8sR0FBRyxTQUFpQzt3QkFDakQsY0FBSSxDQUFDLGVBQWEsT0FBTyxDQUFDLE1BQU0sMENBQXFDLElBQUksVUFBSyxFQUFJLENBQUMsQ0FBQzt3QkFNOUUsc0JBQXNCLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFDLE1BQU0sRUFBRSxDQUFDOzRCQUNyRCxJQUFNLE9BQU8sR0FBaUM7Z0NBQzVDLGNBQWMsRUFBRSxJQUFJO2dDQUNwQixxQkFBcUIsRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQ0FDdkMsU0FBUyxDQUFDLENBQUM7b0NBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQzs2QkFDckUsQ0FBQzs0QkFDSSxJQUFBLEtBQStCLGdDQUFxQixDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsRUFBcEUsS0FBSyxXQUFBLEVBQVUsV0FBVyxZQUEwQyxDQUFDOzRCQUM1RSxJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUU7Z0NBQ3RCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7NkJBQzNDOzRCQUNELE9BQU8sS0FBSyxDQUFDO3dCQUNmLENBQUMsQ0FBQyxDQUFDO3dCQUVILElBQUksc0JBQXNCLEVBQUU7NEJBQzFCLGNBQUksQ0FBQyxlQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQyxDQUFDO3lCQUN2RDs2QkFBTTs0QkFDTCxlQUFLLENBQUMsYUFBRyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQzs0QkFDeEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEVBQTBCO29DQUExQixLQUFBLHFCQUEwQixFQUF6QixNQUFNLFFBQUEsRUFBRSxnQkFBZ0IsUUFBQTtnQ0FDdkMsZUFBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztnQ0FDcEIsZ0NBQXFCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQ0FDeEMsZUFBSyxDQUFDLFFBQVEsRUFBRSxDQUFDOzRCQUNuQixDQUFDLENBQUMsQ0FBQzs0QkFDSCxpRUFBaUU7NEJBQ2pFLG1CQUFtQjs0QkFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDakI7Ozs7O0tBQ0Y7SUF2Q0Qsa0RBdUNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge2Vycm9yLCBncmVlbiwgaW5mbywgcmVkfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7Q29tbWl0fSBmcm9tICcuLi9wYXJzZSc7XG5pbXBvcnQge2dldENvbW1pdHNJblJhbmdlfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQge3ByaW50VmFsaWRhdGlvbkVycm9ycywgdmFsaWRhdGVDb21taXRNZXNzYWdlLCBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VPcHRpb25zfSBmcm9tICcuLi92YWxpZGF0ZSc7XG5cbi8vIFdoZXRoZXIgdGhlIHByb3ZpZGVkIGNvbW1pdCBpcyBhIGZpeHVwIGNvbW1pdC5cbmNvbnN0IGlzTm9uRml4dXAgPSAoY29tbWl0OiBDb21taXQpID0+ICFjb21taXQuaXNGaXh1cDtcblxuLy8gRXh0cmFjdHMgY29tbWl0IGhlYWRlciAoZmlyc3QgbGluZSBvZiBjb21taXQgbWVzc2FnZSkuXG5jb25zdCBleHRyYWN0Q29tbWl0SGVhZGVyID0gKGNvbW1pdDogQ29tbWl0KSA9PiBjb21taXQuaGVhZGVyO1xuXG4vKiogVmFsaWRhdGUgYWxsIGNvbW1pdHMgaW4gYSBwcm92aWRlZCBnaXQgY29tbWl0IHJhbmdlLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZhbGlkYXRlQ29tbWl0UmFuZ2UoZnJvbTogc3RyaW5nLCB0bzogc3RyaW5nKSB7XG4gIC8qKiBBIGxpc3Qgb2YgdHVwbGVzIG9mIHRoZSBjb21taXQgaGVhZGVyIHN0cmluZyBhbmQgYSBsaXN0IG9mIGVycm9yIG1lc3NhZ2VzIGZvciB0aGUgY29tbWl0LiAqL1xuICBjb25zdCBlcnJvcnM6IFtjb21taXRIZWFkZXI6IHN0cmluZywgZXJyb3JzOiBzdHJpbmdbXV1bXSA9IFtdO1xuXG4gIC8qKiBBIGxpc3Qgb2YgcGFyc2VkIGNvbW1pdCBtZXNzYWdlcyBmcm9tIHRoZSByYW5nZS4gKi9cbiAgY29uc3QgY29tbWl0cyA9IGF3YWl0IGdldENvbW1pdHNJblJhbmdlKGZyb20sIHRvKTtcbiAgaW5mbyhgRXhhbWluaW5nICR7Y29tbWl0cy5sZW5ndGh9IGNvbW1pdChzKSBpbiB0aGUgcHJvdmlkZWQgcmFuZ2U6ICR7ZnJvbX0uLiR7dG99YCk7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgYWxsIGNvbW1pdHMgaW4gdGhlIHJhbmdlIGFyZSB2YWxpZCwgY29tbWl0cyBhcmUgYWxsb3dlZCB0byBiZSBmaXh1cCBjb21taXRzIGZvciBvdGhlclxuICAgKiBjb21taXRzIGluIHRoZSBwcm92aWRlZCBjb21taXQgcmFuZ2UuXG4gICAqL1xuICBjb25zdCBhbGxDb21taXRzSW5SYW5nZVZhbGlkID0gY29tbWl0cy5ldmVyeSgoY29tbWl0LCBpKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9uczogVmFsaWRhdGVDb21taXRNZXNzYWdlT3B0aW9ucyA9IHtcbiAgICAgIGRpc2FsbG93U3F1YXNoOiB0cnVlLFxuICAgICAgbm9uRml4dXBDb21taXRIZWFkZXJzOiBpc05vbkZpeHVwKGNvbW1pdCkgP1xuICAgICAgICAgIHVuZGVmaW5lZCA6XG4gICAgICAgICAgY29tbWl0cy5zbGljZShpICsgMSkuZmlsdGVyKGlzTm9uRml4dXApLm1hcChleHRyYWN0Q29tbWl0SGVhZGVyKVxuICAgIH07XG4gICAgY29uc3Qge3ZhbGlkLCBlcnJvcnM6IGxvY2FsRXJyb3JzfSA9IHZhbGlkYXRlQ29tbWl0TWVzc2FnZShjb21taXQsIG9wdGlvbnMpO1xuICAgIGlmIChsb2NhbEVycm9ycy5sZW5ndGgpIHtcbiAgICAgIGVycm9ycy5wdXNoKFtjb21taXQuaGVhZGVyLCBsb2NhbEVycm9yc10pO1xuICAgIH1cbiAgICByZXR1cm4gdmFsaWQ7XG4gIH0pO1xuXG4gIGlmIChhbGxDb21taXRzSW5SYW5nZVZhbGlkKSB7XG4gICAgaW5mbyhncmVlbign4oiaICBBbGwgY29tbWl0IG1lc3NhZ2VzIGluIHJhbmdlIHZhbGlkLicpKTtcbiAgfSBlbHNlIHtcbiAgICBlcnJvcihyZWQoJ+KcmCAgSW52YWxpZCBjb21taXQgbWVzc2FnZScpKTtcbiAgICBlcnJvcnMuZm9yRWFjaCgoW2hlYWRlciwgdmFsaWRhdGlvbkVycm9yc10pID0+IHtcbiAgICAgIGVycm9yLmdyb3VwKGhlYWRlcik7XG4gICAgICBwcmludFZhbGlkYXRpb25FcnJvcnModmFsaWRhdGlvbkVycm9ycyk7XG4gICAgICBlcnJvci5ncm91cEVuZCgpO1xuICAgIH0pO1xuICAgIC8vIEV4aXQgd2l0aCBhIG5vbi16ZXJvIGV4aXQgY29kZSBpZiBpbnZhbGlkIGNvbW1pdCBtZXNzYWdlcyBoYXZlXG4gICAgLy8gYmVlbiBkaXNjb3ZlcmVkLlxuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxufVxuIl19