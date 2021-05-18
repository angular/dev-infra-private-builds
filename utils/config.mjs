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
import { GitClient } from './git/index';
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
        baseDir = baseDir || GitClient.getInstance().baseDir;
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
        var git = GitClient.getInstance();
        // The full path to the configuration file.
        var configPath = join(git.baseDir, USER_CONFIG_FILE_PATH);
        // Set the global config object.
        userConfig = readConfigFile(configPath, true);
    }
    // Return a clone of the user config to ensure that a new instance of the config is returned
    // each time, preventing unexpected effects of modifications to the config object.
    return __assign({}, userConfig);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLElBQUksQ0FBQztBQUM5QixPQUFPLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUVuQyxPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUN2QyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3RDLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQStCNUM7OztHQUdHO0FBQ0gsSUFBTSxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztBQUUxQyxvQ0FBb0M7QUFDcEMsSUFBSSxZQUFZLEdBQXFCLElBQUksQ0FBQztBQUUxQzs7O0dBR0c7QUFDSCxJQUFNLHFCQUFxQixHQUFHLGNBQWMsQ0FBQztBQUU3QywrQ0FBK0M7QUFDL0MsSUFBSSxVQUFVLEdBQThCLElBQUksQ0FBQztBQVFqRCxNQUFNLFVBQVUsU0FBUyxDQUFDLE9BQWdCO0lBQ3hDLHFFQUFxRTtJQUNyRSxJQUFJLFlBQVksS0FBSyxJQUFJLEVBQUU7UUFDekIsT0FBTyxHQUFHLE9BQU8sSUFBSSxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsT0FBTyxDQUFDO1FBQ3JELDJDQUEyQztRQUMzQyxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDbkQsMkVBQTJFO1FBQzNFLFlBQVksR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztLQUNqRTtJQUNELHlGQUF5RjtJQUN6Riw4RkFBOEY7SUFDOUYsb0JBQVcsWUFBWSxFQUFFO0FBQzNCLENBQUM7QUFFRCw2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RUFBRTtBQUN6QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXhpc3RzU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IHtkaXJuYW1lLCBqb2lufSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtkZWJ1ZywgZXJyb3J9IGZyb20gJy4vY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi9naXQvaW5kZXgnO1xuaW1wb3J0IHtpc1RzTm9kZUF2YWlsYWJsZX0gZnJvbSAnLi90cy1ub2RlJztcblxuLyoqIENvbmZpZ3VyYXRpb24gZm9yIEdpdCBjbGllbnQgaW50ZXJhY3Rpb25zLiAqL1xuZXhwb3J0IGludGVyZmFjZSBHaXRDbGllbnRDb25maWcge1xuICAvKiogT3duZXIgbmFtZSBvZiB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgb3duZXI6IHN0cmluZztcbiAgLyoqIE5hbWUgb2YgdGhlIHJlcG9zaXRvcnkuICovXG4gIG5hbWU6IHN0cmluZztcbiAgLyoqIElmIFNTSCBwcm90b2NvbCBzaG91bGQgYmUgdXNlZCBmb3IgZ2l0IGludGVyYWN0aW9ucy4gKi9cbiAgdXNlU3NoPzogYm9vbGVhbjtcbiAgLyoqIFdoZXRoZXIgdGhlIHNwZWNpZmllZCByZXBvc2l0b3J5IGlzIHByaXZhdGUuICovXG4gIHByaXZhdGU/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIERlc2NyaWJlcyB0aGUgR2l0aHViIGNvbmZpZ3VyYXRpb24gZm9yIGRldi1pbmZyYS4gVGhpcyBjb25maWd1cmF0aW9uIGlzXG4gKiB1c2VkIGZvciBBUEkgcmVxdWVzdHMsIGRldGVybWluaW5nIHRoZSB1cHN0cmVhbSByZW1vdGUsIGV0Yy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBHaXRodWJDb25maWcgZXh0ZW5kcyBHaXRDbGllbnRDb25maWcge31cblxuLyoqIFRoZSBjb21tb24gY29uZmlndXJhdGlvbiBmb3IgbmctZGV2LiAqL1xudHlwZSBDb21tb25Db25maWcgPSB7XG4gIGdpdGh1YjogR2l0aHViQ29uZmlnXG59O1xuXG4vKipcbiAqIFRoZSBjb25maWd1cmF0aW9uIGZvciB0aGUgc3BlY2lmaWMgbmctZGV2IGNvbW1hbmQsIHByb3ZpZGluZyBib3RoIHRoZSBjb21tb25cbiAqIG5nLWRldiBjb25maWcgYXMgd2VsbCBhcyB0aGUgc3BlY2lmaWMgY29uZmlnIG9mIGEgc3ViY29tbWFuZC5cbiAqL1xuZXhwb3J0IHR5cGUgTmdEZXZDb25maWc8VCA9IHt9PiA9IENvbW1vbkNvbmZpZyZUO1xuXG4vKipcbiAqIFRoZSBmaWxlbmFtZSBleHBlY3RlZCBmb3IgY3JlYXRpbmcgdGhlIG5nLWRldiBjb25maWcsIHdpdGhvdXQgdGhlIGZpbGVcbiAqIGV4dGVuc2lvbiB0byBhbGxvdyBlaXRoZXIgYSB0eXBlc2NyaXB0IG9yIGphdmFzY3JpcHQgZmlsZSB0byBiZSB1c2VkLlxuICovXG5jb25zdCBDT05GSUdfRklMRV9QQVRIID0gJy5uZy1kZXYvY29uZmlnJztcblxuLyoqIFRoZSBjb25maWd1cmF0aW9uIGZvciBuZy1kZXYuICovXG5sZXQgY2FjaGVkQ29uZmlnOiBOZ0RldkNvbmZpZ3xudWxsID0gbnVsbDtcblxuLyoqXG4gKiBUaGUgZmlsZW5hbWUgZXhwZWN0ZWQgZm9yIGxvY2FsIHVzZXIgY29uZmlnLCB3aXRob3V0IHRoZSBmaWxlIGV4dGVuc2lvbiB0byBhbGxvdyBhIHR5cGVzY3JpcHQsXG4gKiBqYXZhc2NyaXB0IG9yIGpzb24gZmlsZSB0byBiZSB1c2VkLlxuICovXG5jb25zdCBVU0VSX0NPTkZJR19GSUxFX1BBVEggPSAnLm5nLWRldi51c2VyJztcblxuLyoqIFRoZSBsb2NhbCB1c2VyIGNvbmZpZ3VyYXRpb24gZm9yIG5nLWRldi4gKi9cbmxldCB1c2VyQ29uZmlnOiB7W2tleTogc3RyaW5nXTogYW55fXxudWxsID0gbnVsbDtcblxuLyoqXG4gKiBHZXQgdGhlIGNvbmZpZ3VyYXRpb24gZnJvbSB0aGUgZmlsZSBzeXN0ZW0sIHJldHVybmluZyB0aGUgYWxyZWFkeSBsb2FkZWRcbiAqIGNvcHkgaWYgaXQgaXMgZGVmaW5lZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZygpOiBOZ0RldkNvbmZpZztcbmV4cG9ydCBmdW5jdGlvbiBnZXRDb25maWcoYmFzZURpcj86IHN0cmluZyk6IE5nRGV2Q29uZmlnO1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZyhiYXNlRGlyPzogc3RyaW5nKTogTmdEZXZDb25maWcge1xuICAvLyBJZiB0aGUgZ2xvYmFsIGNvbmZpZyBpcyBub3QgZGVmaW5lZCwgbG9hZCBpdCBmcm9tIHRoZSBmaWxlIHN5c3RlbS5cbiAgaWYgKGNhY2hlZENvbmZpZyA9PT0gbnVsbCkge1xuICAgIGJhc2VEaXIgPSBiYXNlRGlyIHx8IEdpdENsaWVudC5nZXRJbnN0YW5jZSgpLmJhc2VEaXI7XG4gICAgLy8gVGhlIGZ1bGwgcGF0aCB0byB0aGUgY29uZmlndXJhdGlvbiBmaWxlLlxuICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBqb2luKGJhc2VEaXIsIENPTkZJR19GSUxFX1BBVEgpO1xuICAgIC8vIFJlYWQgdGhlIGNvbmZpZ3VyYXRpb24gYW5kIHZhbGlkYXRlIGl0IGJlZm9yZSBjYWNoaW5nIGl0IGZvciB0aGUgZnV0dXJlLlxuICAgIGNhY2hlZENvbmZpZyA9IHZhbGlkYXRlQ29tbW9uQ29uZmlnKHJlYWRDb25maWdGaWxlKGNvbmZpZ1BhdGgpKTtcbiAgfVxuICAvLyBSZXR1cm4gYSBjbG9uZSBvZiB0aGUgY2FjaGVkIGdsb2JhbCBjb25maWcgdG8gZW5zdXJlIHRoYXQgYSBuZXcgaW5zdGFuY2Ugb2YgdGhlIGNvbmZpZ1xuICAvLyBpcyByZXR1cm5lZCBlYWNoIHRpbWUsIHByZXZlbnRpbmcgdW5leHBlY3RlZCBlZmZlY3RzIG9mIG1vZGlmaWNhdGlvbnMgdG8gdGhlIGNvbmZpZyBvYmplY3QuXG4gIHJldHVybiB7Li4uY2FjaGVkQ29uZmlnfTtcbn1cblxuLyoqIFZhbGlkYXRlIHRoZSBjb21tb24gY29uZmlndXJhdGlvbiBoYXMgYmVlbiBtZXQgZm9yIHRoZSBuZy1kZXYgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlQ29tbW9uQ29uZmlnKGNvbmZpZzogUGFydGlhbDxOZ0RldkNvbmZpZz4pIHtcbiAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuICAvLyBWYWxpZGF0ZSB0aGUgZ2l0aHViIGNvbmZpZ3VyYXRpb24uXG4gIGlmIChjb25maWcuZ2l0aHViID09PSB1bmRlZmluZWQpIHtcbiAgICBlcnJvcnMucHVzaChgR2l0aHViIHJlcG9zaXRvcnkgbm90IGNvbmZpZ3VyZWQuIFNldCB0aGUgXCJnaXRodWJcIiBvcHRpb24uYCk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGNvbmZpZy5naXRodWIubmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvcnMucHVzaChgXCJnaXRodWIubmFtZVwiIGlzIG5vdCBkZWZpbmVkYCk7XG4gICAgfVxuICAgIGlmIChjb25maWcuZ2l0aHViLm93bmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBcImdpdGh1Yi5vd25lclwiIGlzIG5vdCBkZWZpbmVkYCk7XG4gICAgfVxuICB9XG4gIGFzc2VydE5vRXJyb3JzKGVycm9ycyk7XG4gIHJldHVybiBjb25maWcgYXMgTmdEZXZDb25maWc7XG59XG5cbi8qKlxuICogUmVzb2x2ZXMgYW5kIHJlYWRzIHRoZSBzcGVjaWZpZWQgY29uZmlndXJhdGlvbiBmaWxlLCBvcHRpb25hbGx5IHJldHVybmluZyBhbiBlbXB0eSBvYmplY3QgaWYgdGhlXG4gKiBjb25maWd1cmF0aW9uIGZpbGUgY2Fubm90IGJlIHJlYWQuXG4gKi9cbmZ1bmN0aW9uIHJlYWRDb25maWdGaWxlKGNvbmZpZ1BhdGg6IHN0cmluZywgcmV0dXJuRW1wdHlPYmplY3RPbkVycm9yID0gZmFsc2UpOiBvYmplY3Qge1xuICAvLyBJZiB0aGUgYC50c2AgZXh0ZW5zaW9uIGhhcyBub3QgYmVlbiBzZXQgdXAgYWxyZWFkeSwgYW5kIGEgVHlwZVNjcmlwdCBiYXNlZFxuICAvLyB2ZXJzaW9uIG9mIHRoZSBnaXZlbiBjb25maWd1cmF0aW9uIHNlZW1zIHRvIGV4aXN0LCBzZXQgdXAgYHRzLW5vZGVgIGlmIGF2YWlsYWJsZS5cbiAgaWYgKHJlcXVpcmUuZXh0ZW5zaW9uc1snLnRzJ10gPT09IHVuZGVmaW5lZCAmJiBleGlzdHNTeW5jKGAke2NvbmZpZ1BhdGh9LnRzYCkgJiZcbiAgICAgIGlzVHNOb2RlQXZhaWxhYmxlKCkpIHtcbiAgICAvLyBFbnN1cmUgdGhlIG1vZHVsZSB0YXJnZXQgaXMgc2V0IHRvIGBjb21tb25qc2AuIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2UgdGhlXG4gICAgLy8gZGV2LWluZnJhIHRvb2wgcnVucyBpbiBOb2RlSlMgd2hpY2ggZG9lcyBub3Qgc3VwcG9ydCBFUyBtb2R1bGVzIGJ5IGRlZmF1bHQuXG4gICAgLy8gQWRkaXRpb25hbGx5LCBzZXQgdGhlIGBkaXJgIG9wdGlvbiB0byB0aGUgZGlyZWN0b3J5IHRoYXQgY29udGFpbnMgdGhlIGNvbmZpZ3VyYXRpb25cbiAgICAvLyBmaWxlLiBUaGlzIGFsbG93cyBmb3IgY3VzdG9tIGNvbXBpbGVyIG9wdGlvbnMgKHN1Y2ggYXMgYC0tc3RyaWN0YCkuXG4gICAgcmVxdWlyZSgndHMtbm9kZScpLnJlZ2lzdGVyKFxuICAgICAgICB7ZGlyOiBkaXJuYW1lKGNvbmZpZ1BhdGgpLCB0cmFuc3BpbGVPbmx5OiB0cnVlLCBjb21waWxlck9wdGlvbnM6IHttb2R1bGU6ICdjb21tb25qcyd9fSk7XG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiByZXF1aXJlKGNvbmZpZ1BhdGgpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKHJldHVybkVtcHR5T2JqZWN0T25FcnJvcikge1xuICAgICAgZGVidWcoYENvdWxkIG5vdCByZWFkIGNvbmZpZ3VyYXRpb24gZmlsZSBhdCAke2NvbmZpZ1BhdGh9LCByZXR1cm5pbmcgZW1wdHkgb2JqZWN0IGluc3RlYWQuYCk7XG4gICAgICBkZWJ1ZyhlKTtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgZXJyb3IoYENvdWxkIG5vdCByZWFkIGNvbmZpZ3VyYXRpb24gZmlsZSBhdCAke2NvbmZpZ1BhdGh9LmApO1xuICAgIGVycm9yKGUpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxufVxuXG4vKipcbiAqIEFzc2VydHMgdGhlIHByb3ZpZGVkIGFycmF5IG9mIGVycm9yIG1lc3NhZ2VzIGlzIGVtcHR5LiBJZiBhbnkgZXJyb3JzIGFyZSBpbiB0aGUgYXJyYXksXG4gKiBsb2dzIHRoZSBlcnJvcnMgYW5kIGV4aXQgdGhlIHByb2Nlc3MgYXMgYSBmYWlsdXJlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0Tm9FcnJvcnMoZXJyb3JzOiBzdHJpbmdbXSkge1xuICBpZiAoZXJyb3JzLmxlbmd0aCA9PSAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGVycm9yKGBFcnJvcnMgZGlzY292ZXJlZCB3aGlsZSBsb2FkaW5nIGNvbmZpZ3VyYXRpb24gZmlsZTpgKTtcbiAgZm9yIChjb25zdCBlcnIgb2YgZXJyb3JzKSB7XG4gICAgZXJyb3IoYCAgLSAke2Vycn1gKTtcbiAgfVxuICBwcm9jZXNzLmV4aXQoMSk7XG59XG5cbi8qKlxuICogR2V0IHRoZSBsb2NhbCB1c2VyIGNvbmZpZ3VyYXRpb24gZnJvbSB0aGUgZmlsZSBzeXN0ZW0sIHJldHVybmluZyB0aGUgYWxyZWFkeSBsb2FkZWQgY29weSBpZiBpdCBpc1xuICogZGVmaW5lZC5cbiAqXG4gKiBAcmV0dXJucyBUaGUgdXNlciBjb25maWd1cmF0aW9uIG9iamVjdCwgb3IgYW4gZW1wdHkgb2JqZWN0IGlmIG5vIHVzZXIgY29uZmlndXJhdGlvbiBmaWxlIGlzXG4gKiBwcmVzZW50LiBUaGUgb2JqZWN0IGlzIGFuIHVudHlwZWQgb2JqZWN0IGFzIHRoZXJlIGFyZSBubyByZXF1aXJlZCB1c2VyIGNvbmZpZ3VyYXRpb25zLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VXNlckNvbmZpZygpIHtcbiAgLy8gSWYgdGhlIGdsb2JhbCBjb25maWcgaXMgbm90IGRlZmluZWQsIGxvYWQgaXQgZnJvbSB0aGUgZmlsZSBzeXN0ZW0uXG4gIGlmICh1c2VyQ29uZmlnID09PSBudWxsKSB7XG4gICAgY29uc3QgZ2l0ID0gR2l0Q2xpZW50LmdldEluc3RhbmNlKCk7XG4gICAgLy8gVGhlIGZ1bGwgcGF0aCB0byB0aGUgY29uZmlndXJhdGlvbiBmaWxlLlxuICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBqb2luKGdpdC5iYXNlRGlyLCBVU0VSX0NPTkZJR19GSUxFX1BBVEgpO1xuICAgIC8vIFNldCB0aGUgZ2xvYmFsIGNvbmZpZyBvYmplY3QuXG4gICAgdXNlckNvbmZpZyA9IHJlYWRDb25maWdGaWxlKGNvbmZpZ1BhdGgsIHRydWUpO1xuICB9XG4gIC8vIFJldHVybiBhIGNsb25lIG9mIHRoZSB1c2VyIGNvbmZpZyB0byBlbnN1cmUgdGhhdCBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgY29uZmlnIGlzIHJldHVybmVkXG4gIC8vIGVhY2ggdGltZSwgcHJldmVudGluZyB1bmV4cGVjdGVkIGVmZmVjdHMgb2YgbW9kaWZpY2F0aW9ucyB0byB0aGUgY29uZmlnIG9iamVjdC5cbiAgcmV0dXJuIHsuLi51c2VyQ29uZmlnfTtcbn1cbiJdfQ==