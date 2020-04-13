(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/pullapprove/parse-yaml", ["require", "exports", "yaml"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var yaml_1 = require("yaml");
    function parsePullApproveYaml(rawYaml) {
        return yaml_1.parse(rawYaml);
    }
    exports.parsePullApproveYaml = parsePullApproveYaml;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UteWFtbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wdWxsYXBwcm92ZS9wYXJzZS15YW1sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsNkJBQXdDO0lBeUJ4QyxTQUFnQixvQkFBb0IsQ0FBQyxPQUFlO1FBQ2xELE9BQU8sWUFBUyxDQUFDLE9BQU8sQ0FBc0IsQ0FBQztJQUNqRCxDQUFDO0lBRkQsb0RBRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge3BhcnNlIGFzIHBhcnNlWWFtbH0gZnJvbSAneWFtbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHVsbEFwcHJvdmVHcm91cENvbmZpZyB7XG4gIGNvbmRpdGlvbnM/OiBzdHJpbmc7XG4gIHJldmlld2Vyczoge1xuICAgIHVzZXJzOiBzdHJpbmdbXSxcbiAgICB0ZWFtcz86IHN0cmluZ1tdLFxuICB9fHtcbiAgICB0ZWFtczogc3RyaW5nW10sXG4gIH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHVsbEFwcHJvdmVDb25maWcge1xuICB2ZXJzaW9uOiBudW1iZXI7XG4gIGdpdGh1Yl9hcGlfdmVyc2lvbj86IHN0cmluZztcbiAgcHVsbGFwcHJvdmVfY29uZGl0aW9ucz86IHtcbiAgICBjb25kaXRpb246IHN0cmluZyxcbiAgICB1bm1ldF9zdGF0dXM6IHN0cmluZyxcbiAgICBleHBsYW5hdGlvbjogc3RyaW5nLFxuICB9W107XG4gIGdyb3Vwczoge1xuICAgIFtrZXk6IHN0cmluZ106IFB1bGxBcHByb3ZlR3JvdXBDb25maWcsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVB1bGxBcHByb3ZlWWFtbChyYXdZYW1sOiBzdHJpbmcpOiBQdWxsQXBwcm92ZUNvbmZpZyB7XG4gIHJldHVybiBwYXJzZVlhbWwocmF3WWFtbCkgYXMgUHVsbEFwcHJvdmVDb25maWc7XG59XG4iXX0=