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
        });
    }
    exports.buildFormatParser = buildFormatParser;
    if (require.main === module) {
        buildFormatParser(yargs).parse();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCw2QkFBK0I7SUFFL0IsMEVBQW1FO0lBRW5FLG1FQUFpRDtJQUVqRCxnREFBZ0Q7SUFDaEQsU0FBZ0IsaUJBQWlCLENBQUMsVUFBc0I7UUFDdEQsT0FBTyxVQUFVLENBQUMsSUFBSSxFQUFFO2FBQ25CLE1BQU0sRUFBRTthQUNSLGFBQWEsRUFBRTthQUNmLE1BQU0sQ0FBQyxPQUFPLEVBQUU7WUFDZixJQUFJLEVBQUUsU0FBUztZQUNmLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUs7WUFDekMsV0FBVyxFQUFFLHdFQUF3RTtTQUN0RixDQUFDO2FBQ0QsT0FBTyxDQUNKLEtBQUssRUFBRSxrREFBa0QsRUFBRSxFQUFFLEVBQzdELFVBQUMsRUFBTztnQkFBTixnQkFBSztZQUNMLElBQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsbUJBQVUsQ0FBQyxDQUFDLENBQUMsb0JBQVcsQ0FBQztZQUN0RCxZQUFZLENBQUMscUJBQVEsRUFBRSxDQUFDLENBQUM7UUFDM0IsQ0FBQyxDQUFDO2FBQ0wsT0FBTyxDQUNKLG9CQUFvQixFQUFFLCtEQUErRCxFQUFFLEVBQUUsRUFDekYsVUFBQyxFQUFpQjtnQkFBaEIsc0JBQVEsRUFBRSxnQkFBSztZQUNmLElBQU0sR0FBRyxHQUFHLFFBQVEsSUFBSSxRQUFRLENBQUM7WUFDakMsSUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxtQkFBVSxDQUFDLENBQUMsQ0FBQyxvQkFBVyxDQUFDO1lBQ3RELFlBQVksQ0FBQyxpQ0FBb0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzFDLENBQUMsQ0FBQzthQUNMLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxxQ0FBcUMsRUFBRSxFQUFFLEVBQUUsVUFBQyxFQUFjO2dCQUFiLGdCQUFLLEVBQUUsZ0JBQUs7WUFDbkYsSUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxtQkFBVSxDQUFDLENBQUMsQ0FBQyxvQkFBVyxDQUFDO1lBQ3RELFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN0QixDQUFDLENBQUMsQ0FBQztJQUNULENBQUM7SUExQkQsOENBMEJDO0lBRUQsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRTtRQUMzQixpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUNsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHthbGxDaGFuZ2VkRmlsZXNTaW5jZSwgYWxsRmlsZXN9IGZyb20gJy4uL3V0aWxzL3JlcG8tZmlsZXMnO1xuXG5pbXBvcnQge2NoZWNrRmlsZXMsIGZvcm1hdEZpbGVzfSBmcm9tICcuL2Zvcm1hdCc7XG5cbi8qKiBCdWlsZCB0aGUgcGFyc2VyIGZvciB0aGUgZm9ybWF0IGNvbW1hbmRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkRm9ybWF0UGFyc2VyKGxvY2FsWWFyZ3M6IHlhcmdzLkFyZ3YpIHtcbiAgcmV0dXJuIGxvY2FsWWFyZ3MuaGVscCgpXG4gICAgICAuc3RyaWN0KClcbiAgICAgIC5kZW1hbmRDb21tYW5kKClcbiAgICAgIC5vcHRpb24oJ2NoZWNrJywge1xuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IHByb2Nlc3MuZW52WydDSSddID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1J1biB0aGUgZm9ybWF0dGVyIHRvIGNoZWNrIGZvcm1hdHRpbmcgcmF0aGVyIHRoYW4gdXBkYXRpbmcgY29kZSBmb3JtYXQnXG4gICAgICB9KVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ2FsbCcsICdSdW4gdGhlIGZvcm1hdHRlciBvbiBhbGwgZmlsZXMgaW4gdGhlIHJlcG9zaXRvcnknLCB7fSxcbiAgICAgICAgICAoe2NoZWNrfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZXhlY3V0aW9uQ21kID0gY2hlY2sgPyBjaGVja0ZpbGVzIDogZm9ybWF0RmlsZXM7XG4gICAgICAgICAgICBleGVjdXRpb25DbWQoYWxsRmlsZXMoKSk7XG4gICAgICAgICAgfSlcbiAgICAgIC5jb21tYW5kKFxuICAgICAgICAgICdjaGFuZ2VkIFtzaGFPclJlZl0nLCAnUnVuIHRoZSBmb3JtYXR0ZXIgb24gZmlsZXMgY2hhbmdlZCBzaW5jZSB0aGUgcHJvdmlkZWQgc2hhL3JlZicsIHt9LFxuICAgICAgICAgICh7c2hhT3JSZWYsIGNoZWNrfSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2hhID0gc2hhT3JSZWYgfHwgJ21hc3Rlcic7XG4gICAgICAgICAgICBjb25zdCBleGVjdXRpb25DbWQgPSBjaGVjayA/IGNoZWNrRmlsZXMgOiBmb3JtYXRGaWxlcztcbiAgICAgICAgICAgIGV4ZWN1dGlvbkNtZChhbGxDaGFuZ2VkRmlsZXNTaW5jZShzaGEpKTtcbiAgICAgICAgICB9KVxuICAgICAgLmNvbW1hbmQoJ2ZpbGVzIDxmaWxlcy4uPicsICdSdW4gdGhlIGZvcm1hdHRlciBvbiBwcm92aWRlZCBmaWxlcycsIHt9LCAoe2NoZWNrLCBmaWxlc30pID0+IHtcbiAgICAgICAgY29uc3QgZXhlY3V0aW9uQ21kID0gY2hlY2sgPyBjaGVja0ZpbGVzIDogZm9ybWF0RmlsZXM7XG4gICAgICAgIGV4ZWN1dGlvbkNtZChmaWxlcyk7XG4gICAgICB9KTtcbn1cblxuaWYgKHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlKSB7XG4gIGJ1aWxkRm9ybWF0UGFyc2VyKHlhcmdzKS5wYXJzZSgpO1xufVxuIl19