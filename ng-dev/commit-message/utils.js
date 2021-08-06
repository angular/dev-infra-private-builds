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
const gitCommits_ = require("git-raw-commits");
const parse_1 = require("./parse");
// Set `gitCommits` as this imported value to address "Cannot call a namespace" error.
const gitCommits = gitCommits_;
/**
 * Find all commits within the given range and return an object describing those.
 */
function getCommitsInRange(from, to = 'HEAD') {
    return new Promise((resolve, reject) => {
        /** List of parsed commit objects. */
        const commits = [];
        /** Stream of raw git commit strings in the range provided. */
        const commitStream = gitCommits({ from, to, format: parse_1.gitLogFormatForParsing });
        // Accumulate the parsed commits for each commit from the Readable stream into an array, then
        // resolve the promise with the array when the Readable stream ends.
        commitStream.on('data', (commit) => commits.push(parse_1.parseCommitFromGitLog(commit)));
        commitStream.on('error', (err) => reject(err));
        commitStream.on('end', () => resolve(commits));
    });
}
exports.getCommitsInRange = getCommitsInRange;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9uZy1kZXYvY29tbWl0LW1lc3NhZ2UvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsK0NBQStDO0FBRS9DLG1DQUF3RjtBQUV4RixzRkFBc0Y7QUFDdEYsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDO0FBRS9COztHQUVHO0FBQ0gsU0FBZ0IsaUJBQWlCLENBQUMsSUFBWSxFQUFFLEtBQWEsTUFBTTtJQUNqRSxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ3JDLHFDQUFxQztRQUNyQyxNQUFNLE9BQU8sR0FBdUIsRUFBRSxDQUFDO1FBQ3ZDLDhEQUE4RDtRQUM5RCxNQUFNLFlBQVksR0FBRyxVQUFVLENBQUMsRUFBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSw4QkFBc0IsRUFBQyxDQUFDLENBQUM7UUFFNUUsNkZBQTZGO1FBQzdGLG9FQUFvRTtRQUNwRSxZQUFZLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLE1BQWMsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyw2QkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekYsWUFBWSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFVLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3RELFlBQVksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ2pELENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQWJELDhDQWFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyBnaXRDb21taXRzXyBmcm9tICdnaXQtcmF3LWNvbW1pdHMnO1xuXG5pbXBvcnQge0NvbW1pdEZyb21HaXRMb2csIGdpdExvZ0Zvcm1hdEZvclBhcnNpbmcsIHBhcnNlQ29tbWl0RnJvbUdpdExvZ30gZnJvbSAnLi9wYXJzZSc7XG5cbi8vIFNldCBgZ2l0Q29tbWl0c2AgYXMgdGhpcyBpbXBvcnRlZCB2YWx1ZSB0byBhZGRyZXNzIFwiQ2Fubm90IGNhbGwgYSBuYW1lc3BhY2VcIiBlcnJvci5cbmNvbnN0IGdpdENvbW1pdHMgPSBnaXRDb21taXRzXztcblxuLyoqXG4gKiBGaW5kIGFsbCBjb21taXRzIHdpdGhpbiB0aGUgZ2l2ZW4gcmFuZ2UgYW5kIHJldHVybiBhbiBvYmplY3QgZGVzY3JpYmluZyB0aG9zZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbW1pdHNJblJhbmdlKGZyb206IHN0cmluZywgdG86IHN0cmluZyA9ICdIRUFEJyk6IFByb21pc2U8Q29tbWl0RnJvbUdpdExvZ1tdPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgLyoqIExpc3Qgb2YgcGFyc2VkIGNvbW1pdCBvYmplY3RzLiAqL1xuICAgIGNvbnN0IGNvbW1pdHM6IENvbW1pdEZyb21HaXRMb2dbXSA9IFtdO1xuICAgIC8qKiBTdHJlYW0gb2YgcmF3IGdpdCBjb21taXQgc3RyaW5ncyBpbiB0aGUgcmFuZ2UgcHJvdmlkZWQuICovXG4gICAgY29uc3QgY29tbWl0U3RyZWFtID0gZ2l0Q29tbWl0cyh7ZnJvbSwgdG8sIGZvcm1hdDogZ2l0TG9nRm9ybWF0Rm9yUGFyc2luZ30pO1xuXG4gICAgLy8gQWNjdW11bGF0ZSB0aGUgcGFyc2VkIGNvbW1pdHMgZm9yIGVhY2ggY29tbWl0IGZyb20gdGhlIFJlYWRhYmxlIHN0cmVhbSBpbnRvIGFuIGFycmF5LCB0aGVuXG4gICAgLy8gcmVzb2x2ZSB0aGUgcHJvbWlzZSB3aXRoIHRoZSBhcnJheSB3aGVuIHRoZSBSZWFkYWJsZSBzdHJlYW0gZW5kcy5cbiAgICBjb21taXRTdHJlYW0ub24oJ2RhdGEnLCAoY29tbWl0OiBCdWZmZXIpID0+IGNvbW1pdHMucHVzaChwYXJzZUNvbW1pdEZyb21HaXRMb2coY29tbWl0KSkpO1xuICAgIGNvbW1pdFN0cmVhbS5vbignZXJyb3InLCAoZXJyOiBFcnJvcikgPT4gcmVqZWN0KGVycikpO1xuICAgIGNvbW1pdFN0cmVhbS5vbignZW5kJywgKCkgPT4gcmVzb2x2ZShjb21taXRzKSk7XG4gIH0pO1xufVxuIl19