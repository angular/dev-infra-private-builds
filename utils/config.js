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
    var CONFIG = null;
    /**
     * The filename expected for local user config, without the file extension to allow a typescript,
     * javascript or json file to be used.
     */
    var USER_CONFIG_FILE_PATH = '.ng-dev.user';
    /** The local user configuration for ng-dev. */
    var USER_CONFIG;
    /**
     * Get the configuration from the file system, returning the already loaded
     * copy if it is defined.
     */
    function getConfig() {
        // If the global config is not defined, load it from the file system.
        if (CONFIG === null) {
            // The full path to the configuration file.
            var configPath = path_1.join(getRepoBaseDir(), CONFIG_FILE_PATH);
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
    /**
     * Resolves and reads the specified configuration file, optionally returning an empty object if the
     * configuration file cannot be read.
     */
    function readConfigFile(configPath, returnEmptyObjectOnError) {
        if (returnEmptyObjectOnError === void 0) { returnEmptyObjectOnError = false; }
        // If the the `.ts` extension has not been set up already, and a TypeScript based
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
        if (USER_CONFIG === undefined) {
            // The full path to the configuration file.
            var configPath = path_1.join(getRepoBaseDir(), USER_CONFIG_FILE_PATH);
            // Set the global config object.
            USER_CONFIG = readConfigFile(configPath, true);
        }
        // Return a clone of the global config to ensure that a new instance of the config is returned
        // each time, preventing unexpected effects of modifications to the config object.
        return tslib_1.__assign({}, USER_CONFIG);
    }
    exports.getUserConfig = getUserConfig;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgseUJBQThCO0lBQzlCLDZCQUFtQztJQUVuQyxvRUFBdUM7SUFDdkMsb0VBQStCO0lBQy9CLG9FQUE0QztJQStCNUM7OztPQUdHO0lBQ0gsSUFBTSxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztJQUUxQyxvQ0FBb0M7SUFDcEMsSUFBSSxNQUFNLEdBQVksSUFBSSxDQUFDO0lBRTNCOzs7T0FHRztJQUNILElBQU0scUJBQXFCLEdBQUcsY0FBYyxDQUFDO0lBRTdDLCtDQUErQztJQUMvQyxJQUFJLFdBQWlDLENBQUM7SUFFdEM7OztPQUdHO0lBQ0gsU0FBZ0IsU0FBUztRQUN2QixxRUFBcUU7UUFDckUsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFO1lBQ25CLDJDQUEyQztZQUMzQyxJQUFNLFVBQVUsR0FBRyxXQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUM1RCxnQ0FBZ0M7WUFDaEMsTUFBTSxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUNyQztRQUNELDhGQUE4RjtRQUM5RixrRkFBa0Y7UUFDbEYsT0FBTyxvQkFBb0Isc0JBQUssTUFBTSxFQUFFLENBQUM7SUFDM0MsQ0FBQztJQVhELDhCQVdDO0lBRUQsNkVBQTZFO0lBQzdFLFNBQVMsb0JBQW9CLENBQUMsTUFBNEI7UUFDeEQsSUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO1FBQzVCLHFDQUFxQztRQUNyQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO1lBQy9CLE1BQU0sQ0FBQyxJQUFJLENBQUMsOERBQTRELENBQUMsQ0FBQztTQUMzRTthQUFNO1lBQ0wsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUks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LFdBQVcsRUFBRTtJQUMxQixDQUFDO0lBWEQsc0NBV0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtleGlzdHNTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge2Rpcm5hbWUsIGpvaW59IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge2RlYnVnLCBlcnJvcn0gZnJvbSAnLi9jb25zb2xlJztcbmltcG9ydCB7ZXhlY30gZnJvbSAnLi9zaGVsbGpzJztcbmltcG9ydCB7aXNUc05vZGVBdmFpbGFibGV9IGZyb20gJy4vdHMtbm9kZSc7XG5cbi8qKiBDb25maWd1cmF0aW9uIGZvciBHaXQgY2xpZW50IGludGVyYWN0aW9ucy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2l0Q2xpZW50Q29uZmlnIHtcbiAgLyoqIE93bmVyIG5hbWUgb2YgdGhlIHJlcG9zaXRvcnkuICovXG4gIG93bmVyOiBzdHJpbmc7XG4gIC8qKiBOYW1lIG9mIHRoZSByZXBvc2l0b3J5LiAqL1xuICBuYW1lOiBzdHJpbmc7XG4gIC8qKiBJZiBTU0ggcHJvdG9jb2wgc2hvdWxkIGJlIHVzZWQgZm9yIGdpdCBpbnRlcmFjdGlvbnMuICovXG4gIHVzZVNzaD86IGJvb2xlYW47XG4gIC8qKiBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgcmVwb3NpdG9yeSBpcyBwcml2YXRlLiAqL1xuICBwcml2YXRlPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBEZXNjcmliZXMgdGhlIEdpdGh1YiBjb25maWd1cmF0aW9uIGZvciBkZXYtaW5mcmEuIFRoaXMgY29uZmlndXJhdGlvbiBpc1xuICogdXNlZCBmb3IgQVBJIHJlcXVlc3RzLCBkZXRlcm1pbmluZyB0aGUgdXBzdHJlYW0gcmVtb3RlLCBldGMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2l0aHViQ29uZmlnIGV4dGVuZHMgR2l0Q2xpZW50Q29uZmlnIHt9XG5cbi8qKiBUaGUgY29tbW9uIGNvbmZpZ3VyYXRpb24gZm9yIG5nLWRldi4gKi9cbnR5cGUgQ29tbW9uQ29uZmlnID0ge1xuICBnaXRodWI6IEdpdGh1YkNvbmZpZ1xufTtcblxuLyoqXG4gKiBUaGUgY29uZmlndXJhdGlvbiBmb3IgdGhlIHNwZWNpZmljIG5nLWRldiBjb21tYW5kLCBwcm92aWRpbmcgYm90aCB0aGUgY29tbW9uXG4gKiBuZy1kZXYgY29uZmlnIGFzIHdlbGwgYXMgdGhlIHNwZWNpZmljIGNvbmZpZyBvZiBhIHN1YmNvbW1hbmQuXG4gKi9cbmV4cG9ydCB0eXBlIE5nRGV2Q29uZmlnPFQgPSB7fT4gPSBDb21tb25Db25maWcmVDtcblxuLyoqXG4gKiBUaGUgZmlsZW5hbWUgZXhwZWN0ZWQgZm9yIGNyZWF0aW5nIHRoZSBuZy1kZXYgY29uZmlnLCB3aXRob3V0IHRoZSBmaWxlXG4gKiBleHRlbnNpb24gdG8gYWxsb3cgZWl0aGVyIGEgdHlwZXNjcmlwdCBvciBqYXZhc2NyaXB0IGZpbGUgdG8gYmUgdXNlZC5cbiAqL1xuY29uc3QgQ09ORklHX0ZJTEVfUEFUSCA9ICcubmctZGV2L2NvbmZpZyc7XG5cbi8qKiBUaGUgY29uZmlndXJhdGlvbiBmb3IgbmctZGV2LiAqL1xubGV0IENPTkZJRzoge318bnVsbCA9IG51bGw7XG5cbi8qKlxuICogVGhlIGZpbGVuYW1lIGV4cGVjdGVkIGZvciBsb2NhbCB1c2VyIGNvbmZpZywgd2l0aG91dCB0aGUgZmlsZSBleHRlbnNpb24gdG8gYWxsb3cgYSB0eXBlc2NyaXB0LFxuICogamF2YXNjcmlwdCBvciBqc29uIGZpbGUgdG8gYmUgdXNlZC5cbiAqL1xuY29uc3QgVVNFUl9DT05GSUdfRklMRV9QQVRIID0gJy5uZy1kZXYudXNlcic7XG5cbi8qKiBUaGUgbG9jYWwgdXNlciBjb25maWd1cmF0aW9uIGZvciBuZy1kZXYuICovXG5sZXQgVVNFUl9DT05GSUc6IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuXG4vKipcbiAqIEdldCB0aGUgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBmaWxlIHN5c3RlbSwgcmV0dXJuaW5nIHRoZSBhbHJlYWR5IGxvYWRlZFxuICogY29weSBpZiBpdCBpcyBkZWZpbmVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29uZmlnKCk6IE5nRGV2Q29uZmlnIHtcbiAgLy8gSWYgdGhlIGdsb2JhbCBjb25maWcgaXMgbm90IGRlZmluZWQsIGxvYWQgaXQgZnJvbSB0aGUgZmlsZSBzeXN0ZW0uXG4gIGlmIChDT05GSUcgPT09IG51bGwpIHtcbiAgICAvLyBUaGUgZnVsbCBwYXRoIHRvIHRoZSBjb25maWd1cmF0aW9uIGZpbGUuXG4gICAgY29uc3QgY29uZmlnUGF0aCA9IGpvaW4oZ2V0UmVwb0Jhc2VEaXIoKSwgQ09ORklHX0ZJTEVfUEFUSCk7XG4gICAgLy8gU2V0IHRoZSBnbG9iYWwgY29uZmlnIG9iamVjdC5cbiAgICBDT05GSUcgPSByZWFkQ29uZmlnRmlsZShjb25maWdQYXRoKTtcbiAgfVxuICAvLyBSZXR1cm4gYSBjbG9uZSBvZiB0aGUgZ2xvYmFsIGNvbmZpZyB0byBlbnN1cmUgdGhhdCBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgY29uZmlnIGlzIHJldHVybmVkXG4gIC8vIGVhY2ggdGltZSwgcHJldmVudGluZyB1bmV4cGVjdGVkIGVmZmVjdHMgb2YgbW9kaWZpY2F0aW9ucyB0byB0aGUgY29uZmlnIG9iamVjdC5cbiAgcmV0dXJuIHZhbGlkYXRlQ29tbW9uQ29uZmlnKHsuLi5DT05GSUd9KTtcbn1cblxuLyoqIFZhbGlkYXRlIHRoZSBjb21tb24gY29uZmlndXJhdGlvbiBoYXMgYmVlbiBtZXQgZm9yIHRoZSBuZy1kZXYgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlQ29tbW9uQ29uZmlnKGNvbmZpZzogUGFydGlhbDxOZ0RldkNvbmZpZz4pIHtcbiAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuICAvLyBWYWxpZGF0ZSB0aGUgZ2l0aHViIGNvbmZpZ3VyYXRpb24uXG4gIGlmIChjb25maWcuZ2l0aHViID09PSB1bmRlZmluZWQpIHtcbiAgICBlcnJvcnMucHVzaChgR2l0aHViIHJlcG9zaXRvcnkgbm90IGNvbmZpZ3VyZWQuIFNldCB0aGUgXCJnaXRodWJcIiBvcHRpb24uYCk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGNvbmZpZy5naXRodWIubmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvcnMucHVzaChgXCJnaXRodWIubmFtZVwiIGlzIG5vdCBkZWZpbmVkYCk7XG4gICAgfVxuICAgIGlmIChjb25maWcuZ2l0aHViLm93bmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBcImdpdGh1Yi5vd25lclwiIGlzIG5vdCBkZWZpbmVkYCk7XG4gICAgfVxuICB9XG4gIGFzc2VydE5vRXJyb3JzKGVycm9ycyk7XG4gIHJldHVybiBjb25maWcgYXMgTmdEZXZDb25maWc7XG59XG5cbi8qKlxuICogUmVzb2x2ZXMgYW5kIHJlYWRzIHRoZSBzcGVjaWZpZWQgY29uZmlndXJhdGlvbiBmaWxlLCBvcHRpb25hbGx5IHJldHVybmluZyBhbiBlbXB0eSBvYmplY3QgaWYgdGhlXG4gKiBjb25maWd1cmF0aW9uIGZpbGUgY2Fubm90IGJlIHJlYWQuXG4gKi9cbmZ1bmN0aW9uIHJlYWRDb25maWdGaWxlKGNvbmZpZ1BhdGg6IHN0cmluZywgcmV0dXJuRW1wdHlPYmplY3RPbkVycm9yID0gZmFsc2UpOiBvYmplY3Qge1xuICAvLyBJZiB0aGUgdGhlIGAudHNgIGV4dGVuc2lvbiBoYXMgbm90IGJlZW4gc2V0IHVwIGFscmVhZHksIGFuZCBhIFR5cGVTY3JpcHQgYmFzZWRcbiAgLy8gdmVyc2lvbiBvZiB0aGUgZ2l2ZW4gY29uZmlndXJhdGlvbiBzZWVtcyB0byBleGlzdCwgc2V0IHVwIGB0cy1ub2RlYCBpZiBhdmFpbGFibGUuXG4gIGlmIChyZXF1aXJlLmV4dGVuc2lvbnNbJy50cyddID09PSB1bmRlZmluZWQgJiYgZXhpc3RzU3luYyhgJHtjb25maWdQYXRofS50c2ApICYmXG4gICAgICBpc1RzTm9kZUF2YWlsYWJsZSgpKSB7XG4gICAgLy8gRW5zdXJlIHRoZSBtb2R1bGUgdGFyZ2V0IGlzIHNldCB0byBgY29tbW9uanNgLiBUaGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHRoZVxuICAgIC8vIGRldi1pbmZyYSB0b29sIHJ1bnMgaW4gTm9kZUpTIHdoaWNoIGRvZXMgbm90IHN1cHBvcnQgRVMgbW9kdWxlcyBieSBkZWZhdWx0LlxuICAgIC8vIEFkZGl0aW9uYWxseSwgc2V0IHRoZSBgZGlyYCBvcHRpb24gdG8gdGhlIGRpcmVjdG9yeSB0aGF0IGNvbnRhaW5zIHRoZSBjb25maWd1cmF0aW9uXG4gICAgLy8gZmlsZS4gVGhpcyBhbGxvd3MgZm9yIGN1c3RvbSBjb21waWxlciBvcHRpb25zIChzdWNoIGFzIGAtLXN0cmljdGApLlxuICAgIHJlcXVpcmUoJ3RzLW5vZGUnKS5yZWdpc3RlcihcbiAgICAgICAge2RpcjogZGlybmFtZShjb25maWdQYXRoKSwgdHJhbnNwaWxlT25seTogdHJ1ZSwgY29tcGlsZXJPcHRpb25zOiB7bW9kdWxlOiAnY29tbW9uanMnfX0pO1xuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gcmVxdWlyZShjb25maWdQYXRoKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChyZXR1cm5FbXB0eU9iamVjdE9uRXJyb3IpIHtcbiAgICAgIGRlYnVnKGBDb3VsZCBub3QgcmVhZCBjb25maWd1cmF0aW9uIGZpbGUgYXQgJHtjb25maWdQYXRofSwgcmV0dXJuaW5nIGVtcHR5IG9iamVjdCBpbnN0ZWFkLmApO1xuICAgICAgZGVidWcoZSk7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIGVycm9yKGBDb3VsZCBub3QgcmVhZCBjb25maWd1cmF0aW9uIGZpbGUgYXQgJHtjb25maWdQYXRofS5gKTtcbiAgICBlcnJvcihlKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBc3NlcnRzIHRoZSBwcm92aWRlZCBhcnJheSBvZiBlcnJvciBtZXNzYWdlcyBpcyBlbXB0eS4gSWYgYW55IGVycm9ycyBhcmUgaW4gdGhlIGFycmF5LFxuICogbG9ncyB0aGUgZXJyb3JzIGFuZCBleGl0IHRoZSBwcm9jZXNzIGFzIGEgZmFpbHVyZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydE5vRXJyb3JzKGVycm9yczogc3RyaW5nW10pIHtcbiAgaWYgKGVycm9ycy5sZW5ndGggPT0gMCkge1xuICAgIHJldHVybjtcbiAgfVxuICBlcnJvcihgRXJyb3JzIGRpc2NvdmVyZWQgd2hpbGUgbG9hZGluZyBjb25maWd1cmF0aW9uIGZpbGU6YCk7XG4gIGZvciAoY29uc3QgZXJyIG9mIGVycm9ycykge1xuICAgIGVycm9yKGAgIC0gJHtlcnJ9YCk7XG4gIH1cbiAgcHJvY2Vzcy5leGl0KDEpO1xufVxuXG4vKiogR2V0cyB0aGUgcGF0aCBvZiB0aGUgZGlyZWN0b3J5IGZvciB0aGUgcmVwb3NpdG9yeSBiYXNlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJlcG9CYXNlRGlyKCkge1xuICBjb25zdCBiYXNlUmVwb0RpciA9IGV4ZWMoYGdpdCByZXYtcGFyc2UgLS1zaG93LXRvcGxldmVsYCk7XG4gIGlmIChiYXNlUmVwb0Rpci5jb2RlKSB7XG4gICAgdGhyb3cgRXJyb3IoXG4gICAgICAgIGBVbmFibGUgdG8gZmluZCB0aGUgcGF0aCB0byB0aGUgYmFzZSBkaXJlY3Rvcnkgb2YgdGhlIHJlcG9zaXRvcnkuXFxuYCArXG4gICAgICAgIGBXYXMgdGhlIGNvbW1hbmQgcnVuIGZyb20gaW5zaWRlIG9mIHRoZSByZXBvP1xcblxcbmAgK1xuICAgICAgICBgRVJST1I6XFxuICR7YmFzZVJlcG9EaXIuc3RkZXJyfWApO1xuICB9XG4gIHJldHVybiBiYXNlUmVwb0Rpci50cmltKCk7XG59XG5cbi8qKlxuICogR2V0IHRoZSBsb2NhbCB1c2VyIGNvbmZpZ3VyYXRpb24gZnJvbSB0aGUgZmlsZSBzeXN0ZW0sIHJldHVybmluZyB0aGUgYWxyZWFkeSBsb2FkZWQgY29weSBpZiBpdCBpc1xuICogZGVmaW5lZC5cbiAqXG4gKiBAcmV0dXJucyBUaGUgdXNlciBjb25maWd1cmF0aW9uIG9iamVjdCwgb3IgYW4gZW1wdHkgb2JqZWN0IGlmIG5vIHVzZXIgY29uZmlndXJhdGlvbiBmaWxlIGlzXG4gKiBwcmVzZW50LiBUaGUgb2JqZWN0IGlzIGFuIHVudHlwZWQgb2JqZWN0IGFzIHRoZXJlIGFyZSBubyByZXF1aXJlZCB1c2VyIGNvbmZpZ3VyYXRpb25zLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VXNlckNvbmZpZygpIHtcbiAgLy8gSWYgdGhlIGdsb2JhbCBjb25maWcgaXMgbm90IGRlZmluZWQsIGxvYWQgaXQgZnJvbSB0aGUgZmlsZSBzeXN0ZW0uXG4gIGlmIChVU0VSX0NPTkZJRyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gVGhlIGZ1bGwgcGF0aCB0byB0aGUgY29uZmlndXJhdGlvbiBmaWxlLlxuICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBqb2luKGdldFJlcG9CYXNlRGlyKCksIFVTRVJfQ09ORklHX0ZJTEVfUEFUSCk7XG4gICAgLy8gU2V0IHRoZSBnbG9iYWwgY29uZmlnIG9iamVjdC5cbiAgICBVU0VSX0NPTkZJRyA9IHJlYWRDb25maWdGaWxlKGNvbmZpZ1BhdGgsIHRydWUpO1xuICB9XG4gIC8vIFJldHVybiBhIGNsb25lIG9mIHRoZSBnbG9iYWwgY29uZmlnIHRvIGVuc3VyZSB0aGF0IGEgbmV3IGluc3RhbmNlIG9mIHRoZSBjb25maWcgaXMgcmV0dXJuZWRcbiAgLy8gZWFjaCB0aW1lLCBwcmV2ZW50aW5nIHVuZXhwZWN0ZWQgZWZmZWN0cyBvZiBtb2RpZmljYXRpb25zIHRvIHRoZSBjb25maWcgb2JqZWN0LlxuICByZXR1cm4gey4uLlVTRVJfQ09ORklHfTtcbn1cbiJdfQ==