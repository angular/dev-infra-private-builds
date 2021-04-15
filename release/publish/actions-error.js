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
        define("@angular/dev-infra-private/release/publish/actions-error", ["require", "exports", "tslib"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FatalReleaseActionError = exports.UserAbortedReleaseActionError = void 0;
    var tslib_1 = require("tslib");
    /** Error that will be thrown if the user manually aborted a release action. */
    var UserAbortedReleaseActionError = /** @class */ (function (_super) {
        tslib_1.__extends(UserAbortedReleaseActionError, _super);
        function UserAbortedReleaseActionError() {
            var _this = _super.call(this) || this;
            // Set the prototype explicitly because in ES5, the prototype is accidentally lost due to
            // a limitation in down-leveling.
            // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
            Object.setPrototypeOf(_this, UserAbortedReleaseActionError.prototype);
            return _this;
        }
        return UserAbortedReleaseActionError;
    }(Error));
    exports.UserAbortedReleaseActionError = UserAbortedReleaseActionError;
    /** Error that will be thrown if the action has been aborted due to a fatal error. */
    var FatalReleaseActionError = /** @class */ (function (_super) {
        tslib_1.__extends(FatalReleaseActionError, _super);
        function FatalReleaseActionError() {
            var _this = _super.call(this) || this;
            // Set the prototype explicitly because in ES5, the prototype is accidentally lost due to
            // a limitation in down-leveling.
            // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
            Object.setPrototypeOf(_this, FatalReleaseActionError.prototype);
            return _this;
        }
        return FatalReleaseActionError;
    }(Error));
    exports.FatalReleaseActionError = FatalReleaseActionError;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy1lcnJvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy1lcnJvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsK0VBQStFO0lBQy9FO1FBQW1ELHlEQUFLO1FBQ3REO1lBQUEsWUFDRSxpQkFBTyxTQUtSO1lBSkMseUZBQXlGO1lBQ3pGLGlDQUFpQztZQUNqQyxpSEFBaUg7WUFDakgsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFJLEVBQUUsNkJBQTZCLENBQUMsU0FBUyxDQUFDLENBQUM7O1FBQ3ZFLENBQUM7UUFDSCxvQ0FBQztJQUFELENBQUMsQUFSRCxDQUFtRCxLQUFLLEdBUXZEO0lBUlksc0VBQTZCO0lBVTFDLHFGQUFxRjtJQUNyRjtRQUE2QyxtREFBSztRQUNoRDtZQUFBLFlBQ0UsaUJBQU8sU0FLUjtZQUpDLHlGQUF5RjtZQUN6RixpQ0FBaUM7WUFDakMsaUhBQWlIO1lBQ2pILE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSSxFQUFFLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDOztRQUNqRSxDQUFDO1FBQ0gsOEJBQUM7SUFBRCxDQUFDLEFBUkQsQ0FBNkMsS0FBSyxHQVFqRDtJQVJZLDBEQUF1QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKiogRXJyb3IgdGhhdCB3aWxsIGJlIHRocm93biBpZiB0aGUgdXNlciBtYW51YWxseSBhYm9ydGVkIGEgcmVsZWFzZSBhY3Rpb24uICovXG5leHBvcnQgY2xhc3MgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgLy8gU2V0IHRoZSBwcm90b3R5cGUgZXhwbGljaXRseSBiZWNhdXNlIGluIEVTNSwgdGhlIHByb3RvdHlwZSBpcyBhY2NpZGVudGFsbHkgbG9zdCBkdWUgdG9cbiAgICAvLyBhIGxpbWl0YXRpb24gaW4gZG93bi1sZXZlbGluZy5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvd2lraS9GQVEjd2h5LWRvZXNudC1leHRlbmRpbmctYnVpbHQtaW5zLWxpa2UtZXJyb3ItYXJyYXktYW5kLW1hcC13b3JrLlxuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvci5wcm90b3R5cGUpO1xuICB9XG59XG5cbi8qKiBFcnJvciB0aGF0IHdpbGwgYmUgdGhyb3duIGlmIHRoZSBhY3Rpb24gaGFzIGJlZW4gYWJvcnRlZCBkdWUgdG8gYSBmYXRhbCBlcnJvci4gKi9cbmV4cG9ydCBjbGFzcyBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICAvLyBTZXQgdGhlIHByb3RvdHlwZSBleHBsaWNpdGx5IGJlY2F1c2UgaW4gRVM1LCB0aGUgcHJvdG90eXBlIGlzIGFjY2lkZW50YWxseSBsb3N0IGR1ZSB0b1xuICAgIC8vIGEgbGltaXRhdGlvbiBpbiBkb3duLWxldmVsaW5nLlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC93aWtpL0ZBUSN3aHktZG9lc250LWV4dGVuZGluZy1idWlsdC1pbnMtbGlrZS1lcnJvci1hcnJheS1hbmQtbWFwLXdvcmsuXG4gICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yLnByb3RvdHlwZSk7XG4gIH1cbn1cbiJdfQ==