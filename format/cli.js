(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/format/cli", ["require", "exports", "yargs", "@angular/dev-infra-private/utils/repo-files", "@angular/dev-infra-private/format/format"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildFormatParser = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var yargs = require("yargs");
    var repo_files_1 = require("@angular/dev-infra-private/utils/repo-files");
    var format_1 = require("@angular/dev-infra-private/format/format");
    /** Build the parser for the format commands. */
    function buildFormatParser(localYargs) {
        return localYargs.help()
            .strict()
            .demandCommand()
            .option('check', {
            type: 'boolean',
            default: process.env['CI'] ? true : false,
            description: 'Run the formatter to check formatting rather than updating code format'
        })
            .command('all', 'Run the formatter on all files in the repository', {}, function (_a) {
            var check = _a.check;
            var executionCmd = check ? format_1.checkFiles : format_1.formatFiles;
            executionCmd(repo_files_1.allFiles());
        })
            .command('changed [shaOrRef]', 'Run the formatter on files changed since the provided sha/ref', {}, function (_a) {
            var shaOrRef = _a.shaOrRef, check = _a.check;
            var sha = shaOrRef || 'master';
            var executionCmd = check ? format_1.checkFiles : format_1.formatFiles;
            executionCmd(repo_files_1.allChangedFilesSince(sha));
        })
            .command('staged', 'Run the formatter on all staged files', {}, function (_a) {
            var check = _a.check;
            var executionCmd = check ? format_1.checkFiles : format_1.formatFiles;
            executionCmd(repo_files_1.allStagedFiles());
        })
            .command('files <files..>', 'Run the formatter on provided files', {}, function (_a) {
            var check = _a.check, files = _a.files;
            var executionCmd = check ? format_1.checkFiles : format_1.formatFiles;
            executionCmd(files);
        });
    }
    exports.buildFormatParser = buildFormatParser;
    if (require.main === module) {
        buildFormatParser(yargs).parse();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsNkJBQStCO0lBRS9CLDBFQUFtRjtJQUVuRixtRUFBaUQ7SUFFakQsZ0RBQWdEO0lBQ2hELFNBQWdCLGlCQUFpQixDQUFDLFVBQXNCO1FBQ3RELE9BQU8sVUFBVSxDQUFDLElBQUksRUFBRTthQUNuQixNQUFNLEVBQUU7YUFDUixhQUFhLEVBQUU7YUFDZixNQUFNLENBQUMsT0FBTyxFQUFFO1lBQ2YsSUFBSSxFQUFFLFNBQVM7WUFDZixPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLO1lBQ3pDLFdBQVcsRUFBRSx3RUFBd0U7U0FDdEYsQ0FBQzthQUNELE9BQU8sQ0FDSixLQUFLLEVBQUUsa0RBQWtELEVBQUUsRUFBRSxFQUM3RCxVQUFDLEVBQU87Z0JBQU4sS0FBSyxXQUFBO1lBQ0wsSUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxtQkFBVSxDQUFDLENBQUMsQ0FBQyxvQkFBVyxDQUFDO1lBQ3RELFlBQVksQ0FBQyxxQkFBUSxFQUFFLENBQUMsQ0FBQztRQUMzQixDQUFDLENBQUM7YUFDTCxPQUFPLENBQ0osb0JBQW9CLEVBQUUsK0RBQStELEVBQUUsRUFBRSxFQUN6RixVQUFDLEVBQWlCO2dCQUFoQixRQUFRLGNBQUEsRUFBRSxLQUFLLFdBQUE7WUFDZixJQUFNLEdBQUcsR0FBRyxRQUFRLElBQUksUUFBUSxDQUFDO1lBQ2pDLElBQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsbUJBQVUsQ0FBQyxDQUFDLENBQUMsb0JBQVcsQ0FBQztZQUN0RCxZQUFZLENBQUMsaUNBQW9CLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMxQyxDQUFDLENBQUM7YUFDTCxPQUFPLENBQ0osUUFBUSxFQUFFLHVDQUF1QyxFQUFFLEVBQUUsRUFDckQsVUFBQyxFQUFPO2dCQUFOLEtBQUssV0FBQTtZQUNMLElBQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsbUJBQVUsQ0FBQyxDQUFDLENBQUMsb0JBQVcsQ0FBQztZQUN0RCxZQUFZLENBQUMsMkJBQWMsRUFBRSxDQUFDLENBQUM7UUFDakMsQ0FBQyxDQUFDO2FBQ0wsT0FBTyxDQUFDLGlCQUFpQixFQUFFLHFDQUFxQyxFQUFFLEVBQUUsRUFBRSxVQUFDLEVBQWM7Z0JBQWIsS0FBSyxXQUFBLEVBQUUsS0FBSyxXQUFBO1lBQ25GLElBQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsbUJBQVUsQ0FBQyxDQUFDLENBQUMsb0JBQVcsQ0FBQztZQUN0RCxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUM7SUFDVCxDQUFDO0lBaENELDhDQWdDQztJQUVELElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7UUFDM0IsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDbEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHthbGxDaGFuZ2VkRmlsZXNTaW5jZSwgYWxsRmlsZXMsIGFsbFN0YWdlZEZpbGVzfSBmcm9tICcuLi91dGlscy9yZXBvLWZpbGVzJztcblxuaW1wb3J0IHtjaGVja0ZpbGVzLCBmb3JtYXRGaWxlc30gZnJvbSAnLi9mb3JtYXQnO1xuXG4vKiogQnVpbGQgdGhlIHBhcnNlciBmb3IgdGhlIGZvcm1hdCBjb21tYW5kcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEZvcm1hdFBhcnNlcihsb2NhbFlhcmdzOiB5YXJncy5Bcmd2KSB7XG4gIHJldHVybiBsb2NhbFlhcmdzLmhlbHAoKVxuICAgICAgLnN0cmljdCgpXG4gICAgICAuZGVtYW5kQ29tbWFuZCgpXG4gICAgICAub3B0aW9uKCdjaGVjaycsIHtcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBwcm9jZXNzLmVudlsnQ0knXSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdSdW4gdGhlIGZvcm1hdHRlciB0byBjaGVjayBmb3JtYXR0aW5nIHJhdGhlciB0aGFuIHVwZGF0aW5nIGNvZGUgZm9ybWF0J1xuICAgICAgfSlcbiAgICAgIC5jb21tYW5kKFxuICAgICAgICAgICdhbGwnLCAnUnVuIHRoZSBmb3JtYXR0ZXIgb24gYWxsIGZpbGVzIGluIHRoZSByZXBvc2l0b3J5Jywge30sXG4gICAgICAgICAgKHtjaGVja30pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGV4ZWN1dGlvbkNtZCA9IGNoZWNrID8gY2hlY2tGaWxlcyA6IGZvcm1hdEZpbGVzO1xuICAgICAgICAgICAgZXhlY3V0aW9uQ21kKGFsbEZpbGVzKCkpO1xuICAgICAgICAgIH0pXG4gICAgICAuY29tbWFuZChcbiAgICAgICAgICAnY2hhbmdlZCBbc2hhT3JSZWZdJywgJ1J1biB0aGUgZm9ybWF0dGVyIG9uIGZpbGVzIGNoYW5nZWQgc2luY2UgdGhlIHByb3ZpZGVkIHNoYS9yZWYnLCB7fSxcbiAgICAgICAgICAoe3NoYU9yUmVmLCBjaGVja30pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNoYSA9IHNoYU9yUmVmIHx8ICdtYXN0ZXInO1xuICAgICAgICAgICAgY29uc3QgZXhlY3V0aW9uQ21kID0gY2hlY2sgPyBjaGVja0ZpbGVzIDogZm9ybWF0RmlsZXM7XG4gICAgICAgICAgICBleGVjdXRpb25DbWQoYWxsQ2hhbmdlZEZpbGVzU2luY2Uoc2hhKSk7XG4gICAgICAgICAgfSlcbiAgICAgIC5jb21tYW5kKFxuICAgICAgICAgICdzdGFnZWQnLCAnUnVuIHRoZSBmb3JtYXR0ZXIgb24gYWxsIHN0YWdlZCBmaWxlcycsIHt9LFxuICAgICAgICAgICh7Y2hlY2t9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBleGVjdXRpb25DbWQgPSBjaGVjayA/IGNoZWNrRmlsZXMgOiBmb3JtYXRGaWxlcztcbiAgICAgICAgICAgIGV4ZWN1dGlvbkNtZChhbGxTdGFnZWRGaWxlcygpKTtcbiAgICAgICAgICB9KVxuICAgICAgLmNvbW1hbmQoJ2ZpbGVzIDxmaWxlcy4uPicsICdSdW4gdGhlIGZvcm1hdHRlciBvbiBwcm92aWRlZCBmaWxlcycsIHt9LCAoe2NoZWNrLCBmaWxlc30pID0+IHtcbiAgICAgICAgY29uc3QgZXhlY3V0aW9uQ21kID0gY2hlY2sgPyBjaGVja0ZpbGVzIDogZm9ybWF0RmlsZXM7XG4gICAgICAgIGV4ZWN1dGlvbkNtZChmaWxlcyk7XG4gICAgICB9KTtcbn1cblxuaWYgKHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlKSB7XG4gIGJ1aWxkRm9ybWF0UGFyc2VyKHlhcmdzKS5wYXJzZSgpO1xufVxuIl19