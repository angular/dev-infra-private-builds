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
        define("@angular/dev-infra-private/commit-message/parse", ["require", "exports", "conventional-commits-parser", "@angular/dev-infra-private/utils/shelljs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseCommitMessagesForRange = exports.parseCommitMessage = void 0;
    var conventional_commits_parser_1 = require("conventional-commits-parser");
    var shelljs_1 = require("@angular/dev-infra-private/utils/shelljs");
    /** Markers used to denote the start of a note section in a commit. */
    var NoteSections;
    (function (NoteSections) {
        NoteSections["BREAKING_CHANGE"] = "BREAKING CHANGE";
        NoteSections["DEPRECATED"] = "DEPRECATED";
    })(NoteSections || (NoteSections = {}));
    /** Regex determining if a commit is a fixup. */
    var FIXUP_PREFIX_RE = /^fixup! /i;
    /** Regex determining if a commit is a squash. */
    var SQUASH_PREFIX_RE = /^squash! /i;
    /** Regex determining if a commit is a revert. */
    var REVERT_PREFIX_RE = /^revert:? /i;
    /**
     * Regex pattern for parsing the header line of a commit.
     *
     * Several groups are being matched to be used in the parsed commit object, being mapped to the
     * `headerCorrespondence` object.
     *
     * The pattern can be broken down into component parts:
     * - `(\w+)` - a capturing group discovering the type of the commit.
     * - `(?:\((?:([^/]+)\/)?([^)]+)\))?` - a pair of capturing groups to capture the scope and,
     * optionally the npmScope of the commit.
     * - `(.*)` - a capturing group discovering the subject of the commit.
     */
    var headerPattern = /^(\w+)(?:\((?:([^/]+)\/)?([^)]+)\))?: (.*)$/;
    /**
     * The property names used for the values extracted from the header via the `headerPattern` regex.
     */
    var headerCorrespondence = ['type', 'npmScope', 'scope', 'subject'];
    /**
     * Configuration options for the commit parser.
     *
     * NOTE: An extended type from `Options` must be used because the current
     * @types/conventional-commits-parser version does not include the `notesPattern` field.
     */
    var parseOptions = {
        commentChar: '#',
        headerPattern: headerPattern,
        headerCorrespondence: headerCorrespondence,
        noteKeywords: [NoteSections.BREAKING_CHANGE, NoteSections.DEPRECATED],
        notesPattern: function (keywords) { return new RegExp("(" + keywords + ")(?:: ?)(.*)"); },
    };
    /** Parse a full commit message into its composite parts. */
    function parseCommitMessage(fullText) {
        /** The commit message text with the fixup and squash markers stripped out. */
        var strippedCommitMsg = fullText.replace(FIXUP_PREFIX_RE, '')
            .replace(SQUASH_PREFIX_RE, '')
            .replace(REVERT_PREFIX_RE, '');
        /** The initially parsed commit. */
        var commit = conventional_commits_parser_1.sync(strippedCommitMsg, parseOptions);
        /** A list of breaking change notes from the commit. */
        var breakingChanges = [];
        /** A list of deprecation notes from the commit. */
        var deprecations = [];
        // Extract the commit message notes by marked types into their respective lists.
        commit.notes.forEach(function (note) {
            if (note.title === NoteSections.BREAKING_CHANGE) {
                return breakingChanges.push(note);
            }
            if (note.title === NoteSections.DEPRECATED) {
                return deprecations.push(note);
            }
        });
        return {
            fullText: fullText,
            breakingChanges: breakingChanges,
            deprecations: deprecations,
            body: commit.body || '',
            footer: commit.footer || '',
            header: commit.header || '',
            references: commit.references,
            scope: commit.scope || '',
            subject: commit.subject || '',
            type: commit.type || '',
            npmScope: commit.npmScope || '',
            isFixup: FIXUP_PREFIX_RE.test(fullText),
            isSquash: SQUASH_PREFIX_RE.test(fullText),
            isRevert: REVERT_PREFIX_RE.test(fullText),
        };
    }
    exports.parseCommitMessage = parseCommitMessage;
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
            .map(function (commit) { return parseCommitMessage(commit); });
    }
    exports.parseCommitMessagesForRange = parseCommitMessagesForRange;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvcGFyc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsMkVBQTJGO0lBRTNGLG9FQUFzQztJQW1DdEMsc0VBQXNFO0lBQ3RFLElBQUssWUFHSjtJQUhELFdBQUssWUFBWTtRQUNmLG1EQUFtQyxDQUFBO1FBQ25DLHlDQUF5QixDQUFBO0lBQzNCLENBQUMsRUFISSxZQUFZLEtBQVosWUFBWSxRQUdoQjtJQUNELGdEQUFnRDtJQUNoRCxJQUFNLGVBQWUsR0FBRyxXQUFXLENBQUM7SUFDcEMsaURBQWlEO0lBQ2pELElBQU0sZ0JBQWdCLEdBQUcsWUFBWSxDQUFDO0lBQ3RDLGlEQUFpRDtJQUNqRCxJQUFNLGdCQUFnQixHQUFHLGFBQWEsQ0FBQztJQUN2Qzs7Ozs7Ozs7Ozs7T0FXRztJQUNILElBQU0sYUFBYSxHQUFHLDZDQUE2QyxDQUFDO0lBQ3BFOztPQUVHO0lBQ0gsSUFBTSxvQkFBb0IsR0FBRyxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3RFOzs7OztPQUtHO0lBQ0gsSUFBTSxZQUFZLEdBQXlEO1FBQ3pFLFdBQVcsRUFBRSxHQUFHO1FBQ2hCLGFBQWEsZUFBQTtRQUNiLG9CQUFvQixzQkFBQTtRQUNwQixZQUFZLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLFlBQVksQ0FBQyxVQUFVLENBQUM7UUFDckUsWUFBWSxFQUFFLFVBQUMsUUFBZ0IsSUFBSyxPQUFBLElBQUksTUFBTSxDQUFDLE1BQUksUUFBUSxpQkFBYyxDQUFDLEVBQXRDLENBQXNDO0tBQzNFLENBQUM7SUFHRiw0REFBNEQ7SUFDNUQsU0FBZ0Isa0JBQWtCLENBQUMsUUFBZ0I7UUFDakQsOEVBQThFO1FBQzlFLElBQU0saUJBQWlCLEdBQUcs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Ii8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbW1pdCBhcyBQYXJzZWRDb21taXQsIE9wdGlvbnMsIHN5bmMgYXMgcGFyc2V9IGZyb20gJ2NvbnZlbnRpb25hbC1jb21taXRzLXBhcnNlcic7XG5cbmltcG9ydCB7ZXhlY30gZnJvbSAnLi4vdXRpbHMvc2hlbGxqcyc7XG5cblxuLyoqIEEgcGFyc2VkIGNvbW1pdCwgY29udGFpbmluZyB0aGUgaW5mb3JtYXRpb24gbmVlZGVkIHRvIHZhbGlkYXRlIHRoZSBjb21taXQuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbW1pdCB7XG4gIC8qKiBUaGUgZnVsbCByYXcgdGV4dCBvZiB0aGUgY29tbWl0LiAqL1xuICBmdWxsVGV4dDogc3RyaW5nO1xuICAvKiogVGhlIGhlYWRlciBsaW5lIG9mIHRoZSBjb21taXQsIHdpbGwgYmUgdXNlZCBpbiB0aGUgY2hhbmdlbG9nIGVudHJpZXMuICovXG4gIGhlYWRlcjogc3RyaW5nO1xuICAvKiogVGhlIGZ1bGwgYm9keSBvZiB0aGUgY29tbWl0LCBub3QgaW5jbHVkaW5nIHRoZSBmb290ZXIuICovXG4gIGJvZHk6IHN0cmluZztcbiAgLyoqIFRoZSBmb290ZXIgb2YgdGhlIGNvbW1pdCwgY29udGFpbmluZyBpc3N1ZSByZWZlcmVuY2VzIGFuZCBub3RlIHNlY3Rpb25zLiAqL1xuICBmb290ZXI6IHN0cmluZztcbiAgLyoqIEEgbGlzdCBvZiB0aGUgcmVmZXJlbmNlcyB0byBvdGhlciBpc3N1ZXMgbWFkZSB0aHJvdWdob3V0IHRoZSBjb21taXQgbWVzc2FnZS4gKi9cbiAgcmVmZXJlbmNlczogUGFyc2VkQ29tbWl0LlJlZmVyZW5jZVtdO1xuICAvKiogVGhlIHR5cGUgb2YgdGhlIGNvbW1pdCBtZXNzYWdlLiAqL1xuICB0eXBlOiBzdHJpbmc7XG4gIC8qKiBUaGUgc2NvcGUgb2YgdGhlIGNvbW1pdCBtZXNzYWdlLiAqL1xuICBzY29wZTogc3RyaW5nO1xuICAvKiogVGhlIG5wbSBzY29wZSBvZiB0aGUgY29tbWl0IG1lc3NhZ2UuICovXG4gIG5wbVNjb3BlOiBzdHJpbmc7XG4gIC8qKiBUaGUgc3ViamVjdCBvZiB0aGUgY29tbWl0IG1lc3NhZ2UuICovXG4gIHN1YmplY3Q6IHN0cmluZztcbiAgLyoqIEEgbGlzdCBvZiBicmVha2luZyBjaGFuZ2Ugbm90ZXMgaW4gdGhlIGNvbW1pdCBtZXNzYWdlLiAqL1xuICBicmVha2luZ0NoYW5nZXM6IFBhcnNlZENvbW1pdC5Ob3RlW107XG4gIC8qKiBBIGxpc3Qgb2YgZGVwcmVjYXRpb24gbm90ZXMgaW4gdGhlIGNvbW1pdCBtZXNzYWdlLiAqL1xuICBkZXByZWNhdGlvbnM6IFBhcnNlZENvbW1pdC5Ob3RlW107XG4gIC8qKiBXaGV0aGVyIHRoZSBjb21taXQgaXMgYSBmaXh1cCBjb21taXQuICovXG4gIGlzRml4dXA6IGJvb2xlYW47XG4gIC8qKiBXaGV0aGVyIHRoZSBjb21taXQgaXMgYSBzcXVhc2ggY29tbWl0LiAqL1xuICBpc1NxdWFzaDogYm9vbGVhbjtcbiAgLyoqIFdoZXRoZXIgdGhlIGNvbW1pdCBpcyBhIHJldmVydCBjb21taXQuICovXG4gIGlzUmV2ZXJ0OiBib29sZWFuO1xufVxuXG4vKiogTWFya2VycyB1c2VkIHRvIGRlbm90ZSB0aGUgc3RhcnQgb2YgYSBub3RlIHNlY3Rpb24gaW4gYSBjb21taXQuICovXG5lbnVtIE5vdGVTZWN0aW9ucyB7XG4gIEJSRUFLSU5HX0NIQU5HRSA9ICdCUkVBS0lORyBDSEFOR0UnLFxuICBERVBSRUNBVEVEID0gJ0RFUFJFQ0FURUQnLFxufVxuLyoqIFJlZ2V4IGRldGVybWluaW5nIGlmIGEgY29tbWl0IGlzIGEgZml4dXAuICovXG5jb25zdCBGSVhVUF9QUkVGSVhfUkUgPSAvXmZpeHVwISAvaTtcbi8qKiBSZWdleCBkZXRlcm1pbmluZyBpZiBhIGNvbW1pdCBpcyBhIHNxdWFzaC4gKi9cbmNvbnN0IFNRVUFTSF9QUkVGSVhfUkUgPSAvXnNxdWFzaCEgL2k7XG4vKiogUmVnZXggZGV0ZXJtaW5pbmcgaWYgYSBjb21taXQgaXMgYSByZXZlcnQuICovXG5jb25zdCBSRVZFUlRfUFJFRklYX1JFID0gL15yZXZlcnQ6PyAvaTtcbi8qKlxuICogUmVnZXggcGF0dGVybiBmb3IgcGFyc2luZyB0aGUgaGVhZGVyIGxpbmUgb2YgYSBjb21taXQuXG4gKlxuICogU2V2ZXJhbCBncm91cHMgYXJlIGJlaW5nIG1hdGNoZWQgdG8gYmUgdXNlZCBpbiB0aGUgcGFyc2VkIGNvbW1pdCBvYmplY3QsIGJlaW5nIG1hcHBlZCB0byB0aGVcbiAqIGBoZWFkZXJDb3JyZXNwb25kZW5jZWAgb2JqZWN0LlxuICpcbiAqIFRoZSBwYXR0ZXJuIGNhbiBiZSBicm9rZW4gZG93biBpbnRvIGNvbXBvbmVudCBwYXJ0czpcbiAqIC0gYChcXHcrKWAgLSBhIGNhcHR1cmluZyBncm91cCBkaXNjb3ZlcmluZyB0aGUgdHlwZSBvZiB0aGUgY29tbWl0LlxuICogLSBgKD86XFwoKD86KFteL10rKVxcLyk/KFteKV0rKVxcKSk/YCAtIGEgcGFpciBvZiBjYXB0dXJpbmcgZ3JvdXBzIHRvIGNhcHR1cmUgdGhlIHNjb3BlIGFuZCxcbiAqIG9wdGlvbmFsbHkgdGhlIG5wbVNjb3BlIG9mIHRoZSBjb21taXQuXG4gKiAtIGAoLiopYCAtIGEgY2FwdHVyaW5nIGdyb3VwIGRpc2NvdmVyaW5nIHRoZSBzdWJqZWN0IG9mIHRoZSBjb21taXQuXG4gKi9cbmNvbnN0IGhlYWRlclBhdHRlcm4gPSAvXihcXHcrKSg/OlxcKCg/OihbXi9dKylcXC8pPyhbXildKylcXCkpPzogKC4qKSQvO1xuLyoqXG4gKiBUaGUgcHJvcGVydHkgbmFtZXMgdXNlZCBmb3IgdGhlIHZhbHVlcyBleHRyYWN0ZWQgZnJvbSB0aGUgaGVhZGVyIHZpYSB0aGUgYGhlYWRlclBhdHRlcm5gIHJlZ2V4LlxuICovXG5jb25zdCBoZWFkZXJDb3JyZXNwb25kZW5jZSA9IFsndHlwZScsICducG1TY29wZScsICdzY29wZScsICdzdWJqZWN0J107XG4vKipcbiAqIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBmb3IgdGhlIGNvbW1pdCBwYXJzZXIuXG4gKlxuICogTk9URTogQW4gZXh0ZW5kZWQgdHlwZSBmcm9tIGBPcHRpb25zYCBtdXN0IGJlIHVzZWQgYmVjYXVzZSB0aGUgY3VycmVudFxuICogQHR5cGVzL2NvbnZlbnRpb25hbC1jb21taXRzLXBhcnNlciB2ZXJzaW9uIGRvZXMgbm90IGluY2x1ZGUgdGhlIGBub3Rlc1BhdHRlcm5gIGZpZWxkLlxuICovXG5jb25zdCBwYXJzZU9wdGlvbnM6IE9wdGlvbnMme25vdGVzUGF0dGVybjogKGtleXdvcmRzOiBzdHJpbmcpID0+IFJlZ0V4cH0gPSB7XG4gIGNvbW1lbnRDaGFyOiAnIycsXG4gIGhlYWRlclBhdHRlcm4sXG4gIGhlYWRlckNvcnJlc3BvbmRlbmNlLFxuICBub3RlS2V5d29yZHM6IFtOb3RlU2VjdGlvbnMuQlJFQUtJTkdfQ0hBTkdFLCBOb3RlU2VjdGlvbnMuREVQUkVDQVRFRF0sXG4gIG5vdGVzUGF0dGVybjogKGtleXdvcmRzOiBzdHJpbmcpID0+IG5ldyBSZWdFeHAoYCgke2tleXdvcmRzfSkoPzo6ID8pKC4qKWApLFxufTtcblxuXG4vKiogUGFyc2UgYSBmdWxsIGNvbW1pdCBtZXNzYWdlIGludG8gaXRzIGNvbXBvc2l0ZSBwYXJ0cy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUNvbW1pdE1lc3NhZ2UoZnVsbFRleHQ6IHN0cmluZyk6IENvbW1pdCB7XG4gIC8qKiBUaGUgY29tbWl0IG1lc3NhZ2UgdGV4dCB3aXRoIHRoZSBmaXh1cCBhbmQgc3F1YXNoIG1hcmtlcnMgc3RyaXBwZWQgb3V0LiAqL1xuICBjb25zdCBzdHJpcHBlZENvbW1pdE1zZyA9IGZ1bGxUZXh0LnJlcGxhY2UoRklYVVBfUFJFRklYX1JFLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoU1FVQVNIX1BSRUZJWF9SRSwgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKFJFVkVSVF9QUkVGSVhfUkUsICcnKTtcbiAgLyoqIFRoZSBpbml0aWFsbHkgcGFyc2VkIGNvbW1pdC4gKi9cbiAgY29uc3QgY29tbWl0ID0gcGFyc2Uoc3RyaXBwZWRDb21taXRNc2csIHBhcnNlT3B0aW9ucyk7XG4gIC8qKiBBIGxpc3Qgb2YgYnJlYWtpbmcgY2hhbmdlIG5vdGVzIGZyb20gdGhlIGNvbW1pdC4gKi9cbiAgY29uc3QgYnJlYWtpbmdDaGFuZ2VzOiBQYXJzZWRDb21taXQuTm90ZVtdID0gW107XG4gIC8qKiBBIGxpc3Qgb2YgZGVwcmVjYXRpb24gbm90ZXMgZnJvbSB0aGUgY29tbWl0LiAqL1xuICBjb25zdCBkZXByZWNhdGlvbnM6IFBhcnNlZENvbW1pdC5Ob3RlW10gPSBbXTtcblxuICAvLyBFeHRyYWN0IHRoZSBjb21taXQgbWVzc2FnZSBub3RlcyBieSBtYXJrZWQgdHlwZXMgaW50byB0aGVpciByZXNwZWN0aXZlIGxpc3RzLlxuICBjb21taXQubm90ZXMuZm9yRWFjaCgobm90ZTogUGFyc2VkQ29tbWl0Lk5vdGUpID0+IHtcbiAgICBpZiAobm90ZS50aXRsZSA9PT0gTm90ZVNlY3Rpb25zLkJSRUFLSU5HX0NIQU5HRSkge1xuICAgICAgcmV0dXJuIGJyZWFraW5nQ2hhbmdlcy5wdXNoKG5vdGUpO1xuICAgIH1cbiAgICBpZiAobm90ZS50aXRsZSA9PT0gTm90ZVNlY3Rpb25zLkRFUFJFQ0FURUQpIHtcbiAgICAgIHJldHVybiBkZXByZWNhdGlvbnMucHVzaChub3RlKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgZnVsbFRleHQsXG4gICAgYnJlYWtpbmdDaGFuZ2VzLFxuICAgIGRlcHJlY2F0aW9ucyxcbiAgICBib2R5OiBjb21taXQuYm9keSB8fCAnJyxcbiAgICBmb290ZXI6IGNvbW1pdC5mb290ZXIgfHwgJycsXG4gICAgaGVhZGVyOiBjb21taXQuaGVhZGVyIHx8ICcnLFxuICAgIHJlZmVyZW5jZXM6IGNvbW1pdC5yZWZlcmVuY2VzLFxuICAgIHNjb3BlOiBjb21taXQuc2NvcGUgfHwgJycsXG4gICAgc3ViamVjdDogY29tbWl0LnN1YmplY3QgfHwgJycsXG4gICAgdHlwZTogY29tbWl0LnR5cGUgfHwgJycsXG4gICAgbnBtU2NvcGU6IGNvbW1pdC5ucG1TY29wZSB8fCAnJyxcbiAgICBpc0ZpeHVwOiBGSVhVUF9QUkVGSVhfUkUudGVzdChmdWxsVGV4dCksXG4gICAgaXNTcXVhc2g6IFNRVUFTSF9QUkVGSVhfUkUudGVzdChmdWxsVGV4dCksXG4gICAgaXNSZXZlcnQ6IFJFVkVSVF9QUkVGSVhfUkUudGVzdChmdWxsVGV4dCksXG4gIH07XG59XG5cbi8qKiBSZXRyaWV2ZSBhbmQgcGFyc2UgZWFjaCBjb21taXQgbWVzc2FnZSBpbiBhIHByb3ZpZGUgcmFuZ2UuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDb21taXRNZXNzYWdlc0ZvclJhbmdlKHJhbmdlOiBzdHJpbmcpOiBDb21taXRbXSB7XG4gIC8qKiBBIHJhbmRvbSBudW1iZXIgdXNlZCBhcyBhIHNwbGl0IHBvaW50IGluIHRoZSBnaXQgbG9nIHJlc3VsdC4gKi9cbiAgY29uc3QgcmFuZG9tVmFsdWVTZXBhcmF0b3IgPSBgJHtNYXRoLnJhbmRvbSgpfWA7XG4gIC8qKlxuICAgKiBDdXN0b20gZ2l0IGxvZyBmb3JtYXQgdGhhdCBwcm92aWRlcyB0aGUgY29tbWl0IGhlYWRlciBhbmQgYm9keSwgc2VwYXJhdGVkIGFzIGV4cGVjdGVkIHdpdGggdGhlXG4gICAqIGN1c3RvbSBzZXBhcmF0b3IgYXMgdGhlIHRyYWlsaW5nIHZhbHVlLlxuICAgKi9cbiAgY29uc3QgZ2l0TG9nRm9ybWF0ID0gYCVzJW4lbiViJHtyYW5kb21WYWx1ZVNlcGFyYXRvcn1gO1xuXG4gIC8vIFJldHJpZXZlIHRoZSBjb21taXRzIGluIHRoZSBwcm92aWRlZCByYW5nZS5cbiAgY29uc3QgcmVzdWx0ID0gZXhlYyhgZ2l0IGxvZyAtLXJldmVyc2UgLS1mb3JtYXQ9JHtnaXRMb2dGb3JtYXR9ICR7cmFuZ2V9YCk7XG4gIGlmIChyZXN1bHQuY29kZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGdldCBhbGwgY29tbWl0cyBpbiB0aGUgcmFuZ2U6XFxuICAke3Jlc3VsdC5zdGRlcnJ9YCk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG4gICAgICAvLyBTZXBhcmF0ZSB0aGUgY29tbWl0cyBmcm9tIGEgc2luZ2xlIHN0cmluZyBpbnRvIGluZGl2aWR1YWwgY29tbWl0cy5cbiAgICAgIC5zcGxpdChyYW5kb21WYWx1ZVNlcGFyYXRvcilcbiAgICAgIC8vIFJlbW92ZSBleHRyYSBzcGFjZSBiZWZvcmUgYW5kIGFmdGVyIGVhY2ggY29tbWl0IG1lc3NhZ2UuXG4gICAgICAubWFwKGwgPT4gbC50cmltKCkpXG4gICAgICAvLyBSZW1vdmUgYW55IHN1cGVyZmx1b3VzIGxpbmVzIHdoaWNoIHJlbWFpbiBmcm9tIHRoZSBzcGxpdC5cbiAgICAgIC5maWx0ZXIobGluZSA9PiAhIWxpbmUpXG4gICAgICAvLyBQYXJzZSBlYWNoIGNvbW1pdCBtZXNzYWdlLlxuICAgICAgLm1hcChjb21taXQgPT4gcGFyc2VDb21taXRNZXNzYWdlKGNvbW1pdCkpO1xufVxuIl19