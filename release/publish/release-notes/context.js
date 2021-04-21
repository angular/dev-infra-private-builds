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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvcmVsZWFzZS1ub3Rlcy9jb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwyRUFBK0U7SUFNL0UseURBQXlEO0lBQ3pELElBQU0sNEJBQTRCLEdBQzlCLE1BQU0sQ0FBQyxNQUFNLENBQUMscUJBQVksQ0FBQztTQUN0QixNQUFNLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLENBQUMsaUJBQWlCLEtBQUssMEJBQWlCLENBQUMsT0FBTyxFQUFwRCxDQUFvRCxDQUFDO1NBQ3BFLEdBQUcsQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLElBQUksQ0FBQyxJQUFJLEVBQVQsQ0FBUyxDQUFDLENBQUM7SUFhaEMsc0RBQXNEO0lBQ3REO1FBY0UsdUJBQTZCLElBQXVCO1lBQXZCLFNBQUksR0FBSixJQUFJLENBQW1CO1lBYnBELHdEQUF3RDtZQUN2QyxlQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFDO1lBQ3pELGdFQUFnRTtZQUMvQyxpQkFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQztZQUM3RCx1RUFBdUU7WUFDOUQsVUFBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ2pDLGlEQUFpRDtZQUN4QyxZQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDckMsa0NBQWtDO1lBQ3pCLFlBQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUNyQyxnRUFBZ0U7WUFDdkQsY0FBUyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRUcsQ0FBQztRQUV4RDs7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UUFFakQsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFORCx3Q0FNQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NPTU1JVF9UWVBFUywgUmVsZWFzZU5vdGVzTGV2ZWx9IGZyb20gJy4uLy4uLy4uL2NvbW1pdC1tZXNzYWdlL2NvbmZpZyc7XG5pbXBvcnQge0NvbW1pdEZyb21HaXRMb2d9IGZyb20gJy4uLy4uLy4uL2NvbW1pdC1tZXNzYWdlL3BhcnNlJztcbmltcG9ydCB7R2l0aHViQ29uZmlnfSBmcm9tICcuLi8uLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtSZWxlYXNlTm90ZXNDb25maWd9IGZyb20gJy4uLy4uL2NvbmZpZy9pbmRleCc7XG5cblxuLyoqIExpc3Qgb2YgdHlwZXMgdG8gYmUgaW5jbHVkZWQgaW4gdGhlIHJlbGVhc2Ugbm90ZXMuICovXG5jb25zdCB0eXBlc1RvSW5jbHVkZUluUmVsZWFzZU5vdGVzID1cbiAgICBPYmplY3QudmFsdWVzKENPTU1JVF9UWVBFUylcbiAgICAgICAgLmZpbHRlcih0eXBlID0+IHR5cGUucmVsZWFzZU5vdGVzTGV2ZWwgPT09IFJlbGVhc2VOb3Rlc0xldmVsLlZpc2libGUpXG4gICAgICAgIC5tYXAodHlwZSA9PiB0eXBlLm5hbWUpO1xuXG4vKiogRGF0YSB1c2VkIGZvciBjb250ZXh0IGR1cmluZyByZW5kZXJpbmcuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlbmRlckNvbnRleHREYXRhIHtcbiAgdGl0bGU6IHN0cmluZ3xmYWxzZTtcbiAgZ3JvdXBPcmRlcj86IFJlbGVhc2VOb3Rlc0NvbmZpZ1snZ3JvdXBPcmRlciddO1xuICBoaWRkZW5TY29wZXM/OiBSZWxlYXNlTm90ZXNDb25maWdbJ2hpZGRlblNjb3BlcyddO1xuICBkYXRlPzogRGF0ZTtcbiAgY29tbWl0czogQ29tbWl0RnJvbUdpdExvZ1tdO1xuICB2ZXJzaW9uOiBzdHJpbmc7XG4gIGdpdGh1YjogR2l0aHViQ29uZmlnO1xufVxuXG4vKiogQ29udGV4dCBjbGFzcyB1c2VkIGZvciByZW5kZXJpbmcgcmVsZWFzZSBub3Rlcy4gKi9cbmV4cG9ydCBjbGFzcyBSZW5kZXJDb250ZXh0IHtcbiAgLyoqIEFuIGFycmF5IG9mIGdyb3VwIG5hbWVzIGluIHNvcnQgb3JkZXIgaWYgZGVmaW5lZC4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBncm91cE9yZGVyID0gdGhpcy5kYXRhLmdyb3VwT3JkZXIgfHwgW107XG4gIC8qKiBBbiBhcnJheSBvZiBzY29wZXMgdG8gaGlkZSBmcm9tIHRoZSByZWxlYXNlIGVudHJ5IG91dHB1dC4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBoaWRkZW5TY29wZXMgPSB0aGlzLmRhdGEuaGlkZGVuU2NvcGVzIHx8IFtdO1xuICAvKiogVGhlIHRpdGxlIG9mIHRoZSByZWxlYXNlLCBvciBgZmFsc2VgIGlmIG5vIHRpdGxlIHNob3VsZCBiZSB1c2VkLiAqL1xuICByZWFkb25seSB0aXRsZSA9IHRoaXMuZGF0YS50aXRsZTtcbiAgLyoqIEFuIGFycmF5IG9mIGNvbW1pdHMgaW4gdGhlIHJlbGVhc2UgcGVyaW9kLiAqL1xuICByZWFkb25seSBjb21taXRzID0gdGhpcy5kYXRhLmNvbW1pdHM7XG4gIC8qKiBUaGUgdmVyc2lvbiBvZiB0aGUgcmVsZWFzZS4gKi9cbiAgcmVhZG9ubHkgdmVyc2lvbiA9IHRoaXMuZGF0YS52ZXJzaW9uO1xuICAvKiogVGhlIGRhdGUgc3RhbXAgc3RyaW5nIGZvciB1c2UgaW4gdGhlIHJlbGVhc2Ugbm90ZXMgZW50cnkuICovXG4gIHJlYWRvbmx5IGRhdGVTdGFtcCA9IGJ1aWxkRGF0ZVN0YW1wKHRoaXMuZGF0YS5kYXRlKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGRhdGE6IFJlbmRlckNvbnRleHREYXRhKSB7fVxuXG4gIC8qKlxuICAgKiBPcmdhbml6ZXMgYW5kIHNvcnRzIHRoZSBjb21taXRzIGludG8gZ3JvdXBzIG9mIGNvbW1pdHMuXG4gICAqXG4gICAqIEdyb3VwcyBhcmUgc29ydGVkIGVpdGhlciBieSBkZWZhdWx0IGBBcnJheS5zb3J0YCBvcmRlciwgb3IgdXNpbmcgdGhlIHByb3ZpZGVkIGdyb3VwIG9yZGVyIGZyb21cbiAgICogdGhlIGNvbmZpZ3VyYXRpb24uIENvbW1pdHMgYXJlIG9yZGVyIGluIHRoZSBzYW1lIG9yZGVyIHdpdGhpbiBlYWNoIGdyb3VwcyBjb21taXQgbGlzdCBhcyB0aGV5XG4gICAqIGFwcGVhciBpbiB0aGUgcHJvdmlkZWQgbGlzdCBvZiBjb21taXRzLlxuICAgKiAqL1xuICBhc0NvbW1pdEdyb3Vwcyhjb21taXRzOiBDb21taXRGcm9tR2l0TG9nW10pIHtcbiAgICAvKiogVGhlIGRpc2NvdmVyZWQgZ3JvdXBzIHRvIG9yZ2FuaXplIGludG8uICovXG4gICAgY29uc3QgZ3JvdXBzID0gbmV3IE1hcDxzdHJpbmcsIENvbW1pdEZyb21HaXRMb2dbXT4oKTtcblxuICAgIC8vIFBsYWNlIGVhY2ggY29tbWl0IGluIHRoZSBsaXN0IGludG8gaXRzIGdyb3VwLlxuICAgIGNvbW1pdHMuZm9yRWFjaChjb21taXQgPT4ge1xuICAgICAgY29uc3Qga2V5ID0gY29tbWl0Lm5wbVNjb3BlID8gYCR7Y29tbWl0Lm5wbVNjb3BlfS8ke2NvbW1pdC5zY29wZX1gIDogY29tbWl0LnNjb3BlO1xuICAgICAgY29uc3QgZ3JvdXBDb21taXRzID0gZ3JvdXBzLmdldChrZXkpIHx8IFtdO1xuICAgICAgZ3JvdXBzLnNldChrZXksIGdyb3VwQ29tbWl0cyk7XG4gICAgICBncm91cENvbW1pdHMucHVzaChjb21taXQpO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogQXJyYXkgb2YgQ29tbWl0R3JvdXBzIGNvbnRhaW5pbmcgdGhlIGRpc2NvdmVyZWQgY29tbWl0IGdyb3Vwcy4gU29ydGVkIGluIGFscGhhbnVtZXJpYyBvcmRlclxuICAgICAqIG9mIHRoZSBncm91cCB0aXRsZS5cbiAgICAgKi9cbiAgICBjb25zdCBjb21taXRHcm91cHMgPSBBcnJheS5mcm9tKGdyb3Vwcy5lbnRyaWVzKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKFt0aXRsZSwgY29tbWl0c10pID0+ICh7dGl0bGUsIGNvbW1pdHN9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNvcnQoKGEsIGIpID0+IGEudGl0bGUgPiBiLnRpdGxlID8gMSA6IGEudGl0bGUgPCBiLnRpdGxlID8gLTEgOiAwKTtcblxuICAgIC8vIElmIHRoZSBjb25maWd1cmF0aW9uIHByb3ZpZGVzIGEgc29ydGluZyBvcmRlciwgdXBkYXRlZCB0aGUgc29ydGVkIGxpc3Qgb2YgZ3JvdXAga2V5cyB0b1xuICAgIC8vIHNhdGlzZnkgdGhlIG9yZGVyIG9mIHRoZSBncm91cHMgcHJvdmlkZWQgaW4gdGhlIGxpc3Qgd2l0aCBhbnkgZ3JvdXBzIG5vdCBmb3VuZCBpbiB0aGUgbGlzdCBhdFxuICAgIC8vIHRoZSBlbmQgb2YgdGhlIHNvcnRlZCBsaXN0LlxuICAgIGlmICh0aGlzLmdyb3VwT3JkZXIubGVuZ3RoKSB7XG4gICAgICBmb3IgKGNvbnN0IGdyb3VwVGl0bGUgb2YgdGhpcy5ncm91cE9yZGVyLnJldmVyc2UoKSkge1xuICAgICAgICBjb25zdCBjdXJyZW50SWR4ID0gY29tbWl0R3JvdXBzLmZpbmRJbmRleChrID0+IGsudGl0bGUgPT09IGdyb3VwVGl0bGUpO1xuICAgICAgICBpZiAoY3VycmVudElkeCAhPT0gLTEpIHtcbiAgICAgICAgICBjb25zdCByZW1vdmVkR3JvdXBzID0gY29tbWl0R3JvdXBzLnNwbGljZShjdXJyZW50SWR4LCAxKTtcbiAgICAgICAgICBjb21taXRHcm91cHMuc3BsaWNlKDAsIDAsIC4uLnJlbW92ZWRHcm91cHMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb21taXRHcm91cHM7XG4gIH1cblxuICAvKipcbiAgICogQSBmaWx0ZXIgZnVuY3Rpb24gZm9yIGZpbHRlcmluZyBhIGxpc3Qgb2YgY29tbWl0cyB0byBvbmx5IGluY2x1ZGUgY29tbWl0cyB3aGljaCBzaG91bGQgYXBwZWFyXG4gICAqIGluIHJlbGVhc2Ugbm90ZXMuXG4gICAqL1xuICBpbmNsdWRlSW5SZWxlYXNlTm90ZXMoKSB7XG4gICAgcmV0dXJuIChjb21taXQ6IENvbW1pdEZyb21HaXRMb2cpID0+IHtcbiAgICAgIGlmICghdHlwZXNUb0luY2x1ZGVJblJlbGVhc2VOb3Rlcy5pbmNsdWRlcyhjb21taXQudHlwZSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5oaWRkZW5TY29wZXMuaW5jbHVkZXMoY29tbWl0LnNjb3BlKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEEgZmlsdGVyIGZ1bmN0aW9uIGZvciBmaWx0ZXJpbmcgYSBsaXN0IG9mIGNvbW1pdHMgdG8gb25seSBpbmNsdWRlIGNvbW1pdHMgd2hpY2ggY29udGFpbiBhXG4gICAqIHRydXRoeSB2YWx1ZSwgb3IgZm9yIGFycmF5cyBhbiBhcnJheSB3aXRoIDEgb3IgbW9yZSBlbGVtZW50cywgZm9yIHRoZSBwcm92aWRlZCBmaWVsZC5cbiAgICovXG4gIGNvbnRhaW5zKGZpZWxkOiBrZXlvZiBDb21taXRGcm9tR2l0TG9nKSB7XG4gICAgcmV0dXJuIChjb21taXQ6IENvbW1pdEZyb21HaXRMb2cpID0+IHtcbiAgICAgIGNvbnN0IGZpZWxkVmFsdWUgPSBjb21taXRbZmllbGRdO1xuICAgICAgaWYgKCFmaWVsZFZhbHVlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZmllbGRWYWx1ZSkgJiYgZmllbGRWYWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIGZpbHRlciBmdW5jdGlvbiBmb3IgZmlsdGVyaW5nIGEgbGlzdCBvZiBjb21taXRzIHRvIG9ubHkgaW5jbHVkZSBjb21taXRzIHdoaWNoIGNvbnRhaW4gYVxuICAgKiB1bmlxdWUgdmFsdWUgZm9yIHRoZSBwcm92aWRlZCBmaWVsZCBhY3Jvc3MgYWxsIGNvbW1pdHMgaW4gdGhlIGxpc3QuXG4gICAqL1xuICB1bmlxdWUoZmllbGQ6IGtleW9mIENvbW1pdEZyb21HaXRMb2cpIHtcbiAgICBjb25zdCBzZXQgPSBuZXcgU2V0PENvbW1pdEZyb21HaXRMb2dbdHlwZW9mIGZpZWxkXT4oKTtcbiAgICByZXR1cm4gKGNvbW1pdDogQ29tbWl0RnJvbUdpdExvZykgPT4ge1xuICAgICAgY29uc3QgaW5jbHVkZSA9ICFzZXQuaGFzKGNvbW1pdFtmaWVsZF0pO1xuICAgICAgc2V0LmFkZChjb21taXRbZmllbGRdKTtcbiAgICAgIHJldHVybiBpbmNsdWRlO1xuICAgIH07XG4gIH1cbn1cblxuXG4vKipcbiAqIEJ1aWxkcyBhIGRhdGUgc3RhbXAgZm9yIHN0YW1waW5nIGluIHJlbGVhc2Ugbm90ZXMuXG4gKlxuICogVXNlcyB0aGUgY3VycmVudCBkYXRlLCBvciBhIHByb3ZpZGVkIGRhdGUgaW4gdGhlIGZvcm1hdCBvZiBZWVlZLU1NLURELCBpLmUuIDE5NzAtMTEtMDUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZERhdGVTdGFtcChkYXRlID0gbmV3IERhdGUoKSkge1xuICBjb25zdCB5ZWFyID0gYCR7ZGF0ZS5nZXRGdWxsWWVhcigpfWA7XG4gIGNvbnN0IG1vbnRoID0gYCR7KGRhdGUuZ2V0TW9udGgoKSArIDEpfWAucGFkU3RhcnQoMiwgJzAnKTtcbiAgY29uc3QgZGF5ID0gYCR7ZGF0ZS5nZXREYXRlKCl9YC5wYWRTdGFydCgyLCAnMCcpO1xuXG4gIHJldHVybiBbeWVhciwgbW9udGgsIGRheV0uam9pbignLScpO1xufVxuIl19