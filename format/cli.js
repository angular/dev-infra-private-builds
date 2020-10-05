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
            .command('all', 'Run the formatter on all files in the repository', function (args) { return args; }, function (_a) {
            var check = _a.check;
            var executionCmd = check ? format_1.checkFiles : format_1.formatFiles;
            executionCmd(repo_files_1.allFiles());
        })
            .command('changed [shaOrRef]', 'Run the formatter on files changed since the provided sha/ref', function (args) { return args.positional('shaOrRef', { type: 'string' }); }, function (_a) {
            var shaOrRef = _a.shaOrRef, check = _a.check;
            var sha = shaOrRef || 'master';
            var executionCmd = check ? format_1.checkFiles : format_1.formatFiles;
            executionCmd(repo_files_1.allChangedFilesSince(sha));
        })
            .command('staged', 'Run the formatter on all staged files', function (args) { return args; }, function (_a) {
            var check = _a.check;
            var executionCmd = check ? format_1.checkFiles : format_1.formatFiles;
            executionCmd(repo_files_1.allStagedFiles());
        })
            .command('files <files..>', 'Run the formatter on provided files', function (args) { return args.positional('files', { array: true, type: 'string' }); }, function (_a) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsNkJBQStCO0lBRS9CLDBFQUFtRjtJQUVuRixtRUFBaUQ7SUFFakQsZ0RBQWdEO0lBQ2hELFNBQWdCLGlCQUFpQixDQUFDLFVBQXNCO1FBQ3RELE9BQU8sVUFBVSxDQUFDLElBQUksRUFBRTthQUNuQixNQUFNLEVBQUU7YUFDUixhQUFhLEVBQUU7YUFDZixNQUFNLENBQUMsT0FBTyxFQUFFO1lBQ2YsSUFBSSxFQUFFLFNBQVM7WUFDZixPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLO1lBQ3pDLFdBQVcsRUFBRSx3RUFBd0U7U0FDdEYsQ0FBQzthQUNELE9BQU8sQ0FDSixLQUFLLEVBQUUsa0RBQWtELEVBQUUsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLEVBQUosQ0FBSSxFQUN2RSxVQUFDLEVBQU87Z0JBQU4sS0FBSyxXQUFBO1lBQ0wsSUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxtQkFBVSxDQUFDLENBQUMsQ0FBQyxvQkFBVyxDQUFDO1lBQ3RELFlBQVksQ0FBQyxxQkFBUSxFQUFFLENBQUMsQ0FBQztRQUMzQixDQUFDLENBQUM7YUFDTCxPQUFPLENBQ0osb0JBQW9CLEVBQUUsK0RBQStELEVBQ3JGLFVBQUEsSUFBSSxJQUFJLE9BQUEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUMsRUFBN0MsQ0FBNkMsRUFDckQsVUFBQyxFQUFpQjtnQkFBaEIsUUFBUSxjQUFBLEVBQUUsS0FBSyxXQUFBO1lBQ2YsSUFBTSxHQUFHLEdBQUcsUUFBUSxJQUFJLFFBQVEsQ0FBQztZQUNqQyxJQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLG1CQUFVLENBQUMsQ0FBQyxDQUFDLG9CQUFXLENBQUM7WUFDdEQsWUFBWSxDQUFDLGlDQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDMUMsQ0FBQyxDQUFDO2FBQ0wsT0FBTyxDQUNKLFFBQVEsRUFBRSx1Q0FBdUMsRUFBRSxVQUFBLElBQUksSUFBSSxPQUFBLElBQUksRUFBSixDQUFJLEVBQy9ELFVBQUMsRUFBTztnQkFBTixLQUFLLFdBQUE7WUFDTCxJQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLG1CQUFVLENBQUMsQ0FBQyxDQUFDLG9CQUFXLENBQUM7WUFDdEQsWUFBWSxDQUFDLDJCQUFjLEVBQUUsQ0FBQyxDQUFDO1FBQ2pDLENBQUMsQ0FBQzthQUNMLE9BQU8sQ0FDSixpQkFBaUIsRUFBRSxxQ0FBcUMsRUFDeEQsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDLEVBQXZELENBQXVELEVBQUUsVUFBQyxFQUFjO2dCQUFiLEtBQUssV0FBQSxFQUFFLEtBQUssV0FBQTtZQUM3RSxJQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLG1CQUFVLENBQUMsQ0FBQyxDQUFDLG9CQUFXLENBQUM7WUFDdEQsWUFBWSxDQUFDLEtBQU0sQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQW5DRCw4Q0FtQ0M7SUFFRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO1FBQzNCLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ2xDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7YWxsQ2hhbmdlZEZpbGVzU2luY2UsIGFsbEZpbGVzLCBhbGxTdGFnZWRGaWxlc30gZnJvbSAnLi4vdXRpbHMvcmVwby1maWxlcyc7XG5cbmltcG9ydCB7Y2hlY2tGaWxlcywgZm9ybWF0RmlsZXN9IGZyb20gJy4vZm9ybWF0JztcblxuLyoqIEJ1aWxkIHRoZSBwYXJzZXIgZm9yIHRoZSBmb3JtYXQgY29tbWFuZHMuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRGb3JtYXRQYXJzZXIobG9jYWxZYXJnczogeWFyZ3MuQXJndikge1xuICByZXR1cm4gbG9jYWxZYXJncy5oZWxwKClcbiAgICAgIC5zdHJpY3QoKVxuICAgICAgLmRlbWFuZENvbW1hbmQoKVxuICAgICAgLm9wdGlvbignY2hlY2snLCB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogcHJvY2Vzcy5lbnZbJ0NJJ10gPyB0cnVlIDogZmFsc2UsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUnVuIHRoZSBmb3JtYXR0ZXIgdG8gY2hlY2sgZm9ybWF0dGluZyByYXRoZXIgdGhhbiB1cGRhdGluZyBjb2RlIGZvcm1hdCdcbiAgICAgIH0pXG4gICAgICAuY29tbWFuZChcbiAgICAgICAgICAnYWxsJywgJ1J1biB0aGUgZm9ybWF0dGVyIG9uIGFsbCBmaWxlcyBpbiB0aGUgcmVwb3NpdG9yeScsIGFyZ3MgPT4gYXJncyxcbiAgICAgICAgICAoe2NoZWNrfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZXhlY3V0aW9uQ21kID0gY2hlY2sgPyBjaGVja0ZpbGVzIDogZm9ybWF0RmlsZXM7XG4gICAgICAgICAgICBleGVjdXRpb25DbWQoYWxsRmlsZXMoKSk7XG4gICAgICAgICAgfSlcbiAgICAgIC5jb21tYW5kKFxuICAgICAgICAgICdjaGFuZ2VkIFtzaGFPclJlZl0nLCAnUnVuIHRoZSBmb3JtYXR0ZXIgb24gZmlsZXMgY2hhbmdlZCBzaW5jZSB0aGUgcHJvdmlkZWQgc2hhL3JlZicsXG4gICAgICAgICAgYXJncyA9PiBhcmdzLnBvc2l0aW9uYWwoJ3NoYU9yUmVmJywge3R5cGU6ICdzdHJpbmcnfSksXG4gICAgICAgICAgKHtzaGFPclJlZiwgY2hlY2t9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzaGEgPSBzaGFPclJlZiB8fCAnbWFzdGVyJztcbiAgICAgICAgICAgIGNvbnN0IGV4ZWN1dGlvbkNtZCA9IGNoZWNrID8gY2hlY2tGaWxlcyA6IGZvcm1hdEZpbGVzO1xuICAgICAgICAgICAgZXhlY3V0aW9uQ21kKGFsbENoYW5nZWRGaWxlc1NpbmNlKHNoYSkpO1xuICAgICAgICAgIH0pXG4gICAgICAuY29tbWFuZChcbiAgICAgICAgICAnc3RhZ2VkJywgJ1J1biB0aGUgZm9ybWF0dGVyIG9uIGFsbCBzdGFnZWQgZmlsZXMnLCBhcmdzID0+IGFyZ3MsXG4gICAgICAgICAgKHtjaGVja30pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGV4ZWN1dGlvbkNtZCA9IGNoZWNrID8gY2hlY2tGaWxlcyA6IGZvcm1hdEZpbGVzO1xuICAgICAgICAgICAgZXhlY3V0aW9uQ21kKGFsbFN0YWdlZEZpbGVzKCkpO1xuICAgICAgICAgIH0pXG4gICAgICAuY29tbWFuZChcbiAgICAgICAgICAnZmlsZXMgPGZpbGVzLi4+JywgJ1J1biB0aGUgZm9ybWF0dGVyIG9uIHByb3ZpZGVkIGZpbGVzJyxcbiAgICAgICAgICBhcmdzID0+IGFyZ3MucG9zaXRpb25hbCgnZmlsZXMnLCB7YXJyYXk6IHRydWUsIHR5cGU6ICdzdHJpbmcnfSksICh7Y2hlY2ssIGZpbGVzfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZXhlY3V0aW9uQ21kID0gY2hlY2sgPyBjaGVja0ZpbGVzIDogZm9ybWF0RmlsZXM7XG4gICAgICAgICAgICBleGVjdXRpb25DbWQoZmlsZXMhKTtcbiAgICAgICAgICB9KTtcbn1cblxuaWYgKHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlKSB7XG4gIGJ1aWxkRm9ybWF0UGFyc2VyKHlhcmdzKS5wYXJzZSgpO1xufVxuIl19