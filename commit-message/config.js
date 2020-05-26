/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
        // The unvalidated config object.
        var config = config_1.getConfig();
        if (config.commitMessage === undefined) {
            errors.push("No configuration defined for \"commitMessage\"");
        }
        config_1.assertNoErrors(errors);
        return config;
    }
    exports.getCommitMessageConfig = getCommitMessageConfig;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCxrRUFBdUU7SUFTdkUsaUVBQWlFO0lBQ2pFLFNBQWdCLHNCQUFzQjtRQUNwQyxvREFBb0Q7UUFDcEQsSUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO1FBQzVCLGlDQUFpQztRQUNqQyxJQUFNLE1BQU0sR0FBK0Qsa0JBQVMsRUFBRSxDQUFDO1FBRXZGLElBQUksTUFBTSxDQUFDLGFBQWEsS0FBSyxTQUFTLEVBQUU7WUFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQyxnREFBOEMsQ0FBQyxDQUFDO1NBQzdEO1FBRUQsdUJBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QixPQUFPLE1BQWlDLENBQUM7SUFDM0MsQ0FBQztJQVpELHdEQVlDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Fzc2VydE5vRXJyb3JzLCBnZXRDb25maWcsIE5nRGV2Q29uZmlnfSBmcm9tICcuLi91dGlscy9jb25maWcnO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbW1pdE1lc3NhZ2VDb25maWcge1xuICBtYXhMaW5lTGVuZ3RoOiBudW1iZXI7XG4gIG1pbkJvZHlMZW5ndGg6IG51bWJlcjtcbiAgdHlwZXM6IHN0cmluZ1tdO1xuICBzY29wZXM6IHN0cmluZ1tdO1xufVxuXG4vKiogUmV0cmlldmUgYW5kIHZhbGlkYXRlIHRoZSBjb25maWcgYXMgYENvbW1pdE1lc3NhZ2VDb25maWdgLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbW1pdE1lc3NhZ2VDb25maWcoKSB7XG4gIC8vIExpc3Qgb2YgZXJyb3JzIGVuY291bnRlcmVkIHZhbGlkYXRpbmcgdGhlIGNvbmZpZy5cbiAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuICAvLyBUaGUgdW52YWxpZGF0ZWQgY29uZmlnIG9iamVjdC5cbiAgY29uc3QgY29uZmlnOiBQYXJ0aWFsPE5nRGV2Q29uZmlnPHtjb21taXRNZXNzYWdlOiBDb21taXRNZXNzYWdlQ29uZmlnfT4+ID0gZ2V0Q29uZmlnKCk7XG5cbiAgaWYgKGNvbmZpZy5jb21taXRNZXNzYWdlID09PSB1bmRlZmluZWQpIHtcbiAgICBlcnJvcnMucHVzaChgTm8gY29uZmlndXJhdGlvbiBkZWZpbmVkIGZvciBcImNvbW1pdE1lc3NhZ2VcImApO1xuICB9XG5cbiAgYXNzZXJ0Tm9FcnJvcnMoZXJyb3JzKTtcbiAgcmV0dXJuIGNvbmZpZyBhcyBSZXF1aXJlZDx0eXBlb2YgY29uZmlnPjtcbn1cbiJdfQ==