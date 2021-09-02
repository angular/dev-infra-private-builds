"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertValidGithubConfig = exports.ConfigValidationError = exports.getUserConfig = exports.getConfig = exports.setConfig = void 0;
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
/**
 * Set the cached configuration object to be loaded later. Only to be used on CI situations in
 * which loading from the `.ng-dev/` directory is not possible.
 */
function setConfig(config) {
    cachedConfig = config;
}
exports.setConfig = setConfig;
function getConfig(baseDir) {
    // If the global config is not defined, load it from the file system.
    if (cachedConfig === null) {
        baseDir = baseDir || git_client_1.GitClient.get().baseDir;
        // The full path to the configuration file.
        const configPath = (0, path_1.join)(baseDir, CONFIG_FILE_PATH);
        // Read the configuration and validate it before caching it for the future.
        cachedConfig = readConfigFile(configPath);
    }
    // Return a clone of the cached global config to ensure that a new instance of the config
    // is returned each time, preventing unexpected effects of modifications to the config object.
    return { ...cachedConfig };
}
exports.getConfig = getConfig;
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
        const configPath = (0, path_1.join)(git.baseDir, USER_CONFIG_FILE_PATH);
        // Set the global config object.
        userConfig = readConfigFile(configPath, true);
    }
    // Return a clone of the user config to ensure that a new instance of the config is returned
    // each time, preventing unexpected effects of modifications to the config object.
    return { ...userConfig };
}
exports.getUserConfig = getUserConfig;
/** A standard error class to thrown during assertions while validating configuration. */
class ConfigValidationError extends Error {
    constructor(message, errors = []) {
        super(message);
        this.errors = errors;
    }
}
exports.ConfigValidationError = ConfigValidationError;
/** Validate th configuration has been met for the ng-dev command. */
function assertValidGithubConfig(config) {
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
    if (errors.length) {
        throw new ConfigValidationError('Invalid `github` configuration', errors);
    }
}
exports.assertValidGithubConfig = assertValidGithubConfig;
/**
 * Resolves and reads the specified configuration file, optionally returning an empty object if the
 * configuration file cannot be read.
 */
