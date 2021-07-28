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
        define("@angular/dev-infra-private/release/notes/cli", ["require", "exports", "tslib", "fs", "path", "semver", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/git-client", "@angular/dev-infra-private/release/notes/release-notes"], factory);
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
    var git_client_1 = require("@angular/dev-infra-private/utils/git/git-client");
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
                        from = from || git_client_1.GitClient.get().getLatestSemverTag().format();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2Uvbm90ZXMvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCx5QkFBaUM7SUFDakMsNkJBQTBCO0lBQzFCLGlDQUE4QjtJQUc5QixvRUFBeUM7SUFDekMsOEVBQXFEO0lBRXJELHdGQUE2QztJQVc3QyxnRkFBZ0Y7SUFDaEYsU0FBUyxPQUFPLENBQUMsSUFBVTtRQUN6QixPQUFPLElBQUk7YUFDTixNQUFNLENBQ0gsZ0JBQWdCLEVBQ2hCLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFDLE9BQWUsSUFBSyxPQUFBLElBQUksZUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFuQixDQUFtQixFQUFDLENBQUM7YUFDeEYsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUNkLElBQUksRUFBRSxRQUFRO1lBQ2QsV0FBVyxFQUFFLHNEQUFzRDtZQUNuRSxrQkFBa0IsRUFBRSx1QkFBdUI7U0FDNUMsQ0FBQzthQUNELE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDWixJQUFJLEVBQUUsUUFBUTtZQUNkLFdBQVcsRUFBRSxvREFBb0Q7WUFDakUsT0FBTyxFQUFFLE1BQU07U0FDaEIsQ0FBQzthQUNELE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDZCxJQUFJLEVBQUUsUUFBUTtZQUNkLFdBQVcsRUFBRSxxQ0FBcUM7WUFDbEQsT0FBTyxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsV0FBVyxDQUFVO1lBQ2pELE9BQU8sRUFBRSxXQUFvQjtTQUM5QixDQUFDO2FBQ0QsTUFBTSxDQUFDLFNBQVMsRUFBRTtZQUNqQixJQUFJLEVBQUUsUUFBUTtZQUNkLFdBQVcsRUFBRSx1REFBdUQ7WUFDcEUsTUFBTSxFQUFFLFVBQUMsUUFBaUIsSUFBSyxPQUFBLFFBQVEsQ0FBQyxDQUFDLENBQUMsV0FBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFwRCxDQUFvRDtTQUNwRixDQUFDLENBQUM7SUFDVCxDQUFDO0lBRUQsMERBQTBEO0lBQzFELFNBQWUsT0FBTyxDQUFDLEVBQXlFO1lBQXhFLGNBQWMsb0JBQUEsRUFBRSxJQUFJLFVBQUEsRUFBRSxFQUFFLFFBQUEsRUFBRSxPQUFPLGFBQUEsRUFBRSxJQUFJLFVBQUE7Ozs7Ozt3QkFDN0QsZ0dBQWdHO3dCQUNoRyw0REFBNEQ7d0JBQzVELElBQUksR0FBRyxJQUFJLElBQUksc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO3dCQUV4QyxxQkFBTSw0QkFBWSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFBOzt3QkFBckUsWUFBWSxHQUFHLFNBQXNEO3dCQUdqRCxxQkFBTSxDQUM1QixJQUFJLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO2dDQUNsQyxZQUFZLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxFQUFBOzt3QkFGMUQsaUJBQWlCLEdBQUcsU0FFc0M7d0JBRWhFLElBQUksT0FBTyxFQUFFOzRCQUNYLGtCQUFhLENBQUMsT0FBTyxFQUFFLGlCQUFpQixDQUFDLENBQUM7NEJBQzFDLGNBQUksQ0FBQyxtQ0FBZ0MsY0FBYyxzQkFBZ0IsT0FBUyxDQUFDLENBQUM7eUJBQy9FOzZCQUFNOzRCQUNMLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7eUJBQ3pDOzs7OztLQUNGO0lBRUQsdURBQXVEO0lBQzFDLFFBQUEseUJBQXlCLEdBQTJDO1FBQy9FLE9BQU8sU0FBQTtRQUNQLE9BQU8sU0FBQTtRQUNQLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLFFBQVEsRUFBRSx3QkFBd0I7S0FDbkMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3dyaXRlRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQge1NlbVZlcn0gZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7QXJndW1lbnRzLCBBcmd2LCBDb21tYW5kTW9kdWxlfSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7aW5mb30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdC1jbGllbnQnO1xuXG5pbXBvcnQge1JlbGVhc2VOb3Rlc30gZnJvbSAnLi9yZWxlYXNlLW5vdGVzJztcblxuLyoqIENvbW1hbmQgbGluZSBvcHRpb25zIGZvciBidWlsZGluZyBhIHJlbGVhc2UuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlbGVhc2VOb3Rlc09wdGlvbnMge1xuICBmcm9tPzogc3RyaW5nO1xuICB0bzogc3RyaW5nO1xuICBvdXRGaWxlPzogc3RyaW5nO1xuICByZWxlYXNlVmVyc2lvbjogU2VtVmVyO1xuICB0eXBlOiAnZ2l0aHViLXJlbGVhc2UnfCdjaGFuZ2Vsb2cnO1xufVxuXG4vKiogWWFyZ3MgY29tbWFuZCBidWlsZGVyIGZvciBjb25maWd1cmluZyB0aGUgYG5nLWRldiByZWxlYXNlIGJ1aWxkYCBjb21tYW5kLiAqL1xuZnVuY3Rpb24gYnVpbGRlcihhcmd2OiBBcmd2KTogQXJndjxSZWxlYXNlTm90ZXNPcHRpb25zPiB7XG4gIHJldHVybiBhcmd2XG4gICAgICAub3B0aW9uKFxuICAgICAgICAgICdyZWxlYXNlVmVyc2lvbicsXG4gICAgICAgICAge3R5cGU6ICdzdHJpbmcnLCBkZWZhdWx0OiAnMC4wLjAnLCBjb2VyY2U6ICh2ZXJzaW9uOiBzdHJpbmcpID0+IG5ldyBTZW1WZXIodmVyc2lvbil9KVxuICAgICAgLm9wdGlvbignZnJvbScsIHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGdpdCB0YWcgb3IgcmVmIHRvIHN0YXJ0IHRoZSBjaGFuZ2Vsb2cgZW50cnkgZnJvbScsXG4gICAgICAgIGRlZmF1bHREZXNjcmlwdGlvbjogJ1RoZSBsYXRlc3Qgc2VtdmVyIHRhZycsXG4gICAgICB9KVxuICAgICAgLm9wdGlvbigndG8nLCB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBnaXQgdGFnIG9yIHJlZiB0byBlbmQgdGhlIGNoYW5nZWxvZyBlbnRyeSB3aXRoJyxcbiAgICAgICAgZGVmYXVsdDogJ0hFQUQnLFxuICAgICAgfSlcbiAgICAgIC5vcHRpb24oJ3R5cGUnLCB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSB0eXBlIG9mIHJlbGVhc2Ugbm90ZXMgdG8gY3JlYXRlJyxcbiAgICAgICAgY2hvaWNlczogWydnaXRodWItcmVsZWFzZScsICdjaGFuZ2Vsb2cnXSBhcyBjb25zdCxcbiAgICAgICAgZGVmYXVsdDogJ2NoYW5nZWxvZycgYXMgY29uc3QsXG4gICAgICB9KVxuICAgICAgLm9wdGlvbignb3V0RmlsZScsIHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRmlsZSBsb2NhdGlvbiB0byB3cml0ZSB0aGUgZ2VuZXJhdGVkIHJlbGVhc2Ugbm90ZXMgdG8nLFxuICAgICAgICBjb2VyY2U6IChmaWxlUGF0aD86IHN0cmluZykgPT4gZmlsZVBhdGggPyBqb2luKHByb2Nlc3MuY3dkKCksIGZpbGVQYXRoKSA6IHVuZGVmaW5lZFxuICAgICAgfSk7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGhhbmRsZXIgZm9yIGdlbmVyYXRpbmcgcmVsZWFzZSBub3Rlcy4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoe3JlbGVhc2VWZXJzaW9uLCBmcm9tLCB0bywgb3V0RmlsZSwgdHlwZX06IEFyZ3VtZW50czxSZWxlYXNlTm90ZXNPcHRpb25zPikge1xuICAvLyBTaW5jZSBgeWFyZ3NgIGV2YWx1YXRlcyBkZWZhdWx0cyBldmVuIGlmIGEgdmFsdWUgYXMgYmVlbiBwcm92aWRlZCwgaWYgbm8gdmFsdWUgaXMgcHJvdmlkZWQgdG9cbiAgLy8gdGhlIGhhbmRsZXIsIHRoZSBsYXRlc3Qgc2VtdmVyIHRhZyBvbiB0aGUgYnJhbmNoIGlzIHVzZWQuXG4gIGZyb20gPSBmcm9tIHx8IEdpdENsaWVudC5nZXQoKS5nZXRMYXRlc3RTZW12ZXJUYWcoKS5mb3JtYXQoKTtcbiAgLyoqIFRoZSBSZWxlYXNlTm90ZXMgaW5zdGFuY2UgdG8gZ2VuZXJhdGUgcmVsZWFzZSBub3Rlcy4gKi9cbiAgY29uc3QgcmVsZWFzZU5vdGVzID0gYXdhaXQgUmVsZWFzZU5vdGVzLmZyb21SYW5nZShyZWxlYXNlVmVyc2lvbiwgZnJvbSwgdG8pO1xuXG4gIC8qKiBUaGUgcmVxdWVzdGVkIHJlbGVhc2Ugbm90ZXMgZW50cnkuICovXG4gIGNvbnN0IHJlbGVhc2VOb3Rlc0VudHJ5ID0gYXdhaXQgKFxuICAgICAgdHlwZSA9PT0gJ2NoYW5nZWxvZycgPyByZWxlYXNlTm90ZXMuZ2V0Q2hhbmdlbG9nRW50cnkoKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbGVhc2VOb3Rlcy5nZXRHaXRodWJSZWxlYXNlRW50cnkoKSk7XG5cbiAgaWYgKG91dEZpbGUpIHtcbiAgICB3cml0ZUZpbGVTeW5jKG91dEZpbGUsIHJlbGVhc2VOb3Rlc0VudHJ5KTtcbiAgICBpbmZvKGBHZW5lcmF0ZWQgcmVsZWFzZSBub3RlcyBmb3IgXCIke3JlbGVhc2VWZXJzaW9ufVwiIHdyaXR0ZW4gdG8gJHtvdXRGaWxlfWApO1xuICB9IGVsc2Uge1xuICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKHJlbGVhc2VOb3Rlc0VudHJ5KTtcbiAgfVxufVxuXG4vKiogQ0xJIGNvbW1hbmQgbW9kdWxlIGZvciBnZW5lcmF0aW5nIHJlbGVhc2Ugbm90ZXMuICovXG5leHBvcnQgY29uc3QgUmVsZWFzZU5vdGVzQ29tbWFuZE1vZHVsZTogQ29tbWFuZE1vZHVsZTx7fSwgUmVsZWFzZU5vdGVzT3B0aW9ucz4gPSB7XG4gIGJ1aWxkZXIsXG4gIGhhbmRsZXIsXG4gIGNvbW1hbmQ6ICdub3RlcycsXG4gIGRlc2NyaWJlOiAnR2VuZXJhdGUgcmVsZWFzZSBub3RlcycsXG59O1xuIl19