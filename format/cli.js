(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/format/cli", ["require", "exports", "@angular/dev-infra-private/utils/git/index", "@angular/dev-infra-private/format/format"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildFormatParser = void 0;
    var index_1 = require("@angular/dev-infra-private/utils/git/index");
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
            var allFiles = index_1.GitClient.getInstance().allFiles();
            executionCmd(allFiles);
        })
            .command('changed [shaOrRef]', 'Run the formatter on files changed since the provided sha/ref', function (args) { return args.positional('shaOrRef', { type: 'string' }); }, function (_a) {
            var shaOrRef = _a.shaOrRef, check = _a.check;
            var sha = shaOrRef || 'master';
            var executionCmd = check ? format_1.checkFiles : format_1.formatFiles;
            var allChangedFilesSince = index_1.GitClient.getInstance().allChangesFilesSince(sha);
            executionCmd(allChangedFilesSince);
        })
            .command('staged', 'Run the formatter on all staged files', function (args) { return args; }, function (_a) {
            var check = _a.check;
            var executionCmd = check ? format_1.checkFiles : format_1.formatFiles;
            var allStagedFiles = index_1.GitClient.getInstance().allStagedFiles();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBUUEsb0VBQTZDO0lBRTdDLG1FQUFpRDtJQUVqRCxnREFBZ0Q7SUFDaEQsU0FBZ0IsaUJBQWlCLENBQUMsVUFBc0I7UUFDdEQsT0FBTyxVQUFVLENBQUMsSUFBSSxFQUFFO2FBQ25CLE1BQU0sRUFBRTthQUNSLGFBQWEsRUFBRTthQUNmLE1BQU0sQ0FBQyxPQUFPLEVBQUU7WUFDZixJQUFJLEVBQUUsU0FBUztZQUNmLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUs7WUFDekMsV0FBVyxFQUFFLHdFQUF3RTtTQUN0RixDQUFDO2FBQ0QsT0FBTyxDQUNKLEtBQUssRUFBRSxrREFBa0QsRUFBRSxVQUFBLElBQUksSUFBSSxPQUFBLElBQUksRUFBSixDQUFJLEVBQ3ZFLFVBQUMsRUFBTztnQkFBTixLQUFLLFdBQUE7WUFDTCxJQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLG1CQUFVLENBQUMsQ0FBQyxDQUFDLG9CQUFXLENBQUM7WUFDdEQsSUFBTSxRQUFRLEdBQUcsaUJBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNwRCxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekIsQ0FBQyxDQUFDO2FBQ0wsT0FBTyxDQUNKLG9CQUFvQixFQUFFLCtEQUErRCxFQUNyRixVQUFBLElBQUksSUFBSSxPQUFBLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDLEVBQTdDLENBQTZDLEVBQ3JELFVBQUMsRUFBaUI7Z0JBQWhCLFFBQVEsY0FBQSxFQUFFLEtBQUssV0FBQTtZQUNmLElBQU0sR0FBRyxHQUFHLFFBQVEsSUFBSSxRQUFRLENBQUM7WUFDakMsSUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxtQkFBVSxDQUFDLENBQUMsQ0FBQyxvQkFBVyxDQUFDO1lBQ3RELElBQU0sb0JBQW9CLEdBQUcsaUJBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMvRSxZQUFZLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUNyQyxDQUFDLENBQUM7YUFDTCxPQUFPLENBQ0osUUFBUSxFQUFFLHVDQUF1QyxFQUFFLFVBQUEsSUFBSSxJQUFJLE9BQUEsSUFBSSxFQUFKLENBQUksRUFDL0QsVUFBQyxFQUFPO2dCQUFOLEtBQUssV0FBQTtZQUNMLElBQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsbUJBQVUsQ0FBQyxDQUFDLENBQUMsb0JBQVcsQ0FBQztZQUN0RCxJQUFNLGNBQWMsR0FBRyxpQkFBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ2hFLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUMvQixDQUFDLENBQUM7YUFDTCxPQUFPLENBQ0osaUJBQWlCLEVBQUUscUNBQXFDLEVBQ3hELFVBQUEsSUFBSSxJQUFJLE9BQUEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQyxFQUF2RCxDQUF1RCxFQUFFLFVBQUMsRUFBYztnQkFBYixLQUFLLFdBQUEsRUFBRSxLQUFLLFdBQUE7WUFDN0UsSUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxtQkFBVSxDQUFDLENBQUMsQ0FBQyxvQkFBVyxDQUFDO1lBQ3RELFlBQVksQ0FBQyxLQUFNLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztJQUNiLENBQUM7SUF0Q0QsOENBc0NDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vdXRpbHMvZ2l0L2luZGV4JztcblxuaW1wb3J0IHtjaGVja0ZpbGVzLCBmb3JtYXRGaWxlc30gZnJvbSAnLi9mb3JtYXQnO1xuXG4vKiogQnVpbGQgdGhlIHBhcnNlciBmb3IgdGhlIGZvcm1hdCBjb21tYW5kcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEZvcm1hdFBhcnNlcihsb2NhbFlhcmdzOiB5YXJncy5Bcmd2KSB7XG4gIHJldHVybiBsb2NhbFlhcmdzLmhlbHAoKVxuICAgICAgLnN0cmljdCgpXG4gICAgICAuZGVtYW5kQ29tbWFuZCgpXG4gICAgICAub3B0aW9uKCdjaGVjaycsIHtcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBwcm9jZXNzLmVudlsnQ0knXSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdSdW4gdGhlIGZvcm1hdHRlciB0byBjaGVjayBmb3JtYXR0aW5nIHJhdGhlciB0aGFuIHVwZGF0aW5nIGNvZGUgZm9ybWF0J1xuICAgICAgfSlcbiAgICAgIC5jb21tYW5kKFxuICAgICAgICAgICdhbGwnLCAnUnVuIHRoZSBmb3JtYXR0ZXIgb24gYWxsIGZpbGVzIGluIHRoZSByZXBvc2l0b3J5JywgYXJncyA9PiBhcmdzLFxuICAgICAgICAgICh7Y2hlY2t9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBleGVjdXRpb25DbWQgPSBjaGVjayA/IGNoZWNrRmlsZXMgOiBmb3JtYXRGaWxlcztcbiAgICAgICAgICAgIGNvbnN0IGFsbEZpbGVzID0gR2l0Q2xpZW50LmdldEluc3RhbmNlKCkuYWxsRmlsZXMoKTtcbiAgICAgICAgICAgIGV4ZWN1dGlvbkNtZChhbGxGaWxlcyk7XG4gICAgICAgICAgfSlcbiAgICAgIC5jb21tYW5kKFxuICAgICAgICAgICdjaGFuZ2VkIFtzaGFPclJlZl0nLCAnUnVuIHRoZSBmb3JtYXR0ZXIgb24gZmlsZXMgY2hhbmdlZCBzaW5jZSB0aGUgcHJvdmlkZWQgc2hhL3JlZicsXG4gICAgICAgICAgYXJncyA9PiBhcmdzLnBvc2l0aW9uYWwoJ3NoYU9yUmVmJywge3R5cGU6ICdzdHJpbmcnfSksXG4gICAgICAgICAgKHtzaGFPclJlZiwgY2hlY2t9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzaGEgPSBzaGFPclJlZiB8fCAnbWFzdGVyJztcbiAgICAgICAgICAgIGNvbnN0IGV4ZWN1dGlvbkNtZCA9IGNoZWNrID8gY2hlY2tGaWxlcyA6IGZvcm1hdEZpbGVzO1xuICAgICAgICAgICAgY29uc3QgYWxsQ2hhbmdlZEZpbGVzU2luY2UgPSBHaXRDbGllbnQuZ2V0SW5zdGFuY2UoKS5hbGxDaGFuZ2VzRmlsZXNTaW5jZShzaGEpO1xuICAgICAgICAgICAgZXhlY3V0aW9uQ21kKGFsbENoYW5nZWRGaWxlc1NpbmNlKTtcbiAgICAgICAgICB9KVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ3N0YWdlZCcsICdSdW4gdGhlIGZvcm1hdHRlciBvbiBhbGwgc3RhZ2VkIGZpbGVzJywgYXJncyA9PiBhcmdzLFxuICAgICAgICAgICh7Y2hlY2t9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBleGVjdXRpb25DbWQgPSBjaGVjayA/IGNoZWNrRmlsZXMgOiBmb3JtYXRGaWxlcztcbiAgICAgICAgICAgIGNvbnN0IGFsbFN0YWdlZEZpbGVzID0gR2l0Q2xpZW50LmdldEluc3RhbmNlKCkuYWxsU3RhZ2VkRmlsZXMoKTtcbiAgICAgICAgICAgIGV4ZWN1dGlvbkNtZChhbGxTdGFnZWRGaWxlcyk7XG4gICAgICAgICAgfSlcbiAgICAgIC5jb21tYW5kKFxuICAgICAgICAgICdmaWxlcyA8ZmlsZXMuLj4nLCAnUnVuIHRoZSBmb3JtYXR0ZXIgb24gcHJvdmlkZWQgZmlsZXMnLFxuICAgICAgICAgIGFyZ3MgPT4gYXJncy5wb3NpdGlvbmFsKCdmaWxlcycsIHthcnJheTogdHJ1ZSwgdHlwZTogJ3N0cmluZyd9KSwgKHtjaGVjaywgZmlsZXN9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBleGVjdXRpb25DbWQgPSBjaGVjayA/IGNoZWNrRmlsZXMgOiBmb3JtYXRGaWxlcztcbiAgICAgICAgICAgIGV4ZWN1dGlvbkNtZChmaWxlcyEpO1xuICAgICAgICAgIH0pO1xufVxuIl19