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
     * Copyright Google Inc. All Rights Reserved.
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
        })
            // TODO(josephperrott): remove this hidden command after deprecation period.
            .command('deprecation-warning [originalCommand]', false, {}, function (_a) {
            var originalCommand = _a.originalCommand;
            console.warn("`yarn " + originalCommand + "` is deprecated in favor of running the formatter via ng-dev");
            console.warn();
            console.warn("As a replacement of `yarn " + originalCommand + "`, run:");
            switch (originalCommand) {
                case 'bazel:format':
                case 'bazel:lint-fix':
                    console.warn("  yarn ng-dev format all");
                    break;
                case 'bazel:lint':
                    console.warn("  yarn ng-dev format all --check");
                    break;
                default:
                    console.warn("Error: Unrecognized previous command.");
            }
            console.warn();
            console.warn("You can find more usage information by running:");
            console.warn("  yarn ng-dev format --help");
            console.warn();
            console.warn("For more on the rationale and effects of this deprecation visit:");
            console.warn("  https://github.com/angular/angular/pull/36842#issue-410321447");
        });
    }
    exports.buildFormatParser = buildFormatParser;
    if (require.main === module) {
        buildFormatParser(yargs).parse();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsNkJBQStCO0lBRS9CLDBFQUFtRTtJQUVuRSxtRUFBaUQ7SUFFakQsZ0RBQWdEO0lBQ2hELFNBQWdCLGlCQUFpQixDQUFDLFVBQXNCO1FBQ3RELE9BQU8sVUFBVSxDQUFDLElBQUksRUFBRTthQUNuQixNQUFNLEVBQUU7YUFDUixhQUFhLEVBQUU7YUFDZixNQUFNLENBQUMsT0FBTyxFQUFFO1lBQ2YsSUFBSSxFQUFFLFNBQVM7WUFDZixPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLO1lBQ3pDLFdBQVcsRUFBRSx3RUFBd0U7U0FDdEYsQ0FBQzthQUNELE9BQU8sQ0FDSixLQUFLLEVBQUUsa0RBQWtELEVBQUUsRUFBRSxFQUM3RCxVQUFDLEVBQU87Z0JBQU4sS0FBSyxXQUFBO1lBQ0wsSUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxtQkFBVSxDQUFDLENBQUMsQ0FBQyxvQkFBVyxDQUFDO1lBQ3RELFlBQVksQ0FBQyxxQkFBUSxFQUFFLENBQUMsQ0FBQztRQUMzQixDQUFDLENBQUM7YUFDTCxPQUFPLENBQ0osb0JBQW9CLEVBQUUsK0RBQStELEVBQUUsRUFBRSxFQUN6RixVQUFDLEVBQWlCO2dCQUFoQixRQUFRLGNBQUEsRUFBRSxLQUFLLFdBQUE7WUFDZixJQUFNLEdBQUcsR0FBRyxRQUFRLElBQUksUUFBUSxDQUFDO1lBQ2pDLElBQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsbUJBQVUsQ0FBQyxDQUFDLENBQUMsb0JBQVcsQ0FBQztZQUN0RCxZQUFZLENBQUMsaUNBQW9CLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMxQyxDQUFDLENBQUM7YUFDTCxPQUFPLENBQ0osaUJBQWlCLEVBQUUscUNBQXFDLEVBQUUsRUFBRSxFQUM1RCxVQUFDLEVBQWM7Z0JBQWIsS0FBSyxXQUFBLEVBQUUsS0FBSyxXQUFBO1lBQ1osSUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxtQkFBVSxDQUFDLENBQUMsQ0FBQyxvQkFBVyxDQUFDO1lBQ3RELFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN0QixDQUFDLENBQUM7WUFDTiw0RUFBNEU7YUFDM0UsT0FBTyxDQUFDLHVDQUF1QyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsVUFBQyxFQUFpQjtnQkFBaEIsZUFBZSxxQkFBQTtZQUM1RSxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQ1QsZUFBZSxpRUFBK0QsQ0FBQyxDQUFDO1lBQ3BGLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNmLE9BQU8sQ0FBQyxJQUFJLENBQUMsK0JBQThCLGVBQWUsWUFBVSxDQUFDLENBQUM7WUFDdEUsUUFBUSxlQUFlLEVBQUU7Z0JBQ3ZCLEtBQUssY0FBYyxDQUFDO2dCQUNwQixLQUFLLGdCQUFnQjtvQkFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO29CQUN6QyxNQUFNO2dCQUNSLEtBQUssWUFBWTtvQkFDZixPQUFPLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLENBQUM7b0JBQ2pELE1BQU07Z0JBQ1I7b0JBQ0UsT0FBTyxDQUFDLElBQUksQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO2FBQ3pEO1lBQ0QsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2YsT0FBTyxDQUFDLElBQUksQ0FBQyxpREFBaUQsQ0FBQyxDQUFDO1lBQ2hFLE9BQU8sQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsQ0FBQztZQUM1QyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDZixPQUFPLENBQUMsSUFBSSxDQUFDLGtFQUFrRSxDQUFDLENBQUM7WUFDakYsT0FBTyxDQUFDLElBQUksQ0FBQyxpRUFBaUUsQ0FBQyxDQUFDO1FBQ2xGLENBQUMsQ0FBQyxDQUFDO0lBQ1QsQ0FBQztJQXBERCw4Q0FvREM7SUFFRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO1FBQzNCLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ2xDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2FsbENoYW5nZWRGaWxlc1NpbmNlLCBhbGxGaWxlc30gZnJvbSAnLi4vdXRpbHMvcmVwby1maWxlcyc7XG5cbmltcG9ydCB7Y2hlY2tGaWxlcywgZm9ybWF0RmlsZXN9IGZyb20gJy4vZm9ybWF0JztcblxuLyoqIEJ1aWxkIHRoZSBwYXJzZXIgZm9yIHRoZSBmb3JtYXQgY29tbWFuZHMuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRGb3JtYXRQYXJzZXIobG9jYWxZYXJnczogeWFyZ3MuQXJndikge1xuICByZXR1cm4gbG9jYWxZYXJncy5oZWxwKClcbiAgICAgIC5zdHJpY3QoKVxuICAgICAgLmRlbWFuZENvbW1hbmQoKVxuICAgICAgLm9wdGlvbignY2hlY2snLCB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogcHJvY2Vzcy5lbnZbJ0NJJ10gPyB0cnVlIDogZmFsc2UsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUnVuIHRoZSBmb3JtYXR0ZXIgdG8gY2hlY2sgZm9ybWF0dGluZyByYXRoZXIgdGhhbiB1cGRhdGluZyBjb2RlIGZvcm1hdCdcbiAgICAgIH0pXG4gICAgICAuY29tbWFuZChcbiAgICAgICAgICAnYWxsJywgJ1J1biB0aGUgZm9ybWF0dGVyIG9uIGFsbCBmaWxlcyBpbiB0aGUgcmVwb3NpdG9yeScsIHt9LFxuICAgICAgICAgICh7Y2hlY2t9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBleGVjdXRpb25DbWQgPSBjaGVjayA/IGNoZWNrRmlsZXMgOiBmb3JtYXRGaWxlcztcbiAgICAgICAgICAgIGV4ZWN1dGlvbkNtZChhbGxGaWxlcygpKTtcbiAgICAgICAgICB9KVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ2NoYW5nZWQgW3NoYU9yUmVmXScsICdSdW4gdGhlIGZvcm1hdHRlciBvbiBmaWxlcyBjaGFuZ2VkIHNpbmNlIHRoZSBwcm92aWRlZCBzaGEvcmVmJywge30sXG4gICAgICAgICAgKHtzaGFPclJlZiwgY2hlY2t9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzaGEgPSBzaGFPclJlZiB8fCAnbWFzdGVyJztcbiAgICAgICAgICAgIGNvbnN0IGV4ZWN1dGlvbkNtZCA9IGNoZWNrID8gY2hlY2tGaWxlcyA6IGZvcm1hdEZpbGVzO1xuICAgICAgICAgICAgZXhlY3V0aW9uQ21kKGFsbENoYW5nZWRGaWxlc1NpbmNlKHNoYSkpO1xuICAgICAgICAgIH0pXG4gICAgICAuY29tbWFuZChcbiAgICAgICAgICAnZmlsZXMgPGZpbGVzLi4+JywgJ1J1biB0aGUgZm9ybWF0dGVyIG9uIHByb3ZpZGVkIGZpbGVzJywge30sXG4gICAgICAgICAgKHtjaGVjaywgZmlsZXN9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBleGVjdXRpb25DbWQgPSBjaGVjayA/IGNoZWNrRmlsZXMgOiBmb3JtYXRGaWxlcztcbiAgICAgICAgICAgIGV4ZWN1dGlvbkNtZChmaWxlcyk7XG4gICAgICAgICAgfSlcbiAgICAgIC8vIFRPRE8oam9zZXBocGVycm90dCk6IHJlbW92ZSB0aGlzIGhpZGRlbiBjb21tYW5kIGFmdGVyIGRlcHJlY2F0aW9uIHBlcmlvZC5cbiAgICAgIC5jb21tYW5kKCdkZXByZWNhdGlvbi13YXJuaW5nIFtvcmlnaW5hbENvbW1hbmRdJywgZmFsc2UsIHt9LCAoe29yaWdpbmFsQ29tbWFuZH0pID0+IHtcbiAgICAgICAgY29uc29sZS53YXJuKGBcXGB5YXJuICR7XG4gICAgICAgICAgICBvcmlnaW5hbENvbW1hbmR9XFxgIGlzIGRlcHJlY2F0ZWQgaW4gZmF2b3Igb2YgcnVubmluZyB0aGUgZm9ybWF0dGVyIHZpYSBuZy1kZXZgKTtcbiAgICAgICAgY29uc29sZS53YXJuKCk7XG4gICAgICAgIGNvbnNvbGUud2FybihgQXMgYSByZXBsYWNlbWVudCBvZiBcXGB5YXJuICR7b3JpZ2luYWxDb21tYW5kfVxcYCwgcnVuOmApO1xuICAgICAgICBzd2l0Y2ggKG9yaWdpbmFsQ29tbWFuZCkge1xuICAgICAgICAgIGNhc2UgJ2JhemVsOmZvcm1hdCc6XG4gICAgICAgICAgY2FzZSAnYmF6ZWw6bGludC1maXgnOlxuICAgICAgICAgICAgY29uc29sZS53YXJuKGAgIHlhcm4gbmctZGV2IGZvcm1hdCBhbGxgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2JhemVsOmxpbnQnOlxuICAgICAgICAgICAgY29uc29sZS53YXJuKGAgIHlhcm4gbmctZGV2IGZvcm1hdCBhbGwgLS1jaGVja2ApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgRXJyb3I6IFVucmVjb2duaXplZCBwcmV2aW91cyBjb21tYW5kLmApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUud2FybigpO1xuICAgICAgICBjb25zb2xlLndhcm4oYFlvdSBjYW4gZmluZCBtb3JlIHVzYWdlIGluZm9ybWF0aW9uIGJ5IHJ1bm5pbmc6YCk7XG4gICAgICAgIGNvbnNvbGUud2FybihgICB5YXJuIG5nLWRldiBmb3JtYXQgLS1oZWxwYCk7XG4gICAgICAgIGNvbnNvbGUud2FybigpO1xuICAgICAgICBjb25zb2xlLndhcm4oYEZvciBtb3JlIG9uIHRoZSByYXRpb25hbGUgYW5kIGVmZmVjdHMgb2YgdGhpcyBkZXByZWNhdGlvbiB2aXNpdDpgKTtcbiAgICAgICAgY29uc29sZS53YXJuKGAgIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvcHVsbC8zNjg0MiNpc3N1ZS00MTAzMjE0NDdgKTtcbiAgICAgIH0pO1xufVxuXG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgYnVpbGRGb3JtYXRQYXJzZXIoeWFyZ3MpLnBhcnNlKCk7XG59XG4iXX0=