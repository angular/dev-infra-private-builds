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
function getConfig(baseDirOrAssertions) {
    let baseDir;
    if (typeof baseDirOrAssertions === 'string') {
        baseDir = baseDirOrAssertions;
    }
    else {
        baseDir = git_client_1.GitClient.get().baseDir;
    }
    // If the global config is not defined, load it from the file system.
    if (cachedConfig === null) {
        // The full path to the configuration file.
        const configPath = (0, path_1.join)(baseDir, CONFIG_FILE_PATH);
        // Read the configuration and validate it before caching it for the future.
        cachedConfig = readConfigFile(configPath);
    }
    if (Array.isArray(baseDirOrAssertions)) {
        for (const assertion of baseDirOrAssertions) {
            assertion(cachedConfig);
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L3V0aWxzL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwyQkFBOEI7QUFDOUIsK0JBQW1DO0FBR25DLHVDQUF1QztBQUN2QyxpREFBMkM7QUFDM0MsdUNBQTRDO0FBbUI1Qzs7O0dBR0c7QUFDSCxNQUFNLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO0FBRTFDLG9DQUFvQztBQUNwQyxJQUFJLFlBQVksR0FBYyxJQUFJLENBQUM7QUFFbkM7OztHQUdHO0FBQ0gsTUFBTSxxQkFBcUIsR0FBRyxjQUFjLENBQUM7QUFFN0MsK0NBQStDO0FBQy9DLElBQUksVUFBVSxHQUFnQyxJQUFJLENBQUM7QUFFbkQ7OztHQUdHO0FBQ0gsU0FBZ0IsU0FBUyxDQUFDLE1BQVU7SUFDbEMsWUFBWSxHQUFHLE1BQU0sQ0FBQztBQUN4QixDQUFDO0FBRkQsOEJBRUM7QUFTRCxTQUFnQixTQUFTLENBQUMsbUJBQTZCO0lBQ3JELElBQUksT0FBZSxDQUFDO0lBQ3BCLElBQUksT0FBTyxtQkFBbUIsS0FBSyxRQUFRLEVBQUU7UUFDM0MsT0FBTyxHQUFHLG1CQUFtQixDQUFDO0tBQy9CO1NBQU07UUFDTCxPQUFPLEdBQUcsc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUM7S0FDbkM7SUFFRCxxRUFBcUU7SUFDckUsSUFBSSxZQUFZLEtBQUssSUFBSSxFQUFFO1FBQ3pCLDJDQUEyQztRQUMzQyxNQUFNLFVBQVUsR0FBRyxJQUFBLFdBQUksRUFBQyxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUNuRCwyRUFBMkU7UUFDM0UsWUFBWSxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUMzQztJQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFO1FBQ3RDLEtBQUssTUFBTSxT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QUEsZUFBSyxFQUFDLHdDQUF3QyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQzdELElBQUEsZUFBSyxFQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtleGlzdHNTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge2Rpcm5hbWUsIGpvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtBc3NlcnRpb25zLCBNdWx0aXBsZUFzc2VydGlvbnN9IGZyb20gJy4vYXNzZXJ0aW9uLXR5cGluZ3MnO1xuXG5pbXBvcnQge2RlYnVnLCBlcnJvcn0gZnJvbSAnLi9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuL2dpdC9naXQtY2xpZW50JztcbmltcG9ydCB7aXNUc05vZGVBdmFpbGFibGV9IGZyb20gJy4vdHMtbm9kZSc7XG5cbi8qKlxuICogRGVzY3JpYmVzIHRoZSBHaXRodWIgY29uZmlndXJhdGlvbiBmb3IgZGV2LWluZnJhLiBUaGlzIGNvbmZpZ3VyYXRpb24gaXNcbiAqIHVzZWQgZm9yIEFQSSByZXF1ZXN0cywgZGV0ZXJtaW5pbmcgdGhlIHVwc3RyZWFtIHJlbW90ZSwgZXRjLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEdpdGh1YkNvbmZpZyB7XG4gIC8qKiBPd25lciBuYW1lIG9mIHRoZSByZXBvc2l0b3J5LiAqL1xuICBvd25lcjogc3RyaW5nO1xuICAvKiogTmFtZSBvZiB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgbmFtZTogc3RyaW5nO1xuICAvKiogTWFpbiBicmFuY2ggbmFtZSBmb3IgdGhlIHJlcG9zaXRvcnkuICovXG4gIG1haW5CcmFuY2hOYW1lOiBzdHJpbmc7XG4gIC8qKiBJZiBTU0ggcHJvdG9jb2wgc2hvdWxkIGJlIHVzZWQgZm9yIGdpdCBpbnRlcmFjdGlvbnMuICovXG4gIHVzZVNzaD86IGJvb2xlYW47XG4gIC8qKiBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgcmVwb3NpdG9yeSBpcyBwcml2YXRlLiAqL1xuICBwcml2YXRlPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBUaGUgZmlsZW5hbWUgZXhwZWN0ZWQgZm9yIGNyZWF0aW5nIHRoZSBuZy1kZXYgY29uZmlnLCB3aXRob3V0IHRoZSBmaWxlXG4gKiBleHRlbnNpb24gdG8gYWxsb3cgZWl0aGVyIGEgdHlwZXNjcmlwdCBvciBqYXZhc2NyaXB0IGZpbGUgdG8gYmUgdXNlZC5cbiAqL1xuY29uc3QgQ09ORklHX0ZJTEVfUEFUSCA9ICcubmctZGV2L2NvbmZpZyc7XG5cbi8qKiBUaGUgY29uZmlndXJhdGlvbiBmb3IgbmctZGV2LiAqL1xubGV0IGNhY2hlZENvbmZpZzoge30gfCBudWxsID0gbnVsbDtcblxuLyoqXG4gKiBUaGUgZmlsZW5hbWUgZXhwZWN0ZWQgZm9yIGxvY2FsIHVzZXIgY29uZmlnLCB3aXRob3V0IHRoZSBmaWxlIGV4dGVuc2lvbiB0byBhbGxvdyBhIHR5cGVzY3JpcHQsXG4gKiBqYXZhc2NyaXB0IG9yIGpzb24gZmlsZSB0byBiZSB1c2VkLlxuICovXG5jb25zdCBVU0VSX0NPTkZJR19GSUxFX1BBVEggPSAnLm5nLWRldi51c2VyJztcblxuLyoqIFRoZSBsb2NhbCB1c2VyIGNvbmZpZ3VyYXRpb24gZm9yIG5nLWRldi4gKi9cbmxldCB1c2VyQ29uZmlnOiB7W2tleTogc3RyaW5nXTogYW55fSB8IG51bGwgPSBudWxsO1xuXG4vKipcbiAqIFNldCB0aGUgY2FjaGVkIGNvbmZpZ3VyYXRpb24gb2JqZWN0IHRvIGJlIGxvYWRlZCBsYXRlci4gT25seSB0byBiZSB1c2VkIG9uIENJIHNpdHVhdGlvbnMgaW5cbiAqIHdoaWNoIGxvYWRpbmcgZnJvbSB0aGUgYC5uZy1kZXYvYCBkaXJlY3RvcnkgaXMgbm90IHBvc3NpYmxlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0Q29uZmlnKGNvbmZpZzoge30pIHtcbiAgY2FjaGVkQ29uZmlnID0gY29uZmlnO1xufVxuXG4vKipcbiAqIEdldCB0aGUgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBmaWxlIHN5c3RlbSwgcmV0dXJuaW5nIHRoZSBhbHJlYWR5IGxvYWRlZFxuICogY29weSBpZiBpdCBpcyBkZWZpbmVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29uZmlnKCk6IHt9O1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZyhiYXNlRGlyOiBzdHJpbmcpOiB7fTtcbmV4cG9ydCBmdW5jdGlvbiBnZXRDb25maWc8QSBleHRlbmRzIE11bHRpcGxlQXNzZXJ0aW9ucz4oYXNzZXJ0aW9uczogQSk6IEFzc2VydGlvbnM8QT47XG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29uZmlnKGJhc2VEaXJPckFzc2VydGlvbnM/OiB1bmtub3duKSB7XG4gIGxldCBiYXNlRGlyOiBzdHJpbmc7XG4gIGlmICh0eXBlb2YgYmFzZURpck9yQXNzZXJ0aW9ucyA9PT0gJ3N0cmluZycpIHtcbiAgICBiYXNlRGlyID0gYmFzZURpck9yQXNzZXJ0aW9ucztcbiAgfSBlbHNlIHtcbiAgICBiYXNlRGlyID0gR2l0Q2xpZW50LmdldCgpLmJhc2VEaXI7XG4gIH1cblxuICAvLyBJZiB0aGUgZ2xvYmFsIGNvbmZpZyBpcyBub3QgZGVmaW5lZCwgbG9hZCBpdCBmcm9tIHRoZSBmaWxlIHN5c3RlbS5cbiAgaWYgKGNhY2hlZENvbmZpZyA9PT0gbnVsbCkge1xuICAgIC8vIFRoZSBmdWxsIHBhdGggdG8gdGhlIGNvbmZpZ3VyYXRpb24gZmlsZS5cbiAgICBjb25zdCBjb25maWdQYXRoID0gam9pbihiYXNlRGlyLCBDT05GSUdfRklMRV9QQVRIKTtcbiAgICAvLyBSZWFkIHRoZSBjb25maWd1cmF0aW9uIGFuZCB2YWxpZGF0ZSBpdCBiZWZvcmUgY2FjaGluZyBpdCBmb3IgdGhlIGZ1dHVyZS5cbiAgICBjYWNoZWRDb25maWcgPSByZWFkQ29uZmlnRmlsZShjb25maWdQYXRoKTtcbiAgfVxuXG4gIGlmIChBcnJheS5pc0FycmF5KGJhc2VEaXJPckFzc2VydGlvbnMpKSB7XG4gICAgZm9yIChjb25zdCBhc3NlcnRpb24gb2YgYmFzZURpck9yQXNzZXJ0aW9ucykge1xuICAgICAgYXNzZXJ0aW9uKGNhY2hlZENvbmZpZyk7XG4gICAgfVxuICB9XG5cbiAgLy8gUmV0dXJuIGEgY2xvbmUgb2YgdGhlIGNhY2hlZCBnbG9iYWwgY29uZmlnIHRvIGVuc3VyZSB0aGF0IGEgbmV3IGluc3RhbmNlIG9mIHRoZSBjb25maWdcbiAgLy8gaXMgcmV0dXJuZWQgZWFjaCB0aW1lLCBwcmV2ZW50aW5nIHVuZXhwZWN0ZWQgZWZmZWN0cyBvZiBtb2RpZmljYXRpb25zIHRvIHRoZSBjb25maWcgb2JqZWN0LlxuICByZXR1cm4gey4uLmNhY2hlZENvbmZpZ307XG59XG5cbi8qKlxuICogR2V0IHRoZSBsb2NhbCB1c2VyIGNvbmZpZ3VyYXRpb24gZnJvbSB0aGUgZmlsZSBzeXN0ZW0sIHJldHVybmluZyB0aGUgYWxyZWFkeSBsb2FkZWQgY29weSBpZiBpdCBpc1xuICogZGVmaW5lZC5cbiAqXG4gKiBAcmV0dXJucyBUaGUgdXNlciBjb25maWd1cmF0aW9uIG9iamVjdCwgb3IgYW4gZW1wdHkgb2JqZWN0IGlmIG5vIHVzZXIgY29uZmlndXJhdGlvbiBmaWxlIGlzXG4gKiBwcmVzZW50LiBUaGUgb2JqZWN0IGlzIGFuIHVudHlwZWQgb2JqZWN0IGFzIHRoZXJlIGFyZSBubyByZXF1aXJlZCB1c2VyIGNvbmZpZ3VyYXRpb25zLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VXNlckNvbmZpZygpIHtcbiAgLy8gSWYgdGhlIGdsb2JhbCBjb25maWcgaXMgbm90IGRlZmluZWQsIGxvYWQgaXQgZnJvbSB0aGUgZmlsZSBzeXN0ZW0uXG4gIGlmICh1c2VyQ29uZmlnID09PSBudWxsKSB7XG4gICAgY29uc3QgZ2l0ID0gR2l0Q2xpZW50LmdldCgpO1xuICAgIC8vIFRoZSBmdWxsIHBhdGggdG8gdGhlIGNvbmZpZ3VyYXRpb24gZmlsZS5cbiAgICBjb25zdCBjb25maWdQYXRoID0gam9pbihnaXQuYmFzZURpciwgVVNFUl9DT05GSUdfRklMRV9QQVRIKTtcbiAgICAvLyBTZXQgdGhlIGdsb2JhbCBjb25maWcgb2JqZWN0LlxuICAgIHVzZXJDb25maWcgPSByZWFkQ29uZmlnRmlsZShjb25maWdQYXRoLCB0cnVlKTtcbiAgfVxuICAvLyBSZXR1cm4gYSBjbG9uZSBvZiB0aGUgdXNlciBjb25maWcgdG8gZW5zdXJlIHRoYXQgYSBuZXcgaW5zdGFuY2Ugb2YgdGhlIGNvbmZpZyBpcyByZXR1cm5lZFxuICAvLyBlYWNoIHRpbWUsIHByZXZlbnRpbmcgdW5leHBlY3RlZCBlZmZlY3RzIG9mIG1vZGlmaWNhdGlvbnMgdG8gdGhlIGNvbmZpZyBvYmplY3QuXG4gIHJldHVybiB7Li4udXNlckNvbmZpZ307XG59XG5cbi8qKiBBIHN0YW5kYXJkIGVycm9yIGNsYXNzIHRvIHRocm93biBkdXJpbmcgYXNzZXJ0aW9ucyB3aGlsZSB2YWxpZGF0aW5nIGNvbmZpZ3VyYXRpb24uICovXG5leHBvcnQgY2xhc3MgQ29uZmlnVmFsaWRhdGlvbkVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlPzogc3RyaW5nLCBwdWJsaWMgcmVhZG9ubHkgZXJyb3JzOiBzdHJpbmdbXSA9IFtdKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gIH1cbn1cblxuLyoqIFZhbGlkYXRlIHRoIGNvbmZpZ3VyYXRpb24gaGFzIGJlZW4gbWV0IGZvciB0aGUgbmctZGV2IGNvbW1hbmQuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0VmFsaWRHaXRodWJDb25maWc8VD4oXG4gIGNvbmZpZzogVCAmIFBhcnRpYWw8e2dpdGh1YjogR2l0aHViQ29uZmlnfT4sXG4pOiBhc3NlcnRzIGNvbmZpZyBpcyBUICYge2dpdGh1YjogR2l0aHViQ29uZmlnfSB7XG4gIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcbiAgLy8gVmFsaWRhdGUgdGhlIGdpdGh1YiBjb25maWd1cmF0aW9uLlxuICBpZiAoY29uZmlnLmdpdGh1YiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXJyb3JzLnB1c2goYEdpdGh1YiByZXBvc2l0b3J5IG5vdCBjb25maWd1cmVkLiBTZXQgdGhlIFwiZ2l0aHViXCIgb3B0aW9uLmApO1xuICB9IGVsc2Uge1xuICAgIGlmIChjb25maWcuZ2l0aHViLm5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZXJyb3JzLnB1c2goYFwiZ2l0aHViLm5hbWVcIiBpcyBub3QgZGVmaW5lZGApO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmdpdGh1Yi5vd25lciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvcnMucHVzaChgXCJnaXRodWIub3duZXJcIiBpcyBub3QgZGVmaW5lZGApO1xuICAgIH1cbiAgfVxuICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBDb25maWdWYWxpZGF0aW9uRXJyb3IoJ0ludmFsaWQgYGdpdGh1YmAgY29uZmlndXJhdGlvbicsIGVycm9ycyk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXNvbHZlcyBhbmQgcmVhZHMgdGhlIHNwZWNpZmllZCBjb25maWd1cmF0aW9uIGZpbGUsIG9wdGlvbmFsbHkgcmV0dXJuaW5nIGFuIGVtcHR5IG9iamVjdCBpZiB0aGVcbiAqIGNvbmZpZ3VyYXRpb24gZmlsZSBjYW5ub3QgYmUgcmVhZC5cbiAqL1xuZnVuY3Rpb24gcmVhZENvbmZpZ0ZpbGUoY29uZmlnUGF0aDogc3RyaW5nLCByZXR1cm5FbXB0eU9iamVjdE9uRXJyb3IgPSBmYWxzZSk6IHt9IHtcbiAgLy8gSWYgdGhlIGAudHNgIGV4dGVuc2lvbiBoYXMgbm90IGJlZW4gc2V0IHVwIGFscmVhZHksIGFuZCBhIFR5cGVTY3JpcHQgYmFzZWRcbiAgLy8gdmVyc2lvbiBvZiB0aGUgZ2l2ZW4gY29uZmlndXJhdGlvbiBzZWVtcyB0byBleGlzdCwgc2V0IHVwIGB0cy1ub2RlYCBpZiBhdmFpbGFibGUuXG4gIGlmIChcbiAgICByZXF1aXJlLmV4dGVuc2lvbnNbJy50cyddID09PSB1bmRlZmluZWQgJiZcbiAgICBleGlzdHNTeW5jKGAke2NvbmZpZ1BhdGh9LnRzYCkgJiZcbiAgICBpc1RzTm9kZUF2YWlsYWJsZSgpXG4gICkge1xuICAgIC8vIEVuc3VyZSB0aGUgbW9kdWxlIHRhcmdldCBpcyBzZXQgdG8gYGNvbW1vbmpzYC4gVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSB0aGVcbiAgICAvLyBkZXYtaW5mcmEgdG9vbCBydW5zIGluIE5vZGVKUyB3aGljaCBkb2VzIG5vdCBzdXBwb3J0IEVTIG1vZHVsZXMgYnkgZGVmYXVsdC5cbiAgICAvLyBBZGRpdGlvbmFsbHksIHNldCB0aGUgYGRpcmAgb3B0aW9uIHRvIHRoZSBkaXJlY3RvcnkgdGhhdCBjb250YWlucyB0aGUgY29uZmlndXJhdGlvblxuICAgIC8vIGZpbGUuIFRoaXMgYWxsb3dzIGZvciBjdXN0b20gY29tcGlsZXIgb3B0aW9ucyAoc3VjaCBhcyBgLS1zdHJpY3RgKS5cbiAgICByZXF1aXJlKCd0cy1ub2RlJykucmVnaXN0ZXIoe1xuICAgICAgZGlyOiBkaXJuYW1lKGNvbmZpZ1BhdGgpLFxuICAgICAgdHJhbnNwaWxlT25seTogdHJ1ZSxcbiAgICAgIGNvbXBpbGVyT3B0aW9uczoge21vZHVsZTogJ2NvbW1vbmpzJ30sXG4gICAgfSk7XG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiByZXF1aXJlKGNvbmZpZ1BhdGgpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKHJldHVybkVtcHR5T2JqZWN0T25FcnJvcikge1xuICAgICAgZGVidWcoYENvdWxkIG5vdCByZWFkIGNvbmZpZ3VyYXRpb24gZmlsZSBhdCAke2NvbmZpZ1BhdGh9LCByZXR1cm5pbmcgZW1wdHkgb2JqZWN0IGluc3RlYWQuYCk7XG4gICAgICBkZWJ1ZyhlKTtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgZXJyb3IoYENvdWxkIG5vdCByZWFkIGNvbmZpZ3VyYXRpb24gZmlsZSBhdCAke2NvbmZpZ1BhdGh9LmApO1xuICAgIGVycm9yKGUpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxufVxuIl19