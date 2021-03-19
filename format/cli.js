(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/format/cli", ["require", "exports", "@angular/dev-infra-private/utils/repo-files", "@angular/dev-infra-private/format/format"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildFormatParser = void 0;
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBU0EsMEVBQW1GO0lBRW5GLG1FQUFpRDtJQUVqRCxnREFBZ0Q7SUFDaEQsU0FBZ0IsaUJBQWlCLENBQUMsVUFBc0I7UUFDdEQsT0FBTyxVQUFVLENBQUMsSUFBSSxFQUFFO2FBQ25CLE1BQU0sRUFBRTthQUNSLGFBQWEsRUFBRTthQUNmLE1BQU0sQ0FBQyxPQUFPLEVBQUU7WUFDZixJQUFJLEVBQUUsU0FBUztZQUNmLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUs7WUFDekMsV0FBVyxFQUFFLHdFQUF3RTtTQUN0RixDQUFDO2FBQ0QsT0FBTyxDQUNKLEtBQUssRUFBRSxrREFBa0QsRUFBRSxVQUFBLElBQUksSUFBSSxPQUFBLElBQUksRUFBSixDQUFJLEVBQ3ZFLFVBQUMsRUFBTztnQkFBTixLQUFLLFdBQUE7WUFDTCxJQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLG1CQUFVLENBQUMsQ0FBQyxDQUFDLG9CQUFXLENBQUM7WUFDdEQsWUFBWSxDQUFDLHFCQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzNCLENBQUMsQ0FBQzthQUNMLE9BQU8sQ0FDSixvQkFBb0IsRUFBRSwrREFBK0QsRUFDckYsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQyxFQUE3QyxDQUE2QyxFQUNyRCxVQUFDLEVBQWlCO2dCQUFoQixRQUFRLGNBQUEsRUFBRSxLQUFLLFdBQUE7WUFDZixJQUFNLEdBQUcsR0FBRyxRQUFRLElBQUksUUFBUSxDQUFDO1lBQ2pDLElBQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsbUJBQVUsQ0FBQyxDQUFDLENBQUMsb0JBQVcsQ0FBQztZQUN0RCxZQUFZLENBQUMsaUNBQW9CLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMxQyxDQUFDLENBQUM7YUFDTCxPQUFPLENBQ0osUUFBUSxFQUFFLHVDQUF1QyxFQUFFLFVBQUEsSUFBSSxJQUFJLE9BQUEsSUFBSSxFQUFKLENBQUksRUFDL0QsVUFBQyxFQUFPO2dCQUFOLEtBQUssV0FBQTtZQUNMLElBQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsbUJBQVUsQ0FBQyxDQUFDLENBQUMsb0JBQVcsQ0FBQztZQUN0RCxZQUFZLENBQUMsMkJBQWMsRUFBRSxDQUFDLENBQUM7UUFDakMsQ0FBQyxDQUFDO2FBQ0wsT0FBTyxDQUNKLGlCQUFpQixFQUFFLHFDQUFxQyxFQUN4RCxVQUFBLElBQUksSUFBSSxPQUFBLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUMsRUFBdkQsQ0FBdUQsRUFBRSxVQUFDLEVBQWM7Z0JBQWIsS0FBSyxXQUFBLEVBQUUsS0FBSyxXQUFBO1lBQzdFLElBQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsbUJBQVUsQ0FBQyxDQUFDLENBQUMsb0JBQVcsQ0FBQztZQUN0RCxZQUFZLENBQUMsS0FBTSxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7SUFDYixDQUFDO0lBbkNELDhDQW1DQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2FsbENoYW5nZWRGaWxlc1NpbmNlLCBhbGxGaWxlcywgYWxsU3RhZ2VkRmlsZXN9IGZyb20gJy4uL3V0aWxzL3JlcG8tZmlsZXMnO1xuXG5pbXBvcnQge2NoZWNrRmlsZXMsIGZvcm1hdEZpbGVzfSBmcm9tICcuL2Zvcm1hdCc7XG5cbi8qKiBCdWlsZCB0aGUgcGFyc2VyIGZvciB0aGUgZm9ybWF0IGNvbW1hbmRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkRm9ybWF0UGFyc2VyKGxvY2FsWWFyZ3M6IHlhcmdzLkFyZ3YpIHtcbiAgcmV0dXJuIGxvY2FsWWFyZ3MuaGVscCgpXG4gICAgICAuc3RyaWN0KClcbiAgICAgIC5kZW1hbmRDb21tYW5kKClcbiAgICAgIC5vcHRpb24oJ2NoZWNrJywge1xuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHByb2Nlc3MuZW52WydDSSddID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1J1biB0aGUgZm9ybWF0dGVyIHRvIGNoZWNrIGZvcm1hdHRpbmcgcmF0aGVyIHRoYW4gdXBkYXRpbmcgY29kZSBmb3JtYXQnXG4gICAgICB9KVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ2FsbCcsICdSdW4gdGhlIGZvcm1hdHRlciBvbiBhbGwgZmlsZXMgaW4gdGhlIHJlcG9zaXRvcnknLCBhcmdzID0+IGFyZ3MsXG4gICAgICAgICAgKHtjaGVja30pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGV4ZWN1dGlvbkNtZCA9IGNoZWNrID8gY2hlY2tGaWxlcyA6IGZvcm1hdEZpbGVzO1xuICAgICAgICAgICAgZXhlY3V0aW9uQ21kKGFsbEZpbGVzKCkpO1xuICAgICAgICAgIH0pXG4gICAgICAuY29tbWFuZChcbiAgICAgICAgICAnY2hhbmdlZCBbc2hhT3JSZWZdJywgJ1J1biB0aGUgZm9ybWF0dGVyIG9uIGZpbGVzIGNoYW5nZWQgc2luY2UgdGhlIHByb3ZpZGVkIHNoYS9yZWYnLFxuICAgICAgICAgIGFyZ3MgPT4gYXJncy5wb3NpdGlvbmFsKCdzaGFPclJlZicsIHt0eXBlOiAnc3RyaW5nJ30pLFxuICAgICAgICAgICh7c2hhT3JSZWYsIGNoZWNrfSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2hhID0gc2hhT3JSZWYgfHwgJ21hc3Rlcic7XG4gICAgICAgICAgICBjb25zdCBleGVjdXRpb25DbWQgPSBjaGVjayA/IGNoZWNrRmlsZXMgOiBmb3JtYXRGaWxlcztcbiAgICAgICAgICAgIGV4ZWN1dGlvbkNtZChhbGxDaGFuZ2VkRmlsZXNTaW5jZShzaGEpKTtcbiAgICAgICAgICB9KVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ3N0YWdlZCcsICdSdW4gdGhlIGZvcm1hdHRlciBvbiBhbGwgc3RhZ2VkIGZpbGVzJywgYXJncyA9PiBhcmdzLFxuICAgICAgICAgICh7Y2hlY2t9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBleGVjdXRpb25DbWQgPSBjaGVjayA/IGNoZWNrRmlsZXMgOiBmb3JtYXRGaWxlcztcbiAgICAgICAgICAgIGV4ZWN1dGlvbkNtZChhbGxTdGFnZWRGaWxlcygpKTtcbiAgICAgICAgICB9KVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ2ZpbGVzIDxmaWxlcy4uPicsICdSdW4gdGhlIGZvcm1hdHRlciBvbiBwcm92aWRlZCBmaWxlcycsXG4gICAgICAgICAgYXJncyA9PiBhcmdzLnBvc2l0aW9uYWwoJ2ZpbGVzJywge2FycmF5OiB0cnVlLCB0eXBlOiAnc3RyaW5nJ30pLCAoe2NoZWNrLCBmaWxlc30pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGV4ZWN1dGlvbkNtZCA9IGNoZWNrID8gY2hlY2tGaWxlcyA6IGZvcm1hdEZpbGVzO1xuICAgICAgICAgICAgZXhlY3V0aW9uQ21kKGZpbGVzISk7XG4gICAgICAgICAgfSk7XG59XG4iXX0=