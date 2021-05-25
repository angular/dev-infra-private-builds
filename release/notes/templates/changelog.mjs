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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlbG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2Uvbm90ZXMvdGVtcGxhdGVzL2NoYW5nZWxvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxlQUFlOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0E4RWQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBgXG48YSBuYW1lPVwiPCUtIHZlcnNpb24gJT5cIj48L2E+XG4jIDwlLSB2ZXJzaW9uICU+PCUgaWYgKHRpdGxlKSB7ICU+IFwiPCUtIHRpdGxlICU+XCI8JSB9ICU+ICg8JS0gZGF0ZVN0YW1wICU+KVxuXG48JV9cbmNvbnN0IGNvbW1pdHNJbkNoYW5nZWxvZyA9IGNvbW1pdHMuZmlsdGVyKGluY2x1ZGVJblJlbGVhc2VOb3RlcygpKTtcbmZvciAoY29uc3QgZ3JvdXAgb2YgYXNDb21taXRHcm91cHMoY29tbWl0c0luQ2hhbmdlbG9nKSkge1xuXyU+XG5cbiMjIyA8JS0gZ3JvdXAudGl0bGUgJT5cbnwgQ29tbWl0IHwgRGVzY3JpcHRpb24gfFxufCAtLSB8IC0tIHxcbjwlX1xuICBmb3IgKGNvbnN0IGNvbW1pdCBvZiBncm91cC5jb21taXRzKSB7XG5fJT5cbnwgPCUtIGNvbW1pdC5zaG9ydEhhc2ggJT4gfCA8JS0gY29tbWl0LmhlYWRlciAlPiB8XG48JV9cbiAgfVxufVxuXyU+XG5cbjwlX1xuY29uc3QgYnJlYWtpbmdDaGFuZ2VzID0gY29tbWl0cy5maWx0ZXIoY29udGFpbnMoJ2JyZWFraW5nQ2hhbmdlcycpKTtcbmlmIChicmVha2luZ0NoYW5nZXMubGVuZ3RoKSB7XG5fJT5cbiMjIEJyZWFraW5nIENoYW5nZXNcblxuPCVfXG4gIGZvciAoY29uc3QgZ3JvdXAgb2YgYXNDb21taXRHcm91cHMoYnJlYWtpbmdDaGFuZ2VzKSkge1xuXyU+XG4jIyMgPCUtIGdyb3VwLnRpdGxlICU+XG5cbjwlX1xuICAgIGZvciAoY29uc3QgY29tbWl0IG9mIGdyb3VwLmNvbW1pdHMpIHtcbl8lPlxuPCUtIGNvbW1pdC5icmVha2luZ0NoYW5nZXNbMF0udGV4dCAlPlxuXG48JV9cbiAgICB9XG4gIH1cbn1cbl8lPlxuXG48JV9cbmNvbnN0IGRlcHJlY2F0aW9ucyA9IGNvbW1pdHMuZmlsdGVyKGNvbnRhaW5zKCdkZXByZWNhdGlvbnMnKSk7XG5pZiAoZGVwcmVjYXRpb25zLmxlbmd0aCkge1xuXyU+XG4jIyBEZXByZWNhdGlvbnNcbjwlX1xuICBmb3IgKGNvbnN0IGdyb3VwIG9mIGFzQ29tbWl0R3JvdXBzKGRlcHJlY2F0aW9ucykpIHtcbl8lPlxuIyMjIDwlLSBncm91cC50aXRsZSAlPlxuXG48JV9cbiAgICBmb3IgKGNvbnN0IGNvbW1pdCBvZiBncm91cC5jb21taXRzKSB7XG5fJT5cbjwlLSBjb21taXQuZGVwcmVjYXRpb25zWzBdLnRleHQgJT5cbjwlX1xuICAgIH1cbiAgfVxufVxuXyU+XG5cbjwlX1xuY29uc3QgYXV0aG9ycyA9IGNvbW1pdHMuZmlsdGVyKHVuaXF1ZSgnYXV0aG9yJykpLm1hcChjID0+IGMuYXV0aG9yKS5zb3J0KCk7XG5pZiAoYXV0aG9ycy5sZW5ndGggPT09IDEpIHtcbl8lPlxuIyMgU3BlY2lhbCBUaGFua3M6XG48JS0gYXV0aG9yc1swXSU+XG48JV9cbn1cbmlmIChhdXRob3JzLmxlbmd0aCA+IDEpIHtcbl8lPlxuIyMgU3BlY2lhbCBUaGFua3M6XG48JS0gYXV0aG9ycy5zbGljZSgwLCAtMSkuam9pbignLCAnKSAlPiBhbmQgPCUtIGF1dGhvcnMuc2xpY2UoLTEpWzBdICU+XG48JV9cbn1cbl8lPlxuYDtcbiJdfQ==