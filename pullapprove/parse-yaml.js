(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/pullapprove/parse-yaml", ["require", "exports", "tslib", "yaml", "@angular/dev-infra-private/pullapprove/group"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getGroupsFromYaml = exports.parsePullApproveYaml = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var yaml_1 = require("yaml");
    var group_1 = require("@angular/dev-infra-private/pullapprove/group");
    function parsePullApproveYaml(rawYaml) {
        return yaml_1.parse(rawYaml, { merge: true });
    }
    exports.parsePullApproveYaml = parsePullApproveYaml;
    /** Parses all of the groups defined in the pullapprove yaml. */
    function getGroupsFromYaml(pullApproveYamlRaw) {
        /** JSON representation of the pullapprove yaml file. */
        var pullApprove = parsePullApproveYaml(pullApproveYamlRaw);
        return Object.entries(pullApprove.groups).reduce(function (groups, _a) {
            var _b = tslib_1.__read(_a, 2), groupName = _b[0], group = _b[1];
            return groups.concat(new group_1.PullApproveGroup(groupName, group, groups));
        }, []);
    }
    exports.getGroupsFromYaml = getGroupsFromYaml;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UteWFtbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wdWxsYXBwcm92ZS9wYXJzZS15YW1sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCw2QkFBd0M7SUFDeEMsc0VBQXlDO0lBeUJ6QyxTQUFnQixvQkFBb0IsQ0FBQyxPQUFlO1FBQ2xELE9BQU8sWUFBUyxDQUFDLE9BQU8sRUFBRSxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBc0IsQ0FBQztJQUNoRSxDQUFDO0lBRkQsb0RBRUM7SUFFRCxnRUFBZ0U7SUFDaEUsU0FBZ0IsaUJBQWlCLENBQUMsa0JBQTBCO1FBQzFELHdEQUF3RDtRQUN4RCxJQUFNLFdBQVcsR0FBRyxvQkFBb0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQzdELE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUMsTUFBTSxFQUFFLEVBQWtCO2dCQUFsQixLQUFBLHFCQUFrQixFQUFqQixTQUFTLFFBQUEsRUFBRSxLQUFLLFFBQUE7WUFDekUsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksd0JBQWdCLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3ZFLENBQUMsRUFBRSxFQUF3QixDQUFDLENBQUM7SUFDL0IsQ0FBQztJQU5ELDhDQU1DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge3BhcnNlIGFzIHBhcnNlWWFtbH0gZnJvbSAneWFtbCc7XG5pbXBvcnQge1B1bGxBcHByb3ZlR3JvdXB9IGZyb20gJy4vZ3JvdXAnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFB1bGxBcHByb3ZlR3JvdXBDb25maWcge1xuICBjb25kaXRpb25zPzogc3RyaW5nW107XG4gIHJldmlld2Vycz86IHtcbiAgICB1c2Vyczogc3RyaW5nW10sXG4gICAgdGVhbXM/OiBzdHJpbmdbXSxcbiAgfXx7XG4gICAgdGVhbXM6IHN0cmluZ1tdLFxuICB9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFB1bGxBcHByb3ZlQ29uZmlnIHtcbiAgdmVyc2lvbjogbnVtYmVyO1xuICBnaXRodWJfYXBpX3ZlcnNpb24/OiBzdHJpbmc7XG4gIHB1bGxhcHByb3ZlX2NvbmRpdGlvbnM/OiB7XG4gICAgY29uZGl0aW9uOiBzdHJpbmcsXG4gICAgdW5tZXRfc3RhdHVzOiBzdHJpbmcsXG4gICAgZXhwbGFuYXRpb246IHN0cmluZyxcbiAgfVtdO1xuICBncm91cHM6IHtcbiAgICBba2V5OiBzdHJpbmddOiBQdWxsQXBwcm92ZUdyb3VwQ29uZmlnLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VQdWxsQXBwcm92ZVlhbWwocmF3WWFtbDogc3RyaW5nKTogUHVsbEFwcHJvdmVDb25maWcge1xuICByZXR1cm4gcGFyc2VZYW1sKHJhd1lhbWwsIHttZXJnZTogdHJ1ZX0pIGFzIFB1bGxBcHByb3ZlQ29uZmlnO1xufVxuXG4vKiogUGFyc2VzIGFsbCBvZiB0aGUgZ3JvdXBzIGRlZmluZWQgaW4gdGhlIHB1bGxhcHByb3ZlIHlhbWwuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0R3JvdXBzRnJvbVlhbWwocHVsbEFwcHJvdmVZYW1sUmF3OiBzdHJpbmcpOiBQdWxsQXBwcm92ZUdyb3VwW10ge1xuICAvKiogSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgcHVsbGFwcHJvdmUgeWFtbCBmaWxlLiAqL1xuICBjb25zdCBwdWxsQXBwcm92ZSA9IHBhcnNlUHVsbEFwcHJvdmVZYW1sKHB1bGxBcHByb3ZlWWFtbFJhdyk7XG4gIHJldHVybiBPYmplY3QuZW50cmllcyhwdWxsQXBwcm92ZS5ncm91cHMpLnJlZHVjZSgoZ3JvdXBzLCBbZ3JvdXBOYW1lLCBncm91cF0pID0+IHtcbiAgICByZXR1cm4gZ3JvdXBzLmNvbmNhdChuZXcgUHVsbEFwcHJvdmVHcm91cChncm91cE5hbWUsIGdyb3VwLCBncm91cHMpKTtcbiAgfSwgW10gYXMgUHVsbEFwcHJvdmVHcm91cFtdKTtcbn1cbiJdfQ==