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
        define("@angular/dev-infra-private/caretaker/check/base", ["require", "exports", "@angular/dev-infra-private/utils/git/authenticated-git-client"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseModule = void 0;
    var authenticated_git_client_1 = require("@angular/dev-infra-private/utils/git/authenticated-git-client");
    /** The BaseModule to extend modules for caretaker checks from. */
    var BaseModule = /** @class */ (function () {
        function BaseModule(config) {
            this.config = config;
            /** The singleton instance of the authenticated git client. */
            this.git = authenticated_git_client_1.AuthenticatedGitClient.get();
            /** The data for the module. */
            this.data = this.retrieveData();
        }
        return BaseModule;
    }());
    exports.BaseModule = BaseModule;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9jYXJldGFrZXIvY2hlY2svYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFHSCwwR0FBZ0Y7SUFHaEYsa0VBQWtFO0lBQ2xFO1FBTUUsb0JBQXNCLE1BQWlEO1lBQWpELFdBQU0sR0FBTixNQUFNLENBQTJDO1lBTHZFLDhEQUE4RDtZQUNwRCxRQUFHLEdBQUcsaURBQXNCLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDN0MsK0JBQStCO1lBQ3RCLFNBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFc0MsQ0FBQztRQU83RSxpQkFBQztJQUFELENBQUMsQUFiRCxJQWFDO0lBYnFCLGdDQUFVIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TmdEZXZDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHtDYXJldGFrZXJDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5cbi8qKiBUaGUgQmFzZU1vZHVsZSB0byBleHRlbmQgbW9kdWxlcyBmb3IgY2FyZXRha2VyIGNoZWNrcyBmcm9tLiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJhc2VNb2R1bGU8RGF0YT4ge1xuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgYXV0aGVudGljYXRlZCBnaXQgY2xpZW50LiAqL1xuICBwcm90ZWN0ZWQgZ2l0ID0gQXV0aGVudGljYXRlZEdpdENsaWVudC5nZXQoKTtcbiAgLyoqIFRoZSBkYXRhIGZvciB0aGUgbW9kdWxlLiAqL1xuICByZWFkb25seSBkYXRhID0gdGhpcy5yZXRyaWV2ZURhdGEoKTtcblxuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgY29uZmlnOiBOZ0RldkNvbmZpZzx7Y2FyZXRha2VyOiBDYXJldGFrZXJDb25maWd9Pikge31cblxuICAvKiogQXN5bmNyb25vdXNseSByZXRyaWV2ZSBkYXRhIGZvciB0aGUgbW9kdWxlLiAqL1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmV0cmlldmVEYXRhKCk6IFByb21pc2U8RGF0YT47XG5cbiAgLyoqIFByaW50IHRoZSBpbmZvcm1hdGlvbiBkaXNjb3ZlcmVkIGZvciB0aGUgbW9kdWxlIHRvIHRoZSB0ZXJtaW5hbC4gKi9cbiAgYWJzdHJhY3QgcHJpbnRUb1Rlcm1pbmFsKCk6IFByb21pc2U8dm9pZD47XG59XG4iXX0=