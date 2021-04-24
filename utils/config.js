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
        define("@angular/dev-infra-private/utils/config", ["require", "exports", "tslib", "fs", "path", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/index", "@angular/dev-infra-private/utils/ts-node"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getUserConfig = exports.assertNoErrors = exports.getConfig = void 0;
    var tslib_1 = require("tslib");
    var fs_1 = require("fs");
    var path_1 = require("path");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var index_1 = require("@angular/dev-infra-private/utils/git/index");
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
    function getConfig(baseDir) {
        // If the global config is not defined, load it from the file system.
        if (cachedConfig === null) {
            baseDir = baseDir || index_1.GitClient.getInstance().getBaseDir();
            // The full path to the configuration file.
            var configPath = path_1.join(baseDir, CONFIG_FILE_PATH);
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
            var git = index_1.GitClient.getInstance();
            // The full path to the configuration file.
            var configPath = path_1.join(git.baseDir, USER_CONFIG_FILE_PATH);
            // Set the global config object.
            userConfig = readConfigFile(configPath, true);
        }
        // Return a clone of the user config to ensure that a new instance of the config is returned
        // each time, preventing unexpected effects of modifications to the config object.
        return tslib_1.__assign({}, userConfig);
    }
    exports.getUserConfig = getUserConfig;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgseUJBQThCO0lBQzlCLDZCQUFtQztJQUVuQyxvRUFBdUM7SUFDdkMsb0VBQXNDO0lBQ3RDLG9FQUE0QztJQStCNUM7OztPQUdHO0lBQ0gsSUFBTSxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztJQUUxQyxvQ0FBb0M7SUFDcEMsSUFBSSxZQUFZLEdBQXFCLElBQUksQ0FBQztJQUUxQzs7O09BR0c7SUFDSCxJQUFNLHFCQUFxQixHQUFHLGNBQWMsQ0FBQztJQUU3QywrQ0FBK0M7SUFDL0MsSUFBSSxVQUFVLEdBQThCLElBQUksQ0FBQztJQVFqRCxTQUFnQixTQUFTLENBQUMsT0FBZ0I7UUFDeEMscUVBQXFFO1FBQ3JFLElBQUksWUFBWSxLQUFLLElBQUksRUFBRTtZQUN6QixPQUFPLEdBQUcsT0FBTyxJQUFJLGlCQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDMUQsMkNBQTJDO1lBQzNDLElBQU0sVUFBVSxHQUFHLFdBQUksQ0FBQyxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUNuRCwyRUFBMkU7WUFDM0UsWUFBWSxHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1NBQ2pFO1FBQ0QseUZBQXlGO1FBQ3pGLDhGQUE4RjtRQUM5Riw0QkFBVyxZQUFZLEVBQUU7SUFDM0IsQ0FBQztJQVpELDhCQVlDO0lBRUQsNkVBQTZFO0lBQzdFLFNBQVMsb0JBQW9CLENBQUMsTUFBNEI7UUFDeEQsSUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO1FBQzVCLHFDQUFxQztRQUNyQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO1lBQy9CLE1BQU0sQ0FBQyxJQUFJLENBQUMsOERBQTRELENBQUMsQ0FBQztTQUMzRTthQUFNO1lBQ0wsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7Z0JBQ3BDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0NBQThCLENBQUMsQ0FBQzthQUM3QztZQUNELElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFO2dCQUNyQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlDQUErQixDQUFDLENBQUM7YUFDOUM7U0FDRjtRQUNELGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QixPQUFPLE1BQXFCLENBQUM7SUFDL0IsQ0FBQztJQUVEOzs7T0FHRztJQUNILFNBQVMsY0FBYyxDQUFDLFVBQWtCLEVBQUUsd0JBQWdDO1FBQWhDLHlDQUFBLEVBQUEsZ0NBQWdDO1FBQzFFLDZFQUE2RTtRQUM3RSxvRkFBb0Y7UUFDcEYsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLFNBQVMsSUFBSSxlQUFVLENBQUksVUFBVSxRQUFLLENBQUM7WUFDekUsMkJBQWlCLEVBQUUsRUFBRTtZQUN2QiwrRUFBK0U7WUFDL0UsOEVBQThFO1lBQzlFLHNGQUFzRjtZQUN0RixzRUFBc0U7WUFDdEUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FDdkIsRUFBQyxHQUFHLEVBQUUsY0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBQyxFQUFDLENBQUMsQ0FBQztTQUM3RjtRQUVELElBQUk7WUFDRixPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUM1QjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsSUFBSSx3QkFBd0IsRUFBRTtnQkFDNUIsZUFBSyxDQUFDLDBDQUF3QyxVQUFVLHNDQUFtQyxDQUFDLENBQUM7Z0JBQzdGLGVBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDVCxPQUFPLEVBQUUsQ0FBQzthQUNYO1lBQ0QsZUFBSyxDQUFDLDBDQUF3QyxVQUFVLE1BQUcsQ0FBQyxDQUFDO1lBQzdELGVBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNULE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBZ0IsY0FBYyxDQUFDLE1BQWdCOztRQUM3QyxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1lBQ3RCLE9BQU87U0FDUjtRQUNELGVBQUssQ0FBQyxxREFBcUQsQ0FBQyxDQUFDOztZQUM3RCxLQUFrQixJQUFBLFdBQUEsaUJBQUEsTUFBTSxDQUFBLDhCQUFBLGtEQUFFO2dCQUFyQixJQUFNLEdBQUcsbUJBQUE7Z0JBQ1osZUFBSyxDQUFDLFNBQU8sR0FBSyxDQUFDLENBQUM7YUFDckI7Ozs7Ozs7OztRQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQVRELHdDQVNDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsU0FBZ0IsYUFBYTtRQUMzQixxRUFBcUU7UUFDckUsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFO1lBQ3ZCLElBQU0sR0FBRyxHQUFHLGlCQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDcEMsMkNBQTJDO1lBQzNDLElBQU0sVUFBVSxHQUFHLFdBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLHFCQUFxQixDQUFDLENBQUM7WUFDNUQsZ0NBQWdDO1lBQ2hDLFVBQVUsR0FBRyxjQUFjLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQy9DO1FBQ0QsNEZBQTRGO1FBQzVGLGtGQUFrRjtRQUNsRiw0QkFBVyxVQUFVLEVBQUU7SUFDekIsQ0FBQztJQVpELHNDQVlDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXhpc3RzU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IHtkaXJuYW1lLCBqb2lufSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtkZWJ1ZywgZXJyb3J9IGZyb20gJy4vY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi9naXQvaW5kZXgnO1xuaW1wb3J0IHtpc1RzTm9kZUF2YWlsYWJsZX0gZnJvbSAnLi90cy1ub2RlJztcblxuLyoqIENvbmZpZ3VyYXRpb24gZm9yIEdpdCBjbGllbnQgaW50ZXJhY3Rpb25zLiAqL1xuZXhwb3J0IGludGVyZmFjZSBHaXRDbGllbnRDb25maWcge1xuICAvKiogT3duZXIgbmFtZSBvZiB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgb3duZXI6IHN0cmluZztcbiAgLyoqIE5hbWUgb2YgdGhlIHJlcG9zaXRvcnkuICovXG4gIG5hbWU6IHN0cmluZztcbiAgLyoqIElmIFNTSCBwcm90b2NvbCBzaG91bGQgYmUgdXNlZCBmb3IgZ2l0IGludGVyYWN0aW9ucy4gKi9cbiAgdXNlU3NoPzogYm9vbGVhbjtcbiAgLyoqIFdoZXRoZXIgdGhlIHNwZWNpZmllZCByZXBvc2l0b3J5IGlzIHByaXZhdGUuICovXG4gIHByaXZhdGU/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIERlc2NyaWJlcyB0aGUgR2l0aHViIGNvbmZpZ3VyYXRpb24gZm9yIGRldi1pbmZyYS4gVGhpcyBjb25maWd1cmF0aW9uIGlzXG4gKiB1c2VkIGZvciBBUEkgcmVxdWVzdHMsIGRldGVybWluaW5nIHRoZSB1cHN0cmVhbSByZW1vdGUsIGV0Yy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBHaXRodWJDb25maWcgZXh0ZW5kcyBHaXRDbGllbnRDb25maWcge31cblxuLyoqIFRoZSBjb21tb24gY29uZmlndXJhdGlvbiBmb3IgbmctZGV2LiAqL1xudHlwZSBDb21tb25Db25maWcgPSB7XG4gIGdpdGh1YjogR2l0aHViQ29uZmlnXG59O1xuXG4vKipcbiAqIFRoZSBjb25maWd1cmF0aW9uIGZvciB0aGUgc3BlY2lmaWMgbmctZGV2IGNvbW1hbmQsIHByb3ZpZGluZyBib3RoIHRoZSBjb21tb25cbiAqIG5nLWRldiBjb25maWcgYXMgd2VsbCBhcyB0aGUgc3BlY2lmaWMgY29uZmlnIG9mIGEgc3ViY29tbWFuZC5cbiAqL1xuZXhwb3J0IHR5cGUgTmdEZXZDb25maWc8VCA9IHt9PiA9IENvbW1vbkNvbmZpZyZUO1xuXG4vKipcbiAqIFRoZSBmaWxlbmFtZSBleHBlY3RlZCBmb3IgY3JlYXRpbmcgdGhlIG5nLWRldiBjb25maWcsIHdpdGhvdXQgdGhlIGZpbGVcbiAqIGV4dGVuc2lvbiB0byBhbGxvdyBlaXRoZXIgYSB0eXBlc2NyaXB0IG9yIGphdmFzY3JpcHQgZmlsZSB0byBiZSB1c2VkLlxuICovXG5jb25zdCBDT05GSUdfRklMRV9QQVRIID0gJy5uZy1kZXYvY29uZmlnJztcblxuLyoqIFRoZSBjb25maWd1cmF0aW9uIGZvciBuZy1kZXYuICovXG5sZXQgY2FjaGVkQ29uZmlnOiBOZ0RldkNvbmZpZ3xudWxsID0gbnVsbDtcblxuLyoqXG4gKiBUaGUgZmlsZW5hbWUgZXhwZWN0ZWQgZm9yIGxvY2FsIHVzZXIgY29uZmlnLCB3aXRob3V0IHRoZSBmaWxlIGV4dGVuc2lvbiB0byBhbGxvdyBhIHR5cGVzY3JpcHQsXG4gKiBqYXZhc2NyaXB0IG9yIGpzb24gZmlsZSB0byBiZSB1c2VkLlxuICovXG5jb25zdCBVU0VSX0NPTkZJR19GSUxFX1BBVEggPSAnLm5nLWRldi51c2VyJztcblxuLyoqIFRoZSBsb2NhbCB1c2VyIGNvbmZpZ3VyYXRpb24gZm9yIG5nLWRldi4gKi9cbmxldCB1c2VyQ29uZmlnOiB7W2tleTogc3RyaW5nXTogYW55fXxudWxsID0gbnVsbDtcblxuLyoqXG4gKiBHZXQgdGhlIGNvbmZpZ3VyYXRpb24gZnJvbSB0aGUgZmlsZSBzeXN0ZW0sIHJldHVybmluZyB0aGUgYWxyZWFkeSBsb2FkZWRcbiAqIGNvcHkgaWYgaXQgaXMgZGVmaW5lZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZygpOiBOZ0RldkNvbmZpZztcbmV4cG9ydCBmdW5jdGlvbiBnZXRDb25maWcoYmFzZURpcj86IHN0cmluZyk6IE5nRGV2Q29uZmlnO1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZyhiYXNlRGlyPzogc3RyaW5nKTogTmdEZXZDb25maWcge1xuICAvLyBJZiB0aGUgZ2xvYmFsIGNvbmZpZyBpcyBub3QgZGVmaW5lZCwgbG9hZCBpdCBmcm9tIHRoZSBmaWxlIHN5c3RlbS5cbiAgaWYgKGNhY2hlZENvbmZpZyA9PT0gbnVsbCkge1xuICAgIGJhc2VEaXIgPSBiYXNlRGlyIHx8IEdpdENsaWVudC5nZXRJbnN0YW5jZSgpLmdldEJhc2VEaXIoKTtcbiAgICAvLyBUaGUgZnVsbCBwYXRoIHRvIHRoZSBjb25maWd1cmF0aW9uIGZpbGUuXG4gICAgY29uc3QgY29uZmlnUGF0aCA9IGpvaW4oYmFzZURpciwgQ09ORklHX0ZJTEVfUEFUSCk7XG4gICAgLy8gUmVhZCB0aGUgY29uZmlndXJhdGlvbiBhbmQgdmFsaWRhdGUgaXQgYmVmb3JlIGNhY2hpbmcgaXQgZm9yIHRoZSBmdXR1cmUuXG4gICAgY2FjaGVkQ29uZmlnID0gdmFsaWRhdGVDb21tb25Db25maWcocmVhZENvbmZpZ0ZpbGUoY29uZmlnUGF0aCkpO1xuICB9XG4gIC8vIFJldHVybiBhIGNsb25lIG9mIHRoZSBjYWNoZWQgZ2xvYmFsIGNvbmZpZyB0byBlbnN1cmUgdGhhdCBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgY29uZmlnXG4gIC8vIGlzIHJldHVybmVkIGVhY2ggdGltZSwgcHJldmVudGluZyB1bmV4cGVjdGVkIGVmZmVjdHMgb2YgbW9kaWZpY2F0aW9ucyB0byB0aGUgY29uZmlnIG9iamVjdC5cbiAgcmV0dXJuIHsuLi5jYWNoZWRDb25maWd9O1xufVxuXG4vKiogVmFsaWRhdGUgdGhlIGNvbW1vbiBjb25maWd1cmF0aW9uIGhhcyBiZWVuIG1ldCBmb3IgdGhlIG5nLWRldiBjb21tYW5kLiAqL1xuZnVuY3Rpb24gdmFsaWRhdGVDb21tb25Db25maWcoY29uZmlnOiBQYXJ0aWFsPE5nRGV2Q29uZmlnPikge1xuICBjb25zdCBlcnJvcnM6IHN0cmluZ1tdID0gW107XG4gIC8vIFZhbGlkYXRlIHRoZSBnaXRodWIgY29uZmlndXJhdGlvbi5cbiAgaWYgKGNvbmZpZy5naXRodWIgPT09IHVuZGVmaW5lZCkge1xuICAgIGVycm9ycy5wdXNoKGBHaXRodWIgcmVwb3NpdG9yeSBub3QgY29uZmlndXJlZC4gU2V0IHRoZSBcImdpdGh1YlwiIG9wdGlvbi5gKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoY29uZmlnLmdpdGh1Yi5uYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBcImdpdGh1Yi5uYW1lXCIgaXMgbm90IGRlZmluZWRgKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5naXRodWIub3duZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZXJyb3JzLnB1c2goYFwiZ2l0aHViLm93bmVyXCIgaXMgbm90IGRlZmluZWRgKTtcbiAgICB9XG4gIH1cbiAgYXNzZXJ0Tm9FcnJvcnMoZXJyb3JzKTtcbiAgcmV0dXJuIGNvbmZpZyBhcyBOZ0RldkNvbmZpZztcbn1cblxuLyoqXG4gKiBSZXNvbHZlcyBhbmQgcmVhZHMgdGhlIHNwZWNpZmllZCBjb25maWd1cmF0aW9uIGZpbGUsIG9wdGlvbmFsbHkgcmV0dXJuaW5nIGFuIGVtcHR5IG9iamVjdCBpZiB0aGVcbiAqIGNvbmZpZ3VyYXRpb24gZmlsZSBjYW5ub3QgYmUgcmVhZC5cbiAqL1xuZnVuY3Rpb24gcmVhZENvbmZpZ0ZpbGUoY29uZmlnUGF0aDogc3RyaW5nLCByZXR1cm5FbXB0eU9iamVjdE9uRXJyb3IgPSBmYWxzZSk6IG9iamVjdCB7XG4gIC8vIElmIHRoZSBgLnRzYCBleHRlbnNpb24gaGFzIG5vdCBiZWVuIHNldCB1cCBhbHJlYWR5LCBhbmQgYSBUeXBlU2NyaXB0IGJhc2VkXG4gIC8vIHZlcnNpb24gb2YgdGhlIGdpdmVuIGNvbmZpZ3VyYXRpb24gc2VlbXMgdG8gZXhpc3QsIHNldCB1cCBgdHMtbm9kZWAgaWYgYXZhaWxhYmxlLlxuICBpZiAocmVxdWlyZS5leHRlbnNpb25zWycudHMnXSA9PT0gdW5kZWZpbmVkICYmIGV4aXN0c1N5bmMoYCR7Y29uZmlnUGF0aH0udHNgKSAmJlxuICAgICAgaXNUc05vZGVBdmFpbGFibGUoKSkge1xuICAgIC8vIEVuc3VyZSB0aGUgbW9kdWxlIHRhcmdldCBpcyBzZXQgdG8gYGNvbW1vbmpzYC4gVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSB0aGVcbiAgICAvLyBkZXYtaW5mcmEgdG9vbCBydW5zIGluIE5vZGVKUyB3aGljaCBkb2VzIG5vdCBzdXBwb3J0IEVTIG1vZHVsZXMgYnkgZGVmYXVsdC5cbiAgICAvLyBBZGRpdGlvbmFsbHksIHNldCB0aGUgYGRpcmAgb3B0aW9uIHRvIHRoZSBkaXJlY3RvcnkgdGhhdCBjb250YWlucyB0aGUgY29uZmlndXJhdGlvblxuICAgIC8vIGZpbGUuIFRoaXMgYWxsb3dzIGZvciBjdXN0b20gY29tcGlsZXIgb3B0aW9ucyAoc3VjaCBhcyBgLS1zdHJpY3RgKS5cbiAgICByZXF1aXJlKCd0cy1ub2RlJykucmVnaXN0ZXIoXG4gICAgICAgIHtkaXI6IGRpcm5hbWUoY29uZmlnUGF0aCksIHRyYW5zcGlsZU9ubHk6IHRydWUsIGNvbXBpbGVyT3B0aW9uczoge21vZHVsZTogJ2NvbW1vbmpzJ319KTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIHJlcXVpcmUoY29uZmlnUGF0aCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAocmV0dXJuRW1wdHlPYmplY3RPbkVycm9yKSB7XG4gICAgICBkZWJ1ZyhgQ291bGQgbm90IHJlYWQgY29uZmlndXJhdGlvbiBmaWxlIGF0ICR7Y29uZmlnUGF0aH0sIHJldHVybmluZyBlbXB0eSBvYmplY3QgaW5zdGVhZC5gKTtcbiAgICAgIGRlYnVnKGUpO1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICBlcnJvcihgQ291bGQgbm90IHJlYWQgY29uZmlndXJhdGlvbiBmaWxlIGF0ICR7Y29uZmlnUGF0aH0uYCk7XG4gICAgZXJyb3IoZSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG59XG5cbi8qKlxuICogQXNzZXJ0cyB0aGUgcHJvdmlkZWQgYXJyYXkgb2YgZXJyb3IgbWVzc2FnZXMgaXMgZW1wdHkuIElmIGFueSBlcnJvcnMgYXJlIGluIHRoZSBhcnJheSxcbiAqIGxvZ3MgdGhlIGVycm9ycyBhbmQgZXhpdCB0aGUgcHJvY2VzcyBhcyBhIGZhaWx1cmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnROb0Vycm9ycyhlcnJvcnM6IHN0cmluZ1tdKSB7XG4gIGlmIChlcnJvcnMubGVuZ3RoID09IDApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgZXJyb3IoYEVycm9ycyBkaXNjb3ZlcmVkIHdoaWxlIGxvYWRpbmcgY29uZmlndXJhdGlvbiBmaWxlOmApO1xuICBmb3IgKGNvbnN0IGVyciBvZiBlcnJvcnMpIHtcbiAgICBlcnJvcihgICAtICR7ZXJyfWApO1xuICB9XG4gIHByb2Nlc3MuZXhpdCgxKTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGxvY2FsIHVzZXIgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBmaWxlIHN5c3RlbSwgcmV0dXJuaW5nIHRoZSBhbHJlYWR5IGxvYWRlZCBjb3B5IGlmIGl0IGlzXG4gKiBkZWZpbmVkLlxuICpcbiAqIEByZXR1cm5zIFRoZSB1c2VyIGNvbmZpZ3VyYXRpb24gb2JqZWN0LCBvciBhbiBlbXB0eSBvYmplY3QgaWYgbm8gdXNlciBjb25maWd1cmF0aW9uIGZpbGUgaXNcbiAqIHByZXNlbnQuIFRoZSBvYmplY3QgaXMgYW4gdW50eXBlZCBvYmplY3QgYXMgdGhlcmUgYXJlIG5vIHJlcXVpcmVkIHVzZXIgY29uZmlndXJhdGlvbnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRVc2VyQ29uZmlnKCkge1xuICAvLyBJZiB0aGUgZ2xvYmFsIGNvbmZpZyBpcyBub3QgZGVmaW5lZCwgbG9hZCBpdCBmcm9tIHRoZSBmaWxlIHN5c3RlbS5cbiAgaWYgKHVzZXJDb25maWcgPT09IG51bGwpIHtcbiAgICBjb25zdCBnaXQgPSBHaXRDbGllbnQuZ2V0SW5zdGFuY2UoKTtcbiAgICAvLyBUaGUgZnVsbCBwYXRoIHRvIHRoZSBjb25maWd1cmF0aW9uIGZpbGUuXG4gICAgY29uc3QgY29uZmlnUGF0aCA9IGpvaW4oZ2l0LmJhc2VEaXIsIFVTRVJfQ09ORklHX0ZJTEVfUEFUSCk7XG4gICAgLy8gU2V0IHRoZSBnbG9iYWwgY29uZmlnIG9iamVjdC5cbiAgICB1c2VyQ29uZmlnID0gcmVhZENvbmZpZ0ZpbGUoY29uZmlnUGF0aCwgdHJ1ZSk7XG4gIH1cbiAgLy8gUmV0dXJuIGEgY2xvbmUgb2YgdGhlIHVzZXIgY29uZmlnIHRvIGVuc3VyZSB0aGF0IGEgbmV3IGluc3RhbmNlIG9mIHRoZSBjb25maWcgaXMgcmV0dXJuZWRcbiAgLy8gZWFjaCB0aW1lLCBwcmV2ZW50aW5nIHVuZXhwZWN0ZWQgZWZmZWN0cyBvZiBtb2RpZmljYXRpb25zIHRvIHRoZSBjb25maWcgb2JqZWN0LlxuICByZXR1cm4gey4uLnVzZXJDb25maWd9O1xufVxuIl19