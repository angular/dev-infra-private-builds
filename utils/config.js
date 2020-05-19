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
        define("@angular/dev-infra-private/utils/config", ["require", "exports", "tslib", "fs", "path", "shelljs", "@angular/dev-infra-private/utils/ts-node"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var fs_1 = require("fs");
    var path_1 = require("path");
    var shelljs_1 = require("shelljs");
    var ts_node_1 = require("@angular/dev-infra-private/utils/ts-node");
    /**
     * The filename expected for creating the ng-dev config, without the file
     * extension to allow either a typescript or javascript file to be used.
     */
    var CONFIG_FILE_NAME = '.ng-dev-config';
    /** The configuration for ng-dev. */
    var CONFIG = null;
    /**
     * Get the configuration from the file system, returning the already loaded
     * copy if it is defined.
     */
    function getConfig() {
        // If the global config is not defined, load it from the file system.
        if (CONFIG === null) {
            // The full path to the configuration file.
            var configPath = path_1.join(getRepoBaseDir(), CONFIG_FILE_NAME);
            // Set the global config object.
            CONFIG = readConfigFile(configPath);
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
        assertNoErrors(errors);
        return config;
    }
    /** Resolves and reads the specified configuration file. */
    function readConfigFile(configPath) {
        // If the the `.ts` extension has not been set up already, and a TypeScript based
        // version of the given configuration seems to exist, set up `ts-node` if available.
        if (require.extensions['.ts'] === undefined && fs_1.existsSync(configPath + ".ts") &&
            ts_node_1.isTsNodeAvailable()) {
            require('ts-node').register({ skipProject: true, transpileOnly: true });
        }
        try {
            return require(configPath);
        }
        catch (e) {
            console.error('Could not read configuration file.');
            console.error(e);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCx5QkFBOEI7SUFDOUIsNkJBQTBCO0lBQzFCLG1DQUE2QjtJQUM3QixvRUFBNEM7SUF3QjVDOzs7T0FHRztJQUNILElBQU0sZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7SUFFMUMsb0NBQW9DO0lBQ3BDLElBQUksTUFBTSxHQUFZLElBQUksQ0FBQztJQUUzQjs7O09BR0c7SUFDSCxTQUFnQixTQUFTO1FBQ3ZCLHFFQUFxRTtRQUNyRSxJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7WUFDbkIsMkNBQTJDO1lBQzNDLElBQU0sVUFBVSxHQUFHLFdBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzVELGdDQUFnQztZQUNoQyxNQUFNLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ3JDO1FBQ0QsOEZBQThGO1FBQzlGLGtGQUFrRjtRQUNsRixPQUFPLG9CQUFvQixzQkFBSyxNQUFNLEVBQUUsQ0FBQztJQUMzQyxDQUFDO0lBWEQsOEJBV0M7SUFFRCw2RUFBNkU7SUFDN0UsU0FBUyxvQkFBb0IsQ0FBQyxNQUE0QjtRQUN4RCxJQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7UUFDNUIscUNBQXFDO1FBQ3JDLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7WUFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQyw4REFBNEQsQ0FBQyxDQUFDO1NBQzNFO2FBQU07WUFDTCxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtnQkFDcEMsTUFBTSxDQUFDLElBQUksQ0FBQyxnQ0FBOEIsQ0FBQyxDQUFDO2FBQzdDO1lBQ0QsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7Z0JBQ3JDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUNBQStCLENBQUMsQ0FBQzthQUM5QztTQUNGO1FBQ0QsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZCLE9BQU8sTUFBcUIsQ0FBQztJQUMvQixDQUFDO0lBRUQsMkRBQTJEO0lBQzNELFNBQVMsY0FBYyxDQUFDLFVBQWtCO1FBQ3hDLGlGQUFpRjtRQUNqRixvRkFBb0Y7UUFDcEYsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLFNBQVMsSUFBSSxlQUFVLENBQUksVUFBVSxRQUFLLENBQUM7WUFDekUsMkJBQWlCLEVBQUUsRUFBRTtZQUN2QixPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztTQUN2RTtRQUVELElBQUk7WUFDRixPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQTtTQUMzQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1lBQ3BELE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjtJQUNILENBQUM7SUFFRDs7O09BR0c7SUFDSCxTQUFnQixjQUFjLENBQUMsTUFBZ0I7O1FBQzdDLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7WUFDdEIsT0FBTztTQUNSO1FBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxxREFBcUQsQ0FBQyxDQUFDOztZQUNyRSxLQUFvQixJQUFBLFdBQUEsaUJBQUEsTUFBTSxDQUFBLDhCQUFBLGtEQUFFO2dCQUF2QixJQUFNLE9BQUssbUJBQUE7Z0JBQ2QsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFPLE9BQU8sQ0FBQyxDQUFDO2FBQy9COzs7Ozs7Ozs7UUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFURCx3Q0FTQztJQUVELDhEQUE4RDtJQUM5RCxTQUFnQixjQUFjO1FBQzVCLElBQU0sV0FBVyxHQUFHLGNBQUksQ0FBQywrQkFBK0IsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBQzFFLElBQUksV0FBVyxDQUFDLElBQUksRUFBRTtZQUNwQixNQUFNLEtBQUssQ0FDUCxvRUFBb0U7Z0JBQ3BFLGtEQUFrRDtpQkFDbEQsY0FBWSxXQUFXLENBQUMsTUFBUSxDQUFBLENBQUMsQ0FBQztTQUN2QztRQUNELE9BQU8sV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFURCx3Q0FTQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtleGlzdHNTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtleGVjfSBmcm9tICdzaGVsbGpzJztcbmltcG9ydCB7aXNUc05vZGVBdmFpbGFibGV9IGZyb20gJy4vdHMtbm9kZSc7XG5cbi8qKlxuICogRGVzY3JpYmVzIHRoZSBHaXRodWIgY29uZmlndXJhdGlvbiBmb3IgZGV2LWluZnJhLiBUaGlzIGNvbmZpZ3VyYXRpb24gaXNcbiAqIHVzZWQgZm9yIEFQSSByZXF1ZXN0cywgZGV0ZXJtaW5pbmcgdGhlIHVwc3RyZWFtIHJlbW90ZSwgZXRjLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEdpdGh1YkNvbmZpZyB7XG4gIC8qKiBPd25lciBuYW1lIG9mIHRoZSByZXBvc2l0b3J5LiAqL1xuICBvd25lcjogc3RyaW5nO1xuICAvKiogTmFtZSBvZiB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgbmFtZTogc3RyaW5nO1xufVxuXG4vKiogVGhlIGNvbW1vbiBjb25maWd1cmF0aW9uIGZvciBuZy1kZXYuICovXG50eXBlIENvbW1vbkNvbmZpZyA9IHtcbiAgZ2l0aHViOiBHaXRodWJDb25maWdcbn07XG5cbi8qKlxuICogVGhlIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBzcGVjaWZpYyBuZy1kZXYgY29tbWFuZCwgcHJvdmlkaW5nIGJvdGggdGhlIGNvbW1vblxuICogbmctZGV2IGNvbmZpZyBhcyB3ZWxsIGFzIHRoZSBzcGVjaWZpYyBjb25maWcgb2YgYSBzdWJjb21tYW5kLlxuICovXG5leHBvcnQgdHlwZSBOZ0RldkNvbmZpZzxUID0ge30+ID0gQ29tbW9uQ29uZmlnJlQ7XG5cbi8qKlxuICogVGhlIGZpbGVuYW1lIGV4cGVjdGVkIGZvciBjcmVhdGluZyB0aGUgbmctZGV2IGNvbmZpZywgd2l0aG91dCB0aGUgZmlsZVxuICogZXh0ZW5zaW9uIHRvIGFsbG93IGVpdGhlciBhIHR5cGVzY3JpcHQgb3IgamF2YXNjcmlwdCBmaWxlIHRvIGJlIHVzZWQuXG4gKi9cbmNvbnN0IENPTkZJR19GSUxFX05BTUUgPSAnLm5nLWRldi1jb25maWcnO1xuXG4vKiogVGhlIGNvbmZpZ3VyYXRpb24gZm9yIG5nLWRldi4gKi9cbmxldCBDT05GSUc6IHt9fG51bGwgPSBudWxsO1xuXG4vKipcbiAqIEdldCB0aGUgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBmaWxlIHN5c3RlbSwgcmV0dXJuaW5nIHRoZSBhbHJlYWR5IGxvYWRlZFxuICogY29weSBpZiBpdCBpcyBkZWZpbmVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29uZmlnKCk6IE5nRGV2Q29uZmlnIHtcbiAgLy8gSWYgdGhlIGdsb2JhbCBjb25maWcgaXMgbm90IGRlZmluZWQsIGxvYWQgaXQgZnJvbSB0aGUgZmlsZSBzeXN0ZW0uXG4gIGlmIChDT05GSUcgPT09IG51bGwpIHtcbiAgICAvLyBUaGUgZnVsbCBwYXRoIHRvIHRoZSBjb25maWd1cmF0aW9uIGZpbGUuXG4gICAgY29uc3QgY29uZmlnUGF0aCA9IGpvaW4oZ2V0UmVwb0Jhc2VEaXIoKSwgQ09ORklHX0ZJTEVfTkFNRSk7XG4gICAgLy8gU2V0IHRoZSBnbG9iYWwgY29uZmlnIG9iamVjdC5cbiAgICBDT05GSUcgPSByZWFkQ29uZmlnRmlsZShjb25maWdQYXRoKTtcbiAgfVxuICAvLyBSZXR1cm4gYSBjbG9uZSBvZiB0aGUgZ2xvYmFsIGNvbmZpZyB0byBlbnN1cmUgdGhhdCBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgY29uZmlnIGlzIHJldHVybmVkXG4gIC8vIGVhY2ggdGltZSwgcHJldmVudGluZyB1bmV4cGVjdGVkIGVmZmVjdHMgb2YgbW9kaWZpY2F0aW9ucyB0byB0aGUgY29uZmlnIG9iamVjdC5cbiAgcmV0dXJuIHZhbGlkYXRlQ29tbW9uQ29uZmlnKHsuLi5DT05GSUd9KTtcbn1cblxuLyoqIFZhbGlkYXRlIHRoZSBjb21tb24gY29uZmlndXJhdGlvbiBoYXMgYmVlbiBtZXQgZm9yIHRoZSBuZy1kZXYgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlQ29tbW9uQ29uZmlnKGNvbmZpZzogUGFydGlhbDxOZ0RldkNvbmZpZz4pIHtcbiAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuICAvLyBWYWxpZGF0ZSB0aGUgZ2l0aHViIGNvbmZpZ3VyYXRpb24uXG4gIGlmIChjb25maWcuZ2l0aHViID09PSB1bmRlZmluZWQpIHtcbiAgICBlcnJvcnMucHVzaChgR2l0aHViIHJlcG9zaXRvcnkgbm90IGNvbmZpZ3VyZWQuIFNldCB0aGUgXCJnaXRodWJcIiBvcHRpb24uYCk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGNvbmZpZy5naXRodWIubmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvcnMucHVzaChgXCJnaXRodWIubmFtZVwiIGlzIG5vdCBkZWZpbmVkYCk7XG4gICAgfVxuICAgIGlmIChjb25maWcuZ2l0aHViLm93bmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBcImdpdGh1Yi5vd25lclwiIGlzIG5vdCBkZWZpbmVkYCk7XG4gICAgfVxuICB9XG4gIGFzc2VydE5vRXJyb3JzKGVycm9ycyk7XG4gIHJldHVybiBjb25maWcgYXMgTmdEZXZDb25maWc7XG59XG5cbi8qKiBSZXNvbHZlcyBhbmQgcmVhZHMgdGhlIHNwZWNpZmllZCBjb25maWd1cmF0aW9uIGZpbGUuICovXG5mdW5jdGlvbiByZWFkQ29uZmlnRmlsZShjb25maWdQYXRoOiBzdHJpbmcpOiBvYmplY3Qge1xuICAvLyBJZiB0aGUgdGhlIGAudHNgIGV4dGVuc2lvbiBoYXMgbm90IGJlZW4gc2V0IHVwIGFscmVhZHksIGFuZCBhIFR5cGVTY3JpcHQgYmFzZWRcbiAgLy8gdmVyc2lvbiBvZiB0aGUgZ2l2ZW4gY29uZmlndXJhdGlvbiBzZWVtcyB0byBleGlzdCwgc2V0IHVwIGB0cy1ub2RlYCBpZiBhdmFpbGFibGUuXG4gIGlmIChyZXF1aXJlLmV4dGVuc2lvbnNbJy50cyddID09PSB1bmRlZmluZWQgJiYgZXhpc3RzU3luYyhgJHtjb25maWdQYXRofS50c2ApICYmXG4gICAgICBpc1RzTm9kZUF2YWlsYWJsZSgpKSB7XG4gICAgcmVxdWlyZSgndHMtbm9kZScpLnJlZ2lzdGVyKHtza2lwUHJvamVjdDogdHJ1ZSwgdHJhbnNwaWxlT25seTogdHJ1ZX0pO1xuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gcmVxdWlyZShjb25maWdQYXRoKVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcignQ291bGQgbm90IHJlYWQgY29uZmlndXJhdGlvbiBmaWxlLicpO1xuICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG59XG5cbi8qKlxuICogQXNzZXJ0cyB0aGUgcHJvdmlkZWQgYXJyYXkgb2YgZXJyb3IgbWVzc2FnZXMgaXMgZW1wdHkuIElmIGFueSBlcnJvcnMgYXJlIGluIHRoZSBhcnJheSxcbiAqIGxvZ3MgdGhlIGVycm9ycyBhbmQgZXhpdCB0aGUgcHJvY2VzcyBhcyBhIGZhaWx1cmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnROb0Vycm9ycyhlcnJvcnM6IHN0cmluZ1tdKSB7XG4gIGlmIChlcnJvcnMubGVuZ3RoID09IDApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc29sZS5lcnJvcihgRXJyb3JzIGRpc2NvdmVyZWQgd2hpbGUgbG9hZGluZyBjb25maWd1cmF0aW9uIGZpbGU6YCk7XG4gIGZvciAoY29uc3QgZXJyb3Igb2YgZXJyb3JzKSB7XG4gICAgY29uc29sZS5lcnJvcihgICAtICR7ZXJyb3J9YCk7XG4gIH1cbiAgcHJvY2Vzcy5leGl0KDEpO1xufVxuXG4vKiogR2V0cyB0aGUgcGF0aCBvZiB0aGUgZGlyZWN0b3J5IGZvciB0aGUgcmVwb3NpdG9yeSBiYXNlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJlcG9CYXNlRGlyKCkge1xuICBjb25zdCBiYXNlUmVwb0RpciA9IGV4ZWMoYGdpdCByZXYtcGFyc2UgLS1zaG93LXRvcGxldmVsYCwge3NpbGVudDogdHJ1ZX0pO1xuICBpZiAoYmFzZVJlcG9EaXIuY29kZSkge1xuICAgIHRocm93IEVycm9yKFxuICAgICAgICBgVW5hYmxlIHRvIGZpbmQgdGhlIHBhdGggdG8gdGhlIGJhc2UgZGlyZWN0b3J5IG9mIHRoZSByZXBvc2l0b3J5LlxcbmAgK1xuICAgICAgICBgV2FzIHRoZSBjb21tYW5kIHJ1biBmcm9tIGluc2lkZSBvZiB0aGUgcmVwbz9cXG5cXG5gICtcbiAgICAgICAgYEVSUk9SOlxcbiAke2Jhc2VSZXBvRGlyLnN0ZGVycn1gKTtcbiAgfVxuICByZXR1cm4gYmFzZVJlcG9EaXIudHJpbSgpO1xufVxuIl19