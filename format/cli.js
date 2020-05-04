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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCw2QkFBK0I7SUFFL0IsMEVBQW1FO0lBRW5FLG1FQUFpRDtJQUVqRCxnREFBZ0Q7SUFDaEQsU0FBZ0IsaUJBQWlCLENBQUMsVUFBc0I7UUFDdEQsT0FBTyxVQUFVLENBQUMsSUFBSSxFQUFFO2FBQ25CLE1BQU0sRUFBRTthQUNSLGFBQWEsRUFBRTthQUNmLE1BQU0sQ0FBQyxPQUFPLEVBQUU7WUFDZixJQUFJLEVBQUUsU0FBUztZQUNmLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUs7WUFDekMsV0FBVyxFQUFFLHdFQUF3RTtTQUN0RixDQUFDO2FBQ0QsT0FBTyxDQUNKLEtBQUssRUFBRSxrREFBa0QsRUFBRSxFQUFFLEVBQzdELFVBQUMsRUFBTztnQkFBTixnQkFBSztZQUNMLElBQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsbUJBQVUsQ0FBQyxDQUFDLENBQUMsb0JBQVcsQ0FBQztZQUN0RCxZQUFZLENBQUMscUJBQVEsRUFBRSxDQUFDLENBQUM7UUFDM0IsQ0FBQyxDQUFDO2FBQ0wsT0FBTyxDQUNKLG9CQUFvQixFQUFFLCtEQUErRCxFQUFFLEVBQUUsRUFDekYsVUFBQyxFQUFpQjtnQkFBaEIsc0JBQVEsRUFBRSxnQkFBSztZQUNmLElBQU0sR0FBRyxHQUFHLFFBQVEsSUFBSSxRQUFRLENBQUM7WUFDakMsSUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxtQkFBVSxDQUFDLENBQUMsQ0FBQyxvQkFBVyxDQUFDO1lBQ3RELFlBQVksQ0FBQyxpQ0FBb0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzFDLENBQUMsQ0FBQzthQUNMLE9BQU8sQ0FDSixpQkFBaUIsRUFBRSxxQ0FBcUMsRUFBRSxFQUFFLEVBQzVELFVBQUMsRUFBYztnQkFBYixnQkFBSyxFQUFFLGdCQUFLO1lBQ1osSUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxtQkFBVSxDQUFDLENBQUMsQ0FBQyxvQkFBVyxDQUFDO1lBQ3RELFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN0QixDQUFDLENBQUM7WUFDTiw0RUFBNEU7YUFDM0UsT0FBTyxDQUFDLHVDQUF1QyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsVUFBQyxFQUFpQjtnQkFBaEIsb0NBQWU7WUFDNUUsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUNULGVBQWUsaUVBQStELENBQUMsQ0FBQztZQUNwRixPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDZixPQUFPLENBQUMsSUFBSSxDQUFDLCtCQUE4QixlQUFlLFlBQVUsQ0FBQyxDQUFDO1lBQ3RFLFFBQVEsZUFBZSxFQUFFO2dCQUN2QixLQUFLLGNBQWMsQ0FBQztnQkFDcEIsS0FBSyxnQkFBZ0I7b0JBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQztvQkFDekMsTUFBTTtnQkFDUixLQUFLLFlBQVk7b0JBQ2YsT0FBTyxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO29CQUNqRCxNQUFNO2dCQUNSO29CQUNFLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUNBQXVDLENBQUMsQ0FBQzthQUN6RDtZQUNELE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNmLE9BQU8sQ0FBQyxJQUFJLENBQUMsaURBQWlELENBQUMsQ0FBQztZQUNoRSxPQUFPLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUM7WUFDNUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2YsT0FBTyxDQUFDLElBQUksQ0FBQyxrRUFBa0UsQ0FBQyxDQUFDO1lBQ2pGLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUVBQWlFLENBQUMsQ0FBQztRQUNsRixDQUFDLENBQUMsQ0FBQztJQUNULENBQUM7SUFwREQsOENBb0RDO0lBRUQsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRTtRQUMzQixpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUNsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHthbGxDaGFuZ2VkRmlsZXNTaW5jZSwgYWxsRmlsZXN9IGZyb20gJy4uL3V0aWxzL3JlcG8tZmlsZXMnO1xuXG5pbXBvcnQge2NoZWNrRmlsZXMsIGZvcm1hdEZpbGVzfSBmcm9tICcuL2Zvcm1hdCc7XG5cbi8qKiBCdWlsZCB0aGUgcGFyc2VyIGZvciB0aGUgZm9ybWF0IGNvbW1hbmRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkRm9ybWF0UGFyc2VyKGxvY2FsWWFyZ3M6IHlhcmdzLkFyZ3YpIHtcbiAgcmV0dXJuIGxvY2FsWWFyZ3MuaGVscCgpXG4gICAgICAuc3RyaWN0KClcbiAgICAgIC5kZW1hbmRDb21tYW5kKClcbiAgICAgIC5vcHRpb24oJ2NoZWNrJywge1xuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHByb2Nlc3MuZW52WydDSSddID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1J1biB0aGUgZm9ybWF0dGVyIHRvIGNoZWNrIGZvcm1hdHRpbmcgcmF0aGVyIHRoYW4gdXBkYXRpbmcgY29kZSBmb3JtYXQnXG4gICAgICB9KVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ2FsbCcsICdSdW4gdGhlIGZvcm1hdHRlciBvbiBhbGwgZmlsZXMgaW4gdGhlIHJlcG9zaXRvcnknLCB7fSxcbiAgICAgICAgICAoe2NoZWNrfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZXhlY3V0aW9uQ21kID0gY2hlY2sgPyBjaGVja0ZpbGVzIDogZm9ybWF0RmlsZXM7XG4gICAgICAgICAgICBleGVjdXRpb25DbWQoYWxsRmlsZXMoKSk7XG4gICAgICAgICAgfSlcbiAgICAgIC5jb21tYW5kKFxuICAgICAgICAgICdjaGFuZ2VkIFtzaGFPclJlZl0nLCAnUnVuIHRoZSBmb3JtYXR0ZXIgb24gZmlsZXMgY2hhbmdlZCBzaW5jZSB0aGUgcHJvdmlkZWQgc2hhL3JlZicsIHt9LFxuICAgICAgICAgICh7c2hhT3JSZWYsIGNoZWNrfSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2hhID0gc2hhT3JSZWYgfHwgJ21hc3Rlcic7XG4gICAgICAgICAgICBjb25zdCBleGVjdXRpb25DbWQgPSBjaGVjayA/IGNoZWNrRmlsZXMgOiBmb3JtYXRGaWxlcztcbiAgICAgICAgICAgIGV4ZWN1dGlvbkNtZChhbGxDaGFuZ2VkRmlsZXNTaW5jZShzaGEpKTtcbiAgICAgICAgICB9KVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ2ZpbGVzIDxmaWxlcy4uPicsICdSdW4gdGhlIGZvcm1hdHRlciBvbiBwcm92aWRlZCBmaWxlcycsIHt9LFxuICAgICAgICAgICh7Y2hlY2ssIGZpbGVzfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZXhlY3V0aW9uQ21kID0gY2hlY2sgPyBjaGVja0ZpbGVzIDogZm9ybWF0RmlsZXM7XG4gICAgICAgICAgICBleGVjdXRpb25DbWQoZmlsZXMpO1xuICAgICAgICAgIH0pXG4gICAgICAvLyBUT0RPKGpvc2VwaHBlcnJvdHQpOiByZW1vdmUgdGhpcyBoaWRkZW4gY29tbWFuZCBhZnRlciBkZXByZWNhdGlvbiBwZXJpb2QuXG4gICAgICAuY29tbWFuZCgnZGVwcmVjYXRpb24td2FybmluZyBbb3JpZ2luYWxDb21tYW5kXScsIGZhbHNlLCB7fSwgKHtvcmlnaW5hbENvbW1hbmR9KSA9PiB7XG4gICAgICAgIGNvbnNvbGUud2FybihgXFxgeWFybiAke1xuICAgICAgICAgICAgb3JpZ2luYWxDb21tYW5kfVxcYCBpcyBkZXByZWNhdGVkIGluIGZhdm9yIG9mIHJ1bm5pbmcgdGhlIGZvcm1hdHRlciB2aWEgbmctZGV2YCk7XG4gICAgICAgIGNvbnNvbGUud2FybigpO1xuICAgICAgICBjb25zb2xlLndhcm4oYEFzIGEgcmVwbGFjZW1lbnQgb2YgXFxgeWFybiAke29yaWdpbmFsQ29tbWFuZH1cXGAsIHJ1bjpgKTtcbiAgICAgICAgc3dpdGNoIChvcmlnaW5hbENvbW1hbmQpIHtcbiAgICAgICAgICBjYXNlICdiYXplbDpmb3JtYXQnOlxuICAgICAgICAgIGNhc2UgJ2JhemVsOmxpbnQtZml4JzpcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgICB5YXJuIG5nLWRldiBmb3JtYXQgYWxsYCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdiYXplbDpsaW50JzpcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgICB5YXJuIG5nLWRldiBmb3JtYXQgYWxsIC0tY2hlY2tgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEVycm9yOiBVbnJlY29nbml6ZWQgcHJldmlvdXMgY29tbWFuZC5gKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLndhcm4oKTtcbiAgICAgICAgY29uc29sZS53YXJuKGBZb3UgY2FuIGZpbmQgbW9yZSB1c2FnZSBpbmZvcm1hdGlvbiBieSBydW5uaW5nOmApO1xuICAgICAgICBjb25zb2xlLndhcm4oYCAgeWFybiBuZy1kZXYgZm9ybWF0IC0taGVscGApO1xuICAgICAgICBjb25zb2xlLndhcm4oKTtcbiAgICAgICAgY29uc29sZS53YXJuKGBGb3IgbW9yZSBvbiB0aGUgcmF0aW9uYWxlIGFuZCBlZmZlY3RzIG9mIHRoaXMgZGVwcmVjYXRpb24gdmlzaXQ6YCk7XG4gICAgICAgIGNvbnNvbGUud2FybihgICBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL3B1bGwvMzY4NDIjaXNzdWUtNDEwMzIxNDQ3YCk7XG4gICAgICB9KTtcbn1cblxuaWYgKHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlKSB7XG4gIGJ1aWxkRm9ybWF0UGFyc2VyKHlhcmdzKS5wYXJzZSgpO1xufVxuIl19