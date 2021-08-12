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
| <%- commitToLink(commit) %> | <%- replaceCommitHeaderPullRequestNumber(commit.header) %> |
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlbG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2Uvbm90ZXMvdGVtcGxhdGVzL2NoYW5nZWxvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOztBQUVILGtCQUFlOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUVkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgYFxuPGEgbmFtZT1cIjwlLSB2ZXJzaW9uICU+XCI+PC9hPlxuIyA8JS0gdmVyc2lvbiAlPjwlIGlmICh0aXRsZSkgeyAlPiBcIjwlLSB0aXRsZSAlPlwiPCUgfSAlPiAoPCUtIGRhdGVTdGFtcCAlPilcblxuPCVfXG5jb25zdCBicmVha2luZ0NoYW5nZXMgPSBjb21taXRzLmZpbHRlcihoYXNCcmVha2luZ0NoYW5nZXMpO1xuaWYgKGJyZWFraW5nQ2hhbmdlcy5sZW5ndGgpIHtcbl8lPlxuIyMgQnJlYWtpbmcgQ2hhbmdlc1xuXG48JV9cbiAgZm9yIChjb25zdCBncm91cCBvZiBhc0NvbW1pdEdyb3VwcyhicmVha2luZ0NoYW5nZXMpKSB7XG5fJT5cbiMjIyA8JS0gZ3JvdXAudGl0bGUgJT5cbjwlLSBncm91cC5jb21taXRzLm1hcChjb21taXQgPT4gYnVsbGV0aXplVGV4dChjb21taXQuYnJlYWtpbmdDaGFuZ2VzWzBdLnRleHQpKS5qb2luKCdcXFxcblxcXFxuJykgJT5cbjwlX1xuICB9XG59XG5fJT5cblxuPCVfXG5jb25zdCBkZXByZWNhdGlvbnMgPSBjb21taXRzLmZpbHRlcihoYXNEZXByZWNhdGlvbnMpO1xuaWYgKGRlcHJlY2F0aW9ucy5sZW5ndGgpIHtcbl8lPlxuIyMgRGVwcmVjYXRpb25zXG48JV9cbiAgZm9yIChjb25zdCBncm91cCBvZiBhc0NvbW1pdEdyb3VwcyhkZXByZWNhdGlvbnMpKSB7XG5fJT5cbiMjIyA8JS0gZ3JvdXAudGl0bGUgJT5cbjwlLSBncm91cC5jb21taXRzLm1hcChjb21taXQgPT4gYnVsbGV0aXplVGV4dChjb21taXQuZGVwcmVjYXRpb25zWzBdLnRleHQpKS5qb2luKCdcXFxcblxcXFxuJykgJT5cbjwlX1xuICB9XG59XG5fJT5cblxuPCVfXG5jb25zdCBjb21taXRzSW5DaGFuZ2Vsb2cgPSBjb21taXRzLmZpbHRlcihpbmNsdWRlSW5SZWxlYXNlTm90ZXMoKSk7XG5mb3IgKGNvbnN0IGdyb3VwIG9mIGFzQ29tbWl0R3JvdXBzKGNvbW1pdHNJbkNoYW5nZWxvZykpIHtcbl8lPlxuXG4jIyMgPCUtIGdyb3VwLnRpdGxlICU+XG58IENvbW1pdCB8IERlc2NyaXB0aW9uIHxcbnwgLS0gfCAtLSB8XG48JV9cbiAgZm9yIChjb25zdCBjb21taXQgb2YgZ3JvdXAuY29tbWl0cykge1xuXyU+XG58IDwlLSBjb21taXRUb0xpbmsoY29tbWl0KSAlPiB8IDwlLSByZXBsYWNlQ29tbWl0SGVhZGVyUHVsbFJlcXVlc3ROdW1iZXIoY29tbWl0LmhlYWRlcikgJT4gfFxuPCVfXG4gIH1cbn1cbl8lPlxuXG48JV9cbmNvbnN0IGF1dGhvcnMgPSBjb21taXRBdXRob3JzKGNvbW1pdHMpO1xuaWYgKGF1dGhvcnMubGVuZ3RoID09PSAxKSB7XG5fJT5cbiMjIFNwZWNpYWwgVGhhbmtzOlxuPCUtIGF1dGhvcnNbMF0lPlxuPCVfXG59XG5pZiAoYXV0aG9ycy5sZW5ndGggPiAxKSB7XG5fJT5cbiMjIFNwZWNpYWwgVGhhbmtzOlxuPCUtIGF1dGhvcnMuc2xpY2UoMCwgLTEpLmpvaW4oJywgJykgJT4gYW5kIDwlLSBhdXRob3JzLnNsaWNlKC0xKVswXSAlPlxuPCVfXG59XG5fJT5cbmA7XG4iXX0=