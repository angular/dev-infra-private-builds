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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsNkJBQStCO0lBRS9CLDBFQUFtRTtJQUVuRSxtRUFBaUQ7SUFFakQsZ0RBQWdEO0lBQ2hELFNBQWdCLGlCQUFpQixDQUFDLFVBQXNCO1FBQ3RELE9BQU8sVUFBVSxDQUFDLElBQUksRUFBRTthQUNuQixNQUFNLEVBQUU7YUFDUixhQUFhLEVBQUU7YUFDZixNQUFNLENBQUMsT0FBTyxFQUFFO1lBQ2YsSUFBSSxFQUFFLFNBQVM7WUFDZixPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLO1lBQ3pDLFdBQVcsRUFBRSx3RUFBd0U7U0FDdEYsQ0FBQzthQUNELE9BQU8sQ0FDSixLQUFLLEVBQUUsa0RBQWtELEVBQUUsRUFBRSxFQUM3RCxVQUFDLEVBQU87Z0JBQU4sS0FBSyxXQUFBO1lBQ0wsSUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxtQkFBVSxDQUFDLENBQUMsQ0FBQyxvQkFBVyxDQUFDO1lBQ3RELFlBQVksQ0FBQyxxQkFBUSxFQUFFLENBQUMsQ0FBQztRQUMzQixDQUFDLENBQUM7YUFDTCxPQUFPLENBQ0osb0JBQW9CLEVBQUUsK0RBQStELEVBQUUsRUFBRSxFQUN6RixVQUFDLEVBQWlCO2dCQUFoQixRQUFRLGNBQUEsRUFBRSxLQUFLLFdBQUE7WUFDZixJQUFNLEdBQUcsR0FBRyxRQUFRLElBQUksUUFBUSxDQUFDO1lBQ2pDLElBQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsbUJBQVUsQ0FBQyxDQUFDLENBQUMsb0JBQVcsQ0FBQztZQUN0RCxZQUFZLENBQUMsaUNBQW9CLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMxQyxDQUFDLENBQUM7YUFDTCxPQUFPLENBQUMsaUJBQWlCLEVBQUUscUNBQXFDLEVBQUUsRUFBRSxFQUFFLFVBQUMsRUFBYztnQkFBYixLQUFLLFdBQUEsRUFBRSxLQUFLLFdBQUE7WUFDbkYsSUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxtQkFBVSxDQUFDLENBQUMsQ0FBQyxvQkFBVyxDQUFDO1lBQ3RELFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN0QixDQUFDLENBQUMsQ0FBQztJQUNULENBQUM7SUExQkQsOENBMEJDO0lBRUQsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRTtRQUMzQixpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUNsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2FsbENoYW5nZWRGaWxlc1NpbmNlLCBhbGxGaWxlc30gZnJvbSAnLi4vdXRpbHMvcmVwby1maWxlcyc7XG5cbmltcG9ydCB7Y2hlY2tGaWxlcywgZm9ybWF0RmlsZXN9IGZyb20gJy4vZm9ybWF0JztcblxuLyoqIEJ1aWxkIHRoZSBwYXJzZXIgZm9yIHRoZSBmb3JtYXQgY29tbWFuZHMuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRGb3JtYXRQYXJzZXIobG9jYWxZYXJnczogeWFyZ3MuQXJndikge1xuICByZXR1cm4gbG9jYWxZYXJncy5oZWxwKClcbiAgICAgIC5zdHJpY3QoKVxuICAgICAgLmRlbWFuZENvbW1hbmQoKVxuICAgICAgLm9wdGlvbignY2hlY2snLCB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogcHJvY2Vzcy5lbnZbJ0NJJ10gPyB0cnVlIDogZmFsc2UsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUnVuIHRoZSBmb3JtYXR0ZXIgdG8gY2hlY2sgZm9ybWF0dGluZyByYXRoZXIgdGhhbiB1cGRhdGluZyBjb2RlIGZvcm1hdCdcbiAgICAgIH0pXG4gICAgICAuY29tbWFuZChcbiAgICAgICAgICAnYWxsJywgJ1J1biB0aGUgZm9ybWF0dGVyIG9uIGFsbCBmaWxlcyBpbiB0aGUgcmVwb3NpdG9yeScsIHt9LFxuICAgICAgICAgICh7Y2hlY2t9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBleGVjdXRpb25DbWQgPSBjaGVjayA/IGNoZWNrRmlsZXMgOiBmb3JtYXRGaWxlcztcbiAgICAgICAgICAgIGV4ZWN1dGlvbkNtZChhbGxGaWxlcygpKTtcbiAgICAgICAgICB9KVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ2NoYW5nZWQgW3NoYU9yUmVmXScsICdSdW4gdGhlIGZvcm1hdHRlciBvbiBmaWxlcyBjaGFuZ2VkIHNpbmNlIHRoZSBwcm92aWRlZCBzaGEvcmVmJywge30sXG4gICAgICAgICAgKHtzaGFPclJlZiwgY2hlY2t9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzaGEgPSBzaGFPclJlZiB8fCAnbWFzdGVyJztcbiAgICAgICAgICAgIGNvbnN0IGV4ZWN1dGlvbkNtZCA9IGNoZWNrID8gY2hlY2tGaWxlcyA6IGZvcm1hdEZpbGVzO1xuICAgICAgICAgICAgZXhlY3V0aW9uQ21kKGFsbENoYW5nZWRGaWxlc1NpbmNlKHNoYSkpO1xuICAgICAgICAgIH0pXG4gICAgICAuY29tbWFuZCgnZmlsZXMgPGZpbGVzLi4+JywgJ1J1biB0aGUgZm9ybWF0dGVyIG9uIHByb3ZpZGVkIGZpbGVzJywge30sICh7Y2hlY2ssIGZpbGVzfSkgPT4ge1xuICAgICAgICBjb25zdCBleGVjdXRpb25DbWQgPSBjaGVjayA/IGNoZWNrRmlsZXMgOiBmb3JtYXRGaWxlcztcbiAgICAgICAgZXhlY3V0aW9uQ21kKGZpbGVzKTtcbiAgICAgIH0pO1xufVxuXG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgYnVpbGRGb3JtYXRQYXJzZXIoeWFyZ3MpLnBhcnNlKCk7XG59XG4iXX0=