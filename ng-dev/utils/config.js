"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertNoErrors = exports.assertValidGithubConfig = exports.ConfigValidationError = exports.getUserConfig = exports.getConfig = exports.setConfig = void 0;
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
        const configPath = path_1.join(baseDir, CONFIG_FILE_PATH);
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
        const configPath = path_1.join(git.baseDir, USER_CONFIG_FILE_PATH);
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
        Object.setPrototypeOf(this, ConfigValidationError.prototype);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L3V0aWxzL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwyQkFBOEI7QUFDOUIsK0JBQW1DO0FBRW5DLHVDQUF1QztBQUN2QyxpREFBMkM7QUFDM0MsdUNBQTRDO0FBbUI1Qzs7O0dBR0c7QUFDSCxNQUFNLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO0FBRTFDLG9DQUFvQztBQUNwQyxJQUFJLFlBQVksR0FBYyxJQUFJLENBQUM7QUFFbkM7OztHQUdHO0FBQ0gsTUFBTSxxQkFBcUIsR0FBRyxjQUFjLENBQUM7QUFFN0MsK0NBQStDO0FBQy9DLElBQUksVUFBVSxHQUFnQyxJQUFJLENBQUM7QUFFbkQ7OztHQUdHO0FBQ0gsU0FBZ0IsU0FBUyxDQUFDLE1BQVU7SUFDbEMsWUFBWSxHQUFHLE1BQU0sQ0FBQztBQUN4QixDQUFDO0FBRkQsOEJBRUM7QUFRRCxTQUFnQixTQUFTLENBQUMsT0FBZ0I7SUFDeEMscUVBQXFFO0lBQ3JFLElBQUksWUFBWSxLQUFLLElBQUksRUFBRTtRQUN6QixPQUFPLEdBQUcsT0FBTyxJQUFJLHNCQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDO1FBQzdDLDJDQUEyQztRQUMzQyxNQUFNLFVBQVUsR0FBRyxXQUFJLENBQUMsT0FBTyxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDbkQsMkVBQTJFO1FBQzNFLFlBQVksR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDM0M7SUFDRCx5RkFBeUY7SUFDekYsOEZBQThGO0lBQzlGLE9BQU8sRUFBQyxHQUFHLFlBQVksRUFBQyxDQUFDO0FBQzNCLENBQUM7QUFaRCw4QkFZQztBQUVEOzs7Ozs7R0FNRztBQUNILFNBQWdCLGFBQWE7SUFDM0IscUVBQXFFO0lBQ3JFLElBQUksVUFBVSxLQUFLLElBQUksRUFBRTtRQUN2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QUMsRUFBRTtRQUN0QixPQUFPO0tBQ1I7SUFDRCxlQUFLLENBQUMscURBQXFELENBQUMsQ0FBQztJQUM3RCxLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sRUFBRTtRQUN4QixlQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0tBQ3JCO0lBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQixDQUFDO0FBVEQsd0NBU0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtleGlzdHNTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge2Rpcm5hbWUsIGpvaW59IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge2RlYnVnLCBlcnJvcn0gZnJvbSAnLi9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuL2dpdC9naXQtY2xpZW50JztcbmltcG9ydCB7aXNUc05vZGVBdmFpbGFibGV9IGZyb20gJy4vdHMtbm9kZSc7XG5cbi8qKlxuICogRGVzY3JpYmVzIHRoZSBHaXRodWIgY29uZmlndXJhdGlvbiBmb3IgZGV2LWluZnJhLiBUaGlzIGNvbmZpZ3VyYXRpb24gaXNcbiAqIHVzZWQgZm9yIEFQSSByZXF1ZXN0cywgZGV0ZXJtaW5pbmcgdGhlIHVwc3RyZWFtIHJlbW90ZSwgZXRjLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEdpdGh1YkNvbmZpZyB7XG4gIC8qKiBPd25lciBuYW1lIG9mIHRoZSByZXBvc2l0b3J5LiAqL1xuICBvd25lcjogc3RyaW5nO1xuICAvKiogTmFtZSBvZiB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgbmFtZTogc3RyaW5nO1xuICAvKiogTWFpbiBicmFuY2ggbmFtZSBmb3IgdGhlIHJlcG9zaXRvcnkuICovXG4gIG1haW5CcmFuY2hOYW1lOiBzdHJpbmc7XG4gIC8qKiBJZiBTU0ggcHJvdG9jb2wgc2hvdWxkIGJlIHVzZWQgZm9yIGdpdCBpbnRlcmFjdGlvbnMuICovXG4gIHVzZVNzaD86IGJvb2xlYW47XG4gIC8qKiBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgcmVwb3NpdG9yeSBpcyBwcml2YXRlLiAqL1xuICBwcml2YXRlPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBUaGUgZmlsZW5hbWUgZXhwZWN0ZWQgZm9yIGNyZWF0aW5nIHRoZSBuZy1kZXYgY29uZmlnLCB3aXRob3V0IHRoZSBmaWxlXG4gKiBleHRlbnNpb24gdG8gYWxsb3cgZWl0aGVyIGEgdHlwZXNjcmlwdCBvciBqYXZhc2NyaXB0IGZpbGUgdG8gYmUgdXNlZC5cbiAqL1xuY29uc3QgQ09ORklHX0ZJTEVfUEFUSCA9ICcubmctZGV2L2NvbmZpZyc7XG5cbi8qKiBUaGUgY29uZmlndXJhdGlvbiBmb3IgbmctZGV2LiAqL1xubGV0IGNhY2hlZENvbmZpZzoge30gfCBudWxsID0gbnVsbDtcblxuLyoqXG4gKiBUaGUgZmlsZW5hbWUgZXhwZWN0ZWQgZm9yIGxvY2FsIHVzZXIgY29uZmlnLCB3aXRob3V0IHRoZSBmaWxlIGV4dGVuc2lvbiB0byBhbGxvdyBhIHR5cGVzY3JpcHQsXG4gKiBqYXZhc2NyaXB0IG9yIGpzb24gZmlsZSB0byBiZSB1c2VkLlxuICovXG5jb25zdCBVU0VSX0NPTkZJR19GSUxFX1BBVEggPSAnLm5nLWRldi51c2VyJztcblxuLyoqIFRoZSBsb2NhbCB1c2VyIGNvbmZpZ3VyYXRpb24gZm9yIG5nLWRldi4gKi9cbmxldCB1c2VyQ29uZmlnOiB7W2tleTogc3RyaW5nXTogYW55fSB8IG51bGwgPSBudWxsO1xuXG4vKipcbiAqIFNldCB0aGUgY2FjaGVkIGNvbmZpZ3VyYXRpb24gb2JqZWN0IHRvIGJlIGxvYWRlZCBsYXRlci4gT25seSB0byBiZSB1c2VkIG9uIENJIHNpdHVhdGlvbnMgaW5cbiAqIHdoaWNoIGxvYWRpbmcgZnJvbSB0aGUgYC5uZy1kZXYvYCBkaXJlY3RvcnkgaXMgbm90IHBvc3NpYmxlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0Q29uZmlnKGNvbmZpZzoge30pIHtcbiAgY2FjaGVkQ29uZmlnID0gY29uZmlnO1xufVxuXG4vKipcbiAqIEdldCB0aGUgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBmaWxlIHN5c3RlbSwgcmV0dXJuaW5nIHRoZSBhbHJlYWR5IGxvYWRlZFxuICogY29weSBpZiBpdCBpcyBkZWZpbmVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29uZmlnKCk6IHt9O1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZyhiYXNlRGlyPzogc3RyaW5nKToge307XG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29uZmlnKGJhc2VEaXI/OiBzdHJpbmcpOiB7fSB7XG4gIC8vIElmIHRoZSBnbG9iYWwgY29uZmlnIGlzIG5vdCBkZWZpbmVkLCBsb2FkIGl0IGZyb20gdGhlIGZpbGUgc3lzdGVtLlxuICBpZiAoY2FjaGVkQ29uZmlnID09PSBudWxsKSB7XG4gICAgYmFzZURpciA9IGJhc2VEaXIgfHwgR2l0Q2xpZW50LmdldCgpLmJhc2VEaXI7XG4gICAgLy8gVGhlIGZ1bGwgcGF0aCB0byB0aGUgY29uZmlndXJhdGlvbiBmaWxlLlxuICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBqb2luKGJhc2VEaXIsIENPTkZJR19GSUxFX1BBVEgpO1xuICAgIC8vIFJlYWQgdGhlIGNvbmZpZ3VyYXRpb24gYW5kIHZhbGlkYXRlIGl0IGJlZm9yZSBjYWNoaW5nIGl0IGZvciB0aGUgZnV0dXJlLlxuICAgIGNhY2hlZENvbmZpZyA9IHJlYWRDb25maWdGaWxlKGNvbmZpZ1BhdGgpO1xuICB9XG4gIC8vIFJldHVybiBhIGNsb25lIG9mIHRoZSBjYWNoZWQgZ2xvYmFsIGNvbmZpZyB0byBlbnN1cmUgdGhhdCBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgY29uZmlnXG4gIC8vIGlzIHJldHVybmVkIGVhY2ggdGltZSwgcHJldmVudGluZyB1bmV4cGVjdGVkIGVmZmVjdHMgb2YgbW9kaWZpY2F0aW9ucyB0byB0aGUgY29uZmlnIG9iamVjdC5cbiAgcmV0dXJuIHsuLi5jYWNoZWRDb25maWd9O1xufVxuXG4vKipcbiAqIEdldCB0aGUgbG9jYWwgdXNlciBjb25maWd1cmF0aW9uIGZyb20gdGhlIGZpbGUgc3lzdGVtLCByZXR1cm5pbmcgdGhlIGFscmVhZHkgbG9hZGVkIGNvcHkgaWYgaXQgaXNcbiAqIGRlZmluZWQuXG4gKlxuICogQHJldHVybnMgVGhlIHVzZXIgY29uZmlndXJhdGlvbiBvYmplY3QsIG9yIGFuIGVtcHR5IG9iamVjdCBpZiBubyB1c2VyIGNvbmZpZ3VyYXRpb24gZmlsZSBpc1xuICogcHJlc2VudC4gVGhlIG9iamVjdCBpcyBhbiB1bnR5cGVkIG9iamVjdCBhcyB0aGVyZSBhcmUgbm8gcmVxdWlyZWQgdXNlciBjb25maWd1cmF0aW9ucy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFVzZXJDb25maWcoKSB7XG4gIC8vIElmIHRoZSBnbG9iYWwgY29uZmlnIGlzIG5vdCBkZWZpbmVkLCBsb2FkIGl0IGZyb20gdGhlIGZpbGUgc3lzdGVtLlxuICBpZiAodXNlckNvbmZpZyA9PT0gbnVsbCkge1xuICAgIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgICAvLyBUaGUgZnVsbCBwYXRoIHRvIHRoZSBjb25maWd1cmF0aW9uIGZpbGUuXG4gICAgY29uc3QgY29uZmlnUGF0aCA9IGpvaW4oZ2l0LmJhc2VEaXIsIFVTRVJfQ09ORklHX0ZJTEVfUEFUSCk7XG4gICAgLy8gU2V0IHRoZSBnbG9iYWwgY29uZmlnIG9iamVjdC5cbiAgICB1c2VyQ29uZmlnID0gcmVhZENvbmZpZ0ZpbGUoY29uZmlnUGF0aCwgdHJ1ZSk7XG4gIH1cbiAgLy8gUmV0dXJuIGEgY2xvbmUgb2YgdGhlIHVzZXIgY29uZmlnIHRvIGVuc3VyZSB0aGF0IGEgbmV3IGluc3RhbmNlIG9mIHRoZSBjb25maWcgaXMgcmV0dXJuZWRcbiAgLy8gZWFjaCB0aW1lLCBwcmV2ZW50aW5nIHVuZXhwZWN0ZWQgZWZmZWN0cyBvZiBtb2RpZmljYXRpb25zIHRvIHRoZSBjb25maWcgb2JqZWN0LlxuICByZXR1cm4gey4uLnVzZXJDb25maWd9O1xufVxuXG4vKiogQSBzdGFuZGFyZCBlcnJvciBjbGFzcyB0byB0aHJvd24gZHVyaW5nIGFzc2VydGlvbnMgd2hpbGUgdmFsaWRhdGluZyBjb25maWd1cmF0aW9uLiAqL1xuZXhwb3J0IGNsYXNzIENvbmZpZ1ZhbGlkYXRpb25FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZT86IHN0cmluZywgcHVibGljIHJlYWRvbmx5IGVycm9yczogc3RyaW5nW10gPSBbXSkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBDb25maWdWYWxpZGF0aW9uRXJyb3IucHJvdG90eXBlKTtcbiAgfVxufVxuXG4vKiogVmFsaWRhdGUgdGggY29uZmlndXJhdGlvbiBoYXMgYmVlbiBtZXQgZm9yIHRoZSBuZy1kZXYgY29tbWFuZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRWYWxpZEdpdGh1YkNvbmZpZzxUPihcbiAgY29uZmlnOiBUICYgUGFydGlhbDx7Z2l0aHViOiBHaXRodWJDb25maWd9Pixcbik6IGFzc2VydHMgY29uZmlnIGlzIFQgJiB7Z2l0aHViOiBHaXRodWJDb25maWd9IHtcbiAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuICAvLyBWYWxpZGF0ZSB0aGUgZ2l0aHViIGNvbmZpZ3VyYXRpb24uXG4gIGlmIChjb25maWcuZ2l0aHViID09PSB1bmRlZmluZWQpIHtcbiAgICBlcnJvcnMucHVzaChgR2l0aHViIHJlcG9zaXRvcnkgbm90IGNvbmZpZ3VyZWQuIFNldCB0aGUgXCJnaXRodWJcIiBvcHRpb24uYCk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGNvbmZpZy5naXRodWIubmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvcnMucHVzaChgXCJnaXRodWIubmFtZVwiIGlzIG5vdCBkZWZpbmVkYCk7XG4gICAgfVxuICAgIGlmIChjb25maWcuZ2l0aHViLm93bmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBcImdpdGh1Yi5vd25lclwiIGlzIG5vdCBkZWZpbmVkYCk7XG4gICAgfVxuICB9XG4gIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IENvbmZpZ1ZhbGlkYXRpb25FcnJvcignSW52YWxpZCBgZ2l0aHViYCBjb25maWd1cmF0aW9uJywgZXJyb3JzKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlc29sdmVzIGFuZCByZWFkcyB0aGUgc3BlY2lmaWVkIGNvbmZpZ3VyYXRpb24gZmlsZSwgb3B0aW9uYWxseSByZXR1cm5pbmcgYW4gZW1wdHkgb2JqZWN0IGlmIHRoZVxuICogY29uZmlndXJhdGlvbiBmaWxlIGNhbm5vdCBiZSByZWFkLlxuICovXG5mdW5jdGlvbiByZWFkQ29uZmlnRmlsZShjb25maWdQYXRoOiBzdHJpbmcsIHJldHVybkVtcHR5T2JqZWN0T25FcnJvciA9IGZhbHNlKToge30ge1xuICAvLyBJZiB0aGUgYC50c2AgZXh0ZW5zaW9uIGhhcyBub3QgYmVlbiBzZXQgdXAgYWxyZWFkeSwgYW5kIGEgVHlwZVNjcmlwdCBiYXNlZFxuICAvLyB2ZXJzaW9uIG9mIHRoZSBnaXZlbiBjb25maWd1cmF0aW9uIHNlZW1zIHRvIGV4aXN0LCBzZXQgdXAgYHRzLW5vZGVgIGlmIGF2YWlsYWJsZS5cbiAgaWYgKFxuICAgIHJlcXVpcmUuZXh0ZW5zaW9uc1snLnRzJ10gPT09IHVuZGVmaW5lZCAmJlxuICAgIGV4aXN0c1N5bmMoYCR7Y29uZmlnUGF0aH0udHNgKSAmJlxuICAgIGlzVHNOb2RlQXZhaWxhYmxlKClcbiAgKSB7XG4gICAgLy8gRW5zdXJlIHRoZSBtb2R1bGUgdGFyZ2V0IGlzIHNldCB0byBgY29tbW9uanNgLiBUaGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHRoZVxuICAgIC8vIGRldi1pbmZyYSB0b29sIHJ1bnMgaW4gTm9kZUpTIHdoaWNoIGRvZXMgbm90IHN1cHBvcnQgRVMgbW9kdWxlcyBieSBkZWZhdWx0LlxuICAgIC8vIEFkZGl0aW9uYWxseSwgc2V0IHRoZSBgZGlyYCBvcHRpb24gdG8gdGhlIGRpcmVjdG9yeSB0aGF0IGNvbnRhaW5zIHRoZSBjb25maWd1cmF0aW9uXG4gICAgLy8gZmlsZS4gVGhpcyBhbGxvd3MgZm9yIGN1c3RvbSBjb21waWxlciBvcHRpb25zIChzdWNoIGFzIGAtLXN0cmljdGApLlxuICAgIHJlcXVpcmUoJ3RzLW5vZGUnKS5yZWdpc3Rlcih7XG4gICAgICBkaXI6IGRpcm5hbWUoY29uZmlnUGF0aCksXG4gICAgICB0cmFuc3BpbGVPbmx5OiB0cnVlLFxuICAgICAgY29tcGlsZXJPcHRpb25zOiB7bW9kdWxlOiAnY29tbW9uanMnfSxcbiAgICB9KTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIHJlcXVpcmUoY29uZmlnUGF0aCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAocmV0dXJuRW1wdHlPYmplY3RPbkVycm9yKSB7XG4gICAgICBkZWJ1ZyhgQ291bGQgbm90IHJlYWQgY29uZmlndXJhdGlvbiBmaWxlIGF0ICR7Y29uZmlnUGF0aH0sIHJldHVybmluZyBlbXB0eSBvYmplY3QgaW5zdGVhZC5gKTtcbiAgICAgIGRlYnVnKGUpO1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICBlcnJvcihgQ291bGQgbm90IHJlYWQgY29uZmlndXJhdGlvbiBmaWxlIGF0ICR7Y29uZmlnUGF0aH0uYCk7XG4gICAgZXJyb3IoZSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG59XG5cbi8qKlxuICogQXNzZXJ0cyB0aGUgcHJvdmlkZWQgYXJyYXkgb2YgZXJyb3IgbWVzc2FnZXMgaXMgZW1wdHkuIElmIGFueSBlcnJvcnMgYXJlIGluIHRoZSBhcnJheSxcbiAqIGxvZ3MgdGhlIGVycm9ycyBhbmQgZXhpdCB0aGUgcHJvY2VzcyBhcyBhIGZhaWx1cmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnROb0Vycm9ycyhlcnJvcnM6IHN0cmluZ1tdKSB7XG4gIGlmIChlcnJvcnMubGVuZ3RoID09IDApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgZXJyb3IoYEVycm9ycyBkaXNjb3ZlcmVkIHdoaWxlIGxvYWRpbmcgY29uZmlndXJhdGlvbiBmaWxlOmApO1xuICBmb3IgKGNvbnN0IGVyciBvZiBlcnJvcnMpIHtcbiAgICBlcnJvcihgICAtICR7ZXJyfWApO1xuICB9XG4gIHByb2Nlc3MuZXhpdCgxKTtcbn1cbiJdfQ==