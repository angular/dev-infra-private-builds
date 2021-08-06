"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOwnedForksOfRepoQuery = void 0;
const typed_graphqlify_1 = require("typed-graphqlify");
/**
 * Graphql Github API query that can be used to find forks of a given repository
 * that are owned by the current viewer authenticated with the Github API.
 */
exports.findOwnedForksOfRepoQuery = typed_graphqlify_1.params({
    $owner: 'String!',
    $name: 'String!',
}, {
    repository: typed_graphqlify_1.params({ owner: '$owner', name: '$name' }, {
        forks: typed_graphqlify_1.params({ affiliations: 'OWNER', first: 1 }, {
            nodes: [
                {
                    owner: {
                        login: typed_graphqlify_1.types.string,
                    },
                    name: typed_graphqlify_1.types.string,
                },
            ],
        }),
    }),
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JhcGhxbC1xdWVyaWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2UvcHVibGlzaC9ncmFwaHFsLXF1ZXJpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsdURBQStDO0FBRS9DOzs7R0FHRztBQUNVLFFBQUEseUJBQXlCLEdBQUcseUJBQU0sQ0FDN0M7SUFDRSxNQUFNLEVBQUUsU0FBUztJQUNqQixLQUFLLEVBQUUsU0FBUztDQUNqQixFQUNEO0lBQ0UsVUFBVSxFQUFFLHlCQUFNLENBQ2hCLEVBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDLEVBQ2hDO1FBQ0UsS0FBSyxFQUFFLHlCQUFNLENBQ1gsRUFBQyxZQUFZLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUMsRUFDakM7WUFDRSxLQUFLLEVBQUU7Z0JBQ0w7b0JBQ0UsS0FBSyxFQUFFO3dCQUNMLEtBQUssRUFBRSx3QkFBSyxDQUFDLE1BQU07cUJBQ3BCO29CQUNELElBQUksRUFBRSx3QkFBSyxDQUFDLE1BQU07aUJBQ25CO2FBQ0Y7U0FDRixDQUNGO0tBQ0YsQ0FDRjtDQUNGLENBQ0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3BhcmFtcywgdHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuXG4vKipcbiAqIEdyYXBocWwgR2l0aHViIEFQSSBxdWVyeSB0aGF0IGNhbiBiZSB1c2VkIHRvIGZpbmQgZm9ya3Mgb2YgYSBnaXZlbiByZXBvc2l0b3J5XG4gKiB0aGF0IGFyZSBvd25lZCBieSB0aGUgY3VycmVudCB2aWV3ZXIgYXV0aGVudGljYXRlZCB3aXRoIHRoZSBHaXRodWIgQVBJLlxuICovXG5leHBvcnQgY29uc3QgZmluZE93bmVkRm9ya3NPZlJlcG9RdWVyeSA9IHBhcmFtcyhcbiAge1xuICAgICRvd25lcjogJ1N0cmluZyEnLFxuICAgICRuYW1lOiAnU3RyaW5nIScsXG4gIH0sXG4gIHtcbiAgICByZXBvc2l0b3J5OiBwYXJhbXMoXG4gICAgICB7b3duZXI6ICckb3duZXInLCBuYW1lOiAnJG5hbWUnfSxcbiAgICAgIHtcbiAgICAgICAgZm9ya3M6IHBhcmFtcyhcbiAgICAgICAgICB7YWZmaWxpYXRpb25zOiAnT1dORVInLCBmaXJzdDogMX0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbm9kZXM6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG93bmVyOiB7XG4gICAgICAgICAgICAgICAgICBsb2dpbjogdHlwZXMuc3RyaW5nLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbmFtZTogdHlwZXMuc3RyaW5nLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICApLFxuICAgICAgfSxcbiAgICApLFxuICB9LFxuKTtcbiJdfQ==