function readConfigFile(configPath, returnEmptyObjectOnError = false) {
    // If the `.ts` extension has not been set up already, and a TypeScript based
    // version of the given configuration seems to exist, set up `ts-node` if available.
    if (require.extensions['.ts'] === undefined &&
        (0, fs_1.existsSync)(`${configPath}.ts`) &&
        (0, ts_node_1.isTsNodeAvailable)()) {
        // Ensure the module target is set to `commonjs`. This is necessary because the
        // dev-infra tool runs in NodeJS which does not support ES modules by default.
        // Additionally, set the `dir` option to the directory that contains the configuration
        // file. This allows for custom compiler options (such as `--strict`).
        require('ts-node').register({
            dir: (0, path_1.dirname)(configPath),
            transpileOnly: true,
            compilerOptions: { module: 'commonjs' },
        });
    }
    try {
        return require(configPath);
    }
    catch (e) {
        if (returnEmptyObjectOnError) {
            (0, console_1.debug)(`Could not read configuration file at ${configPath}, returning empty object instead.`);
            (0, console_1.debug)(e);
            return {};
        }
        (0, console_1.error)(`Could not read configuration file at ${configPath}.`);
        (0, console_1.error)(e);
        process.exit(1);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L3V0aWxzL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwyQkFBOEI7QUFDOUIsK0JBQW1DO0FBRW5DLHVDQUF1QztBQUN2QyxpREFBMkM7QUFDM0MsdUNBQTRDO0FBbUI1Qzs7O0dBR0c7QUFDSCxNQUFNLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO0FBRTFDLG9DQUFvQztBQUNwQyxJQUFJLFlBQVksR0FBYyxJQUFJLENBQUM7QUFFbkM7OztHQUdHO0FBQ0gsTUFBTSxxQkFBcUIsR0FBRyxjQUFjLENBQUM7QUFFN0MsK0NBQStDO0FBQy9DLElBQUksVUFBVSxHQUFnQyxJQUFJLENBQUM7QUFFbkQ7OztHQUdHO0FBQ0gsU0FBZ0IsU0FBUyxDQUFDLE1BQVU7SUFDbEMsWUFBWSxHQUFHLE1BQU0sQ0FBQztBQUN4QixDQUFDO0FBRkQsOEJBRUM7QUFRRCxTQUFnQixTQUFTLENBQUMsT0FBZ0I7SUFDeEMscUVBQXFFO0lBQ3JFLElBQUksWUFBWSxLQUFLLElBQUksRUFBRTtRQUN6QixPQUFPLEdBQUcsT0FBTyxJQUFJLHNCQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDO1FBQzdDLDJDQUEyQztRQUMzQyxNQUFNLFVBQVUsR0FBRyxJQUFBLFdBQUksRUFBQyxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUNuRCwyRUFBMkU7UUFDM0UsWUFBWSxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUMzQztJQUNELHlGQUF5RjtJQUN6Riw4RkFBOEY7SUFDOUYsT0FBTyxFQUFDLEdBQUcsWUFBWSxFQUFDLENBQUM7QUFDM0IsQ0FBQztBQVpELDhCQVlDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsYUFBYTtJQUMzQixxRUFBcUU7SUFDckUsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFO1FBQ3ZCLE1BQU0sR0FBRyxHQUFHLHNCQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUIsMkNBQTJDO1FBQzNDLE1BQU0sVUFBVSxHQUFHLElBQUEsV0FBSSxFQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUscUJBQXFCLENBQUMsQ0FBQztRQUM1RCxnQ0FBZ0M7UUFDaEMsVUFBVSxHQUFHLGNBQWMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDL0M7SUFDRCw0RkFBNEY7SUFDNUYsa0ZBQWtGO0lBQ2xGLE9BQU8sRUFBQyxHQUFHLFVBQVUsRUFBQyxDQUFDO0FBQ3pCLENBQUM7QUFaRCxzQ0FZQztBQUVELHlGQUF5RjtBQUN6RixNQUFhLHFCQUFzQixTQUFRLEtBQUs7SUFDOUMsWUFBWSxPQUFnQixFQUFrQixTQUFtQixFQUFFO1FBQ2pFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUQ2QixXQUFNLEdBQU4sTUFBTSxDQUFlO0lBRW5FLENBQUM7Q0FDRjtBQUpELHNEQUlDO0FBRUQscUVBQXFFO0FBQ3JFLFNBQWdCLHVCQUF1QixDQUNyQyxNQUEyQztJQUUzQyxNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7SUFDNUIscUNBQXFDO0lBQ3JDLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7UUFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQyw0REFBNEQsQ0FBQyxDQUFDO0tBQzNFO1NBQU07UUFDTCxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtZQUNwQyxNQUFNLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLENBQUM7U0FDN0M7UUFDRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRTtZQUNyQyxNQUFNLENBQUMsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUM7U0FDOUM7S0FDRjtJQUNELElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTtRQUNqQixNQUFNLElBQUkscUJBQXFCLENBQUMsZ0NBQWdDLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDM0U7QUFDSCxDQUFDO0FBbEJELDBEQWtCQztBQUVEOzs7R0FHRztBQUNILFNBQVMsY0FBYyxDQUFDLFVBQWtCLEVBQUUsd0JBQXdCLEdBQUcsS0FBSztJQUMxRSw2RUFBNkU7SUFDN0Usb0ZBQW9GO0lBQ3BGLElBQ0UsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxTQUFTO1FBQ3ZDLElBQUEsZUFBVSxFQUFDLEdBQUcsVUFBVSxLQUFLLENBQUM7UUFDOUIsSUFBQSwyQkFBaUIsR0FBRSxFQUNuQjtRQUNBLCtFQUErRTtRQUMvRSw4RUFBOEU7UUFDOUUsc0ZBQXNGO1FBQ3RGLHNFQUFzRTtRQUN0RSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxDQUFDO1lBQzFCLEdBQUcsRUFBRSxJQUFBLGNBQU8sRUFBQyxVQUFVLENBQUM7WUFDeEIsYUFBYSxFQUFFLElBQUk7WUFDbkIsZUFBZSxFQUFFLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBQztTQUN0QyxDQUFDLENBQUM7S0FDSjtJQUVELElBQUk7UUFDRixPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUM1QjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsSUFBSSx3QkFBd0IsRUFBRTtZQUM1QixJQUFBLGVBQUssRUFBQyx3Q0FBd0MsVUFBVSxtQ0FBbUMsQ0FBQyxDQUFDO1lBQzdGLElBQUEsZUFBSyxFQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1QsT0FBTyxFQUFFLENBQUM7U0FDWDtRQUNELElBQUEsZUFBSyxFQUFDLHdDQUF3QyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQzdELElBQUEsZUFBSyxFQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtleGlzdHNTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge2Rpcm5hbWUsIGpvaW59IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge2RlYnVnLCBlcnJvcn0gZnJvbSAnLi9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuL2dpdC9naXQtY2xpZW50JztcbmltcG9ydCB7aXNUc05vZGVBdmFpbGFibGV9IGZyb20gJy4vdHMtbm9kZSc7XG5cbi8qKlxuICogRGVzY3JpYmVzIHRoZSBHaXRodWIgY29uZmlndXJhdGlvbiBmb3IgZGV2LWluZnJhLiBUaGlzIGNvbmZpZ3VyYXRpb24gaXNcbiAqIHVzZWQgZm9yIEFQSSByZXF1ZXN0cywgZGV0ZXJtaW5pbmcgdGhlIHVwc3RyZWFtIHJlbW90ZSwgZXRjLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEdpdGh1YkNvbmZpZyB7XG4gIC8qKiBPd25lciBuYW1lIG9mIHRoZSByZXBvc2l0b3J5LiAqL1xuICBvd25lcjogc3RyaW5nO1xuICAvKiogTmFtZSBvZiB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgbmFtZTogc3RyaW5nO1xuICAvKiogTWFpbiBicmFuY2ggbmFtZSBmb3IgdGhlIHJlcG9zaXRvcnkuICovXG4gIG1haW5CcmFuY2hOYW1lOiBzdHJpbmc7XG4gIC8qKiBJZiBTU0ggcHJvdG9jb2wgc2hvdWxkIGJlIHVzZWQgZm9yIGdpdCBpbnRlcmFjdGlvbnMuICovXG4gIHVzZVNzaD86IGJvb2xlYW47XG4gIC8qKiBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgcmVwb3NpdG9yeSBpcyBwcml2YXRlLiAqL1xuICBwcml2YXRlPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBUaGUgZmlsZW5hbWUgZXhwZWN0ZWQgZm9yIGNyZWF0aW5nIHRoZSBuZy1kZXYgY29uZmlnLCB3aXRob3V0IHRoZSBmaWxlXG4gKiBleHRlbnNpb24gdG8gYWxsb3cgZWl0aGVyIGEgdHlwZXNjcmlwdCBvciBqYXZhc2NyaXB0IGZpbGUgdG8gYmUgdXNlZC5cbiAqL1xuY29uc3QgQ09ORklHX0ZJTEVfUEFUSCA9ICcubmctZGV2L2NvbmZpZyc7XG5cbi8qKiBUaGUgY29uZmlndXJhdGlvbiBmb3IgbmctZGV2LiAqL1xubGV0IGNhY2hlZENvbmZpZzoge30gfCBudWxsID0gbnVsbDtcblxuLyoqXG4gKiBUaGUgZmlsZW5hbWUgZXhwZWN0ZWQgZm9yIGxvY2FsIHVzZXIgY29uZmlnLCB3aXRob3V0IHRoZSBmaWxlIGV4dGVuc2lvbiB0byBhbGxvdyBhIHR5cGVzY3JpcHQsXG4gKiBqYXZhc2NyaXB0IG9yIGpzb24gZmlsZSB0byBiZSB1c2VkLlxuICovXG5jb25zdCBVU0VSX0NPTkZJR19GSUxFX1BBVEggPSAnLm5nLWRldi51c2VyJztcblxuLyoqIFRoZSBsb2NhbCB1c2VyIGNvbmZpZ3VyYXRpb24gZm9yIG5nLWRldi4gKi9cbmxldCB1c2VyQ29uZmlnOiB7W2tleTogc3RyaW5nXTogYW55fSB8IG51bGwgPSBudWxsO1xuXG4vKipcbiAqIFNldCB0aGUgY2FjaGVkIGNvbmZpZ3VyYXRpb24gb2JqZWN0IHRvIGJlIGxvYWRlZCBsYXRlci4gT25seSB0byBiZSB1c2VkIG9uIENJIHNpdHVhdGlvbnMgaW5cbiAqIHdoaWNoIGxvYWRpbmcgZnJvbSB0aGUgYC5uZy1kZXYvYCBkaXJlY3RvcnkgaXMgbm90IHBvc3NpYmxlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0Q29uZmlnKGNvbmZpZzoge30pIHtcbiAgY2FjaGVkQ29uZmlnID0gY29uZmlnO1xufVxuXG4vKipcbiAqIEdldCB0aGUgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBmaWxlIHN5c3RlbSwgcmV0dXJuaW5nIHRoZSBhbHJlYWR5IGxvYWRlZFxuICogY29weSBpZiBpdCBpcyBkZWZpbmVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29uZmlnKCk6IHt9O1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZyhiYXNlRGlyPzogc3RyaW5nKToge307XG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29uZmlnKGJhc2VEaXI/OiBzdHJpbmcpOiB7fSB7XG4gIC8vIElmIHRoZSBnbG9iYWwgY29uZmlnIGlzIG5vdCBkZWZpbmVkLCBsb2FkIGl0IGZyb20gdGhlIGZpbGUgc3lzdGVtLlxuICBpZiAoY2FjaGVkQ29uZmlnID09PSBudWxsKSB7XG4gICAgYmFzZURpciA9IGJhc2VEaXIgfHwgR2l0Q2xpZW50LmdldCgpLmJhc2VEaXI7XG4gICAgLy8gVGhlIGZ1bGwgcGF0aCB0byB0aGUgY29uZmlndXJhdGlvbiBmaWxlLlxuICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBqb2luKGJhc2VEaXIsIENPTkZJR19GSUxFX1BBVEgpO1xuICAgIC8vIFJlYWQgdGhlIGNvbmZpZ3VyYXRpb24gYW5kIHZhbGlkYXRlIGl0IGJlZm9yZSBjYWNoaW5nIGl0IGZvciB0aGUgZnV0dXJlLlxuICAgIGNhY2hlZENvbmZpZyA9IHJlYWRDb25maWdGaWxlKGNvbmZpZ1BhdGgpO1xuICB9XG4gIC8vIFJldHVybiBhIGNsb25lIG9mIHRoZSBjYWNoZWQgZ2xvYmFsIGNvbmZpZyB0byBlbnN1cmUgdGhhdCBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgY29uZmlnXG4gIC8vIGlzIHJldHVybmVkIGVhY2ggdGltZSwgcHJldmVudGluZyB1bmV4cGVjdGVkIGVmZmVjdHMgb2YgbW9kaWZpY2F0aW9ucyB0byB0aGUgY29uZmlnIG9iamVjdC5cbiAgcmV0dXJuIHsuLi5jYWNoZWRDb25maWd9O1xufVxuXG4vKipcbiAqIEdldCB0aGUgbG9jYWwgdXNlciBjb25maWd1cmF0aW9uIGZyb20gdGhlIGZpbGUgc3lzdGVtLCByZXR1cm5pbmcgdGhlIGFscmVhZHkgbG9hZGVkIGNvcHkgaWYgaXQgaXNcbiAqIGRlZmluZWQuXG4gKlxuICogQHJldHVybnMgVGhlIHVzZXIgY29uZmlndXJhdGlvbiBvYmplY3QsIG9yIGFuIGVtcHR5IG9iamVjdCBpZiBubyB1c2VyIGNvbmZpZ3VyYXRpb24gZmlsZSBpc1xuICogcHJlc2VudC4gVGhlIG9iamVjdCBpcyBhbiB1bnR5cGVkIG9iamVjdCBhcyB0aGVyZSBhcmUgbm8gcmVxdWlyZWQgdXNlciBjb25maWd1cmF0aW9ucy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFVzZXJDb25maWcoKSB7XG4gIC8vIElmIHRoZSBnbG9iYWwgY29uZmlnIGlzIG5vdCBkZWZpbmVkLCBsb2FkIGl0IGZyb20gdGhlIGZpbGUgc3lzdGVtLlxuICBpZiAodXNlckNvbmZpZyA9PT0gbnVsbCkge1xuICAgIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgICAvLyBUaGUgZnVsbCBwYXRoIHRvIHRoZSBjb25maWd1cmF0aW9uIGZpbGUuXG4gICAgY29uc3QgY29uZmlnUGF0aCA9IGpvaW4oZ2l0LmJhc2VEaXIsIFVTRVJfQ09ORklHX0ZJTEVfUEFUSCk7XG4gICAgLy8gU2V0IHRoZSBnbG9iYWwgY29uZmlnIG9iamVjdC5cbiAgICB1c2VyQ29uZmlnID0gcmVhZENvbmZpZ0ZpbGUoY29uZmlnUGF0aCwgdHJ1ZSk7XG4gIH1cbiAgLy8gUmV0dXJuIGEgY2xvbmUgb2YgdGhlIHVzZXIgY29uZmlnIHRvIGVuc3VyZSB0aGF0IGEgbmV3IGluc3RhbmNlIG9mIHRoZSBjb25maWcgaXMgcmV0dXJuZWRcbiAgLy8gZWFjaCB0aW1lLCBwcmV2ZW50aW5nIHVuZXhwZWN0ZWQgZWZmZWN0cyBvZiBtb2RpZmljYXRpb25zIHRvIHRoZSBjb25maWcgb2JqZWN0LlxuICByZXR1cm4gey4uLnVzZXJDb25maWd9O1xufVxuXG4vKiogQSBzdGFuZGFyZCBlcnJvciBjbGFzcyB0byB0aHJvd24gZHVyaW5nIGFzc2VydGlvbnMgd2hpbGUgdmFsaWRhdGluZyBjb25maWd1cmF0aW9uLiAqL1xuZXhwb3J0IGNsYXNzIENvbmZpZ1ZhbGlkYXRpb25FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZT86IHN0cmluZywgcHVibGljIHJlYWRvbmx5IGVycm9yczogc3RyaW5nW10gPSBbXSkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICB9XG59XG5cbi8qKiBWYWxpZGF0ZSB0aCBjb25maWd1cmF0aW9uIGhhcyBiZWVuIG1ldCBmb3IgdGhlIG5nLWRldiBjb21tYW5kLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydFZhbGlkR2l0aHViQ29uZmlnPFQ+KFxuICBjb25maWc6IFQgJiBQYXJ0aWFsPHtnaXRodWI6IEdpdGh1YkNvbmZpZ30+LFxuKTogYXNzZXJ0cyBjb25maWcgaXMgVCAmIHtnaXRodWI6IEdpdGh1YkNvbmZpZ30ge1xuICBjb25zdCBlcnJvcnM6IHN0cmluZ1tdID0gW107XG4gIC8vIFZhbGlkYXRlIHRoZSBnaXRodWIgY29uZmlndXJhdGlvbi5cbiAgaWYgKGNvbmZpZy5naXRodWIgPT09IHVuZGVmaW5lZCkge1xuICAgIGVycm9ycy5wdXNoKGBHaXRodWIgcmVwb3NpdG9yeSBub3QgY29uZmlndXJlZC4gU2V0IHRoZSBcImdpdGh1YlwiIG9wdGlvbi5gKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoY29uZmlnLmdpdGh1Yi5uYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBcImdpdGh1Yi5uYW1lXCIgaXMgbm90IGRlZmluZWRgKTtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5naXRodWIub3duZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZXJyb3JzLnB1c2goYFwiZ2l0aHViLm93bmVyXCIgaXMgbm90IGRlZmluZWRgKTtcbiAgICB9XG4gIH1cbiAgaWYgKGVycm9ycy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgQ29uZmlnVmFsaWRhdGlvbkVycm9yKCdJbnZhbGlkIGBnaXRodWJgIGNvbmZpZ3VyYXRpb24nLCBlcnJvcnMpO1xuICB9XG59XG5cbi8qKlxuICogUmVzb2x2ZXMgYW5kIHJlYWRzIHRoZSBzcGVjaWZpZWQgY29uZmlndXJhdGlvbiBmaWxlLCBvcHRpb25hbGx5IHJldHVybmluZyBhbiBlbXB0eSBvYmplY3QgaWYgdGhlXG4gKiBjb25maWd1cmF0aW9uIGZpbGUgY2Fubm90IGJlIHJlYWQuXG4gKi9cbmZ1bmN0aW9uIHJlYWRDb25maWdGaWxlKGNvbmZpZ1BhdGg6IHN0cmluZywgcmV0dXJuRW1wdHlPYmplY3RPbkVycm9yID0gZmFsc2UpOiB7fSB7XG4gIC8vIElmIHRoZSBgLnRzYCBleHRlbnNpb24gaGFzIG5vdCBiZWVuIHNldCB1cCBhbHJlYWR5LCBhbmQgYSBUeXBlU2NyaXB0IGJhc2VkXG4gIC8vIHZlcnNpb24gb2YgdGhlIGdpdmVuIGNvbmZpZ3VyYXRpb24gc2VlbXMgdG8gZXhpc3QsIHNldCB1cCBgdHMtbm9kZWAgaWYgYXZhaWxhYmxlLlxuICBpZiAoXG4gICAgcmVxdWlyZS5leHRlbnNpb25zWycudHMnXSA9PT0gdW5kZWZpbmVkICYmXG4gICAgZXhpc3RzU3luYyhgJHtjb25maWdQYXRofS50c2ApICYmXG4gICAgaXNUc05vZGVBdmFpbGFibGUoKVxuICApIHtcbiAgICAvLyBFbnN1cmUgdGhlIG1vZHVsZSB0YXJnZXQgaXMgc2V0IHRvIGBjb21tb25qc2AuIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2UgdGhlXG4gICAgLy8gZGV2LWluZnJhIHRvb2wgcnVucyBpbiBOb2RlSlMgd2hpY2ggZG9lcyBub3Qgc3VwcG9ydCBFUyBtb2R1bGVzIGJ5IGRlZmF1bHQuXG4gICAgLy8gQWRkaXRpb25hbGx5LCBzZXQgdGhlIGBkaXJgIG9wdGlvbiB0byB0aGUgZGlyZWN0b3J5IHRoYXQgY29udGFpbnMgdGhlIGNvbmZpZ3VyYXRpb25cbiAgICAvLyBmaWxlLiBUaGlzIGFsbG93cyBmb3IgY3VzdG9tIGNvbXBpbGVyIG9wdGlvbnMgKHN1Y2ggYXMgYC0tc3RyaWN0YCkuXG4gICAgcmVxdWlyZSgndHMtbm9kZScpLnJlZ2lzdGVyKHtcbiAgICAgIGRpcjogZGlybmFtZShjb25maWdQYXRoKSxcbiAgICAgIHRyYW5zcGlsZU9ubHk6IHRydWUsXG4gICAgICBjb21waWxlck9wdGlvbnM6IHttb2R1bGU6ICdjb21tb25qcyd9LFxuICAgIH0pO1xuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gcmVxdWlyZShjb25maWdQYXRoKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChyZXR1cm5FbXB0eU9iamVjdE9uRXJyb3IpIHtcbiAgICAgIGRlYnVnKGBDb3VsZCBub3QgcmVhZCBjb25maWd1cmF0aW9uIGZpbGUgYXQgJHtjb25maWdQYXRofSwgcmV0dXJuaW5nIGVtcHR5IG9iamVjdCBpbnN0ZWFkLmApO1xuICAgICAgZGVidWcoZSk7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIGVycm9yKGBDb3VsZCBub3QgcmVhZCBjb25maWd1cmF0aW9uIGZpbGUgYXQgJHtjb25maWdQYXRofS5gKTtcbiAgICBlcnJvcihlKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cbn1cbiJdfQ==