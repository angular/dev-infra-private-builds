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
<a name="<%- version %>"></a>
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
| <%- commitToBadge(commit) %> | <%- commit.subject %> |
<%_
  }
}
_%>

<%_
const authors = commitAuthors(commits);
if (authors.length === 1) {
_%>
## Special Thanks:
<%- authors[0]%>
<%_
}
if (authors.length > 1) {
_%>
## Special Thanks:
<%- authors.slice(0, -1).join(', ') %> and <%- authors.slice(-1)[0] %>
<%_
}
_%>
`;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLXJlbGVhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS9ub3Rlcy90ZW1wbGF0ZXMvZ2l0aHViLXJlbGVhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7QUFFSCxrQkFBZTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1FZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGBcbjxhIG5hbWU9XCI8JS0gdmVyc2lvbiAlPlwiPjwvYT5cbiMgPCUtIHZlcnNpb24gJT48JSBpZiAodGl0bGUpIHsgJT4gXCI8JS0gdGl0bGUgJT5cIjwlIH0gJT4gKDwlLSBkYXRlU3RhbXAgJT4pXG5cbjwlX1xuY29uc3QgYnJlYWtpbmdDaGFuZ2VzID0gY29tbWl0cy5maWx0ZXIoaGFzQnJlYWtpbmdDaGFuZ2VzKTtcbmlmIChicmVha2luZ0NoYW5nZXMubGVuZ3RoKSB7XG5fJT5cbiMjIEJyZWFraW5nIENoYW5nZXNcblxuPCVfXG4gIGZvciAoY29uc3QgZ3JvdXAgb2YgYXNDb21taXRHcm91cHMoYnJlYWtpbmdDaGFuZ2VzKSkge1xuXyU+XG4jIyMgPCUtIGdyb3VwLnRpdGxlICU+XG48JS0gZ3JvdXAuY29tbWl0cy5tYXAoY29tbWl0ID0+IGJ1bGxldGl6ZVRleHQoY29tbWl0LmJyZWFraW5nQ2hhbmdlc1swXS50ZXh0KSkuam9pbignXFxcXG5cXFxcbicpICU+XG48JV9cbiAgfVxufVxuXyU+XG5cbjwlX1xuY29uc3QgZGVwcmVjYXRpb25zID0gY29tbWl0cy5maWx0ZXIoaGFzRGVwcmVjYXRpb25zKTtcbmlmIChkZXByZWNhdGlvbnMubGVuZ3RoKSB7XG5fJT5cbiMjIERlcHJlY2F0aW9uc1xuPCVfXG4gIGZvciAoY29uc3QgZ3JvdXAgb2YgYXNDb21taXRHcm91cHMoZGVwcmVjYXRpb25zKSkge1xuXyU+XG4jIyMgPCUtIGdyb3VwLnRpdGxlICU+XG48JS0gZ3JvdXAuY29tbWl0cy5tYXAoY29tbWl0ID0+IGJ1bGxldGl6ZVRleHQoY29tbWl0LmRlcHJlY2F0aW9uc1swXS50ZXh0KSkuam9pbignXFxcXG5cXFxcbicpICU+XG48JV9cbiAgfVxufVxuXyU+XG5cbjwlX1xuY29uc3QgY29tbWl0c0luQ2hhbmdlbG9nID0gY29tbWl0cy5maWx0ZXIoaW5jbHVkZUluUmVsZWFzZU5vdGVzKCkpO1xuZm9yIChjb25zdCBncm91cCBvZiBhc0NvbW1pdEdyb3Vwcyhjb21taXRzSW5DaGFuZ2Vsb2cpKSB7XG5fJT5cblxuIyMjIDwlLSBncm91cC50aXRsZSAlPlxufCBDb21taXQgfCBEZXNjcmlwdGlvbiB8XG58IC0tIHwgLS0gfFxuPCVfXG4gIGZvciAoY29uc3QgY29tbWl0IG9mIGdyb3VwLmNvbW1pdHMpIHtcbl8lPlxufCA8JS0gY29tbWl0VG9CYWRnZShjb21taXQpICU+IHwgPCUtIGNvbW1pdC5zdWJqZWN0ICU+IHxcbjwlX1xuICB9XG59XG5fJT5cblxuPCVfXG5jb25zdCBhdXRob3JzID0gY29tbWl0QXV0aG9ycyhjb21taXRzKTtcbmlmIChhdXRob3JzLmxlbmd0aCA9PT0gMSkge1xuXyU+XG4jIyBTcGVjaWFsIFRoYW5rczpcbjwlLSBhdXRob3JzWzBdJT5cbjwlX1xufVxuaWYgKGF1dGhvcnMubGVuZ3RoID4gMSkge1xuXyU+XG4jIyBTcGVjaWFsIFRoYW5rczpcbjwlLSBhdXRob3JzLnNsaWNlKDAsIC0xKS5qb2luKCcsICcpICU+IGFuZCA8JS0gYXV0aG9ycy5zbGljZSgtMSlbMF0gJT5cbjwlX1xufVxuXyU+XG5gO1xuIl19