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
        define("@angular/dev-infra-private/release/notes/context", ["require", "exports", "tslib", "@angular/dev-infra-private/commit-message/config"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildDateStamp = exports.RenderContext = void 0;
    var tslib_1 = require("tslib");
    var config_1 = require("@angular/dev-infra-private/commit-message/config");
    /** List of types to be included in the release notes. */
    var typesToIncludeInReleaseNotes = Object.values(config_1.COMMIT_TYPES)
        .filter(function (type) { return type.releaseNotesLevel === config_1.ReleaseNotesLevel.Visible; })
        .map(function (type) { return type.name; });
    /** Context class used for rendering release notes. */
    var RenderContext = /** @class */ (function () {
        function RenderContext(data) {
            this.data = data;
            /** An array of group names in sort order if defined. */
            this.groupOrder = this.data.groupOrder || [];
            /** An array of scopes to hide from the release entry output. */
            this.hiddenScopes = this.data.hiddenScopes || [];
            /** The title of the release, or `false` if no title should be used. */
            this.title = this.data.title;
            /** An array of commits in the release period. */
            this.commits = this.data.commits;
            /** The version of the release. */
            this.version = this.data.version;
            /** The date stamp string for use in the release notes entry. */
            this.dateStamp = buildDateStamp(this.data.date);
        }
        /**
         * Organizes and sorts the commits into groups of commits.
         *
         * Groups are sorted either by default `Array.sort` order, or using the provided group order from
         * the configuration. Commits are order in the same order within each groups commit list as they
         * appear in the provided list of commits.
         * */
        RenderContext.prototype.asCommitGroups = function (commits) {
            var e_1, _a;
            /** The discovered groups to organize into. */
            var groups = new Map();
            // Place each commit in the list into its group.
            commits.forEach(function (commit) {
                var key = commit.npmScope ? commit.npmScope + "/" + commit.scope : commit.scope;
                var groupCommits = groups.get(key) || [];
                groups.set(key, groupCommits);
                groupCommits.push(commit);
            });
            /**
             * Array of CommitGroups containing the discovered commit groups. Sorted in alphanumeric order
             * of the group title.
             */
            var commitGroups = Array.from(groups.entries())
                .map(function (_a) {
                var _b = tslib_1.__read(_a, 2), title = _b[0], commits = _b[1];
                return ({ title: title, commits: commits });
            })
                .sort(function (a, b) { return a.title > b.title ? 1 : a.title < b.title ? -1 : 0; });
            // If the configuration provides a sorting order, updated the sorted list of group keys to
            // satisfy the order of the groups provided in the list with any groups not found in the list at
            // the end of the sorted list.
            if (this.groupOrder.length) {
                var _loop_1 = function (groupTitle) {
                    var currentIdx = commitGroups.findIndex(function (k) { return k.title === groupTitle; });
                    if (currentIdx !== -1) {
                        var removedGroups = commitGroups.splice(currentIdx, 1);
                        commitGroups.splice.apply(commitGroups, tslib_1.__spreadArray([0, 0], tslib_1.__read(removedGroups)));
                    }
                };
                try {
                    for (var _b = tslib_1.__values(this.groupOrder.reverse()), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var groupTitle = _c.value;
                        _loop_1(groupTitle);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            return commitGroups;
        };
        /**
         * A filter function for filtering a list of commits to only include commits which should appear
         * in release notes.
         */
        RenderContext.prototype.includeInReleaseNotes = function () {
            var _this = this;
            return function (commit) {
                if (!typesToIncludeInReleaseNotes.includes(commit.type)) {
                    return false;
                }
                if (_this.hiddenScopes.includes(commit.scope)) {
                    return false;
                }
                return true;
            };
        };
        /**
         * A filter function for filtering a list of commits to only include commits which contain a
         * truthy value, or for arrays an array with 1 or more elements, for the provided field.
         */
        RenderContext.prototype.contains = function (field) {
            return function (commit) {
                var fieldValue = commit[field];
                if (!fieldValue) {
                    return false;
                }
                if (Array.isArray(fieldValue) && fieldValue.length === 0) {
                    return false;
                }
                return true;
            };
        };
        /**
         * A filter function for filtering a list of commits to only include commits which contain a
         * unique value for the provided field across all commits in the list.
         */
        RenderContext.prototype.unique = function (field) {
            var set = new Set();
            return function (commit) {
                var include = !set.has(commit[field]);
                set.add(commit[field]);
                return include;
            };
        };
        /**
         * Convert a commit object to a Markdown link.
         */
        RenderContext.prototype.commitToLink = function (commit) {
            var url = "https://github.com/" + this.data.github.owner + "/" + this.data.github.name + "/commit/" + commit.hash;
            return "[" + commit.shortHash + "](" + url + ")";
        };
        /**
         * Convert a pull request number to a Markdown link.
         */
        RenderContext.prototype.pullRequestToLink = function (prNumber) {
            var url = "https://github.com/" + this.data.github.owner + "/" + this.data.github.name + "/pull/" + prNumber;
            return "[#" + prNumber + "](" + url + ")";
        };
        /**
         * Transform a commit message header by replacing the parenthesized pull request reference at the
         * end of the line (which is added by merge tooling) to a Markdown link.
         */
        RenderContext.prototype.replaceCommitHeaderPullRequestNumber = function (header) {
            var _this = this;
            return header.replace(/\(#(\d+)\)$/, function (_, g) { return "(" + _this.pullRequestToLink(+g) + ")"; });
        };
        return RenderContext;
    }());
    exports.RenderContext = RenderContext;
    /**
     * Builds a date stamp for stamping in release notes.
     *
     * Uses the current date, or a provided date in the format of YYYY-MM-DD, i.e. 1970-11-05.
     */
    function buildDateStamp(date) {
        if (date === void 0) { date = new Date(); }
        var year = "" + date.getFullYear();
        var month = ("" + (date.getMonth() + 1)).padStart(2, '0');
        var day = ("" + date.getDate()).padStart(2, '0');
        return [year, month, day].join('-');
    }
    exports.buildDateStamp = buildDateStamp;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL25vdGVzL2NvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDJFQUE0RTtJQU01RSx5REFBeUQ7SUFDekQsSUFBTSw0QkFBNEIsR0FDOUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxxQkFBWSxDQUFDO1NBQ3RCLE1BQU0sQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLElBQUksQ0FBQyxpQkFBaUIsS0FBSywwQkFBaUIsQ0FBQyxPQUFPLEVBQXBELENBQW9ELENBQUM7U0FDcEUsR0FBRyxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsSUFBSSxDQUFDLElBQUksRUFBVCxDQUFTLENBQUMsQ0FBQztJQWFoQyxzREFBc0Q7SUFDdEQ7UUFjRSx1QkFBNkIsSUFBdUI7WUFBdkIsU0FBSSxHQUFKLElBQUksQ0FBbUI7WUFicEQsd0RBQXdEO1lBQ3ZDLGVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUM7WUFDekQsZ0VBQWdFO1lBQy9DLGlCQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksRUFBRSxDQUFDO1lBQzdELHVFQUF1RTtZQUM5RCxVQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDakMsaURBQWlEO1lBQ3hDLFlBQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUNyQyxrQ0FBa0M7WUFDekIsWUFBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ3JDLGdFQUFnRTtZQUN2RCxjQUFTLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFRyxDQUFDO1FBRXhEOzs7Ozs7YUFNSztRQUNMLHNDQUFj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QUFLLFFBQVEsVUFBSyxHQUFHLE1BQUcsQ0FBQztRQUNsQyxDQUFDO1FBRUQ7OztXQUdHO1FBQ0gsNERBQW9DLEdBQXBDLFVBQXFDLE1BQWM7WUFBbkQsaUJBRUM7WUFEQyxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLE1BQUksS0FBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQUcsRUFBakMsQ0FBaUMsQ0FBQyxDQUFDO1FBQ3BGLENBQUM7UUFDSCxvQkFBQztJQUFELENBQUMsQUFuSUQsSUFtSUM7SUFuSVksc0NBQWE7SUFzSTFCOzs7O09BSUc7SUFDSCxTQUFnQixjQUFjLENBQUMsSUFBaUI7UUFBakIscUJBQUEsRUFBQSxXQUFXLElBQUksRUFBRTtRQUM5QyxJQUFNLElBQUksR0FBRyxLQUFHLElBQUksQ0FBQyxXQUFXLEVBQUksQ0FBQztRQUNyQyxJQUFNLEtBQUssR0FBRyxDQUFBLEtBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFHLENBQUEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzFELElBQU0sR0FBRyxHQUFHLENBQUEsS0FBRyxJQUFJLENBQUMsT0FBTyxFQUFJLENBQUEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRWpELE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBTkQsd0NBTUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDT01NSVRfVFlQRVMsIFJlbGVhc2VOb3Rlc0xldmVsfSBmcm9tICcuLi8uLi9jb21taXQtbWVzc2FnZS9jb25maWcnO1xuaW1wb3J0IHtDb21taXRGcm9tR2l0TG9nfSBmcm9tICcuLi8uLi9jb21taXQtbWVzc2FnZS9wYXJzZSc7XG5pbXBvcnQge0dpdGh1YkNvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7UmVsZWFzZU5vdGVzQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuXG5cbi8qKiBMaXN0IG9mIHR5cGVzIHRvIGJlIGluY2x1ZGVkIGluIHRoZSByZWxlYXNlIG5vdGVzLiAqL1xuY29uc3QgdHlwZXNUb0luY2x1ZGVJblJlbGVhc2VOb3RlcyA9XG4gICAgT2JqZWN0LnZhbHVlcyhDT01NSVRfVFlQRVMpXG4gICAgICAgIC5maWx0ZXIodHlwZSA9PiB0eXBlLnJlbGVhc2VOb3Rlc0xldmVsID09PSBSZWxlYXNlTm90ZXNMZXZlbC5WaXNpYmxlKVxuICAgICAgICAubWFwKHR5cGUgPT4gdHlwZS5uYW1lKTtcblxuLyoqIERhdGEgdXNlZCBmb3IgY29udGV4dCBkdXJpbmcgcmVuZGVyaW5nLiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZW5kZXJDb250ZXh0RGF0YSB7XG4gIHRpdGxlOiBzdHJpbmd8ZmFsc2U7XG4gIGdyb3VwT3JkZXI/OiBSZWxlYXNlTm90ZXNDb25maWdbJ2dyb3VwT3JkZXInXTtcbiAgaGlkZGVuU2NvcGVzPzogUmVsZWFzZU5vdGVzQ29uZmlnWydoaWRkZW5TY29wZXMnXTtcbiAgZGF0ZT86IERhdGU7XG4gIGNvbW1pdHM6IENvbW1pdEZyb21HaXRMb2dbXTtcbiAgdmVyc2lvbjogc3RyaW5nO1xuICBnaXRodWI6IEdpdGh1YkNvbmZpZztcbn1cblxuLyoqIENvbnRleHQgY2xhc3MgdXNlZCBmb3IgcmVuZGVyaW5nIHJlbGVhc2Ugbm90ZXMuICovXG5leHBvcnQgY2xhc3MgUmVuZGVyQ29udGV4dCB7XG4gIC8qKiBBbiBhcnJheSBvZiBncm91cCBuYW1lcyBpbiBzb3J0IG9yZGVyIGlmIGRlZmluZWQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgZ3JvdXBPcmRlciA9IHRoaXMuZGF0YS5ncm91cE9yZGVyIHx8IFtdO1xuICAvKiogQW4gYXJyYXkgb2Ygc2NvcGVzIHRvIGhpZGUgZnJvbSB0aGUgcmVsZWFzZSBlbnRyeSBvdXRwdXQuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgaGlkZGVuU2NvcGVzID0gdGhpcy5kYXRhLmhpZGRlblNjb3BlcyB8fCBbXTtcbiAgLyoqIFRoZSB0aXRsZSBvZiB0aGUgcmVsZWFzZSwgb3IgYGZhbHNlYCBpZiBubyB0aXRsZSBzaG91bGQgYmUgdXNlZC4gKi9cbiAgcmVhZG9ubHkgdGl0bGUgPSB0aGlzLmRhdGEudGl0bGU7XG4gIC8qKiBBbiBhcnJheSBvZiBjb21taXRzIGluIHRoZSByZWxlYXNlIHBlcmlvZC4gKi9cbiAgcmVhZG9ubHkgY29tbWl0cyA9IHRoaXMuZGF0YS5jb21taXRzO1xuICAvKiogVGhlIHZlcnNpb24gb2YgdGhlIHJlbGVhc2UuICovXG4gIHJlYWRvbmx5IHZlcnNpb24gPSB0aGlzLmRhdGEudmVyc2lvbjtcbiAgLyoqIFRoZSBkYXRlIHN0YW1wIHN0cmluZyBmb3IgdXNlIGluIHRoZSByZWxlYXNlIG5vdGVzIGVudHJ5LiAqL1xuICByZWFkb25seSBkYXRlU3RhbXAgPSBidWlsZERhdGVTdGFtcCh0aGlzLmRhdGEuZGF0ZSk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBkYXRhOiBSZW5kZXJDb250ZXh0RGF0YSkge31cblxuICAvKipcbiAgICogT3JnYW5pemVzIGFuZCBzb3J0cyB0aGUgY29tbWl0cyBpbnRvIGdyb3VwcyBvZiBjb21taXRzLlxuICAgKlxuICAgKiBHcm91cHMgYXJlIHNvcnRlZCBlaXRoZXIgYnkgZGVmYXVsdCBgQXJyYXkuc29ydGAgb3JkZXIsIG9yIHVzaW5nIHRoZSBwcm92aWRlZCBncm91cCBvcmRlciBmcm9tXG4gICAqIHRoZSBjb25maWd1cmF0aW9uLiBDb21taXRzIGFyZSBvcmRlciBpbiB0aGUgc2FtZSBvcmRlciB3aXRoaW4gZWFjaCBncm91cHMgY29tbWl0IGxpc3QgYXMgdGhleVxuICAgKiBhcHBlYXIgaW4gdGhlIHByb3ZpZGVkIGxpc3Qgb2YgY29tbWl0cy5cbiAgICogKi9cbiAgYXNDb21taXRHcm91cHMoY29tbWl0czogQ29tbWl0RnJvbUdpdExvZ1tdKSB7XG4gICAgLyoqIFRoZSBkaXNjb3ZlcmVkIGdyb3VwcyB0byBvcmdhbml6ZSBpbnRvLiAqL1xuICAgIGNvbnN0IGdyb3VwcyA9IG5ldyBNYXA8c3RyaW5nLCBDb21taXRGcm9tR2l0TG9nW10+KCk7XG5cbiAgICAvLyBQbGFjZSBlYWNoIGNvbW1pdCBpbiB0aGUgbGlzdCBpbnRvIGl0cyBncm91cC5cbiAgICBjb21taXRzLmZvckVhY2goY29tbWl0ID0+IHtcbiAgICAgIGNvbnN0IGtleSA9IGNvbW1pdC5ucG1TY29wZSA/IGAke2NvbW1pdC5ucG1TY29wZX0vJHtjb21taXQuc2NvcGV9YCA6IGNvbW1pdC5zY29wZTtcbiAgICAgIGNvbnN0IGdyb3VwQ29tbWl0cyA9IGdyb3Vwcy5nZXQoa2V5KSB8fCBbXTtcbiAgICAgIGdyb3Vwcy5zZXQoa2V5LCBncm91cENvbW1pdHMpO1xuICAgICAgZ3JvdXBDb21taXRzLnB1c2goY29tbWl0KTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIEFycmF5IG9mIENvbW1pdEdyb3VwcyBjb250YWluaW5nIHRoZSBkaXNjb3ZlcmVkIGNvbW1pdCBncm91cHMuIFNvcnRlZCBpbiBhbHBoYW51bWVyaWMgb3JkZXJcbiAgICAgKiBvZiB0aGUgZ3JvdXAgdGl0bGUuXG4gICAgICovXG4gICAgY29uc3QgY29tbWl0R3JvdXBzID0gQXJyYXkuZnJvbShncm91cHMuZW50cmllcygpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKChbdGl0bGUsIGNvbW1pdHNdKSA9PiAoe3RpdGxlLCBjb21taXRzfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zb3J0KChhLCBiKSA9PiBhLnRpdGxlID4gYi50aXRsZSA/IDEgOiBhLnRpdGxlIDwgYi50aXRsZSA/IC0xIDogMCk7XG5cbiAgICAvLyBJZiB0aGUgY29uZmlndXJhdGlvbiBwcm92aWRlcyBhIHNvcnRpbmcgb3JkZXIsIHVwZGF0ZWQgdGhlIHNvcnRlZCBsaXN0IG9mIGdyb3VwIGtleXMgdG9cbiAgICAvLyBzYXRpc2Z5IHRoZSBvcmRlciBvZiB0aGUgZ3JvdXBzIHByb3ZpZGVkIGluIHRoZSBsaXN0IHdpdGggYW55IGdyb3VwcyBub3QgZm91bmQgaW4gdGhlIGxpc3QgYXRcbiAgICAvLyB0aGUgZW5kIG9mIHRoZSBzb3J0ZWQgbGlzdC5cbiAgICBpZiAodGhpcy5ncm91cE9yZGVyLmxlbmd0aCkge1xuICAgICAgZm9yIChjb25zdCBncm91cFRpdGxlIG9mIHRoaXMuZ3JvdXBPcmRlci5yZXZlcnNlKCkpIHtcbiAgICAgICAgY29uc3QgY3VycmVudElkeCA9IGNvbW1pdEdyb3Vwcy5maW5kSW5kZXgoayA9PiBrLnRpdGxlID09PSBncm91cFRpdGxlKTtcbiAgICAgICAgaWYgKGN1cnJlbnRJZHggIT09IC0xKSB7XG4gICAgICAgICAgY29uc3QgcmVtb3ZlZEdyb3VwcyA9IGNvbW1pdEdyb3Vwcy5zcGxpY2UoY3VycmVudElkeCwgMSk7XG4gICAgICAgICAgY29tbWl0R3JvdXBzLnNwbGljZSgwLCAwLCAuLi5yZW1vdmVkR3JvdXBzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY29tbWl0R3JvdXBzO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgZmlsdGVyIGZ1bmN0aW9uIGZvciBmaWx0ZXJpbmcgYSBsaXN0IG9mIGNvbW1pdHMgdG8gb25seSBpbmNsdWRlIGNvbW1pdHMgd2hpY2ggc2hvdWxkIGFwcGVhclxuICAgKiBpbiByZWxlYXNlIG5vdGVzLlxuICAgKi9cbiAgaW5jbHVkZUluUmVsZWFzZU5vdGVzKCkge1xuICAgIHJldHVybiAoY29tbWl0OiBDb21taXRGcm9tR2l0TG9nKSA9PiB7XG4gICAgICBpZiAoIXR5cGVzVG9JbmNsdWRlSW5SZWxlYXNlTm90ZXMuaW5jbHVkZXMoY29tbWl0LnR5cGUpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuaGlkZGVuU2NvcGVzLmluY2x1ZGVzKGNvbW1pdC5zY29wZSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGZpbHRlciBmdW5jdGlvbiBmb3IgZmlsdGVyaW5nIGEgbGlzdCBvZiBjb21taXRzIHRvIG9ubHkgaW5jbHVkZSBjb21taXRzIHdoaWNoIGNvbnRhaW4gYVxuICAgKiB0cnV0aHkgdmFsdWUsIG9yIGZvciBhcnJheXMgYW4gYXJyYXkgd2l0aCAxIG9yIG1vcmUgZWxlbWVudHMsIGZvciB0aGUgcHJvdmlkZWQgZmllbGQuXG4gICAqL1xuICBjb250YWlucyhmaWVsZDoga2V5b2YgQ29tbWl0RnJvbUdpdExvZykge1xuICAgIHJldHVybiAoY29tbWl0OiBDb21taXRGcm9tR2l0TG9nKSA9PiB7XG4gICAgICBjb25zdCBmaWVsZFZhbHVlID0gY29tbWl0W2ZpZWxkXTtcbiAgICAgIGlmICghZmllbGRWYWx1ZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGZpZWxkVmFsdWUpICYmIGZpZWxkVmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQSBmaWx0ZXIgZnVuY3Rpb24gZm9yIGZpbHRlcmluZyBhIGxpc3Qgb2YgY29tbWl0cyB0byBvbmx5IGluY2x1ZGUgY29tbWl0cyB3aGljaCBjb250YWluIGFcbiAgICogdW5pcXVlIHZhbHVlIGZvciB0aGUgcHJvdmlkZWQgZmllbGQgYWNyb3NzIGFsbCBjb21taXRzIGluIHRoZSBsaXN0LlxuICAgKi9cbiAgdW5pcXVlKGZpZWxkOiBrZXlvZiBDb21taXRGcm9tR2l0TG9nKSB7XG4gICAgY29uc3Qgc2V0ID0gbmV3IFNldDxDb21taXRGcm9tR2l0TG9nW3R5cGVvZiBmaWVsZF0+KCk7XG4gICAgcmV0dXJuIChjb21taXQ6IENvbW1pdEZyb21HaXRMb2cpID0+IHtcbiAgICAgIGNvbnN0IGluY2x1ZGUgPSAhc2V0Lmhhcyhjb21taXRbZmllbGRdKTtcbiAgICAgIHNldC5hZGQoY29tbWl0W2ZpZWxkXSk7XG4gICAgICByZXR1cm4gaW5jbHVkZTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgYSBjb21taXQgb2JqZWN0IHRvIGEgTWFya2Rvd24gbGluay5cbiAgICovXG4gIGNvbW1pdFRvTGluayhjb21taXQ6IENvbW1pdEZyb21HaXRMb2cpOiBzdHJpbmcge1xuICAgIGNvbnN0IHVybCA9IGBodHRwczovL2dpdGh1Yi5jb20vJHt0aGlzLmRhdGEuZ2l0aHViLm93bmVyfS8ke3RoaXMuZGF0YS5naXRodWIubmFtZX0vY29tbWl0LyR7XG4gICAgICAgIGNvbW1pdC5oYXNofWA7XG4gICAgcmV0dXJuIGBbJHtjb21taXQuc2hvcnRIYXNofV0oJHt1cmx9KWA7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCBhIHB1bGwgcmVxdWVzdCBudW1iZXIgdG8gYSBNYXJrZG93biBsaW5rLlxuICAgKi9cbiAgcHVsbFJlcXVlc3RUb0xpbmsocHJOdW1iZXI6IG51bWJlcik6IHN0cmluZyB7XG4gICAgY29uc3QgdXJsID1cbiAgICAgICAgYGh0dHBzOi8vZ2l0aHViLmNvbS8ke3RoaXMuZGF0YS5naXRodWIub3duZXJ9LyR7dGhpcy5kYXRhLmdpdGh1Yi5uYW1lfS9wdWxsLyR7cHJOdW1iZXJ9YDtcbiAgICByZXR1cm4gYFsjJHtwck51bWJlcn1dKCR7dXJsfSlgO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zZm9ybSBhIGNvbW1pdCBtZXNzYWdlIGhlYWRlciBieSByZXBsYWNpbmcgdGhlIHBhcmVudGhlc2l6ZWQgcHVsbCByZXF1ZXN0IHJlZmVyZW5jZSBhdCB0aGVcbiAgICogZW5kIG9mIHRoZSBsaW5lICh3aGljaCBpcyBhZGRlZCBieSBtZXJnZSB0b29saW5nKSB0byBhIE1hcmtkb3duIGxpbmsuXG4gICAqL1xuICByZXBsYWNlQ29tbWl0SGVhZGVyUHVsbFJlcXVlc3ROdW1iZXIoaGVhZGVyOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBoZWFkZXIucmVwbGFjZSgvXFwoIyhcXGQrKVxcKSQvLCAoXywgZykgPT4gYCgke3RoaXMucHVsbFJlcXVlc3RUb0xpbmsoK2cpfSlgKTtcbiAgfVxufVxuXG5cbi8qKlxuICogQnVpbGRzIGEgZGF0ZSBzdGFtcCBmb3Igc3RhbXBpbmcgaW4gcmVsZWFzZSBub3Rlcy5cbiAqXG4gKiBVc2VzIHRoZSBjdXJyZW50IGRhdGUsIG9yIGEgcHJvdmlkZWQgZGF0ZSBpbiB0aGUgZm9ybWF0IG9mIFlZWVktTU0tREQsIGkuZS4gMTk3MC0xMS0wNS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkRGF0ZVN0YW1wKGRhdGUgPSBuZXcgRGF0ZSgpKSB7XG4gIGNvbnN0IHllYXIgPSBgJHtkYXRlLmdldEZ1bGxZZWFyKCl9YDtcbiAgY29uc3QgbW9udGggPSBgJHsoZGF0ZS5nZXRNb250aCgpICsgMSl9YC5wYWRTdGFydCgyLCAnMCcpO1xuICBjb25zdCBkYXkgPSBgJHtkYXRlLmdldERhdGUoKX1gLnBhZFN0YXJ0KDIsICcwJyk7XG5cbiAgcmV0dXJuIFt5ZWFyLCBtb250aCwgZGF5XS5qb2luKCctJyk7XG59XG4iXX0=