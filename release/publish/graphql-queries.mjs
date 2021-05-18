/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { params, types } from 'typed-graphqlify';
/**
 * Graphql Github API query that can be used to find forks of a given repository
 * that are owned by the current viewer authenticated with the Github API.
 */
export const findOwnedForksOfRepoQuery = params({
    $owner: 'String!',
    $name: 'String!',
}, {
    repository: params({ owner: '$owner', name: '$name' }, {
        forks: params({ affiliations: 'OWNER', first: 1 }, {
            nodes: [{
                    owner: {
                        login: types.string,
                    },
                    name: types.string,
                }],
        }),
    }),
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JhcGhxbC1xdWVyaWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvcHVibGlzaC9ncmFwaHFsLXF1ZXJpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUUvQzs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSx5QkFBeUIsR0FBRyxNQUFNLENBQzNDO0lBQ0UsTUFBTSxFQUFFLFNBQVM7SUFDakIsS0FBSyxFQUFFLFNBQVM7Q0FDakIsRUFDRDtJQUNFLFVBQVUsRUFBRSxNQUFNLENBQUMsRUFBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUMsRUFBRTtRQUNuRCxLQUFLLEVBQUUsTUFBTSxDQUFDLEVBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDLEVBQUU7WUFDL0MsS0FBSyxFQUFFLENBQUM7b0JBQ04sS0FBSyxFQUFFO3dCQUNMLEtBQUssRUFBRSxLQUFLLENBQUMsTUFBTTtxQkFDcEI7b0JBQ0QsSUFBSSxFQUFFLEtBQUssQ0FBQyxNQUFNO2lCQUNuQixDQUFDO1NBQ0gsQ0FBQztLQUNILENBQUM7Q0FDSCxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtwYXJhbXMsIHR5cGVzfSBmcm9tICd0eXBlZC1ncmFwaHFsaWZ5JztcblxuLyoqXG4gKiBHcmFwaHFsIEdpdGh1YiBBUEkgcXVlcnkgdGhhdCBjYW4gYmUgdXNlZCB0byBmaW5kIGZvcmtzIG9mIGEgZ2l2ZW4gcmVwb3NpdG9yeVxuICogdGhhdCBhcmUgb3duZWQgYnkgdGhlIGN1cnJlbnQgdmlld2VyIGF1dGhlbnRpY2F0ZWQgd2l0aCB0aGUgR2l0aHViIEFQSS5cbiAqL1xuZXhwb3J0IGNvbnN0IGZpbmRPd25lZEZvcmtzT2ZSZXBvUXVlcnkgPSBwYXJhbXMoXG4gICAge1xuICAgICAgJG93bmVyOiAnU3RyaW5nIScsXG4gICAgICAkbmFtZTogJ1N0cmluZyEnLFxuICAgIH0sXG4gICAge1xuICAgICAgcmVwb3NpdG9yeTogcGFyYW1zKHtvd25lcjogJyRvd25lcicsIG5hbWU6ICckbmFtZSd9LCB7XG4gICAgICAgIGZvcmtzOiBwYXJhbXMoe2FmZmlsaWF0aW9uczogJ09XTkVSJywgZmlyc3Q6IDF9LCB7XG4gICAgICAgICAgbm9kZXM6IFt7XG4gICAgICAgICAgICBvd25lcjoge1xuICAgICAgICAgICAgICBsb2dpbjogdHlwZXMuc3RyaW5nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG5hbWU6IHR5cGVzLnN0cmluZyxcbiAgICAgICAgICB9XSxcbiAgICAgICAgfSksXG4gICAgICB9KSxcbiAgICB9KTtcbiJdfQ==