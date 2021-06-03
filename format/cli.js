(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/format/cli", ["require", "exports", "@angular/dev-infra-private/utils/git/git-client", "@angular/dev-infra-private/format/format"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildFormatParser = void 0;
    var git_client_1 = require("@angular/dev-infra-private/utils/git/git-client");
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
            var allFiles = git_client_1.GitClient.get().allFiles();
            executionCmd(allFiles);
        })
            .command('changed [shaOrRef]', 'Run the formatter on files changed since the provided sha/ref', function (args) { return args.positional('shaOrRef', { type: 'string' }); }, function (_a) {
            var shaOrRef = _a.shaOrRef, check = _a.check;
            var sha = shaOrRef || 'master';
            var executionCmd = check ? format_1.checkFiles : format_1.formatFiles;
            var allChangedFilesSince = git_client_1.GitClient.get().allChangesFilesSince(sha);
            executionCmd(allChangedFilesSince);
        })
            .command('staged', 'Run the formatter on all staged files', function (args) { return args; }, function (_a) {
            var check = _a.check;
            var executionCmd = check ? format_1.checkFiles : format_1.formatFiles;
            var allStagedFiles = git_client_1.GitClient.get().allStagedFiles();
            executionCmd(allStagedFiles);
        })
            .command('files <files..>', 'Run the formatter on provided files', function (args) { return args.positional('files', { array: true, type: 'string' }); }, function (_a) {
            var check = _a.check, files = _a.files;
            var executionCmd = check ? format_1.checkFiles : format_1.formatFiles;
            executionCmd(files);
        });
    }
    exports.buildFormatParser = buildFormatParser;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBUUEsOEVBQWtEO0lBRWxELG1FQUFpRDtJQUVqRCxnREFBZ0Q7SUFDaEQsU0FBZ0IsaUJBQWlCLENBQUMsVUFBc0I7UUFDdEQsT0FBTyxVQUFVLENBQUMsSUFBSSxFQUFFO2FBQ25CLE1BQU0sRUFBRTthQUNSLGFBQWEsRUFBRTthQUNmLE1BQU0sQ0FBQyxPQUFPLEVBQUU7WUFDZixJQUFJLEVBQUUsU0FBUztZQUNmLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUs7WUFDekMsV0FBVyxFQUFFLHdFQUF3RTtTQUN0RixDQUFDO2FBQ0QsT0FBTyxDQUNKLEtBQUssRUFBRSxrREFBa0QsRUFBRSxVQUFBLElBQUksSUFBSSxPQUFBLElBQUksRUFBSixDQUFJLEVBQ3ZFLFVBQUMsRUFBTztnQkFBTixLQUFLLFdBQUE7WUFDTCxJQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLG1CQUFVLENBQUMsQ0FBQyxDQUFDLG9CQUFXLENBQUM7WUFDdEQsSUFBTSxRQUFRLEdBQUcsc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUM1QyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekIsQ0FBQyxDQUFDO2FBQ0wsT0FBTyxDQUNKLG9CQUFvQixFQUFFLCtEQUErRCxFQUNyRixVQUFBLElBQUksSUFBSSxPQUFBLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDLEVBQTdDLENBQTZDLEVBQ3JELFVBQUMsRUFBaUI7Z0JBQWhCLFFBQVEsY0FBQSxFQUFFLEtBQUssV0FBQTtZQUNmLElBQU0sR0FBRyxHQUFHLFFBQVEsSUFBSSxRQUFRLENBQUM7WUFDakMsSUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxtQkFBVSxDQUFDLENBQUMsQ0FBQyxvQkFBVyxDQUFDO1lBQ3RELElBQU0sb0JBQW9CLEdBQUcsc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN2RSxZQUFZLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUNyQyxDQUFDLENBQUM7YUFDTCxPQUFPLENBQ0osUUFBUSxFQUFFLHVDQUF1QyxFQUFFLFVBQUEsSUFBSSxJQUFJLE9BQUEsSUFBSSxFQUFKLENBQUksRUFDL0QsVUFBQyxFQUFPO2dCQUFOLEtBQUssV0FBQTtZQUNMLElBQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsbUJBQVUsQ0FBQyxDQUFDLENBQUMsb0JBQVcsQ0FBQztZQUN0RCxJQUFNLGNBQWMsR0FBRyxzQkFBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3hELFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUMvQixDQUFDLENBQUM7YUFDTCxPQUFPLENBQ0osaUJBQWlCLEVBQUUscUNBQXFDLEVBQ3hELFVBQUEsSUFBSSxJQUFJLE9BQUEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQyxFQUF2RCxDQUF1RCxFQUFFLFVBQUMsRUFBYztnQkFBYixLQUFLLFdBQUEsRUFBRSxLQUFLLFdBQUE7WUFDN0UsSUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxtQkFBVSxDQUFDLENBQUMsQ0FBQyxvQkFBVyxDQUFDO1lBQ3RELFlBQVksQ0FBQyxLQUFNLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztJQUNiLENBQUM7SUF0Q0QsOENBc0NDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vdXRpbHMvZ2l0L2dpdC1jbGllbnQnO1xuXG5pbXBvcnQge2NoZWNrRmlsZXMsIGZvcm1hdEZpbGVzfSBmcm9tICcuL2Zvcm1hdCc7XG5cbi8qKiBCdWlsZCB0aGUgcGFyc2VyIGZvciB0aGUgZm9ybWF0IGNvbW1hbmRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkRm9ybWF0UGFyc2VyKGxvY2FsWWFyZ3M6IHlhcmdzLkFyZ3YpIHtcbiAgcmV0dXJuIGxvY2FsWWFyZ3MuaGVscCgpXG4gICAgICAuc3RyaWN0KClcbiAgICAgIC5kZW1hbmRDb21tYW5kKClcbiAgICAgIC5vcHRpb24oJ2NoZWNrJywge1xuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHByb2Nlc3MuZW52WydDSSddID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1J1biB0aGUgZm9ybWF0dGVyIHRvIGNoZWNrIGZvcm1hdHRpbmcgcmF0aGVyIHRoYW4gdXBkYXRpbmcgY29kZSBmb3JtYXQnXG4gICAgICB9KVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ2FsbCcsICdSdW4gdGhlIGZvcm1hdHRlciBvbiBhbGwgZmlsZXMgaW4gdGhlIHJlcG9zaXRvcnknLCBhcmdzID0+IGFyZ3MsXG4gICAgICAgICAgKHtjaGVja30pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGV4ZWN1dGlvbkNtZCA9IGNoZWNrID8gY2hlY2tGaWxlcyA6IGZvcm1hdEZpbGVzO1xuICAgICAgICAgICAgY29uc3QgYWxsRmlsZXMgPSBHaXRDbGllbnQuZ2V0KCkuYWxsRmlsZXMoKTtcbiAgICAgICAgICAgIGV4ZWN1dGlvbkNtZChhbGxGaWxlcyk7XG4gICAgICAgICAgfSlcbiAgICAgIC5jb21tYW5kKFxuICAgICAgICAgICdjaGFuZ2VkIFtzaGFPclJlZl0nLCAnUnVuIHRoZSBmb3JtYXR0ZXIgb24gZmlsZXMgY2hhbmdlZCBzaW5jZSB0aGUgcHJvdmlkZWQgc2hhL3JlZicsXG4gICAgICAgICAgYXJncyA9PiBhcmdzLnBvc2l0aW9uYWwoJ3NoYU9yUmVmJywge3R5cGU6ICdzdHJpbmcnfSksXG4gICAgICAgICAgKHtzaGFPclJlZiwgY2hlY2t9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzaGEgPSBzaGFPclJlZiB8fCAnbWFzdGVyJztcbiAgICAgICAgICAgIGNvbnN0IGV4ZWN1dGlvbkNtZCA9IGNoZWNrID8gY2hlY2tGaWxlcyA6IGZvcm1hdEZpbGVzO1xuICAgICAgICAgICAgY29uc3QgYWxsQ2hhbmdlZEZpbGVzU2luY2UgPSBHaXRDbGllbnQuZ2V0KCkuYWxsQ2hhbmdlc0ZpbGVzU2luY2Uoc2hhKTtcbiAgICAgICAgICAgIGV4ZWN1dGlvbkNtZChhbGxDaGFuZ2VkRmlsZXNTaW5jZSk7XG4gICAgICAgICAgfSlcbiAgICAgIC5jb21tYW5kKFxuICAgICAgICAgICdzdGFnZWQnLCAnUnVuIHRoZSBmb3JtYXR0ZXIgb24gYWxsIHN0YWdlZCBmaWxlcycsIGFyZ3MgPT4gYXJncyxcbiAgICAgICAgICAoe2NoZWNrfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZXhlY3V0aW9uQ21kID0gY2hlY2sgPyBjaGVja0ZpbGVzIDogZm9ybWF0RmlsZXM7XG4gICAgICAgICAgICBjb25zdCBhbGxTdGFnZWRGaWxlcyA9IEdpdENsaWVudC5nZXQoKS5hbGxTdGFnZWRGaWxlcygpO1xuICAgICAgICAgICAgZXhlY3V0aW9uQ21kKGFsbFN0YWdlZEZpbGVzKTtcbiAgICAgICAgICB9KVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ2ZpbGVzIDxmaWxlcy4uPicsICdSdW4gdGhlIGZvcm1hdHRlciBvbiBwcm92aWRlZCBmaWxlcycsXG4gICAgICAgICAgYXJncyA9PiBhcmdzLnBvc2l0aW9uYWwoJ2ZpbGVzJywge2FycmF5OiB0cnVlLCB0eXBlOiAnc3RyaW5nJ30pLCAoe2NoZWNrLCBmaWxlc30pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGV4ZWN1dGlvbkNtZCA9IGNoZWNrID8gY2hlY2tGaWxlcyA6IGZvcm1hdEZpbGVzO1xuICAgICAgICAgICAgZXhlY3V0aW9uQ21kKGZpbGVzISk7XG4gICAgICAgICAgfSk7XG59XG4iXX0=