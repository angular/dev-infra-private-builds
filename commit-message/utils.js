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
            commitStream.on('data', function (commit) { return commits.push(parse_1.parseCommitFromGitLog(commit)); });
            commitStream.on('error', function (err) { return reject(err); });
            commitStream.on('end', function () { return resolve(commits); });
        });
    }
    exports.getCommitsInRange = getCommitsInRange;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsNkNBQStDO0lBRS9DLHlFQUF3RjtJQUV4RixzRkFBc0Y7SUFDdEYsSUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDO0lBRy9COztPQUVHO0lBQ0gsU0FBZ0IsaUJBQWlCLENBQUMsSUFBWSxFQUFFLEVBQW1CO1FBQW5CLG1CQUFBLEVBQUEsV0FBbUI7UUFDakUsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNO1lBQ2pDLHFDQUFxQztZQUNyQyxJQUFNLE9BQU8sR0FBdUIsRUFBRSxDQUFDO1lBQ3ZDLDhEQUE4RDtZQUM5RCxJQUFNLFlBQVksR0FBRyxVQUFVLENBQUMsRUFBQyxJQUFJLE1BQUEsRUFBRSxFQUFFLElBQUEsRUFBRSxNQUFNLEVBQUUsOEJBQXNCLEVBQUMsQ0FBQyxDQUFDO1lBRTVFLDZGQUE2RjtZQUM3RixvRUFBb0U7WUFDcEUsWUFBWSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBQyxNQUFjLElBQUssT0FBQSxPQUFPLENBQUMsSUFBSSxDQUFDLDZCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQTNDLENBQTJDLENBQUMsQ0FBQztZQUN6RixZQUFZLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFDLEdBQVUsSUFBSyxPQUFBLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBWCxDQUFXLENBQUMsQ0FBQztZQUN0RCxZQUFZLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxjQUFNLE9BQUEsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFoQixDQUFnQixDQUFDLENBQUM7UUFDakQsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBYkQsOENBYUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIGdpdENvbW1pdHNfIGZyb20gJ2dpdC1yYXctY29tbWl0cyc7XG5cbmltcG9ydCB7Q29tbWl0RnJvbUdpdExvZywgZ2l0TG9nRm9ybWF0Rm9yUGFyc2luZywgcGFyc2VDb21taXRGcm9tR2l0TG9nfSBmcm9tICcuL3BhcnNlJztcblxuLy8gU2V0IGBnaXRDb21taXRzYCBhcyB0aGlzIGltcG9ydGVkIHZhbHVlIHRvIGFkZHJlc3MgXCJDYW5ub3QgY2FsbCBhIG5hbWVzcGFjZVwiIGVycm9yLlxuY29uc3QgZ2l0Q29tbWl0cyA9IGdpdENvbW1pdHNfO1xuXG5cbi8qKlxuICogRmluZCBhbGwgY29tbWl0cyB3aXRoaW4gdGhlIGdpdmVuIHJhbmdlIGFuZCByZXR1cm4gYW4gb2JqZWN0IGRlc2NyaWJpbmcgdGhvc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb21taXRzSW5SYW5nZShmcm9tOiBzdHJpbmcsIHRvOiBzdHJpbmcgPSAnSEVBRCcpOiBQcm9taXNlPENvbW1pdEZyb21HaXRMb2dbXT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIC8qKiBMaXN0IG9mIHBhcnNlZCBjb21taXQgb2JqZWN0cy4gKi9cbiAgICBjb25zdCBjb21taXRzOiBDb21taXRGcm9tR2l0TG9nW10gPSBbXTtcbiAgICAvKiogU3RyZWFtIG9mIHJhdyBnaXQgY29tbWl0IHN0cmluZ3MgaW4gdGhlIHJhbmdlIHByb3ZpZGVkLiAqL1xuICAgIGNvbnN0IGNvbW1pdFN0cmVhbSA9IGdpdENvbW1pdHMoe2Zyb20sIHRvLCBmb3JtYXQ6IGdpdExvZ0Zvcm1hdEZvclBhcnNpbmd9KTtcblxuICAgIC8vIEFjY3VtdWxhdGUgdGhlIHBhcnNlZCBjb21taXRzIGZvciBlYWNoIGNvbW1pdCBmcm9tIHRoZSBSZWFkYWJsZSBzdHJlYW0gaW50byBhbiBhcnJheSwgdGhlblxuICAgIC8vIHJlc29sdmUgdGhlIHByb21pc2Ugd2l0aCB0aGUgYXJyYXkgd2hlbiB0aGUgUmVhZGFibGUgc3RyZWFtIGVuZHMuXG4gICAgY29tbWl0U3RyZWFtLm9uKCdkYXRhJywgKGNvbW1pdDogQnVmZmVyKSA9PiBjb21taXRzLnB1c2gocGFyc2VDb21taXRGcm9tR2l0TG9nKGNvbW1pdCkpKTtcbiAgICBjb21taXRTdHJlYW0ub24oJ2Vycm9yJywgKGVycjogRXJyb3IpID0+IHJlamVjdChlcnIpKTtcbiAgICBjb21taXRTdHJlYW0ub24oJ2VuZCcsICgpID0+IHJlc29sdmUoY29tbWl0cykpO1xuICB9KTtcbn1cbiJdfQ==