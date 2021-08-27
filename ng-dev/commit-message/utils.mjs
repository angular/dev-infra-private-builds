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
        commitStream.on('data', (commit) => commits.push((0, parse_1.parseCommitFromGitLog)(commit)));
        commitStream.on('error', (err) => reject(err));
        commitStream.on('end', () => resolve(commits));
    });
}
exports.getCommitsInRange = getCommitsInRange;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9uZy1kZXYvY29tbWl0LW1lc3NhZ2UvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsK0NBQStDO0FBRS9DLG1DQUF3RjtBQUV4RixzRkFBc0Y7QUFDdEYsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDO0FBRS9COztHQUVHO0FBQ0gsU0FBZ0IsaUJBQWlCLENBQUMsSUFBWSxFQUFFLEtBQWEsTUFBTTtJQUNqRSxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ3JDLHFDQUFxQztRQUNyQyxNQUFNLE9BQU8sR0FBdUIsRUFBRSxDQUFDO1FBQ3ZDLDhEQUE4RDtRQUM5RCxNQUFNLFlBQVksR0FBRyxVQUFVLENBQUMsRUFBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSw4QkFBc0IsRUFBQyxDQUFDLENBQUM7UUFFNUUsNkZBQTZGO1FBQzdGLG9FQUFvRTtRQUNwRSxZQUFZLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLE1BQWMsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFBLDZCQUFxQixFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6RixZQUFZLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQVUsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdEQsWUFBWSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDakQsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBYkQsOENBYUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIGdpdENvbW1pdHNfIGZyb20gJ2dpdC1yYXctY29tbWl0cyc7XG5cbmltcG9ydCB7Q29tbWl0RnJvbUdpdExvZywgZ2l0TG9nRm9ybWF0Rm9yUGFyc2luZywgcGFyc2VDb21taXRGcm9tR2l0TG9nfSBmcm9tICcuL3BhcnNlJztcblxuLy8gU2V0IGBnaXRDb21taXRzYCBhcyB0aGlzIGltcG9ydGVkIHZhbHVlIHRvIGFkZHJlc3MgXCJDYW5ub3QgY2FsbCBhIG5hbWVzcGFjZVwiIGVycm9yLlxuY29uc3QgZ2l0Q29tbWl0cyA9IGdpdENvbW1pdHNfO1xuXG4vKipcbiAqIEZpbmQgYWxsIGNvbW1pdHMgd2l0aGluIHRoZSBnaXZlbiByYW5nZSBhbmQgcmV0dXJuIGFuIG9iamVjdCBkZXNjcmliaW5nIHRob3NlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tbWl0c0luUmFuZ2UoZnJvbTogc3RyaW5nLCB0bzogc3RyaW5nID0gJ0hFQUQnKTogUHJvbWlzZTxDb21taXRGcm9tR2l0TG9nW10+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAvKiogTGlzdCBvZiBwYXJzZWQgY29tbWl0IG9iamVjdHMuICovXG4gICAgY29uc3QgY29tbWl0czogQ29tbWl0RnJvbUdpdExvZ1tdID0gW107XG4gICAgLyoqIFN0cmVhbSBvZiByYXcgZ2l0IGNvbW1pdCBzdHJpbmdzIGluIHRoZSByYW5nZSBwcm92aWRlZC4gKi9cbiAgICBjb25zdCBjb21taXRTdHJlYW0gPSBnaXRDb21taXRzKHtmcm9tLCB0bywgZm9ybWF0OiBnaXRMb2dGb3JtYXRGb3JQYXJzaW5nfSk7XG5cbiAgICAvLyBBY2N1bXVsYXRlIHRoZSBwYXJzZWQgY29tbWl0cyBmb3IgZWFjaCBjb21taXQgZnJvbSB0aGUgUmVhZGFibGUgc3RyZWFtIGludG8gYW4gYXJyYXksIHRoZW5cbiAgICAvLyByZXNvbHZlIHRoZSBwcm9taXNlIHdpdGggdGhlIGFycmF5IHdoZW4gdGhlIFJlYWRhYmxlIHN0cmVhbSBlbmRzLlxuICAgIGNvbW1pdFN0cmVhbS5vbignZGF0YScsIChjb21taXQ6IEJ1ZmZlcikgPT4gY29tbWl0cy5wdXNoKHBhcnNlQ29tbWl0RnJvbUdpdExvZyhjb21taXQpKSk7XG4gICAgY29tbWl0U3RyZWFtLm9uKCdlcnJvcicsIChlcnI6IEVycm9yKSA9PiByZWplY3QoZXJyKSk7XG4gICAgY29tbWl0U3RyZWFtLm9uKCdlbmQnLCAoKSA9PiByZXNvbHZlKGNvbW1pdHMpKTtcbiAgfSk7XG59XG4iXX0=