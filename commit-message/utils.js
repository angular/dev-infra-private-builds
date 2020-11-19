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
        define("@angular/dev-infra-private/commit-message/utils", ["require", "exports", "@angular/dev-infra-private/utils/shelljs", "@angular/dev-infra-private/commit-message/parse"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseCommitMessagesForRange = void 0;
    var shelljs_1 = require("@angular/dev-infra-private/utils/shelljs");
    var parse_1 = require("@angular/dev-infra-private/commit-message/parse");
    /** Retrieve and parse each commit message in a provide range. */
    function parseCommitMessagesForRange(range) {
        /** A random number used as a split point in the git log result. */
        var randomValueSeparator = "" + Math.random();
        /**
         * Custom git log format that provides the commit header and body, separated as expected with the
         * custom separator as the trailing value.
         */
        var gitLogFormat = "%s%n%n%b" + randomValueSeparator;
        // Retrieve the commits in the provided range.
        var result = shelljs_1.exec("git log --reverse --format=" + gitLogFormat + " " + range);
        if (result.code) {
            throw new Error("Failed to get all commits in the range:\n  " + result.stderr);
        }
        return result
            // Separate the commits from a single string into individual commits.
            .split(randomValueSeparator)
            // Remove extra space before and after each commit message.
            .map(function (l) { return l.trim(); })
            // Remove any superfluous lines which remain from the split.
            .filter(function (line) { return !!line; })
            // Parse each commit message.
            .map(function (commit) { return parse_1.parseCommitMessage(commit); });
    }
    exports.parseCommitMessagesForRange = parseCommitMessagesForRange;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsb0VBQXNDO0lBRXRDLHlFQUFnRTtJQUVoRSxpRUFBaUU7SUFDakUsU0FBZ0IsMkJBQTJCLENBQUMsS0FBYTtRQUN2RCxtRUFBbUU7UUFDbkUsSUFBTSxvQkFBb0IsR0FBRyxLQUFHLElBQUksQ0FBQyxNQUFNLEVBQUksQ0FBQztRQUNoRDs7O1dBR0c7UUFDSCxJQUFNLFlBQVksR0FBRyxhQUFXLG9CQUFzQixDQUFDO1FBRXZELDhDQUE4QztRQUM5QyxJQUFNLE1BQU0sR0FBRyxjQUFJLENBQUMsZ0NBQThCLFlBQVksU0FBSSxLQUFPLENBQUMsQ0FBQztRQUMzRSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDZixNQUFNLElBQUksS0FBSyxDQUFDLGdEQUE4QyxNQUFNLENBQUMsTUFBUSxDQUFDLENBQUM7U0FDaEY7UUFFRCxPQUFPLE1BQU07WUFDVCxxRUFBcUU7YUFDcEUsS0FBSyxDQUFDLG9CQUFvQixDQUFDO1lBQzVCLDJEQUEyRDthQUMxRCxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQVIsQ0FBUSxDQUFDO1lBQ25CLDREQUE0RDthQUMzRCxNQUFNLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxFQUFOLENBQU0sQ0FBQztZQUN2Qiw2QkFBNkI7YUFDNUIsR0FBRyxDQUFDLFVBQUEsTUFBTSxJQUFJLE9BQUEsMEJBQWtCLENBQUMsTUFBTSxDQUFDLEVBQTFCLENBQTBCLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBeEJELGtFQXdCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2V4ZWN9IGZyb20gJy4uL3V0aWxzL3NoZWxsanMnO1xuXG5pbXBvcnQge3BhcnNlQ29tbWl0TWVzc2FnZSwgUGFyc2VkQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi9wYXJzZSc7XG5cbi8qKiBSZXRyaWV2ZSBhbmQgcGFyc2UgZWFjaCBjb21taXQgbWVzc2FnZSBpbiBhIHByb3ZpZGUgcmFuZ2UuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDb21taXRNZXNzYWdlc0ZvclJhbmdlKHJhbmdlOiBzdHJpbmcpOiBQYXJzZWRDb21taXRNZXNzYWdlW10ge1xuICAvKiogQSByYW5kb20gbnVtYmVyIHVzZWQgYXMgYSBzcGxpdCBwb2ludCBpbiB0aGUgZ2l0IGxvZyByZXN1bHQuICovXG4gIGNvbnN0IHJhbmRvbVZhbHVlU2VwYXJhdG9yID0gYCR7TWF0aC5yYW5kb20oKX1gO1xuICAvKipcbiAgICogQ3VzdG9tIGdpdCBsb2cgZm9ybWF0IHRoYXQgcHJvdmlkZXMgdGhlIGNvbW1pdCBoZWFkZXIgYW5kIGJvZHksIHNlcGFyYXRlZCBhcyBleHBlY3RlZCB3aXRoIHRoZVxuICAgKiBjdXN0b20gc2VwYXJhdG9yIGFzIHRoZSB0cmFpbGluZyB2YWx1ZS5cbiAgICovXG4gIGNvbnN0IGdpdExvZ0Zvcm1hdCA9IGAlcyVuJW4lYiR7cmFuZG9tVmFsdWVTZXBhcmF0b3J9YDtcblxuICAvLyBSZXRyaWV2ZSB0aGUgY29tbWl0cyBpbiB0aGUgcHJvdmlkZWQgcmFuZ2UuXG4gIGNvbnN0IHJlc3VsdCA9IGV4ZWMoYGdpdCBsb2cgLS1yZXZlcnNlIC0tZm9ybWF0PSR7Z2l0TG9nRm9ybWF0fSAke3JhbmdlfWApO1xuICBpZiAocmVzdWx0LmNvZGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBnZXQgYWxsIGNvbW1pdHMgaW4gdGhlIHJhbmdlOlxcbiAgJHtyZXN1bHQuc3RkZXJyfWApO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxuICAgICAgLy8gU2VwYXJhdGUgdGhlIGNvbW1pdHMgZnJvbSBhIHNpbmdsZSBzdHJpbmcgaW50byBpbmRpdmlkdWFsIGNvbW1pdHMuXG4gICAgICAuc3BsaXQocmFuZG9tVmFsdWVTZXBhcmF0b3IpXG4gICAgICAvLyBSZW1vdmUgZXh0cmEgc3BhY2UgYmVmb3JlIGFuZCBhZnRlciBlYWNoIGNvbW1pdCBtZXNzYWdlLlxuICAgICAgLm1hcChsID0+IGwudHJpbSgpKVxuICAgICAgLy8gUmVtb3ZlIGFueSBzdXBlcmZsdW91cyBsaW5lcyB3aGljaCByZW1haW4gZnJvbSB0aGUgc3BsaXQuXG4gICAgICAuZmlsdGVyKGxpbmUgPT4gISFsaW5lKVxuICAgICAgLy8gUGFyc2UgZWFjaCBjb21taXQgbWVzc2FnZS5cbiAgICAgIC5tYXAoY29tbWl0ID0+IHBhcnNlQ29tbWl0TWVzc2FnZShjb21taXQpKTtcbn1cbiJdfQ==