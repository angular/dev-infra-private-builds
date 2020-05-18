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
    var tslib_1 = require("tslib");
    var path_1 = require("path");
    var shelljs_1 = require("shelljs");
    /**
     * The filename expected for creating the ng-dev config, without the file
     * extension to allow either a typescript or javascript file to be used.
     */
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
        var errors = [];
        // Validate the github configuration.
        if (config.github === undefined) {
            errors.push("Github repository not configured. Set the \"github\" option.");
        }
        else {
            if (config.github.name === undefined) {
                errors.push("\"github.name\" is not defined");
            }
            if (config.github.owner === undefined) {
                errors.push("\"github.owner\" is not defined");
            }
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw2QkFBMEI7SUFDMUIsbUNBQTZCO0lBd0I3Qjs7O09BR0c7SUFDSCxJQUFNLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO0lBRTFDLG9DQUFvQztJQUNwQyxJQUFJLE1BQU0sR0FBWSxJQUFJLENBQUM7SUFFM0I7OztPQUdHO0lBQ0gsU0FBZ0IsU0FBUztRQUN2QixxRUFBcUU7UUFDckUsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFO1lBQ25CLDJDQUEyQztZQUMzQyxJQUFNLFVBQVUsR0FBRyxXQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUM1RCw4RkFBOEY7WUFDOUYsd0JBQXdCO1lBQ3hCLE1BQU0sd0JBQU8sT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7U0FDbkM7UUFDRCw4RkFBOEY7UUFDOUYsa0ZBQWtGO1FBQ2xGLE9BQU8sb0JBQW9CLHNCQUFLLE1BQU0sRUFBRSxDQUFDO0lBQzNDLENBQUM7SUFaRCw4QkFZQztJQUVELDZFQUE2RTtJQUM3RSxTQUFTLG9CQUFvQixDQUFDLE1BQTRCO1FBQ3hELElBQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztRQUM1QixxQ0FBcUM7UUFDckMsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTtZQUMvQixNQUFNLENBQUMsSUFBSSxDQUFDLDhEQUE0RCxDQUFDLENBQUM7U0FDM0U7YUFBTTtZQUNMLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO2dCQUNwQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdDQUE4QixDQUFDLENBQUM7YUFDN0M7WUFDRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRTtnQkFDckMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQ0FBK0IsQ0FBQyxDQUFDO2FBQzlDO1NBQ0Y7UUFFRCxPQUFPLE1BQXFCLENBQUM7SUFDL0IsQ0FBQztJQUVEOzs7T0FHRztJQUNILFNBQWdCLGNBQWMsQ0FBQyxNQUFnQjs7UUFDN0MsSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtZQUN0QixPQUFPO1NBQ1I7UUFDRCxPQUFPLENBQUMsS0FBSyxDQUFDLHFEQUFxRCxDQUFDLENBQUM7O1lBQ3JFLEtBQW9CLElBQUEsV0FBQSxpQkFBQSxNQUFNLENBQUEsOEJBQUEsa0RBQUU7Z0JBQXZCLElBQU0sT0FBSyxtQkFBQTtnQkFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQU8sT0FBTyxDQUFDLENBQUM7YUFDL0I7Ozs7Ozs7OztRQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQVRELHdDQVNDO0lBRUQsOERBQThEO0lBQzlELFNBQWdCLGNBQWM7UUFDNUIsSUFBTSxXQUFXLEdBQUcsY0FBSSxDQUFDLCtCQUErQixFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFDMUUsSUFBSSxXQUFXLENBQUMsSUFBSSxFQUFFO1lBQ3BCLE1BQU0sS0FBSyxDQUNQLG9FQUFvRTtnQkFDcEUsa0RBQWtEO2lCQUNsRCxjQUFZLFdBQVcsQ0FBQyxNQUFRLENBQUEsQ0FBQyxDQUFDO1NBQ3ZDO1FBQ0QsT0FBTyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQVRELHdDQVNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtleGVjfSBmcm9tICdzaGVsbGpzJztcblxuLyoqXG4gKiBEZXNjcmliZXMgdGhlIEdpdGh1YiBjb25maWd1cmF0aW9uIGZvciBkZXYtaW5mcmEuIFRoaXMgY29uZmlndXJhdGlvbiBpc1xuICogdXNlZCBmb3IgQVBJIHJlcXVlc3RzLCBkZXRlcm1pbmluZyB0aGUgdXBzdHJlYW0gcmVtb3RlLCBldGMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2l0aHViQ29uZmlnIHtcbiAgLyoqIE93bmVyIG5hbWUgb2YgdGhlIHJlcG9zaXRvcnkuICovXG4gIG93bmVyOiBzdHJpbmc7XG4gIC8qKiBOYW1lIG9mIHRoZSByZXBvc2l0b3J5LiAqL1xuICBuYW1lOiBzdHJpbmc7XG59XG5cbi8qKiBUaGUgY29tbW9uIGNvbmZpZ3VyYXRpb24gZm9yIG5nLWRldi4gKi9cbnR5cGUgQ29tbW9uQ29uZmlnID0ge1xuICBnaXRodWI6IEdpdGh1YkNvbmZpZ1xufTtcblxuLyoqXG4gKiBUaGUgY29uZmlndXJhdGlvbiBmb3IgdGhlIHNwZWNpZmljIG5nLWRldiBjb21tYW5kLCBwcm92aWRpbmcgYm90aCB0aGUgY29tbW9uXG4gKiBuZy1kZXYgY29uZmlnIGFzIHdlbGwgYXMgdGhlIHNwZWNpZmljIGNvbmZpZyBvZiBhIHN1YmNvbW1hbmQuXG4gKi9cbmV4cG9ydCB0eXBlIE5nRGV2Q29uZmlnPFQgPSB7fT4gPSBDb21tb25Db25maWcmVDtcblxuLyoqXG4gKiBUaGUgZmlsZW5hbWUgZXhwZWN0ZWQgZm9yIGNyZWF0aW5nIHRoZSBuZy1kZXYgY29uZmlnLCB3aXRob3V0IHRoZSBmaWxlXG4gKiBleHRlbnNpb24gdG8gYWxsb3cgZWl0aGVyIGEgdHlwZXNjcmlwdCBvciBqYXZhc2NyaXB0IGZpbGUgdG8gYmUgdXNlZC5cbiAqL1xuY29uc3QgQ09ORklHX0ZJTEVfTkFNRSA9ICcubmctZGV2LWNvbmZpZyc7XG5cbi8qKiBUaGUgY29uZmlndXJhdGlvbiBmb3IgbmctZGV2LiAqL1xubGV0IENPTkZJRzoge318bnVsbCA9IG51bGw7XG5cbi8qKlxuICogR2V0IHRoZSBjb25maWd1cmF0aW9uIGZyb20gdGhlIGZpbGUgc3lzdGVtLCByZXR1cm5pbmcgdGhlIGFscmVhZHkgbG9hZGVkIGNvcHkgaWYgaXRcbiAqIGlzIGRlZmluZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb25maWcoKTogTmdEZXZDb25maWcge1xuICAvLyBJZiB0aGUgZ2xvYmFsIGNvbmZpZyBpcyBub3QgZGVmaW5lZCwgbG9hZCBpdCBmcm9tIHRoZSBmaWxlIHN5c3RlbS5cbiAgaWYgKENPTkZJRyA9PT0gbnVsbCkge1xuICAgIC8vIFRoZSBmdWxsIHBhdGggdG8gdGhlIGNvbmZpZ3VyYXRpb24gZmlsZS5cbiAgICBjb25zdCBjb25maWdQYXRoID0gam9pbihnZXRSZXBvQmFzZURpcigpLCBDT05GSUdfRklMRV9OQU1FKTtcbiAgICAvLyBTZXQgdGhlIGdsb2JhbCBjb25maWcgb2JqZWN0IHRvIGEgY2xvbmUgb2YgdGhlIGNvbmZpZ3VyYXRpb24gbG9hZGVkIHRocm91Z2ggZGVmYXVsdCBleHBvcnRzXG4gICAgLy8gZnJvbSB0aGUgY29uZmlnIGZpbGUuXG4gICAgQ09ORklHID0gey4uLnJlcXVpcmUoY29uZmlnUGF0aCl9O1xuICB9XG4gIC8vIFJldHVybiBhIGNsb25lIG9mIHRoZSBnbG9iYWwgY29uZmlnIHRvIGVuc3VyZSB0aGF0IGEgbmV3IGluc3RhbmNlIG9mIHRoZSBjb25maWcgaXMgcmV0dXJuZWRcbiAgLy8gZWFjaCB0aW1lLCBwcmV2ZW50aW5nIHVuZXhwZWN0ZWQgZWZmZWN0cyBvZiBtb2RpZmljYXRpb25zIHRvIHRoZSBjb25maWcgb2JqZWN0LlxuICByZXR1cm4gdmFsaWRhdGVDb21tb25Db25maWcoey4uLkNPTkZJR30pO1xufVxuXG4vKiogVmFsaWRhdGUgdGhlIGNvbW1vbiBjb25maWd1cmF0aW9uIGhhcyBiZWVuIG1ldCBmb3IgdGhlIG5nLWRldiBjb21tYW5kLiAqL1xuZnVuY3Rpb24gdmFsaWRhdGVDb21tb25Db25maWcoY29uZmlnOiBQYXJ0aWFsPE5nRGV2Q29uZmlnPikge1xuICBjb25zdCBlcnJvcnM6IHN0cmluZ1tdID0gW107XG4gIC8vIFZhbGlkYXRlIHRoZSBnaXRodWIgY29uZmlndXJhdGlvbi5cbiAgaWYgKGNvbmZpZy5naXRodWIgPT09IHVuZGVmaW5lZCkge1xuICAgIGVycm9ycy5wdXNoKGBHaXRodWIgcmVwb3NpdG9yeSBub3QgY29uZmlndXJlZC4gU2V0IHRoZSBcImdpdGh1YlwiIG9wdGlvbi5gKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoY29uZmlnLmdpdGh1Yi5uYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBcImdpdGh1Yi5uYW1lXCIgaXMgbm90IGRlZmluZWRgKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5naXRodWIub3duZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZXJyb3JzLnB1c2goYFwiZ2l0aHViLm93bmVyXCIgaXMgbm90IGRlZmluZWRgKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29uZmlnIGFzIE5nRGV2Q29uZmlnO1xufVxuXG4vKipcbiAqIEFzc2VydHMgdGhlIHByb3ZpZGVkIGFycmF5IG9mIGVycm9yIG1lc3NhZ2VzIGlzIGVtcHR5LiBJZiBhbnkgZXJyb3JzIGFyZSBpbiB0aGUgYXJyYXksXG4gKiBsb2dzIHRoZSBlcnJvcnMgYW5kIGV4aXQgdGhlIHByb2Nlc3MgYXMgYSBmYWlsdXJlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0Tm9FcnJvcnMoZXJyb3JzOiBzdHJpbmdbXSkge1xuICBpZiAoZXJyb3JzLmxlbmd0aCA9PSAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnNvbGUuZXJyb3IoYEVycm9ycyBkaXNjb3ZlcmVkIHdoaWxlIGxvYWRpbmcgY29uZmlndXJhdGlvbiBmaWxlOmApO1xuICBmb3IgKGNvbnN0IGVycm9yIG9mIGVycm9ycykge1xuICAgIGNvbnNvbGUuZXJyb3IoYCAgLSAke2Vycm9yfWApO1xuICB9XG4gIHByb2Nlc3MuZXhpdCgxKTtcbn1cblxuLyoqIEdldHMgdGhlIHBhdGggb2YgdGhlIGRpcmVjdG9yeSBmb3IgdGhlIHJlcG9zaXRvcnkgYmFzZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRSZXBvQmFzZURpcigpIHtcbiAgY29uc3QgYmFzZVJlcG9EaXIgPSBleGVjKGBnaXQgcmV2LXBhcnNlIC0tc2hvdy10b3BsZXZlbGAsIHtzaWxlbnQ6IHRydWV9KTtcbiAgaWYgKGJhc2VSZXBvRGlyLmNvZGUpIHtcbiAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgYFVuYWJsZSB0byBmaW5kIHRoZSBwYXRoIHRvIHRoZSBiYXNlIGRpcmVjdG9yeSBvZiB0aGUgcmVwb3NpdG9yeS5cXG5gICtcbiAgICAgICAgYFdhcyB0aGUgY29tbWFuZCBydW4gZnJvbSBpbnNpZGUgb2YgdGhlIHJlcG8/XFxuXFxuYCArXG4gICAgICAgIGBFUlJPUjpcXG4gJHtiYXNlUmVwb0Rpci5zdGRlcnJ9YCk7XG4gIH1cbiAgcmV0dXJuIGJhc2VSZXBvRGlyLnRyaW0oKTtcbn1cbiJdfQ==