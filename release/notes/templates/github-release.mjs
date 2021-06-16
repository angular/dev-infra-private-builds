/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export default `
<a name="<%- version %>"></a>
# <%- version %><% if (title) { %> "<%- title %>"<% } %> (<%- dateStamp %>)

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
| <%- commit.shortHash %> | <%- commit.header %> |
<%_
  }
}
_%>

<%_
const breakingChanges = commits.filter(contains('breakingChanges'));
if (breakingChanges.length) {
_%>
## Breaking Changes

<%_
  for (const group of asCommitGroups(breakingChanges)) {
_%>
### <%- group.title %>

<%_
    for (const commit of group.commits) {
_%>
<%- commit.breakingChanges[0].text %>

<%_
    }
  }
}
_%>

<%_
const deprecations = commits.filter(contains('deprecations'));
if (deprecations.length) {
_%>
## Deprecations
<%_
  for (const group of asCommitGroups(deprecations)) {
_%>
### <%- group.title %>

<%_
    for (const commit of group.commits) {
_%>
<%- commit.deprecations[0].text %>
<%_
    }
  }
}
_%>

<%_
const authors = commits.filter(unique('author')).map(c => c.author).sort();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLXJlbGVhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9ub3Rlcy90ZW1wbGF0ZXMvZ2l0aHViLXJlbGVhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsZUFBZTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBOEVkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgYFxuPGEgbmFtZT1cIjwlLSB2ZXJzaW9uICU+XCI+PC9hPlxuIyA8JS0gdmVyc2lvbiAlPjwlIGlmICh0aXRsZSkgeyAlPiBcIjwlLSB0aXRsZSAlPlwiPCUgfSAlPiAoPCUtIGRhdGVTdGFtcCAlPilcblxuPCVfXG5jb25zdCBjb21taXRzSW5DaGFuZ2Vsb2cgPSBjb21taXRzLmZpbHRlcihpbmNsdWRlSW5SZWxlYXNlTm90ZXMoKSk7XG5mb3IgKGNvbnN0IGdyb3VwIG9mIGFzQ29tbWl0R3JvdXBzKGNvbW1pdHNJbkNoYW5nZWxvZykpIHtcbl8lPlxuXG4jIyMgPCUtIGdyb3VwLnRpdGxlICU+XG58IENvbW1pdCB8IERlc2NyaXB0aW9uIHxcbnwgLS0gfCAtLSB8XG48JV9cbiAgZm9yIChjb25zdCBjb21taXQgb2YgZ3JvdXAuY29tbWl0cykge1xuXyU+XG58IDwlLSBjb21taXQuc2hvcnRIYXNoICU+IHwgPCUtIGNvbW1pdC5oZWFkZXIgJT4gfFxuPCVfXG4gIH1cbn1cbl8lPlxuXG48JV9cbmNvbnN0IGJyZWFraW5nQ2hhbmdlcyA9IGNvbW1pdHMuZmlsdGVyKGNvbnRhaW5zKCdicmVha2luZ0NoYW5nZXMnKSk7XG5pZiAoYnJlYWtpbmdDaGFuZ2VzLmxlbmd0aCkge1xuXyU+XG4jIyBCcmVha2luZyBDaGFuZ2VzXG5cbjwlX1xuICBmb3IgKGNvbnN0IGdyb3VwIG9mIGFzQ29tbWl0R3JvdXBzKGJyZWFraW5nQ2hhbmdlcykpIHtcbl8lPlxuIyMjIDwlLSBncm91cC50aXRsZSAlPlxuXG48JV9cbiAgICBmb3IgKGNvbnN0IGNvbW1pdCBvZiBncm91cC5jb21taXRzKSB7XG5fJT5cbjwlLSBjb21taXQuYnJlYWtpbmdDaGFuZ2VzWzBdLnRleHQgJT5cblxuPCVfXG4gICAgfVxuICB9XG59XG5fJT5cblxuPCVfXG5jb25zdCBkZXByZWNhdGlvbnMgPSBjb21taXRzLmZpbHRlcihjb250YWlucygnZGVwcmVjYXRpb25zJykpO1xuaWYgKGRlcHJlY2F0aW9ucy5sZW5ndGgpIHtcbl8lPlxuIyMgRGVwcmVjYXRpb25zXG48JV9cbiAgZm9yIChjb25zdCBncm91cCBvZiBhc0NvbW1pdEdyb3VwcyhkZXByZWNhdGlvbnMpKSB7XG5fJT5cbiMjIyA8JS0gZ3JvdXAudGl0bGUgJT5cblxuPCVfXG4gICAgZm9yIChjb25zdCBjb21taXQgb2YgZ3JvdXAuY29tbWl0cykge1xuXyU+XG48JS0gY29tbWl0LmRlcHJlY2F0aW9uc1swXS50ZXh0ICU+XG48JV9cbiAgICB9XG4gIH1cbn1cbl8lPlxuXG48JV9cbmNvbnN0IGF1dGhvcnMgPSBjb21taXRzLmZpbHRlcih1bmlxdWUoJ2F1dGhvcicpKS5tYXAoYyA9PiBjLmF1dGhvcikuc29ydCgpO1xuaWYgKGF1dGhvcnMubGVuZ3RoID09PSAxKSB7XG5fJT5cbiMjIFNwZWNpYWwgVGhhbmtzOlxuPCUtIGF1dGhvcnNbMF0lPlxuPCVfXG59XG5pZiAoYXV0aG9ycy5sZW5ndGggPiAxKSB7XG5fJT5cbiMjIFNwZWNpYWwgVGhhbmtzOlxuPCUtIGF1dGhvcnMuc2xpY2UoMCwgLTEpLmpvaW4oJywgJykgJT4gYW5kIDwlLSBhdXRob3JzLnNsaWNlKC0xKVswXSAlPlxuPCVfXG59XG5fJT5cbmA7XG4iXX0=