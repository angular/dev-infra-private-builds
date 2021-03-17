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
        define("@angular/dev-infra-private/release/versioning", ["require", "exports", "tslib", "@angular/dev-infra-private/release/versioning/active-release-trains", "@angular/dev-infra-private/release/versioning/release-trains", "@angular/dev-infra-private/release/versioning/long-term-support", "@angular/dev-infra-private/release/versioning/version-branches", "@angular/dev-infra-private/release/versioning/npm-registry"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    tslib_1.__exportStar(require("@angular/dev-infra-private/release/versioning/active-release-trains"), exports);
    tslib_1.__exportStar(require("@angular/dev-infra-private/release/versioning/release-trains"), exports);
    tslib_1.__exportStar(require("@angular/dev-infra-private/release/versioning/long-term-support"), exports);
    tslib_1.__exportStar(require("@angular/dev-infra-private/release/versioning/version-branches"), exports);
    tslib_1.__exportStar(require("@angular/dev-infra-private/release/versioning/npm-registry"), exports);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS92ZXJzaW9uaW5nL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILDhHQUF3QztJQUN4Qyx1R0FBaUM7SUFDakMsMEdBQW9DO0lBQ3BDLHlHQUFtQztJQUNuQyxxR0FBK0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuZXhwb3J0ICogZnJvbSAnLi9hY3RpdmUtcmVsZWFzZS10cmFpbnMnO1xuZXhwb3J0ICogZnJvbSAnLi9yZWxlYXNlLXRyYWlucyc7XG5leHBvcnQgKiBmcm9tICcuL2xvbmctdGVybS1zdXBwb3J0JztcbmV4cG9ydCAqIGZyb20gJy4vdmVyc2lvbi1icmFuY2hlcyc7XG5leHBvcnQgKiBmcm9tICcuL25wbS1yZWdpc3RyeSc7XG4iXX0=