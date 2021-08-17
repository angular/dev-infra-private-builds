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
| <%- commitToLink(commit) %> | <%- commit.type %>: <%- replaceCommitHeaderPullRequestNumber(commit.subject) %> |
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlbG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2Uvbm90ZXMvdGVtcGxhdGVzL2NoYW5nZWxvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOztBQUVILGtCQUFlOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUVkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgYFxuPGEgbmFtZT1cIjwlLSB1cmxGcmFnbWVudEZvclJlbGVhc2UgJT5cIj48L2E+XG4jIDwlLSB2ZXJzaW9uICU+PCUgaWYgKHRpdGxlKSB7ICU+IFwiPCUtIHRpdGxlICU+XCI8JSB9ICU+ICg8JS0gZGF0ZVN0YW1wICU+KVxuXG48JV9cbmNvbnN0IGJyZWFraW5nQ2hhbmdlcyA9IGNvbW1pdHMuZmlsdGVyKGhhc0JyZWFraW5nQ2hhbmdlcyk7XG5pZiAoYnJlYWtpbmdDaGFuZ2VzLmxlbmd0aCkge1xuXyU+XG4jIyBCcmVha2luZyBDaGFuZ2VzXG5cbjwlX1xuICBmb3IgKGNvbnN0IGdyb3VwIG9mIGFzQ29tbWl0R3JvdXBzKGJyZWFraW5nQ2hhbmdlcykpIHtcbl8lPlxuIyMjIDwlLSBncm91cC50aXRsZSAlPlxuPCUtIGdyb3VwLmNvbW1pdHMubWFwKGNvbW1pdCA9PiBidWxsZXRpemVUZXh0KGNvbW1pdC5icmVha2luZ0NoYW5nZXNbMF0udGV4dCkpLmpvaW4oJ1xcXFxuXFxcXG4nKSAlPlxuPCVfXG4gIH1cbn1cbl8lPlxuXG48JV9cbmNvbnN0IGRlcHJlY2F0aW9ucyA9IGNvbW1pdHMuZmlsdGVyKGhhc0RlcHJlY2F0aW9ucyk7XG5pZiAoZGVwcmVjYXRpb25zLmxlbmd0aCkge1xuXyU+XG4jIyBEZXByZWNhdGlvbnNcbjwlX1xuICBmb3IgKGNvbnN0IGdyb3VwIG9mIGFzQ29tbWl0R3JvdXBzKGRlcHJlY2F0aW9ucykpIHtcbl8lPlxuIyMjIDwlLSBncm91cC50aXRsZSAlPlxuPCUtIGdyb3VwLmNvbW1pdHMubWFwKGNvbW1pdCA9PiBidWxsZXRpemVUZXh0KGNvbW1pdC5kZXByZWNhdGlvbnNbMF0udGV4dCkpLmpvaW4oJ1xcXFxuXFxcXG4nKSAlPlxuPCVfXG4gIH1cbn1cbl8lPlxuXG48JV9cbmNvbnN0IGNvbW1pdHNJbkNoYW5nZWxvZyA9IGNvbW1pdHMuZmlsdGVyKGluY2x1ZGVJblJlbGVhc2VOb3RlcygpKTtcbmZvciAoY29uc3QgZ3JvdXAgb2YgYXNDb21taXRHcm91cHMoY29tbWl0c0luQ2hhbmdlbG9nKSkge1xuXyU+XG5cbiMjIyA8JS0gZ3JvdXAudGl0bGUgJT5cbnwgQ29tbWl0IHwgRGVzY3JpcHRpb24gfFxufCAtLSB8IC0tIHxcbjwlX1xuICBmb3IgKGNvbnN0IGNvbW1pdCBvZiBncm91cC5jb21taXRzKSB7XG5fJT5cbnwgPCUtIGNvbW1pdFRvTGluayhjb21taXQpICU+IHwgPCUtIGNvbW1pdC50eXBlICU+OiA8JS0gcmVwbGFjZUNvbW1pdEhlYWRlclB1bGxSZXF1ZXN0TnVtYmVyKGNvbW1pdC5zdWJqZWN0KSAlPiB8XG48JV9cbiAgfVxufVxuXyU+XG5cbjwlX1xuY29uc3QgYXV0aG9ycyA9IGNvbW1pdEF1dGhvcnMoY29tbWl0cyk7XG5pZiAoYXV0aG9ycy5sZW5ndGggPT09IDEpIHtcbl8lPlxuIyMgU3BlY2lhbCBUaGFua3M6XG48JS0gYXV0aG9yc1swXSU+XG48JV9cbn1cbmlmIChhdXRob3JzLmxlbmd0aCA+IDEpIHtcbl8lPlxuIyMgU3BlY2lhbCBUaGFua3M6XG48JS0gYXV0aG9ycy5zbGljZSgwLCAtMSkuam9pbignLCAnKSAlPiBhbmQgPCUtIGF1dGhvcnMuc2xpY2UoLTEpWzBdICU+XG48JV9cbn1cbl8lPlxuYDtcbiJdfQ==