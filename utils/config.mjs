/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __assign, __values } from "tslib";
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { debug, error } from './console';
import { GitClient } from './git/git-client';
import { isTsNodeAvailable } from './ts-node';
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
export function getConfig(baseDir) {
    // If the global config is not defined, load it from the file system.
    if (cachedConfig === null) {
        baseDir = baseDir || GitClient.get().baseDir;
        // The full path to the configuration file.
        var configPath = join(baseDir, CONFIG_FILE_PATH);
        // Read the configuration and validate it before caching it for the future.
        cachedConfig = validateCommonConfig(readConfigFile(configPath));
    }
    // Return a clone of the cached global config to ensure that a new instance of the config
    // is returned each time, preventing unexpected effects of modifications to the config object.
    return __assign({}, cachedConfig);
}
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
    if (require.extensions['.ts'] === undefined && existsSync(configPath + ".ts") &&
        isTsNodeAvailable()) {
        // Ensure the module target is set to `commonjs`. This is necessary because the
        // dev-infra tool runs in NodeJS which does not support ES modules by default.
        // Additionally, set the `dir` option to the directory that contains the configuration
        // file. This allows for custom compiler options (such as `--strict`).
        require('ts-node').register({ dir: dirname(configPath), transpileOnly: true, compilerOptions: { module: 'commonjs' } });
    }
    try {
        return require(configPath);
    }
    catch (e) {
        if (returnEmptyObjectOnError) {
            debug("Could not read configuration file at " + configPath + ", returning empty object instead.");
            debug(e);
            return {};
        }
        error("Could not read configuration file at " + configPath + ".");
        error(e);
        process.exit(1);
    }
}
/**
 * Asserts the provided array of error messages is empty. If any errors are in the array,
 * logs the errors and exit the process as a failure.
 */
