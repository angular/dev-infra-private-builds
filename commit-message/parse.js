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
        define("@angular/dev-infra-private/commit-message/parse", ["require", "exports", "tslib", "conventional-commits-parser"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseCommitFromGitLog = exports.parseCommitMessage = exports.gitLogFormatForParsing = exports.commitFieldsAsFormat = void 0;
    var tslib_1 = require("tslib");
    var conventional_commits_parser_1 = require("conventional-commits-parser");
    /**
     * A list of tuples expressing the fields to extract from each commit log entry. The tuple contains
     * two values, the first is the key for the property and the second is the template shortcut for the
     * git log command.
     */
    var commitFields = {
        hash: '%H',
        shortHash: '%h',
        author: '%aN',
    };
    /** The commit fields described as git log format entries for parsing. */
    var commitFieldsAsFormat = function (fields) {
        return Object.entries(fields).map(function (_a) {
            var _b = tslib_1.__read(_a, 2), key = _b[0], value = _b[1];
            return "%n-" + key + "-%n" + value;
        }).join('');
    };
    exports.commitFieldsAsFormat = commitFieldsAsFormat;
    /**
     * The git log format template to create git log entries for parsing.
     *
     * The conventional commits parser expects to parse the standard git log raw body (%B) into its
     * component parts. Additionally it will parse additional fields with keys defined by
     * `-{key name}-` separated by new lines.
     * */
    exports.gitLogFormatForParsing = "%B" + exports.commitFieldsAsFormat(commitFields);
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
        notesPattern: function (keywords) { return new RegExp("^s*(" + keywords + "): ?(.*)"); },
    };
    /** Parse a commit message into its composite parts. */
    exports.parseCommitMessage = parseInternal;
    /** Parse a commit message from a git log entry into its composite parts. */
    exports.parseCommitFromGitLog = parseInternal;
    function parseInternal(fullText) {
        // Ensure the fullText symbol is a `string`, even if a Buffer was provided.
        fullText = fullText.toString();
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
            author: commit.author || undefined,
            hash: commit.hash || undefined,
            shortHash: commit.shortHash || undefined,
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvcGFyc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDJFQUEyRjtJQTBDM0Y7Ozs7T0FJRztJQUNILElBQU0sWUFBWSxHQUFHO1FBQ25CLElBQUksRUFBRSxJQUFJO1FBQ1YsU0FBUyxFQUFFLElBQUk7UUFDZixNQUFNLEVBQUUsS0FBSztLQUNkLENBQUM7SUFHRix5RUFBeUU7SUFDbEUsSUFBTSxvQkFBb0IsR0FBRyxVQUFDLE1BQW9CO1FBQ3ZELE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQyxFQUFZO2dCQUFaLEtBQUEscUJBQVksRUFBWCxHQUFHLFFBQUEsRUFBRSxLQUFLLFFBQUE7WUFBTSxPQUFBLFFBQU0sR0FBRyxXQUFNLEtBQU87UUFBdEIsQ0FBc0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN2RixDQUFDLENBQUM7SUFGVyxRQUFBLG9CQUFvQix3QkFFL0I7SUFDRjs7Ozs7O1NBTUs7SUFDUSxRQUFBLHNCQUFzQixHQUFHLE9BQUssNEJBQW9CLENBQUMsWUFBWSxDQUFHLENBQUM7SUFDaEYsc0VBQXNFO0lBQ3RFLElBQUssWUFHSjtJQUhELFdBQUssWUFBWTtRQUNmLG1EQUFtQyxDQUFBO1FBQ25DLHlDQUF5QixDQUFBO0lBQzNCLENBQUMsRUFISSxZQUFZLEtBQVosWUFBWSxRQUdoQjtJQUNELGdEQUFnRDtJQUNoRCxJQUFNLGVBQWUsR0FBRyxXQUFXLENBQUM7SUFDcEMsaURBQWlEO0lBQ2pELElBQU0sZ0JBQWdCLEdBQUcsWUFBWSxDQUFDO0lBQ3RDLGlEQUFpRDtJQUNqRCxJQUFNLGdCQUFnQixHQUFHLGFBQWEsQ0FBQztJQUN2Qzs7Ozs7Ozs7Ozs7T0FXRztJQUNI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c291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tbWl0IGFzIFBhcnNlZENvbW1pdCwgT3B0aW9ucywgc3luYyBhcyBwYXJzZX0gZnJvbSAnY29udmVudGlvbmFsLWNvbW1pdHMtcGFyc2VyJztcblxuXG4vKiogQSBwYXJzZWQgY29tbWl0LCBjb250YWluaW5nIHRoZSBpbmZvcm1hdGlvbiBuZWVkZWQgdG8gdmFsaWRhdGUgdGhlIGNvbW1pdC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0IHtcbiAgLyoqIFRoZSBmdWxsIHJhdyB0ZXh0IG9mIHRoZSBjb21taXQuICovXG4gIGZ1bGxUZXh0OiBzdHJpbmc7XG4gIC8qKiBUaGUgaGVhZGVyIGxpbmUgb2YgdGhlIGNvbW1pdCwgd2lsbCBiZSB1c2VkIGluIHRoZSBjaGFuZ2Vsb2cgZW50cmllcy4gKi9cbiAgaGVhZGVyOiBzdHJpbmc7XG4gIC8qKiBUaGUgZnVsbCBib2R5IG9mIHRoZSBjb21taXQsIG5vdCBpbmNsdWRpbmcgdGhlIGZvb3Rlci4gKi9cbiAgYm9keTogc3RyaW5nO1xuICAvKiogVGhlIGZvb3RlciBvZiB0aGUgY29tbWl0LCBjb250YWluaW5nIGlzc3VlIHJlZmVyZW5jZXMgYW5kIG5vdGUgc2VjdGlvbnMuICovXG4gIGZvb3Rlcjogc3RyaW5nO1xuICAvKiogQSBsaXN0IG9mIHRoZSByZWZlcmVuY2VzIHRvIG90aGVyIGlzc3VlcyBtYWRlIHRocm91Z2hvdXQgdGhlIGNvbW1pdCBtZXNzYWdlLiAqL1xuICByZWZlcmVuY2VzOiBQYXJzZWRDb21taXQuUmVmZXJlbmNlW107XG4gIC8qKiBUaGUgdHlwZSBvZiB0aGUgY29tbWl0IG1lc3NhZ2UuICovXG4gIHR5cGU6IHN0cmluZztcbiAgLyoqIFRoZSBzY29wZSBvZiB0aGUgY29tbWl0IG1lc3NhZ2UuICovXG4gIHNjb3BlOiBzdHJpbmc7XG4gIC8qKiBUaGUgbnBtIHNjb3BlIG9mIHRoZSBjb21taXQgbWVzc2FnZS4gKi9cbiAgbnBtU2NvcGU6IHN0cmluZztcbiAgLyoqIFRoZSBzdWJqZWN0IG9mIHRoZSBjb21taXQgbWVzc2FnZS4gKi9cbiAgc3ViamVjdDogc3RyaW5nO1xuICAvKiogQSBsaXN0IG9mIGJyZWFraW5nIGNoYW5nZSBub3RlcyBpbiB0aGUgY29tbWl0IG1lc3NhZ2UuICovXG4gIGJyZWFraW5nQ2hhbmdlczogUGFyc2VkQ29tbWl0Lk5vdGVbXTtcbiAgLyoqIEEgbGlzdCBvZiBkZXByZWNhdGlvbiBub3RlcyBpbiB0aGUgY29tbWl0IG1lc3NhZ2UuICovXG4gIGRlcHJlY2F0aW9uczogUGFyc2VkQ29tbWl0Lk5vdGVbXTtcbiAgLyoqIFdoZXRoZXIgdGhlIGNvbW1pdCBpcyBhIGZpeHVwIGNvbW1pdC4gKi9cbiAgaXNGaXh1cDogYm9vbGVhbjtcbiAgLyoqIFdoZXRoZXIgdGhlIGNvbW1pdCBpcyBhIHNxdWFzaCBjb21taXQuICovXG4gIGlzU3F1YXNoOiBib29sZWFuO1xuICAvKiogV2hldGhlciB0aGUgY29tbWl0IGlzIGEgcmV2ZXJ0IGNvbW1pdC4gKi9cbiAgaXNSZXZlcnQ6IGJvb2xlYW47XG59XG5cbi8qKiBBIHBhcnNlZCBjb21taXQgd2hpY2ggb3JpZ2luYXRlZCBmcm9tIGEgR2l0IExvZyBlbnRyeSAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21taXRGcm9tR2l0TG9nIGV4dGVuZHMgQ29tbWl0IHtcbiAgYXV0aG9yOiBzdHJpbmc7XG4gIGhhc2g6IHN0cmluZztcbiAgc2hvcnRIYXNoOiBzdHJpbmc7XG59XG5cbi8qKlxuICogQSBsaXN0IG9mIHR1cGxlcyBleHByZXNzaW5nIHRoZSBmaWVsZHMgdG8gZXh0cmFjdCBmcm9tIGVhY2ggY29tbWl0IGxvZyBlbnRyeS4gVGhlIHR1cGxlIGNvbnRhaW5zXG4gKiB0d28gdmFsdWVzLCB0aGUgZmlyc3QgaXMgdGhlIGtleSBmb3IgdGhlIHByb3BlcnR5IGFuZCB0aGUgc2Vjb25kIGlzIHRoZSB0ZW1wbGF0ZSBzaG9ydGN1dCBmb3IgdGhlXG4gKiBnaXQgbG9nIGNvbW1hbmQuXG4gKi9cbmNvbnN0IGNvbW1pdEZpZWxkcyA9IHtcbiAgaGFzaDogJyVIJyxcbiAgc2hvcnRIYXNoOiAnJWgnLFxuICBhdXRob3I6ICclYU4nLFxufTtcbi8qKiBUaGUgYWRkaXRpb25hbCBmaWVsZHMgdG8gYmUgaW5jbHVkZWQgaW4gY29tbWl0IGxvZyBlbnRyaWVzIGZvciBwYXJzaW5nLiAqL1xuZXhwb3J0IHR5cGUgQ29tbWl0RmllbGRzID0gdHlwZW9mIGNvbW1pdEZpZWxkcztcbi8qKiBUaGUgY29tbWl0IGZpZWxkcyBkZXNjcmliZWQgYXMgZ2l0IGxvZyBmb3JtYXQgZW50cmllcyBmb3IgcGFyc2luZy4gKi9cbmV4cG9ydCBjb25zdCBjb21taXRGaWVsZHNBc0Zvcm1hdCA9IChmaWVsZHM6IENvbW1pdEZpZWxkcykgPT4ge1xuICByZXR1cm4gT2JqZWN0LmVudHJpZXMoZmllbGRzKS5tYXAoKFtrZXksIHZhbHVlXSkgPT4gYCVuLSR7a2V5fS0lbiR7dmFsdWV9YCkuam9pbignJyk7XG59O1xuLyoqXG4gKiBUaGUgZ2l0IGxvZyBmb3JtYXQgdGVtcGxhdGUgdG8gY3JlYXRlIGdpdCBsb2cgZW50cmllcyBmb3IgcGFyc2luZy5cbiAqXG4gKiBUaGUgY29udmVudGlvbmFsIGNvbW1pdHMgcGFyc2VyIGV4cGVjdHMgdG8gcGFyc2UgdGhlIHN0YW5kYXJkIGdpdCBsb2cgcmF3IGJvZHkgKCVCKSBpbnRvIGl0c1xuICogY29tcG9uZW50IHBhcnRzLiBBZGRpdGlvbmFsbHkgaXQgd2lsbCBwYXJzZSBhZGRpdGlvbmFsIGZpZWxkcyB3aXRoIGtleXMgZGVmaW5lZCBieVxuICogYC17a2V5IG5hbWV9LWAgc2VwYXJhdGVkIGJ5IG5ldyBsaW5lcy5cbiAqICovXG5leHBvcnQgY29uc3QgZ2l0TG9nRm9ybWF0Rm9yUGFyc2luZyA9IGAlQiR7Y29tbWl0RmllbGRzQXNGb3JtYXQoY29tbWl0RmllbGRzKX1gO1xuLyoqIE1hcmtlcnMgdXNlZCB0byBkZW5vdGUgdGhlIHN0YXJ0IG9mIGEgbm90ZSBzZWN0aW9uIGluIGEgY29tbWl0LiAqL1xuZW51bSBOb3RlU2VjdGlvbnMge1xuICBCUkVBS0lOR19DSEFOR0UgPSAnQlJFQUtJTkcgQ0hBTkdFJyxcbiAgREVQUkVDQVRFRCA9ICdERVBSRUNBVEVEJyxcbn1cbi8qKiBSZWdleCBkZXRlcm1pbmluZyBpZiBhIGNvbW1pdCBpcyBhIGZpeHVwLiAqL1xuY29uc3QgRklYVVBfUFJFRklYX1JFID0gL15maXh1cCEgL2k7XG4vKiogUmVnZXggZGV0ZXJtaW5pbmcgaWYgYSBjb21taXQgaXMgYSBzcXVhc2guICovXG5jb25zdCBTUVVBU0hfUFJFRklYX1JFID0gL15zcXVhc2ghIC9pO1xuLyoqIFJlZ2V4IGRldGVybWluaW5nIGlmIGEgY29tbWl0IGlzIGEgcmV2ZXJ0LiAqL1xuY29uc3QgUkVWRVJUX1BSRUZJWF9SRSA9IC9ecmV2ZXJ0Oj8gL2k7XG4vKipcbiAqIFJlZ2V4IHBhdHRlcm4gZm9yIHBhcnNpbmcgdGhlIGhlYWRlciBsaW5lIG9mIGEgY29tbWl0LlxuICpcbiAqIFNldmVyYWwgZ3JvdXBzIGFyZSBiZWluZyBtYXRjaGVkIHRvIGJlIHVzZWQgaW4gdGhlIHBhcnNlZCBjb21taXQgb2JqZWN0LCBiZWluZyBtYXBwZWQgdG8gdGhlXG4gKiBgaGVhZGVyQ29ycmVzcG9uZGVuY2VgIG9iamVjdC5cbiAqXG4gKiBUaGUgcGF0dGVybiBjYW4gYmUgYnJva2VuIGRvd24gaW50byBjb21wb25lbnQgcGFydHM6XG4gKiAtIGAoXFx3KylgIC0gYSBjYXB0dXJpbmcgZ3JvdXAgZGlzY292ZXJpbmcgdGhlIHR5cGUgb2YgdGhlIGNvbW1pdC5cbiAqIC0gYCg/OlxcKCg/OihbXi9dKylcXC8pPyhbXildKylcXCkpP2AgLSBhIHBhaXIgb2YgY2FwdHVyaW5nIGdyb3VwcyB0byBjYXB0dXJlIHRoZSBzY29wZSBhbmQsXG4gKiBvcHRpb25hbGx5IHRoZSBucG1TY29wZSBvZiB0aGUgY29tbWl0LlxuICogLSBgKC4qKWAgLSBhIGNhcHR1cmluZyBncm91cCBkaXNjb3ZlcmluZyB0aGUgc3ViamVjdCBvZiB0aGUgY29tbWl0LlxuICovXG5jb25zdCBoZWFkZXJQYXR0ZXJuID0gL14oXFx3KykoPzpcXCgoPzooW14vXSspXFwvKT8oW14pXSspXFwpKT86ICguKikkLztcbi8qKlxuICogVGhlIHByb3BlcnR5IG5hbWVzIHVzZWQgZm9yIHRoZSB2YWx1ZXMgZXh0cmFjdGVkIGZyb20gdGhlIGhlYWRlciB2aWEgdGhlIGBoZWFkZXJQYXR0ZXJuYCByZWdleC5cbiAqL1xuY29uc3QgaGVhZGVyQ29ycmVzcG9uZGVuY2UgPSBbJ3R5cGUnLCAnbnBtU2NvcGUnLCAnc2NvcGUnLCAnc3ViamVjdCddO1xuLyoqXG4gKiBDb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIHRoZSBjb21taXQgcGFyc2VyLlxuICpcbiAqIE5PVEU6IEFuIGV4dGVuZGVkIHR5cGUgZnJvbSBgT3B0aW9uc2AgbXVzdCBiZSB1c2VkIGJlY2F1c2UgdGhlIGN1cnJlbnRcbiAqIEB0eXBlcy9jb252ZW50aW9uYWwtY29tbWl0cy1wYXJzZXIgdmVyc2lvbiBkb2VzIG5vdCBpbmNsdWRlIHRoZSBgbm90ZXNQYXR0ZXJuYCBmaWVsZC5cbiAqL1xuY29uc3QgcGFyc2VPcHRpb25zOiBPcHRpb25zJntub3Rlc1BhdHRlcm46IChrZXl3b3Jkczogc3RyaW5nKSA9PiBSZWdFeHB9ID0ge1xuICBjb21tZW50Q2hhcjogJyMnLFxuICBoZWFkZXJQYXR0ZXJuLFxuICBoZWFkZXJDb3JyZXNwb25kZW5jZSxcbiAgbm90ZUtleXdvcmRzOiBbTm90ZVNlY3Rpb25zLkJSRUFLSU5HX0NIQU5HRSwgTm90ZVNlY3Rpb25zLkRFUFJFQ0FURURdLFxuICBub3Rlc1BhdHRlcm46IChrZXl3b3Jkczogc3RyaW5nKSA9PiBuZXcgUmVnRXhwKGBeXFxzKigke2tleXdvcmRzfSk6ID8oLiopYCksXG59O1xuXG4vKiogUGFyc2UgYSBjb21taXQgbWVzc2FnZSBpbnRvIGl0cyBjb21wb3NpdGUgcGFydHMuICovXG5leHBvcnQgY29uc3QgcGFyc2VDb21taXRNZXNzYWdlOiAoZnVsbFRleHQ6IHN0cmluZykgPT4gQ29tbWl0ID0gcGFyc2VJbnRlcm5hbDtcblxuLyoqIFBhcnNlIGEgY29tbWl0IG1lc3NhZ2UgZnJvbSBhIGdpdCBsb2cgZW50cnkgaW50byBpdHMgY29tcG9zaXRlIHBhcnRzLiAqL1xuZXhwb3J0IGNvbnN0IHBhcnNlQ29tbWl0RnJvbUdpdExvZzogKGZ1bGxUZXh0OiBCdWZmZXIpID0+IENvbW1pdEZyb21HaXRMb2cgPSBwYXJzZUludGVybmFsO1xuXG4vKiogUGFyc2UgYSBmdWxsIGNvbW1pdCBtZXNzYWdlIGludG8gaXRzIGNvbXBvc2l0ZSBwYXJ0cy4gKi9cbmZ1bmN0aW9uIHBhcnNlSW50ZXJuYWwoZnVsbFRleHQ6IHN0cmluZyk6IENvbW1pdDtcbmZ1bmN0aW9uIHBhcnNlSW50ZXJuYWwoZnVsbFRleHQ6IEJ1ZmZlcik6IENvbW1pdEZyb21HaXRMb2c7XG5mdW5jdGlvbiBwYXJzZUludGVybmFsKGZ1bGxUZXh0OiBzdHJpbmd8QnVmZmVyKTogQ29tbWl0RnJvbUdpdExvZ3xDb21taXQge1xuICAvLyBFbnN1cmUgdGhlIGZ1bGxUZXh0IHN5bWJvbCBpcyBhIGBzdHJpbmdgLCBldmVuIGlmIGEgQnVmZmVyIHdhcyBwcm92aWRlZC5cbiAgZnVsbFRleHQgPSBmdWxsVGV4dC50b1N0cmluZygpO1xuICAvKiogVGhlIGNvbW1pdCBtZXNzYWdlIHRleHQgd2l0aCB0aGUgZml4dXAgYW5kIHNxdWFzaCBtYXJrZXJzIHN0cmlwcGVkIG91dC4gKi9cbiAgY29uc3Qgc3RyaXBwZWRDb21taXRNc2cgPSBmdWxsVGV4dC5yZXBsYWNlKEZJWFVQX1BSRUZJWF9SRSwgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKFNRVUFTSF9QUkVGSVhfUkUsICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZShSRVZFUlRfUFJFRklYX1JFLCAnJyk7XG4gIC8qKiBUaGUgaW5pdGlhbGx5IHBhcnNlZCBjb21taXQuICovXG4gIGNvbnN0IGNvbW1pdCA9IHBhcnNlKHN0cmlwcGVkQ29tbWl0TXNnLCBwYXJzZU9wdGlvbnMpO1xuICAvKiogQSBsaXN0IG9mIGJyZWFraW5nIGNoYW5nZSBub3RlcyBmcm9tIHRoZSBjb21taXQuICovXG4gIGNvbnN0IGJyZWFraW5nQ2hhbmdlczogUGFyc2VkQ29tbWl0Lk5vdGVbXSA9IFtdO1xuICAvKiogQSBsaXN0IG9mIGRlcHJlY2F0aW9uIG5vdGVzIGZyb20gdGhlIGNvbW1pdC4gKi9cbiAgY29uc3QgZGVwcmVjYXRpb25zOiBQYXJzZWRDb21taXQuTm90ZVtdID0gW107XG5cbiAgLy8gRXh0cmFjdCB0aGUgY29tbWl0IG1lc3NhZ2Ugbm90ZXMgYnkgbWFya2VkIHR5cGVzIGludG8gdGhlaXIgcmVzcGVjdGl2ZSBsaXN0cy5cbiAgY29tbWl0Lm5vdGVzLmZvckVhY2goKG5vdGU6IFBhcnNlZENvbW1pdC5Ob3RlKSA9PiB7XG4gICAgaWYgKG5vdGUudGl0bGUgPT09IE5vdGVTZWN0aW9ucy5CUkVBS0lOR19DSEFOR0UpIHtcbiAgICAgIHJldHVybiBicmVha2luZ0NoYW5nZXMucHVzaChub3RlKTtcbiAgICB9XG4gICAgaWYgKG5vdGUudGl0bGUgPT09IE5vdGVTZWN0aW9ucy5ERVBSRUNBVEVEKSB7XG4gICAgICByZXR1cm4gZGVwcmVjYXRpb25zLnB1c2gobm90ZSk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4ge1xuICAgIGZ1bGxUZXh0LFxuICAgIGJyZWFraW5nQ2hhbmdlcyxcbiAgICBkZXByZWNhdGlvbnMsXG4gICAgYm9keTogY29tbWl0LmJvZHkgfHwgJycsXG4gICAgZm9vdGVyOiBjb21taXQuZm9vdGVyIHx8ICcnLFxuICAgIGhlYWRlcjogY29tbWl0LmhlYWRlciB8fCAnJyxcbiAgICByZWZlcmVuY2VzOiBjb21taXQucmVmZXJlbmNlcyxcbiAgICBzY29wZTogY29tbWl0LnNjb3BlIHx8ICcnLFxuICAgIHN1YmplY3Q6IGNvbW1pdC5zdWJqZWN0IHx8ICcnLFxuICAgIHR5cGU6IGNvbW1pdC50eXBlIHx8ICcnLFxuICAgIG5wbVNjb3BlOiBjb21taXQubnBtU2NvcGUgfHwgJycsXG4gICAgaXNGaXh1cDogRklYVVBfUFJFRklYX1JFLnRlc3QoZnVsbFRleHQpLFxuICAgIGlzU3F1YXNoOiBTUVVBU0hfUFJFRklYX1JFLnRlc3QoZnVsbFRleHQpLFxuICAgIGlzUmV2ZXJ0OiBSRVZFUlRfUFJFRklYX1JFLnRlc3QoZnVsbFRleHQpLFxuICAgIGF1dGhvcjogY29tbWl0LmF1dGhvciB8fCB1bmRlZmluZWQsXG4gICAgaGFzaDogY29tbWl0Lmhhc2ggfHwgdW5kZWZpbmVkLFxuICAgIHNob3J0SGFzaDogY29tbWl0LnNob3J0SGFzaCB8fCB1bmRlZmluZWQsXG4gIH07XG59XG4iXX0=