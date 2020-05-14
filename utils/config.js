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
        define("@angular/dev-infra-private/utils/config", ["require", "exports", "tslib", "path", "shelljs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getRepoBaseDir = exports.assertNoErrors = exports.getConfig = void 0;
    var tslib_1 = require("tslib");
    var path_1 = require("path");
    var shelljs_1 = require("shelljs");
    // The filename expected for creating the ng-dev config, without the file
    // extension to allow either a typescript or javascript file to be used.
    var CONFIG_FILE_NAME = '.ng-dev-config';
    /** The configuration for ng-dev. */
    var CONFIG = null;
    /**
     * Get the configuration from the file system, returning the already loaded copy if it
     * is defined.
     */
    function getConfig() {
        // If the global config is not defined, load it from the file system.
        if (CONFIG === null) {
            // The full path to the configuration file.
            var configPath = path_1.join(getRepoBaseDir(), CONFIG_FILE_NAME);
            // Set the global config object to a clone of the configuration loaded through default exports
            // from the config file.
            CONFIG = tslib_1.__assign({}, require(configPath));
        }
        // Return a clone of the global config to ensure that a new instance of the config is returned
        // each time, preventing unexpected effects of modifications to the config object.
        return validateCommonConfig(tslib_1.__assign({}, CONFIG));
    }
    exports.getConfig = getConfig;
    /** Validate the common configuration has been met for the ng-dev command. */
    function validateCommonConfig(config) {
        // TODO: add validation for the common configuration
        return config;
    }
    /**
     * Asserts the provided array of error messages is empty. If any errors are in the array,
     * logs the errors and exit the process as a failure.
     */
    function assertNoErrors(errors) {
        var e_1, _a;
        if (errors.length == 0) {
            return;
        }
        console.error("Errors discovered while loading configuration file:");
        try {
            for (var errors_1 = tslib_1.__values(errors), errors_1_1 = errors_1.next(); !errors_1_1.done; errors_1_1 = errors_1.next()) {
                var error_1 = errors_1_1.value;
                console.error("  - " + error_1);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (errors_1_1 && !errors_1_1.done && (_a = errors_1.return)) _a.call(errors_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        process.exit(1);
    }
    exports.assertNoErrors = assertNoErrors;
    /** Gets the path of the directory for the repository base. */
    function getRepoBaseDir() {
        var baseRepoDir = shelljs_1.exec("git rev-parse --show-toplevel", { silent: true });
        if (baseRepoDir.code) {
            throw Error("Unable to find the path to the base directory of the repository.\n" +
                "Was the command run from inside of the repo?\n\n" +
                ("ERROR:\n " + baseRepoDir.stderr));
        }
        return baseRepoDir.trim();
    }
    exports.getRepoBaseDir = getRepoBaseDir;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsNkJBQTBCO0lBQzFCLG1DQUE2QjtJQWE3Qix5RUFBeUU7SUFDekUsd0VBQXdFO0lBQ3hFLElBQU0sZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7SUFFMUMsb0NBQW9DO0lBQ3BDLElBQUksTUFBTSxHQUFZLElBQUksQ0FBQztJQUUzQjs7O09BR0c7SUFDSCxTQUFnQixTQUFTO1FBQ3ZCLHFFQUFxRTtRQUNyRSxJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7WUFDbkIsMkNBQTJDO1lBQzNDLElBQU0sVUFBVSxHQUFHLFdBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzVELDhGQUE4RjtZQUM5Rix3QkFBd0I7WUFDeEIsTUFBTSx3QkFBTyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztTQUNuQztRQUNELDhGQUE4RjtRQUM5RixrRkFBa0Y7UUFDbEYsT0FBTyxvQkFBb0Isc0JBQUssTUFBTSxFQUFFLENBQUM7SUFDM0MsQ0FBQztJQVpELDhCQVlDO0lBRUQsNkVBQTZFO0lBQzdFLFNBQVMsb0JBQW9CLENBQUMsTUFBaUM7UUFDN0Qsb0RBQW9EO1FBQ3BELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxTQUFnQixjQUFjLENBQUMsTUFBZ0I7O1FBQzdDLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7WUFDdEIsT0FBTztTQUNSO1FBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxxREFBcUQsQ0FBQyxDQUFDOztZQUNyRSxLQUFvQixJQUFBLFdBQUEsaUJBQUEsTUFBTSxDQUFBLDhCQUFBLGtEQUFFO2dCQUF2QixJQUFNLE9BQUssbUJBQUE7Z0JBQ2QsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFPLE9BQU8sQ0FBQyxDQUFDO2FBQy9COzs7Ozs7Ozs7UUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFURCx3Q0FTQztJQUVELDhEQUE4RDtJQUM5RCxTQUFnQixjQUFjO1FBQzVCLElBQU0sV0FBVyxHQUFHLGNBQUksQ0FBQywrQkFBK0IsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBQzFFLElBQUksV0FBVyxDQUFDLElBQUksRUFBRTtZQUNwQixNQUFNLEtBQUssQ0FDUCxvRUFBb0U7Z0JBQ3BFLGtEQUFrRDtpQkFDbEQsY0FBWSxXQUFXLENBQUMsTUFBUSxDQUFBLENBQUMsQ0FBQztTQUN2QztRQUNELE9BQU8sV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFURCx3Q0FTQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCB7ZXhlY30gZnJvbSAnc2hlbGxqcyc7XG5cbi8qKiBUaGUgY29tbW9uIGNvbmZpZ3VyYXRpb24gZm9yIG5nLWRldi4gKi9cbnR5cGUgQ29tbW9uQ29uZmlnID0ge1xuICAgIC8vIFRPRE86IGFkZCBjb21tb24gY29uZmlndXJhdGlvblxufTtcblxuLyoqXG4gKiBUaGUgY29uZmlndXJhdGlvbiBmb3IgdGhlIHNwZWNpZmljIG5nLWRldiBjb21tYW5kLCBwcm92aWRpbmcgYm90aCB0aGUgY29tbW9uXG4gKiBuZy1kZXYgY29uZmlnIGFzIHdlbGwgYXMgdGhlIHNwZWNpZmljIGNvbmZpZyBvZiBhIHN1YmNvbW1hbmQuXG4gKi9cbmV4cG9ydCB0eXBlIE5nRGV2Q29uZmlnPFQgPSB7fT4gPSBDb21tb25Db25maWcmVDtcblxuLy8gVGhlIGZpbGVuYW1lIGV4cGVjdGVkIGZvciBjcmVhdGluZyB0aGUgbmctZGV2IGNvbmZpZywgd2l0aG91dCB0aGUgZmlsZVxuLy8gZXh0ZW5zaW9uIHRvIGFsbG93IGVpdGhlciBhIHR5cGVzY3JpcHQgb3IgamF2YXNjcmlwdCBmaWxlIHRvIGJlIHVzZWQuXG5jb25zdCBDT05GSUdfRklMRV9OQU1FID0gJy5uZy1kZXYtY29uZmlnJztcblxuLyoqIFRoZSBjb25maWd1cmF0aW9uIGZvciBuZy1kZXYuICovXG5sZXQgQ09ORklHOiB7fXxudWxsID0gbnVsbDtcblxuLyoqXG4gKiBHZXQgdGhlIGNvbmZpZ3VyYXRpb24gZnJvbSB0aGUgZmlsZSBzeXN0ZW0sIHJldHVybmluZyB0aGUgYWxyZWFkeSBsb2FkZWQgY29weSBpZiBpdFxuICogaXMgZGVmaW5lZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZygpOiBOZ0RldkNvbmZpZyB7XG4gIC8vIElmIHRoZSBnbG9iYWwgY29uZmlnIGlzIG5vdCBkZWZpbmVkLCBsb2FkIGl0IGZyb20gdGhlIGZpbGUgc3lzdGVtLlxuICBpZiAoQ09ORklHID09PSBudWxsKSB7XG4gICAgLy8gVGhlIGZ1bGwgcGF0aCB0byB0aGUgY29uZmlndXJhdGlvbiBmaWxlLlxuICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBqb2luKGdldFJlcG9CYXNlRGlyKCksIENPTkZJR19GSUxFX05BTUUpO1xuICAgIC8vIFNldCB0aGUgZ2xvYmFsIGNvbmZpZyBvYmplY3QgdG8gYSBjbG9uZSBvZiB0aGUgY29uZmlndXJhdGlvbiBsb2FkZWQgdGhyb3VnaCBkZWZhdWx0IGV4cG9ydHNcbiAgICAvLyBmcm9tIHRoZSBjb25maWcgZmlsZS5cbiAgICBDT05GSUcgPSB7Li4ucmVxdWlyZShjb25maWdQYXRoKX07XG4gIH1cbiAgLy8gUmV0dXJuIGEgY2xvbmUgb2YgdGhlIGdsb2JhbCBjb25maWcgdG8gZW5zdXJlIHRoYXQgYSBuZXcgaW5zdGFuY2Ugb2YgdGhlIGNvbmZpZyBpcyByZXR1cm5lZFxuICAvLyBlYWNoIHRpbWUsIHByZXZlbnRpbmcgdW5leHBlY3RlZCBlZmZlY3RzIG9mIG1vZGlmaWNhdGlvbnMgdG8gdGhlIGNvbmZpZyBvYmplY3QuXG4gIHJldHVybiB2YWxpZGF0ZUNvbW1vbkNvbmZpZyh7Li4uQ09ORklHfSk7XG59XG5cbi8qKiBWYWxpZGF0ZSB0aGUgY29tbW9uIGNvbmZpZ3VyYXRpb24gaGFzIGJlZW4gbWV0IGZvciB0aGUgbmctZGV2IGNvbW1hbmQuICovXG5mdW5jdGlvbiB2YWxpZGF0ZUNvbW1vbkNvbmZpZyhjb25maWc6IE5nRGV2Q29uZmlnPENvbW1vbkNvbmZpZz4pIHtcbiAgLy8gVE9ETzogYWRkIHZhbGlkYXRpb24gZm9yIHRoZSBjb21tb24gY29uZmlndXJhdGlvblxuICByZXR1cm4gY29uZmlnO1xufVxuXG4vKipcbiAqIEFzc2VydHMgdGhlIHByb3ZpZGVkIGFycmF5IG9mIGVycm9yIG1lc3NhZ2VzIGlzIGVtcHR5LiBJZiBhbnkgZXJyb3JzIGFyZSBpbiB0aGUgYXJyYXksXG4gKiBsb2dzIHRoZSBlcnJvcnMgYW5kIGV4aXQgdGhlIHByb2Nlc3MgYXMgYSBmYWlsdXJlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0Tm9FcnJvcnMoZXJyb3JzOiBzdHJpbmdbXSkge1xuICBpZiAoZXJyb3JzLmxlbmd0aCA9PSAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnNvbGUuZXJyb3IoYEVycm9ycyBkaXNjb3ZlcmVkIHdoaWxlIGxvYWRpbmcgY29uZmlndXJhdGlvbiBmaWxlOmApO1xuICBmb3IgKGNvbnN0IGVycm9yIG9mIGVycm9ycykge1xuICAgIGNvbnNvbGUuZXJyb3IoYCAgLSAke2Vycm9yfWApO1xuICB9XG4gIHByb2Nlc3MuZXhpdCgxKTtcbn1cblxuLyoqIEdldHMgdGhlIHBhdGggb2YgdGhlIGRpcmVjdG9yeSBmb3IgdGhlIHJlcG9zaXRvcnkgYmFzZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRSZXBvQmFzZURpcigpIHtcbiAgY29uc3QgYmFzZVJlcG9EaXIgPSBleGVjKGBnaXQgcmV2LXBhcnNlIC0tc2hvdy10b3BsZXZlbGAsIHtzaWxlbnQ6IHRydWV9KTtcbiAgaWYgKGJhc2VSZXBvRGlyLmNvZGUpIHtcbiAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgYFVuYWJsZSB0byBmaW5kIHRoZSBwYXRoIHRvIHRoZSBiYXNlIGRpcmVjdG9yeSBvZiB0aGUgcmVwb3NpdG9yeS5cXG5gICtcbiAgICAgICAgYFdhcyB0aGUgY29tbWFuZCBydW4gZnJvbSBpbnNpZGUgb2YgdGhlIHJlcG8/XFxuXFxuYCArXG4gICAgICAgIGBFUlJPUjpcXG4gJHtiYXNlUmVwb0Rpci5zdGRlcnJ9YCk7XG4gIH1cbiAgcmV0dXJuIGJhc2VSZXBvRGlyLnRyaW0oKTtcbn1cbiJdfQ==