export function assertNoErrors(errors) {
    var e_1, _a;
    if (errors.length == 0) {
        return;
    }
    error("Errors discovered while loading configuration file:");
    try {
        for (var errors_1 = __values(errors), errors_1_1 = errors_1.next(); !errors_1_1.done; errors_1_1 = errors_1.next()) {
            var err = errors_1_1.value;
            error("  - " + err);
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
/**
 * Get the local user configuration from the file system, returning the already loaded copy if it is
 * defined.
 *
 * @returns The user configuration object, or an empty object if no user configuration file is
 * present. The object is an untyped object as there are no required user configurations.
 */
export function getUserConfig() {
    // If the global config is not defined, load it from the file system.
    if (userConfig === null) {
        var git = GitClient.get();
        // The full path to the configuration file.
        var configPath = join(git.baseDir, USER_CONFIG_FILE_PATH);
        // Set the global config object.
        userConfig = readConfigFile(configPath, true);
    }
    // Return a clone of the user config to ensure that a new instance of the config is returned
    // each time, preventing unexpected effects of modifications to the config object.
    return __assign({}, userConfig);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLElBQUksQ0FBQztBQUM5QixPQUFPLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUVuQyxPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUN2QyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDM0MsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sV0FBVyxDQUFDO0FBK0I1Qzs7O0dBR0c7QUFDSCxJQUFNLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO0FBRTFDLG9DQUFvQztBQUNwQyxJQUFJLFlBQVksR0FBcUIsSUFBSSxDQUFDO0FBRTFDOzs7R0FHRztBQUNILElBQU0scUJBQXFCLEdBQUcsY0FBYyxDQUFDO0FBRTdDLCtDQUErQztBQUMvQyxJQUFJLFVBQVUsR0FBOEIsSUFBSSxDQUFDO0FBUWpELE1BQU0sVUFBVSxTQUFTLENBQUMsT0FBZ0I7SUFDeEMscUVBQXFFO0lBQ3JFLElBQUksWUFBWSxLQUFLLElBQUksRUFBRTtRQUN6QixPQUFPLEdBQUcsT0FBTyxJQUFJLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUM7UUFDN0MsMkNBQTJDO1FBQzNDLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUNuRCwyRUFBMkU7UUFDM0UsWUFBWSxHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0tBQ2pFO0lBQ0QseUZBQXlGO0lBQ3pGLDhGQUE4RjtJQUM5RixvQkFBVyxZQUFZLEVBQUU7QUFDM0IsQ0FBQztBQUVELDZFQUE2RTtBQUM3RSxTQUFTLG9CQUFvQixDQUFDLE1BQTRCO0lBQ3hELElBQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztJQUM1QixxQ0FBcUM7SUFDckMsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTtRQUMvQixNQUFNLENBQUMsSUFBSSxDQUFDLDhEQUE0RCxDQUFDLENBQUM7S0FDM0U7U0FBTTtRQUNMLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO1lBQ3BDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0NBQThCLENBQUMsQ0FBQztTQUM3QztRQUNELElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFO1lBQ3JDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUNBQStCLENBQUMsQ0FBQztTQUM5QztLQUNGO0lBQ0QsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3ZCLE9BQU8sTUFBcUIsQ0FBQztBQUMvQixDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxjQUFjLENBQUMsVUFBa0IsRUFBRSx3QkFBZ0M7SUFBaEMseUNBQUEsRUFBQSxnQ0FBZ0M7SUFDMUUsNkVBQTZFO0lBQzdFLG9GQUFvRjtJQUNwRixJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssU0FBUyxJQUFJLFVBQVUsQ0FBSSxVQUFVLFFBQUssQ0FBQztRQUN6RSxpQkFBaUIsRUFBRSxFQUFFO1FBQ3ZCLCtFQUErRTtRQUMvRSw4RUFBOEU7UUFDOUUsc0ZBQXNGO1FBQ3RGLHNFQUFzRTtRQUN0RSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxDQUN2QixFQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFDLEVBQUMsQ0FBQyxDQUFDO0tBQzdGO0lBRUQsSUFBSTtRQUNGLE9BQU8sT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQzVCO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixJQUFJLHdCQUF3QixFQUFFO1lBQzVCLEtBQUssQ0FBQywwQ0FBd0MsVUFBVSxzQ0FBbUMsQ0FBQyxDQUFDO1lBQzdGLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNULE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFDRCxLQUFLLENBQUMsMENBQXdDLFVBQVUsTUFBRyxDQUFDLENBQUM7UUFDN0QsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtBQUNILENBQUM7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsY0FBYyxDQUFDLE1BQWdCOztJQUM3QyxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1FBQ3RCLE9BQU87S0FDUjtJQUNELEtBQUssQ0FBQyxxREFBcUQsQ0FBQyxDQUFDOztRQUM3RCxLQUFrQixJQUFBLFdBQUEsU0FBQSxNQUFNLENBQUEsOEJBQUEsa0RBQUU7WUFBckIsSUFBTSxHQUFHLG1CQUFBO1lBQ1osS0FBSyxDQUFDLFNBQU8sR0FBSyxDQUFDLENBQUM7U0FDckI7Ozs7Ozs7OztJQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEIsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUNILE1BQU0sVUFBVSxhQUFhO0lBQzNCLHFFQUFxRTtJQUNyRSxJQUFJLFVBQVUsS0FBSyxJQUFJLEVBQUU7UUFDdkIsSUFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVCLDJDQUEyQztRQUMzQyxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1FBQzVELGdDQUFnQztRQUNoQyxVQUFVLEdBQUcsY0FBYyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUMvQztJQUNELDRGQUE0RjtJQUM1RixrRkFBa0Y7SUFDbEYsb0JBQVcsVUFBVSxFQUFFO0FBQ3pCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtleGlzdHNTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge2Rpcm5hbWUsIGpvaW59IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge2RlYnVnLCBlcnJvcn0gZnJvbSAnLi9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuL2dpdC9naXQtY2xpZW50JztcbmltcG9ydCB7aXNUc05vZGVBdmFpbGFibGV9IGZyb20gJy4vdHMtbm9kZSc7XG5cbi8qKiBDb25maWd1cmF0aW9uIGZvciBHaXQgY2xpZW50IGludGVyYWN0aW9ucy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2l0Q2xpZW50Q29uZmlnIHtcbiAgLyoqIE93bmVyIG5hbWUgb2YgdGhlIHJlcG9zaXRvcnkuICovXG4gIG93bmVyOiBzdHJpbmc7XG4gIC8qKiBOYW1lIG9mIHRoZSByZXBvc2l0b3J5LiAqL1xuICBuYW1lOiBzdHJpbmc7XG4gIC8qKiBJZiBTU0ggcHJvdG9jb2wgc2hvdWxkIGJlIHVzZWQgZm9yIGdpdCBpbnRlcmFjdGlvbnMuICovXG4gIHVzZVNzaD86IGJvb2xlYW47XG4gIC8qKiBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgcmVwb3NpdG9yeSBpcyBwcml2YXRlLiAqL1xuICBwcml2YXRlPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBEZXNjcmliZXMgdGhlIEdpdGh1YiBjb25maWd1cmF0aW9uIGZvciBkZXYtaW5mcmEuIFRoaXMgY29uZmlndXJhdGlvbiBpc1xuICogdXNlZCBmb3IgQVBJIHJlcXVlc3RzLCBkZXRlcm1pbmluZyB0aGUgdXBzdHJlYW0gcmVtb3RlLCBldGMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2l0aHViQ29uZmlnIGV4dGVuZHMgR2l0Q2xpZW50Q29uZmlnIHt9XG5cbi8qKiBUaGUgY29tbW9uIGNvbmZpZ3VyYXRpb24gZm9yIG5nLWRldi4gKi9cbnR5cGUgQ29tbW9uQ29uZmlnID0ge1xuICBnaXRodWI6IEdpdGh1YkNvbmZpZ1xufTtcblxuLyoqXG4gKiBUaGUgY29uZmlndXJhdGlvbiBmb3IgdGhlIHNwZWNpZmljIG5nLWRldiBjb21tYW5kLCBwcm92aWRpbmcgYm90aCB0aGUgY29tbW9uXG4gKiBuZy1kZXYgY29uZmlnIGFzIHdlbGwgYXMgdGhlIHNwZWNpZmljIGNvbmZpZyBvZiBhIHN1YmNvbW1hbmQuXG4gKi9cbmV4cG9ydCB0eXBlIE5nRGV2Q29uZmlnPFQgPSB7fT4gPSBDb21tb25Db25maWcmVDtcblxuLyoqXG4gKiBUaGUgZmlsZW5hbWUgZXhwZWN0ZWQgZm9yIGNyZWF0aW5nIHRoZSBuZy1kZXYgY29uZmlnLCB3aXRob3V0IHRoZSBmaWxlXG4gKiBleHRlbnNpb24gdG8gYWxsb3cgZWl0aGVyIGEgdHlwZXNjcmlwdCBvciBqYXZhc2NyaXB0IGZpbGUgdG8gYmUgdXNlZC5cbiAqL1xuY29uc3QgQ09ORklHX0ZJTEVfUEFUSCA9ICcubmctZGV2L2NvbmZpZyc7XG5cbi8qKiBUaGUgY29uZmlndXJhdGlvbiBmb3IgbmctZGV2LiAqL1xubGV0IGNhY2hlZENvbmZpZzogTmdEZXZDb25maWd8bnVsbCA9IG51bGw7XG5cbi8qKlxuICogVGhlIGZpbGVuYW1lIGV4cGVjdGVkIGZvciBsb2NhbCB1c2VyIGNvbmZpZywgd2l0aG91dCB0aGUgZmlsZSBleHRlbnNpb24gdG8gYWxsb3cgYSB0eXBlc2NyaXB0LFxuICogamF2YXNjcmlwdCBvciBqc29uIGZpbGUgdG8gYmUgdXNlZC5cbiAqL1xuY29uc3QgVVNFUl9DT05GSUdfRklMRV9QQVRIID0gJy5uZy1kZXYudXNlcic7XG5cbi8qKiBUaGUgbG9jYWwgdXNlciBjb25maWd1cmF0aW9uIGZvciBuZy1kZXYuICovXG5sZXQgdXNlckNvbmZpZzoge1trZXk6IHN0cmluZ106IGFueX18bnVsbCA9IG51bGw7XG5cbi8qKlxuICogR2V0IHRoZSBjb25maWd1cmF0aW9uIGZyb20gdGhlIGZpbGUgc3lzdGVtLCByZXR1cm5pbmcgdGhlIGFscmVhZHkgbG9hZGVkXG4gKiBjb3B5IGlmIGl0IGlzIGRlZmluZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb25maWcoKTogTmdEZXZDb25maWc7XG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29uZmlnKGJhc2VEaXI/OiBzdHJpbmcpOiBOZ0RldkNvbmZpZztcbmV4cG9ydCBmdW5jdGlvbiBnZXRDb25maWcoYmFzZURpcj86IHN0cmluZyk6IE5nRGV2Q29uZmlnIHtcbiAgLy8gSWYgdGhlIGdsb2JhbCBjb25maWcgaXMgbm90IGRlZmluZWQsIGxvYWQgaXQgZnJvbSB0aGUgZmlsZSBzeXN0ZW0uXG4gIGlmIChjYWNoZWRDb25maWcgPT09IG51bGwpIHtcbiAgICBiYXNlRGlyID0gYmFzZURpciB8fCBHaXRDbGllbnQuZ2V0KCkuYmFzZURpcjtcbiAgICAvLyBUaGUgZnVsbCBwYXRoIHRvIHRoZSBjb25maWd1cmF0aW9uIGZpbGUuXG4gICAgY29uc3QgY29uZmlnUGF0aCA9IGpvaW4oYmFzZURpciwgQ09ORklHX0ZJTEVfUEFUSCk7XG4gICAgLy8gUmVhZCB0aGUgY29uZmlndXJhdGlvbiBhbmQgdmFsaWRhdGUgaXQgYmVmb3JlIGNhY2hpbmcgaXQgZm9yIHRoZSBmdXR1cmUuXG4gICAgY2FjaGVkQ29uZmlnID0gdmFsaWRhdGVDb21tb25Db25maWcocmVhZENvbmZpZ0ZpbGUoY29uZmlnUGF0aCkpO1xuICB9XG4gIC8vIFJldHVybiBhIGNsb25lIG9mIHRoZSBjYWNoZWQgZ2xvYmFsIGNvbmZpZyB0byBlbnN1cmUgdGhhdCBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgY29uZmlnXG4gIC8vIGlzIHJldHVybmVkIGVhY2ggdGltZSwgcHJldmVudGluZyB1bmV4cGVjdGVkIGVmZmVjdHMgb2YgbW9kaWZpY2F0aW9ucyB0byB0aGUgY29uZmlnIG9iamVjdC5cbiAgcmV0dXJuIHsuLi5jYWNoZWRDb25maWd9O1xufVxuXG4vKiogVmFsaWRhdGUgdGhlIGNvbW1vbiBjb25maWd1cmF0aW9uIGhhcyBiZWVuIG1ldCBmb3IgdGhlIG5nLWRldiBjb21tYW5kLiAqL1xuZnVuY3Rpb24gdmFsaWRhdGVDb21tb25Db25maWcoY29uZmlnOiBQYXJ0aWFsPE5nRGV2Q29uZmlnPikge1xuICBjb25zdCBlcnJvcnM6IHN0cmluZ1tdID0gW107XG4gIC8vIFZhbGlkYXRlIHRoZSBnaXRodWIgY29uZmlndXJhdGlvbi5cbiAgaWYgKGNvbmZpZy5naXRodWIgPT09IHVuZGVmaW5lZCkge1xuICAgIGVycm9ycy5wdXNoKGBHaXRodWIgcmVwb3NpdG9yeSBub3QgY29uZmlndXJlZC4gU2V0IHRoZSBcImdpdGh1YlwiIG9wdGlvbi5gKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoY29uZmlnLmdpdGh1Yi5uYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBcImdpdGh1Yi5uYW1lXCIgaXMgbm90IGRlZmluZWRgKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5naXRodWIub3duZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZXJyb3JzLnB1c2goYFwiZ2l0aHViLm93bmVyXCIgaXMgbm90IGRlZmluZWRgKTtcbiAgICB9XG4gIH1cbiAgYXNzZXJ0Tm9FcnJvcnMoZXJyb3JzKTtcbiAgcmV0dXJuIGNvbmZpZyBhcyBOZ0RldkNvbmZpZztcbn1cblxuLyoqXG4gKiBSZXNvbHZlcyBhbmQgcmVhZHMgdGhlIHNwZWNpZmllZCBjb25maWd1cmF0aW9uIGZpbGUsIG9wdGlvbmFsbHkgcmV0dXJuaW5nIGFuIGVtcHR5IG9iamVjdCBpZiB0aGVcbiAqIGNvbmZpZ3VyYXRpb24gZmlsZSBjYW5ub3QgYmUgcmVhZC5cbiAqL1xuZnVuY3Rpb24gcmVhZENvbmZpZ0ZpbGUoY29uZmlnUGF0aDogc3RyaW5nLCByZXR1cm5FbXB0eU9iamVjdE9uRXJyb3IgPSBmYWxzZSk6IG9iamVjdCB7XG4gIC8vIElmIHRoZSBgLnRzYCBleHRlbnNpb24gaGFzIG5vdCBiZWVuIHNldCB1cCBhbHJlYWR5LCBhbmQgYSBUeXBlU2NyaXB0IGJhc2VkXG4gIC8vIHZlcnNpb24gb2YgdGhlIGdpdmVuIGNvbmZpZ3VyYXRpb24gc2VlbXMgdG8gZXhpc3QsIHNldCB1cCBgdHMtbm9kZWAgaWYgYXZhaWxhYmxlLlxuICBpZiAocmVxdWlyZS5leHRlbnNpb25zWycudHMnXSA9PT0gdW5kZWZpbmVkICYmIGV4aXN0c1N5bmMoYCR7Y29uZmlnUGF0aH0udHNgKSAmJlxuICAgICAgaXNUc05vZGVBdmFpbGFibGUoKSkge1xuICAgIC8vIEVuc3VyZSB0aGUgbW9kdWxlIHRhcmdldCBpcyBzZXQgdG8gYGNvbW1vbmpzYC4gVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSB0aGVcbiAgICAvLyBkZXYtaW5mcmEgdG9vbCBydW5zIGluIE5vZGVKUyB3aGljaCBkb2VzIG5vdCBzdXBwb3J0IEVTIG1vZHVsZXMgYnkgZGVmYXVsdC5cbiAgICAvLyBBZGRpdGlvbmFsbHksIHNldCB0aGUgYGRpcmAgb3B0aW9uIHRvIHRoZSBkaXJlY3RvcnkgdGhhdCBjb250YWlucyB0aGUgY29uZmlndXJhdGlvblxuICAgIC8vIGZpbGUuIFRoaXMgYWxsb3dzIGZvciBjdXN0b20gY29tcGlsZXIgb3B0aW9ucyAoc3VjaCBhcyBgLS1zdHJpY3RgKS5cbiAgICByZXF1aXJlKCd0cy1ub2RlJykucmVnaXN0ZXIoXG4gICAgICAgIHtkaXI6IGRpcm5hbWUoY29uZmlnUGF0aCksIHRyYW5zcGlsZU9ubHk6IHRydWUsIGNvbXBpbGVyT3B0aW9uczoge21vZHVsZTogJ2NvbW1vbmpzJ319KTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIHJlcXVpcmUoY29uZmlnUGF0aCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAocmV0dXJuRW1wdHlPYmplY3RPbkVycm9yKSB7XG4gICAgICBkZWJ1ZyhgQ291bGQgbm90IHJlYWQgY29uZmlndXJhdGlvbiBmaWxlIGF0ICR7Y29uZmlnUGF0aH0sIHJldHVybmluZyBlbXB0eSBvYmplY3QgaW5zdGVhZC5gKTtcbiAgICAgIGRlYnVnKGUpO1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICBlcnJvcihgQ291bGQgbm90IHJlYWQgY29uZmlndXJhdGlvbiBmaWxlIGF0ICR7Y29uZmlnUGF0aH0uYCk7XG4gICAgZXJyb3IoZSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG59XG5cbi8qKlxuICogQXNzZXJ0cyB0aGUgcHJvdmlkZWQgYXJyYXkgb2YgZXJyb3IgbWVzc2FnZXMgaXMgZW1wdHkuIElmIGFueSBlcnJvcnMgYXJlIGluIHRoZSBhcnJheSxcbiAqIGxvZ3MgdGhlIGVycm9ycyBhbmQgZXhpdCB0aGUgcHJvY2VzcyBhcyBhIGZhaWx1cmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnROb0Vycm9ycyhlcnJvcnM6IHN0cmluZ1tdKSB7XG4gIGlmIChlcnJvcnMubGVuZ3RoID09IDApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgZXJyb3IoYEVycm9ycyBkaXNjb3ZlcmVkIHdoaWxlIGxvYWRpbmcgY29uZmlndXJhdGlvbiBmaWxlOmApO1xuICBmb3IgKGNvbnN0IGVyciBvZiBlcnJvcnMpIHtcbiAgICBlcnJvcihgICAtICR7ZXJyfWApO1xuICB9XG4gIHByb2Nlc3MuZXhpdCgxKTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGxvY2FsIHVzZXIgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBmaWxlIHN5c3RlbSwgcmV0dXJuaW5nIHRoZSBhbHJlYWR5IGxvYWRlZCBjb3B5IGlmIGl0IGlzXG4gKiBkZWZpbmVkLlxuICpcbiAqIEByZXR1cm5zIFRoZSB1c2VyIGNvbmZpZ3VyYXRpb24gb2JqZWN0LCBvciBhbiBlbXB0eSBvYmplY3QgaWYgbm8gdXNlciBjb25maWd1cmF0aW9uIGZpbGUgaXNcbiAqIHByZXNlbnQuIFRoZSBvYmplY3QgaXMgYW4gdW50eXBlZCBvYmplY3QgYXMgdGhlcmUgYXJlIG5vIHJlcXVpcmVkIHVzZXIgY29uZmlndXJhdGlvbnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRVc2VyQ29uZmlnKCkge1xuICAvLyBJZiB0aGUgZ2xvYmFsIGNvbmZpZyBpcyBub3QgZGVmaW5lZCwgbG9hZCBpdCBmcm9tIHRoZSBmaWxlIHN5c3RlbS5cbiAgaWYgKHVzZXJDb25maWcgPT09IG51bGwpIHtcbiAgICBjb25zdCBnaXQgPSBHaXRDbGllbnQuZ2V0KCk7XG4gICAgLy8gVGhlIGZ1bGwgcGF0aCB0byB0aGUgY29uZmlndXJhdGlvbiBmaWxlLlxuICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBqb2luKGdpdC5iYXNlRGlyLCBVU0VSX0NPTkZJR19GSUxFX1BBVEgpO1xuICAgIC8vIFNldCB0aGUgZ2xvYmFsIGNvbmZpZyBvYmplY3QuXG4gICAgdXNlckNvbmZpZyA9IHJlYWRDb25maWdGaWxlKGNvbmZpZ1BhdGgsIHRydWUpO1xuICB9XG4gIC8vIFJldHVybiBhIGNsb25lIG9mIHRoZSB1c2VyIGNvbmZpZyB0byBlbnN1cmUgdGhhdCBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgY29uZmlnIGlzIHJldHVybmVkXG4gIC8vIGVhY2ggdGltZSwgcHJldmVudGluZyB1bmV4cGVjdGVkIGVmZmVjdHMgb2YgbW9kaWZpY2F0aW9ucyB0byB0aGUgY29uZmlnIG9iamVjdC5cbiAgcmV0dXJuIHsuLi51c2VyQ29uZmlnfTtcbn1cbiJdfQ==