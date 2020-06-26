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
    exports.getRepoBaseDir = exports.assertNoErrors = exports.getConfig = void 0;
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
    /** Resolves and reads the specified configuration file. */
    function readConfigFile(configPath) {
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
            console_1.error('Could not read configuration file.');
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgseUJBQThCO0lBQzlCLDZCQUFtQztJQUVuQyxvRUFBZ0M7SUFDaEMsb0VBQStCO0lBQy9CLG9FQUE0QztJQTZCNUM7OztPQUdHO0lBQ0gsSUFBTSxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztJQUUxQyxvQ0FBb0M7SUFDcEMsSUFBSSxNQUFNLEdBQVksSUFBSSxDQUFDO0lBRTNCOzs7T0FHRztJQUNILFNBQWdCLFNBQVM7UUFDdkIscUVBQXFFO1FBQ3JFLElBQUksTUFBTSxLQUFLLElBQUksRUFBRTtZQUNuQiwyQ0FBMkM7WUFDM0MsSUFBTSxVQUFVLEdBQUcsV0FBSSxDQUFDLGNBQWMsRUFBRSxFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFDNUQsZ0NBQWdDO1lBQ2hDLE1BQU0sR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDckM7UUFDRCw4RkFBOEY7UUFDOUYsa0ZBQWtGO1FBQ2xGLE9BQU8sb0JBQW9CLHNCQUFLLE1BQU0sRUFBRSxDQUFDO0lBQzNDLENBQUM7SUFYRCw4QkFXQztJQUVELDZFQUE2RTtJQUM3RSxTQUFTLG9CQUFvQixDQUFDLE1BQTRCO1FBQ3hELElBQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztRQUM1QixxQ0FBcUM7UUFDckMsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTtZQUMvQixNQUFNLENBQUMsSUFBSSxDQUFDLDhEQUE0RCxDQUFDLENBQUM7U0FDM0U7YUFBTTtZQUNMLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO2dCQUNwQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdDQUE4QixDQUFDLENBQUM7YUFDN0M7WUFDRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRTtnQkFDckMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQ0FBK0IsQ0FBQyxDQUFDO2FBQzlDO1NBQ0Y7UUFDRCxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkIsT0FBTyxNQUFxQixDQUFDO0lBQy9CLENBQUM7SUFFRCwyREFBMkQ7SUFDM0QsU0FBUyxjQUFjLENBQUMsVUFBa0I7UUFDeEMsaUZBQWlGO1FBQ2pGLG9GQUFvRjtRQUNwRixJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssU0FBUyxJQUFJLGVBQVUsQ0FBSSxVQUFVLFFBQUssQ0FBQztZQUN6RSwyQkFBaUIsRUFBRSxFQUFFO1lBQ3ZCLCtFQUErRTtZQUMvRSw4RUFBOEU7WUFDOUUsc0ZBQXNGO1lBQ3RGLHNFQUFzRTtZQUN0RSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxDQUN2QixFQUFDLEdBQUcsRUFBRSxjQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFDLEVBQUMsQ0FBQyxDQUFDO1NBQzdGO1FBRUQsSUFBSTtZQUNGLE9BQU8sT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQzVCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixlQUFLLENBQUMsb0NBQW9DLENBQUMsQ0FBQztZQUM1QyxlQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDVCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO0lBQ0gsQ0FBQztJQUVEOzs7T0FHRztJQUNILFNBQWdCLGNBQWMsQ0FBQyxNQUFnQjs7UUFDN0MsSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtZQUN0QixPQUFPO1NBQ1I7UUFDRCxlQUFLLENBQUMscURBQXFELENBQUMsQ0FBQzs7WUFDN0QsS0FBa0IsSUFBQSxXQUFBLGlCQUFBLE1BQU0sQ0FBQSw4QkFBQSxrREFBRTtnQkFBckIsSUFBTSxHQUFHLG1CQUFBO2dCQUNaLGVBQUssQ0FBQyxTQUFPLEdBQUssQ0FBQyxDQUFDO2FBQ3JCOzs7Ozs7Ozs7UUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFURCx3Q0FTQztJQUVELDhEQUE4RDtJQUM5RCxTQUFnQixjQUFjO1FBQzVCLElBQU0sV0FBVyxHQUFHLGNBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1FBQzFELElBQUksV0FBVyxDQUFDLElBQUksRUFBRTtZQUNwQixNQUFNLEtBQUssQ0FDUCxvRUFBb0U7Z0JBQ3BFLGtEQUFrRDtpQkFDbEQsY0FBWSxXQUFXLENBQUMsTUFBUSxDQUFBLENBQUMsQ0FBQztTQUN2QztRQUNELE9BQU8sV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFURCx3Q0FTQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2V4aXN0c1N5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7ZGlybmFtZSwgam9pbn0gZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7ZXJyb3J9IGZyb20gJy4vY29uc29sZSc7XG5pbXBvcnQge2V4ZWN9IGZyb20gJy4vc2hlbGxqcyc7XG5pbXBvcnQge2lzVHNOb2RlQXZhaWxhYmxlfSBmcm9tICcuL3RzLW5vZGUnO1xuXG4vKiogQ29uZmlndXJhdGlvbiBmb3IgR2l0IGNsaWVudCBpbnRlcmFjdGlvbnMuICovXG5leHBvcnQgaW50ZXJmYWNlIEdpdENsaWVudENvbmZpZyB7XG4gIC8qKiBPd25lciBuYW1lIG9mIHRoZSByZXBvc2l0b3J5LiAqL1xuICBvd25lcjogc3RyaW5nO1xuICAvKiogTmFtZSBvZiB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgbmFtZTogc3RyaW5nO1xuICAvKiogSWYgU1NIIHByb3RvY29sIHNob3VsZCBiZSB1c2VkIGZvciBnaXQgaW50ZXJhY3Rpb25zLiAqL1xuICB1c2VTc2g/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIERlc2NyaWJlcyB0aGUgR2l0aHViIGNvbmZpZ3VyYXRpb24gZm9yIGRldi1pbmZyYS4gVGhpcyBjb25maWd1cmF0aW9uIGlzXG4gKiB1c2VkIGZvciBBUEkgcmVxdWVzdHMsIGRldGVybWluaW5nIHRoZSB1cHN0cmVhbSByZW1vdGUsIGV0Yy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBHaXRodWJDb25maWcgZXh0ZW5kcyBHaXRDbGllbnRDb25maWcge31cblxuLyoqIFRoZSBjb21tb24gY29uZmlndXJhdGlvbiBmb3IgbmctZGV2LiAqL1xudHlwZSBDb21tb25Db25maWcgPSB7XG4gIGdpdGh1YjogR2l0aHViQ29uZmlnXG59O1xuXG4vKipcbiAqIFRoZSBjb25maWd1cmF0aW9uIGZvciB0aGUgc3BlY2lmaWMgbmctZGV2IGNvbW1hbmQsIHByb3ZpZGluZyBib3RoIHRoZSBjb21tb25cbiAqIG5nLWRldiBjb25maWcgYXMgd2VsbCBhcyB0aGUgc3BlY2lmaWMgY29uZmlnIG9mIGEgc3ViY29tbWFuZC5cbiAqL1xuZXhwb3J0IHR5cGUgTmdEZXZDb25maWc8VCA9IHt9PiA9IENvbW1vbkNvbmZpZyZUO1xuXG4vKipcbiAqIFRoZSBmaWxlbmFtZSBleHBlY3RlZCBmb3IgY3JlYXRpbmcgdGhlIG5nLWRldiBjb25maWcsIHdpdGhvdXQgdGhlIGZpbGVcbiAqIGV4dGVuc2lvbiB0byBhbGxvdyBlaXRoZXIgYSB0eXBlc2NyaXB0IG9yIGphdmFzY3JpcHQgZmlsZSB0byBiZSB1c2VkLlxuICovXG5jb25zdCBDT05GSUdfRklMRV9QQVRIID0gJy5uZy1kZXYvY29uZmlnJztcblxuLyoqIFRoZSBjb25maWd1cmF0aW9uIGZvciBuZy1kZXYuICovXG5sZXQgQ09ORklHOiB7fXxudWxsID0gbnVsbDtcblxuLyoqXG4gKiBHZXQgdGhlIGNvbmZpZ3VyYXRpb24gZnJvbSB0aGUgZmlsZSBzeXN0ZW0sIHJldHVybmluZyB0aGUgYWxyZWFkeSBsb2FkZWRcbiAqIGNvcHkgaWYgaXQgaXMgZGVmaW5lZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZygpOiBOZ0RldkNvbmZpZyB7XG4gIC8vIElmIHRoZSBnbG9iYWwgY29uZmlnIGlzIG5vdCBkZWZpbmVkLCBsb2FkIGl0IGZyb20gdGhlIGZpbGUgc3lzdGVtLlxuICBpZiAoQ09ORklHID09PSBudWxsKSB7XG4gICAgLy8gVGhlIGZ1bGwgcGF0aCB0byB0aGUgY29uZmlndXJhdGlvbiBmaWxlLlxuICAgIGNvbnN0IGNvbmZpZ1BhdGggPSBqb2luKGdldFJlcG9CYXNlRGlyKCksIENPTkZJR19GSUxFX1BBVEgpO1xuICAgIC8vIFNldCB0aGUgZ2xvYmFsIGNvbmZpZyBvYmplY3QuXG4gICAgQ09ORklHID0gcmVhZENvbmZpZ0ZpbGUoY29uZmlnUGF0aCk7XG4gIH1cbiAgLy8gUmV0dXJuIGEgY2xvbmUgb2YgdGhlIGdsb2JhbCBjb25maWcgdG8gZW5zdXJlIHRoYXQgYSBuZXcgaW5zdGFuY2Ugb2YgdGhlIGNvbmZpZyBpcyByZXR1cm5lZFxuICAvLyBlYWNoIHRpbWUsIHByZXZlbnRpbmcgdW5leHBlY3RlZCBlZmZlY3RzIG9mIG1vZGlmaWNhdGlvbnMgdG8gdGhlIGNvbmZpZyBvYmplY3QuXG4gIHJldHVybiB2YWxpZGF0ZUNvbW1vbkNvbmZpZyh7Li4uQ09ORklHfSk7XG59XG5cbi8qKiBWYWxpZGF0ZSB0aGUgY29tbW9uIGNvbmZpZ3VyYXRpb24gaGFzIGJlZW4gbWV0IGZvciB0aGUgbmctZGV2IGNvbW1hbmQuICovXG5mdW5jdGlvbiB2YWxpZGF0ZUNvbW1vbkNvbmZpZyhjb25maWc6IFBhcnRpYWw8TmdEZXZDb25maWc+KSB7XG4gIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcbiAgLy8gVmFsaWRhdGUgdGhlIGdpdGh1YiBjb25maWd1cmF0aW9uLlxuICBpZiAoY29uZmlnLmdpdGh1YiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXJyb3JzLnB1c2goYEdpdGh1YiByZXBvc2l0b3J5IG5vdCBjb25maWd1cmVkLiBTZXQgdGhlIFwiZ2l0aHViXCIgb3B0aW9uLmApO1xuICB9IGVsc2Uge1xuICAgIGlmIChjb25maWcuZ2l0aHViLm5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZXJyb3JzLnB1c2goYFwiZ2l0aHViLm5hbWVcIiBpcyBub3QgZGVmaW5lZGApO1xuICAgIH1cbiAgICBpZiAoY29uZmlnLmdpdGh1Yi5vd25lciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvcnMucHVzaChgXCJnaXRodWIub3duZXJcIiBpcyBub3QgZGVmaW5lZGApO1xuICAgIH1cbiAgfVxuICBhc3NlcnROb0Vycm9ycyhlcnJvcnMpO1xuICByZXR1cm4gY29uZmlnIGFzIE5nRGV2Q29uZmlnO1xufVxuXG4vKiogUmVzb2x2ZXMgYW5kIHJlYWRzIHRoZSBzcGVjaWZpZWQgY29uZmlndXJhdGlvbiBmaWxlLiAqL1xuZnVuY3Rpb24gcmVhZENvbmZpZ0ZpbGUoY29uZmlnUGF0aDogc3RyaW5nKTogb2JqZWN0IHtcbiAgLy8gSWYgdGhlIHRoZSBgLnRzYCBleHRlbnNpb24gaGFzIG5vdCBiZWVuIHNldCB1cCBhbHJlYWR5LCBhbmQgYSBUeXBlU2NyaXB0IGJhc2VkXG4gIC8vIHZlcnNpb24gb2YgdGhlIGdpdmVuIGNvbmZpZ3VyYXRpb24gc2VlbXMgdG8gZXhpc3QsIHNldCB1cCBgdHMtbm9kZWAgaWYgYXZhaWxhYmxlLlxuICBpZiAocmVxdWlyZS5leHRlbnNpb25zWycudHMnXSA9PT0gdW5kZWZpbmVkICYmIGV4aXN0c1N5bmMoYCR7Y29uZmlnUGF0aH0udHNgKSAmJlxuICAgICAgaXNUc05vZGVBdmFpbGFibGUoKSkge1xuICAgIC8vIEVuc3VyZSB0aGUgbW9kdWxlIHRhcmdldCBpcyBzZXQgdG8gYGNvbW1vbmpzYC4gVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSB0aGVcbiAgICAvLyBkZXYtaW5mcmEgdG9vbCBydW5zIGluIE5vZGVKUyB3aGljaCBkb2VzIG5vdCBzdXBwb3J0IEVTIG1vZHVsZXMgYnkgZGVmYXVsdC5cbiAgICAvLyBBZGRpdGlvbmFsbHksIHNldCB0aGUgYGRpcmAgb3B0aW9uIHRvIHRoZSBkaXJlY3RvcnkgdGhhdCBjb250YWlucyB0aGUgY29uZmlndXJhdGlvblxuICAgIC8vIGZpbGUuIFRoaXMgYWxsb3dzIGZvciBjdXN0b20gY29tcGlsZXIgb3B0aW9ucyAoc3VjaCBhcyBgLS1zdHJpY3RgKS5cbiAgICByZXF1aXJlKCd0cy1ub2RlJykucmVnaXN0ZXIoXG4gICAgICAgIHtkaXI6IGRpcm5hbWUoY29uZmlnUGF0aCksIHRyYW5zcGlsZU9ubHk6IHRydWUsIGNvbXBpbGVyT3B0aW9uczoge21vZHVsZTogJ2NvbW1vbmpzJ319KTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIHJlcXVpcmUoY29uZmlnUGF0aCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBlcnJvcignQ291bGQgbm90IHJlYWQgY29uZmlndXJhdGlvbiBmaWxlLicpO1xuICAgIGVycm9yKGUpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxufVxuXG4vKipcbiAqIEFzc2VydHMgdGhlIHByb3ZpZGVkIGFycmF5IG9mIGVycm9yIG1lc3NhZ2VzIGlzIGVtcHR5LiBJZiBhbnkgZXJyb3JzIGFyZSBpbiB0aGUgYXJyYXksXG4gKiBsb2dzIHRoZSBlcnJvcnMgYW5kIGV4aXQgdGhlIHByb2Nlc3MgYXMgYSBmYWlsdXJlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0Tm9FcnJvcnMoZXJyb3JzOiBzdHJpbmdbXSkge1xuICBpZiAoZXJyb3JzLmxlbmd0aCA9PSAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGVycm9yKGBFcnJvcnMgZGlzY292ZXJlZCB3aGlsZSBsb2FkaW5nIGNvbmZpZ3VyYXRpb24gZmlsZTpgKTtcbiAgZm9yIChjb25zdCBlcnIgb2YgZXJyb3JzKSB7XG4gICAgZXJyb3IoYCAgLSAke2Vycn1gKTtcbiAgfVxuICBwcm9jZXNzLmV4aXQoMSk7XG59XG5cbi8qKiBHZXRzIHRoZSBwYXRoIG9mIHRoZSBkaXJlY3RvcnkgZm9yIHRoZSByZXBvc2l0b3J5IGJhc2UuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVwb0Jhc2VEaXIoKSB7XG4gIGNvbnN0IGJhc2VSZXBvRGlyID0gZXhlYyhgZ2l0IHJldi1wYXJzZSAtLXNob3ctdG9wbGV2ZWxgKTtcbiAgaWYgKGJhc2VSZXBvRGlyLmNvZGUpIHtcbiAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgYFVuYWJsZSB0byBmaW5kIHRoZSBwYXRoIHRvIHRoZSBiYXNlIGRpcmVjdG9yeSBvZiB0aGUgcmVwb3NpdG9yeS5cXG5gICtcbiAgICAgICAgYFdhcyB0aGUgY29tbWFuZCBydW4gZnJvbSBpbnNpZGUgb2YgdGhlIHJlcG8/XFxuXFxuYCArXG4gICAgICAgIGBFUlJPUjpcXG4gJHtiYXNlUmVwb0Rpci5zdGRlcnJ9YCk7XG4gIH1cbiAgcmV0dXJuIGJhc2VSZXBvRGlyLnRyaW0oKTtcbn1cbiJdfQ==