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
| Commit | Type | Description |
| -- | -- | -- |
<%_
  for (const commit of group.commits) {
    const descriptionWithMarkdownLinks = convertPullRequestReferencesToLinks(
      commit.description);
_%>
| <%- commitToLink(commit) %> | <%- commit.type %> | <%- descriptionWithMarkdownLinks %> |
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlbG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2Uvbm90ZXMvdGVtcGxhdGVzL2NoYW5nZWxvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOztBQUVILGtCQUFlOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FxRWQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBgXG48YSBuYW1lPVwiPCUtIHVybEZyYWdtZW50Rm9yUmVsZWFzZSAlPlwiPjwvYT5cbiMgPCUtIHZlcnNpb24gJT48JSBpZiAodGl0bGUpIHsgJT4gXCI8JS0gdGl0bGUgJT5cIjwlIH0gJT4gKDwlLSBkYXRlU3RhbXAgJT4pXG5cbjwlX1xuY29uc3QgYnJlYWtpbmdDaGFuZ2VzID0gY29tbWl0cy5maWx0ZXIoaGFzQnJlYWtpbmdDaGFuZ2VzKTtcbmlmIChicmVha2luZ0NoYW5nZXMubGVuZ3RoKSB7XG5fJT5cbiMjIEJyZWFraW5nIENoYW5nZXNcblxuPCVfXG4gIGZvciAoY29uc3QgZ3JvdXAgb2YgYXNDb21taXRHcm91cHMoYnJlYWtpbmdDaGFuZ2VzKSkge1xuXyU+XG4jIyMgPCUtIGdyb3VwLnRpdGxlICU+XG48JS0gZ3JvdXAuY29tbWl0cy5tYXAoY29tbWl0ID0+IGJ1bGxldGl6ZVRleHQoY29tbWl0LmJyZWFraW5nQ2hhbmdlc1swXS50ZXh0KSkuam9pbignXFxcXG5cXFxcbicpICU+XG48JV9cbiAgfVxufVxuXyU+XG5cbjwlX1xuY29uc3QgZGVwcmVjYXRpb25zID0gY29tbWl0cy5maWx0ZXIoaGFzRGVwcmVjYXRpb25zKTtcbmlmIChkZXByZWNhdGlvbnMubGVuZ3RoKSB7XG5fJT5cbiMjIERlcHJlY2F0aW9uc1xuPCVfXG4gIGZvciAoY29uc3QgZ3JvdXAgb2YgYXNDb21taXRHcm91cHMoZGVwcmVjYXRpb25zKSkge1xuXyU+XG4jIyMgPCUtIGdyb3VwLnRpdGxlICU+XG48JS0gZ3JvdXAuY29tbWl0cy5tYXAoY29tbWl0ID0+IGJ1bGxldGl6ZVRleHQoY29tbWl0LmRlcHJlY2F0aW9uc1swXS50ZXh0KSkuam9pbignXFxcXG5cXFxcbicpICU+XG48JV9cbiAgfVxufVxuXyU+XG5cbjwlX1xuY29uc3QgY29tbWl0c0luQ2hhbmdlbG9nID0gY29tbWl0cy5maWx0ZXIoaW5jbHVkZUluUmVsZWFzZU5vdGVzKCkpO1xuZm9yIChjb25zdCBncm91cCBvZiBhc0NvbW1pdEdyb3Vwcyhjb21taXRzSW5DaGFuZ2Vsb2cpKSB7XG5fJT5cblxuIyMjIDwlLSBncm91cC50aXRsZSAlPlxufCBDb21taXQgfCBUeXBlIHwgRGVzY3JpcHRpb24gfFxufCAtLSB8IC0tIHwgLS0gfFxuPCVfXG4gIGZvciAoY29uc3QgY29tbWl0IG9mIGdyb3VwLmNvbW1pdHMpIHtcbiAgICBjb25zdCBkZXNjcmlwdGlvbldpdGhNYXJrZG93bkxpbmtzID0gY29udmVydFB1bGxSZXF1ZXN0UmVmZXJlbmNlc1RvTGlua3MoXG4gICAgICBjb21taXQuZGVzY3JpcHRpb24pO1xuXyU+XG58IDwlLSBjb21taXRUb0xpbmsoY29tbWl0KSAlPiB8IDwlLSBjb21taXQudHlwZSAlPiB8IDwlLSBkZXNjcmlwdGlvbldpdGhNYXJrZG93bkxpbmtzICU+IHxcbjwlX1xuICB9XG59XG5fJT5cblxuPCVfXG5jb25zdCBhdXRob3JzID0gY29tbWl0QXV0aG9ycyhjb21taXRzKTtcbmlmIChhdXRob3JzLmxlbmd0aCA9PT0gMSkge1xuXyU+XG4jIyBTcGVjaWFsIFRoYW5rczpcbjwlLSBhdXRob3JzWzBdJT5cbjwlX1xufVxuaWYgKGF1dGhvcnMubGVuZ3RoID4gMSkge1xuXyU+XG4jIyBTcGVjaWFsIFRoYW5rczpcbjwlLSBhdXRob3JzLnNsaWNlKDAsIC0xKS5qb2luKCcsICcpICU+IGFuZCA8JS0gYXV0aG9ycy5zbGljZSgtMSlbMF0gJT5cbjwlX1xufVxuXyU+XG5gO1xuIl19