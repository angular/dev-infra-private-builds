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
    exports.parseCommitMessage = exports.gitLogFormatForParsing = exports.commitFieldsAsFormat = void 0;
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
    /** Parse a full commit message into its composite parts. */
    function parseCommitMessage(fullText) {
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
        };
    }
    exports.parseCommitMessage = parseCommitMessage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvcGFyc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDJFQUEyRjtJQW1DM0Y7Ozs7T0FJRztJQUNILElBQU0sWUFBWSxHQUFHO1FBQ25CLElBQUksRUFBRSxJQUFJO1FBQ1YsU0FBUyxFQUFFLElBQUk7UUFDZixNQUFNLEVBQUUsS0FBSztLQUNkLENBQUM7SUFHRix5RUFBeUU7SUFDbEUsSUFBTSxvQkFBb0IsR0FBRyxVQUFDLE1BQW9CO1FBQ3ZELE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQyxFQUFZO2dCQUFaLEtBQUEscUJBQVksRUFBWCxHQUFHLFFBQUEsRUFBRSxLQUFLLFFBQUE7WUFBTSxPQUFBLFFBQU0sR0FBRyxXQUFNLEtBQU87UUFBdEIsQ0FBc0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN2RixDQUFDLENBQUM7SUFGVyxRQUFBLG9CQUFvQix3QkFFL0I7SUFDRjs7Ozs7O1NBTUs7SUFDUSxRQUFBLHNCQUFzQixHQUFHLE9BQUssNEJBQW9CLENBQUMsWUFBWSxDQUFHLENBQUM7SUFDaEYsc0VBQXNFO0lBQ3RFLElBQUssWUFHSjtJQUhELFdBQUssWUFBWTtRQUNmLG1EQUFtQyxDQUFBO1FBQ25DLHlDQUF5QixDQUFBO0lBQzNCLENBQUMsRUFISSxZQUFZLEtBQVosWUFBWSxRQUdoQjtJQUNELGdEQUFnRDtJQUNoRCxJQUFNLGVBQWUsR0FBRyxXQUFXLENBQUM7SUFDcEMsaURBQWlEO0lBQ2pELElBQU0sZ0JBQWdCLEdBQUcsWUFBWSxDQUFDO0lBQ3RDLGlEQUFpRDtJQUNqRCxJQUFNLGdCQUFnQixHQUFHLGFBQWEsQ0FBQztJQUN2Qzs7Ozs7Ozs7Ozs7T0FXRztJQUNILElBQU0sYUFBYSxHQUFHLDZDQUE2QyxDQUFDO0lBQ3BFOztPQUVHO0lBQ0gsSUFBTSxvQkFBb0IsR0FBRyxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3RFOzs7OztPQUtHO0lBQ0gsSUFBTSxZQUFZLEdBQXlEO1FBQ3pFLFdBQVcsRUFBRSxHQUFHO1FBQ2hCLGFBQWEsZUFBQTtRQUNiLG9CQUFvQixzQkFBQTtRQUNwQixZQUFZLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLFlBQVksQ0FBQyxVQUFVLENBQUM7UUFDckUsWUFBWSxFQUFFLFVBQUMsUUFBZ0IsSUFBSyxPQUFBLElBQUksTUFBTSxDQUFDLE1BQUksUUFBUSxpQkFBYyxDQUFDLEVBQXRDLENBQXNDO0tBQzNFLENBQUM7SUFHRiw0REFBNEQ7SUFDNUQsU0FBZ0Isa0JBQWtCLENBQUMsUUFBdUI7UUFDeEQsMkVBQTJFO1FBQzNFLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDL0IsOEVBQThFO1FBQzlFLElBQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDO2FBQ2hDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUM7YUFDN0IsT0FBTyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdELG1DQUFtQztRQUNuQyxJQUFNLE1BQU0sR0FBRyxrQ0FBSyxDQUFDLGlCQUFpQixFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3RELHVEQUF1RDtRQUN2RCxJQUFNLGVBQWUsR0FBd0IsRUFBRSxDQUFDO1FBQ2hELG1EQUFtRDtRQUNuRCxJQUFNLFlBQVksR0FBd0IsRUFBRSxDQUFDO1FBRTdDLGdGQUFnRjtRQUNoRixNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQXVCO1lBQzNDLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxZQUFZLENBQUMsZUFBZSxFQUFFO2dCQUMvQyxPQUFPLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDbkM7WUFDRCxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssWUFBWSxDQUFDLFVBQVUsRUFBRTtnQkFDMUMsT0FBTyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2hDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPO1lBQ0wsUUFBUSxVQUFBO1lBQ1IsZUFBZSxpQkFBQTtZQUNmLFlBQVksY0FBQTtZQUNaLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxJQUFJLEVBQUU7WUFDdkIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLElBQUksRUFBRTtZQUMzQixNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sSUFBSSxFQUFFO1lBQzNCLFVBQVUsRUFBRSxNQUFNLENBQUMsVUFBVTtZQUM3QixLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssSUFBSSxFQUFFO1lBQ3pCLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxJQUFJLEVBQUU7WUFDN0IsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRTtZQUN2QixRQUFRLEVBQUUsTUFBTSxDQUFDLFFBQVEsSUFBSSxFQUFFO1lBQy9CLE9BQU8sRUFBRSxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUN2QyxRQUFRLEVBQUUsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUN6QyxRQUFRLEVBQUUsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztTQUMxQyxDQUFDO0lBQ0osQ0FBQztJQXhDRCxnREF3Q0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21taXQgYXMgUGFyc2VkQ29tbWl0LCBPcHRpb25zLCBzeW5jIGFzIHBhcnNlfSBmcm9tICdjb252ZW50aW9uYWwtY29tbWl0cy1wYXJzZXInO1xuXG5cbi8qKiBBIHBhcnNlZCBjb21taXQsIGNvbnRhaW5pbmcgdGhlIGluZm9ybWF0aW9uIG5lZWRlZCB0byB2YWxpZGF0ZSB0aGUgY29tbWl0LiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21taXQge1xuICAvKiogVGhlIGZ1bGwgcmF3IHRleHQgb2YgdGhlIGNvbW1pdC4gKi9cbiAgZnVsbFRleHQ6IHN0cmluZztcbiAgLyoqIFRoZSBoZWFkZXIgbGluZSBvZiB0aGUgY29tbWl0LCB3aWxsIGJlIHVzZWQgaW4gdGhlIGNoYW5nZWxvZyBlbnRyaWVzLiAqL1xuICBoZWFkZXI6IHN0cmluZztcbiAgLyoqIFRoZSBmdWxsIGJvZHkgb2YgdGhlIGNvbW1pdCwgbm90IGluY2x1ZGluZyB0aGUgZm9vdGVyLiAqL1xuICBib2R5OiBzdHJpbmc7XG4gIC8qKiBUaGUgZm9vdGVyIG9mIHRoZSBjb21taXQsIGNvbnRhaW5pbmcgaXNzdWUgcmVmZXJlbmNlcyBhbmQgbm90ZSBzZWN0aW9ucy4gKi9cbiAgZm9vdGVyOiBzdHJpbmc7XG4gIC8qKiBBIGxpc3Qgb2YgdGhlIHJlZmVyZW5jZXMgdG8gb3RoZXIgaXNzdWVzIG1hZGUgdGhyb3VnaG91dCB0aGUgY29tbWl0IG1lc3NhZ2UuICovXG4gIHJlZmVyZW5jZXM6IFBhcnNlZENvbW1pdC5SZWZlcmVuY2VbXTtcbiAgLyoqIFRoZSB0eXBlIG9mIHRoZSBjb21taXQgbWVzc2FnZS4gKi9cbiAgdHlwZTogc3RyaW5nO1xuICAvKiogVGhlIHNjb3BlIG9mIHRoZSBjb21taXQgbWVzc2FnZS4gKi9cbiAgc2NvcGU6IHN0cmluZztcbiAgLyoqIFRoZSBucG0gc2NvcGUgb2YgdGhlIGNvbW1pdCBtZXNzYWdlLiAqL1xuICBucG1TY29wZTogc3RyaW5nO1xuICAvKiogVGhlIHN1YmplY3Qgb2YgdGhlIGNvbW1pdCBtZXNzYWdlLiAqL1xuICBzdWJqZWN0OiBzdHJpbmc7XG4gIC8qKiBBIGxpc3Qgb2YgYnJlYWtpbmcgY2hhbmdlIG5vdGVzIGluIHRoZSBjb21taXQgbWVzc2FnZS4gKi9cbiAgYnJlYWtpbmdDaGFuZ2VzOiBQYXJzZWRDb21taXQuTm90ZVtdO1xuICAvKiogQSBsaXN0IG9mIGRlcHJlY2F0aW9uIG5vdGVzIGluIHRoZSBjb21taXQgbWVzc2FnZS4gKi9cbiAgZGVwcmVjYXRpb25zOiBQYXJzZWRDb21taXQuTm90ZVtdO1xuICAvKiogV2hldGhlciB0aGUgY29tbWl0IGlzIGEgZml4dXAgY29tbWl0LiAqL1xuICBpc0ZpeHVwOiBib29sZWFuO1xuICAvKiogV2hldGhlciB0aGUgY29tbWl0IGlzIGEgc3F1YXNoIGNvbW1pdC4gKi9cbiAgaXNTcXVhc2g6IGJvb2xlYW47XG4gIC8qKiBXaGV0aGVyIHRoZSBjb21taXQgaXMgYSByZXZlcnQgY29tbWl0LiAqL1xuICBpc1JldmVydDogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBBIGxpc3Qgb2YgdHVwbGVzIGV4cHJlc3NpbmcgdGhlIGZpZWxkcyB0byBleHRyYWN0IGZyb20gZWFjaCBjb21taXQgbG9nIGVudHJ5LiBUaGUgdHVwbGUgY29udGFpbnNcbiAqIHR3byB2YWx1ZXMsIHRoZSBmaXJzdCBpcyB0aGUga2V5IGZvciB0aGUgcHJvcGVydHkgYW5kIHRoZSBzZWNvbmQgaXMgdGhlIHRlbXBsYXRlIHNob3J0Y3V0IGZvciB0aGVcbiAqIGdpdCBsb2cgY29tbWFuZC5cbiAqL1xuY29uc3QgY29tbWl0RmllbGRzID0ge1xuICBoYXNoOiAnJUgnLFxuICBzaG9ydEhhc2g6ICclaCcsXG4gIGF1dGhvcjogJyVhTicsXG59O1xuLyoqIFRoZSBhZGRpdGlvbmFsIGZpZWxkcyB0byBiZSBpbmNsdWRlZCBpbiBjb21taXQgbG9nIGVudHJpZXMgZm9yIHBhcnNpbmcuICovXG5leHBvcnQgdHlwZSBDb21taXRGaWVsZHMgPSB0eXBlb2YgY29tbWl0RmllbGRzO1xuLyoqIFRoZSBjb21taXQgZmllbGRzIGRlc2NyaWJlZCBhcyBnaXQgbG9nIGZvcm1hdCBlbnRyaWVzIGZvciBwYXJzaW5nLiAqL1xuZXhwb3J0IGNvbnN0IGNvbW1pdEZpZWxkc0FzRm9ybWF0ID0gKGZpZWxkczogQ29tbWl0RmllbGRzKSA9PiB7XG4gIHJldHVybiBPYmplY3QuZW50cmllcyhmaWVsZHMpLm1hcCgoW2tleSwgdmFsdWVdKSA9PiBgJW4tJHtrZXl9LSVuJHt2YWx1ZX1gKS5qb2luKCcnKTtcbn07XG4vKipcbiAqIFRoZSBnaXQgbG9nIGZvcm1hdCB0ZW1wbGF0ZSB0byBjcmVhdGUgZ2l0IGxvZyBlbnRyaWVzIGZvciBwYXJzaW5nLlxuICpcbiAqIFRoZSBjb252ZW50aW9uYWwgY29tbWl0cyBwYXJzZXIgZXhwZWN0cyB0byBwYXJzZSB0aGUgc3RhbmRhcmQgZ2l0IGxvZyByYXcgYm9keSAoJUIpIGludG8gaXRzXG4gKiBjb21wb25lbnQgcGFydHMuIEFkZGl0aW9uYWxseSBpdCB3aWxsIHBhcnNlIGFkZGl0aW9uYWwgZmllbGRzIHdpdGgga2V5cyBkZWZpbmVkIGJ5XG4gKiBgLXtrZXkgbmFtZX0tYCBzZXBhcmF0ZWQgYnkgbmV3IGxpbmVzLlxuICogKi9cbmV4cG9ydCBjb25zdCBnaXRMb2dGb3JtYXRGb3JQYXJzaW5nID0gYCVCJHtjb21taXRGaWVsZHNBc0Zvcm1hdChjb21taXRGaWVsZHMpfWA7XG4vKiogTWFya2VycyB1c2VkIHRvIGRlbm90ZSB0aGUgc3RhcnQgb2YgYSBub3RlIHNlY3Rpb24gaW4gYSBjb21taXQuICovXG5lbnVtIE5vdGVTZWN0aW9ucyB7XG4gIEJSRUFLSU5HX0NIQU5HRSA9ICdCUkVBS0lORyBDSEFOR0UnLFxuICBERVBSRUNBVEVEID0gJ0RFUFJFQ0FURUQnLFxufVxuLyoqIFJlZ2V4IGRldGVybWluaW5nIGlmIGEgY29tbWl0IGlzIGEgZml4dXAuICovXG5jb25zdCBGSVhVUF9QUkVGSVhfUkUgPSAvXmZpeHVwISAvaTtcbi8qKiBSZWdleCBkZXRlcm1pbmluZyBpZiBhIGNvbW1pdCBpcyBhIHNxdWFzaC4gKi9cbmNvbnN0IFNRVUFTSF9QUkVGSVhfUkUgPSAvXnNxdWFzaCEgL2k7XG4vKiogUmVnZXggZGV0ZXJtaW5pbmcgaWYgYSBjb21taXQgaXMgYSByZXZlcnQuICovXG5jb25zdCBSRVZFUlRfUFJFRklYX1JFID0gL15yZXZlcnQ6PyAvaTtcbi8qKlxuICogUmVnZXggcGF0dGVybiBmb3IgcGFyc2luZyB0aGUgaGVhZGVyIGxpbmUgb2YgYSBjb21taXQuXG4gKlxuICogU2V2ZXJhbCBncm91cHMgYXJlIGJlaW5nIG1hdGNoZWQgdG8gYmUgdXNlZCBpbiB0aGUgcGFyc2VkIGNvbW1pdCBvYmplY3QsIGJlaW5nIG1hcHBlZCB0byB0aGVcbiAqIGBoZWFkZXJDb3JyZXNwb25kZW5jZWAgb2JqZWN0LlxuICpcbiAqIFRoZSBwYXR0ZXJuIGNhbiBiZSBicm9rZW4gZG93biBpbnRvIGNvbXBvbmVudCBwYXJ0czpcbiAqIC0gYChcXHcrKWAgLSBhIGNhcHR1cmluZyBncm91cCBkaXNjb3ZlcmluZyB0aGUgdHlwZSBvZiB0aGUgY29tbWl0LlxuICogLSBgKD86XFwoKD86KFteL10rKVxcLyk/KFteKV0rKVxcKSk/YCAtIGEgcGFpciBvZiBjYXB0dXJpbmcgZ3JvdXBzIHRvIGNhcHR1cmUgdGhlIHNjb3BlIGFuZCxcbiAqIG9wdGlvbmFsbHkgdGhlIG5wbVNjb3BlIG9mIHRoZSBjb21taXQuXG4gKiAtIGAoLiopYCAtIGEgY2FwdHVyaW5nIGdyb3VwIGRpc2NvdmVyaW5nIHRoZSBzdWJqZWN0IG9mIHRoZSBjb21taXQuXG4gKi9cbmNvbnN0IGhlYWRlclBhdHRlcm4gPSAvXihcXHcrKSg/OlxcKCg/OihbXi9dKylcXC8pPyhbXildKylcXCkpPzogKC4qKSQvO1xuLyoqXG4gKiBUaGUgcHJvcGVydHkgbmFtZXMgdXNlZCBmb3IgdGhlIHZhbHVlcyBleHRyYWN0ZWQgZnJvbSB0aGUgaGVhZGVyIHZpYSB0aGUgYGhlYWRlclBhdHRlcm5gIHJlZ2V4LlxuICovXG5jb25zdCBoZWFkZXJDb3JyZXNwb25kZW5jZSA9IFsndHlwZScsICducG1TY29wZScsICdzY29wZScsICdzdWJqZWN0J107XG4vKipcbiAqIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBmb3IgdGhlIGNvbW1pdCBwYXJzZXIuXG4gKlxuICogTk9URTogQW4gZXh0ZW5kZWQgdHlwZSBmcm9tIGBPcHRpb25zYCBtdXN0IGJlIHVzZWQgYmVjYXVzZSB0aGUgY3VycmVudFxuICogQHR5cGVzL2NvbnZlbnRpb25hbC1jb21taXRzLXBhcnNlciB2ZXJzaW9uIGRvZXMgbm90IGluY2x1ZGUgdGhlIGBub3Rlc1BhdHRlcm5gIGZpZWxkLlxuICovXG5jb25zdCBwYXJzZU9wdGlvbnM6IE9wdGlvbnMme25vdGVzUGF0dGVybjogKGtleXdvcmRzOiBzdHJpbmcpID0+IFJlZ0V4cH0gPSB7XG4gIGNvbW1lbnRDaGFyOiAnIycsXG4gIGhlYWRlclBhdHRlcm4sXG4gIGhlYWRlckNvcnJlc3BvbmRlbmNlLFxuICBub3RlS2V5d29yZHM6IFtOb3RlU2VjdGlvbnMuQlJFQUtJTkdfQ0hBTkdFLCBOb3RlU2VjdGlvbnMuREVQUkVDQVRFRF0sXG4gIG5vdGVzUGF0dGVybjogKGtleXdvcmRzOiBzdHJpbmcpID0+IG5ldyBSZWdFeHAoYCgke2tleXdvcmRzfSkoPzo6ID8pKC4qKWApLFxufTtcblxuXG4vKiogUGFyc2UgYSBmdWxsIGNvbW1pdCBtZXNzYWdlIGludG8gaXRzIGNvbXBvc2l0ZSBwYXJ0cy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUNvbW1pdE1lc3NhZ2UoZnVsbFRleHQ6IHN0cmluZ3xCdWZmZXIpOiBDb21taXQge1xuICAvLyBFbnN1cmUgdGhlIGZ1bGxUZXh0IHN5bWJvbCBpcyBhIGBzdHJpbmdgLCBldmVuIGlmIGEgQnVmZmVyIHdhcyBwcm92aWRlZC5cbiAgZnVsbFRleHQgPSBmdWxsVGV4dC50b1N0cmluZygpO1xuICAvKiogVGhlIGNvbW1pdCBtZXNzYWdlIHRleHQgd2l0aCB0aGUgZml4dXAgYW5kIHNxdWFzaCBtYXJrZXJzIHN0cmlwcGVkIG91dC4gKi9cbiAgY29uc3Qgc3RyaXBwZWRDb21taXRNc2cgPSBmdWxsVGV4dC5yZXBsYWNlKEZJWFVQX1BSRUZJWF9SRSwgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKFNRVUFTSF9QUkVGSVhfUkUsICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZShSRVZFUlRfUFJFRklYX1JFLCAnJyk7XG4gIC8qKiBUaGUgaW5pdGlhbGx5IHBhcnNlZCBjb21taXQuICovXG4gIGNvbnN0IGNvbW1pdCA9IHBhcnNlKHN0cmlwcGVkQ29tbWl0TXNnLCBwYXJzZU9wdGlvbnMpO1xuICAvKiogQSBsaXN0IG9mIGJyZWFraW5nIGNoYW5nZSBub3RlcyBmcm9tIHRoZSBjb21taXQuICovXG4gIGNvbnN0IGJyZWFraW5nQ2hhbmdlczogUGFyc2VkQ29tbWl0Lk5vdGVbXSA9IFtdO1xuICAvKiogQSBsaXN0IG9mIGRlcHJlY2F0aW9uIG5vdGVzIGZyb20gdGhlIGNvbW1pdC4gKi9cbiAgY29uc3QgZGVwcmVjYXRpb25zOiBQYXJzZWRDb21taXQuTm90ZVtdID0gW107XG5cbiAgLy8gRXh0cmFjdCB0aGUgY29tbWl0IG1lc3NhZ2Ugbm90ZXMgYnkgbWFya2VkIHR5cGVzIGludG8gdGhlaXIgcmVzcGVjdGl2ZSBsaXN0cy5cbiAgY29tbWl0Lm5vdGVzLmZvckVhY2goKG5vdGU6IFBhcnNlZENvbW1pdC5Ob3RlKSA9PiB7XG4gICAgaWYgKG5vdGUudGl0bGUgPT09IE5vdGVTZWN0aW9ucy5CUkVBS0lOR19DSEFOR0UpIHtcbiAgICAgIHJldHVybiBicmVha2luZ0NoYW5nZXMucHVzaChub3RlKTtcbiAgICB9XG4gICAgaWYgKG5vdGUudGl0bGUgPT09IE5vdGVTZWN0aW9ucy5ERVBSRUNBVEVEKSB7XG4gICAgICByZXR1cm4gZGVwcmVjYXRpb25zLnB1c2gobm90ZSk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4ge1xuICAgIGZ1bGxUZXh0LFxuICAgIGJyZWFraW5nQ2hhbmdlcyxcbiAgICBkZXByZWNhdGlvbnMsXG4gICAgYm9keTogY29tbWl0LmJvZHkgfHwgJycsXG4gICAgZm9vdGVyOiBjb21taXQuZm9vdGVyIHx8ICcnLFxuICAgIGhlYWRlcjogY29tbWl0LmhlYWRlciB8fCAnJyxcbiAgICByZWZlcmVuY2VzOiBjb21taXQucmVmZXJlbmNlcyxcbiAgICBzY29wZTogY29tbWl0LnNjb3BlIHx8ICcnLFxuICAgIHN1YmplY3Q6IGNvbW1pdC5zdWJqZWN0IHx8ICcnLFxuICAgIHR5cGU6IGNvbW1pdC50eXBlIHx8ICcnLFxuICAgIG5wbVNjb3BlOiBjb21taXQubnBtU2NvcGUgfHwgJycsXG4gICAgaXNGaXh1cDogRklYVVBfUFJFRklYX1JFLnRlc3QoZnVsbFRleHQpLFxuICAgIGlzU3F1YXNoOiBTUVVBU0hfUFJFRklYX1JFLnRlc3QoZnVsbFRleHQpLFxuICAgIGlzUmV2ZXJ0OiBSRVZFUlRfUFJFRklYX1JFLnRlc3QoZnVsbFRleHQpLFxuICB9O1xufVxuIl19