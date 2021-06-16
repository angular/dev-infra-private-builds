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
                if (arg === undefined) {
                    return arg;
                }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL3ZhbGlkYXRlLWZpbGUvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFJSCxrRUFBaUQ7SUFFakQsdUdBQTZDO0lBUzdDLDBCQUEwQjtJQUMxQixTQUFTLE9BQU8sQ0FBQyxLQUFXOztRQUMxQixPQUFPLEtBQUs7YUFDUCxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQ2QsSUFBSSxFQUFFLFFBQVE7WUFDZCxTQUFTLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQztZQUNoQyxXQUFXLEVBQUUsc0NBQXNDO1NBQ3BELENBQUM7YUFDRCxNQUFNLENBQUMsbUJBQXdDLEVBQUU7WUFDaEQsSUFBSSxFQUFFLFFBQVE7WUFDZCxTQUFTLEVBQUUsQ0FBQyxNQUFNLENBQUM7WUFDbkIsV0FBVyxFQUFFLDhFQUE4RTtZQUMzRixNQUFNLEVBQUUsVUFBQyxHQUFxQjtnQkFDNUIsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFO29CQUNyQixPQUFPLEdBQUcsQ0FBQztpQkFDWjtnQkFDRCxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM5QixJQUFJLENBQUMsSUFBSSxFQUFFO29CQUNULE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQWtDLEdBQUcsc0JBQWtCLENBQUMsQ0FBQztpQkFDMUU7Z0JBQ0QsT0FBTyxJQUFJLENBQUM7WUFDZCxDQUFDO1NBQ0YsQ0FBQzthQUNELE1BQU0sQ0FBQyxPQUFPLEVBQUU7WUFDZixJQUFJLEVBQUUsU0FBUztZQUNmLFdBQVcsRUFDUCxxRkFBcUY7WUFDekYsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFBLE1BQUEsc0JBQWEsRUFBRSxDQUFDLGFBQWEsMENBQUUscUJBQXFCLENBQUEsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7U0FDdkYsQ0FBQyxDQUFDO0lBQ1QsQ0FBQztJQUVELDJCQUEyQjtJQUMzQixTQUFlLE9BQU8sQ0FBQyxFQUE4RDtZQUE3RCxLQUFLLFdBQUEsRUFBRSxJQUFJLFVBQUEsRUFBRSxlQUFlLHFCQUFBOzs7O2dCQUM1QyxRQUFRLEdBQUcsSUFBSSxJQUFJLGVBQWUsSUFBSSxxQkFBcUIsQ0FBQztnQkFDbEUsNEJBQVksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7Ozs7S0FDL0I7SUFFRCxtREFBbUQ7SUFDdEMsUUFBQSxrQkFBa0IsR0FBMkM7UUFDeEUsT0FBTyxTQUFBO1FBQ1AsT0FBTyxTQUFBO1FBQ1AsT0FBTyxFQUFFLHFCQUFxQjtRQUM5QixRQUFRLEVBQUUseUNBQXlDO0tBQ3BELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3YsIENvbW1hbmRNb2R1bGV9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtnZXRVc2VyQ29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuXG5pbXBvcnQge3ZhbGlkYXRlRmlsZX0gZnJvbSAnLi92YWxpZGF0ZS1maWxlJztcblxuXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRlRmlsZU9wdGlvbnMge1xuICBmaWxlPzogc3RyaW5nO1xuICBmaWxlRW52VmFyaWFibGU/OiBzdHJpbmc7XG4gIGVycm9yOiBib29sZWFuO1xufVxuXG4vKiogQnVpbGRzIHRoZSBjb21tYW5kLiAqL1xuZnVuY3Rpb24gYnVpbGRlcih5YXJnczogQXJndikge1xuICByZXR1cm4geWFyZ3NcbiAgICAgIC5vcHRpb24oJ2ZpbGUnLCB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBjb25mbGljdHM6IFsnZmlsZS1lbnYtdmFyaWFibGUnXSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgcGF0aCBvZiB0aGUgY29tbWl0IG1lc3NhZ2UgZmlsZS4nLFxuICAgICAgfSlcbiAgICAgIC5vcHRpb24oJ2ZpbGUtZW52LXZhcmlhYmxlJyBhcyAnZmlsZUVudlZhcmlhYmxlJywge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgY29uZmxpY3RzOiBbJ2ZpbGUnXSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGUga2V5IG9mIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZSBmb3IgdGhlIHBhdGggb2YgdGhlIGNvbW1pdCBtZXNzYWdlIGZpbGUuJyxcbiAgICAgICAgY29lcmNlOiAoYXJnOiBzdHJpbmd8dW5kZWZpbmVkKSA9PiB7XG4gICAgICAgICAgaWYgKGFyZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gYXJnO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBmaWxlID0gcHJvY2Vzcy5lbnZbYXJnXTtcbiAgICAgICAgICBpZiAoIWZpbGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUHJvdmlkZWQgZW52aXJvbm1lbnQgdmFyaWFibGUgXCIke2FyZ31cIiB3YXMgbm90IGZvdW5kLmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmlsZTtcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgICAub3B0aW9uKCdlcnJvcicsIHtcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAgICdXaGV0aGVyIGludmFsaWQgY29tbWl0IG1lc3NhZ2VzIHNob3VsZCBiZSB0cmVhdGVkIGFzIGZhaWx1cmVzIHJhdGhlciB0aGFuIGEgd2FybmluZycsXG4gICAgICAgIGRlZmF1bHQ6ICEhZ2V0VXNlckNvbmZpZygpLmNvbW1pdE1lc3NhZ2U/LmVycm9yT25JbnZhbGlkTWVzc2FnZSB8fCAhIXByb2Nlc3MuZW52WydDSSddXG4gICAgICB9KTtcbn1cblxuLyoqIEhhbmRsZXMgdGhlIGNvbW1hbmQuICovXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVyKHtlcnJvciwgZmlsZSwgZmlsZUVudlZhcmlhYmxlfTogQXJndW1lbnRzPFZhbGlkYXRlRmlsZU9wdGlvbnM+KSB7XG4gIGNvbnN0IGZpbGVQYXRoID0gZmlsZSB8fCBmaWxlRW52VmFyaWFibGUgfHwgJy5naXQvQ09NTUlUX0VESVRNU0cnO1xuICB2YWxpZGF0ZUZpbGUoZmlsZVBhdGgsIGVycm9yKTtcbn1cblxuLyoqIHlhcmdzIGNvbW1hbmQgbW9kdWxlIGRlc2NyaWJpbmcgdGhlIGNvbW1hbmQuICovXG5leHBvcnQgY29uc3QgVmFsaWRhdGVGaWxlTW9kdWxlOiBDb21tYW5kTW9kdWxlPHt9LCBWYWxpZGF0ZUZpbGVPcHRpb25zPiA9IHtcbiAgaGFuZGxlcixcbiAgYnVpbGRlcixcbiAgY29tbWFuZDogJ3ByZS1jb21taXQtdmFsaWRhdGUnLFxuICBkZXNjcmliZTogJ1ZhbGlkYXRlIHRoZSBtb3N0IHJlY2VudCBjb21taXQgbWVzc2FnZScsXG59O1xuIl19