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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw2QkFBMEI7SUFDMUIsbUNBQTZCO0lBYTdCLHlFQUF5RTtJQUN6RSx3RUFBd0U7SUFDeEUsSUFBTSxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztJQUUxQyxvQ0FBb0M7SUFDcEMsSUFBSSxNQUFNLEdBQVksSUFBSSxDQUFDO0lBRTNCOzs7T0FHRztJQUNILFNBQWdCLFNBQVM7UUFDdkIscUVBQXFFO1FBQ3JFLElBQUksTUFBTSxLQUFLLElBQUksRUFBRTtZQUNuQiwyQ0FBMkM7WUFDM0MsSUFBTSxVQUFVLEdBQUcsV0FBSSxDQUFDLGNBQWMsRUFBRSxFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFDNUQsOEZBQThGO1lBQzlGLHdCQUF3QjtZQUN4QixNQUFNLHdCQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1NBQ25DO1FBQ0QsOEZBQThGO1FBQzlGLGtGQUFrRjtRQUNsRixPQUFPLG9CQUFvQixzQkFBSyxNQUFNLEVBQUUsQ0FBQztJQUMzQyxDQUFDO0lBWkQsOEJBWUM7SUFFRCw2RUFBNkU7SUFDN0UsU0FBUyxvQkFBb0IsQ0FBQyxNQUFpQztRQUM3RCxvREFBb0Q7UUFDcEQsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVEOzs7T0FHRztJQUNILFNBQWdCLGNBQWMsQ0FBQyxNQUFnQjs7UUFDN0MsSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtZQUN0QixPQUFPO1NBQ1I7UUFDRCxPQUFPLENBQUMsS0FBSyxDQUFDLHFEQUFxRCxDQUFDLENBQUM7O1lBQ3JFLEtBQW9CLElBQUEsV0FBQSxpQkFBQSxNQUFNLENBQUEsOEJBQUEsa0RBQUU7Z0JBQXZCLElBQU0sT0FBSyxtQkFBQTtnQkFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQU8sT0FBTyxDQUFDLENBQUM7YUFDL0I7Ozs7Ozs7OztRQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQVRELHdDQVNDO0lBRUQsOERBQThEO0lBQzlELFNBQWdCLGNBQWM7UUFDNUIsSUFBTSxXQUFXLEdBQUcsY0FBSSxDQUFDLCtCQUErQixFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFDMUUsSUFBSSxXQUFXLENBQUMsSUFBSSxFQUFFO1lBQ3BCLE1BQU0sS0FBSyxDQUNQLG9FQUFvRTtnQkFDcEUsa0RBQWtEO2lCQUNsRCxjQUFZLFdBQVcsQ0FBQyxNQUFRLENBQUEsQ0FBQyxDQUFDO1NBQ3ZDO1FBQ0QsT0FBTyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQVRELHdDQVNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtleGVjfSBmcm9tICdzaGVsbGpzJztcblxuLyoqIFRoZSBjb21tb24gY29uZmlndXJhdGlvbiBmb3IgbmctZGV2LiAqL1xudHlwZSBDb21tb25Db25maWcgPSB7XG4gICAgLy8gVE9ETzogYWRkIGNvbW1vbiBjb25maWd1cmF0aW9uXG59O1xuXG4vKipcbiAqIFRoZSBjb25maWd1cmF0aW9uIGZvciB0aGUgc3BlY2lmaWMgbmctZGV2IGNvbW1hbmQsIHByb3ZpZGluZyBib3RoIHRoZSBjb21tb25cbiAqIG5nLWRldiBjb25maWcgYXMgd2VsbCBhcyB0aGUgc3BlY2lmaWMgY29uZmlnIG9mIGEgc3ViY29tbWFuZC5cbiAqL1xuZXhwb3J0IHR5cGUgTmdEZXZDb25maWc8VCA9IHt9PiA9IENvbW1vbkNvbmZpZyZUO1xuXG4vLyBUaGUgZmlsZW5hbWUgZXhwZWN0ZWQgZm9yIGNyZWF0aW5nIHRoZSBuZy1kZXYgY29uZmlnLCB3aXRob3V0IHRoZSBmaWxlXG4vLyBleHRlbnNpb24gdG8gYWxsb3cgZWl0aGVyIGEgdHlwZXNjcmlwdCBvciBqYXZhc2NyaXB0IGZpbGUgdG8gYmUgdXNlZC5cbmNvbnN0IENPTkZJR19GSUxFX05BTUUgPSAnLm5nLWRldi1jb25maWcnO1xuXG4vKiogVGhlIGNvbmZpZ3VyYXRpb24gZm9yIG5nLWRldi4gKi9cbmxldCBDT05GSUc6IHt9fG51bGwgPSBudWxsO1xuXG4vKipcbiAqIEdldCB0aGUgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBmaWxlIHN5c3RlbSwgcmV0dXJuaW5nIHRoZSBhbHJlYWR5IGxvYWRlZCBjb3B5IGlmIGl0XG4gKiBpcyBkZWZpbmVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29uZmlnKCk6IE5nRGV2Q29uZmlnIHtcbiAgLy8gSWYgdGhlIGdsb2JhbCBjb25maWcgaXMgbm90IGRlZmluZWQsIGxvYWQgaXQgZnJvbSB0aGUgZmlsZSBzeXN0ZW0uXG4gIGlmIChDT05GSUcgPT09IG51bGwpIHtcbiAgICAvLyBUaGUgZnVsbCBwYXRoIHRvIHRoZSBjb25maWd1cmF0aW9uIGZpbGUuXG4gICAgY29uc3QgY29uZmlnUGF0aCA9IGpvaW4oZ2V0UmVwb0Jhc2VEaXIoKSwgQ09ORklHX0ZJTEVfTkFNRSk7XG4gICAgLy8gU2V0IHRoZSBnbG9iYWwgY29uZmlnIG9iamVjdCB0byBhIGNsb25lIG9mIHRoZSBjb25maWd1cmF0aW9uIGxvYWRlZCB0aHJvdWdoIGRlZmF1bHQgZXhwb3J0c1xuICAgIC8vIGZyb20gdGhlIGNvbmZpZyBmaWxlLlxuICAgIENPTkZJRyA9IHsuLi5yZXF1aXJlKGNvbmZpZ1BhdGgpfTtcbiAgfVxuICAvLyBSZXR1cm4gYSBjbG9uZSBvZiB0aGUgZ2xvYmFsIGNvbmZpZyB0byBlbnN1cmUgdGhhdCBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgY29uZmlnIGlzIHJldHVybmVkXG4gIC8vIGVhY2ggdGltZSwgcHJldmVudGluZyB1bmV4cGVjdGVkIGVmZmVjdHMgb2YgbW9kaWZpY2F0aW9ucyB0byB0aGUgY29uZmlnIG9iamVjdC5cbiAgcmV0dXJuIHZhbGlkYXRlQ29tbW9uQ29uZmlnKHsuLi5DT05GSUd9KTtcbn1cblxuLyoqIFZhbGlkYXRlIHRoZSBjb21tb24gY29uZmlndXJhdGlvbiBoYXMgYmVlbiBtZXQgZm9yIHRoZSBuZy1kZXYgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlQ29tbW9uQ29uZmlnKGNvbmZpZzogTmdEZXZDb25maWc8Q29tbW9uQ29uZmlnPikge1xuICAvLyBUT0RPOiBhZGQgdmFsaWRhdGlvbiBmb3IgdGhlIGNvbW1vbiBjb25maWd1cmF0aW9uXG4gIHJldHVybiBjb25maWc7XG59XG5cbi8qKlxuICogQXNzZXJ0cyB0aGUgcHJvdmlkZWQgYXJyYXkgb2YgZXJyb3IgbWVzc2FnZXMgaXMgZW1wdHkuIElmIGFueSBlcnJvcnMgYXJlIGluIHRoZSBhcnJheSxcbiAqIGxvZ3MgdGhlIGVycm9ycyBhbmQgZXhpdCB0aGUgcHJvY2VzcyBhcyBhIGZhaWx1cmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnROb0Vycm9ycyhlcnJvcnM6IHN0cmluZ1tdKSB7XG4gIGlmIChlcnJvcnMubGVuZ3RoID09IDApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc29sZS5lcnJvcihgRXJyb3JzIGRpc2NvdmVyZWQgd2hpbGUgbG9hZGluZyBjb25maWd1cmF0aW9uIGZpbGU6YCk7XG4gIGZvciAoY29uc3QgZXJyb3Igb2YgZXJyb3JzKSB7XG4gICAgY29uc29sZS5lcnJvcihgICAtICR7ZXJyb3J9YCk7XG4gIH1cbiAgcHJvY2Vzcy5leGl0KDEpO1xufVxuXG4vKiogR2V0cyB0aGUgcGF0aCBvZiB0aGUgZGlyZWN0b3J5IGZvciB0aGUgcmVwb3NpdG9yeSBiYXNlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJlcG9CYXNlRGlyKCkge1xuICBjb25zdCBiYXNlUmVwb0RpciA9IGV4ZWMoYGdpdCByZXYtcGFyc2UgLS1zaG93LXRvcGxldmVsYCwge3NpbGVudDogdHJ1ZX0pO1xuICBpZiAoYmFzZVJlcG9EaXIuY29kZSkge1xuICAgIHRocm93IEVycm9yKFxuICAgICAgICBgVW5hYmxlIHRvIGZpbmQgdGhlIHBhdGggdG8gdGhlIGJhc2UgZGlyZWN0b3J5IG9mIHRoZSByZXBvc2l0b3J5LlxcbmAgK1xuICAgICAgICBgV2FzIHRoZSBjb21tYW5kIHJ1biBmcm9tIGluc2lkZSBvZiB0aGUgcmVwbz9cXG5cXG5gICtcbiAgICAgICAgYEVSUk9SOlxcbiAke2Jhc2VSZXBvRGlyLnN0ZGVycn1gKTtcbiAgfVxuICByZXR1cm4gYmFzZVJlcG9EaXIudHJpbSgpO1xufVxuIl19