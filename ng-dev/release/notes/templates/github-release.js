"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = `
<a name="<%- urlFragmentForRelease %>"></a>
# <%- version %><% if (title) { %> "<%- title %>"<% } %> (<%- dateStamp %>)

<%_
const breakingChanges = commits.filter(hasBreakingChanges);
if (breakingChanges.length) {
_%>
## Breaking Changes

<%_
  for (const group of asCommitGroups(breakingChanges)) {
_%>
### <%- group.title %>
<%- group.commits.map(commit => bulletizeText(commit.breakingChanges[0].text)).join('\\n\\n') %>
<%_
  }
}
_%>

<%_
const deprecations = commits.filter(hasDeprecations);
if (deprecations.length) {
_%>
## Deprecations
<%_
  for (const group of asCommitGroups(deprecations)) {
_%>
### <%- group.title %>
<%- group.commits.map(commit => bulletizeText(commit.deprecations[0].text)).join('\\n\\n') %>
<%_
  }
}
_%>

<%_
const commitsInChangelog = commits.filter(includeInReleaseNotes());
for (const group of asCommitGroups(commitsInChangelog)) {
_%>

### <%- group.title %>
| Commit | Description |
| -- | -- |
<%_
  for (const commit of group.commits) {
_%>
| <%- commitToBadge(commit) %> | <%- commit.description %> |
<%_
  }
}
_%>

<%_
const authors = commitAuthors(commits);
if (authors.length === 1) {
_%>
## Special Thanks
<%- authors[0]%>
<%_
}
if (authors.length > 1) {
_%>
## Special Thanks
<%- authors.slice(0, -1).join(', ') %> and <%- authors.slice(-1)[0] %>
<%_
}
_%>
`;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLXJlbGVhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS9ub3Rlcy90ZW1wbGF0ZXMvZ2l0aHViLXJlbGVhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7QUFFSCxrQkFBZTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1FZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGBcbjxhIG5hbWU9XCI8JS0gdXJsRnJhZ21lbnRGb3JSZWxlYXNlICU+XCI+PC9hPlxuIyA8JS0gdmVyc2lvbiAlPjwlIGlmICh0aXRsZSkgeyAlPiBcIjwlLSB0aXRsZSAlPlwiPCUgfSAlPiAoPCUtIGRhdGVTdGFtcCAlPilcblxuPCVfXG5jb25zdCBicmVha2luZ0NoYW5nZXMgPSBjb21taXRzLmZpbHRlcihoYXNCcmVha2luZ0NoYW5nZXMpO1xuaWYgKGJyZWFraW5nQ2hhbmdlcy5sZW5ndGgpIHtcbl8lPlxuIyMgQnJlYWtpbmcgQ2hhbmdlc1xuXG48JV9cbiAgZm9yIChjb25zdCBncm91cCBvZiBhc0NvbW1pdEdyb3VwcyhicmVha2luZ0NoYW5nZXMpKSB7XG5fJT5cbiMjIyA8JS0gZ3JvdXAudGl0bGUgJT5cbjwlLSBncm91cC5jb21taXRzLm1hcChjb21taXQgPT4gYnVsbGV0aXplVGV4dChjb21taXQuYnJlYWtpbmdDaGFuZ2VzWzBdLnRleHQpKS5qb2luKCdcXFxcblxcXFxuJykgJT5cbjwlX1xuICB9XG59XG5fJT5cblxuPCVfXG5jb25zdCBkZXByZWNhdGlvbnMgPSBjb21taXRzLmZpbHRlcihoYXNEZXByZWNhdGlvbnMpO1xuaWYgKGRlcHJlY2F0aW9ucy5sZW5ndGgpIHtcbl8lPlxuIyMgRGVwcmVjYXRpb25zXG48JV9cbiAgZm9yIChjb25zdCBncm91cCBvZiBhc0NvbW1pdEdyb3VwcyhkZXByZWNhdGlvbnMpKSB7XG5fJT5cbiMjIyA8JS0gZ3JvdXAudGl0bGUgJT5cbjwlLSBncm91cC5jb21taXRzLm1hcChjb21taXQgPT4gYnVsbGV0aXplVGV4dChjb21taXQuZGVwcmVjYXRpb25zWzBdLnRleHQpKS5qb2luKCdcXFxcblxcXFxuJykgJT5cbjwlX1xuICB9XG59XG5fJT5cblxuPCVfXG5jb25zdCBjb21taXRzSW5DaGFuZ2Vsb2cgPSBjb21taXRzLmZpbHRlcihpbmNsdWRlSW5SZWxlYXNlTm90ZXMoKSk7XG5mb3IgKGNvbnN0IGdyb3VwIG9mIGFzQ29tbWl0R3JvdXBzKGNvbW1pdHNJbkNoYW5nZWxvZykpIHtcbl8lPlxuXG4jIyMgPCUtIGdyb3VwLnRpdGxlICU+XG58IENvbW1pdCB8IERlc2NyaXB0aW9uIHxcbnwgLS0gfCAtLSB8XG48JV9cbiAgZm9yIChjb25zdCBjb21taXQgb2YgZ3JvdXAuY29tbWl0cykge1xuXyU+XG58IDwlLSBjb21taXRUb0JhZGdlKGNvbW1pdCkgJT4gfCA8JS0gY29tbWl0LmRlc2NyaXB0aW9uICU+IHxcbjwlX1xuICB9XG59XG5fJT5cblxuPCVfXG5jb25zdCBhdXRob3JzID0gY29tbWl0QXV0aG9ycyhjb21taXRzKTtcbmlmIChhdXRob3JzLmxlbmd0aCA9PT0gMSkge1xuXyU+XG4jIyBTcGVjaWFsIFRoYW5rc1xuPCUtIGF1dGhvcnNbMF0lPlxuPCVfXG59XG5pZiAoYXV0aG9ycy5sZW5ndGggPiAxKSB7XG5fJT5cbiMjIFNwZWNpYWwgVGhhbmtzXG48JS0gYXV0aG9ycy5zbGljZSgwLCAtMSkuam9pbignLCAnKSAlPiBhbmQgPCUtIGF1dGhvcnMuc2xpY2UoLTEpWzBdICU+XG48JV9cbn1cbl8lPlxuYDtcbiJdfQ==