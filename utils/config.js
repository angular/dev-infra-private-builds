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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw2QkFBMEI7SUFDMUIsbUNBQTZCO0lBaUI3Qjs7O09BR0c7SUFDSCxJQUFNLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO0lBRTFDLG9DQUFvQztJQUNwQyxJQUFJLE1BQU0sR0FBWSxJQUFJLENBQUM7SUFFM0I7OztPQUdHO0lBQ0gsU0FBZ0IsU0FBUztRQUN2QixxRUFBcUU7UUFDckUsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFO1lBQ25CLDJDQUEyQztZQUMzQyxJQUFNLFVBQVUsR0FBRyxXQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUM1RCw4RkFBOEY7WUFDOUYsd0JBQXdCO1lBQ3hCLE1BQU0sd0JBQU8sT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7U0FDbkM7UUFDRCw4RkFBOEY7UUFDOUYsa0ZBQWtGO1FBQ2xGLE9BQU8sb0JBQW9CLHNCQUFLLE1BQU0sRUFBRSxDQUFDO0lBQzNDLENBQUM7SUFaRCw4QkFZQztJQUVELDZFQUE2RTtJQUM3RSxTQUFTLG9CQUFvQixDQUFDLE1BQTRCO1FBQ3hELElBQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztRQUM1QixxQ0FBcUM7UUFDckMsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTtZQUMvQixNQUFNLENBQUMsSUFBSSxDQUFDLDhEQUE0RCxDQUFDLENBQUM7U0FDM0U7YUFBTTtZQUNMLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO2dCQUNwQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdDQUE4QixDQUFDLENBQUM7YUFDN0M7WUFDRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRTtnQkFDckMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQ0FBK0IsQ0FBQyxDQUFDO2FBQzlDO1NBQ0Y7UUFFRCxPQUFPLE1BQXFCLENBQUM7SUFDL0IsQ0FBQztJQUVEOzs7T0FHRztJQUNILFNBQWdCLGNBQWMsQ0FBQyxNQUFnQjs7UUFDN0MsSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtZQUN0QixPQUFPO1NBQ1I7UUFDRCxPQUFPLENBQUMsS0FBSyxDQUFDLHFEQUFxRCxDQUFDLENBQUM7O1lBQ3JFLEtBQW9CLElBQUEsV0FBQSxpQkFBQSxNQUFNLENBQUEsOEJBQUEsa0RBQUU7Z0JBQXZCLElBQU0sT0FBSyxtQkFBQTtnQkFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQU8sT0FBTyxDQUFDLENBQUM7YUFDL0I7Ozs7Ozs7OztRQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQVRELHdDQVNDO0lBRUQsOERBQThEO0lBQzlELFNBQWdCLGNBQWM7UUFDNUIsSUFBTSxXQUFXLEdBQUcsY0FBSSxDQUFDLCtCQUErQixFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFDMUUsSUFBSSxXQUFXLENBQUMsSUFBSSxFQUFFO1lBQ3BCLE1BQU0sS0FBSyxDQUNQLG9FQUFvRTtnQkFDcEUsa0RBQWtEO2lCQUNsRCxjQUFZLFdBQVcsQ0FBQyxNQUFRLENBQUEsQ0FBQyxDQUFDO1NBQ3ZDO1FBQ0QsT0FBTyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQVRELHdDQVNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtleGVjfSBmcm9tICdzaGVsbGpzJztcblxuLyoqIFRoZSBjb21tb24gY29uZmlndXJhdGlvbiBmb3IgbmctZGV2LiAqL1xudHlwZSBDb21tb25Db25maWcgPSB7XG4gIC8qIEdpdGh1YiByZXBvc2l0b3J5IGNvbmZpZ3VyYXRpb24gdXNlZCBmb3IgQVBJIFJlcXVlc3RzLCBkZXRlcm1pbmluZyB1cHN0cmVhbSByZW1vdGUsIGV0Yy4gKi9cbiAgZ2l0aHViOiB7XG4gICAgb3duZXI6IHN0cmluZyxcbiAgICBuYW1lOiBzdHJpbmcsXG4gIH1cbn07XG5cbi8qKlxuICogVGhlIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBzcGVjaWZpYyBuZy1kZXYgY29tbWFuZCwgcHJvdmlkaW5nIGJvdGggdGhlIGNvbW1vblxuICogbmctZGV2IGNvbmZpZyBhcyB3ZWxsIGFzIHRoZSBzcGVjaWZpYyBjb25maWcgb2YgYSBzdWJjb21tYW5kLlxuICovXG5leHBvcnQgdHlwZSBOZ0RldkNvbmZpZzxUID0ge30+ID0gQ29tbW9uQ29uZmlnJlQ7XG5cbi8qKlxuICogVGhlIGZpbGVuYW1lIGV4cGVjdGVkIGZvciBjcmVhdGluZyB0aGUgbmctZGV2IGNvbmZpZywgd2l0aG91dCB0aGUgZmlsZVxuICogZXh0ZW5zaW9uIHRvIGFsbG93IGVpdGhlciBhIHR5cGVzY3JpcHQgb3IgamF2YXNjcmlwdCBmaWxlIHRvIGJlIHVzZWQuXG4gKi9cbmNvbnN0IENPTkZJR19GSUxFX05BTUUgPSAnLm5nLWRldi1jb25maWcnO1xuXG4vKiogVGhlIGNvbmZpZ3VyYXRpb24gZm9yIG5nLWRldi4gKi9cbmxldCBDT05GSUc6IHt9fG51bGwgPSBudWxsO1xuXG4vKipcbiAqIEdldCB0aGUgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBmaWxlIHN5c3RlbSwgcmV0dXJuaW5nIHRoZSBhbHJlYWR5IGxvYWRlZCBjb3B5IGlmIGl0XG4gKiBpcyBkZWZpbmVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29uZmlnKCk6IE5nRGV2Q29uZmlnIHtcbiAgLy8gSWYgdGhlIGdsb2JhbCBjb25maWcgaXMgbm90IGRlZmluZWQsIGxvYWQgaXQgZnJvbSB0aGUgZmlsZSBzeXN0ZW0uXG4gIGlmIChDT05GSUcgPT09IG51bGwpIHtcbiAgICAvLyBUaGUgZnVsbCBwYXRoIHRvIHRoZSBjb25maWd1cmF0aW9uIGZpbGUuXG4gICAgY29uc3QgY29uZmlnUGF0aCA9IGpvaW4oZ2V0UmVwb0Jhc2VEaXIoKSwgQ09ORklHX0ZJTEVfTkFNRSk7XG4gICAgLy8gU2V0IHRoZSBnbG9iYWwgY29uZmlnIG9iamVjdCB0byBhIGNsb25lIG9mIHRoZSBjb25maWd1cmF0aW9uIGxvYWRlZCB0aHJvdWdoIGRlZmF1bHQgZXhwb3J0c1xuICAgIC8vIGZyb20gdGhlIGNvbmZpZyBmaWxlLlxuICAgIENPTkZJRyA9IHsuLi5yZXF1aXJlKGNvbmZpZ1BhdGgpfTtcbiAgfVxuICAvLyBSZXR1cm4gYSBjbG9uZSBvZiB0aGUgZ2xvYmFsIGNvbmZpZyB0byBlbnN1cmUgdGhhdCBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgY29uZmlnIGlzIHJldHVybmVkXG4gIC8vIGVhY2ggdGltZSwgcHJldmVudGluZyB1bmV4cGVjdGVkIGVmZmVjdHMgb2YgbW9kaWZpY2F0aW9ucyB0byB0aGUgY29uZmlnIG9iamVjdC5cbiAgcmV0dXJuIHZhbGlkYXRlQ29tbW9uQ29uZmlnKHsuLi5DT05GSUd9KTtcbn1cblxuLyoqIFZhbGlkYXRlIHRoZSBjb21tb24gY29uZmlndXJhdGlvbiBoYXMgYmVlbiBtZXQgZm9yIHRoZSBuZy1kZXYgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlQ29tbW9uQ29uZmlnKGNvbmZpZzogUGFydGlhbDxOZ0RldkNvbmZpZz4pIHtcbiAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuICAvLyBWYWxpZGF0ZSB0aGUgZ2l0aHViIGNvbmZpZ3VyYXRpb24uXG4gIGlmIChjb25maWcuZ2l0aHViID09PSB1bmRlZmluZWQpIHtcbiAgICBlcnJvcnMucHVzaChgR2l0aHViIHJlcG9zaXRvcnkgbm90IGNvbmZpZ3VyZWQuIFNldCB0aGUgXCJnaXRodWJcIiBvcHRpb24uYCk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGNvbmZpZy5naXRodWIubmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvcnMucHVzaChgXCJnaXRodWIubmFtZVwiIGlzIG5vdCBkZWZpbmVkYCk7XG4gICAgfVxuICAgIGlmIChjb25maWcuZ2l0aHViLm93bmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBcImdpdGh1Yi5vd25lclwiIGlzIG5vdCBkZWZpbmVkYCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNvbmZpZyBhcyBOZ0RldkNvbmZpZztcbn1cblxuLyoqXG4gKiBBc3NlcnRzIHRoZSBwcm92aWRlZCBhcnJheSBvZiBlcnJvciBtZXNzYWdlcyBpcyBlbXB0eS4gSWYgYW55IGVycm9ycyBhcmUgaW4gdGhlIGFycmF5LFxuICogbG9ncyB0aGUgZXJyb3JzIGFuZCBleGl0IHRoZSBwcm9jZXNzIGFzIGEgZmFpbHVyZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydE5vRXJyb3JzKGVycm9yczogc3RyaW5nW10pIHtcbiAgaWYgKGVycm9ycy5sZW5ndGggPT0gMCkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zb2xlLmVycm9yKGBFcnJvcnMgZGlzY292ZXJlZCB3aGlsZSBsb2FkaW5nIGNvbmZpZ3VyYXRpb24gZmlsZTpgKTtcbiAgZm9yIChjb25zdCBlcnJvciBvZiBlcnJvcnMpIHtcbiAgICBjb25zb2xlLmVycm9yKGAgIC0gJHtlcnJvcn1gKTtcbiAgfVxuICBwcm9jZXNzLmV4aXQoMSk7XG59XG5cbi8qKiBHZXRzIHRoZSBwYXRoIG9mIHRoZSBkaXJlY3RvcnkgZm9yIHRoZSByZXBvc2l0b3J5IGJhc2UuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVwb0Jhc2VEaXIoKSB7XG4gIGNvbnN0IGJhc2VSZXBvRGlyID0gZXhlYyhgZ2l0IHJldi1wYXJzZSAtLXNob3ctdG9wbGV2ZWxgLCB7c2lsZW50OiB0cnVlfSk7XG4gIGlmIChiYXNlUmVwb0Rpci5jb2RlKSB7XG4gICAgdGhyb3cgRXJyb3IoXG4gICAgICAgIGBVbmFibGUgdG8gZmluZCB0aGUgcGF0aCB0byB0aGUgYmFzZSBkaXJlY3Rvcnkgb2YgdGhlIHJlcG9zaXRvcnkuXFxuYCArXG4gICAgICAgIGBXYXMgdGhlIGNvbW1hbmQgcnVuIGZyb20gaW5zaWRlIG9mIHRoZSByZXBvP1xcblxcbmAgK1xuICAgICAgICBgRVJST1I6XFxuICR7YmFzZVJlcG9EaXIuc3RkZXJyfWApO1xuICB9XG4gIHJldHVybiBiYXNlUmVwb0Rpci50cmltKCk7XG59XG4iXX0=