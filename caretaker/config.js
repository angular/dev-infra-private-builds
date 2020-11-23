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
        define("@angular/dev-infra-private/caretaker/config", ["require", "exports", "@angular/dev-infra-private/utils/config"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCaretakerConfig = void 0;
    var config_1 = require("@angular/dev-infra-private/utils/config");
    /** Retrieve and validate the config as `CaretakerConfig`. */
    function getCaretakerConfig() {
        // List of errors encountered validating the config.
        var errors = [];
        // The non-validated config object.
        var config = config_1.getConfig();
        config_1.assertNoErrors(errors);
        return config;
    }
    exports.getCaretakerConfig = getCaretakerConfig;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NhcmV0YWtlci9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsa0VBQXVFO0lBTXZFLDZEQUE2RDtJQUM3RCxTQUFnQixrQkFBa0I7UUFDaEMsb0RBQW9EO1FBQ3BELElBQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztRQUM1QixtQ0FBbUM7UUFDbkMsSUFBTSxNQUFNLEdBQXVELGtCQUFTLEVBQUUsQ0FBQztRQUUvRSx1QkFBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZCLE9BQU8sTUFBaUMsQ0FBQztJQUMzQyxDQUFDO0lBUkQsZ0RBUUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHthc3NlcnROb0Vycm9ycywgZ2V0Q29uZmlnLCBOZ0RldkNvbmZpZ30gZnJvbSAnLi4vdXRpbHMvY29uZmlnJztcblxuZXhwb3J0IGludGVyZmFjZSBDYXJldGFrZXJDb25maWcge1xuICBnaXRodWJRdWVyaWVzPzoge25hbWU6IHN0cmluZzsgcXVlcnk6IHN0cmluZzt9W107XG59XG5cbi8qKiBSZXRyaWV2ZSBhbmQgdmFsaWRhdGUgdGhlIGNvbmZpZyBhcyBgQ2FyZXRha2VyQ29uZmlnYC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDYXJldGFrZXJDb25maWcoKSB7XG4gIC8vIExpc3Qgb2YgZXJyb3JzIGVuY291bnRlcmVkIHZhbGlkYXRpbmcgdGhlIGNvbmZpZy5cbiAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuICAvLyBUaGUgbm9uLXZhbGlkYXRlZCBjb25maWcgb2JqZWN0LlxuICBjb25zdCBjb25maWc6IFBhcnRpYWw8TmdEZXZDb25maWc8e2NhcmV0YWtlcjogQ2FyZXRha2VyQ29uZmlnfT4+ID0gZ2V0Q29uZmlnKCk7XG5cbiAgYXNzZXJ0Tm9FcnJvcnMoZXJyb3JzKTtcbiAgcmV0dXJuIGNvbmZpZyBhcyBSZXF1aXJlZDx0eXBlb2YgY29uZmlnPjtcbn1cbiJdfQ==