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
        define("@angular/dev-infra-private/commit-message/config", ["require", "exports", "@angular/dev-infra-private/utils/config"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCommitMessageConfig = void 0;
    var config_1 = require("@angular/dev-infra-private/utils/config");
    /** Retrieve and validate the config as `CommitMessageConfig`. */
    function getCommitMessageConfig() {
        // List of errors encountered validating the config.
        var errors = [];
        // The non-validated config object.
        var config = config_1.getConfig();
        if (config.commitMessage === undefined) {
            errors.push("No configuration defined for \"commitMessage\"");
        }
        config_1.assertNoErrors(errors);
        return config;
    }
    exports.getCommitMessageConfig = getCommitMessageConfig;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCxrRUFBdUU7SUFVdkUsaUVBQWlFO0lBQ2pFLFNBQWdCLHNCQUFzQjtRQUNwQyxvREFBb0Q7UUFDcEQsSUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO1FBQzVCLG1DQUFtQztRQUNuQyxJQUFNLE1BQU0sR0FBK0Qsa0JBQVMsRUFBRSxDQUFDO1FBRXZGLElBQUksTUFBTSxDQUFDLGFBQWEsS0FBSyxTQUFTLEVBQUU7WUFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQyxnREFBOEMsQ0FBQyxDQUFDO1NBQzdEO1FBRUQsdUJBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QixPQUFPLE1BQWlDLENBQUM7SUFDM0MsQ0FBQztJQVpELHdEQVlDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7YXNzZXJ0Tm9FcnJvcnMsIGdldENvbmZpZywgTmdEZXZDb25maWd9IGZyb20gJy4uL3V0aWxzL2NvbmZpZyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tbWl0TWVzc2FnZUNvbmZpZyB7XG4gIG1heExpbmVMZW5ndGg6IG51bWJlcjtcbiAgbWluQm9keUxlbmd0aDogbnVtYmVyO1xuICBtaW5Cb2R5TGVuZ3RoVHlwZUV4Y2x1ZGVzPzogc3RyaW5nW107XG4gIHR5cGVzOiBzdHJpbmdbXTtcbiAgc2NvcGVzOiBzdHJpbmdbXTtcbn1cblxuLyoqIFJldHJpZXZlIGFuZCB2YWxpZGF0ZSB0aGUgY29uZmlnIGFzIGBDb21taXRNZXNzYWdlQ29uZmlnYC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb21taXRNZXNzYWdlQ29uZmlnKCkge1xuICAvLyBMaXN0IG9mIGVycm9ycyBlbmNvdW50ZXJlZCB2YWxpZGF0aW5nIHRoZSBjb25maWcuXG4gIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcbiAgLy8gVGhlIG5vbi12YWxpZGF0ZWQgY29uZmlnIG9iamVjdC5cbiAgY29uc3QgY29uZmlnOiBQYXJ0aWFsPE5nRGV2Q29uZmlnPHtjb21taXRNZXNzYWdlOiBDb21taXRNZXNzYWdlQ29uZmlnfT4+ID0gZ2V0Q29uZmlnKCk7XG5cbiAgaWYgKGNvbmZpZy5jb21taXRNZXNzYWdlID09PSB1bmRlZmluZWQpIHtcbiAgICBlcnJvcnMucHVzaChgTm8gY29uZmlndXJhdGlvbiBkZWZpbmVkIGZvciBcImNvbW1pdE1lc3NhZ2VcImApO1xuICB9XG5cbiAgYXNzZXJ0Tm9FcnJvcnMoZXJyb3JzKTtcbiAgcmV0dXJuIGNvbmZpZyBhcyBSZXF1aXJlZDx0eXBlb2YgY29uZmlnPjtcbn1cbiJdfQ==