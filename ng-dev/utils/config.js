"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertNoErrors = exports.assertValidGithubConfig = exports.ConfigValidationError = exports.getUserConfig = exports.getConfig = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L3V0aWxzL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwyQkFBOEI7QUFDOUIsK0JBQW1DO0FBRW5DLHVDQUF1QztBQUN2QyxpREFBMkM7QUFDM0MsdUNBQTRDO0FBbUI1Qzs7O0dBR0c7QUFDSCxNQUFNLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO0FBRTFDLG9DQUFvQztBQUNwQyxJQUFJLFlBQVksR0FBYyxJQUFJLENBQUM7QUFFbkM7OztHQUdHO0FBQ0gsTUFBTSxxQkFBcUIsR0FBRyxjQUFjLENBQUM7QUFFN0MsK0NBQStDO0FBQy9DLElBQUksVUFBVSxHQUFnQyxJQUFJLENBQUM7QUFRbkQsU0FBZ0IsU0FBUyxDQUFDLE9BQWdCO0lBQ3hDLHFFQUFxRTtJQUNyRSxJQUFJLFlBQVksS0FBSyxJQUFJLEVBQUU7UUFDekIsT0FBTyxHQUFHLE9BQU8sSUFBSSxzQkFBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQztRQUM3QywyQ0FBMkM7UUFDM0MsTUFBTSxVQUFVLEdBQUcsV0FBSSxDQUFDLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ25ELDJFQUEyRTtRQUMzRSxZQUFZLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQzNDO0lBQ0QseUZBQXlGO0lBQ3pGLDhGQUE4RjtJQUM5RixPQUFPLEVBQUMsR0FBRyxZQUFZLEVBQUMsQ0FBQztBQUMzQixDQUFDO0FBWkQsOEJBWUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxTQUFnQixhQUFhO0lBQzNCLHFFQUFxRTtJQUNyRSxJQUFJLFVBQVUsS0FBSyxJQUFJLEVBQUU7UUFDdkIsTUFBTSxHQUFHLEdBQUcsc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1QiwyQ0FBMkM7UUFDM0MsTUFBTSxVQUFVLEdBQUcsV0FBSSxDQUFD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LEVBQUU7UUFDeEIsZUFBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsQ0FBQztLQUNyQjtJQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEIsQ0FBQztBQVRELHdDQVNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXhpc3RzU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IHtkaXJuYW1lLCBqb2lufSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtkZWJ1ZywgZXJyb3J9IGZyb20gJy4vY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi9naXQvZ2l0LWNsaWVudCc7XG5pbXBvcnQge2lzVHNOb2RlQXZhaWxhYmxlfSBmcm9tICcuL3RzLW5vZGUnO1xuXG4vKipcbiAqIERlc2NyaWJlcyB0aGUgR2l0aHViIGNvbmZpZ3VyYXRpb24gZm9yIGRldi1pbmZyYS4gVGhpcyBjb25maWd1cmF0aW9uIGlzXG4gKiB1c2VkIGZvciBBUEkgcmVxdWVzdHMsIGRldGVybWluaW5nIHRoZSB1cHN0cmVhbSByZW1vdGUsIGV0Yy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBHaXRodWJDb25maWcge1xuICAvKiogT3duZXIgbmFtZSBvZiB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgb3duZXI6IHN0cmluZztcbiAgLyoqIE5hbWUgb2YgdGhlIHJlcG9zaXRvcnkuICovXG4gIG5hbWU6IHN0cmluZztcbiAgLyoqIE1haW4gYnJhbmNoIG5hbWUgZm9yIHRoZSByZXBvc2l0b3J5LiAqL1xuICBtYWluQnJhbmNoTmFtZTogc3RyaW5nO1xuICAvKiogSWYgU1NIIHByb3RvY29sIHNob3VsZCBiZSB1c2VkIGZvciBnaXQgaW50ZXJhY3Rpb25zLiAqL1xuICB1c2VTc2g/OiBib29sZWFuO1xuICAvKiogV2hldGhlciB0aGUgc3BlY2lmaWVkIHJlcG9zaXRvcnkgaXMgcHJpdmF0ZS4gKi9cbiAgcHJpdmF0ZT86IGJvb2xlYW47XG59XG5cbi8qKlxuICogVGhlIGZpbGVuYW1lIGV4cGVjdGVkIGZvciBjcmVhdGluZyB0aGUgbmctZGV2IGNvbmZpZywgd2l0aG91dCB0aGUgZmlsZVxuICogZXh0ZW5zaW9uIHRvIGFsbG93IGVpdGhlciBhIHR5cGVzY3JpcHQgb3IgamF2YXNjcmlwdCBmaWxlIHRvIGJlIHVzZWQuXG4gKi9cbmNvbnN0IENPTkZJR19GSUxFX1BBVEggPSAnLm5nLWRldi9jb25maWcnO1xuXG4vKiogVGhlIGNvbmZpZ3VyYXRpb24gZm9yIG5nLWRldi4gKi9cbmxldCBjYWNoZWRDb25maWc6IHt9IHwgbnVsbCA9IG51bGw7XG5cbi8qKlxuICogVGhlIGZpbGVuYW1lIGV4cGVjdGVkIGZvciBsb2NhbCB1c2VyIGNvbmZpZywgd2l0aG91dCB0aGUgZmlsZSBleHRlbnNpb24gdG8gYWxsb3cgYSB0eXBlc2NyaXB0LFxuICogamF2YXNjcmlwdCBvciBqc29uIGZpbGUgdG8gYmUgdXNlZC5cbiAqL1xuY29uc3QgVVNFUl9DT05GSUdfRklMRV9QQVRIID0gJy5uZy1kZXYudXNlcic7XG5cbi8qKiBUaGUgbG9jYWwgdXNlciBjb25maWd1cmF0aW9uIGZvciBuZy1kZXYuICovXG5sZXQgdXNlckNvbmZpZzoge1trZXk6IHN0cmluZ106IGFueX0gfCBudWxsID0gbnVsbDtcblxuLyoqXG4gKiBHZXQgdGhlIGNvbmZpZ3VyYXRpb24gZnJvbSB0aGUgZmlsZSBzeXN0ZW0sIHJldHVybmluZyB0aGUgYWxyZWFkeSBsb2FkZWRcbiAqIGNvcHkgaWYgaXQgaXMgZGVmaW5lZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZygpOiB7fTtcbmV4cG9ydCBmdW5jdGlvbiBnZXRDb25maWcoYmFzZURpcj86IHN0cmluZyk6IHt9O1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZyhiYXNlRGlyPzogc3RyaW5nKToge30ge1xuICAvLyBJZiB0aGUgZ2xvYmFsIGNvbmZpZyBpcyBub3QgZGVmaW5lZCwgbG9hZCBpdCBmcm9tIHRoZSBmaWxlIHN5c3RlbS5cbiAgaWYgKGNhY2hlZENvbmZpZyA9PT0gbnVsbCkge1xuICAgIGJhc2VEaXIgPSBiYXNlRGlyIHx8IEdpdENsaWVudC5nZXQoKS5iYXNlRGlyO1xuICAgIC8vIFRoZSBmdWxsIHBhdGggdG8gdGhlIGNvbmZpZ3VyYXRpb24gZmlsZS5cbiAgICBjb25zdCBjb25maWdQYXRoID0gam9pbihiYXNlRGlyLCBDT05GSUdfRklMRV9QQVRIKTtcbiAgICAvLyBSZWFkIHRoZSBjb25maWd1cmF0aW9uIGFuZCB2YWxpZGF0ZSBpdCBiZWZvcmUgY2FjaGluZyBpdCBmb3IgdGhlIGZ1dHVyZS5cbiAgICBjYWNoZWRDb25maWcgPSByZWFkQ29uZmlnRmlsZShjb25maWdQYXRoKTtcbiAgfVxuICAvLyBSZXR1cm4gYSBjbG9uZSBvZiB0aGUgY2FjaGVkIGdsb2JhbCBjb25maWcgdG8gZW5zdXJlIHRoYXQgYSBuZXcgaW5zdGFuY2Ugb2YgdGhlIGNvbmZpZ1xuICAvLyBpcyByZXR1cm5lZCBlYWNoIHRpbWUsIHByZXZlbnRpbmcgdW5leHBlY3RlZCBlZmZlY3RzIG9mIG1vZGlmaWNhdGlvbnMgdG8gdGhlIGNvbmZpZyBvYmplY3QuXG4gIHJldHVybiB7Li4uY2FjaGVkQ29uZmlnfTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGxvY2FsIHVzZXIgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBmaWxlIHN5c3RlbSwgcmV0dXJuaW5nIHRoZSBhbHJlYWR5IGxvYWRlZCBjb3B5IGlmIGl0IGlzXG4gKiBkZWZpbmVkLlxuICpcbiAqIEByZXR1cm5zIFRoZSB1c2VyIGNvbmZpZ3VyYXRpb24gb2JqZWN0LCBvciBhbiBlbXB0eSBvYmplY3QgaWYgbm8gdXNlciBjb25maWd1cmF0aW9uIGZpbGUgaXNcbiAqIHByZXNlbnQuIFRoZSBvYmplY3QgaXMgYW4gdW50eXBlZCBvYmplY3QgYXMgdGhlcmUgYXJlIG5vIHJlcXVpcmVkIHVzZXIgY29uZmlndXJhdGlvbnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRVc2VyQ29uZmlnKCkge1xuICAvLyBJZiB0aGUgZ2xvYmFsIGNvbmZpZyBpcyBub3QgZGVmaW5lZCwgbG9hZCBpdCBmcm9tIHRoZSBmaWxlIHN5c3RlbS5cbiAgaWYgKHVzZXJDb25maWcgPT09IG51bGwpIHtcbiAgICBjb25zdCBnaXQgPSBHaXRDbGllbnQuZ2V0KCk7XG4gICAgLy8gVGhlIGZ1bGwgcGF0aCB0byB0aGUgY29uZmlndXJhdGlvbiBmaWxlLlxuICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBqb2luKGdpdC5iYXNlRGlyLCBVU0VSX0NPTkZJR19GSUxFX1BBVEgpO1xuICAgIC8vIFNldCB0aGUgZ2xvYmFsIGNvbmZpZyBvYmplY3QuXG4gICAgdXNlckNvbmZpZyA9IHJlYWRDb25maWdGaWxlKGNvbmZpZ1BhdGgsIHRydWUpO1xuICB9XG4gIC8vIFJldHVybiBhIGNsb25lIG9mIHRoZSB1c2VyIGNvbmZpZyB0byBlbnN1cmUgdGhhdCBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgY29uZmlnIGlzIHJldHVybmVkXG4gIC8vIGVhY2ggdGltZSwgcHJldmVudGluZyB1bmV4cGVjdGVkIGVmZmVjdHMgb2YgbW9kaWZpY2F0aW9ucyB0byB0aGUgY29uZmlnIG9iamVjdC5cbiAgcmV0dXJuIHsuLi51c2VyQ29uZmlnfTtcbn1cblxuLyoqIEEgc3RhbmRhcmQgZXJyb3IgY2xhc3MgdG8gdGhyb3duIGR1cmluZyBhc3NlcnRpb25zIHdoaWxlIHZhbGlkYXRpbmcgY29uZmlndXJhdGlvbi4gKi9cbmV4cG9ydCBjbGFzcyBDb25maWdWYWxpZGF0aW9uRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U/OiBzdHJpbmcsIHB1YmxpYyByZWFkb25seSBlcnJvcnM6IHN0cmluZ1tdID0gW10pIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgQ29uZmlnVmFsaWRhdGlvbkVycm9yLnByb3RvdHlwZSk7XG4gIH1cbn1cblxuLyoqIFZhbGlkYXRlIHRoIGNvbmZpZ3VyYXRpb24gaGFzIGJlZW4gbWV0IGZvciB0aGUgbmctZGV2IGNvbW1hbmQuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0VmFsaWRHaXRodWJDb25maWc8VD4oXG4gIGNvbmZpZzogVCAmIFBhcnRpYWw8e2dpdGh1YjogR2l0aHViQ29uZmlnfT4sXG4pOiBhc3NlcnRzIGNvbmZpZyBpcyBUICYge2dpdGh1YjogR2l0aHViQ29uZmlnfSB7XG4gIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcbiAgLy8gVmFsaWRhdGUgdGhlIGdpdGh1YiBjb25maWd1cmF0aW9uLlxuICBpZiAoY29uZmlnLmdpdGh1YiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXJyb3JzLnB1c2goYEdpdGh1YiByZXBvc2l0b3J5IG5vdCBjb25maWd1cmVkLiBTZXQgdGhlIFwiZ2l0aHViXCIgb3B0aW9uLmApO1xuICB9IGVsc2Uge1xuICAgIGlmIChjb25maWcuZ2l0aHViLm5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZXJyb3JzLnB1c2goYFwiZ2l0aHViLm5hbWVcIiBpcyBub3QgZGVmaW5lZGApO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmdpdGh1Yi5vd25lciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvcnMucHVzaChgXCJnaXRodWIub3duZXJcIiBpcyBub3QgZGVmaW5lZGApO1xuICAgIH1cbiAgfVxuICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBDb25maWdWYWxpZGF0aW9uRXJyb3IoJ0ludmFsaWQgYGdpdGh1YmAgY29uZmlndXJhdGlvbicsIGVycm9ycyk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXNvbHZlcyBhbmQgcmVhZHMgdGhlIHNwZWNpZmllZCBjb25maWd1cmF0aW9uIGZpbGUsIG9wdGlvbmFsbHkgcmV0dXJuaW5nIGFuIGVtcHR5IG9iamVjdCBpZiB0aGVcbiAqIGNvbmZpZ3VyYXRpb24gZmlsZSBjYW5ub3QgYmUgcmVhZC5cbiAqL1xuZnVuY3Rpb24gcmVhZENvbmZpZ0ZpbGUoY29uZmlnUGF0aDogc3RyaW5nLCByZXR1cm5FbXB0eU9iamVjdE9uRXJyb3IgPSBmYWxzZSk6IHt9IHtcbiAgLy8gSWYgdGhlIGAudHNgIGV4dGVuc2lvbiBoYXMgbm90IGJlZW4gc2V0IHVwIGFscmVhZHksIGFuZCBhIFR5cGVTY3JpcHQgYmFzZWRcbiAgLy8gdmVyc2lvbiBvZiB0aGUgZ2l2ZW4gY29uZmlndXJhdGlvbiBzZWVtcyB0byBleGlzdCwgc2V0IHVwIGB0cy1ub2RlYCBpZiBhdmFpbGFibGUuXG4gIGlmIChcbiAgICByZXF1aXJlLmV4dGVuc2lvbnNbJy50cyddID09PSB1bmRlZmluZWQgJiZcbiAgICBleGlzdHNTeW5jKGAke2NvbmZpZ1BhdGh9LnRzYCkgJiZcbiAgICBpc1RzTm9kZUF2YWlsYWJsZSgpXG4gICkge1xuICAgIC8vIEVuc3VyZSB0aGUgbW9kdWxlIHRhcmdldCBpcyBzZXQgdG8gYGNvbW1vbmpzYC4gVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSB0aGVcbiAgICAvLyBkZXYtaW5mcmEgdG9vbCBydW5zIGluIE5vZGVKUyB3aGljaCBkb2VzIG5vdCBzdXBwb3J0IEVTIG1vZHVsZXMgYnkgZGVmYXVsdC5cbiAgICAvLyBBZGRpdGlvbmFsbHksIHNldCB0aGUgYGRpcmAgb3B0aW9uIHRvIHRoZSBkaXJlY3RvcnkgdGhhdCBjb250YWlucyB0aGUgY29uZmlndXJhdGlvblxuICAgIC8vIGZpbGUuIFRoaXMgYWxsb3dzIGZvciBjdXN0b20gY29tcGlsZXIgb3B0aW9ucyAoc3VjaCBhcyBgLS1zdHJpY3RgKS5cbiAgICByZXF1aXJlKCd0cy1ub2RlJykucmVnaXN0ZXIoe1xuICAgICAgZGlyOiBkaXJuYW1lKGNvbmZpZ1BhdGgpLFxuICAgICAgdHJhbnNwaWxlT25seTogdHJ1ZSxcbiAgICAgIGNvbXBpbGVyT3B0aW9uczoge21vZHVsZTogJ2NvbW1vbmpzJ30sXG4gICAgfSk7XG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiByZXF1aXJlKGNvbmZpZ1BhdGgpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKHJldHVybkVtcHR5T2JqZWN0T25FcnJvcikge1xuICAgICAgZGVidWcoYENvdWxkIG5vdCByZWFkIGNvbmZpZ3VyYXRpb24gZmlsZSBhdCAke2NvbmZpZ1BhdGh9LCByZXR1cm5pbmcgZW1wdHkgb2JqZWN0IGluc3RlYWQuYCk7XG4gICAgICBkZWJ1ZyhlKTtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgZXJyb3IoYENvdWxkIG5vdCByZWFkIGNvbmZpZ3VyYXRpb24gZmlsZSBhdCAke2NvbmZpZ1BhdGh9LmApO1xuICAgIGVycm9yKGUpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxufVxuXG4vKipcbiAqIEFzc2VydHMgdGhlIHByb3ZpZGVkIGFycmF5IG9mIGVycm9yIG1lc3NhZ2VzIGlzIGVtcHR5LiBJZiBhbnkgZXJyb3JzIGFyZSBpbiB0aGUgYXJyYXksXG4gKiBsb2dzIHRoZSBlcnJvcnMgYW5kIGV4aXQgdGhlIHByb2Nlc3MgYXMgYSBmYWlsdXJlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0Tm9FcnJvcnMoZXJyb3JzOiBzdHJpbmdbXSkge1xuICBpZiAoZXJyb3JzLmxlbmd0aCA9PSAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGVycm9yKGBFcnJvcnMgZGlzY292ZXJlZCB3aGlsZSBsb2FkaW5nIGNvbmZpZ3VyYXRpb24gZmlsZTpgKTtcbiAgZm9yIChjb25zdCBlcnIgb2YgZXJyb3JzKSB7XG4gICAgZXJyb3IoYCAgLSAke2Vycn1gKTtcbiAgfVxuICBwcm9jZXNzLmV4aXQoMSk7XG59XG4iXX0=