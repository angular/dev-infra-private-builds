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
        define("@angular/dev-infra-private/release/notes/cli", ["require", "exports", "tslib", "fs", "path", "semver", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/index", "@angular/dev-infra-private/release/notes/release-notes"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReleaseNotesCommandModule = void 0;
    var tslib_1 = require("tslib");
    var fs_1 = require("fs");
    var path_1 = require("path");
    var semver_1 = require("semver");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var index_1 = require("@angular/dev-infra-private/utils/git/index");
    var release_notes_1 = require("@angular/dev-infra-private/release/notes/release-notes");
    /** Yargs command builder for configuring the `ng-dev release build` command. */
    function builder(argv) {
        return argv
            .option('releaseVersion', { type: 'string', default: '0.0.0', coerce: function (version) { return new semver_1.SemVer(version); } })
            .option('from', {
            type: 'string',
            description: 'The git tag or ref to start the changelog entry from',
            defaultDescription: 'The latest semver tag',
        })
            .option('to', {
            type: 'string',
            description: 'The git tag or ref to end the changelog entry with',
            default: 'HEAD',
        })
            .option('type', {
            type: 'string',
            description: 'The type of release notes to create',
            choices: ['github-release', 'changelog'],
            default: 'changelog',
        })
            .option('outFile', {
            type: 'string',
            description: 'File location to write the generated release notes to',
            coerce: function (filePath) { return filePath ? path_1.join(process.cwd(), filePath) : undefined; }
        });
    }
    /** Yargs command handler for generating release notes. */
    function handler(_a) {
        var releaseVersion = _a.releaseVersion, from = _a.from, to = _a.to, outFile = _a.outFile, type = _a.type;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var releaseNotes, releaseNotesEntry;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Since `yargs` evaluates defaults even if a value as been provided, if no value is provided to
                        // the handler, the latest semver tag on the branch is used.
                        from = from || index_1.GitClient.getInstance().getLatestSemverTag().format();
                        return [4 /*yield*/, release_notes_1.ReleaseNotes.fromRange(releaseVersion, from, to)];
                    case 1:
                        releaseNotes = _b.sent();
                        return [4 /*yield*/, (type === 'changelog' ? releaseNotes.getChangelogEntry() :
                                releaseNotes.getGithubReleaseEntry())];
                    case 2:
                        releaseNotesEntry = _b.sent();
                        if (outFile) {
                            fs_1.writeFileSync(outFile, releaseNotesEntry);
                            console_1.info("Generated release notes for \"" + releaseVersion + "\" written to " + outFile);
                        }
                        else {
                            process.stdout.write(releaseNotesEntry);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    /** CLI command module for generating release notes. */
    exports.ReleaseNotesCommandModule = {
        builder: builder,
        handler: handler,
        command: 'notes',
        describe: 'Generate release notes',
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2Uvbm90ZXMvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCx5QkFBaUM7SUFDakMsNkJBQTBCO0lBQzFCLGlDQUE4QjtJQUc5QixvRUFBZ0Q7SUFDaEQsb0VBQWdEO0lBRWhELHdGQUE2QztJQVc3QyxnRkFBZ0Y7SUFDaEYsU0FBUyxPQUFPLENBQUMsSUFBVTtRQUN6QixPQUFPLElBQUk7YUFDTixNQUFNLENBQ0gsZ0JBQWdCLEVBQ2hCLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFDLE9BQWUsSUFBSyxPQUFBLElBQUksZUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFuQixDQUFtQixFQUFDLENBQUM7YUFDeEYsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUNkLElBQUksRUFBRSxRQUFRO1lBQ2QsV0FBVyxFQUFFLHNEQUFzRDtZQUNuRSxrQkFBa0IsRUFBRSx1QkFBdUI7U0FDNUMsQ0FBQzthQUNELE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDWixJQUFJLEVBQUUsUUFBUTtZQUNkLFdBQVcsRUFBRSxvREFBb0Q7WUFDakUsT0FBTyxFQUFFLE1BQU07U0FDaEIsQ0FBQzthQUNELE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDZCxJQUFJLEVBQUUsUUFBUTtZQUNkLFdBQVcsRUFBRSxxQ0FBcUM7WUFDbEQsT0FBTyxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsV0FBVyxDQUFVO1lBQ2pELE9BQU8sRUFBRSxXQUFvQjtTQUM5QixDQUFDO2FBQ0QsTUFBTSxDQUFDLFNBQVMsRUFBRTtZQUNqQixJQUFJLEVBQUUsUUFBUTtZQUNkLFdBQVcsRUFBRSx1REFBdUQ7WUFDcEUsTUFBTSxFQUFFLFVBQUMsUUFBaUIsSUFBSyxPQUFBLFFBQVEsQ0FBQyxDQUFDLENBQUMsV0FBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFwRCxDQUFvRDtTQUNwRixDQUFDLENBQUM7SUFDVCxDQUFDO0lBRUQsMERBQTBEO0lBQzFELFNBQWUsT0FBTyxDQUFDLEVBQXlFO1lBQXhFLGNBQWMsb0JBQUEsRUFBRSxJQUFJLFVBQUEsRUFBRSxFQUFFLFFBQUEsRUFBRSxPQUFPLGFBQUEsRUFBRSxJQUFJLFVBQUE7Ozs7Ozt3QkFDN0QsZ0dBQWdHO3dCQUNoRyw0REFBNEQ7d0JBQzVELElBQUksR0FBRyxJQUFJLElBQUksaUJBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO3dCQUVoRCxxQkFBTSw0QkFBWSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFBOzt3QkFBckUsWUFBWSxHQUFHLFNBQXNEO3dCQUdqRCxxQkFBTSxDQUM1QixJQUFJLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO2dDQUNsQyxZQUFZLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxFQUFBOzt3QkFGMUQsaUJBQWlCLEdBQUcsU0FFc0M7d0JBRWhFLElBQUksT0FBTyxFQUFFOzRCQUNYLGtCQUFhLENBQUMsT0FBTyxFQUFFLGlCQUFpQixDQUFDLENBQUM7NEJBQzFDLGNBQUksQ0FBQyxtQ0FBZ0MsY0FBYyxzQkFBZ0IsT0FBUyxDQUFDLENBQUM7eUJBQy9FOzZCQUFNOzRCQUNMLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7eUJBQ3pDOzs7OztLQUNGO0lBRUQsdURBQXVEO0lBQzFDLFFBQUEseUJBQXlCLEdBQTJDO1FBQy9FLE9BQU8sU0FBQTtRQUNQLE9BQU8sU0FBQTtRQUNQLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLFFBQVEsRUFBRSx3QkFBd0I7S0FDbkMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3dyaXRlRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQge1NlbVZlcn0gZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7QXJndW1lbnRzLCBBcmd2LCBDb21tYW5kTW9kdWxlfSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7ZGVidWcsIGluZm99IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9pbmRleCc7XG5cbmltcG9ydCB7UmVsZWFzZU5vdGVzfSBmcm9tICcuL3JlbGVhc2Utbm90ZXMnO1xuXG4vKiogQ29tbWFuZCBsaW5lIG9wdGlvbnMgZm9yIGJ1aWxkaW5nIGEgcmVsZWFzZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVsZWFzZU5vdGVzT3B0aW9ucyB7XG4gIGZyb20/OiBzdHJpbmc7XG4gIHRvOiBzdHJpbmc7XG4gIG91dEZpbGU/OiBzdHJpbmc7XG4gIHJlbGVhc2VWZXJzaW9uOiBTZW1WZXI7XG4gIHR5cGU6ICdnaXRodWItcmVsZWFzZSd8J2NoYW5nZWxvZyc7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGJ1aWxkZXIgZm9yIGNvbmZpZ3VyaW5nIHRoZSBgbmctZGV2IHJlbGVhc2UgYnVpbGRgIGNvbW1hbmQuICovXG5mdW5jdGlvbiBidWlsZGVyKGFyZ3Y6IEFyZ3YpOiBBcmd2PFJlbGVhc2VOb3Rlc09wdGlvbnM+IHtcbiAgcmV0dXJuIGFyZ3ZcbiAgICAgIC5vcHRpb24oXG4gICAgICAgICAgJ3JlbGVhc2VWZXJzaW9uJyxcbiAgICAgICAgICB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6ICcwLjAuMCcsIGNvZXJjZTogKHZlcnNpb246IHN0cmluZykgPT4gbmV3IFNlbVZlcih2ZXJzaW9uKX0pXG4gICAgICAub3B0aW9uKCdmcm9tJywge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgZ2l0IHRhZyBvciByZWYgdG8gc3RhcnQgdGhlIGNoYW5nZWxvZyBlbnRyeSBmcm9tJyxcbiAgICAgICAgZGVmYXVsdERlc2NyaXB0aW9uOiAnVGhlIGxhdGVzdCBzZW12ZXIgdGFnJyxcbiAgICAgIH0pXG4gICAgICAub3B0aW9uKCd0bycsIHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGdpdCB0YWcgb3IgcmVmIHRvIGVuZCB0aGUgY2hhbmdlbG9nIGVudHJ5IHdpdGgnLFxuICAgICAgICBkZWZhdWx0OiAnSEVBRCcsXG4gICAgICB9KVxuICAgICAgLm9wdGlvbigndHlwZScsIHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHR5cGUgb2YgcmVsZWFzZSBub3RlcyB0byBjcmVhdGUnLFxuICAgICAgICBjaG9pY2VzOiBbJ2dpdGh1Yi1yZWxlYXNlJywgJ2NoYW5nZWxvZyddIGFzIGNvbnN0LFxuICAgICAgICBkZWZhdWx0OiAnY2hhbmdlbG9nJyBhcyBjb25zdCxcbiAgICAgIH0pXG4gICAgICAub3B0aW9uKCdvdXRGaWxlJywge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdGaWxlIGxvY2F0aW9uIHRvIHdyaXRlIHRoZSBnZW5lcmF0ZWQgcmVsZWFzZSBub3RlcyB0bycsXG4gICAgICAgIGNvZXJjZTogKGZpbGVQYXRoPzogc3RyaW5nKSA9PiBmaWxlUGF0aCA/IGpvaW4ocHJvY2Vzcy5jd2QoKSwgZmlsZVBhdGgpIDogdW5kZWZpbmVkXG4gICAgICB9KTtcbn1cblxuLyoqIFlhcmdzIGNvbW1hbmQgaGFuZGxlciBmb3IgZ2VuZXJhdGluZyByZWxlYXNlIG5vdGVzLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcih7cmVsZWFzZVZlcnNpb24sIGZyb20sIHRvLCBvdXRGaWxlLCB0eXBlfTogQXJndW1lbnRzPFJlbGVhc2VOb3Rlc09wdGlvbnM+KSB7XG4gIC8vIFNpbmNlIGB5YXJnc2AgZXZhbHVhdGVzIGRlZmF1bHRzIGV2ZW4gaWYgYSB2YWx1ZSBhcyBiZWVuIHByb3ZpZGVkLCBpZiBubyB2YWx1ZSBpcyBwcm92aWRlZCB0b1xuICAvLyB0aGUgaGFuZGxlciwgdGhlIGxhdGVzdCBzZW12ZXIgdGFnIG9uIHRoZSBicmFuY2ggaXMgdXNlZC5cbiAgZnJvbSA9IGZyb20gfHwgR2l0Q2xpZW50LmdldEluc3RhbmNlKCkuZ2V0TGF0ZXN0U2VtdmVyVGFnKCkuZm9ybWF0KCk7XG4gIC8qKiBUaGUgUmVsZWFzZU5vdGVzIGluc3RhbmNlIHRvIGdlbmVyYXRlIHJlbGVhc2Ugbm90ZXMuICovXG4gIGNvbnN0IHJlbGVhc2VOb3RlcyA9IGF3YWl0IFJlbGVhc2VOb3Rlcy5mcm9tUmFuZ2UocmVsZWFzZVZlcnNpb24sIGZyb20sIHRvKTtcblxuICAvKiogVGhlIHJlcXVlc3RlZCByZWxlYXNlIG5vdGVzIGVudHJ5LiAqL1xuICBjb25zdCByZWxlYXNlTm90ZXNFbnRyeSA9IGF3YWl0IChcbiAgICAgIHR5cGUgPT09ICdjaGFuZ2Vsb2cnID8gcmVsZWFzZU5vdGVzLmdldENoYW5nZWxvZ0VudHJ5KCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxlYXNlTm90ZXMuZ2V0R2l0aHViUmVsZWFzZUVudHJ5KCkpO1xuXG4gIGlmIChvdXRGaWxlKSB7XG4gICAgd3JpdGVGaWxlU3luYyhvdXRGaWxlLCByZWxlYXNlTm90ZXNFbnRyeSk7XG4gICAgaW5mbyhgR2VuZXJhdGVkIHJlbGVhc2Ugbm90ZXMgZm9yIFwiJHtyZWxlYXNlVmVyc2lvbn1cIiB3cml0dGVuIHRvICR7b3V0RmlsZX1gKTtcbiAgfSBlbHNlIHtcbiAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShyZWxlYXNlTm90ZXNFbnRyeSk7XG4gIH1cbn1cblxuLyoqIENMSSBjb21tYW5kIG1vZHVsZSBmb3IgZ2VuZXJhdGluZyByZWxlYXNlIG5vdGVzLiAqL1xuZXhwb3J0IGNvbnN0IFJlbGVhc2VOb3Rlc0NvbW1hbmRNb2R1bGU6IENvbW1hbmRNb2R1bGU8e30sIFJlbGVhc2VOb3Rlc09wdGlvbnM+ID0ge1xuICBidWlsZGVyLFxuICBoYW5kbGVyLFxuICBjb21tYW5kOiAnbm90ZXMnLFxuICBkZXNjcmliZTogJ0dlbmVyYXRlIHJlbGVhc2Ugbm90ZXMnLFxufTtcbiJdfQ==