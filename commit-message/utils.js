(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/utils", ["require", "exports", "git-raw-commits", "@angular/dev-infra-private/commit-message/parse"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCommitsInRange = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var gitCommits_ = require("git-raw-commits");
    var parse_1 = require("@angular/dev-infra-private/commit-message/parse");
    // Set `gitCommits` as this imported value to address "Cannot call a namespace" error.
    var gitCommits = gitCommits_;
    /**
     * Find all commits within the given range and return an object describing those.
     */
    function getCommitsInRange(from, to) {
        if (to === void 0) { to = 'HEAD'; }
        return new Promise(function (resolve, reject) {
            /** List of parsed commit objects. */
            var commits = [];
            /** Stream of raw git commit strings in the range provided. */
            var commitStream = gitCommits({ from: from, to: to, format: parse_1.gitLogFormatForParsing });
            // Accumulate the parsed commits for each commit from the Readable stream into an array, then
            // resolve the promise with the array when the Readable stream ends.
            commitStream.on('data', function (commit) { return commits.push(parse_1.parseCommitMessage(commit)); });
            commitStream.on('error', function (err) { return reject(err); });
            commitStream.on('end', function () { return resolve(commits); });
        });
    }
    exports.getCommitsInRange = getCommitsInRange;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsNkNBQStDO0lBRS9DLHlFQUEyRTtJQUUzRSxzRkFBc0Y7SUFDdEYsSUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDO0lBRy9COztPQUVHO0lBQ0gsU0FBZ0IsaUJBQWlCLENBQUMsSUFBWSxFQUFFLEVBQW1CO1FBQW5CLG1CQUFBLEVBQUEsV0FBbUI7UUFDakUsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNO1lBQ2pDLHFDQUFxQztZQUNyQyxJQUFNLE9BQU8sR0FBYSxFQUFFLENBQUM7WUFDN0IsOERBQThEO1lBQzlELElBQU0sWUFBWSxHQUFHLFVBQVUsQ0FBQyxFQUFDLElBQUksTUFBQSxFQUFFLEVBQUUsSUFBQSxFQUFFLE1BQU0sRUFBRSw4QkFBc0IsRUFBQyxDQUFDLENBQUM7WUFFNUUsNkZBQTZGO1lBQzdGLG9FQUFvRTtZQUNwRSxZQUFZLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFDLE1BQWMsSUFBSyxPQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsMEJBQWtCLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBeEMsQ0FBd0MsQ0FBQyxDQUFDO1lBQ3RGLFlBQVksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQUMsR0FBVSxJQUFLLE9BQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFYLENBQVcsQ0FBQyxDQUFDO1lBQ3RELFlBQVksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLGNBQU0sT0FBQSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQWhCLENBQWdCLENBQUMsQ0FBQztRQUNqRCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFiRCw4Q0FhQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgZ2l0Q29tbWl0c18gZnJvbSAnZ2l0LXJhdy1jb21taXRzJztcblxuaW1wb3J0IHtDb21taXQsIGdpdExvZ0Zvcm1hdEZvclBhcnNpbmcsIHBhcnNlQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi9wYXJzZSc7XG5cbi8vIFNldCBgZ2l0Q29tbWl0c2AgYXMgdGhpcyBpbXBvcnRlZCB2YWx1ZSB0byBhZGRyZXNzIFwiQ2Fubm90IGNhbGwgYSBuYW1lc3BhY2VcIiBlcnJvci5cbmNvbnN0IGdpdENvbW1pdHMgPSBnaXRDb21taXRzXztcblxuXG4vKipcbiAqIEZpbmQgYWxsIGNvbW1pdHMgd2l0aGluIHRoZSBnaXZlbiByYW5nZSBhbmQgcmV0dXJuIGFuIG9iamVjdCBkZXNjcmliaW5nIHRob3NlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tbWl0c0luUmFuZ2UoZnJvbTogc3RyaW5nLCB0bzogc3RyaW5nID0gJ0hFQUQnKTogUHJvbWlzZTxDb21taXRbXT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIC8qKiBMaXN0IG9mIHBhcnNlZCBjb21taXQgb2JqZWN0cy4gKi9cbiAgICBjb25zdCBjb21taXRzOiBDb21taXRbXSA9IFtdO1xuICAgIC8qKiBTdHJlYW0gb2YgcmF3IGdpdCBjb21taXQgc3RyaW5ncyBpbiB0aGUgcmFuZ2UgcHJvdmlkZWQuICovXG4gICAgY29uc3QgY29tbWl0U3RyZWFtID0gZ2l0Q29tbWl0cyh7ZnJvbSwgdG8sIGZvcm1hdDogZ2l0TG9nRm9ybWF0Rm9yUGFyc2luZ30pO1xuXG4gICAgLy8gQWNjdW11bGF0ZSB0aGUgcGFyc2VkIGNvbW1pdHMgZm9yIGVhY2ggY29tbWl0IGZyb20gdGhlIFJlYWRhYmxlIHN0cmVhbSBpbnRvIGFuIGFycmF5LCB0aGVuXG4gICAgLy8gcmVzb2x2ZSB0aGUgcHJvbWlzZSB3aXRoIHRoZSBhcnJheSB3aGVuIHRoZSBSZWFkYWJsZSBzdHJlYW0gZW5kcy5cbiAgICBjb21taXRTdHJlYW0ub24oJ2RhdGEnLCAoY29tbWl0OiBCdWZmZXIpID0+IGNvbW1pdHMucHVzaChwYXJzZUNvbW1pdE1lc3NhZ2UoY29tbWl0KSkpO1xuICAgIGNvbW1pdFN0cmVhbS5vbignZXJyb3InLCAoZXJyOiBFcnJvcikgPT4gcmVqZWN0KGVycikpO1xuICAgIGNvbW1pdFN0cmVhbS5vbignZW5kJywgKCkgPT4gcmVzb2x2ZShjb21taXRzKSk7XG4gIH0pO1xufVxuIl19