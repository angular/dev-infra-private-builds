/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/release/publish/graphql-queries", ["require", "exports", "typed-graphqlify"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.findOwnedForksOfRepoQuery = void 0;
    var typed_graphqlify_1 = require("typed-graphqlify");
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
                nodes: [{
                        owner: {
                            login: typed_graphqlify_1.types.string,
                        },
                        name: typed_graphqlify_1.types.string,
                    }],
            }),
        }),
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JhcGhxbC1xdWVyaWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvcHVibGlzaC9ncmFwaHFsLXF1ZXJpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgscURBQStDO0lBRS9DOzs7T0FHRztJQUNVLFFBQUEseUJBQXlCLEdBQUcseUJBQU0sQ0FDM0M7UUFDRSxNQUFNLEVBQUUsU0FBUztRQUNqQixLQUFLLEVBQUUsU0FBUztLQUNqQixFQUNEO1FBQ0UsVUFBVSxFQUFFLHlCQUFNLENBQUMsRUFBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUMsRUFBRTtZQUNuRCxLQUFLLEVBQUUseUJBQU0sQ0FBQyxFQUFDLFlBQVksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQyxFQUFFO2dCQUMvQyxLQUFLLEVBQUUsQ0FBQzt3QkFDTixLQUFLLEVBQUU7NEJBQ0wsS0FBSyxFQUFFLHdCQUFLLENBQUMsTUFBTTt5QkFDcEI7d0JBQ0QsSUFBSSxFQUFFLHdCQUFLLENBQUMsTUFBTTtxQkFDbkIsQ0FBQzthQUNILENBQUM7U0FDSCxDQUFDO0tBQ0gsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cGFyYW1zLCB0eXBlc30gZnJvbSAndHlwZWQtZ3JhcGhxbGlmeSc7XG5cbi8qKlxuICogR3JhcGhxbCBHaXRodWIgQVBJIHF1ZXJ5IHRoYXQgY2FuIGJlIHVzZWQgdG8gZmluZCBmb3JrcyBvZiBhIGdpdmVuIHJlcG9zaXRvcnlcbiAqIHRoYXQgYXJlIG93bmVkIGJ5IHRoZSBjdXJyZW50IHZpZXdlciBhdXRoZW50aWNhdGVkIHdpdGggdGhlIEdpdGh1YiBBUEkuXG4gKi9cbmV4cG9ydCBjb25zdCBmaW5kT3duZWRGb3Jrc09mUmVwb1F1ZXJ5ID0gcGFyYW1zKFxuICAgIHtcbiAgICAgICRvd25lcjogJ1N0cmluZyEnLFxuICAgICAgJG5hbWU6ICdTdHJpbmchJyxcbiAgICB9LFxuICAgIHtcbiAgICAgIHJlcG9zaXRvcnk6IHBhcmFtcyh7b3duZXI6ICckb3duZXInLCBuYW1lOiAnJG5hbWUnfSwge1xuICAgICAgICBmb3JrczogcGFyYW1zKHthZmZpbGlhdGlvbnM6ICdPV05FUicsIGZpcnN0OiAxfSwge1xuICAgICAgICAgIG5vZGVzOiBbe1xuICAgICAgICAgICAgb3duZXI6IHtcbiAgICAgICAgICAgICAgbG9naW46IHR5cGVzLnN0cmluZyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBuYW1lOiB0eXBlcy5zdHJpbmcsXG4gICAgICAgICAgfV0sXG4gICAgICAgIH0pLFxuICAgICAgfSksXG4gICAgfSk7XG4iXX0=