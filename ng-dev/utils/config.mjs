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
/**
 * Asserts the provided array of error messages is empty. If any errors are in the array,
 * logs the errors and exit the process as a failure.
 */
function assertNoErrors(errors) {
    if (errors.length == 0) {
        return;
    }
    (0, console_1.error)(`Errors discovered while loading configuration file:`);
    for (const err of errors) {
        (0, console_1.error)(`  - ${err}`);
    }
    process.exit(1);
}
exports.assertNoErrors = assertNoErrors;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L3V0aWxzL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwyQkFBOEI7QUFDOUIsK0JBQW1DO0FBRW5DLHVDQUF1QztBQUN2QyxpREFBMkM7QUFDM0MsdUNBQTRDO0FBbUI1Qzs7O0dBR0c7QUFDSCxNQUFNLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO0FBRTFDLG9DQUFvQztBQUNwQyxJQUFJLFlBQVksR0FBYyxJQUFJLENBQUM7QUFFbkM7OztHQUdHO0FBQ0gsTUFBTSxxQkFBcUIsR0FBRyxjQUFjLENBQUM7QUFFN0MsK0NBQStDO0FBQy9DLElBQUksVUFBVSxHQUFnQyxJQUFJLENBQUM7QUFFbkQ7OztHQUdHO0FBQ0gsU0FBZ0IsU0FBUyxDQUFDLE1BQVU7SUFDbEMsWUFBWSxHQUFHLE1BQU0sQ0FBQztBQUN4QixDQUFDO0FBRkQsOEJBRUM7QUFRRCxTQUFnQixTQUFTLENBQUMsT0FBZ0I7SUFDeEMscUVBQXFFO0lBQ3JFLElBQUksWUFBWSxLQUFLLElBQUksRUFBRTtRQUN6QixPQUFPLEdBQUcsT0FBTyxJQUFJLHNCQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDO1FBQzdDLDJDQUEyQztRQUMzQyxNQUFNLFVBQVUsR0FBRyxJQUFBLFdBQUksRUFBQyxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUNuRCwyRUFBMkU7UUFDM0UsWUFBWSxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUMzQztJQUNELHlGQUF5RjtJQUN6Riw4RkFBOEY7SUFDOUYsT0FBTyxFQUFDLEdBQUcsWUFBWSxFQUFDLENBQUM7QUFDM0IsQ0FBQztBQVpELDhCQVlDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsYUFBYTtJQUMzQixxRUFBcUU7SUFDckUsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFF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O0tBQ1I7SUFDRCxJQUFBLGVBQUssRUFBQyxxREFBcUQsQ0FBQyxDQUFDO0lBQzdELEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxFQUFFO1FBQ3hCLElBQUEsZUFBSyxFQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsQ0FBQztLQUNyQjtJQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEIsQ0FBQztBQVRELHdDQVNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXhpc3RzU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IHtkaXJuYW1lLCBqb2lufSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtkZWJ1ZywgZXJyb3J9IGZyb20gJy4vY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi9naXQvZ2l0LWNsaWVudCc7XG5pbXBvcnQge2lzVHNOb2RlQXZhaWxhYmxlfSBmcm9tICcuL3RzLW5vZGUnO1xuXG4vKipcbiAqIERlc2NyaWJlcyB0aGUgR2l0aHViIGNvbmZpZ3VyYXRpb24gZm9yIGRldi1pbmZyYS4gVGhpcyBjb25maWd1cmF0aW9uIGlzXG4gKiB1c2VkIGZvciBBUEkgcmVxdWVzdHMsIGRldGVybWluaW5nIHRoZSB1cHN0cmVhbSByZW1vdGUsIGV0Yy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBHaXRodWJDb25maWcge1xuICAvKiogT3duZXIgbmFtZSBvZiB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgb3duZXI6IHN0cmluZztcbiAgLyoqIE5hbWUgb2YgdGhlIHJlcG9zaXRvcnkuICovXG4gIG5hbWU6IHN0cmluZztcbiAgLyoqIE1haW4gYnJhbmNoIG5hbWUgZm9yIHRoZSByZXBvc2l0b3J5LiAqL1xuICBtYWluQnJhbmNoTmFtZTogc3RyaW5nO1xuICAvKiogSWYgU1NIIHByb3RvY29sIHNob3VsZCBiZSB1c2VkIGZvciBnaXQgaW50ZXJhY3Rpb25zLiAqL1xuICB1c2VTc2g/OiBib29sZWFuO1xuICAvKiogV2hldGhlciB0aGUgc3BlY2lmaWVkIHJlcG9zaXRvcnkgaXMgcHJpdmF0ZS4gKi9cbiAgcHJpdmF0ZT86IGJvb2xlYW47XG59XG5cbi8qKlxuICogVGhlIGZpbGVuYW1lIGV4cGVjdGVkIGZvciBjcmVhdGluZyB0aGUgbmctZGV2IGNvbmZpZywgd2l0aG91dCB0aGUgZmlsZVxuICogZXh0ZW5zaW9uIHRvIGFsbG93IGVpdGhlciBhIHR5cGVzY3JpcHQgb3IgamF2YXNjcmlwdCBmaWxlIHRvIGJlIHVzZWQuXG4gKi9cbmNvbnN0IENPTkZJR19GSUxFX1BBVEggPSAnLm5nLWRldi9jb25maWcnO1xuXG4vKiogVGhlIGNvbmZpZ3VyYXRpb24gZm9yIG5nLWRldi4gKi9cbmxldCBjYWNoZWRDb25maWc6IHt9IHwgbnVsbCA9IG51bGw7XG5cbi8qKlxuICogVGhlIGZpbGVuYW1lIGV4cGVjdGVkIGZvciBsb2NhbCB1c2VyIGNvbmZpZywgd2l0aG91dCB0aGUgZmlsZSBleHRlbnNpb24gdG8gYWxsb3cgYSB0eXBlc2NyaXB0LFxuICogamF2YXNjcmlwdCBvciBqc29uIGZpbGUgdG8gYmUgdXNlZC5cbiAqL1xuY29uc3QgVVNFUl9DT05GSUdfRklMRV9QQVRIID0gJy5uZy1kZXYudXNlcic7XG5cbi8qKiBUaGUgbG9jYWwgdXNlciBjb25maWd1cmF0aW9uIGZvciBuZy1kZXYuICovXG5sZXQgdXNlckNvbmZpZzoge1trZXk6IHN0cmluZ106IGFueX0gfCBudWxsID0gbnVsbDtcblxuLyoqXG4gKiBTZXQgdGhlIGNhY2hlZCBjb25maWd1cmF0aW9uIG9iamVjdCB0byBiZSBsb2FkZWQgbGF0ZXIuIE9ubHkgdG8gYmUgdXNlZCBvbiBDSSBzaXR1YXRpb25zIGluXG4gKiB3aGljaCBsb2FkaW5nIGZyb20gdGhlIGAubmctZGV2L2AgZGlyZWN0b3J5IGlzIG5vdCBwb3NzaWJsZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldENvbmZpZyhjb25maWc6IHt9KSB7XG4gIGNhY2hlZENvbmZpZyA9IGNvbmZpZztcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGNvbmZpZ3VyYXRpb24gZnJvbSB0aGUgZmlsZSBzeXN0ZW0sIHJldHVybmluZyB0aGUgYWxyZWFkeSBsb2FkZWRcbiAqIGNvcHkgaWYgaXQgaXMgZGVmaW5lZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZygpOiB7fTtcbmV4cG9ydCBmdW5jdGlvbiBnZXRDb25maWcoYmFzZURpcj86IHN0cmluZyk6IHt9O1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZyhiYXNlRGlyPzogc3RyaW5nKToge30ge1xuICAvLyBJZiB0aGUgZ2xvYmFsIGNvbmZpZyBpcyBub3QgZGVmaW5lZCwgbG9hZCBpdCBmcm9tIHRoZSBmaWxlIHN5c3RlbS5cbiAgaWYgKGNhY2hlZENvbmZpZyA9PT0gbnVsbCkge1xuICAgIGJhc2VEaXIgPSBiYXNlRGlyIHx8IEdpdENsaWVudC5nZXQoKS5iYXNlRGlyO1xuICAgIC8vIFRoZSBmdWxsIHBhdGggdG8gdGhlIGNvbmZpZ3VyYXRpb24gZmlsZS5cbiAgICBjb25zdCBjb25maWdQYXRoID0gam9pbihiYXNlRGlyLCBDT05GSUdfRklMRV9QQVRIKTtcbiAgICAvLyBSZWFkIHRoZSBjb25maWd1cmF0aW9uIGFuZCB2YWxpZGF0ZSBpdCBiZWZvcmUgY2FjaGluZyBpdCBmb3IgdGhlIGZ1dHVyZS5cbiAgICBjYWNoZWRDb25maWcgPSByZWFkQ29uZmlnRmlsZShjb25maWdQYXRoKTtcbiAgfVxuICAvLyBSZXR1cm4gYSBjbG9uZSBvZiB0aGUgY2FjaGVkIGdsb2JhbCBjb25maWcgdG8gZW5zdXJlIHRoYXQgYSBuZXcgaW5zdGFuY2Ugb2YgdGhlIGNvbmZpZ1xuICAvLyBpcyByZXR1cm5lZCBlYWNoIHRpbWUsIHByZXZlbnRpbmcgdW5leHBlY3RlZCBlZmZlY3RzIG9mIG1vZGlmaWNhdGlvbnMgdG8gdGhlIGNvbmZpZyBvYmplY3QuXG4gIHJldHVybiB7Li4uY2FjaGVkQ29uZmlnfTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGxvY2FsIHVzZXIgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBmaWxlIHN5c3RlbSwgcmV0dXJuaW5nIHRoZSBhbHJlYWR5IGxvYWRlZCBjb3B5IGlmIGl0IGlzXG4gKiBkZWZpbmVkLlxuICpcbiAqIEByZXR1cm5zIFRoZSB1c2VyIGNvbmZpZ3VyYXRpb24gb2JqZWN0LCBvciBhbiBlbXB0eSBvYmplY3QgaWYgbm8gdXNlciBjb25maWd1cmF0aW9uIGZpbGUgaXNcbiAqIHByZXNlbnQuIFRoZSBvYmplY3QgaXMgYW4gdW50eXBlZCBvYmplY3QgYXMgdGhlcmUgYXJlIG5vIHJlcXVpcmVkIHVzZXIgY29uZmlndXJhdGlvbnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRVc2VyQ29uZmlnKCkge1xuICAvLyBJZiB0aGUgZ2xvYmFsIGNvbmZpZyBpcyBub3QgZGVmaW5lZCwgbG9hZCBpdCBmcm9tIHRoZSBmaWxlIHN5c3RlbS5cbiAgaWYgKHVzZXJDb25maWcgPT09IG51bGwpIHtcbiAgICBjb25zdCBnaXQgPSBHaXRDbGllbnQuZ2V0KCk7XG4gICAgLy8gVGhlIGZ1bGwgcGF0aCB0byB0aGUgY29uZmlndXJhdGlvbiBmaWxlLlxuICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBqb2luKGdpdC5iYXNlRGlyLCBVU0VSX0NPTkZJR19GSUxFX1BBVEgpO1xuICAgIC8vIFNldCB0aGUgZ2xvYmFsIGNvbmZpZyBvYmplY3QuXG4gICAgdXNlckNvbmZpZyA9IHJlYWRDb25maWdGaWxlKGNvbmZpZ1BhdGgsIHRydWUpO1xuICB9XG4gIC8vIFJldHVybiBhIGNsb25lIG9mIHRoZSB1c2VyIGNvbmZpZyB0byBlbnN1cmUgdGhhdCBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgY29uZmlnIGlzIHJldHVybmVkXG4gIC8vIGVhY2ggdGltZSwgcHJldmVudGluZyB1bmV4cGVjdGVkIGVmZmVjdHMgb2YgbW9kaWZpY2F0aW9ucyB0byB0aGUgY29uZmlnIG9iamVjdC5cbiAgcmV0dXJuIHsuLi51c2VyQ29uZmlnfTtcbn1cblxuLyoqIEEgc3RhbmRhcmQgZXJyb3IgY2xhc3MgdG8gdGhyb3duIGR1cmluZyBhc3NlcnRpb25zIHdoaWxlIHZhbGlkYXRpbmcgY29uZmlndXJhdGlvbi4gKi9cbmV4cG9ydCBjbGFzcyBDb25maWdWYWxpZGF0aW9uRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U/OiBzdHJpbmcsIHB1YmxpYyByZWFkb25seSBlcnJvcnM6IHN0cmluZ1tdID0gW10pIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgfVxufVxuXG4vKiogVmFsaWRhdGUgdGggY29uZmlndXJhdGlvbiBoYXMgYmVlbiBtZXQgZm9yIHRoZSBuZy1kZXYgY29tbWFuZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRWYWxpZEdpdGh1YkNvbmZpZzxUPihcbiAgY29uZmlnOiBUICYgUGFydGlhbDx7Z2l0aHViOiBHaXRodWJDb25maWd9Pixcbik6IGFzc2VydHMgY29uZmlnIGlzIFQgJiB7Z2l0aHViOiBHaXRodWJDb25maWd9IHtcbiAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuICAvLyBWYWxpZGF0ZSB0aGUgZ2l0aHViIGNvbmZpZ3VyYXRpb24uXG4gIGlmIChjb25maWcuZ2l0aHViID09PSB1bmRlZmluZWQpIHtcbiAgICBlcnJvcnMucHVzaChgR2l0aHViIHJlcG9zaXRvcnkgbm90IGNvbmZpZ3VyZWQuIFNldCB0aGUgXCJnaXRodWJcIiBvcHRpb24uYCk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGNvbmZpZy5naXRodWIubmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvcnMucHVzaChgXCJnaXRodWIubmFtZVwiIGlzIG5vdCBkZWZpbmVkYCk7XG4gICAgfVxuICAgIGlmIChjb25maWcuZ2l0aHViLm93bmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBcImdpdGh1Yi5vd25lclwiIGlzIG5vdCBkZWZpbmVkYCk7XG4gICAgfVxuICB9XG4gIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IENvbmZpZ1ZhbGlkYXRpb25FcnJvcignSW52YWxpZCBgZ2l0aHViYCBjb25maWd1cmF0aW9uJywgZXJyb3JzKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlc29sdmVzIGFuZCByZWFkcyB0aGUgc3BlY2lmaWVkIGNvbmZpZ3VyYXRpb24gZmlsZSwgb3B0aW9uYWxseSByZXR1cm5pbmcgYW4gZW1wdHkgb2JqZWN0IGlmIHRoZVxuICogY29uZmlndXJhdGlvbiBmaWxlIGNhbm5vdCBiZSByZWFkLlxuICovXG5mdW5jdGlvbiByZWFkQ29uZmlnRmlsZShjb25maWdQYXRoOiBzdHJpbmcsIHJldHVybkVtcHR5T2JqZWN0T25FcnJvciA9IGZhbHNlKToge30ge1xuICAvLyBJZiB0aGUgYC50c2AgZXh0ZW5zaW9uIGhhcyBub3QgYmVlbiBzZXQgdXAgYWxyZWFkeSwgYW5kIGEgVHlwZVNjcmlwdCBiYXNlZFxuICAvLyB2ZXJzaW9uIG9mIHRoZSBnaXZlbiBjb25maWd1cmF0aW9uIHNlZW1zIHRvIGV4aXN0LCBzZXQgdXAgYHRzLW5vZGVgIGlmIGF2YWlsYWJsZS5cbiAgaWYgKFxuICAgIHJlcXVpcmUuZXh0ZW5zaW9uc1snLnRzJ10gPT09IHVuZGVmaW5lZCAmJlxuICAgIGV4aXN0c1N5bmMoYCR7Y29uZmlnUGF0aH0udHNgKSAmJlxuICAgIGlzVHNOb2RlQXZhaWxhYmxlKClcbiAgKSB7XG4gICAgLy8gRW5zdXJlIHRoZSBtb2R1bGUgdGFyZ2V0IGlzIHNldCB0byBgY29tbW9uanNgLiBUaGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHRoZVxuICAgIC8vIGRldi1pbmZyYSB0b29sIHJ1bnMgaW4gTm9kZUpTIHdoaWNoIGRvZXMgbm90IHN1cHBvcnQgRVMgbW9kdWxlcyBieSBkZWZhdWx0LlxuICAgIC8vIEFkZGl0aW9uYWxseSwgc2V0IHRoZSBgZGlyYCBvcHRpb24gdG8gdGhlIGRpcmVjdG9yeSB0aGF0IGNvbnRhaW5zIHRoZSBjb25maWd1cmF0aW9uXG4gICAgLy8gZmlsZS4gVGhpcyBhbGxvd3MgZm9yIGN1c3RvbSBjb21waWxlciBvcHRpb25zIChzdWNoIGFzIGAtLXN0cmljdGApLlxuICAgIHJlcXVpcmUoJ3RzLW5vZGUnKS5yZWdpc3Rlcih7XG4gICAgICBkaXI6IGRpcm5hbWUoY29uZmlnUGF0aCksXG4gICAgICB0cmFuc3BpbGVPbmx5OiB0cnVlLFxuICAgICAgY29tcGlsZXJPcHRpb25zOiB7bW9kdWxlOiAnY29tbW9uanMnfSxcbiAgICB9KTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIHJlcXVpcmUoY29uZmlnUGF0aCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAocmV0dXJuRW1wdHlPYmplY3RPbkVycm9yKSB7XG4gICAgICBkZWJ1ZyhgQ291bGQgbm90IHJlYWQgY29uZmlndXJhdGlvbiBmaWxlIGF0ICR7Y29uZmlnUGF0aH0sIHJldHVybmluZyBlbXB0eSBvYmplY3QgaW5zdGVhZC5gKTtcbiAgICAgIGRlYnVnKGUpO1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICBlcnJvcihgQ291bGQgbm90IHJlYWQgY29uZmlndXJhdGlvbiBmaWxlIGF0ICR7Y29uZmlnUGF0aH0uYCk7XG4gICAgZXJyb3IoZSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG59XG5cbi8qKlxuICogQXNzZXJ0cyB0aGUgcHJvdmlkZWQgYXJyYXkgb2YgZXJyb3IgbWVzc2FnZXMgaXMgZW1wdHkuIElmIGFueSBlcnJvcnMgYXJlIGluIHRoZSBhcnJheSxcbiAqIGxvZ3MgdGhlIGVycm9ycyBhbmQgZXhpdCB0aGUgcHJvY2VzcyBhcyBhIGZhaWx1cmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnROb0Vycm9ycyhlcnJvcnM6IHN0cmluZ1tdKSB7XG4gIGlmIChlcnJvcnMubGVuZ3RoID09IDApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgZXJyb3IoYEVycm9ycyBkaXNjb3ZlcmVkIHdoaWxlIGxvYWRpbmcgY29uZmlndXJhdGlvbiBmaWxlOmApO1xuICBmb3IgKGNvbnN0IGVyciBvZiBlcnJvcnMpIHtcbiAgICBlcnJvcihgICAtICR7ZXJyfWApO1xuICB9XG4gIHByb2Nlc3MuZXhpdCgxKTtcbn1cbiJdfQ==