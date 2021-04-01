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
        define("@angular/dev-infra-private/commit-message/validate-file/cli", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/commit-message/validate-file/validate-file"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ValidateFileModule = void 0;
    var tslib_1 = require("tslib");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var validate_file_1 = require("@angular/dev-infra-private/commit-message/validate-file/validate-file");
    /** Builds the command. */
    function builder(yargs) {
        var _a;
        return yargs
            .option('file', {
            type: 'string',
            conflicts: ['file-env-variable'],
            description: 'The path of the commit message file.',
        })
            .option('file-env-variable', {
            type: 'string',
            conflicts: ['file'],
            description: 'The key of the environment variable for the path of the commit message file.',
            coerce: function (arg) {
                var file = process.env[arg];
                if (!file) {
                    throw new Error("Provided environment variable \"" + arg + "\" was not found.");
                }
                return file;
            },
        })
            .option('error', {
            type: 'boolean',
            description: 'Whether invalid commit messages should be treated as failures rather than a warning',
            default: !!((_a = config_1.getUserConfig().commitMessage) === null || _a === void 0 ? void 0 : _a.errorOnInvalidMessage) || !!process.env['CI']
        });
    }
    /** Handles the command. */
    function handler(_a) {
        var error = _a.error, file = _a.file, fileEnvVariable = _a.fileEnvVariable;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var filePath;
            return tslib_1.__generator(this, function (_b) {
                filePath = file || fileEnvVariable || '.git/COMMIT_EDITMSG';
                validate_file_1.validateFile(filePath, error);
                return [2 /*return*/];
            });
        });
    }
    /** yargs command module describing the command. */
    exports.ValidateFileModule = {
        handler: handler,
        builder: builder,
        command: 'pre-commit-validate',
        describe: 'Validate the most recent commit message',
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL3ZhbGlkYXRlLWZpbGUvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFJSCxrRUFBaUQ7SUFFakQsdUdBQTZDO0lBUzdDLDBCQUEwQjtJQUMxQixTQUFTLE9BQU8sQ0FBQyxLQUFXOztRQUMxQixPQUFPLEtBQUs7YUFDUCxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQ2QsSUFBSSxFQUFFLFFBQVE7WUFDZCxTQUFTLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQztZQUNoQyxXQUFXLEVBQUUsc0NBQXNDO1NBQ3BELENBQUM7YUFDRCxNQUFNLENBQUMsbUJBQXdDLEVBQUU7WUFDaEQsSUFBSSxFQUFFLFFBQVE7WUFDZCxTQUFTLEVBQUUsQ0FBQyxNQUFNLENBQUM7WUFDbkIsV0FBVyxFQUFFLDhFQUE4RTtZQUMzRixNQUFNLEVBQUUsVUFBQyxHQUFXO2dCQUNsQixJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM5QixJQUFJLENBQUMsSUFBSSxFQUFFO29CQUNULE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQWtDLEdBQUcsc0JBQWtCLENBQUMsQ0FBQztpQkFDMUU7Z0JBQ0QsT0FBTyxJQUFJLENBQUM7WUFDZCxDQUFDO1NBQ0YsQ0FBQzthQUNELE1BQU0sQ0FBQyxPQUFPLEVBQUU7WUFDZixJQUFJLEVBQUUsU0FBUztZQUNmLFdBQVcsRUFDUCxxRkFBcUY7WUFDekYsT0FBTyxFQUFFLENBQUMsUUFBQyxzQkFBYSxFQUFFLENBQUMsYUFBYSwwQ0FBRSxxQkFBcUIsQ0FBQSxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztTQUN2RixDQUFDLENBQUM7SUFDVCxDQUFDO0lBRUQsMkJBQTJCO0lBQzNCLFNBQWUsT0FBTyxDQUFDLEVBQThEO1lBQTdELEtBQUssV0FBQSxFQUFFLElBQUksVUFBQSxFQUFFLGVBQWUscUJBQUE7Ozs7Z0JBQzVDLFFBQVEsR0FBRyxJQUFJLElBQUksZUFBZSxJQUFJLHFCQUFxQixDQUFDO2dCQUNsRSw0QkFBWSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQzs7OztLQUMvQjtJQUVELG1EQUFtRDtJQUN0QyxRQUFBLGtCQUFrQixHQUEyQztRQUN4RSxPQUFPLFNBQUE7UUFDUCxPQUFPLFNBQUE7UUFDUCxPQUFPLEVBQUUscUJBQXFCO1FBQzlCLFFBQVEsRUFBRSx5Q0FBeUM7S0FDcEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2dldFVzZXJDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5cbmltcG9ydCB7dmFsaWRhdGVGaWxlfSBmcm9tICcuL3ZhbGlkYXRlLWZpbGUnO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGVGaWxlT3B0aW9ucyB7XG4gIGZpbGU/OiBzdHJpbmc7XG4gIGZpbGVFbnZWYXJpYWJsZT86IHN0cmluZztcbiAgZXJyb3I6IGJvb2xlYW47XG59XG5cbi8qKiBCdWlsZHMgdGhlIGNvbW1hbmQuICovXG5mdW5jdGlvbiBidWlsZGVyKHlhcmdzOiBBcmd2KSB7XG4gIHJldHVybiB5YXJnc1xuICAgICAgLm9wdGlvbignZmlsZScsIHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGNvbmZsaWN0czogWydmaWxlLWVudi12YXJpYWJsZSddLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBwYXRoIG9mIHRoZSBjb21taXQgbWVzc2FnZSBmaWxlLicsXG4gICAgICB9KVxuICAgICAgLm9wdGlvbignZmlsZS1lbnYtdmFyaWFibGUnIGFzICdmaWxlRW52VmFyaWFibGUnLCB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBjb25mbGljdHM6IFsnZmlsZSddLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBrZXkgb2YgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlIGZvciB0aGUgcGF0aCBvZiB0aGUgY29tbWl0IG1lc3NhZ2UgZmlsZS4nLFxuICAgICAgICBjb2VyY2U6IChhcmc6IHN0cmluZykgPT4ge1xuICAgICAgICAgIGNvbnN0IGZpbGUgPSBwcm9jZXNzLmVudlthcmddO1xuICAgICAgICAgIGlmICghZmlsZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBQcm92aWRlZCBlbnZpcm9ubWVudCB2YXJpYWJsZSBcIiR7YXJnfVwiIHdhcyBub3QgZm91bmQuYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmaWxlO1xuICAgICAgICB9LFxuICAgICAgfSlcbiAgICAgIC5vcHRpb24oJ2Vycm9yJywge1xuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICAgJ1doZXRoZXIgaW52YWxpZCBjb21taXQgbWVzc2FnZXMgc2hvdWxkIGJlIHRyZWF0ZWQgYXMgZmFpbHVyZXMgcmF0aGVyIHRoYW4gYSB3YXJuaW5nJyxcbiAgICAgICAgZGVmYXVsdDogISFnZXRVc2VyQ29uZmlnKCkuY29tbWl0TWVzc2FnZT8uZXJyb3JPbkludmFsaWRNZXNzYWdlIHx8ICEhcHJvY2Vzcy5lbnZbJ0NJJ11cbiAgICAgIH0pO1xufVxuXG4vKiogSGFuZGxlcyB0aGUgY29tbWFuZC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoe2Vycm9yLCBmaWxlLCBmaWxlRW52VmFyaWFibGV9OiBBcmd1bWVudHM8VmFsaWRhdGVGaWxlT3B0aW9ucz4pIHtcbiAgY29uc3QgZmlsZVBhdGggPSBmaWxlIHx8IGZpbGVFbnZWYXJpYWJsZSB8fCAnLmdpdC9DT01NSVRfRURJVE1TRyc7XG4gIHZhbGlkYXRlRmlsZShmaWxlUGF0aCwgZXJyb3IpO1xufVxuXG4vKiogeWFyZ3MgY29tbWFuZCBtb2R1bGUgZGVzY3JpYmluZyB0aGUgY29tbWFuZC4gKi9cbmV4cG9ydCBjb25zdCBWYWxpZGF0ZUZpbGVNb2R1bGU6IENvbW1hbmRNb2R1bGU8e30sIFZhbGlkYXRlRmlsZU9wdGlvbnM+ID0ge1xuICBoYW5kbGVyLFxuICBidWlsZGVyLFxuICBjb21tYW5kOiAncHJlLWNvbW1pdC12YWxpZGF0ZScsXG4gIGRlc2NyaWJlOiAnVmFsaWRhdGUgdGhlIG1vc3QgcmVjZW50IGNvbW1pdCBtZXNzYWdlJyxcbn07XG4iXX0=