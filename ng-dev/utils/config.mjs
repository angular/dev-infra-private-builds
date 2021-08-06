"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserConfig = exports.assertNoErrors = exports.getConfig = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const console_1 = require("./console");
const git_client_1 = require("./git/git-client");
const ts_node_1 = require("./ts-node");
/**
 * The filename expected for creating the ng-dev config, without the file
 * extension to allow either a typescript or javascript file to be used.
 */
const CONFIG_FILE_PATH = '.ng-dev/config';
/** The configuration for ng-dev. */
let cachedConfig = null;
/**
 * The filename expected for local user config, without the file extension to allow a typescript,
 * javascript or json file to be used.
 */
const USER_CONFIG_FILE_PATH = '.ng-dev.user';
/** The local user configuration for ng-dev. */
let userConfig = null;
function getConfig(baseDir) {
    // If the global config is not defined, load it from the file system.
    if (cachedConfig === null) {
        baseDir = baseDir || git_client_1.GitClient.get().baseDir;
        // The full path to the configuration file.
        const configPath = path_1.join(baseDir, CONFIG_FILE_PATH);
        // Read the configuration and validate it before caching it for the future.
        cachedConfig = validateCommonConfig(readConfigFile(configPath));
    }
    // Return a clone of the cached global config to ensure that a new instance of the config
    // is returned each time, preventing unexpected effects of modifications to the config object.
    return { ...cachedConfig };
}
exports.getConfig = getConfig;
/** Validate the common configuration has been met for the ng-dev command. */
function validateCommonConfig(config) {
    const errors = [];
    // Validate the github configuration.
    if (config.github === undefined) {
        errors.push(`Github repository not configured. Set the "github" option.`);
    }
    else {
        if (config.github.name === undefined) {
            errors.push(`"github.name" is not defined`);
        }
        if (config.github.owner === undefined) {
            errors.push(`"github.owner" is not defined`);
        }
    }
    assertNoErrors(errors);
    return config;
}
/**
 * Resolves and reads the specified configuration file, optionally returning an empty object if the
 * configuration file cannot be read.
 */
function readConfigFile(configPath, returnEmptyObjectOnError = false) {
    // If the `.ts` extension has not been set up already, and a TypeScript based
    // version of the given configuration seems to exist, set up `ts-node` if available.
    if (require.extensions['.ts'] === undefined &&
        fs_1.existsSync(`${configPath}.ts`) &&
        ts_node_1.isTsNodeAvailable()) {
        // Ensure the module target is set to `commonjs`. This is necessary because the
        // dev-infra tool runs in NodeJS which does not support ES modules by default.
        // Additionally, set the `dir` option to the directory that contains the configuration
        // file. This allows for custom compiler options (such as `--strict`).
        require('ts-node').register({
            dir: path_1.dirname(configPath),
            transpileOnly: true,
            compilerOptions: { module: 'commonjs' },
        });
    }
    try {
        return require(configPath);
    }
    catch (e) {
        if (returnEmptyObjectOnError) {
            console_1.debug(`Could not read configuration file at ${configPath}, returning empty object instead.`);
            console_1.debug(e);
            return {};
        }
        console_1.error(`Could not read configuration file at ${configPath}.`);
        console_1.error(e);
        process.exit(1);
    }
}
/**
 * Asserts the provided array of error messages is empty. If any errors are in the array,
 * logs the errors and exit the process as a failure.
 */
