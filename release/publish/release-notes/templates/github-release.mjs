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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLXJlbGVhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL3JlbGVhc2Utbm90ZXMvdGVtcGxhdGVzL2dpdGh1Yi1yZWxlYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILGVBQWU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQThFZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGBcbjxhIG5hbWU9XCI8JS0gdmVyc2lvbiAlPlwiPjwvYT5cbiMgPCUtIHZlcnNpb24gJT48JSBpZiAodGl0bGUpIHsgJT4gXCI8JS0gdGl0bGUgJT5cIjwlIH0gJT4gKDwlLSBkYXRlU3RhbXAgJT4pXG5cbjwlX1xuY29uc3QgY29tbWl0c0luQ2hhbmdlbG9nID0gY29tbWl0cy5maWx0ZXIoaW5jbHVkZUluUmVsZWFzZU5vdGVzKCkpO1xuZm9yIChjb25zdCBncm91cCBvZiBhc0NvbW1pdEdyb3Vwcyhjb21taXRzSW5DaGFuZ2Vsb2cpKSB7XG5fJT5cblxuIyMjIDwlLSBncm91cC50aXRsZSAlPlxufCBDb21taXQgfCBEZXNjcmlwdGlvbiB8XG58IC0tIHwgLS0gfFxuPCVfXG4gIGZvciAoY29uc3QgY29tbWl0IG9mIGdyb3VwLmNvbW1pdHMpIHtcbl8lPlxufCA8JS0gY29tbWl0LnNob3J0SGFzaCAlPiB8IDwlLSBjb21taXQuaGVhZGVyICU+IHxcbjwlX1xuICB9XG59XG5fJT5cblxuPCVfXG5jb25zdCBicmVha2luZ0NoYW5nZXMgPSBjb21taXRzLmZpbHRlcihjb250YWlucygnYnJlYWtpbmdDaGFuZ2VzJykpO1xuaWYgKGJyZWFraW5nQ2hhbmdlcy5sZW5ndGgpIHtcbl8lPlxuIyMgQnJlYWtpbmcgQ2hhbmdlc1xuXG48JV9cbiAgZm9yIChjb25zdCBncm91cCBvZiBhc0NvbW1pdEdyb3VwcyhicmVha2luZ0NoYW5nZXMpKSB7XG5fJT5cbiMjIyA8JS0gZ3JvdXAudGl0bGUgJT5cblxuPCVfXG4gICAgZm9yIChjb25zdCBjb21taXQgb2YgZ3JvdXAuY29tbWl0cykge1xuXyU+XG48JS0gY29tbWl0LmJyZWFraW5nQ2hhbmdlc1swXS50ZXh0ICU+XG5cbjwlX1xuICAgIH1cbiAgfVxufVxuXyU+XG5cbjwlX1xuY29uc3QgZGVwcmVjYXRpb25zID0gY29tbWl0cy5maWx0ZXIoY29udGFpbnMoJ2RlcHJlY2F0aW9ucycpKTtcbmlmIChkZXByZWNhdGlvbnMubGVuZ3RoKSB7XG5fJT5cbiMjIERlcHJlY2F0aW9uc1xuPCVfXG4gIGZvciAoY29uc3QgZ3JvdXAgb2YgYXNDb21taXRHcm91cHMoZGVwcmVjYXRpb25zKSkge1xuXyU+XG4jIyMgPCUtIGdyb3VwLnRpdGxlICU+XG5cbjwlX1xuICAgIGZvciAoY29uc3QgY29tbWl0IG9mIGdyb3VwLmNvbW1pdHMpIHtcbl8lPlxuPCUtIGNvbW1pdC5kZXByZWNhdGlvbnNbMF0udGV4dCAlPlxuPCVfXG4gICAgfVxuICB9XG59XG5fJT5cblxuPCVfXG5jb25zdCBhdXRob3JzID0gY29tbWl0cy5maWx0ZXIodW5pcXVlKCdhdXRob3InKSkubWFwKGMgPT4gYy5hdXRob3IpLnNvcnQoKTtcbmlmIChhdXRob3JzLmxlbmd0aCA9PT0gMSkge1xuXyU+XG4jIyBTcGVjaWFsIFRoYW5rczpcbjwlLSBhdXRob3JzWzBdJT5cbjwlX1xufVxuaWYgKGF1dGhvcnMubGVuZ3RoID4gMSkge1xuXyU+XG4jIyBTcGVjaWFsIFRoYW5rczpcbjwlLSBhdXRob3JzLnNsaWNlKDAsIC0xKS5qb2luKCcsICcpICU+IGFuZCA8JS0gYXV0aG9ycy5zbGljZSgtMSlbMF0gJT5cbjwlX1xufVxuXyU+XG5gO1xuIl19