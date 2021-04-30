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
            baseDir = baseDir || index_1.GitClient.getInstance().baseDir;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgseUJBQThCO0lBQzlCLDZCQUFtQztJQUVuQyxvRUFBdUM7SUFDdkMsb0VBQXNDO0lBQ3RDLG9FQUE0QztJQStCNUM7OztPQUdHO0lBQ0gsSUFBTSxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztJQUUxQyxvQ0FBb0M7SUFDcEMsSUFBSSxZQUFZLEdBQXFCLElBQUksQ0FBQztJQUUxQzs7O09BR0c7SUFDSCxJQUFNLHFCQUFxQixHQUFHLGNBQWMsQ0FBQztJQUU3QywrQ0FBK0M7SUFDL0MsSUFBSSxVQUFVLEdBQThCLElBQUksQ0FBQztJQVFqRCxTQUFnQixTQUFTLENBQUMsT0FBZ0I7UUFDeEMscUVBQXFFO1FBQ3JFLElBQUksWUFBWSxLQUFLLElBQUksRUFBRTtZQUN6QixPQUFPLEdBQUcsT0FBTyxJQUFJLGlCQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsT0FBTyxDQUFDO1lBQ3JELDJDQUEyQztZQUMzQyxJQUFNLFVBQVUsR0FBRyxXQUFJLENBQUMsT0FBTyxFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFDbkQsMkVBQTJFO1lBQzNFLFlBQVksR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztTQUNqRTtRQUNELHlGQUF5RjtRQUN6Riw4RkFBOEY7UUFDOUYsNEJBQVcsWUFBWSxFQUFFO0lBQzNCLENBQUM7SUFaRCw4QkFZQztJQUVELDZFQUE2RTtJQUM3RSxTQUFTLG9CQUFvQixDQUFDLE1BQTRCO1FBQ3hELElBQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztRQUM1QixxQ0FBcUM7UUFDckMsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTtZQUMvQixNQUFNLENBQUMsSUFBSSxDQUFDLDhEQUE0RCxDQUFDLENBQUM7U0FDM0U7YUFBTTtZQUNMLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO2dCQUNwQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdDQUE4QixDQUFDLENBQUM7YUFDN0M7WUFDRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRTtnQkFDckMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQ0FBK0IsQ0FBQyxDQUFDO2FBQzlDO1NBQ0Y7UUFDRCxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkIsT0FBTyxNQUFxQixDQUFDO0lBQy9CLENBQUM7SUFFRDs7O09BR0c7SUFDSCxTQUFTLGNBQWMsQ0FBQyxVQUFrQixFQUFFLHdCQUFnQztRQUFoQyx5Q0FBQSxFQUFBLGdDQUFnQztRQUMxRSw2RUFBNkU7UUFDN0Usb0ZBQW9GO1FBQ3BGLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxTQUFTLElBQUksZUFBVSxDQUFJLFVBQVUsUUFBSyxDQUFDO1lBQ3pFLDJCQUFpQixFQUFFLEVBQUU7WUFDdkIsK0VBQStFO1lBQy9FLDhFQUE4RTtZQUM5RSxzRkFBc0Y7WUFDdEYsc0VBQXNFO1lBQ3RFLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLENBQ3ZCLEVBQUMsR0FBRyxFQUFFLGNBQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUMsRUFBQyxDQUFDLENBQUM7U0FDN0Y7UUFFRCxJQUFJO1lBQ0YsT0FBTyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDNUI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLElBQUksd0JBQXdCLEVBQUU7Z0JBQzVCLGVBQUssQ0FBQywwQ0FBd0MsVUFBVSxzQ0FBbUMsQ0FBQyxDQUFDO2dCQUM3RixlQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1QsT0FBTyxFQUFFLENBQUM7YUFDWDtZQUNELGVBQUssQ0FBQywwQ0FBd0MsVUFBVSxNQUFHLENBQUMsQ0FBQztZQUM3RCxlQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDVCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO0lBQ0gsQ0FBQztJQUVEOzs7T0FHRztJQUNILFNBQWdCLGNBQWMsQ0FBQyxNQUFnQjs7UUFDN0MsSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtZQUN0QixPQUFPO1NBQ1I7UUFDRCxlQUFLLENBQUMscURBQXFELENBQUMsQ0FBQzs7WUFDN0QsS0FBa0IsSUFBQSxXQUFBLGlCQUFBLE1BQU0sQ0FBQSw4QkFBQSxrREFBRTtnQkFBckIsSUFBTSxHQUFHLG1CQUFBO2dCQUNaLGVBQUssQ0FBQyxTQUFPLEdBQUssQ0FBQyxDQUFDO2FBQ3JCOzs7Ozs7Ozs7UUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFURCx3Q0FTQztJQUVEOzs7Ozs7T0FNRztJQUNILFNBQWdCLGFBQWE7UUFDM0IscUVBQXFFO1FBQ3JFLElBQUksVUFBVSxLQUFLLElBQUksRUFBRTtZQUN2QixJQUFNLEdBQUcsR0FBRyxpQkFBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3BDLDJDQUEyQztZQUMzQyxJQUFNLFVBQVUsR0FBRyxXQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1lBQzVELGdDQUFnQztZQUNoQyxVQUFVLEdBQUcsY0FBYyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUMvQztRQUNELDRGQUE0RjtRQUM1RixrRkFBa0Y7UUFDbEYsNEJBQVcsVUFBVSxFQUFFO0lBQ3pCLENBQUM7SUFaRCxzQ0FZQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2V4aXN0c1N5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7ZGlybmFtZSwgam9pbn0gZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7ZGVidWcsIGVycm9yfSBmcm9tICcuL2NvbnNvbGUnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4vZ2l0L2luZGV4JztcbmltcG9ydCB7aXNUc05vZGVBdmFpbGFibGV9IGZyb20gJy4vdHMtbm9kZSc7XG5cbi8qKiBDb25maWd1cmF0aW9uIGZvciBHaXQgY2xpZW50IGludGVyYWN0aW9ucy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2l0Q2xpZW50Q29uZmlnIHtcbiAgLyoqIE93bmVyIG5hbWUgb2YgdGhlIHJlcG9zaXRvcnkuICovXG4gIG93bmVyOiBzdHJpbmc7XG4gIC8qKiBOYW1lIG9mIHRoZSByZXBvc2l0b3J5LiAqL1xuICBuYW1lOiBzdHJpbmc7XG4gIC8qKiBJZiBTU0ggcHJvdG9jb2wgc2hvdWxkIGJlIHVzZWQgZm9yIGdpdCBpbnRlcmFjdGlvbnMuICovXG4gIHVzZVNzaD86IGJvb2xlYW47XG4gIC8qKiBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgcmVwb3NpdG9yeSBpcyBwcml2YXRlLiAqL1xuICBwcml2YXRlPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBEZXNjcmliZXMgdGhlIEdpdGh1YiBjb25maWd1cmF0aW9uIGZvciBkZXYtaW5mcmEuIFRoaXMgY29uZmlndXJhdGlvbiBpc1xuICogdXNlZCBmb3IgQVBJIHJlcXVlc3RzLCBkZXRlcm1pbmluZyB0aGUgdXBzdHJlYW0gcmVtb3RlLCBldGMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2l0aHViQ29uZmlnIGV4dGVuZHMgR2l0Q2xpZW50Q29uZmlnIHt9XG5cbi8qKiBUaGUgY29tbW9uIGNvbmZpZ3VyYXRpb24gZm9yIG5nLWRldi4gKi9cbnR5cGUgQ29tbW9uQ29uZmlnID0ge1xuICBnaXRodWI6IEdpdGh1YkNvbmZpZ1xufTtcblxuLyoqXG4gKiBUaGUgY29uZmlndXJhdGlvbiBmb3IgdGhlIHNwZWNpZmljIG5nLWRldiBjb21tYW5kLCBwcm92aWRpbmcgYm90aCB0aGUgY29tbW9uXG4gKiBuZy1kZXYgY29uZmlnIGFzIHdlbGwgYXMgdGhlIHNwZWNpZmljIGNvbmZpZyBvZiBhIHN1YmNvbW1hbmQuXG4gKi9cbmV4cG9ydCB0eXBlIE5nRGV2Q29uZmlnPFQgPSB7fT4gPSBDb21tb25Db25maWcmVDtcblxuLyoqXG4gKiBUaGUgZmlsZW5hbWUgZXhwZWN0ZWQgZm9yIGNyZWF0aW5nIHRoZSBuZy1kZXYgY29uZmlnLCB3aXRob3V0IHRoZSBmaWxlXG4gKiBleHRlbnNpb24gdG8gYWxsb3cgZWl0aGVyIGEgdHlwZXNjcmlwdCBvciBqYXZhc2NyaXB0IGZpbGUgdG8gYmUgdXNlZC5cbiAqL1xuY29uc3QgQ09ORklHX0ZJTEVfUEFUSCA9ICcubmctZGV2L2NvbmZpZyc7XG5cbi8qKiBUaGUgY29uZmlndXJhdGlvbiBmb3IgbmctZGV2LiAqL1xubGV0IGNhY2hlZENvbmZpZzogTmdEZXZDb25maWd8bnVsbCA9IG51bGw7XG5cbi8qKlxuICogVGhlIGZpbGVuYW1lIGV4cGVjdGVkIGZvciBsb2NhbCB1c2VyIGNvbmZpZywgd2l0aG91dCB0aGUgZmlsZSBleHRlbnNpb24gdG8gYWxsb3cgYSB0eXBlc2NyaXB0LFxuICogamF2YXNjcmlwdCBvciBqc29uIGZpbGUgdG8gYmUgdXNlZC5cbiAqL1xuY29uc3QgVVNFUl9DT05GSUdfRklMRV9QQVRIID0gJy5uZy1kZXYudXNlcic7XG5cbi8qKiBUaGUgbG9jYWwgdXNlciBjb25maWd1cmF0aW9uIGZvciBuZy1kZXYuICovXG5sZXQgdXNlckNvbmZpZzoge1trZXk6IHN0cmluZ106IGFueX18bnVsbCA9IG51bGw7XG5cbi8qKlxuICogR2V0IHRoZSBjb25maWd1cmF0aW9uIGZyb20gdGhlIGZpbGUgc3lzdGVtLCByZXR1cm5pbmcgdGhlIGFscmVhZHkgbG9hZGVkXG4gKiBjb3B5IGlmIGl0IGlzIGRlZmluZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb25maWcoKTogTmdEZXZDb25maWc7XG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29uZmlnKGJhc2VEaXI/OiBzdHJpbmcpOiBOZ0RldkNvbmZpZztcbmV4cG9ydCBmdW5jdGlvbiBnZXRDb25maWcoYmFzZURpcj86IHN0cmluZyk6IE5nRGV2Q29uZmlnIHtcbiAgLy8gSWYgdGhlIGdsb2JhbCBjb25maWcgaXMgbm90IGRlZmluZWQsIGxvYWQgaXQgZnJvbSB0aGUgZmlsZSBzeXN0ZW0uXG4gIGlmIChjYWNoZWRDb25maWcgPT09IG51bGwpIHtcbiAgICBiYXNlRGlyID0gYmFzZURpciB8fCBHaXRDbGllbnQuZ2V0SW5zdGFuY2UoKS5iYXNlRGlyO1xuICAgIC8vIFRoZSBmdWxsIHBhdGggdG8gdGhlIGNvbmZpZ3VyYXRpb24gZmlsZS5cbiAgICBjb25zdCBjb25maWdQYXRoID0gam9pbihiYXNlRGlyLCBDT05GSUdfRklMRV9QQVRIKTtcbiAgICAvLyBSZWFkIHRoZSBjb25maWd1cmF0aW9uIGFuZCB2YWxpZGF0ZSBpdCBiZWZvcmUgY2FjaGluZyBpdCBmb3IgdGhlIGZ1dHVyZS5cbiAgICBjYWNoZWRDb25maWcgPSB2YWxpZGF0ZUNvbW1vbkNvbmZpZyhyZWFkQ29uZmlnRmlsZShjb25maWdQYXRoKSk7XG4gIH1cbiAgLy8gUmV0dXJuIGEgY2xvbmUgb2YgdGhlIGNhY2hlZCBnbG9iYWwgY29uZmlnIHRvIGVuc3VyZSB0aGF0IGEgbmV3IGluc3RhbmNlIG9mIHRoZSBjb25maWdcbiAgLy8gaXMgcmV0dXJuZWQgZWFjaCB0aW1lLCBwcmV2ZW50aW5nIHVuZXhwZWN0ZWQgZWZmZWN0cyBvZiBtb2RpZmljYXRpb25zIHRvIHRoZSBjb25maWcgb2JqZWN0LlxuICByZXR1cm4gey4uLmNhY2hlZENvbmZpZ307XG59XG5cbi8qKiBWYWxpZGF0ZSB0aGUgY29tbW9uIGNvbmZpZ3VyYXRpb24gaGFzIGJlZW4gbWV0IGZvciB0aGUgbmctZGV2IGNvbW1hbmQuICovXG5mdW5jdGlvbiB2YWxpZGF0ZUNvbW1vbkNvbmZpZyhjb25maWc6IFBhcnRpYWw8TmdEZXZDb25maWc+KSB7XG4gIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcbiAgLy8gVmFsaWRhdGUgdGhlIGdpdGh1YiBjb25maWd1cmF0aW9uLlxuICBpZiAoY29uZmlnLmdpdGh1YiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXJyb3JzLnB1c2goYEdpdGh1YiByZXBvc2l0b3J5IG5vdCBjb25maWd1cmVkLiBTZXQgdGhlIFwiZ2l0aHViXCIgb3B0aW9uLmApO1xuICB9IGVsc2Uge1xuICAgIGlmIChjb25maWcuZ2l0aHViLm5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZXJyb3JzLnB1c2goYFwiZ2l0aHViLm5hbWVcIiBpcyBub3QgZGVmaW5lZGApO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmdpdGh1Yi5vd25lciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvcnMucHVzaChgXCJnaXRodWIub3duZXJcIiBpcyBub3QgZGVmaW5lZGApO1xuICAgIH1cbiAgfVxuICBhc3NlcnROb0Vycm9ycyhlcnJvcnMpO1xuICByZXR1cm4gY29uZmlnIGFzIE5nRGV2Q29uZmlnO1xufVxuXG4vKipcbiAqIFJlc29sdmVzIGFuZCByZWFkcyB0aGUgc3BlY2lmaWVkIGNvbmZpZ3VyYXRpb24gZmlsZSwgb3B0aW9uYWxseSByZXR1cm5pbmcgYW4gZW1wdHkgb2JqZWN0IGlmIHRoZVxuICogY29uZmlndXJhdGlvbiBmaWxlIGNhbm5vdCBiZSByZWFkLlxuICovXG5mdW5jdGlvbiByZWFkQ29uZmlnRmlsZShjb25maWdQYXRoOiBzdHJpbmcsIHJldHVybkVtcHR5T2JqZWN0T25FcnJvciA9IGZhbHNlKTogb2JqZWN0IHtcbiAgLy8gSWYgdGhlIGAudHNgIGV4dGVuc2lvbiBoYXMgbm90IGJlZW4gc2V0IHVwIGFscmVhZHksIGFuZCBhIFR5cGVTY3JpcHQgYmFzZWRcbiAgLy8gdmVyc2lvbiBvZiB0aGUgZ2l2ZW4gY29uZmlndXJhdGlvbiBzZWVtcyB0byBleGlzdCwgc2V0IHVwIGB0cy1ub2RlYCBpZiBhdmFpbGFibGUuXG4gIGlmIChyZXF1aXJlLmV4dGVuc2lvbnNbJy50cyddID09PSB1bmRlZmluZWQgJiYgZXhpc3RzU3luYyhgJHtjb25maWdQYXRofS50c2ApICYmXG4gICAgICBpc1RzTm9kZUF2YWlsYWJsZSgpKSB7XG4gICAgLy8gRW5zdXJlIHRoZSBtb2R1bGUgdGFyZ2V0IGlzIHNldCB0byBgY29tbW9uanNgLiBUaGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHRoZVxuICAgIC8vIGRldi1pbmZyYSB0b29sIHJ1bnMgaW4gTm9kZUpTIHdoaWNoIGRvZXMgbm90IHN1cHBvcnQgRVMgbW9kdWxlcyBieSBkZWZhdWx0LlxuICAgIC8vIEFkZGl0aW9uYWxseSwgc2V0IHRoZSBgZGlyYCBvcHRpb24gdG8gdGhlIGRpcmVjdG9yeSB0aGF0IGNvbnRhaW5zIHRoZSBjb25maWd1cmF0aW9uXG4gICAgLy8gZmlsZS4gVGhpcyBhbGxvd3MgZm9yIGN1c3RvbSBjb21waWxlciBvcHRpb25zIChzdWNoIGFzIGAtLXN0cmljdGApLlxuICAgIHJlcXVpcmUoJ3RzLW5vZGUnKS5yZWdpc3RlcihcbiAgICAgICAge2RpcjogZGlybmFtZShjb25maWdQYXRoKSwgdHJhbnNwaWxlT25seTogdHJ1ZSwgY29tcGlsZXJPcHRpb25zOiB7bW9kdWxlOiAnY29tbW9uanMnfX0pO1xuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gcmVxdWlyZShjb25maWdQYXRoKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChyZXR1cm5FbXB0eU9iamVjdE9uRXJyb3IpIHtcbiAgICAgIGRlYnVnKGBDb3VsZCBub3QgcmVhZCBjb25maWd1cmF0aW9uIGZpbGUgYXQgJHtjb25maWdQYXRofSwgcmV0dXJuaW5nIGVtcHR5IG9iamVjdCBpbnN0ZWFkLmApO1xuICAgICAgZGVidWcoZSk7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIGVycm9yKGBDb3VsZCBub3QgcmVhZCBjb25maWd1cmF0aW9uIGZpbGUgYXQgJHtjb25maWdQYXRofS5gKTtcbiAgICBlcnJvcihlKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBc3NlcnRzIHRoZSBwcm92aWRlZCBhcnJheSBvZiBlcnJvciBtZXNzYWdlcyBpcyBlbXB0eS4gSWYgYW55IGVycm9ycyBhcmUgaW4gdGhlIGFycmF5LFxuICogbG9ncyB0aGUgZXJyb3JzIGFuZCBleGl0IHRoZSBwcm9jZXNzIGFzIGEgZmFpbHVyZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydE5vRXJyb3JzKGVycm9yczogc3RyaW5nW10pIHtcbiAgaWYgKGVycm9ycy5sZW5ndGggPT0gMCkge1xuICAgIHJldHVybjtcbiAgfVxuICBlcnJvcihgRXJyb3JzIGRpc2NvdmVyZWQgd2hpbGUgbG9hZGluZyBjb25maWd1cmF0aW9uIGZpbGU6YCk7XG4gIGZvciAoY29uc3QgZXJyIG9mIGVycm9ycykge1xuICAgIGVycm9yKGAgIC0gJHtlcnJ9YCk7XG4gIH1cbiAgcHJvY2Vzcy5leGl0KDEpO1xufVxuXG4vKipcbiAqIEdldCB0aGUgbG9jYWwgdXNlciBjb25maWd1cmF0aW9uIGZyb20gdGhlIGZpbGUgc3lzdGVtLCByZXR1cm5pbmcgdGhlIGFscmVhZHkgbG9hZGVkIGNvcHkgaWYgaXQgaXNcbiAqIGRlZmluZWQuXG4gKlxuICogQHJldHVybnMgVGhlIHVzZXIgY29uZmlndXJhdGlvbiBvYmplY3QsIG9yIGFuIGVtcHR5IG9iamVjdCBpZiBubyB1c2VyIGNvbmZpZ3VyYXRpb24gZmlsZSBpc1xuICogcHJlc2VudC4gVGhlIG9iamVjdCBpcyBhbiB1bnR5cGVkIG9iamVjdCBhcyB0aGVyZSBhcmUgbm8gcmVxdWlyZWQgdXNlciBjb25maWd1cmF0aW9ucy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFVzZXJDb25maWcoKSB7XG4gIC8vIElmIHRoZSBnbG9iYWwgY29uZmlnIGlzIG5vdCBkZWZpbmVkLCBsb2FkIGl0IGZyb20gdGhlIGZpbGUgc3lzdGVtLlxuICBpZiAodXNlckNvbmZpZyA9PT0gbnVsbCkge1xuICAgIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXRJbnN0YW5jZSgpO1xuICAgIC8vIFRoZSBmdWxsIHBhdGggdG8gdGhlIGNvbmZpZ3VyYXRpb24gZmlsZS5cbiAgICBjb25zdCBjb25maWdQYXRoID0gam9pbihnaXQuYmFzZURpciwgVVNFUl9DT05GSUdfRklMRV9QQVRIKTtcbiAgICAvLyBTZXQgdGhlIGdsb2JhbCBjb25maWcgb2JqZWN0LlxuICAgIHVzZXJDb25maWcgPSByZWFkQ29uZmlnRmlsZShjb25maWdQYXRoLCB0cnVlKTtcbiAgfVxuICAvLyBSZXR1cm4gYSBjbG9uZSBvZiB0aGUgdXNlciBjb25maWcgdG8gZW5zdXJlIHRoYXQgYSBuZXcgaW5zdGFuY2Ugb2YgdGhlIGNvbmZpZyBpcyByZXR1cm5lZFxuICAvLyBlYWNoIHRpbWUsIHByZXZlbnRpbmcgdW5leHBlY3RlZCBlZmZlY3RzIG9mIG1vZGlmaWNhdGlvbnMgdG8gdGhlIGNvbmZpZyBvYmplY3QuXG4gIHJldHVybiB7Li4udXNlckNvbmZpZ307XG59XG4iXX0=