function assertNoErrors(errors) {
    if (errors.length == 0) {
        return;
    }
    console_1.error(`Errors discovered while loading configuration file:`);
    for (const err of errors) {
        console_1.error(`  - ${err}`);
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
        const git = git_client_1.GitClient.get();
        // The full path to the configuration file.
        const configPath = path_1.join(git.baseDir, USER_CONFIG_FILE_PATH);
        // Set the global config object.
        userConfig = readConfigFile(configPath, true);
    }
    // Return a clone of the user config to ensure that a new instance of the config is returned
    // each time, preventing unexpected effects of modifications to the config object.
    return { ...userConfig };
}
exports.getUserConfig = getUserConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L3V0aWxzL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwyQkFBOEI7QUFDOUIsK0JBQW1DO0FBRW5DLHVDQUF1QztBQUN2QyxpREFBMkM7QUFDM0MsdUNBQTRDO0FBaUM1Qzs7O0dBR0c7QUFDSCxNQUFNLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO0FBRTFDLG9DQUFvQztBQUNwQyxJQUFJLFlBQVksR0FBdUIsSUFBSSxDQUFDO0FBRTVDOzs7R0FHRztBQUNILE1BQU0scUJBQXFCLEdBQUcsY0FBYyxDQUFDO0FBRTdDLCtDQUErQztBQUMvQyxJQUFJLFVBQVUsR0FBZ0MsSUFBSSxDQUFDO0FBUW5ELFNBQWdCLFNBQVMsQ0FBQyxPQUFnQjtJQUN4QyxxRUFBcUU7SUFDckUsSUFBSSxZQUFZLEtBQUssSUFBSSxFQUFFO1FBQ3pCLE9BQU8sR0FBRyxPQUFPLElBQUksc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUM7UUFDN0MsMkNBQTJDO1FBQzNDLE1BQU0sVUFBVSxHQUFHLFdBQUksQ0FBQyxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUNuRCwyRUFBMkU7UUFDM0UsWUFBWSxHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0tBQ2pFO0lBQ0QseUZBQXlGO0lBQ3pGLDhGQUE4RjtJQUM5RixPQUFPLEVBQUMsR0FBRyxZQUFZLEVBQUMsQ0FBQztBQUMzQixDQUFDO0FBWkQsOEJBWUM7QUFFRCw2RUFBNkU7QUFDN0UsU0FBUyxvQkFBb0IsQ0FBQyxNQUE0QjtJQUN4RCxNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7SUFDNUIscUNBQXFDO0lBQ3JDLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7UUFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQyw0REFBNEQsQ0FBQyxDQUFDO0tBQzNFO1NBQU07UUFDTCxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtZQUNwQyxNQUFNLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLENBQUM7U0FDN0M7UUFDRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRTtZQUNyQyxNQUFNLENBQUMsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUM7U0FDOUM7S0FDRjtJQUNELGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2QixPQUFPLE1BQXFCLENBQUM7QUFDL0IsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsY0FBYyxDQUFDLFVBQWtCLEVBQUUsd0JBQXdCLEdBQUcsS0FBSztJQUMxRSw2RUFBNkU7SUFDN0Usb0ZBQW9GO0lBQ3BGLElBQ0UsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxTQUFTO1FBQ3ZDLGVBQVUsQ0FBQyxHQUFHLFVBQVUsS0FBSyxDQUFDO1FBQzlCLDJCQUFpQixFQUFFLEVBQ25CO1FBQ0EsK0VBQStFO1FBQy9FLDhFQUE4RTtRQUM5RSxzRkFBc0Y7UUFDdEYsc0VBQXNFO1FBQ3RFLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLENBQUM7WUFDMUIsR0FBRyxFQUFFLGNBQU8sQ0FBQyxVQUFVLENBQUM7WUFDeEIsYUFBYSxFQUFFLElBQUk7WUFDbkIsZUFBZSxFQUFFLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBQztTQUN0QyxDQUFDLENBQUM7S0FDSjtJQUVELElBQUk7UUFDRixPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUM1QjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsSUFBSSx3QkFBd0IsRUFBRTtZQUM1QixlQUFLLENBQUMsd0NBQXdDLFVBQVUsbUNBQW1DLENBQUMsQ0FBQztZQUM3RixlQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDVCxPQUFPLEVBQUUsQ0FBQztTQUNYO1FBQ0QsZUFBSyxDQUFDLHdDQUF3QyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQzdELGVBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNULE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7QUFDSCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBZ0IsY0FBYyxDQUFDLE1BQWdCO0lBQzdDLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7UUFDdEIsT0FBTztLQUNSO0lBQ0QsZUFBSyxDQUFDLHFEQUFxRCxDQUFDLENBQUM7SUFDN0QsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUU7UUFDeEIsZUFBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsQ0FBQztLQUNyQjtJQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEIsQ0FBQztBQVRELHdDQVNDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsYUFBYTtJQUMzQixxRUFBcUU7SUFDckUsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFO1FBQ3ZCLE1BQU0sR0FBRyxHQUFHLHNCQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUIsMkNBQTJDO1FBQzNDLE1BQU0sVUFBVSxHQUFHLFdBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLHFCQUFxQixDQUFDLENBQUM7UUFDNUQsZ0NBQWdDO1FBQ2hDLFVBQVUsR0FBRyxjQUFjLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQy9DO0lBQ0QsNEZBQTRGO0lBQzVGLGtGQUFrRjtJQUNsRixPQUFPLEVBQUMsR0FBRyxVQUFVLEVBQUMsQ0FBQztBQUN6QixDQUFDO0FBWkQsc0NBWUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtleGlzdHNTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge2Rpcm5hbWUsIGpvaW59IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge2RlYnVnLCBlcnJvcn0gZnJvbSAnLi9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuL2dpdC9naXQtY2xpZW50JztcbmltcG9ydCB7aXNUc05vZGVBdmFpbGFibGV9IGZyb20gJy4vdHMtbm9kZSc7XG5cbi8qKiBDb25maWd1cmF0aW9uIGZvciBHaXQgY2xpZW50IGludGVyYWN0aW9ucy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2l0Q2xpZW50Q29uZmlnIHtcbiAgLyoqIE93bmVyIG5hbWUgb2YgdGhlIHJlcG9zaXRvcnkuICovXG4gIG93bmVyOiBzdHJpbmc7XG4gIC8qKiBOYW1lIG9mIHRoZSByZXBvc2l0b3J5LiAqL1xuICBuYW1lOiBzdHJpbmc7XG4gIC8qKiBNYWluIGJyYW5jaCBuYW1lIGZvciB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgbWFpbkJyYW5jaE5hbWU6IHN0cmluZztcbiAgLyoqIElmIFNTSCBwcm90b2NvbCBzaG91bGQgYmUgdXNlZCBmb3IgZ2l0IGludGVyYWN0aW9ucy4gKi9cbiAgdXNlU3NoPzogYm9vbGVhbjtcbiAgLyoqIFdoZXRoZXIgdGhlIHNwZWNpZmllZCByZXBvc2l0b3J5IGlzIHByaXZhdGUuICovXG4gIHByaXZhdGU/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIERlc2NyaWJlcyB0aGUgR2l0aHViIGNvbmZpZ3VyYXRpb24gZm9yIGRldi1pbmZyYS4gVGhpcyBjb25maWd1cmF0aW9uIGlzXG4gKiB1c2VkIGZvciBBUEkgcmVxdWVzdHMsIGRldGVybWluaW5nIHRoZSB1cHN0cmVhbSByZW1vdGUsIGV0Yy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBHaXRodWJDb25maWcgZXh0ZW5kcyBHaXRDbGllbnRDb25maWcge31cblxuLyoqIFRoZSBjb21tb24gY29uZmlndXJhdGlvbiBmb3IgbmctZGV2LiAqL1xudHlwZSBDb21tb25Db25maWcgPSB7XG4gIGdpdGh1YjogR2l0aHViQ29uZmlnO1xufTtcblxuLyoqXG4gKiBUaGUgY29uZmlndXJhdGlvbiBmb3IgdGhlIHNwZWNpZmljIG5nLWRldiBjb21tYW5kLCBwcm92aWRpbmcgYm90aCB0aGUgY29tbW9uXG4gKiBuZy1kZXYgY29uZmlnIGFzIHdlbGwgYXMgdGhlIHNwZWNpZmljIGNvbmZpZyBvZiBhIHN1YmNvbW1hbmQuXG4gKi9cbmV4cG9ydCB0eXBlIE5nRGV2Q29uZmlnPFQgPSB7fT4gPSBDb21tb25Db25maWcgJiBUO1xuXG4vKipcbiAqIFRoZSBmaWxlbmFtZSBleHBlY3RlZCBmb3IgY3JlYXRpbmcgdGhlIG5nLWRldiBjb25maWcsIHdpdGhvdXQgdGhlIGZpbGVcbiAqIGV4dGVuc2lvbiB0byBhbGxvdyBlaXRoZXIgYSB0eXBlc2NyaXB0IG9yIGphdmFzY3JpcHQgZmlsZSB0byBiZSB1c2VkLlxuICovXG5jb25zdCBDT05GSUdfRklMRV9QQVRIID0gJy5uZy1kZXYvY29uZmlnJztcblxuLyoqIFRoZSBjb25maWd1cmF0aW9uIGZvciBuZy1kZXYuICovXG5sZXQgY2FjaGVkQ29uZmlnOiBOZ0RldkNvbmZpZyB8IG51bGwgPSBudWxsO1xuXG4vKipcbiAqIFRoZSBmaWxlbmFtZSBleHBlY3RlZCBmb3IgbG9jYWwgdXNlciBjb25maWcsIHdpdGhvdXQgdGhlIGZpbGUgZXh0ZW5zaW9uIHRvIGFsbG93IGEgdHlwZXNjcmlwdCxcbiAqIGphdmFzY3JpcHQgb3IganNvbiBmaWxlIHRvIGJlIHVzZWQuXG4gKi9cbmNvbnN0IFVTRVJfQ09ORklHX0ZJTEVfUEFUSCA9ICcubmctZGV2LnVzZXInO1xuXG4vKiogVGhlIGxvY2FsIHVzZXIgY29uZmlndXJhdGlvbiBmb3IgbmctZGV2LiAqL1xubGV0IHVzZXJDb25maWc6IHtba2V5OiBzdHJpbmddOiBhbnl9IHwgbnVsbCA9IG51bGw7XG5cbi8qKlxuICogR2V0IHRoZSBjb25maWd1cmF0aW9uIGZyb20gdGhlIGZpbGUgc3lzdGVtLCByZXR1cm5pbmcgdGhlIGFscmVhZHkgbG9hZGVkXG4gKiBjb3B5IGlmIGl0IGlzIGRlZmluZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb25maWcoKTogTmdEZXZDb25maWc7XG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29uZmlnKGJhc2VEaXI/OiBzdHJpbmcpOiBOZ0RldkNvbmZpZztcbmV4cG9ydCBmdW5jdGlvbiBnZXRDb25maWcoYmFzZURpcj86IHN0cmluZyk6IE5nRGV2Q29uZmlnIHtcbiAgLy8gSWYgdGhlIGdsb2JhbCBjb25maWcgaXMgbm90IGRlZmluZWQsIGxvYWQgaXQgZnJvbSB0aGUgZmlsZSBzeXN0ZW0uXG4gIGlmIChjYWNoZWRDb25maWcgPT09IG51bGwpIHtcbiAgICBiYXNlRGlyID0gYmFzZURpciB8fCBHaXRDbGllbnQuZ2V0KCkuYmFzZURpcjtcbiAgICAvLyBUaGUgZnVsbCBwYXRoIHRvIHRoZSBjb25maWd1cmF0aW9uIGZpbGUuXG4gICAgY29uc3QgY29uZmlnUGF0aCA9IGpvaW4oYmFzZURpciwgQ09ORklHX0ZJTEVfUEFUSCk7XG4gICAgLy8gUmVhZCB0aGUgY29uZmlndXJhdGlvbiBhbmQgdmFsaWRhdGUgaXQgYmVmb3JlIGNhY2hpbmcgaXQgZm9yIHRoZSBmdXR1cmUuXG4gICAgY2FjaGVkQ29uZmlnID0gdmFsaWRhdGVDb21tb25Db25maWcocmVhZENvbmZpZ0ZpbGUoY29uZmlnUGF0aCkpO1xuICB9XG4gIC8vIFJldHVybiBhIGNsb25lIG9mIHRoZSBjYWNoZWQgZ2xvYmFsIGNvbmZpZyB0byBlbnN1cmUgdGhhdCBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgY29uZmlnXG4gIC8vIGlzIHJldHVybmVkIGVhY2ggdGltZSwgcHJldmVudGluZyB1bmV4cGVjdGVkIGVmZmVjdHMgb2YgbW9kaWZpY2F0aW9ucyB0byB0aGUgY29uZmlnIG9iamVjdC5cbiAgcmV0dXJuIHsuLi5jYWNoZWRDb25maWd9O1xufVxuXG4vKiogVmFsaWRhdGUgdGhlIGNvbW1vbiBjb25maWd1cmF0aW9uIGhhcyBiZWVuIG1ldCBmb3IgdGhlIG5nLWRldiBjb21tYW5kLiAqL1xuZnVuY3Rpb24gdmFsaWRhdGVDb21tb25Db25maWcoY29uZmlnOiBQYXJ0aWFsPE5nRGV2Q29uZmlnPikge1xuICBjb25zdCBlcnJvcnM6IHN0cmluZ1tdID0gW107XG4gIC8vIFZhbGlkYXRlIHRoZSBnaXRodWIgY29uZmlndXJhdGlvbi5cbiAgaWYgKGNvbmZpZy5naXRodWIgPT09IHVuZGVmaW5lZCkge1xuICAgIGVycm9ycy5wdXNoKGBHaXRodWIgcmVwb3NpdG9yeSBub3QgY29uZmlndXJlZC4gU2V0IHRoZSBcImdpdGh1YlwiIG9wdGlvbi5gKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoY29uZmlnLmdpdGh1Yi5uYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBcImdpdGh1Yi5uYW1lXCIgaXMgbm90IGRlZmluZWRgKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5naXRodWIub3duZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZXJyb3JzLnB1c2goYFwiZ2l0aHViLm93bmVyXCIgaXMgbm90IGRlZmluZWRgKTtcbiAgICB9XG4gIH1cbiAgYXNzZXJ0Tm9FcnJvcnMoZXJyb3JzKTtcbiAgcmV0dXJuIGNvbmZpZyBhcyBOZ0RldkNvbmZpZztcbn1cblxuLyoqXG4gKiBSZXNvbHZlcyBhbmQgcmVhZHMgdGhlIHNwZWNpZmllZCBjb25maWd1cmF0aW9uIGZpbGUsIG9wdGlvbmFsbHkgcmV0dXJuaW5nIGFuIGVtcHR5IG9iamVjdCBpZiB0aGVcbiAqIGNvbmZpZ3VyYXRpb24gZmlsZSBjYW5ub3QgYmUgcmVhZC5cbiAqL1xuZnVuY3Rpb24gcmVhZENvbmZpZ0ZpbGUoY29uZmlnUGF0aDogc3RyaW5nLCByZXR1cm5FbXB0eU9iamVjdE9uRXJyb3IgPSBmYWxzZSk6IG9iamVjdCB7XG4gIC8vIElmIHRoZSBgLnRzYCBleHRlbnNpb24gaGFzIG5vdCBiZWVuIHNldCB1cCBhbHJlYWR5LCBhbmQgYSBUeXBlU2NyaXB0IGJhc2VkXG4gIC8vIHZlcnNpb24gb2YgdGhlIGdpdmVuIGNvbmZpZ3VyYXRpb24gc2VlbXMgdG8gZXhpc3QsIHNldCB1cCBgdHMtbm9kZWAgaWYgYXZhaWxhYmxlLlxuICBpZiAoXG4gICAgcmVxdWlyZS5leHRlbnNpb25zWycudHMnXSA9PT0gdW5kZWZpbmVkICYmXG4gICAgZXhpc3RzU3luYyhgJHtjb25maWdQYXRofS50c2ApICYmXG4gICAgaXNUc05vZGVBdmFpbGFibGUoKVxuICApIHtcbiAgICAvLyBFbnN1cmUgdGhlIG1vZHVsZSB0YXJnZXQgaXMgc2V0IHRvIGBjb21tb25qc2AuIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2UgdGhlXG4gICAgLy8gZGV2LWluZnJhIHRvb2wgcnVucyBpbiBOb2RlSlMgd2hpY2ggZG9lcyBub3Qgc3VwcG9ydCBFUyBtb2R1bGVzIGJ5IGRlZmF1bHQuXG4gICAgLy8gQWRkaXRpb25hbGx5LCBzZXQgdGhlIGBkaXJgIG9wdGlvbiB0byB0aGUgZGlyZWN0b3J5IHRoYXQgY29udGFpbnMgdGhlIGNvbmZpZ3VyYXRpb25cbiAgICAvLyBmaWxlLiBUaGlzIGFsbG93cyBmb3IgY3VzdG9tIGNvbXBpbGVyIG9wdGlvbnMgKHN1Y2ggYXMgYC0tc3RyaWN0YCkuXG4gICAgcmVxdWlyZSgndHMtbm9kZScpLnJlZ2lzdGVyKHtcbiAgICAgIGRpcjogZGlybmFtZShjb25maWdQYXRoKSxcbiAgICAgIHRyYW5zcGlsZU9ubHk6IHRydWUsXG4gICAgICBjb21waWxlck9wdGlvbnM6IHttb2R1bGU6ICdjb21tb25qcyd9LFxuICAgIH0pO1xuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gcmVxdWlyZShjb25maWdQYXRoKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChyZXR1cm5FbXB0eU9iamVjdE9uRXJyb3IpIHtcbiAgICAgIGRlYnVnKGBDb3VsZCBub3QgcmVhZCBjb25maWd1cmF0aW9uIGZpbGUgYXQgJHtjb25maWdQYXRofSwgcmV0dXJuaW5nIGVtcHR5IG9iamVjdCBpbnN0ZWFkLmApO1xuICAgICAgZGVidWcoZSk7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIGVycm9yKGBDb3VsZCBub3QgcmVhZCBjb25maWd1cmF0aW9uIGZpbGUgYXQgJHtjb25maWdQYXRofS5gKTtcbiAgICBlcnJvcihlKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBc3NlcnRzIHRoZSBwcm92aWRlZCBhcnJheSBvZiBlcnJvciBtZXNzYWdlcyBpcyBlbXB0eS4gSWYgYW55IGVycm9ycyBhcmUgaW4gdGhlIGFycmF5LFxuICogbG9ncyB0aGUgZXJyb3JzIGFuZCBleGl0IHRoZSBwcm9jZXNzIGFzIGEgZmFpbHVyZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydE5vRXJyb3JzKGVycm9yczogc3RyaW5nW10pIHtcbiAgaWYgKGVycm9ycy5sZW5ndGggPT0gMCkge1xuICAgIHJldHVybjtcbiAgfVxuICBlcnJvcihgRXJyb3JzIGRpc2NvdmVyZWQgd2hpbGUgbG9hZGluZyBjb25maWd1cmF0aW9uIGZpbGU6YCk7XG4gIGZvciAoY29uc3QgZXJyIG9mIGVycm9ycykge1xuICAgIGVycm9yKGAgIC0gJHtlcnJ9YCk7XG4gIH1cbiAgcHJvY2Vzcy5leGl0KDEpO1xufVxuXG4vKipcbiAqIEdldCB0aGUgbG9jYWwgdXNlciBjb25maWd1cmF0aW9uIGZyb20gdGhlIGZpbGUgc3lzdGVtLCByZXR1cm5pbmcgdGhlIGFscmVhZHkgbG9hZGVkIGNvcHkgaWYgaXQgaXNcbiAqIGRlZmluZWQuXG4gKlxuICogQHJldHVybnMgVGhlIHVzZXIgY29uZmlndXJhdGlvbiBvYmplY3QsIG9yIGFuIGVtcHR5IG9iamVjdCBpZiBubyB1c2VyIGNvbmZpZ3VyYXRpb24gZmlsZSBpc1xuICogcHJlc2VudC4gVGhlIG9iamVjdCBpcyBhbiB1bnR5cGVkIG9iamVjdCBhcyB0aGVyZSBhcmUgbm8gcmVxdWlyZWQgdXNlciBjb25maWd1cmF0aW9ucy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFVzZXJDb25maWcoKSB7XG4gIC8vIElmIHRoZSBnbG9iYWwgY29uZmlnIGlzIG5vdCBkZWZpbmVkLCBsb2FkIGl0IGZyb20gdGhlIGZpbGUgc3lzdGVtLlxuICBpZiAodXNlckNvbmZpZyA9PT0gbnVsbCkge1xuICAgIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgICAvLyBUaGUgZnVsbCBwYXRoIHRvIHRoZSBjb25maWd1cmF0aW9uIGZpbGUuXG4gICAgY29uc3QgY29uZmlnUGF0aCA9IGpvaW4oZ2l0LmJhc2VEaXIsIFVTRVJfQ09ORklHX0ZJTEVfUEFUSCk7XG4gICAgLy8gU2V0IHRoZSBnbG9iYWwgY29uZmlnIG9iamVjdC5cbiAgICB1c2VyQ29uZmlnID0gcmVhZENvbmZpZ0ZpbGUoY29uZmlnUGF0aCwgdHJ1ZSk7XG4gIH1cbiAgLy8gUmV0dXJuIGEgY2xvbmUgb2YgdGhlIHVzZXIgY29uZmlnIHRvIGVuc3VyZSB0aGF0IGEgbmV3IGluc3RhbmNlIG9mIHRoZSBjb25maWcgaXMgcmV0dXJuZWRcbiAgLy8gZWFjaCB0aW1lLCBwcmV2ZW50aW5nIHVuZXhwZWN0ZWQgZWZmZWN0cyBvZiBtb2RpZmljYXRpb25zIHRvIHRoZSBjb25maWcgb2JqZWN0LlxuICByZXR1cm4gey4uLnVzZXJDb25maWd9O1xufVxuIl19