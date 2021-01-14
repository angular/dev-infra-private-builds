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
        define("@angular/dev-infra-private/utils/config", ["require", "exports", "tslib", "fs", "path", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/shelljs", "@angular/dev-infra-private/utils/ts-node"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getUserConfig = exports.getRepoBaseDir = exports.assertNoErrors = exports.getConfig = void 0;
    var tslib_1 = require("tslib");
    var fs_1 = require("fs");
    var path_1 = require("path");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var shelljs_1 = require("@angular/dev-infra-private/utils/shelljs");
    var ts_node_1 = require("@angular/dev-infra-private/utils/ts-node");
    /**
     * The filename expected for creating the ng-dev config, without the file
     * extension to allow either a typescript or javascript file to be used.
     */
    var CONFIG_FILE_PATH = '.ng-dev/config';
    /** The configuration for ng-dev. */
    var cachedConfig = null;
    /**
     * The filename expected for local user config, without the file extension to allow a typescript,
     * javascript or json file to be used.
     */
    var USER_CONFIG_FILE_PATH = '.ng-dev.user';
    /** The local user configuration for ng-dev. */
    var userConfig = null;
    /**
     * Get the configuration from the file system, returning the already loaded
     * copy if it is defined.
     */
    function getConfig() {
        // If the global config is not defined, load it from the file system.
        if (cachedConfig === null) {
            // The full path to the configuration file.
            var configPath = path_1.join(getRepoBaseDir(), CONFIG_FILE_PATH);
            // Read the configuration and validate it before caching it for the future.
            cachedConfig = validateCommonConfig(readConfigFile(configPath));
        }
        // Return a clone of the cached global config to ensure that a new instance of the config
        // is returned each time, preventing unexpected effects of modifications to the config object.
        return tslib_1.__assign({}, cachedConfig);
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
        assertNoErrors(errors);
        return config;
    }
    /**
     * Resolves and reads the specified configuration file, optionally returning an empty object if the
     * configuration file cannot be read.
     */
    function readConfigFile(configPath, returnEmptyObjectOnError) {
        if (returnEmptyObjectOnError === void 0) { returnEmptyObjectOnError = false; }
        // If the `.ts` extension has not been set up already, and a TypeScript based
        // version of the given configuration seems to exist, set up `ts-node` if available.
        if (require.extensions['.ts'] === undefined && fs_1.existsSync(configPath + ".ts") &&
            ts_node_1.isTsNodeAvailable()) {
            // Ensure the module target is set to `commonjs`. This is necessary because the
            // dev-infra tool runs in NodeJS which does not support ES modules by default.
            // Additionally, set the `dir` option to the directory that contains the configuration
            // file. This allows for custom compiler options (such as `--strict`).
            require('ts-node').register({ dir: path_1.dirname(configPath), transpileOnly: true, compilerOptions: { module: 'commonjs' } });
        }
        try {
            return require(configPath);
        }
        catch (e) {
            if (returnEmptyObjectOnError) {
                console_1.debug("Could not read configuration file at " + configPath + ", returning empty object instead.");
                console_1.debug(e);
                return {};
            }
            console_1.error("Could not read configuration file at " + configPath + ".");
            console_1.error(e);
            process.exit(1);
        }
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
        console_1.error("Errors discovered while loading configuration file:");
        try {
            for (var errors_1 = tslib_1.__values(errors), errors_1_1 = errors_1.next(); !errors_1_1.done; errors_1_1 = errors_1.next()) {
                var err = errors_1_1.value;
                console_1.error("  - " + err);
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
        var baseRepoDir = shelljs_1.exec("git rev-parse --show-toplevel");
        if (baseRepoDir.code) {
            throw Error("Unable to find the path to the base directory of the repository.\n" +
                "Was the command run from inside of the repo?\n\n" +
                ("ERROR:\n " + baseRepoDir.stderr));
        }
        return baseRepoDir.trim();
    }
    exports.getRepoBaseDir = getRepoBaseDir;
    /**
     * Get the local user configuration from the file system, returning the already loaded copy if it is
     * defined.
     *
     * @returns The user configuration object, or an empty object if no user configuration file is
     * present. The object is an untyped object as there are no required user configurations.
     */
    function getUserConfig() {
        // If the global config is not defined, load it from the file system.
        if (userConfig === null) {
            // The full path to the configuration file.
            var configPath = path_1.join(getRepoBaseDir(), USER_CONFIG_FILE_PATH);
            // Set the global config object.
            userConfig = readConfigFile(configPath, true);
        }
        // Return a clone of the user config to ensure that a new instance of the config is returned
        // each time, preventing unexpected effects of modifications to the config object.
        return tslib_1.__assign({}, userConfig);
    }
    exports.getUserConfig = getUserConfig;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgseUJBQThCO0lBQzlCLDZCQUFtQztJQUVuQyxvRUFBdUM7SUFDdkMsb0VBQStCO0lBQy9CLG9FQUE0QztJQStCNUM7OztPQUdHO0lBQ0gsSUFBTSxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztJQUUxQyxvQ0FBb0M7SUFDcEMsSUFBSSxZQUFZLEdBQXFCLElBQUksQ0FBQztJQUUxQzs7O09BR0c7SUFDSCxJQUFNLHFCQUFxQixHQUFHLGNBQWMsQ0FBQztJQUU3QywrQ0FBK0M7SUFDL0MsSUFBSSxVQUFVLEdBQThCLElBQUksQ0FBQztJQUVqRDs7O09BR0c7SUFDSCxTQUFnQixTQUFTO1FBQ3ZCLHFFQUFxRTtRQUNyRSxJQUFJLFlBQVksS0FBSyxJQUFJLEVBQUU7WUFDekIsMkNBQTJDO1lBQzNDLElBQU0sVUFBVSxHQUFHLFdBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzVELDJFQUEyRTtZQUMzRSxZQUFZLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7U0FDakU7UUFDRCx5RkFBeUY7UUFDekYsOEZBQThGO1FBQzlGLDRCQUFXLFlBQVksRUFBRTtJQUMzQixDQUFDO0lBWEQsOEJBV0M7SUFFRCw2RUFBNkU7SUFDN0UsU0FBUyxvQkFBb0IsQ0FBQyxNQUE0QjtRQUN4RCxJQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7UUFDNUIscUNBQXFDO1FBQ3JDLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7WUFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQyw4REFBNEQsQ0FBQyxDQUFDO1NBQzNFO2FBQU07WUFDTCxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtnQkFDcEMsTUFBTSxDQUFDLElBQUksQ0FBQyxnQ0FBOEIsQ0FBQyxDQUFDO2FBQzdDO1lBQ0QsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7Z0JBQ3JDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUNBQStCLENBQUMsQ0FBQzthQUM5QztTQUNGO1FBQ0QsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZCLE9BQU8sTUFBcUIsQ0FBQztJQUMvQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBUyxjQUFjLENBQUMsVUFBa0IsRUFBRSx3QkFBZ0M7UUFBaEMseUNBQUEsRUFBQSxnQ0FBZ0M7UUFDMUUsNkVBQTZFO1FBQzdFLG9GQUFvRjtRQUNwRixJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssU0FBUyxJQUFJLGVBQVUsQ0FBSSxVQUFVLFFBQUssQ0FBQztZQUN6RSwyQkFBaUIsRUFBRSxFQUFFO1lBQ3ZCLCtFQUErRTtZQUMvRSw4RUFBOEU7WUFDOUUsc0ZBQXNGO1lBQ3RGLHNFQUFzRTtZQUN0RSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxDQUN2QixFQUFDLEdBQUcsRUFBRSxjQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFDLEVBQUMsQ0FBQyxDQUFDO1NBQzdGO1FBRUQsSUFBSTtZQUNGLE9BQU8sT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQzVCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixJQUFJLHdCQUF3QixFQUFFO2dCQUM1QixlQUFLLENBQUMsMENBQXdDLFVBQVUsc0NBQW1DLENBQUMsQ0FBQztnQkFDN0YsZUFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNULE9BQU8sRUFBRSxDQUFDO2FBQ1g7WUFDRCxlQUFLLENBQUMsMENBQXdDLFVBQVUsTUFBRyxDQUFDLENBQUM7WUFDN0QsZUFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjtJQUNILENBQUM7SUFFRDs7O09BR0c7SUFDSCxTQUFnQixjQUFjLENBQUMsTUFBZ0I7O1FBQzdDLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7WUFDdEIsT0FBTztTQUNSO1FBQ0QsZUFBSyxDQUFDLHFEQUFxRCxDQUFDLENBQUM7O1lBQzdELEtBQWtCLElBQUEsV0FBQSxpQkFBQSxNQUFNLENBQUEsOEJBQUEsa0RBQUU7Z0JBQXJCLElBQU0sR0FBRyxtQkFBQTtnQkFDWixlQUFLLENBQUMsU0FBTyxHQUFLLENBQUMsQ0FBQzthQUNyQjs7Ozs7Ozs7O1FBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBVEQsd0NBU0M7SUFFRCw4REFBOEQ7SUFDOUQsU0FBZ0IsY0FBYztRQUM1QixJQUFNLFdBQVcsR0FBRyxjQUFJLENBQUMsK0JBQStCLENBQUMsQ0FBQztRQUMxRCxJQUFJLFdBQVcsQ0FBQyxJQUFJLEVBQUU7WUFDcEIsTUFBTSxLQUFLLENBQ1Asb0VBQW9FO2dCQUNwRSxrREFBa0Q7aUJBQ2xELGNBQVksV0FBVyxDQUFDLE1BQVEsQ0FBQSxDQUFDLENBQUM7U0FDdkM7UUFDRCxPQUFPLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBVEQsd0NBU0M7SUFFRDs7Ozs7O09BTUc7SUFDSCxTQUFnQixhQUFhO1FBQzNCLHFFQUFxRTtRQUNyRSxJQUFJLFVBQVUsS0FBSyxJQUFJLEVBQUU7WUFDdkIsMkNBQTJDO1lBQzNDLElBQU0sVUFBVSxHQUFHLFdBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1lBQ2pFLGdDQUFnQztZQUNoQyxVQUFVLEdBQUcsY0FBYyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUMvQztRQUNELDRGQUE0RjtRQUM1RixrRkFBa0Y7UUFDbEYsNEJBQVcsVUFBVSxFQUFFO0lBQ3pCLENBQUM7SUFYRCxzQ0FXQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2V4aXN0c1N5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7ZGlybmFtZSwgam9pbn0gZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7ZGVidWcsIGVycm9yfSBmcm9tICcuL2NvbnNvbGUnO1xuaW1wb3J0IHtleGVjfSBmcm9tICcuL3NoZWxsanMnO1xuaW1wb3J0IHtpc1RzTm9kZUF2YWlsYWJsZX0gZnJvbSAnLi90cy1ub2RlJztcblxuLyoqIENvbmZpZ3VyYXRpb24gZm9yIEdpdCBjbGllbnQgaW50ZXJhY3Rpb25zLiAqL1xuZXhwb3J0IGludGVyZmFjZSBHaXRDbGllbnRDb25maWcge1xuICAvKiogT3duZXIgbmFtZSBvZiB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgb3duZXI6IHN0cmluZztcbiAgLyoqIE5hbWUgb2YgdGhlIHJlcG9zaXRvcnkuICovXG4gIG5hbWU6IHN0cmluZztcbiAgLyoqIElmIFNTSCBwcm90b2NvbCBzaG91bGQgYmUgdXNlZCBmb3IgZ2l0IGludGVyYWN0aW9ucy4gKi9cbiAgdXNlU3NoPzogYm9vbGVhbjtcbiAgLyoqIFdoZXRoZXIgdGhlIHNwZWNpZmllZCByZXBvc2l0b3J5IGlzIHByaXZhdGUuICovXG4gIHByaXZhdGU/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIERlc2NyaWJlcyB0aGUgR2l0aHViIGNvbmZpZ3VyYXRpb24gZm9yIGRldi1pbmZyYS4gVGhpcyBjb25maWd1cmF0aW9uIGlzXG4gKiB1c2VkIGZvciBBUEkgcmVxdWVzdHMsIGRldGVybWluaW5nIHRoZSB1cHN0cmVhbSByZW1vdGUsIGV0Yy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBHaXRodWJDb25maWcgZXh0ZW5kcyBHaXRDbGllbnRDb25maWcge31cblxuLyoqIFRoZSBjb21tb24gY29uZmlndXJhdGlvbiBmb3IgbmctZGV2LiAqL1xudHlwZSBDb21tb25Db25maWcgPSB7XG4gIGdpdGh1YjogR2l0aHViQ29uZmlnXG59O1xuXG4vKipcbiAqIFRoZSBjb25maWd1cmF0aW9uIGZvciB0aGUgc3BlY2lmaWMgbmctZGV2IGNvbW1hbmQsIHByb3ZpZGluZyBib3RoIHRoZSBjb21tb25cbiAqIG5nLWRldiBjb25maWcgYXMgd2VsbCBhcyB0aGUgc3BlY2lmaWMgY29uZmlnIG9mIGEgc3ViY29tbWFuZC5cbiAqL1xuZXhwb3J0IHR5cGUgTmdEZXZDb25maWc8VCA9IHt9PiA9IENvbW1vbkNvbmZpZyZUO1xuXG4vKipcbiAqIFRoZSBmaWxlbmFtZSBleHBlY3RlZCBmb3IgY3JlYXRpbmcgdGhlIG5nLWRldiBjb25maWcsIHdpdGhvdXQgdGhlIGZpbGVcbiAqIGV4dGVuc2lvbiB0byBhbGxvdyBlaXRoZXIgYSB0eXBlc2NyaXB0IG9yIGphdmFzY3JpcHQgZmlsZSB0byBiZSB1c2VkLlxuICovXG5jb25zdCBDT05GSUdfRklMRV9QQVRIID0gJy5uZy1kZXYvY29uZmlnJztcblxuLyoqIFRoZSBjb25maWd1cmF0aW9uIGZvciBuZy1kZXYuICovXG5sZXQgY2FjaGVkQ29uZmlnOiBOZ0RldkNvbmZpZ3xudWxsID0gbnVsbDtcblxuLyoqXG4gKiBUaGUgZmlsZW5hbWUgZXhwZWN0ZWQgZm9yIGxvY2FsIHVzZXIgY29uZmlnLCB3aXRob3V0IHRoZSBmaWxlIGV4dGVuc2lvbiB0byBhbGxvdyBhIHR5cGVzY3JpcHQsXG4gKiBqYXZhc2NyaXB0IG9yIGpzb24gZmlsZSB0byBiZSB1c2VkLlxuICovXG5jb25zdCBVU0VSX0NPTkZJR19GSUxFX1BBVEggPSAnLm5nLWRldi51c2VyJztcblxuLyoqIFRoZSBsb2NhbCB1c2VyIGNvbmZpZ3VyYXRpb24gZm9yIG5nLWRldi4gKi9cbmxldCB1c2VyQ29uZmlnOiB7W2tleTogc3RyaW5nXTogYW55fXxudWxsID0gbnVsbDtcblxuLyoqXG4gKiBHZXQgdGhlIGNvbmZpZ3VyYXRpb24gZnJvbSB0aGUgZmlsZSBzeXN0ZW0sIHJldHVybmluZyB0aGUgYWxyZWFkeSBsb2FkZWRcbiAqIGNvcHkgaWYgaXQgaXMgZGVmaW5lZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZygpOiBOZ0RldkNvbmZpZyB7XG4gIC8vIElmIHRoZSBnbG9iYWwgY29uZmlnIGlzIG5vdCBkZWZpbmVkLCBsb2FkIGl0IGZyb20gdGhlIGZpbGUgc3lzdGVtLlxuICBpZiAoY2FjaGVkQ29uZmlnID09PSBudWxsKSB7XG4gICAgLy8gVGhlIGZ1bGwgcGF0aCB0byB0aGUgY29uZmlndXJhdGlvbiBmaWxlLlxuICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBqb2luKGdldFJlcG9CYXNlRGlyKCksIENPTkZJR19GSUxFX1BBVEgpO1xuICAgIC8vIFJlYWQgdGhlIGNvbmZpZ3VyYXRpb24gYW5kIHZhbGlkYXRlIGl0IGJlZm9yZSBjYWNoaW5nIGl0IGZvciB0aGUgZnV0dXJlLlxuICAgIGNhY2hlZENvbmZpZyA9IHZhbGlkYXRlQ29tbW9uQ29uZmlnKHJlYWRDb25maWdGaWxlKGNvbmZpZ1BhdGgpKTtcbiAgfVxuICAvLyBSZXR1cm4gYSBjbG9uZSBvZiB0aGUgY2FjaGVkIGdsb2JhbCBjb25maWcgdG8gZW5zdXJlIHRoYXQgYSBuZXcgaW5zdGFuY2Ugb2YgdGhlIGNvbmZpZ1xuICAvLyBpcyByZXR1cm5lZCBlYWNoIHRpbWUsIHByZXZlbnRpbmcgdW5leHBlY3RlZCBlZmZlY3RzIG9mIG1vZGlmaWNhdGlvbnMgdG8gdGhlIGNvbmZpZyBvYmplY3QuXG4gIHJldHVybiB7Li4uY2FjaGVkQ29uZmlnfTtcbn1cblxuLyoqIFZhbGlkYXRlIHRoZSBjb21tb24gY29uZmlndXJhdGlvbiBoYXMgYmVlbiBtZXQgZm9yIHRoZSBuZy1kZXYgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlQ29tbW9uQ29uZmlnKGNvbmZpZzogUGFydGlhbDxOZ0RldkNvbmZpZz4pIHtcbiAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuICAvLyBWYWxpZGF0ZSB0aGUgZ2l0aHViIGNvbmZpZ3VyYXRpb24uXG4gIGlmIChjb25maWcuZ2l0aHViID09PSB1bmRlZmluZWQpIHtcbiAgICBlcnJvcnMucHVzaChgR2l0aHViIHJlcG9zaXRvcnkgbm90IGNvbmZpZ3VyZWQuIFNldCB0aGUgXCJnaXRodWJcIiBvcHRpb24uYCk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGNvbmZpZy5naXRodWIubmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvcnMucHVzaChgXCJnaXRodWIubmFtZVwiIGlzIG5vdCBkZWZpbmVkYCk7XG4gICAgfVxuICAgIGlmIChjb25maWcuZ2l0aHViLm93bmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBcImdpdGh1Yi5vd25lclwiIGlzIG5vdCBkZWZpbmVkYCk7XG4gICAgfVxuICB9XG4gIGFzc2VydE5vRXJyb3JzKGVycm9ycyk7XG4gIHJldHVybiBjb25maWcgYXMgTmdEZXZDb25maWc7XG59XG5cbi8qKlxuICogUmVzb2x2ZXMgYW5kIHJlYWRzIHRoZSBzcGVjaWZpZWQgY29uZmlndXJhdGlvbiBmaWxlLCBvcHRpb25hbGx5IHJldHVybmluZyBhbiBlbXB0eSBvYmplY3QgaWYgdGhlXG4gKiBjb25maWd1cmF0aW9uIGZpbGUgY2Fubm90IGJlIHJlYWQuXG4gKi9cbmZ1bmN0aW9uIHJlYWRDb25maWdGaWxlKGNvbmZpZ1BhdGg6IHN0cmluZywgcmV0dXJuRW1wdHlPYmplY3RPbkVycm9yID0gZmFsc2UpOiBvYmplY3Qge1xuICAvLyBJZiB0aGUgYC50c2AgZXh0ZW5zaW9uIGhhcyBub3QgYmVlbiBzZXQgdXAgYWxyZWFkeSwgYW5kIGEgVHlwZVNjcmlwdCBiYXNlZFxuICAvLyB2ZXJzaW9uIG9mIHRoZSBnaXZlbiBjb25maWd1cmF0aW9uIHNlZW1zIHRvIGV4aXN0LCBzZXQgdXAgYHRzLW5vZGVgIGlmIGF2YWlsYWJsZS5cbiAgaWYgKHJlcXVpcmUuZXh0ZW5zaW9uc1snLnRzJ10gPT09IHVuZGVmaW5lZCAmJiBleGlzdHNTeW5jKGAke2NvbmZpZ1BhdGh9LnRzYCkgJiZcbiAgICAgIGlzVHNOb2RlQXZhaWxhYmxlKCkpIHtcbiAgICAvLyBFbnN1cmUgdGhlIG1vZHVsZSB0YXJnZXQgaXMgc2V0IHRvIGBjb21tb25qc2AuIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2UgdGhlXG4gICAgLy8gZGV2LWluZnJhIHRvb2wgcnVucyBpbiBOb2RlSlMgd2hpY2ggZG9lcyBub3Qgc3VwcG9ydCBFUyBtb2R1bGVzIGJ5IGRlZmF1bHQuXG4gICAgLy8gQWRkaXRpb25hbGx5LCBzZXQgdGhlIGBkaXJgIG9wdGlvbiB0byB0aGUgZGlyZWN0b3J5IHRoYXQgY29udGFpbnMgdGhlIGNvbmZpZ3VyYXRpb25cbiAgICAvLyBmaWxlLiBUaGlzIGFsbG93cyBmb3IgY3VzdG9tIGNvbXBpbGVyIG9wdGlvbnMgKHN1Y2ggYXMgYC0tc3RyaWN0YCkuXG4gICAgcmVxdWlyZSgndHMtbm9kZScpLnJlZ2lzdGVyKFxuICAgICAgICB7ZGlyOiBkaXJuYW1lKGNvbmZpZ1BhdGgpLCB0cmFuc3BpbGVPbmx5OiB0cnVlLCBjb21waWxlck9wdGlvbnM6IHttb2R1bGU6ICdjb21tb25qcyd9fSk7XG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiByZXF1aXJlKGNvbmZpZ1BhdGgpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKHJldHVybkVtcHR5T2JqZWN0T25FcnJvcikge1xuICAgICAgZGVidWcoYENvdWxkIG5vdCByZWFkIGNvbmZpZ3VyYXRpb24gZmlsZSBhdCAke2NvbmZpZ1BhdGh9LCByZXR1cm5pbmcgZW1wdHkgb2JqZWN0IGluc3RlYWQuYCk7XG4gICAgICBkZWJ1ZyhlKTtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgZXJyb3IoYENvdWxkIG5vdCByZWFkIGNvbmZpZ3VyYXRpb24gZmlsZSBhdCAke2NvbmZpZ1BhdGh9LmApO1xuICAgIGVycm9yKGUpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxufVxuXG4vKipcbiAqIEFzc2VydHMgdGhlIHByb3ZpZGVkIGFycmF5IG9mIGVycm9yIG1lc3NhZ2VzIGlzIGVtcHR5LiBJZiBhbnkgZXJyb3JzIGFyZSBpbiB0aGUgYXJyYXksXG4gKiBsb2dzIHRoZSBlcnJvcnMgYW5kIGV4aXQgdGhlIHByb2Nlc3MgYXMgYSBmYWlsdXJlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0Tm9FcnJvcnMoZXJyb3JzOiBzdHJpbmdbXSkge1xuICBpZiAoZXJyb3JzLmxlbmd0aCA9PSAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGVycm9yKGBFcnJvcnMgZGlzY292ZXJlZCB3aGlsZSBsb2FkaW5nIGNvbmZpZ3VyYXRpb24gZmlsZTpgKTtcbiAgZm9yIChjb25zdCBlcnIgb2YgZXJyb3JzKSB7XG4gICAgZXJyb3IoYCAgLSAke2Vycn1gKTtcbiAgfVxuICBwcm9jZXNzLmV4aXQoMSk7XG59XG5cbi8qKiBHZXRzIHRoZSBwYXRoIG9mIHRoZSBkaXJlY3RvcnkgZm9yIHRoZSByZXBvc2l0b3J5IGJhc2UuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVwb0Jhc2VEaXIoKSB7XG4gIGNvbnN0IGJhc2VSZXBvRGlyID0gZXhlYyhgZ2l0IHJldi1wYXJzZSAtLXNob3ctdG9wbGV2ZWxgKTtcbiAgaWYgKGJhc2VSZXBvRGlyLmNvZGUpIHtcbiAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgYFVuYWJsZSB0byBmaW5kIHRoZSBwYXRoIHRvIHRoZSBiYXNlIGRpcmVjdG9yeSBvZiB0aGUgcmVwb3NpdG9yeS5cXG5gICtcbiAgICAgICAgYFdhcyB0aGUgY29tbWFuZCBydW4gZnJvbSBpbnNpZGUgb2YgdGhlIHJlcG8/XFxuXFxuYCArXG4gICAgICAgIGBFUlJPUjpcXG4gJHtiYXNlUmVwb0Rpci5zdGRlcnJ9YCk7XG4gIH1cbiAgcmV0dXJuIGJhc2VSZXBvRGlyLnRyaW0oKTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGxvY2FsIHVzZXIgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBmaWxlIHN5c3RlbSwgcmV0dXJuaW5nIHRoZSBhbHJlYWR5IGxvYWRlZCBjb3B5IGlmIGl0IGlzXG4gKiBkZWZpbmVkLlxuICpcbiAqIEByZXR1cm5zIFRoZSB1c2VyIGNvbmZpZ3VyYXRpb24gb2JqZWN0LCBvciBhbiBlbXB0eSBvYmplY3QgaWYgbm8gdXNlciBjb25maWd1cmF0aW9uIGZpbGUgaXNcbiAqIHByZXNlbnQuIFRoZSBvYmplY3QgaXMgYW4gdW50eXBlZCBvYmplY3QgYXMgdGhlcmUgYXJlIG5vIHJlcXVpcmVkIHVzZXIgY29uZmlndXJhdGlvbnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRVc2VyQ29uZmlnKCkge1xuICAvLyBJZiB0aGUgZ2xvYmFsIGNvbmZpZyBpcyBub3QgZGVmaW5lZCwgbG9hZCBpdCBmcm9tIHRoZSBmaWxlIHN5c3RlbS5cbiAgaWYgKHVzZXJDb25maWcgPT09IG51bGwpIHtcbiAgICAvLyBUaGUgZnVsbCBwYXRoIHRvIHRoZSBjb25maWd1cmF0aW9uIGZpbGUuXG4gICAgY29uc3QgY29uZmlnUGF0aCA9IGpvaW4oZ2V0UmVwb0Jhc2VEaXIoKSwgVVNFUl9DT05GSUdfRklMRV9QQVRIKTtcbiAgICAvLyBTZXQgdGhlIGdsb2JhbCBjb25maWcgb2JqZWN0LlxuICAgIHVzZXJDb25maWcgPSByZWFkQ29uZmlnRmlsZShjb25maWdQYXRoLCB0cnVlKTtcbiAgfVxuICAvLyBSZXR1cm4gYSBjbG9uZSBvZiB0aGUgdXNlciBjb25maWcgdG8gZW5zdXJlIHRoYXQgYSBuZXcgaW5zdGFuY2Ugb2YgdGhlIGNvbmZpZyBpcyByZXR1cm5lZFxuICAvLyBlYWNoIHRpbWUsIHByZXZlbnRpbmcgdW5leHBlY3RlZCBlZmZlY3RzIG9mIG1vZGlmaWNhdGlvbnMgdG8gdGhlIGNvbmZpZyBvYmplY3QuXG4gIHJldHVybiB7Li4udXNlckNvbmZpZ307XG59XG4iXX0=