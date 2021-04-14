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
        notesPattern: function (keywords) { return new RegExp("(" + keywords + ")(?:: ?)(.*)"); },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvcGFyc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDJFQUEyRjtJQTBDM0Y7Ozs7T0FJRztJQUNILElBQU0sWUFBWSxHQUFHO1FBQ25CLElBQUksRUFBRSxJQUFJO1FBQ1YsU0FBUyxFQUFFLElBQUk7UUFDZixNQUFNLEVBQUUsS0FBSztLQUNkLENBQUM7SUFHRix5RUFBeUU7SUFDbEUsSUFBTSxvQkFBb0IsR0FBRyxVQUFDLE1BQW9CO1FBQ3ZELE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQyxFQUFZO2dCQUFaLEtBQUEscUJBQVksRUFBWCxHQUFHLFFBQUEsRUFBRSxLQUFLLFFBQUE7WUFBTSxPQUFBLFFBQU0sR0FBRyxXQUFNLEtBQU87UUFBdEIsQ0FBc0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN2RixDQUFDLENBQUM7SUFGVyxRQUFBLG9CQUFvQix3QkFFL0I7SUFDRjs7Ozs7O1NBTUs7SUFDUSxRQUFBLHNCQUFzQixHQUFHLE9BQUssNEJBQW9CLENBQUMsWUFBWSxDQUFHLENBQUM7SUFDaEYsc0VBQXNFO0lBQ3RFLElBQUssWUFHSjtJQUhELFdBQUssWUFBWTtRQUNmLG1EQUFtQyxDQUFBO1FBQ25DLHlDQUF5QixDQUFBO0lBQzNCLENBQUMsRUFISSxZQUFZLEtBQVosWUFBWSxRQUdoQjtJQUNELGdEQUFnRDtJQUNoRCxJQUFNLGVBQWUsR0FBRyxXQUFXLENBQUM7SUFDcEMsaURBQWlEO0lBQ2pELElBQU0sZ0JBQWdCLEdBQUcsWUFBWSxDQUFDO0lBQ3RDLGlEQUFpRDtJQUNqRCxJQUFNLGdCQUFnQixHQUFHLGFBQWEsQ0FBQztJQUN2Qzs7Ozs7Ozs7Ozs7T0FXRztJQUNI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InNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbW1pdCBhcyBQYXJzZWRDb21taXQsIE9wdGlvbnMsIHN5bmMgYXMgcGFyc2V9IGZyb20gJ2NvbnZlbnRpb25hbC1jb21taXRzLXBhcnNlcic7XG5cblxuLyoqIEEgcGFyc2VkIGNvbW1pdCwgY29udGFpbmluZyB0aGUgaW5mb3JtYXRpb24gbmVlZGVkIHRvIHZhbGlkYXRlIHRoZSBjb21taXQuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbW1pdCB7XG4gIC8qKiBUaGUgZnVsbCByYXcgdGV4dCBvZiB0aGUgY29tbWl0LiAqL1xuICBmdWxsVGV4dDogc3RyaW5nO1xuICAvKiogVGhlIGhlYWRlciBsaW5lIG9mIHRoZSBjb21taXQsIHdpbGwgYmUgdXNlZCBpbiB0aGUgY2hhbmdlbG9nIGVudHJpZXMuICovXG4gIGhlYWRlcjogc3RyaW5nO1xuICAvKiogVGhlIGZ1bGwgYm9keSBvZiB0aGUgY29tbWl0LCBub3QgaW5jbHVkaW5nIHRoZSBmb290ZXIuICovXG4gIGJvZHk6IHN0cmluZztcbiAgLyoqIFRoZSBmb290ZXIgb2YgdGhlIGNvbW1pdCwgY29udGFpbmluZyBpc3N1ZSByZWZlcmVuY2VzIGFuZCBub3RlIHNlY3Rpb25zLiAqL1xuICBmb290ZXI6IHN0cmluZztcbiAgLyoqIEEgbGlzdCBvZiB0aGUgcmVmZXJlbmNlcyB0byBvdGhlciBpc3N1ZXMgbWFkZSB0aHJvdWdob3V0IHRoZSBjb21taXQgbWVzc2FnZS4gKi9cbiAgcmVmZXJlbmNlczogUGFyc2VkQ29tbWl0LlJlZmVyZW5jZVtdO1xuICAvKiogVGhlIHR5cGUgb2YgdGhlIGNvbW1pdCBtZXNzYWdlLiAqL1xuICB0eXBlOiBzdHJpbmc7XG4gIC8qKiBUaGUgc2NvcGUgb2YgdGhlIGNvbW1pdCBtZXNzYWdlLiAqL1xuICBzY29wZTogc3RyaW5nO1xuICAvKiogVGhlIG5wbSBzY29wZSBvZiB0aGUgY29tbWl0IG1lc3NhZ2UuICovXG4gIG5wbVNjb3BlOiBzdHJpbmc7XG4gIC8qKiBUaGUgc3ViamVjdCBvZiB0aGUgY29tbWl0IG1lc3NhZ2UuICovXG4gIHN1YmplY3Q6IHN0cmluZztcbiAgLyoqIEEgbGlzdCBvZiBicmVha2luZyBjaGFuZ2Ugbm90ZXMgaW4gdGhlIGNvbW1pdCBtZXNzYWdlLiAqL1xuICBicmVha2luZ0NoYW5nZXM6IFBhcnNlZENvbW1pdC5Ob3RlW107XG4gIC8qKiBBIGxpc3Qgb2YgZGVwcmVjYXRpb24gbm90ZXMgaW4gdGhlIGNvbW1pdCBtZXNzYWdlLiAqL1xuICBkZXByZWNhdGlvbnM6IFBhcnNlZENvbW1pdC5Ob3RlW107XG4gIC8qKiBXaGV0aGVyIHRoZSBjb21taXQgaXMgYSBmaXh1cCBjb21taXQuICovXG4gIGlzRml4dXA6IGJvb2xlYW47XG4gIC8qKiBXaGV0aGVyIHRoZSBjb21taXQgaXMgYSBzcXVhc2ggY29tbWl0LiAqL1xuICBpc1NxdWFzaDogYm9vbGVhbjtcbiAgLyoqIFdoZXRoZXIgdGhlIGNvbW1pdCBpcyBhIHJldmVydCBjb21taXQuICovXG4gIGlzUmV2ZXJ0OiBib29sZWFuO1xufVxuXG4vKiogQSBwYXJzZWQgY29tbWl0IHdoaWNoIG9yaWdpbmF0ZWQgZnJvbSBhIEdpdCBMb2cgZW50cnkgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0RnJvbUdpdExvZyBleHRlbmRzIENvbW1pdCB7XG4gIGF1dGhvcjogc3RyaW5nO1xuICBoYXNoOiBzdHJpbmc7XG4gIHNob3J0SGFzaDogc3RyaW5nO1xufVxuXG4vKipcbiAqIEEgbGlzdCBvZiB0dXBsZXMgZXhwcmVzc2luZyB0aGUgZmllbGRzIHRvIGV4dHJhY3QgZnJvbSBlYWNoIGNvbW1pdCBsb2cgZW50cnkuIFRoZSB0dXBsZSBjb250YWluc1xuICogdHdvIHZhbHVlcywgdGhlIGZpcnN0IGlzIHRoZSBrZXkgZm9yIHRoZSBwcm9wZXJ0eSBhbmQgdGhlIHNlY29uZCBpcyB0aGUgdGVtcGxhdGUgc2hvcnRjdXQgZm9yIHRoZVxuICogZ2l0IGxvZyBjb21tYW5kLlxuICovXG5jb25zdCBjb21taXRGaWVsZHMgPSB7XG4gIGhhc2g6ICclSCcsXG4gIHNob3J0SGFzaDogJyVoJyxcbiAgYXV0aG9yOiAnJWFOJyxcbn07XG4vKiogVGhlIGFkZGl0aW9uYWwgZmllbGRzIHRvIGJlIGluY2x1ZGVkIGluIGNvbW1pdCBsb2cgZW50cmllcyBmb3IgcGFyc2luZy4gKi9cbmV4cG9ydCB0eXBlIENvbW1pdEZpZWxkcyA9IHR5cGVvZiBjb21taXRGaWVsZHM7XG4vKiogVGhlIGNvbW1pdCBmaWVsZHMgZGVzY3JpYmVkIGFzIGdpdCBsb2cgZm9ybWF0IGVudHJpZXMgZm9yIHBhcnNpbmcuICovXG5leHBvcnQgY29uc3QgY29tbWl0RmllbGRzQXNGb3JtYXQgPSAoZmllbGRzOiBDb21taXRGaWVsZHMpID0+IHtcbiAgcmV0dXJuIE9iamVjdC5lbnRyaWVzKGZpZWxkcykubWFwKChba2V5LCB2YWx1ZV0pID0+IGAlbi0ke2tleX0tJW4ke3ZhbHVlfWApLmpvaW4oJycpO1xufTtcbi8qKlxuICogVGhlIGdpdCBsb2cgZm9ybWF0IHRlbXBsYXRlIHRvIGNyZWF0ZSBnaXQgbG9nIGVudHJpZXMgZm9yIHBhcnNpbmcuXG4gKlxuICogVGhlIGNvbnZlbnRpb25hbCBjb21taXRzIHBhcnNlciBleHBlY3RzIHRvIHBhcnNlIHRoZSBzdGFuZGFyZCBnaXQgbG9nIHJhdyBib2R5ICglQikgaW50byBpdHNcbiAqIGNvbXBvbmVudCBwYXJ0cy4gQWRkaXRpb25hbGx5IGl0IHdpbGwgcGFyc2UgYWRkaXRpb25hbCBmaWVsZHMgd2l0aCBrZXlzIGRlZmluZWQgYnlcbiAqIGAte2tleSBuYW1lfS1gIHNlcGFyYXRlZCBieSBuZXcgbGluZXMuXG4gKiAqL1xuZXhwb3J0IGNvbnN0IGdpdExvZ0Zvcm1hdEZvclBhcnNpbmcgPSBgJUIke2NvbW1pdEZpZWxkc0FzRm9ybWF0KGNvbW1pdEZpZWxkcyl9YDtcbi8qKiBNYXJrZXJzIHVzZWQgdG8gZGVub3RlIHRoZSBzdGFydCBvZiBhIG5vdGUgc2VjdGlvbiBpbiBhIGNvbW1pdC4gKi9cbmVudW0gTm90ZVNlY3Rpb25zIHtcbiAgQlJFQUtJTkdfQ0hBTkdFID0gJ0JSRUFLSU5HIENIQU5HRScsXG4gIERFUFJFQ0FURUQgPSAnREVQUkVDQVRFRCcsXG59XG4vKiogUmVnZXggZGV0ZXJtaW5pbmcgaWYgYSBjb21taXQgaXMgYSBmaXh1cC4gKi9cbmNvbnN0IEZJWFVQX1BSRUZJWF9SRSA9IC9eZml4dXAhIC9pO1xuLyoqIFJlZ2V4IGRldGVybWluaW5nIGlmIGEgY29tbWl0IGlzIGEgc3F1YXNoLiAqL1xuY29uc3QgU1FVQVNIX1BSRUZJWF9SRSA9IC9ec3F1YXNoISAvaTtcbi8qKiBSZWdleCBkZXRlcm1pbmluZyBpZiBhIGNvbW1pdCBpcyBhIHJldmVydC4gKi9cbmNvbnN0IFJFVkVSVF9QUkVGSVhfUkUgPSAvXnJldmVydDo/IC9pO1xuLyoqXG4gKiBSZWdleCBwYXR0ZXJuIGZvciBwYXJzaW5nIHRoZSBoZWFkZXIgbGluZSBvZiBhIGNvbW1pdC5cbiAqXG4gKiBTZXZlcmFsIGdyb3VwcyBhcmUgYmVpbmcgbWF0Y2hlZCB0byBiZSB1c2VkIGluIHRoZSBwYXJzZWQgY29tbWl0IG9iamVjdCwgYmVpbmcgbWFwcGVkIHRvIHRoZVxuICogYGhlYWRlckNvcnJlc3BvbmRlbmNlYCBvYmplY3QuXG4gKlxuICogVGhlIHBhdHRlcm4gY2FuIGJlIGJyb2tlbiBkb3duIGludG8gY29tcG9uZW50IHBhcnRzOlxuICogLSBgKFxcdyspYCAtIGEgY2FwdHVyaW5nIGdyb3VwIGRpc2NvdmVyaW5nIHRoZSB0eXBlIG9mIHRoZSBjb21taXQuXG4gKiAtIGAoPzpcXCgoPzooW14vXSspXFwvKT8oW14pXSspXFwpKT9gIC0gYSBwYWlyIG9mIGNhcHR1cmluZyBncm91cHMgdG8gY2FwdHVyZSB0aGUgc2NvcGUgYW5kLFxuICogb3B0aW9uYWxseSB0aGUgbnBtU2NvcGUgb2YgdGhlIGNvbW1pdC5cbiAqIC0gYCguKilgIC0gYSBjYXB0dXJpbmcgZ3JvdXAgZGlzY292ZXJpbmcgdGhlIHN1YmplY3Qgb2YgdGhlIGNvbW1pdC5cbiAqL1xuY29uc3QgaGVhZGVyUGF0dGVybiA9IC9eKFxcdyspKD86XFwoKD86KFteL10rKVxcLyk/KFteKV0rKVxcKSk/OiAoLiopJC87XG4vKipcbiAqIFRoZSBwcm9wZXJ0eSBuYW1lcyB1c2VkIGZvciB0aGUgdmFsdWVzIGV4dHJhY3RlZCBmcm9tIHRoZSBoZWFkZXIgdmlhIHRoZSBgaGVhZGVyUGF0dGVybmAgcmVnZXguXG4gKi9cbmNvbnN0IGhlYWRlckNvcnJlc3BvbmRlbmNlID0gWyd0eXBlJywgJ25wbVNjb3BlJywgJ3Njb3BlJywgJ3N1YmplY3QnXTtcbi8qKlxuICogQ29uZmlndXJhdGlvbiBvcHRpb25zIGZvciB0aGUgY29tbWl0IHBhcnNlci5cbiAqXG4gKiBOT1RFOiBBbiBleHRlbmRlZCB0eXBlIGZyb20gYE9wdGlvbnNgIG11c3QgYmUgdXNlZCBiZWNhdXNlIHRoZSBjdXJyZW50XG4gKiBAdHlwZXMvY29udmVudGlvbmFsLWNvbW1pdHMtcGFyc2VyIHZlcnNpb24gZG9lcyBub3QgaW5jbHVkZSB0aGUgYG5vdGVzUGF0dGVybmAgZmllbGQuXG4gKi9cbmNvbnN0IHBhcnNlT3B0aW9uczogT3B0aW9ucyZ7bm90ZXNQYXR0ZXJuOiAoa2V5d29yZHM6IHN0cmluZykgPT4gUmVnRXhwfSA9IHtcbiAgY29tbWVudENoYXI6ICcjJyxcbiAgaGVhZGVyUGF0dGVybixcbiAgaGVhZGVyQ29ycmVzcG9uZGVuY2UsXG4gIG5vdGVLZXl3b3JkczogW05vdGVTZWN0aW9ucy5CUkVBS0lOR19DSEFOR0UsIE5vdGVTZWN0aW9ucy5ERVBSRUNBVEVEXSxcbiAgbm90ZXNQYXR0ZXJuOiAoa2V5d29yZHM6IHN0cmluZykgPT4gbmV3IFJlZ0V4cChgKCR7a2V5d29yZHN9KSg/OjogPykoLiopYCksXG59O1xuXG4vKiogUGFyc2UgYSBjb21taXQgbWVzc2FnZSBpbnRvIGl0cyBjb21wb3NpdGUgcGFydHMuICovXG5leHBvcnQgY29uc3QgcGFyc2VDb21taXRNZXNzYWdlOiAoZnVsbFRleHQ6IHN0cmluZykgPT4gQ29tbWl0ID0gcGFyc2VJbnRlcm5hbDtcblxuLyoqIFBhcnNlIGEgY29tbWl0IG1lc3NhZ2UgZnJvbSBhIGdpdCBsb2cgZW50cnkgaW50byBpdHMgY29tcG9zaXRlIHBhcnRzLiAqL1xuZXhwb3J0IGNvbnN0IHBhcnNlQ29tbWl0RnJvbUdpdExvZzogKGZ1bGxUZXh0OiBCdWZmZXIpID0+IENvbW1pdEZyb21HaXRMb2cgPSBwYXJzZUludGVybmFsO1xuXG4vKiogUGFyc2UgYSBmdWxsIGNvbW1pdCBtZXNzYWdlIGludG8gaXRzIGNvbXBvc2l0ZSBwYXJ0cy4gKi9cbmZ1bmN0aW9uIHBhcnNlSW50ZXJuYWwoZnVsbFRleHQ6IHN0cmluZyk6IENvbW1pdDtcbmZ1bmN0aW9uIHBhcnNlSW50ZXJuYWwoZnVsbFRleHQ6IEJ1ZmZlcik6IENvbW1pdEZyb21HaXRMb2c7XG5mdW5jdGlvbiBwYXJzZUludGVybmFsKGZ1bGxUZXh0OiBzdHJpbmd8QnVmZmVyKTogQ29tbWl0RnJvbUdpdExvZ3xDb21taXQge1xuICAvLyBFbnN1cmUgdGhlIGZ1bGxUZXh0IHN5bWJvbCBpcyBhIGBzdHJpbmdgLCBldmVuIGlmIGEgQnVmZmVyIHdhcyBwcm92aWRlZC5cbiAgZnVsbFRleHQgPSBmdWxsVGV4dC50b1N0cmluZygpO1xuICAvKiogVGhlIGNvbW1pdCBtZXNzYWdlIHRleHQgd2l0aCB0aGUgZml4dXAgYW5kIHNxdWFzaCBtYXJrZXJzIHN0cmlwcGVkIG91dC4gKi9cbiAgY29uc3Qgc3RyaXBwZWRDb21taXRNc2cgPSBmdWxsVGV4dC5yZXBsYWNlKEZJWFVQX1BSRUZJWF9SRSwgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKFNRVUFTSF9QUkVGSVhfUkUsICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZShSRVZFUlRfUFJFRklYX1JFLCAnJyk7XG4gIC8qKiBUaGUgaW5pdGlhbGx5IHBhcnNlZCBjb21taXQuICovXG4gIGNvbnN0IGNvbW1pdCA9IHBhcnNlKHN0cmlwcGVkQ29tbWl0TXNnLCBwYXJzZU9wdGlvbnMpO1xuICAvKiogQSBsaXN0IG9mIGJyZWFraW5nIGNoYW5nZSBub3RlcyBmcm9tIHRoZSBjb21taXQuICovXG4gIGNvbnN0IGJyZWFraW5nQ2hhbmdlczogUGFyc2VkQ29tbWl0Lk5vdGVbXSA9IFtdO1xuICAvKiogQSBsaXN0IG9mIGRlcHJlY2F0aW9uIG5vdGVzIGZyb20gdGhlIGNvbW1pdC4gKi9cbiAgY29uc3QgZGVwcmVjYXRpb25zOiBQYXJzZWRDb21taXQuTm90ZVtdID0gW107XG5cbiAgLy8gRXh0cmFjdCB0aGUgY29tbWl0IG1lc3NhZ2Ugbm90ZXMgYnkgbWFya2VkIHR5cGVzIGludG8gdGhlaXIgcmVzcGVjdGl2ZSBsaXN0cy5cbiAgY29tbWl0Lm5vdGVzLmZvckVhY2goKG5vdGU6IFBhcnNlZENvbW1pdC5Ob3RlKSA9PiB7XG4gICAgaWYgKG5vdGUudGl0bGUgPT09IE5vdGVTZWN0aW9ucy5CUkVBS0lOR19DSEFOR0UpIHtcbiAgICAgIHJldHVybiBicmVha2luZ0NoYW5nZXMucHVzaChub3RlKTtcbiAgICB9XG4gICAgaWYgKG5vdGUudGl0bGUgPT09IE5vdGVTZWN0aW9ucy5ERVBSRUNBVEVEKSB7XG4gICAgICByZXR1cm4gZGVwcmVjYXRpb25zLnB1c2gobm90ZSk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4ge1xuICAgIGZ1bGxUZXh0LFxuICAgIGJyZWFraW5nQ2hhbmdlcyxcbiAgICBkZXByZWNhdGlvbnMsXG4gICAgYm9keTogY29tbWl0LmJvZHkgfHwgJycsXG4gICAgZm9vdGVyOiBjb21taXQuZm9vdGVyIHx8ICcnLFxuICAgIGhlYWRlcjogY29tbWl0LmhlYWRlciB8fCAnJyxcbiAgICByZWZlcmVuY2VzOiBjb21taXQucmVmZXJlbmNlcyxcbiAgICBzY29wZTogY29tbWl0LnNjb3BlIHx8ICcnLFxuICAgIHN1YmplY3Q6IGNvbW1pdC5zdWJqZWN0IHx8ICcnLFxuICAgIHR5cGU6IGNvbW1pdC50eXBlIHx8ICcnLFxuICAgIG5wbVNjb3BlOiBjb21taXQubnBtU2NvcGUgfHwgJycsXG4gICAgaXNGaXh1cDogRklYVVBfUFJFRklYX1JFLnRlc3QoZnVsbFRleHQpLFxuICAgIGlzU3F1YXNoOiBTUVVBU0hfUFJFRklYX1JFLnRlc3QoZnVsbFRleHQpLFxuICAgIGlzUmV2ZXJ0OiBSRVZFUlRfUFJFRklYX1JFLnRlc3QoZnVsbFRleHQpLFxuICAgIGF1dGhvcjogY29tbWl0LmF1dGhvciB8fCB1bmRlZmluZWQsXG4gICAgaGFzaDogY29tbWl0Lmhhc2ggfHwgdW5kZWZpbmVkLFxuICAgIHNob3J0SGFzaDogY29tbWl0LnNob3J0SGFzaCB8fCB1bmRlZmluZWQsXG4gIH07XG59XG4iXX0=