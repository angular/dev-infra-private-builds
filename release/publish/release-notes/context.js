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
        define("@angular/dev-infra-private/release/publish/release-notes/context", ["require", "exports", "tslib", "@angular/dev-infra-private/commit-message/config"], factory);
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
                        commitGroups.splice.apply(commitGroups, tslib_1.__spread([0, 0], removedGroups));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvcmVsZWFzZS1ub3Rlcy9jb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwyRUFBK0U7SUFNL0UseURBQXlEO0lBQ3pELElBQU0sNEJBQTRCLEdBQzlCLE1BQU0sQ0FBQyxNQUFNLENBQUMscUJBQVksQ0FBQztTQUN0QixNQUFNLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLENBQUMsaUJBQWlCLEtBQUssMEJBQWlCLENBQUMsT0FBTyxFQUFwRCxDQUFvRCxDQUFDO1NBQ3BFLEdBQUcsQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLElBQUksQ0FBQyxJQUFJLEVBQVQsQ0FBUyxDQUFDLENBQUM7SUFhaEMsc0RBQXNEO0lBQ3REO1FBY0UsdUJBQTZCLElBQXVCO1lBQXZCLFNBQUksR0FBSixJQUFJLENBQW1CO1lBYnBELHdEQUF3RDtZQUN2QyxlQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFDO1lBQ3pELGdFQUFnRTtZQUMvQyxpQkFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQztZQUM3RCx1RUFBdUU7WUFDOUQsVUFBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ2pDLGlEQUFpRDtZQUN4QyxZQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDckMsa0NBQWtDO1lBQ3pCLFlBQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUNyQyxnRUFBZ0U7WUFDdkQsY0FBUyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRUcsQ0FBQztRQUV4RDs7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QUVqRCxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQU5ELHdDQU1DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q09NTUlUX1RZUEVTLCBSZWxlYXNlTm90ZXNMZXZlbH0gZnJvbSAnLi4vLi4vLi4vY29tbWl0LW1lc3NhZ2UvY29uZmlnJztcbmltcG9ydCB7Q29tbWl0RnJvbUdpdExvZ30gZnJvbSAnLi4vLi4vLi4vY29tbWl0LW1lc3NhZ2UvcGFyc2UnO1xuaW1wb3J0IHtHaXRodWJDb25maWd9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge1JlbGVhc2VOb3Rlc0NvbmZpZ30gZnJvbSAnLi4vLi4vY29uZmlnL2luZGV4JztcblxuXG4vKiogTGlzdCBvZiB0eXBlcyB0byBiZSBpbmNsdWRlZCBpbiB0aGUgcmVsZWFzZSBub3Rlcy4gKi9cbmNvbnN0IHR5cGVzVG9JbmNsdWRlSW5SZWxlYXNlTm90ZXMgPVxuICAgIE9iamVjdC52YWx1ZXMoQ09NTUlUX1RZUEVTKVxuICAgICAgICAuZmlsdGVyKHR5cGUgPT4gdHlwZS5yZWxlYXNlTm90ZXNMZXZlbCA9PT0gUmVsZWFzZU5vdGVzTGV2ZWwuVmlzaWJsZSlcbiAgICAgICAgLm1hcCh0eXBlID0+IHR5cGUubmFtZSk7XG5cbi8qKiBEYXRhIHVzZWQgZm9yIGNvbnRleHQgZHVyaW5nIHJlbmRlcmluZy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyQ29udGV4dERhdGEge1xuICB0aXRsZTogc3RyaW5nfGZhbHNlO1xuICBncm91cE9yZGVyPzogUmVsZWFzZU5vdGVzQ29uZmlnWydncm91cE9yZGVyJ107XG4gIGhpZGRlblNjb3Blcz86IFJlbGVhc2VOb3Rlc0NvbmZpZ1snaGlkZGVuU2NvcGVzJ107XG4gIGRhdGU/OiBEYXRlO1xuICBjb21taXRzOiBDb21taXRGcm9tR2l0TG9nW107XG4gIHZlcnNpb246IHN0cmluZztcbiAgZ2l0aHViOiBHaXRodWJDb25maWc7XG59XG5cbi8qKiBDb250ZXh0IGNsYXNzIHVzZWQgZm9yIHJlbmRlcmluZyByZWxlYXNlIG5vdGVzLiAqL1xuZXhwb3J0IGNsYXNzIFJlbmRlckNvbnRleHQge1xuICAvKiogQW4gYXJyYXkgb2YgZ3JvdXAgbmFtZXMgaW4gc29ydCBvcmRlciBpZiBkZWZpbmVkLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IGdyb3VwT3JkZXIgPSB0aGlzLmRhdGEuZ3JvdXBPcmRlciB8fCBbXTtcbiAgLyoqIEFuIGFycmF5IG9mIHNjb3BlcyB0byBoaWRlIGZyb20gdGhlIHJlbGVhc2UgZW50cnkgb3V0cHV0LiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IGhpZGRlblNjb3BlcyA9IHRoaXMuZGF0YS5oaWRkZW5TY29wZXMgfHwgW107XG4gIC8qKiBUaGUgdGl0bGUgb2YgdGhlIHJlbGVhc2UsIG9yIGBmYWxzZWAgaWYgbm8gdGl0bGUgc2hvdWxkIGJlIHVzZWQuICovXG4gIHJlYWRvbmx5IHRpdGxlID0gdGhpcy5kYXRhLnRpdGxlO1xuICAvKiogQW4gYXJyYXkgb2YgY29tbWl0cyBpbiB0aGUgcmVsZWFzZSBwZXJpb2QuICovXG4gIHJlYWRvbmx5IGNvbW1pdHMgPSB0aGlzLmRhdGEuY29tbWl0cztcbiAgLyoqIFRoZSB2ZXJzaW9uIG9mIHRoZSByZWxlYXNlLiAqL1xuICByZWFkb25seSB2ZXJzaW9uID0gdGhpcy5kYXRhLnZlcnNpb247XG4gIC8qKiBUaGUgZGF0ZSBzdGFtcCBzdHJpbmcgZm9yIHVzZSBpbiB0aGUgcmVsZWFzZSBub3RlcyBlbnRyeS4gKi9cbiAgcmVhZG9ubHkgZGF0ZVN0YW1wID0gYnVpbGREYXRlU3RhbXAodGhpcy5kYXRhLmRhdGUpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgZGF0YTogUmVuZGVyQ29udGV4dERhdGEpIHt9XG5cbiAgLyoqXG4gICAqIE9yZ2FuaXplcyBhbmQgc29ydHMgdGhlIGNvbW1pdHMgaW50byBncm91cHMgb2YgY29tbWl0cy5cbiAgICpcbiAgICogR3JvdXBzIGFyZSBzb3J0ZWQgZWl0aGVyIGJ5IGRlZmF1bHQgYEFycmF5LnNvcnRgIG9yZGVyLCBvciB1c2luZyB0aGUgcHJvdmlkZWQgZ3JvdXAgb3JkZXIgZnJvbVxuICAgKiB0aGUgY29uZmlndXJhdGlvbi4gQ29tbWl0cyBhcmUgb3JkZXIgaW4gdGhlIHNhbWUgb3JkZXIgd2l0aGluIGVhY2ggZ3JvdXBzIGNvbW1pdCBsaXN0IGFzIHRoZXlcbiAgICogYXBwZWFyIGluIHRoZSBwcm92aWRlZCBsaXN0IG9mIGNvbW1pdHMuXG4gICAqICovXG4gIGFzQ29tbWl0R3JvdXBzKGNvbW1pdHM6IENvbW1pdEZyb21HaXRMb2dbXSkge1xuICAgIC8qKiBUaGUgZGlzY292ZXJlZCBncm91cHMgdG8gb3JnYW5pemUgaW50by4gKi9cbiAgICBjb25zdCBncm91cHMgPSBuZXcgTWFwPHN0cmluZywgQ29tbWl0RnJvbUdpdExvZ1tdPigpO1xuXG4gICAgLy8gUGxhY2UgZWFjaCBjb21taXQgaW4gdGhlIGxpc3QgaW50byBpdHMgZ3JvdXAuXG4gICAgY29tbWl0cy5mb3JFYWNoKGNvbW1pdCA9PiB7XG4gICAgICBjb25zdCBrZXkgPSBjb21taXQubnBtU2NvcGUgPyBgJHtjb21taXQubnBtU2NvcGV9LyR7Y29tbWl0LnNjb3BlfWAgOiBjb21taXQuc2NvcGU7XG4gICAgICBjb25zdCBncm91cENvbW1pdHMgPSBncm91cHMuZ2V0KGtleSkgfHwgW107XG4gICAgICBncm91cHMuc2V0KGtleSwgZ3JvdXBDb21taXRzKTtcbiAgICAgIGdyb3VwQ29tbWl0cy5wdXNoKGNvbW1pdCk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBBcnJheSBvZiBDb21taXRHcm91cHMgY29udGFpbmluZyB0aGUgZGlzY292ZXJlZCBjb21taXQgZ3JvdXBzLiBTb3J0ZWQgaW4gYWxwaGFudW1lcmljIG9yZGVyXG4gICAgICogb2YgdGhlIGdyb3VwIHRpdGxlLlxuICAgICAqL1xuICAgIGNvbnN0IGNvbW1pdEdyb3VwcyA9IEFycmF5LmZyb20oZ3JvdXBzLmVudHJpZXMoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCgoW3RpdGxlLCBjb21taXRzXSkgPT4gKHt0aXRsZSwgY29tbWl0c30pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc29ydCgoYSwgYikgPT4gYS50aXRsZSA+IGIudGl0bGUgPyAxIDogYS50aXRsZSA8IGIudGl0bGUgPyAtMSA6IDApO1xuXG4gICAgLy8gSWYgdGhlIGNvbmZpZ3VyYXRpb24gcHJvdmlkZXMgYSBzb3J0aW5nIG9yZGVyLCB1cGRhdGVkIHRoZSBzb3J0ZWQgbGlzdCBvZiBncm91cCBrZXlzIHRvXG4gICAgLy8gc2F0aXNmeSB0aGUgb3JkZXIgb2YgdGhlIGdyb3VwcyBwcm92aWRlZCBpbiB0aGUgbGlzdCB3aXRoIGFueSBncm91cHMgbm90IGZvdW5kIGluIHRoZSBsaXN0IGF0XG4gICAgLy8gdGhlIGVuZCBvZiB0aGUgc29ydGVkIGxpc3QuXG4gICAgaWYgKHRoaXMuZ3JvdXBPcmRlci5sZW5ndGgpIHtcbiAgICAgIGZvciAoY29uc3QgZ3JvdXBUaXRsZSBvZiB0aGlzLmdyb3VwT3JkZXIucmV2ZXJzZSgpKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRJZHggPSBjb21taXRHcm91cHMuZmluZEluZGV4KGsgPT4gay50aXRsZSA9PT0gZ3JvdXBUaXRsZSk7XG4gICAgICAgIGlmIChjdXJyZW50SWR4ICE9PSAtMSkge1xuICAgICAgICAgIGNvbnN0IHJlbW92ZWRHcm91cHMgPSBjb21taXRHcm91cHMuc3BsaWNlKGN1cnJlbnRJZHgsIDEpO1xuICAgICAgICAgIGNvbW1pdEdyb3Vwcy5zcGxpY2UoMCwgMCwgLi4ucmVtb3ZlZEdyb3Vwcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvbW1pdEdyb3VwcztcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGZpbHRlciBmdW5jdGlvbiBmb3IgZmlsdGVyaW5nIGEgbGlzdCBvZiBjb21taXRzIHRvIG9ubHkgaW5jbHVkZSBjb21taXRzIHdoaWNoIHNob3VsZCBhcHBlYXJcbiAgICogaW4gcmVsZWFzZSBub3Rlcy5cbiAgICovXG4gIGluY2x1ZGVJblJlbGVhc2VOb3RlcygpIHtcbiAgICByZXR1cm4gKGNvbW1pdDogQ29tbWl0RnJvbUdpdExvZykgPT4ge1xuICAgICAgaWYgKCF0eXBlc1RvSW5jbHVkZUluUmVsZWFzZU5vdGVzLmluY2x1ZGVzKGNvbW1pdC50eXBlKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmhpZGRlblNjb3Blcy5pbmNsdWRlcyhjb21taXQuc2NvcGUpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQSBmaWx0ZXIgZnVuY3Rpb24gZm9yIGZpbHRlcmluZyBhIGxpc3Qgb2YgY29tbWl0cyB0byBvbmx5IGluY2x1ZGUgY29tbWl0cyB3aGljaCBjb250YWluIGFcbiAgICogdHJ1dGh5IHZhbHVlLCBvciBmb3IgYXJyYXlzIGFuIGFycmF5IHdpdGggMSBvciBtb3JlIGVsZW1lbnRzLCBmb3IgdGhlIHByb3ZpZGVkIGZpZWxkLlxuICAgKi9cbiAgY29udGFpbnMoZmllbGQ6IGtleW9mIENvbW1pdEZyb21HaXRMb2cpIHtcbiAgICByZXR1cm4gKGNvbW1pdDogQ29tbWl0RnJvbUdpdExvZykgPT4ge1xuICAgICAgY29uc3QgZmllbGRWYWx1ZSA9IGNvbW1pdFtmaWVsZF07XG4gICAgICBpZiAoIWZpZWxkVmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShmaWVsZFZhbHVlKSAmJiBmaWVsZFZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEEgZmlsdGVyIGZ1bmN0aW9uIGZvciBmaWx0ZXJpbmcgYSBsaXN0IG9mIGNvbW1pdHMgdG8gb25seSBpbmNsdWRlIGNvbW1pdHMgd2hpY2ggY29udGFpbiBhXG4gICAqIHVuaXF1ZSB2YWx1ZSBmb3IgdGhlIHByb3ZpZGVkIGZpZWxkIGFjcm9zcyBhbGwgY29tbWl0cyBpbiB0aGUgbGlzdC5cbiAgICovXG4gIHVuaXF1ZShmaWVsZDoga2V5b2YgQ29tbWl0RnJvbUdpdExvZykge1xuICAgIGNvbnN0IHNldCA9IG5ldyBTZXQ8Q29tbWl0RnJvbUdpdExvZ1t0eXBlb2YgZmllbGRdPigpO1xuICAgIHJldHVybiAoY29tbWl0OiBDb21taXRGcm9tR2l0TG9nKSA9PiB7XG4gICAgICBjb25zdCBpbmNsdWRlID0gIXNldC5oYXMoY29tbWl0W2ZpZWxkXSk7XG4gICAgICBzZXQuYWRkKGNvbW1pdFtmaWVsZF0pO1xuICAgICAgcmV0dXJuIGluY2x1ZGU7XG4gICAgfTtcbiAgfVxufVxuXG5cbi8qKlxuICogQnVpbGRzIGEgZGF0ZSBzdGFtcCBmb3Igc3RhbXBpbmcgaW4gcmVsZWFzZSBub3Rlcy5cbiAqXG4gKiBVc2VzIHRoZSBjdXJyZW50IGRhdGUsIG9yIGEgcHJvdmlkZWQgZGF0ZSBpbiB0aGUgZm9ybWF0IG9mIFlZWVktTU0tREQsIGkuZS4gMTk3MC0xMS0wNS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkRGF0ZVN0YW1wKGRhdGUgPSBuZXcgRGF0ZSgpKSB7XG4gIGNvbnN0IHllYXIgPSBgJHtkYXRlLmdldEZ1bGxZZWFyKCl9YDtcbiAgY29uc3QgbW9udGggPSBgJHsoZGF0ZS5nZXRNb250aCgpICsgMSl9YC5wYWRTdGFydCgyLCAnMCcpO1xuICBjb25zdCBkYXkgPSBgJHtkYXRlLmdldERhdGUoKX1gLnBhZFN0YXJ0KDIsICcwJyk7XG5cbiAgcmV0dXJuIFt5ZWFyLCBtb250aCwgZGF5XS5qb2luKCctJyk7XG59XG4iXX0=